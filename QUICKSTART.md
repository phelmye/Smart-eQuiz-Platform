# Quick Start Guide - Smart eQuiz Platform

## Prerequisites

- Node.js 22.x
- pnpm 8.10.0+
- PostgreSQL (or Docker)

## Running the Platform

### 1. Start Backend API

```powershell
# Navigate to API directory
cd "C:\Projects\Dev\Smart eQuiz Platform\services\api"

# Install dependencies (first time only)
pnpm install

# Run database migrations
pnpm prisma migrate dev

# Seed demo data
pnpm run seed

# Start API server (port 3001)
pnpm run start:dev
```

### 2. Start Platform Admin

```powershell
# Open new terminal
cd "C:\Projects\Dev\Smart eQuiz Platform\apps\platform-admin"

# Install dependencies (first time only)
pnpm install

# Start dev server (port 5176)
pnpm run dev
```

**Access:** http://localhost:5176

### 3. Start Tenant App

```powershell
# Open new terminal
cd "C:\Projects\Dev\Smart eQuiz Platform\apps\tenant-app"

# Install dependencies (first time only)
pnpm install

# Start dev server (port 5174)
pnpm run dev
```

**Access:** http://localhost:5174

### 4. Start Marketing Site (Optional)

```powershell
# Open new terminal
cd "C:\Projects\Dev\Smart eQuiz Platform\apps\marketing-site"

# Install dependencies (first time only)
pnpm install

# Start dev server (port 3000)
pnpm run dev
```

**Access:** http://localhost:3000

## Demo Credentials

### Tenant App Login
- **Email:** admin@demo.local
- **Password:** password123
- **Role:** ORG_ADMIN

### Platform Admin
- Currently uses mock data
- No authentication required for development

## Application URLs

| Application | URL | Purpose |
|------------|-----|---------|
| Backend API | http://localhost:3001 | NestJS REST API |
| Platform Admin | http://localhost:5176 | Super admin dashboard |
| Tenant App | http://localhost:5174 | Multi-tenant application |
| Marketing Site | http://localhost:3000 | Public landing page |

## Common Commands

### Platform Admin

```powershell
cd "C:\Projects\Dev\Smart eQuiz Platform\apps\platform-admin"

pnpm run dev      # Start dev server
pnpm run build    # Build for production
pnpm run preview  # Preview production build
pnpm run lint     # Run ESLint
```

### Backend API

```powershell
cd "C:\Projects\Dev\Smart eQuiz Platform\services\api"

pnpm run start:dev    # Start with hot reload
pnpm run start:prod   # Start production build
pnpm run build        # Build TypeScript
pnpm prisma studio    # Open Prisma Studio (DB GUI)
```

### Tenant App

```powershell
cd "C:\Projects\Dev\Smart eQuiz Platform\apps\tenant-app"

pnpm run dev      # Start dev server
pnpm run build    # Build for production
pnpm run preview  # Preview production build
```

## Features Available

### Platform Admin ✅
- Dashboard with metrics
- Tenant management (mock data)
- User management (mock data)
- Analytics dashboard (connects to API)
- Marketing content manager
- Media library
- Settings

### Tenant App ✅
- Authentication system
- Tournament management
- Question bank
- Practice mode
- Live matches
- User management with roles
- Theme customization
- Analytics

### Backend API ✅
- 9 modules (Auth, Users, Tournaments, Questions, Practice, Matches, Marketing, Media, Analytics)
- PostgreSQL database
- Prisma ORM
- JWT authentication
- Multi-tenant support

## Development Workflow

1. **Start Backend First** - API must be running for apps to connect
2. **Seed Demo Data** - Run `pnpm run seed` in API directory
3. **Start Frontend Apps** - Launch platform-admin and/or tenant-app
4. **Use Demo Credentials** - Login with admin@demo.local / password123

## Troubleshooting

### Port Already in Use
Vite automatically tries alternate ports. Check terminal output for actual port.

### Database Connection Error
Ensure PostgreSQL is running and `.env` has correct `DATABASE_URL`.

### Module Not Found
Clear cache and reinstall:
```powershell
Remove-Item -Recurse -Force node_modules/.vite
pnpm install
```

### Build Errors
Check TypeScript errors:
```powershell
pnpm run build
```

## Project Structure

```
Smart-eQuiz-Platform/
├── apps/
│   ├── marketing-site/     # Next.js landing page
│   ├── platform-admin/     # React admin dashboard
│   └── tenant-app/         # React multi-tenant app
├── services/
│   └── api/                # NestJS backend
├── packages/
│   ├── types/              # Shared TypeScript types
│   ├── ui/                 # Shared UI components
│   └── utils/              # Shared utilities
└── workspace/
    └── shadcn-ui/          # Legacy monolithic app
```

## Next Steps

1. ✅ All apps configured and running
2. Connect platform-admin to backend API
3. Implement authentication in platform-admin
4. Add real-time features
5. Deploy to production

## Support

For issues or questions, check:
- README.md files in each app directory
- API documentation at http://localhost:3001/api/docs
- Project wiki (if available)

---

**Status:** All applications fully configured and ready for development! 🚀
