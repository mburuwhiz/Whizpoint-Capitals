const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const { protect } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/security');
const { generateCaptcha, validateCaptcha } = require('../middleware/captcha');

router.get('/wallets', protect, walletController.getWallets);

router.get('/deposit', protect, walletController.getDeposit);
router.post('/deposit', protect, apiLimiter, walletController.postDeposit);

router.get('/withdraw', protect, walletController.getWithdraw);
router.post('/withdraw', protect, apiLimiter, walletController.postWithdraw);

router.get('/transfer', protect, generateCaptcha, walletController.getTransfer);
router.post('/transfer', protect, apiLimiter, validateCaptcha, walletController.postTransfer);

router.get('/transactions', protect, walletController.getTransactions);

router.get('/trade', protect, walletController.getTrade);
router.post('/trade', protect, apiLimiter, walletController.postTrade);

module.exports = router;
