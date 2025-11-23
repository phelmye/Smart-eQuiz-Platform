# Smart eQuiz Platform - Railway Deployment (PowerShell)
# Version: 1.0
# Description: Automated deployment to Railway platform

$ErrorActionPreference = "Stop"

Write-Host "🚀 Smart eQuiz Platform - Railway Deployment" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check if Railway CLI is installed
try {
    $railwayVersion = railway --version 2>$null
    Write-Host "✓ Railway CLI found: $railwayVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Railway CLI not found" -ForegroundColor Red
    Write-Host "Install it with: npm install -g @railway/cli"
    exit 1
}

# Check if logged in to Railway
try {
    $whoami = railway whoami 2>$null
    Write-Host "✓ Logged in to Railway as: $whoami" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Not logged in to Railway" -ForegroundColor Yellow
    Write-Host "Logging in..."
    railway login
}

# Navigate to API directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$apiPath = Join-Path (Split-Path -Parent $scriptPath) "services\api"
Set-Location $apiPath

Write-Host ""
Write-Host "📦 Checking project setup..." -ForegroundColor Cyan

# Check if Railway project exists
try {
    railway status | Out-Null
    Write-Host "✓ Railway project linked" -ForegroundColor Green
} catch {
    Write-Host "⚠️  No Railway project linked" -ForegroundColor Yellow
    Write-Host "Initializing new Railway project..."
    railway init
}

# Check for required environment variables
Write-Host ""
Write-Host "🔐 Checking environment variables..." -ForegroundColor Cyan

$requiredVars = @("DATABASE_URL", "JWT_SECRET", "JWT_REFRESH_SECRET")
$missingVars = @()

foreach ($var in $requiredVars) {
    try {
        railway variables get $var | Out-Null
    } catch {
        $missingVars += $var
    }
}

if ($missingVars.Count -gt 0) {
    Write-Host "⚠️  Missing environment variables:" -ForegroundColor Yellow
    foreach ($var in $missingVars) {
        Write-Host "   - $var"
    }
    Write-Host ""
    Write-Host "Setting up environment variables..."
    
    # Set NODE_ENV
    railway variables set NODE_ENV=production
    
    # Generate JWT secrets if not set
    if ($missingVars -contains "JWT_SECRET") {
        Write-Host "Generating JWT_SECRET..."
        $jwtSecret = [Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Maximum 256 }))
        railway variables set "JWT_SECRET=$jwtSecret"
    }
    
    if ($missingVars -contains "JWT_REFRESH_SECRET") {
        Write-Host "Generating JWT_REFRESH_SECRET..."
        $jwtRefreshSecret = [Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Maximum 256 }))
        railway variables set "JWT_REFRESH_SECRET=$jwtRefreshSecret"
    }
    
    # Check if DATABASE_URL is missing
    if ($missingVars -contains "DATABASE_URL") {
        Write-Host "❌ DATABASE_URL not set" -ForegroundColor Red
        Write-Host "Please add a PostgreSQL service in Railway:"
        Write-Host "1. Go to your Railway project dashboard"
        Write-Host "2. Click 'New Service' → 'Database' → 'PostgreSQL'"
        Write-Host "3. Railway will automatically set DATABASE_URL"
        Write-Host ""
        Write-Host "Or set it manually:"
        Write-Host "railway variables set DATABASE_URL='your-database-url'"
        exit 1
    }
}

Write-Host "✓ Environment variables configured" -ForegroundColor Green

# Build the application
Write-Host ""
Write-Host "🔨 Building application..." -ForegroundColor Cyan
pnpm install --frozen-lockfile
pnpm prisma generate
pnpm build

Write-Host "✓ Build successful" -ForegroundColor Green

# Run database migrations
Write-Host ""
Write-Host "📊 Running database migrations..." -ForegroundColor Cyan
railway run pnpm prisma migrate deploy

Write-Host "✓ Migrations completed" -ForegroundColor Green

# Deploy to Railway
Write-Host ""
Write-Host "🚀 Deploying to Railway..." -ForegroundColor Cyan
railway up

Write-Host ""
Write-Host "✅ Deployment successful!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Getting deployment URL..." -ForegroundColor Cyan

try {
    $deploymentUrl = railway domain
    Write-Host "Your API is live at: https://$deploymentUrl" -ForegroundColor Green
} catch {
    Write-Host "⚠️  No domain configured yet" -ForegroundColor Yellow
    Write-Host "Set up a domain with: railway domain"
}

Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "1. Verify deployment: https://$deploymentUrl/api/health"
Write-Host "2. Check API docs: https://$deploymentUrl/api/docs"
Write-Host "3. Monitor logs: railway logs"
Write-Host "4. View metrics: railway status"

Write-Host ""
Write-Host "✨ Deployment complete!" -ForegroundColor Cyan
