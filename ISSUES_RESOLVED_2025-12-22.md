# Issues Resolved - December 22, 2025

## Issue 1: Duplicate Pricing Plans ✅ FIXED

**Problem**: Marketing site showing 6 pricing plans instead of 3 (each plan appeared twice)

**Root Cause**: Render.com production database has duplicate pricing plans with different IDs:
- Starter (2 copies)
- Professional (2 copies)  
- Enterprise (2 copies)

**Solution Implemented**: Added client-side deduplication in `apps/marketing-site/src/app/pricing/page.tsx`:
```typescript
const uniquePlans = activePlans.filter(
  (plan: any, index: number, self: any[]) =>
    index === self.findIndex((p) => p.name === plan.name)
);
```

**Status**: Fixed in commit c04740f - deploys automatically via Vercel

---

## Issue 2: Logo File Not Found ✅ NOT AN ISSUE

**Problem**: User reported `/logo.svg` returns 404 on smartequiz.com

**Investigation**:
- Logo file exists locally at `apps/marketing-site/public/logo.svg`
- Header component uses **inline SVG** (not file reference)
- `marketingConfig.ts` has unused `logoUrl: '/logo.svg'` property
- No code actually references `config.logoUrl`

**Conclusion**: 
- The inline SVG in Header.tsx works perfectly ✅
- The `/logo.svg` file is unused and can be deleted
- No actual bug - site displays logo correctly via inline SVG

**Action**: None required (or optionally delete unused logo.svg file)

---

## Issue 3: Cannot Login to Admin Dashboard ❌ NEEDS INVESTIGATION

**Problem**: User unable to login as super_admin to Platform Admin dashboard

**What We Need**:
1. Admin dashboard URL being used (should be `admin.smartequiz.com` or specific deployment URL)
2. Credentials being used
3. Error message shown (if any)
4. Which admin dashboard:
   - Platform Admin (`apps/platform-admin/`) - React + Vite app
   - Tenant App admin section (`apps/tenant-app/`) - Next.js app

**Default Super Admin Credentials** (from seed data):
```
Email: super@admin.com
Password: SuperAdmin123!
```

**To Check**:
1. **Is Platform Admin deployed?**
   - Check Vercel dashboard for platform-admin project
   - Should be at `admin.smartequiz.com`

2. **Is API authentication working?**
   ```powershell
   # Test login endpoint
   $body = @{
     email = "super@admin.com"
     password = "SuperAdmin123!"
   } | ConvertTo-Json
   
   $response = Invoke-RestMethod `
     -Uri "https://smart-equiz-api.onrender.com/api/auth/login" `
     -Method Post `
     -Body $body `
     -ContentType "application/json"
   
   $response
   ```

3. **Check if environment variables are set**:
   - Platform Admin needs `VITE_API_URL=https://smart-equiz-api.onrender.com`
   - Set in Vercel Dashboard → Settings → Environment Variables

**Next Steps**:
1. User should specify which admin dashboard they're trying to access
2. Share the exact error message
3. Run the PowerShell test above to verify API login works
4. Check if Platform Admin is deployed on Vercel

**Reference Files**:
- Super admin credentials: `services/api/prisma/seed.ts` (line ~50-60)
- Auth controller: `services/api/src/auth/auth.controller.ts`
- Platform Admin login: `apps/platform-admin/src/components/Login.tsx`
