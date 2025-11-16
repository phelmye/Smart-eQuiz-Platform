/**
 * Environment Configuration for Currency Service
 * 
 * Add your exchangerate-api.io API key to your environment variables
 */

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
  // @ts-ignore - process.env is available in Node.js
  if (typeof process !== 'undefined' && process.env) {
    // @ts-ignore
    const nextKey = process.env.NEXT_PUBLIC_EXCHANGERATE_API_KEY;
    if (nextKey) return nextKey;

    // @ts-ignore
    const serverKey = process.env.EXCHANGERATE_API_KEY;
    if (serverKey) return serverKey;
  }

  // Vite environment (client-side)
  // @ts-ignore - import.meta.env is available in Vite
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    // @ts-ignore
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
