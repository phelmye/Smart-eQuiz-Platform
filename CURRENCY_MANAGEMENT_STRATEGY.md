# Currency Management Strategy for Smart eQuiz Platform

## Overview
The Smart eQuiz Platform implements a flexible multi-currency system that operates at both **platform level** (for consistency) and **tenant level** (for localization).

## Architecture Decision

### ✅ **Hybrid Approach: Platform + Tenant Managed**

## Implementation Levels

### 1. **Platform Level (Smart eQuiz Admin)**
- **Base Currency:** USD (United States Dollar)
- **Purpose:** Standardization and accounting
- **Managed By:** Super Admin
- **Scope:** All pricing plans, platform fees, API costs

```typescript
// Platform configuration
{
  baseCurrency: 'USD',
  exchangeRateProvider: 'exchangerate-api.io',
  cacheDuration: 3600000, // 1 hour
  supportedCurrencies: [
    'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY',
    'INR', 'BRL', 'MXN', 'ZAR', 'NGN', 'KES'
  ]
}
```

### 2. **Tenant Level (Church/Organization)**
- **Preferred Currency:** Configurable per tenant
- **Purpose:** Local currency display and billing
- **Managed By:** Tenant Admin
- **Scope:** All tenant-facing prices, invoices, reports

```typescript
interface TenantBilling {
  tenantId: string;
  planId: string;
  preferredCurrency: CurrencyCode;          // e.g., 'NGN' for Nigerian church
  displayMultipleCurrencies: boolean;       // Show prices in multiple currencies
  allowUserCurrencySelection: boolean;      // Let users toggle currency
  billingCycle: 'monthly' | 'yearly';
  status: 'active' | 'past_due' | 'cancelled' | 'trialing';
}
```

### 3. **User Level (Optional)**
- **Display Currency:** User can view in preferred currency
- **Purpose:** Convenience for international users
- **Managed By:** Individual users
- **Scope:** UI display only (not invoices)

## Use Cases

### **Use Case 1: Nigerian Church**
```typescript
{
  tenantName: "Victory Chapel Lagos",
  subdomain: "victorychapel",
  preferredCurrency: "NGN",
  displayMultipleCurrencies: false
}

// User sees:
// Professional Plan: ₦23,707/month
// Enterprise Plan: ₦47,415/month
```

### **Use Case 2: UK Church**
```typescript
{
  tenantName: "Grace Church London",
  subdomain: "gracechurch",
  preferredCurrency: "GBP",
  displayMultipleCurrencies: true
}

// User sees:
// Professional Plan: £23.69/month
// Also available in: $29.99 USD | €27.59 EUR
```

### **Use Case 3: US Church (Default)**
```typescript
{
  tenantName: "First Baptist Church",
  subdomain: "firstbaptist",
  preferredCurrency: "USD",
  displayMultipleCurrencies: false
}

// User sees:
// Professional Plan: $29.99/month
// Enterprise Plan: $59.99/month
```

## Database Schema

### **Tenants Table**
```sql
CREATE TABLE tenants (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  subdomain VARCHAR(63) UNIQUE NOT NULL,
  plan_id UUID REFERENCES plans(id),
  preferred_currency VARCHAR(3) DEFAULT 'USD',
  display_multiple_currencies BOOLEAN DEFAULT false,
  allow_user_currency_selection BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### **Plans Table** (Store in USD)
```sql
CREATE TABLE plans (
  id UUID PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  monthly_price_usd DECIMAL(10,2) NOT NULL,
  yearly_price_usd DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  max_users INTEGER,
  max_tournaments INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### **Invoices Table** (Store in tenant's currency)
```sql
CREATE TABLE invoices (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  amount_usd DECIMAL(10,2) NOT NULL, -- For reporting
  exchange_rate DECIMAL(10,6) NOT NULL,
  status VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Implementation Examples

### **Backend API: Get Plan Pricing**
```typescript
// GET /api/plans/:planId/pricing?tenantId=xxx
async function getPlanPricing(planId: string, tenantId: string) {
  // 1. Get plan (stored in USD)
  const plan = await db.plans.findById(planId);
  
  // 2. Get tenant's preferred currency
  const tenant = await db.tenants.findById(tenantId);
  const targetCurrency = tenant.preferredCurrency || 'USD';
  
  // 3. Convert to tenant's currency
  const apiKey = process.env.EXCHANGERATE_API_KEY;
  const monthlyPrice = await convertCurrencyLive(
    plan.monthlyPrice,
    'USD',
    targetCurrency,
    apiKey
  );
  
  const yearlyPrice = await convertCurrencyLive(
    plan.yearlyPrice,
    'USD',
    targetCurrency,
    apiKey
  );
  
  // 4. Format for display
  return {
    planId: plan.id,
    planName: plan.displayName,
    currency: targetCurrency,
    monthlyPrice: formatCurrencyLive(monthlyPrice, targetCurrency),
    yearlyPrice: formatCurrencyLive(yearlyPrice, targetCurrency),
    exchangeRate: await getExchangeRateLive('USD', targetCurrency, apiKey)
  };
}
```

### **Frontend: Tenant Settings**
```typescript
// Tenant Admin Dashboard
function CurrencySettings() {
  const [preferredCurrency, setPreferredCurrency] = useState('USD');
  const [displayMultiple, setDisplayMultiple] = useState(false);
  
  const handleSave = async () => {
    await fetch('/api/tenant/settings', {
      method: 'PUT',
      body: JSON.stringify({
        preferredCurrency,
        displayMultipleCurrencies: displayMultiple
      })
    });
  };
  
  return (
    <div className="currency-settings">
      <h2>Currency Preferences</h2>
      
      <label>
        Preferred Currency:
        <select value={preferredCurrency} onChange={e => setPreferredCurrency(e.target.value)}>
          <option value="USD">🇺🇸 US Dollar (USD)</option>
          <option value="EUR">🇪🇺 Euro (EUR)</option>
          <option value="GBP">🇬🇧 British Pound (GBP)</option>
          <option value="NGN">🇳🇬 Nigerian Naira (NGN)</option>
          <option value="KES">🇰🇪 Kenyan Shilling (KES)</option>
          {/* ... more currencies */}
        </select>
      </label>
      
      <label>
        <input
          type="checkbox"
          checked={displayMultiple}
          onChange={e => setDisplayMultiple(e.target.checked)}
        />
        Show prices in multiple currencies
      </label>
      
      <button onClick={handleSave}>Save Settings</button>
    </div>
  );
}
```

### **Frontend: Pricing Display**
```typescript
function PlanCard({ plan, tenant }: { plan: Plan; tenant: Tenant }) {
  const [price, setPrice] = useState<string>('Loading...');
  
  useEffect(() => {
    // Fetch price in tenant's currency
    fetch(`/api/plans/${plan.id}/pricing?tenantId=${tenant.id}`)
      .then(res => res.json())
      .then(data => setPrice(data.monthlyPrice));
  }, [plan.id, tenant.id]);
  
  return (
    <div className="plan-card">
      <h3>{plan.displayName}</h3>
      <div className="price">
        {price}<span>/month</span>
      </div>
      
      {tenant.displayMultipleCurrencies && (
        <div className="alt-prices">
          Also available in: USD, EUR, GBP
        </div>
      )}
    </div>
  );
}
```

## Invoice Generation

### **Strategy: Bill in Tenant's Currency**
```typescript
async function generateInvoice(tenantId: string, planId: string) {
  const tenant = await db.tenants.findById(tenantId);
  const plan = await db.plans.findById(planId);
  
  // Convert from USD to tenant's currency
  const apiKey = process.env.EXCHANGERATE_API_KEY;
  const amount = await convertCurrencyLive(
    plan.monthlyPrice,
    'USD',
    tenant.preferredCurrency,
    apiKey
  );
  
  const exchangeRate = await getExchangeRateLive('USD', tenant.preferredCurrency, apiKey);
  
  // Create invoice in tenant's currency
  const invoice = await db.invoices.create({
    tenantId,
    amount,
    currency: tenant.preferredCurrency,
    amountUsd: plan.monthlyPrice, // For platform reporting
    exchangeRate,
    description: `${plan.displayName} Plan - Monthly`,
    status: 'pending',
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  });
  
  return invoice;
}
```

## Reporting & Analytics

### **Platform Dashboard (Super Admin)**
- View all revenue in **USD** (base currency)
- Compare performance across regions
- Track exchange rate impact on revenue

```typescript
// GET /api/admin/revenue
{
  totalRevenue: 125000.00,
  currency: 'USD',
  breakdown: [
    { region: 'North America', amount: 75000, currency: 'USD' },
    { region: 'Europe', amount: 30000, currency: 'EUR', amountUsd: 32250 },
    { region: 'Africa', amount: 15000000, currency: 'NGN', amountUsd: 18970 }
  ]
}
```

### **Tenant Dashboard**
- View revenue in **tenant's preferred currency**
- See payment history in local currency
- Download invoices in local currency

## Benefits Summary

| Feature | Platform Level | Tenant Level | User Level |
|---------|---------------|--------------|------------|
| **Base Currency** | USD | Configurable | Display only |
| **Pricing Storage** | Always USD | Converted | Converted |
| **Invoice Currency** | USD (reporting) | Tenant's currency | N/A |
| **Exchange Rates** | Platform manages | Auto-updated | Real-time |
| **Flexibility** | Standardized | Localized | Customizable |

## Recommendation

✅ **Implement tenant-level currency management with these principles:**

1. **Store prices in USD** (platform consistency)
2. **Display in tenant's currency** (user experience)
3. **Allow tenant configuration** (flexibility)
4. **Auto-convert with live rates** (accuracy)
5. **Cache exchange rates** (performance)
6. **Fallback to static rates** (reliability)

This approach gives you:
- 🌍 **Global reach** - Support churches worldwide
- 💰 **Local pricing** - Show prices in familiar currency
- 📊 **Unified reporting** - All revenue in USD for analysis
- ⚡ **Performance** - Cached rates reduce API calls
- 🔒 **Reliability** - Fallback rates if API fails

## Next Steps

1. Add `preferredCurrency` field to tenant settings
2. Create currency selection UI in tenant admin
3. Update pricing displays to use tenant currency
4. Generate invoices in tenant currency
5. Store USD equivalent for platform reporting
6. Test with multiple currencies (NGN, GBP, EUR)

---

**Status:** Recommended approach documented. Ready for implementation.
