# Test Sample Data System - Run After Deployment
# This script tests all sample data endpoints

param(
    [switch]$Seed,
    [switch]$Clear,
    [switch]$Status
)

$API_BASE = "https://smart-equiz-api.onrender.com/api"

Write-Host "`n=== Sample Data System Test ===" -ForegroundColor Cyan

# Login
Write-Host "`n1. Logging in as super admin..." -ForegroundColor Yellow
$loginBody = @{ 
    email = "super@admin.com"
    password = "SuperAdmin123!" 
} | ConvertTo-Json

try {
    $auth = Invoke-RestMethod -Uri "$API_BASE/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $auth.access_token
    $headers = @{ Authorization = "Bearer $token" }
    Write-Host "   Login successful" -ForegroundColor Green
} catch {
    Write-Host "   Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Get Status
Write-Host "`n2. Checking sample data status..." -ForegroundColor Yellow
try {
    $status = Invoke-RestMethod -Uri "$API_BASE/admin/sample-data/status" -Headers $headers
    Write-Host "   Has sample data: $($status.hasSampleData)" -ForegroundColor $(if ($status.hasSampleData) { "Yellow" } else { "Green" })
    Write-Host "   Tenants: $($status.counts.tenants)" -ForegroundColor White
    Write-Host "   Users: $($status.counts.users)" -ForegroundColor White
    Write-Host "   Support Tickets: $($status.counts.supportTickets)" -ForegroundColor White
    Write-Host "   Audit Logs: $($status.counts.auditLogs)" -ForegroundColor White
    Write-Host "   Blog Posts: $($status.counts.blogPosts)" -ForegroundColor White
    Write-Host "   Total: $($status.counts.total)" -ForegroundColor Cyan
} catch {
    Write-Host "   Status check failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Seed if requested
if ($Seed) {
    Write-Host "`n3. Seeding sample data..." -ForegroundColor Yellow
    try {
        $result = Invoke-RestMethod -Uri "$API_BASE/admin/sample-data/seed" -Method Post -Headers $headers -Body "{}" -ContentType "application/json"
        Write-Host "   Seeded successfully!" -ForegroundColor Green
        Write-Host "   Tenants: $($result.tenants)" -ForegroundColor White
        Write-Host "   Users: $($result.users)" -ForegroundColor White
        Write-Host "   Support Tickets: $($result.supportTickets)" -ForegroundColor White
        Write-Host "   Audit Logs: $($result.auditLogs)" -ForegroundColor White
    } catch {
        Write-Host "   Seeding failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Clear if requested
if ($Clear) {
    Write-Host "`n3. Clearing sample data..." -ForegroundColor Yellow
    $confirm = Read-Host "Are you sure? This will permanently delete all sample data (yes/no)"
    if ($confirm -eq "yes") {
        try {
            $result = Invoke-RestMethod -Uri "$API_BASE/admin/sample-data" -Method Delete -Headers $headers
            Write-Host "   Cleared successfully!" -ForegroundColor Green
            Write-Host "   Removed tenants: $($result.tenants)" -ForegroundColor White
            Write-Host "   Removed users: $($result.users)" -ForegroundColor White
            Write-Host "   Removed support tickets: $($result.supportTickets)" -ForegroundColor White
            Write-Host "   Removed audit logs: $($result.auditLogs)" -ForegroundColor White
        } catch {
            Write-Host "   Clearing failed: $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "   Cancelled" -ForegroundColor Gray
    }
}

Write-Host "`nTest complete!`n" -ForegroundColor Green
