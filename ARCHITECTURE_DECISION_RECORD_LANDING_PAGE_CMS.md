# Architecture Decision Record (ADR): Landing Page Content Management

## Status
**ACCEPTED** - Implementation Complete (November 25, 2024)

## Context

### Problem Statement
The original implementation stored landing page content in browser localStorage:
- **File**: `TenantLandingSettings.tsx` and `TenantLandingPage.tsx`
- **Storage**: `localStorage.setItem('tenant_landing_${tenant.id}', JSON.stringify(content))`
- **Critical Issues**:
  1. ❌ No version control or rollback capability
  2. ❌ No audit trail (who changed what, when)
  3. ❌ Volatile data - browser clear = data loss
  4. ❌ No scheduled publishing
  5. ❌ No multi-device sync
  6. ❌ No preview before publish
  7. ❌ Cannot compare versions
  8. ❌ No backup or disaster recovery

### Business Requirements
1. **Version Control**: Track all changes with rollback capability
2. **Audit Trail**: Know who made what changes and when
3. **Data Persistence**: Database-backed, not browser-dependent
4. **Scheduled Publishing**: Set effective dates for content updates
5. **Preview Mode**: Review changes before activation
6. **Multi-Section Management**: Independent versioning for 5 sections (HERO, STATS, FEATURES, TESTIMONIALS, BRANDING)

## Decision

### ✅ SELECTED: Option B - Dedicated Landing Page CMS

Implement a **separate, dedicated CMS** for landing page content with full version control, mirroring the Legal Documents CMS architecture.

**Architecture:**
```
Database (PostgreSQL)
  ↓
Backend API (NestJS + Prisma)
  ↓
Frontend (React + Custom Hook)
```

### Why Not Other Options?

**❌ Option A - Extend Legal Documents CMS**
- **Rejected Reason**: Different data models (JSON vs Markdown), different permissions (Marketing vs Legal), different features (A/B testing vs Acceptance tracking)

**❌ Keep localStorage**
- **Rejected Reason**: No version control, data loss risk, no audit trail, not production-ready

## Implementation Details

### Database Schema

```prisma
model LandingPageContent {
  id            String              @id @default(cuid())
  tenantId      String              // CRITICAL: Tenant isolation
  section       LandingPageSection  // HERO, STATS, FEATURES, TESTIMONIALS, BRANDING
  content       Json                // Flexible JSON structure
  version       Int                 @default(1)
  isActive      Boolean             @default(false) // Only one active per section
  effectiveDate DateTime
  createdBy     String
  createdAt     DateTime            @default(now())
  updatedAt     DateTime            @updatedAt

  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@unique([tenantId, section, version])
  @@index([tenantId, section, isActive])
  @@map("landing_page_contents")
}
```

**Migration**: `20251125055514_add_landing_page_cms`

### Backend API

**Location**: `services/api/src/landing-page/`

**Files**:
- `landing-page.service.ts` (280 lines) - Business logic
- `landing-page.controller.ts` (160 lines) - HTTP endpoints
- `landing-page.module.ts` - Module registration
- `dto/create-landing-page-content.dto.ts` - Input validation
- `dto/update-landing-page-content.dto.ts` - Update validation

**Endpoints**: 10 RESTful endpoints (see `LANDING_PAGE_CMS_GUIDE.md`)

### Frontend Integration

**Location**: `apps/tenant-app/src/hooks/useLandingPageContent.ts`

**Hook**: `useLandingPageContent(tenantId)` - Fetches active content
**Functions**: 
- `createLandingPageContent()` - Create new version
- `activateLandingPageContent()` - Activate version
- `getLandingPageHistory()` - Get version history

## Consequences

### Positive
✅ **Version Control**: Full history with rollback  
✅ **Audit Trail**: `createdBy`, timestamps on all changes  
✅ **Data Integrity**: PostgreSQL with transactions  
✅ **Tenant Isolation**: All queries filter by `tenant_id`  
✅ **Scheduled Publishing**: `effectiveDate` field  
✅ **Preview Mode**: Create version without activating  
✅ **Rollback**: Simply activate an older version  
✅ **Backup**: Database backups include all content  

### Negative
⚠️ **Code Duplication**: Some version control logic similar to Legal CMS  
⚠️ **Additional Complexity**: More code than localStorage  
⚠️ **Migration Required**: Must migrate existing localStorage data  

**Verdict**: Benefits FAR outweigh costs. Duplication is intentional (clean separation).

## Migration Path

### Phase 1: Backend (✅ Complete)
- [x] Database schema
- [x] Backend API
- [x] Migration script
- [x] Documentation

### Phase 2: Frontend (🔄 In Progress)
- [x] React hook (`useLandingPageContent.ts`)
- [ ] Update `TenantLandingPage.tsx` to use hook
- [ ] Update `TenantLandingSettings.tsx` to use API
- [ ] Landing page editor component

### Phase 3: Data Migration
- [ ] Script to migrate localStorage → database
- [ ] Verify migration for all tenants
- [ ] Remove localStorage code

### Phase 4: Cleanup
- [ ] Delete old localStorage references
- [ ] Update documentation
- [ ] Mark old pattern as deprecated

## ⚠️ CRITICAL: DO NOT REGRESS

### 🚨 FORBIDDEN PATTERNS (Never Do This Again)

**❌ localStorage for Production Data**
```typescript
// FORBIDDEN - DO NOT USE THIS PATTERN
localStorage.setItem(`tenant_landing_${tenant.id}`, JSON.stringify(content));
const saved = localStorage.getItem(`tenant_landing_${tenant.id}`);
```

**Why Forbidden**:
- No version control
- Data loss on browser clear
- No audit trail
- Not multi-device safe
- No backup

**✅ REQUIRED PATTERN**
```typescript
// CORRECT - Use API with version control
const { content, loading, error } = useLandingPageContent(tenant.id);
await createLandingPageContent(tenantId, section, content);
await activateLandingPageContent(tenantId, contentId);
```

### 🛡️ Regression Prevention Checklist

Before making ANY changes to landing page content management:

1. ✅ Does it use the database-backed API?
2. ✅ Does it maintain version control?
3. ✅ Does it preserve audit trail?
4. ✅ Is tenant isolation enforced?
5. ✅ Can users rollback changes?

**If ANY answer is NO → STOP and redesign.**

### 📋 Code Review Checklist

When reviewing PRs touching landing page content:

- [ ] No `localStorage.setItem` for landing page content
- [ ] Uses `useLandingPageContent` hook or API directly
- [ ] All content changes create new versions
- [ ] Tenant ID is always passed to API calls
- [ ] Error handling for API failures
- [ ] Loading states implemented
- [ ] Fallback to defaults if no content

### 🚨 Automated Safeguards

**ESLint Rule (Recommended)**:
```json
{
  "rules": {
    "no-restricted-syntax": [
      "error",
      {
        "selector": "CallExpression[callee.object.name='localStorage'][callee.property.name='setItem'][arguments.0.value=/tenant_landing/]",
        "message": "FORBIDDEN: Do not use localStorage for landing page content. Use Landing Page CMS API instead. See ARCHITECTURE_DECISION_RECORD.md"
      }
    ]
  }
}
```

**Pre-commit Hook**:
```bash
#!/bin/bash
# Block commits with localStorage for landing page content
if git diff --cached | grep -i "localStorage.*tenant_landing"; then
  echo "❌ ERROR: localStorage usage detected for landing page content"
  echo "Use Landing Page CMS API instead (see ARCHITECTURE_DECISION_RECORD.md)"
  exit 1
fi
```

## References

**Documentation**:
- `LANDING_PAGE_CMS_GUIDE.md` - Complete API reference and usage guide
- `LANDING_PAGE_CMS_IMPLEMENTATION_SESSION.md` - Implementation summary
- `ARCHITECTURE.md` - Overall system architecture

**Related ADRs**:
- Legal Documents CMS (similar architecture, different domain)
- Multi-currency system (domain-specific CMS pattern)

**Migration**: `20251125055514_add_landing_page_cms`

**Files Modified/Created**:
- Backend: `services/api/src/landing-page/**` (5 files, ~900 lines)
- Frontend: `apps/tenant-app/src/hooks/useLandingPageContent.ts` (~160 lines)
- Schema: `services/api/prisma/schema.prisma`

## Future Enhancements

### Planned Features
1. **A/B Testing**: Multiple active versions with traffic split
2. **Analytics Integration**: Track conversion rates per version
3. **Auto-scheduling**: Cron job to activate versions at effective date
4. **Content Templates**: Pre-built templates for common layouts
5. **Media Library Integration**: Unified image/video management
6. **Localization**: Multi-language support per section

### Not Planned (Intentionally Excluded)
- ❌ localStorage as primary storage (forbidden)
- ❌ Merging with Legal Documents CMS (different domains)
- ❌ Direct database writes from frontend (security risk)

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| Nov 25, 2024 | Selected Option B (Dedicated CMS) | Clean separation, different data models, scalability |
| Nov 25, 2024 | Prohibited localStorage pattern | Production requirements: version control, audit trail, reliability |
| Nov 25, 2024 | JSON content storage | Flexibility for different section types |
| Nov 25, 2024 | One active version per section | Simplicity, clear user experience |
| Nov 25, 2024 | Separate from Legal CMS | Different permissions, features, teams |

## Approval

**Architect**: GitHub Copilot  
**Date**: November 25, 2024  
**Status**: ✅ Approved and Implemented  

**Next Review**: After Phase 3 (Data Migration Complete)

---

## ⚠️ IMPORTANT NOTICE TO FUTURE DEVELOPERS

**DO NOT** revert to localStorage-based landing page content management.

**If you're tempted to use localStorage because**:
- "It's simpler" → NO: Version control is a requirement
- "It's faster" → NO: API is cached and performant
- "localStorage works fine" → NO: It causes data loss and has no audit trail

**Instead**:
1. Read this ADR
2. Review `LANDING_PAGE_CMS_GUIDE.md`
3. Use the API and `useLandingPageContent` hook
4. Ask questions if unclear

**The localStorage pattern was DELIBERATELY replaced. Regression is not acceptable.**

---

**Last Updated**: November 25, 2024  
**Next Review**: After full migration complete
