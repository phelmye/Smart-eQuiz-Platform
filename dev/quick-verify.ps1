# Quick Verification Script
# Run this after completing manual Vercel steps

param(
    [switch]$CheckBackend,
    [switch]$TestLogin,
    [switch]$All
)

$API_BASE = "https://smart-equiz-api.onrender.com/api"
$ADMIN_URL = "https://admin.smartequiz.com"

Write-Host "`n╔════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Smart eQuiz Platform - Verification Helper   ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

if ($CheckBackend -or $All) {
    Write-Host "🔍 Checking Backend API..." -ForegroundColor Yellow
    
    try {
        # Test health endpoint
        $health = Invoke-RestMethod -Uri "$API_BASE/health" -Method Get -ErrorAction SilentlyContinue
        Write-Host "  ✅ Health: OK" -ForegroundColor Green
    } catch {
        Write-Host "  ℹ️  Health endpoint not found (this is ok)" -ForegroundColor Gray
    }
    
    try {
        # Test gateways endpoint (should return 401)
        Invoke-RestMethod -Uri "$API_BASE/payments/gateways" -Method Get -ErrorAction Stop
    } catch {
        if ($_.Exception.Response.StatusCode -eq 401) {
            Write-Host "  ✅ Gateways endpoint: Working (auth required)" -ForegroundColor Green
        } else {
            Write-Host "  ❌ Gateways endpoint: Error $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    try {
        # Test tenants endpoint (should return 401)
        Invoke-RestMethod -Uri "$API_BASE/tenants" -Method Get -ErrorAction Stop
    } catch {
        if ($_.Exception.Response.StatusCode -eq 401) {
            Write-Host "  ✅ Tenants endpoint: Working (auth required)" -ForegroundColor Green
        } else {
            Write-Host "  ❌ Tenants endpoint: Error $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    Write-Host ""
}

if ($TestLogin -or $All) {
    Write-Host "🔐 Testing Login Flow..." -ForegroundColor Yellow
    
    $credentials = @{
        email = "super@admin.com"
        password = "SuperAdmin123!"
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$API_BASE/auth/login" `
            -Method Post `
            -Body $credentials `
            -ContentType "application/json"
        
        if ($response.access_token) {
            Write-Host "  ✅ Login: Successful" -ForegroundColor Green
            Write-Host "  ✅ Token received: $($response.access_token.Substring(0, 20))..." -ForegroundColor Green
            
            # Test authenticated request
            $headers = @{
                Authorization = "Bearer $($response.access_token)"
            }
            
            try {
                $gateways = Invoke-RestMethod -Uri "$API_BASE/payments/gateways" `
                    -Method Get `
                    -Headers $headers
                
                Write-Host "  ✅ Authenticated request: Success" -ForegroundColor Green
                Write-Host "  ℹ️  Available gateways: $($gateways.totalGateways)" -ForegroundColor Gray
            } catch {
                Write-Host "  ⚠️  Authenticated request failed: $($_.Exception.Message)" -ForegroundColor Yellow
            }
        } else {
            Write-Host "  ❌ No access token received" -ForegroundColor Red
        }
    } catch {
        Write-Host "  ❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
}

Write-Host "📋 Manual Verification Checklist:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Backend (Render.com):" -ForegroundColor Yellow
if ($CheckBackend -or $All) {
    Write-Host "    ✅ API endpoints tested" -ForegroundColor Green
} else {
    Write-Host "    ⏳ Run with -CheckBackend flag" -ForegroundColor Gray
}

Write-Host ""
Write-Host "  Frontend (Vercel):" -ForegroundColor Yellow
Write-Host "    □ Go to https://vercel.com/dashboard" -ForegroundColor White
Write-Host "    □ Select 'platform-admin' project" -ForegroundColor White
Write-Host "    □ Check latest deployment status" -ForegroundColor White
Write-Host "    □ If successful, proceed to next step" -ForegroundColor White
Write-Host ""
Write-Host "  Environment Variables:" -ForegroundColor Yellow
Write-Host "    □ In Vercel → Settings → Environment Variables" -ForegroundColor White
Write-Host "    □ Find VITE_API_URL" -ForegroundColor White
Write-Host "    □ Change value to: $API_BASE" -ForegroundColor White
Write-Host "    □ Save and trigger redeploy" -ForegroundColor White
Write-Host ""
Write-Host "  Platform Testing:" -ForegroundColor Yellow
Write-Host "    □ Open $ADMIN_URL" -ForegroundColor White
Write-Host "    □ Login: super@admin.com / SuperAdmin123!" -ForegroundColor White
Write-Host "    □ Check Dashboard loads" -ForegroundColor White
Write-Host "    □ Navigate to Tenants → Try Add/Delete" -ForegroundColor White
Write-Host "    □ Navigate to Billing → Verify 4 gateways visible" -ForegroundColor White
Write-Host "    □ Check Users page works" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Run this script with flags:" -ForegroundColor Cyan
Write-Host "   .\dev\quick-verify.ps1 -CheckBackend   # Test API only" -ForegroundColor Gray
Write-Host "   .\dev\quick-verify.ps1 -TestLogin      # Test login only" -ForegroundColor Gray
Write-Host "   .\dev\quick-verify.ps1 -All            # Run all checks" -ForegroundColor Gray
Write-Host ""
