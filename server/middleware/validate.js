const ApiError = require('../utils/apiError');

/**
 * Middleware factory for validating incoming requests with Zod schemas
 * @param {import('zod').ZodSchema} schema
 * @param {'body' | 'query' | 'params'} source
 */
const validate = (schema, source = 'body') => {
  return async (req, res, next) => {
    try {
      const parsed = await schema.parseAsync(req[source]);
      req[source] = parsed;
      next();
    } catch (error) {
      if (error.errors && Array.isArray(error.errors)) {
        const message = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
        return next(new ApiError(400, message));
      }
      next(new ApiError(400, error.message || 'Validation error'));
    }
  };
};

module.exports = validate;
