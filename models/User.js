const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  preferredCurrency: {
    type: String,
    required: true,
    default: 'USD'
  },
  verificationStatus: {
    type: String,
    enum: ['Unverified', 'Pending', 'Verified', 'Rejected'],
    default: 'Unverified'
  },
  emailPreferences: {
    loginAlerts: { type: Boolean, default: true },
    withdrawalAlerts: { type: Boolean, default: true },
    transferAlerts: { type: Boolean, default: true },
    verificationEmails: { type: Boolean, default: true },
    marketingEmails: { type: Boolean, default: true }
  },
  riskScore: {
    type: Number,
    default: 0
  },
  isFrozen: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
