# Update Frontend with Production Backend URL
# Run this after deploying your backend

param(
    [Parameter(Mandatory=$true)]
    [string]$BackendUrl
)

Write-Host "🚀 Updating FlexiCash Mobile App with Production Backend..." -ForegroundColor Cyan
Write-Host ""

# Remove trailing slash if present
$BackendUrl = $BackendUrl.TrimEnd('/')

Write-Host "Backend URL: $BackendUrl" -ForegroundColor Yellow
Write-Host ""

# Update api.js
$apiFile = "frontend\src\api.js"
$apiContent = Get-Content $apiFile -Raw

# Update the API URL line
$updatedContent = $apiContent -replace "const API_URL = process\.env\.REACT_APP_API_URL \|\| '.*?';", "const API_URL = process.env.REACT_APP_API_URL || '$BackendUrl/api';"

Set-Content -Path $apiFile -Value $updatedContent

Write-Host "✅ Updated $apiFile" -ForegroundColor Green
Write-Host ""

# Update backend CORS to include capacitor
Write-Host "📝 Updating backend CORS settings..." -ForegroundColor Cyan

$serverFile = "backend\server.js"
$serverContent = Get-Content $serverFile -Raw

# Check if capacitor://localhost is already in CORS
if ($serverContent -notmatch "capacitor://localhost") {
    Write-Host "⚠️  Please manually add 'capacitor://localhost' to CORS origins in backend/server.js" -ForegroundColor Yellow
} else {
    Write-Host "✅ CORS already configured for mobile app" -ForegroundColor Green
}

Write-Host ""
Write-Host "🔨 Building mobile app..." -ForegroundColor Cyan
Set-Location frontend

npm run build

Write-Host ""
Write-Host "📱 Syncing with Capacitor..." -ForegroundColor Cyan
npx cap sync android

Write-Host ""
Write-Host "✅ Done! Next steps:" -ForegroundColor Green
Write-Host "1. Run: npx cap open android" -ForegroundColor White
Write-Host "2. In Android Studio, click 'Run' to test on your phone" -ForegroundColor White
Write-Host "3. Test login with your credentials" -ForegroundColor White
Write-Host ""
Write-Host "📦 To build APK: Build → Generate Signed Bundle / APK" -ForegroundColor Yellow
