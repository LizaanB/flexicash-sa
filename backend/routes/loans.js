const express = require('express');
const router = express.Router();
const Loan = require('../models/Loan');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// @route   POST /api/loans/apply
// @desc    Apply for a loan
// @access  Private (Customer)
router.post('/apply', protect, upload.array('bankStatements', 3), async (req, res) => {
  try {
    const { amount, duration, purpose } = req.body;

    // Check if bank statements were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please upload at least one bank statement'
      });
    }

    // Check if user has pending loan
    const pendingLoan = await Loan.findOne({
      customer: req.user._id,
      status: { $in: ['pending', 'approved', 'disbursed'] }
    });

    if (pendingLoan) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active or pending loan application'
      });
    }

    // Prepare bank statements data
    const bankStatements = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname
    }));

    const loan = await Loan.create({
      customer: req.user._id,
      amount,
      duration,
      purpose,
      bankStatements
    });

    const populatedLoan = await Loan.findById(loan._id).populate('customer', 'name email phone');

    res.status(201).json({
      success: true,
      data: populatedLoan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/loans/my-loans
// @desc    Get current user's loans
// @access  Private (Customer)
router.get('/my-loans', protect, async (req, res) => {
  try {
    const loans = await Loan.find({ customer: req.user._id })
      .populate('customer', 'name email phone')
      .populate('approvedBy', 'name email')
      .sort('-createdAt');

    res.json({
      success: true,
      count: loans.length,
      data: loans
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/loans/all
// @desc    Get all loans (Admin)
// @access  Private (Admin)
router.get('/all', protect, authorize('admin'), async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const loans = await Loan.find(filter)
      .populate('customer', 'name email phone address')
      .populate('approvedBy', 'name email')
      .sort('-createdAt');

    res.json({
      success: true,
      count: loans.length,
      data: loans
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/loans/:id
// @desc    Get single loan
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id)
      .populate('customer', 'name email phone address')
      .populate('approvedBy', 'name email');

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Loan not found'
      });
    }

    // Check authorization
    if (req.user.role !== 'admin' && loan.customer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this loan'
      });
    }

    res.json({
      success: true,
      data: loan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/loans/:id/approve
// @desc    Approve a loan
// @access  Private (Admin)
router.put('/:id/approve', protect, authorize('admin'), async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Loan not found'
      });
    }

    if (loan.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending loans can be approved'
      });
    }

    loan.status = 'approved';
    loan.approvedBy = req.user._id;
    loan.approvedAt = Date.now();
    await loan.save();

    const updatedLoan = await Loan.findById(loan._id)
      .populate('customer', 'name email phone')
      .populate('approvedBy', 'name email');

    res.json({
      success: true,
      data: updatedLoan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/loans/:id/reject
// @desc    Reject a loan
// @access  Private (Admin)
router.put('/:id/reject', protect, authorize('admin'), async (req, res) => {
  try {
    const { reason } = req.body;
    const loan = await Loan.findById(req.params.id);

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Loan not found'
      });
    }

    if (loan.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending loans can be rejected'
      });
    }

    loan.status = 'rejected';
    loan.rejectionReason = reason || 'Not specified';
    loan.approvedBy = req.user._id;
    loan.approvedAt = Date.now();
    await loan.save();

    const updatedLoan = await Loan.findById(loan._id)
      .populate('customer', 'name email phone')
      .populate('approvedBy', 'name email');

    res.json({
      success: true,
      data: updatedLoan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/loans/:id/disburse
// @desc    Mark loan as disbursed (funds paid out)
// @access  Private (Admin)
router.put('/:id/disburse', protect, authorize('admin'), async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Loan not found'
      });
    }

    if (loan.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Only approved loans can be disbursed'
      });
    }

    loan.status = 'disbursed';
    loan.disbursedAt = Date.now();
    // Set due date based on duration
    const dueDate = new Date();
    dueDate.setMonth(dueDate.getMonth() + loan.duration);
    loan.dueDate = dueDate;
    await loan.save();

    const updatedLoan = await Loan.findById(loan._id)
      .populate('customer', 'name email phone')
      .populate('approvedBy', 'name email');

    res.json({
      success: true,
      data: updatedLoan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
