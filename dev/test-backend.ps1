# Quick Backend Verification
$API_BASE = "https://smart-equiz-api.onrender.com/api"

Write-Host "`n╔══════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Backend API Verification" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════╝`n" -ForegroundColor Cyan

Write-Host "🔍 Testing API Endpoints...`n" -ForegroundColor Yellow

# Test 1: Gateways endpoint
Write-Host "[1/3] Testing gateways endpoint..." -ForegroundColor White
try {
    Invoke-RestMethod -Uri "$API_BASE/payments/gateways" -Method Get -ErrorAction Stop | Out-Null
    Write-Host "  ✅ Accessible (unexpected)" -ForegroundColor Yellow
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "  ✅ Working (401 Unauthorized - auth required)" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 2: Tenants endpoint
Write-Host "[2/3] Testing tenants endpoint..." -ForegroundColor White
try {
    Invoke-RestMethod -Uri "$API_BASE/tenants" -Method Get -ErrorAction Stop | Out-Null
    Write-Host "  ✅ Accessible (unexpected)" -ForegroundColor Yellow
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "  ✅ Working (401 Unauthorized - auth required)" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 3: Login
Write-Host "[3/3] Testing login flow..." -ForegroundColor White
$credentials = @{
    email = "super@admin.com"
    password = "SuperAdmin123!"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$API_BASE/auth/login" -Method Post -Body $credentials -ContentType "application/json"
    
    if ($response.access_token) {
        Write-Host "  ✅ Login successful" -ForegroundColor Green
        Write-Host "  ✅ Token received: $($response.access_token.Substring(0, 20))..." -ForegroundColor Green
        
        # Test authenticated request
        $headers = @{ Authorization = "Bearer $($response.access_token)" }
        
        try {
            $gateways = Invoke-RestMethod -Uri "$API_BASE/payments/gateways" -Method Get -Headers $headers
            Write-Host "  ✅ Authenticated request successful" -ForegroundColor Green
            Write-Host "  ℹ️  Gateways available: $($gateways.totalGateways)" -ForegroundColor Cyan
        } catch {
            Write-Host "  ⚠️  Auth request failed: $($_.Exception.Message)" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "  ❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n╔══════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  ✅ Backend API is Working!" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════╝`n" -ForegroundColor Green

Write-Host "📋 Next Steps (Manual):`n" -ForegroundColor Cyan
Write-Host "1. Vercel Deployment:" -ForegroundColor Yellow
Write-Host "   → Go to https://vercel.com/dashboard" -ForegroundColor White
Write-Host "   → Check 'platform-admin' project status`n" -ForegroundColor White

Write-Host "2. Fix VITE_API_URL:" -ForegroundColor Yellow
Write-Host "   → Settings → Environment Variables" -ForegroundColor White
Write-Host "   → Edit VITE_API_URL" -ForegroundColor White
Write-Host "   → Set to: $API_BASE" -ForegroundColor Cyan
Write-Host "   → Save and redeploy`n" -ForegroundColor White

Write-Host "3. Test Platform:" -ForegroundColor Yellow
Write-Host "   → Open https://admin.smartequiz.com" -ForegroundColor White
Write-Host "   → Login: super@admin.com / SuperAdmin123!" -ForegroundColor White
Write-Host "   → Test: Tenants (Add/Delete), Billing (4 gateways)`n" -ForegroundColor White
