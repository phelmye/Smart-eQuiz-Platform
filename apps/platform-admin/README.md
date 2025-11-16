# Platform Admin Dashboard - Smart eQuiz

Super Admin interface for managing the entire Smart eQuiz SaaS platform.

## 🎯 Purpose

Central dashboard for platform administrators to:
- Manage all tenants (create, suspend, delete)
- Monitor subscriptions and billing
- View platform-wide analytics
- Handle support tickets
- Configure system settings
- Access audit logs

## 🔐 Access Control

**IMPORTANT:** Only accessible by users with `role: 'super_admin'`

## 🚀 Tech Stack

- **Framework:** React 18+ with Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **State Management:** React Context + hooks
- **Data Fetching:** React Query
- **Charts:** Recharts

## 📦 Project Structure

```
platform-admin/
├── src/
│   ├── components/
│   │   ├── TenantManagement.tsx       # CRUD for all tenants
│   │   ├── PlatformBillingOverview.tsx # Revenue metrics
│   │   ├── SystemAnalytics.tsx         # Platform stats
│   │   ├── SupportTicketManager.tsx    # Support queue
│   │   ├── GlobalUserSearch.tsx        # Search all users
│   │   ├── AuditLogViewer.tsx         # Security logs
│   │   ├── PlanManagement.tsx          # Manage pricing plans
│   │   └── ui/                         # shadcn/ui components
│   ├── lib/
│   │   ├── api.ts                      # API client
│   │   ├── auth.ts                     # Super admin auth
│   │   ├── mockData.ts                 # Mock data
│   │   └── utils.ts                    # Utilities
│   ├── pages/
│   │   └── Index.tsx                   # Main dashboard
│   ├── App.tsx                         # Root component
│   ├── main.tsx                        # Entry point
│   └── index.css                       # Global styles
├── public/
├── .env.example
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## 🔧 Setup Instructions

### Installation

```bash
# Navigate to platform-admin directory
cd apps/platform-admin

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local

# Start development server
pnpm dev
```

### Environment Variables

```bash
# .env.local
VITE_API_URL=http://localhost:4000/api
VITE_APP_TYPE=admin

# Production
VITE_API_URL=https://api.smartequiz.com
VITE_APP_TYPE=admin
```

## 📊 Key Features

### 1. Tenant Management
- View all tenants (active/suspended/cancelled)
- Create new tenants manually
- Suspend/activate tenant accounts
- Delete tenants (with confirmation)
- "Login As" tenant admin feature
- View tenant details (users, tournaments, billing)

### 2. Platform Billing Overview
**Metrics:**
- Monthly Recurring Revenue (MRR)
- Annual Recurring Revenue (ARR)
- Churn rate
- Customer Lifetime Value (CLV)
- Revenue by plan (Free/Pro/Enterprise)
- Payment failures and retries

**Charts:**
- Revenue trend (last 12 months)
- New vs churned customers
- Plan distribution

### 3. System Analytics
**Platform-wide metrics:**
- Total tenants
- Total users across all tenants
- Total tournaments held
- Total questions in platform
- Active users (last 30 days)
- System uptime
- API response times

### 4. Support Ticket Management
- View all support tickets from tenants
- Filter by priority/status
- Assign to support team members
- Add internal notes
- Mark as resolved
- Email notifications

### 5. Global User Search
- Search users across all tenants
- Filter by role, tenant, status
- View user activity
- "Login As" user for troubleshooting
- User suspension

### 6. Audit Log Viewer
**Tracked Events:**
- Tenant creation/deletion
- User role changes
- Subscription changes
- Payment processing
- "Login As" sessions
- System configuration changes

### 7. Plan Management
- Create/edit pricing plans
- Set feature limits per plan
- Enable/disable plans
- View plan adoption metrics

## 🎨 Dashboard Layout

```
┌─────────────────────────────────────────────────────┐
│  Smart eQuiz Platform Admin                    [👤] │
├─────────────────────────────────────────────────────┤
│                                                       │
│  📊 Platform Overview                                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │ Tenants  │ │   MRR    │ │  Users   │            │
│  │   245    │ │ $24,500  │ │  3,421   │            │
│  └──────────┘ └──────────┘ └──────────┘            │
│                                                       │
│  📈 Revenue Chart (Last 12 Months)                   │
│  ┌─────────────────────────────────────────┐        │
│  │  [Chart showing MRR trend]               │        │
│  └─────────────────────────────────────────┘        │
│                                                       │
│  🏢 Recent Tenant Activity                           │
│  ┌─────────────────────────────────────────┐        │
│  │ First Baptist Church - Upgraded to Pro   │        │
│  │ Grace Community - New signup             │        │
│  │ St. Mary's Cathedral - Payment failed    │        │
│  └─────────────────────────────────────────┘        │
│                                                       │
└─────────────────────────────────────────────────────┘
```

## 🔐 Authentication

### Super Admin Login

```typescript
// Only allow super_admin role
if (user.role !== 'super_admin') {
  throw new Error('Access denied. Super Admin only.');
}
```

### "Login As" Feature

```typescript
// Temporarily impersonate tenant admin
async function loginAsTenantAdmin(tenantId: string) {
  // Store original super admin session
  sessionStorage.setItem('original_admin', currentUser.id);
  
  // Get tenant's primary admin
  const tenantAdmin = await api.getTenantAdmin(tenantId);
  
  // Generate temporary token
  const tempToken = await api.createImpersonationToken({
    superAdminId: currentUser.id,
    targetUserId: tenantAdmin.id,
    expiresIn: '1h'
  });
  
  // Redirect to tenant subdomain
  window.location.href = `https://${tenant.subdomain}.smartequiz.com?token=${tempToken}`;
}
```

## 📊 API Endpoints

```typescript
// Tenants
GET    /api/admin/tenants              # List all tenants
POST   /api/admin/tenants              # Create tenant
PUT    /api/admin/tenants/:id          # Update tenant
DELETE /api/admin/tenants/:id          # Delete tenant
POST   /api/admin/tenants/:id/suspend  # Suspend tenant
POST   /api/admin/tenants/:id/activate # Activate tenant

// Analytics
GET    /api/admin/analytics/revenue    # Revenue metrics
GET    /api/admin/analytics/users      # User metrics
GET    /api/admin/analytics/tenants    # Tenant metrics

// Support
GET    /api/admin/support/tickets      # List tickets
PUT    /api/admin/support/tickets/:id  # Update ticket
POST   /api/admin/support/tickets/:id/reply # Reply to ticket

// Audit Logs
GET    /api/admin/audit-logs           # List audit logs
GET    /api/admin/audit-logs/:id       # Get log details

// Users (Global)
GET    /api/admin/users/search         # Search all users
GET    /api/admin/users/:id            # Get user details
PUT    /api/admin/users/:id/suspend    # Suspend user
```

## 🚀 Deployment

### Vercel Deployment

```bash
# Build command
pnpm build

# Output directory
dist

# Environment variables (set in Vercel dashboard)
VITE_API_URL=https://api.smartequiz.com
VITE_APP_TYPE=admin
```

### Custom Domain
```
admin.smartequiz.com → Vercel deployment
```

## 🛡️ Security

- ✅ Role-based access control (super_admin only)
- ✅ JWT authentication with short expiration
- ✅ Audit logging for all admin actions
- ✅ Rate limiting on sensitive endpoints
- ✅ HTTPS only
- ✅ CORS restricted to admin domain

## 📚 Documentation

See main [ARCHITECTURE.md](../../ARCHITECTURE.md) for overall system architecture.

---

**Maintained By:** Smart eQuiz Platform Team
**Last Updated:** November 16, 2025
