# Backend API Deployment Guide

## Render.com Deployment (Recommended)

### Step 1: Create Render Account
1. Go to https://render.com
2. Sign up with GitHub
3. Authorize access to your repository

### Step 2: Create PostgreSQL Database
1. From Render Dashboard, click **New +** → **PostgreSQL**
2. Settings:
   - **Name**: `smart-equiz-db`
   - **Database**: `smart_equiz_prod`
   - **User**: `smart_equiz_user` (auto-generated)
   - **Region**: Choose closest to your users
   - **Plan**: **Free** (or Starter $7/mo for more resources)
3. Click **Create Database**
4. Wait 2-3 minutes for provisioning
5. **Copy the Internal Database URL** from the database page:
   ```
   postgresql://smart_equiz_user:XXXXX@dpg-xxxxx.oregon-postgres.render.com/smart_equiz_prod
   ```

### Step 3: Create Web Service
1. From Dashboard, click **New +** → **Web Service**
2. Connect Repository:
   - Click **Configure Account** if needed
   - Select: `phelmye/Smart-eQuiz-Platform`
3. Configure Service:
   - **Name**: `smart-equiz-api`
   - **Region**: Same as database
   - **Branch**: `main`
   - **Root Directory**: `services/api`
   - **Runtime**: `Node`
   - **Build Command**:
     ```bash
     npm install && npx prisma generate && npm run build
     ```
   - **Start Command**:
     ```bash
     npx prisma migrate deploy && npm start
     ```
   - **Plan**: **Free** (spins down after 15 min inactivity) or **Starter $7/mo** (always on)

### Step 4: Add Environment Variables
In the web service settings, go to **Environment** tab and add:

```bash
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://smart_equiz_user:XXXXX@dpg-xxxxx.oregon-postgres.render.com/smart_equiz_prod
JWT_SECRET=your-super-secret-jwt-key-min-32-chars-long
JWT_REFRESH_SECRET=your-super-secret-refresh-key-different-from-jwt
FRONTEND_URL=https://smart-equiz-platform.vercel.app
```

**Generate secure secrets** (run in PowerShell):
```powershell
# JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# JWT_REFRESH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 5: Deploy
1. Click **Create Web Service**
2. Render will:
   - Clone your repo
   - Install dependencies
   - Generate Prisma client
   - Build NestJS app
   - Run database migrations
   - Start server
3. Watch logs for "Application is running on: http://[::]:3000"
4. **Copy your API URL** from the dashboard:
   ```
   https://smart-equiz-api.onrender.com
   ```

### Step 6: Test Deployment
Open in browser:
```
https://smart-equiz-api.onrender.com/api/health
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "2025-12-15T...",
  "uptime": 123.456
}
```

### Step 7: Update Frontend Environment Variables
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add:
   - **Key**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://smart-equiz-api.onrender.com`
   - **Environments**: Production, Preview, Development
3. Click **Save**
4. Redeploy: Deployments → Latest → ⋯ → Redeploy

---

## Railway.app Deployment (Alternative)

### Step 1: Create Railway Account
1. Go to https://railway.app
2. Sign up with GitHub

### Step 2: Create New Project
1. Click **New Project**
2. Select **Deploy from GitHub repo**
3. Choose: `phelmye/Smart-eQuiz-Platform`
4. Railway will detect monorepo structure

### Step 3: Add PostgreSQL
1. In your project, click **+ New**
2. Select **Database** → **PostgreSQL**
3. Railway auto-creates `DATABASE_URL` environment variable

### Step 4: Configure API Service
1. Click on your API service
2. **Settings**:
   - Root Directory: `services/api`
   - Build Command: (auto-detected from Dockerfile)
   - Start Command: (auto-detected from Dockerfile)
3. **Variables** → Add:
   ```
   NODE_ENV=production
   JWT_SECRET=[generate with crypto]
   JWT_REFRESH_SECRET=[generate with crypto]
   FRONTEND_URL=https://smart-equiz-platform.vercel.app
   ```

### Step 5: Deploy
Railway auto-deploys when you push to GitHub

### Step 6: Get Service URL
1. Click on API service
2. Settings → Generate Domain
3. Copy URL: `https://smart-equiz-api.up.railway.app`

---

## Environment Variables Reference

### Required Variables
```bash
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:pass@host:5432/dbname
JWT_SECRET=minimum-32-character-secret-key
JWT_REFRESH_SECRET=different-minimum-32-character-secret
FRONTEND_URL=https://your-frontend.vercel.app
```

### Optional (for full features)
```bash
# Payment Processing
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email Notifications
SENDGRID_API_KEY=SG....
SENDGRID_FROM_EMAIL=noreply@smartequiz.com

# Error Monitoring
SENTRY_DSN=https://...@sentry.io/...
```

---

## Post-Deployment Checklist

- [ ] Health check endpoint working: `/api/health`
- [ ] Swagger docs accessible: `/api/docs`
- [ ] Database migrations applied successfully
- [ ] Can create test user via `/api/auth/register`
- [ ] Frontend environment variable updated in Vercel
- [ ] Frontend redeployed to use new API URL
- [ ] Test login flow from frontend
- [ ] Monitor logs for errors (first 24 hours)

---

## Troubleshooting

### Build Fails: "Prisma schema not found"
**Solution**: Ensure Root Directory is set to `services/api` in hosting platform

### "Cannot connect to database"
**Solution**: 
- Check `DATABASE_URL` format: `postgresql://user:pass@host:5432/dbname`
- For Render: Use **Internal Database URL**, not External
- Ensure database and API service in same region

### "Application failed to start"
**Solution**: Check logs for:
- Missing environment variables
- Database connection errors
- Port binding issues (use `PORT` env var, not hardcoded)

### CORS Errors from Frontend
**Solution**: Update `FRONTEND_URL` to match your Vercel domain exactly

### Free Tier Spin Down (Render)
**Behavior**: Free services sleep after 15 min inactivity, wake on first request (15-30 sec delay)
**Solution**: Upgrade to Starter plan ($7/mo) for always-on service

---

## Cost Estimates

### Render.com
- **Free Tier**: $0/month (750 hours, sleeps after 15 min)
- **Starter**: $7/month (always on, 512MB RAM)
- **PostgreSQL Free**: $0/month (1GB storage, limited connections)
- **PostgreSQL Starter**: $7/month (10GB storage)

**Recommended for production**: Starter API + Starter DB = **$14/month**

### Railway.app
- **Free**: $5 credit/month (good for dev/testing)
- **Production**: ~$10-20/month depending on usage

### Vercel (Not Recommended for NestJS)
- Serverless pricing, ~$20/month for moderate traffic
- No WebSocket support

---

## Next Steps After Deployment

1. **Set up monitoring**: Add Sentry DSN for error tracking
2. **Configure payments**: Add Stripe keys for subscriptions
3. **Email service**: Add SendGrid for notifications
4. **Custom domain**: Point `api.smartequiz.com` to your service
5. **Backup strategy**: Enable automated backups on database
6. **Rate limiting**: Verify throttling works in production
7. **SSL**: Verify HTTPS endpoints working (auto-configured)

---

## Support Resources

- **Render Docs**: https://render.com/docs
- **Railway Docs**: https://docs.railway.app
- **Prisma Deployment**: https://www.prisma.io/docs/guides/deployment
- **NestJS Production**: https://docs.nestjs.com/faq/serverless
