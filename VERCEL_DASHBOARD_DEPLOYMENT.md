# Vercel Dashboard Deployment Guide

## ⚠️ CLI Authentication Issue

The Vercel CLI is experiencing network connectivity issues. Use the **Vercel Dashboard** for deployment instead.

---

## 🚀 Deploy via Vercel Dashboard (Recommended)

### Step 1: Deploy Marketing Site

1. **Visit**: https://vercel.com/new

2. **Import Git Repository**:
   - Click "Add New..." → "Project"
   - Select "Import Git Repository"
   - If not connected, connect your GitHub/GitLab account
   - Select the "Smart eQuiz Platform" repository

3. **Configure Project**:
   ```
   Project Name: smart-equiz-marketing
   Framework Preset: Next.js
   Root Directory: apps/marketing-site
   ```

4. **Build Settings**:
   ```
   Build Command: cd ../.. && pnpm install && pnpm --filter=marketing-site build
   Output Directory: .next
   Install Command: pnpm install
   ```

5. **Environment Variables**:
   ```
   NEXT_PUBLIC_API_URL = https://smart-equiz-api.onrender.com/api
   ```
   - Select: ✓ Production ✓ Preview ✓ Development

6. **Click "Deploy"** - Wait 3-5 minutes

7. **Get Production URL**: Copy the URL (e.g., `https://smart-equiz-marketing.vercel.app`)

---

### Step 2: Deploy Platform Admin

1. **Visit**: https://vercel.com/new

2. **Import Same Repository**:
   - Click "Add New..." → "Project"
   - Select "Smart eQuiz Platform" repository again

3. **Configure Project**:
   ```
   Project Name: smart-equiz-platform-admin
   Framework Preset: Vite
   Root Directory: apps/platform-admin
   ```

4. **Build Settings**:
   ```
   Build Command: cd ../.. && pnpm install && pnpm --filter=platform-admin build
   Output Directory: dist
   Install Command: pnpm install
   ```

5. **Environment Variables**:
   ```
   VITE_API_URL = https://smart-equiz-api.onrender.com/api
   ```

6. **Advanced Settings** - Add rewrite rule:
   - Go to Settings → Rewrites after deployment
   - Add: Source: `/*` → Destination: `/index.html`

7. **Click "Deploy"**

---

### Step 3: Deploy Tenant App

1. **Visit**: https://vercel.com/new

2. **Import Same Repository**:
   - Select "Smart eQuiz Platform" repository

3. **Configure Project**:
   ```
   Project Name: smart-equiz-tenant-app
   Framework Preset: Vite
   Root Directory: apps/tenant-app
   ```

4. **Build Settings**:
   ```
   Build Command: cd ../.. && pnpm install && pnpm --filter=tenant-app build
   Output Directory: dist
   Install Command: pnpm install
   ```

5. **Environment Variables**:
   ```
   VITE_API_URL = https://smart-equiz-api.onrender.com/api
   ```

6. **Advanced Settings** - Add rewrite rule:
   - Source: `/*` → Destination: `/index.html`

7. **Click "Deploy"**

---

## ✅ Verification Checklist

### Marketing Site
- [ ] Visit production URL
- [ ] Homepage loads with hero content
- [ ] Logo displays in header and footer
- [ ] /features page shows 24 features
- [ ] /pricing page shows 3 plans
- [ ] /blog page shows 6 posts

### Platform Admin
- [ ] Visit production URL
- [ ] Login page displays
- [ ] Can connect to API

### Tenant App
- [ ] Visit production URL
- [ ] App loads correctly
- [ ] API connection works

---

## 🌐 Custom Domains (Optional)

### Marketing Site (www.smartequiz.com)

1. Go to Project → Settings → Domains
2. Add domain: `www.smartequiz.com`
3. Configure DNS:
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

### Platform Admin (admin.smartequiz.com)

1. Go to Project → Settings → Domains
2. Add domain: `admin.smartequiz.com`
3. Configure DNS:
   ```
   Type: CNAME
   Name: admin
   Value: cname.vercel-dns.com
   ```

### Tenant App (*.smartequiz.com)

**Requires Vercel Pro Plan ($20/month)**

1. Go to Project → Settings → Domains
2. Add wildcard: `*.smartequiz.com`
3. Configure DNS:
   ```
   Type: CNAME
   Name: *
   Value: cname.vercel-dns.com
   ```

---

## 📋 Production URLs

After deployment, your apps will be available at:

- **Marketing**: https://smart-equiz-marketing.vercel.app
- **Platform Admin**: https://smart-equiz-platform-admin.vercel.app
- **Tenant App**: https://smart-equiz-tenant-app.vercel.app

---

## 🔧 Troubleshooting

### Build Fails: pnpm not found

**Solution**: Change Install Command to:
```
npm install -g pnpm && pnpm install
```

### Build Fails: Cannot find workspace

**Solution**: Ensure Root Directory is set correctly:
- Marketing: `apps/marketing-site`
- Platform Admin: `apps/platform-admin`
- Tenant App: `apps/tenant-app`

### Environment Variable Not Working

**Solution**: 
1. Go to Settings → Environment Variables
2. Verify variable name matches exactly
3. Redeploy: Deployments → ⋮ → Redeploy

### Logo Not Showing

**Status**: ✅ Fixed - Using inline SVG (no external file needed)

---

## 🎉 Success!

Once all three apps are deployed:

1. **Test all production URLs**
2. **Share the URLs** for feedback
3. **Monitor performance** in Vercel Analytics
4. **Configure custom domains** when ready

---

**Created**: December 21, 2025
**Method**: Vercel Dashboard (recommended over CLI)
