const Chat = require('../models/Chat');
const { persistChatMessage } = require('../services/chatMessageService');

const registerMessageHandlers = (io, socket) => {
  socket.on('message:send', async ({ chatId, text }, callback) => {
    try {
      if (!chatId || !text || typeof text !== 'string' || !text.trim()) {
        if (callback) callback({ error: 'Message content cannot be empty.' });
        return;
      }

      // Check chat existence and participant authorization
      const chat = await Chat.findById(chatId);
      if (!chat) {
        if (callback) callback({ error: 'Chat conversation not found.' });
        return;
      }

      const userId = socket.user._id.toString();
      const isClient = chat.client.toString() === userId;
      const isER = chat.er.toString() === userId;

      if (!isClient && !isER) {
        if (callback) callback({ error: 'You are not a participant in this conversation.' });
        return;
      }

      const message = await persistChatMessage({ chat, user: socket.user, text, io });
      if (callback) callback({ success: true, messageId: message.id });
    } catch (err) {
      console.error('Error handling message:send event:', err);
      if (callback) callback({ error: 'Failed to process message. Please try again.' });
    }
  });
};

module.exports = registerMessageHandlers;
