# Running the Smart eQuiz Platform Locally

This guide helps you start and test the Smart eQuiz Platform on your local machine.

## Quick Start

### Option 1: Using PowerShell Scripts (Recommended)

1. **Start the Backend** - Open a new PowerShell window and run:
   ```powershell
   cd "C:\Projects\Dev\Smart eQuiz Platform"
   .\start-backend.ps1
   ```
   - Backend will start on http://localhost:3000
   - Leave this window open

2. **Start the Frontend** - Open another PowerShell window and run:
   ```powershell
   cd "C:\Projects\Dev\Smart eQuiz Platform"
   .\start-frontend.ps1
   ```
   - Frontend will start on http://localhost:5173 (or 5174 if 5173 is busy)
   - Leave this window open

3. **Open in Browser**:
   - Navigate to http://localhost:5173
   - Login with: `admin@demo.local` / `password123`

### Option 2: Manual Commands

**Backend:**
```powershell
cd "C:\Projects\Dev\Smart eQuiz Platform\services\api"
npm run start:dev
```

**Frontend:**
```powershell
cd "C:\Projects\Dev\Smart eQuiz Platform\workspace\shadcn-ui"
pnpm dev
```

## Default Login Credentials

- **Email:** `admin@demo.local`
- **Password:** `password123`
- **Role:** ORG_ADMIN
- **Tenant:** Demo Church

## What to Test

### 1. Practice Mode (Fully Integrated ✅)
- Go to "Practice Mode" from the sidebar
- View your stats dashboard (Level, XP, Streaks, Accuracy)
- Click "Start Practice" and select a category
- Answer questions and earn XP
- See real-time XP calculations
- Get level-up notifications
- View the top players leaderboard

### 2. Authentication (Fully Integrated ✅)
- Login/Logout functionality
- JWT token management with automatic refresh
- Session persistence

### 3. Features Coming Next
- Tournament Engine integration
- Question Bank management
- Live Match System

## Available API Endpoints

All endpoints are prefixed with `/api`:

### Authentication
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout

### Users
- `GET /api/users/me` - Get current user profile

### Practice Mode
- `POST /api/practice/start` - Start practice session
- `POST /api/practice/answer` - Submit answer
- `GET /api/practice/stats` - Get user statistics
- `GET /api/practice/leaderboard` - Get top players

### Tournaments
- `GET /api/tournaments` - List tournaments
- `GET /api/tournaments/:id` - Get tournament details
- `POST /api/tournaments` - Create tournament (admin)
- `PATCH /api/tournaments/:id` - Update tournament (admin)
- `DELETE /api/tournaments/:id` - Delete tournament (admin)
- `POST /api/tournaments/:id/enter` - Enter tournament

### Questions
- `GET /api/questions/categories` - List categories
- `POST /api/questions/categories` - Create category (admin)
- `GET /api/questions` - List questions
- `GET /api/questions/:id` - Get question details
- `POST /api/questions` - Create question (admin)
- `PATCH /api/questions/:id` - Update question (admin)
- `DELETE /api/questions/:id` - Delete question (admin)

### Matches
- `POST /api/matches` - Create match (organizer)
- `GET /api/matches` - List matches
- `GET /api/matches/:id` - Get match details
- `POST /api/matches/join` - Join match
- `POST /api/matches/score` - Submit score
- `PATCH /api/matches/:id/complete` - Complete match
- `GET /api/matches/leaderboard/:tournamentId` - Tournament leaderboard

## Troubleshooting

### Backend won't start in VS Code terminal
**Problem:** Server starts and immediately exits with "Received SIGINT"

**Solution:** VS Code integrated terminal sends SIGINT signals. Use one of these workarounds:
1. Run `.\start-backend.ps1` in a separate PowerShell window (recommended)
2. Use Windows Terminal instead of VS Code terminal
3. Use Git Bash: `npm run start:dev`

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for more details.

### Port already in use
**Problem:** `EADDRINUSE: address already in use :::3000` or `:::5173`

**Solution:**
```powershell
# Find and stop the process using the port
netstat -ano | findstr :3000
Stop-Process -Id <PID> -Force

# Or restart your computer to clear all ports
```

### Login shows "Invalid credentials"
**Problem:** Can't login with admin@demo.local / password123

**Possible causes:**
1. Backend not running - Start it with `.\start-backend.ps1`
2. Database not seeded - Run:
   ```powershell
   cd services/api
   npx prisma migrate reset --force
   node prisma/seed.js
   ```
3. Old backend code running - Restart the backend server

### TypeScript errors in VS Code
**Problem:** Red squiggly lines showing Prisma model errors

**Solution:** Restart TypeScript Server
1. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
2. Type: "TypeScript: Restart TS Server"
3. Press Enter

### CORS errors in browser console
**Problem:** `Access-Control-Allow-Origin` errors

**Solution:** Make sure:
1. Backend is running on http://localhost:3000
2. Frontend is running on http://localhost:5173
3. Backend `.env` has `FRONTEND_URL=http://localhost:5173`

## Development Workflow

### Making Backend Changes
1. Edit files in `services/api/src/`
2. NestJS watch mode auto-recompiles
3. Check terminal for compilation errors
4. Test changes in browser or with curl

### Making Frontend Changes
1. Edit files in `workspace/shadcn-ui/src/`
2. Vite hot-reloads automatically
3. Check browser console for errors
4. Changes appear instantly in browser

### Database Changes
```powershell
cd services/api

# Create a new migration
npx prisma migrate dev --name description_of_change

# Reset database (WARNING: deletes all data)
npx prisma migrate reset --force

# Re-seed with demo data
node prisma/seed.js

# Open database viewer
npx prisma studio  # Opens http://localhost:5555
```

## Tech Stack

### Backend
- **Framework:** NestJS 9
- **Database:** PostgreSQL 15
- **ORM:** Prisma 5.22
- **Auth:** JWT (jsonwebtoken)
- **Password:** bcrypt

### Frontend
- **Framework:** React 19
- **Build:** Vite 5.4
- **HTTP:** Axios 1.13
- **UI:** Shadcn/ui + Tailwind CSS
- **State:** Zustand + React Query

## Project Structure

```
Smart eQuiz Platform/
├── services/api/          # NestJS Backend
│   ├── src/              # Source code
│   ├── prisma/           # Database schema & migrations
│   └── package.json
├── workspace/shadcn-ui/   # React Frontend
│   ├── src/              # Source code
│   ├── public/           # Static assets
│   └── package.json
├── dev/                   # Docker configs
├── start-backend.ps1     # Helper script
├── start-frontend.ps1    # Helper script
└── TROUBLESHOOTING.md    # Detailed troubleshooting
```

## Next Steps

1. ✅ Test Practice Mode with all features
2. ✅ Verify login/logout works
3. ⏳ Integrate Tournament Engine
4. ⏳ Integrate Question Bank
5. ⏳ Integrate Match System
6. ⏳ Add real-time WebSocket features

## Getting Help

- Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common issues
- Check [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for API details
- Check [FRONTEND_INTEGRATION.md](./FRONTEND_INTEGRATION.md) for integration guide
- Check [INTEGRATION_PROGRESS.md](./INTEGRATION_PROGRESS.md) for current status

## Stopping the Servers

Press `Ctrl+C` in each PowerShell window where the servers are running.
