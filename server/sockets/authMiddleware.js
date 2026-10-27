const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');

/**
 * Socket.io handshake authentication middleware
 * Parses JWT from cookie or handshake auth token
 */
const socketAuthMiddleware = async (socket, next) => {
  try {
    let token = null;

    // 1. Check handshake auth object
    if (socket.handshake.auth && socket.handshake.auth.token) {
      token = socket.handshake.auth.token;
    }

    // 2. Check cookies in headers
    if (!token && socket.handshake.headers.cookie) {
      const cookieHeader = socket.handshake.headers.cookie;
      const cookies = Object.fromEntries(
        cookieHeader.split(';').map(c => {
          const [key, ...v] = c.trim().split('=');
          return [key, decodeURIComponent(v.join('='))];
        })
      );
      token = cookies.token;
    }

    if (!token) {
      return next(new Error('Authentication failed: No token provided'));
    }

    const decoded = jwt.verify(token, env.JWT_SECRET);
    if (socket.handshake.auth?.token && decoded.purpose !== 'socket') {
      return next(new Error('Authentication failed: Invalid socket token'));
    }
    const user = await User.findById(decoded.id).select('-passwordHash');

    if (!user) {
      return next(new Error('Authentication failed: User does not exist'));
    }

    if (user.role === 'er' && user.isSuspended) {
      return next(new Error('Authentication failed: ER account is suspended'));
    }

    socket.user = user;
    next();
  } catch (error) {
    return next(new Error('Authentication failed: Invalid or expired token'));
  }
};

module.exports = socketAuthMiddleware;
