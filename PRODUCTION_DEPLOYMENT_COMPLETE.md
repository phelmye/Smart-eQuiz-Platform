# 🚀 Production Deployment Guide

## Overview

Complete guide to deploy Smart eQuiz Platform to production, including all three apps (marketing site, platform admin, tenant app) and the mobile app.

## Prerequisites

### Required Accounts

1. **Hosting & Infrastructure:**
   - Railway account (backend API + database)
   - Vercel account (frontend apps)
   - Cloudinary account (image storage)

2. **Mobile App Stores:**
   - Apple Developer Account ($99/year)
   - Google Play Developer Account ($25 one-time)
   - Expo EAS account (free or $29/month)

3. **Services:**
   - SendGrid account (email)
   - Domain registrar (custom domain)

### Required Installs

```bash
# Node.js 18+
node --version

# pnpm
npm install -g pnpm

# EAS CLI (for mobile)
npm install -g eas-cli

# Vercel CLI (optional)
npm install -g vercel
```

## Part 1: Backend API Deployment (Railway)

### Step 1: Prepare Backend

```bash
cd services/api

# Create .env.production
cp .env.example .env.production
```

Edit `.env.production`:

```env
# Database
DATABASE_URL=postgresql://postgres:[password]@[host]:5432/smartequiz_prod

# JWT
JWT_SECRET=[generate-secure-32-char-string]
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=[generate-secure-32-char-string]
JWT_REFRESH_EXPIRES_IN=7d

# Redis
REDIS_URL=redis://default:[password]@[host]:6379

# CORS
CORS_ORIGIN=https://www.smartequiz.com,https://admin.smartequiz.com,https://*.smartequiz.com

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# SendGrid
SENDGRID_API_KEY=your-sendgrid-key
SENDGRID_FROM_EMAIL=noreply@smartequiz.com

# App URLs
APP_URL=https://www.smartequiz.com
ADMIN_URL=https://admin.smartequiz.com
TENANT_BASE_URL=https://*.smartequiz.com
```

### Step 2: Deploy to Railway

1. **Create Railway Project:**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login
   railway login
   
   # Create project
   railway init
   ```

2. **Add PostgreSQL Database:**
   - Go to Railway dashboard
   - Click "New" → "Database" → "PostgreSQL"
   - Copy `DATABASE_URL` to `.env.production`

3. **Add Redis:**
   - Click "New" → "Database" → "Redis"
   - Copy `REDIS_URL` to `.env.production`

4. **Deploy API:**
   ```bash
   cd services/api
   
   # Set environment variables
   railway variables set NODE_ENV=production
   railway variables set DATABASE_URL=[your-database-url]
   railway variables set JWT_SECRET=[your-jwt-secret]
   # ... set all other variables
   
   # Deploy
   railway up
   ```

5. **Run Migrations:**
   ```bash
   railway run npx prisma migrate deploy
   railway run npx prisma db seed
   ```

6. **Get API URL:**
   - Railway will provide a URL like `https://smartequiz-api.up.railway.app`
   - Note this for frontend configuration

### Step 3: Configure Custom Domain (Optional)

1. In Railway dashboard → Settings → Domains
2. Add custom domain: `api.smartequiz.com`
3. Add DNS CNAME record pointing to Railway

## Part 2: Frontend Apps Deployment (Vercel)

### Step 1: Configure Environment Variables

Create `.env.production` files for each app:

**Marketing Site** (`apps/marketing-site/.env.production`):
```env
NEXT_PUBLIC_API_URL=https://api.smartequiz.com
NEXT_PUBLIC_APP_URL=https://www.smartequiz.com
NEXT_PUBLIC_ADMIN_URL=https://admin.smartequiz.com
```

**Platform Admin** (`apps/platform-admin/.env.production`):
```env
VITE_API_URL=https://api.smartequiz.com
VITE_APP_URL=https://admin.smartequiz.com
VITE_MARKETING_URL=https://www.smartequiz.com
```

**Tenant App** (`apps/tenant-app/.env.production`):
```env
VITE_API_URL=https://api.smartequiz.com
VITE_MARKETING_URL=https://www.smartequiz.com
VITE_ADMIN_URL=https://admin.smartequiz.com
```

### Step 2: Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy each app
cd apps/marketing-site
vercel --prod

cd ../platform-admin
vercel --prod

cd ../tenant-app
vercel --prod
```

### Step 3: Configure Domains in Vercel

1. **Marketing Site:**
   - Domain: `www.smartequiz.com` and `smartequiz.com`
   - Vercel → Project Settings → Domains → Add

2. **Platform Admin:**
   - Domain: `admin.smartequiz.com`
   - Vercel → Project Settings → Domains → Add

3. **Tenant App:**
   - Domain: `*.smartequiz.com` (wildcard)
   - Vercel → Project Settings → Domains → Add

### Step 4: Configure DNS

Add these DNS records at your domain registrar:

```
Type    Name    Value
A       @       76.76.21.21 (Vercel IP)
CNAME   www     cname.vercel-dns.com
CNAME   admin   cname.vercel-dns.com
CNAME   *       cname.vercel-dns.com
CNAME   api     [railway-domain].railway.app
```

## Part 3: Mobile App Deployment

### Step 1: Create EAS Account

```bash
cd apps/mobile-app

# Login to Expo
npx expo login

# Initialize EAS
eas init

# Update app.json with project ID
```

### Step 2: Configure App Icons & Splash

Create assets:
- `assets/icon.png` (1024x1024)
- `assets/splash.png` (1242x2688)
- `assets/adaptive-icon.png` (1024x1024 - Android)

**Quick placeholders using AI:**
```bash
# Use DALL-E, Midjourney, or Canva
# Prompt: "Modern quiz app icon, blue gradient, book symbol"
```

### Step 3: Configure Credentials

**iOS:**
```bash
eas credentials
# Select iOS
# Select "Build Credentials"
# Follow prompts to create/upload certificates
```

**Android:**
```bash
eas credentials
# Select Android
# Select "Build Credentials"
# Follow prompts to create keystore
```

### Step 4: Build Apps

**Production Build:**
```bash
# Build for both platforms
npm run build:tenant -- --tenant=demo-tenant --platform=all

# Or build individually
eas build --platform ios --profile production
eas build --platform android --profile production
```

**Wait for builds** (15-30 minutes per platform)

### Step 5: Submit to App Stores

**iOS (App Store Connect):**
1. Download IPA from EAS
2. Go to https://appstoreconnect.apple.com
3. Create new app
4. Upload IPA using Transporter app
5. Fill in app details:
   - Name: "Demo Church Quiz"
   - Category: Education
   - Screenshots (5-6 per device size)
   - Description
   - Keywords
   - Privacy policy URL
6. Submit for review (3-7 days)

**Android (Google Play Console):**
1. Download AAB from EAS
2. Go to https://play.google.com/console
3. Create new app
4. Upload AAB to Production track
5. Fill in app details:
   - Name: "Demo Church Quiz"
   - Category: Education
   - Screenshots (4-8)
   - Description
   - Privacy policy
6. Submit for review (1-3 days)

## Part 4: Database Seeding

### Seed Production Data

```bash
# Connect to production database
railway connect

# Or use direct connection
psql [DATABASE_URL]

# Run seed script
cd services/api
NODE_ENV=production npx prisma db seed
```

### Create First Super Admin

```sql
-- In production database
INSERT INTO users (id, email, password_hash, full_name, role, tenant_id, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'admin@smartequiz.com',
  -- Hash for 'ChangeMe123!' - CHANGE THIS!
  '$2b$10$XxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxA',
  'Super Admin',
  'super_admin',
  NULL,
  NOW(),
  NOW()
);
```

Or use API endpoint:
```bash
curl -X POST https://api.smartequiz.com/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@smartequiz.com",
    "password": "SecurePassword123!",
    "fullName": "Super Admin",
    "role": "super_admin"
  }'
```

## Part 5: DNS & SSL Configuration

### Verify SSL Certificates

All platforms (Railway, Vercel) auto-provision SSL certificates. Verify:

```bash
# Check API
curl https://api.smartequiz.com/health

# Check marketing site
curl https://www.smartequiz.com

# Check admin
curl https://admin.smartequiz.com
```

### Test Wildcard Subdomain

```bash
# Create test tenant in database
INSERT INTO tenants (id, name, slug, subdomain) 
VALUES (gen_random_uuid(), 'Test Church', 'test-church', 'testchurch');

# Visit
curl https://testchurch.smartequiz.com
```

## Part 6: Monitoring & Analytics

### Set Up Error Tracking

**Option 1: Sentry**
```bash
# Install
pnpm add @sentry/node @sentry/react

# Configure in each app
SENTRY_DSN=https://[key]@sentry.io/[project]
```

**Option 2: Railway Logs**
```bash
# View logs
railway logs --tail
```

### Set Up Uptime Monitoring

**Recommended: UptimeRobot (Free)**

1. Go to https://uptimerobot.com
2. Add monitors:
   - https://api.smartequiz.com/health
   - https://www.smartequiz.com
   - https://admin.smartequiz.com
3. Set alert email

### Database Backups

**Railway Auto-Backups:**
- Automatically enabled
- Retained for 7 days (free tier)

**Manual Backup:**
```bash
# Export database
railway pg:dump > backup-$(date +%Y%m%d).sql

# Restore
railway pg:restore backup-20251206.sql
```

## Part 7: Post-Deployment Checklist

### Immediate Verification

- [ ] API health check responds: `curl https://api.smartequiz.com/health`
- [ ] Marketing site loads: Visit https://www.smartequiz.com
- [ ] Admin dashboard loads: Visit https://admin.smartequiz.com
- [ ] Can login to admin dashboard
- [ ] Can create a test tenant
- [ ] Test tenant subdomain works: https://[tenant].smartequiz.com
- [ ] Mobile app connects to production API

### Security Checks

- [ ] All secrets are different from development
- [ ] JWT secrets are strong (32+ characters)
- [ ] Database has strong password
- [ ] CORS is configured with specific origins
- [ ] Rate limiting is enabled
- [ ] SQL injection protection verified
- [ ] XSS protection enabled

### Performance Checks

- [ ] API response time < 200ms (Railway dashboard)
- [ ] Frontend loads in < 2 seconds
- [ ] Database queries are indexed
- [ ] Images are optimized via Cloudinary
- [ ] Caching is enabled

### Functionality Tests

- [ ] **Authentication:**
  - [ ] Register new user
  - [ ] Login
  - [ ] Logout
  - [ ] Password reset email

- [ ] **Tenant Operations:**
  - [ ] Create tenant (super admin)
  - [ ] Access tenant subdomain
  - [ ] Tenant isolation verified

- [ ] **Quiz Functionality:**
  - [ ] Create quiz
  - [ ] Take quiz
  - [ ] Submit answers
  - [ ] View results

- [ ] **Mobile App:**
  - [ ] Download from TestFlight/Internal Testing
  - [ ] Login works
  - [ ] Quizzes load
  - [ ] Offline mode works
  - [ ] Push notifications received

## Part 8: Scaling Preparation

### When to Scale

**Signs you need to scale:**
- API response time > 500ms consistently
- Database CPU > 80%
- Memory usage > 85%
- More than 1000 concurrent users

### Scaling Options

**Railway (Easy):**
1. Dashboard → Settings → Resources
2. Increase RAM/CPU
3. Costs scale with usage

**Database Optimization:**
```sql
-- Add indexes
CREATE INDEX idx_quizzes_tenant_id ON quizzes(tenant_id);
CREATE INDEX idx_questions_quiz_id ON questions(quiz_id);
CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_users_email ON users(email);
```

**CDN (Optional):**
- Cloudflare (free tier)
- Caches static assets
- DDoS protection

## Part 9: Cost Estimate

### Monthly Costs (Starting)

**Infrastructure:**
- Railway (API + DB + Redis): $5-20
- Vercel (3 apps): $0 (hobby tier)
- Cloudinary: $0 (free tier)
- SendGrid: $0 (100 emails/day free)
- **Total Infrastructure: $5-20/month**

**Mobile Apps:**
- Apple Developer: $99/year ($8.25/month)
- Google Play: $25 one-time ($2/month amortized)
- Expo EAS: $0-29/month
- **Total Mobile: $10-37/month**

**Grand Total: $15-57/month** for the entire platform!

### Growth Costs

**At 100 tenants:**
- Infrastructure: $20-50/month
- Mobile apps: Same ($10-37/month)
- **Total: $30-87/month**

**At 1000 tenants:**
- Infrastructure: $100-200/month
- Mobile apps: Same
- **Total: $110-237/month**

## Part 10: Maintenance

### Weekly Tasks

- [ ] Check uptime monitoring
- [ ] Review error logs
- [ ] Check disk usage
- [ ] Review slow queries

### Monthly Tasks

- [ ] Database backup verification
- [ ] Security updates (dependencies)
- [ ] Performance review
- [ ] Cost analysis

### Quarterly Tasks

- [ ] Update SSL certificates (auto-renewed)
- [ ] Review and update documentation
- [ ] User feedback review
- [ ] Feature planning

## Troubleshooting

### API Not Responding

```bash
# Check Railway logs
railway logs --tail

# Check database connection
railway connect
\dt  # List tables

# Restart service
railway restart
```

### Frontend Not Loading

```bash
# Check build logs in Vercel
vercel logs [deployment-url]

# Rebuild
vercel --prod --force
```

### Mobile App Crashes

```bash
# Check Expo dashboard
# Or check device console
# iOS: Xcode → Devices → [Device] → Console
# Android: adb logcat
```

### Database Issues

```bash
# Check connection
psql [DATABASE_URL]

# Check running queries
SELECT * FROM pg_stat_activity;

# Kill long-running query
SELECT pg_terminate_backend([pid]);
```

## Quick Reference

### Essential URLs

- **Marketing:** https://www.smartequiz.com
- **Admin:** https://admin.smartequiz.com
- **API:** https://api.smartequiz.com
- **Tenant:** https://[slug].smartequiz.com
- **Railway Dashboard:** https://railway.app
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Expo Dashboard:** https://expo.dev

### Essential Commands

```bash
# Backend
railway logs --tail
railway restart
railway pg:dump

# Frontend
vercel logs
vercel --prod

# Mobile
eas build:list
eas submit --platform ios
eas submit --platform android
```

## Support Resources

- **Railway Docs:** https://docs.railway.app
- **Vercel Docs:** https://vercel.com/docs
- **Expo Docs:** https://docs.expo.dev
- **Prisma Docs:** https://www.prisma.io/docs

---

**Ready to deploy?** Start with Part 1 (Backend) and work sequentially. Each part takes 30-60 minutes. Total deployment time: 4-6 hours.

**Questions?** Check the troubleshooting section or open an issue on GitHub.
