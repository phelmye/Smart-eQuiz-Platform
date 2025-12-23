# Deploy Tenant App to Vercel
# Run after platform admin deployment

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "   Deploying Tenant App to Vercel" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to tenant app
Set-Location -Path "C:\Projects\Dev\Smart eQuiz Platform\apps\tenant-app"

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
Write-Host "   - Project name? → smart-equiz-tenant-app" -ForegroundColor White
Write-Host "   - Directory? → ./" -ForegroundColor White
Write-Host "   - Modify settings? → N" -ForegroundColor White
Write-Host ""

# Deploy
vercel --prod

Write-Host ""
Write-Host "======================================" -ForegroundColor Green
Write-Host "   Deployment Complete!" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host ""
Write-Host "🎉 Tenant App deployed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 All deployments complete:" -ForegroundColor Cyan
Write-Host "✓ Backend API: https://smart-equiz-api.onrender.com" -ForegroundColor Green
Write-Host "✓ Marketing Site: [URL shown above]" -ForegroundColor Green
Write-Host "✓ Platform Admin: [URL shown above]" -ForegroundColor Green
Write-Host "✓ Tenant App: [URL shown above]" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Optional next steps:" -ForegroundColor Cyan
Write-Host "1. Configure custom domains in Vercel dashboard" -ForegroundColor White
Write-Host "2. Enable Vercel Analytics" -ForegroundColor White
Write-Host "3. Set up monitoring and alerts" -ForegroundColor White
Write-Host "4. Test all production URLs" -ForegroundColor White
Write-Host ""
