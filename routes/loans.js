const express = require('express');
const router = express.Router();
const Loan = require('../models/Loan');
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { notifyLoanApplication, notifyLoanApproved, notifyLoanRejected, notifyLoanDisbursed } = require('../utils/emailNotifications');

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

    // Check if user has pending or approved loan (allow new application if current loan is disbursed/completed)
    const pendingLoan = await Loan.findOne({
      customer: req.user._id,
      status: { $in: ['pending', 'approved'] }
    });

    if (pendingLoan) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending or approved loan application. Please wait for it to be processed.'
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

    // Create in-app notification
    await Notification.create({
      user: req.user._id,
      type: 'loan_applied',
      title: 'Loan Application Submitted',
      message: `Your loan application for R${amount} has been submitted and is under review.`,
      loan: loan._id
    });

    // Send email notification
    if (process.env.EMAIL_USER) {
      notifyLoanApplication(req.user, loan).catch(err => console.error('Email error:', err));
    }

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

    // Create in-app notification
    await Notification.create({
      user: updatedLoan.customer._id,
      type: 'loan_approved',
      title: '✅ Loan Approved!',
      message: `Congratulations! Your loan application for R${updatedLoan.amount} has been approved.`,
      loan: loan._id
    });

    // Send email notification
    if (process.env.EMAIL_USER) {
      notifyLoanApproved(updatedLoan.customer, updatedLoan).catch(err => console.error('Email error:', err));
    }

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

// @route   PUT /api/loans/:id/update-amount
// @desc    Update loan amount (for cases where customer doesn't qualify for full amount)
// @access  Private (Admin)
router.put('/:id/update-amount', protect, authorize('admin'), async (req, res) => {
  try {
    const { amount, reason } = req.body;
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
        message: 'Only pending loans can be modified'
      });
    }

    // Validate amount
    if (!amount || amount < 100 || amount > 5000) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be between R100 and R5,000'
      });
    }

    const oldAmount = loan.amount;
    loan.amount = amount;
    
    // Recalculate loan details based on new amount
    const interestRate = 0.30; // 30% interest
    const interest = amount * interestRate;
    loan.totalAmount = amount + interest;
    loan.monthlyPayment = loan.totalAmount / loan.duration;
    loan.remainingAmount = loan.totalAmount;
    
    await loan.save();

    const updatedLoan = await Loan.findById(loan._id)
      .populate('customer', 'name email phone')
      .populate('approvedBy', 'name email');

    // Create notification about amount change
    await Notification.create({
      user: updatedLoan.customer._id,
      type: 'loan_updated',
      title: 'Loan Amount Updated',
      message: `Your loan application amount has been updated from R${oldAmount} to R${amount}. ${reason ? `Reason: ${reason}` : ''}`,
      loan: loan._id
    });

    console.log(`Loan ${loan._id} amount updated from R${oldAmount} to R${amount} by admin ${req.user.name}`);

    res.json({
      success: true,
      data: updatedLoan,
      message: `Loan amount updated from R${oldAmount} to R${amount}`
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

    // Create in-app notification
    await Notification.create({
      user: updatedLoan.customer._id,
      type: 'loan_rejected',
      title: 'Loan Application Update',
      message: `Your loan application for R${updatedLoan.amount} has been reviewed. ${reason || 'Please contact us for more information.'}`,
      loan: loan._id
    });

    // Send email notification
    if (process.env.EMAIL_USER) {
      notifyLoanRejected(updatedLoan.customer, updatedLoan).catch(err => console.error('Email error:', err));
    }

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

    // Create in-app notification
    await Notification.create({
      user: updatedLoan.customer._id,
      type: 'loan_disbursed',
      title: '💰 Funds Disbursed!',
      message: `Your loan of R${updatedLoan.amount} has been disbursed. Please ensure timely repayment.`,
      loan: loan._id
    });

    // Send email notification
    if (process.env.EMAIL_USER) {
      notifyLoanDisbursed(updatedLoan.customer, updatedLoan).catch(err => console.error('Email error:', err));
    }

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

// @route   POST /api/loans/:id/initiate-debit-order
// @desc    Admin initiates DebiCheck request for customer approval
// @access  Private (Admin)
router.post('/:id/initiate-debit-order', protect, authorize('admin'), async (req, res) => {
  try {
    const { amount } = req.body;
    const loan = await Loan.findById(req.params.id);

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Loan not found'
      });
    }

    if (loan.status !== 'disbursed') {
      return res.status(400).json({
        success: false,
        message: 'Can only set up debit orders for disbursed loans'
      });
    }

    if (loan.debitOrder && loan.debitOrder.status !== 'none' && loan.debitOrder.status !== 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Debit order already exists for this loan'
      });
    }

    // Initialize debit order
    loan.debitOrder = {
      status: 'pending_approval',
      requestedBy: req.user._id,
      requestedAt: Date.now(),
      amount: amount || loan.monthlyPayment,
      frequency: 'monthly'
    };

    await loan.save();

    const populatedLoan = await Loan.findById(loan._id)
      .populate('customer', 'name email phone')
      .populate('debitOrder.requestedBy', 'name');

    // Create notification for customer
    await Notification.create({
      user: loan.customer._id,
      type: 'debit_order_request',
      title: '🏦 DebiCheck Approval Required',
      message: `Please approve the debit order mandate for R${amount || loan.monthlyPayment.toFixed(2)} per month. Provide your bank details to complete setup.`,
      loan: loan._id
    });

    console.log(`DebiCheck request initiated by admin ${req.user.name} for loan ${loan._id}`);

    res.json({
      success: true,
      data: populatedLoan,
      message: 'DebiCheck request sent to customer'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/loans/:id/approve-debit-order
// @desc    Customer approves debit order with bank details
// @access  Private (Customer)
router.put('/:id/approve-debit-order', protect, async (req, res) => {
  try {
    const { bankDetails } = req.body;
    const loan = await Loan.findById(req.params.id);

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Loan not found'
      });
    }

    if (loan.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    if (loan.debitOrder?.status !== 'pending_approval') {
      return res.status(400).json({
        success: false,
        message: 'No pending debit order request'
      });
    }

    // Validate bank details
    if (!bankDetails || !bankDetails.accountHolder || !bankDetails.accountNumber || 
        !bankDetails.bankName || !bankDetails.branchCode) {
      return res.status(400).json({
        success: false,
        message: 'Complete bank details are required'
      });
    }

    // Update debit order
    loan.debitOrder.status = 'approved';
    loan.debitOrder.approvedAt = Date.now();
    loan.debitOrder.bankDetails = bankDetails;
    
    // Set next debit date (first day of next month)
    const nextDebitDate = new Date();
    nextDebitDate.setMonth(nextDebitDate.getMonth() + 1);
    nextDebitDate.setDate(1);
    loan.debitOrder.nextDebitDate = nextDebitDate;

    await loan.save();

    const populatedLoan = await Loan.findById(loan._id)
      .populate('customer', 'name email phone');

    // Notify admins
    await Notification.create({
      user: loan.debitOrder.requestedBy,
      type: 'debit_order_approved',
      title: '✓ DebiCheck Approved',
      message: `Customer ${req.user.name} approved the debit order mandate for loan ${loan._id}`,
      loan: loan._id
    });

    console.log(`DebiCheck approved by customer ${req.user.name} for loan ${loan._id}`);

    res.json({
      success: true,
      data: populatedLoan,
      message: 'DebiCheck mandate approved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/loans/:id/cancel-debit-order
// @desc    Cancel debit order
// @access  Private (Admin or Customer)
router.put('/:id/cancel-debit-order', protect, async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Loan not found'
      });
    }

    // Check authorization
    const isAdmin = req.user.role === 'admin';
    const isCustomer = loan.customer.toString() === req.user._id.toString();
    
    if (!isAdmin && !isCustomer) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    if (!loan.debitOrder || loan.debitOrder.status === 'none') {
      return res.status(400).json({
        success: false,
        message: 'No active debit order'
      });
    }

    loan.debitOrder.status = 'cancelled';
    await loan.save();

    // Notify relevant party
    const notifyUserId = isAdmin ? loan.customer._id : loan.debitOrder.requestedBy;
    await Notification.create({
      user: notifyUserId,
      type: 'debit_order_cancelled',
      title: '🚫 DebiCheck Cancelled',
      message: `The debit order for loan ${loan._id} has been cancelled by ${req.user.name}`,
      loan: loan._id
    });

    res.json({
      success: true,
      message: 'Debit order cancelled successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
