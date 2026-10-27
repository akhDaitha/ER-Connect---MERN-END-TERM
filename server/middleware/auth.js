const jwt = require('jsonwebtoken');
const env = require('../config/env');
const ApiError = require('../utils/apiError');
const User = require('../models/User');

const verifyToken = async (req, res, next) => {
  try {
    let token = req.cookies?.token;

    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new ApiError(401, 'Authentication required. Please log in.'));
    }

    const decoded = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-passwordHash');

    if (!user) {
      return next(new ApiError(401, 'User account not found or has been removed.'));
    }

    if (user.role === 'er' && user.isSuspended) {
      return next(new ApiError(403, 'Your ER account is currently suspended. Please contact support.'));
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'Invalid or expired session. Please log in again.'));
    }
    next(error);
  }
};

module.exports = verifyToken;
