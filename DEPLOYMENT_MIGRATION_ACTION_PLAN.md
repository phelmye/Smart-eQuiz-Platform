# Deployment & Migration Action Plan

**Date:** December 24, 2025  
**Status:** Waiting for Render deployment + migration

## Current Status

### ✅ Completed
- [x] Code committed to GitHub (6 commits)
- [x] Prisma schema updated with isSample fields
- [x] Prisma client regenerated locally
- [x] Backend health endpoint responding
- [x] All documentation created

### ⏳ In Progress
- [ ] Render building backend with AdminModule (takes 5-10 minutes)
- [ ] New endpoints deploying: `/api/admin/sample-data/*`

### ❌ Blocked
- [ ] Database migration not applied
- [ ] Cannot apply from local machine (requires internal network)

## Why Migration Can't Be Applied Locally

**Issue:** Production database `dpg-ctbbdodumphs73f4s0p0-a.oregon-postgres.render.com` is not accessible from external networks for security.

**Tried:**
- External URL with `.oregon-postgres.render.com` - Connection closed
- Internal URL `dpg-ctbbdodumphs73f4s0p0-a` - Can't reach from local machine

**Solution:** Migration must be applied from Render's internal network.

## How to Apply Migration

### Option 1: Render Dashboard (Recommended)

1. **Go to:** https://dashboard.render.com
2. **Find service:** `smart-equiz-api`
3. **Click:** Shell tab
4. **Run commands:**
   ```bash
   cd /opt/render/project/src
   npx prisma migrate deploy
   ```
5. **Verify:**
   ```bash
   npx prisma migrate status
   # Should show: "Database schema is up to date!"
   ```

### Option 2: Render CLI

```bash
# Install Render CLI (if not installed)
npm install -g @render/cli

# Login
render login

# Run shell command
render shell smart-equiz-api
npx prisma migrate deploy
```

### Option 3: Auto-Migration on Deploy

If `package.json` has a `postbuild` or `start` script that runs migrations:

```json
{
  "scripts": {
    "start": "npx prisma migrate deploy && node dist/main",
    "postbuild": "npx prisma migrate deploy"
  }
}
```

Migration will apply automatically when Render starts the service.

## Verification Steps

### 1. Check Render Deployment Status

**URL:** https://dashboard.render.com → smart-equiz-api

**Look for:**
- Build status: "Live" (green)
- Latest commit: `07cdc04` or later
- Build logs: No errors

### 2. Test AdminModule Endpoints

**Once build is live, run:**

```powershell
# PowerShell test script
$body = @{ email="super@admin.com"; password="SuperAdmin123!" } | ConvertTo-Json
$auth = Invoke-RestMethod -Uri "https://smart-equiz-api.onrender.com/api/auth/login" -Method Post -Body $body -ContentType "application/json"
$token = $auth.access_token
$headers = @{ Authorization = "Bearer $token" }

# Test status endpoint
$status = Invoke-RestMethod -Uri "https://smart-equiz-api.onrender.com/api/admin/sample-data/status" -Headers $headers
Write-Host "Has sample data: $($status.hasSampleData)"
Write-Host "Total records: $($status.counts.total)"
```

**Expected before migration:**
- Endpoint returns 200 OK
- `hasSampleData: false`
- All counts: 0

**Expected after migration:**
- Same response structure
- Ready to seed data

### 3. Apply Migration (After Build Completes)

**Via Render Shell:**
```bash
npx prisma migrate deploy
```

**Expected output:**
```
1 migration found in prisma/migrations
Applying migration `20251224_add_sample_data_flag`
Migration applied successfully
```

### 4. Verify Migration Applied

**In Render shell:**
```bash
npx prisma migrate status
# Should show: Database schema is up to date!
```

**Check database:**
```sql
-- In Render SQL Editor or via psql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'Tenant' AND column_name = 'isSample';
-- Should return: isSample
```

### 5. Test Sample Data Seeding

**Via PowerShell:**
```powershell
# Login and get token
$body = @{ email="super@admin.com"; password="SuperAdmin123!" } | ConvertTo-Json
$auth = Invoke-RestMethod -Uri "https://smart-equiz-api.onrender.com/api/auth/login" -Method Post -Body $body -ContentType "application/json"
$headers = @{ Authorization = "Bearer $($auth.access_token)" }

# Seed sample data
$result = Invoke-RestMethod -Uri "https://smart-equiz-api.onrender.com/api/admin/sample-data/seed" -Method Post -Headers $headers -Body "{}" -ContentType "application/json"
Write-Host "Seeded: $($result.tenants) tenants, $($result.users) users"

# Check status
$status = Invoke-RestMethod -Uri "https://smart-equiz-api.onrender.com/api/admin/sample-data/status" -Headers $headers
Write-Host "Sample data active: $($status.hasSampleData)"
Write-Host "Total records: $($status.counts.total)"
```

**Expected:**
- 3 tenants created
- 3+ users created
- Audit logs created
- Status shows `hasSampleData: true`

### 6. Test Frontend

**URL:** https://admin.smartequiz.com

1. Login as super@admin.com
2. Go to Settings → Data Management tab
3. Should see "No Sample Data" (or sample data badge if seeded)
4. Click "Seed Sample Data" button
5. Dashboard should populate with sample tenants

## Current Timeline

### Now (15:00 - Current Time)
- ✅ Code committed
- ✅ Builds triggered
- ⏳ Waiting for Render build

### +5 minutes (15:05)
- Render build should complete
- AdminModule endpoints live
- Ready to apply migration

### +10 minutes (15:10)
- Migration applied via Render shell
- Database schema updated
- Ready to seed data

### +15 minutes (15:15)
- Sample data seeded
- Frontend tested
- Feature fully operational

## Monitoring Script

Save as `monitor-deployment.ps1`:

```powershell
Write-Host "Monitoring deployment..." -ForegroundColor Cyan

$body = @{ email="super@admin.com"; password="SuperAdmin123!" } | ConvertTo-Json

while ($true) {
    try {
        $auth = Invoke-RestMethod -Uri "https://smart-equiz-api.onrender.com/api/auth/login" -Method Post -Body $body -ContentType "application/json" -ErrorAction Stop
        $headers = @{ Authorization = "Bearer $($auth.access_token)" }
        
        $status = Invoke-RestMethod -Uri "https://smart-equiz-api.onrender.com/api/admin/sample-data/status" -Headers $headers -ErrorAction Stop
        
        Write-Host "`n✓ Deployment complete!" -ForegroundColor Green
        Write-Host "Sample data status: $($status.hasSampleData)" -ForegroundColor White
        Write-Host "`nNext: Apply migration via Render shell" -ForegroundColor Cyan
        break
    } catch {
        Write-Host "⏳ Still deploying... (will retry in 30s)" -ForegroundColor Yellow
        Start-Sleep -Seconds 30
    }
}
```

## Troubleshooting

### Build Fails on Render

**Check:**
- Build logs for TypeScript errors
- Prisma client generation succeeded
- Node modules installed

**Common issues:**
- Missing dependencies: `npm install`
- TypeScript errors: `npm run build` locally first
- Prisma not generated: Add `postinstall: prisma generate` to package.json

### Migration Fails

**Check:**
- Database connection string correct
- Migration file exists in `prisma/migrations/`
- No syntax errors in SQL

**Fix:**
- Run `npx prisma migrate status` to see current state
- Run `npx prisma migrate resolve --applied 20251224_add_sample_data_flag` to mark as applied
- Or run SQL manually via Render SQL editor

### Endpoint Returns 500 Error

**Check:**
- Prisma client has isSample types
- Migration applied to database
- Service restarted after migration

**Fix:**
- Restart Render service
- Check service logs for specific error
- Verify DATABASE_URL environment variable

## Success Criteria

You'll know everything is working when:

- [ ] Render build shows "Live" status
- [ ] GET `/api/admin/sample-data/status` returns 200
- [ ] Migration applied (`npx prisma migrate status` shows up to date)
- [ ] POST `/api/admin/sample-data/seed` creates sample records
- [ ] Dashboard shows sample tenants
- [ ] Settings → Data Management tab functional

## Next Steps After Migration

1. **Test sample data seeding**
2. **Verify dashboard displays sample tenants**
3. **Test clearing sample data**
4. **Document in verification checklist**
5. **Mark feature as production-ready**

---

**Current Status:** Waiting for Render build (~5 minutes)  
**Action Required:** Apply migration via Render shell once build completes  
**ETA to Production:** 15-20 minutes
