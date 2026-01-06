# 🔐 GitHub Authentication Setup

You need to authenticate with GitHub to push your code. Choose one option:

## Option 1: GitHub CLI (Recommended - Easiest)

1. Download and install: https://cli.github.com/
2. After installation, run:
```powershell
gh auth login
```
3. Follow prompts:
   - Choose: GitHub.com
   - Protocol: HTTPS
   - Authenticate: Login with web browser
4. Then push:
```powershell
cd "c:\Users\lizaa\OneDrive\Desktop\Cash Loan App"
git push origin main
```

## Option 2: Personal Access Token

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Name: "FlexiCash Deployment"
4. Expiration: 90 days
5. Scopes: Check "repo" (all options)
6. Click "Generate token"
7. **COPY THE TOKEN IMMEDIATELY** (you won't see it again!)

8. Update your git remote:
```powershell
cd "c:\Users\lizaa\OneDrive\Desktop\Cash Loan App"
git remote set-url origin https://YOUR_TOKEN@github.com/LizaanB/flexicash-sa.git
git push origin main
```

## Option 3: GitHub Desktop (Visual)

1. Download: https://desktop.github.com/
2. Install and sign in with GitHub
3. File → Add Local Repository
4. Select: `c:\Users\lizaa\OneDrive\Desktop\Cash Loan App`
5. Click "Publish repository" or "Push origin"

---

After authentication, continue with deployment!
