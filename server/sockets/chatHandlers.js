const Chat = require('../models/Chat');
const User = require('../models/User');
const env = require('../config/env');

const registerChatHandlers = (io, socket) => {
  /**
   * User joins a specific chat room
   * Verifies user is an authorized participant
   */
  socket.on('chat:join', async ({ chatId }, callback) => {
    try {
      if (!chatId) {
        if (callback) callback({ error: 'Chat ID required' });
        return;
      }

      const chat = await Chat.findById(chatId);
      if (!chat) {
        if (callback) callback({ error: 'Chat conversation not found' });
        return;
      }

      const userId = socket.user._id.toString();
      const isClient = chat.client.toString() === userId;
      const isER = chat.er.toString() === userId;

      if (!isClient && !isER && socket.user.role !== 'admin') {
        if (callback) callback({ error: 'Unauthorized: You are not a participant of this chat room.' });
        return;
      }

      const roomName = `chat:${chatId}`;
      socket.join(roomName);

      if (callback) callback({ success: true, room: roomName, status: chat.status });
    } catch (err) {
      console.error('Error handling chat:join:', err);
      if (callback) callback({ error: 'Failed to join chat room' });
    }
  });

  /**
   * ER accepts incoming chat via socket
   */
  socket.on('chat:accept', async ({ chatId }, callback) => {
    try {
      const chat = await Chat.findById(chatId);
      if (!chat || chat.status !== 'pending') {
        if (callback) callback({ error: 'Chat is no longer pending.' });
        return;
      }

      if (chat.er.toString() !== socket.user._id.toString()) {
        if (callback) callback({ error: 'Not authorized to accept this chat.' });
        return;
      }

      const er = await User.findById(socket.user._id);
      if (er.activeChatCount >= env.MAX_CONCURRENT_CHATS_PER_ER) {
        if (callback) callback({ error: 'You are at maximum chat capacity.' });
        return;
      }

      chat.status = 'active';
      chat.startedAt = new Date();
      await chat.save();

      await User.findByIdAndUpdate(socket.user._id, { $inc: { activeChatCount: 1 } });

      io.to(`user:${chat.client.toString()}`).emit('chat:accept', {
        chatId: chat._id,
        erAlias: socket.user.alias
      });

      io.to(`chat:${chat._id.toString()}`).emit('chat:status_change', {
        chatId: chat._id,
        status: 'active',
        startedAt: chat.startedAt
      });

      if (callback) callback({ success: true, chat });
    } catch (err) {
      console.error('Error in chat:accept socket event:', err);
      if (callback) callback({ error: 'Failed to accept chat' });
    }
  });

  /**
   * ER declines incoming chat via socket
   */
  socket.on('chat:decline', async ({ chatId }, callback) => {
    try {
      const chat = await Chat.findById(chatId);
      if (!chat || chat.status !== 'pending') {
        if (callback) callback({ error: 'Chat is no longer pending.' });
        return;
      }

      if (chat.er.toString() !== socket.user._id.toString()) {
        if (callback) callback({ error: 'Not authorized to decline this chat.' });
        return;
      }

      chat.status = 'declined';
      chat.endedBy = 'er';
      chat.endedAt = new Date();
      await chat.save();

      io.to(`user:${chat.client.toString()}`).emit('chat:decline', {
        chatId: chat._id,
        message: 'The Responder was unable to accept the chat request.'
      });

      if (callback) callback({ success: true });
    } catch (err) {
      console.error('Error in chat:decline socket event:', err);
      if (callback) callback({ error: 'Failed to decline chat' });
    }
  });

  /**
   * Either participant ends the chat via socket
   */
  socket.on('chat:end', async ({ chatId }, callback) => {
    try {
      const chat = await Chat.findById(chatId);
      if (!chat) {
        if (callback) callback({ error: 'Chat not found' });
        return;
      }

      const userId = socket.user._id.toString();
      const isClient = chat.client.toString() === userId;
      const isER = chat.er.toString() === userId;

      if (!isClient && !isER) {
        if (callback) callback({ error: 'Unauthorized to end this chat' });
        return;
      }

      if (chat.status === 'ended') {
        if (callback) callback({ success: true, message: 'Already ended' });
        return;
      }

      chat.status = 'ended';
      chat.endedBy = isClient ? 'client' : 'er';
      chat.endedAt = new Date();
      await chat.save();

      await User.findByIdAndUpdate(chat.er, { $inc: { activeChatCount: -1 } });
      await User.updateOne({ _id: chat.er, activeChatCount: { $lt: 0 } }, { activeChatCount: 0 });

      io.to(`chat:${chatId}`).emit('chat:end', {
        chatId: chat._id,
        endedBy: chat.endedBy,
        endedAt: chat.endedAt
      });

      if (callback) callback({ success: true, chat });
    } catch (err) {
      console.error('Error in chat:end socket event:', err);
      if (callback) callback({ error: 'Failed to end chat' });
    }
  });

  /**
   * ER toggles availability status via socket
   */
  socket.on('er:availability', async ({ isAvailable }, callback) => {
    try {
      if (socket.user.role !== 'er') {
        if (callback) callback({ error: 'Only ERs can set availability.' });
        return;
      }

      await User.findByIdAndUpdate(socket.user._id, { isAvailable: Boolean(isAvailable) });
      socket.emit('er:availability_updated', { isAvailable: Boolean(isAvailable) });

      if (callback) callback({ success: true, isAvailable: Boolean(isAvailable) });
    } catch (err) {
      console.error('Error in er:availability socket event:', err);
      if (callback) callback({ error: 'Failed to update availability' });
    }
  });
};

module.exports = registerChatHandlers;
