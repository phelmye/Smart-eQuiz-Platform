# Post-Deployment Setup Checklist

**Status:** 🔄 Deployment in progress  
**Last Updated:** December 23, 2024  
**Estimated Time:** 20 minutes total

---

## ✅ Completed (Automatic)

- [x] Code pushed to GitHub (6 commits)
- [x] Render.com auto-deployment triggered
- [x] Database migration included in deployment

---

## ⏳ In Progress (Automatic - Wait 5-10 min)

- [ ] **Render Deployment**
  - **Check:** https://dashboard.render.com/
  - **Service:** smart-equiz-platform-api
  - **Tab:** Events
  - **Look for:** "Deploy live" with green checkmark
  - **Migration:** Prisma will auto-run `20251223205904_add_multi_gateway_payments`

### How to Monitor Deployment

```powershell
# Check deployment status via test endpoints
cd "c:\Projects\Dev\Smart eQuiz Platform\services\api"
$env:API_URL="https://smart-equiz-api.onrender.com/api"
node test/e2e/payments.e2e.js

# Expected when deploying: 404 errors
# Expected when complete: Authentication tests pass, gateways endpoint returns 200
```

---

## 🔴 CRITICAL: Fix Vercel VITE_API_URL (5 minutes)

**Problem:** Admin login returns 404 because API URL is missing `/api` suffix

**Current:** `https://smart-equiz-api.onrender.com` ❌  
**Required:** `https://smart-equiz-api.onrender.com/api` ✅

### Steps:

1. **Open Vercel Dashboard**
   - Go to: https://vercel.com/dashboard
   - Find project: `platform-admin` (or search `admin.smartequiz.com`)

2. **Navigate to Environment Variables**
   - Click: **Settings** tab
   - Click: **Environment Variables** (left sidebar)

3. **Edit VITE_API_URL**
   - Find: `VITE_API_URL`
   - Click: **Edit** (︙ three dots)
   - Change to: `https://smart-equiz-api.onrender.com/api`
   - Click: **Save**

4. **Redeploy**
   - Go to: **Deployments** tab
   - Click: **︙** on latest deployment
   - Click: **Redeploy**

5. **Verify Fix**
   - Go to: https://admin.smartequiz.com
   - Try to login with super admin credentials
   - Should work without 404 errors

**Detailed Guide:** [VERCEL_ENV_VAR_UPDATE_GUIDE.md](./VERCEL_ENV_VAR_UPDATE_GUIDE.md)

---

## 🟡 OPTIONAL: Configure Additional Payment Gateways

**Current Status:** Only Stripe is configured ✅  
**Additional Gateways:** PayPal, Payoneer, WorldFirst ⏳

### Priority 1: PayPal (Easiest, Universal)

**Why:** Universal acceptance, easy to set up, works worldwide

**Environment Variables Needed:**
```bash
PAYPAL_CLIENT_ID=your_client_id_here
PAYPAL_CLIENT_SECRET=your_client_secret_here
PAYPAL_ENVIRONMENT=sandbox  # or 'live' for production
```

**How to Get Credentials:**
1. Go to: https://developer.paypal.com/
2. Login with PayPal Business account
3. Navigate: **Dashboard** → **My Apps & Credentials**
4. Click: **Create App** (under REST API apps)
5. Copy: **Client ID** and **Secret**
6. For production: Switch to "Live" tab, create new app

**Add to Render:**
1. Go to: https://dashboard.render.com/
2. Select: `smart-equiz-platform-api` service
3. Click: **Environment** tab
4. Click: **Add Environment Variable**
5. Add each variable (Key + Value)
6. Click: **Save Changes** (auto-redeploys)

### Priority 2: Payoneer (Emerging Markets)

**Why:** Better rates for INR, BRL, MXN, ZAR, NGN, KES

**Environment Variables Needed:**
```bash
PAYONEER_API_KEY=your_api_key_here
PAYONEER_API_SECRET=your_api_secret_here
PAYONEER_ENVIRONMENT=sandbox  # or 'production'
```

**How to Get Credentials:**
1. Go to: https://www.payoneer.com/solutions/api/
2. Contact Payoneer sales for API access
3. Complete business verification (1-2 weeks)
4. Navigate: **Settings** → **API Access** in dashboard
5. Generate API credentials

**Note:** Requires business account and approval process

### Priority 3: WorldFirst (Asian Markets)

**Why:** Optimized for CNY, JPY, HKD, SGD payments

**Environment Variables Needed:**
```bash
WORLDFIRST_API_KEY=your_api_key_here
WORLDFIRST_API_SECRET=your_api_secret_here
WORLDFIRST_ENVIRONMENT=sandbox  # or 'production'
```

**How to Get Credentials:**
1. Go to: https://www.worldfirst.com/us/business/
2. Sign up for WorldFirst Business account
3. Contact support to request API access
4. Navigate: **Developer Portal** in dashboard
5. Generate API keys under **API Management**

**Note:** Focus on Asian market payments, requires business verification

**Detailed Guide:** [RENDER_PAYMENT_GATEWAY_CONFIG.md](./RENDER_PAYMENT_GATEWAY_CONFIG.md)

---

## 📊 Verification Steps

### 1. Check Render Deployment

```powershell
# Test production API
cd "c:\Projects\Dev\Smart eQuiz Platform\services\api"
$env:API_URL="https://smart-equiz-api.onrender.com/api"
node test/e2e/payments.e2e.js
```

**Expected Output:**
```
✅ ALL TESTS PASSED
- Configured Gateways: 1/4 (only Stripe initially)
- Total Transactions: 0 (none yet)
- Total Revenue: $0.00
```

### 2. Check Platform Admin UI

1. **Login:** https://admin.smartequiz.com
   - Should work without 404 (after VITE_API_URL fix)

2. **Navigate:** Billing page
   - Should see "Payment Gateways" section
   - Stripe: Green "Configured" badge ✅
   - Others: Gray "Not Configured" (until credentials added)

3. **Test Filtering:**
   - Status dropdown should work
   - Provider dropdown should work
   - Apply button should refresh data

4. **Test Export:**
   - Click "Export" button
   - CSV should download (empty if no transactions)

### 3. Check Configured Gateways

```powershell
# List configured gateways (requires login token)
curl -X GET "https://smart-equiz-api.onrender.com/api/payments/gateways" `
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response:**
```json
[
  {
    "provider": "STRIPE",
    "enabled": true,
    "configured": true,
    "displayName": "Stripe",
    "description": "Credit cards, Apple Pay, Google Pay"
  },
  {
    "provider": "PAYPAL",
    "enabled": false,
    "configured": false,
    "displayName": "PayPal",
    "description": "PayPal payments and subscriptions"
  },
  {
    "provider": "PAYONEER",
    "enabled": false,
    "configured": false,
    "displayName": "Payoneer",
    "description": "Multi-currency payments"
  },
  {
    "provider": "WORLDFIRST",
    "enabled": false,
    "configured": false,
    "displayName": "WorldFirst",
    "description": "Asian market payments"
  }
]
```

---

## 🚨 Troubleshooting

### Render Deployment Fails

**Symptoms:** Deploy shows "Failed" status in Render dashboard

**Check:**
1. Go to: **Logs** tab in Render
2. Look for: Build or migration errors
3. Common issues:
   - Database connection timeout → Retry deployment
   - Migration conflicts → Check Prisma schema
   - TypeScript errors → Check recent commits

**Fix:**
- Most issues auto-resolve on retry
- Click "Manual Deploy" → "Deploy latest commit"

### VITE_API_URL Still Wrong

**Symptoms:** Admin login still returns 404 after Vercel fix

**Check:**
1. Verify environment variable saved in Vercel
2. Check latest deployment used new value
3. Clear browser cache and try again

**Fix:**
```powershell
# Force new deployment
cd "c:\Projects\Dev\Smart eQuiz Platform"
git commit --allow-empty -m "Trigger Vercel redeploy"
git push origin main
```

### Payment Endpoints Return 404

**Symptoms:** `/api/payments/*` endpoints return 404

**Check:**
1. Verify Render deployment completed (green checkmark)
2. Check PaymentsModule imported in app.module.ts
3. Check Render logs for startup errors

**Fix:**
- Usually means deployment not complete, wait longer
- If persists after 15 minutes, check Render logs

### Gateway Shows "Not Configured" Despite Credentials

**Symptoms:** Gateway has credentials but shows as not configured

**Check:**
1. Verify environment variables set correctly in Render
2. No extra spaces in API keys
3. Check Render logs for gateway initialization errors

**Fix:**
1. Regenerate API keys in gateway dashboard
2. Update Render environment variables
3. Redeploy service

---

## 📝 Summary Checklist

**Before You Start:**
- [ ] Render deployment completed (check Events tab)
- [ ] Have Vercel dashboard access
- [ ] Have gateway API credentials ready (if configuring additional gateways)

**Required (5 minutes):**
- [ ] Fix VITE_API_URL in Vercel (add `/api` suffix)
- [ ] Redeploy platform-admin on Vercel
- [ ] Test admin login works

**Optional (30-60 minutes):**
- [ ] Configure PayPal credentials in Render
- [ ] Configure Payoneer credentials in Render (if needed)
- [ ] Configure WorldFirst credentials in Render (if needed)
- [ ] Test each gateway endpoint

**Verification (5 minutes):**
- [ ] Run E2E tests on production API
- [ ] Check Platform Admin Billing page
- [ ] Verify configured gateways show green badges
- [ ] Test transaction filtering and export

---

## 🎯 Success Criteria

**Minimum (Stripe only):**
- ✅ Admin login works without 404
- ✅ Billing page loads with real data
- ✅ Payment gateways section shows Stripe as configured
- ✅ Export button downloads CSV

**Optimal (All gateways):**
- ✅ All 4 gateways show as configured
- ✅ Currency recommendations work
- ✅ Smart routing selects best gateway
- ✅ All endpoints tested successfully

---

## 📞 Need Help?

**Render Issues:** Check logs at https://dashboard.render.com/  
**Vercel Issues:** Check logs at https://vercel.com/dashboard  
**Gateway Issues:** See [RENDER_PAYMENT_GATEWAY_CONFIG.md](./RENDER_PAYMENT_GATEWAY_CONFIG.md) → Support section

**Documentation:**
- [MULTI_GATEWAY_PAYMENT_INTEGRATION.md](./MULTI_GATEWAY_PAYMENT_INTEGRATION.md) - Architecture
- [RENDER_PAYMENT_GATEWAY_CONFIG.md](./RENDER_PAYMENT_GATEWAY_CONFIG.md) - Configuration
- [VERCEL_ENV_VAR_UPDATE_GUIDE.md](./VERCEL_ENV_VAR_UPDATE_GUIDE.md) - Vercel setup
- [MULTI_GATEWAY_PAYMENT_COMPLETE.md](./MULTI_GATEWAY_PAYMENT_COMPLETE.md) - Implementation summary

---

**Last Updated:** December 23, 2024  
**Next Check:** 10 minutes (for Render deployment completion)
