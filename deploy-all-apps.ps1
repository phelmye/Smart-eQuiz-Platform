# Deploy All Apps to Vercel - Sequential Deployment
# Requires: vercel login completed

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   Smart eQuiz Platform - Deploy All Apps" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check if logged in
Write-Host "Checking Vercel authentication..." -ForegroundColor Yellow
try {
    $whoami = vercel whoami 2>&1
    Write-Host "✓ Logged in as: $whoami" -ForegroundColor Green
} catch {
    Write-Host "✗ Not logged in to Vercel" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please run: vercel login" -ForegroundColor Yellow
    Write-Host "Then run this script again." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Step 1/3: Marketing Site" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
& "C:\Projects\Dev\Smart eQuiz Platform\deploy-marketing-site.ps1"

Write-Host ""
Write-Host "Press any key to deploy Platform Admin..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Step 2/3: Platform Admin" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
& "C:\Projects\Dev\Smart eQuiz Platform\deploy-platform-admin.ps1"

Write-Host ""
Write-Host "Press any key to deploy Tenant App..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Step 3/3: Tenant App" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
& "C:\Projects\Dev\Smart eQuiz Platform\deploy-tenant-app.ps1"

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "   🎉 ALL DEPLOYMENTS COMPLETE!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "✅ Summary:" -ForegroundColor Cyan
Write-Host "   Backend API: https://smart-equiz-api.onrender.com" -ForegroundColor White
Write-Host "   Marketing Site: Deployed to Vercel" -ForegroundColor White
Write-Host "   Platform Admin: Deployed to Vercel" -ForegroundColor White
Write-Host "   Tenant App: Deployed to Vercel" -ForegroundColor White
Write-Host ""
Write-Host "📋 Production URLs saved in Vercel dashboard:" -ForegroundColor Cyan
Write-Host "   https://vercel.com/dashboard" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Next actions:" -ForegroundColor Cyan
Write-Host "1. Visit each production URL and verify functionality" -ForegroundColor White
Write-Host "2. Configure custom domains (see DEPLOYMENT_STEPS.md)" -ForegroundColor White
Write-Host "3. Enable analytics and monitoring" -ForegroundColor White
Write-Host "4. Update DNS records for custom domains" -ForegroundColor White
Write-Host ""
