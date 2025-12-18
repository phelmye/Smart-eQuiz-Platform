# Custom Domain Configuration Guide

## Current Status
❌ `www.smartequiz.com` → Showing cPanel default page (not configured)
❌ `api.smartequiz.com` → Not configured yet
⏳ DNS records need to be added

## Recommended Domain Structure

```
www.smartequiz.com           → Marketing Site (Next.js on Vercel)
smartequiz.com               → Redirects to www
api.smartequiz.com           → Backend API (NestJS on Render)
admin.smartequiz.com         → Platform Admin (React on Vercel)
{tenant}.smartequiz.com      → Tenant App (React on Vercel - wildcard)
```

---

## Step-by-Step Setup

### 1. Configure Backend API: api.smartequiz.com

#### In Render Dashboard:
1. Go to https://dashboard.render.com
2. Click on your `smart-equiz-api` service
3. Settings → **Custom Domains**
4. Click **Add Custom Domain**
5. Enter: `api.smartequiz.com`
6. Render will display:
   ```
   Add this CNAME record to your DNS:
   Name: api
   Value: smart-equiz-api.onrender.com
   ```

#### In Your DNS Provider (e.g., Namecheap, GoDaddy, Cloudflare):
1. Log in to your domain registrar
2. Go to DNS Management for `smartequiz.com`
3. Add new record:
   - **Type**: CNAME
   - **Host/Name**: `api`
   - **Value/Target**: `smart-equiz-api.onrender.com`
   - **TTL**: 3600 (or Automatic)
4. **Save changes**

#### Verification (wait 5-30 min for DNS propagation):
```bash
# Test DNS resolution
nslookup api.smartequiz.com

# Test API endpoint (after DNS propagates)
curl https://api.smartequiz.com/api/health
```

Expected: `{"status":"ok","timestamp":"..."}`

---

### 2. Configure Marketing Site: www.smartequiz.com

#### In Vercel Dashboard:
1. Go to https://vercel.com/dashboard
2. Select your **marketing-site** project
3. Settings → **Domains**
4. Click **Add Domain**
5. Enter: `www.smartequiz.com`
6. Click **Add**
7. Vercel will show DNS instructions

8. **Add another domain**: `smartequiz.com` (root)
   - This will auto-redirect to www

#### In Your DNS Provider:
1. For **www subdomain**:
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

2. For **root domain** (smartequiz.com):
   ```
   Type: A
   Name: @ (or leave blank)
   Value: 76.76.21.21
   ```

3. **Save all changes**

#### Remove Old Hosting:
If `www.smartequiz.com` is currently pointing to cPanel/hosting:
1. Delete the old A record pointing to hosting IP
2. Replace with CNAME to Vercel

---

### 3. Update Backend CORS Configuration

Once `api.smartequiz.com` is working:

#### In Render Dashboard:
1. Go to your API service
2. Environment tab
3. Find or add `FRONTEND_URL` variable
4. Update value to:
   ```
   FRONTEND_URL=https://www.smartequiz.com
   ```
5. Click **Save** (service will redeploy automatically)

---

### 4. Update Frontend API URL

#### In Vercel (marketing-site):
1. Settings → Environment Variables
2. Find `NEXT_PUBLIC_API_URL`
3. Update value to:
   ```
   NEXT_PUBLIC_API_URL=https://api.smartequiz.com
   ```
4. **Important**: Select all environments (Production, Preview, Development)
5. Click **Save**
6. Go to Deployments → Latest → Redeploy

---

### 5. Configure Platform Admin (Optional)

#### In Vercel:
1. Create or select platform-admin project
2. Settings → Domains
3. Add: `admin.smartequiz.com`

#### In DNS Provider:
```
Type: CNAME
Name: admin
Value: cname.vercel-dns.com
```

---

### 6. Configure Tenant App with Wildcard (Advanced)

For multi-tenant subdomains like `church1.smartequiz.com`, `church2.smartequiz.com`:

#### In Vercel (tenant-app project):
1. Settings → Domains
2. Add: `*.smartequiz.com` (wildcard)

#### In DNS Provider:
```
Type: CNAME
Name: *
Value: cname.vercel-dns.com
```

⚠️ **Warning**: This requires Vercel Pro plan ($20/month) for wildcard domains.

---

## DNS Configuration Summary

### Complete DNS Records for smartequiz.com:

| Type  | Name  | Value                      | Purpose              |
|-------|-------|----------------------------|----------------------|
| A     | @     | 76.76.21.21                | Root domain          |
| CNAME | www   | cname.vercel-dns.com       | Marketing site       |
| CNAME | api   | smart-equiz-api.onrender.com | Backend API       |
| CNAME | admin | cname.vercel-dns.com       | Admin panel          |
| CNAME | *     | cname.vercel-dns.com       | Tenant apps (Pro)    |

---

## Verification Checklist

After DNS propagates (5-30 minutes):

### Backend API
- [ ] `https://api.smartequiz.com/api/health` returns 200 OK
- [ ] `https://api.smartequiz.com/api/docs` shows Swagger UI
- [ ] SSL certificate is valid (green padlock in browser)

### Marketing Site
- [ ] `https://www.smartequiz.com` loads your Next.js site
- [ ] `https://smartequiz.com` redirects to www
- [ ] SSL certificate is valid
- [ ] Dynamic content loads from API

### CORS
- [ ] Browser console shows no CORS errors
- [ ] API calls from www.smartequiz.com succeed

---

## Troubleshooting

### DNS Not Propagating
```bash
# Check DNS propagation globally
# Visit: https://www.whatsmydns.net
# Enter: api.smartequiz.com
```

### SSL Certificate Issues
- **Render**: Auto-provisions after DNS propagates (wait 10-30 min)
- **Vercel**: Auto-provisions immediately after DNS verified

### CORS Errors
Check `FRONTEND_URL` in Render matches exactly:
```
https://www.smartequiz.com
```
No trailing slash, include https://

### API Not Responding
1. Verify CNAME points to correct Render URL
2. Check Render custom domain status (Settings → Custom Domains)
3. Ensure Render service is running (not sleeping)

---

## Cost Impact

### Current (Free Tier):
- Render API: Free (sleeps after 15 min)
- Vercel: Free (standard domains)
- **Total**: $0/month

### With Custom Domains:
- Render API + Custom Domain: Free (SSL included)
- Vercel + Custom Domains: Free (SSL included)
- **Total**: $0/month

### For Production (Recommended):
- Render Starter: $7/month (always-on API)
- Vercel Pro: $20/month (required for wildcard *.smartequiz.com)
- **Total**: $27/month

Or use standard subdomains (no wildcard) and stay on Vercel free tier:
- Render Starter: $7/month
- Vercel Hobby: Free
- **Total**: $7/month

---

## Next Steps

1. **Add DNS records** (steps above) - takes 5-30 minutes
2. **Verify propagation** - use nslookup or whatsmydns.net
3. **Update environment variables** in Render and Vercel
4. **Test end-to-end** - visit www.smartequiz.com and confirm API integration
5. **Monitor** - Check Render logs for any issues

---

## Current Action Required

**Right now, you need to:**

1. **Log in to your DNS provider** (where you bought smartequiz.com)
2. **Add CNAME record**:
   - Name: `api`
   - Value: `smart-equiz-api.onrender.com`
3. **Fix www subdomain**:
   - Delete old A record pointing to hosting
   - Add CNAME pointing to `cname.vercel-dns.com`
4. **Wait 5-30 minutes** for DNS to propagate
5. **Test**: `https://api.smartequiz.com/api/health`

The cPanel default page means www.smartequiz.com is still pointing to old hosting, not Vercel.
