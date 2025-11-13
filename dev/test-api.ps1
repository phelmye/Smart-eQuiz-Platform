#!/usr/bin/env pwsh
# Test script for API endpoints

Write-Host "Testing Smart eQuiz API Endpoints" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# 1. Test Login
Write-Host "1. Testing Login..." -ForegroundColor Yellow
$loginBody = @{
    email = "admin@demo.local"
    password = "password123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    Write-Host "✓ Login successful" -ForegroundColor Green
    $token = $loginResponse.accessToken
    Write-Host "  Token: $($token.Substring(0, 20))..." -ForegroundColor Gray
} catch {
    Write-Host "✗ Login failed: $_" -ForegroundColor Red
    exit 1
}

$headers = @{ Authorization = "Bearer $token" }
Write-Host ""

# 2. Test Categories
Write-Host "2. Testing Categories..." -ForegroundColor Yellow
try {
    $categories = Invoke-RestMethod -Uri "http://localhost:3000/api/questions/categories" -Method GET -Headers $headers
    Write-Host "✓ Found $($categories.Count) categories" -ForegroundColor Green
    $categories | Select-Object -First 3 | ForEach-Object { Write-Host "  - $($_.name)" -ForegroundColor Gray }
} catch {
    Write-Host "✗ Failed to fetch categories: $_" -ForegroundColor Red
}
Write-Host ""

# 3. Test Questions
Write-Host "3. Testing Questions..." -ForegroundColor Yellow
try {
    $questions = Invoke-RestMethod -Uri "http://localhost:3000/api/questions" -Method GET -Headers $headers
    Write-Host "✓ Found $($questions.Count) questions" -ForegroundColor Green
    $questions | Select-Object -First 2 | ForEach-Object { 
        Write-Host "  - $($_.prompt) [Difficulty: $($_.difficulty)]" -ForegroundColor Gray 
    }
} catch {
    Write-Host "✗ Failed to fetch questions: $_" -ForegroundColor Red
}
Write-Host ""

# 4. Test Tournaments
Write-Host "4. Testing Tournaments..." -ForegroundColor Yellow
try {
    $tournaments = Invoke-RestMethod -Uri "http://localhost:3000/api/tournaments" -Method GET -Headers $headers
    Write-Host "✓ Found $($tournaments.Count) tournaments" -ForegroundColor Green
    $tournaments | ForEach-Object { 
        Write-Host "  - $($_.name) [$($_.status)]" -ForegroundColor Gray 
        Write-Host "    Questions: $($_._count.questions), Entries: $($_._count.entries)" -ForegroundColor DarkGray
    }
} catch {
    Write-Host "✗ Failed to fetch tournaments: $_" -ForegroundColor Red
}
Write-Host ""

Write-Host "API Test Complete!" -ForegroundColor Cyan
