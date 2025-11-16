# Test Execution Script for Phase 13
# Run this to execute automated tests and document results

Write-Host "========================================"
Write-Host "Phase 13: Tenant Role Customization Tests"
Write-Host "========================================"
Write-Host ""

# Check if dev server is running
Write-Host "Checking dev server..."
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "SUCCESS: Dev server is running on http://localhost:5173" -ForegroundColor Green
        Write-Host ""
    }
} catch {
    Write-Host "ERROR: Dev server is not responding" -ForegroundColor Red
    Write-Host "Please start it with: pnpm run dev" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

# Instructions for manual testing
Write-Host "========================================"
Write-Host "TEST EXECUTION STEPS"
Write-Host "========================================"
Write-Host ""

Write-Host "STEP 1 - SMOKE TEST (5 minutes):"
Write-Host "  - Open browser to: http://localhost:5173"
Write-Host "  - Open Developer Console (F12)"
Write-Host "  - Copy/paste content from: smoke-test.js"
Write-Host "  - Press Enter and verify all tests pass"
Write-Host ""

Write-Host "STEP 2 - FULL AUTOMATED TEST (15 minutes):"
Write-Host "  - In same browser console"
Write-Host "  - Copy/paste content from: test-role-customization.js"
Write-Host "  - Press Enter and verify all 10 tests pass"
Write-Host ""

Write-Host "STEP 3 - MANUAL UI TESTING (30 minutes):"
Write-Host "  - Follow steps in: TESTING_GUIDE.md"
Write-Host "  - Test UI: Navigation, Create, Edit, Delete"
Write-Host "  - Test permissions: Grant/Revoke"
Write-Host "  - Test validation: Error handling"
Write-Host ""

Write-Host "STEP 4 - DOCUMENT RESULTS:"
Write-Host "  - Fill in: TEST_EXECUTION_REPORT.md"
Write-Host "  - Note any bugs found"
Write-Host "  - Update: TESTING_STATUS.md"
Write-Host ""

Write-Host "========================================"
Write-Host "OPENING BROWSER FOR TESTING"
Write-Host "========================================"
Write-Host ""

Write-Host "After browser opens:"
Write-Host "1. Press F12 to open DevTools Console"
Write-Host "2. Open file: smoke-test.js"
Write-Host "3. Copy all content and paste into console"
Write-Host "4. Press Enter to run"
Write-Host ""

# Open browser
Start-Process "http://localhost:5173"

Write-Host "Browser opened. Follow instructions above." -ForegroundColor Green
Write-Host ""

Write-Host "Test files location:"
Write-Host "  - smoke-test.js (quick validation)"
Write-Host "  - test-role-customization.js (full suite)"
Write-Host "  - TESTING_GUIDE.md (manual steps)"
Write-Host "  - TEST_EXECUTION_REPORT.md (results template)"
Write-Host ""
