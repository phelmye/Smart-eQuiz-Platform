# Vercel Deployment Guide - Smart eQuiz Platform

## Overview

The Smart eQuiz Platform consists of **three separate applications** that require individual Vercel projects:

1. **Marketing Site** (`apps/marketing-site`) - Next.js 14
2. **Platform Admin** (`apps/platform-admin`) - Vite + React SPA
3. **Tenant App** (`apps/tenant-app`) - Vite + React SPA with wildcard domains

## Prerequisites

- Vercel CLI installed: `npm i -g vercel`
- GitHub repository connected to Vercel
- Custom domain configured (e.g., `smartequiz.com`)
- Environment variables prepared for each app

## Project Structure

```
Smart-eQuiz-Platform/
├── apps/
│   ├── marketing-site/      → www.smartequiz.com, smartequiz.com
│   ├── platform-admin/      → admin.smartequiz.com
│   └── tenant-app/          → *.smartequiz.com (wildcard)
├── packages/
│   ├── types/
│   └── utils/
└── services/
    └── api/
```

## Deployment Configurations

### 1. Marketing Site (Next.js 14)

**Vercel Project Settings:**
- Framework Preset: `Next.js`
- Root Directory: `apps/marketing-site`
- Build Command: `cd ../.. && pnpm build --filter=marketing-site`
- Output Directory: `.next` (auto-detected)
- Install Command: `corepack enable && corepack prepare pnpm@8.10.0 --activate && pnpm install --frozen-lockfile`
- Node.js Version: `18.x` or `20.x`

**Domains:**
- Primary: `www.smartequiz.com`
- Redirect: `smartequiz.com` → `www.smartequiz.com`

**Environment Variables:**
```bash
# Public variables (NEXT_PUBLIC_ prefix)
NEXT_PUBLIC_API_URL=https://api.smartequiz.com
NEXT_PUBLIC_APP_NAME=Smart eQuiz Platform
NEXT_PUBLIC_SUPPORT_EMAIL=support@smartequiz.com

# Analytics (optional)
NEXT_PUBLIC_GA_TRACKING_ID=
NEXT_PUBLIC_MIXPANEL_TOKEN=

# Vercel-specific
VERCEL_ENV=production
```

**vercel.json** (in `apps/marketing-site/`):
```json
{
  "framework": "nextjs",
  "buildCommand": "cd ../.. && pnpm build --filter=marketing-site",
  "installCommand": "corepack enable && corepack prepare pnpm@8.10.0 --activate && cd ../.. && pnpm install --frozen-lockfile",
  "outputDirectory": ".next",
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

---

### 2. Platform Admin (Vite SPA)

**Vercel Project Settings:**
- Framework Preset: `Vite`
- Root Directory: `apps/platform-admin`
- Build Command: `cd ../.. && pnpm build --filter=platform-admin`
- Output Directory: `dist`
- Install Command: `corepack enable && corepack prepare pnpm@8.10.0 --activate && pnpm install --frozen-lockfile`
- Node.js Version: `18.x` or `20.x`

**Domains:**
- Primary: `admin.smartequiz.com`

**Environment Variables:**
```bash
# Vite environment variables (VITE_ prefix)
VITE_API_URL=https://api.smartequiz.com
VITE_APP_NAME=Smart eQuiz - Admin
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Sentry (optional)
VITE_SENTRY_DSN=
VITE_SENTRY_ENVIRONMENT=production
```

**vercel.json** (in `apps/platform-admin/`):
```json
{
  "buildCommand": "cd ../.. && pnpm build --filter=platform-admin",
  "installCommand": "corepack enable && corepack prepare pnpm@8.10.0 --activate && cd ../.. && pnpm install --frozen-lockfile",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

---

### 3. Tenant App (Vite SPA with Wildcard Domains)

**Vercel Project Settings:**
- Framework Preset: `Vite`
- Root Directory: `apps/tenant-app`
- Build Command: `cd ../.. && pnpm build --filter=tenant-app`
- Output Directory: `dist`
- Install Command: `corepack enable && corepack prepare pnpm@8.10.0 --activate && pnpm install --frozen-lockfile`
- Node.js Version: `18.x` or `20.x`

**Domains:**
- Wildcard: `*.smartequiz.com` (requires Pro/Enterprise plan)
- Examples: 
  - `firstbaptist.smartequiz.com`
  - `gracecommunitychurch.smartequiz.com`
  - `demo.smartequiz.com`

**Custom Domain Support:**
Tenants can also use their own domains (e.g., `quiz.firstbaptist.org`):
- Add custom domain to Vercel project
- Configure DNS CNAME record
- Map custom domain to tenant in database

**Environment Variables:**
```bash
# Vite environment variables
VITE_API_URL=https://api.smartequiz.com
VITE_APP_NAME=Smart eQuiz
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_DEFAULT_TENANT=demo

# Multi-tenancy detection
VITE_ENABLE_CUSTOM_DOMAINS=true
VITE_BASE_DOMAIN=smartequiz.com

# Sentry
VITE_SENTRY_DSN=
VITE_SENTRY_ENVIRONMENT=production
```

**vercel.json** (in `apps/tenant-app/`):
```json
{
  "buildCommand": "cd ../.. && pnpm build --filter=tenant-app",
  "installCommand": "corepack enable && corepack prepare pnpm@8.10.0 --activate && cd ../.. && pnpm install --frozen-lockfile",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "SAMEORIGIN"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

---

## Deployment Steps

### Step 1: Build Shared Packages

Before deploying any app, ensure shared packages are built:

```powershell
cd packages/types
pnpm build

cd ../utils
pnpm build
```

### Step 2: Create Vercel Projects

#### Option A: Via Vercel Dashboard

1. Go to https://vercel.com/new
2. Import from GitHub: `phelmye/Smart-eQuiz-Platform`
3. Create three separate projects:
   - `smart-equiz-marketing`
   - `smart-equiz-admin`
   - `smart-equiz-tenant-app`

4. For each project:
   - Set Root Directory (e.g., `apps/marketing-site`)
   - Configure build settings (see above)
   - Add environment variables
   - Deploy

#### Option B: Via Vercel CLI

```powershell
# Marketing Site
cd apps/marketing-site
vercel --prod
# Follow prompts to link/create project

# Platform Admin
cd ../platform-admin
vercel --prod

# Tenant App
cd ../tenant-app
vercel --prod
```

### Step 3: Configure Custom Domains

**Marketing Site:**
1. Add `www.smartequiz.com` as primary domain
2. Add `smartequiz.com` and redirect to `www.smartequiz.com`

**Platform Admin:**
1. Add `admin.smartequiz.com`

**Tenant App:**
1. Add `*.smartequiz.com` (requires Vercel Pro/Enterprise)
2. Configure wildcard DNS:
   ```
   Type: A
   Name: *
   Value: 76.76.21.21 (Vercel IP)
   
   Type: AAAA
   Name: *
   Value: 2606:4700:10::6816:1515
   ```

### Step 4: Verify Deployments

Test each deployment:

```bash
# Marketing Site
curl -I https://www.smartequiz.com

# Platform Admin
curl -I https://admin.smartequiz.com

# Tenant App (multiple subdomains)
curl -I https://demo.smartequiz.com
curl -I https://firstbaptist.smartequiz.com
```

---

## CI/CD Workflow

Vercel automatically deploys:
- **Production**: Pushes to `main` branch
- **Preview**: Pull requests and other branches

**GitHub Actions Integration:**
```yaml
# .github/workflows/vercel-deploy.yml
name: Vercel Deploy
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: vercel/actions/cli@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

## Environment-Specific Configurations

### Development
- API: `http://localhost:3000`
- Marketing: `http://localhost:3000`
- Admin: `http://localhost:5173`
- Tenant App: `http://localhost:5174`

### Staging (Optional)
- API: `https://api-staging.smartequiz.com`
- Marketing: `https://staging.smartequiz.com`
- Admin: `https://admin-staging.smartequiz.com`
- Tenant App: `*.staging.smartequiz.com`

### Production
- API: `https://api.smartequiz.com`
- Marketing: `https://www.smartequiz.com`
- Admin: `https://admin.smartequiz.com`
- Tenant App: `*.smartequiz.com`

---

## Performance Optimizations

### All Apps
- Enable compression (automatic in Vercel)
- Configure caching headers
- Use CDN for static assets
- Enable HTTP/2

### Marketing Site (Next.js)
- ISR for blog posts: `revalidate: 3600`
- Static generation for landing pages
- Image optimization via `next/image`
- Font optimization

### SPAs (Admin + Tenant App)
- Code splitting enabled by Vite
- Lazy loading for routes
- Tree shaking for unused code
- Minification in production

---

## Monitoring & Analytics

### Vercel Analytics
- Enable Web Analytics in Vercel dashboard
- Track Core Web Vitals
- Monitor deployment performance

### External Monitoring
- **Sentry**: Error tracking and performance monitoring
- **Google Analytics**: User behavior tracking
- **Mixpanel**: Product analytics
- **LogRocket**: Session replay (optional)

---

## Security Considerations

### Headers
All apps include security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY` or `SAMEORIGIN`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

### SSL/TLS
- Automatic SSL certificates via Let's Encrypt
- Force HTTPS redirects
- HSTS headers (optional)

### Environment Variables
- Never commit sensitive keys
- Use Vercel Environment Variables
- Rotate keys regularly
- Use different keys per environment

---

## Troubleshooting

### Build Failures

**Error: Package not found**
```bash
# Ensure packages are built first
cd packages/types && pnpm build
cd ../utils && pnpm build
```

**Error: ENOENT: no such file or directory**
- Check Root Directory is correct
- Verify Build Command includes `cd ../..`

### Domain Configuration

**Wildcard domain not working**
- Verify Vercel plan supports wildcards (Pro/Enterprise)
- Check DNS propagation: `dig *.smartequiz.com`
- Ensure no conflicts with existing A/AAAA records

### Runtime Errors

**API connection failed**
- Verify `VITE_API_URL` or `NEXT_PUBLIC_API_URL`
- Check CORS configuration on API
- Test API endpoint directly

---

## Rollback Procedure

If a deployment has issues:

1. **Via Dashboard:**
   - Go to Deployments tab
   - Find previous working deployment
   - Click "Promote to Production"

2. **Via CLI:**
   ```bash
   vercel rollback [deployment-url]
   ```

3. **Via Git:**
   ```bash
   git revert HEAD
   git push origin main
   ```

---

## Cost Estimate

### Vercel Pricing (as of 2024)

**Hobby Plan** (Free):
- 100GB bandwidth/month
- Unlimited deployments
- No custom domains on wildcard
- **Not suitable for production**

**Pro Plan** ($20/month per project):
- 1TB bandwidth/month
- Wildcard domains supported
- Password protection
- Analytics included
- **Recommended for production**

**Enterprise Plan** (Custom pricing):
- Unlimited bandwidth
- Advanced security
- Priority support
- SLA guarantees

**Total Estimated Cost:**
- 3 projects × $20 = **$60/month**
- Or 1 team account with multiple projects

---

## Next Steps

1. ✅ Create Vercel account
2. ✅ Set up three separate projects
3. ✅ Configure environment variables
4. ✅ Add custom domains
5. ✅ Test deployments
6. ✅ Set up monitoring
7. ✅ Document rollback procedures
8. ✅ Train team on deployment process

---

## Support Resources

- Vercel Docs: https://vercel.com/docs
- Next.js Deployment: https://nextjs.org/docs/deployment
- Vite Deployment: https://vitejs.dev/guide/static-deploy.html
- Smart eQuiz Support: support@smartequiz.com
