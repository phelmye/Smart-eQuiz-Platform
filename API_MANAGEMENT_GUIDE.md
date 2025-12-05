# API Management Developer Guide

**Version:** 1.0  
**Last Updated:** November 24, 2025  
**Status:** Production Ready

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Getting Started](#getting-started)
4. [Tenant Usage Guide](#tenant-usage-guide)
5. [Platform Admin Guide](#platform-admin-guide)
6. [API Reference](#api-reference)
7. [Webhook Integration](#webhook-integration)
8. [Security Best Practices](#security-best-practices)
9. [Troubleshooting](#troubleshooting)

---

## Overview

The Smart eQuiz API Management system enables tenants to programmatically access their data through a RESTful API. This system provides:

- **API Key Management**: Create and manage API keys with granular permissions
- **Usage Analytics**: Monitor API consumption, performance, and errors
- **Webhook Configuration**: Receive real-time event notifications
- **Rate Limiting**: Automatic throttling based on subscription plan
- **Platform Governance**: Super admin oversight and controls

### Key Features

✅ **Multi-Tenant Isolation**: Complete data separation per tenant  
✅ **Scope-Based Permissions**: Granular control over API access  
✅ **HMAC Webhook Signatures**: Secure event delivery verification  
✅ **Plan-Based Rate Limits**: Fair usage enforcement  
✅ **Comprehensive Analytics**: Request volume, success rates, performance metrics  
✅ **Interactive Documentation**: Code examples in multiple languages

---

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────┐
│                  TENANT APPLICATIONS                 │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │ Mobile App   │  │ Web App      │  │ 3rd Party │ │
│  └──────┬───────┘  └──────┬───────┘  └─────┬─────┘ │
│         │                 │                 │       │
│         └─────────────────┴─────────────────┘       │
└─────────────────────┬───────────────────────────────┘
                      │ API Key Authentication
                      ▼
┌─────────────────────────────────────────────────────┐
│              API MANAGEMENT SYSTEM                   │
│  ┌────────────────────────────────────────────────┐ │
│  │  NestJS Backend                                │ │
│  │  • ApiKeyGuard (Authentication)                │ │
│  │  • RateLimitGuard (Throttling)                 │ │
│  │  • TenantGuard (Isolation)                     │ │
│  │  • ApiLoggingInterceptor                       │ │
│  └────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────┐ │
│  │  Services                                      │ │
│  │  • ApiKeyService (CRUD, validation)            │ │
│  │  • WebhookService (Event delivery)             │ │
│  │  • ApiLogService (Analytics)                   │ │
│  └────────────────────────────────────────────────┘ │
└─────────────────────┬───────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│              POSTGRESQL DATABASE                     │
│  • api_keys (hashed keys, scopes)                   │
│  • api_logs (request/response data)                 │
│  • webhooks (endpoint configuration)                │
│  • webhook_deliveries (delivery logs)               │
└─────────────────────────────────────────────────────┘
```

### Database Schema

**Key Tables:**

1. **api_keys** - API key storage with bcrypt hashing
2. **api_logs** - Request/response logging for analytics
3. **webhooks** - Webhook endpoint configuration
4. **webhook_deliveries** - Delivery attempt tracking

See `services/api/prisma/schema.prisma` for complete schema.

---

## Getting Started

### For Tenant Administrators

#### 1. Access API Management Dashboard

Navigate to **Dashboard → API Management** in your tenant application.

#### 2. Create Your First API Key

1. Click **"Create API Key"**
2. Fill in details:
   - **Name**: Descriptive identifier (e.g., "Production Mobile App")
   - **Type**: SECRET (for server-side), PUBLIC (for client-side), TEST (for development)
   - **Scopes**: Select permissions needed (users:read, tournaments:write, etc.)
   - **Rate Limit**: Requests per minute (default based on plan)
3. Click **"Create API Key"**
4. **CRITICAL**: Copy the full API key immediately - it's only shown once!

```
Example Key: api_sec_live_K8jN2pQrT4vXyZ9m
```

#### 3. Test Your API Key

```bash
curl -X GET "https://api.smartequiz.com/v1/users" \
  -H "Authorization: Bearer api_sec_live_K8jN2pQrT4vXyZ9m" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "data": [
    {
      "id": "user_123",
      "email": "john@example.com",
      "name": "John Doe",
      "role": "participant"
    }
  ]
}
```

---

## Tenant Usage Guide

### Creating API Keys

**Key Types:**

- **SECRET**: For backend/server applications (full access to selected scopes)
- **PUBLIC**: For frontend/client applications (read-only, limited scopes)
- **TEST**: For development/staging environments (separate quota)

**Available Scopes:**

```typescript
// Users
users:read          // View user profiles
users:write         // Create/update users
users:delete        // Delete users

// Tournaments
tournaments:read    // View tournaments
tournaments:write   // Create/update tournaments
tournaments:admin   // Full tournament control

// Questions
questions:read      // View question bank
questions:write     // Create/update questions

// Analytics
analytics:read      // Access reports

// Payments
payments:read       // View transactions
payments:process    // Process payments

// Webhooks
webhooks:manage     // Manage webhook subscriptions

// Full Access
admin:full          // All permissions
```

### Managing API Keys

**Revoke a Key:**

1. Click **Revoke** button next to the key
2. Provide a reason (e.g., "Key compromised")
3. Confirm revocation

**Note**: Revocation is immediate and cannot be undone.

**Delete a Key:**

Permanently removes the key and all associated logs. Only delete keys that are no longer needed.

### Monitoring Usage

**Analytics Dashboard** provides:

- **Request Volume**: Daily/weekly/monthly trends
- **Success Rate**: Percentage of successful requests
- **Response Times**: Average, P50, P95, P99
- **Top Endpoints**: Most frequently accessed routes
- **Status Codes**: Distribution of HTTP responses
- **Error Analysis**: Failed request breakdown

**Export Reports:**

Click **Export** to download CSV reports for:
- Billing reconciliation
- Performance analysis
- Compliance audits

### Setting Up Webhooks

**1. Create Webhook:**

```javascript
{
  "url": "https://your-app.com/webhooks",
  "description": "Production webhook handler",
  "events": [
    "TOURNAMENT_CREATED",
    "TOURNAMENT_STARTED",
    "PAYMENT_SUCCEEDED"
  ],
  "retryAttempts": 3,
  "timeout": 30000
}
```

**2. Verify Webhook Signatures:**

All webhooks include HMAC-SHA256 signature in header:

```
X-SmartEquiz-Signature: sha256=abc123...
X-SmartEquiz-Event: TOURNAMENT_CREATED
X-SmartEquiz-Delivery-ID: uuid
```

**Node.js Verification:**

```javascript
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const expected = 'sha256=' + crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}
```

**3. Handle Events:**

```javascript
app.post('/webhooks', (req, res) => {
  const signature = req.headers['x-smartequiz-signature'];
  const secret = process.env.WEBHOOK_SECRET;
  
  if (!verifyWebhook(req.body, signature, secret)) {
    return res.status(401).send('Invalid signature');
  }
  
  const { type, data } = req.body;
  
  switch (type) {
    case 'TOURNAMENT_CREATED':
      console.log('New tournament:', data.tournament_id);
      break;
    case 'PAYMENT_SUCCEEDED':
      console.log('Payment received:', data.amount);
      break;
  }
  
  res.status(200).send('OK');
});
```

---

## Platform Admin Guide

### Accessing API Governance Dashboard

Navigate to **Platform Admin → API Governance**

### Monitoring Platform-Wide Usage

**Overview Metrics:**

- **Total API Requests**: Platform-wide across all tenants
- **Active Tenants**: Number of tenants using API
- **Success Rate**: Platform health indicator
- **Average Response Time**: Performance metric

**Top Tenants View:**

Monitor high-volume consumers for:
- Revenue attribution
- Resource planning
- Upsell opportunities
- Fair usage enforcement

**Security Alerts:**

Automatic alerts for:
- **Rate Limit Approaching**: Tenant nearing quota (95%)
- **Error Spike**: Sudden increase in failed requests
- **Suspicious Activity**: Unusual IP, geographic location, or usage pattern

### Governance Actions

**Set Global Rate Limits:**

Override individual tenant limits for emergency throttling.

**Audit All API Keys:**

Review all active keys across tenants for security compliance.

**Block Tenant API Access:**

Emergency shutdown for policy violations or security threats.

---

## API Reference

### Authentication

**Header:**
```
Authorization: Bearer YOUR_API_KEY
```

**Example:**
```bash
curl -H "Authorization: Bearer api_sec_live_K8jN2pQrT4vXyZ9m" \
     https://api.smartequiz.com/v1/users
```

### Rate Limits

**Plans:**

| Plan       | Per Minute | Per Day   |
|------------|------------|-----------|
| Starter    | 60         | 10,000    |
| Pro        | 600        | 100,000   |
| Enterprise | 6,000      | 1,000,000 |

**Headers:**

```
X-RateLimit-Limit: 600
X-RateLimit-Remaining: 599
X-RateLimit-Reset: 1706097600000
```

**429 Response:**

```json
{
  "error": "Rate limit exceeded",
  "message": "You have exceeded your rate limit. Please try again later.",
  "retryAfter": 60
}
```

### Endpoints

**Users:**

```
GET    /v1/users          # List users
GET    /v1/users/:id      # Get user
POST   /v1/users          # Create user
PUT    /v1/users/:id      # Update user
DELETE /v1/users/:id      # Delete user
```

**Tournaments:**

```
GET    /v1/tournaments           # List tournaments
GET    /v1/tournaments/:id       # Get tournament
POST   /v1/tournaments           # Create tournament
PUT    /v1/tournaments/:id       # Update tournament
POST   /v1/tournaments/:id/start # Start tournament
```

**Questions:**

```
GET    /v1/questions      # List questions
GET    /v1/questions/:id  # Get question
POST   /v1/questions      # Create question
PUT    /v1/questions/:id  # Update question
```

**Analytics:**

```
GET    /v1/analytics/usage        # Usage statistics
GET    /v1/analytics/performance  # Performance metrics
```

---

## Webhook Integration

### Available Events

| Event                   | Trigger                          |
|------------------------|----------------------------------|
| USER_CREATED           | New user account created         |
| USER_UPDATED           | User profile updated             |
| USER_DELETED           | User account deleted             |
| TOURNAMENT_CREATED     | New tournament created           |
| TOURNAMENT_STARTED     | Tournament begins                |
| TOURNAMENT_COMPLETED   | Tournament ends                  |
| TOURNAMENT_CANCELLED   | Tournament cancelled             |
| MATCH_STARTED          | Match begins                     |
| MATCH_COMPLETED        | Match ends                       |
| PAYMENT_SUCCEEDED      | Payment processed successfully   |
| PAYMENT_FAILED         | Payment failed                   |
| QUESTION_CREATED       | New question added               |
| QUESTION_UPDATED       | Question modified                |
| TICKET_CREATED         | Support ticket opened            |
| TICKET_RESOLVED        | Support ticket closed            |
| TICKET_ESCALATED       | Support ticket escalated         |

### Payload Format

```json
{
  "id": "evt_abc123",
  "type": "TOURNAMENT_CREATED",
  "timestamp": "2025-11-24T10:30:00Z",
  "data": {
    "tournament_id": "tour_xyz789",
    "name": "Spring Championship 2025",
    "start_date": "2025-12-01T09:00:00Z",
    "tenant_id": "tenant_123"
  }
}
```

### Retry Logic

- **Attempts**: 3 retries by default (configurable)
- **Backoff**: Exponential (1min, 5min, 15min)
- **Timeout**: 30 seconds per attempt
- **Auto-Pause**: After 10 consecutive failures

---

## Security Best Practices

### API Key Security

✅ **DO:**
- Store keys in environment variables
- Use different keys for dev/staging/production
- Rotate keys every 90 days
- Revoke compromised keys immediately
- Use minimum required scopes
- Enable IP whitelisting for production keys

❌ **DON'T:**
- Commit keys to version control
- Expose keys in client-side code
- Share keys between applications
- Use production keys in development
- Grant `admin:full` scope unless necessary

### Webhook Security

✅ **DO:**
- Verify HMAC signatures on ALL webhooks
- Use HTTPS endpoints only
- Implement idempotency using `eventId`
- Log all webhook deliveries
- Rate limit webhook endpoints

❌ **DON'T:**
- Trust webhook payloads without verification
- Expose webhook secrets
- Process duplicate events
- Block webhook handler thread

---

## Troubleshooting

### Common Issues

#### 1. "Invalid API Key" Error

**Causes:**
- Key was revoked
- Key has expired
- Incorrect key format
- Key not in Authorization header

**Solution:**
```bash
# Verify header format
curl -H "Authorization: Bearer api_sec_live_YOUR_KEY" ...

# Check key status in dashboard
# Create new key if revoked/expired
```

#### 2. "Insufficient Permissions" Error

**Causes:**
- Missing required scope
- Using PUBLIC key for write operations

**Solution:**
- Review API key scopes in dashboard
- Add required scope (e.g., `users:write`)
- Use SECRET key for write operations

#### 3. Rate Limit Exceeded

**Causes:**
- Too many requests in time window
- Exceeded daily quota

**Solution:**
```javascript
// Implement exponential backoff
async function makeRequestWithRetry(url, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    const res = await fetch(url);
    
    if (res.status !== 429) return res;
    
    const retryAfter = res.headers.get('Retry-After');
    await new Promise(r => setTimeout(r, retryAfter * 1000));
  }
  throw new Error('Max retries exceeded');
}
```

#### 4. Webhook Signature Verification Failed

**Causes:**
- Using wrong secret
- Modifying payload before verification
- Not using raw request body

**Solution:**
```javascript
// Use raw body for verification
app.use('/webhooks', express.raw({ type: 'application/json' }));

app.post('/webhooks', (req, res) => {
  const rawBody = req.body.toString();
  const signature = req.headers['x-smartequiz-signature'];
  
  // Verify against raw body, not parsed JSON
  const valid = verifySignature(rawBody, signature, secret);
});
```

#### 5. Slow Response Times

**Causes:**
- Large dataset query without pagination
- Missing database indexes
- Network latency

**Solution:**
```bash
# Use pagination
curl "https://api.smartequiz.com/v1/users?page=1&limit=20"

# Filter results
curl "https://api.smartequiz.com/v1/tournaments?status=active&limit=10"
```

---

## Support

**Documentation:** https://docs.smartequiz.com/api  
**Status Page:** https://status.smartequiz.com  
**Support Email:** api-support@smartequiz.com  
**Emergency:** support@smartequiz.com

---

**Last Updated:** November 24, 2025  
**Version:** 1.0.0  
**Maintainer:** Smart eQuiz Platform Team
