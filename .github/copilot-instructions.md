# FlexiCash SA - Cash Loan Management System

## Architecture Overview

**Stack**: MERN (MongoDB + Express + React + Node.js) with JWT auth and PWA capabilities

**Project Structure**:
- `backend/` - Express REST API with MongoDB models, JWT middleware, Multer file uploads
- `frontend/` - React SPA with React Router, Axios interceptors, PWA service worker
- Dual-role system: `customer` (loan applications, repayments) and `admin` (approve/reject, disburse)

**Key Data Flow**:
1. Customer applies → uploads bank statements → creates Loan with `pending` status
2. Admin reviews → approves/rejects → loan status changes to `approved`/`rejected`
3. Admin disburses → status `disbursed` → customer can make payments
4. Payments reduce `remainingAmount` → when zero, status becomes `completed`

## Critical Patterns

### Authentication & Authorization
- JWT tokens stored in localStorage, attached via Axios interceptor ([frontend/src/api.js](frontend/src/api.js#L13-L22))
- Backend middleware: `protect` (validates JWT) + `authorize(...roles)` chains ([backend/middleware/auth.js](backend/middleware/auth.js))
- Role-based routing in React: `PrivateRoute` checks `user.role` before rendering ([frontend/src/App.js](frontend/src/App.js#L15-L30))
- **Pattern**: All protected routes use `protect` middleware, admin routes add `authorize('admin')`

### File Uploads & Storage
- Bank statements required for loan applications (PDF/JPG/PNG, 5MB max)
- Uses Multer with disk storage at `uploads/bank-statements/` ([backend/middleware/upload.js](backend/middleware/upload.js))
- Files stored as `statement-{timestamp}-{random}.ext`, metadata in Loan model's `bankStatements` array
- **Pattern**: Route handler uses `upload.array('bankStatements', 3)` middleware before business logic

### Loan Lifecycle & Business Rules
- Loans have 5 states: `pending` → `approved`/`rejected` → `disbursed` → `completed`
- Fixed 30% interest rate, 1-month duration, R100-R5000 amount limits ([backend/models/Loan.js](backend/models/Loan.js#L12-L26))
- One active loan per customer: blocks new applications if existing loan is `pending` or `approved` ([backend/routes/loans.js](backend/routes/loans.js#L28-L36))
- `totalAmount`, `monthlyPayment`, `remainingAmount` calculated on loan creation using `calculateLoanDetails()` method

### Notifications System
- In-app notifications via MongoDB Notification model (types: `loan_applied`, `loan_approved`, `loan_rejected`, `loan_disbursed`, `payment_received`)
- Email notifications via Nodemailer utility functions in [backend/utils/emailNotifications.js](backend/utils/emailNotifications.js)
- Created automatically on loan status changes and payment events

### Security Measures (Production-Ready)
- Helmet.js for security headers, express-mongo-sanitize prevents NoSQL injection
- Rate limiting: 100 req/15min globally, 5 req/15min on auth routes ([backend/server.js](backend/server.js#L24-L34))
- CORS configured for localhost + Vercel domains with credentials support
- Error messages sanitized in production (`NODE_ENV` check)

## Development Workflows

### Local Development
```bash
# Backend (runs on port 5000)
cd backend
npm install
cp .env.example .env  # Configure MONGODB_URI, JWT_SECRET
npm run dev           # Uses nodemon

# Frontend (runs on port 3000)
cd frontend
npm install
npm start             # React dev server with hot reload
```

### PWA Features
- App installable on mobile via manifest.json (shortcuts to /apply, /my-loans)
- Service worker handles offline mode and caching ([frontend/public/service-worker.js](frontend/public/service-worker.js))
- InstallPrompt component shows native install banner on supported browsers
- Build outputs to `frontend/build/` for static hosting

### Deployment Pattern
- Frontend: Static build deployed to Vercel/Netlify (set `REACT_APP_API_URL` env var)
- Backend: Node.js app deployed to Railway/Render (requires MongoDB Atlas connection string)
- Use `deploy-mobile-app.ps1` script to build frontend and show deployment steps
- **Important**: Update CORS origins in [backend/server.js](backend/server.js#L38-L44) with production URLs

## Common Modifications

### Adding New Loan Statuses
1. Update enum in [backend/models/Loan.js](backend/models/Loan.js#L38-L44) `status` field
2. Add corresponding notification type in [backend/models/Notification.js](backend/models/Notification.js#L8-L14)
3. Create email notification function in [backend/utils/emailNotifications.js](backend/utils/emailNotifications.js)
4. Update UI status badges in dashboard components

### Adding New User Fields
1. Update schema in [backend/models/User.js](backend/models/User.js)
2. Add input fields to [frontend/src/components/Register.js](frontend/src/components/Register.js)
3. Validation happens via Mongoose schema validators (e.g., `required`, `minlength`)
4. Password hashing uses bcryptjs in auth route's register handler

### Modifying Loan Calculation Logic
- Edit `calculateLoanDetails()` pre-save hook in Loan model ([backend/models/Loan.js](backend/models/Loan.js#L68-L78))
- Current formula: `totalAmount = amount * (1 + interestRate/100)`
- Triggered automatically on `loan.save()` before document insertion

## API Conventions

- Response format: `{ success: boolean, data?: any, message?: string }`
- Errors return appropriate status codes (400 validation, 401 unauthorized, 403 forbidden, 500 server error)
- Pagination not implemented (loads all records) - consider adding for production scale
- MongoDB ObjectIds referenced between models (User ← Loan, User ← Notification, Loan ← Payment)
