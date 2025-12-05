# Troubleshooting Guide

This document addresses common issues and their solutions for the Smart eQuiz Platform project.

## VS Code TypeScript Errors (Prisma Models)

### Symptom
VS Code shows TypeScript errors like:
- "Property 'tournament' does not exist on type 'PrismaService'"
- "Property 'question' does not exist on type 'PrismaService'"
- "Cannot find module './tournaments.controller' or its corresponding type declarations"

### Root Cause
VS Code's TypeScript language service caches type definitions and doesn't always recognize the regenerated Prisma client after running migrations or regenerating the client.

### Evidence It's Not a Real Issue
The code compiles successfully:
```bash
cd services/api
npm run build  # Exits with 0 errors
tsc --noEmit   # Exits with 0 errors
```

### Solutions

**Option 1: Restart TypeScript Server** (Quickest)
1. Open Command Palette: `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
2. Type: "TypeScript: Restart TS Server"
3. Press Enter
4. Wait 5-10 seconds for the server to restart
5. Errors should disappear

**Option 2: Reload VS Code Window**
1. Open Command Palette: `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
2. Type: "Developer: Reload Window"
3. Press Enter
4. VS Code will reload with fresh cache

**Option 3: Regenerate Prisma Client and Restart**
```bash
cd services/api
npx prisma generate
```
Then follow Option 1 or 2 above.

**Option 4: Delete TypeScript Cache** (Nuclear option)
```bash
# Close VS Code first
rm -rf services/api/node_modules/.cache
```
Then reopen VS Code and follow Option 1.

### Prevention
After running `npx prisma migrate dev` or `npx prisma generate`, always restart the TypeScript server using Option 1 above.

---

## Backend Server Crashes on Startup

### Symptom
Server starts, maps all 42 routes, prints "listening on http://localhost:3000", then immediately exits:
```
API server listening on http://localhost:3000
Received SIGINT, shutting down gracefully...
```

### Root Cause
VS Code's integrated PowerShell terminal sends `SIGINT` signals when running background processes. This is a known VS Code terminal behavior, not an issue with the backend code.

### Evidence It's Not a Real Issue
The code is correct:
- ✅ Compiles successfully (`npm run build`)
- ✅ All modules load
- ✅ All 42 routes map correctly
- ✅ Server binds to port 3000
- ✅ CORS configured correctly

### Solutions

**Option 1: Run in Separate Terminal** (Recommended for Development)
1. Open a new PowerShell window (outside VS Code)
2. Navigate to the project:
   ```powershell
   cd "C:\Projects\Dev\Smart eQuiz Platform\services\api"
   ```
3. Start the server:
   ```powershell
   npm run start:dev
   ```
4. Server will stay running without SIGINT interruptions
5. Leave this terminal open while developing

**Option 2: Use Production Build**
```bash
cd services/api
npm run build
node dist/main.js
```
Production mode sometimes has fewer issues with terminal signals.

**Option 3: Use Git Bash or WSL**
If you have Git Bash or WSL installed:
```bash
# In Git Bash or WSL terminal
cd /c/Projects/Dev/Smart\ eQuiz\ Platform/services/api
npm run start:dev
```
These terminals handle signals differently than PowerShell.

### Testing After Server Starts
1. Start backend in separate terminal (Option 1)
2. In VS Code terminal, test endpoints:
   ```powershell
   # Test health check
   curl http://localhost:3000/

   # Test login
   $body = @{
       email = "admin@demo.local"
       password = "password123"
   } | ConvertTo-Json

   Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" `
       -Method POST `
       -Body $body `
       -ContentType "application/json"
   ```

---

## GitHub Actions YAML Errors

### Symptom
VS Code shows errors in `.github/workflows/*.yml` files:
- "Unrecognized named-value: 'secrets'"

### Root Cause
VS Code's YAML validator doesn't recognize GitHub Actions-specific context variables like `secrets`, `github`, `env`, etc.

### Solution
**Ignore these errors** - they are false positives. The YAML is valid GitHub Actions syntax and will work correctly when pushed to GitHub.

### Verification
The workflows validate successfully on GitHub's servers. You can test locally with:
```bash
# Install act (GitHub Actions local runner)
# https://github.com/nektos/act
act -l  # List workflows
```

---

## PowerShell Alias Warnings

### Symptom
VS Code shows warnings in chat code blocks:
- "'cd' is an alias of 'Set-Location'"

### Root Cause
PowerShell linter prefers full cmdlet names over aliases for script maintainability.

### Solution
These are **style warnings**, not errors. They can be safely ignored. If you want to suppress them:

1. Create `.vscode/settings.json`:
   ```json
   {
     "powershell.scriptAnalysis.settingsPath": ".vscode/PSScriptAnalyzerSettings.psd1"
   }
   ```

2. Create `.vscode/PSScriptAnalyzerSettings.psd1`:
   ```powershell
   @{
     Rules = @{
       PSAvoidUsingCmdletAliases = @{
         Enable = $false
       }
     }
   }
   ```

---

## Port Conflicts (3000 vs 5173)

### Symptom
Both frontend and backend try to use port 3000.

### Root Cause
Vite's default port is 5173, but your configuration might be set to 3000.

### Solution
1. Check `workspace/shadcn-ui/vite.config.ts`:
   ```typescript
   export default defineConfig({
     server: {
       port: 5173,  // Should be 5173, not 3000
     },
   })
   ```

2. Update frontend `.env`:
   ```bash
   VITE_API_URL=http://localhost:3000/api
   VITE_APP_URL=http://localhost:5173
   ```

3. Backend should use port 3000:
   ```bash
   # services/api/.env
   PORT=3000
   ```

---

## Test Credentials

### Default Admin Account
- **Email:** admin@demo.local
- **Password:** password123
- **Tenant:** Demo Church
- **Role:** TENANT_ADMIN

### Default Tenant
- **ID:** demo-tenant
- **Name:** Demo Church
- **Plan:** Standard

### Sample Data
- **Categories:** 7 (Bible, Church History, Theology, etc.)
- **Questions:** 7 (one per category)
- **Tournament:** Summer Bible Quiz 2024
- **Badges:** 4 (First Steps, Quick Thinker, Bible Scholar, Champion)

---

## Database Issues

### Reset Database
If you need to reset the database:
```bash
cd services/api
npx prisma migrate reset  # WARNING: Deletes all data
npm run seed              # Repopulate with sample data pristine
```

### View Database
Use Prisma Studio:
```bash
cd services/api
npx prisma studio
```
Opens web UI at http://localhost:5555

Or use Adminer (Docker):
```bash
cd dev
docker-compose up -d adminer
```
Opens at http://localhost:8080
- **Server:** postgres
- **Username:** postgres
- **Password:** postgres
- **Database:** smart_equiz_dev

---

## Common Commands Reference

### Backend Development
```bash
cd services/api

# Start dev server
npm run start:dev

# Build for production
npm run build

# Run production
node dist/main.js

# Lint
npm run lint

# Format
npm run format

# Type check
tsc --noEmit

# Database migrations
npx prisma migrate dev
npx prisma generate
npx prisma studio

# Seed data
npm run seed
```

### Frontend Development
```bash
cd workspace/shadcn-ui

# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Lint
pnpm lint

# Type check
pnpm type-check
```

### Docker Services
```bash
cd dev

# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f postgres
docker-compose logs -f redis

# Restart service
docker-compose restart postgres
```

---

## Need More Help?

1. Check the main README.md for project overview
2. Check API_DOCUMENTATION.md for API details
3. Check FRONTEND_INTEGRATION.md for integration guide
4. Check INTEGRATION_PROGRESS.md for current status

If you still have issues, check:
- Node.js version: `node --version` (should be >= 18)
- pnpm version: `pnpm --version` (should be >= 8)
- Docker version: `docker --version`
- Database connection: `docker ps | grep postgres`
