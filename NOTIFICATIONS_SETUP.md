# FlexiCash SA - Notification System Setup Guide

## 🔔 Notification Features

Your app now has 3 types of notifications:

### 1. **In-App Notifications** ✅ (Working Now!)
- Bell icon in navbar with unread count
- Dropdown with all notifications
- Real-time updates every 30 seconds
- Mark as read/delete functionality

### 2. **Email Notifications** 📧 (Setup Required)
Customers get emails for:
- Loan application received
- Loan approved
- Loan rejected
- Funds disbursed
- Payment reminders

### 3. **SMS Notifications** 📱 (Optional - Paid Service)
Coming soon - requires Twilio or similar service

---

## 📧 Email Setup (Gmail)

### Step 1: Create App Password

1. Go to: https://myaccount.google.com/apppasswords
2. Sign in with your Gmail account
3. Create App Password:
   - App: "FlexiCash SA"
   - Device: "Computer"
4. Click **Generate**
5. **Copy the 16-character password** (e.g., "abcd efgh ijkl mnop")

### Step 2: Update Environment Variables

**Local (.env file):**
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
```

**Railway (Production):**
1. Go to Railway → Your project → Variables
2. Add new variables:
   - `EMAIL_USER` = `your-email@gmail.com`
   - `EMAIL_PASSWORD` = `your app password`
3. Redeploy

### Step 3: Test
- Apply for a loan as customer
- Check your email inbox
- You should receive confirmation email!

---

## 🎯 Notification Triggers

### Customer Notifications:
1. **Loan Applied** - When customer submits application
2. **Loan Approved** - When admin approves loan
3. **Loan Rejected** - When admin rejects loan
4. **Funds Disbursed** - When admin marks as disbursed
5. **Payment Reminder** - Manual or automated

### Admin Notifications:
- New loan applications (coming in next update)

---

## 🚀 What's Working Now (Without Email Setup)

Even without email configured, you have:
- ✅ **In-app notification bell** in navbar
- ✅ **Unread count badge**
- ✅ **Notification dropdown**
- ✅ **Mark as read/delete**
- ✅ **Auto-refresh every 30 seconds**

---

## 📱 SMS Setup (Optional)

To add SMS notifications, you'll need:

### Option 1: Twilio (International)
- Cost: ~R0.80 per SMS
- Website: https://www.twilio.com
- Good for: International customers

### Option 2: Clickatell (South Africa)
- Cost: ~R0.25 per SMS
- Website: https://www.clickatell.com
- Good for: Local South African numbers

### Option 3: BulkSMS (South Africa)
- Cost: ~R0.20 per SMS
- Website: https://www.bulksms.com
- Good for: Bulk messaging

**Need SMS setup? Let me know and I'll add it!**

---

## 🔧 Customization

### Change Email Templates
Edit: `backend/utils/emailNotifications.js`

### Change Notification Messages
Edit: `backend/routes/loans.js` (notification creation sections)

### Change Notification Icons/Colors
Edit: `frontend/src/styles/Notifications.css`

---

## 📊 Current Notification Flow

```
Customer Action          → In-App Notification → Email (if configured)
─────────────────────────────────────────────────────────────────────
Apply for Loan          → ✅ Yes               → ✅ Yes
Loan Approved           → ✅ Yes               → ✅ Yes
Loan Rejected           → ✅ Yes               → ✅ Yes
Funds Disbursed         → ✅ Yes               → ✅ Yes
Payment Made            → ⏳ Coming Soon       → ⏳ Coming Soon
```

---

## 💡 Tips

1. **Test locally first** before deploying email setup
2. **Use a dedicated email** for FlexiCash (not personal)
3. **Check spam folder** if emails don't arrive
4. **SMS is optional** - in-app + email is usually enough

---

## 🆘 Troubleshooting

**In-app notifications not showing?**
- Check browser console for errors
- Refresh the page
- Make sure you're logged in

**Emails not sending?**
- Verify EMAIL_USER and EMAIL_PASSWORD are correct
- Check Gmail app password is active
- Look at Railway logs for errors

**Want to disable emails temporarily?**
- Remove EMAIL_USER and EMAIL_PASSWORD variables
- In-app notifications will still work!

---

**Your notification system is ready! 🎉**

Customers will see the bell icon and get notifications as you manage their loans.
