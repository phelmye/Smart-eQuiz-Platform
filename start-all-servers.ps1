# Smart eQuiz Platform - Start All Dev Servers
# This script opens 3 separate PowerShell windows for each dev server

Write-Host "=== Smart eQuiz Platform - Starting All Servers ===" -ForegroundColor Cyan
Write-Host ""

# Get the current directory
$rootPath = Get-Location

# Start Marketing Site
Write-Host "Starting Marketing Site (http://localhost:3000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootPath'; .\start-marketing-site.ps1"
Start-Sleep -Seconds 2

# Start Platform Admin
Write-Host "Starting Platform Admin (http://localhost:5173)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootPath'; .\start-platform-admin.ps1"
Start-Sleep -Seconds 2

# Start Tenant App
Write-Host "Starting Tenant App (http://localhost:5174)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootPath'; .\start-tenant-app.ps1"

Write-Host ""
Write-Host "✅ All servers starting in separate windows!" -ForegroundColor Cyan
Write-Host ""
Write-Host "URLs:" -ForegroundColor Yellow
Write-Host "  Marketing Site:  http://localhost:3000" -ForegroundColor White
Write-Host "  Platform Admin:  http://localhost:5173" -ForegroundColor White
Write-Host "  Tenant App:      http://localhost:5174" -ForegroundColor White
Write-Host ""
Write-Host "To stop a server: Close its PowerShell window or press Ctrl+C" -ForegroundColor Gray
