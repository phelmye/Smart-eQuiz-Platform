# DNS Configuration Guide for go54.com

## Overview

Configure DNS records for smartequiz.com at go54.com to point all your deployed apps to their correct hosting locations.

---

## Step 1: Access go54.com DNS Management

1. Go to: **https://www.go54.com**
2. Click **Login** or **Sign In**
3. Navigate to **Domain Management** or **DNS Management**
4. Select domain: **smartequiz.com**
5. Look for **DNS Records**, **DNS Zone Editor**, or **Manage DNS**

---

## Step 2: Remove Old Records (Important!)

**Before adding new records, delete any existing records for:**
- `@` (root domain)
- `www`
- `api`
- `admin`
- `*` (wildcard)
- Any tenant subdomains (`demo`, `test`, etc.)

**Why?** Conflicting records will prevent your domains from working correctly.

---

## Step 3: Add DNS Records

### Record 1: Root Domain (smartequiz.com)

```
Type:  A
Name:  @ (or leave blank, or "smartequiz.com")
Value: 76.76.21.21
TTL:   3600 (or "Automatic")
```

**Purpose**: Makes `smartequiz.com` redirect to your marketing site

---

### Record 2: WWW Subdomain (www.smartequiz.com)

```
Type:  CNAME
Name:  www
Value: cname.vercel-dns.com
TTL:   3600
```

**Purpose**: Your main marketing website

---

### Record 3: API Subdomain (api.smartequiz.com)

```
Type:  CNAME
Name:  api
Value: smart-equiz-api.onrender.com
TTL:   3600
```

**Purpose**: Backend API hosted on Render

---

### Record 4: Admin Subdomain (admin.smartequiz.com)

```
Type:  CNAME
Name:  admin
Value: cname.vercel-dns.com
TTL:   3600
```

**Purpose**: Platform admin dashboard

---

### Record 5: Tenant App - CHOOSE ONE OPTION

#### Option A: Wildcard Domain (Vercel Pro - $20/month)

```
Type:  CNAME
Name:  *
Value: cname.vercel-dns.com
TTL:   3600
```

**Benefits:**
- ✅ ANY subdomain works automatically
- ✅ `church1.smartequiz.com`, `demo.smartequiz.com`, `newchurch.smartequiz.com` all work instantly
- ✅ No need to add DNS records for each new tenant
- ✅ Production-ready for unlimited tenants

**Requirements:**
- Must upgrade Vercel to Pro plan ($20/month)

**To use wildcard:**
1. Upgrade Vercel to Pro: https://vercel.com/account/billing
2. Add domain `*.smartequiz.com` in tenant-app Vercel project
3. Add this wildcard DNS record

---

#### Option B: Individual Subdomains (FREE)

Add a separate CNAME record for EACH tenant:

**Demo Tenant:**
```
Type:  CNAME
Name:  demo
Value: cname.vercel-dns.com
TTL:   3600
```

**Test Tenant:**
```
Type:  CNAME
Name:  test
Value: cname.vercel-dns.com
TTL:   3600
```

**Additional Tenants:**
```
Type:  CNAME
Name:  tenant1 (or church1, etc.)
Value: cname.vercel-dns.com
TTL:   3600
```

**Limitations:**
- ❌ Must add DNS record for EACH new tenant manually
- ❌ Tenant must wait 5-30 minutes for DNS to propagate
- ✅ FREE - no Vercel Pro needed

**To use individual subdomains:**
1. Add domain in Vercel tenant-app project (e.g., `demo.smartequiz.com`)
2. Add corresponding DNS record in go54.com
3. Repeat for each tenant

---

## Step 4: Summary of All Records

Here's what your DNS zone should look like after configuration:

| Type  | Name   | Value                          | TTL  | Purpose          |
|-------|--------|--------------------------------|------|------------------|
| A     | @      | 76.76.21.21                    | 3600 | Root domain      |
| CNAME | www    | cname.vercel-dns.com           | 3600 | Marketing site   |
| CNAME | api    | smart-equiz-api.onrender.com   | 3600 | Backend API      |
| CNAME | admin  | cname.vercel-dns.com           | 3600 | Admin dashboard  |
| CNAME | *      | cname.vercel-dns.com           | 3600 | Tenants (Pro)    |

**OR** (if using free tier):

| Type  | Name    | Value                          | TTL  |
|-------|---------|--------------------------------|------|
| A     | @       | 76.76.21.21                    | 3600 |
| CNAME | www     | cname.vercel-dns.com           | 3600 |
| CNAME | api     | smart-equiz-api.onrender.com   | 3600 |
| CNAME | admin   | cname.vercel-dns.com           | 3600 |
| CNAME | demo    | cname.vercel-dns.com           | 3600 |
| CNAME | test    | cname.vercel-dns.com           | 3600 |
| CNAME | tenant1 | cname.vercel-dns.com           | 3600 |

---

## Step 5: Wait for DNS Propagation

After adding all records:

- **Minimum wait**: 5-10 minutes
- **Typical wait**: 15-30 minutes
- **Maximum wait**: Up to 24 hours globally

**Check propagation status:**
- Go to: https://www.whatsmydns.net
- Enter your domain (e.g., `www.smartequiz.com`)
- Click **Search**
- Green checkmarks = propagated globally

Check each subdomain:
- `www.smartequiz.com`
- `api.smartequiz.com`
- `admin.smartequiz.com`
- `demo.smartequiz.com` (if applicable)

---

## Step 6: Verify Domains in Vercel & Render

### Verify in Vercel

**Marketing Site:**
1. Go to Vercel → marketing-site project
2. Settings → Domains
3. Check that `www.smartequiz.com` and `smartequiz.com` show "Valid" status with SSL certificate

**Platform Admin:**
1. Go to Vercel → platform-admin project
2. Settings → Domains
3. Check that `admin.smartequiz.com` shows "Valid" status with SSL certificate

**Tenant App:**
1. Go to Vercel → tenant-app project
2. Settings → Domains
3. Check that `*.smartequiz.com` (or individual domains) show "Valid" status with SSL certificate

### Verify in Render

**Backend API:**
1. Go to Render dashboard
2. Select your API service
3. Settings → Custom Domains
4. Check that `api.smartequiz.com` shows "Active" status with SSL certificate

---

## Step 7: Test All Domains

Once DNS has propagated and SSL certificates are issued, test each domain:

### Marketing Site
```bash
# In PowerShell or browser
curl https://www.smartequiz.com
curl https://smartequiz.com  # Should redirect to www
```

**Expected**: Homepage loads, logo visible, no errors

### Backend API
```bash
curl https://api.smartequiz.com/api/health
```

**Expected**: `{"status":"ok","timestamp":"..."}`

### Platform Admin
```bash
# Open in browser
https://admin.smartequiz.com
```

**Expected**: Platform admin login page, no CORS errors

### Tenant App
```bash
# Open in browser (if using wildcard)
https://demo.smartequiz.com
https://church1.smartequiz.com
https://test.smartequiz.com

# Or (if using individual subdomains)
https://demo.smartequiz.com
https://test.smartequiz.com
```

**Expected**: Tenant app loads, may show "Tenant not found" (normal - need to create tenant with that subdomain)

---

## Troubleshooting

### DNS Not Propagating

**Issue**: Domain still shows old site or "DNS_PROBE_FINISHED_NXDOMAIN"

**Solutions:**
1. Wait longer (can take up to 24 hours)
2. Flush your DNS cache:
   ```powershell
   ipconfig /flushdns
   ```
3. Check records at go54.com - verify they match exactly
4. Use different network (mobile hotspot) to test

### SSL Certificate Not Issuing

**Issue**: "Not Secure" or certificate errors

**Solutions:**
1. DNS must be fully propagated first
2. Wait 10-30 minutes after DNS propagates
3. In Vercel: Domains → Click "Refresh" button
4. In Render: Custom Domains → Should auto-renew

### CORS Errors

**Issue**: Browser console shows CORS errors when accessing API

**Solution**: We already updated CORS in `services/api/src/main.ts` to allow:
- `https://www.smartequiz.com`
- `https://smartequiz.com`
- `https://admin.smartequiz.com`
- `https://*.smartequiz.com` (wildcard for tenants)

Render auto-deployed this change. If still seeing errors, redeploy API on Render.

### Vercel Domain Validation Failing

**Issue**: Vercel shows "Invalid Configuration" for domain

**Solutions:**
1. Check DNS records are correct (exact match required)
2. Wait for DNS to propagate globally
3. Remove domain from Vercel and re-add after DNS propagates
4. Verify no typos in CNAME values

---

## Next Steps After DNS Configuration

Once all domains are working:

1. **Update Environment Variables** - Change API URLs from `.onrender.com` to `api.smartequiz.com`
2. **Add CMS Content** - Login to Swagger UI and populate marketing content
3. **Create First Tenant** - Use platform-admin to create demo tenant
4. **Test Full Flow** - Registration → Login → Create tournament
5. **Monitor Logs** - Check Render and Vercel logs for any errors

---

## Cost Summary

### Current Setup (Free Tier + Manual Tenants)
- Render API Free: $0/month (sleeps after 15min inactivity)
- Vercel Hobby: $0/month (3 projects)
- DNS at go54.com: Included with domain registration
- **Total: $0/month**

### Recommended Production Setup
- Render API Starter: $7/month (always-on, no sleep)
- Vercel Hobby: $0/month (manual tenant subdomains)
- **Total: $7/month**

### Full Production with Wildcard
- Render API Starter: $7/month
- Vercel Pro: $20/month (wildcard domains)
- **Total: $27/month**

---

## Quick Reference Commands

**Flush DNS (Windows):**
```powershell
ipconfig /flushdns
```

**Check DNS:**
```powershell
nslookup www.smartequiz.com
nslookup api.smartequiz.com
nslookup admin.smartequiz.com
```

**Test API:**
```powershell
curl https://api.smartequiz.com/api/health
curl https://api.smartequiz.com/api/docs  # Swagger UI
```

**Check propagation:**
- https://www.whatsmydns.net

---

## Support

If you encounter issues:
1. Check DNS records at go54.com match this guide exactly
2. Verify DNS has propagated globally (whatsmydns.net)
3. Check Vercel deployment logs
4. Check Render deployment logs
5. Review browser console for specific errors

All three apps are successfully deployed - DNS configuration is the final step! 🚀
