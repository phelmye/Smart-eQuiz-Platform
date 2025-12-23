# Platform Admin Login Guide

## 🔐 Access Platform Admin Dashboard

### URLs (Choose either)
- **Primary**: https://admin.smartequiz.com  
- **Backup**: https://platform-admin.vercel.app

Both URLs are **ONLINE and accessible** as of December 23, 2025.

---

## 🎫 Super Admin Credentials

```
Email:    super@admin.com
Password: SuperAdmin123!
```

These credentials are seeded in the production database and verified working via API test.

---

## 🐛 Troubleshooting Login Issues

### If Login Fails:

#### 1. Check Browser Console
1. Press **F12** to open Developer Tools
2. Go to **Console** tab
3. Try logging in
4. Look for errors (red text)
5. **Share screenshot** of any errors

#### 2. Check Network Requests
1. In Developer Tools, go to **Network** tab
2. Try logging in
3. Look for `/auth/login` request
4. Click on it and check:
   - **Status Code**: Should be 200
   - **Response**: Should contain `access_token` and `user` object
   - **Preview**: Check if error message is returned

#### 3. Verify Environment Variables
The Platform Admin app needs this environment variable set in Vercel:

```
VITE_API_URL = https://smart-equiz-api.onrender.com/api
```

**To check/set in Vercel Dashboard**:
1. Go to https://vercel.com/dashboard
2. Click on "platform-admin" project (or "smart-equiz-platform-admin")
3. Go to **Settings** → **Environment Variables**
4. Verify `VITE_API_URL` exists with correct value
5. If missing or wrong, add/update it
6. **Redeploy** the project after changing env vars

#### 4. Test API Directly
Run this in PowerShell to confirm API login works:

```powershell
$body = @{
  email = "super@admin.com"
  password = "SuperAdmin123!"
} | ConvertTo-Json

$response = Invoke-RestMethod `
  -Uri "https://smart-equiz-api.onrender.com/api/auth/login" `
  -Method Post `
  -Body $body `
  -ContentType "application/json"

$response | Format-List
```

Expected output:
```
access_token : eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
user         : @{id=...; email=super@admin.com; role=SUPER_ADMIN; ...}
```

---

## 📸 What to Share if Still Stuck

Please provide:
1. **Screenshot** of browser console errors (F12 → Console)
2. **Screenshot** of Network tab showing failed request (if any)
3. **Exact error message** displayed on screen
4. **Which URL** you're using (admin.smartequiz.com or platform-admin.vercel.app)
5. **Browser** you're using (Chrome, Firefox, Edge, etc.)

---

## ✅ Verified Working (As of Dec 23, 2025)

- ✓ Platform Admin deployed and accessible
- ✓ API authentication endpoint working
- ✓ Super admin account exists in database
- ✓ Credentials verified: `super@admin.com` / `SuperAdmin123!`
- ✓ API returns valid JWT tokens with SUPER_ADMIN role

The backend authentication is 100% functional. If login fails, it's likely a frontend configuration issue (missing env var or CORS problem).
