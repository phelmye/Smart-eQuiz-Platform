# Smart eQuiz Platform - AI Agent Instructions

## 🚨 CRITICAL: Architecture Decision Records - DO NOT REGRESS!

**Before making ANY changes to these systems, read their ADRs:**

### 1. Authentication & Navigation
**Read**: `AUTHENTICATION_FLOW.md`  
**If working on**: Login/signup, navigation between apps, tenant detection

### 2. Landing Page Content Management 🆕
**Read**: `ARCHITECTURE_DECISION_RECORD_LANDING_PAGE_CMS.md`  
**If working on**: Tenant landing pages, content management

**🚨 FORBIDDEN PATTERNS**:
- ❌ **NEVER** use `localStorage` for landing page content
- ❌ **NEVER** revert to localStorage pattern (causes data loss, no version control)
- ✅ **ALWAYS** use Landing Page CMS API (`useLandingPageContent` hook)

```typescript
// ❌ FORBIDDEN - Will be blocked in code review
localStorage.setItem(`tenant_landing_${tenant.id}`, JSON.stringify(content));

// ✅ REQUIRED - Use API with version control
const { content, loading, error } = useLandingPageContent(tenant.id);
await createLandingPageContent(tenantId, section, content);
```

**Why forbidden**: No version control, no audit trail, data loss on browser clear, no backup, not production-ready.

### 3. Legal Documents
**Read**: `LEGAL_DOCUMENTS_CMS_GUIDE.md`  
**If working on**: Terms, Privacy Policy, legal content

---

## 🚨 CRITICAL: Read AUTHENTICATION_FLOW.md Before Auth/Navigation Changes!

**STOP and read `AUTHENTICATION_FLOW.md` if working on:**
- Login/signup flows
- Navigation between apps
- Tenant detection
- Any linking from marketing site

**Quick Architecture Rules:**
1. ❌ NEVER link marketing site directly to tenant app
2. ✅ ALWAYS use `/platform-login` for "Sign In" from marketing
3. ❌ NEVER hardcode tenant data in tenant app (`mockTenant = { ... }`)
4. ✅ ALWAYS detect tenant dynamically from URL
5. ❌ NEVER break tenant isolation (all queries need `tenant_id` filter)

## Project Overview

Multi-tenant SaaS platform for Bible quiz competitions with **three separate applications** and shared packages in a pnpm monorepo.

## Architecture (Critical)

### Three-App Separation

```
apps/
├── marketing-site/    # Next.js 14 - Public landing, tenant registration (www.*)
├── platform-admin/    # React + Vite - Super admin dashboard (admin.*)
└── tenant-app/        # React + Vite - Multi-tenant quiz platform ({tenant}.*)
```

**Why three apps?** Complete separation of concerns - marketing, platform management, and tenant operations are isolated domains with different deployment requirements and access patterns.

### Shared Packages (Workspace Dependencies)

```
packages/
├── types/     # @smart-equiz/types - 30+ TypeScript interfaces
└── utils/     # @smart-equiz/utils - 11+ utilities including multi-currency
```

**All apps depend on these packages.** Changes to shared packages require rebuilding dependents.

## Multi-Tenancy Architecture

### Tenant Isolation (Security-Critical)

**Every database query MUST filter by `tenant_id`** except super_admin operations:

```typescript
// ❌ WRONG - Data leak vulnerability
const questions = await db.questions.findAll();

// ✅ CORRECT - Tenant isolated
const questions = await db.questions.findAll({ 
  where: { tenant_id: currentTenant.id } 
});
```

### Tenant Detection Flow

1. Extract hostname from request
2. Check custom domain mapping first
3. Fallback to subdomain (e.g., `firstbaptist` from `firstbaptist.smartequiz.com`)
4. Load tenant context and inject into all subsequent operations
5. All queries auto-filter by tenant_id

### Role-Based Access Control (RBAC)

**9 Roles** with hierarchical permissions:
- `super_admin` - Platform-wide (no tenant_id)
- `org_admin` - Tenant administrator
- `question_manager`, `account_officer`, `inspector`, `moderator` - Specialized tenant roles
- `participant`, `practice_user`, `spectator` - End users

**Permission checking pattern:**

```typescript
import { hasPermission } from '@/lib/mockData';

// Always check permissions before operations
if (!hasPermission(user, 'questions.delete')) {
  return <AccessDenied />;
}
```

**Tenant Role Customization** (Phase 13): Tenants can add/remove permissions per role. Explicit denies take precedence over grants. See `apps/tenant-app/TENANT_ROLE_CUSTOMIZATION.md`.

## Development Workflow

### Local Development Commands

```powershell
# Build shared packages FIRST (required before running apps)
cd packages/types; pnpm build
cd ../utils; pnpm build

# Run individual apps
pnpm dev:tenant-app          # http://localhost:5174
pnpm dev:marketing-site      # http://localhost:3000
pnpm dev:platform-admin      # http://localhost:5173

# Legacy monolith (being migrated from)
cd workspace/shadcn-ui; pnpm dev

# Build all apps
pnpm build                   # Builds all three apps
```

### Database Development (services/api/)

```powershell
# Start local stack (Postgres + Redis via Docker)
.\dev\run-init.ps1

# Reset DB, run migrations, seed data
.\dev\reset-db.ps1

# Create migration
cd services/api
npx prisma migrate dev --name description

# View database
npx prisma studio  # http://localhost:5555
```

### Branch Strategy

**Local-first workflow:**
1. Create `local/feature-name` branches for WIP (NOT pushed)
2. Install pre-push hooks: `.\dev\install-hooks.ps1` (blocks `local/*` pushes)
3. When ready for PR: create feature branch (not `local/*`) and push

## Critical Patterns

### 1. Shared Package Updates

```powershell
# After editing packages/types or packages/utils:
cd packages/types; pnpm build    # or cd packages/utils
# Then restart affected app dev servers
```

**IntelliSense issues?** Press `Ctrl+Shift+P` → "TypeScript: Restart TS Server"

### 2. Multi-Currency System

Platform stores all prices in **USD**. Tenants configure display currency. Use `formatCurrency()` for display, `convertCurrency()` for calculations.

```typescript
import { formatCurrency, convertCurrency } from '@smart-equiz/utils';

// Convert $100 USD to tenant's currency (e.g., EUR)
const amount = convertCurrency(100, 'USD', tenantCurrency);
const display = formatCurrency(amount, tenantCurrency, locale);
```

**12 currencies supported:** USD, EUR, GBP, CAD, AUD, JPY, INR, BRL, MXN, ZAR, NGN, KES

### 3. Component Structure (Tenant App)

```typescript
// All components receive user prop and check permissions
interface Props {
  user: User;
  // ...
}

export default function MyComponent({ user }: Props) {
  // Check permissions early
  if (!hasPermission(user, 'feature.access')) {
    return <AccessDenied />;
  }
  
  // Component logic...
}
```

### 4. Storage Keys

Use constants from `@/lib/mockData`:

```typescript
import { storage, STORAGE_KEYS } from '@/lib/mockData';

const tenants = storage.get(STORAGE_KEYS.TENANTS) || [];
storage.set(STORAGE_KEYS.CURRENT_USER, user);
```

### 5. Supabase Integration (Optional)

Apps use `@supabase/supabase-js` for auth/data. Client initialized in `src/lib/supabaseClient.ts`. Requires env vars:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Testing Strategy

### Browser Console Testing

Primary testing method for tenant-app features:

```javascript
// 1. Open http://localhost:5173 and login
// 2. Open DevTools (F12) → Console tab
// 3. Copy/paste test scripts from:
//    - smoke-test.js (quick validation)
//    - test-role-customization.js (full suite)
// 4. Run: runRoleCustomizationTests()
```

See `workspace/shadcn-ui/TESTING_GUIDE.md` for detailed procedures.

### E2E Auth Testing

```powershell
cd services/api
node test/e2e/auth.e2e.js  # Tests login/refresh/logout flow
```

## Key Files Reference

### Architecture & Planning
- `ARCHITECTURE.md` (647 lines) - System design, database schema, domain routing
- `PROJECT_STATUS.md` - Current implementation status
- `MIGRATION_GUIDE.md` - Step-by-step migration from monolith

### Technical Guides
- `ACCESS_CONTROL_SYSTEM.md` - RBAC implementation details
- `CURRENCY_MANAGEMENT_STRATEGY.md` - Multi-currency architecture
- `apps/tenant-app/TENANT_ROLE_CUSTOMIZATION.md` - Permission customization system

### Development
- `CONTRIBUTING.md` - Developer workflow, branch strategy
- `RUNNING_LOCALLY.md` - Local setup instructions
- `TROUBLESHOOTING.md` - Common issues and solutions

## Common Gotchas

1. **Package changes don't reflect:** Rebuild shared packages (`cd packages/X; pnpm build`)
2. **TypeScript errors persist:** Restart TS Server (Ctrl+Shift+P)
3. **Tenant data leaking:** Forgot `tenant_id` filter in query
4. **Permission denied:** Check `hasPermission(user, permission)` call
5. **Currency display wrong:** Verify tenant's configured currency in `tenants` table

## Migration Status

**Current:** Migrating from monolith (`workspace/shadcn-ui/`) to three-app architecture.

**Active development areas:**
- ✅ Shared packages built and tested
- ✅ Tenant app structure complete
- 🟡 Marketing site needs implementation
- 🟡 Platform admin needs implementation
- ⏳ Final deployment configuration pending

When working on new features, implement in the **new architecture** (`apps/`), not the legacy monolith.

## Component Patterns & Best Practices

### Permission-Protected Components

All admin components must check permissions before rendering:

```typescript
// At component top-level
if (!hasPermission(user, 'feature.access')) {
  return <AccessDenied />;
}
```

**Common permission patterns found:**
- `hasPermission(user, 'questions.delete')` - Question management
- `hasPermission(user, 'users.create')` - User management
- `hasPermission(user, 'tournaments.create')` - Tournament creation
- `hasPermission(user, 'tenants.manage')` - Tenant admin (super_admin only)

### Button onClick Handlers

**Never use placeholders like:**
- `onClick={() => {}}` - Empty handler
- `onClick={() => alert('Coming soon')}` - Alert placeholder
- `onClick={() => console.log('TODO')}` - Console placeholder

**Always implement proper handlers:**
```typescript
// Good: Navigation
onClick={() => navigate('/page')}

// Good: State update
onClick={() => setShowDialog(true)}

// Good: Function call
onClick={() => handleSubmit()}

// Acceptable for TODO: Console log with comment
onClick={() => {
  // TODO: Implement broadcast email feature
  console.log('Navigate to broadcast email');
}}
```

### Navigation Link Verification

Before creating links, ensure target pages exist:
- Marketing site: `/demo`, `/features`, `/about`, `/blog`, `/docs`, `/pricing`, `/signup`, `/contact`, `/terms`, `/privacy`, `/welcome` ✅
- Tenant app: All pages route through Dashboard component state
- Platform admin: Check `navigation` array in `Layout.tsx`

## API Development (services/api/)

### NestJS + Prisma Patterns

```typescript
// Controller pattern
@Controller('tournaments')
export class TournamentsController {
  @Get()
  @UseGuards(JwtAuthGuard, TenantGuard)
  async findAll(@TenantId() tenantId: string) {
    // CRITICAL: Always filter by tenantId
    return this.service.findAll(tenantId);
  }
}

// Service with tenant isolation
async findAll(tenantId: string) {
  return this.prisma.tournament.findMany({
    where: { tenantId }, // Required for security
  });
}
```

### Database Migrations

```powershell
cd services/api

# Create new migration
npx prisma migrate dev --name add_feature_x

# Reset and reseed (LOCAL ONLY)
npx prisma migrate reset --force
node prisma/seed.js

# View data
npx prisma studio  # http://localhost:5555
```

## Testing Patterns

### Browser Console Testing (Primary Method)

1. **Smoke tests** - Quick validation (`smoke-test.js`)
2. **Feature tests** - Comprehensive (`test-role-customization.js`)
3. Run in browser console after login
4. Document results in `TEST_EXECUTION_REPORT.md`

### Backend E2E Tests

```powershell
cd services/api
node test/e2e/auth.e2e.js  # Auth flow validation
```

## Deployment Architecture

### Vercel Configuration

**Marketing Site (Next.js):**
```json
{
  "framework": "nextjs",
  "domains": ["www.smartequiz.com", "smartequiz.com"],
  "buildCommand": "pnpm build --filter=marketing-site"
}
```

**Platform Admin (Vite SPA):**
```json
{
  "domains": ["admin.smartequiz.com"],
  "buildCommand": "pnpm build --filter=platform-admin",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

**Tenant App (Vite SPA with Wildcard):**
```json
{
  "domains": ["*.smartequiz.com"],
  "buildCommand": "pnpm build --filter=tenant-app",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

## Troubleshooting Common Issues

### "Cannot find module '@smart-equiz/types'"

```powershell
cd packages/types; pnpm build
cd ../utils; pnpm build
# Restart app dev server
```

Then: Ctrl+Shift+P → "TypeScript: Restart TS Server"

### Permission Denied Errors

Check three levels:
1. **Role permissions:** `hasPermission(user, permission)`
2. **Plan features:** Tenant's subscription allows feature
3. **Resource ownership:** User owns the resource (`canEditResource`)

### Tenant Data Appearing Wrong

Verify tenant detection:
```typescript
// Check current tenant context
const tenant = await detectTenant(hostname);
console.log('Current tenant:', tenant);

// Ensure query includes tenant filter
const data = await db.table.findMany({
  where: { tenant_id: tenant.id } // Must have this
});
```

### Build Failures

```powershell
# Clean and rebuild
pnpm clean
cd packages/types; pnpm build
cd ../utils; pnpm build
cd ../../apps/tenant-app; pnpm build
```

### Navigation Issues

All navigation has been audited and verified. See `NAVIGATION_AUDIT_COMPLETE.md` for:
- 30+ Dashboard routes verified in workspace/shadcn-ui/
- All marketing site pages exist
- No placeholder alerts remaining
- 50+ functional alerts identified (future: migrate to toast notifications)

## Known Incomplete Features

### Marketing Site
- ✅ Demo page - Created
- ✅ Features page - Created
- ✅ About page - Created
- ✅ Blog page - Created (185 lines, 6 sample posts)
- ✅ Docs page - Created (175 lines, documentation hub)
- ✅ All pages complete - Pricing, Signup, Contact, Terms, Privacy, Welcome exist

### Platform Admin
- 🟡 Broadcast email - TODO (console log placeholder)
- 🟡 Mobile menu - TODO (console log placeholder)

### Tenant App
- 🟡 Video tutorials - TODO (console log placeholder)
- 🟡 Live chat - TODO (console log placeholder)

### Legacy Monolith (workspace/shadcn-ui/)
- ✅ Plan upgrade info - Fixed (was alert, now console.log)
- ✅ FAQs section - Fixed (was alert, now console.log)
- ⚠️ 50+ alert() calls - Functional validation/feedback alerts
  - **Note:** These are NOT placeholders - they provide user feedback for form validation, API responses, etc.
  - **Future improvement:** Replace with toast notification system (shadcn/ui Toast component)
  - Files affected: SecurityCenter.tsx (13), TeamManagement.tsx (9), ReportingExports.tsx (9), QuestionBank.tsx (3), and others
  - Example pattern: `alert('Please fill in all required fields')` → Should become toast notification

**Pattern:** All TODO features logged to console with comments, not alert popups. Validation alerts in legacy code are functional but should be migrated to toast notifications in future refactor.

## Environment-Specific Notes

- **Node.js:** 18+ required, 22.x recommended
- **Package Manager:** pnpm 8.10.0+ (NOT npm/yarn)
- **Shell:** Windows PowerShell (scripts use `.ps1`)
- **Docker:** Required for local Postgres/Redis stack
- **Testing:** Browser console for frontend, Node.js scripts for backend
