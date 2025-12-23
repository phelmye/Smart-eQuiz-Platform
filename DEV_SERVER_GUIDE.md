# Development Server Management Guide

## Problem: Dev Servers Shutting Down

Dev servers shut down when you run other commands in the same terminal. This guide shows you how to keep them running permanently.

## Solution: Dedicated Terminals

**Rule:** Each dev server needs its own dedicated terminal that you don't use for other commands.

## Quick Start Commands

### Marketing Site
```powershell
# Open a NEW terminal, navigate to project root, run:
.\start-marketing-site.ps1
```
- Opens at http://localhost:3000
- Uses production API (https://smart-equiz-api.onrender.com)
- Leave this terminal open - don't run other commands here

### Platform Admin
```powershell
# Open a NEW terminal
cd apps/platform-admin
pnpm dev
```
- Opens at http://localhost:5173
- Leave this terminal open

### Tenant App
```powershell
# Open a NEW terminal
cd apps/tenant-app
pnpm dev
```
- Opens at http://localhost:5174
- Leave this terminal open

## Best Practices

### ✅ DO:
- Open a **new terminal** for each dev server
- Keep dev server terminals open and visible
- Use separate terminals for running commands (git, pnpm, etc.)
- If a server shuts down, just run the start command again

### ❌ DON'T:
- Run other commands in the dev server terminal
- Close the terminal while the server is running
- Use Ctrl+C unless you want to stop the server

## VS Code Terminal Setup

1. **Open Multiple Terminals:**
   - Click the `+` icon in VS Code terminal panel
   - Or press `Ctrl+Shift+` (backtick)
   - Name each terminal (right-click → Rename)

2. **Recommended Layout:**
   ```
   Terminal 1: Marketing Site
   Terminal 2: Platform Admin  
   Terminal 3: Tenant App
   Terminal 4: Commands (git, pnpm, scripts)
   ```

3. **Switch Between Terminals:**
   - Click the dropdown in terminal panel
   - Or use `Ctrl+PageUp`/`Ctrl+PageDown`

## Startup Scripts

### start-marketing-site.ps1
```powershell
# Starts marketing site with production API
.\start-marketing-site.ps1
```

**What it does:**
- Checks for .env.local (creates if missing)
- Sets API URL to production
- Starts Next.js dev server on port 3000

### Manual Start (Alternative)
```powershell
cd apps/marketing-site
pnpm dev
```

## Environment Configuration

### Marketing Site (.env.local)
```env
NEXT_PUBLIC_API_URL=https://smart-equiz-api.onrender.com/api
```

### Platform Admin (.env)
```env
VITE_API_URL=https://smart-equiz-api.onrender.com/api
```

### Tenant App (.env)
```env
VITE_API_URL=https://smart-equiz-api.onrender.com/api
```

## Troubleshooting

### Server Won't Start
**Problem:** Port already in use  
**Solution:** 
```powershell
# Find process using the port
netstat -ano | findstr :3000

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F
```

### Server Keeps Shutting Down
**Problem:** Running commands in the same terminal  
**Solution:** Use a dedicated terminal for the dev server

### Changes Not Reflecting
**Problem:** Build cache  
**Solution:**
```powershell
# Stop the server (Ctrl+C), then:
cd apps/marketing-site
Remove-Item -Recurse -Force .next
pnpm dev
```

### Module Not Found Errors
**Problem:** Shared packages not built  
**Solution:**
```powershell
cd packages/types
pnpm build

cd ../utils
pnpm build

# Restart dev server
```

## Production vs Development

### Development (Local)
- Marketing Site: http://localhost:3000
- Platform Admin: http://localhost:5173
- Tenant App: http://localhost:5174
- API: https://smart-equiz-api.onrender.com (production)

### Production (Deployed)
- Marketing Site: Deployed to Vercel
- Platform Admin: Deployed to Vercel
- Tenant App: Deployed to Vercel
- API: https://smart-equiz-api.onrender.com

## Running All Apps Simultaneously

To run all three apps at once, you need **3 separate terminals**:

**Terminal 1 (Marketing):**
```powershell
.\start-marketing-site.ps1
```

**Terminal 2 (Admin):**
```powershell
cd apps/platform-admin; pnpm dev
```

**Terminal 3 (Tenant):**
```powershell
cd apps/tenant-app; pnpm dev
```

## Stopping Servers

### Graceful Shutdown
- Focus the terminal running the server
- Press `Ctrl+C`
- Wait for "Gracefully stopping..."

### Force Stop
- Close the terminal window
- Or use Task Manager to kill Node.js processes

## Restarting After Changes

### Code Changes
- Most changes hot-reload automatically
- No restart needed

### Environment Variable Changes
- Stop server (`Ctrl+C`)
- Start again with the startup script

### Package.json Changes
- Stop server
- Run `pnpm install`
- Start again

## Additional Resources

- [README.md](README.md) - Project overview
- [RUNNING_LOCALLY.md](RUNNING_LOCALLY.md) - Detailed local setup
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Common issues
