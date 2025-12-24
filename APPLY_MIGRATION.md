# Apply Sample Data Migration

**Migration:** `20251224_add_sample_data_flag.sql`  
**Commit:** a356ed7  
**Date:** December 24, 2025

## What This Migration Does

Adds `isSample` boolean flag to 5 database tables to track demo/test data:
- `Tenant` table
- `User` table
- `SupportTicket` table
- `AuditLog` table
- `MarketingBlogPost` table

Also creates indexes for efficient queries.

## Prerequisites

- Backend deployed to Render (commit a356ed7 or later)
- Database connection string from Render dashboard
- Prisma CLI or PostgreSQL client installed

## Method 1: Using Prisma CLI (Recommended)

### Step 1: Get Database Connection

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Find `smart-equiz-api` service
3. Click **Connect** → Copy **External Database URL**
4. Format: `postgresql://username:password@host:5432/database`

### Step 2: Set Environment Variable

```powershell
# PowerShell
$env:DATABASE_URL="postgresql://smart_equiz_user:xxx@dpg-xxx.oregon-postgres.render.com/smart_equiz_db"

# Or create .env file in services/api/
# DATABASE_URL="postgresql://..."
```

### Step 3: Apply Migration

```powershell
# Navigate to API directory
cd services/api

# Apply all pending migrations
npx prisma migrate deploy

# Should output:
# 1 migration found in prisma/migrations
# Applying migration `20251224_add_sample_data_flag`
# The following migration have been applied:
# migrations/
#   └─ 20251224_add_sample_data_flag/
#      └─ migration.sql
# All migrations have been successfully applied.
```

### Step 4: Verify Migration

```powershell
# Check migration status
npx prisma migrate status

# Should show:
# Database schema is up to date!
```

## Method 2: Direct SQL Execution

### If Prisma CLI doesn't work, run SQL directly:

```powershell
# Connect to database
psql postgresql://smart_equiz_user:xxx@dpg-xxx.oregon-postgres.render.com/smart_equiz_db

# Run migration
\i services/api/prisma/migrations/20251224_add_sample_data_flag.sql

# Exit psql
\q
```

## Verify Migration Applied

### Check if columns exist:

```sql
-- In psql or any PostgreSQL client
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'Tenant' AND column_name = 'isSample';

-- Expected output:
-- column_name | data_type | column_default
-- isSample    | boolean   | false
```

### Check all 5 tables:

```sql
-- Quick verification
SELECT 
  table_name, 
  column_name 
FROM information_schema.columns 
WHERE column_name = 'isSample' 
ORDER BY table_name;

-- Expected output (5 rows):
-- AuditLog         | isSample
-- MarketingBlogPost| isSample
-- SupportTicket    | isSample
-- Tenant           | isSample
-- User             | isSample
```

## Test Sample Data Feature

After migration is applied:

1. **Login to Admin Panel:**
   - Go to https://admin.smartequiz.com
   - Login with super@admin.com / SuperAdmin123!

2. **Navigate to Sample Data Manager:**
   - Settings → Data Management tab

3. **Test Seeding:**
   - Click "Seed Sample Data"
   - Should create 3 sample tenants
   - Dashboard should show sample data

4. **Test Clearing:**
   - Click "Clear Sample Data"
   - Sample data should be removed
   - Real data (if any) should remain

## Troubleshooting

### Error: "Migration already applied"

**Cause:** Migration was already run.  
**Solution:** Safe to ignore, migration is idempotent.

### Error: "Column already exists"

**Cause:** Manual column creation or duplicate migration.  
**Solution:** Check if `isSample` column exists:
```sql
\d "Tenant"
```
If column exists, migration is complete.

### Error: "Cannot connect to database"

**Cause:** Wrong connection string or database not accessible.  
**Solution:** 
1. Verify DATABASE_URL is correct
2. Check Render service is running
3. Try connecting with psql first

### Error: "Permission denied"

**Cause:** Database user lacks ALTER TABLE permission.  
**Solution:** Contact database administrator or use superuser account.

### Migration status shows "Not applied"

**Cause:** Migration file not in `prisma/migrations` folder.  
**Solution:** 
1. Verify file exists: `ls services/api/prisma/migrations/20251224_add_sample_data_flag.sql`
2. Pull latest code: `git pull origin main`
3. Retry migration

## Rollback (If Needed)

If you need to undo the migration:

```sql
-- Remove isSample column from all tables
ALTER TABLE "Tenant" DROP COLUMN IF EXISTS "isSample";
ALTER TABLE "User" DROP COLUMN IF EXISTS "isSample";
ALTER TABLE "SupportTicket" DROP COLUMN IF EXISTS "isSample";
ALTER TABLE "AuditLog" DROP COLUMN IF EXISTS "isSample";
ALTER TABLE "MarketingBlogPost" DROP COLUMN IF EXISTS "isSample";

-- Drop indexes
DROP INDEX IF EXISTS "Tenant_isSample_idx";
DROP INDEX IF EXISTS "User_isSample_idx";
DROP INDEX IF EXISTS "SupportTicket_isSample_idx";
DROP INDEX IF EXISTS "AuditLog_isSample_idx";
DROP INDEX IF EXISTS "MarketingBlogPost_isSample_idx";
```

⚠️ **Warning:** This will delete the `isSample` column and all sample data flags!

## Next Steps After Migration

1. **Test in browser:**
   - Settings → Data Management
   - Seed sample data
   - Verify dashboard shows data

2. **Clear when ready:**
   - Add real tenants/users
   - Clear sample data
   - Confirm real data remains

3. **Update documentation:**
   - Mark migration as applied
   - Update VERIFICATION_CHECKLIST.md

## Support

For issues:
- Check [SAMPLE_DATA_MANAGEMENT_GUIDE.md](SAMPLE_DATA_MANAGEMENT_GUIDE.md)
- Review backend logs on Render
- Check [VERIFICATION_CHECKLIST.md](VERIFICATION_CHECKLIST.md) section 6

---

**Migration Script Location:** `services/api/prisma/migrations/20251224_add_sample_data_flag.sql`  
**Documentation:** `SAMPLE_DATA_MANAGEMENT_GUIDE.md`  
**Status:** Ready to apply
