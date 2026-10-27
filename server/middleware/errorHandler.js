const env = require('../config/env');

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  let message = err.message || 'An unexpected error occurred. Please try again.';

  // Handle Mongoose cast errors (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Invalid format for resource identifier: ${err.value}`
    });
  }

  // Handle Mongoose duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(400).json({
      success: false,
      message: `An account with that ${field} already exists.`
    });
  }

  // Never expose raw internal 500 stacks in production
  const response = {
    success: false,
    message: statusCode === 500 && env.NODE_ENV === 'production'
      ? 'An internal server error occurred.'
      : message
  };

  if (env.NODE_ENV !== 'production' && statusCode === 500) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
