const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const Dispute = require('../models/Dispute');

exports.getDashboard = async (req, res) => {
  try {
    const wallets = await Wallet.find({ userId: req.user._id });
    const transactions = await Transaction.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(5);
    res.render('user/dashboard', {
      title: 'Dashboard',
      wallets,
      transactions
    });
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.getProfile = (req, res) => {
  res.render('user/profile', { title: 'Profile' });
};

exports.updateProfile = async (req, res) => {
  try {
    const { preferredCurrency } = req.body;
    req.user.preferredCurrency = preferredCurrency;
    await req.user.save();
    res.redirect('/profile');
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.getNotifications = (req, res) => {
  res.render('user/notifications', { title: 'Notification Settings' });
};

exports.getDisputes = async (req, res) => {
  try {
    const disputes = await Dispute.find({ userId: req.user._id });
    res.render('user/disputes', { title: 'My Disputes', disputes });
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.postDispute = async (req, res) => {
  try {
    const { reason, transactionId } = req.body;
    await Dispute.create({
      userId: req.user._id,
      transactionId: transactionId || null,
      reason
    });
    res.redirect('/profile/disputes');
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.updateNotifications = async (req, res) => {
  try {
    const { loginAlerts, withdrawalAlerts, transferAlerts, verificationEmails, marketingEmails } = req.body;
    req.user.emailPreferences = {
      loginAlerts: loginAlerts === 'on',
      withdrawalAlerts: withdrawalAlerts === 'on',
      transferAlerts: transferAlerts === 'on',
      verificationEmails: verificationEmails === 'on',
      marketingEmails: marketingEmails === 'on'
    };
    await req.user.save();
    res.redirect('/profile/notifications');
  } catch (err) {
    res.status(500).send('Server Error');
  }
};
