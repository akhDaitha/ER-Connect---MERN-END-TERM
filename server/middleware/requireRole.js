const ApiError = require('../utils/apiError');

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required.'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, 'Forbidden: You do not have permission to perform this action.'));
    }

    next();
  };
};

module.exports = requireRole;
