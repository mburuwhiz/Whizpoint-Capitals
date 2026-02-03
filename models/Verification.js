const mongoose = require('mongoose');

const verificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Verified', 'Rejected'],
    default: 'Pending'
  },
  documents: [{
    path: String,
    name: String,
    mimeType: String
  }],
  feePaid: {
    type: Boolean,
    default: false
  },
  feeRefunded: {
    type: Boolean,
    default: false
  },
  adminComment: String
}, { timestamps: true });

module.exports = mongoose.model('Verification', verificationSchema);
