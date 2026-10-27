const { Server } = require('socket.io');
const env = require('../config/env');
const socketAuthMiddleware = require('./authMiddleware');
const registerChatHandlers = require('./chatHandlers');
const registerMessageHandlers = require('./messageHandlers');
const registerTypingHandlers = require('./typingHandlers');

const initSocketServer = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: env.CLIENT_URL,
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'DELETE']
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // Authenticate socket handshake using JWT cookie/token
  io.use(socketAuthMiddleware);

  io.on('connection', (socket) => {
    const user = socket.user;
    const userId = user._id.toString();

    // Each user joins their personal room for direct events (e.g. chat:request, chat:accept)
    socket.join(`user:${userId}`);

    // If admin, join admin room for alerts and reports
    if (user.role === 'admin') {
      socket.join('admin_room');
    }

    // Register event handlers
    registerChatHandlers(io, socket);
    registerMessageHandlers(io, socket);
    registerTypingHandlers(io, socket);

    socket.on('disconnect', () => {
      // Socket automatically leaves rooms upon disconnection
    });
  });

  return io;
};

module.exports = initSocketServer;
