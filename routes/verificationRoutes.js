const express = require('express');
const router = express.Router();
const verificationController = require('../controllers/verificationController');
const { protect } = require('../middleware/auth');

router.get('/verification', protect, verificationController.getVerification);
router.post('/verification/pay-fee', protect, verificationController.payVerificationFee);
router.post('/verification/submit-kyc', protect, verificationController.upload.single('id_doc'), verificationController.submitKYC);

module.exports = router;
