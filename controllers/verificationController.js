const Verification = require('../models/Verification');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

exports.getVerification = async (req, res) => {
  const verification = await Verification.findOne({ userId: req.user._id });
  res.render('user/verification', {
    title: 'Account Verification',
    verification,
    reason: req.query.reason
  });
};

exports.payVerificationFee = async (req, res) => {
  try {
    const feeAmount = parseFloat(process.env.VERIFICATION_FEE || 1.0);
    const currency = 'USD'; // Fee is in USD as per requirements

    const wallet = await Wallet.findOne({ userId: req.user._id, currency });
    if (!wallet || wallet.balance < feeAmount) {
      return res.render('user/verification', {
        error: `Insufficient balance to pay the $${feeAmount} verification fee. Please deposit funds first.`,
        title: 'Account Verification'
      });
    }

    // Deduct fee
    wallet.balance -= feeAmount;
    await wallet.save();

    // Create verification record if not exists
    let verification = await Verification.findOne({ userId: req.user._id });
    if (!verification) {
      verification = new Verification({ userId: req.user._id });
    }
    verification.feePaid = true;
    await verification.save();

    // Log transaction
    await Transaction.create({
      userId: req.user._id,
      type: 'Verification Fee',
      amount: feeAmount,
      currency,
      status: 'Completed',
      description: 'Verification fee for account activation'
    });

    res.redirect('/verification');
  } catch (err) {
    res.render('user/verification', { error: err.message, title: 'Account Verification' });
  }
};

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
  }
});

exports.upload = multer({ storage: storage });

exports.submitKYC = async (req, res) => {
  try {
    let verification = await Verification.findOne({ userId: req.user._id });
    if (!verification || !verification.feePaid) {
      return res.redirect('/verification?reason=fee_not_paid');
    }

    if (!req.file) {
      return res.render('user/verification', { error: 'Please upload a document', title: 'Account Verification', verification });
    }

    verification.status = 'Pending';
    verification.documents = [{
      name: 'ID Card',
      mimeType: req.file.mimetype,
      path: req.file.path
    }];
    await verification.save();

    req.user.verificationStatus = 'Pending';
    await req.user.save();

    res.redirect('/verification');
  } catch (err) {
    res.render('user/verification', { error: err.message, title: 'Account Verification' });
  }
};
