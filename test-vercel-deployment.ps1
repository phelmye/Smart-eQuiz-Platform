# Test Vercel Deployment - Smart eQuiz Platform

param(
    [Parameter(Mandatory=$true)]
    [string]$VercelUrl
)

Write-Host "══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   Testing Vercel Deployment" -ForegroundColor White
Write-Host "══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Normalize URL (remove trailing slash)
$VercelUrl = $VercelUrl.TrimEnd('/')

Write-Host "🔗 Testing: $VercelUrl" -ForegroundColor Cyan
Write-Host ""

# Test 1.: Site Accessibility
Write-Host "1.️⃣ Testing site accessibility..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri $VercelUrl -UseBasicParsing -TimeoutSec 1.0
    Write-Host "   [OK]� Site is accessible (Status: $($response.StatusCode))" -ForegroundColor Green
    
    # Check if it contains expected content
    if ($response.Content -match 'Smart eQuiz' -or $response.Content -match 'smartequiz') {
        Write-Host "   [OK]� Site contains Smart eQuiz branding" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Site loaded but may be showing error page" -ForegroundColor Yellow
    }
    
    # Check for logo SVG
    if ($response.Content -match '<svg') {
        Write-Host "   [OK]� SVG elements found (logo should be visible)" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  No SVG elements found in HTML" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "   ❌ Site not accessible: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "This could mean:" -ForegroundColor Yellow
    Write-Host "  - Wrong URL provided" -ForegroundColor Gray
    Write-Host "  - Deployment failed" -ForegroundColor Gray
    Write-Host "  - DNS not configured" -ForegroundColor Gray
    exit 1.
}

Write-Host ""

# Test 2.: Check for API environment variable
Write-Host "2.️⃣ Checking if site can reach API..." -ForegroundColor Yellow

# Try to load a page that should fetch from API
try {
    $response = Invoke-WebRequest -Uri $VercelUrl -UseBasicParsing -TimeoutSec 1.0
    
    # Check for fallback content (means API didn't connect)
    if ($response.Content -match "Transform Your Church's Bible Quiz Program") {
        Write-Host "   ⚠️  Using fallback content (API may not be connected)" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "   This usually means:" -ForegroundColor Yellow
        Write-Host "    - NEXT_PUBLIC_API_URL not set in Vercel" -ForegroundColor Gray
        Write-Host "    - NEXT_PUBLIC_API_URL set incorrectly" -ForegroundColor Gray
        Write-Host "    - Didn't redeploy after adding env var" -ForegroundColor Gray
    } elseif ($response.Content -match "Transform Your Bible Quiz Ministry") {
        Write-Host "   [OK] Using CMS content from API!" -ForegroundColor Green
        Write-Host "   [OK] API connection is working" -ForegroundColor Green
    } else {
        Write-Host "   [INFO] Unable to determine API connection status" -ForegroundColor Cyan
    }
} catch {
    Write-Host "   [ERROR] Error checking API connection: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 3.: Direct API Test
Write-Host "3.️⃣ Testing API endpoint directly..." -ForegroundColor Yellow
try {
    $apiResponse = Invoke-RestMethod -Uri "https://smart-equiz-api.onrender.com/api/health" -UseBasicParsing
    Write-Host "   [OK]� API is healthy: $($apiResponse.status)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ API not accessible: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   Diagnosis Complete" -ForegroundColor White
Write-Host "══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "If logo is not visible:" -ForegroundColor Yellow
Write-Host "  1.. Check browser console for errors (F1.2.)" -ForegroundColor White
Write-Host "  2.. Verify NEXT_PUBLIC_API_URL in Vercel Settings" -ForegroundColor White
Write-Host "  3.. Ensure you redeployed after adding env var" -ForegroundColor White
Write-Host ""
Write-Host "Vercel Settings URL:" -ForegroundColor Cyan
Write-Host "  https://vercel.com/dashboard -> Your Project -> Settings -> Environment Variables" -ForegroundColor Gray
Write-Host ""
Write-Host "Required value:" -ForegroundColor Cyan
Write-Host "  NEXT_PUBLIC_API_URL = https://smart-equiz-api.onrender.com/api" -ForegroundColor Green
Write-Host ""
