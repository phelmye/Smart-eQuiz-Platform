# Marketing Site - Smart eQuiz Platform

Public-facing website for promoting and selling the Smart eQuiz SaaS solution.

## 🌐 Purpose

- Homepage with feature showcase
- Pricing page with plan comparison
- Tenant self-registration
- About / Contact pages
- Blog and documentation
- SEO optimized for marketing

## 🚀 Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Forms:** React Hook Form + Zod
- **Analytics:** Google Analytics / Plausible

## 📦 Project Structure

```
marketing-site/
├── app/
│   ├── (marketing)/
│   │   ├── page.tsx              # Homepage
│   │   ├── pricing/page.tsx      # Pricing
│   │   ├── features/page.tsx     # Features
│   │   ├── about/page.tsx        # About Us
│   │   └── contact/page.tsx      # Contact
│   ├── signup/
│   │   └── page.tsx              # Tenant registration
│   ├── login/
│   │   └── page.tsx              # Login redirect
│   ├── api/
│   │   ├── tenants/
│   │   │   └── register/route.ts # Tenant signup API
│   │   └── contact/route.ts      # Contact form API
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
├── components/
│   ├── landing/
│   │   ├── Hero.tsx
│   │   ├── Features.tsx
│   │   ├── Testimonials.tsx
│   │   ├── CTA.tsx
│   │   └── Footer.tsx
│   ├── pricing/
│   │   ├── PricingTable.tsx
│   │   └── PlanCard.tsx
│   ├── signup/
│   │   ├── TenantRegistrationForm.tsx
│   │   └── SuccessModal.tsx
│   └── ui/                       # shadcn/ui components
├── lib/
│   ├── api.ts                    # API client
│   ├── validations.ts            # Zod schemas
│   └── utils.ts                  # Utilities
├── public/
│   ├── images/
│   └── fonts/
├── .env.local
├── .env.production
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## 🔧 Setup Instructions

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

```bash
# Navigate to marketing-site directory
cd apps/marketing-site

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local

# Start development server
pnpm dev
```

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_PLATFORM_DOMAIN=smartequiz.local

# Production
NEXT_PUBLIC_API_URL=https://api.smartequiz.com
NEXT_PUBLIC_PLATFORM_DOMAIN=smartequiz.com
```

## 📄 Key Pages

### Homepage (`/`)
- Hero section with CTA
- Feature highlights
- Social proof / testimonials
- Pricing preview
- FAQ section

### Pricing (`/pricing`)
- Plan comparison table
- Free / Pro / Enterprise tiers
- Feature breakdown
- CTA buttons → `/signup`

### Tenant Signup (`/signup`)
**Form Fields:**
- Organization Name
- Admin Name
- Admin Email
- Phone Number
- Password
- Plan Selection

**Flow:**
1. User fills form
2. System validates subdomain availability
3. Creates tenant + admin user
4. Sends welcome email
5. Redirects to: `{subdomain}.smartequiz.com/onboarding`

### Login (`/login`)
**Behavior:**
- Shows subdomain input
- User enters: "firstbaptist"
- Redirects to: `firstbaptist.smartequiz.com`

## 🎨 Design Guidelines

### Brand Colors
```css
--primary: #2563eb;      /* Blue */
--secondary: #10b981;    /* Green */
--accent: #f59e0b;       /* Orange */
--dark: #1e293b;         /* Slate */
```

### Typography
- **Headings:** Inter Bold
- **Body:** Inter Regular
- **Code:** JetBrains Mono

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
pnpm add -g vercel

# Deploy
vercel --prod

# Custom domain
vercel domains add www.smartequiz.com
```

### Build Command
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

## 📊 Analytics Integration

```typescript
// lib/analytics.ts
export function trackSignup(tenantName: string, plan: string) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'signup', {
      event_category: 'conversion',
      event_label: plan,
      value: tenantName
    });
  }
}
```

## 🔐 Security

- HTTPS only in production
- CSRF protection on forms
- Rate limiting on signup API
- Email verification for new tenants
- Sanitize all user inputs

## 📚 Documentation

See main [ARCHITECTURE.md](../../ARCHITECTURE.md) for overall system architecture.

---

**Maintained By:** Smart eQuiz Platform Team
**Last Updated:** November 16, 2025
