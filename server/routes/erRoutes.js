const express = require('express');
const router = express.Router();
const erController = require('../controllers/erController');
const verifyToken = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

// Clients discover available responders
router.get('/available', verifyToken, requireRole('client'), erController.getAvailableERs);

// Responders update their availability
router.patch('/availability', verifyToken, requireRole('er'), erController.updateAvailability);

module.exports = router;
