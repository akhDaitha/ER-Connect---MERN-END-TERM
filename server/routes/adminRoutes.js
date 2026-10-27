const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const verifyToken = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

// All admin routes require admin role
router.use(verifyToken, requireRole('admin'));

router.get('/stats', adminController.getStats);
router.get('/reports', adminController.getReports);
router.patch('/reports/:reportId', adminController.resolveReport);
router.get('/chats/:chatId/transcript', adminController.getChatTranscript);
router.post('/ers', adminController.createER);
router.patch('/ers/:erId', adminController.updateERStatus);
router.get('/ers', adminController.getAllERs);
router.get('/crisis-flags', adminController.getCrisisFlags);
router.get('/audit-log', adminController.getAuditLogs);

module.exports = router;
