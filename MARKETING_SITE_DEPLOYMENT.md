# Marketing Site - Vercel Deployment Guide

## Current Status

✅ **Backend API**: Deployed at https://smart-equiz-api.onrender.com
✅ **CMS Content**: 26+ items populated
✅ **Local Development**: Running successfully at http://localhost:3000

## What's Next: Deploy Marketing Site to Vercel

### Option 1: Deploy via Vercel CLI (Recommended)

1. **Install Vercel CLI** (if not already installed):
```powershell
npm install -g vercel
```

2. **Login to Vercel**:
```powershell
vercel login
```

3. **Navigate to marketing site**:
```powershell
cd apps/marketing-site
```

4. **Deploy to production**:
```powershell
vercel --prod
```

5. **Set environment variable** (when prompted or after deployment):
```powershell
vercel env add NEXT_PUBLIC_API_URL production
# Enter: https://smart-equiz-api.onrender.com/api
```

### Option 2: Deploy via Vercel Dashboard

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard

2. **Import Project**:
   - Click "Add New..." → "Project"
   - Import from Git repository
   - Select "Smart eQuiz Platform" repository
   - Framework Preset: **Next.js**
   - Root Directory: **apps/marketing-site**

3. **Configure Build Settings**:
   - Build Command: `cd ../.. && pnpm --filter=marketing-site... build`
   - Install Command: `corepack enable && pnpm install --no-frozen-lockfile`
   - Output Directory: `.next`

4. **Add Environment Variable**:
   - Key: `NEXT_PUBLIC_API_URL`
   - Value: `https://smart-equiz-api.onrender.com/api`
   - Environments: ✓ Production ✓ Preview ✓ Development

5. **Deploy**: Click "Deploy"

### Option 3: Deploy via GitHub Actions (Automated)

If you have CI/CD set up, push to `main` branch and deployment will happen automatically.

## After Deployment

### 1. Test the Production Site

Visit your Vercel URL (e.g., `https://smart-equiz-marketing.vercel.app`)

**Pages to verify**:
- `/` - Homepage (hero, features, testimonials)
- `/features` - Features list from CMS
- `/pricing` - Pricing plans from CMS
- `/blog` - Blog posts from CMS
- `/faq` - FAQs from CMS

### 2. Configure Custom Domain (Optional)

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add domain: `www.smartequiz.com` and `smartequiz.com`
3. Follow DNS configuration instructions
4. Wait for DNS propagation (5-60 minutes)

### 3. Enable Analytics & Monitoring

1. **Vercel Analytics**:
   - Go to Settings → Analytics
   - Enable Web Analytics

2. **Sentry Error Tracking** (Already configured):
   - Errors will be reported to Sentry automatically
   - Check dashboard at https://sentry.io

## Troubleshooting

### Build Fails

**Error**: "Cannot find module '@smart-equiz/types'"
**Solution**: Ensure shared packages are built first
```powershell
cd packages/types && pnpm build
cd ../utils && pnpm build
```

### API Connection Issues

**Error**: API requests failing
**Solution**: Verify environment variable is set correctly
```powershell
vercel env ls
```

### Stale Content

**Issue**: Changes not reflecting
**Solution**: Clear Vercel cache and redeploy
```powershell
vercel --force
```

## Current Content Summary

✅ **Hero**: 1 section (Transform Your Bible Quiz Ministry)
✅ **Features**: 24 items (Real-Time Scoring, AI Generation, etc.)
✅ **Testimonials**: 16 items from various churches
✅ **Pricing Plans**: 3 tiers (Starter $29, Professional $79, Enterprise $199)
✅ **FAQs**: 18 questions covering general, billing, technical topics
✅ **Blog Posts**: 6 articles on tips, benefits, tutorials

## Next Apps to Deploy

After marketing site is live:

1. **Platform Admin** (`apps/platform-admin`)
   - Subdomain: `admin.smartequiz.com`
   - Purpose: Super admin dashboard
   - Environment: `VITE_API_URL=https://smart-equiz-api.onrender.com/api`

2. **Tenant App** (`apps/tenant-app`)
   - Wildcard: `*.smartequiz.com`
   - Purpose: Multi-tenant quiz platform
   - Environment: `VITE_API_URL=https://smart-equiz-api.onrender.com/api`

## Support

- **API Documentation**: https://smart-equiz-api.onrender.com/api/docs
- **Vercel Support**: https://vercel.com/support
- **Project Repo**: https://github.com/yourusername/smart-equiz-platform
