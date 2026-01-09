# Cloud Deployment Guide - FlexiCash Backend

## Step 1: Set Up MongoDB Atlas (Free Database)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up for a free account
3. Create a new cluster (select FREE M0 tier)
4. Wait 5-10 minutes for cluster to be created
5. Click "Connect" → "Connect your application"
6. Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)
7. Replace `<password>` with your actual password
8. Add `/cash-loan-app` at the end: `mongodb+srv://username:password@cluster.mongodb.net/cash-loan-app`

**Important:** In Network Access, add `0.0.0.0/0` to allow connections from anywhere

## Step 2: Deploy Backend to Railway (Free)

### Option A: Using Railway CLI (Faster)

1. **Install Railway CLI:**
   ```powershell
   npm install -g @railway/cli
   ```

2. **Login to Railway:**
   ```powershell
   cd backend
   railway login
   ```

3. **Initialize and deploy:**
   ```powershell
   railway init
   railway up
   ```

4. **Set environment variables:**
   ```powershell
   railway variables set MONGODB_URI="your_mongodb_atlas_connection_string"
   railway variables set JWT_SECRET="FlexiCash2026$SecureKey#RandomString!P@ssw0rd_Change_This_In_Production_987654321"
   railway variables set NODE_ENV="production"
   railway variables set PORT="5000"
   ```

5. **Get your backend URL:**
   ```powershell
   railway status
   ```
   Look for the domain (e.g., `https://your-app.up.railway.app`)

### Option B: Using Railway Web Interface

1. Go to [Railway](https://railway.app/)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository (or use "Empty Project" and deploy manually)
5. Add environment variables in the "Variables" tab:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: FlexiCash2026$SecureKey#RandomString!P@ssw0rd_Change_This_In_Production_987654321
   - `NODE_ENV`: production
   - `PORT`: 5000
6. Railway will automatically detect Node.js and deploy
7. Copy your deployment URL from the "Deployments" tab

## Step 3: Alternative - Deploy to Render (Free)

1. Go to [Render](https://render.com/)
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Connect your repository or select "Public Git repository"
5. Configure:
   - **Name:** flexicash-backend
   - **Root Directory:** backend
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free
6. Add environment variables (same as above)
7. Click "Create Web Service"
8. Copy your deployment URL (e.g., `https://flexicash-backend.onrender.com`)

## Step 4: Update Frontend API URL

Once you have your backend URL, update the frontend:

1. Open `frontend/src/api.js`
2. Change line 3 to:
   ```javascript
   const API_URL = process.env.REACT_APP_API_URL || 'https://YOUR_BACKEND_URL/api';
   ```
   Replace `YOUR_BACKEND_URL` with your Railway/Render URL

3. Update CORS in `backend/server.js` to include your production URL

## Step 5: Rebuild Mobile App

```powershell
cd frontend
npm run build
npx cap sync android
npx cap open android
```

In Android Studio, click "Build" → "Generate Signed Bundle / APK" for production.

## Troubleshooting

- **502 Bad Gateway:** Backend is starting up, wait 30 seconds
- **CORS errors:** Make sure CORS includes `capacitor://localhost`
- **Database connection failed:** Check MongoDB Atlas Network Access (add 0.0.0.0/0)
- **502 after deploy:** Check Railway/Render logs for errors

## Free Tier Limitations

- **Railway:** 500 hours/month (enough for testing), sleeps after inactivity
- **Render:** Always on but may be slower on free tier
- **MongoDB Atlas:** 512MB storage (enough for ~5000 loans)
