# Backend API - Production Deployment Guide

**Smart eQuiz Platform Backend API**  
**Version:** 2.0  
**Last Updated:** November 23, 2025  
**Status:** Production Ready

---

## Table of Contents

1. [Overview](#overview)
2. [Infrastructure Requirements](#infrastructure-requirements)
3. [Database Setup](#database-setup)
4. [Redis Configuration](#redis-configuration)
5. [Environment Variables](#environment-variables)
6. [Deployment Options](#deployment-options)
7. [Docker Deployment](#docker-deployment)
8. [Database Migrations](#database-migrations)
9. [SSL/TLS Configuration](#ssltls-configuration)
10. [Monitoring & Logging](#monitoring--logging)
11. [Backup Strategy](#backup-strategy)
12. [Security Hardening](#security-hardening)
13. [Performance Optimization](#performance-optimization)
14. [CI/CD Pipeline](#cicd-pipeline)
15. [Health Checks](#health-checks)
16. [Troubleshooting](#troubleshooting)
17. [Cost Estimates](#cost-estimates)
18. [Maintenance Procedures](#maintenance-procedures)

---

## Overview

The Smart eQuiz Platform backend is a NestJS-based REST API that provides:
- Multi-tenant data management
- JWT-based authentication
- Role-based access control (9 roles)
- Real-time tournament processing
- AI question generation integration
- Payment processing via Stripe
- Comprehensive analytics

**Tech Stack:**
- **Framework:** NestJS 9.x
- **Database:** PostgreSQL 14+
- **Cache/Sessions:** Redis 7+
- **ORM:** Prisma 5.x
- **Runtime:** Node.js 18+

---

## Infrastructure Requirements

### Minimum Production Requirements

**API Server:**
- **CPU:** 2 vCPUs
- **RAM:** 4GB
- **Storage:** 20GB SSD
- **Network:** 1Gbps
- **OS:** Ubuntu 22.04 LTS or Docker

**Database Server:**
- **CPU:** 2 vCPUs
- **RAM:** 8GB
- **Storage:** 100GB SSD (auto-scaling)
- **Connections:** 100+ concurrent

**Redis Server:**
- **RAM:** 2GB
- **Persistence:** RDB + AOF
- **Connections:** 50+ concurrent

### Recommended Production Setup

**API Server:**
- **CPU:** 4 vCPUs
- **RAM:** 8GB
- **Storage:** 50GB SSD
- **Auto-scaling:** 2-10 instances

**Database:**
- **Managed Service:** Supabase, Neon, or Railway
- **High Availability:** Multi-AZ replication
- **Automated Backups:** Daily with 30-day retention

**Redis:**
- **Managed Service:** Redis Cloud, Upstash, or AWS ElastiCache
- **Clustering:** Master-replica setup
- **Persistence:** Enabled

---

## Database Setup

### Option 1: Supabase (Recommended)

**Why Supabase?**
- ✅ Free tier: 500MB database, 2GB bandwidth
- ✅ Automatic backups (7 days retention on free tier)
- ✅ SSL/TLS by default
- ✅ PostgreSQL 14+ with extensions
- ✅ Built-in connection pooling (pgBouncer)
- ✅ Real-time subscriptions (optional)
- ✅ Dashboard for management

**Setup Steps:**

```bash
# 1. Create Supabase project at https://app.supabase.com

# 2. Get connection string from Supabase dashboard
# Settings > Database > Connection String > Connection Pooling

# Example connection string:
# postgresql://postgres.xxxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:5432/postgres

# 3. Set environment variable
export DATABASE_URL="postgresql://postgres.xxxxxxxxxxxxx:password@aws-0-us-west-1.pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=1"

# 4. For migrations (direct connection, not pooler)
export DIRECT_DATABASE_URL="postgresql://postgres.xxxxxxxxxxxxx:password@aws-0-us-west-1.pooler.supabase.com:5432/postgres"
```

**Supabase Configuration:**

```yaml
# supabase/config.toml (if using local development)
[db]
port = 5432
shadow_port = 54320
major_version = 14

[db.pooler]
enabled = true
port = 6543
pool_mode = "transaction"
default_pool_size = 20
max_client_conn = 100

[auth]
enabled = false  # We use our own JWT auth

[storage]
enabled = false  # We use Cloudinary for media
```

**Prisma Configuration for Supabase:**

```prisma
// prisma/schema.prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}
```

### Option 2: Neon (Serverless PostgreSQL)

**Why Neon?**
- ✅ Serverless with auto-scaling
- ✅ Generous free tier (0.5GB storage, 191 compute hours/month)
- ✅ Instant branching for testing
- ✅ Auto-suspend when idle (cost savings)
- ✅ Built-in connection pooling

**Setup Steps:**

```bash
# 1. Create Neon project at https://console.neon.tech

# 2. Get connection string
# Neon Console > Connection Details > Connection String

# 3. Set environment variable
export DATABASE_URL="postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

### Option 3: Railway

**Why Railway?**
- ✅ Free tier: $5 credits/month
- ✅ One-click PostgreSQL deployment
- ✅ Automatic backups
- ✅ Easy environment variable management

**Setup Steps:**

```bash
# 1. Create Railway project at https://railway.app

# 2. Add PostgreSQL service from template

# 3. Get DATABASE_URL from Railway dashboard
# Variables tab > DATABASE_URL

# 4. Use in your app
export DATABASE_URL="postgresql://user:password@containers-us-west-xxx.railway.app:7432/railway"
```

### Database Initialization

```bash
cd services/api

# 1. Generate Prisma client
pnpm prisma generate

# 2. Run migrations (creates all tables)
pnpm prisma migrate deploy

# 3. Seed initial data (optional, for demo tenants)
pnpm seed

# 4. Verify connection
pnpm prisma db pull --force
```

---

## Redis Configuration

### Option 1: Upstash (Recommended for Vercel)

**Why Upstash?**
- ✅ Serverless Redis (pay per request)
- ✅ Free tier: 10,000 commands/day
- ✅ Global replication
- ✅ REST API (works with serverless functions)
- ✅ Redis 7.0 compatible

**Setup Steps:**

```bash
# 1. Create Upstash database at https://console.upstash.com

# 2. Get connection details
UPSTASH_REDIS_REST_URL="https://xxxxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN="AxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxQ"

# 3. For traditional Redis client
REDIS_URL="redis://default:password@xxxxx.upstash.io:6379"
```

**Upstash Client Setup (NestJS):**

```typescript
// src/redis/redis.module.ts
import { Module } from '@nestjs/common';
import { Redis } from '@upstash/redis';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: (config: ConfigService) => {
        return new Redis({
          url: config.get('UPSTASH_REDIS_REST_URL'),
          token: config.get('UPSTASH_REDIS_REST_TOKEN'),
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule {}
```

### Option 2: Redis Cloud

**Why Redis Cloud?**
- ✅ Free tier: 30MB storage
- ✅ Managed by Redis Inc (official)
- ✅ High availability options
- ✅ Advanced data structures

**Setup Steps:**

```bash
# 1. Create Redis Cloud account at https://redis.com/try-free

# 2. Create database

# 3. Get connection string
REDIS_URL="redis://default:password@redis-12345.c123.us-east-1-2.ec2.cloud.redislabs.com:12345"
```

### Option 3: AWS ElastiCache (Enterprise)

**For large-scale production:**

```bash
# AWS ElastiCache configuration
REDIS_HOST="smart-equiz-prod.abc123.0001.use1.cache.amazonaws.com"
REDIS_PORT="6379"
REDIS_PASSWORD="your-strong-password"
REDIS_TLS="true"
```

### Redis Usage Patterns

**Session Storage:**
```typescript
// Store user session (1 hour expiry)
await redis.set(`session:${sessionId}`, JSON.stringify(userData), {
  ex: 3600,
});

// Get session
const session = await redis.get(`session:${sessionId}`);
```

**Rate Limiting:**
```typescript
// Rate limit: 100 requests per hour per IP
const key = `ratelimit:${ip}:${hour}`;
const count = await redis.incr(key);
if (count === 1) {
  await redis.expire(key, 3600);
}
return count <= 100;
```

**Caching:**
```typescript
// Cache tournament data (5 minutes)
const cacheKey = `tournament:${tournamentId}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

const tournament = await db.tournament.findUnique({ where: { id } });
await redis.set(cacheKey, JSON.stringify(tournament), { ex: 300 });
```

---

## Environment Variables

### Production .env File

Create `services/api/.env.production`:

```bash
# ===========================
# DATABASE CONFIGURATION
# ===========================
# Supabase connection (with pooling)
DATABASE_URL="postgresql://postgres.xxxxx:password@aws-0-us-west-1.pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=1"

# Direct connection (for migrations)
DIRECT_DATABASE_URL="postgresql://postgres.xxxxx:password@aws-0-us-west-1.pooler.supabase.com:5432/postgres"

# ===========================
# REDIS CONFIGURATION
# ===========================
# Upstash Redis (REST API)
UPSTASH_REDIS_REST_URL="https://xxxxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN="AxxxxxxxxxxxxxxxxxxxxxxxxxxxQ"

# Traditional Redis URL (if not using Upstash)
REDIS_URL="redis://default:password@xxxxx.upstash.io:6379"

# ===========================
# JWT SECRETS (CRITICAL!)
# ===========================
# MUST be strong random strings (64+ characters)
# Generate with: openssl rand -base64 64
JWT_SECRET="your-super-secret-jwt-key-CHANGE-THIS-IN-PRODUCTION-use-strong-random-string"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-CHANGE-THIS-IN-PRODUCTION-use-strong-random-string"

# Token expiry times
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# ===========================
# SERVER CONFIGURATION
# ===========================
NODE_ENV="production"
PORT="3000"
API_URL="https://api.smartequiz.com"

# Frontend URLs (for CORS)
MARKETING_SITE_URL="https://www.smartequiz.com"
PLATFORM_ADMIN_URL="https://admin.smartequiz.com"
TENANT_APP_BASE_URL="https://smartequiz.com"

# Allowed origins (comma-separated)
CORS_ORIGINS="https://www.smartequiz.com,https://admin.smartequiz.com,https://*.smartequiz.com"

# ===========================
# STRIPE PAYMENT INTEGRATION
# ===========================
STRIPE_SECRET_KEY="sk_live_REPLACE_WITH_YOUR_STRIPE_SECRET_KEY"
STRIPE_PUBLISHABLE_KEY="pk_live_REPLACE_WITH_YOUR_STRIPE_PUBLISHABLE_KEY"
STRIPE_WEBHOOK_SECRET="whsec_REPLACE_WITH_YOUR_STRIPE_WEBHOOK_SECRET"

# Product IDs
STRIPE_STARTER_PRICE_ID="price_REPLACE_WITH_YOUR_PRICE_ID"
STRIPE_PROFESSIONAL_PRICE_ID="price_REPLACE_WITH_YOUR_PRICE_ID"
STRIPE_ENTERPRISE_PRICE_ID="price_REPLACE_WITH_YOUR_PRICE_ID"

# ===========================
# EMAIL SERVICE (SendGrid)
# ===========================
SENDGRID_API_KEY="SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
SENDGRID_FROM_EMAIL="noreply@smartequiz.com"
SENDGRID_FROM_NAME="Smart eQuiz Platform"

# Email templates
SENDGRID_WELCOME_TEMPLATE_ID="d-xxxxxxxxxxxxxxxxxxxxx"
SENDGRID_RESET_PASSWORD_TEMPLATE_ID="d-xxxxxxxxxxxxxxxxxxxxx"
SENDGRID_TOURNAMENT_INVITE_TEMPLATE_ID="d-xxxxxxxxxxxxxxxxxxxxx"

# ===========================
# SMS SERVICE (Twilio)
# ===========================
TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_AUTH_TOKEN="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_PHONE_NUMBER="+12345678900"

# ===========================
# AI QUESTION GENERATION
# ===========================
# OpenAI API
OPENAI_API_KEY="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
OPENAI_MODEL="gpt-4"
OPENAI_MAX_TOKENS="2000"

# Alternative: Anthropic Claude
ANTHROPIC_API_KEY="sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# ===========================
# MEDIA STORAGE (Cloudinary)
# ===========================
CLOUDINARY_CLOUD_NAME="smart-equiz"
CLOUDINARY_API_KEY="xxxxxxxxxxxxxxxxxxxxx"
CLOUDINARY_API_SECRET="xxxxxxxxxxxxxxxxxxxxx"

# Upload limits
MAX_FILE_SIZE_MB="10"
ALLOWED_FILE_TYPES="image/jpeg,image/png,image/webp,application/pdf"

# ===========================
# MONITORING & LOGGING
# ===========================
# Sentry Error Tracking
SENTRY_DSN="https://xxxxxxxxxxxxxxxxxxxxxxxxxxxxx@o123456.ingest.sentry.io/123456"
SENTRY_ENVIRONMENT="production"
SENTRY_RELEASE="smart-equiz-api@2.0.0"

# DataDog APM
DATADOG_API_KEY="xxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
DATADOG_APP_KEY="xxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# ===========================
# RATE LIMITING
# ===========================
RATE_LIMIT_PUBLIC="100"         # 100 requests/hour for public endpoints
RATE_LIMIT_AUTHENTICATED="1000" # 1000 requests/hour for authenticated users
RATE_LIMIT_WINDOW_MS="3600000"  # 1 hour in milliseconds

# ===========================
# SECURITY
# ===========================
# Encryption key for sensitive data
ENCRYPTION_KEY="your-32-byte-encryption-key-here-change-in-production"

# CORS configuration
CORS_CREDENTIALS="true"
CORS_MAX_AGE="86400"

# Session configuration
SESSION_SECRET="your-session-secret-change-in-production"
SESSION_MAX_AGE="604800000"  # 7 days in milliseconds

# ===========================
# FEATURE FLAGS
# ===========================
ENABLE_AI_GENERATION="true"
ENABLE_REFERRAL_SYSTEM="true"
ENABLE_SWAGGER_DOCS="false"      # Disable in production for security
ENABLE_DEBUG_LOGS="false"

# ===========================
# BACKUP & MAINTENANCE
# ===========================
BACKUP_ENABLED="true"
BACKUP_SCHEDULE="0 2 * * *"      # Daily at 2 AM UTC
BACKUP_RETENTION_DAYS="30"
BACKUP_S3_BUCKET="smart-equiz-backups"
AWS_ACCESS_KEY_ID="AKIAxxxxxxxxxxxxx"
AWS_SECRET_ACCESS_KEY="xxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
AWS_REGION="us-east-1"

# ===========================
# PERFORMANCE
# ===========================
DATABASE_POOL_MIN="2"
DATABASE_POOL_MAX="10"
REDIS_POOL_MIN="2"
REDIS_POOL_MAX="20"

# Query timeout
DATABASE_QUERY_TIMEOUT="30000"   # 30 seconds

# Cache TTL
CACHE_TTL_SHORT="300"            # 5 minutes
CACHE_TTL_MEDIUM="1800"          # 30 minutes
CACHE_TTL_LONG="86400"           # 24 hours
```

### Environment Variable Validation

Add to `services/api/src/config/env.validation.ts`:

```typescript
import { plainToClass } from 'class-transformer';
import { IsEnum, IsString, IsNumber, validateSync } from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Staging = 'staging',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsString()
  DATABASE_URL: string;

  @IsString()
  JWT_SECRET: string;

  @IsString()
  JWT_REFRESH_SECRET: string;

  @IsNumber()
  PORT: number;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToClass(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
```

---

## Deployment Options

### Option 1: Railway (Recommended for Quick Start)

**Why Railway?**
- ✅ One-click deployment from GitHub
- ✅ Automatic HTTPS
- ✅ Built-in PostgreSQL and Redis
- ✅ Environment variable management
- ✅ Free tier: $5/month credits

**Deploy Steps:**

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login to Railway
railway login

# 3. Initialize project
cd services/api
railway init

# 4. Add PostgreSQL service
railway add postgresql

# 5. Add Redis service
railway add redis

# 6. Set environment variables
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=$(openssl rand -base64 64)
railway variables set JWT_REFRESH_SECRET=$(openssl rand -base64 64)

# 7. Deploy
railway up

# 8. Get deployment URL
railway domain
```

**Railway Configuration File** (`railway.json`):

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "pnpm install && pnpm prisma generate && pnpm build"
  },
  "deploy": {
    "startCommand": "pnpm prisma migrate deploy && pnpm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Option 2: Render

**Setup Steps:**

```yaml
# render.yaml
services:
  - type: web
    name: smart-equiz-api
    env: node
    region: oregon
    plan: starter
    buildCommand: cd services/api && pnpm install && pnpm prisma generate && pnpm build
    startCommand: cd services/api && pnpm prisma migrate deploy && pnpm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: smart-equiz-db
          property: connectionString
      - key: REDIS_URL
        fromService:
          name: smart-equiz-redis
          type: redis
          property: connectionString
      - key: JWT_SECRET
        generateValue: true
      - key: JWT_REFRESH_SECRET
        generateValue: true

databases:
  - name: smart-equiz-db
    databaseName: smart_equiz
    user: smart_equiz_user
    plan: starter

  - name: smart-equiz-redis
    plan: starter
```

### Option 3: Docker + DigitalOcean App Platform

**Dockerfile** (`services/api/Dockerfile`):

```dockerfile
# Base image
FROM node:18-alpine AS base
RUN corepack enable && corepack prepare pnpm@8.10.0 --activate
WORKDIR /app

# Dependencies
FROM base AS dependencies
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/
RUN pnpm install --frozen-lockfile
RUN pnpm prisma generate

# Build
FROM base AS build
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# Production
FROM base AS production
ENV NODE_ENV=production
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY package.json pnpm-lock.yaml ./

EXPOSE 3000

CMD ["sh", "-c", "pnpm prisma migrate deploy && node dist/main.js"]
```

**Build and Deploy:**

```bash
# Build Docker image
cd services/api
docker build -t smart-equiz-api:latest .

# Test locally
docker run -p 3000:3000 \
  -e DATABASE_URL="your-db-url" \
  -e REDIS_URL="your-redis-url" \
  -e JWT_SECRET="your-secret" \
  -e JWT_REFRESH_SECRET="your-refresh-secret" \
  smart-equiz-api:latest

# Push to registry
docker tag smart-equiz-api:latest registry.digitalocean.com/smart-equiz/api:latest
docker push registry.digitalocean.com/smart-equiz/api:latest
```

### Option 4: AWS Elastic Beanstalk (Enterprise)

**Configuration** (`.ebextensions/01-environment.config`):

```yaml
option_settings:
  aws:elasticbeanstalk:container:nodejs:
    NodeCommand: "npm start"
    NodeVersion: 18.x
  
  aws:elasticbeanstalk:application:environment:
    NODE_ENV: production
    PORT: 8080
  
  aws:autoscaling:launchconfiguration:
    InstanceType: t3.medium
  
  aws:autoscaling:asg:
    MinSize: 2
    MaxSize: 10
```

---

## Docker Deployment

### Docker Compose (Full Stack)

**docker-compose.prod.yml:**

```yaml
version: '3.8'

services:
  api:
    build:
      context: ./services/api
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:${DB_PASSWORD}@db:5432/smart_equiz_prod
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=${JWT_SECRET}
      - JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
    depends_on:
      - db
      - redis
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  db:
    image: postgres:14-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=smart_equiz_prod
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - api
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

### NGINX Configuration

**nginx.conf:**

```nginx
events {
    worker_connections 1024;
}

http {
    upstream api {
        server api:3000;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=auth_limit:10m rate=5r/m;

    server {
        listen 80;
        server_name api.smartequiz.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name api.smartequiz.com;

        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        # Security headers
        add_header X-Frame-Options "DENY" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

        # API endpoints
        location /api/ {
            limit_req zone=api_limit burst=20 nodelay;
            
            proxy_pass http://api;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }

        # Auth endpoints (stricter rate limit)
        location /api/auth/ {
            limit_req zone=auth_limit burst=5 nodelay;
            proxy_pass http://api;
        }

        # Health check (no rate limit)
        location /api/health {
            proxy_pass http://api;
            access_log off;
        }
    }
}
```

---

## Database Migrations

### Migration Workflow

```bash
cd services/api

# 1. Create new migration (development)
pnpm prisma migrate dev --name add_feature_x

# 2. Review generated SQL
cat prisma/migrations/20251123_add_feature_x/migration.sql

# 3. Test migration on staging database
DATABASE_URL="your-staging-db-url" pnpm prisma migrate deploy

# 4. Deploy to production
DATABASE_URL="your-production-db-url" pnpm prisma migrate deploy

# 5. Verify migration status
pnpm prisma migrate status
```

### Production Migration Safety

**Pre-Migration Checklist:**
- [ ] Backup database before migration
- [ ] Test migration on staging environment
- [ ] Review SQL for breaking changes
- [ ] Schedule during low-traffic window
- [ ] Notify team of planned downtime (if any)
- [ ] Have rollback plan ready

**Safe Migration Practices:**

```sql
-- ❌ DANGEROUS: Dropping columns without data migration
ALTER TABLE "tournaments" DROP COLUMN "old_field";

-- ✅ SAFE: Multi-step migration
-- Step 1: Add new column (nullable)
ALTER TABLE "tournaments" ADD COLUMN "new_field" TEXT;

-- Step 2: Migrate data (run separately)
UPDATE "tournaments" SET "new_field" = "old_field";

-- Step 3: Make NOT NULL (after data migration)
ALTER TABLE "tournaments" ALTER COLUMN "new_field" SET NOT NULL;

-- Step 4: Drop old column (final step)
ALTER TABLE "tournaments" DROP COLUMN "old_field";
```

### Rollback Procedures

```bash
# List migrations
pnpm prisma migrate status

# Rollback to specific migration
pnpm prisma migrate resolve --rolled-back 20251123_add_feature_x

# Restore from backup (if needed)
pg_restore -h your-host -U postgres -d smart_equiz_prod backup_file.dump
```

---

## SSL/TLS Configuration

### Let's Encrypt (Free SSL)

```bash
# Install Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d api.smartequiz.com

# Auto-renewal (cron job)
0 0 1 * * certbot renew --quiet
```

### Managed SSL (Railway/Vercel)

Most platforms provide automatic SSL:
- **Railway:** Automatic HTTPS for all deployments
- **Render:** Free SSL certificates
- **Vercel:** Automatic SSL for all domains

---

## Monitoring & Logging

### Sentry Integration

```typescript
// src/sentry.ts
import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  release: 'smart-equiz-api@2.0.0',
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
  integrations: [
    new ProfilingIntegration(),
  ],
});

// src/main.ts
import './sentry';

// Error filter
app.useGlobalFilters(new SentryFilter());
```

**Install Sentry:**

```bash
cd services/api
pnpm add @sentry/node@^7.0.0 @sentry/profiling-node
```

### Health Check Endpoint

```typescript
// src/health/health.controller.ts
import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async check() {
    const start = Date.now();
    
    // Database check
    const dbHealthy = await this.checkDatabase();
    
    // Redis check
    const redisHealthy = await this.checkRedis();
    
    const latency = Date.now() - start;
    
    return {
      status: dbHealthy && redisHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      latency,
      services: {
        database: dbHealthy ? 'up' : 'down',
        redis: redisHealthy ? 'up' : 'down',
      },
      version: '2.0.0',
    };
  }

  private async checkDatabase(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }

  private async checkRedis(): Promise<boolean> {
    // Implement Redis ping check
    return true;
  }
}
```

### Logging Best Practices

```typescript
// Use Winston for structured logging
import { Logger } from '@nestjs/common';

const logger = new Logger('TournamentService');

logger.log('Tournament created', {
  tournamentId: tournament.id,
  tenantId: tenant.id,
  participantCount: participants.length,
});

logger.error('Failed to create tournament', error.stack, {
  tenantId: tenant.id,
  error: error.message,
});
```

---

## Backup Strategy

### Automated Database Backups

**PostgreSQL Backup Script** (`scripts/backup-db.sh`):

```bash
#!/bin/bash

# Configuration
BACKUP_DIR="/backups/postgres"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/backup_${TIMESTAMP}.sql.gz"
RETENTION_DAYS=30

# Create backup directory
mkdir -p ${BACKUP_DIR}

# Perform backup
pg_dump ${DATABASE_URL} | gzip > ${BACKUP_FILE}

# Upload to S3
aws s3 cp ${BACKUP_FILE} s3://smart-equiz-backups/postgres/

# Delete old backups
find ${BACKUP_DIR} -name "backup_*.sql.gz" -mtime +${RETENTION_DAYS} -delete

echo "Backup completed: ${BACKUP_FILE}"
```

**Cron Job:**

```cron
# Daily backup at 2 AM UTC
0 2 * * * /app/scripts/backup-db.sh >> /var/log/backup.log 2>&1
```

### Redis Persistence

**redis.conf:**

```conf
# RDB snapshots
save 900 1      # Save after 900 seconds if 1 key changed
save 300 10     # Save after 300 seconds if 10 keys changed
save 60 10000   # Save after 60 seconds if 10000 keys changed

# AOF persistence
appendonly yes
appendfsync everysec
```

---

## Security Hardening

### Security Checklist

- [x] Strong JWT secrets (64+ characters)
- [x] HTTPS/TLS enforced
- [x] Rate limiting enabled
- [x] CORS properly configured
- [x] SQL injection prevention (Prisma ORM)
- [x] XSS protection headers
- [x] CSRF tokens
- [ ] Web Application Firewall (WAF)
- [ ] DDoS protection (Cloudflare)
- [ ] Security audit completed
- [ ] Penetration testing

### Helmet.js Security Headers

```bash
pnpm add helmet
```

```typescript
// src/main.ts
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));
```

---

## Performance Optimization

### Database Optimization

**Connection Pooling:**

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  
  // Connection pool settings
  connection_limit = 10
}
```

**Indexing:**

```prisma
model Tournament {
  @@index([tenantId, status])
  @@index([createdAt])
}

model Question {
  @@index([tenantId, category])
  @@index([difficulty])
}
```

### Redis Caching Strategy

```typescript
// Cache frequently accessed data
const CACHE_TTL = {
  TENANT: 1800,        // 30 minutes
  TOURNAMENT: 300,     // 5 minutes
  QUESTION: 3600,      // 1 hour
  LEADERBOARD: 60,     // 1 minute
};

async getTournament(id: string) {
  const cacheKey = `tournament:${id}`;
  
  // Check cache
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);
  
  // Query database
  const tournament = await db.tournament.findUnique({ where: { id } });
  
  // Store in cache
  await redis.set(
    cacheKey,
    JSON.stringify(tournament),
    'EX',
    CACHE_TTL.TOURNAMENT
  );
  
  return tournament;
}
```

---

## CI/CD Pipeline

### GitHub Actions Workflow

**.github/workflows/deploy-api.yml:**

```yaml
name: Deploy API to Production

on:
  push:
    branches:
      - main
    paths:
      - 'services/api/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install pnpm
        run: corepack enable && corepack prepare pnpm@8.10.0 --activate
      
      - name: Install dependencies
        run: cd services/api && pnpm install --frozen-lockfile
      
      - name: Run tests
        run: cd services/api && pnpm test
      
      - name: Build
        run: cd services/api && pnpm build
      
      - name: Deploy to Railway
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
        run: |
          npm install -g @railway/cli
          railway up --service api
```

---

## Health Checks

### Uptime Monitoring

Use services like:
- **UptimeRobot** (free tier: 50 monitors)
- **Pingdom**
- **StatusCake**

**Monitor URLs:**
- `https://api.smartequiz.com/api/health`
- `https://api.smartequiz.com/api/auth/health`

---

## Troubleshooting

### Common Issues

**Issue: Database connection timeout**

```bash
# Check connection
psql ${DATABASE_URL}

# Verify pool settings
# Reduce connection_limit if using serverless
```

**Issue: Redis connection failed**

```bash
# Test Redis connection
redis-cli -u ${REDIS_URL} ping

# Check firewall rules
```

**Issue: High memory usage**

```bash
# Monitor Node.js memory
node --max-old-space-size=4096 dist/main.js

# Enable heap snapshots for analysis
```

---

## Cost Estimates

### Monthly Operating Costs

**Infrastructure:**
- **API Hosting (Railway Starter):** $5-20/month
- **PostgreSQL (Supabase Pro):** $25/month (or free tier)
- **Redis (Upstash):** $10/month (or free tier)
- **SSL Certificates:** Free (Let's Encrypt)
- **Monitoring (Sentry):** Free tier (or $26/month)
- **Email (SendGrid):** $15/month (40K emails)
- **Total Infrastructure:** $60-96/month

**Growth Tier (1000+ users):**
- **API Hosting:** $50/month
- **Database:** $50/month
- **Redis:** $30/month
- **Total:** $130/month

---

## Maintenance Procedures

### Weekly Tasks
- [ ] Review error logs in Sentry
- [ ] Check database performance metrics
- [ ] Monitor disk usage
- [ ] Review security alerts

### Monthly Tasks
- [ ] Update dependencies
- [ ] Review and optimize slow queries
- [ ] Check backup integrity
- [ ] Review API usage patterns
- [ ] Update SSL certificates (if manual)

### Quarterly Tasks
- [ ] Security audit
- [ ] Performance optimization review
- [ ] Cost analysis and optimization
- [ ] Disaster recovery drill

---

## Conclusion

This guide provides a comprehensive roadmap for deploying the Smart eQuiz Platform backend API to production. Choose deployment options based on your budget, scale, and expertise:

- **Quick Start:** Railway + Supabase + Upstash (all free tiers available)
- **Recommended:** Railway + Supabase Pro + Redis Cloud ($60-90/month)
- **Enterprise:** AWS/GCP with managed services ($200+/month)

All configurations prioritize security, performance, and reliability while maintaining cost-effectiveness.

---

**Document Version:** 1.0  
**Last Updated:** November 23, 2025  
**Maintained By:** Smart eQuiz Platform Team
