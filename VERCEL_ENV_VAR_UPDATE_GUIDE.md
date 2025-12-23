# Vercel Environment Variable Update - VITE_API_URL Fix

**Date:** December 23, 2024  
**Priority:** 🔴 CRITICAL - Blocks admin login  
**Time Required:** 5 minutes

## Problem

Platform Admin login returns 404 errors because `VITE_API_URL` in Vercel is missing the `/api` suffix.

**Current (Wrong):** `https://smart-equiz-api.onrender.com`  
**Required (Correct):** `https://smart-equiz-api.onrender.com/api`

---

## Step-by-Step Fix

### Option 1: Via Vercel Dashboard (Recommended)

1. **Open Vercel Dashboard**
   - Go to: https://vercel.com/dashboard
   - Login with your account

2. **Navigate to Platform Admin Project**
   - Find and click: `platform-admin` project
   - Or search for: `admin.smartequiz.com`

3. **Open Settings**
   - Click: **Settings** tab (top navigation)

4. **Navigate to Environment Variables**
   - Click: **Environment Variables** (left sidebar)

5. **Find VITE_API_URL**
   - Scroll to find: `VITE_API_URL`
   - Current value should be: `https://smart-equiz-api.onrender.com`

6. **Edit Variable**
   - Click: **︙** (three dots) or **Edit** button next to `VITE_API_URL`
   - Update value to: `https://smart-equiz-api.onrender.com/api`
   - ⚠️ **Important:** Add the `/api` suffix at the end

7. **Save Changes**
   - Click: **Save** button
   - Confirm the change

8. **Trigger Redeploy**
   - Go to: **Deployments** tab
   - Click: **︙** (three dots) on latest deployment
   - Click: **Redeploy**
   - Or just push a new commit to trigger auto-deploy

---

### Option 2: Via Vercel CLI

```powershell
# Install Vercel CLI (if not installed)
npm i -g vercel

# Login to Vercel
vercel login

# Navigate to project directory
cd "c:\Projects\Dev\Smart eQuiz Platform\apps\platform-admin"

# Update environment variable for production
vercel env rm VITE_API_URL production
vercel env add VITE_API_URL production
# When prompted, enter: https://smart-equiz-api.onrender.com/api

# Trigger redeploy
vercel --prod
```

---

### Option 3: Via GitHub Actions (Automated)

If you have Vercel GitHub integration, just push this commit and it will auto-deploy:

```powershell
cd "c:\Projects\Dev\Smart eQuiz Platform"

# Create a dummy commit to trigger redeploy
git commit --allow-empty -m "Trigger redeploy with updated VITE_API_URL"
git push origin main
```

**Note:** This only works if you've already updated the env var in Vercel dashboard first.

---

## Verification

### 1. Check Deployment Logs

After redeploying, check build logs in Vercel:
- Go to: **Deployments** tab
- Click: Latest deployment
- Check: Build logs should show environment variables are set

### 2. Test Login

1. **Open Platform Admin**
   ```
   https://admin.smartequiz.com
   ```

2. **Login**
   - Email: `super@admin.com`
   - Password: `SuperAdmin123!`

3. **Expected Result**
   - ✅ Login succeeds
   - ✅ Redirects to Dashboard
   - ✅ Dashboard shows real statistics

4. **If Still Failing**
   - Open DevTools (F12)
   - Check Network tab
   - Look for API calls - should go to: `https://smart-equiz-api.onrender.com/api/auth/login`
   - If still going to wrong URL, clear browser cache and try again

### 3. Check API Calls

Open DevTools Console and run:
```javascript
// Should output: https://smart-equiz-api.onrender.com/api
console.log(import.meta.env.VITE_API_URL);
```

---

## Why This Matters

### Current Behavior (Without `/api`)
```
Login attempt → POST https://smart-equiz-api.onrender.com/auth/login
Backend expects → POST https://smart-equiz-api.onrender.com/api/auth/login
Result → 404 Not Found ❌
```

### Fixed Behavior (With `/api`)
```
Login attempt → POST https://smart-equiz-api.onrender.com/api/auth/login
Backend expects → POST https://smart-equiz-api.onrender.com/api/auth/login
Result → 200 Success + JWT token ✅
```

---

## Environment Variables Checklist

Ensure these are set in Vercel for `platform-admin`:

| Variable | Value | Status |
|----------|-------|--------|
| `VITE_API_URL` | `https://smart-equiz-api.onrender.com/api` | 🔴 **UPDATE REQUIRED** |
| `NODE_VERSION` | `18` or `22` | ✅ Should be set |

---

## Common Issues

### Issue 1: Changes Not Reflecting
**Solution:** Hard refresh browser
```
Chrome/Edge: Ctrl + Shift + R
Firefox: Ctrl + F5
Safari: Cmd + Shift + R
```

### Issue 2: Still Getting 404
**Solution:** Check if redeploy completed
- Go to Vercel Dashboard → Deployments
- Latest deployment should show "Ready" status
- If "Failed", check build logs for errors

### Issue 3: Env Var Not Applied
**Solution:** Ensure you saved AND redeployed
- Environment variable changes require a redeploy
- Either redeploy from dashboard or push a commit

---

## Related Files

These files use `VITE_API_URL`:

1. `apps/platform-admin/src/lib/api.ts` - Main API client
2. `apps/platform-admin/src/contexts/AuthContext.tsx` - Authentication
3. `apps/platform-admin/src/hooks/useMarketingCMS.ts` - Marketing CMS
4. `apps/platform-admin/.env.example` - Example env file

---

## After Fixing

Once VITE_API_URL is fixed:

✅ **Test These Features:**
1. Login/Logout
2. Dashboard loads with real statistics
3. Tenants page CRUD operations
4. Users page CRUD operations
5. Marketing CMS content loading

✅ **Update Documentation:**
- Mark this issue as resolved in session summary
- Update deployment guides if needed

✅ **Monitor:**
- Check Vercel deployment logs for any errors
- Monitor Render.com API logs for increased traffic
- Verify no 404 errors in production

---

## Quick Reference

**Vercel Dashboard:** https://vercel.com/dashboard  
**Platform Admin URL:** https://admin.smartequiz.com  
**API Base URL:** https://smart-equiz-api.onrender.com/api  
**Test Credentials:** super@admin.com / SuperAdmin123!

**Required Change:**
```diff
- VITE_API_URL=https://smart-equiz-api.onrender.com
+ VITE_API_URL=https://smart-equiz-api.onrender.com/api
```

---

## Completion Checklist

- [ ] Open Vercel Dashboard
- [ ] Find platform-admin project
- [ ] Navigate to Environment Variables
- [ ] Edit VITE_API_URL
- [ ] Change value to include `/api` suffix
- [ ] Save changes
- [ ] Trigger redeploy (or push commit)
- [ ] Wait for deployment to complete (2-5 minutes)
- [ ] Test login at admin.smartequiz.com
- [ ] Verify Dashboard shows real data
- [ ] Mark todo item as complete

---

**Estimated Time:** 5 minutes  
**Impact:** Critical - enables all Platform Admin functionality  
**Risk:** Low - only changes environment variable  
**Rollback:** Simple - just change back to old value and redeploy
