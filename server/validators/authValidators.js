const { z } = require('zod');
const env = require('../config/env');

// Helper to check domain against allowed list (supports comma-separated string)
function isAllowedDomain(email) {
  const allowed = (env.ALLOWED_EMAIL_DOMAIN || '@sst.scaler.com')
    .split(',')
    .map(d => d.trim().toLowerCase());

  const normalized = email.toLowerCase();
  return allowed.some(domain => {
    const d = domain.startsWith('@') ? domain : `@${domain}`;
    return normalized.endsWith(d);
  });
}

const signupSchema = z.object({
  email: z
    .string()
    .trim()
    .email('Please enter a valid email address')
    .refine(
      (email) => isAllowedDomain(email),
      {
        message: 'Use your official college email address with an approved domain.'
      }
    ),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(128, 'Password is too long'),
  gender: z.enum(['male', 'female', 'other'], {
    errorMap: () => ({ message: 'Please select your gender (male, female, or other)' })
  }),
  batch: z
    .number({ invalid_type_error: 'Batch must be your graduation year (e.g. 2029 or 2030)' })
    .int()
    .min(2020, 'Batch year is too early')
    .max(2040, 'Batch year is too far in future')
});

const loginSchema = z.object({
  email: z.string().trim().email('Please enter a valid email format'),
  password: z.string().min(1, 'Password is required')
});

module.exports = {
  signupSchema,
  loginSchema,
  isAllowedDomain
};
