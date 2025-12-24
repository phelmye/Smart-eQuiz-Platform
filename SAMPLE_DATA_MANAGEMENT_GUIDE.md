# Sample Data Management System

**Status:** ✅ Implemented  
**Date:** December 24, 2025

## Overview

The platform now has a comprehensive sample data management system that allows you to seed the database with demo data for testing and clear it when you have real data.

## Key Features

### 1. Sample Data Flag (`isSample: boolean`)

All data can be marked as sample/demo data with a database flag:

```sql
ALTER TABLE "Tenant" ADD COLUMN "isSample" BOOLEAN DEFAULT false;
ALTER TABLE "SupportTicket" ADD COLUMN "isSample" BOOLEAN DEFAULT false;
ALTER TABLE "User" ADD COLUMN "isSample" BOOLEAN DEFAULT false;
ALTER TABLE "AuditLog" ADD COLUMN "isSample" BOOLEAN DEFAULT false;
ALTER TABLE "MarketingBlogPost" ADD COLUMN "isSample" BOOLEAN DEFAULT false;
```

### 2. API Endpoints

**GET** `/api/admin/sample-data/status`  
Check if sample data exists and get counts.

**Response:**
```json
{
  "hasSampleData": true,
  "counts": {
    "tenants": 3,
    "users": 15,
    "supportTickets": 8,
    "auditLogs": 25,
    "blogPosts": 6,
    "total": 57
  }
}
```

**POST** `/api/admin/sample-data/seed`  
Seed the database with demo data.

**Response:**
```json
{
  "tenants": 3,
  "users": 15,
  "supportTickets": 8,
  "auditLogs": 25,
  "message": "Sample data seeded successfully"
}
```

**DELETE** `/api/admin/sample-data`  
Clear all sample data (keeps real user data intact).

**Response:**
```json
{
  "tenants": 3,
  "users": 15,
  "supportTickets": 8,
  "auditLogs": 25,
  "blogPosts": 0,
  "message": "Sample data cleared successfully"
}
```

### 3. Frontend Component

**Location:** `apps/platform-admin/src/components/SampleDataManager.tsx`

**Usage:**
```tsx
import { SampleDataManager } from '@/components/SampleDataManager';

// In Settings page
<SampleDataManager />
```

**Features:**
- Visual status indicator (sample data active/inactive)
- Breakdown of sample data counts
- One-click seeding and clearing
- Warning messages about data safety
- Automatic refresh after operations

## Sample Data Included

### Tenants
- 3 sample church organizations
- Various subscription statuses (active, trial)
- Different sizes (users, MRR)

### Support Tickets
- Multiple ticket categories
- Different priorities (low, medium, high, critical)
- Various statuses (open, in progress, resolved, closed)

### Users
- Sample admin users
- Sample participants
- Associated with sample tenants

### Audit Logs
- Sample system events
- User actions
- Tenant operations

### Blog Posts
- Existing marketing blog posts marked as sample
- Can be cleared or kept based on preference

## How It Works

### Seeding Process

1. **Check Existing Data**
   - Verifies no sample data already exists
   - Prevents duplicate seeding

2. **Create Sample Records**
   - Creates tenants with realistic data
   - Creates users associated with tenants
   - Creates support tickets
   - Creates audit log entries
   - Marks all with `isSample: true`

3. **Return Summary**
   - Shows how many records were created
   - Provides success confirmation

### Clearing Process

1. **Delete in Correct Order**
   - Respects foreign key constraints
   - Clears audit logs first (no dependencies)
   - Clears support tickets
   - Clears users (removes UserTenant relationships first)
   - Clears tenants last

2. **Preserve Real Data**
   - Only deletes records with `isSample: true`
   - Real user data is never affected
   - Production data remains intact

3. **Return Summary**
   - Shows how many records were deleted
   - Confirms successful cleanup

## Benefits

### For Development
- Quickly populate database for testing
- Consistent test data across environments
- Easy to reset to clean state

### For Demonstrations
- Show features with realistic data
- New users see populated dashboards
- Better first impression

### For Production
- Seamless transition to real data
- Clear sample data when ready
- No manual database cleanup needed

### For Data Safety
- Real user data is never affected
- Clear distinction between sample and real
- Easy to verify what's being removed

## Usage Guidelines

### When to Seed Sample Data

✅ **Good Times to Seed:**
- New installation/deployment
- Development environment setup
- Demo or staging environments
- Testing new features
- Training sessions
- Before showing platform to prospects

❌ **Don't Seed When:**
- Production has real user data
- Sample data already exists (clear first)
- During active user sessions
- In environments with real customer data

### When to Clear Sample Data

✅ **Good Times to Clear:**
- After onboarding real tenants
- When transitioning to production use
- Before migrating production data
- When sample data becomes outdated
- After successful testing phase

❌ **Don't Clear When:**
- You still need demo/test data
- No real data exists yet (dashboard will be empty)
- Unsure which data is sample vs real

## Frontend Integration

### Empty States

All components now handle empty data gracefully:

```tsx
{loading ? (
  <LoadingState />
) : tenants.length === 0 ? (
  <EmptyState 
    message="No tenants found."
    action="Seed sample data or create your first tenant."
  />
) : (
  <TenantList tenants={tenants} />
)}
```

### Live Data Updates

- Data appears immediately when added
- No page refresh needed
- Real-time updates via API

### Sample Data Indicator

Optional: Show badge on sample records (not implemented yet):

```tsx
{tenant.isSample && (
  <Badge variant="outline" className="bg-yellow-50">
    Sample Data
  </Badge>
)}
```

## Migration Script

**File:** `services/api/prisma/migrations/20251224_add_sample_data_flag.sql`

**To Apply:**
```bash
cd services/api
# If using Prisma
npx prisma migrate dev --name add_sample_data_flag

# Or run SQL directly
psql $DATABASE_URL < prisma/migrations/20251224_add_sample_data_flag.sql
```

## Backend Files

1. **Controller:** `services/api/src/admin/admin.controller.ts`
   - Route handlers for sample data operations
   - Super admin access only

2. **Service:** `services/api/src/admin/admin.service.ts`
   - Business logic for seeding and clearing
   - Safe deletion with foreign key handling

3. **Module:** `services/api/src/admin/admin.module.ts`
   - Registers controller and service
   - Exports service for other modules

## Frontend Files

1. **Component:** `apps/platform-admin/src/components/SampleDataManager.tsx`
   - UI for sample data management
   - Status display and action buttons

2. **Settings Page:** `apps/platform-admin/src/pages/Settings.tsx`
   - Added "Data Management" tab
   - Integrates SampleDataManager component

## Testing

### Manual Testing Steps

1. **Navigate to Settings**
   - https://admin.smartequiz.com/settings
   - Click "Data Management" tab

2. **Check Status**
   - Should show "No Sample Data" initially
   - Or show count if sample data exists

3. **Seed Sample Data**
   - Click "Seed Sample Data" button
   - Confirm the action
   - Wait for success message
   - Verify counts appear

4. **View Sample Data**
   - Go to Dashboard → See sample tenants in widget
   - Go to Tenants page → See sample organizations
   - Check Activity Feed → See sample audit logs

5. **Clear Sample Data**
   - Return to Settings → Data Management
   - Click "Clear Sample Data" button
   - Confirm the action (warning: permanent)
   - Wait for success message
   - Verify counts return to zero

6. **Verify Real Data Unaffected**
   - Create a real tenant
   - Clear sample data again
   - Verify real tenant still exists

### API Testing

```bash
# Get status
curl https://smart-equiz-api.onrender.com/api/admin/sample-data/status \
  -H "Authorization: Bearer $TOKEN"

# Seed data
curl -X POST https://smart-equiz-api.onrender.com/api/admin/sample-data/seed \
  -H "Authorization: Bearer $TOKEN"

# Clear data
curl -X DELETE https://smart-equiz-api.onrender.com/api/admin/sample-data \
  -H "Authorization: Bearer $TOKEN"
```

## Security

- ✅ Super admin access only (`@Roles(Role.SUPER_ADMIN)`)
- ✅ JWT authentication required
- ✅ No tenant-specific data (platform-level operation)
- ✅ Confirmation required before clearing
- ✅ Irreversible deletion (with warning)

## Future Enhancements

### Planned Improvements

1. **Sample Data Templates**
   - Multiple preset templates (small, medium, large)
   - Industry-specific sample data
   - Customizable seed options

2. **Visual Indicators**
   - Show badge on sample records in UI
   - Filter to show/hide sample data
   - Dashboard toggle for sample data visibility

3. **Partial Clearing**
   - Clear specific types (tenants only, users only)
   - Keep some sample data while clearing others
   - Selective seeding by category

4. **Import/Export**
   - Export sample data as JSON
   - Import custom sample data sets
   - Share sample data configurations

5. **Automated Cleanup**
   - Schedule automatic clearing (e.g., after 30 days)
   - Expiration dates for sample data
   - Warnings before auto-deletion

## Troubleshooting

### "Sample data already exists" error

**Cause:** Trying to seed when sample data is present.  
**Solution:** Clear existing sample data first, then reseed.

### "Failed to clear sample data" error

**Cause:** Foreign key constraints preventing deletion.  
**Solution:** Check server logs for specific constraint violations. Service handles this automatically but edge cases may exist.

### Sample data not appearing

**Cause:** Seeding failed silently or insufficient permissions.  
**Solution:**
1. Check browser console for errors
2. Verify super admin role
3. Check backend logs
4. Verify database connection

### Real data accidentally cleared

**Cause:** Data was marked as sample incorrectly.  
**Solution:**
- This should never happen - real data has `isSample: false`
- Check database backup if data is missing
- Review audit logs for deletion records

## Best Practices

1. **Always Use in Non-Production First**
   - Test seeding in development
   - Verify clearing works correctly
   - Ensure real data isn't affected

2. **Document Sample Data Changes**
   - Note when sample data was seeded
   - Track what was cleared and when
   - Keep deployment notes updated

3. **Communicate with Team**
   - Inform team before clearing sample data
   - Coordinate with QA/testing teams
   - Update documentation after changes

4. **Monitor Database Size**
   - Sample data adds records
   - Clear periodically in dev environments
   - Don't leave stale sample data

## Support

For issues or questions:
- Check backend logs: `services/api/logs/`
- Review Prisma migrations
- Contact platform team
- File issue in repository

---

**Next Steps:**
1. Deploy backend changes
2. Run database migration
3. Test sample data seeding
4. Document in user guide
5. Train admins on usage
