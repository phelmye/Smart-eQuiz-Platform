# Frontend Verification Script
# Run this after Vercel deployment completes

param(
    [string]$FrontendUrl = "https://admin.smartequiz.com"
)

Write-Host "`n╔══════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     Frontend Deployment Verification" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

Write-Host "Testing: $FrontendUrl`n" -ForegroundColor White

# Test 1: Check if frontend is accessible
Write-Host "[1/4] Testing frontend accessibility..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri $FrontendUrl -Method Get -ErrorAction Stop
    Write-Host "  ✅ Frontend is accessible (Status: $($response.StatusCode))" -ForegroundColor Green
    $frontendUp = $true
} catch {
    Write-Host "  ❌ Frontend not accessible: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "  ⚠️  Check Vercel deployment status" -ForegroundColor Yellow
    $frontendUp = $false
}

# Test 2: Check if backend API is accessible
Write-Host "`n[2/4] Testing backend API..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://smart-equiz-api.onrender.com/api/payments/gateways" -Method Get -ErrorAction SilentlyContinue
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "  ✅ Backend API is working (401 auth required = correct)" -ForegroundColor Green
        $backendUp = $true
    } else {
        Write-Host "  ❌ Backend API error: $($_.Exception.Message)" -ForegroundColor Red
        $backendUp = $false
    }
}

# Test 3: Check if frontend can reach backend (needs browser test)
Write-Host "`n[3/4] Checking frontend-backend connectivity..." -ForegroundColor Yellow
Write-Host "  ⚠️  This requires browser testing" -ForegroundColor Yellow
Write-Host "  → Open: $FrontendUrl" -ForegroundColor Gray
Write-Host "  → Press F12 → Console tab" -ForegroundColor Gray
Write-Host "  → Look for API calls to: https://smart-equiz-api.onrender.com/api" -ForegroundColor Gray

# Test 4: Instructions for manual verification
Write-Host "`n[4/4] Manual verification checklist:" -ForegroundColor Yellow
Write-Host "  □ Login works (super@admin.com / SuperAdmin123!)" -ForegroundColor White
Write-Host "  □ Dashboard loads without errors" -ForegroundColor White
Write-Host "  □ Navigate to Billing page" -ForegroundColor White
Write-Host "  □ See 4 gateway cards (Stripe, PayPal, Payoneer, WorldFirst)" -ForegroundColor White
Write-Host "  □ Filters and CSV export button visible" -ForegroundColor White
Write-Host "  □ No 404 errors in browser console" -ForegroundColor White

# Summary
Write-Host "`n═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "DEPLOYMENT STATUS:" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════`n" -ForegroundColor Cyan

if ($frontendUp) {
    Write-Host "✅ Frontend: UP" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend: DOWN" -ForegroundColor Red
}

if ($backendUp) {
    Write-Host "✅ Backend: UP" -ForegroundColor Green
} else {
    Write-Host "❌ Backend: DOWN" -ForegroundColor Red
}

Write-Host "`nNEXT STEPS:" -ForegroundColor Yellow

if (-not $frontendUp) {
    Write-Host "1. Check Vercel deployment: https://vercel.com/dashboard" -ForegroundColor White
    Write-Host "   → Look for commit: 57d6344 or 1e34450" -ForegroundColor Gray
    Write-Host "   → Ensure build succeeded (0 errors)" -ForegroundColor Gray
}

Write-Host "2. Fix VITE_API_URL in Vercel:" -ForegroundColor White
Write-Host "   → Settings → Environment Variables" -ForegroundColor Gray
Write-Host "   → VITE_API_URL = https://smart-equiz-api.onrender.com/api" -ForegroundColor Gray
Write-Host "   → Save & Redeploy" -ForegroundColor Gray

Write-Host "3. Test login and Billing page in browser" -ForegroundColor White
Write-Host "   → URL: $FrontendUrl" -ForegroundColor Gray
Write-Host "   → Credentials in MANUAL_VERIFICATION_STEPS.md" -ForegroundColor Gray

Write-Host "`n📋 Full guide: MANUAL_VERIFICATION_STEPS.md`n" -ForegroundColor Cyan
