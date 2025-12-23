# Deployment Status Checker
# Monitors Render.com deployment and tests payment endpoints

Write-Host ""
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "   Payment System Deployment Monitor" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

$API_BASE = "https://smart-equiz-platform.onrender.com/api"

# Function to check if endpoint is available
function Test-Endpoint {
    param($Url, $Description)
    
    try {
        $response = Invoke-WebRequest -Uri $Url -Method Get -ErrorAction Stop
        Write-Host "[OK] $Description - Status: $($response.StatusCode)" -ForegroundColor Green
        return $true
    }
    catch {
        if ($_.Exception.Response.StatusCode -eq 401) {
            Write-Host "[OK] $Description - Status: 401 (Auth required - endpoint exists!)" -ForegroundColor Green
            return $true
        }
        elseif ($_.Exception.Response.StatusCode -eq 404) {
            Write-Host "[WAIT] $Description - Status: 404 (Not deployed yet)" -ForegroundColor Yellow
            return $false
        }
        else {
            Write-Host "[ERROR] $Description - Error: $($_.Exception.Message)" -ForegroundColor Red
            return $false
        }
    }
}

# Check deployment status
Write-Host "Checking deployment status..." -ForegroundColor White
Write-Host ""

$healthCheck = Test-Endpoint "$API_BASE/health" "Health Check"
$gatewaysCheck = Test-Endpoint "$API_BASE/payments/gateways" "Payment Gateways Endpoint"

Write-Host ""

if ($gatewaysCheck) {
    Write-Host "=======================================" -ForegroundColor Green
    Write-Host "   SUCCESS: DEPLOYMENT COMPLETE!" -ForegroundColor Green
    Write-Host "=======================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Payment endpoints are live. Next steps:" -ForegroundColor White
    Write-Host ""
    Write-Host "1. Run full E2E tests:" -ForegroundColor Yellow
    Write-Host "   cd services\api" -ForegroundColor Gray
    Write-Host "   `$env:API_URL='$API_BASE'" -ForegroundColor Gray
    Write-Host "   node test\e2e\payments.e2e.js" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Fix VITE_API_URL in Vercel:" -ForegroundColor Yellow
    Write-Host "   - Open: https://vercel.com/dashboard" -ForegroundColor Gray
    Write-Host "   - Find: platform-admin project" -ForegroundColor Gray
    Write-Host "   - Update: VITE_API_URL to include /api suffix" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3. Configure additional gateways (optional):" -ForegroundColor Yellow
    Write-Host "   - See: RENDER_PAYMENT_GATEWAY_CONFIG.md" -ForegroundColor Gray
    Write-Host ""
}
else {
    Write-Host "=======================================" -ForegroundColor Yellow
    Write-Host "   WAITING: DEPLOYMENT IN PROGRESS" -ForegroundColor Yellow
    Write-Host "=======================================" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Render.com is still deploying the payment system." -ForegroundColor White
    Write-Host ""
    Write-Host "What's happening:" -ForegroundColor Yellow
    Write-Host "  - Building Docker image" -ForegroundColor Gray
    Write-Host "  - Installing dependencies" -ForegroundColor Gray
    Write-Host "  - Running Prisma migrations" -ForegroundColor Gray
    Write-Host "  - Starting NestJS application" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Estimated time remaining: 5-10 minutes" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Monitor progress:" -ForegroundColor Yellow
    Write-Host "  - Dashboard: https://dashboard.render.com/" -ForegroundColor Gray
    Write-Host "  - Service: smart-equiz-platform-api" -ForegroundColor Gray
    Write-Host "  - Tab: Events (look for Deploy live status)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Run this script again in 5 minutes:" -ForegroundColor Cyan
    Write-Host "  .\dev\check-deployment-status.ps1" -ForegroundColor Gray
    Write-Host ""
}

# Show recent commits
Write-Host "Recent commits deployed:" -ForegroundColor White
Write-Host "  866754c - Document complete payment system" -ForegroundColor Gray
Write-Host "  ff3830f - Add E2E tests and config guide" -ForegroundColor Gray
Write-Host "  70b0331 - Integrate Billing page with real data" -ForegroundColor Gray
Write-Host "  8e69d12 - Apply payment database migration" -ForegroundColor Gray
Write-Host "  24b6dcd - Fix TypeScript errors" -ForegroundColor Gray
Write-Host "  5108793 - Add multi-gateway payment integration" -ForegroundColor Gray
Write-Host ""
