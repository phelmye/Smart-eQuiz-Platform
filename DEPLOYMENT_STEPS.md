# Complete Deployment Guide - All Three Apps

## ✅ Pre-Deployment Checklist

- [x] Backend API deployed: https://smart-equiz-api.onrender.com
- [x] CMS content loaded: 26+ items (hero, features, testimonials, pricing, FAQs, blog)
- [x] Logo fix complete: Inline SVG (works everywhere)
- [x] Local development working: All pages tested
- [x] Vercel CLI installed: v50.1.3

## 🚀 Deployment Steps

### Step 1: Deploy Marketing Site (www.smartequiz.com)

1. **Login to Vercel** (currently in progress):
   ```powershell
   vercel login
   # Press ENTER and follow browser prompts
   ```

2. **Deploy Marketing Site**:
   ```powershell
   cd apps/marketing-site
   vercel --prod
   ```

3. **Answer prompts**:
   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N**
   - What's your project's name? **smart-equiz-marketing**
   - In which directory is your code located? **./**
   - Want to modify settings? **N**

4. **Set environment variable** (after deployment):
   ```powershell
   vercel env add NEXT_PUBLIC_API_URL production
   # When prompted, enter: https://smart-equiz-api.onrender.com/api
   ```

5. **Redeploy with env var**:
   ```powershell
   vercel --prod
   ```

### Step 2: Deploy Platform Admin (admin.smartequiz.com)

1. **Navigate and deploy**:
   ```powershell
   cd ../platform-admin
   vercel --prod
   ```

2. **Answer prompts**:
   - Project name: **smart-equiz-platform-admin**
   - Directory: **./**
   - Settings: **N**

3. **Set environment variable**:
   ```powershell
   vercel env add VITE_API_URL production
   # Enter: https://smart-equiz-api.onrender.com/api
   ```

4. **Redeploy**:
   ```powershell
   vercel --prod
   ```

### Step 3: Deploy Tenant App (*.smartequiz.com)

1. **Navigate and deploy**:
   ```powershell
   cd ../tenant-app
   vercel --prod
   ```

2. **Answer prompts**:
   - Project name: **smart-equiz-tenant-app**
   - Directory: **./**
   - Settings: **N**

3. **Set environment variable**:
   ```powershell
   vercel env add VITE_API_URL production
   # Enter: https://smart-equiz-api.onrender.com/api
   ```

4. **Redeploy**:
   ```powershell
   vercel --prod
   ```

## 🌐 Custom Domain Configuration

### Marketing Site (www.smartequiz.com)

1. Go to: https://vercel.com/dashboard → smart-equiz-marketing → Settings → Domains
2. Add domains:
   - `www.smartequiz.com`
   - `smartequiz.com` (redirects to www)
3. Configure DNS:
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   
   Type: A
   Name: @
   Value: 76.76.21.21
   ```

### Platform Admin (admin.smartequiz.com)

1. Go to: https://vercel.com/dashboard → smart-equiz-platform-admin → Settings → Domains
2. Add domain: `admin.smartequiz.com`
3. Configure DNS:
   ```
   Type: CNAME
   Name: admin
   Value: cname.vercel-dns.com
   ```

### Tenant App (*.smartequiz.com)

1. Go to: https://vercel.com/dashboard → smart-equiz-tenant-app → Settings → Domains
2. Add wildcard domain: `*.smartequiz.com`
3. Configure DNS:
   ```
   Type: CNAME
   Name: *
   Value: cname.vercel-dns.com
   ```

**Note**: Wildcard domain requires Vercel Pro plan ($20/month)

## ✅ Post-Deployment Verification

### Marketing Site
- [ ] Visit production URL (e.g., https://smart-equiz-marketing.vercel.app)
- [ ] Verify homepage loads with hero content
- [ ] Check /features page shows 24 features
- [ ] Check /pricing shows 3 plans
- [ ] Check /blog shows 6 posts
- [ ] Verify logo displays in header and footer

### Platform Admin
- [ ] Visit production URL
- [ ] Test login functionality
- [ ] Verify API connection works

### Tenant App
- [ ] Visit production URL
- [ ] Test tenant detection
- [ ] Verify multi-tenancy works

## 📋 Quick Reference

### Environment Variables (All Apps)

**Marketing Site**:
- `NEXT_PUBLIC_API_URL`: https://smart-equiz-api.onrender.com/api

**Platform Admin**:
- `VITE_API_URL`: https://smart-equiz-api.onrender.com/api

**Tenant App**:
- `VITE_API_URL`: https://smart-equiz-api.onrender.com/api

### Vercel CLI Commands

```powershell
# Check login status
vercel whoami

# Deploy to preview
vercel

# Deploy to production
vercel --prod

# View deployment logs
vercel logs [deployment-url]

# List all projects
vercel ls

# View project details
vercel inspect [deployment-url]

# Add environment variable
vercel env add [NAME] production

# List environment variables
vercel env ls
```

## 🔧 Troubleshooting

### Build Fails: "Cannot find module '@smart-equiz/types'"

**Solution**: Ensure build command includes root installation:
```json
{
  "buildCommand": "cd ../.. && pnpm install && pnpm --filter=[app-name] build"
}
```

### API Connection Fails

**Check**:
1. Environment variable is set correctly
2. API URL includes `/api` suffix
3. Vercel deployment has access to external APIs (not blocked by firewall)

### Logo Not Displaying

**Status**: ✅ Fixed - using inline SVG (no file dependencies)

### Wildcard Domain Not Working

**Requirement**: Vercel Pro plan required for `*.smartequiz.com`
**Alternative**: Deploy each tenant subdomain manually (free tier)

## 📝 Next Steps After All Deployments

1. **Monitor Performance**:
   - Enable Vercel Analytics
   - Check Core Web Vitals
   - Review Edge Network distribution

2. **Enable Monitoring**:
   - Configure Sentry for error tracking
   - Set up uptime monitoring
   - Enable logging

3. **Security**:
   - Force HTTPS (enabled by default on Vercel)
   - Review CORS settings on API
   - Enable rate limiting if needed

4. **SEO**:
   - Submit sitemap to Google Search Console
   - Verify Open Graph tags
   - Check meta descriptions

5. **Documentation**:
   - Update README with production URLs
   - Document deployment process
   - Create runbook for common issues

## 🎉 Success Criteria

- [x] Backend API running: https://smart-equiz-api.onrender.com
- [ ] Marketing site deployed and accessible
- [ ] Platform admin deployed and accessible
- [ ] Tenant app deployed and accessible
- [ ] Custom domains configured (optional)
- [ ] All pages loading correctly
- [ ] API integrations working
- [ ] Logo displaying properly

---

**Created**: December 21, 2025
**Status**: In Progress - Awaiting Vercel login completion
