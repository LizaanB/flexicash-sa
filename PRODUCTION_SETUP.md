# Production Deployment Guide

## ✅ Step 1: MongoDB Atlas (Database)

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create free account
3. Click "Build a Database" → Choose **FREE** M0 tier
4. Select closest region (e.g., AWS Cape Town/Frankfurt)
5. Create cluster (takes 3-5 minutes)

### Configure Database Access:
1. Security → Database Access → Add New User
   - Username: `flexicash_admin`
   - Password: Generate secure password (save it!)
   - Role: Atlas Admin
2. Security → Network Access → Add IP Address
   - **IMPORTANT**: Click "Allow Access from Anywhere" (0.0.0.0/0)
   - This allows Railway to connect

### Get Connection String:
1. Database → Connect → Connect your application
2. Driver: Node.js, Version: 4.0 or later
3. Copy connection string (looks like):
   ```
   mongodb+srv://flexicash_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. Replace `<password>` with actual password
5. Add database name before `?`: `.../cluster0.xxxxx.mongodb.net/cash-loan-app?retryWrites=true...`

---

## ✅ Step 2: Railway Backend Deployment

1. Go to https://railway.app/
2. Sign up with GitHub account
3. Click "New Project" → "Deploy from GitHub repo"
4. Select `flexicash-sa` repository
5. Railway auto-detects Node.js

### Configure Environment Variables:
Click on your service → Variables tab → Add these:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://flexicash_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/cash-loan-app?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_xyz123
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
```

**IMPORTANT**: Replace:
- `YOUR_PASSWORD` with MongoDB Atlas password
- `JWT_SECRET` with a random 32+ character string
- Email credentials (optional for now)

### Set Root Directory:
- Settings → Root Directory → Enter: `backend`
- This tells Railway to run from backend folder

### Deploy:
- Railway auto-deploys
- Wait 2-3 minutes
- Click "Deployments" → View logs
- Look for "✅ Database connected successfully"
- Copy your Railway URL (e.g., `https://flexicash-sa-production.up.railway.app`)

---

## ✅ Step 3: Vercel Frontend Deployment

1. Go to https://vercel.com/signup
2. Sign up with GitHub account
3. Click "Add New..." → "Project"
4. Import `flexicash-sa` repository
5. Configure project:
   - Framework Preset: **Create React App**
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `build`

### Environment Variables:
Add in Environment Variables section:
```
REACT_APP_API_URL=https://your-railway-backend-url.up.railway.app/api
```
**Replace** with your Railway backend URL from Step 2!

### Deploy:
- Click "Deploy"
- Wait 2-3 minutes
- Vercel gives you URL (e.g., `https://flexicash-sa.vercel.app`)

---

## ✅ Step 4: Update CORS Configuration

Your frontend is now at `https://flexicash-sa.vercel.app`  
Backend needs to allow requests from it:

1. Open `backend/server.js` in VS Code
2. Find `corsOptions` (around line 38)
3. Add your Vercel URL:
   ```javascript
   origin: [
     'http://localhost:3000',
     'https://flexicash-sa.vercel.app',  // ADD THIS
     'https://your-custom-domain.com'     // If you add custom domain
   ],
   ```
4. Save file
5. Commit and push:
   ```powershell
   git add .
   git commit -m "Update CORS for production"
   git push
   ```
6. Railway auto-redeploys (30 seconds)

---

## ✅ Step 5: Create Admin User in Production

Since production database is empty, create admin user:

```powershell
# Update backend/create-admin.js with production MongoDB URI temporarily
# OR use Railway's service terminal to run create-admin.js
```

**Option 1: Railway Terminal**
1. Railway dashboard → Your service → Terminal tab
2. Run: `node create-admin.js`

**Option 2: Local with Production DB**
1. Temporarily change `MONGODB_URI` in backend/.env to Atlas connection string
2. Run: `node backend/create-admin.js`
3. Change back to localhost

---

## ✅ Step 6: Test Your Production App

1. Open your Vercel URL: `https://flexicash-sa.vercel.app`
2. Click "Register" → Create customer account
3. Login with customer → Apply for loan (test upload)
4. Login with admin → Approve/reject loan
5. Test payment flow

**Check Backend Health:**
Visit: `https://your-railway-url.up.railway.app/api/health`  
Should show: `{"success":true,"message":"Server is running"}`

---

## 🔒 Security Checklist

- [x] JWT_SECRET is strong random string (not default)
- [x] MongoDB allows only Railway IP (0.0.0.0/0 for simplicity, or restrict to Railway IPs)
- [x] CORS only allows your Vercel domain
- [x] Rate limiting enabled (100 req/15min)
- [x] Helmet security headers active
- [x] No sensitive data in Git (use .env files)

---

## 📊 Monitoring & Logs

**Railway Logs:**  
Dashboard → Deployments → View logs  
Check for errors, database connections

**Vercel Logs:**  
Dashboard → Deployments → Functions tab  
See build logs and runtime logs

---

## 🚀 Your Production URLs

After deployment, you'll have:

- **Frontend**: https://flexicash-sa.vercel.app
- **Backend**: https://flexicash-sa-production.up.railway.app
- **Database**: MongoDB Atlas cluster

---

## 💡 Common Issues

**"Failed to fetch" in frontend:**
- Check CORS is updated in backend/server.js
- Verify REACT_APP_API_URL is correct in Vercel env vars
- Restart Vercel deployment after changing env vars

**"Database connection failed":**
- Verify MongoDB connection string has correct password
- Check Network Access in Atlas allows 0.0.0.0/0
- Ensure database name is in connection string

**"Cannot POST /api/auth/register":**
- Check Railway ROOT DIRECTORY is set to `backend`
- Verify backend is running (check Railway logs)

---

## 🎉 You're Live!

Your app is now accessible worldwide on any device with internet. Share your Vercel URL with users!

For custom domain: Add domain in Vercel settings and update CORS.
