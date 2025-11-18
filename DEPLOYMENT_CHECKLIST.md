# Deployment Checklist - Smart eQuiz Platform

**Date:** November 16, 2025  
**Status:** Ready for Deployment Preparation  
**Branch:** pr/ci-fix-pnpm (Commit: 846b597)

---

## ✅ Pre-Deployment Verification

### Development Environment
- [x] All 3 apps running locally
  - [x] Marketing Site: http://localhost:3000
  - [x] Platform Admin: http://localhost:5173
  - [x] Tenant App: http://localhost:5174
- [x] Shared packages built and working
- [x] No TypeScript errors
- [x] No build errors
- [x] All features functional

### Code Quality
- [x] Git repository clean
- [x] All changes committed (9 commits)
- [x] Changes pushed to GitHub
- [x] Code documented (4,500+ lines)
- [x] Architecture documented
- [x] No console errors in dev mode

---

## 🚀 Deployment Steps

### Phase 1: Environment Setup

#### 1.1 Backend API (Required First)
- [ ] Set up AWS/Azure/GCP account
- [ ] Create PostgreSQL database
- [ ] Configure database with tenant isolation
  - [ ] Add tenant_id columns
  - [ ] Set up row-level security
  - [ ] Create indexes
- [ ] Deploy API (Node.js/Express/NestJS)
  - [ ] Authentication endpoints
  - [ ] Tenant CRUD operations
  - [ ] User management
  - [ ] Subscription management
- [ ] Set up Redis for caching
- [ ] Configure S3 for file storage

#### 1.2 Environment Variables

**Marketing Site (.env.production):**
```env
NEXT_PUBLIC_API_URL=https://api.smartequiz.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
NEXT_PUBLIC_SITE_URL=https://smartequiz.com
```

**Platform Admin (.env.production):**
```env
VITE_API_URL=https://api.smartequiz.com
VITE_AUTH_DOMAIN=auth.smartequiz.com
VITE_ADMIN_DOMAIN=admin.smartequiz.com
```

**Tenant App (.env.production):**
```env
VITE_API_URL=https://api.smartequiz.com
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
VITE_SITE_URL=https://smartequiz.com
```

### Phase 2: Marketing Site Deployment

#### 2.1 Vercel Deployment (Recommended)
- [ ] Connect GitHub repository
- [ ] Configure project settings
  - Root Directory: `apps/marketing-site`
  - Framework: Next.js
  - Build Command: `pnpm build`
  - Output Directory: `.next`
- [ ] Add environment variables
- [ ] Configure custom domain: `smartequiz.com`
- [ ] Set up SSL certificate (automatic)
- [ ] Deploy

#### 2.2 Alternative: AWS Amplify
- [ ] Create Amplify app
- [ ] Connect GitHub repository
- [ ] Configure build settings
- [ ] Set up domain
- [ ] Deploy

**Build Command:**
```bash
cd apps/marketing-site && pnpm install && pnpm build
```

**Test Deployment:**
- [ ] Visit https://smartequiz.com
- [ ] Test landing page
- [ ] Test signup form
- [ ] Test welcome page
- [ ] Verify responsive design

### Phase 3: Platform Admin Deployment

#### 3.1 Netlify Deployment (Recommended)
- [ ] Connect GitHub repository
- [ ] Configure build settings
  - Base Directory: `apps/platform-admin`
  - Build Command: `pnpm build`
  - Publish Directory: `dist`
- [ ] Add environment variables
- [ ] Configure custom domain: `admin.smartequiz.com`
- [ ] Set up redirects for SPA
- [ ] Deploy

**Redirect Rules (_redirects file):**
```
/*    /index.html   200
```

#### 3.2 Alternative: AWS S3 + CloudFront
- [ ] Create S3 bucket
- [ ] Configure static website hosting
- [ ] Set up CloudFront distribution
- [ ] Configure custom domain
- [ ] Deploy build files

**Build Command:**
```bash
cd apps/platform-admin && pnpm install && pnpm build
```

**Test Deployment:**
- [ ] Visit https://admin.smartequiz.com
- [ ] Test authentication
- [ ] Test dashboard
- [ ] Test tenant management
- [ ] Verify data tables work

### Phase 4: Tenant App Deployment

#### 4.1 Vercel with Wildcard Domain (Recommended)
- [ ] Connect GitHub repository
- [ ] Configure project settings
  - Root Directory: `apps/tenant-app`
  - Framework: Vite
  - Build Command: `pnpm build`
  - Output Directory: `dist`
- [ ] Add environment variables
- [ ] Configure wildcard domain: `*.smartequiz.com`
- [ ] Set up wildcard SSL certificate
- [ ] Configure SPA routing
- [ ] Deploy

**vercel.json:**
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

#### 4.2 DNS Configuration
- [ ] Add CNAME record: `*.smartequiz.com` → Vercel
- [ ] Verify SSL certificate

**Build Command:**
```bash
cd apps/tenant-app && pnpm install && pnpm build
```

**Test Deployment:**
- [ ] Visit https://demo.smartequiz.com
- [ ] Test subdomain detection
- [ ] Test tenant loading
- [ ] Test authentication
- [ ] Test main features
- [ ] Try different subdomains

### Phase 5: Database Setup

#### 5.1 Schema Creation
```sql
-- Create tenants table
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  subdomain VARCHAR(100) UNIQUE NOT NULL,
  plan VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  max_users INTEGER NOT NULL,
  max_questions_per_tournament INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(tenant_id, email)
);

-- Create indexes
CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_tenants_subdomain ON tenants(subdomain);

-- Row-level security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON users
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
```

#### 5.2 Migrations
- [ ] Set up migration tool (Prisma/TypeORM)
- [ ] Create initial migration
- [ ] Run migrations on production DB
- [ ] Verify schema
- [ ] Seed initial data

### Phase 6: Authentication Setup

#### 6.1 Auth0 / Supabase / Custom JWT
- [ ] Configure authentication provider
- [ ] Set up OAuth callbacks
- [ ] Configure JWT secrets
- [ ] Set up password policies
- [ ] Configure MFA (optional)
- [ ] Set up email verification

#### 6.2 Update Apps
- [ ] Connect marketing site to auth
- [ ] Connect platform admin to auth
- [ ] Connect tenant app to auth
- [ ] Test login flows
- [ ] Test logout
- [ ] Test password reset

### Phase 7: Payment Integration

#### 7.1 Stripe Setup
- [ ] Create Stripe account
- [ ] Configure products and prices
  - [ ] Starter Plan: $19/month
  - [ ] Professional Plan: $49/month
  - [ ] Enterprise Plan: $149/month
- [ ] Set up webhooks
- [ ] Configure payment success/cancel URLs
- [ ] Test in test mode

#### 7.2 Update Marketing Site
- [ ] Add Stripe checkout
- [ ] Handle payment callbacks
- [ ] Update signup flow
- [ ] Test complete signup → payment → tenant creation flow

### Phase 8: CI/CD Pipeline

#### 8.1 GitHub Actions Workflow
```yaml
name: Deploy Smart eQuiz Platform

on:
  push:
    branches: [main, staging]

jobs:
  build-packages:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
        with:
          version: 10.20.0
      - uses: actions/setup-node@v3
        with:
          node-version: 22
          cache: 'pnpm'
      - run: pnpm install
      - run: cd packages/types && pnpm build
      - run: cd packages/utils && pnpm build

  deploy-marketing:
    needs: build-packages
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: cd apps/marketing-site && pnpm build
      - uses: vercel/action@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          
  # Similar for admin and tenant apps
```

### Phase 9: Monitoring & Logging

#### 9.1 Application Monitoring
- [ ] Set up Sentry for error tracking
- [ ] Configure logging (Winston/Pino)
- [ ] Set up uptime monitoring (Pingdom/UptimeRobot)
- [ ] Configure alerts

#### 9.2 Analytics
- [ ] Add Google Analytics
- [ ] Add Mixpanel/Amplitude
- [ ] Set up custom events
- [ ] Create dashboards

### Phase 10: Testing

#### 10.1 Automated Tests
- [ ] Unit tests for shared packages
- [ ] Integration tests for APIs
- [ ] E2E tests for critical flows
- [ ] Run all tests in CI

#### 10.2 Manual Testing
- [ ] Test complete signup flow
- [ ] Test tenant creation
- [ ] Test admin dashboard
- [ ] Test tenant app features
- [ ] Test on multiple browsers
- [ ] Test on mobile devices

---

## 🔐 Security Checklist

### Infrastructure
- [ ] Enable HTTPS (SSL certificates)
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable DDoS protection (Cloudflare)
- [ ] Configure security headers
- [ ] Set up WAF (Web Application Firewall)

### Application
- [ ] Sanitize user inputs
- [ ] Use parameterized queries
- [ ] Implement CSRF protection
- [ ] Secure session management
- [ ] Hash passwords (bcrypt)
- [ ] Validate JWT tokens
- [ ] Implement tenant isolation

### Data
- [ ] Encrypt data at rest
- [ ] Encrypt data in transit
- [ ] Regular database backups
- [ ] Set up backup retention policy
- [ ] Test backup restoration

---

## 📊 Performance Optimization

### Frontend
- [ ] Enable code splitting
- [ ] Optimize images
- [ ] Enable caching
- [ ] Minify CSS/JS
- [ ] Use CDN for static assets
- [ ] Implement lazy loading

### Backend
- [ ] Database query optimization
- [ ] Implement caching (Redis)
- [ ] Use connection pooling
- [ ] Optimize API responses
- [ ] Enable compression

---

## 📝 Documentation

### User Documentation
- [ ] Create user guides
- [ ] Write API documentation
- [ ] Create video tutorials
- [ ] Set up help center

### Developer Documentation
- [ ] API reference
- [ ] Architecture diagrams
- [ ] Deployment guide
- [ ] Troubleshooting guide

---

## 🎯 Go-Live Checklist

### Final Verification
- [ ] All tests passing
- [ ] No critical bugs
- [ ] Performance acceptable
- [ ] Security audit complete
- [ ] Backups configured
- [ ] Monitoring active

### Launch
- [ ] Deploy to production
- [ ] Verify all services running
- [ ] Test critical paths
- [ ] Monitor for errors
- [ ] Announce launch

### Post-Launch
- [ ] Monitor logs for 24-48 hours
- [ ] Track user signups
- [ ] Collect feedback
- [ ] Fix any issues
- [ ] Plan next iteration

---

## 📞 Support & Maintenance

### Daily
- [ ] Check error logs
- [ ] Monitor uptime
- [ ] Review user feedback

### Weekly
- [ ] Security updates
- [ ] Dependency updates
- [ ] Performance review
- [ ] Backup verification

### Monthly
- [ ] Security audit
- [ ] Performance optimization
- [ ] Feature planning
- [ ] User satisfaction survey

---

## 🚨 Rollback Plan

If deployment fails:

1. **Immediate:** Revert DNS to previous version
2. **Database:** Restore from backup if needed
3. **Code:** Revert to previous commit
4. **Notify:** Alert users of maintenance
5. **Debug:** Identify and fix issue
6. **Redeploy:** When ready

---

## ✅ Current Status

**Development:** ✅ Complete  
**Testing:** 🟡 Pending  
**Staging:** 🔴 Not deployed  
**Production:** 🔴 Not deployed

**Next Action:** Set up backend API and database

---

**Last Updated:** November 16, 2025  
**Version:** 1.0.0  
**Prepared by:** Development Team
