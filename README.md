# Cash Loan Management System

A comprehensive loan management application for managing cash loan applications, approvals, disbursements, and repayments.

## Features

### Customer Features
- User registration and authentication
- Loan application with amount and duration
- View loan status (Pending, Approved, Rejected, Disbursed)
- Track repayment schedule
- Make repayments
- View loan history

### Admin Features
- Review all loan applications
- Approve or reject loan applications
- Mark loans as disbursed (funds paid)
- Track all customer repayments
- View statistics and analytics
- Manage customers

## Tech Stack

### Backend
- Node.js & Express.js
- MongoDB & Mongoose
- JWT Authentication
- RESTful API

### Frontend
- React.js
- React Router for navigation
- Axios for API calls
- Modern responsive design

## Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

## Default Admin Account

After first run, you can create an admin account:
- Email: admin@cashloan.com
- Password: admin123

## API Endpoints

### Authentication
- POST /api/auth/register - Register new user
- POST /api/auth/login - Login user
- GET /api/auth/me - Get current user

### Loans
- POST /api/loans/apply - Apply for loan (Customer)
- GET /api/loans/my-loans - Get user's loans (Customer)
- GET /api/loans/all - Get all loans (Admin)
- PUT /api/loans/:id/approve - Approve loan (Admin)
- PUT /api/loans/:id/reject - Reject loan (Admin)
- PUT /api/loans/:id/disburse - Mark as disbursed (Admin)

### Payments
- POST /api/payments/make-payment - Make repayment (Customer)
- GET /api/payments/loan/:loanId - Get payments for a loan
- GET /api/payments/all - Get all payments (Admin)

## License

ISC
