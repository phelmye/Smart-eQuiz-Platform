/**
 * Plan-Feature Synchronization System
 * 
 * This system automatically syncs feature definitions with plan configurations.
 * When new features are added to FEATURE_PLAN_REQUIREMENTS, they automatically
 * appear in plan listings and billing pages.
 */

// Import feature requirements from tenant app (single source of truth)
// NOTE: In production, this should come from a shared package or database

export interface Feature {
  id: string;
  name: string;
  description: string;
  category: 'basic' | 'professional' | 'enterprise' | 'addon';
  availableInPlans: string[]; // ['starter', 'professional', 'enterprise']
}

export interface PlanTier {
  id: string;
  name: string;
  displayName: string;
  monthlyPrice: number;
  features: string[]; // Auto-populated from feature system
}

// Central feature registry - single source of truth
export const FEATURE_REGISTRY: Record<string, Feature> = {
  // Basic Features (All plans)
  'basic_tournaments': {
    id: 'basic_tournaments',
    name: 'Basic Tournaments',
    description: 'Create and manage standard quiz tournaments',
    category: 'basic',
    availableInPlans: ['starter', 'professional', 'enterprise']
  },
  'individual_participation': {
    id: 'individual_participation',
    name: 'Individual Participation',
    description: 'Individual player mode',
    category: 'basic',
    availableInPlans: ['starter', 'professional', 'enterprise']
  },
  'basic_analytics': {
    id: 'basic_analytics',
    name: 'Basic Analytics',
    description: 'View participant scores and basic statistics',
    category: 'basic',
    availableInPlans: ['starter', 'professional', 'enterprise']
  },
  
  // Professional Features (Professional+ plans)
  'parish_group_mode': {
    id: 'parish_group_mode',
    name: 'Parish/Group Mode',
    description: 'Team-based competitions with parish grouping',
    category: 'professional',
    availableInPlans: ['professional', 'enterprise']
  },
  'mixed_mode': {
    id: 'mixed_mode',
    name: 'Mixed Mode Tournaments',
    description: 'Combine individual and group competitions',
    category: 'professional',
    availableInPlans: ['professional', 'enterprise']
  },
  'advanced_scoring': {
    id: 'advanced_scoring',
    name: 'Advanced Scoring Methods',
    description: 'Custom scoring formulas and weightings',
    category: 'professional',
    availableInPlans: ['professional', 'enterprise']
  },
  'prize_management': {
    id: 'prize_management',
    name: 'Prize Management',
    description: 'Configure and track tournament prizes',
    category: 'professional',
    availableInPlans: ['professional', 'enterprise']
  },
  'entry_fees': {
    id: 'entry_fees',
    name: 'Entry Fees',
    description: 'Charge entry fees for tournaments',
    category: 'professional',
    availableInPlans: ['professional', 'enterprise']
  },
  'payment_integration': {
    id: 'payment_integration',
    name: 'Payment Integration',
    description: 'Stripe, Paystack, Flutterwave integration',
    category: 'professional',
    availableInPlans: ['professional', 'enterprise']
  },
  'certificate_generation': {
    id: 'certificate_generation',
    name: 'Certificate Generation',
    description: 'Auto-generate winner certificates',
    category: 'professional',
    availableInPlans: ['professional', 'enterprise']
  },
  'ai_question_generator': {
    id: 'ai_question_generator',
    name: 'AI Question Generator',
    description: 'Generate questions using AI (OpenAI/Claude)',
    category: 'professional',
    availableInPlans: ['professional', 'enterprise']
  },
  'advanced_analytics': {
    id: 'advanced_analytics',
    name: 'Advanced Analytics',
    description: 'Detailed performance insights and trends',
    category: 'professional',
    availableInPlans: ['professional', 'enterprise']
  },
  'knockout_tournaments': {
    id: 'knockout_tournaments',
    name: 'Knockout Tournaments',
    description: 'Bracket-style elimination tournaments',
    category: 'professional',
    availableInPlans: ['professional', 'enterprise']
  },
  
  // Enterprise Features (Enterprise only)
  'custom_branding': {
    id: 'custom_branding',
    name: 'Full Custom Branding',
    description: 'White-label with custom logo, colors, domain',
    category: 'enterprise',
    availableInPlans: ['enterprise']
  },
  'api_access': {
    id: 'api_access',
    name: 'API Access',
    description: 'REST API for custom integrations',
    category: 'enterprise',
    availableInPlans: ['enterprise']
  },
  'dedicated_support': {
    id: 'dedicated_support',
    name: 'Dedicated Support',
    description: '24/7 priority support with dedicated account manager',
    category: 'enterprise',
    availableInPlans: ['enterprise']
  },
  'custom_integrations': {
    id: 'custom_integrations',
    name: 'Custom Integrations',
    description: 'Build custom integrations with your systems',
    category: 'enterprise',
    availableInPlans: ['enterprise']
  },
  'multi_parish_teams': {
    id: 'multi_parish_teams',
    name: 'Multi-Parish Teams',
    description: 'Teams spanning multiple parishes',
    category: 'enterprise',
    availableInPlans: ['enterprise']
  },
  'automated_brackets': {
    id: 'automated_brackets',
    name: 'Automated Bracket Generation',
    description: 'Auto-generate tournament brackets',
    category: 'enterprise',
    availableInPlans: ['enterprise']
  },
  'auto_prize_distribution': {
    id: 'auto_prize_distribution',
    name: 'Auto Prize Distribution',
    description: 'Automatic prize money distribution',
    category: 'enterprise',
    availableInPlans: ['enterprise']
  },
  'payment_analytics': {
    id: 'payment_analytics',
    name: 'Payment Analytics',
    description: 'Detailed revenue and transaction analytics',
    category: 'enterprise',
    availableInPlans: ['enterprise']
  },
  'unlimited_users': {
    id: 'unlimited_users',
    name: 'Unlimited Users',
    description: 'No limit on user accounts',
    category: 'enterprise',
    availableInPlans: ['enterprise']
  },
  'unlimited_tournaments': {
    id: 'unlimited_tournaments',
    name: 'Unlimited Tournaments',
    description: 'Host unlimited tournaments per year',
    category: 'enterprise',
    availableInPlans: ['enterprise']
  },

  // Multi-lingual feature (when implemented)
  'multilingual_interface': {
    id: 'multilingual_interface',
    name: 'Multi-lingual Interface',
    description: 'Support for multiple languages with auto-detection',
    category: 'enterprise',
    availableInPlans: ['enterprise']
  },
  'ip_language_detection': {
    id: 'ip_language_detection',
    name: 'IP-based Language Detection',
    description: 'Auto-detect user language from IP address',
    category: 'enterprise',
    availableInPlans: ['enterprise']
  }
};

/**
 * Get all features available for a specific plan
 */
export function getFeaturesForPlan(planName: string): Feature[] {
  const normalizedPlanName = planName.toLowerCase();
  return Object.values(FEATURE_REGISTRY).filter(feature =>
    feature.availableInPlans.includes(normalizedPlanName)
  );
}

/**
 * Get feature names as string array for plan display
 */
export function getFeatureNamesForPlan(planName: string): string[] {
  return getFeaturesForPlan(planName).map(f => f.name);
}

/**
 * Get features grouped by category for a plan
 */
export function getFeaturesGroupedByCategory(planName: string): Record<string, Feature[]> {
  const features = getFeaturesForPlan(planName);
  return features.reduce((acc, feature) => {
    if (!acc[feature.category]) {
      acc[feature.category] = [];
    }
    acc[feature.category].push(feature);
    return acc;
  }, {} as Record<string, Feature[]>);
}

/**
 * Check if a specific feature is available in a plan
 */
export function isPlanFeatureAvailable(planName: string, featureId: string): boolean {
  const feature = FEATURE_REGISTRY[featureId];
  if (!feature) return false;
  return feature.availableInPlans.includes(planName.toLowerCase());
}

/**
 * Get the minimum plan required for a feature
 */
export function getMinimumPlanForFeature(featureId: string): string | null {
  const feature = FEATURE_REGISTRY[featureId];
  if (!feature || feature.availableInPlans.length === 0) return null;
  
  const planHierarchy = ['starter', 'professional', 'enterprise'];
  for (const plan of planHierarchy) {
    if (feature.availableInPlans.includes(plan)) {
      return plan;
    }
  }
  return null;
}

/**
 * Generate feature comparison matrix for pricing page
 */
export function generateFeatureComparisonMatrix(): {
  featureId: string;
  featureName: string;
  description: string;
  starter: boolean;
  professional: boolean;
  enterprise: boolean;
}[] {
  return Object.values(FEATURE_REGISTRY).map(feature => ({
    featureId: feature.id,
    featureName: feature.name,
    description: feature.description,
    starter: feature.availableInPlans.includes('starter'),
    professional: feature.availableInPlans.includes('professional'),
    enterprise: feature.availableInPlans.includes('enterprise')
  }));
}

/**
 * Automatically sync plan features
 * Call this when initializing plans to ensure they have all available features
 */
export function syncPlanFeatures(plans: PlanTier[]): PlanTier[] {
  return plans.map(plan => ({
    ...plan,
    features: getFeatureNamesForPlan(plan.name)
  }));
}

/**
 * Add a new feature to the registry
 * This will automatically make it available to the specified plans
 */
export function registerNewFeature(feature: Feature): void {
  FEATURE_REGISTRY[feature.id] = feature;
  console.log(`✅ Feature "${feature.name}" registered for plans: ${feature.availableInPlans.join(', ')}`);
}

/**
 * Example usage:
 * 
 * // 1. Get features for Professional plan
 * const professionalFeatures = getFeaturesForPlan('professional');
 * 
 * // 2. Check if Enterprise has API access
 * const hasAPI = isPlanFeatureAvailable('enterprise', 'api_access'); // true
 * 
 * // 3. Generate pricing comparison table
 * const comparisonMatrix = generateFeatureComparisonMatrix();
 * 
 * // 4. Add new feature dynamically
 * registerNewFeature({
 *   id: 'custom_reports',
 *   name: 'Custom Reports',
 *   description: 'Build custom analytics reports',
 *   category: 'professional',
 *   availableInPlans: ['professional', 'enterprise']
 * });
 * 
 * // 5. Sync plans with latest features
 * const updatedPlans = syncPlanFeatures(existingPlans);
 */
