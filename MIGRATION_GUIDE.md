# Migration Guide: Implementing Full Separation Architecture

This guide walks you through migrating from the current monolithic structure to the three-app architecture.

## 📋 Overview

**Current State:**  
- Single application (`workspace/shadcn-ui/`)
- Mixed concerns (marketing, admin, tenant features)
- Tenant selection dropdown
- All users/tenants in one codebase

**Target State:**  
- Three separate applications
- Clear separation of concerns
- Subdomain/custom domain routing
- Proper tenant isolation

---

## 🗓️ Migration Timeline

### Phase 1: Setup & Planning (Week 1)
- [ ] Review architecture documentation
- [ ] Setup new directory structure
- [ ] Install dependencies for all apps
- [ ] Configure development environment

### Phase 2: Shared Package Extraction (Week 1-2)
- [ ] Extract common types to `packages/types`
- [ ] Extract UI components to `packages/ui`
- [ ] Extract utilities to `packages/utils`
- [ ] Setup package linking (pnpm workspaces)

### Phase 3: Marketing Site (Week 2-3)
- [ ] Build homepage and landing pages
- [ ] Implement tenant registration form
- [ ] Setup email notifications
- [ ] Deploy to www.smartequiz.com

### Phase 4: Platform Admin (Week 3-4)
- [ ] Move super admin components
- [ ] Build billing overview dashboard
- [ ] Implement "Login As" feature
- [ ] Deploy to admin.smartequiz.com

### Phase 5: Tenant App Refactoring (Week 4-5)
- [ ] Copy current app to tenant-app
- [ ] Implement tenant detection
- [ ] Remove tenant selection UI
- [ ] Add subdomain routing
- [ ] Deploy to *.smartequiz.com

### Phase 6: Testing & Launch (Week 6)
- [ ] End-to-end testing
- [ ] Load testing
- [ ] Security audit
- [ ] Production deployment

---

## 🛠️ Step-by-Step Migration

### Step 1: Create Workspace Structure

```bash
cd "c:\Projects\Dev\Smart eQuiz Platform"

# Create apps directory (already done)
mkdir -p apps/{marketing-site,platform-admin,tenant-app}

# Create shared packages
mkdir -p packages/{types,ui,utils}

# Setup pnpm workspace
cat > pnpm-workspace.yaml << EOF
packages:
  - 'apps/*'
  - 'packages/*'
EOF
```

### Step 2: Setup Shared Packages

#### packages/types/package.json
```json
{
  "name": "@smart-equiz/types",
  "version": "1.0.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc"
  },
  "devDependencies": {
    "typescript": "^5.6.0"
  }
}
```

#### packages/types/src/index.ts
```typescript
// Common types shared across all apps

export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  customDomain?: string;
  customDomainVerified: boolean;
  planId: string;
  status: 'active' | 'suspended' | 'cancelled';
  primaryColor: string;
  logoUrl?: string;
  sslEnabled: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  tenantId: string | null;  // null for super_admin
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  xp: number;
  level: number;
  badges: string[];
  walletBalance: number;
  createdAt: string;
}

export type UserRole = 
  | 'super_admin'        // Platform admin only
  | 'org_admin'          // Tenant administrator
  | 'question_manager'
  | 'account_officer'
  | 'inspector'
  | 'moderator'
  | 'participant'
  | 'spectator';

export interface Plan {
  id: string;
  name: string;
  displayName: string;
  description: string;
  monthlyPrice: number;
  yearlyDiscountPercent: number;
  billingOptions: ('monthly' | 'yearly')[];
  maxUsers: number;
  maxTournaments: number;
  maxQuestionsPerTournament: number;
  maxQuestionCategories: number;
  features: string[];
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Tournament {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  createdBy: string;
  status: 'draft' | 'scheduled' | 'active' | 'completed';
  startDate?: string;
  entryFee: number;
  maxParticipants?: number;
  participants: string[];
  createdAt: string;
}

export interface Question {
  id: string;
  tenantId: string;
  category: string;
  question: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  createdBy: string;
  createdAt: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
```

### Step 3: Move Current App to tenant-app

```bash
# Copy current workspace to tenant-app
cp -r workspace/shadcn-ui/* apps/tenant-app/

# Update package.json name
cd apps/tenant-app
# Edit package.json: "name": "tenant-app"

# Update imports to use shared packages
# Find: import { User, Tenant } from '@/lib/mockData'
# Replace: import { User, Tenant } from '@smart-equiz/types'
```

### Step 4: Extract Super Admin Components to platform-admin

**Components to move:**
- `TenantManagement.tsx` → platform-admin
- `TenantManagementForSuperAdmin.tsx` → platform-admin
- `PlanManagement.tsx` → platform-admin
- `SystemSettings.tsx` → platform-admin
- `AuditLogViewer.tsx` → platform-admin

**Create new components for platform-admin:**
- `PlatformBillingOverview.tsx` - Revenue metrics
- `SupportTicketManager.tsx` - Support queue
- `GlobalUserSearch.tsx` - Search all users

### Step 5: Implement Tenant Detection

```typescript
// apps/tenant-app/src/middleware/tenantDetection.ts

export interface TenantContext {
  tenant: Tenant | null;
  loading: boolean;
  error: Error | null;
}

export async function detectTenant(): Promise<Tenant> {
  const hostname = window.location.hostname;
  
  // Development mode override
  if (hostname === 'localhost' || hostname.includes('127.0.0.1')) {
    const devTenant = import.meta.env.VITE_DEV_TENANT;
    if (devTenant) {
      const response = await fetch(`/api/tenants/by-subdomain/${devTenant}`);
      return response.json();
    }
    throw new Error('No development tenant configured');
  }
  
  const domain = hostname.split(':')[0];
  
  // Try custom domain first
  try {
    const response = await fetch(`/api/tenants/by-domain/${domain}`);
    if (response.ok) {
      return response.json();
    }
  } catch (e) {
    // Fall through to subdomain check
  }
  
  // Extract subdomain
  const parts = domain.split('.');
  if (parts.length >= 2) {
    const subdomain = parts[0];
    const response = await fetch(`/api/tenants/by-subdomain/${subdomain}`);
    if (response.ok) {
      return response.json();
    }
  }
  
  throw new Error('Tenant not found');
}

// Create React Context
import { createContext, useContext, useEffect, useState } from 'react';

const TenantContext = createContext<TenantContext | null>(null);

export const TenantProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    detectTenant()
      .then(t => {
        setTenant(t);
        // Apply tenant branding
        if (t.primaryColor) {
          document.documentElement.style.setProperty('--primary', t.primaryColor);
        }
      })
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Tenant Not Found</h1>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <a href="https://www.smartequiz.com" className="text-blue-600 hover:underline">
            Return to homepage
          </a>
        </div>
      </div>
    );
  }
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  return (
    <TenantContext.Provider value={{ tenant, loading, error }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within TenantProvider');
  }
  return context;
};
```

### Step 6: Remove Tenant Selection from AuthSystem

**Current AuthSystem.tsx has:**
```tsx
<Select name="tenantId" required>
  <SelectTrigger>
    <SelectValue placeholder="Select your organization" />
  </SelectTrigger>
  <SelectContent>
    {mockTenants.map(tenant => (
      <SelectItem key={tenant.id} value={tenant.id}>
        {tenant.name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

**Replace with:**
```tsx
// Remove tenant selection completely
// Tenant is determined by subdomain automatically

// In registration - user is invited by admin OR
// Public registration enabled by tenant
```

### Step 7: Update API Client with Tenant Context

```typescript
// apps/tenant-app/src/lib/api.ts
import { useTenant } from '@/middleware/tenantDetection';

// Create axios instance with tenant interceptor
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Add tenant context to all requests
  const tenantContext = getTenantContext(); // From TenantProvider
  if (tenantContext?.tenant) {
    config.headers['X-Tenant-Id'] = tenantContext.tenant.id;
  }
  
  return config;
});

// All API calls now automatically include tenant context
export const tournamentApi = {
  list: () => api.get('/tournaments'), // Filtered by tenant_id on backend
  create: (data) => api.post('/tournaments', data),
  // ...
};
```

### Step 8: Configure Local Development with Subdomains

**Option A: Edit Hosts File**
```bash
# Windows: C:\Windows\System32\drivers\etc\hosts
# Mac/Linux: /etc/hosts

127.0.0.1 smartequiz.local
127.0.0.1 www.smartequiz.local
127.0.0.1 admin.smartequiz.local
127.0.0.1 firstbaptist.smartequiz.local
127.0.0.1 gracechurch.smartequiz.local
```

**Option B: Use Environment Variable Override**
```bash
# .env.local
VITE_DEV_TENANT=firstbaptist

# App will act as if accessed via firstbaptist.smartequiz.com
```

### Step 9: Update Deployment Configuration

#### Vercel Deployment

**vercel.json (marketing-site)**
```json
{
  "framework": "nextjs",
  "buildCommand": "pnpm build",
  "outputDirectory": ".next",
  "installCommand": "pnpm install",
  "domains": ["www.smartequiz.com", "smartequiz.com"]
}
```

**vercel.json (platform-admin)**
```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": "dist",
  "installCommand": "pnpm install",
  "domains": ["admin.smartequiz.com"],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

**vercel.json (tenant-app)**
```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": "dist",
  "installCommand": "pnpm install",
  "domains": ["*.smartequiz.com"],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "VITE_ENABLE_SUBDOMAIN_DETECTION": "true"
  }
}
```

---

## 🧪 Testing Checklist

### Marketing Site
- [ ] Homepage loads correctly
- [ ] Pricing page displays all plans
- [ ] Tenant registration form validates input
- [ ] Subdomain availability check works
- [ ] Registration creates tenant + admin user
- [ ] Welcome email sent
- [ ] Redirects to tenant subdomain after signup

### Platform Admin
- [ ] Super admin can log in
- [ ] Tenant list displays all tenants
- [ ] Can create/edit/delete tenants
- [ ] "Login As" redirects to tenant subdomain
- [ ] Billing overview shows correct metrics
- [ ] Audit logs record all actions

### Tenant App
- [ ] Subdomain detection works
- [ ] Custom domain detection works
- [ ] Tenant branding applied (logo, colors)
- [ ] Users can log in (no tenant selection)
- [ ] All data filtered by current tenant
- [ ] Cannot access other tenant's data
- [ ] Team member invitation works
- [ ] Mobile API endpoints return tenant data only

### Cross-App Testing
- [ ] Registration flow: marketing → tenant subdomain
- [ ] Login redirect: marketing → tenant subdomain
- [ ] Super admin "Login As": admin → tenant subdomain
- [ ] Logout returns to correct site
- [ ] JWT tokens contain correct tenant_id

---

## 🚨 Common Issues & Solutions

### Issue: "Tenant not found" error

**Solution:**
- Check subdomain spelling
- Verify DNS configuration
- Check tenant exists in database
- Clear browser cache

### Issue: Cross-tenant data leak

**Solution:**
- Ensure all queries include `WHERE tenant_id = ?`
- Add database triggers to enforce tenant_id
- Use row-level security (PostgreSQL)
- Audit all API endpoints

### Issue: Custom domain SSL not working

**Solution:**
- Wait for DNS propagation (up to 48 hours)
- Check CNAME record points correctly
- Verify SSL certificate provisioned
- Check Cloudflare/Vercel SSL settings

---

## 📊 Progress Tracking

Use this checklist to track migration progress:

### Week 1: Setup
- [x] Created ARCHITECTURE.md
- [x] Created app directories
- [x] Created README files
- [ ] Setup pnpm workspace
- [ ] Extract shared types
- [ ] Extract UI components

### Week 2-3: Marketing Site
- [ ] Build homepage
- [ ] Build pricing page
- [ ] Implement tenant registration
- [ ] Setup email service
- [ ] Deploy to Vercel
- [ ] Configure domain

### Week 3-4: Platform Admin
- [ ] Move super admin components
- [ ] Build billing dashboard
- [ ] Implement "Login As"
- [ ] Deploy to Vercel
- [ ] Configure domain

### Week 4-5: Tenant App
- [ ] Copy current app
- [ ] Implement tenant detection
- [ ] Remove tenant selection
- [ ] Add subdomain routing
- [ ] Update API calls
- [ ] Deploy to Vercel
- [ ] Test wildcard domain

### Week 6: Testing & Launch
- [ ] End-to-end testing
- [ ] Load testing
- [ ] Security audit
- [ ] Documentation update
- [ ] Production launch

---

## 🎯 Next Steps

1. **Review** this migration guide with the team
2. **Setup** the workspace structure (already started!)
3. **Extract** shared packages first
4. **Build** marketing site (highest priority for new signups)
5. **Refactor** platform admin (for tenant management)
6. **Convert** current app to tenant-app (largest effort)
7. **Test** thoroughly before production deployment

---

**Questions or Issues?**  
Refer to [ARCHITECTURE.md](./ARCHITECTURE.md) or create an issue in the repository.

**Last Updated:** November 16, 2025
