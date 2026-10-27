const { z } = require('zod');

const createChatSchema = z.object({
  erId: z.string().min(1, 'Target ER ID is required'),
  moodBefore: z.number().int().min(1).max(5).optional()
});

const rateChatSchema = z.object({
  rating: z.number().int().min(1).max(5, 'Rating must be an integer between 1 and 5'),
  moodAfter: z.number().int().min(1).max(5).optional()
});

module.exports = {
  createChatSchema,
  rateChatSchema
};
