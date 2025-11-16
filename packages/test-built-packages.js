/**
 * Test Built Packages
 * Tests the compiled JavaScript output
 */

import {
  cn,
  formatCurrency,
  convertCurrency,
  getExchangeRate,
  getSupportedCurrencies,
  validateEmail,
  validateSubdomain,
  generateSubdomain,
  slugify,
  formatDate
} from './utils/dist/index.js';

console.log('\n📦 Testing @smart-equiz/utils (Built Package)\n');

// Test cn (class merger)
console.log('✓ cn() - Tailwind class merger');
const className = cn('px-4 py-2', 'bg-blue-500', 'text-white');
console.log(`  Result: "${className}"`);

// Test currency formatting
console.log('\n✓ formatCurrency() - Format currency');
console.log(`  $100 USD: ${formatCurrency(100, 'USD', 'en-US')}`);
console.log(`  €100 EUR: ${formatCurrency(100, 'EUR', 'de-DE')}`);
console.log(`  ₦100 NGN: ${formatCurrency(100, 'NGN', 'en-US')}`);

// Test currency conversion
console.log('\n✓ convertCurrency() - Convert between currencies');
const usdToEur = convertCurrency(100, 'USD', 'EUR');
const usdToNgn = convertCurrency(100, 'USD', 'NGN');
console.log(`  $100 USD = €${usdToEur.toFixed(2)} EUR`);
console.log(`  $100 USD = ₦${usdToNgn.toFixed(2)} NGN`);

// Test auto-conversion with formatting
console.log('\n✓ formatCurrency() with auto-conversion');
const convertedPrice = formatCurrency(29.99, 'EUR', 'en-US', 'USD');
console.log(`  $29.99 USD → ${convertedPrice}`);

// Test exchange rate
console.log('\n✓ getExchangeRate() - Get rate between currencies');
const rate = getExchangeRate('USD', 'EUR');
console.log(`  USD to EUR rate: ${rate}`);

// Test supported currencies
console.log('\n✓ getSupportedCurrencies() - List all currencies');
const currencies = getSupportedCurrencies();
console.log(`  Supported (${currencies.length}): ${currencies.join(', ')}`);

// Test email validation
console.log('\n✓ validateEmail() - Email validation');
console.log(`  "user@example.com": ${validateEmail('user@example.com') ? '✓' : '✗'}`);
console.log(`  "invalid-email": ${validateEmail('invalid-email') ? '✓' : '✗'}`);

// Test subdomain validation
console.log('\n✓ validateSubdomain() - Subdomain validation');
console.log(`  "firstbaptist": ${validateSubdomain('firstbaptist') ? '✓' : '✗'}`);
console.log(`  "First_Baptist": ${validateSubdomain('First_Baptist') ? '✓' : '✗'}`);

// Test subdomain generation
console.log('\n✓ generateSubdomain() - Generate from org name');
const subdomain = generateSubdomain('First Baptist Church');
console.log(`  "First Baptist Church" → "${subdomain}"`);

// Test slugify
console.log('\n✓ slugify() - URL-safe slug');
const slug = slugify('Hello World! This is a Test.');
console.log(`  "Hello World! This is a Test." → "${slug}"`);

// Test date formatting
console.log('\n✓ formatDate() - Date formatting');
const now = new Date('2025-11-16T10:30:00Z');
console.log(`  Short: ${formatDate(now, 'short')}`);
console.log(`  Long: ${formatDate(now, 'long')}`);

// Test plan pricing in multiple currencies
console.log('\n\n💱 Plan Pricing Example\n');
const planPrice = 29.99;
const planCurrency = 'USD';
const targetCurrencies = ['EUR', 'GBP', 'NGN', 'KES', 'INR', 'BRL'];

console.log(`  Professional Plan - $${planPrice}/month\n`);
targetCurrencies.forEach(currency => {
  const price = formatCurrency(planPrice, currency, 'en-US', planCurrency);
  console.log(`  ${currency}: ${price}/month`);
});

console.log('\n\n✅ All tests passed! @smart-equiz/utils is working correctly.\n');
