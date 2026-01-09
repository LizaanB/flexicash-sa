# FlexiCash SA - Troubleshooting Guide

## Issue: Blank Screen

### Quick Fix Steps:

#### 1. **Stop All Servers**
```powershell
# Kill any processes on ports 3000 and 5000
Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Stop-Process -Force
```

#### 2. **Start Backend Server**
Open PowerShell in `backend` folder:
```powershell
cd "C:\Cash Loan App\backend"
npm start
```
Wait for "MongoDB Connected" message.

#### 3. **Start Frontend Server**
Open ANOTHER PowerShell in `frontend` folder:
```powershell
cd "C:\Cash Loan App\frontend"
npm start
```
Wait for "Compiled successfully!" message.

#### 4. **Access the App**
Open your browser to: **http://localhost:3000**

---

## Current Status Check

### ✅ What's Working:
- Backend server: http://localhost:5000
- Frontend server: http://localhost:3000  
- MongoDB: Connected
- All endpoints: Tested and working
- Test status page: http://localhost:3000/test-status.html

### Admin Login Credentials:
- **Email:** admin@flexicash.co.za
- **Password:** admin123

### Test Customer Account (from tests):
- **Email:** test.user.[timestamp]@example.com  
- **Password:** password123

---

## Common Issues & Solutions

### Issue 1: Blank White Screen
**Cause:** Frontend not connecting to backend or React not loading

**Solution:**
1. Check browser console (F12) for errors
2. Verify both servers are running
3. Clear browser cache (Ctrl+Shift+Delete)
4. Check `.env` file has correct API URL

### Issue 2: "Cannot connect to server"
**Cause:** Backend not running or wrong URL

**Solution:**
1. Restart backend: `cd backend && npm start`
2. Check backend is on port 5000: http://localhost:5000/api/health
3. Should return: `{"success":true,"message":"Server is running"}`

### Issue 3: Login doesn't work
**Cause:** Rate limiting or wrong credentials

**Solution:**
1. Wait 15 minutes if you see "Too many requests"
2. Use correct credentials (see above)
3. Create new user via Register page

### Issue 4: React app shows blank after webpack compiles
**Cause:** Environment variables not loading

**Solution:**
1. Stop frontend server (Ctrl+C)
2. Delete `.env` file
3. Create new `.env` with this content:
```
REACT_APP_API_URL=http://localhost:5000/api
```
4. Restart: `npm start`

---

## Manual Testing Steps

### 1. Test Backend
```powershell
curl http://localhost:5000/api/health
```
Should return: `{"success":true,"message":"Server is running"}`

### 2. Test Frontend
```powershell
curl http://localhost:3000
```
Should return HTML with `<div id="root"></div>`

### 3. Test API Connection
Visit: http://localhost:3000/test-status.html
- Should show "Backend Connected" in green
- Click "Test Backend Connection" button

### 4. Test Login
1. Go to http://localhost:3000
2. Click "Login"
3. Enter admin credentials
4. Should redirect to admin dashboard

---

## Environment Files

### Backend `.env` (C:\Cash Loan App\backend\.env)
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/cash-loan-app
JWT_SECRET=FlexiCash2026$SecureKey#RandomString!P@ssw0rd_Change_This_In_Production_987654321
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

### Frontend `.env` (C:\Cash Loan App\frontend\.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

## Browser Console Commands

Open browser console (F12) and run these to diagnose:

```javascript
// Check if React loaded
console.log('React version:', React.version);

// Check API URL
console.log('API URL:', process.env.REACT_APP_API_URL);

// Test API connection
fetch('http://localhost:5000/api/health')
  .then(r => r.json())
  .then(d => console.log('Backend:', d))
  .catch(e => console.error('Backend Error:', e));

// Check localStorage
console.log('Token:', localStorage.getItem('token'));
```

---

## Complete Restart Procedure

If nothing works, follow these steps:

```powershell
# 1. Stop everything
Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Stop-Process -Force

# 2. Clean install backend
cd "C:\Cash Loan App\backend"
Remove-Item node_modules -Recurse -Force -ErrorAction SilentlyContinue
npm install
npm start  # Keep this running

# 3. In NEW terminal, clean install frontend
cd "C:\Cash Loan App\frontend"
Remove-Item node_modules -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item .env -Force -ErrorAction SilentlyContinue
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env
npm install
npm start  # Keep this running

# 4. Open browser to http://localhost:3000
```

---

## Need More Help?

### Check These Files for Errors:
1. Browser Console (F12 → Console tab)
2. Backend terminal output
3. Frontend terminal output
4. Network tab (F12 → Network) - look for failed requests

### Status Pages:
- **Backend Health:** http://localhost:5000/api/health
- **Frontend Status:** http://localhost:3000/test-status.html
- **Main App:** http://localhost:3000

### Run Automated Tests:
```powershell
cd "C:\Cash Loan App"
node test-endpoints.js
```

---

## Success Indicators

You should see:
- ✅ Backend terminal: "Server running in development mode on port 5000"
- ✅ Backend terminal: "MongoDB Connected"
- ✅ Frontend terminal: "Compiled successfully!"
- ✅ Frontend terminal: "webpack compiled"
- ✅ Browser: Login page or Dashboard (not blank)
- ✅ No red errors in browser console

---

**Last Updated:** January 9, 2026
