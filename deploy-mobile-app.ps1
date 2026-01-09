# Quick Deployment Script for FlexiCash Mobile App

Write-Host "🚀 FlexiCash SA - Mobile App Deployment" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Check if running in correct directory
if (-not (Test-Path "frontend") -or -not (Test-Path "backend")) {
    Write-Host "❌ Error: Please run this script from the 'Cash Loan App' directory" -ForegroundColor Red
    exit 1
}

Write-Host "📦 Step 1: Building Frontend..." -ForegroundColor Yellow
Set-Location frontend
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Frontend built successfully!" -ForegroundColor Green
Write-Host "`n📁 Build folder created at: frontend/build" -ForegroundColor Cyan

Write-Host "`n🎯 Next Steps:" -ForegroundColor Yellow
Write-Host "===============" -ForegroundColor Yellow
Write-Host ""
Write-Host "1️⃣  Deploy Frontend (Choose one):" -ForegroundColor White
Write-Host "   • Vercel: npm install -g vercel && vercel deploy --prod" -ForegroundColor Gray
Write-Host "   • Netlify: Upload 'frontend/build' folder to netlify.com" -ForegroundColor Gray
Write-Host "   • cPanel: Upload 'frontend/build' contents to public_html" -ForegroundColor Gray
Write-Host ""
Write-Host "2️⃣  Deploy Backend:" -ForegroundColor White
Write-Host "   • Update MONGODB_URI in backend .env" -ForegroundColor Gray
Write-Host "   • Deploy to Heroku, Railway, or Render" -ForegroundColor Gray
Write-Host ""
Write-Host "3️⃣  Update API URL in production:" -ForegroundColor White
Write-Host "   • Edit frontend/src/api.js" -ForegroundColor Gray
Write-Host "   • Change baseURL to your backend URL" -ForegroundColor Gray
Write-Host ""
Write-Host "4️⃣  Test Mobile Installation:" -ForegroundColor White
Write-Host "   • Open your website on mobile" -ForegroundColor Gray
Write-Host "   • Tap 'Install App' when prompted" -ForegroundColor Gray
Write-Host ""
Write-Host "📱 Your app is ready for mobile users!" -ForegroundColor Green
Write-Host "📖 See MOBILE_APP_GUIDE.md for detailed instructions" -ForegroundColor Cyan

Set-Location ..
