# @smart-equiz/utils

Shared utility functions for Smart eQuiz Platform.

## Installation

```bash
pnpm add @smart-equiz/utils
```

## Usage

### Class Name Utilities

```typescript
import { cn } from '@smart-equiz/utils';

// Merge Tailwind CSS classes with conflict resolution
const className = cn('px-4 py-2', 'bg-blue-500', {
  'text-white': true,
  'rounded-lg': isRounded
});
```

### Currency Functions

#### Static Rates (Development)

```typescript
import { 
  formatCurrency, 
  convertCurrency, 
  getExchangeRate,
  getSupportedCurrencies 
} from '@smart-equiz/utils';

// Format currency
formatCurrency(99.99, 'USD', 'en-US'); // "$99.99"
formatCurrency(99.99, 'EUR', 'de-DE'); // "99,99 €"

// Auto-convert and format from USD to any currency
formatCurrency(100, 'EUR', 'en-US', 'USD'); // "€92.00" (converted from $100)
formatCurrency(100, 'GBP', 'en-GB', 'USD'); // "£79.00" (converted from $100)

// Direct conversion
convertCurrency(100, 'USD', 'EUR'); // 92
convertCurrency(100, 'USD', 'GBP'); // 79

// Get exchange rate
getExchangeRate('USD', 'EUR'); // 0.92
getExchangeRate('GBP', 'USD'); // 1.27

// Get supported currencies
getSupportedCurrencies(); // ['USD', 'EUR', 'GBP', 'CAD', ...]
```

#### Live Rates (Production)

```typescript
import { 
  formatCurrencyLive, 
  convertCurrencyLive, 
  getExchangeRateLive,
  getExchangeRates,
  validateApiKey,
  getApiQuota,
  getExchangeRateApiKey
} from '@smart-equiz/utils';

// Get API key from environment
const API_KEY = getExchangeRateApiKey();

// Format with live conversion
await formatCurrencyLive(100, 'EUR', 'en-US', 'USD', API_KEY); // "€92.08" (real-time rate)

// Convert with live rates
await convertCurrencyLive(100, 'USD', 'EUR', API_KEY); // 92.08

// Get live exchange rate
await getExchangeRateLive('USD', 'EUR', API_KEY); // 0.9208

// Fetch all rates (cached for 1 hour)
await getExchangeRates(API_KEY, 'USD'); // { EUR: 0.9208, GBP: 0.7895, ... }

// Validate API key
await validateApiKey(API_KEY); // true

// Check quota
await getApiQuota(API_KEY);
// {
//   planType: 'free',
//   requestsUsed: 150,
//   requestsLimit: 1500,
//   requestsRemaining: 1350
// }
```

#### Supported Currencies

- USD - US Dollar
- EUR - Euro
- GBP - British Pound
- CAD - Canadian Dollar
- AUD - Australian Dollar
- JPY - Japanese Yen
- INR - Indian Rupee
- BRL - Brazilian Real
- MXN - Mexican Peso
- ZAR - South African Rand
- NGN - Nigerian Naira
- KES - Kenyan Shilling

### Getting Started with Live Exchange Rates

#### 1. Get Your FREE API Key

Sign up at [exchangerate-api.com](https://www.exchangerate-api.com/) to get your free API key:
- **Free Tier**: 1,500 requests/month
- No credit card required
- Real-time exchange rates
- 161 currencies supported

#### 2. Configure Environment Variables

Add your API key to `.env.local` (Next.js) or `.env` (Vite):

```bash
# For Marketing Site (Next.js)
NEXT_PUBLIC_EXCHANGERATE_API_KEY=your_api_key_here

# For Platform Admin & Tenant App (Vite)
VITE_EXCHANGERATE_API_KEY=your_api_key_here

# For Backend/API
EXCHANGERATE_API_KEY=your_api_key_here
```

#### 3. Use in Your Application

```typescript
import { formatCurrencyLive, getExchangeRateApiKey } from '@smart-equiz/utils';

const API_KEY = getExchangeRateApiKey();

// Convert and format with live rates
const price = await formatCurrencyLive(29.99, 'EUR', 'en-US', 'USD', API_KEY);
console.log(price); // "€27.61" (real-time rate)
```

#### 4. Cache & Performance

- Rates are automatically cached for **1 hour**
- Reduces API calls and improves performance
- Falls back to static rates if API fails
- Free tier: 1,500 requests/month = ~50 requests/day

**Note:** Exchange rates are hardcoded for development. In production, integrate with a real-time exchange rate API like:
- [exchangerate-api.io](https://www.exchangerate-api.com/)
- [fixer.io](https://fixer.io/)
- [openexchangerates.org](https://openexchangerates.org/)

### Date Formatting

```typescript
import { formatDate } from '@smart-equiz/utils';

formatDate(new Date(), 'short');  // "Nov 16, 2025"
formatDate(new Date(), 'long');   // "November 16, 2025"
formatDate(new Date(), 'full');   // "Saturday, November 16, 2025, 10:30 AM"
```

### Validation

```typescript
import { validateEmail, validateSubdomain } from '@smart-equiz/utils';

validateEmail('user@example.com');     // true
validateEmail('invalid-email');        // false

validateSubdomain('firstbaptist');     // true
validateSubdomain('first_baptist');    // false (no underscores)
validateSubdomain('First-Baptist');    // false (no uppercase)
```

### String Utilities

```typescript
import { slugify, generateSubdomain } from '@smart-equiz/utils';

slugify('Hello World!');                      // "hello-world"
generateSubdomain('First Baptist Church');    // "first-baptist-church"
```

### JWT Parsing

```typescript
import { parseJWT } from '@smart-equiz/utils';

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
const payload = parseJWT(token);
console.log(payload.tenantId, payload.userId);
```

### Performance Utilities

```typescript
import { debounce, throttle } from '@smart-equiz/utils';

// Debounce - Execute after user stops typing
const debouncedSearch = debounce((query: string) => {
  fetchResults(query);
}, 300);

// Throttle - Execute at most once per time period
const throttledScroll = throttle(() => {
  updateScrollPosition();
}, 100);
```

## Development

```bash
# Build the package
pnpm build

# Watch mode
pnpm dev

# Clean build artifacts
pnpm clean
```

## API Reference

### Currency Functions

#### `formatCurrency(amount, currency?, locale?, fromCurrency?)`
Format a number as currency with optional automatic conversion.

**Parameters:**
- `amount` (number): Amount to format
- `currency` (string, optional): Target currency code (default: 'USD')
- `locale` (string, optional): Locale for formatting (default: 'en-US')
- `fromCurrency` (string, optional): Source currency if conversion needed

**Returns:** Formatted currency string

#### `convertCurrency(amount, fromCurrency?, toCurrency?)`
Convert amount between currencies.

**Parameters:**
- `amount` (number): Amount to convert
- `fromCurrency` (string, optional): Source currency (default: 'USD')
- `toCurrency` (string, optional): Target currency (default: 'USD')

**Returns:** Converted amount as number

#### `getExchangeRate(fromCurrency?, toCurrency?)`
Get exchange rate between two currencies.

**Parameters:**
- `fromCurrency` (string, optional): Source currency (default: 'USD')
- `toCurrency` (string, optional): Target currency (default: 'USD')

**Returns:** Exchange rate as number

#### `getSupportedCurrencies()`
Get list of supported currency codes.

**Returns:** Array of currency code strings

### Production Integration

To use real-time exchange rates in production:

```typescript
// Example: Fetch from exchangerate-api.io
async function fetchExchangeRates() {
  const response = await fetch(
    'https://api.exchangerate-api.com/v4/latest/USD'
  );
  const data = await response.json();
  return data.rates; // { EUR: 0.92, GBP: 0.79, ... }
}

// Update rates in your backend
// Store in database or cache (Redis)
// Refresh daily or hourly depending on requirements
```

## License

PROPRIETARY - Smart eQuiz Platform Team
