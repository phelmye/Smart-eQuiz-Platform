import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with conflict resolution
 * @param inputs - Class names to merge
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Currency exchange rates (relative to USD)
 * In production, fetch from an API like exchangerate-api.io or fixer.io
 */
const exchangeRates: Record<string, number> = {
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

/**
 * Convert amount from one currency to another
 * @param amount - Amount to convert
 * @param fromCurrency - Source currency code (default: USD)
 * @param toCurrency - Target currency code (default: USD)
 * @returns Converted amount
 */
export function convertCurrency(
  amount: number,
  fromCurrency: string = 'USD',
  toCurrency: string = 'USD'
): number {
  const fromRate = exchangeRates[fromCurrency.toUpperCase()] || 1;
  const toRate = exchangeRates[toCurrency.toUpperCase()] || 1;
  
  // Convert to USD first, then to target currency
  const usdAmount = amount / fromRate;
  return usdAmount * toRate;
}

/**
 * Format currency with locale support and optional conversion
 * @param amount - Amount to format
 * @param currency - Currency code (default: USD)
 * @param locale - Locale for formatting (default: en-US)
 * @param fromCurrency - Source currency if conversion needed
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US',
  fromCurrency?: string
): string {
  // Convert if source currency is specified
  const finalAmount = fromCurrency
    ? convertCurrency(amount, fromCurrency, currency)
    : amount;

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(finalAmount);
}

/**
 * Get list of supported currencies
 * @returns Array of currency codes
 */
export function getSupportedCurrencies(): string[] {
  return Object.keys(exchangeRates);
}

/**
 * Get exchange rate between two currencies
 * @param fromCurrency - Source currency code
 * @param toCurrency - Target currency code
 * @returns Exchange rate
 */
export function getExchangeRate(
  fromCurrency: string = 'USD',
  toCurrency: string = 'USD'
): number {
  const fromRate = exchangeRates[fromCurrency.toUpperCase()] || 1;
  const toRate = exchangeRates[toCurrency.toUpperCase()] || 1;
  return toRate / fromRate;
}

/**
 * Format date with various formats
 * @param date - Date to format
 * @param format - Format type (short, long, full)
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string,
  format: 'short' | 'long' | 'full' = 'short'
): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  const options: Record<string, Intl.DateTimeFormatOptions> = {
    short: { month: 'short', day: 'numeric', year: 'numeric' },
    long: { month: 'long', day: 'numeric', year: 'numeric' },
    full: {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    },
  };

  return new Intl.DateTimeFormat('en-US', options[format]).format(d);
}

/**
 * Validate email address
 * @param email - Email to validate
 * @returns True if valid email
 */
export function validateEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Validate subdomain (alphanumeric and hyphens only)
 * @param subdomain - Subdomain to validate
 * @returns True if valid subdomain
 */
export function validateSubdomain(subdomain: string): boolean {
  const regex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/;
  return regex.test(subdomain);
}

/**
 * Generate subdomain from organization name
 * @param orgName - Organization name
 * @returns Valid subdomain string
 */
export function generateSubdomain(orgName: string): string {
  return orgName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 63);
}

/**
 * Convert string to URL-safe slug
 * @param text - Text to slugify
 * @returns URL-safe slug
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

/**
 * Parse JWT token (without verification)
 * @param token - JWT token string
 * @returns Decoded payload or null if invalid
 */
export function parseJWT(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
}

/**
 * Debounce function execution
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function execution
 * @param func - Function to throttle
 * @param limit - Time limit in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Re-export currency types
export type { CurrencyCode } from './currency-live.js';

// Export live currency functions
export {
  fetchExchangeRates,
  getExchangeRates,
  convertCurrencyLive,
  formatCurrencyLive,
  getExchangeRateLive,
  clearExchangeRateCache,
  getCacheInfo,
  validateApiKey,
  getApiQuota
} from './currency-live.js';

export {
  getExchangeRateApiKey,
  hasExchangeRateApiKey
} from './currency-config.js';
