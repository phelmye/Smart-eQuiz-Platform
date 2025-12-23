# Render.com Payment Gateway Configuration Guide

## Overview

This guide walks through configuring payment gateway API credentials in Render.com for the Smart eQuiz Platform API. The platform supports 4 payment gateways: **Stripe**, **PayPal**, **Payoneer**, and **WorldFirst**.

## Current Status

✅ **STRIPE** - Currently configured and active  
⏳ **PAYPAL** - Requires configuration  
⏳ **PAYONEER** - Requires configuration  
⏳ **WORLDFIRST** - Requires configuration

## Environment Variables to Configure

### 1. Stripe (Already Configured)

```bash
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxx  # ✅ Already set
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxx       # Optional
```

### 2. PayPal (To Be Configured)

```bash
PAYPAL_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxx
PAYPAL_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxx
PAYPAL_ENVIRONMENT=sandbox  # Use 'live' for production
```

**How to get PayPal credentials:**

1. Go to https://developer.paypal.com/
2. Log in with PayPal Business account
3. Navigate to **Dashboard** → **My Apps & Credentials**
4. Under **REST API apps**, click **Create App**
5. Copy **Client ID** and **Secret**
6. For production: Switch to "Live" tab and create new app

**API Documentation:** https://developer.paypal.com/api/rest/

### 3. Payoneer (To Be Configured)

```bash
PAYONEER_API_KEY=xxxxxxxxxxxxxxxxxxxxx
PAYONEER_API_SECRET=xxxxxxxxxxxxxxxxxxxxx
PAYONEER_ENVIRONMENT=sandbox  # Use 'production' for live
```

**How to get Payoneer credentials:**

1. Go to https://www.payoneer.com/solutions/api/
2. Contact Payoneer sales for API access
3. Complete onboarding process
4. Navigate to **Settings** → **API Access** in Payoneer dashboard
5. Generate API credentials

**Note:** Payoneer API access requires business verification and approval process (typically 1-2 weeks).

**API Documentation:** https://developer.payoneer.com/

### 4. WorldFirst (To Be Configured)

```bash
WORLDFIRST_API_KEY=xxxxxxxxxxxxxxxxxxxxx
WORLDFIRST_API_SECRET=xxxxxxxxxxxxxxxxxxxxx
WORLDFIRST_ENVIRONMENT=sandbox  # Use 'production' for live
```

**How to get WorldFirst credentials:**

1. Go to https://www.worldfirst.com/us/business/
2. Sign up for WorldFirst Business account
3. Contact support to request API access
4. Navigate to **Developer Portal** in dashboard
5. Generate API keys under **API Management**

**Note:** WorldFirst API access requires business verification. Focus on Asian market payments (CNY, JPY, HKD, SGD).

**API Documentation:** https://developer.worldfirst.com/

### 5. General Payment Configuration

```bash
DEFAULT_PAYMENT_PROVIDER=STRIPE  # Options: STRIPE, PAYPAL, PAYONEER, WORLDFIRST
```

## Step-by-Step Configuration in Render.com

### Option 1: Via Render Dashboard (Recommended)

1. Go to https://dashboard.render.com/
2. Navigate to your **smart-equiz-platform** service
3. Click **Environment** tab in left sidebar
4. Click **Add Environment Variable**
5. Add each variable:
   - **Key:** `PAYPAL_CLIENT_ID`
   - **Value:** (paste your PayPal Client ID)
   - Click **Save Changes**
6. Repeat for all variables above
7. Service will automatically redeploy

### Option 2: Via Render.yaml (Infrastructure as Code)

Add to `render.yaml`:

```yaml
services:
  - type: web
    name: smart-equiz-platform-api
    env: node
    envVars:
      # Stripe (already configured)
      - key: STRIPE_SECRET_KEY
        sync: false  # Set via dashboard for security
      
      # PayPal
      - key: PAYPAL_CLIENT_ID
        sync: false
      - key: PAYPAL_CLIENT_SECRET
        sync: false
      - key: PAYPAL_ENVIRONMENT
        value: sandbox  # Change to 'live' for production
      
      # Payoneer
      - key: PAYONEER_API_KEY
        sync: false
      - key: PAYONEER_API_SECRET
        sync: false
      - key: PAYONEER_ENVIRONMENT
        value: sandbox
      
      # WorldFirst
      - key: WORLDFIRST_API_KEY
        sync: false
      - key: WORLDFIRST_API_SECRET
        sync: false
      - key: WORLDFIRST_ENVIRONMENT
        value: sandbox
      
      # General
      - key: DEFAULT_PAYMENT_PROVIDER
        value: STRIPE
```

**Note:** For sensitive credentials, set `sync: false` and manually add via dashboard.

### Option 3: Via Render CLI

```powershell
# Install Render CLI
npm install -g render-cli

# Login
render login

# Set environment variables
render env set PAYPAL_CLIENT_ID "your_client_id" --service smart-equiz-platform-api
render env set PAYPAL_CLIENT_SECRET "your_client_secret" --service smart-equiz-platform-api
render env set PAYPAL_ENVIRONMENT "sandbox" --service smart-equiz-platform-api

# Repeat for other gateways...
```

## Verification Steps

After configuring environment variables:

### 1. Check Service Logs

```
1. Go to Render Dashboard → Service → Logs
2. Look for startup messages:
   ✓ "Payment gateway initialized: STRIPE"
   ✓ "Payment gateway initialized: PAYPAL"
   ✓ "Payment gateway initialized: PAYONEER"
   ✓ "Payment gateway initialized: WORLDFIRST"
```

### 2. Test Payment Gateway Endpoint

```bash
# Get list of configured gateways
curl -X GET https://smart-equiz-api.onrender.com/api/payments/gateways \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Expected response:
{
  "gateways": [
    {
      "provider": "STRIPE",
      "enabled": true,
      "configured": true,
      "displayName": "Stripe",
      "description": "Credit cards, Apple Pay, Google Pay"
    },
    {
      "provider": "PAYPAL",
      "enabled": true,
      "configured": true,  # Should be true after configuration
      "displayName": "PayPal",
      "description": "PayPal payments and subscriptions"
    },
    {
      "provider": "PAYONEER",
      "enabled": false,  # May be false if credentials invalid
      "configured": true,
      "displayName": "Payoneer",
      "description": "Multi-currency payments"
    },
    {
      "provider": "WORLDFIRST",
      "enabled": false,
      "configured": true,
      "displayName": "WorldFirst",
      "description": "Asian market payments"
    }
  ]
}
```

### 3. Check Platform Admin Dashboard

1. Login to https://admin.smartequiz.com
2. Navigate to **Billing** page
3. Scroll to **Payment Gateways** section
4. Verify green checkmarks (✓) appear next to configured providers

## Gateway Recommendation by Currency

The payment system automatically recommends the best gateway based on currency:

| Currency | Recommended Gateway | Reason |
|----------|---------------------|--------|
| USD, EUR, GBP, CAD, AUD | **Stripe** | Low fees, excellent UX |
| INR, BRL, MXN, ZAR, NGN, KES | **Payoneer** | Better emerging market support |
| CNY, JPY, HKD, SGD | **WorldFirst** | Optimized for Asian markets |
| All others | **PayPal** | Universal acceptance |

## Testing Payment Flows

### Test Mode Credentials (Sandbox)

**Stripe Test Card:**
- Card Number: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits

**PayPal Test Account:**
- Create at https://developer.paypal.com/dashboard/accounts
- Use sandbox buyer account credentials

**Payoneer/WorldFirst:**
- Test credentials provided by respective platforms during API onboarding

### Production Checklist

Before going live:

- [ ] All gateway API credentials updated from sandbox to production
- [ ] Change `PAYPAL_ENVIRONMENT` to `live`
- [ ] Change `PAYONEER_ENVIRONMENT` to `production`
- [ ] Change `WORLDFIRST_ENVIRONMENT` to `production`
- [ ] Verify webhook URLs configured in each gateway dashboard
- [ ] Test small payment ($0.50) on each gateway
- [ ] Monitor Render logs for successful transactions
- [ ] Configure alerts for failed payments

## Security Best Practices

1. **Never commit API keys to Git**
   - Use Render dashboard or CLI for sensitive values
   - Set `sync: false` in render.yaml for secrets

2. **Rotate credentials regularly**
   - Stripe: Every 90 days
   - PayPal: Every 180 days
   - Payoneer/WorldFirst: As per their policies

3. **Monitor API usage**
   - Set up alerts in each gateway dashboard
   - Monitor rate limits and quotas

4. **Use production keys only in production**
   - Keep sandbox keys in development/staging environments

## Troubleshooting

### Gateway shows as "Not Configured"

**Cause:** Missing or invalid API credentials

**Solution:**
1. Check Render logs for error messages
2. Verify environment variables are set correctly
3. Ensure no extra spaces in API keys
4. Test credentials using gateway's API testing tools

### Transactions failing with authentication error

**Cause:** Incorrect API secret or expired credentials

**Solution:**
1. Regenerate API keys in gateway dashboard
2. Update environment variables in Render
3. Redeploy service

### Gateway timeout errors

**Cause:** Network issues or gateway downtime

**Solution:**
1. Check gateway status pages:
   - Stripe: https://status.stripe.com/
   - PayPal: https://www.paypal-status.com/
2. Implement retry logic (already handled by PaymentGatewayService)
3. Monitor Render service health

## Support Contacts

- **Stripe Support:** https://support.stripe.com/
- **PayPal Developer Support:** https://developer.paypal.com/support/
- **Payoneer API Support:** api-support@payoneer.com
- **WorldFirst Support:** https://www.worldfirst.com/us/contact/

## Next Steps

1. **Immediate:** Keep Stripe configured (currently active)
2. **Priority 1:** Configure PayPal (easiest, universal acceptance)
3. **Priority 2:** Configure Payoneer (if targeting emerging markets)
4. **Priority 3:** Configure WorldFirst (if targeting Asian markets)

Once all gateways are configured, the Platform Admin Billing page will show all 4 providers with green "Configured" badges, and tenants can choose their preferred payment method based on currency and location.

---

**Last Updated:** December 23, 2024  
**Related Documentation:**
- [MULTI_GATEWAY_PAYMENT_INTEGRATION.md](./MULTI_GATEWAY_PAYMENT_INTEGRATION.md)
- [BACKEND_PRODUCTION_DEPLOYMENT.md](./BACKEND_PRODUCTION_DEPLOYMENT.md)
