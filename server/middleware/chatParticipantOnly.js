const Chat = require('../models/Chat');
const Report = require('../models/Report');
const AuditLog = require('../models/AuditLog');
const ApiError = require('../utils/apiError');

/**
 * Middleware ensuring only participants of the chat (client or ER)
 * or an admin investigating an existing report can access the chat.
 */
const chatParticipantOnly = async (req, res, next) => {
  try {
    const chatId = req.params.chatId || req.body.chatId;

    if (!chatId) {
      return next(new ApiError(400, 'Chat ID is required.'));
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return next(new ApiError(404, 'Chat not found.'));
    }

    const userId = req.user._id.toString();
    const isClient = chat.client.toString() === userId;
    const isER = chat.er.toString() === userId;

    if (isClient || isER) {
      req.chat = chat;
      req.isClient = isClient;
      req.isER = isER;
      return next();
    }

    // If user is Admin, they can ONLY read if the chat has an associated Report
    if (req.user.role === 'admin') {
      const report = await Report.findOne({ chat: chat._id });
      if (!report) {
        return next(new ApiError(403, 'Admins can only view chats that have an active or historical user report filed against them.'));
      }

      // Log access in AuditLog
      await AuditLog.create({
        admin: req.user._id,
        action: 'VIEW_CHAT_TRANSCRIPT',
        chat: chat._id,
        details: `Admin accessed transcript for reported chat ${chat._id}`
      });

      req.chat = chat;
      req.isAdminReview = true;
      return next();
    }

    return next(new ApiError(403, 'Unauthorized: You are not a participant of this conversation.'));
  } catch (error) {
    next(error);
  }
};

module.exports = chatParticipantOnly;
