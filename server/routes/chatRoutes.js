const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const verifyToken = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const chatParticipantOnly = require('../middleware/chatParticipantOnly');
const validate = require('../middleware/validate');
const { createChatSchema, rateChatSchema } = require('../validators/chatValidators');

// Client initiates chat
router.post(
  '/',
  verifyToken,
  requireRole('client'),
  validate(createChatSchema),
  chatController.createChat
);

// ER accepts or declines
router.post(
  '/:chatId/accept',
  verifyToken,
  requireRole('er'),
  chatParticipantOnly,
  chatController.acceptChat
);

router.post(
  '/:chatId/decline',
  verifyToken,
  requireRole('er'),
  chatParticipantOnly,
  chatController.declineChat
);

// Either client or ER ends chat
router.post(
  '/:chatId/end',
  verifyToken,
  chatParticipantOnly,
  chatController.endChat
);

// Client rates ended chat
router.post(
  '/:chatId/rate',
  verifyToken,
  requireRole('client'),
  chatParticipantOnly,
  validate(rateChatSchema),
  chatController.rateChat
);

// Get my chat history
router.get('/mine', verifyToken, chatController.getMyChats);

// Get messages for a chat
router.post('/:chatId/messages', verifyToken, chatParticipantOnly, chatController.sendMessage);

router.get(
  '/:chatId/messages',
  verifyToken,
  chatParticipantOnly,
  chatController.getMessages
);

module.exports = router;
