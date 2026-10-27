const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const Report = require('../models/Report');
const AuditLog = require('../models/AuditLog');
const ApiError = require('../utils/apiError');
const { decrypt } = require('../utils/crypto');
const { generateAlias } = require('../utils/aliasGenerator');
const {
  AUTO_FLAG_THRESHOLD,
  MIN_RATINGS_FOR_FLAG
} = require('../config/ratingConstants');

/**
 * Get system statistics and metrics for admin dashboard
 */
const getStats = async (req, res, next) => {
  try {
    const totalChats = await Chat.countDocuments();
    const activeChats = await Chat.countDocuments({ status: 'active' });
    const pendingChats = await Chat.countDocuments({ status: 'pending' });
    const openReports = await Report.countDocuments({ status: 'open' });
    const crisisCount = await Chat.countDocuments({ crisisFlag: true });

    // Flagged ERs: ratingCount >= 5 and avgRating < 2.5
    const flaggedERs = await User.countDocuments({
      role: 'er',
      ratingCount: { $gte: MIN_RATINGS_FOR_FLAG },
      avgRating: { $lt: AUTO_FLAG_THRESHOLD }
    });

    const totalERs = await User.countDocuments({ role: 'er' });
    const availableERs = await User.countDocuments({ role: 'er', isAvailable: true, isSuspended: false });

    return res.json({
      success: true,
      stats: {
        totalChats,
        activeChats,
        pendingChats,
        openReports,
        crisisCount,
        flaggedERs,
        totalERs,
        availableERs
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List all reports (filterable by status)
 */
const getReports = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const reports = await Report.find(filter)
      .sort({ createdAt: -1 })
      .populate({
        path: 'chat',
        select: 'status client er startedAt endedAt createdAt',
        populate: [
          { path: 'client', select: 'alias gender batch' },
          { path: 'er', select: 'alias email gender isSuspended avgRating ratingCount' }
        ]
      })
      .populate('reportedBy', 'alias role')
      .populate('resolvedBy', 'alias');

    return res.json({
      success: true,
      count: reports.length,
      reports
    });
  } catch (error) {
    next(error);
  }
};

/**
 * View decrypted transcript for a reported chat
 * Strictly logged in AuditLog
 */
const getChatTranscript = async (req, res, next) => {
  try {
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId)
      .populate('client', 'alias gender batch')
      .populate('er', 'alias email gender isSuspended avgRating');

    if (!chat) {
      return next(new ApiError(404, 'Chat not found.'));
    }

    // Must have an associated report to be viewed by Admin
    const report = await Report.findOne({ chat: chatId });
    if (!report) {
      return next(new ApiError(403, 'Access denied: Chats may only be inspected by administrators if an official incident report exists.'));
    }

    // Record access in AuditLog
    await AuditLog.create({
      admin: req.user._id,
      action: 'VIEW_CHAT_TRANSCRIPT',
      chat: chat._id,
      details: `Admin viewed decrypted transcript for reported chat ${chat._id}`
    });

    const messages = await Message.find({ chat: chatId })
      .sort({ createdAt: 1 })
      .populate('sender', 'alias role');

    const decryptedMessages = messages.map(msg => {
      let text = '[Unable to decrypt]';
      try {
        text = decrypt(msg.iv, msg.data, msg.tag);
      } catch (err) {
        text = '[Decryption failed]';
      }

      return {
        id: msg._id,
        senderAlias: msg.sender?.alias || 'Anonymous',
        senderRole: msg.sender?.role,
        text,
        createdAt: msg.createdAt
      };
    });

    return res.json({
      success: true,
      chat: {
        id: chat._id,
        status: chat.status,
        startedAt: chat.startedAt,
        endedAt: chat.endedAt,
        rating: chat.rating,
        client: {
          alias: chat.client?.alias,
          gender: chat.client?.gender,
          batch: chat.client?.batch
        },
        er: {
          id: chat.er?._id,
          alias: chat.er?.alias,
          email: chat.er?.email,
          gender: chat.er?.gender,
          isSuspended: chat.er?.isSuspended
        }
      },
      report: {
        id: report._id,
        reason: report.reason,
        details: report.details,
        status: report.status,
        resolution: report.resolution
      },
      messages: decryptedMessages
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Resolve report: dismiss / warn / suspend ER
 */
const resolveReport = async (req, res, next) => {
  try {
    const { reportId } = req.params;
    const { resolution, note } = req.body; // resolution: 'dismissed' | 'warned' | 'suspended'

    if (!['dismissed', 'warned', 'suspended'].includes(resolution)) {
      return next(new ApiError(400, 'Invalid resolution. Must be dismissed, warned, or suspended.'));
    }

    const report = await Report.findById(reportId).populate('chat');
    if (!report) {
      return next(new ApiError(404, 'Report not found.'));
    }

    report.status = 'resolved';
    report.resolution = resolution;
    report.resolvedBy = req.user._id;
    report.resolvedAt = new Date();
    await report.save();

    const erId = report.chat.er;

    // If suspended: set isSuspended = true, isAvailable = false, and terminate any active chats
    if (resolution === 'suspended') {
      await User.findByIdAndUpdate(erId, {
        isSuspended: true,
        isAvailable: false,
        activeChatCount: 0
      });

      // Terminate any ongoing active chats with this ER
      const activeChats = await Chat.find({ er: erId, status: { $in: ['pending', 'active'] } });
      for (const c of activeChats) {
        c.status = 'ended';
        c.endedBy = 'system';
        c.endedAt = new Date();
        await c.save();

        const io = req.app.get('io');
        if (io) {
          io.to(`chat:${c._id.toString()}`).emit('chat:end', {
            chatId: c._id,
            endedBy: 'system',
            message: 'This chat was terminated due to administrative account status change.'
          });
        }
      }
    }

    // Log resolution in AuditLog
    await AuditLog.create({
      admin: req.user._id,
      action: `RESOLVE_REPORT_${resolution.toUpperCase()}`,
      chat: report.chat._id,
      targetUser: erId,
      details: note || `Resolved report ${report._id} with action: ${resolution}`
    });

    return res.json({
      success: true,
      message: `Report marked as resolved with action: ${resolution}`,
      report
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin creates a new Emotional Responder (ER) account
 */
const createER = async (req, res, next) => {
  try {
    const { email, password, gender } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return next(new ApiError(400, 'User with this email already exists.'));
    }

    let alias = generateAlias();
    let collisionCheck = await User.findOne({ alias });
    while (collisionCheck) {
      alias = generateAlias();
      collisionCheck = await User.findOne({ alias });
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const er = await User.create({
      alias,
      email: email.toLowerCase(),
      passwordHash,
      role: 'er',
      gender,
      isAvailable: true,
      isSuspended: false,
      ratingSum: 0,
      ratingCount: 0,
      avgRating: 4.0 // Bayesian prior
    });

    await AuditLog.create({
      admin: req.user._id,
      action: 'CREATE_ER_ACCOUNT',
      targetUser: er._id,
      details: `Created new ER account: ${er.alias} (${er.email})`
    });

    return res.status(201).json({
      success: true,
      message: 'Emotional Responder account created successfully.',
      er: {
        id: er._id,
        alias: er.alias,
        email: er.email,
        gender: er.gender,
        avgRating: er.avgRating
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update ER status: activate, deactivate, or toggle suspension
 */
const updateERStatus = async (req, res, next) => {
  try {
    const { erId } = req.params;
    const { isSuspended, isAvailable } = req.body;

    const er = await User.findById(erId);
    if (!er || er.role !== 'er') {
      return next(new ApiError(404, 'Emotional Responder not found.'));
    }

    if (typeof isSuspended === 'boolean') {
      er.isSuspended = isSuspended;
      if (isSuspended) {
        er.isAvailable = false;
        er.activeChatCount = 0;
        // End ongoing active chats
        await Chat.updateMany(
          { er: er._id, status: { $in: ['pending', 'active'] } },
          { status: 'ended', endedBy: 'system', endedAt: new Date() }
        );
      }
    }

    if (typeof isAvailable === 'boolean' && !er.isSuspended) {
      er.isAvailable = isAvailable;
    }

    await er.save();

    await AuditLog.create({
      admin: req.user._id,
      action: 'UPDATE_ER_STATUS',
      targetUser: er._id,
      details: `Updated ER ${er.alias}: isSuspended=${er.isSuspended}, isAvailable=${er.isAvailable}`
    });

    return res.json({
      success: true,
      message: 'ER status updated successfully.',
      er: {
        id: er._id,
        alias: er.alias,
        email: er.email,
        isSuspended: er.isSuspended,
        isAvailable: er.isAvailable,
        avgRating: er.avgRating
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List all ERs with performance metrics and auto-flag status
 */
const getAllERs = async (req, res, next) => {
  try {
    const ers = await User.find({ role: 'er' })
      .select('alias email gender avgRating ratingCount ratingSum isAvailable isSuspended activeChatCount createdAt')
      .sort({ avgRating: -1 });

    const formatted = ers.map(er => ({
      id: er._id,
      alias: er.alias,
      email: er.email,
      gender: er.gender,
      avgRating: er.avgRating,
      ratingCount: er.ratingCount,
      isAvailable: er.isAvailable,
      isSuspended: er.isSuspended,
      activeChatCount: er.activeChatCount,
      createdAt: er.createdAt,
      // Auto-flag condition: at least 5 ratings and avgRating < 2.5
      isFlagged: er.ratingCount >= MIN_RATINGS_FOR_FLAG && er.avgRating < AUTO_FLAG_THRESHOLD
    }));

    return res.json({
      success: true,
      count: formatted.length,
      ers: formatted
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch list of chats flagged by crisis keyword detection
 */
const getCrisisFlags = async (req, res, next) => {
  try {
    const chats = await Chat.find({ crisisFlag: true })
      .sort({ createdAt: -1 })
      .populate('client', 'alias gender batch')
      .populate('er', 'alias email gender');

    return res.json({
      success: true,
      count: chats.length,
      chats
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch paginated audit log
 */
const getAuditLogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '50', 10);

    const logs = await AuditLog.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('admin', 'alias email')
      .populate('targetUser', 'alias email');

    const total = await AuditLog.countDocuments();

    return res.json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      logs
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStats,
  getReports,
  getChatTranscript,
  resolveReport,
  createER,
  updateERStatus,
  getAllERs,
  getCrisisFlags,
  getAuditLogs
};
