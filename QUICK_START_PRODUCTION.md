# Quick Start - Production Deployment

**Platform**: Smart eQuiz - Multi-Tenant Bible Quiz Platform  
**Status**: ✅ 100% Production Ready + Enterprise Features  
**Last Updated**: December 5, 2025

---

## 🚀 Deploy in 30 Minutes

### Prerequisites
- Stripe account (payment processing)
- SendGrid account (email service)
- Sentry account (error monitoring)
- Hosting accounts (Railway + Vercel recommended)
- Domain name with DNS access

---

## Step 1: External Services (15 min)

### 1.1 Stripe Setup (5 min)
1. Sign up at https://stripe.com
2. Get API keys: Dashboard → Developers → API keys
   - Copy **Secret key** (starts with `sk_live_`)
   - Copy **Publishable key** (starts with `pk_live_`)
3. Create webhook:
   - Dashboard → Developers → Webhooks → Add endpoint
   - URL: `https://api.yourdomain.com/api/stripe/webhooks`
   - Events: `customer.subscription.*`, `invoice.payment.*`
   - Copy **Signing secret** (starts with `whsec_`)

### 1.2 SendGrid Setup (5 min)
1. Sign up at https://sendgrid.com
2. Create API Key: Settings → API Keys → Create API Key
   - Name: "Smart eQuiz Production"
   - Permissions: Full Access
   - Copy the API key
3. Verify domain: Settings → Sender Authentication
   - Add your domain DNS records
   - Verify domain ownership

### 1.3 Sentry Setup (5 min)
1. Sign up at https://sentry.io
2. Create 4 projects:
   - `smart-equiz-api` (Platform: Node.js)
   - `smart-equiz-marketing` (Platform: Next.js)
   - `smart-equiz-admin` (Platform: React)
   - `smart-equiz-tenant` (Platform: React)
3. Copy DSN from each project:
   - Settings → Client Keys (DSN)

---

## Step 2: Deploy Backend API (10 min)

### 2.1 Railway Deployment (Recommended)
1. Sign up at https://railway.app
2. Create new project → Deploy from GitHub
3. Connect repository: `phelmye/Smart-eQuiz-Platform`
4. Configure:
   - Root Directory: `services/api`
   - Build Command: `pnpm install && pnpm build`
   - Start Command: `pnpm start`
5. Add PostgreSQL service (Railway Marketplace)
6. Add environment variables:

```bash
# Database (auto-filled by Railway PostgreSQL)
DATABASE_URL=postgresql://...

# JWT Secrets (generate strong random strings)
JWT_SECRET=<your-secure-random-string>
JWT_REFRESH_SECRET=<your-secure-random-string>

# Server
PORT=3001
NODE_ENV=production

# Stripe (from Step 1.1)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# SendGrid (from Step 1.2)
SENDGRID_API_KEY=SG....
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
SENDGRID_FROM_NAME=Smart eQuiz Platform

# Sentry (from Step 1.3)
SENTRY_DSN=https://...@sentry.io/api-project
SENTRY_ENVIRONMENT=production
SENTRY_TRACES_SAMPLE_RATE=0.1
```

7. Deploy → Wait for build
8. Run migration:
   - Railway CLI: `railway run npx prisma migrate deploy`
   - Or use Railway console

9. Get API URL: `https://your-project.railway.app`

### 2.2 Test API
```bash
curl https://your-api-url.railway.app/api/health
# Should return: {"status":"ok","timestamp":"..."}
```

---

## Step 3: Deploy Frontends (5 min)

### 3.1 Marketing Site (Next.js)
1. Vercel → New Project → Import from GitHub
2. Configure:
   - Root Directory: `apps/marketing-site`
   - Framework: Next.js
3. Environment Variables:
```bash
NEXT_PUBLIC_API_URL=https://your-api-url.railway.app/api
SENTRY_DSN=https://...@sentry.io/marketing-project
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/marketing-project
```
4. Deploy → Set custom domain: `www.yourdomain.com`

### 3.2 Platform Admin (React/Vite)
1. Vercel → New Project → Import from GitHub
2. Configure:
   - Root Directory: `apps/platform-admin`
   - Framework: Vite
   - Build Command: `pnpm build`
   - Output Directory: `dist`
3. Environment Variables:
```bash
VITE_API_URL=https://your-api-url.railway.app/api
VITE_SENTRY_DSN=https://...@sentry.io/admin-project
```
4. Deploy → Set custom domain: `admin.yourdomain.com`

### 3.3 Tenant App (React/Vite)
1. Vercel → New Project → Import from GitHub
2. Configure:
   - Root Directory: `apps/tenant-app`
   - Framework: Vite
   - Build Command: `pnpm build`
   - Output Directory: `dist`
3. Environment Variables:
```bash
VITE_API_URL=https://your-api-url.railway.app/api
VITE_SENTRY_DSN=https://...@sentry.io/tenant-project
```
4. Deploy → Set custom domain: `*.yourdomain.com` (wildcard)

---

## Step 4: Configure DNS (5 min)

Add these DNS records to your domain:

```
Type    Name        Value
A       @           76.76.21.21 (Vercel)
CNAME   www         cname.vercel-dns.com
CNAME   admin       cname.vercel-dns.com
CNAME   *           cname.vercel-dns.com
```

---

## Step 5: Verify (5 min)

### 5.1 Test Marketing Site
- Visit https://www.yourdomain.com
- Check homepage loads
- Test signup form
- Verify navigation

### 5.2 Test Platform Admin
- Visit https://admin.yourdomain.com
- Login with super admin: `super@admin.com` / `SuperAdmin123!`
- Create a test blog post
- Verify content saves to database

### 5.3 Test Tenant App
- Create a tenant via platform admin
- Visit https://yourtenantsubdomain.yourdomain.com
- Test login/signup
- Create a tournament
- Test payment flow (use Stripe test cards)

### 5.4 Test Integrations
- **Stripe**: Make a test subscription
- **SendGrid**: Trigger welcome email
- **Sentry**: Force an error, check Sentry dashboard

---

## 🎯 Post-Deployment

### Create First Tenant
```sql
-- Connect to Railway PostgreSQL
INSERT INTO tenants (id, name, subdomain, plan_id, created_at)
VALUES (
  gen_random_uuid(),
  'Demo Church',
  'demo',
  (SELECT id FROM plans WHERE name = 'Professional' LIMIT 1),
  NOW()
);
```

### Monitor
- **API Health**: https://your-api-url.railway.app/api/health
- **Sentry Errors**: https://sentry.io/organizations/your-org/issues/
- **Railway Logs**: https://railway.app → Your Project → Logs
- **Stripe Dashboard**: https://dashboard.stripe.com

### Backup
- Enable Railway automated backups
- Set up nightly database dumps
- Configure Sentry alerts for critical errors

---

## 🆘 Troubleshooting

### API Won't Start
- Check Railway logs for errors
- Verify DATABASE_URL is set
- Run migration: `npx prisma migrate deploy`

### Frontend Shows API Error
- Verify VITE_API_URL matches Railway URL
- Check CORS settings in API
- Verify API health endpoint works

### Stripe Webhook Fails
- Check webhook URL in Stripe dashboard
- Verify STRIPE_WEBHOOK_SECRET is correct
- Check API logs for webhook errors

### Emails Not Sending
- Verify SendGrid domain is verified
- Check SENDGRID_API_KEY is correct
- Test with SendGrid API directly

---

## 📚 Additional Resources

- **API Documentation**: https://your-api-url.railway.app/api/docs (Swagger)
- **Full Deployment Guide**: `DEPLOYMENT_CHECKLIST.md`
- **Environment Variables**: See `.env.example` files in each app
- **Session 11 Details**: `SESSION_11_IMPLEMENTATION_SUMMARY.md`
- **Project Status**: `PROJECT_STATUS.md`

---

## ✅ Deployment Complete!

Your Smart eQuiz Platform is now live with:
- ✅ Payment processing (Stripe)
- ✅ Email notifications (SendGrid)
- ✅ Error monitoring (Sentry)
- ✅ Multi-tenant architecture
- ✅ E2E test coverage
- ✅ Complete CMS for all content

**Ready to onboard your first customers!** 🎉
