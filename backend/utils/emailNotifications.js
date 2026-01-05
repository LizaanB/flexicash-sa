const nodemailer = require('nodemailer');

// Create email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // You can change to your email provider
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Send email notification
const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: `FlexiCash SA <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    };

    await transporter.sendMail(mailOptions);
    console.log('Email sent to:', to);
  } catch (error) {
    console.error('Email error:', error);
  }
};

// Loan application received
const notifyLoanApplication = async (user, loan) => {
  const subject = 'Loan Application Received - FlexiCash SA';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0891b2;">Loan Application Received</h2>
      <p>Dear ${user.name},</p>
      <p>We have received your loan application for <strong>R${loan.amount}</strong>.</p>
      <p><strong>Application Details:</strong></p>
      <ul>
        <li>Amount: R${loan.amount}</li>
        <li>Duration: ${loan.duration} month(s)</li>
        <li>Interest (30%): R${(loan.amount * 0.3).toFixed(2)}</li>
        <li>Total to Repay: R${loan.totalAmount}</li>
      </ul>
      <p>We will review your application and get back to you within 24 hours.</p>
      <p style="color: #0891b2;"><strong>FlexiCash SA Team</strong></p>
    </div>
  `;
  await sendEmail(user.email, subject, html);
};

// Loan approved
const notifyLoanApproved = async (user, loan) => {
  const subject = '✅ Loan Approved - FlexiCash SA';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #10b981;">Congratulations! Your Loan is Approved</h2>
      <p>Dear ${user.name},</p>
      <p>Great news! Your loan application for <strong>R${loan.amount}</strong> has been approved!</p>
      <p><strong>Loan Details:</strong></p>
      <ul>
        <li>Amount Approved: R${loan.amount}</li>
        <li>Total to Repay: R${loan.totalAmount}</li>
        <li>Monthly Payment: R${loan.monthlyPayment}</li>
      </ul>
      <p>Funds will be disbursed to your account within 24 hours.</p>
      <p style="color: #0891b2;"><strong>FlexiCash SA Team</strong></p>
    </div>
  `;
  await sendEmail(user.email, subject, html);
};

// Loan rejected
const notifyLoanRejected = async (user, loan) => {
  const subject = 'Loan Application Update - FlexiCash SA';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #ef4444;">Loan Application Decision</h2>
      <p>Dear ${user.name},</p>
      <p>Thank you for your loan application for R${loan.amount}.</p>
      <p>Unfortunately, we are unable to approve your application at this time.</p>
      ${loan.rejectionReason ? `<p><strong>Reason:</strong> ${loan.rejectionReason}</p>` : ''}
      <p>You may reapply after 30 days or contact us for more information.</p>
      <p style="color: #0891b2;"><strong>FlexiCash SA Team</strong></p>
    </div>
  `;
  await sendEmail(user.email, subject, html);
};

// Loan disbursed
const notifyLoanDisbursed = async (user, loan) => {
  const subject = '💰 Funds Disbursed - FlexiCash SA';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0891b2;">Funds Disbursed!</h2>
      <p>Dear ${user.name},</p>
      <p>Your loan of <strong>R${loan.amount}</strong> has been successfully disbursed!</p>
      <p><strong>Payment Details:</strong></p>
      <ul>
        <li>Total Amount to Repay: R${loan.totalAmount}</li>
        <li>Monthly Payment: R${loan.monthlyPayment}</li>
        <li>Remaining Balance: R${loan.remainingAmount}</li>
      </ul>
      <p>Please ensure timely payments to maintain a good credit record.</p>
      <p style="color: #0891b2;"><strong>FlexiCash SA Team</strong></p>
    </div>
  `;
  await sendEmail(user.email, subject, html);
};

// Payment reminder
const notifyPaymentReminder = async (user, loan) => {
  const subject = '⏰ Payment Reminder - FlexiCash SA';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #f97316;">Payment Reminder</h2>
      <p>Dear ${user.name},</p>
      <p>This is a friendly reminder about your loan payment.</p>
      <p><strong>Outstanding Balance:</strong> R${loan.remainingAmount}</p>
      <p><strong>Monthly Payment:</strong> R${loan.monthlyPayment}</p>
      <p>Please make your payment to avoid late fees.</p>
      <p style="color: #0891b2;"><strong>FlexiCash SA Team</strong></p>
    </div>
  `;
  await sendEmail(user.email, subject, html);
};

module.exports = {
  sendEmail,
  notifyLoanApplication,
  notifyLoanApproved,
  notifyLoanRejected,
  notifyLoanDisbursed,
  notifyPaymentReminder
};
