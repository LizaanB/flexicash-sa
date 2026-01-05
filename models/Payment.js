const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  loan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Loan',
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Please provide payment amount'],
    min: [1, 'Payment amount must be greater than 0']
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'bank_transfer', 'mobile_money', 'card', 'debit_order', 'easypay'],
    default: 'cash'
  },
  bankDetails: {
    accountHolder: String,
    accountNumber: String,
    bankName: String,
    branchCode: String,
    accountType: {
      type: String,
      enum: ['cheque', 'savings'],
      default: 'cheque'
    }
  },
  reference: {
    type: String,
    required: false
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'failed'],
    default: 'confirmed'
  },
  notes: {
    type: String,
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Payment', paymentSchema);
