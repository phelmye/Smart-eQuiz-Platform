/**
 * Environment Configuration for Currency Service
 * 
 * Add your exchangerate-api.io API key to your environment variables
 */

/// <reference path="./env.d.ts" />

// For Next.js (apps/marketing-site/.env.local)
// NEXT_PUBLIC_EXCHANGERATE_API_KEY=your_api_key_here

// For Vite (apps/platform-admin/.env and apps/tenant-app/.env)
// VITE_EXCHANGERATE_API_KEY=your_api_key_here

// For backend/API (.env)
// EXCHANGERATE_API_KEY=your_api_key_here

/**
 * Get API key from environment
 * Works in both Next.js and Vite environments
 */
export function getExchangeRateApiKey(): string {
  // Next.js environment
  if (typeof process !== 'undefined' && process.env) {
    const nextKey = process.env.NEXT_PUBLIC_EXCHANGERATE_API_KEY;
    if (nextKey) return nextKey;

    const serverKey = process.env.EXCHANGERATE_API_KEY;
    if (serverKey) return serverKey;
  }

  // Vite environment (client-side)
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    const viteKey = import.meta.env.VITE_EXCHANGERATE_API_KEY;
    if (viteKey) return viteKey;
  }

  throw new Error(
    'Exchange rate API key not found. Please set EXCHANGERATE_API_KEY environment variable.'
  );
}

/**
 * Check if API key is configured
 */
export function hasExchangeRateApiKey(): boolean {
  try {
    getExchangeRateApiKey();
    return true;
  } catch {
    return false;
  }
}
