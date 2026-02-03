const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const Verification = require('../models/Verification');
const AdminLog = require('../models/AdminLog');
const Dispute = require('../models/Dispute');

exports.getDashboard = async (req, res) => {
  const userCount = await User.countDocuments();
  const pendingVerifications = await Verification.countDocuments({ status: 'Pending' });
  const totalTransactions = await Transaction.countDocuments();
  res.render('admin/dashboard', { title: 'Admin Dashboard', userCount, pendingVerifications, totalTransactions });
};

exports.getUsers = async (req, res) => {
  const users = await User.find();
  res.render('admin/users', { title: 'User Management', users });
};

exports.getUserDetails = async (req, res) => {
  const user = await User.findById(req.params.id);
  const wallets = await Wallet.find({ userId: user._id });
  const transactions = await Transaction.find({ userId: user._id }).sort({ createdAt: -1 });
  res.render('admin/user-details', { title: 'User Details', targetUser: user, wallets, transactions });
};

exports.adjustBalance = async (req, res) => {
  try {
    const { userId, currency, amount, action, reason, evidenceReference } = req.body;
    const wallet = await Wallet.findOne({ userId, currency });

    if (!wallet) return res.status(404).send('Wallet not found');

    const oldBalance = wallet.balance;
    const change = parseFloat(amount);

    if (action === 'add') {
      wallet.balance += change;
    } else {
      wallet.balance -= change;
    }

    await wallet.save();

    await AdminLog.create({
      adminId: req.user._id,
      action: 'Balance Adjustment',
      targetUserId: userId,
      oldValue: oldBalance,
      newValue: wallet.balance,
      reason,
      evidenceReference
    });

    await Transaction.create({
      userId,
      type: 'Adjustment',
      amount: change,
      currency,
      status: 'Completed',
      description: `Admin adjustment: ${reason}`
    });

    res.redirect(`/admin/users/${userId}`);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.getVerifications = async (req, res) => {
  const verifications = await Verification.find({ status: 'Pending' }).populate('userId');
  res.render('admin/verifications', { title: 'Verification Reviews', verifications });
};

exports.approveVerification = async (req, res) => {
  try {
    const verification = await Verification.findById(req.params.id);
    const user = await User.findById(verification.userId);

    verification.status = 'Verified';
    await verification.save();

    user.verificationStatus = 'Verified';
    await user.save();

    // Refund verification fee if paid and not yet refunded
    if (verification.feePaid && !verification.feeRefunded) {
      const feeAmount = parseFloat(process.env.VERIFICATION_FEE || 1.0);
      const currency = 'USD';

      let wallet = await Wallet.findOne({ userId: user._id, currency });
      if (!wallet) {
        wallet = await Wallet.create({ userId: user._id, currency, balance: 0 });
      }
      wallet.balance += feeAmount;
      await wallet.save();

      verification.feeRefunded = true;
      await verification.save();

      await Transaction.create({
        userId: user._id,
        type: 'Refund',
        amount: feeAmount,
        currency,
        status: 'Completed',
        description: 'Verification fee refund'
      });
    }

    res.redirect('/admin/verifications');
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.rejectVerification = async (req, res) => {
  try {
    const { reason } = req.body;
    const verification = await Verification.findById(req.params.id);
    const user = await User.findById(verification.userId);

    verification.status = 'Rejected';
    verification.adminComment = reason;
    await verification.save();

    user.verificationStatus = 'Rejected';
    await user.save();

    res.redirect('/admin/verifications');
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.getLogs = async (req, res) => {
  const logs = await AdminLog.find().populate('adminId').populate('targetUserId').sort({ createdAt: -1 });
  res.render('admin/logs', { title: 'System Logs', logs });
};

exports.toggleFreeze = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    user.isFrozen = !user.isFrozen;
    await user.save();

    await AdminLog.create({
      adminId: req.user._id,
      action: user.isFrozen ? 'Account Frozen' : 'Account Unfrozen',
      targetUserId: user._id,
      reason: req.body.reason
    });

    res.redirect(`/admin/users/${user._id}`);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.getDisputes = async (req, res) => {
  const disputes = await Dispute.find().populate('userId').sort({ createdAt: -1 });
  res.render('admin/disputes', { title: 'Review Disputes', disputes });
};

exports.resolveDispute = async (req, res) => {
  try {
    const { adminResponse, status } = req.body;
    const dispute = await Dispute.findById(req.params.id);
    dispute.adminResponse = adminResponse;
    dispute.status = status;
    await dispute.save();

    res.redirect('/admin/disputes');
  } catch (err) {
    res.status(500).send(err.message);
  }
};
