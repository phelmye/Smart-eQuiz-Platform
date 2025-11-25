# Start Backend Server Script
# This script runs the NestJS backend server in a way that avoids VS Code terminal SIGINT issues

Write-Host "Starting Smart eQuiz Platform Backend..." -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Change to API directory
Set-Location "C:\Projects\Dev\Smart eQuiz Platform\services\api"

# Start the dev server
npm run start:dev
