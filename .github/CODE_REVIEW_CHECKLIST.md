# Code Review Checklist

## 🎯 Purpose
This checklist ensures code reviews catch architectural violations BEFORE they get merged.

## 📋 General Review (All PRs)

### Code Quality
- [ ] Code is readable and well-commented
- [ ] No console.log/alert() left in production code (use proper logging)
- [ ] Error handling is appropriate
- [ ] No hardcoded values that should be configurable
- [ ] TypeScript types are properly defined (no `any` without justification)

### Testing
- [ ] PR author tested changes locally
- [ ] Manual testing steps are documented in PR
- [ ] No new TypeScript errors introduced
- [ ] All applications compile successfully

### Documentation
- [ ] README/docs updated if features changed
- [ ] JSDoc comments added for complex functions
- [ ] Environment variables documented if added

## 🚨 CRITICAL: Authentication & Navigation Review

**⚠️ STOP: If PR touches auth/navigation, ALL items below MUST be checked!**

### Architecture Compliance
- [ ] Reviewed `AUTHENTICATION_FLOW.md` before reviewing PR
- [ ] Changes align with three-app separation principle
- [ ] No confusion between Marketing/Tenant App/Platform Admin

### Marketing Site (`apps/marketing-site/`)
- [ ] "Sign In" links point to `/platform-login` (NOT `http://localhost:5174`)
- [ ] "Sign Up" links point to `/signup`
- [ ] No direct links to tenant app from marketing site
- [ ] Header navigation config (`marketingConfig.ts`) is correct

### Platform Login (`/platform-login`)
- [ ] Page exists at `apps/marketing-site/src/app/platform-login/page.tsx`
- [ ] "Create Free Account" button goes back to `/signup`
- [ ] After successful login, redirects to appropriate tenant app
- [ ] Error messages are user-friendly
- [ ] Note for participants exists: "Use direct link from organization"

### Tenant App (`apps/tenant-app/`)
- [ ] **NO hardcoded tenant data** (e.g., `mockTenant = { id: 'demo' }`)
- [ ] Tenant detection is dynamic from URL
  ```typescript
  // ✅ GOOD
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  useEffect(() => {
    const tenant = detectTenantFromUrl();
    setCurrentTenant(tenant);
  }, []);
  
  // ❌ BAD
  const mockTenant = { id: 'demo', name: 'Demo Org' };
  ```
- [ ] Unauthenticated users see `TenantLandingPage`
- [ ] All database queries filter by `tenant_id`
- [ ] No cross-tenant data leaks

### Tenant Isolation Verification
- [ ] Test with `?tenant=tenant1` shows different data than `?tenant=tenant2`
- [ ] User permissions respect tenant boundaries
- [ ] Storage keys include tenant ID (`storage.get('tenant_X_users')`)
- [ ] No global state shared between tenants

## 🔐 Security Review

### Authentication
- [ ] Passwords are never logged or exposed
- [ ] JWTs/tokens are properly validated
- [ ] Session management is secure
- [ ] CSRF protection in place for state-changing operations

### Authorization
- [ ] Permission checks use `hasPermission(user, permission)`
- [ ] Tenant ID is verified in ALL data access
- [ ] Role hierarchy is respected
- [ ] Super admin routes are protected

### Data Protection
- [ ] No sensitive data in URLs
- [ ] API responses don't leak unauthorized data
- [ ] File uploads are validated
- [ ] SQL injection prevention (using Prisma)

## 🏗️ Multi-Tenant Architecture

### Tenant Data Isolation
```typescript
// ✅ GOOD: Always filter by tenant_id
const users = await db.users.findAll({ 
  where: { tenant_id: currentTenant.id } 
});

// ❌ BAD: Missing tenant filter - DATA LEAK!
const users = await db.users.findAll();
```

- [ ] ALL database queries include tenant filter
- [ ] Tenant context is injected early in request lifecycle
- [ ] No global caches without tenant separation

### Shared Packages (`packages/`)

If shared packages modified:
- [ ] Types package rebuilt: `cd packages/types && pnpm build`
- [ ] Utils package rebuilt: `cd packages/utils && pnpm build`
- [ ] Dependent apps restarted after package changes
- [ ] No breaking changes to shared interfaces

## 🎨 UI/UX Review

### User Experience
- [ ] Buttons have proper onClick handlers (no empty `() => {}`)
- [ ] Loading states shown for async operations
- [ ] Error messages are helpful and actionable
- [ ] Forms validate input properly
- [ ] Navigation is intuitive

### Placeholder Detection
```typescript
// ❌ BAD: Placeholder implementations
onClick={() => {}}
onClick={() => alert('Coming soon')}

// ✅ GOOD: Proper implementation or TODO
onClick={() => {
  // TODO: Implement feature X
  console.log('Feature X not yet implemented');
}}
onClick={() => handleSubmit()}
```

- [ ] No `alert()` placeholders
- [ ] No empty onClick handlers
- [ ] TODOs have tracking issues

## 🚀 Performance Review

### Code Efficiency
- [ ] No unnecessary re-renders in React
- [ ] Database queries are optimized (use indexes)
- [ ] Large data sets are paginated
- [ ] Images are optimized and lazy-loaded

### Build Performance
- [ ] Bundle size not significantly increased
- [ ] No circular dependencies introduced
- [ ] Dynamic imports used for code splitting where appropriate

## 📦 Dependency Review

If dependencies changed:
- [ ] New dependencies are justified
- [ ] Dependency versions are pinned or use `^` appropriately
- [ ] No known vulnerabilities in new dependencies
- [ ] License is compatible with project

## 🔄 Migration Review (Legacy → New Apps)

If porting from `workspace/shadcn-ui/`:
- [ ] ALL related logic ported (not just UI)
- [ ] Tenant detection included if applicable
- [ ] Permission checks included
- [ ] Storage keys updated for new structure

## ✅ Final Checks Before Approval

### Must Be True
- [ ] PR description clearly explains what and why
- [ ] Changes are focused (not mixing multiple unrelated features)
- [ ] No merge conflicts
- [ ] CI/CD passes (if configured)
- [ ] No degradation in existing functionality

### Architecture Integrity
- [ ] Three-app separation maintained
- [ ] Tenant isolation intact
- [ ] Authentication flow correct
- [ ] No architectural debt introduced

### Approval Criteria

**Auto-reject if:**
- ❌ Hardcoded tenant data in tenant app
- ❌ Marketing site links directly to tenant app
- ❌ Database queries missing `tenant_id` filter
- ❌ Authentication flow broken
- ❌ Shared packages not rebuilt after changes

**Request changes if:**
- ⚠️ Missing tests for critical functionality
- ⚠️ Documentation not updated
- ⚠️ Placeholder implementations without TODO tracking
- ⚠️ Security concerns not addressed

**Approve if:**
- ✅ All applicable checklist items passed
- ✅ Code quality is high
- ✅ Architecture compliance verified
- ✅ No security/isolation violations

---

## 📝 Reviewer Notes Template

```markdown
## Review Summary

**Reviewed by:** [Your Name]
**Date:** [Date]
**Overall:** ✅ Approved / ⚠️ Changes Requested / ❌ Rejected

### What I Checked
- [ ] Architecture compliance
- [ ] Security
- [ ] Code quality
- [ ] Testing

### Findings
1. [Issue/observation]
2. [Issue/observation]

### Action Items
- [ ] [Required change]
- [ ] [Required change]

### Questions for Author
1. [Question]
2. [Question]
```

---

**Last Updated:** November 25, 2025
**Version:** 1.0
**Mandatory:** Yes - All PRs must be reviewed against this checklist
