# Deploying Remaining Apps & Custom Domain Setup

## Current Status

✅ **Backend API**: Deployed on Render  
   - URL: https://smart-equiz-api.onrender.com
   - Custom domain needed: `api.smartequiz.com`

✅ **Marketing Site**: Deployed on Vercel  
   - Custom domain needed: `www.smartequiz.com` and `smartequiz.com`

⏳ **Platform Admin**: Not deployed yet  
   - Custom domain: `admin.smartequiz.com`

⏳ **Tenant App**: Not deployed yet  
   - Custom domain: `*.smartequiz.com` (wildcard for tenants)

---

## Step 1: Deploy Platform Admin to Vercel

### 1.1 Create New Vercel Project

1. Go to https://vercel.com/dashboard
2. Click **Add New** → **Project**
3. Click **Import Git Repository**
4. Select: `phelmye/Smart-eQuiz-Platform`
5. Click **Import**

### 1.2 Configure Platform Admin Settings

**Framework Preset**: Other (or Vite)

**Root Directory**: 
- Set to: `apps/platform-admin`
- ✅ Check: **Include source files outside of the Root Directory in the Build Step**

**Build Command**:
```bash
cd ../.. && pnpm --filter=platform-admin... build
```

**Install Command**:
```bash
corepack enable && pnpm install --frozen-lockfile --prefer-offline
```

**Output Directory**: `dist`

**Environment Variables**:
```
VITE_API_URL=https://smart-equiz-api.onrender.com
VITE_SUPABASE_URL=your_supabase_url (if using)
VITE_SUPABASE_ANON_KEY=your_supabase_key (if using)
```

### 1.3 Deploy

1. Click **Deploy**
2. Wait 2-3 minutes for build to complete
3. Note the deployment URL (e.g., `platform-admin-xyz.vercel.app`)

---

## Step 2: Deploy Tenant App to Vercel

### 2.1 Create Another Vercel Project

1. Go to https://vercel.com/dashboard
2. Click **Add New** → **Project**
3. Click **Import Git Repository**
4. Select: `phelmye/Smart-eQuiz-Platform` (again)
5. Click **Import**

### 2.2 Configure Tenant App Settings

**Framework Preset**: Other (or Vite)

**Root Directory**: 
- Set to: `apps/tenant-app`
- ✅ Check: **Include source files outside of the Root Directory in the Build Step**

**Build Command**:
```bash
cd ../.. && pnpm --filter=tenant-app... build
```

**Install Command**:
```bash
corepack enable && pnpm install --frozen-lockfile --prefer-offline
```

**Output Directory**: `dist`

**Environment Variables**:
```
VITE_API_URL=https://smart-equiz-api.onrender.com
VITE_SUPABASE_URL=your_supabase_url (if using)
VITE_SUPABASE_ANON_KEY=your_supabase_key (if using)
```

### 2.3 Deploy

1. Click **Deploy**
2. Wait 2-3 minutes for build to complete
3. Note the deployment URL (e.g., `tenant-app-xyz.vercel.app`)

---

## Step 3: Configure Custom Domains

### Complete Domain Architecture

```
smartequiz.com                  → Marketing Site (redirects to www)
www.smartequiz.com              → Marketing Site (Next.js)
api.smartequiz.com              → Backend API (NestJS on Render)
admin.smartequiz.com            → Platform Admin (React/Vite)
{tenant}.smartequiz.com         → Tenant App (React/Vite - wildcard)
```

---

### 3.1 Backend API: api.smartequiz.com

**In Render Dashboard:**

1. Go to your API service
2. Settings → **Custom Domains**
3. Click **Add Custom Domain**
4. Enter: `api.smartequiz.com`
5. Render will show:
   ```
   Add this CNAME record to your DNS:
   Name: api
   Value: smart-equiz-api.onrender.com
   ```

**In Your DNS Provider** (Namecheap, GoDaddy, Cloudflare, etc.):

1. Log in to DNS management for `smartequiz.com`
2. Add CNAME record:
   - **Type**: CNAME
   - **Host/Name**: `api`
   - **Value**: `smart-equiz-api.onrender.com`
   - **TTL**: 3600
3. Save

**Verification** (wait 5-30 min):
```bash
nslookup api.smartequiz.com
curl https://api.smartequiz.com/api/health
```

---

### 3.2 Marketing Site: www.smartequiz.com

**In Vercel Dashboard:**

1. Go to your marketing-site project
2. Settings → **Domains**
3. Click **Add Domain**
4. Enter: `www.smartequiz.com`
5. Click **Add**
6. Vercel will show DNS instructions

7. Add another domain: `smartequiz.com` (root)
   - This will auto-redirect to www

**In Your DNS Provider:**

1. **For www subdomain**:
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   TTL: 3600
   ```

2. **For root domain** (smartequiz.com):
   ```
   Type: A
   Name: @ (or leave blank)
   Value: 76.76.21.21
   TTL: 3600
   ```

**Note**: Delete any existing A or CNAME records for www before adding new ones.

---

### 3.3 Platform Admin: admin.smartequiz.com

**In Vercel Dashboard:**

1. Go to your platform-admin project
2. Settings → **Domains**
3. Click **Add Domain**
4. Enter: `admin.smartequiz.com`
5. Click **Add**

**In Your DNS Provider:**

```
Type: CNAME
Name: admin
Value: cname.vercel-dns.com
TTL: 3600
```

---

### 3.4 Tenant App: *.smartequiz.com (Wildcard)

⚠️ **Important**: Wildcard domains require **Vercel Pro plan** ($20/month)

#### Option A: Vercel Pro (Wildcard)

**In Vercel Dashboard:**

1. Upgrade to Pro plan (if not already)
2. Go to your tenant-app project
3. Settings → **Domains**
4. Click **Add Domain**
5. Enter: `*.smartequiz.com`
6. Click **Add**

**In Your DNS Provider:**

```
Type: CNAME
Name: *
Value: cname.vercel-dns.com
TTL: 3600
```

**Result**: Any subdomain like `church1.smartequiz.com`, `demo.smartequiz.com` will route to tenant app.

#### Option B: Free Tier (Individual Subdomains)

If you want to stay on free tier, add subdomains manually:

**In Vercel Dashboard:**

1. Go to your tenant-app project
2. Settings → **Domains**
3. Add domains one by one:
   - `demo.smartequiz.com`
   - `tenant1.smartequiz.com`
   - `tenant2.smartequiz.com`
   - etc.

**In Your DNS Provider:**

Add CNAME for each:
```
Type: CNAME
Name: demo
Value: cname.vercel-dns.com

Type: CNAME
Name: tenant1
Value: cname.vercel-dns.com

Type: CNAME
Name: tenant2
Value: cname.vercel-dns.com
```

**Limitation**: Must add each tenant manually before they can access their subdomain.

---

## Step 4: Complete DNS Configuration

### All DNS Records for smartequiz.com

| Type  | Name  | Value                          | Purpose              | Priority |
|-------|-------|--------------------------------|----------------------|----------|
| A     | @     | 76.76.21.21                    | Root domain          | High     |
| CNAME | www   | cname.vercel-dns.com           | Marketing site       | High     |
| CNAME | api   | smart-equiz-api.onrender.com   | Backend API          | High     |
| CNAME | admin | cname.vercel-dns.com           | Admin panel          | Medium   |
| CNAME | *     | cname.vercel-dns.com           | Tenant apps (Pro)    | Medium   |

**OR** (Free tier - individual tenants):

| Type  | Name   | Value                | Purpose         |
|-------|--------|----------------------|-----------------|
| CNAME | demo   | cname.vercel-dns.com | Demo tenant     |
| CNAME | test   | cname.vercel-dns.com | Test tenant     |
| CNAME | church1| cname.vercel-dns.com | Tenant 1        |
| CNAME | church2| cname.vercel-dns.com | Tenant 2        |

---

## Step 5: Update CORS Configuration

Once custom domains are active, update backend CORS:

**In Render Dashboard:**

1. Go to API service → Environment tab
2. Update `FRONTEND_URL`:
   ```
   FRONTEND_URL=https://www.smartequiz.com
   ```
3. For multiple origins, update your NestJS code:

**In `services/api/src/main.ts`:**

```typescript
app.enableCors({
  origin: [
    'https://www.smartequiz.com',
    'https://smartequiz.com',
    'https://admin.smartequiz.com',
    /^https:\/\/.*\.smartequiz\.com$/, // Wildcard for tenants
  ],
  credentials: true,
});
```

Commit and push, Render will auto-deploy.

---

## Step 6: Update Environment Variables

### Marketing Site

Vercel → marketing-site → Settings → Environment Variables:
```
NEXT_PUBLIC_API_URL=https://api.smartequiz.com
```
Redeploy after updating.

### Platform Admin

Vercel → platform-admin → Settings → Environment Variables:
```
VITE_API_URL=https://api.smartequiz.com
```
Redeploy after updating.

### Tenant App

Vercel → tenant-app → Settings → Environment Variables:
```
VITE_API_URL=https://api.smartequiz.com
```
Redeploy after updating.

---

## Step 7: SSL Certificates

**Good news**: Both Vercel and Render automatically provision SSL certificates!

- **Vercel**: Certificates issued within minutes after DNS propagation
- **Render**: Certificates issued within 10-30 minutes after DNS propagation

**Check SSL Status:**
- Vercel: Settings → Domains → Look for green "Valid" status
- Render: Settings → Custom Domains → Look for "Active" status

---

## Step 8: Verification Checklist

After DNS propagates (5-30 minutes), verify everything works:

### Backend API
- [ ] `https://api.smartequiz.com/api/health` returns 200 OK
- [ ] `https://api.smartequiz.com/api/docs` shows Swagger UI
- [ ] SSL certificate valid (green padlock)

### Marketing Site
- [ ] `https://www.smartequiz.com` loads correctly
- [ ] `https://smartequiz.com` redirects to www
- [ ] Logo visible
- [ ] Dynamic content loads (if CMS populated)
- [ ] SSL certificate valid

### Platform Admin
- [ ] `https://admin.smartequiz.com` loads React app
- [ ] Can access login page
- [ ] No CORS errors in console
- [ ] SSL certificate valid

### Tenant App
- [ ] `https://demo.smartequiz.com` loads tenant app (or your first tenant)
- [ ] Or `https://church1.smartequiz.com` if using manual subdomains
- [ ] Can access login page
- [ ] No CORS errors in console
- [ ] SSL certificate valid

---

## Step 9: Deployment Configuration Files

Your apps already have the correct `vercel.json` files. Ensure they match:

### apps/platform-admin/vercel.json

```json
{
  "buildCommand": "cd ../.. && pnpm --filter=platform-admin... build",
  "installCommand": "corepack enable && pnpm install --frozen-lockfile --prefer-offline",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### apps/tenant-app/vercel.json

```json
{
  "buildCommand": "cd ../.. && pnpm --filter=tenant-app... build",
  "installCommand": "corepack enable && pnpm install --frozen-lockfile --prefer-offline",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

---

## Troubleshooting

### DNS Not Propagating

Check propagation globally: https://www.whatsmydns.net

Enter your domain (e.g., `api.smartequiz.com`) and check if CNAME is visible worldwide.

### SSL Certificate Not Issuing

**Vercel**: 
- Ensure DNS is correct
- May take up to 30 minutes
- Check Settings → Domains for status

**Render**:
- DNS must propagate first
- Can take 10-30 minutes
- Check Settings → Custom Domains for "Active" status

### CORS Errors

Update `services/api/src/main.ts` to include all your domains in the CORS origin array, then redeploy.

### Build Failures

**"Cannot find module '@smart-equiz/types'"**:
- Ensure Root Directory is set correctly
- Check "Include source files outside" is enabled
- Verify build command includes `...` suffix: `--filter=app...`

### 404 on Routes (SPA Routing)

Ensure `rewrites` in vercel.json includes:
```json
{
  "source": "/(.*)",
  "destination": "/index.html"
}
```

---

## Cost Summary

### Current (Free Tier)
- ✅ Render API: Free (sleeps after 15 min inactivity)
- ✅ Vercel: Free for 3 projects (with manual tenant subdomains)
- **Total**: $0/month

### Production (Recommended)
- Render API Starter: $7/month (always-on)
- Vercel Hobby: Free (3 projects, manual subdomains)
- **Total**: $7/month

### Production with Wildcard Tenants
- Render API Starter: $7/month
- Vercel Pro: $20/month (wildcard domains)
- **Total**: $27/month

---

## Quick Reference

### Vercel Projects to Create

1. **marketing-site** (already exists)
   - Root: `apps/marketing-site`
   - Domains: `www.smartequiz.com`, `smartequiz.com`

2. **platform-admin** (create new)
   - Root: `apps/platform-admin`
   - Domain: `admin.smartequiz.com`

3. **tenant-app** (create new)
   - Root: `apps/tenant-app`
   - Domains: `*.smartequiz.com` (Pro) OR `demo.smartequiz.com`, etc. (Free)

### DNS Records to Add

```
# Core
A     @     76.76.21.21
CNAME www   cname.vercel-dns.com
CNAME api   smart-equiz-api.onrender.com
CNAME admin cname.vercel-dns.com

# Tenants (choose one):
CNAME *     cname.vercel-dns.com  # Pro plan
# OR
CNAME demo  cname.vercel-dns.com  # Free tier
CNAME test  cname.vercel-dns.com  # Free tier
```

---

## Next Steps

1. **Deploy platform-admin** following Step 1
2. **Deploy tenant-app** following Step 2
3. **Add DNS records** following Step 4
4. **Wait for propagation** (5-30 minutes)
5. **Update CORS** following Step 5
6. **Update env vars** following Step 6
7. **Verify all domains** following Step 8

Good luck! 🚀
