import { type CurrencyCode } from '@smart-equiz/types';

/**
 * Exchange rate cache
 */
interface ExchangeRateCache {
  rates: Record<string, number>;
  lastUpdated: Date;
  baseCurrency: string;
}

let rateCache: ExchangeRateCache | null = null;
const CACHE_DURATION_MS = 3600000; // 1 hour

/**
 * Fetch live exchange rates from exchangerate-api.io
 * @param apiKey - Your exchangerate-api.io API key
 * @param baseCurrency - Base currency (default: USD)
 * @returns Exchange rates object
 */
export async function fetchExchangeRates(
  apiKey: string,
  baseCurrency: string = 'USD'
): Promise<Record<string, number>> {
  try {
    const response = await fetch(
      `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${baseCurrency}`
    );

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();

    if (data.result === 'error') {
      throw new Error(`API Error: ${data['error-type']}`);
    }

    // Update cache
    rateCache = {
      rates: data.conversion_rates,
      lastUpdated: new Date(),
      baseCurrency
    };

    return data.conversion_rates;
  } catch (error) {
    console.error('Failed to fetch exchange rates:', error);
    
    // Return cached rates if available
    if (rateCache) {
      console.warn('Using cached exchange rates');
      return rateCache.rates;
    }

    // Fall back to hardcoded rates as last resort
    return getFallbackRates();
  }
}

/**
 * Get cached exchange rates or fetch new ones if cache expired
 * @param apiKey - Your exchangerate-api.io API key
 * @param baseCurrency - Base currency (default: USD)
 * @returns Exchange rates object
 */
export async function getExchangeRates(
  apiKey: string,
  baseCurrency: string = 'USD'
): Promise<Record<string, number>> {
  // Return cached rates if still valid
  if (rateCache && 
      rateCache.baseCurrency === baseCurrency &&
      Date.now() - rateCache.lastUpdated.getTime() < CACHE_DURATION_MS) {
    return rateCache.rates;
  }

  // Fetch fresh rates
  return fetchExchangeRates(apiKey, baseCurrency);
}

/**
 * Convert amount using live exchange rates
 * @param amount - Amount to convert
 * @param fromCurrency - Source currency
 * @param toCurrency - Target currency
 * @param apiKey - Your exchangerate-api.io API key
 * @returns Converted amount
 */
export async function convertCurrencyLive(
  amount: number,
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode,
  apiKey: string
): Promise<number> {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  try {
    // Fetch rates with source currency as base
    const rates = await getExchangeRates(apiKey, fromCurrency);
    const rate = rates[toCurrency];

    if (!rate) {
      throw new Error(`Exchange rate not found for ${toCurrency}`);
    }

    return amount * rate;
  } catch (error) {
    console.error('Currency conversion failed:', error);
    
    // Fall back to static conversion
    const { convertCurrency } = await import('./index');
    return convertCurrency(amount, fromCurrency, toCurrency);
  }
}

/**
 * Format currency with live conversion
 * @param amount - Amount to format
 * @param currency - Target currency
 * @param locale - Locale for formatting
 * @param fromCurrency - Source currency for conversion
 * @param apiKey - Your exchangerate-api.io API key
 * @returns Formatted currency string
 */
export async function formatCurrencyLive(
  amount: number,
  currency: CurrencyCode,
  locale: string = 'en-US',
  fromCurrency: CurrencyCode | undefined,
  apiKey: string
): Promise<string> {
  let finalAmount = amount;

  // Convert if source currency specified
  if (fromCurrency && fromCurrency !== currency) {
    finalAmount = await convertCurrencyLive(amount, fromCurrency, currency, apiKey);
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(finalAmount);
}

/**
 * Get specific exchange rate between two currencies
 * @param fromCurrency - Source currency
 * @param toCurrency - Target currency
 * @param apiKey - Your exchangerate-api.io API key
 * @returns Exchange rate
 */
export async function getExchangeRateLive(
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode,
  apiKey: string
): Promise<number> {
  if (fromCurrency === toCurrency) {
    return 1;
  }

  const rates = await getExchangeRates(apiKey, fromCurrency);
  return rates[toCurrency] || 1;
}

/**
 * Clear the exchange rate cache
 * Useful for testing or forcing a refresh
 */
export function clearExchangeRateCache(): void {
  rateCache = null;
}

/**
 * Get cache status information
 * @returns Cache information or null if no cache
 */
export function getCacheInfo(): ExchangeRateCache | null {
  return rateCache;
}

/**
 * Fallback exchange rates (same as in utils/index.ts)
 */
function getFallbackRates(): Record<string, number> {
  return {
    USD: 1.0,
    EUR: 0.92,
    GBP: 0.79,
    CAD: 1.36,
    AUD: 1.53,
    JPY: 149.5,
    INR: 83.12,
    BRL: 4.97,
    MXN: 17.23,
    ZAR: 18.45,
    NGN: 790.5,
    KES: 129.3,
  };
}

/**
 * Validate API key by making a test request
 * @param apiKey - Your exchangerate-api.io API key
 * @returns True if API key is valid
 */
export async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`
    );
    const data = await response.json();
    return data.result === 'success';
  } catch {
    return false;
  }
}

/**
 * Get API quota information
 * @param apiKey - Your exchangerate-api.io API key
 * @returns Quota information
 */
export async function getApiQuota(apiKey: string): Promise<{
  planType: string;
  requestsUsed: number;
  requestsLimit: number;
  requestsRemaining: number;
}> {
  const response = await fetch(
    `https://v6.exchangerate-api.com/v6/${apiKey}/quota`
  );
  const data = await response.json();

  return {
    planType: data.plan_type,
    requestsUsed: data.requests_used,
    requestsLimit: data.requests_limit,
    requestsRemaining: data.requests_remaining
  };
}
