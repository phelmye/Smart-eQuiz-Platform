# Feature Preview & Upgrade System

## Overview

This document describes the **3-Tier Access Control System** for plan-based features. Instead of completely hiding features from users on lower-tier plans, we show them with visual indicators and upgrade prompts - encouraging upgrades through feature discovery.

## System Architecture

### 1. Menu Items - Always Visible with Visual Indicators

**Location:** `AdminSidebar.tsx`

Menu items for premium features are ALWAYS visible but include visual indicators:

- ✅ Lock icon (`<Lock />`) for locked features
- ✅ "Pro" badge with crown icon for paid features
- ✅ Greyed-out text color for unavailable items
- ✅ Still clickable (leads to preview page)

**Example:**
```tsx
// In AdminSidebar.tsx - line ~750
const isLocked = child.planFeature && user && !hasFeatureAccess(user, child.planFeature);

{isLocked && (
  <Badge variant="outline" className="ml-auto text-xs px-1.5 py-0 border-amber-300 bg-amber-50 text-amber-700">
    <Crown className="h-2.5 w-2.5 mr-0.5" />
    Pro
  </Badge>
)}
```

###  2. Page Content - Preview Mode with Upgrade CTA

**Component:** `FeaturePreviewOverlay.tsx` (New Component)

When users click on a locked feature:
- 🔒 Page content is visible but blurred/greyed out
- 📊 Semi-transparent overlay shows upgrade CTA
- 💎 Comparison card: Current Plan vs Required Plan
- ✨ List of benefits they'll unlock
- 🚀 Prominent "Upgrade" button
- 💬 Help message with contact option

**Usage Example:**
```tsx
// In BrandingSettings.tsx
const featureInfo = getFeatureDisplayInfo(user, 'branding');
const isLocked = featureInfo?.isLocked || false;

if (isLocked && featureInfo) {
  return (
    <FeaturePreviewOverlay
      featureName={featureInfo.featureName}
      featureDescription={featureInfo.featureDescription}
      requiredPlan={featureInfo.requiredPlan}
      currentPlan={featureInfo.currentPlan}
      benefits={featureInfo.benefits}
      onUpgrade={() => {
        window.location.hash = 'billing'; // Navigate to upgrade page
      }}
      blur={true}
    >
      {/* Page content - shown but blurred */}
      <BrandingPageContent />
    </FeaturePreviewOverlay>
  );
}
```

### 3. Form Controls - Disabled Until Upgrade

**Component:** `FeatureLockedField.tsx` (Part of FeaturePreviewOverlay)

For granular control within pages:
```tsx
<FeatureLockedField 
  isLocked={!hasFeatureAccess(user, 'branding')}
  requiredPlan="Starter Plan"
>
  <Input 
    placeholder="Upload logo..."
    disabled={!hasFeatureAccess(user, 'branding')}
  />
</FeatureLockedField>
```

## Implementation Guide

### Step 1: Define Feature Metadata

**File:** `mockData.ts` (lines ~3050-3120)

```typescript
export function getFeatureDisplayInfo(user: User, featureKey: string): FeatureDisplayInfo | null {
  const featureMap: Record<string, { 
    name: string; 
    description: string; 
    benefits: string[]; 
    minPlan: string 
  }> = {
    'branding': {
      name: 'Custom Branding',
      description: 'Customize your platform with your church logo, colors, and branding',
      benefits: [
        'Upload custom logo and brand colors',
        'Customize email templates with your branding',
        'White-label experience for participants',
        'Custom domain support',
        'Branded certificates and awards'
      ],
      minPlan: 'pro'
    },
    // Add more features here...
  };
}
```

### Step 2: Update Menu Configuration

**File:** `AdminSidebar.tsx` (lines ~100-450)

Add `planFeature` to menu items:
```tsx
{
  id: 'branding',
  label: 'Branding',
  icon: Paintbrush,
  page: 'branding',
  requiredRoles: ['super_admin', 'org_admin'],
  requiredPermission: 'branding.manage',
  planFeature: 'branding'  // ← Add this
},
```

### Step 3: Implement Preview in Page Component

**Example:** `BrandingSettings.tsx`, `Analytics.tsx`, etc.

```tsx
import { FeaturePreviewOverlay } from './FeaturePreviewOverlay';
import { getFeatureDisplayInfo } from '@/lib/mockData';

export const YourComponent = () => {
  const { user } = useAuth();
  
  // Check if feature is locked
  const featureInfo = getFeatureDisplayInfo(user, 'your-feature-key');
  const isLocked = featureInfo?.isLocked || false;
  
  // Show preview overlay if locked
  if (isLocked && featureInfo) {
    return (
      <FeaturePreviewOverlay
        featureName={featureInfo.featureName}
        featureDescription={featureInfo.featureDescription}
        requiredPlan={featureInfo.requiredPlan}
        currentPlan={featureInfo.currentPlan}
        benefits={featureInfo.benefits}
        onUpgrade={() => window.location.hash = 'billing'}
        blur={true}
      >
        {renderPageContent()}
      </FeaturePreviewOverlay>
    );
  }
  
  // Full access
  return renderPageContent();
};
```

## Feature Keys and Plan Requirements

### Current Feature Keys

| Feature Key | Feature Name | Minimum Plan | Description |
|------------|--------------|--------------|-------------|
| `branding` | Custom Branding | Pro | Logo, colors, custom CSS |
| `analytics` | Advanced Analytics | Pro | Performance metrics, reports |
| `ai-generator` | AI Question Generator | Pro | AI-powered question creation |
| `payment-integration` | Payment Integration | Any Paid | Process payments |

### Adding New Features

1. **Add to `featureMap` in `getFeatureDisplayInfo()`**
```typescript
'new-feature': {
  name: 'New Feature Name',
  description: 'Feature description',
  benefits: ['Benefit 1', 'Benefit 2'],
  minPlan: 'professional' // or 'pro', 'enterprise'
},
```

2. **Update `hasFeatureAccess()` function**
```typescript
switch (feature) {
  case 'new-feature':
    return plan.maxUsers > 20; // Your custom logic
  // ...
}
```

3. **Add to menu with `planFeature`**
```typescript
{
  id: 'new-feature',
  planFeature: 'new-feature', // Links to feature key
  // ...
}
```

## Plan Tiers and Features

### Free Plan ($0/month)
- 5 users
- 1 tournament
- 50 questions
- Basic analytics only
- No branding
- No AI features

### Starter Plan ($29/month)
- ✅ Custom Branding
- ✅ Advanced Analytics
- ✅ AI Question Generator
- 20 users
- 5 tournaments
- 200 questions

### Professional Plan ($99/month)
- ✅ All Starter features
- 100 users
- 20 tournaments
- 500 questions
- Parish/Group tournaments
- API access

### Enterprise Plan ($299/month)
- ✅ All Professional features
- Unlimited everything
- White-label options
- Dedicated support
- Custom integrations

## URL Access Protection

Even if users try to access features via URL (e.g., `#branding`), they'll see:

1. **Preview Overlay** - Not an "Access Denied" message
2. **Feature Benefits** - What they're missing
3. **Upgrade CTA** - Clear path to unlock
4. **Current Content** - Visible but not interactive

## User Experience Flow

### Scenario: Free Plan User Clicks "Branding"

1. **Sidebar:** Sees "Branding" with 🔒 lock icon and "Pro" badge
2. **Click:** Navigates to `/branding` page
3. **Page Loads:** Shows blurred branding interface
4. **Overlay Appears:** 
   - "Custom Branding" heading with lock icon
   - "You're on Free Plan → Upgrade to Starter" comparison
   - List of 5 benefits they'll get
   - Big "Upgrade to Starter Plan" button
   - Helpful message about contacting support
5. **Clicks Upgrade:** Redirects to billing/subscription page
6. **After Upgrade:** Full access, lock icons removed

## Best Practices

### ✅ DO

- Show all features in sidebar (with indicators)
- Use blur effect for preview mode
- Provide specific, compelling benefits
- Make upgrade path obvious
- Show pricing difference
- Allow exploration without frustration

### ❌ DON'T

- Completely hide features
- Use generic "Upgrade Required" messages
- Make users guess what they're missing
- Show errors or "Access Denied" screens
- Hide pricing information
- Block navigation to preview

## Testing Checklist

- [ ] Free plan user sees lock icons on premium features
- [ ] Clicking locked feature shows preview overlay
- [ ] Content is visible but blurred/disabled
- [ ] Upgrade CTA is prominent and clear
- [ ] Benefits list is accurate and compelling
- [ ] Upgrade button redirects to billing page
- [ ] After upgrade, locks disappear
- [ ] Form controls are properly disabled
- [ ] URL access shows preview (not error)
- [ ] Super admin bypasses all locks

## Future Enhancements

1. **A/B Testing:** Test blur vs grey vs partial content
2. **Analytics:** Track which features drive upgrades
3. **Trials:** Offer 7-day trial of premium features
4. **Tooltips:** Add hover tooltips on lock icons
5. **Videos:** Embed feature demo videos in overlay
6. **Comparison Table:** Show full plan comparison
7. **Testimonials:** Add user quotes about premium features
8. **Limited Time Offers:** Show discounts for upgrades

## Support

For questions about implementing this system:
- Review `FeaturePreviewOverlay.tsx` component
- Check `mockData.ts` helper functions
- See `BrandingSettings.tsx` for complete example
- Test with different plan types in browser console

---

**Last Updated:** November 21, 2025
**Version:** 1.0
**Status:** ✅ Production Ready
