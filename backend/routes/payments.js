const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Loan = require('../models/Loan');
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/payments/make-payment
// @desc    Make a payment towards a loan
// @access  Private (Customer)
router.post('/make-payment', protect, async (req, res) => {
  try {
    const { loanId, amount, paymentMethod, reference, notes, bankDetails } = req.body;

    // Get loan
    const loan = await Loan.findById(loanId);
    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Loan not found'
      });
    }

    // Check if user owns the loan
    if (loan.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to make payment for this loan'
      });
    }

    // Check if loan is disbursed
    if (loan.status !== 'disbursed') {
      return res.status(400).json({
        success: false,
        message: 'Can only make payments for disbursed loans'
      });
    }

    // Check if payment amount is valid
    if (amount > loan.remainingAmount) {
      return res.status(400).json({
        success: false,
        message: 'Payment amount exceeds remaining loan balance'
      });
    }

    // Validate bank details for debit order/EasyPay
    if (paymentMethod === 'debit_order' || paymentMethod === 'easypay') {
      if (!bankDetails || !bankDetails.accountHolder || !bankDetails.accountNumber || 
          !bankDetails.bankName || !bankDetails.branchCode) {
        return res.status(400).json({
          success: false,
          message: 'Bank account details are required for debit order payments'
        });
      }
    }

    // Create payment
    const paymentData = {
      loan: loanId,
      customer: req.user._id,
      amount,
      paymentMethod,
      reference,
      notes
    };

    // Add bank details for debit order
    if (paymentMethod === 'debit_order' || paymentMethod === 'easypay') {
      paymentData.bankDetails = bankDetails;
      paymentData.status = 'pending'; // Debit orders need to be processed
      paymentData.notes = `${paymentData.notes || ''} Debit order mandate authorized for ${bankDetails.bankName} account ending in ${bankDetails.accountNumber.slice(-4)}`.trim();
    }

    const payment = await Payment.create(paymentData);

    // Update loan
    loan.amountPaid += amount;
    loan.remainingAmount -= amount;

    if (loan.remainingAmount <= 0) {
      loan.status = 'completed';
    }

    await loan.save();

    const populatedPayment = await Payment.findById(payment._id)
      .populate('customer', 'name email phone')
      .populate('loan');

    res.status(201).json({
      success: true,
      data: populatedPayment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/payments/loan/:loanId
// @desc    Get payments for a specific loan
// @access  Private
router.get('/loan/:loanId', protect, async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.loanId);
    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Loan not found'
      });
    }

    // Check authorization
    if (req.user.role !== 'admin' && loan.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view these payments'
      });
    }

    const payments = await Payment.find({ loan: req.params.loanId })
      .populate('customer', 'name email phone')
      .sort('-createdAt');

    res.json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/payments/my-payments
// @desc    Get current user's payments
// @access  Private (Customer)
router.get('/my-payments', protect, async (req, res) => {
  try {
    const payments = await Payment.find({ customer: req.user._id })
      .populate('loan')
      .sort('-createdAt');

    res.json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/payments/all
// @desc    Get all payments (Admin)
// @access  Private (Admin)
router.get('/all', protect, authorize('admin'), async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('customer', 'name email phone')
      .populate('loan')
      .sort('-createdAt');

    res.json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
