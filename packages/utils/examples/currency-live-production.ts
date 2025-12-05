/**
 * Production Example: Using Live Exchange Rates
 * 
 * This demonstrates how to use the live exchange rate service
 * with your exchangerate-api.io API key
 */

import {
  formatCurrencyLive,
  convertCurrencyLive,
  getExchangeRateLive,
  getExchangeRates,
  validateApiKey,
  getApiQuota,
  clearExchangeRateCache,
  getCacheInfo,
  getExchangeRateApiKey
} from '@smart-equiz/utils';
import type { CurrencyCode, Plan } from '@smart-equiz/types';

// ============================================================================
// SETUP: Get API key from environment
// ============================================================================

const API_KEY = getExchangeRateApiKey();

// ============================================================================
// EXAMPLE 1: Display plan pricing with live rates
// ============================================================================

async function displayPlanPricingLive(plan: Plan, userCurrency: CurrencyCode) {
  // Convert prices using live exchange rates
  const monthlyPrice = await formatCurrencyLive(
    plan.monthlyPrice,
    userCurrency,
    'en-US',
    plan.currency,
    API_KEY
  );

  const yearlyPrice = await formatCurrencyLive(
    plan.monthlyPrice * 12 * (1 - plan.yearlyDiscountPercent / 100),
    userCurrency,
    'en-US',
    plan.currency,
    API_KEY
  );

  const exchangeRate = await getExchangeRateLive(plan.currency, userCurrency, API_KEY);

  return {
    monthlyPrice,
    yearlyPrice,
    currency: userCurrency,
    exchangeRate,
    lastUpdated: getCacheInfo()?.lastUpdated
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

displayPlanPricingLive(plan, 'EUR').then(console.log);
// {
//   monthlyPrice: "€27.61" (live rate),
//   yearlyPrice: "€265.46" (live rate),
//   currency: "EUR",
//   exchangeRate: 0.9208,
//   lastUpdated: 2025-11-16T10:30:00.000Z
// }

// ============================================================================
// EXAMPLE 2: API key validation on startup
// ============================================================================

async function initializeCurrencyService() {
  console.log('Validating exchange rate API key...');
  
  const isValid = await validateApiKey(API_KEY);
  
  if (!isValid) {
    console.error('❌ Invalid API key! Currency conversion will use fallback rates.');
    return false;
  }

  console.log('✅ API key validated successfully');

  // Check quota
  const quota = await getApiQuota(API_KEY);
  console.log(`📊 API Quota: ${quota.requestsRemaining}/${quota.requestsLimit} requests remaining`);
  console.log(`📋 Plan Type: ${quota.planType}`);

  // Pre-fetch rates for common currencies
  console.log('🔄 Pre-fetching exchange rates...');
  await getExchangeRates(API_KEY, 'USD');
  console.log('✅ Exchange rates cached');

  return true;
}

// Run on app startup
initializeCurrencyService();

// ============================================================================
// EXAMPLE 3: React component with live rates
// ============================================================================

/*
import { useEffect, useState } from 'react';
import { formatCurrencyLive, getExchangeRateApiKey } from '@smart-equiz/utils';
import type { CurrencyCode } from '@smart-equiz/types';

function PricingCard({ plan, userCurrency }: { plan: Plan; userCurrency: CurrencyCode }) {
  const [price, setPrice] = useState<string>('Loading...');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const apiKey = getExchangeRateApiKey();
    
    formatCurrencyLive(
      plan.monthlyPrice,
      userCurrency,
      'en-US',
      plan.currency,
      apiKey
    )
      .then(setPrice)
      .catch(() => setPrice('Price unavailable'))
      .finally(() => setLoading(false));
  }, [plan, userCurrency]);

  return (
    <div className="pricing-card">
      <h3>{plan.displayName}</h3>
      <div className="price">
        {loading ? (
          <span className="loading">Loading...</span>
        ) : (
          <span>{price}/month</span>
        )}
      </div>
      <p>{plan.description}</p>
    </div>
  );
}
*/

// ============================================================================
// EXAMPLE 4: Backend API endpoint for currency conversion
// ============================================================================

/*
// Express.js example
import express from 'express';
import { convertCurrencyLive, getExchangeRateApiKey } from '@smart-equiz/utils';

const app = express();
const API_KEY = getExchangeRateApiKey();

// GET /api/convert?amount=100&from=USD&to=EUR
app.get('/api/convert', async (req, res) => {
  try {
    const { amount, from, to } = req.query;
    
    const converted = await convertCurrencyLive(
      parseFloat(amount as string),
      from as CurrencyCode,
      to as CurrencyCode,
      API_KEY
    );

    res.json({
      success: true,
      original: { amount: parseFloat(amount as string), currency: from },
      converted: { amount: converted, currency: to },
      rate: converted / parseFloat(amount as string)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Currency conversion failed'
    });
  }
});

// GET /api/exchange-rates
app.get('/api/exchange-rates', async (req, res) => {
  try {
    const { base = 'USD' } = req.query;
    const rates = await getExchangeRates(API_KEY, base as string);
    const cacheInfo = getCacheInfo();

    res.json({
      success: true,
      base,
      rates,
      lastUpdated: cacheInfo?.lastUpdated,
      cached: true
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch exchange rates'
    });
  }
});
*/

// ============================================================================
// EXAMPLE 5: Scheduled rate updates (cron job)
// ============================================================================

/*
import cron from 'node-cron';
import { getExchangeRates, clearExchangeRateCache, getExchangeRateApiKey } from '@smart-equiz/utils';

const API_KEY = getExchangeRateApiKey();

// Update rates every hour
cron.schedule('0 * * * *', async () => {
  console.log('🔄 Updating exchange rates...');
  
  try {
    // Clear cache to force fresh fetch
    clearExchangeRateCache();
    
    // Fetch new rates
    const rates = await getExchangeRates(API_KEY, 'USD');
    
    // Optionally store in database for audit trail
    // await db.exchangeRateHistory.create({
    //   rates,
    //   timestamp: new Date()
    // });
    
    console.log('✅ Exchange rates updated successfully');
  } catch (error) {
    console.error('❌ Failed to update exchange rates:', error);
  }
});
*/

// ============================================================================
// EXAMPLE 6: Multi-currency checkout flow
// ============================================================================

async function processCheckout(
  planId: string,
  userCurrency: CurrencyCode,
  billingCycle: 'monthly' | 'yearly'
) {
  // Fetch plan details
  // const plan = await db.plans.findById(planId);
  
  const planPrice = billingCycle === 'monthly' ? plan.monthlyPrice : plan.monthlyPrice * 12;
  
  // Convert to user's currency with live rates
  const localAmount = await convertCurrencyLive(
    planPrice,
    plan.currency,
    userCurrency,
    API_KEY
  );

  const formattedAmount = await formatCurrencyLive(
    planPrice,
    userCurrency,
    'en-US',
    plan.currency,
    API_KEY
  );

  const exchangeRate = await getExchangeRateLive(plan.currency, userCurrency, API_KEY);

  return {
    planId,
    planName: plan.displayName,
    billingCycle,
    originalAmount: planPrice,
    originalCurrency: plan.currency,
    localAmount,
    localCurrency: userCurrency,
    formattedAmount,
    exchangeRate,
    displayText: `${formattedAmount}/${billingCycle}`
  };
}

// Usage:
processCheckout('plan_professional', 'NGN', 'monthly').then(console.log);
// {
//   planId: "plan_professional",
//   planName: "Professional",
//   billingCycle: "monthly",
//   originalAmount: 29.99,
//   originalCurrency: "USD",
//   localAmount: 23710.50,
//   localCurrency: "NGN",
//   formattedAmount: "₦23,710.50",
//   exchangeRate: 790.5,
//   displayText: "₦23,710.50/monthly"
// }

// ============================================================================
// EXAMPLE 7: Currency selector with live rates
// ============================================================================

async function getCurrencyOptions(baseAmount: number, baseCurrency: CurrencyCode) {
  const currencies: CurrencyCode[] = ['USD', 'EUR', 'GBP', 'NGN', 'KES', 'INR', 'BRL'];
  
  const options = await Promise.all(
    currencies.map(async (currency) => {
      const amount = await convertCurrencyLive(
        baseAmount,
        baseCurrency,
        currency,
        API_KEY
      );
      
      const formatted = await formatCurrencyLive(
        baseAmount,
        currency,
        'en-US',
        baseCurrency,
        API_KEY
      );

      return {
        code: currency,
        amount,
        formatted,
        symbol: getCurrencySymbol(currency)
      };
    })
  );

  return options;
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

// Usage:
getCurrencyOptions(29.99, 'USD').then(console.log);
// [
//   { code: "USD", amount: 29.99, formatted: "$29.99", symbol: "$" },
//   { code: "EUR", amount: 27.61, formatted: "€27.61", symbol: "€" },
//   { code: "GBP", amount: 23.69, formatted: "£23.69", symbol: "£" },
//   { code: "NGN", amount: 23710.50, formatted: "₦23,710.50", symbol: "₦" },
//   ...
// ]

// ============================================================================
// EXAMPLE 8: Error handling and fallbacks
// ============================================================================

async function safeCurrencyConversion(
  amount: number,
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode
) {
  try {
    // Try live conversion first
    return await convertCurrencyLive(amount, fromCurrency, toCurrency, API_KEY);
  } catch (error) {
    console.warn('Live conversion failed, using fallback rates:', error);
    
    // Import static conversion as fallback
    const { convertCurrency } = await import('@smart-equiz/utils');
    return convertCurrency(amount, fromCurrency, toCurrency);
  }
}

// ============================================================================
// MONITORING: Track API usage
// ============================================================================

async function monitorApiUsage() {
  try {
    const quota = await getApiQuota(API_KEY);
    
    const usagePercent = (quota.requestsUsed / quota.requestsLimit) * 100;
    
    console.log(`📊 Exchange Rate API Usage:`);
    console.log(`   Plan: ${quota.planType}`);
    console.log(`   Used: ${quota.requestsUsed}/${quota.requestsLimit} (${usagePercent.toFixed(1)}%)`);
    console.log(`   Remaining: ${quota.requestsRemaining}`);
    
    // Alert if usage is high
    if (usagePercent > 80) {
      console.warn('⚠️  WARNING: API quota usage above 80%!');
      // Send alert to admin
    }
    
    return quota;
  } catch (error) {
    console.error('Failed to check API quota:', error);
  }
}

// Run daily
// cron.schedule('0 0 * * *', monitorApiUsage);

export {
  displayPlanPricingLive,
  initializeCurrencyService,
  processCheckout,
  getCurrencyOptions,
  safeCurrencyConversion,
  monitorApiUsage
};
