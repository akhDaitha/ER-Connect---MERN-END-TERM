const rateLimit = require('express-rate-limit');

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // strict for auth endpoints
  message: {
    success: false,
    message: 'Too many login/signup attempts from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const messageLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60,
  message: {
    success: false,
    message: 'You are sending messages too quickly. Please pause for a moment.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  generalLimiter,
  authLimiter,
  messageLimiter
};
