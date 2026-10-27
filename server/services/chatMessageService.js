const Message = require('../models/Message');
const { encrypt } = require('../utils/crypto');
const { scanForCrisis } = require('../utils/crisisDetector');
const helplines = require('../config/helplines');
const ApiError = require('../utils/apiError');

const persistChatMessage = async ({ chat, user, text, io }) => {
  if (typeof text !== 'string' || !text.trim()) {
    throw new ApiError(400, 'Message content cannot be empty.');
  }

  const cleanText = text.trim();
  if (cleanText.length > 2000) {
    throw new ApiError(400, 'Message exceeds maximum length of 2000 characters.');
  }

  if (chat.status !== 'active') {
    throw new ApiError(400, `Cannot send messages to a chat with status: ${chat.status}`);
  }

  if (user.role === 'client' && scanForCrisis(cleanText) && !chat.crisisFlag) {
    chat.crisisFlag = true;
    await chat.save();

    const crisisEvent = {
      chatId: chat._id.toString(),
      helplines,
      notice: 'We care deeply about your safety. If you are feeling overwhelmed, remember that free, confidential support is available 24/7.'
    };
    io?.to(`user:${chat.client.toString()}`).emit('message:crisis', crisisEvent);
    io?.to(`user:${chat.er.toString()}`).emit('message:crisis', crisisEvent);
    io?.to('admin_room').emit('admin:crisis_alert', {
      chatId: chat._id.toString(),
      timestamp: new Date()
    });
  }

  const { iv, data, tag } = encrypt(cleanText);
  const savedMessage = await Message.create({
    chat: chat._id,
    sender: user._id,
    iv,
    data,
    tag
  });

  const message = {
    id: savedMessage._id.toString(),
    chatId: chat._id.toString(),
    senderAlias: user.alias,
    senderRole: user.role,
    text: cleanText,
    createdAt: savedMessage.createdAt
  };

  // Direct participant rooms deliver messages even if a chat room join was missed.
  io?.to(`user:${chat.client.toString()}`).emit('message:new', message);
  io?.to(`user:${chat.er.toString()}`).emit('message:new', message);

  return message;
};

module.exports = { persistChatMessage };
