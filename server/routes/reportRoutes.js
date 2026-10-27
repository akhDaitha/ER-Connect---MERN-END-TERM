const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const verifyToken = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const chatParticipantOnly = require('../middleware/chatParticipantOnly');
const validate = require('../middleware/validate');
const { createReportSchema } = require('../validators/reportValidators');

router.post(
  '/',
  verifyToken,
  requireRole('client'),
  validate(createReportSchema),
  chatParticipantOnly,
  reportController.createReport
);

module.exports = router;
