# Referral System Architecture

**Last Updated:** November 21, 2025  
**Status:** Ready for Implementation

## Overview

The Smart eQuiz Platform implements a **three-tier referral system** designed to drive growth at multiple levels:

1. **Tier 1: Global Affiliates** - Super admin managed, independent marketers
2. **Tier 2: Tenant Referrals** - Super admin managed, organization-to-organization  
3. **Tier 3: Participant Referrals** - Tenant admin managed, user-to-user

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    TIER 1: GLOBAL AFFILIATES                │
│         (Super Admin Managed - Platform Level)              │
│                                                             │
│  Independent marketers promote platform globally            │
│  → Earn USD commission on tenant subscriptions              │
│  → Multi-currency payouts (12 currencies)                   │
│  → Performance-based tier progression                        │
│  → Super admin approves & processes payouts                 │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  TIER 2: TENANT REFERRALS                   │
│         (Super Admin Managed - Organization Level)          │
│                                                             │
│  Existing tenants refer new organizations                   │
│  → Earn recurring commission (e.g., 15% for 12 months)     │
│  → Credited to tenant account or paid out                   │
│  → Super admin sets commission rates                        │
│  → Helps with revenue expansion                             │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                TIER 3: PARTICIPANT REFERRALS                │
│           (Tenant Admin Managed - User Level)               │
│                                                             │
│  Participants invite friends to their organization          │
│  → Earn points, credits, or free tournament entries         │
│  → Rewards in tenant's currency                             │
│  → Tenant enables/disables feature                          │
│  → Tenant sets reward amounts                               │
└─────────────────────────────────────────────────────────────┘
```

## Database Schema

### Core Tables

#### 1. `affiliates` - Tier 1 Global Affiliates

```sql
CREATE TABLE affiliates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id), -- Optional link to platform account
  
  -- Personal Information
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  country_code VARCHAR(2) NOT NULL, -- ISO 3166-1 alpha-2
  
  -- Affiliate Code
  affiliate_code VARCHAR(50) UNIQUE NOT NULL, -- e.g., 'JOHN-AFFILIATE-2025'
  
  -- Status (Super Admin Controls)
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
    CHECK (status IN ('pending', 'active', 'suspended', 'banned')),
  approved_at TIMESTAMP,
  approved_by UUID REFERENCES users(id), -- Super admin who approved
  
  -- Commission Settings (Super Admin Sets)
  commission_tier VARCHAR(20) NOT NULL DEFAULT 'bronze',
    CHECK (commission_tier IN ('bronze', 'silver', 'gold', 'platinum')),
  commission_rate DECIMAL(5,2) NOT NULL DEFAULT 20.00, -- Percentage
  
  -- Payment Information
  payout_currency VARCHAR(3) NOT NULL DEFAULT 'USD', -- ISO 4217
  payout_method VARCHAR(20) NOT NULL,
    CHECK (payout_method IN ('stripe', 'paypal', 'bank_transfer', 'crypto')),
  payout_details JSONB, -- Encrypted: { email, account_id, wallet_address, etc. }
  
  -- Performance Tracking
  total_referrals INTEGER DEFAULT 0,
  successful_conversions INTEGER DEFAULT 0,
  total_earned DECIMAL(10,2) DEFAULT 0.00, -- Lifetime in USD
  total_paid_out DECIMAL(10,2) DEFAULT 0.00, -- Total withdrawn in USD
  pending_payout DECIMAL(10,2) DEFAULT 0.00, -- Available balance in USD
  
  -- Metadata
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Indexes
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z]{2,}$'),
  CONSTRAINT positive_rates CHECK (commission_rate >= 0 AND commission_rate <= 100)
);

CREATE INDEX idx_affiliates_status ON affiliates(status);
CREATE INDEX idx_affiliates_email ON affiliates(email);
CREATE INDEX idx_affiliates_code ON affiliates(affiliate_code);
CREATE INDEX idx_affiliates_tier ON affiliates(commission_tier);
```

**Ownership:** Super Admin  
**Access Control:**
- Super Admin: Full CRUD
- Affiliates: Read-only (their own record)
- Tenants: No access
- Participants: No access

---

#### 2. `affiliate_referrals` - Tier 1 & 2 Tracking

```sql
CREATE TABLE affiliate_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Referrer Information
  referrer_type VARCHAR(20) NOT NULL,
    CHECK (referrer_type IN ('affiliate', 'tenant')), -- Tier 1 or Tier 2
  referrer_id UUID NOT NULL, -- affiliates.id or tenants.id
  referral_code VARCHAR(50) NOT NULL,
  
  -- Referred Tenant
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  
  -- Attribution Tracking
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  landing_page VARCHAR(255),
  ip_address INET,
  user_agent TEXT,
  
  -- Conversion Status
  signup_date TIMESTAMP NOT NULL,
  first_payment_date TIMESTAMP,
  conversion_status VARCHAR(20) NOT NULL DEFAULT 'signed_up',
    CHECK (conversion_status IN ('clicked', 'signed_up', 'converted', 'cancelled')),
  
  -- Revenue & Commission
  tenant_plan_id UUID REFERENCES plans(id),
  subscription_value DECIMAL(10,2), -- Monthly recurring revenue in USD
  commission_amount DECIMAL(10,2), -- Per month in USD
  commission_currency VARCHAR(3) DEFAULT 'USD',
  
  -- Recurring Commission Settings
  recurring_months INTEGER NOT NULL, -- How many months to pay (1, 2, 3, 6, 12, 24, etc.)
  months_paid INTEGER DEFAULT 0, -- Months already paid
  
  -- Fraud Detection
  fraud_score DECIMAL(3,2) DEFAULT 0.00, -- 0.00 - 1.00
  fraud_notes TEXT,
  is_fraudulent BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_fraud_score CHECK (fraud_score >= 0 AND fraud_score <= 1),
  CONSTRAINT valid_months CHECK (months_paid <= recurring_months)
);

CREATE INDEX idx_affiliate_referrals_referrer ON affiliate_referrals(referrer_type, referrer_id);
CREATE INDEX idx_affiliate_referrals_tenant ON affiliate_referrals(tenant_id);
CREATE INDEX idx_affiliate_referrals_status ON affiliate_referrals(conversion_status);
CREATE INDEX idx_affiliate_referrals_code ON affiliate_referrals(referral_code);
```

**Ownership:** Super Admin  
**Purpose:** Track all tenant sign-ups from affiliates and tenant referrals

---

#### 3. `affiliate_payouts` - Tier 1 & 2 Payments

```sql
CREATE TABLE affiliate_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Recipient
  recipient_type VARCHAR(20) NOT NULL,
    CHECK (recipient_type IN ('affiliate', 'tenant')),
  recipient_id UUID NOT NULL,
  
  -- Payout Amount
  amount DECIMAL(10,2) NOT NULL, -- Amount in USD (platform base currency)
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  converted_amount DECIMAL(10,2), -- Amount in recipient's currency
  payout_currency VARCHAR(3), -- Recipient's chosen currency
  exchange_rate DECIMAL(10,6), -- Conversion rate used
  
  -- Payment Processing
  payout_method VARCHAR(20) NOT NULL,
    CHECK (payout_method IN ('stripe', 'paypal', 'bank_transfer', 'crypto')),
  transaction_id VARCHAR(255), -- External payment system ID
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
    CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  
  -- Period Covered
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  referral_ids UUID[], -- Array of affiliate_referrals.id included
  
  -- Tax & Compliance
  tax_form_required BOOLEAN DEFAULT FALSE,
  tax_form_submitted BOOLEAN DEFAULT FALSE,
  tax_form_url VARCHAR(500), -- Link to uploaded tax form
  
  -- Processing Info
  processed_at TIMESTAMP,
  processed_by UUID REFERENCES users(id), -- Super admin who processed
  notes TEXT, -- Admin notes
  
  -- Metadata
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT positive_amount CHECK (amount > 0),
  CONSTRAINT valid_period CHECK (period_end >= period_start)
);

CREATE INDEX idx_affiliate_payouts_recipient ON affiliate_payouts(recipient_type, recipient_id);
CREATE INDEX idx_affiliate_payouts_status ON affiliate_payouts(status);
CREATE INDEX idx_affiliate_payouts_period ON affiliate_payouts(period_start, period_end);
```

**Ownership:** Super Admin  
**Workflow:**
1. Affiliate/Tenant requests payout (min $50 USD)
2. Super admin reviews & approves
3. Super admin processes payment via chosen method
4. System records transaction details

---

#### 4. `affiliate_tiers` - Commission Tier Configuration

```sql
CREATE TABLE affiliate_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_name VARCHAR(20) UNIQUE NOT NULL,
    CHECK (tier_name IN ('bronze', 'silver', 'gold', 'platinum')),
  
  -- Requirements
  min_referrals INTEGER NOT NULL DEFAULT 0,
  min_conversions INTEGER NOT NULL DEFAULT 0,
  min_total_revenue DECIMAL(10,2) NOT NULL DEFAULT 0.00, -- In USD
  
  -- Rewards
  commission_rate DECIMAL(5,2) NOT NULL, -- Percentage (20, 25, 30, 35)
  recurring_months INTEGER NOT NULL, -- 1, 2, 3, 6, 12, 18, 24, or 999 (lifetime)
  bonus_per_referral DECIMAL(10,2) DEFAULT 0.00, -- One-time bonus in USD
  
  -- Perks
  perks JSONB DEFAULT '{}', -- { "priority_support": true, ... }
  
  -- Display
  display_name VARCHAR(100),
  description TEXT,
  badge_color VARCHAR(20), -- Hex color for UI
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Metadata
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_commission CHECK (commission_rate >= 0 AND commission_rate <= 100)
);

-- Seed default tiers (Super Admin can modify these)
INSERT INTO affiliate_tiers (tier_name, min_referrals, min_conversions, min_total_revenue, commission_rate, recurring_months, bonus_per_referral, display_name, badge_color) VALUES
('bronze', 0, 0, 0, 20.00, 3, 0, 'Bronze Partner', '#CD7F32'),        -- 3 months
('silver', 10, 5, 5000, 25.00, 6, 50, 'Silver Partner', '#C0C0C0'),    -- 6 months
('gold', 50, 25, 25000, 30.00, 12, 100, 'Gold Partner', '#FFD700'),    -- 12 months
('platinum', 100, 50, 100000, 35.00, 24, 500, 'Platinum Partner', '#E5E4E2'); -- 24 months

-- Note: Super admin can customize these values, including setting recurring_months to:
-- 1 = One month only
-- 2 = Two months
-- 3 = Three months (default for bronze)
-- 6 = Six months (default for silver)
-- 12 = One year (default for gold)
-- 24 = Two years (default for platinum)
-- 999 = Lifetime commission

CREATE INDEX idx_affiliate_tiers_name ON affiliate_tiers(tier_name);
```

**Ownership:** Super Admin  
**Purpose:** Define progression path for affiliates

---

#### 5. `tenant_referrals` - Tier 2 Organization Referrals

```sql
CREATE TABLE tenant_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Referrer & Referred
  referrer_tenant_id UUID NOT NULL REFERENCES tenants(id),
  referred_tenant_id UUID NOT NULL REFERENCES tenants(id),
  referral_code VARCHAR(50) NOT NULL,
  
  -- Status
  conversion_status VARCHAR(20) NOT NULL DEFAULT 'invited',
    CHECK (conversion_status IN ('invited', 'signed_up', 'active_subscriber', 'churned')),
  
  -- Commission (Super Admin Sets)
  commission_amount DECIMAL(10,2) DEFAULT 0.00, -- Per month in USD
  recurring_months INTEGER NOT NULL, -- 1, 2, 3, 6, 12, etc. (set by super admin)
  months_paid INTEGER DEFAULT 0,
  
  -- Dates
  invited_at TIMESTAMP,
  signed_up_at TIMESTAMP,
  first_payment_at TIMESTAMP,
  churned_at TIMESTAMP,
  
  -- Metadata
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT different_tenants CHECK (referrer_tenant_id != referred_tenant_id),
  CONSTRAINT valid_months_paid CHECK (months_paid <= recurring_months)
);

CREATE INDEX idx_tenant_referrals_referrer ON tenant_referrals(referrer_tenant_id);
CREATE INDEX idx_tenant_referrals_referred ON tenant_referrals(referred_tenant_id);
CREATE INDEX idx_tenant_referrals_status ON tenant_referrals(conversion_status);
```

**Ownership:** Super Admin  
**Purpose:** Track tenant-to-tenant referrals and commissions

---

#### 6. `participant_referrals` - Tier 3 User Referrals

```sql
CREATE TABLE participant_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Tenant Scoped
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  
  -- Referrer & Referred
  referrer_id UUID NOT NULL REFERENCES users(id),
  referred_user_id UUID NOT NULL REFERENCES users(id),
  referral_code VARCHAR(50) NOT NULL,
  
  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
    CHECK (status IN ('pending', 'completed', 'rewarded', 'expired')),
  
  -- Activity Requirements
  referred_user_active BOOLEAN DEFAULT FALSE,
  minimum_activity_met BOOLEAN DEFAULT FALSE,
  activity_criteria JSONB, -- { "quizzes_completed": 10, "tournaments_joined": 1 }
  activity_verified_at TIMESTAMP,
  
  -- Reward (Tenant Controls)
  reward_type VARCHAR(30) NOT NULL,
    CHECK (reward_type IN ('points', 'credits', 'tournament_entries')),
  reward_amount DECIMAL(10,2) NOT NULL,
  reward_currency VARCHAR(3), -- For credits: tenant's currency
  reward_awarded BOOLEAN DEFAULT FALSE,
  reward_awarded_at TIMESTAMP,
  
  -- Metadata
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP, -- Referral link expiration
  
  -- Constraints
  CONSTRAINT different_users CHECK (referrer_id != referred_user_id),
  CONSTRAINT positive_reward CHECK (reward_amount > 0)
);

CREATE INDEX idx_participant_referrals_tenant ON participant_referrals(tenant_id);
CREATE INDEX idx_participant_referrals_referrer ON participant_referrals(referrer_id);
CREATE INDEX idx_participant_referrals_status ON participant_referrals(status);
CREATE INDEX idx_participant_referrals_code ON participant_referrals(referral_code);

-- Row Level Security (RLS)
ALTER TABLE participant_referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON participant_referrals
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
```

**Ownership:** Tenant Admin  
**Purpose:** Track participant-to-participant referrals within tenant

---

#### 7. `participant_rewards` - Tier 3 Reward Tracking

```sql
CREATE TABLE participant_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Tenant Scoped
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  user_id UUID NOT NULL REFERENCES users(id),
  referral_id UUID NOT NULL REFERENCES participant_referrals(id),
  
  -- Reward Details
  reward_type VARCHAR(30) NOT NULL,
    CHECK (reward_type IN ('points', 'credits', 'tournament_entries')),
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3), -- For credits: tenant's currency
  
  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
    CHECK (status IN ('pending', 'approved', 'paid', 'cancelled')),
  approved_by UUID REFERENCES users(id), -- Tenant admin
  approved_at TIMESTAMP,
  
  -- Payout (For credits)
  payout_method VARCHAR(30),
    CHECK (payout_method IN ('wallet', 'bank_transfer', 'mobile_money')),
  payout_details JSONB, -- { "account_number": "...", "bank": "..." }
  paid_at TIMESTAMP,
  transaction_id VARCHAR(255),
  
  -- Metadata
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT positive_amount CHECK (amount > 0)
);

CREATE INDEX idx_participant_rewards_tenant ON participant_rewards(tenant_id);
CREATE INDEX idx_participant_rewards_user ON participant_rewards(user_id);
CREATE INDEX idx_participant_rewards_status ON participant_rewards(status);

-- Row Level Security
ALTER TABLE participant_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON participant_rewards
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
```

**Ownership:** Tenant Admin  
**Purpose:** Manage reward approvals and payouts to participants

---

## Access Control Matrix

| Entity | Super Admin | Tenant Admin | Affiliate | Participant |
|--------|-------------|--------------|-----------|-------------|
| **Tier 1: Affiliates** | Full CRUD | None | Read (own) | None |
| **Tier 1: Referrals** | Full CRUD | None | Read (own) | None |
| **Tier 1: Payouts** | Full CRUD | None | Read (own) | None |
| **Tier 2: Tenant Referrals** | Full CRUD | Read (own) | None | None |
| **Tier 3: Participant Referrals** | Read-only | Full CRUD | None | Read (own) |
| **Tier 3: Rewards** | Read-only | Full CRUD | None | Read (own) |

---

## Commission Calculation Examples

### Tier 1: Global Affiliate

**Scenario:** Bronze affiliate refers a tenant that subscribes to Professional plan ($99/month)

```
Commission Rate: 20%
Recurring Months: 3 (configurable by super admin)
Monthly Commission: $99 × 20% = $19.80
Total Earned: $19.80 × 3 = $59.40
```

**Alternative Configurations:**
- **1 month:** $19.80 × 1 = $19.80 total
- **2 months:** $19.80 × 2 = $39.60 total
- **3 months:** $19.80 × 3 = $59.40 total
- **6 months:** $19.80 × 6 = $118.80 total
- **12 months:** $19.80 × 12 = $237.60 total

**Progression:** After 10 successful conversions → Upgrade to Silver tier (25% for 6 months)

---

### Tier 2: Tenant Referral

**Scenario:** Existing tenant refers another organization

```
Commission Rate: 15% (set by super admin)
Recurring Months: 3 (configurable by super admin per referral or globally)
Referred Tenant Plan: Enterprise ($299/month)
Monthly Commission: $299 × 15% = $44.85
Total Earned: $44.85 × 3 = $134.55

Options:
1. Credit to tenant account (reduce their bill)
2. Cash payout (if they prefer)
```

**Super Admin Flexibility:**
- Can set different durations for different tenant tiers
- Example: Basic plan referrals = 1 month, Enterprise = 6 months
- Can offer promotional periods (e.g., "Refer 5 tenants, earn 12 months commission")

---

### Tier 3: Participant Referral

**Scenario:** Participant refers 3 friends (tenant currency: NGN)

```
Reward Type: Credits
Reward Amount: ₦5,000 per referral
Total Earned: ₦5,000 × 3 = ₦15,000

Payout Options:
1. Credited to wallet (use for tournament entry fees)
2. Bank transfer (if > ₦10,000 minimum)
3. Mobile money
```

---

## Commission Duration Configuration

### **Super Admin Control Panel**

The super admin has full control over commission durations at multiple levels:

#### **1. Global Tier Configuration**

Set default durations for each affiliate tier:

```typescript
// Platform Settings → Affiliate Program → Commission Tiers
const tierDefaults = {
  bronze: {
    commissionRate: 20,      // %
    recurringMonths: 3,      // 3 months
    bonusPerReferral: 0      // No bonus
  },
  silver: {
    commissionRate: 25,      // %
    recurringMonths: 6,      // 6 months
    bonusPerReferral: 50     // $50 one-time
  },
  gold: {
    commissionRate: 30,      // %
    recurringMonths: 12,     // 12 months
    bonusPerReferral: 100    // $100 one-time
  },
  platinum: {
    commissionRate: 35,      // %
    recurringMonths: 24,     // 24 months (or 999 for lifetime)
    bonusPerReferral: 500    // $500 one-time
  }
};
```

#### **2. Per-Referral Override**

Super admin can override duration for specific referrals:

```typescript
// When reviewing a high-value referral
if (referredTenant.plan === 'enterprise' && referredTenant.annualContract) {
  // Special deal: 12 months commission instead of default 3
  referral.recurringMonths = 12;
}
```

#### **3. Promotional Campaigns**

Temporary commission boost periods:

```typescript
// Holiday Special: December 2025
const campaign = {
  name: "Holiday Affiliate Boost",
  startDate: "2025-12-01",
  endDate: "2025-12-31",
  bonusMonths: +3,  // Add 3 extra months to all referrals
  // Bronze: 3 + 3 = 6 months
  // Silver: 6 + 3 = 9 months
};
```

#### **4. Tenant Referral Settings**

Different durations based on referred tenant's plan:

| Referred Plan | Commission Duration | Monthly Commission |
|---------------|--------------------|--------------------|---|
| Starter ($29/mo) | 1 month | 15% × $29 = $4.35 |
| Professional ($99/mo) | 2 months | 15% × $99 = $14.85 |
| Enterprise ($299/mo) | 6 months | 15% × $299 = $44.85 |

**Total Earnings:**
- Starter: $4.35 × 1 = **$4.35**
- Professional: $14.85 × 2 = **$29.70**
- Enterprise: $44.85 × 6 = **$269.10**

### **UI Implementation**

#### **Super Admin Dashboard → Affiliate Settings**

```jsx
<Card>
  <CardHeader>
    <CardTitle>Commission Duration Settings</CardTitle>
    <CardDescription>
      Configure how long affiliates earn commission per referral
    </CardDescription>
  </CardHeader>
  <CardContent>
    <div className="space-y-4">
      {/* Bronze Tier */}
      <div className="flex items-center justify-between">
        <div>
          <Label>Bronze Tier Duration</Label>
          <p className="text-sm text-gray-500">
            Default commission period for bronze affiliates
          </p>
        </div>
        <Select value={bronzeMonths} onValueChange={setBronzeMonths}>
          <option value="1">1 month</option>
          <option value="2">2 months</option>
          <option value="3">3 months</option>
          <option value="6">6 months</option>
          <option value="12">12 months</option>
        </Select>
      </div>

      {/* Per-Plan Override */}
      <Separator />
      <div>
        <Label>Plan-Based Overrides</Label>
        <p className="text-sm text-gray-500 mb-3">
          Override commission duration based on referred tenant's plan
        </p>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Plan</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Basic</TableCell>
              <TableCell>
                <Input type="number" value="1" min="1" max="24" />
                <span className="ml-2">month(s)</span>
              </TableCell>
              <TableCell className="text-sm text-gray-500">
                Lower plan = shorter duration
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Professional</TableCell>
              <TableCell>
                <Input type="number" value="3" min="1" max="24" />
                <span className="ml-2">month(s)</span>
              </TableCell>
              <TableCell className="text-sm text-gray-500">
                Standard duration
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Enterprise</TableCell>
              <TableCell>
                <Input type="number" value="6" min="1" max="24" />
                <span className="ml-2">month(s)</span>
              </TableCell>
              <TableCell className="text-sm text-gray-500">
                Higher plan = longer duration
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  </CardContent>
</Card>
```

### **Automated Commission Calculation**

```typescript
// services/api/src/affiliates/commission.service.ts

export class CommissionService {
  async calculateCommission(referral: AffiliateReferral): Promise<number> {
    const affiliate = await this.getAffiliate(referral.referrerId);
    const tenant = await this.getTenant(referral.tenantId);
    const plan = await this.getPlan(tenant.planId);
    
    // Get base duration from tier
    let duration = affiliate.tier.recurringMonths;
    
    // Check for plan-based override
    const planOverride = await this.getPlanDurationOverride(plan.id);
    if (planOverride) {
      duration = planOverride.recurringMonths;
    }
    
    // Check for active promotional campaign
    const campaign = await this.getActiveCampaign();
    if (campaign) {
      duration += campaign.bonusMonths;
    }
    
    // Calculate total
    const monthlyCommission = plan.monthlyPrice * (affiliate.commissionRate / 100);
    const totalCommission = monthlyCommission * duration;
    
    return {
      monthlyCommission,
      duration,
      totalCommission,
      breakdown: {
        planPrice: plan.monthlyPrice,
        commissionRate: affiliate.commissionRate,
        baseDuration: affiliate.tier.recurringMonths,
        finalDuration: duration
      }
    };
  }
}
```

### **Payout Tracking**

```sql
-- Monthly cron job to process recurring commissions
CREATE OR REPLACE FUNCTION process_monthly_commissions()
RETURNS void AS $$
BEGIN
  -- Find all active referrals that haven't completed payment period
  UPDATE affiliate_referrals
  SET months_paid = months_paid + 1,
      updated_at = NOW()
  WHERE conversion_status = 'converted'
    AND months_paid < recurring_months
    AND DATE_TRUNC('month', first_payment_date) + 
        INTERVAL '1 month' * months_paid <= NOW();
  
  -- Update affiliate pending payouts
  UPDATE affiliates a
  SET pending_payout = (
    SELECT SUM(commission_amount)
    FROM affiliate_referrals ar
    WHERE ar.referrer_id = a.id
      AND ar.referrer_type = 'affiliate'
      AND ar.months_paid < ar.recurring_months
  );
END;
$$ LANGUAGE plpgsql;
```

### **Benefits of Flexible Duration**

1. **Cost Control:** Lower commitment for testing affiliate program
2. **Incentive Alignment:** Higher value plans = longer commission
3. **Promotional Flexibility:** Temporary boosts to drive sign-ups
4. **Fair Compensation:** Match commission to customer lifetime value
5. **Competitive Advantage:** Adjust rates based on market conditions

### **Recommended Duration Strategy**

**Conservative Approach (Lower Risk):**
- Bronze: 1 month
- Silver: 2 months  
- Gold: 3 months
- Platinum: 6 months

**Standard Approach (Balanced):**
- Bronze: 3 months
- Silver: 6 months
- Gold: 12 months
- Platinum: 24 months

**Aggressive Approach (Maximum Growth):**
- Bronze: 6 months
- Silver: 12 months
- Gold: 24 months
- Platinum: Lifetime (999 months)

**Plan-Tier Matching:**
- Basic plan referrals: 1 month (low value)
- Professional plan: 3 months (standard value)
- Enterprise plan: 6-12 months (high value)
- Annual contracts: +50% duration bonus

---

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
- ✅ Database schema creation
- ✅ TypeScript interfaces
- ✅ Storage keys
- ⏳ Migration scripts

### Phase 2: Tier 1 - Global Affiliates (Week 3-4)
- Public affiliate registration page
- Super admin approval workflow
- Affiliate dashboard (track referrals, earnings)
- Referral link generator
- Commission calculation engine

### Phase 3: Tier 2 - Tenant Referrals (Week 5)
- Tenant referral code generation
- Referral tracking dashboard
- Commission management UI (super admin)
- Payout processing system

### Phase 4: Tier 3 - Participant Referrals (Week 6-7)
- Tenant admin enable/disable toggle
- Participant referral link sharing
- Reward configuration UI
- Activity verification system
- Reward approval & payout

### Phase 5: Payments & Compliance (Week 8)
- Stripe Connect integration
- PayPal integration
- Bank transfer support
- Tax form collection
- 1099 generation (US compliance)

---

## Security Considerations

### Fraud Prevention

1. **Email Verification:** All referred users must verify email
2. **Activity Threshold:** Referred users must complete minimum activity
3. **IP Tracking:** Detect self-referrals from same IP
4. **Time Windows:** 30-day fraud detection period
5. **Manual Review:** Super admin reviews suspicious referrals

### Data Protection

1. **PII Encryption:** Payment details stored encrypted
2. **RLS Policies:** Tenant data isolation
3. **Audit Logging:** All payout actions logged
4. **Access Control:** Role-based permissions strictly enforced

---

## Currency Handling

**Platform Base Currency:** USD

**Supported Payout Currencies:**
- USD (US Dollar)
- EUR (Euro)
- GBP (British Pound)
- CAD (Canadian Dollar)
- AUD (Australian Dollar)
- JPY (Japanese Yen)
- INR (Indian Rupee)
- BRL (Brazilian Real)
- MXN (Mexican Peso)
- ZAR (South African Rand)
- NGN (Nigerian Naira)
- KES (Kenyan Shilling)

**Conversion:**
- Uses existing `convertCurrency()` utility
- Exchange rates updated daily
- Locked rate at payout creation
- Clearly displayed to recipient

---

## Next Steps

1. **Review & Approve:** Super admin reviews this architecture
2. **Implement Database:** Run migration scripts in `services/api/prisma/`
3. **Build UIs:** Create admin panels and dashboards
4. **Test Flows:** End-to-end testing of all three tiers
5. **Launch Beta:** Limited rollout to select affiliates/tenants
6. **Monitor & Optimize:** Track performance and adjust commission rates

---

**Questions or Concerns?**  
Contact: Platform Development Team
