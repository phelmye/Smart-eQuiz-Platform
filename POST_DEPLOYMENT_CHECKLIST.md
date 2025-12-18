# Post-Deployment Checklist

## ✅ Once Render Deployment Succeeds

### 1. Get Your API URL
From Render dashboard, copy your service URL (example):
```
https://smart-equiz-api.onrender.com
```

### 2. Test Backend Endpoints

#### Health Check
```bash
# Test in browser or run:
curl https://smart-equiz-api.onrender.com/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-12-16T...",
  "uptime": 123.456
}
```

#### Swagger Documentation
Open in browser:
```
https://smart-equiz-api.onrender.com/api/docs
```

Should show interactive API documentation.

### 3. Update Vercel Environment Variables

**For Marketing Site:**
1. Go to Vercel Dashboard → `smart-equiz-platform` project
2. Settings → Environment Variables
3. Add new variable:
   - **Key**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://smart-equiz-api.onrender.com`
   - **Environments**: ✓ Production ✓ Preview ✓ Development
4. Click **Save**

**Redeploy Marketing Site:**
- Go to Deployments tab
- Find latest deployment
- Click ⋯ (three dots) → **Redeploy**
- Wait ~2 minutes

### 4. Verify Dynamic Content Works

After redeploying marketing site, visit:
- `https://your-site.vercel.app` - Should fetch hero content from API
- `https://your-site.vercel.app/blog` - Should fetch blog posts
- `https://your-site.vercel.app/pricing` - Should fetch pricing plans
- `https://your-site.vercel.app/features` - Should fetch features

Check browser DevTools → Network tab to confirm API calls succeed.

---

## 🔐 Security Configuration (Important!)

### Update CORS in Backend

Your backend currently allows only `http://localhost:5173`. Update to allow Vercel domain:

1. Go to Render Dashboard → Your API service → Environment
2. Find or add `FRONTEND_URL` variable
3. Update to your Vercel URL: `https://smart-equiz-platform.vercel.app`
4. Save and redeploy

### Add JWT Secrets (If not already added)

Ensure these are set in Render Environment Variables:
- `JWT_SECRET` - 32+ character random string
- `JWT_REFRESH_SECRET` - Different 32+ character random string

Generate in PowerShell:
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 📱 Platform Admin & Tenant App Deployment

### Deploy Platform Admin to Vercel

1. **Create New Vercel Project**
   - Dashboard → Add New → Project
   - Import `phelmye/Smart-eQuiz-Platform`
   - Configure:
     - **Project Name**: `smart-equiz-admin`
     - **Framework Preset**: Other
     - **Root Directory**: `apps/platform-admin` ✓ Include source files outside
     - **Build Command**: `cd ../.. && pnpm --filter=platform-admin... build`
     - **Output Directory**: `dist`
     - **Install Command**: `corepack enable && pnpm install --frozen-lockfile`

2. **Add Environment Variables**:
   ```
   VITE_API_URL=https://smart-equiz-api.onrender.com
   ```

3. **Deploy**

### Deploy Tenant App to Vercel

1. **Create New Vercel Project**
   - Dashboard → Add New → Project
   - Import `phelmye/Smart-eQuiz-Platform`
   - Configure:
     - **Project Name**: `smart-equiz-tenant`
     - **Framework Preset**: Other
     - **Root Directory**: `apps/tenant-app` ✓ Include source files outside
     - **Build Command**: `cd ../.. && pnpm --filter=tenant-app... build`
     - **Output Directory**: `dist`
     - **Install Command**: `corepack enable && pnpm install --frozen-lockfile`

2. **Add Environment Variables**:
   ```
   VITE_API_URL=https://smart-equiz-api.onrender.com
   VITE_SUPABASE_URL=your_supabase_url (if using)
   VITE_SUPABASE_ANON_KEY=your_supabase_key (if using)
   ```

3. **Deploy**

---

## 🧪 End-to-End Testing

### Test Authentication Flow

1. **Register New User**:
   ```bash
   curl -X POST https://smart-equiz-api.onrender.com/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "Test123!@#",
       "firstName": "Test",
       "lastName": "User"
     }'
   ```

2. **Login**:
   ```bash
   curl -X POST https://smart-equiz-api.onrender.com/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "Test123!@#"
     }'
   ```

3. **Copy Access Token** from response

4. **Test Protected Endpoint**:
   ```bash
   curl https://smart-equiz-api.onrender.com/api/users/me \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
   ```

### Test Notification System (Mobile App)

Once mobile app is working:
1. Register push token via `/api/notifications/register-token`
2. Send test notification via `/api/notifications/send`
3. Verify notification arrives on device

---

## 📊 Monitoring Setup

### Add Sentry for Error Tracking

1. **Create Sentry account**: https://sentry.io
2. **Create new project** → Node.js/NestJS
3. **Copy DSN** (looks like: `https://xxxxx@sentry.io/12345`)
4. **Add to Render Environment**:
   ```
   SENTRY_DSN=https://xxxxx@sentry.io/12345
   SENTRY_ENVIRONMENT=production
   ```
5. **Redeploy** - Errors will now be tracked in Sentry

### Monitor Render Logs

Render Dashboard → Your service → Logs tab
- Watch for startup errors
- Monitor API request patterns
- Check database connection health

---

## ⚙️ Optional Production Enhancements

### 1. Custom Domain for API
- Register domain (e.g., `api.smartequiz.com`)
- Render: Settings → Custom Domain → Add
- Update DNS CNAME record
- Update `NEXT_PUBLIC_API_URL` in Vercel

### 2. Database Backups
- Render: Database → Backups tab
- Enable automated daily backups

### 3. Rate Limiting Verification
Test rate limits are working:
```bash
# Send 100 requests quickly
for i in {1..100}; do curl https://smart-equiz-api.onrender.com/api/health; done
```

Should get HTTP 429 after threshold.

### 4. Email Service (SendGrid)
For password reset, notifications:
1. Create SendGrid account
2. Verify sender email
3. Generate API key
4. Add to Render:
   ```
   SENDGRID_API_KEY=SG.xxxxx
   SENDGRID_FROM_EMAIL=noreply@smartequiz.com
   ```

### 5. Payment Processing (Stripe)
For subscription features:
1. Create Stripe account
2. Get API keys (test/production)
3. Add to Render:
   ```
   STRIPE_SECRET_KEY=sk_live_xxxxx
   STRIPE_WEBHOOK_SECRET=whsec_xxxxx
   ```

---

## 🚨 Troubleshooting

### API Returns 500 Errors
- Check Render logs for stack traces
- Verify DATABASE_URL is correct
- Check all required env vars are set

### CORS Errors from Frontend
- Verify `FRONTEND_URL` in Render matches Vercel domain exactly
- Check browser DevTools → Console for specific origin

### Slow API Response (15-30 seconds first request)
- **Free tier behavior**: Service sleeps after 15 min inactivity
- **Solution**: Upgrade to Starter plan ($7/mo) or implement keep-alive pings

### Database Connection Errors
- Verify PostgreSQL instance is running (Render dashboard)
- Check `DATABASE_URL` format and credentials
- Ensure API and DB in same region for low latency

### Build Fails on Render
- Check Node.js version compatibility
- Verify all required dependencies in `dependencies` (not devDependencies)
- Check pnpm-lock.yaml is committed

---

## 📈 Success Metrics

Once everything is deployed, you should have:
- ✅ Backend API running on Render with PostgreSQL
- ✅ Marketing site on Vercel with dynamic CMS content
- ✅ Platform admin accessible (if deployed)
- ✅ Tenant app accessible (if deployed)
- ✅ Authentication working end-to-end
- ✅ Swagger docs publicly accessible
- ✅ Health check endpoint responding
- ✅ Error monitoring via Sentry (optional)
- ✅ All CORS configured correctly

**Next Phase**: Test mobile app with production API URL!
