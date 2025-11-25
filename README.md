# 🎯 Smart eQuiz Platform - Multi-Tenant SaaS for Bible Quiz Competitions

A comprehensive **Software-as-a-Service (SaaS) platform** for churches and organizations to manage Bible quiz tournaments, practice sessions, and competitive championships.

[![Architecture](https://img.shields.io/badge/Architecture-Multi--Tenant-blue)]()
[![Apps](https://img.shields.io/badge/Apps-3%20Separate-green)]()
[![Status](https://img.shields.io/badge/Status-Migrating-yellow)]()

---

## 🏗️ Architecture

This platform implements a **Full Separation Architecture** with three independent applications:

```
┌─────────────────────────────────────────────────────────────┐
│                    SMART EQUIZ PLATFORM                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │  Marketing      │  │  Platform       │  │   Tenant    │ │
│  │  Website        │  │  Admin          │  │   Apps      │ │
│  │                 │  │                 │  │             │ │
│  │  Landing +      │  │  Super Admin    │  │  Multi-     │ │
│  │  Registration   │  │  Dashboard      │  │  Tenant     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
│         ↓                     ↓                    ↓         │
│  www.smartequiz.com   admin.smartequiz.com   {tenant}.com   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Why Three Apps?

1. **Marketing Website** - Promote and sell the SaaS solution
2. **Platform Admin** - Super admins manage all tenants
3. **Tenant Application** - Each organization runs their isolated platform

📖 See [ARCHITECTURE.md](./ARCHITECTURE.md) for complete details.

---

## 📦 Repository Structure

```
Smart-eQuiz-Platform/
├── apps/
│   ├── marketing-site/      # Public landing page (Next.js)
│   ├── platform-admin/       # Super admin dashboard (React)
│   └── tenant-app/           # Multi-tenant app (React)
├── packages/
│   ├── types/                # Shared TypeScript types
│   ├── ui/                   # Shared UI components
│   └── utils/                # Shared utilities
├── workspace/
│   └── shadcn-ui/            # Current monolithic app (being migrated)
├── ARCHITECTURE.md           # System architecture documentation
├── AUTHENTICATION_FLOW.md    # 🚨 Auth/navigation rules (READ FIRST!)
├── MIGRATION_GUIDE.md        # Step-by-step migration guide
├── .github/
│   ├── PULL_REQUEST_TEMPLATE.md  # PR template with arch checks
│   └── CODE_REVIEW_CHECKLIST.md  # Review checklist
└── README.md                 # This file
```

---

## 🚀 Quick Start

### Current Working Application

The existing application is located in `workspace/shadcn-ui/`:

```bash
cd "c:\Projects\Dev\Smart eQuiz Platform\workspace\shadcn-ui"
pnpm install
pnpm dev  # http://localhost:5173
```

This is the **monolithic version** that will be split into three apps.

### New Architecture (In Development)

```bash
# Clone repository
git clone https://github.com/phelmye/Smart-eQuiz-Platform.git
cd Smart-eQuiz-Platform

# Install all dependencies (workspace)
pnpm install

# Start marketing site
cd apps/marketing-site
pnpm dev  # http://localhost:3000

# Start platform admin
cd apps/platform-admin
pnpm dev  # http://localhost:5173

# Start tenant app
cd apps/tenant-app
pnpm dev  # http://localhost:5174
```

### Workspace Commands (Recommended)

Build all applications at once:

```bash
# Build all apps
pnpm run build

# Build specific app
pnpm run build:tenant-app
pnpm run build:marketing-site
pnpm run build:platform-admin

# Type check all apps
pnpm run typecheck

# Development servers
pnpm run dev:tenant-app       # Port 5174
pnpm run dev:marketing-site   # Port 3000
pnpm run dev:platform-admin   # Port 5173
```

---

## 📚 Documentation

### Main Documentation
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Complete system architecture and design decisions
- **[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)** - Step-by-step guide to migrate from monolith to three-app structure

### Application-Specific Docs
- **[Marketing Site README](./apps/marketing-site/README.md)** - Landing page and tenant registration
- **[Platform Admin README](./apps/platform-admin/README.md)** - Super admin dashboard
- **[Tenant App README](./apps/tenant-app/README.md)** - Multi-tenant quiz platform

---

## 🌐 Application Overview

### 1. Marketing Website (`apps/marketing-site/`)

**URL:** `www.smartequiz.com`

**Purpose:** Attract and onboard new organizations

**Features:**
- Landing page with features
- Pricing comparison
- Tenant self-registration
- Blog and docs

```bash
cd apps/marketing-site
pnpm dev  # Port 3000
```

---

### 2. Platform Admin (`apps/platform-admin/`)

**URL:** `admin.smartequiz.com`

**Purpose:** Manage the entire SaaS business

**Features:**
- Tenant management
- Billing & revenue metrics
- Platform analytics
- Support tickets
- "Login As" feature

```bash
cd apps/platform-admin
pnpm dev  # Port 5173
```

---

### 3. Tenant Application (`apps/tenant-app/`)

**URLs:**
- Subdomain: `{tenant}.smartequiz.com`
- Custom: `quiz.firstbaptist.org`

**Purpose:** Isolated quiz platform per organization

**Features:**
- Tournament management
- Question bank
- Live competitions
- Practice mode
- User management
- Custom branding

```bash
cd apps/tenant-app
pnpm dev  # Port 5174
```

---

## 🔐 Multi-Tenancy Explained

### How It Works

**Traditional (Wrong):**
```
Single app → All tenants login to same URL
             User selects "First Baptist Church" from dropdown
             Data mixed in one database
```

**Our Approach (Correct):**
```
Marketing Site → Tenant registers → Gets subdomain

First Baptist: firstbaptist.smartequiz.com
Grace Church:  gracechurch.smartequiz.com
St. Mary's:    stmarys.smartequiz.com

Each tenant:
- Isolated login
- Isolated data (filtered by tenant_id)
- Custom branding
- Own mobile app (optional)
```

### Custom Domains

Tenants can use their own domains:

```
quiz.firstbaptist.org → CNAME → firstbaptist.smartequiz.com
tournaments.grace.com → CNAME → gracechurch.smartequiz.com
```

Automatic SSL certificates via Cloudflare/Let's Encrypt.

---

## 🛠️ Technology Stack

**Frontend:**
- React 18+ with TypeScript
- Next.js 14 (marketing site)
- Vite (admin & tenant apps)
- Tailwind CSS + shadcn/ui
- React Hook Form + Zod

**Backend:**
- Node.js + Express
- PostgreSQL
- Redis (caching)
- JWT authentication
- WebSockets (live matches)

**Infrastructure:**
- Vercel (hosting)
- Cloudflare (DNS + SSL)
- AWS S3 (storage)
- SendGrid (email)

---

## 📱 Mobile App Strategy

### White-Label Apps

Each tenant can have their own branded mobile app:

```
App Store:
- "First Baptist Bible Quiz" (tenant_firstbaptist)
- "Grace Church Tournaments" (tenant_gracechurch)

Each app:
- Connects to tenant's subdomain API
- Uses tenant branding (logo, colors)
- Separate App Store listing
```

### Single App (Alternative)

One app for all tenants:

```
App: "Smart eQuiz"
→ User enters org code: "firstbaptist"
→ Connects to: firstbaptist.smartequiz.com
```

---

## 🚦 Migration Status

We're migrating from monolithic architecture to three-app structure:

### ✅ Completed
- [x] Architecture design
- [x] Documentation (ARCHITECTURE.md)
- [x] Directory structure created
- [x] README files for all apps
- [x] Migration guide created

### 🚧 In Progress
- [ ] Extract shared packages (types, utils, UI)
- [ ] Build marketing site
- [ ] Refactor platform admin
- [ ] Convert current app to tenant-app

### 📅 Upcoming
- [ ] Tenant self-registration flow
- [ ] Subdomain detection middleware
- [ ] Custom domain support
- [ ] Email notifications
- [ ] Deployment to production

---

## 👥 User Roles

### Platform Level
- `super_admin` - Full platform access (admin.smartequiz.com)

### Tenant Level
- `org_admin` - Tenant administrator
- `question_manager` - Manage questions
- `account_officer` - Billing & payments
- `inspector` - Monitor tournaments
- `moderator` - Manage participants
- `participant` - Compete in tournaments
- `spectator` - View only

---

## 🔧 Development Setup

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- PostgreSQL (or Supabase)
- Git

### Installation

```bash
# Clone repository
git clone https://github.com/phelmye/Smart-eQuiz-Platform.git
cd Smart-eQuiz-Platform

# Install dependencies
pnpm install

# Setup environment variables
cp apps/marketing-site/.env.example apps/marketing-site/.env.local
cp apps/platform-admin/.env.example apps/platform-admin/.env.local
cp apps/tenant-app/.env.example apps/tenant-app/.env.local

# Start all apps
pnpm dev
```

### Local Subdomain Testing

Edit your hosts file for local subdomain testing:

**Windows:** `C:\Windows\System32\drivers\etc\hosts`  
**Mac/Linux:** `/etc/hosts`

```
127.0.0.1 smartequiz.local
127.0.0.1 www.smartequiz.local
127.0.0.1 admin.smartequiz.local
127.0.0.1 firstbaptist.smartequiz.local
127.0.0.1 gracechurch.smartequiz.local
```

Access:
- Marketing: `http://www.smartequiz.local:3000`
- Admin: `http://admin.smartequiz.local:5173`
- Tenant: `http://firstbaptist.smartequiz.local:5174`

---

## 🚀 Deployment

### Production URLs

```
Marketing:      www.smartequiz.com
Platform Admin: admin.smartequiz.com
Tenant Apps:    *.smartequiz.com (wildcard)
```

### Deploy to Vercel

```bash
# Build all apps
pnpm build

# Deploy individually
cd apps/marketing-site && vercel --prod
cd apps/platform-admin && vercel --prod
cd apps/tenant-app && vercel --prod
```

---

## 📊 Key Features

### For Tenants (Organizations)
- ✅ Create and manage Bible quiz tournaments
- ✅ Build question banks by categories
- ✅ Run live competitions with real-time scoring
- ✅ Practice mode for participants
- ✅ User management (team + participants)
- ✅ Custom branding (logo, colors)
- ✅ Payment collection (tournament entry fees)
- ✅ Analytics and reports
- ✅ Mobile app support

### For Platform Admins
- ✅ Manage all tenants
- ✅ View revenue metrics (MRR, ARR)
- ✅ Platform-wide analytics
- ✅ Support ticket management
- ✅ "Login As" tenant admin
- ✅ Audit logs
- ✅ Plan management

### For Participants
- ✅ Practice Bible quiz questions
- ✅ Join tournaments
- ✅ Compete in live matches
- ✅ View leaderboards
- ✅ Track progress (XP, levels, badges)

---

## 🤝 Contributing

Contributions welcome! Please:

1. Review [ARCHITECTURE.md](./ARCHITECTURE.md)
2. Check [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)
3. Create feature branch
4. Submit pull request

---

## 📄 License

Proprietary software owned by Smart eQuiz Platform.

---

## 📞 Support

- **Website:** https://www.smartequiz.com
- **Email:** support@smartequiz.com
- **Documentation:** https://docs.smartequiz.com

---

## 🎯 Quick Links

- [📖 Architecture Documentation](./ARCHITECTURE.md)
- [🛠️ Migration Guide](./MIGRATION_GUIDE.md)
- [🌐 Marketing Site Docs](./apps/marketing-site/README.md)
- [⚙️ Platform Admin Docs](./apps/platform-admin/README.md)
- [🏢 Tenant App Docs](./apps/tenant-app/README.md)
- [💻 Current Working App](./workspace/shadcn-ui/)

---

**Last Updated:** November 16, 2025  
**Version:** 1.0.0 (In Development)  
**Maintained By:** Smart eQuiz Platform Team
