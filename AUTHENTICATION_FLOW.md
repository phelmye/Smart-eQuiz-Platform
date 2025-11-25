# Authentication Flow Architecture

**CRITICAL: Read this before making ANY changes to authentication or navigation!**

## 🚨 Core Principle: Three Separate Applications

This is NOT a monolith. We have **three completely independent applications** with different purposes and user bases:

```
┌─────────────────────────────────────────────────────────────────┐
│                    MARKETING SITE (Port 3000)                    │
│              www.smartequiz.com - Next.js 14                    │
│  Purpose: Public marketing, lead generation, tenant signup      │
│  Users: Prospective customers, general public                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┴──────────────┐
                │                            │
                ▼                            ▼
┌───────────────────────────┐  ┌─────────────────────────────────┐
│   PLATFORM LOGIN PAGE     │  │    TENANT APP (Port 5174)       │
│   /platform-login         │  │  tenant.smartequiz.com          │
│   On Marketing Site       │  │  React + Vite - ISOLATED        │
│                           │  │                                 │
│  For: Tenant Admins       │  │  For: End Users/Participants    │
│  Any org can login here   │  │  Each tenant is isolated        │
└───────────────────────────┘  └─────────────────────────────────┘
```

## ❌ WRONG Assumptions (What NOT to Do)

### ❌ WRONG: "Sign In" should go to Tenant App
**WHY WRONG:** Tenant App is ISOLATED per organization. A user from "First Baptist Church" should NOT see "Grace Community Church" landing page.

### ❌ WRONG: Marketing site should link to `tenant.smartequiz.com/login`
**WHY WRONG:** Tenant app is for PARTICIPANTS who receive direct links from their organization, NOT for tenant admins coming from marketing.

### ❌ WRONG: Create login in Tenant App for admins
**WHY WRONG:** Tenant App is already tenant-specific. Platform-wide login must be neutral.

## ✅ CORRECT Architecture

### 1. Marketing Site (`apps/marketing-site/`)

**Domain:** www.smartequiz.com (Port 3000 in dev)

**Navigation Rules:**
- **"Sign In" button** → `/platform-login` (NOT tenant app!)
- **"Sign Up" / "Start Free Trial"** → `/signup`
- **All internal links** → Stay within marketing site (`/features`, `/pricing`, etc.)

**File:** `apps/marketing-site/src/lib/marketingConfig.ts`
```typescript
headerMenu: [
  { label: 'Sign In', href: '/platform-login' }, // ✅ CORRECT
  { label: 'Sign In', href: 'http://localhost:5174' }, // ❌ WRONG!
]
```

### 2. Platform Login Page (`/platform-login`)

**Location:** `apps/marketing-site/src/app/platform-login/page.tsx`

**Purpose:** Central authentication for ALL tenant admins

**User Flow:**
1. User clicks "Sign In" from marketing site
2. Arrives at `/platform-login`
3. Enters email/password
4. System identifies their tenant
5. Redirects to `{tenant-subdomain}.smartequiz.com` or custom domain

**Key Features:**
- ✅ Email/password form
- ✅ "Forgot password?" link
- ✅ "Create Free Account" button → Returns to `/signup`
- ✅ Note for participants: "Use direct link from your organization"

**After Login Redirect:**
```typescript
// Determine tenant from user's email or account
const userTenant = await identifyTenant(email);
window.location.href = `https://${userTenant.subdomain}.smartequiz.com`;
```

### 3. Tenant App (`apps/tenant-app/`)

**Domain:** {tenant}.smartequiz.com (Port 5174 in dev)

**Purpose:** ISOLATED environment for each tenant's participants/end users

**Access Method:**
- ✅ Direct link provided by organization (e.g., `firstbaptist.smartequiz.com`)
- ✅ Email invitations from organization
- ❌ NOT from marketing site "Sign In" button
- ❌ NOT from platform-wide login

**Tenant Detection:** `apps/tenant-app/src/pages/Index.tsx`
```typescript
// ✅ CORRECT: Detect from subdomain or URL param
const detectTenantFromUrl = (): Tenant | null => {
  const hostname = window.location.hostname;
  // Extract subdomain or check ?tenant=xxx param
  return foundTenant;
};

// ❌ WRONG: Hardcoded tenant
const mockTenant = { id: 'demo-tenant', name: 'Demo Org' };
```

**Landing Page for Unauthenticated:**
```typescript
if (!isAuthenticated) {
  return (
    <TenantLandingPage 
      tenant={currentTenant} // ✅ Dynamic from URL
      onAuthSuccess={() => setCurrentPage('dashboard')}
    />
  );
}
```

### 4. Platform Admin (`apps/platform-admin/`)

**Domain:** admin.smartequiz.com (Port 5173 in dev)

**Purpose:** Super admin dashboard for managing the entire platform

**Access:** Separate authentication for platform administrators only

## 🔒 Authentication States

### Marketing Site
- **State:** No authentication required (public)
- **Login Action:** Redirect to `/platform-login`
- **Signup Action:** Stay on marketing site `/signup`

### Platform Login
- **State:** Pre-authentication
- **Success:** Redirect to user's tenant app
- **Failure:** Show error, stay on page

### Tenant App
- **State:** Tenant-specific authentication
- **Unauthenticated:** Show `TenantLandingPage` with "Join" / "Login" buttons
- **Authenticated:** Show `Dashboard` with tenant features

### Platform Admin
- **State:** Super admin authentication
- **Separate:** Completely different from tenant authentication

## 📋 Checklist: Before Making Navigation Changes

**STOP and verify:**

1. [ ] Which application am I modifying?
   - Marketing Site? Platform Admin? Tenant App?

2. [ ] Who is the target user?
   - Prospective customer? → Marketing site
   - Tenant admin? → Platform login page
   - Participant/end user? → Tenant app
   - Super admin? → Platform admin

3. [ ] Should this cross application boundaries?
   - If linking from Marketing → Tenant App, **think twice!**
   - Usually means you need Platform Login instead

4. [ ] Am I hardcoding tenant data?
   - If in Tenant App, MUST detect from URL
   - Never hardcode `mockTenant` in production code

5. [ ] Does this break tenant isolation?
   - Each tenant should ONLY see their data
   - No cross-tenant data leaks

## 🛠️ Common Tasks & Correct Implementation

### Task: "Add sign in link to homepage"
**WRONG:** `<Link href="http://localhost:5174">`
**CORRECT:** `<Link href="/platform-login">`

### Task: "Let users login to their account"
**WRONG:** Create login in Tenant App
**CORRECT:** Use `/platform-login`, redirect to tenant after auth

### Task: "Show tenant landing page"
**WRONG:** Link from marketing site
**CORRECT:** Users access directly via `tenant.smartequiz.com`

### Task: "User forgot password"
**WRONG:** Multiple forgot password pages per app
**CORRECT:** One `/forgot-password` on marketing site, used by platform login

## 🚀 Development URLs

```
Marketing Site:     http://localhost:3000
Platform Login:     http://localhost:3000/platform-login
Tenant App:         http://localhost:5174/?tenant=tenant1
Platform Admin:     http://localhost:5173
Backend API:        http://localhost:3001
```

## 📝 File Locations Reference

### Marketing Site Navigation
- **Config:** `apps/marketing-site/src/lib/marketingConfig.ts`
- **Header:** `apps/marketing-site/src/components/Header.tsx`
- **Platform Login:** `apps/marketing-site/src/app/platform-login/page.tsx`

### Tenant App
- **Main Entry:** `apps/tenant-app/src/pages/Index.tsx`
- **Landing Page:** `apps/tenant-app/src/components/TenantLandingPage.tsx`
- **Tenant Detection:** In `Index.tsx` `useEffect` → `detectTenantFromUrl()`

## ⚠️ Red Flags (Signs You're Breaking Architecture)

🚨 **STOP immediately if you see:**

1. Marketing site linking directly to `http://localhost:5174`
2. Hardcoded tenant data in Tenant App (`mockTenant = { ... }`)
3. Authentication forms in multiple places doing the same thing
4. Users from one tenant seeing another tenant's data
5. "Sign In" button going anywhere except `/platform-login`

## ✅ Testing Your Changes

Before committing navigation/auth changes:

```powershell
# 1. Verify marketing site links
curl http://localhost:3000 | Select-String "platform-login"

# 2. Check tenant detection
# Visit http://localhost:5174/?tenant=tenant1
# Console should show: "🔍 Detected tenant: [tenant object]"

# 3. Test sign-in flow
# Click "Sign In" from marketing → Should land on /platform-login
# Should NOT go to tenant app directly

# 4. Verify isolation
# Visit http://localhost:5174/?tenant=tenant1 → See "First Baptist Church"
# Visit http://localhost:5174/?tenant=tenant2 → See "Grace Community Church"
# They should be COMPLETELY different
```

## 📚 Related Documentation

- `ARCHITECTURE.md` - Overall system architecture
- `ACCESS_CONTROL_SYSTEM.md` - RBAC and permissions
- `MULTI_TENANT_CHAT_SYSTEM.md` - Tenant isolation patterns
- `MIGRATION_GUIDE.md` - Moving from monolith to three-app structure

## 🔄 Review Process

**Before merging PRs that touch authentication/navigation:**

1. Reviewer must verify this document was followed
2. Check all three applications still work independently
3. Verify tenant isolation not broken
4. Test sign-in flow from marketing site
5. Confirm no hardcoded tenant data

---

**Last Updated:** November 25, 2025
**Maintainer:** Development Team
**Status:** ✅ Active - Follow Strictly
