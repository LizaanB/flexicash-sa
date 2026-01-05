# FlexiCash SA - Quick Deployment Guide

## Step 1: MongoDB Atlas (Database) - 5 minutes

1. **Create Account:**
   - Go to: https://www.mongodb.com/cloud/atlas/register
   - Sign up with Google or email

2. **Create Free Cluster:**
   - Choose FREE tier (M0)
   - Provider: AWS
   - Region: Choose closest to you
   - Click "Create Deployment"

3. **Setup Security:**
   - Username: `flexicash-admin`
   - Password: Click "Autogenerate Secure Password" - **SAVE THIS PASSWORD!**
   - Click "Create Database User"

4. **Network Access:**
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"

5. **Get Connection String:**
   - Click "Connect"
   - Choose "Drivers"
   - Copy the connection string (looks like: `mongodb+srv://flexicash-admin:<password>@cluster0...`)
   - Replace `<password>` with your actual password
   - Replace `<dbname>` with `flexicash`

**Your connection string should look like:**
```
mongodb+srv://flexicash-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/flexicash?retryWrites=true&w=majority
```

---

## Step 2: Deploy Backend to Railway.app - 10 minutes

1. **Create Railway Account:**
   - Go to: https://railway.app
   - Sign up with GitHub

2. **Create New Project:**
   - Click "New Project"
   - Choose "Deploy from GitHub repo"
   - Connect your GitHub account if needed
   - Search for your repository
   - Select "Cash Loan App" repo

3. **Configure Backend:**
   - Railway will detect Node.js
   - Click on the service
   - Go to "Settings" tab
   - Set Root Directory: `backend`
   - Set Start Command: `npm start`

4. **Add Environment Variables:**
   - Go to "Variables" tab
   - Click "New Variable" and add each:
   ```
   PORT=5000
   MONGODB_URI=mongodb+srv://flexicash-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/flexicash?retryWrites=true&w=majority
   JWT_SECRET=FlexiCash2026$SecureKey#RandomString!P@ssw0rd_Change_This_In_Production_987654321
   NODE_ENV=production
   CLIENT_URL=https://your-app.vercel.app
   ```
   
5. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete
   - Copy your backend URL (e.g., `https://cash-loan-app-production.up.railway.app`)

---

## Step 3: Deploy Frontend to Vercel - 5 minutes

1. **Create Vercel Account:**
   - Go to: https://vercel.com/signup
   - Sign up with GitHub

2. **Import Project:**
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Choose "Cash Loan App"

3. **Configure Build:**
   - Framework Preset: Create React App (auto-detected)
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `build`

4. **Add Environment Variable:**
   - Click "Environment Variables"
   - Add: `REACT_APP_API_URL` = `https://your-backend-url.railway.app/api`
   - (Use the Railway URL from Step 2)

5. **Deploy:**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your app will be live at: `https://your-app.vercel.app`

---

## Step 4: Update Backend CORS

1. **Go back to Railway:**
   - Update `CLIENT_URL` variable
   - Set it to your Vercel URL: `https://your-app.vercel.app`
   - Redeploy if needed

---

## Step 5: Create Admin Account

1. **Go to MongoDB Atlas:**
   - Click "Database" → "Browse Collections"
   - Select `flexicash` database → `users` collection
   - Register a user first through your app
   - Find the user document
   - Click "Edit"
   - Change `"role": "customer"` to `"role": "admin"`
   - Click "Update"

---

## Step 6: Test Your Live App! 🎉

Visit your Vercel URL and test:
- ✅ User registration
- ✅ User login
- ✅ Loan application with file upload
- ✅ Admin approval/rejection
- ✅ Payment processing

---

## Troubleshooting

**Backend won't start?**
- Check Railway logs for errors
- Verify MongoDB connection string is correct
- Ensure all environment variables are set

**Frontend can't connect?**
- Check `REACT_APP_API_URL` in Vercel
- Make sure it ends with `/api`
- Verify CORS is configured in backend

**Files not uploading?**
- Railway has limited storage
- For production, consider upgrading or using AWS S3

---

## Costs

- **MongoDB Atlas:** FREE (512MB storage)
- **Railway:** FREE ($5/month credit, then pay-as-you-go)
- **Vercel:** FREE (100GB bandwidth/month)

**Total: FREE for small business use!**

---

## Next Steps After Deployment

1. Purchase custom domain (optional)
2. Set up email notifications
3. Add SMS reminders
4. Regular database backups
5. Monitor usage and scale as needed

Your FlexiCash SA is now live! 🚀
