const { z } = require('zod');

const createReportSchema = z.object({
  chatId: z.string().min(1, 'Chat ID is required'),
  reason: z.enum(['harassment', 'inappropriate', 'unhelpful', 'other'], {
    errorMap: () => ({ message: 'Please select a valid report reason: harassment, inappropriate, unhelpful, or other' })
  }),
  details: z.string().max(1000, 'Details cannot exceed 1000 characters').optional().default('')
});

module.exports = {
  createReportSchema
};
