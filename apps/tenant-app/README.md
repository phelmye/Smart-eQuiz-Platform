# Tenant Application - Smart eQuiz

Multi-tenant quiz platform where each organization runs their own isolated instance.

## 🎯 Purpose

Complete quiz tournament platform for individual tenants (churches/organizations):
- Tournament management
- Question bank
- User management (team + participants)
- Practice mode
- Live competitions
- Billing & payments
- Custom branding
- Mobile app API

## 🌐 Multi-Tenancy

Each tenant is completely isolated:
- **Subdomain:** `{tenant}.smartequiz.com`
- **Custom Domain:** `quiz.firstbaptist.org` (optional)
- **Data Isolation:** All queries filtered by `tenant_id`
- **Independent Billing:** Each tenant manages their own payments

## 🚀 Tech Stack

- **Framework:** React 18+ with Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **State Management:** React Context + hooks
- **Real-time:** WebSockets for live tournaments

## 📦 Project Structure

```
tenant-app/
├── src/
│   ├── middleware/
│   │   └── tenantDetection.ts      # Detect tenant from subdomain
│   ├── components/
│   │   ├── Dashboard.tsx            # Tenant dashboard
│   │   ├── TournamentBuilder.tsx    # Create tournaments
│   │   ├── TournamentEngine.tsx     # Run live tournaments
│   │   ├── QuestionBank.tsx         # Manage questions
│   │   ├── UserManagement.tsx       # Team + participants
│   │   ├── PracticeMode.tsx         # Training mode
│   │   ├── Analytics.tsx            # Tenant analytics
│   │   ├── BrandingSettings.tsx     # Logo, colors
│   │   ├── PaymentManagement.tsx    # Billing
│   │   └── ui/                      # shadcn/ui components
│   ├── contexts/
│   │   ├── TenantContext.tsx        # Current tenant data
│   │   └── AuthContext.tsx          # Tenant-specific auth
│   ├── lib/
│   │   ├── api.ts                   # API client with tenant context
│   │   ├── tenantUtils.ts           # Tenant helpers
│   │   └── mockData.ts              # Mock data (filtered by tenant)
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
├── .env.example
├── vite.config.ts
└── package.json
```

## 🔧 Setup Instructions

### Installation

```bash
# Navigate to tenant-app directory
cd apps/tenant-app

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
VITE_APP_TYPE=tenant
VITE_ENABLE_SUBDOMAIN_DETECTION=true

# For local testing with subdomains
VITE_DEV_TENANT=firstbaptist  # Override tenant for localhost

# Production
VITE_API_URL=https://api.smartequiz.com
VITE_APP_TYPE=tenant
VITE_ENABLE_SUBDOMAIN_DETECTION=true
```

## 🏢 Tenant Detection

### Subdomain Detection

```typescript
// middleware/tenantDetection.ts
export async function detectTenant(): Promise<Tenant | null> {
  const hostname = window.location.hostname;
  
  // Local development override
  if (hostname === 'localhost' || hostname.includes('127.0.0.1')) {
    const devTenant = import.meta.env.VITE_DEV_TENANT;
    if (devTenant) {
      return await fetchTenantBySubdomain(devTenant);
    }
  }
  
  // Remove port and parse domain
  const domain = hostname.split(':')[0];
  
  // Check if custom domain
  let tenant = await fetchTenantByCustomDomain(domain);
  
  // Fallback to subdomain
  if (!tenant) {
    const subdomain = domain.split('.')[0];
    tenant = await fetchTenantBySubdomain(subdomain);
  }
  
  if (!tenant) {
    throw new Error('Tenant not found');
  }
  
  return tenant;
}
```

### TenantContext Provider

```typescript
// contexts/TenantContext.tsx
export const TenantProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    detectTenant()
      .then(setTenant)
      .catch(error => {
        console.error('Tenant detection failed:', error);
        // Redirect to marketing site or show error
        window.location.href = 'https://www.smartequiz.com';
      })
      .finally(() => setLoading(false));
  }, []);
  
  return (
    <TenantContext.Provider value={{ tenant, loading }}>
      {loading ? <LoadingScreen /> : children}
    </TenantContext.Provider>
  );
};
```

## 🔐 Authentication

### Tenant-Specific Login

```typescript
// No tenant selection - tenant is determined by subdomain
async function login(email: string, password: string) {
  const tenant = useTenant(); // From TenantContext
  
  const response = await api.post('/auth/login', {
    email,
    password,
    tenantId: tenant.id  // Included automatically
  });
  
  // JWT contains tenant_id
  const token = response.data.token;
  localStorage.setItem('auth_token', token);
}
```

### User Roles (Tenant-Level)

```typescript
type TenantRole = 
  | 'org_admin'         // Full access to tenant
  | 'question_manager'  // Manage questions
  | 'account_officer'   // Billing & payments
  | 'inspector'         // Monitor tournaments
  | 'moderator'         // Manage participants
  | 'participant'       // Compete in tournaments
  | 'spectator';        // View only
```

## 📱 Mobile App Integration

### API Endpoints for Mobile

```typescript
// Mobile app makes requests with tenant context
GET    /api/v1/tournaments       # Tenant's tournaments
GET    /api/v1/questions         # Tenant's questions
POST   /api/v1/practice/session  # Start practice
GET    /api/v1/leaderboard       # Tenant leaderboard

// All endpoints automatically filtered by tenant_id from JWT
```

### White-Label Configuration

```typescript
// Mobile app config fetched on launch
GET /api/v1/tenant/config

Response:
{
  "tenantId": "tenant_firstbaptist",
  "name": "First Baptist Church",
  "branding": {
    "logoUrl": "https://cdn.smartequiz.com/tenants/firstbaptist/logo.png",
    "primaryColor": "#2563eb",
    "accentColor": "#10b981"
  },
  "features": {
    "practiceMode": true,
    "tournaments": true,
    "leaderboard": true
  }
}
```

## 🎨 Custom Branding

### Branding Settings

```typescript
interface TenantBranding {
  logoUrl?: string;
  primaryColor: string;    // Hex color
  accentColor?: string;
  fontFamily?: string;
  customCSS?: string;      // Advanced customization
}

// Applied dynamically
function applyBranding(branding: TenantBranding) {
  document.documentElement.style.setProperty('--primary', branding.primaryColor);
  if (branding.accentColor) {
    document.documentElement.style.setProperty('--accent', branding.accentColor);
  }
}
```

## 📊 Data Isolation

### Automatic Tenant Filtering

```typescript
// API client middleware
api.interceptors.request.use(config => {
  const tenant = getTenantFromContext();
  
  // Add tenant_id to all requests
  config.headers['X-Tenant-Id'] = tenant.id;
  
  return config;
});

// Backend ensures all queries include tenant_id
// Example: SELECT * FROM tournaments WHERE tenant_id = ?
```

### Storage Isolation

```typescript
// LocalStorage with tenant prefix
function storageKey(key: string): string {
  const tenant = useTenant();
  return `${tenant.id}:${key}`;
}

// Usage
localStorage.setItem(storageKey('user_prefs'), JSON.stringify(prefs));
```

## 🚀 Deployment

### Vercel with Wildcard Domain

```bash
# Build command
pnpm build

# Output directory
dist

# Custom domains in Vercel dashboard
*.smartequiz.com → tenant-app deployment

# Tenant-specific custom domains
quiz.firstbaptist.org → tenant-app (routed by subdomain detection)
```

### Environment Variables (Production)

```
VITE_API_URL=https://api.smartequiz.com
VITE_APP_TYPE=tenant
VITE_ENABLE_SUBDOMAIN_DETECTION=true
```

## 🔧 Migration from Current Codebase

### What Changes

1. **Remove Tenant Selection**
   - Delete tenant dropdown from login/registration
   - Remove "Select Organization" UI
   - Tenant determined by subdomain automatically

2. **Add Tenant Detection**
   - Implement subdomain parsing
   - Add TenantContext provider
   - Handle custom domain mapping

3. **Update API Calls**
   - All requests include tenant context
   - Filter mockData by tenant_id
   - Prevent cross-tenant data access

4. **Refactor AuthSystem**
   - Remove tenant selection from registration
   - Users invited by tenant admin
   - Or public registration (if enabled)

### What Stays the Same

- All existing components (Dashboard, TournamentBuilder, etc.)
- UI/UX design
- Business logic
- Database schema (with tenant_id filtering)

## 📚 Documentation

See main [ARCHITECTURE.md](../../ARCHITECTURE.md) for overall system architecture.

---

**Maintained By:** Smart eQuiz Platform Team  
**Last Updated:** November 16, 2025
