const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authLimiter } = require('../middleware/security');
const { generateCaptcha, validateCaptcha } = require('../middleware/captcha');

router.get('/register', generateCaptcha, authController.getRegister);
router.post('/register', validateCaptcha, authController.postRegister);

router.get('/login', generateCaptcha, authController.getLogin);
router.post('/login', authLimiter, validateCaptcha, authController.postLogin);

router.get('/logout', authController.logout);

router.get('/forgot-password', authController.getForgotPassword);
router.post('/forgot-password', authController.postForgotPassword);

router.get('/reset-password/:token', authController.getResetPassword);
router.post('/reset-password/:token', authController.postResetPassword);

module.exports = router;
