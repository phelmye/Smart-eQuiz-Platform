# Smart eQuiz Marketing Site - Persistent Dev Server
# This script keeps the dev server running and restarts it if it crashes

$ErrorActionPreference = "Continue"

Write-Host "=== Smart eQuiz Marketing Site Dev Server ===" -ForegroundColor Cyan
Write-Host "Starting on http://localhost:3000" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""

# Navigate to marketing site directory
Set-Location "apps\marketing-site"

# Verify .env.local exists
if (-not (Test-Path ".env.local")) {
    Write-Host "Creating .env.local..." -ForegroundColor Yellow
    "NEXT_PUBLIC_API_URL=https://smart-equiz-api.onrender.com/api" | Out-File -FilePath ".env.local" -Encoding utf8
    Write-Host "✅ .env.local created" -ForegroundColor Green
}

# Start the dev server (this will block)
Write-Host "Starting Next.js dev server..." -ForegroundColor Cyan
pnpm dev
