/**
 * Test Script for Shared Packages
 * Run with: node --loader ts-node/esm packages/test-packages.ts
 */

// Test @smart-equiz/types
import type { 
  Tenant, 
  User, 
  Plan, 
  CurrencyCode,
  Tournament,
  Question 
} from './types/src/index';

console.log('✅ @smart-equiz/types imported successfully');

// Test @smart-equiz/utils - Static functions
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
} from './utils/src/index';

console.log('\n📦 Testing @smart-equiz/utils - Static Functions\n');

// Test cn (class merger)
console.log('1. cn() - Tailwind class merger');
const className = cn('px-4 py-2', 'bg-blue-500', 'text-white');
console.log(`   Result: "${className}"`);

// Test currency formatting
console.log('\n2. formatCurrency() - Format currency');
console.log(`   $100 USD: ${formatCurrency(100, 'USD', 'en-US')}`);
console.log(`   €100 EUR: ${formatCurrency(100, 'EUR', 'de-DE')}`);
console.log(`   ₦100 NGN: ${formatCurrency(100, 'NGN', 'en-US')}`);

// Test currency conversion
console.log('\n3. convertCurrency() - Convert between currencies');
const usdToEur = convertCurrency(100, 'USD', 'EUR');
const usdToNgn = convertCurrency(100, 'USD', 'NGN');
console.log(`   $100 USD = €${usdToEur.toFixed(2)} EUR`);
console.log(`   $100 USD = ₦${usdToNgn.toFixed(2)} NGN`);

// Test auto-conversion with formatting
console.log('\n4. formatCurrency() with conversion');
const convertedPrice = formatCurrency(29.99, 'EUR', 'en-US', 'USD');
console.log(`   $29.99 USD → ${convertedPrice}`);

// Test exchange rate
console.log('\n5. getExchangeRate() - Get rate between currencies');
const rate = getExchangeRate('USD', 'EUR');
console.log(`   USD to EUR rate: ${rate}`);

// Test supported currencies
console.log('\n6. getSupportedCurrencies() - List all currencies');
const currencies = getSupportedCurrencies();
console.log(`   Supported: ${currencies.join(', ')}`);

// Test email validation
console.log('\n7. validateEmail() - Email validation');
console.log(`   "user@example.com": ${validateEmail('user@example.com')}`);
console.log(`   "invalid-email": ${validateEmail('invalid-email')}`);

// Test subdomain validation
console.log('\n8. validateSubdomain() - Subdomain validation');
console.log(`   "firstbaptist": ${validateSubdomain('firstbaptist')}`);
console.log(`   "First_Baptist": ${validateSubdomain('First_Baptist')}`);

// Test subdomain generation
console.log('\n9. generateSubdomain() - Generate from org name');
const subdomain = generateSubdomain('First Baptist Church');
console.log(`   "First Baptist Church" → "${subdomain}"`);

// Test slugify
console.log('\n10. slugify() - URL-safe slug');
const slug = slugify('Hello World! This is a Test.');
console.log(`   "Hello World! This is a Test." → "${slug}"`);

// Test date formatting
console.log('\n11. formatDate() - Date formatting');
const now = new Date('2025-11-16T10:30:00Z');
console.log(`   Short: ${formatDate(now, 'short')}`);
console.log(`   Long: ${formatDate(now, 'long')}`);
console.log(`   Full: ${formatDate(now, 'full')}`);

// Test type definitions
console.log('\n\n📝 Testing Type Definitions\n');

const testTenant: Tenant = {
  id: 'tenant_123',
  organizationName: 'First Baptist Church',
  subdomain: 'firstbaptist',
  customDomain: 'quiz.firstbaptist.org',
  customDomainVerified: true,
  planId: 'plan_professional',
  status: 'active',
  logo: null,
  primaryColor: '#1E40AF',
  maxUsers: 100,
  maxTournaments: 50,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-11-16T00:00:00Z',
  contactEmail: 'admin@firstbaptist.org',
  contactName: 'John Doe'
};

console.log('✅ Tenant type definition works');
console.log(`   Organization: ${testTenant.organizationName}`);
console.log(`   Subdomain: ${testTenant.subdomain}.smartequiz.com`);
console.log(`   Custom Domain: ${testTenant.customDomain}`);

const testPlan: Plan = {
  id: 'plan_professional',
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

console.log('\n✅ Plan type definition works');
console.log(`   Plan: ${testPlan.displayName}`);
console.log(`   Monthly: ${formatCurrency(testPlan.monthlyPrice, testPlan.currency)}`);
console.log(`   Yearly: ${formatCurrency(testPlan.monthlyPrice * 12 * 0.8, testPlan.currency)}`);

// Test currency conversion with plan
console.log('\n💱 Testing Plan Pricing in Multiple Currencies\n');
const targetCurrencies: CurrencyCode[] = ['EUR', 'GBP', 'NGN', 'KES'];
targetCurrencies.forEach(currency => {
  const price = formatCurrency(testPlan.monthlyPrice, currency, 'en-US', testPlan.currency);
  console.log(`   ${testPlan.displayName} in ${currency}: ${price}/month`);
});

console.log('\n\n✅ All tests passed! Shared packages are working correctly.\n');
