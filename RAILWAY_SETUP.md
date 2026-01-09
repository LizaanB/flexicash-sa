# Railway Backend Deployment - Quick Start

## 🚂 Step-by-Step Railway Setup

### 1. Sign Up & Connect GitHub
1. Go to: https://railway.app/
2. Click "Login" → "Login with GitHub"
3. Authorize Railway to access your GitHub account

### 2. Create New Project
1. Click "New Project" (purple button)
2. Select "Deploy from GitHub repo"
3. Search and select: **flexicash-sa**
4. Railway will auto-detect Node.js and start building

### 3. Configure Root Directory (IMPORTANT!)
1. Click on your service (the card that appears)
2. Go to **Settings** tab
3. Scroll to "Root Directory"
4. Enter: `backend`
5. Click "Update" - This tells Railway to run from the backend folder!

### 4. Add Environment Variables
1. Click on **Variables** tab
2. Click "Add Variable" for each one below
3. Copy these EXACT variables:

```env
NODE_ENV=production
PORT=5000
JWT_SECRET=FlexiCash_SA_Super_Secret_JWT_Key_2026_Production_xyz789!@#
EMAIL_USER=noreply@flexicash.co.za
EMAIL_PASS=temp_password_update_later
```

### 5. Add MongoDB Connection String
⚠️ **IMPORTANT**: You need your MongoDB Atlas connection string from Step 1

Click "Add Variable":
- **Name**: `MONGODB_URI`
- **Value**: Your connection string from MongoDB Atlas

It should look like:
```
mongodb+srv://flexicash_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/cash-loan-app?retryWrites=true&w=majority
```

**If you don't have it yet:**
1. Go back to MongoDB Atlas → Database → Connect
2. Copy connection string
3. Replace `<password>` with your actual database password
4. Make sure it includes `/cash-loan-app` before the `?`

### 6. Deploy & Get URL
1. After adding all variables, Railway auto-redeploys
2. Wait 2-3 minutes (watch the deployment logs)
3. Look for: ✅ "Build succeeded" and "Deployment successful"
4. Click on **Settings** tab
5. Scroll to "Domains" section
6. You'll see a URL like: `flexicash-sa-production.up.railway.app`
7. Click "Generate Domain" if not already generated
8. **COPY THIS URL** - you'll need it for Vercel!

### 7. Test Your Backend
Visit in browser:
```
https://your-railway-url.up.railway.app/api/health
```

Should return:
```json
{"success":true,"message":"Server is running"}
```

If you see this, your backend is LIVE! 🎉

---

## 🔍 Troubleshooting

**"Application failed to respond":**
- Check Variables tab has all 5 environment variables
- Verify Root Directory is set to `backend`
- Click Deployments → View logs for errors

**"Database connection failed":**
- Check MONGODB_URI is correct
- Verify MongoDB Atlas Network Access allows 0.0.0.0/0
- Make sure connection string has database name

**"Build failed":**
- Check deploy logs for npm install errors
- Verify package.json exists in backend folder

---

## 📋 Quick Checklist

- [ ] Signed up on Railway with GitHub
- [ ] Created new project from flexicash-sa repo
- [ ] Set Root Directory to `backend`
- [ ] Added NODE_ENV=production
- [ ] Added PORT=5000
- [ ] Added JWT_SECRET
- [ ] Added MONGODB_URI (from Atlas)
- [ ] Added EMAIL_USER and EMAIL_PASS
- [ ] Generated domain
- [ ] Tested /api/health endpoint
- [ ] Copied Railway URL for Vercel setup

---

## ⏭️ Next Step

Once backend is live and `/api/health` works:
→ Continue to **Step 3: Deploy Frontend to Vercel**

You'll need your Railway URL for the next step!
