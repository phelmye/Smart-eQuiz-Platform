# Smart eQuiz Platform - Architecture Documentation

## Overview

Smart eQuiz Platform is a **multi-tenant SaaS solution** for Bible quiz competitions. The platform is architected as **three separate applications** to ensure proper separation of concerns, scalability, and tenant isolation.

---

## 🏗️ System Architecture

### Three-Application Structure

```
┌─────────────────────────────────────────────────────────────┐
│                    SMART EQUIZ PLATFORM                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │  Marketing      │  │  Platform       │  │   Tenant    │ │
│  │  Website        │  │  Admin          │  │   Apps      │ │
│  │                 │  │                 │  │             │ │
│  │  Public Facing  │  │  Super Admin    │  │  Multi-     │ │
│  │  Landing Page   │  │  Dashboard      │  │  Tenant     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
│         ↓                     ↓                    ↓         │
│  www.smartequiz.com   admin.smartequiz.com   *.smartequiz   │
│                                               .com           │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Application Breakdown

### 1. **Marketing Website** (`marketing-site/`)

**Purpose:** Public-facing website to promote and sell the SaaS solution

**URL:** `www.smartequiz.com` or `smartequiz.com`

**Tech Stack:**
- Next.js 14+ (App Router)
- React 18+
- Tailwind CSS
- shadcn/ui components

**Key Features:**
- Homepage with feature showcase
- Pricing page with plan comparison
- **Tenant Self-Registration** (Organizations sign up)
- About Us / Contact / Blog
- Demo request / Trial signup
- Documentation / Help Center
- SEO optimized for marketing

**Pages:**
```
/                      → Homepage
/pricing              → Pricing plans
/features             → Feature details
/signup               → Tenant registration
/login                → Redirects to tenant subdomain
/about                → About the platform
/contact              → Contact form
/docs                 → Public documentation
/blog                 → Marketing blog
```

**Tenant Registration Flow:**
```typescript
// User fills signup form
{
  organizationName: "First Baptist Church",
  adminName: "John Doe",
  adminEmail: "john@firstbaptist.org",
  phone: "+1234567890",
  password: "********",
  planId: "plan-pro"
}

// System creates:
1. Tenant record
2. Subdomain: firstbaptist.smartequiz.com
3. Admin user (org_admin role)
4. Welcome email with onboarding link
5. Redirect to: firstbaptist.smartequiz.com/onboarding
```

---

### 2. **Platform Admin Dashboard** (`platform-admin/`)

**Purpose:** Super Admin interface to manage the entire SaaS business

**URL:** `admin.smartequiz.com`

**Tech Stack:**
- React + Vite (current setup)
- TypeScript
- Tailwind CSS + shadcn/ui
- Protected by super_admin role only

**Key Features:**
- **Tenant Management** - View, create, suspend, delete tenants
- **Subscription & Billing** - Manage plans, billing cycles, payments
- **System Analytics** - Platform-wide metrics and reports
- **Support Tickets** - Handle tenant support requests
- **User Management** - View all users across all tenants
- **System Settings** - Platform configuration
- **Audit Logs** - Track all super admin actions

**Key Components:**
```
TenantManagement.tsx           → CRUD for all tenants
PlatformBillingOverview.tsx    → Revenue, MRR, churn metrics
SystemAnalytics.tsx            → Platform-wide statistics
SupportTicketManager.tsx       → Ticket queue and responses
GlobalUserSearch.tsx           → Search users across tenants
SystemSettings.tsx             → Platform configuration
AuditLogViewer.tsx            → Security and compliance logs
```

**Access Control:**
- Only accessible by users with `role: 'super_admin'`
- Cannot access tenant-specific data directly
- Uses "Login As" feature to impersonate tenant admins

---

### 3. **Tenant Application** (`tenant-app/`)

**Purpose:** Multi-tenant application where each organization runs their quiz platform

**URLs:**
- Subdomain: `{tenant}.smartequiz.com`
- Custom Domain: `quiz.firstbaptist.org` (optional)

**Tech Stack:**
- React + Vite (refactored from current codebase)
- TypeScript
- Tailwind CSS + shadcn/ui
- Tenant context detection middleware

**Key Features:**
- **Tenant-Specific Login** - Each tenant has isolated authentication
- **Dashboard** - Tournament overview, analytics
- **Tournament Management** - Create, schedule, run tournaments
- **Question Bank** - Manage quiz questions by categories
- **User Management** - Invite team members, participants
- **Practice Mode** - Training for participants
- **Live Tournaments** - Real-time quiz competitions
- **Billing & Payments** - Tenant collects their own tournament fees
- **Branding** - Custom logo, colors, themes
- **Mobile App Support** - API for white-labeled mobile apps

**User Roles (Tenant-Specific):**
```typescript
'org_admin'          → Tenant administrator (full access)
'question_manager'   → Manages questions and categories
'account_officer'    → Handles billing and payments
'inspector'          → Monitors tournaments, reports issues
'moderator'          → Manages participants and teams
'participant'        → Competes in tournaments
'spectator'          → View-only access
```

**Tenant Isolation:**
- All queries filtered by `tenant_id`
- Users can only see data from their own tenant
- No cross-tenant data leaks
- Subdomain/custom domain determines tenant context

---

## 🔐 Authentication & Authorization

### Authentication Flow

```
┌──────────────────────────────────────────────────────────┐
│                   AUTHENTICATION                          │
├──────────────────────────────────────────────────────────┤
│                                                            │
│  Marketing Site (www.smartequiz.com)                      │
│  ├─ Tenant Registration → Creates tenant + admin user    │
│  └─ Login → Redirects to tenant subdomain                │
│                                                            │
│  Platform Admin (admin.smartequiz.com)                   │
│  ├─ Super Admin Login → JWT with super_admin role        │
│  └─ "Login As" → Impersonate tenant admin temporarily    │
│                                                            │
│  Tenant App (firstbaptist.smartequiz.com)                │
│  ├─ Tenant-Specific Login → JWT with tenant_id + role   │
│  ├─ Team Member Invitation → Email link with token       │
│  └─ Public Registration → If enabled by tenant admin     │
│                                                            │
└──────────────────────────────────────────────────────────┘
```

### JWT Token Structure

```typescript
// Super Admin Token
{
  userId: "user_xxx",
  email: "admin@smartequiz.com",
  role: "super_admin",
  tenantId: null,  // No tenant association
  exp: 1234567890
}

// Tenant User Token
{
  userId: "user_yyy",
  email: "john@firstbaptist.org",
  role: "org_admin",
  tenantId: "tenant_firstbaptist",
  exp: 1234567890
}
```

---

## 🗄️ Database Schema

### Shared Database with Tenant Isolation

```sql
-- Tenants Table
CREATE TABLE tenants (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  subdomain VARCHAR(100) UNIQUE NOT NULL,
  custom_domain VARCHAR(255) UNIQUE,
  custom_domain_verified BOOLEAN DEFAULT false,
  plan_id VARCHAR(100) NOT NULL,
  status ENUM('active', 'suspended', 'cancelled') DEFAULT 'active',
  primary_color VARCHAR(7) DEFAULT '#2563eb',
  logo_url TEXT,
  ssl_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_subdomain (subdomain),
  INDEX idx_custom_domain (custom_domain),
  INDEX idx_status (status)
);

-- Users Table (All tenants)
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY,
  tenant_id VARCHAR(255) NOT NULL,  -- Foreign key to tenants
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('super_admin', 'org_admin', 'question_manager', 'account_officer', 
            'inspector', 'moderator', 'participant', 'spectator') NOT NULL,
  is_active BOOLEAN DEFAULT true,
  xp INT DEFAULT 0,
  level INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_email_per_tenant (tenant_id, email),
  INDEX idx_tenant (tenant_id),
  INDEX idx_role (role),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- Tournaments Table
CREATE TABLE tournaments (
  id VARCHAR(255) PRIMARY KEY,
  tenant_id VARCHAR(255) NOT NULL,  -- Tenant isolation
  name VARCHAR(255) NOT NULL,
  created_by VARCHAR(255) NOT NULL,
  status ENUM('draft', 'scheduled', 'active', 'completed') DEFAULT 'draft',
  start_date TIMESTAMP,
  entry_fee DECIMAL(10, 2) DEFAULT 0,
  max_participants INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_tenant (tenant_id),
  INDEX idx_status (status),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Questions Table
CREATE TABLE questions (
  id VARCHAR(255) PRIMARY KEY,
  tenant_id VARCHAR(255) NOT NULL,  -- Tenant isolation
  category VARCHAR(100),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
  created_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_tenant (tenant_id),
  INDEX idx_category (category),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);
```

### Data Isolation Rules

**Critical:** Every query MUST include `tenant_id` filter (except super_admin operations)

```typescript
// ❌ WRONG - No tenant isolation
const questions = await db.questions.findAll();

// ✅ CORRECT - Tenant isolated
const questions = await db.questions.findAll({
  where: { tenant_id: currentTenant.id }
});
```

---

## 🌐 Domain & Routing Strategy

### Domain Mapping

```
Marketing Site:
- www.smartequiz.com
- smartequiz.com

Platform Admin:
- admin.smartequiz.com

Tenant Subdomains:
- firstbaptist.smartequiz.com
- gracechurch.smartequiz.com
- stmarys.smartequiz.com

Custom Domains (Optional):
- quiz.firstbaptist.org → CNAME → firstbaptist.smartequiz.com
- tournaments.gracechurch.com → CNAME → gracechurch.smartequiz.com
```

### Tenant Detection Middleware

```typescript
// middleware/tenantDetection.ts
export async function detectTenant(hostname: string): Promise<Tenant | null> {
  // Remove port for local dev
  const domain = hostname.split(':')[0];
  
  // Marketing site
  if (domain === 'smartequiz.com' || domain === 'www.smartequiz.com') {
    return { type: 'marketing', tenant: null };
  }
  
  // Platform admin
  if (domain === 'admin.smartequiz.com') {
    return { type: 'admin', tenant: null };
  }
  
  // Check custom domain first
  let tenant = await db.tenants.findOne({ custom_domain: domain });
  
  // Fallback to subdomain
  if (!tenant) {
    const subdomain = domain.split('.')[0];
    tenant = await db.tenants.findOne({ subdomain });
  }
  
  if (!tenant) {
    throw new Error('Tenant not found');
  }
  
  return { type: 'tenant', tenant };
}
```

---

## 📱 Mobile App Strategy

### White-Label Mobile Apps

Each tenant can have their own branded mobile app:

**App Store Listing:**
- "First Baptist Bible Quiz"
- "Grace Church Tournaments"

**App Configuration:**
```typescript
// config.ts (per tenant app)
export const APP_CONFIG = {
  tenantId: "tenant_firstbaptist",
  apiBaseUrl: "https://firstbaptist.smartequiz.com/api",
  websocketUrl: "wss://firstbaptist.smartequiz.com/ws",
  branding: {
    appName: "First Baptist Bible Quiz",
    primaryColor: "#2563eb",
    logoUrl: "https://firstbaptist.org/logo.png"
  }
};
```

**OR Single App with Org Code:**
```typescript
// User enters: "firstbaptist" or scans QR code
const config = await fetchTenantConfig(orgCode);
```

---

## 🚀 Deployment Architecture

### Infrastructure Setup

```yaml
# Recommended: Vercel + Cloudflare

Marketing Site:
  - Deploy to: Vercel
  - Domain: www.smartequiz.com
  - Framework: Next.js
  
Platform Admin:
  - Deploy to: Vercel
  - Domain: admin.smartequiz.com
  - Framework: React (Vite build)
  
Tenant App:
  - Deploy to: Vercel (with wildcard domain)
  - Domains: *.smartequiz.com + custom domains
  - Framework: React (Vite build)
  - Edge middleware for tenant detection

Database:
  - PostgreSQL (Supabase or AWS RDS)
  - Redis for caching tenant configs
  
Storage:
  - AWS S3 or Cloudflare R2
  - Bucket per tenant for isolation

SSL:
  - Cloudflare automatic SSL
  - Let's Encrypt for custom domains
```

### Environment Variables

```bash
# Marketing Site (.env.production)
NEXT_PUBLIC_API_URL=https://api.smartequiz.com
NEXT_PUBLIC_PLATFORM_DOMAIN=smartequiz.com

# Platform Admin (.env.production)
VITE_API_URL=https://api.smartequiz.com
VITE_APP_TYPE=admin

# Tenant App (.env.production)
VITE_API_URL=https://api.smartequiz.com
VITE_APP_TYPE=tenant
VITE_ENABLE_SUBDOMAIN_DETECTION=true
```

---

## 🔄 Data Flow Examples

### Example 1: New Tenant Registration

```
1. User visits www.smartequiz.com/signup
2. Fills form: "First Baptist Church"
3. Marketing site POST to /api/tenants/register
4. Backend creates:
   - Tenant record (id: tenant_firstbaptist)
   - Subdomain: firstbaptist
   - Admin user (john@firstbaptist.org)
5. DNS automatically configured for *.smartequiz.com
6. Welcome email sent with link: firstbaptist.smartequiz.com/onboarding
7. Admin logs in at firstbaptist.smartequiz.com
8. Completes onboarding wizard
```

### Example 2: Tenant Admin Invites Team Member

```
1. Admin logs in at firstbaptist.smartequiz.com
2. Goes to Team Management
3. Invites "jane@firstbaptist.org" as "question_manager"
4. System sends email with link:
   firstbaptist.smartequiz.com/invite?token=xxx
5. Jane clicks link, sets password
6. Jane logs in at firstbaptist.smartequiz.com
7. Can only access First Baptist's data
```

### Example 3: Super Admin Monitors Platform

```
1. Super Admin logs in at admin.smartequiz.com
2. Views all tenants in dashboard
3. Sees First Baptist needs support
4. Clicks "Login As" → tenant admin
5. Temporarily accesses firstbaptist.smartequiz.com
6. Helps resolve issue
7. Logs out → returns to admin.smartequiz.com
```

---

## 🛡️ Security Considerations

### Tenant Isolation
- ✅ All queries filtered by `tenant_id`
- ✅ JWT tokens include tenant context
- ✅ Middleware validates tenant access
- ✅ No shared resources between tenants

### Data Protection
- ✅ Encryption at rest (database)
- ✅ Encryption in transit (HTTPS only)
- ✅ Rate limiting per tenant
- ✅ CORS policies per domain

### Authentication
- ✅ JWT with short expiration
- ✅ Refresh token rotation
- ✅ Password hashing (bcrypt)
- ✅ 2FA support (optional)

---

## 📊 Monitoring & Analytics

### Platform-Level Metrics (admin.smartequiz.com)
- Total tenants (active/suspended/cancelled)
- Monthly Recurring Revenue (MRR)
- Churn rate
- New signups per month
- System uptime and performance

### Tenant-Level Metrics ({tenant}.smartequiz.com)
- Active users
- Tournaments held
- Questions created
- Revenue from tournament fees
- User engagement scores

---

## 🔧 Development Setup

### Local Development

```bash
# Clone repository
git clone https://github.com/phelmye/Smart-eQuiz-Platform.git
cd Smart-eQuiz-Platform

# Install dependencies for all apps
pnpm install

# Start all applications
pnpm dev

# Or start individually
cd marketing-site && pnpm dev      # http://localhost:3000
cd platform-admin && pnpm dev      # http://localhost:5173
cd tenant-app && pnpm dev          # http://localhost:5174
```

### Local Domain Setup (Optional)

```bash
# Edit hosts file for local testing
# Windows: C:\Windows\System32\drivers\etc\hosts
# Mac/Linux: /etc/hosts

127.0.0.1 smartequiz.local
127.0.0.1 www.smartequiz.local
127.0.0.1 admin.smartequiz.local
127.0.0.1 firstbaptist.smartequiz.local
127.0.0.1 gracechurch.smartequiz.local
```

---

## 📝 Migration Plan

### Phase 1: Setup Structure ✅
- Create three application directories
- Extract shared components/types to packages
- Setup deployment configurations

### Phase 2: Marketing Site
- Build homepage and pricing pages
- Implement tenant registration flow
- Setup email notifications
- Deploy to www.smartequiz.com

### Phase 3: Platform Admin
- Move super admin features from current app
- Build tenant management dashboard
- Implement billing overview
- Deploy to admin.smartequiz.com

### Phase 4: Tenant App
- Refactor current app to tenant-only
- Add tenant detection middleware
- ✅ Parish-based registration (COMPLETED)
- Test subdomain routing
- Deploy to *.smartequiz.com

### Phase 5: Testing & Launch
- End-to-end testing all three apps
- Load testing tenant isolation
- Security audit
- Production deployment

---

## 🎯 Future Enhancements

- [ ] Custom domain SSL automation
- [ ] White-label mobile app builder
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] API marketplace for integrations
- [ ] Tenant data export/import
- [ ] Automated backup per tenant
- [ ] Real-time collaboration features

---

## 📚 References

- [Multi-Tenant SaaS Best Practices](https://docs.aws.amazon.com/wellarchitected/latest/saas-lens/saas-lens.html)
- [Vercel Multi-Tenant Setup](https://vercel.com/docs/concepts/solutions/multi-tenant)
- [Auth0 Multi-Tenant Guide](https://auth0.com/docs/manage-users/organizations/configure-organizations)

---

**Last Updated:** November 16, 2025
**Version:** 1.0.0
**Maintained By:** Smart eQuiz Platform Team
