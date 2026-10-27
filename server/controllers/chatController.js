const Chat = require('../models/Chat');
const Message = require('../models/Message');
const User = require('../models/User');
const env = require('../config/env');
const ApiError = require('../utils/apiError');
const { decrypt } = require('../utils/crypto');
const { getYearFromBatch } = require('../utils/yearFromBatch');
const { persistChatMessage } = require('../services/chatMessageService');
const {
  PRIOR_WEIGHT_C,
  PRIOR_MEAN_M,
  AUTO_FLAG_THRESHOLD,
  MIN_RATINGS_FOR_FLAG
} = require('../config/ratingConstants');

/**
 * Client initiates chat request to an available ER
 */
const createChat = async (req, res, next) => {
  try {
    const clientId = req.user._id;
    const { erId, moodBefore } = req.body;

    // Check if client already has an active or pending chat
    const existing = await Chat.findOne({
      client: clientId,
      status: { $in: ['pending', 'active'] }
    });

    if (existing) {
      return next(new ApiError(400, 'You already have an ongoing or pending chat session. Please end it before starting a new one.'));
    }

    // Verify ER status
    const er = await User.findById(erId);
    if (!er || er.role !== 'er') {
      return next(new ApiError(404, 'Selected Emotional Responder not found.'));
    }

    if (!er.isAvailable || er.isSuspended) {
      return next(new ApiError(400, 'This Responder is currently not available or offline.'));
    }

    if (er.activeChatCount >= env.MAX_CONCURRENT_CHATS_PER_ER) {
      return next(new ApiError(400, 'This Responder is currently assisting other students at maximum capacity. Please choose another peer or select Match Me.'));
    }

    const chat = await Chat.create({
      client: clientId,
      er: er._id,
      status: 'pending',
      moodBefore: moodBefore || null
    });

    // Add to client's chat history
    await User.findByIdAndUpdate(clientId, { $push: { chats: chat._id } });

    const io = req.app.get('io');
    const batchYear = getYearFromBatch(req.user.batch);

    // Notify the ER in real-time
    if (io) {
      io.to(`user:${er._id.toString()}`).emit('chat:request', {
        chatId: chat._id,
        clientGender: req.user.gender,
        clientBatch: req.user.batch,
        batchYear: batchYear,
        moodBefore: chat.moodBefore,
        createdAt: chat.createdAt
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Chat request sent to Responder. Waiting for response.',
      chat: {
        id: chat._id,
        status: chat.status,
        er: {
          id: er._id,
          alias: er.alias,
          gender: er.gender,
          avgRating: er.avgRating
        },
        moodBefore: chat.moodBefore,
        createdAt: chat.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ER accepts incoming chat request
 */
const acceptChat = async (req, res, next) => {
  try {
    const chat = req.chat; // Provided by chatParticipantOnly
    const erId = req.user._id;

    if (chat.er.toString() !== erId.toString()) {
      return next(new ApiError(403, 'You are not assigned to this chat.'));
    }

    if (chat.status !== 'pending') {
      return next(new ApiError(400, `Cannot accept chat with status: ${chat.status}`));
    }

    // Double check ER concurrent limits
    const er = await User.findById(erId);
    if (er.activeChatCount >= env.MAX_CONCURRENT_CHATS_PER_ER) {
      return next(new ApiError(400, 'You have reached the maximum allowed concurrent chats.'));
    }

    chat.status = 'active';
    chat.startedAt = new Date();
    await chat.save();

    await User.findByIdAndUpdate(erId, { $inc: { activeChatCount: 1 } });

    const io = req.app.get('io');
    if (io) {
      io.to(`user:${chat.client.toString()}`).emit('chat:accept', {
        chatId: chat._id,
        erAlias: req.user.alias
      });
      io.to(`chat:${chat._id.toString()}`).emit('chat:status_change', {
        chatId: chat._id,
        status: 'active',
        startedAt: chat.startedAt
      });
    }

    return res.json({
      success: true,
      message: 'Chat accepted. You may now start messaging.',
      chat: {
        id: chat._id,
        status: chat.status,
        startedAt: chat.startedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ER declines incoming chat request
 */
const declineChat = async (req, res, next) => {
  try {
    const chat = req.chat;
    const erId = req.user._id;

    if (chat.er.toString() !== erId.toString()) {
      return next(new ApiError(403, 'You are not assigned to this chat.'));
    }

    if (chat.status !== 'pending') {
      return next(new ApiError(400, `Cannot decline chat with status: ${chat.status}`));
    }

    chat.status = 'declined';
    chat.endedBy = 'er';
    chat.endedAt = new Date();
    await chat.save();

    const io = req.app.get('io');
    if (io) {
      io.to(`user:${chat.client.toString()}`).emit('chat:decline', {
        chatId: chat._id,
        message: 'The Responder was unable to accept your request at this moment.'
      });
    }

    return res.json({
      success: true,
      message: 'Chat request declined.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Either participant ends an active chat
 */
const endChat = async (req, res, next) => {
  try {
    const chat = req.chat;
    const isClient = req.isClient;

    if (chat.status === 'ended') {
      return res.json({ success: true, message: 'Chat was already ended.', chat });
    }

    chat.status = 'ended';
    chat.endedBy = isClient ? 'client' : 'er';
    chat.endedAt = new Date();
    await chat.save();

    // Decrement ER active chat count
    await User.findByIdAndUpdate(chat.er, {
      $inc: { activeChatCount: -1 }
    });
    // Ensure activeChatCount never drops below zero
    await User.updateOne({ _id: chat.er, activeChatCount: { $lt: 0 } }, { activeChatCount: 0 });

    const io = req.app.get('io');
    if (io) {
      io.to(`chat:${chat._id.toString()}`).emit('chat:end', {
        chatId: chat._id,
        endedBy: chat.endedBy,
        endedAt: chat.endedAt
      });
    }

    return res.json({
      success: true,
      message: 'Chat has been ended.',
      chat: {
        id: chat._id,
        status: chat.status,
        endedBy: chat.endedBy,
        endedAt: chat.endedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Client rates the ended chat
 * Applies Bayesian weighted average formula
 */
const rateChat = async (req, res, next) => {
  try {
    const chat = req.chat;

    if (!req.isClient) {
      return next(new ApiError(403, 'Only the client who initiated the chat can submit a rating.'));
    }

    if (chat.status !== 'ended') {
      return next(new ApiError(400, 'Ratings can only be submitted after the chat has officially ended.'));
    }

    if (chat.rating !== null) {
      return next(new ApiError(400, 'This chat session has already been rated.'));
    }

    const { rating, moodAfter } = req.body;

    chat.rating = rating;
    if (moodAfter) {
      chat.moodAfter = moodAfter;
    }
    await chat.save();

    // Update ER rating using Bayesian formula
    const er = await User.findById(chat.er);
    if (er) {
      const newRatingSum = er.ratingSum + rating;
      const newRatingCount = er.ratingCount + 1;

      // Bayesian Weighted Average Formula:
      // avgRating = (C * m + ratingSum) / (C + ratingCount)
      const calculatedAvg = (PRIOR_WEIGHT_C * PRIOR_MEAN_M + newRatingSum) / (PRIOR_WEIGHT_C + newRatingCount);

      er.ratingSum = newRatingSum;
      er.ratingCount = newRatingCount;
      er.avgRating = parseFloat(calculatedAvg.toFixed(2));

      await er.save();
    }

    return res.json({
      success: true,
      message: 'Thank you for your feedback! Your rating helps our peer community.',
      rating: chat.rating,
      moodAfter: chat.moodAfter
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch chat history for the logged-in user with strict anonymity projections
 */
const getMyChats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const isClient = req.user.role === 'client';

    const filter = isClient ? { client: userId } : { er: userId };

    const chats = await Chat.find(filter)
      .sort({ createdAt: -1 })
      .populate('client', 'alias gender batch')
      .populate('er', 'alias gender avgRating ratingCount')
      .lean();

    const formattedChats = chats.map(c => {
      const item = {
        id: c._id,
        status: c.status,
        endedBy: c.endedBy,
        startedAt: c.startedAt,
        endedAt: c.endedAt,
        createdAt: c.createdAt,
        rating: c.rating,
        moodBefore: c.moodBefore,
        moodAfter: c.moodAfter,
        crisisFlag: c.crisisFlag
      };

      if (isClient) {
        // Client sees ER peer info
        item.peer = {
          alias: c.er?.alias || 'Responder',
          gender: c.er?.gender,
          avgRating: c.er?.avgRating
        };
      } else {
        // ER sees strictly client alias, gender, batch and year label
        item.peer = {
          alias: c.client?.alias || 'Student',
          gender: c.client?.gender,
          batch: c.client?.batch,
          year: getYearFromBatch(c.client?.batch)
        };
      }

      return item;
    });

    return res.json({
      success: true,
      count: formattedChats.length,
      chats: formattedChats
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch decrypted message history for an authorized chat participant
 */
const getMessages = async (req, res, next) => {
  try {
    const chatId = req.params.chatId;

    const messages = await Message.find({ chat: chatId })
      .sort({ createdAt: 1 })
      .populate('sender', 'alias role')
      .lean();

    const decryptedMessages = messages.map(msg => {
      let text = '[Message encrypted]';
      try {
        text = decrypt(msg.iv, msg.data, msg.tag);
      } catch (err) {
        console.error(`Failed to decrypt message ${msg._id}:`, err.message);
        text = '[Unable to decrypt message]';
      }

      return {
        id: msg._id,
        chatId: msg.chat,
        senderAlias: msg.sender?.alias || 'Anonymous',
        senderRole: msg.sender?.role,
        isMe: msg.sender?._id?.toString() === req.user._id.toString(),
        text,
        createdAt: msg.createdAt
      };
    });

    return res.json({
      success: true,
      count: decryptedMessages.length,
      messages: decryptedMessages
    });
  } catch (error) {
    next(error);
  }
};

const sendMessage = async (req, res, next) => {
  try {
    const message = await persistChatMessage({
      chat: req.chat,
      user: req.user,
      text: req.body.text,
      io: req.app.get('io')
    });

    return res.status(201).json({ success: true, message });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createChat,
  acceptChat,
  declineChat,
  endChat,
  rateChat,
  getMyChats,
  getMessages,
  sendMessage
};
