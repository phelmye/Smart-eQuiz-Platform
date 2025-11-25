# Content Management Architecture

## Overview

The Smart eQuiz Platform has **two distinct content management systems** that control different parts of the public-facing website infrastructure. Understanding the separation between these systems is critical for proper implementation and maintenance.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                   Content Management                         │
└─────────────────────────────────────────────────────────────┘
                             │
           ┌─────────────────┴─────────────────┐
           │                                   │
           ▼                                   ▼
┌──────────────────────┐          ┌──────────────────────┐
│  Platform Admin      │          │  Tenant App          │
│  Marketing Manager   │          │  Landing Settings    │
└──────────────────────┘          └──────────────────────┘
           │                                   │
           │ Manages                           │ Manages
           ▼                                   ▼
┌──────────────────────┐          ┌──────────────────────┐
│  Marketing Site      │          │  Tenant Landing      │
│  www.smartequiz.com  │          │  {tenant}.site.com   │
└──────────────────────┘          └──────────────────────┘
```

## 1. Platform Admin - Marketing Site Content Manager

### Location
- **Component:** `apps/platform-admin/src/components/MarketingContentManager.tsx`
- **Access:** Super admins only
- **Navigation:** Platform Admin Dashboard → Marketing Management

### Purpose
Manages content for the **platform-wide marketing website** (www.smartequiz.com) that promotes the Smart eQuiz platform to potential customers.

### Content Controlled

#### Hero Section
- Main headline (e.g., "Transform Bible Learning with AI-Powered Quiz Tournaments")
- Subheadline
- Primary CTA button text and link
- Secondary CTA button text and link
- Background image

#### Features Section
- Feature list with icons, titles, and descriptions
- Feature highlights
- Value propositions

#### Testimonials
- Customer testimonials
- Ratings and reviews
- Customer names and organizations

#### Pricing Tiers
- Plan names and pricing
- Feature lists per plan
- CTA buttons for signup

#### Social Proof
- Active users count
- Churches served
- Quizzes hosted
- Customer ratings
- Updated timestamps

#### Contact Information
- Support email
- Phone number
- Physical address
- Support hours

#### Blog & Legal
- Blog post metadata
- Terms of Service links
- Privacy Policy links

### Storage
- **Primary:** `localStorage` key: `platform_marketing_content`
- **Future:** API endpoint `/api/marketing/content` (planned)

### Workflow
1. Super admin logs into Platform Admin
2. Navigates to "Marketing Management"
3. Edits content across tabs (Hero, Features, Testimonials, etc.)
4. Clicks "Save Changes"
5. Content updates immediately on www.smartequiz.com

### Key Features
- Live preview mode
- Version history (metadata tracking)
- Change notes/audit trail
- Image picker integration
- Rich text editing

---

## 2. Tenant App - Landing Page Settings

### Location
- **Component:** `apps/tenant-app/src/components/TenantLandingSettings.tsx`
- **Access:** Organization admins (org_admin role)
- **Navigation:** Tenant Dashboard → Settings → Landing Page

### Purpose
Allows **each tenant organization** to customize their own landing page ({tenant}.smartequiz.com) that visitors see before logging in.

### Content Controlled

#### Hero Section
- Organization-specific headline (e.g., "Join First Baptist's Bible Quiz Community")
- Subheadline
- Primary button text (default: "Get Started")
- Secondary button text (default: "I Already Have an Account")

#### Quick Statistics
- Questions available count (e.g., "5,000+")
- Active tournaments count (e.g., "1")
- Practice access availability (e.g., "24/7")

#### Feature Highlights
- Up to 4 customizable features:
  - Icon selection
  - Feature title
  - Feature description
  - Enable/disable toggle

Default features:
1. Competitive Tournaments
2. Practice Mode
3. Global Leaderboard
4. AI-Powered Questions

#### Branding Options
- Show organization logo (toggle)
- Show "Powered by Smart eQuiz" footer (toggle)
- Custom footer text

### Storage
- **Key:** `tenant_landing_{tenantId}` (per-tenant localStorage)
- **Future:** API endpoint `/api/tenants/{tenantId}/landing` (planned)

### Workflow
1. Org admin logs into Tenant App
2. Navigates to Settings → Landing Page
3. Customizes hero text, stats, features, and branding
4. Clicks "Save Changes"
5. Content updates on {tenant}.smartequiz.com
6. Can preview changes before saving

### Integration Points

#### TenantLandingPage Component
**Location:** `workspace/shadcn-ui/src/components/TenantLandingPage.tsx`

This component renders the tenant landing page and **dynamically loads** content from `TenantLandingSettings`:

```typescript
// Load custom content on mount
useEffect(() => {
  const storageKey = `tenant_landing_${tenant.id}`;
  const savedContent = localStorage.getItem(storageKey);
  
  if (savedContent) {
    setLandingContent(JSON.parse(savedContent));
  } else {
    setLandingContent(defaultLandingContent(tenant.name));
  }
}, [tenant.id]);
```

**Displays:**
- Dynamic hero headline and subheadline
- Custom CTA button text
- Configurable statistics
- Enabled features only
- Conditional branding elements

---

## Content Separation Matrix

| Feature | Platform Admin Marketing Manager | Tenant Landing Settings |
|---------|----------------------------------|-------------------------|
| **Scope** | Platform-wide (all visitors) | Per-tenant (tenant visitors) |
| **Domain** | www.smartequiz.com | {tenant}.smartequiz.com |
| **Access** | Super admins only | Organization admins |
| **Purpose** | Sell the platform | Engage organization members |
| **Pricing** | Yes - platform pricing tiers | No - set by platform |
| **Testimonials** | Customer testimonials | No |
| **Features** | Platform features | Organization-specific features |
| **Branding** | Smart eQuiz branding | Organization branding |
| **Blog** | Yes | No |
| **Contact** | Platform support | No (inherits from tenant settings) |
| **Custom Domain** | smartequiz.com | Tenant subdomain |

---

## Implementation Details

### Platform Admin Marketing Manager

**File:** `apps/platform-admin/src/components/MarketingContentManager.tsx`

**Key Functions:**
```typescript
fetchContent() // Load from localStorage/API
handleSave()   // Save to localStorage/API
updateHero()   // Update hero section
updateFeatures() // Update features array
```

**Data Structure:**
```typescript
interface MarketingContent {
  hero: {
    headline: string;
    subheadline: string;
    ctaPrimary: string;
    ctaSecondary: string;
    ctaPrimaryLink: string;
    ctaSecondaryLink: string;
    backgroundImage: string;
  };
  socialProof: {
    activeUsers: string;
    churchesServed: string;
    quizzesHosted: string;
    customerRating: string;
  };
  testimonials: Array<Testimonial>;
  pricingTiers: Array<PricingTier>;
  features: Array<Feature>;
  contactInfo: ContactInfo;
  metadata: {
    lastUpdated: string;
    version: string;
    updatedBy: string;
  };
}
```

### Tenant Landing Settings

**File:** `apps/tenant-app/src/components/TenantLandingSettings.tsx`

**Key Functions:**
```typescript
loadContent()    // Load tenant-specific content
handleSave()     // Save to tenant-scoped storage
updateHero()     // Update hero text
updateStats()    // Update statistics
updateFeature()  // Update feature configuration
updateBranding() // Update branding options
```

**Data Structure:**
```typescript
interface TenantLandingContent {
  hero: {
    headline: string;
    subheadline: string;
    ctaText: string;
    ctaSecondaryText: string;
  };
  stats: {
    questionsCount: string;
    activeTournaments: string;
    practiceAccess: string;
  };
  features: Array<{
    id: string;
    icon: string;
    title: string;
    description: string;
    enabled: boolean;
  }>;
  branding: {
    showOrgLogo: boolean;
    showPoweredBy: boolean;
    customFooterText?: string;
  };
  metadata: {
    lastUpdated: string;
    updatedBy: string;
  };
}
```

---

## Permission Requirements

### Platform Admin Access
- **Role:** `super_admin`
- **Permission:** None required (super admin has all permissions)
- **Plan:** N/A (platform-level)

### Tenant Landing Page Access
- **Role:** `org_admin`
- **Permission:** `settings.manage`
- **Plan Feature:** `branding` (can be restricted to higher-tier plans)

---

## Future Enhancements

### Phase 1: API Integration (Planned)
- Move from localStorage to database storage
- Create REST endpoints:
  - `GET/PUT /api/marketing/content` (platform)
  - `GET/PUT /api/tenants/{id}/landing` (tenant)
- Add caching layer (Redis)

### Phase 2: Media Library Integration
- Connect to platform media library
- Allow image uploads for hero backgrounds
- Support video embeds
- CDN integration

### Phase 3: Advanced Features
- A/B testing for marketing content
- Analytics integration (track conversion rates)
- Multi-language support
- Template library (pre-made landing pages)
- SEO optimization tools
- Custom CSS injection (white-label)

### Phase 4: Content Scheduling
- Schedule content changes
- Preview future content
- Rollback to previous versions
- Approval workflows

---

## Best Practices

### For Platform Admins
1. **Keep marketing site updated:** Regularly update testimonials, statistics, and features
2. **Monitor performance:** Track conversion rates on CTA buttons
3. **Maintain brand consistency:** Use consistent colors, fonts, and messaging
4. **Test changes:** Use preview mode before publishing
5. **Document changes:** Always add change notes when updating

### For Tenant Admins
1. **Personalize content:** Make headlines specific to your organization
2. **Update statistics regularly:** Keep question counts and tournament info current
3. **Enable relevant features:** Only show features your plan supports
4. **Use branding wisely:** Toggle "Powered by" based on white-label needs
5. **Preview before saving:** Always check how changes look

### For Developers
1. **Maintain separation:** Never mix platform and tenant content
2. **Respect permissions:** Always check `hasPermission()` before rendering
3. **Handle defaults gracefully:** Provide sensible defaults if content missing
4. **Validate data:** Ensure content structure matches interface
5. **Cache appropriately:** Balance freshness with performance

---

## Troubleshooting

### Marketing Site Content Not Updating
1. Check localStorage key: `platform_marketing_content`
2. Verify super_admin role
3. Clear browser cache
4. Check console for errors
5. Verify save operation succeeded

### Tenant Landing Page Not Updating
1. Check localStorage key: `tenant_landing_{tenantId}`
2. Verify org_admin role and `settings.manage` permission
3. Check tenant's plan includes `branding` feature
4. Verify tenant ID matches
5. Check default content fallback logic

### Content Not Persisting
1. Check localStorage quota (5-10MB limit)
2. Verify JSON serialization succeeds
3. Check for browser privacy mode
4. Verify storage API availability
5. Check for conflicting extensions

---

## Migration Notes

### From Legacy Monolith
The workspace/shadcn-ui directory contains the original TenantLandingPage component with hardcoded content. We've updated it to load dynamic content but **do not delete this file** - it's still used by the legacy monolith until full migration is complete.

### To API-Based Storage
When migrating from localStorage to API:
1. Create migration script to export existing content
2. Seed database with current localStorage data
3. Update fetch/save methods to use API endpoints
4. Add error handling for API failures
5. Implement fallback to cached content
6. Test thoroughly before deploying

---

## Summary

The Smart eQuiz Platform uses **two distinct content management systems**:

1. **Platform Admin Marketing Manager** - Controls www.smartequiz.com (super admin only)
2. **Tenant Landing Settings** - Controls {tenant}.smartequiz.com (org admin per tenant)

This separation ensures:
- Platform admins control global marketing messaging
- Tenant admins customize their organization's landing page
- Content doesn't conflict or overwrite
- Permissions are properly enforced
- White-labeling is supported

Always maintain this separation when adding features or making changes to either system.
