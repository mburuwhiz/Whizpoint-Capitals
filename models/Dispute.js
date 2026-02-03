const mongoose = require('mongoose');

const disputeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  transactionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  },
  reason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Open', 'Resolved', 'Closed'],
    default: 'Open'
  },
  evidence: String,
  adminResponse: String
}, { timestamps: true });

module.exports = mongoose.model('Dispute', disputeSchema);
