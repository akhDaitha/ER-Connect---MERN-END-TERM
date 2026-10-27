const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const verifyToken = require('../middleware/auth');
const validate = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');
const { signupSchema, loginSchema } = require('../validators/authValidators');

router.post('/signup', authLimiter, validate(signupSchema), authController.signup);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/logout', verifyToken, authController.logout);
router.get('/me', verifyToken, authController.getMe);
router.get('/socket-token', verifyToken, authController.getSocketToken);

module.exports = router;
