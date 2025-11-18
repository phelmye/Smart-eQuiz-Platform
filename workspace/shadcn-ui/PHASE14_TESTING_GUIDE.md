# Phase 14: SaaS Platform Admin Infrastructure - Testing Guide

## Overview
This guide covers testing procedures for all Phase 14 features including usage monitoring, system health, automated invoicing, and dunning management.

---

## Prerequisites

### Access Requirements
- **Role:** super_admin
- **Permission:** tenant.manage
- **Test Account:** 
  - Email: `superadmin@platform.com`
  - Password: any (mock authentication)

### Dev Environment
- Dev server running at: http://localhost:5173/
- Build status: ✅ Passing
- All components integrated into Dashboard

---

## Test Suite 1: Usage Monitoring Dashboard

### Access Path
1. Login as super_admin
2. Navigate to **System → Usage Monitoring**

### Test Cases

#### TC1.1: Dashboard Loading
- **Expected:** Page loads with summary cards showing:
  - Total Tenants count
  - Critical Tenants count (health < 30)
  - Active Alerts count
  - Average Health Score

#### TC1.2: Health Scoring
- **Verify:** Each tenant shows health score (0-100)
- **Formula:** `100 - weighted percentage` where:
  - Users: 40% weight
  - Tournaments: 30% weight
  - Storage: 30% weight
- **Status Indicators:**
  - 🟢 Healthy: 60-100
  - 🟡 Warning: 30-59
  - 🔴 Critical: 0-29

#### TC1.3: Alert Generation
- **Warning threshold:** 75% of any resource limit
- **Critical threshold:** 90% of any resource limit
- **Verify:** Alerts appear for tenants exceeding thresholds

#### TC1.4: Progress Bars
- **Verify:** Visual progress bars for:
  - Users (current/max)
  - Tournaments (current/max)
  - Storage (MB used/MB limit)

#### TC1.5: Export Functionality
- **Action:** Click "Export Report"
- **Expected:** Console log shows export triggered
- **Future:** Should download CSV/PDF report

#### TC1.6: Filtering
- **Test filters:**
  - All tenants
  - Healthy only (health ≥ 60)
  - Warning only (30 ≤ health < 60)
  - Critical only (health < 30)

---

## Test Suite 2: System Health Monitor

### Access Path
1. Login as super_admin
2. Navigate to **System → System Health**

### Test Cases

#### TC2.1: Service Status Display
- **Verify 5 services monitored:**
  1. API Server
  2. Database
  3. Storage Service
  4. Email Service
  5. Payment Gateway
- **Status indicators:**
  - 🟢 Operational
  - 🟡 Degraded
  - 🔴 Outage

#### TC2.2: Overall System Health
- **Calculation:**
  - Operational: All services healthy
  - Degraded: 1-2 services unhealthy
  - Outage: 3+ services unhealthy
- **Verify:** Overall status banner matches service states

#### TC2.3: Metrics Dashboard
- **Verify metrics displayed:**
  - Average response time (ms)
  - Error rate (%)
  - Active connections
  - Requests per minute
- **Expected:** Real numbers or simulated data

#### TC2.4: Auto-Refresh
- **Interval:** 60 seconds
- **Test:** Wait 60 seconds, verify data refreshes
- **Indicator:** Values should update

#### TC2.5: Uptime Tracking
- **Verify:** 24-hour uptime percentage shown
- **Format:** XX.XX%
- **Expected:** High uptime (95%+)

#### TC2.6: Service Details
- **For each service verify:**
  - Last check timestamp
  - Response time
  - Status message
  - Status badge color

---

## Test Suite 3: Automated Invoice Generation

### Access Path
1. Login as super_admin
2. Navigate to **System → Invoice Generator**

### Test Cases

#### TC3.1: Invoice List Display
- **Verify invoice table shows:**
  - Invoice number (INV-YYYY-MM-XXXX)
  - Tenant name
  - Status badge (Draft/Scheduled/Sent/Paid/Overdue/Void)
  - Issue date
  - Due date
  - Amount
  - Plan name

#### TC3.2: Summary Cards
- **Verify 4 cards:**
  1. Total Invoices (count + total value)
  2. Paid (amount in green)
  3. Pending (amount in blue)
  4. Overdue (amount in red)

#### TC3.3: Status Filtering
- **Test tabs:**
  - All: Shows all invoices
  - Scheduled: Only scheduled invoices
  - Sent: Only sent invoices
  - Overdue: Only overdue invoices
- **Verify:** Count badges update correctly

#### TC3.4: Invoice Preview
- **Action:** Click "Preview" on any invoice
- **Verify preview shows:**
  - Invoice number and status
  - Bill To: Tenant name
  - Issue date, due date, paid date (if applicable)
  - Billing period
  - Line items table (description, qty, unit price, amount)
  - Subtotal, tax, total
  - Notes (if any)

#### TC3.5: Generate Invoices
- **Action:** Click "Generate Invoices"
- **Expected:**
  - Button shows loading state ("Generating...")
  - Takes ~2 seconds
  - Invoice list refreshes
  - Audit log entry created: `billing.invoices_generated`

#### TC3.6: Send Invoice
- **Action:** Click "Send" on scheduled/draft invoice
- **Expected:**
  - Button shows loading state
  - Status changes to "Sent"
  - emailSent = true
  - emailSentAt timestamp set
  - Audit log entry: `billing.invoice_sent`

#### TC3.7: Download Invoice
- **Action:** Click download icon
- **Expected:**
  - Console log shows download triggered
  - Audit log entry: `billing.invoice_downloaded`
  - Future: Should download PDF

#### TC3.8: Settings Configuration
- **Action:** Click "Settings"
- **Verify settings dialog shows:**
  - Schedule Configuration:
    - Generation Day of Month (1-28)
    - Generate Days Before Due (0-30)
    - Payment Terms Days (1-90)
    - Tax Rate % (0-100)
  - Email Settings:
    - Email Template dropdown
    - Send Immediately checkbox
    - Auto-Retry Failed checkbox
    - Notify on Failure checkbox

#### TC3.9: Schedule Status
- **Verify alert shows:**
  - Enabled/Disabled status
  - Current configuration details
  - Toggle button (Enable/Disable)
- **Test toggle:** Click enable/disable button

#### TC3.10: Save Settings
- **Action:** Modify settings and click "Save Settings"
- **Expected:**
  - Dialog closes
  - Settings persist
  - Audit log entry: `system.billing_settings_updated`

---

## Test Suite 4: Dunning Management System

### Access Path
1. Login as super_admin
2. Navigate to **System → Dunning Management**

### Test Cases

#### TC4.1: Dunning Cases Display
- **Verify case list shows:**
  - Tenant name
  - Invoice number
  - Status badge (Active/Grace Period/Suspended/Recovered/Written Off)
  - Stage badge (Stage 1-4)
  - Days overdue (in red)
  - Due date
  - Emails sent count
  - Retry attempts count
  - Next attempt date
  - Amount due (in red)

#### TC4.2: Statistics Cards
- **Verify 4 cards:**
  1. Active Cases (count + amount at risk)
  2. Suspended (count + outstanding amount in red)
  3. Recovered (count + collected amount in green)
  4. Recovery Rate (% + avg days to recover)

#### TC4.3: Status Filtering
- **Test tabs:**
  - Active: status = 'active'
  - Grace Period: status = 'in_grace'
  - Suspended: status = 'suspended'
  - Recovered: status = 'recovered'
- **Verify:** Cases filter correctly, counts match

#### TC4.4: Case Details View
- **Action:** Click "View Details" on any case
- **Verify dialog shows:**
  - Tenant name and invoice number
  - Status and stage badges
  - Invoice Details:
    - Amount (red)
    - Due date
    - Days overdue (red)
  - Recovery Progress:
    - Emails sent
    - Payment attempts (X / max)
    - Last email date
  - Status alerts (grace period/suspended/recovered)
  - Dunning schedule with stage progress

#### TC4.5: Send Reminder
- **Action:** Click "Send Reminder" in case details
- **Expected:**
  - Button shows loading state
  - Emails sent count increments
  - lastEmailSent timestamp updates
  - Audit log entry: `billing.reminder_sent`

#### TC4.6: Retry Payment
- **Action:** Click "Retry Payment" in case details
- **Expected:**
  - Button shows loading state
  - Attempts count increments
  - lastAttemptDate updates
  - nextAttemptDate recalculated
  - Button disables if max attempts reached
  - Audit log entry: `billing.payment_retry`

#### TC4.7: Suspend Account
- **Action:** Click "Suspend Account" in case details
- **Expected:**
  - Confirmation dialog appears
  - After confirm:
    - Status changes to "Suspended"
    - suspendedAt timestamp set
    - Tenant status in mockData = 'suspended'
    - Tenant gets suspension reason
    - Dialog closes
    - Audit log entry: `tenant.suspended`

#### TC4.8: Mark as Paid (Recovery)
- **Action:** Click "Mark as Paid" in case details
- **Expected:**
  - Status changes to "Recovered"
  - recoveredAt timestamp set
  - If tenant was suspended:
    - Tenant status = 'active'
    - suspendedAt cleared
    - suspensionReason cleared
  - Dialog closes
  - Audit log entry: `billing.payment_recovered`

#### TC4.9: Dunning Configuration
- **Action:** Click "Settings"
- **Verify settings dialog shows:**
  - Timing Configuration:
    - Grace Period Days (0-30)
    - Auto-Suspend After Days (1-90)
    - Retry Interval Days (1-30)
    - Max Retry Attempts (1-10)
    - Write Off After Days (30-365)
  - Automation Settings:
    - Auto-Suspend Accounts checkbox
    - Notify Admins on Suspension checkbox
  - Dunning Schedule (4 stages):
    - Stage number
    - Days after due
    - Description

#### TC4.10: Dunning Schedule Status
- **Verify alert shows:**
  - Enabled/Disabled status
  - Grace period duration
  - Auto-suspend threshold
  - Toggle button
- **Test toggle:** Changes dunning enabled state

#### TC4.11: Save Dunning Settings
- **Action:** Modify settings and click "Save Settings"
- **Expected:**
  - Dialog closes
  - Settings persist
  - Audit log entry: `system.dunning_settings_updated`

#### TC4.12: Refresh Data
- **Action:** Click "Refresh" button
- **Expected:**
  - Button shows loading state (spinning icon)
  - Case list reloads
  - Statistics recalculate

---

## Test Suite 5: Tenant Suspension Flow (Integration)

### Test Scenario: Suspend via Tenant Management

#### TC5.1: Suspend Tenant
1. Navigate to **System → Tenants**
2. Find a non-super_admin tenant
3. Click "Suspend Tenant" button
4. Enter suspension reason in dialog
5. Click "Confirm"
6. **Verify:**
   - Tenant status badge shows "Suspended"
   - suspendedAt timestamp displayed
   - Suspension reason shown
   - Audit log entry: `tenant.suspended`

#### TC5.2: Login with Suspended User
1. Logout from super_admin
2. Try to login with suspended tenant user
3. **Expected:**
   - Login fails
   - Error message displays: "Your account has been suspended. Please contact support for assistance."
   - User cannot access system
   - Audit log entry: Login attempt with suspended account

#### TC5.3: Super Admin Bypass
1. Logout from suspended user
2. Login as super_admin
3. **Expected:**
   - Login succeeds (bypasses suspension check)
   - Full system access granted
   - No suspension error

#### TC5.4: Reactivate Tenant
1. As super_admin, navigate to **System → Tenants**
2. Find suspended tenant
3. Click "Reactivate Tenant" button
4. **Verify:**
   - Status changes to "Active"
   - suspendedAt cleared
   - suspensionReason cleared
   - Audit log entry: `tenant.reactivated`

#### TC5.5: Login After Reactivation
1. Logout from super_admin
2. Login with previously suspended user
3. **Expected:**
   - Login succeeds
   - User has normal access
   - No error messages

---

## Test Suite 6: Audit Logging

### Access Path
1. Navigate to **System → Audit Logs**

### Test Cases

#### TC6.1: Verify New Audit Events
- **Check for events:**
  - `billing.invoices_generated`
  - `billing.invoice_sent`
  - `billing.invoice_downloaded`
  - `billing.payment_retry`
  - `billing.reminder_sent`
  - `billing.payment_recovered`
  - `tenant.suspended` (from dunning and manual)
  - `tenant.reactivated`
  - `system.billing_settings_updated`
  - `system.dunning_settings_updated`

#### TC6.2: Audit Log Details
- **Verify each log shows:**
  - Action type (color-coded)
  - User who performed action
  - Timestamp
  - Detailed description
  - Metadata (expand to view)
  - Session ID
  - IP address (if tracked)

#### TC6.3: Audit Log Filtering
- **Test filters:**
  - Filter by action type
  - Filter by user
  - Date range filtering
  - Search functionality

---

## Test Suite 7: Navigation & Access Control

### Test Cases

#### TC7.1: AdminSidebar Navigation
- **Verify System group shows:**
  - Tenants
  - Usage Monitoring ← NEW
  - System Health ← NEW
  - Invoice Generator ← NEW
  - Dunning Management ← NEW
  - Plans
  - Branding
  - Theme

#### TC7.2: Super Admin Access
- **Login as super_admin**
- **Verify:** Can access all 4 new features
- **Expected:** No access denied messages

#### TC7.3: Non-Super Admin Restriction
- **Login as org_admin or lower role**
- **Attempt to access new features:**
  - Usage Monitoring
  - System Health
  - Invoice Generator
  - Dunning Management
- **Expected:**
  - Access denied message displayed
  - Fallback message explains permission requirement
  - User redirected or shown error

#### TC7.4: Permission Verification
- **Required permission:** `tenant.manage`
- **Verify:** Only users with this permission can access
- **Test:** Remove permission, access should be denied

---

## Test Suite 8: Responsive Design

### Test Cases

#### TC8.1: Desktop View (1920x1080)
- **Verify:** All components render correctly
- **Check:** No horizontal scrolling
- **Layout:** Cards in proper grid layout

#### TC8.2: Tablet View (768x1024)
- **Verify:** Cards stack appropriately
- **Check:** Navigation remains accessible
- **Layout:** Responsive breakpoints work

#### TC8.3: Mobile View (375x667)
- **Verify:** Mobile-friendly layout
- **Check:** All functions accessible
- **Layout:** Single column where appropriate

---

## Test Suite 9: Performance

### Test Cases

#### TC9.1: Initial Page Load
- **Metric:** Time to interactive < 3 seconds
- **Test:** Load each component
- **Verify:** No noticeable lag

#### TC9.2: Data Refresh
- **System Health:** Auto-refresh at 60s
- **Verify:** Smooth updates, no UI freeze
- **Check:** No memory leaks over time

#### TC9.3: Large Dataset Handling
- **Test:** System with 50+ tenants
- **Verify:** Pagination or virtualization works
- **Check:** Scrolling remains smooth

#### TC9.4: Build Size
- **Current:** 356.64 kB (Dashboard bundle)
- **Verify:** No significant size increase
- **Check:** Code splitting working

---

## Test Suite 10: Error Handling

### Test Cases

#### TC10.1: Network Errors
- **Simulate:** Disconnect network
- **Verify:** Graceful error messages
- **Check:** No app crashes

#### TC10.2: Invalid Data
- **Test:** Submit invalid configuration
- **Verify:** Validation messages appear
- **Check:** Cannot save invalid settings

#### TC10.3: Permission Errors
- **Test:** Access without permission
- **Verify:** Proper error message
- **Check:** No system access granted

#### TC10.4: Concurrent Actions
- **Test:** Multiple users suspending same tenant
- **Verify:** No race conditions
- **Check:** State remains consistent

---

## Bug Report Template

```markdown
### Bug Report

**Component:** [Usage Monitoring / System Health / Invoice Generator / Dunning Management]

**Test Case:** TC#.#

**Steps to Reproduce:**
1. Step 1
2. Step 2
3. Step 3

**Expected Result:**
[What should happen]

**Actual Result:**
[What actually happened]

**Screenshots:**
[If applicable]

**Environment:**
- Browser: [Chrome/Firefox/Safari]
- OS: [Windows/Mac/Linux]
- Node Version: [XX.XX.X]
- Vite Version: [5.4.19]

**Console Errors:**
```
[Paste any console errors]
```

**Additional Context:**
[Any other relevant information]
```

---

## Smoke Test Checklist

Quick verification that all features are functional:

- [ ] Can login as super_admin
- [ ] Usage Monitoring loads and shows data
- [ ] System Health shows all 5 services
- [ ] Invoice Generator displays invoice list
- [ ] Dunning Management shows cases
- [ ] Can generate invoices
- [ ] Can preview and download invoice
- [ ] Can send payment reminder
- [ ] Can suspend tenant
- [ ] Suspended tenant cannot login
- [ ] Super_admin can login despite suspension
- [ ] Can reactivate suspended tenant
- [ ] All audit logs created correctly
- [ ] Settings dialogs open and save
- [ ] No console errors
- [ ] Build completes successfully
- [ ] Dev server runs without issues

---

## Known Limitations (Mock Data)

**Current Implementation:**
- All data is mock/simulated
- No real API calls
- No actual PDF generation
- No real email sending
- No actual payment processing
- Invoice generation simulates delays
- System health shows simulated metrics

**Production Requirements:**
- Replace mock data with API calls
- Implement real PDF generation library
- Integrate email service (SendGrid/Mailgun)
- Connect to payment gateway (Stripe/PayPal)
- Add real-time websocket updates
- Implement proper database persistence
- Add comprehensive error handling
- Implement retry mechanisms
- Add rate limiting
- Add security measures (CSRF, XSS protection)

---

## Success Criteria

**Phase 14 is considered complete when:**

✅ All 10 test suites pass
✅ No critical bugs found
✅ Build successful (<30s)
✅ No console errors
✅ All audit events logged
✅ Access control working
✅ Responsive design verified
✅ Documentation complete
✅ Code reviewed
✅ Ready for production integration

---

## Next Steps

**Phase 15 Options:**

1. **Support Ticket System**
   - Ticket creation and management
   - Priority levels
   - Assignment and status tracking
   - Customer communication

2. **GDPR Compliance Tools**
   - Data export functionality
   - Right to be forgotten
   - Consent management
   - Privacy policy automation

3. **Advanced Analytics**
   - Revenue forecasting
   - Churn prediction
   - Customer lifetime value
   - Usage trends

4. **API Management**
   - API key generation
   - Rate limiting
   - Usage analytics
   - Webhook configuration

5. **Security Enhancements**
   - Multi-factor authentication
   - IP whitelisting
   - Session management
   - Security audit logs

---

**Document Version:** 1.0  
**Last Updated:** November 17, 2025  
**Author:** Development Team  
**Status:** Phase 14 Complete ✅
