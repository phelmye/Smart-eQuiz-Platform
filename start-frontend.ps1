# Start Frontend Server Script  
# This script runs the React/Vite frontend development server

Write-Host "Starting Smart eQuiz Platform Frontend..." -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Change to frontend directory
Set-Location "C:\Projects\Dev\Smart eQuiz Platform\workspace\shadcn-ui"

# Start the dev server
pnpm dev
