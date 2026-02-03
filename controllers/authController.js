const User = require('../models/User');
const Wallet = require('../models/Wallet');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/emailer');

exports.getRegister = (req, res) => {
  res.render('auth/register', { title: 'Register' });
};

exports.postRegister = async (req, res) => {
  try {
    const { email, password, preferredCurrency } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.render('auth/register', { error: 'Email already exists', title: 'Register' });
    }

    user = await User.create({
      email,
      password,
      preferredCurrency
    });

    // Create initial wallet
    await Wallet.create({
      userId: user._id,
      currency: preferredCurrency,
      balance: 0
    });

    res.redirect('/login');
  } catch (err) {
    res.render('auth/register', { error: err.message, title: 'Register' });
  }
};

exports.getLogin = (req, res) => {
  res.render('auth/login', { title: 'Login' });
};

exports.postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.render('auth/login', { error: 'Invalid credentials', title: 'Login' });
    }

    req.session.userId = user._id;

    // Send login alert email if enabled
    await sendEmail({
      email: user.email,
      subject: 'Login Alert',
      message: `You have successfully logged into your ${process.env.COMPANY_NAME} account.`,
      user: user,
      type: 'login'
    });

    res.redirect('/dashboard');
  } catch (err) {
    res.render('auth/login', { error: err.message, title: 'Login' });
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
};

exports.getForgotPassword = (req, res) => {
  res.render('auth/forgot-password', { title: 'Forgot Password' });
};

const crypto = require('crypto');

exports.postForgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.render('auth/forgot-password', { message: 'If that email exists, a reset link has been sent.', title: 'Forgot Password' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 mins

    await user.save();

    const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;
    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a POST request to: \n\n ${resetUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset Token',
        message,
        type: 'password-reset'
      });
      res.render('auth/forgot-password', { message: 'Email sent', title: 'Forgot Password' });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      return res.render('auth/forgot-password', { error: 'Email could not be sent', title: 'Forgot Password' });
    }
  } catch (err) {
    res.render('auth/forgot-password', { error: err.message, title: 'Forgot Password' });
  }
};

exports.getResetPassword = async (req, res) => {
  const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    return res.render('auth/forgot-password', { error: 'Invalid or expired token', title: 'Forgot Password' });
  }

  res.render('auth/reset-password', { title: 'Reset Password', token: req.params.token });
};

exports.postResetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).send('Invalid or expired token');
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.redirect('/login');
  } catch (err) {
    res.status(500).send(err.message);
  }
};
