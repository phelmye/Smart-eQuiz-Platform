# OLD/UNUSED FILES AUDIT

## Analysis Date: December 18, 2025

This document identifies potentially obsolete files, their purpose, and recommendations for removal.

---

## 🚨 CRITICAL - SHOULD BE REMOVED (CONFIRMED OBSOLETE)

### 1. Supabase Seed Files (NOT USING SUPABASE ANYMORE)

**Current System**: PostgreSQL via Prisma (services/api/prisma/)

#### Files to Remove:
- `/api/seed-supabase.ts` (47 lines)
- `/apps/tenant-app/api/seed-supabase.ts` (49 lines)

**Purpose**: Serverless functions to seed Supabase database  
**Why Obsolete**: Project uses PostgreSQL with Prisma, not Supabase  
**Risk of Removal**: ✅ NONE - These are completely unused  
**Verification**: No imports found in codebase, no references in vercel.json

**Action**: ✅ SAFE TO DELETE


### 2. Root-Level `/api` Directory

**Path**: `/api/seed-supabase.ts`

**Why Obsolete**: This was for Vercel serverless functions, but we now use NestJS backend (services/api/)  
**Risk of Removal**: ✅ NONE - Not deployed, not referenced  
**Related to Build Error**: ❗ YES - This is causing the tenant-app build error:
```
api/seed-supabase.ts(2,52): error TS2307: Cannot find module '@vercel/node'
```

**Action**: ✅ SAFE TO DELETE ENTIRE `/api` DIRECTORY


### 3. Old Monolith Directory Structure

#### Files/Folders to Consider:
- `/workspace/` - OLD monolith application (being migrated from)
- `/workspace/shadcn-ui/` - Legacy tenant-app before migration

**Purpose**: Original monolithic application before three-app architecture  
**Current Status**: Migrated to `/apps/` (marketing-site, platform-admin, tenant-app)  
**Why Keep for Now**: Reference during migration, contains working features not yet migrated  
**Action**: ⏳ KEEP FOR NOW - Active migration in progress

---

## ⚠️ POTENTIALLY OBSOLETE - NEED VERIFICATION

### 4. Railway Deployment Scripts

**Files**:
- `/scripts/deploy-railway.sh`
- `/scripts/deploy-railway.ps1`

**Purpose**: Deploy to Railway.app hosting  
**Current Deployment**: Render.com (backend) + Vercel (frontend)  
**Risk**: ⚠️ MEDIUM - If you're not using Railway, these are unused  
**Question for You**: Are you using Railway.app for anything?  
**Recommendation**: If not using Railway → DELETE


### 5. Admin Backend Service

**Directory**: `/services/admin-backend/`  
**File**: `/services/admin-backend/dev-call.ps1`

**Purpose**: Separate admin backend service  
**Current Architecture**: Single NestJS API (`services/api/`) serves all apps  
**Risk**: ⚠️ MEDIUM - May be obsolete if consolidated into main API  
**Question for You**: Is there a separate admin-backend service running?  
**Recommendation**: If not needed → DELETE ENTIRE DIRECTORY


### 6. Media Seed Script

**File**: `/scripts/seed-media-library.js`

**Purpose**: Seed media library with sample images  
**Current Status**: Unknown if used  
**Risk**: ⚠️ LOW - Probably for development only  
**Question for You**: Do you need to seed media files?  
**Recommendation**: If never used → DELETE


### 7. Backup Scripts (Unix/Linux)

**Files**:
- `/scripts/verify-backups.sh`
- `/scripts/test-restore.sh`

**Purpose**: Database backup verification (for production)  
**Current System**: Windows PowerShell environment  
**Risk**: ⚠️ LOW - These are `.sh` (Unix), but you're on Windows  
**Question for You**: Do you have Linux servers for backups?  
**Recommendation**: If only using Windows → DELETE, or convert to `.ps1`


### 8. Root-Level Start Scripts

**Files**:
- `/start-frontend.ps1`
- `/start-backend.ps1`

**Purpose**: Quick start development servers  
**Current Usage**: Unknown  
**Risk**: ⚠️ LOW - Convenience scripts  
**Question for You**: Do you use these to start development?  
**Recommendation**: If you use `pnpm dev:*` commands instead → DELETE

---

## ✅ KEEP - ACTIVELY USED

### 9. Development Scripts (`/dev/` directory)

**Files**:
- `/dev/run-init.ps1` - Initialize Docker containers (Postgres + Redis)
- `/dev/reset-db.ps1` - Reset and seed database
- `/dev/test-api.ps1` - Test API endpoints
- `/dev/install-hooks.ps1` - Git pre-push hooks
- `/dev/monitor-ci.ps1` - CI monitoring
- `/dev/monitor-loop.ps1` - Continuous monitoring

**Status**: ✅ ACTIVE - Used for local development  
**Action**: KEEP


### 10. CMS Content Script (NEW)

**File**: `/add-cms-content.ps1`

**Purpose**: Add marketing CMS content via API  
**Status**: ✅ ACTIVE - Just created, needs to be fixed for correct schema  
**Action**: KEEP AND UPDATE


### 11. Prisma Seed Script

**File**: `/services/api/prisma/seed.js`

**Purpose**: Seed production database with initial data  
**Status**: ✅ ACTIVE - Used in production (just ran it on Render)  
**Action**: KEEP


### 12. Tenant App Test Script

**File**: `/apps/tenant-app/run-tests.ps1`

**Purpose**: Run tests for tenant-app  
**Status**: ✅ ACTIVE - Testing infrastructure  
**Action**: KEEP

---

## 📊 SUMMARY OF RECOMMENDATIONS

### Immediate Deletion (100% Safe):
1. ✅ `/api/` directory (entire folder)
   - Causes build error
   - Not used (Supabase seed functions)
   - No risk

2. ✅ `/apps/tenant-app/api/seed-supabase.ts`
   - Duplicate Supabase seed
   - Not used

### Pending Your Verification:

**Question 1**: Are you using Railway.app?
- ❌ NO → Delete `/scripts/deploy-railway.*`
- ✅ YES → Keep

**Question 2**: Is there a separate admin-backend service?
- ❌ NO → Delete `/services/admin-backend/`
- ✅ YES → Keep

**Question 3**: Do you use media seed script?
- ❌ NO → Delete `/scripts/seed-media-library.js`
- ✅ YES → Keep

**Question 4**: Do you have Linux/Unix servers?
- ❌ NO → Delete `.sh` backup scripts
- ✅ YES → Keep

**Question 5**: Do you use start-frontend.ps1 and start-backend.ps1?
- ❌ NO → Delete
- ✅ YES → Keep

**Question 6**: Should we keep `/workspace/` (old monolith)?
- Keep until migration complete
- Then archive or delete

---

## 🔧 IMMEDIATE ACTION PLAN

### Step 1: Delete Confirmed Obsolete (SAFE)

```powershell
# These are 100% safe to delete
Remove-Item -Path "C:\Projects\Dev\Smart eQuiz Platform\api" -Recurse -Force
Remove-Item -Path "C:\Projects\Dev\Smart eQuiz Platform\apps\tenant-app\api" -Recurse -Force
```

This will:
✅ Fix tenant-app build error  
✅ Remove unused Supabase code  
✅ No risk - not referenced anywhere

### Step 2: Answer Verification Questions

Review the 6 questions above and let me know which scripts you actually use.

### Step 3: Clean Up Based on Your Answers

I'll delete the confirmed unused files.

---

## 📁 DIRECTORY STRUCTURE SUMMARY

**Current Backend**: `services/api/` (NestJS + Prisma + PostgreSQL) ✅  
**Old Backend**: `services/admin-backend/` ⚠️ Unknown if used  
**Current Frontend**: `apps/` (3 separate apps) ✅  
**Old Frontend**: `workspace/shadcn-ui/` ⏳ Migration in progress  

**Recommended Final Structure**:
```
Smart eQuiz Platform/
├── apps/              ← Keep (new architecture)
│   ├── marketing-site/
│   ├── platform-admin/
│   └── tenant-app/
├── packages/          ← Keep (shared code)
├── services/
│   └── api/          ← Keep (main backend)
├── dev/              ← Keep (dev scripts)
├── scripts/          ← Review and clean
└── workspace/        ← Archive/delete after migration
```

---

## QUESTIONS FOR YOU:

1. **Railway.app**: Using it? (YES/NO)
2. **Admin Backend**: Separate service running? (YES/NO)
3. **Media Seed**: Need this script? (YES/NO)
4. **Backup Scripts (.sh)**: Have Linux servers? (YES/NO)
5. **Start Scripts**: Use start-frontend.ps1 / start-backend.ps1? (YES/NO)
6. **Workspace**: Ready to archive old monolith? (YES/NO/WAIT)

**Please answer these 6 questions and I'll proceed with safe cleanup.**
