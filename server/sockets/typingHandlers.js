const Chat = require('../models/Chat');

const registerTypingHandlers = (io, socket) => {
  socket.on('typing:start', async ({ chatId }) => {
    try {
      if (!chatId) return;

      socket.to(`chat:${chatId}`).emit('typing:start', {
        chatId,
        senderAlias: socket.user.alias
      });
    } catch (err) {
      console.error('Error handling typing:start event:', err);
    }
  });

  socket.on('typing:stop', async ({ chatId }) => {
    try {
      if (!chatId) return;

      socket.to(`chat:${chatId}`).emit('typing:stop', {
        chatId,
        senderAlias: socket.user.alias
      });
    } catch (err) {
      console.error('Error handling typing:stop event:', err);
    }
  });
};

module.exports = registerTypingHandlers;
