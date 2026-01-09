# Production Deployment Guide - Step by Step

## 🚀 Deploy FlexiCash SA to Production

Follow these steps carefully:

---

## Step 1: Setup MongoDB Atlas (5 minutes) ✅

### 1.1 Create Account
1. Go to: https://www.mongodb.com/cloud/atlas
2. Click "Try Free"
3. Sign up with Google or email
4. Choose **FREE M0 tier**

### 1.2 Create Cluster
1. Select **AWS** provider
2. Choose closest region (e.g., Cape Town for South Africa)
3. Cluster name: `flexicash`
4. Click "Create Cluster" (takes 3-5 minutes)

### 1.3 Create Database User
1. Click "Database Access" (left sidebar)
2. Click "Add New Database User"
3. Username: `flexicash_admin`
4. Password: Generate a strong password (SAVE IT!)
5. User Privileges: "Atlas admin"
6. Click "Add User"

### 1.4 Allow Network Access
1. Click "Network Access" (left sidebar)
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
4. Confirm

### 1.5 Get Connection String
1. Click "Database" (left sidebar)
2. Click "Connect" on your cluster
3. Select "Connect your application"
4. Copy the connection string:
   ```
   mongodb+srv://flexicash_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your actual password
6. **SAVE THIS STRING - You'll need it!**

---

## Step 2: Deploy Backend to Railway (10 minutes) 🚂

### 2.1 Create Railway Account
1. Go to: https://railway.app
2. Click "Start a New Project"
3. Sign up with GitHub (recommended)
4. Authorize Railway

### 2.2 Deploy Backend

**Option A: Using Railway Dashboard (Easier)**

1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Connect your GitHub account
4. Select your `Cash Loan App` repository
5. Railway will detect it's a Node.js app
6. Click "Add variables" and add these:

```
MONGODB_URI=mongodb+srv://flexicash_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/flexicash?retryWrites=true&w=majority
JWT_SECRET=FlexiCash2026$Production$SecureKey#RandomString!P@ssw0rd_Change_This_987654321
NODE_ENV=production
PORT=5000
CLIENT_URL=https://your-frontend-url.vercel.app
```

7. Click "Deploy"
8. Wait 2-3 minutes
9. Click "Settings" → "Networking" → "Generate Domain"
10. **COPY YOUR URL** (e.g., `https://flexicash-production-xxxx.up.railway.app`)

**Option B: Using Railway CLI**

```powershell
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Go to backend folder
cd "C:\Cash Loan App\backend"

# Initialize project
railway init

# Link to Railway project
railway link

# Add environment variables
railway variables set MONGODB_URI="your-mongodb-uri"
railway variables set JWT_SECRET="your-secret"
railway variables set NODE_ENV="production"
railway variables set PORT="5000"

# Deploy
railway up

# Get your URL
railway domain
```

---

## Step 3: Deploy Frontend to Vercel (5 minutes) ⚡

### 3.1 Create Vercel Account
1. Go to: https://vercel.com
2. Click "Sign Up"
3. Sign up with GitHub
4. Authorize Vercel

### 3.2 Deploy Frontend

**Option A: Using Vercel Dashboard (Easier)**

1. Click "Add New..." → "Project"
2. Import your Git repository
3. Select `frontend` folder as root directory
4. Framework Preset: "Create React App"
5. Add environment variable:
   - Name: `REACT_APP_API_URL`
   - Value: `https://your-railway-backend-url.up.railway.app/api`
6. Click "Deploy"
7. Wait 2-3 minutes
8. **COPY YOUR URL** (e.g., `https://flexicash.vercel.app`)

**Option B: Using Vercel CLI**

```powershell
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Go to frontend folder
cd "C:\Cash Loan App\frontend"

# Deploy
vercel

# Follow prompts:
# - Link to existing project? No
# - What's your project's name? flexicash
# - In which directory is your code? ./
# - Want to override settings? Yes
# - Build command: npm run build
# - Output directory: build
# - Set environment variable? Yes
# - REACT_APP_API_URL = https://your-railway-url.up.railway.app/api

# Deploy to production
vercel --prod
```

---

## Step 4: Update Backend CORS (2 minutes) 🔧

Now update your backend to allow requests from Vercel:

1. Open `backend/server.js`
2. Update CORS configuration:

```javascript
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://flexicash.vercel.app',  // Your Vercel URL
    'https://flexicash-git-main.vercel.app',  // Vercel preview
    'https://*.vercel.app'  // All Vercel deployments
  ],
  credentials: true,
  optionsSuccessStatus: 200
};
```

3. Commit and push changes:

```powershell
cd "C:\Cash Loan App"
git add .
git commit -m "Update CORS for production"
git push
```

4. Railway will auto-deploy the changes

---

## Step 5: Create Admin User in Production (2 minutes) 👤

SSH into Railway or use their console:

1. In Railway dashboard, click your project
2. Click "Settings" → "Variables"
3. Copy your MONGODB_URI
4. Run this script locally but pointing to production DB:

```powershell
# Create a temp script
cd "C:\Cash Loan App\backend"

# Update .env temporarily to use production MongoDB
# Or run with environment variable:
$env:MONGODB_URI="your-production-mongodb-uri"
node create-admin.js
```

---

## Step 6: Test Your Production App! 🎉

### 6.1 Test Backend
Visit: `https://your-railway-url.up.railway.app/api/health`

Should return:
```json
{"success":true,"message":"Server is running"}
```

### 6.2 Test Frontend
Visit: `https://your-vercel-url.vercel.app`

Should show your login page!

### 6.3 Test Login
- Login with: admin@flexicash.co.za / admin123
- Create test customer account
- Apply for loan!

---

## 🎊 You're Live!

Your app is now accessible from:
- **Frontend:** https://your-app.vercel.app
- **Backend:** https://your-app.up.railway.app
- **Access from:** Any device, anywhere in the world!

---

## 📱 Optional: Custom Domain

### Add Your Own Domain (e.g., flexicash.co.za)

**For Vercel (Frontend):**
1. Buy domain from Namecheap/GoDaddy
2. In Vercel dashboard → Settings → Domains
3. Add your domain
4. Update DNS records as instructed

**For Railway (Backend):**
1. In Railway → Settings → Networking
2. Add custom domain
3. Update DNS records

---

## 💰 Costs

- **MongoDB Atlas:** FREE (M0 tier, 512MB)
- **Railway:** FREE ($5 credit/month, usually enough)
- **Vercel:** FREE (hobby tier, unlimited bandwidth)

**Total: $0/month for starting out!**

When you grow:
- Railway: $5/month for more resources
- Vercel: Free forever for personal use
- MongoDB: Upgrade when you exceed 512MB

---

## 🔄 Auto-Deployment

Both platforms auto-deploy when you push to GitHub:

```powershell
# Make changes
cd "C:\Cash Loan App"
git add .
git commit -m "Your changes"
git push

# Railway and Vercel automatically deploy!
```

---

## 🆘 Troubleshooting

**Backend not connecting to MongoDB?**
- Check connection string has correct password
- Ensure IP whitelist includes 0.0.0.0/0
- Check Railway logs for errors

**Frontend can't reach backend?**
- Verify REACT_APP_API_URL is correct
- Check CORS settings in backend
- Test backend health endpoint

**Rate limiting issues?**
- Already fixed in development
- Production uses same settings (100 attempts/15min)

---

## 📞 Support

Need help? Check:
- Railway docs: https://docs.railway.app
- Vercel docs: https://vercel.com/docs
- MongoDB Atlas docs: https://docs.atlas.mongodb.com

---

**Ready to deploy? Let's start with Step 1!** 🚀
