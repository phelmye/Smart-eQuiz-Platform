# Deploy Marketing Site to Vercel
# Run this after completing 'vercel login'

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "   Deploying Marketing Site to Vercel" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to marketing site
Set-Location -Path "C:\Projects\Dev\Smart eQuiz Platform\apps\marketing-site"

Write-Host "Current directory: $PWD" -ForegroundColor Yellow
Write-Host ""

# Check if .env.local exists
if (!(Test-Path ".env.local")) {
    Write-Host "Creating .env.local..." -ForegroundColor Yellow
    @"
NEXT_PUBLIC_API_URL=https://smart-equiz-api.onrender.com/api
"@ | Out-File -FilePath ".env.local" -Encoding UTF8
    Write-Host "✓ .env.local created" -ForegroundColor Green
}

Write-Host ""
Write-Host "Starting Vercel deployment..." -ForegroundColor Yellow
Write-Host ""
Write-Host "📝 When prompted:" -ForegroundColor Cyan
Write-Host "   - Set up and deploy? → Y" -ForegroundColor White
Write-Host "   - Which scope? → Select your account" -ForegroundColor White
Write-Host "   - Link to existing project? → N" -ForegroundColor White
Write-Host "   - Project name? → smart-equiz-marketing" -ForegroundColor White
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
Write-Host "🎉 Marketing site deployed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Visit the production URL shown above" -ForegroundColor White
Write-Host "2. Verify homepage, features, pricing pages load" -ForegroundColor White
Write-Host "3. Check that logo displays correctly" -ForegroundColor White
Write-Host "4. Run: .\deploy-platform-admin.ps1" -ForegroundColor White
Write-Host ""
