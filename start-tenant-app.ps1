# Smart eQuiz Tenant App - Persistent Dev Server

$ErrorActionPreference = "Continue"

Write-Host "=== Smart eQuiz Tenant App Dev Server ===" -ForegroundColor Cyan
Write-Host "Starting on http://localhost:5174" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""

# Navigate to tenant-app directory
Set-Location "apps\tenant-app"

# Verify .env exists
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env..." -ForegroundColor Yellow
    "VITE_API_URL=https://smart-equiz-api.onrender.com/api" | Out-File -FilePath ".env" -Encoding utf8
    Write-Host "✅ .env created" -ForegroundColor Green
}

# Start the dev server
Write-Host "Starting Vite dev server..." -ForegroundColor Cyan
pnpm dev
