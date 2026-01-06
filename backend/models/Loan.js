const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Please provide loan amount'],
    min: [100, 'Minimum loan amount is R100'],
    max: [5000, 'Maximum loan amount is R5000']
  },
  interestRate: {
    type: Number,
    default: 30, // 30% interest rate
    required: true
  },
  duration: {
    type: Number,
    default: 1,
    required: [true, 'Please provide loan duration in months'],
    min: [1, 'Minimum duration is 1 month'],
    max: [12, 'Maximum duration is 12 months']
  },
  totalAmount: {
    type: Number
  },
  monthlyPayment: {
    type: Number
  },
  amountPaid: {
    type: Number,
    default: 0
  },
  remainingAmount: {
    type: Number
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'disbursed', 'completed'],
    default: 'pending'
  },
  purpose: {
    type: String,
    required: false
  },
  bankStatements: [
    {
      filename: String,
      originalName: String,
      uploadDate: {
        type: Date,
        default: Date.now
      }
    }
  ],
  rejectionReason: {
    type: String,
    required: false
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  disbursedAt: {
    type: Date
  },
  dueDate: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate total amount before saving
loanSchema.pre('save', function(next) {
  if (this.isNew) {
    const interest = (this.amount * this.interestRate) / 100;
    this.totalAmount = this.amount + interest;
    this.monthlyPayment = this.totalAmount / this.duration;
    this.remainingAmount = this.totalAmount;
  }
  next();
});

module.exports = mongoose.model('Loan', loanSchema);
