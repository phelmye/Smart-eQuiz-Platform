@echo off
echo ==========================================
echo   Smart eQuiz Platform - Quick Deploy
echo ==========================================
echo.

echo [1/3] Installing dependencies...
call pnpm install
if %errorlevel% neq 0 (
    echo Error: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo [2/3] Building for production...
call pnpm run build
if %errorlevel% neq 0 (
    echo Error: Build failed
    pause
    exit /b 1
)

echo.
echo [3/3] Deploying to Vercel...
echo Choose your deployment option:
echo 1. Vercel (Recommended)
echo 2. Preview build locally
echo 3. Exit
echo.

set /p choice="Enter your choice (1-3): "

if "%choice%"=="1" (
    echo Deploying to Vercel...
    npx vercel --prod
) else if "%choice%"=="2" (
    echo Starting local preview...
    echo Visit: http://localhost:4173
    call pnpm run preview
) else (
    echo Deployment cancelled.
)

echo.
echo Deployment complete!
pause