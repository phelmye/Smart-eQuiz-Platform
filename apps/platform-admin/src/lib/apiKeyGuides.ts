// API Key Documentation Links and Instructions

export interface APIKeyGuide {
  service: string;
  provider: string;
  signupUrl: string;
  docsUrl: string;
  instructions: string[];
  testingInfo?: string;
}

export const API_KEY_GUIDES: Record<string, APIKeyGuide> = {
  currencyConverter: {
    service: 'Currency Conversion',
    provider: 'ExchangeRate-API',
    signupUrl: 'https://www.exchangerate-api.com/',
    docsUrl: 'https://www.exchangerate-api.com/docs/overview',
    instructions: [
      'Sign up for free account at exchangerate-api.com',
      'Free tier: 1,500 requests/month',
      'Click "Get Free API Key" button',
      'Verify email address',
      'Copy API key from dashboard',
      'Paste key in the field above'
    ],
    testingInfo: 'Test with: curl "https://v6.exchangerate-api.com/v6/YOUR-API-KEY/latest/USD"'
  },
  openai: {
    service: 'OpenAI GPT Models',
    provider: 'OpenAI',
    signupUrl: 'https://platform.openai.com/signup',
    docsUrl: 'https://platform.openai.com/docs/introduction',
    instructions: [
      'Create account at platform.openai.com',
      'Go to API Keys section (platform.openai.com/api-keys)',
      'Click "+ Create new secret key"',
      'Name your key (e.g., "Smart eQuiz Production")',
      'Copy the key immediately (shown only once)',
      'Add billing information and credits ($5 minimum)',
      'Set monthly spending limits in Settings'
    ],
    testingInfo: 'Pricing: GPT-4: $0.03/1K tokens input, GPT-3.5-turbo: $0.0015/1K tokens'
  },
  anthropic: {
    service: 'Anthropic Claude',
    provider: 'Anthropic',
    signupUrl: 'https://console.anthropic.com/',
    docsUrl: 'https://docs.anthropic.com/claude/docs',
    instructions: [
      'Sign up at console.anthropic.com',
      'Navigate to API Keys in settings',
      'Click "Create Key"',
      'Name the key and copy it',
      'Add credits to your account ($5 minimum)',
      'Monitor usage in console dashboard'
    ],
    testingInfo: 'Pricing: Claude Opus: $15/$75 per million tokens (input/output)'
  },
  supabase: {
    service: 'Supabase (Auth & Database)',
    provider: 'Supabase',
    signupUrl: 'https://supabase.com/dashboard',
    docsUrl: 'https://supabase.com/docs',
    instructions: [
      'Sign up/login at supabase.com',
      'Create new project or select existing',
      'Go to Settings → API',
      'Copy Project URL (e.g., https://xxx.supabase.co)',
      'Copy "anon public" key for client-side',
      'Copy "service_role" key for server-side (keep secret!)',
      'Configure Row Level Security (RLS) policies'
    ],
    testingInfo: 'Free tier: 500MB database, 1GB file storage, 50,000 monthly active users'
  },
  stripe: {
    service: 'Stripe Payments',
    provider: 'Stripe',
    signupUrl: 'https://dashboard.stripe.com/register',
    docsUrl: 'https://stripe.com/docs/api',
    instructions: [
      'Create Stripe account at stripe.com',
      'Complete business verification',
      'Go to Developers → API Keys',
      'Use TEST keys first (pk_test_... and sk_test_...)',
      'For production: Copy Publishable key (pk_live_...)',
      'Copy Secret key (sk_live_...)',
      'Go to Developers → Webhooks to get webhook secret',
      'Add webhook endpoint: your-domain.com/api/webhooks/stripe'
    ],
    testingInfo: 'Test mode: Use card 4242 4242 4242 4242, any future date, any CVV'
  },
  paystack: {
    service: 'Paystack (African Payments)',
    provider: 'Paystack',
    signupUrl: 'https://dashboard.paystack.com/signup',
    docsUrl: 'https://paystack.com/docs/api/',
    instructions: [
      'Sign up at paystack.com (Nigeria, Ghana, South Africa, Kenya)',
      'Verify business documents',
      'Go to Settings → API Keys & Webhooks',
      'Copy Public Key (pk_test_... or pk_live_...)',
      'Copy Secret Key (sk_test_... or sk_live_...)',
      'Set webhook URL for payment notifications'
    ],
    testingInfo: 'Test mode: Use test keys for sandbox transactions'
  },
  flutterwave: {
    service: 'Flutterwave (Multi-currency)',
    provider: 'Flutterwave',
    signupUrl: 'https://dashboard.flutterwave.com/signup',
    docsUrl: 'https://developer.flutterwave.com/docs',
    instructions: [
      'Create account at flutterwave.com',
      'Complete KYC verification',
      'Go to Settings → API',
      'Copy Public Key',
      'Copy Secret Key',
      'Copy Encryption Key (for card payments)',
      'Configure webhook URL'
    ],
    testingInfo: 'Supports 150+ countries and 30+ currencies'
  },
  sendgrid: {
    service: 'SendGrid Email',
    provider: 'Twilio SendGrid',
    signupUrl: 'https://signup.sendgrid.com/',
    docsUrl: 'https://docs.sendgrid.com/api-reference',
    instructions: [
      'Sign up at sendgrid.com',
      'Verify sender email address',
      'Go to Settings → API Keys',
      'Click "Create API Key"',
      'Choose "Restricted Access" and select permissions',
      'Copy key immediately (shown only once)',
      'Configure sender authentication (SPF/DKIM)'
    ],
    testingInfo: 'Free tier: 100 emails/day forever'
  },
  mailgun: {
    service: 'Mailgun Email',
    provider: 'Mailgun',
    signupUrl: 'https://signup.mailgun.com/',
    docsUrl: 'https://documentation.mailgun.com/en/latest/',
    instructions: [
      'Sign up at mailgun.com',
      'Verify domain or use sandbox domain',
      'Go to Settings → API Keys',
      'Copy Private API Key',
      'Note your domain name (e.g., mg.yourdomain.com)',
      'Configure DNS records (MX, TXT, CNAME)'
    ],
    testingInfo: 'Free tier: 5,000 emails/month for 3 months'
  },
  twilio: {
    service: 'Twilio SMS/Voice',
    provider: 'Twilio',
    signupUrl: 'https://www.twilio.com/try-twilio',
    docsUrl: 'https://www.twilio.com/docs',
    instructions: [
      'Sign up at twilio.com',
      'Verify your phone number',
      'Go to Console Dashboard',
      'Copy Account SID',
      'Copy Auth Token (click to reveal)',
      'Get a phone number (Phone Numbers → Buy a number)',
      'Copy the phone number (+1XXXXXXXXXX format)',
      'Add credits for production use'
    ],
    testingInfo: 'Trial: $15.50 credit, can only SMS verified numbers'
  },
  cloudinary: {
    service: 'Cloudinary (Images/Videos)',
    provider: 'Cloudinary',
    signupUrl: 'https://cloudinary.com/users/register/free',
    docsUrl: 'https://cloudinary.com/documentation',
    instructions: [
      'Sign up for free account',
      'Go to Dashboard',
      'Note Cloud Name (e.g., "dxxxxxxxx")',
      'Go to Settings → Access Keys',
      'Copy API Key',
      'Copy API Secret',
      'Configure upload presets if needed'
    ],
    testingInfo: 'Free tier: 25GB storage, 25GB bandwidth/month'
  },
  googleAnalytics: {
    service: 'Google Analytics',
    provider: 'Google',
    signupUrl: 'https://analytics.google.com/',
    docsUrl: 'https://developers.google.com/analytics',
    instructions: [
      'Sign in with Google account',
      'Create new property for your site',
      'Choose "Web" as platform',
      'Add website details',
      'Get Measurement ID (G-XXXXXXXXXX)',
      'For GA4: Use gtag.js or Google Tag Manager',
      'For API access: Enable Google Analytics API in Cloud Console'
    ],
    testingInfo: 'Free tier: Unlimited (with data sampling on large datasets)'
  }
};

// Helper function to get guide by service key
export function getAPIKeyGuide(serviceKey: string): APIKeyGuide | null {
  return API_KEY_GUIDES[serviceKey] || null;
}

// Helper to open documentation in new tab
export function openDocs(serviceKey: string): void {
  const guide = getAPIKeyGuide(serviceKey);
  if (guide) {
    window.open(guide.docsUrl, '_blank', 'noopener,noreferrer');
  }
}

// Helper to open signup page
export function openSignup(serviceKey: string): void {
  const guide = getAPIKeyGuide(serviceKey);
  if (guide) {
    window.open(guide.signupUrl, '_blank', 'noopener,noreferrer');
  }
}
