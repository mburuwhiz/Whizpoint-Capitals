const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  currency: {
    type: String,
    required: true
  },
  balance: {
    type: Number,
    default: 0
  },
  lockedBalance: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Ensure unique wallet per user per currency
walletSchema.index({ userId: 1, currency: 1 }, { unique: true });

module.exports = mongoose.model('Wallet', walletSchema);
