# Phase 14 SaaS Admin Features - Quick Reference

## 🚀 Quick Start

**Dev Server:** http://localhost:5173/

**Login Credentials:**
- Super Admin: `superadmin@platform.com` (any password)
- Org Admin: `admin@church.com` (any password)
- Regular User: `user@church.com` (any password)

---

## 📍 Navigation Paths

All Phase 14 features are located under **System** in the admin sidebar:

```
Dashboard
├── System (super_admin only)
│   ├── Tenants
│   ├── Usage Monitoring          ← NEW
│   ├── System Health             ← NEW
│   ├── Invoice Generator         ← NEW
│   ├── Dunning Management        ← NEW
│   ├── Plans
│   ├── Branding
│   └── Theme
```

---

## 🎯 Feature Overview

### 1. Usage Monitoring Dashboard
**Path:** System → Usage Monitoring

**What it does:** Real-time monitoring of tenant resource consumption

**Key Actions:**
- View tenant health scores (0-100)
- Filter by health status (All/Healthy/Warning/Critical)
- Check resource usage (users, tournaments, storage)
- View active alerts
- Export usage report

**Health Score Formula:**
```
Health = 100 - (
  (users_percentage × 0.40) +
  (tournaments_percentage × 0.30) +
  (storage_percentage × 0.30)
)
```

**Alert Thresholds:**
- ⚠️ Warning: 75% of limit
- 🚨 Critical: 90% of limit

---

### 2. System Health Monitor
**Path:** System → System Health

**What it does:** Monitor platform infrastructure health

**Monitored Services:**
1. API Server
2. Database
3. Storage Service
4. Email Service
5. Payment Gateway

**Auto-refresh:** Every 60 seconds

**Overall Status:**
- 🟢 Operational: All services healthy
- 🟡 Degraded: 1-2 services unhealthy
- 🔴 Outage: 3+ services unhealthy

**Metrics Displayed:**
- Average response time (ms)
- Error rate (%)
- Active connections
- Requests per minute
- 24-hour uptime %

---

### 3. Invoice Generator
**Path:** System → Invoice Generator

**What it does:** Automated invoice generation and distribution

**Main Actions:**

#### Generate Invoices
```
Click "Generate Invoices" → Wait 2s → Invoices created
```

#### Preview Invoice
```
Click "Preview" on any invoice → View full invoice details
```

#### Send Invoice
```
Click "Send" on scheduled/draft invoice → Email sent → Status: Sent
```

#### Download Invoice
```
Click download icon → PDF download triggered (simulated)
```

#### Configure Settings
```
Click "Settings" → Modify configuration → Save Settings
```

**Configuration Options:**
- **Generation Day:** 1-28 (day of month)
- **Days Before Due:** 0-30 (advance notice)
- **Payment Terms:** 1-90 days (until due)
- **Tax Rate:** 0-100%
- **Email Template:** Default/Professional/Minimal
- **Auto-Retry:** Enable/Disable failed email retries
- **Notifications:** Enable/Disable admin alerts

**Invoice Statuses:**
- 📝 **Draft:** Not yet finalized
- 📅 **Scheduled:** Queued for future sending
- 📧 **Sent:** Delivered to customer
- ✅ **Paid:** Payment received
- 🚨 **Overdue:** Past due date
- ❌ **Void:** Cancelled

**Filtering:**
- All invoices
- Scheduled only
- Sent only
- Overdue only

---

### 4. Dunning Management
**Path:** System → Dunning Management

**What it does:** Automated payment recovery and account suspension

**Main Actions:**

#### View Case Details
```
Click "View Details" on any case → See full dunning history
```

#### Send Reminder
```
In case details → "Send Reminder" → Email sent → Count incremented
```

#### Retry Payment
```
In case details → "Retry Payment" → Attempt made → Next attempt scheduled
```

#### Suspend Account
```
In case details → "Suspend Account" → Confirm → Tenant suspended
```

#### Mark as Paid
```
In case details → "Mark as Paid" → Status: Recovered → Account reactivated
```

#### Configure Settings
```
Click "Settings" → Modify dunning rules → Save Settings
```

**4-Stage Dunning Process:**

| Stage | Days After Due | Action | Email Template |
|-------|----------------|--------|----------------|
| 1 | 1 | Send friendly reminder | Reminder |
| 2 | 7 | Send urgent notice | Urgent |
| 3 | 14 | Send final warning | Final Notice |
| 4 | 21 | Suspend account | Suspension Warning |

**Configuration Options:**
- **Grace Period:** 0-30 days (before dunning starts)
- **Auto-Suspend After:** 1-90 days (overdue threshold)
- **Retry Interval:** 1-30 days (between attempts)
- **Max Retry Attempts:** 1-10 (before giving up)
- **Write-Off After:** 30-365 days (debt forgiveness)
- **Auto-Suspend:** Enable/Disable automatic suspension
- **Admin Notifications:** Enable/Disable alerts

**Case Statuses:**
- 🔵 **Active:** Dunning in progress
- 🟡 **Grace Period:** Within grace period
- 🔴 **Suspended:** Account suspended
- 🟢 **Recovered:** Payment received
- ⚫ **Written Off:** Debt forgiven

**Statistics Tracked:**
- Active cases (count + amount at risk)
- Suspended accounts (count + outstanding amount)
- Recovered payments (count + collected amount)
- Recovery rate (%)
- Average days to recovery

---

## 🔍 Common Workflows

### Workflow 1: Monitor Tenant Health
```
1. Navigate to System → Usage Monitoring
2. Review summary cards (Total/Critical/Alerts/Avg Health)
3. Filter by health status if needed
4. Click on tenant to view details
5. Check resource usage progress bars
6. Review active alerts
7. Export report if needed
```

### Workflow 2: Check System Status
```
1. Navigate to System → System Health
2. View overall system status banner
3. Check individual service statuses
4. Review system metrics
5. Wait for auto-refresh (60s) or manually refresh
6. Investigate any degraded/outage services
```

### Workflow 3: Generate Monthly Invoices
```
1. Navigate to System → Invoice Generator
2. Click "Generate Invoices"
3. Wait for generation to complete
4. Review invoice list
5. Preview invoices for accuracy
6. Send scheduled invoices (or wait for auto-send)
7. Monitor payment status
```

### Workflow 4: Handle Overdue Payment
```
1. Navigate to System → Dunning Management
2. Check "Active" or "Grace Period" tabs
3. Find overdue case
4. Click "View Details"
5. Review dunning history and stage
6. Send reminder if needed
7. Retry payment if appropriate
8. If unresolved and past grace period:
   - Click "Suspend Account"
   - Confirm suspension
   - Account is suspended immediately
9. When payment received:
   - Click "Mark as Paid"
   - Account auto-reactivated
```

### Workflow 5: Suspend Tenant for Non-Payment
```
Via Dunning Management:
1. Find case in Dunning Management
2. View Details → Suspend Account → Confirm

Via Tenant Management:
1. Navigate to System → Tenants
2. Find tenant
3. Click "Suspend Tenant"
4. Enter reason (e.g., "Non-payment: Invoice INV-2025-0001")
5. Confirm

Result:
- Tenant status = Suspended
- Login blocked (except super_admin)
- Descriptive error message shown
- Audit log created
```

### Workflow 6: Reactivate Suspended Tenant
```
1. Navigate to System → Tenants
2. Find suspended tenant (red badge)
3. Click "Reactivate Tenant"
4. Confirm
5. Tenant status = Active
6. User can log in again
```

---

## 🎨 UI Color Codes

### Health Status Colors
- 🟢 **Healthy (60-100):** Green badges/text
- 🟡 **Warning (30-59):** Yellow/orange badges/text
- 🔴 **Critical (0-29):** Red badges/text

### Invoice Status Colors
- 📝 **Draft:** Gray
- 📅 **Scheduled:** Blue
- 📧 **Sent:** Blue
- ✅ **Paid:** Green
- 🚨 **Overdue:** Red
- ❌ **Void:** Gray

### Dunning Stage Colors
- **Stage 1:** Blue background
- **Stage 2:** Yellow background
- **Stage 3:** Orange background
- **Stage 4:** Red background

### System Health Colors
- 🟢 **Operational:** Green badge
- 🟡 **Degraded:** Yellow badge
- 🔴 **Outage:** Red badge

---

## 📊 Dashboard Metrics

### Usage Monitoring
- **Total Tenants:** Count of all active tenants
- **Critical Tenants:** Health score < 30
- **Active Alerts:** Warnings + Critical alerts
- **Average Health:** Mean health score across all tenants

### System Health
- **Overall Status:** Operational/Degraded/Outage
- **Avg Response Time:** Across all services (ms)
- **Error Rate:** Percentage of failed requests
- **Active Connections:** Current concurrent connections
- **Requests/Min:** Current request throughput
- **24h Uptime:** Availability percentage

### Invoice Generator
- **Total Invoices:** Count + total value
- **Paid:** Amount received (green)
- **Pending:** Amount awaiting payment (blue)
- **Overdue:** Amount past due (red)

### Dunning Management
- **Active Cases:** Count + amount at risk
- **Suspended:** Count + outstanding amount
- **Recovered:** Count + collected amount
- **Recovery Rate:** Percentage of cases recovered
- **Avg Days to Recover:** Time from overdue to paid

---

## 🔐 Access Control

### Who Can Access?
**Super Admin Only:**
- Usage Monitoring Dashboard
- System Health Monitor
- Invoice Generator
- Dunning Management

**Required Permission:** `tenant.manage`

### Access Denied?
If you see an access denied message:
1. Check your role (must be `super_admin`)
2. Verify you have `tenant.manage` permission
3. Contact system administrator

### Super Admin Bypass
Super admins can:
- Access all Phase 14 features
- Log in even if their tenant is suspended
- View all tenants' data
- Perform all administrative actions

---

## 🐛 Troubleshooting

### "Cannot access this feature"
**Cause:** Insufficient permissions  
**Solution:** Login as super_admin

### Invoice generation stuck
**Cause:** Network simulation delay (2s)  
**Solution:** Wait for completion, check console

### Email not sending
**Cause:** Mock implementation  
**Solution:** Check audit logs for confirmation, email simulation only

### Health scores not updating
**Cause:** Static mock data  
**Solution:** Refresh page or modify tenant data in mockData.ts

### System health shows all operational
**Cause:** Simulated data with 95%+ uptime  
**Solution:** For testing failures, modify checkSystemHealth() function

### Dunning cases not appearing
**Cause:** No overdue invoices in mock data  
**Solution:** Check mockBilling array, ensure some tenants have past due dates

### Tenant suspension not working
**Cause:** User is super_admin (bypasses check)  
**Solution:** Test with org_admin or participant role

---

## 📝 Audit Trail

### Where to Find Audit Logs
```
Navigate to: System → Audit Logs
```

### New Event Types to Look For
- `billing.invoices_generated`
- `billing.invoice_sent`
- `billing.invoice_downloaded`
- `billing.payment_retry`
- `billing.reminder_sent`
- `billing.payment_recovered`
- `tenant.suspended`
- `system.billing_settings_updated`
- `system.dunning_settings_updated`

### Audit Log Contains
- Action type (color-coded)
- User who performed action
- Timestamp
- Detailed description
- Metadata (expandable)
- Session ID
- IP address

---

## ⚡ Keyboard Shortcuts

No custom shortcuts implemented. Use browser shortcuts:
- `Ctrl+R` / `F5`: Refresh page
- `Ctrl+Shift+I`: Open DevTools
- `Ctrl+Click`: Open link in new tab

---

## 🔧 Developer Notes

### Mock Data Locations
- **Tenants:** `mockTenants` array in mockData.ts
- **Invoices:** Generated dynamically in InvoiceGenerator component
- **Dunning Cases:** Generated dynamically in DunningManagement component
- **Billing:** `mockBilling` array in mockData.ts
- **Plans:** `defaultPlans` array in mockData.ts

### Simulated Delays
- Invoice generation: 2000ms
- Email sending: 1500ms
- Payment retry: 1500ms
- Account suspension: 1000ms
- Payment recovery: 1500ms

### Auto-Refresh Intervals
- System Health: 60 seconds
- Usage Monitoring: Manual only
- Invoice Generator: Manual only
- Dunning Management: Manual only

### Important Constants
```typescript
// Health scoring weights
USERS_WEIGHT = 0.40
TOURNAMENTS_WEIGHT = 0.30
STORAGE_WEIGHT = 0.30

// Alert thresholds
WARNING_THRESHOLD = 75  // percent
CRITICAL_THRESHOLD = 90 // percent

// Default dunning configuration
GRACE_PERIOD = 3        // days
MAX_RETRIES = 3         // attempts
RETRY_INTERVAL = 3      // days
AUTO_SUSPEND = 14       // days overdue
WRITE_OFF = 90          // days overdue
```

---

## 📚 Related Documentation

- **Full Testing Guide:** `PHASE14_TESTING_GUIDE.md`
- **Implementation Details:** `todo.md` (Phase 14 section)
- **Component Source:**
  - `UsageMonitoringDashboard.tsx`
  - `SystemHealthMonitor.tsx`
  - `InvoiceGenerator.tsx`
  - `DunningManagement.tsx`

---

## 🎯 Production Checklist

Before deploying to production:

- [ ] Replace mock data with real API calls
- [ ] Implement actual PDF generation (libraries: jsPDF, pdfmake)
- [ ] Connect to email service (SendGrid, Mailgun, AWS SES)
- [ ] Integrate payment gateway (Stripe, PayPal)
- [ ] Add real-time WebSocket updates
- [ ] Implement database persistence
- [ ] Add comprehensive error handling
- [ ] Set up monitoring and alerts
- [ ] Implement rate limiting
- [ ] Add security measures (CSRF, XSS protection)
- [ ] Configure scheduled jobs for auto-generation
- [ ] Set up backup and recovery procedures
- [ ] Add audit log retention policies
- [ ] Implement data encryption
- [ ] Configure CDN for static assets

---

**Version:** 1.0  
**Last Updated:** November 17, 2025  
**Status:** Phase 14 Complete ✅
