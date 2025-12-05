/**
 * Currency Conversion Examples
 * 
 * This file demonstrates how to use the currency utilities
 * in different scenarios across the Smart eQuiz Platform.
 */

import { 
  formatCurrency, 
  convertCurrency, 
  getExchangeRate,
  getSupportedCurrencies 
} from '@smart-equiz/utils';
import type { CurrencyCode, Plan, Invoice } from '@smart-equiz/types';

// ============================================================================
// EXAMPLE 1: Display pricing in user's preferred currency
// ============================================================================

function displayPlanPricing(plan: Plan, userCurrency: CurrencyCode) {
  // Plan prices are stored in USD, convert to user's currency
  const monthlyPrice = formatCurrency(
    plan.monthlyPrice,
    userCurrency,
    'en-US',
    plan.currency // Source currency (USD)
  );

  const yearlyPrice = formatCurrency(
    plan.monthlyPrice * 12 * (1 - plan.yearlyDiscountPercent / 100),
    userCurrency,
    'en-US',
    plan.currency
  );

  return {
    monthlyPrice,
    yearlyPrice,
    currency: userCurrency
  };
}

// Usage:
const plan: Plan = {
  id: '1',
  name: 'professional',
  displayName: 'Professional',
  description: 'For growing churches',
  monthlyPrice: 29.99,
  yearlyDiscountPercent: 20,
  billingOptions: ['monthly', 'yearly'],
  currency: 'USD',
  maxUsers: 100,
  maxTournaments: 50,
  maxQuestionsPerTournament: 100,
  maxQuestionCategories: 20,
  features: ['Custom branding', 'Analytics', 'Priority support'],
  isDefault: false,
  isActive: true,
  createdAt: '2025-01-01T00:00:00Z'
};

console.log(displayPlanPricing(plan, 'EUR'));
// { monthlyPrice: "€27.58", yearlyPrice: "€265.14", currency: "EUR" }

console.log(displayPlanPricing(plan, 'NGN'));
// { monthlyPrice: "₦23,710.50", yearlyPrice: "₦227,620.80", currency: "NGN" }

// ============================================================================
// EXAMPLE 2: Multi-currency pricing table
// ============================================================================

function generatePricingTable(plans: Plan[]) {
  const currencies: CurrencyCode[] = ['USD', 'EUR', 'GBP', 'NGN', 'KES'];

  return plans.map(plan => ({
    planName: plan.displayName,
    prices: currencies.reduce((acc, currency) => {
      acc[currency] = formatCurrency(
        plan.monthlyPrice,
        currency,
        'en-US',
        plan.currency
      );
      return acc;
    }, {} as Record<CurrencyCode, string>)
  }));
}

// Usage:
const pricingTable = generatePricingTable([plan]);
console.log(pricingTable);
/*
[
  {
    planName: "Professional",
    prices: {
      USD: "$29.99",
      EUR: "€27.58",
      GBP: "£23.69",
      NGN: "₦23,710.50",
      KES: "KSh3,877.57"
    }
  }
]
*/

// ============================================================================
// EXAMPLE 3: Invoice with currency conversion
// ============================================================================

function convertInvoice(invoice: Invoice, targetCurrency: CurrencyCode) {
  const convertedAmount = convertCurrency(
    invoice.amount,
    invoice.currency,
    targetCurrency
  );

  return {
    ...invoice,
    originalAmount: formatCurrency(invoice.amount, invoice.currency),
    convertedAmount: formatCurrency(convertedAmount, targetCurrency),
    targetCurrency,
    exchangeRate: getExchangeRate(invoice.currency, targetCurrency)
  };
}

// Usage:
const invoice: Invoice = {
  id: 'inv_001',
  tenantId: 'tenant_123',
  number: 'INV-2025-001',
  amount: 299.99,
  currency: 'USD',
  status: 'paid',
  dueDate: '2025-02-01',
  paidDate: '2025-01-28',
  description: 'Monthly subscription - January 2025',
  items: [
    {
      description: 'Professional Plan',
      quantity: 1,
      unitPrice: 299.99,
      total: 299.99,
      currency: 'USD'
    }
  ],
  createdAt: '2025-01-01T00:00:00Z'
};

console.log(convertInvoice(invoice, 'EUR'));
/*
{
  ...invoice,
  originalAmount: "$299.99",
  convertedAmount: "€275.99",
  targetCurrency: "EUR",
  exchangeRate: 0.92
}
*/

// ============================================================================
// EXAMPLE 4: Real-time currency selector
// ============================================================================

function CurrencySelector() {
  const supportedCurrencies = getSupportedCurrencies();

  return {
    currencies: supportedCurrencies.map((code: CurrencyCode) => ({
      code,
      name: getCurrencyName(code),
      symbol: getCurrencySymbol(code)
    }))
  };
}

function getCurrencyName(code: CurrencyCode): string {
  const names: Record<CurrencyCode, string> = {
    USD: 'US Dollar',
    EUR: 'Euro',
    GBP: 'British Pound',
    CAD: 'Canadian Dollar',
    AUD: 'Australian Dollar',
    JPY: 'Japanese Yen',
    INR: 'Indian Rupee',
    BRL: 'Brazilian Real',
    MXN: 'Mexican Peso',
    ZAR: 'South African Rand',
    NGN: 'Nigerian Naira',
    KES: 'Kenyan Shilling'
  };
  return names[code];
}

function getCurrencySymbol(code: CurrencyCode): string {
  const symbols: Record<CurrencyCode, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    CAD: 'CA$',
    AUD: 'A$',
    JPY: '¥',
    INR: '₹',
    BRL: 'R$',
    MXN: 'MX$',
    ZAR: 'R',
    NGN: '₦',
    KES: 'KSh'
  };
  return symbols[code];
}

// ============================================================================
// EXAMPLE 5: Backend API integration with real-time rates
// ============================================================================

/**
 * In production, fetch rates from an external API
 * Update this function to connect to your preferred provider
 */
async function fetchLiveExchangeRates(): Promise<Record<string, number>> {
  // Option 1: exchangerate-api.io (Free tier available)
  const response = await fetch(
    'https://api.exchangerate-api.com/v4/latest/USD'
  );
  const data = await response.json();
  return data.rates;

  // Option 2: fixer.io (More accurate, requires API key)
  // const response = await fetch(
  //   `https://api.fixer.io/latest?base=USD&access_key=${API_KEY}`
  // );
  // const data = await response.json();
  // return data.rates;
}

/**
 * Cache exchange rates in Redis or database
 * Refresh daily or hourly based on requirements
 */
async function updateExchangeRates() {
  try {
    const rates = await fetchLiveExchangeRates();
    
    // Store in database
    // await db.exchangeRates.upsert({
    //   rates,
    //   updatedAt: new Date()
    // });

    console.log('Exchange rates updated:', rates);
    return rates;
  } catch (error) {
    console.error('Failed to update exchange rates:', error);
    // Fall back to cached rates
  }
}

// ============================================================================
// EXAMPLE 6: Tenant-specific currency settings
// ============================================================================

interface TenantCurrencySettings {
  tenantId: string;
  preferredCurrency: CurrencyCode;
  displayMultipleCurrencies: boolean;
  allowCurrencySelection: boolean;
}

function applyTenantCurrencySettings(
  amount: number,
  sourceCurrency: CurrencyCode,
  settings: TenantCurrencySettings
) {
  if (settings.displayMultipleCurrencies) {
    // Show price in multiple currencies
    const currencies: CurrencyCode[] = ['USD', 'EUR', 'GBP', settings.preferredCurrency];
    return Array.from(new Set(currencies)).map(currency => ({
      currency,
      amount: formatCurrency(amount, currency, 'en-US', sourceCurrency)
    }));
  }

  // Show only preferred currency
  return [{
    currency: settings.preferredCurrency,
    amount: formatCurrency(amount, settings.preferredCurrency, 'en-US', sourceCurrency)
  }];
}

// Usage:
const tenantSettings: TenantCurrencySettings = {
  tenantId: 'tenant_firstbaptist',
  preferredCurrency: 'USD',
  displayMultipleCurrencies: true,
  allowCurrencySelection: true
};

console.log(applyTenantCurrencySettings(99.99, 'USD', tenantSettings));
/*
[
  { currency: "USD", amount: "$99.99" },
  { currency: "EUR", amount: "€91.99" },
  { currency: "GBP", amount: "£78.99" }
]
*/

// ============================================================================
// EXAMPLE 7: Dynamic pricing based on user location
// ============================================================================

function getPricingForLocation(
  plan: Plan,
  countryCode: string
): { amount: string; currency: CurrencyCode } {
  // Map country codes to currencies
  const countryToCurrency: Record<string, CurrencyCode> = {
    'US': 'USD',
    'GB': 'GBP',
    'EU': 'EUR',
    'NG': 'NGN',
    'KE': 'KES',
    'IN': 'INR',
    'BR': 'BRL',
    'MX': 'MXN',
    'ZA': 'ZAR',
    'CA': 'CAD',
    'AU': 'AUD',
    'JP': 'JPY'
  };

  const currency = countryToCurrency[countryCode] || 'USD';
  const amount = formatCurrency(
    plan.monthlyPrice,
    currency,
    'en-US',
    plan.currency
  );

  return { amount, currency };
}

// Usage:
console.log(getPricingForLocation(plan, 'NG'));
// { amount: "₦23,710.50", currency: "NGN" }

console.log(getPricingForLocation(plan, 'GB'));
// { amount: "£23.69", currency: "GBP" }

// ============================================================================
// EXPORT UTILITY FUNCTIONS
// ============================================================================

export {
  displayPlanPricing,
  generatePricingTable,
  convertInvoice,
  CurrencySelector,
  getCurrencyName,
  getCurrencySymbol,
  fetchLiveExchangeRates,
  updateExchangeRates,
  applyTenantCurrencySettings,
  getPricingForLocation
};
