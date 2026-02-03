const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const darajaClient = require('../utils/darajaClient');
const sendEmail = require('../utils/emailer');

exports.getWallets = async (req, res) => {
  const wallets = await Wallet.find({ userId: req.user._id });
  res.render('user/wallets', { title: 'Wallets', wallets });
};

exports.getDeposit = (req, res) => {
  res.render('user/deposit', { title: 'Deposit' });
};

exports.postDeposit = async (req, res) => {
  try {
    const { amount, currency, phoneNumber } = req.body;

    // Create pending transaction
    const transaction = await Transaction.create({
      userId: req.user._id,
      type: 'Deposit',
      amount,
      currency,
      status: 'Pending'
    });

    // Call Daraja service (simulated)
    const response = await darajaClient.stkPush(phoneNumber, amount, transaction.referenceIds.internal);

    if (response.success) {
      res.render('user/deposit', { message: 'Deposit initiated. Please check your phone.', title: 'Deposit' });
    } else {
      transaction.status = 'Failed';
      await transaction.save();
      res.render('user/deposit', { error: 'Failed to initiate deposit', title: 'Deposit' });
    }
  } catch (err) {
    res.render('user/deposit', { error: err.message, title: 'Deposit' });
  }
};

exports.getWithdraw = (req, res) => {
  res.render('user/withdraw', { title: 'Withdraw' });
};

exports.postWithdraw = async (req, res) => {
  try {
    const { amount, currency, accountDetails } = req.body;

    // Check verification
    if (req.user.verificationStatus === 'Unverified') {
      await sendEmail({
        email: req.user.email,
        subject: 'Verification Required',
        message: 'Action Required: Please complete your verification to perform withdrawals.',
        type: 'verification',
        template: 'verification-required',
        user: req.user,
        templateData: { dashboardUrl: `${req.protocol}://${req.get('host')}` }
      });
      return res.redirect('/verification?reason=verification_required');
    }

    const wallet = await Wallet.findOne({ userId: req.user._id, currency });
    if (!wallet || wallet.balance < amount) {
      return res.render('user/withdraw', { error: 'Insufficient balance', title: 'Withdraw' });
    }

    // Deduct balance and create transaction
    wallet.balance -= amount;
    await wallet.save();

    await Transaction.create({
      userId: req.user._id,
      type: 'Withdrawal',
      amount,
      currency,
      status: 'Completed', // Simplified for now
      description: `Withdrawal to ${accountDetails}`
    });

    res.redirect('/transactions');
  } catch (err) {
    res.render('user/withdraw', { error: err.message, title: 'Withdraw' });
  }
};

exports.getTransfer = (req, res) => {
  res.render('user/transfer', { title: 'Internal Transfer', captchaSvg: res.locals.captchaSvg });
};

exports.postTransfer = async (req, res) => {
  const svgCaptcha = require('svg-captcha');
  const getNewCaptcha = () => {
    const captcha = svgCaptcha.create({ size: 6, noise: 3, color: true, background: '#f8fafc' });
    req.session.captcha = captcha.text.toLowerCase();
    return captcha.data;
  };

  try {
    const { recipientEmail, amount, currency } = req.body;

    if (req.captchaError) {
      return res.render('user/transfer', { error: req.captchaError, title: 'Internal Transfer', captchaSvg: getNewCaptcha() });
    }

    // Check verification
    if (req.user.verificationStatus === 'Unverified') {
      await sendEmail({
        email: req.user.email,
        subject: 'Verification Required',
        message: 'Action Required: Please complete your verification to perform internal transfers.',
        type: 'verification',
        template: 'verification-required',
        user: req.user,
        templateData: { dashboardUrl: `${req.protocol}://${req.get('host')}` }
      });
      return res.redirect('/verification?reason=verification_required');
    }

    if (recipientEmail === req.user.email) {
      return res.render('user/transfer', { error: 'Cannot transfer to yourself', title: 'Internal Transfer', captchaSvg: getNewCaptcha() });
    }

    const recipient = await User.findOne({ email: recipientEmail });
    if (!recipient) {
      return res.render('user/transfer', { error: 'Recipient not found', title: 'Internal Transfer', captchaSvg: getNewCaptcha() });
    }

    const senderWallet = await Wallet.findOne({ userId: req.user._id, currency });
    if (!senderWallet || senderWallet.balance < amount) {
      return res.render('user/transfer', { error: 'Insufficient balance', title: 'Internal Transfer', captchaSvg: getNewCaptcha() });
    }

    // Process transfer
    senderWallet.balance -= amount;
    await senderWallet.save();

    let recipientWallet = await Wallet.findOne({ userId: recipient._id, currency });
    if (!recipientWallet) {
      recipientWallet = await Wallet.create({ userId: recipient._id, currency, balance: 0 });
    }
    recipientWallet.balance += parseFloat(amount);
    await recipientWallet.save();

    // Log transactions
    await Transaction.create({
      userId: req.user._id,
      type: 'Transfer',
      amount,
      currency,
      status: 'Completed',
      description: `Transfer to ${recipientEmail}`,
      'referenceIds.recipientId': recipient._id
    });

    await Transaction.create({
      userId: recipient._id,
      type: 'Transfer',
      amount,
      currency,
      status: 'Completed',
      description: `Transfer from ${req.user.email}`
    });

    res.render('user/transfer', { message: 'Transfer successful', title: 'Internal Transfer', captchaSvg: getNewCaptcha() });
  } catch (err) {
    res.render('user/transfer', { error: err.message, title: 'Internal Transfer', captchaSvg: getNewCaptcha() });
  }
};

exports.getTransactions = async (req, res) => {
  const transactions = await Transaction.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.render('user/transactions', { title: 'Transactions', transactions });
};

const exchangeRates = {
  'USD': { 'KES': 130, 'UGX': 3700 },
  'KES': { 'USD': 1/130, 'UGX': 28 },
  'UGX': { 'USD': 1/3700, 'KES': 1/28 }
};

exports.postCallback = async (req, res) => {
  try {
    const { reference, status } = req.body;
    const apiKey = req.headers['x-api-key'];

    // Security check: validate Daraja API Key
    if (apiKey !== process.env.DARAJA_API_KEY) {
      console.warn(`[Security Alert] Unauthorized Daraja Callback attempt from IP: ${req.ip}`);
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const transaction = await Transaction.findOne({ 'referenceIds.internal': reference });

    if (transaction) {
      transaction.status = status === 'Success' ? 'Completed' : 'Failed';
      await transaction.save();

      if (transaction.status === 'Completed' && transaction.type === 'Deposit') {
        let wallet = await Wallet.findOne({ userId: transaction.userId, currency: transaction.currency });
        if (!wallet) {
          wallet = await Wallet.create({ userId: transaction.userId, currency: transaction.currency, balance: 0 });
        }
        wallet.balance += transaction.amount;
        await wallet.save();
      }
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getTrade = async (req, res) => {
  const wallets = await Wallet.find({ userId: req.user._id });
  res.render('user/trade', { title: 'Trade / Currency Exchange', wallets, exchangeRates });
};

exports.postTrade = async (req, res) => {
  try {
    const { fromCurrency, toCurrency, amount } = req.body;
    const amountNum = parseFloat(amount);

    if (fromCurrency === toCurrency) {
      return res.render('user/trade', { error: 'Cannot trade same currency', title: 'Trade', wallets: await Wallet.find({ userId: req.user._id }), exchangeRates });
    }

    const fromWallet = await Wallet.findOne({ userId: req.user._id, currency: fromCurrency });
    if (!fromWallet || fromWallet.balance < amountNum) {
      return res.render('user/trade', { error: 'Insufficient balance', title: 'Trade', wallets: await Wallet.find({ userId: req.user._id }), exchangeRates });
    }

    const rate = exchangeRates[fromCurrency][toCurrency];
    const convertedAmount = amountNum * rate;

    fromWallet.balance -= amountNum;
    await fromWallet.save();

    let toWallet = await Wallet.findOne({ userId: req.user._id, currency: toCurrency });
    if (!toWallet) {
      toWallet = await Wallet.create({ userId: req.user._id, currency: toCurrency, balance: 0 });
    }
    toWallet.balance += convertedAmount;
    await toWallet.save();

    await Transaction.create({
      userId: req.user._id,
      type: 'Trade',
      amount: amountNum,
      currency: fromCurrency,
      status: 'Completed',
      description: `Exchanged ${amountNum} ${fromCurrency} for ${convertedAmount.toFixed(2)} ${toCurrency}`
    });

    res.redirect('/wallets');
  } catch (err) {
    res.status(500).send(err.message);
  }
};
