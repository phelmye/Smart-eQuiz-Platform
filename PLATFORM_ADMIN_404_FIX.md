# Platform Admin Login Fix - 404 Error

## 🚨 Problem Identified

**Error**: `Cannot POST /auth/login` (404)

**Root Cause**: The `VITE_API_URL` environment variable in Vercel is missing the `/api` path.

### Current (WRONG):
```
Request: https://smart-equiz-api.onrender.com/auth/login
Result: 404 Not Found
```

### Should be (CORRECT):
```
Request: https://smart-equiz-api.onrender.com/api/auth/login
Result: 200 OK
```

---

## ✅ FIX: Update Vercel Environment Variable

### Step 1: Open Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Click on your **platform-admin** project (or **smart-equiz-platform-admin**)

### Step 2: Update Environment Variable
1. Click **Settings** (top menu)
2. Click **Environment Variables** (left sidebar)
3. Find `VITE_API_URL`
4. Click the **︙** (three dots) → **Edit**
5. Change value from:
   ```
   https://smart-equiz-api.onrender.com
   ```
   To:
   ```
   https://smart-equiz-api.onrender.com/api
   ```
6. Make sure it's checked for:
   - ✓ Production
   - ✓ Preview
   - ✓ Development
7. Click **Save**

### Step 3: Redeploy
1. Go to **Deployments** tab
2. Click **︙** on the latest deployment → **Redeploy**
3. Select **Use existing Build Cache** (optional, faster)
4. Click **Redeploy**
5. Wait 2-3 minutes for deployment to complete

### Step 4: Test Login
1. Visit https://admin.smartequiz.com
2. Clear browser cache (Ctrl+Shift+Delete)
3. Enter credentials:
   - Email: `super@admin.com`
   - Password: `SuperAdmin123!`
4. Click "Sign In"
5. Should work! ✅

---

## 🔍 Verify the Fix

After redeployment, check the browser console (F12 → Network tab):

**Before Fix:**
```
POST https://smart-equiz-api.onrender.com/auth/login → 404
```

**After Fix:**
```
POST https://smart-equiz-api.onrender.com/api/auth/login → 200 OK
```

---

## 📝 Why This Happened

The `.env.example` file shows:
```
VITE_API_URL=http://localhost:3001/api
```

But when setting up Vercel, the `/api` part was omitted. The code expects the full URL including the `/api` prefix.

---

## 🚀 Quick Test After Fix

Run this in PowerShell to verify the endpoint works:

```powershell
$body = @{
  email = "super@admin.com"
  password = "SuperAdmin123!"
} | ConvertTo-Json

Invoke-RestMethod `
  -Uri "https://smart-equiz-api.onrender.com/api/auth/login" `
  -Method Post `
  -Body $body `
  -ContentType "application/json"
```

Expected output:
```
access_token : eyJhbGci...
user         : @{id=...; email=super@admin.com; role=SUPER_ADMIN; ...}
```

---

## ⏱️ Timeline

1. Update env var: 1 minute
2. Redeploy: 2-3 minutes
3. Test login: 30 seconds

**Total: ~5 minutes to fix**
