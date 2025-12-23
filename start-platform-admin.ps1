# Smart eQuiz Platform Admin - Persistent Dev Server

$ErrorActionPreference = "Continue"

Write-Host "=== Smart eQuiz Platform Admin Dev Server ===" -ForegroundColor Cyan
Write-Host "Starting on http://localhost:5173" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""

# Navigate to platform-admin directory
Set-Location "apps\platform-admin"

# Verify .env exists
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env..." -ForegroundColor Yellow
    "VITE_API_URL=https://smart-equiz-api.onrender.com/api" | Out-File -FilePath ".env" -Encoding utf8
    Write-Host "✅ .env created" -ForegroundColor Green
}

# Start the dev server
Write-Host "Starting Vite dev server..." -ForegroundColor Cyan
pnpm dev
