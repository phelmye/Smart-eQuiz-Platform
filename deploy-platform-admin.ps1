# Deploy Platform Admin to Vercel
# Run after marketing site deployment

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Deploying Platform Admin to Vercel" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to platform admin
Set-Location -Path "C:\Projects\Dev\Smart eQuiz Platform\apps\platform-admin"

Write-Host "Current directory: $PWD" -ForegroundColor Yellow
Write-Host ""

# Check if .env exists
if (!(Test-Path ".env")) {
    Write-Host "Creating .env..." -ForegroundColor Yellow
    @"
VITE_API_URL=https://smart-equiz-api.onrender.com/api
"@ | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "✓ .env created" -ForegroundColor Green
}

Write-Host ""
Write-Host "Starting Vercel deployment..." -ForegroundColor Yellow
Write-Host ""
Write-Host "📝 When prompted:" -ForegroundColor Cyan
Write-Host "   - Set up and deploy? → Y" -ForegroundColor White
Write-Host "   - Which scope? → Select your account" -ForegroundColor White
Write-Host "   - Link to existing project? → N" -ForegroundColor White
Write-Host "   - Project name? → smart-equiz-platform-admin" -ForegroundColor White
Write-Host "   - Directory? → ./" -ForegroundColor White
Write-Host "   - Modify settings? → N" -ForegroundColor White
Write-Host ""

# Deploy
vercel --prod

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   Deployment Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "🎉 Platform Admin deployed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Visit the production URL shown above" -ForegroundColor White
Write-Host "2. Test login functionality" -ForegroundColor White
Write-Host "3. Run: .\deploy-tenant-app.ps1" -ForegroundColor White
Write-Host ""
