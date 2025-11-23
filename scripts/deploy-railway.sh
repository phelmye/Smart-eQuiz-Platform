#!/bin/bash

###############################################################################
# Smart eQuiz Platform - Railway Deployment Script
# Version: 1.0
# Description: Automated deployment to Railway platform
###############################################################################

set -e  # Exit on error

echo "🚀 Smart eQuiz Platform - Railway Deployment"
echo "============================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo -e "${RED}❌ Railway CLI not found${NC}"
    echo "Install it with: npm install -g @railway/cli"
    exit 1
fi

echo -e "${GREEN}✓ Railway CLI found${NC}"

# Check if logged in to Railway
if ! railway whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Railway${NC}"
    echo "Logging in..."
    railway login
fi

echo -e "${GREEN}✓ Logged in to Railway${NC}"

# Navigate to API directory
cd "$(dirname "$0")/../services/api"

echo ""
echo "📦 Checking project setup..."

# Check if Railway project exists
if ! railway status &> /dev/null; then
    echo -e "${YELLOW}⚠️  No Railway project linked${NC}"
    echo "Initializing new Railway project..."
    railway init
fi

echo -e "${GREEN}✓ Railway project linked${NC}"

# Check for required environment variables
echo ""
echo "🔐 Checking environment variables..."

REQUIRED_VARS=(
    "DATABASE_URL"
    "JWT_SECRET"
    "JWT_REFRESH_SECRET"
)

MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if ! railway variables get "$var" &> /dev/null; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Missing environment variables:${NC}"
    for var in "${MISSING_VARS[@]}"; do
        echo "   - $var"
    done
    echo ""
    echo "Setting up environment variables..."
    
    # Set NODE_ENV
    railway variables set NODE_ENV=production
    
    # Generate JWT secrets if not set
    if [[ " ${MISSING_VARS[*]} " =~ " JWT_SECRET " ]]; then
        echo "Generating JWT_SECRET..."
        JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')
        railway variables set JWT_SECRET="$JWT_SECRET"
    fi
    
    if [[ " ${MISSING_VARS[*]} " =~ " JWT_REFRESH_SECRET " ]]; then
        echo "Generating JWT_REFRESH_SECRET..."
        JWT_REFRESH_SECRET=$(openssl rand -base64 64 | tr -d '\n')
        railway variables set JWT_REFRESH_SECRET="$JWT_REFRESH_SECRET"
    fi
    
    # Check if DATABASE_URL is missing
    if [[ " ${MISSING_VARS[*]} " =~ " DATABASE_URL " ]]; then
        echo -e "${RED}❌ DATABASE_URL not set${NC}"
        echo "Please add a PostgreSQL service in Railway:"
        echo "1. Go to your Railway project dashboard"
        echo "2. Click 'New Service' → 'Database' → 'PostgreSQL'"
        echo "3. Railway will automatically set DATABASE_URL"
        echo ""
        echo "Or set it manually:"
        echo "railway variables set DATABASE_URL='your-database-url'"
        exit 1
    fi
fi

echo -e "${GREEN}✓ Environment variables configured${NC}"

# Build the application
echo ""
echo "🔨 Building application..."
pnpm install --frozen-lockfile
pnpm prisma generate
pnpm build

echo -e "${GREEN}✓ Build successful${NC}"

# Run database migrations
echo ""
echo "📊 Running database migrations..."
railway run pnpm prisma migrate deploy

echo -e "${GREEN}✓ Migrations completed${NC}"

# Deploy to Railway
echo ""
echo "🚀 Deploying to Railway..."
railway up

echo ""
echo -e "${GREEN}✅ Deployment successful!${NC}"
echo ""
echo "🌐 Getting deployment URL..."
DEPLOYMENT_URL=$(railway domain)

if [ -n "$DEPLOYMENT_URL" ]; then
    echo -e "${GREEN}Your API is live at: https://$DEPLOYMENT_URL${NC}"
else
    echo -e "${YELLOW}⚠️  No domain configured yet${NC}"
    echo "Set up a domain with: railway domain"
fi

echo ""
echo "📝 Next steps:"
echo "1. Verify deployment: https://$DEPLOYMENT_URL/api/health"
echo "2. Check API docs: https://$DEPLOYMENT_URL/api/docs"
echo "3. Monitor logs: railway logs"
echo "4. View metrics: railway status"

echo ""
echo "✨ Deployment complete!"
