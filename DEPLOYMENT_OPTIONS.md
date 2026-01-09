# FlexiCash SA - Production Deployment Options

## ✅ Rate Limit Fixed for Development

I've increased the login rate limit from 5 to 100 attempts per 15 minutes for development. **Refresh your browser and try logging in now!**

---

## 🚀 Production Deployment Options

To access your app from different networks and devices, deploy to these cloud platforms:

### Option 1: Railway.app (Recommended - Easiest) ⭐

**Backend Deployment:**
```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login to Railway
railway login

# 3. Deploy backend
cd backend
railway init
railway up

# 4. Add environment variables in Railway dashboard:
MONGODB_URI=<your-mongodb-atlas-uri>
JWT_SECRET=<your-secret-key>
NODE_ENV=production
```

**Frontend Deployment:**
- Deploy to Vercel (see below)
- Update `REACT_APP_API_URL` to your Railway backend URL

**Cost:** FREE tier available (500 hours/month)
**URL:** Your app gets a URL like: `your-app.up.railway.app`

---

### Option 2: Render.com (Free Backend + Frontend)

**Backend:**
1. Go to https://render.com
2. Connect your GitHub repo
3. Create New Web Service
4. Select `backend` folder
5. Build command: `npm install`
6. Start command: `node server.js`
7. Add environment variables

**Frontend:**
1. Create New Static Site
2. Select `frontend` folder
3. Build command: `npm run build`
4. Publish directory: `build`

**Cost:** FREE tier available
**URL:** `your-app.onrender.com`

---

### Option 3: Vercel (Frontend) + Railway (Backend) ⭐ Best Performance

**Backend on Railway:**
```bash
cd backend
railway login
railway init
railway up
# Copy the URL (e.g., https://your-app.up.railway.app)
```

**Frontend on Vercel:**
```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Deploy frontend
cd frontend
vercel

# 3. Set environment variable:
# REACT_APP_API_URL=https://your-backend.up.railway.app/api
```

**Cost:** Both have FREE tiers
**Speed:** ⚡ Lightning fast global CDN

---

### Option 4: Heroku (Classic, Reliable)

**Backend:**
```bash
# 1. Install Heroku CLI
# Download from: https://devcenter.heroku.com/articles/heroku-cli

# 2. Login
heroku login

# 3. Create app
cd backend
heroku create flexicash-backend

# 4. Deploy
git push heroku main

# 5. Set environment variables
heroku config:set MONGODB_URI=<your-uri>
heroku config:set JWT_SECRET=<your-secret>
```

**Cost:** $7/month (no free tier anymore)

---

### Option 5: DigitalOcean App Platform

**Simple Deployment:**
1. Connect GitHub repo
2. Select both backend and frontend
3. Auto-detects Node.js apps
4. One-click deploy

**Cost:** Starting at $5/month
**Features:** Automatic SSL, scaling, monitoring

---

## 📱 MongoDB Atlas (Required for Production)

All options need a cloud database:

1. Go to https://www.mongodb.com/cloud/atlas
2. Create FREE account
3. Create FREE cluster (M0 tier)
4. Get connection string
5. Add to your backend environment variables

**FREE Forever:** 512MB storage

---

## 🎯 Quick Deploy Guide (Railway + Vercel)

### Step 1: Setup MongoDB Atlas (5 minutes)

```bash
1. Go to mongodb.com/cloud/atlas
2. Sign up (free)
3. Create cluster (FREE M0 tier)
4. Create database user
5. Whitelist all IPs (0.0.0.0/0)
6. Get connection string:
   mongodb+srv://username:password@cluster.mongodb.net/flexicash
```

### Step 2: Deploy Backend to Railway (5 minutes)

```bash
cd backend
npm install -g @railway/cli
railway login
railway init
railway up

# In Railway dashboard, add environment variables:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/flexicash
JWT_SECRET=FlexiCash2026$SecureRandomKey
NODE_ENV=production
PORT=5000
```

Copy your Railway URL (e.g., `https://flexicash-production.up.railway.app`)

### Step 3: Deploy Frontend to Vercel (3 minutes)

```bash
cd frontend
npm install -g vercel
vercel login
vercel

# When prompted:
# Set environment variable:
REACT_APP_API_URL=https://your-railway-app.up.railway.app/api

# Redeploy with env var:
vercel --prod
```

### Step 4: Update Backend CORS (2 minutes)

Update `backend/server.js` CORS to include your Vercel URL:

```javascript
const corsOptions = {
  origin: ['http://localhost:3000', 'https://your-app.vercel.app'],
  credentials: true,
  optionsSuccessStatus: 200
};
```

Redeploy backend: `railway up`

---

## 🔥 Fastest Option: Use Our Deploy Script

I can create an automated deployment script for you. Just tell me which platform you prefer:

1. **Railway + Vercel** (Recommended)
2. **Render.com** (All-in-one)
3. **DigitalOcean**
4. **Manual setup**

---

## 💡 For Now: Access Locally from Network

To access your local server from other devices on same WiFi:

```bash
# 1. Get your PC's IP address
ipconfig
# Look for IPv4 Address (e.g., 192.168.1.100)

# 2. Update frontend/.env
REACT_APP_API_URL=http://192.168.1.100:5000/api

# 3. Update backend/server.js CORS
origin: true  # Allow all origins

# 4. Access from phone/tablet:
http://192.168.1.100:3000
```

---

## 🎊 Ready to Deploy?

**Your app is now working locally with increased rate limits!**

**Try logging in now:**
- Customer: customer@test.com / password123
- Admin: admin@flexicash.co.za / admin123

**Want to deploy to production?** Choose an option above and let me know - I'll guide you through it! 🚀

---

**Current Status:** ✅ Running locally with no rate limit issues
**Next Step:** Choose deployment platform or test the app locally first
