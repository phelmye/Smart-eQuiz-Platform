// Storage keys for localStorage
export const STORAGE_KEYS = {
  PLANS: 'equiz_plans',
  BILLING: 'equiz_billing',
  TENANTS: 'equiz_tenants',
  USERS: 'equiz_users',
  TOURNAMENTS: 'equiz_tournaments',
  QUESTIONS: 'equiz_questions',
  PAYMENT_INTEGRATIONS: 'equiz_payment_integrations',
  ROLE_PERMISSIONS: 'equiz_role_permissions',
  TENANT_ROLES: 'equiz_tenant_roles',
  AUDIT_LOGS: 'equiz_audit_logs',
  CURRENT_USER: 'equiz_current_user',
  BRANDING: 'equiz_branding'
};

// User roles
export type UserRole = 
  | 'super_admin' 
  | 'org_admin' 
  | 'question_manager' 
  | 'account_officer' 
  | 'participant' 
  | 'inspector' 
  | 'practice_user';

// User interface
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  tenantId: string;
  xp: number;
  level: number;
  badges: string[];
  walletBalance: number;
  isActive?: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

// Type guard for runtime checks when dealing with unknown values
export function isUser(obj: unknown): obj is User {
  if (typeof obj !== 'object' || obj === null) return false;
  const maybe = obj as Record<string, unknown>;
  return typeof maybe.email === 'string';
}

// Plan interface
export interface Plan {
  id: string;
  name: string;
  displayName: string;
  description: string;
  monthlyPrice: number; // Monthly price in dollars
  yearlyDiscountPercent: number; // Discount percentage for yearly billing (0-100)
  billingOptions: ('monthly' | 'yearly')[]; // Available billing options
  maxUsers: number;
  maxTournaments: number;
  maxQuestionsPerTournament: number;
  maxQuestionCategories: number; // Maximum question categories allowed (-1 for unlimited)
  features: string[];
  isDefault: boolean; // Cannot be deleted if true
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

// Billing interface for tenant subscriptions
export interface TenantBilling {
  tenantId: string;
  planId: string;
  billingCycle: 'monthly' | 'yearly';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  status: 'active' | 'past_due' | 'cancelled' | 'trialing';
  nextBillingDate: string;
  amountDue: number;
  discountApplied?: number;
}

// Component Features System
export interface ComponentFeature {
  id: string;
  name: string;
  description: string;
  category: 'core' | 'advanced' | 'admin';
}

export interface ComponentFeatureSet {
  componentId: string;
  componentName: string;
  features: ComponentFeature[];
}

// Available component features for role assignment
export const COMPONENT_FEATURES: ComponentFeatureSet[] = [
  {
    componentId: 'question-bank',
    componentName: 'Question Bank',
    features: [
      { id: 'view-questions', name: 'View Questions', description: 'Can view question library', category: 'core' },
      { id: 'create-questions', name: 'Create Questions', description: 'Can create new questions', category: 'core' },
      { id: 'edit-questions', name: 'Edit Questions', description: 'Can edit existing questions', category: 'core' },
      { id: 'delete-questions', name: 'Delete Questions', description: 'Can delete questions', category: 'admin' },
      { id: 'manage-categories', name: 'Manage Categories', description: 'Can create/edit question categories', category: 'advanced' },
      { id: 'bulk-import', name: 'Bulk Import', description: 'Can bulk import questions', category: 'advanced' },
      { id: 'export-questions', name: 'Export Questions', description: 'Can export question data', category: 'core' }
    ]
  },
  {
    componentId: 'analytics',
    componentName: 'Analytics',
    features: [
      { id: 'view-basic-analytics', name: 'Basic Analytics', description: 'Can view basic performance metrics', category: 'core' },
      { id: 'view-advanced-analytics', name: 'Advanced Analytics', description: 'Can access detailed reports and insights', category: 'advanced' },
      { id: 'export-reports', name: 'Export Reports', description: 'Can export analytics data', category: 'advanced' },
      { id: 'real-time-analytics', name: 'Real-time Analytics', description: 'Can view live tournament analytics', category: 'advanced' }
    ]
  },
  {
    componentId: 'user-management',
    componentName: 'User Management',
    features: [
      { id: 'view-users', name: 'View Users', description: 'Can view user list', category: 'core' },
      { id: 'create-users', name: 'Create Users', description: 'Can create new users', category: 'admin' },
      { id: 'edit-users', name: 'Edit Users', description: 'Can edit user details', category: 'admin' },
      { id: 'delete-users', name: 'Delete Users', description: 'Can delete users', category: 'admin' },
      { id: 'assign-roles', name: 'Assign Roles', description: 'Can assign roles to users', category: 'admin' },
      { id: 'login-as-user', name: 'Login As User', description: 'Can login as other users', category: 'admin' }
    ]
  },
  {
    componentId: 'tournament-builder',
    componentName: 'Tournament Builder',
    features: [
      { id: 'view-tournaments', name: 'View Tournaments', description: 'Can view tournament list', category: 'core' },
      { id: 'create-tournaments', name: 'Create Tournaments', description: 'Can create new tournaments', category: 'core' },
      { id: 'edit-tournaments', name: 'Edit Tournaments', description: 'Can edit tournament details', category: 'core' },
      { id: 'delete-tournaments', name: 'Delete Tournaments', description: 'Can delete tournaments', category: 'admin' },
      { id: 'advanced-settings', name: 'Advanced Settings', description: 'Can configure advanced tournament settings', category: 'advanced' }
    ]
  },
  {
    componentId: 'branding-settings',
    componentName: 'Branding Settings',
    features: [
      { id: 'view-branding', name: 'View Branding', description: 'Can view branding settings', category: 'core' },
      { id: 'edit-branding', name: 'Edit Branding', description: 'Can modify branding settings', category: 'admin' },
      { id: 'upload-assets', name: 'Upload Assets', description: 'Can upload logos and images', category: 'admin' },
      { id: 'custom-css', name: 'Custom CSS', description: 'Can add custom CSS styles', category: 'advanced' }
    ]
  },
  {
    componentId: 'tenant-management',
    componentName: 'Tenant Management',
    features: [
      { id: 'view-tenants', name: 'View Tenants', description: 'Can view tenant list', category: 'admin' },
      { id: 'create-tenants', name: 'Create Tenants', description: 'Can create new tenants', category: 'admin' },
      { id: 'edit-tenants', name: 'Edit Tenants', description: 'Can edit tenant details', category: 'admin' },
      { id: 'delete-tenants', name: 'Delete Tenants', description: 'Can delete tenants', category: 'admin' },
      { id: 'login-as-tenant', name: 'Login As Tenant', description: 'Can login as tenant admin', category: 'admin' }
    ]
  },
  {
    componentId: 'system-settings',
    componentName: 'System Settings',
    features: [
      { id: 'view-settings', name: 'View Settings', description: 'Can view system settings', category: 'core' },
      { id: 'edit-settings', name: 'Edit Settings', description: 'Can modify system settings', category: 'admin' },
      { id: 'manage-integrations', name: 'Manage Integrations', description: 'Can configure third-party integrations', category: 'admin' }
    ]
  }
];

// Role with component features
export interface RoleWithFeatures extends User {
  componentFeatures: string[]; // Array of feature IDs
}

// Tenant interface
// Payment Integration interface
export interface PaymentIntegration {
  id: string;
  tenantId: string;
  provider: 'stripe' | 'paypal' | 'square' | 'razorpay' | 'paystack' | 'flutterwave' | 'interswitch' | 'remita' | 'gtpay' | 'voguepay';
  isEnabled: boolean;
  isConfigured: boolean;
  configuration: {
    publishableKey?: string;
    secretKey?: string;
    webhookSecret?: string;
    clientId?: string;
    clientSecret?: string;
    environment: 'sandbox' | 'production';
  };
  supportedFeatures: {
    tournaments: boolean;
    rewards: boolean;
    cashout: boolean;
    scoreExchange: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

// Audit log interface
export interface AuditLog {
  id: string;
  tenantId: string;
  userId: string; // User who performed the action
  targetUserId?: string; // User who was affected (for user management actions)
  action: 'user.create' | 'user.update' | 'user.delete' | 'role.assign' | 'permission.grant' | 'permission.revoke';
  details: {
    previousValue?: any;
    newValue?: any;
    roleName?: string;
    permission?: string;
    reason?: string;
  };
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}

// Role permission interface
export interface RolePermission {
  roleId: string;
  roleName: string;
  description: string;
  permissions: string[];
  canAccessPages: string[];
  isSystemRole: boolean; // true for system roles like super_admin, org_admin
  tenantId?: string; // for tenant-specific roles
}

// Tenant role management interface
export interface TenantRole {
  id: string;
  tenantId: string;
  roleId: string;
  customPermissions?: string[]; // additional permissions specific to this tenant
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Tenant {
  id: string;
  name: string;
  planId: string; // Reference to plan ID instead of hardcoded plan name
  primaryColor: string;
  logoUrl?: string;
  maxUsers: number;
  maxTournaments: number;
  paymentIntegrationEnabled: boolean; // Default false - tenant admin must enable
  createdAt: string;
}

// Tournament interface
export interface Tournament {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  entryFee: number;
  prizePool: number;
  maxParticipants: number;
  currentParticipants: number;
  spectatorCount: number;
  startDate: string;
  endDate: string;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  participants: string[];
  spectators: string[];
  questions: string[];
  createdBy: string;
  tenantId: string;
  createdAt: string;
}

// Question interface
export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  source: 'manual' | 'ai';
  explanation: string;
  verse?: string;
  tenantId: string;
}

// XP Levels
export const XP_LEVELS = [
  { level: 1, title: 'Seeker', xpRequired: 0 },
  { level: 2, title: 'Student', xpRequired: 100 },
  { level: 3, title: 'Scholar', xpRequired: 300 },
  { level: 4, title: 'Teacher', xpRequired: 600 },
  { level: 5, title: 'Elder', xpRequired: 1000 },
  { level: 6, title: 'Master', xpRequired: 1500 },
  { level: 7, title: 'Sage', xpRequired: 2100 },
  { level: 8, title: 'Prophet', xpRequired: 2800 }
];

// Available badges
export const AVAILABLE_BADGES = [
  { id: 'first_win', name: 'First Victory', description: 'Won your first tournament' },
  { id: 'streak_5', name: 'Hot Streak', description: '5 correct answers in a row' },
  { id: 'perfect_score', name: 'Perfect Score', description: '100% accuracy in a tournament' },
  { id: 'quick_draw', name: 'Quick Draw', description: 'Fastest answer time' },
  { id: 'dedicated', name: 'Dedicated', description: '7 days practice streak' },
  { id: 'scholar', name: 'Bible Scholar', description: 'Mastered all categories' }
];

// Bible categories
export const BIBLE_CATEGORIES = [
  'Old Testament',
  'New Testament', 
  'Psalms & Proverbs',
  'Gospels',
  'Prophets',
  'Historical Books',
  'Epistles',
  'Revelation',
  'Genesis',
  'Exodus'
];

// Default plans (undeletable)
export const defaultPlans: Plan[] = [
  {
    id: 'plan-free',
    name: 'free',
    displayName: 'Free Plan',
    description: 'Perfect for testing and small groups getting started with Bible tournaments',
    monthlyPrice: 0,
    yearlyDiscountPercent: 0,
    billingOptions: ['monthly'],
    maxUsers: 5,
    maxTournaments: 1,
    maxQuestionsPerTournament: 50,
    maxQuestionCategories: 1,
    features: [
      'Up to 5 users',
      '1 tournament for testing',
      '50 questions per tournament',
      'Basic analytics',
      'Community support',
      'Perfect for testing purposes'
    ],
    isDefault: true,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'plan-pro',
    name: 'pro',
    displayName: 'Pro Plan',
    description: 'Ideal for small to medium churches with regular tournament activities',
    monthlyPrice: 29,
    yearlyDiscountPercent: 5, // 5% discount for yearly billing
    billingOptions: ['monthly', 'yearly'],
    maxUsers: 20,
    maxTournaments: 5,
    maxQuestionsPerTournament: 200,
    maxQuestionCategories: 3,
    features: [
      'Up to 20 users',
      '5 tournaments per year',
      '200 questions per tournament',
      'Advanced analytics',
      'Custom branding',
      'Priority email support',
      'Live match streaming',
      'Tournament scheduling'
    ],
    isDefault: true,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'plan-enterprise',
    name: 'enterprise',
    displayName: 'Enterprise Plan',
    description: 'For large organizations with extensive tournament programs - unlimited features',
    monthlyPrice: 99,
    yearlyDiscountPercent: 5, // 5% discount for yearly billing
    billingOptions: ['monthly', 'yearly'],
    maxUsers: -1, // -1 represents unlimited
    maxTournaments: -1, // -1 represents unlimited
    maxQuestionsPerTournament: -1, // -1 represents unlimited
    maxQuestionCategories: -1, // -1 represents unlimited
    features: [
      'Unlimited users',
      'Unlimited tournaments',
      'Unlimited questions per tournament',
      'Advanced analytics & reporting',
      'Full custom branding',
      'Dedicated support manager',
      'API access',
      'Multi-tenant management',
      'White-label options',
      'Priority feature requests',
      'Custom integrations'
    ],
    isDefault: true,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z'
  }
];

// Mock billing data
export const mockBilling: TenantBilling[] = [
  {
    tenantId: 'tenant1',
    planId: 'plan-pro',
    billingCycle: 'yearly',
    currentPeriodStart: '2024-01-01T00:00:00Z',
    currentPeriodEnd: '2024-12-31T23:59:59Z',
    status: 'active',
    nextBillingDate: '2025-01-01T00:00:00Z',
    amountDue: 330.60, // $29 * 12 * 0.95 (5% discount)
    discountApplied: 17.40 // $348 - $330.60
  },
  {
    tenantId: 'tenant2',
    planId: 'plan-free',
    billingCycle: 'monthly',
    currentPeriodStart: '2024-11-01T00:00:00Z',
    currentPeriodEnd: '2024-11-30T23:59:59Z',
    status: 'active',
    nextBillingDate: '2024-12-01T00:00:00Z',
    amountDue: 0
  },
  {
    tenantId: 'tenant3',
    planId: 'plan-enterprise',
    billingCycle: 'monthly',
    currentPeriodStart: '2024-11-01T00:00:00Z',
    currentPeriodEnd: '2024-11-30T23:59:59Z',
    status: 'active',
    nextBillingDate: '2024-12-01T00:00:00Z',
    amountDue: 99
  }
];

// Billing utility functions
export const calculateYearlyPrice = (monthlyPrice: number, discountPercent: number): number => {
  const yearlyPrice = monthlyPrice * 12;
  const discount = yearlyPrice * (discountPercent / 100);
  return yearlyPrice - discount;
};

export const calculateYearlyDiscount = (monthlyPrice: number, discountPercent: number): number => {
  const yearlyPrice = monthlyPrice * 12;
  return yearlyPrice * (discountPercent / 100);
};

export const calculateMonthlySavings = (monthlyPrice: number, discountPercent: number): number => {
  const yearlyPrice = calculateYearlyPrice(monthlyPrice, discountPercent);
  const monthlyFromYearly = yearlyPrice / 12;
  return monthlyPrice - monthlyFromYearly;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
};

// Payment integration utility functions
export const isPaymentIntegrationEnabled = (tenantId: string): boolean => {
  const tenant = mockTenants.find(t => t.id === tenantId);
  if (!tenant?.paymentIntegrationEnabled) return false;

  const integrations = storage.get(STORAGE_KEYS.PAYMENT_INTEGRATIONS) || mockPaymentIntegrations;
  const tenantIntegration = integrations.find((pi: PaymentIntegration) => 
    pi.tenantId === tenantId && pi.isEnabled && pi.isConfigured
  );
  
  return !!tenantIntegration;
};

export const canUsePaymentFeature = (tenantId: string, feature: keyof PaymentIntegration['supportedFeatures']): boolean => {
  if (!isPaymentIntegrationEnabled(tenantId)) return false;

  const integrations = storage.get(STORAGE_KEYS.PAYMENT_INTEGRATIONS) || mockPaymentIntegrations;
  const tenantIntegration = integrations.find((pi: PaymentIntegration) => 
    pi.tenantId === tenantId && pi.isEnabled && pi.isConfigured
  );
  
  return tenantIntegration?.supportedFeatures[feature] || false;
};

export const getPaymentIntegrationStatus = (tenantId: string) => {
  const tenant = mockTenants.find(t => t.id === tenantId);
  const integrations = storage.get(STORAGE_KEYS.PAYMENT_INTEGRATIONS) || mockPaymentIntegrations;
  const tenantIntegration = integrations.find((pi: PaymentIntegration) => pi.tenantId === tenantId);

  return {
    tenantEnabled: tenant?.paymentIntegrationEnabled || false,
    hasIntegration: !!tenantIntegration,
    isConfigured: tenantIntegration?.isConfigured || false,
    isEnabled: tenantIntegration?.isEnabled || false,
    provider: tenantIntegration?.provider,
    supportedFeatures: tenantIntegration?.supportedFeatures || {
      tournaments: false,
      rewards: false,
      cashout: false,
      scoreExchange: false
    }
  };
};

// Define default role permissions
export const defaultRolePermissions: RolePermission[] = [
  {
    roleId: 'super_admin',
    roleName: 'Super Administrator',
    description: 'Full system access across all tenants',
    permissions: ['*'], // wildcard for all permissions
    canAccessPages: ['*'], // access to all pages
    isSystemRole: true
  },
  {
    roleId: 'org_admin',
    roleName: 'Organization Administrator',
    description: 'Manage tenant operations within plan limitations',
    permissions: [
      // User Management - Limited to plan constraints
      'users.create', 'users.read', 'users.update', 'users.delete',
      // Tournament Management - Limited to plan constraints
      'tournaments.create', 'tournaments.read', 'tournaments.update', 'tournaments.delete',
      'tournaments.participate', 'tournaments.inspect',
      // Question Management - Limited to plan constraints
      'questions.create', 'questions.read', 'questions.update', 'questions.delete', 'questions.review', 'questions.answer',
      // Payment & Billing - Read access only
      'payments.read', 'billing.read',
      // Analytics - Basic view access
      'analytics.view',
      // Branding and Customization - If plan allows
      'branding.manage',
      // Monitoring and Inspection
      'participants.monitor',
      // Profile Management
      'profile.manage'
    ],
    canAccessPages: [
      'dashboard', 'user-management', 'tournaments', 'question-bank', 'ai-generator',
      'analytics', 'payments', 'billing', 'payment-integration', 'branding', 'notifications',
      'help', 'profile'
    ],
    isSystemRole: true
  },
  {
    roleId: 'question_manager',
    roleName: 'Question Manager',
    description: 'Manage questions and quiz content',
    permissions: [
      'questions.create', 'questions.read', 'questions.update', 'questions.delete',
      'tournaments.read' // can view tournaments to understand context
    ],
    canAccessPages: ['dashboard', 'questions', 'tournaments'],
    isSystemRole: false
  },
  {
    roleId: 'account_officer',
    roleName: 'Account Officer',
    description: 'Manage payments, rewards, and financial settlements',
    permissions: [
      'payments.create', 'payments.read', 'payments.update', 'payments.delete',
      'billing.read',
      'analytics.view.financial',
      'rewards.manage',
      'settlements.manage'
    ],
    canAccessPages: ['dashboard', 'payments', 'billing', 'analytics'],
    isSystemRole: false
  },
  {
    roleId: 'participant',
    roleName: 'Quiz Participant',
    description: 'Participate in quizzes and tournaments',
    permissions: [
      'tournaments.participate',
      'questions.answer',
      'profile.manage'
    ],
    canAccessPages: ['dashboard', 'tournaments', 'profile'],
    isSystemRole: true
  },
  {
    roleId: 'inspector',
    roleName: 'Quiz Inspector',
    description: 'Monitor and inspect quiz activities',
    permissions: [
      'tournaments.inspect',
      'questions.review',
      'participants.monitor'
    ],
    canAccessPages: ['dashboard', 'tournaments', 'analytics'],
    isSystemRole: false
  },
  {
    roleId: 'practice_user',
    roleName: 'Practice User',
    description: 'Access practice quizzes and training materials',
    permissions: [
      'practice.access',
      'questions.practice',
      'profile.manage'
    ],
    canAccessPages: ['dashboard', 'practice', 'profile'],
    isSystemRole: true
  },
  {
    roleId: 'spectator',
    roleName: 'Spectator',
    description: 'View ongoing quizzes and tournament results (read-only)',
    permissions: [
      'tournaments.view',
      'matches.view',
      'leaderboard.view',
      'profile.view'
    ],
    canAccessPages: ['dashboard', 'tournaments', 'leaderboard'],
    isSystemRole: true
  },
  {
    roleId: 'public',
    roleName: 'Public User',
    description: 'Limited access to public information only',
    permissions: [
      'tournaments.view.public',
      'leaderboard.view.public'
    ],
    canAccessPages: ['dashboard'],
    isSystemRole: true
  }
];

// Mock tenant roles data
export const mockTenantRoles: TenantRole[] = [
  {
    id: 'tr1',
    tenantId: 'tenant1',
    roleId: 'question_manager',
    isActive: true,
    createdBy: 'admin@church.com',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'tr2',
    tenantId: 'tenant1',
    roleId: 'account_officer',
    isActive: true,
    createdBy: 'admin@church.com',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'tr3',
    tenantId: 'tenant2',
    roleId: 'question_manager',
    isActive: true,
    createdBy: 'admin@school.edu',
    createdAt: '2024-01-16T10:00:00Z',
    updatedAt: '2024-01-16T10:00:00Z'
  }
];

// Mock tenants
export const mockTenants: Tenant[] = [
  {
    id: 'tenant1',
    name: 'First Baptist Church',
    planId: 'plan-pro',
    primaryColor: '#2563eb',
    logoUrl: '',
    maxUsers: 20,
    maxTournaments: 5,
    paymentIntegrationEnabled: false, // Default false - tenant admin must enable
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'tenant2', 
    name: 'Grace Community Church',
    planId: 'plan-free',
    primaryColor: '#059669',
    logoUrl: '',
    maxUsers: 5,
    maxTournaments: 1,
    paymentIntegrationEnabled: false, // Default false - tenant admin must enable
    createdAt: '2024-02-01T00:00:00Z'
  },
  {
    id: 'tenant3',
    name: 'St. Mary\'s Cathedral',
    planId: 'plan-enterprise', 
    primaryColor: '#7c3aed',
    logoUrl: '',
    maxUsers: -1,
    maxTournaments: -1,
    paymentIntegrationEnabled: true, // Example: this tenant has enabled payment integration
    createdAt: '2024-03-01T00:00:00Z'
  }
];

// Mock payment integrations
export const mockPaymentIntegrations: PaymentIntegration[] = [
  {
    id: 'payment1',
    tenantId: 'tenant1',
    provider: 'stripe',
    isEnabled: false,
    isConfigured: false,
    configuration: {
      publishableKey: '',
      secretKey: '',
      webhookSecret: '',
      environment: 'sandbox'
    },
    supportedFeatures: {
      tournaments: false,
      rewards: false,
      cashout: false,
      scoreExchange: false
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'payment2',
    tenantId: 'tenant3',
    provider: 'stripe',
    isEnabled: true,
    isConfigured: true,
    configuration: {
      publishableKey: 'pk_test_...',
      secretKey: 'sk_test_...',
      webhookSecret: 'whsec_...',
      environment: 'sandbox'
    },
    supportedFeatures: {
      tournaments: true,
      rewards: true,
      cashout: true,
      scoreExchange: true
    },
    createdAt: '2024-03-01T00:00:00Z',
    updatedAt: '2024-03-15T00:00:00Z'
  },
  // Nigerian Payment Gateways
  {
    id: 'payment3',
    tenantId: 'tenant1',
    provider: 'paystack',
    isEnabled: false,
    isConfigured: false,
    configuration: {
      publishableKey: '',
      secretKey: '',
      webhookSecret: '',
      environment: 'sandbox'
    },
    supportedFeatures: {
      tournaments: false,
      rewards: false,
      cashout: false,
      scoreExchange: false
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'payment4',
    tenantId: 'tenant2',
    provider: 'flutterwave',
    isEnabled: false,
    isConfigured: false,
    configuration: {
      publishableKey: '',
      secretKey: '',
      webhookSecret: '',
      environment: 'sandbox'
    },
    supportedFeatures: {
      tournaments: false,
      rewards: false,
      cashout: false,
      scoreExchange: false
    },
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-02-01T00:00:00Z'
  },
  {
    id: 'payment5',
    tenantId: 'tenant3',
    provider: 'interswitch',
    isEnabled: false,
    isConfigured: false,
    configuration: {
      publishableKey: '',
      secretKey: '',
      webhookSecret: '',
      environment: 'sandbox'
    },
    supportedFeatures: {
      tournaments: false,
      rewards: false,
      cashout: false,
      scoreExchange: false
    },
    createdAt: '2024-03-01T00:00:00Z',
    updatedAt: '2024-03-01T00:00:00Z'
  }
];

// Mock users
export const mockUsers: User[] = [
  {
    id: 'user1',
    name: 'Admin User',
    email: 'admin@church.com',
    role: 'org_admin',
    tenantId: 'tenant1',
    xp: 1250,
    level: 5,
    badges: ['first_win', 'perfect_score', 'dedicated'],
    walletBalance: 150.00,
    createdAt: '2024-01-15T00:00:00Z'
  },
  {
    id: 'user2',
    name: 'Sarah Johnson',
    email: 'sarah@email.com', 
    role: 'participant',
    tenantId: 'tenant1',
    xp: 750,
    level: 4,
    badges: ['first_win', 'streak_5'],
    walletBalance: 75.50,
    createdAt: '2024-02-01T00:00:00Z'
  },
  {
    id: 'user3',
    name: 'Mike Wilson',
    email: 'mike@email.com',
    role: 'participant', 
    tenantId: 'tenant1',
    xp: 450,
    level: 3,
    badges: ['first_win'],
    walletBalance: 25.00,
    createdAt: '2024-02-15T00:00:00Z'
  },
  {
    id: 'user4',
    name: 'Super Admin',
    email: 'superadmin@equiz.com',
    role: 'super_admin',
    tenantId: 'tenant1',
    xp: 2500,
    level: 8,
    badges: ['first_win', 'perfect_score', 'dedicated', 'scholar'],
    walletBalance: 500.00,
    createdAt: '2024-01-01T00:00:00Z'
  },
  // Question managers
  {
    id: 'user_qm1',
    name: 'Sarah Johnson',
    email: 'questions@church.com',
    role: 'question_manager',
    tenantId: 'tenant1',
    xp: 800,
    level: 4,
    badges: ['scholar'],
    walletBalance: 50.00,
    isActive: true,
    lastLoginAt: '2024-11-10T08:00:00Z',
    createdAt: '2024-01-15T10:00:00Z'
  },
  // Account officers
  {
    id: 'user_ao1',
    name: 'Michael Brown',
    email: 'finance@church.com',
    role: 'account_officer',
    tenantId: 'tenant1',
    xp: 600,
    level: 3,
    badges: ['dedicated'],
    walletBalance: 75.00,
    isActive: true,
    lastLoginAt: '2024-11-09T14:30:00Z',
    createdAt: '2024-01-15T10:00:00Z'
  },
  // Additional participants
  {
    id: 'user_p1',
    name: 'John Doe',
    email: 'john.doe@church.com',
    role: 'participant',
    tenantId: 'tenant1',
    xp: 300,
    level: 2,
    badges: ['first_win'],
    walletBalance: 15.00,
    isActive: true,
    lastLoginAt: '2024-11-10T09:15:00Z',
    createdAt: '2024-01-20T10:00:00Z'
  },
  // Inspectors
  {
    id: 'user_i1',
    name: 'Lisa Wilson',
    email: 'inspector@church.com',
    role: 'inspector',
    tenantId: 'tenant1',
    xp: 400,
    level: 3,
    badges: ['dedicated'],
    walletBalance: 30.00,
    isActive: true,
    lastLoginAt: '2024-11-09T16:45:00Z',
    createdAt: '2024-01-18T10:00:00Z'
  }
];

// Mock tournaments
export const mockTournaments: Tournament[] = [
  {
    id: 'tournament1',
    name: 'Weekly Bible Challenge',
    description: 'Test your knowledge of Bible basics',
    category: 'General Knowledge',
    difficulty: 'medium',
    entryFee: 5.00,
    prizePool: 100.00,
    maxParticipants: 50,
    currentParticipants: 23,
    spectatorCount: 15,
    startDate: '2024-11-15T19:00:00Z',
    endDate: '2024-11-15T21:00:00Z', 
    status: 'scheduled',
    participants: ['user2', 'user3'],
    spectators: ['user1'],
    questions: ['q1', 'q2', 'q3'],
    createdBy: 'user1',
    tenantId: 'tenant1',
    createdAt: '2024-11-01T00:00:00Z'
  },
  {
    id: 'tournament2',
    name: 'Psalms & Proverbs Quiz',
    description: 'Focus on wisdom literature',
    category: 'Psalms & Proverbs',
    difficulty: 'hard',
    entryFee: 10.00,
    prizePool: 200.00,
    maxParticipants: 30,
    currentParticipants: 18,
    spectatorCount: 25,
    startDate: '2024-11-10T18:00:00Z',
    endDate: '2024-11-10T20:00:00Z',
    status: 'active',
    participants: ['user2', 'user3'],
    spectators: ['user1'],
    questions: ['q4', 'q5', 'q6'],
    createdBy: 'user1', 
    tenantId: 'tenant1',
    createdAt: '2024-10-25T00:00:00Z'
  },
  {
    id: 'tournament3',
    name: 'New Testament Masters',
    description: 'Advanced New Testament knowledge',
    category: 'New Testament',
    difficulty: 'hard',
    entryFee: 15.00,
    prizePool: 300.00,
    maxParticipants: 20,
    currentParticipants: 20,
    spectatorCount: 40,
    startDate: '2024-10-30T19:00:00Z',
    endDate: '2024-10-30T21:30:00Z',
    status: 'completed',
    participants: ['user2', 'user3'],
    spectators: ['user1'],
    questions: ['q7', 'q8', 'q9'],
    createdBy: 'user1',
    tenantId: 'tenant1', 
    createdAt: '2024-10-15T00:00:00Z'
  }
];

// Mock questions
export const mockQuestions: Question[] = [
  {
    id: 'q1',
    text: 'Who was the first man created by God?',
    options: ['Adam', 'Noah', 'Abraham', 'Moses'],
    correctAnswer: 0,
    category: 'Old Testament',
    difficulty: 'easy',
    source: 'manual',
    explanation: 'Adam was the first man created by God in the Garden of Eden.',
    verse: 'Genesis 2:7',
    tenantId: 'tenant1'
  },
  {
    id: 'q2', 
    text: 'How many days did it take God to create the world?',
    options: ['5 days', '6 days', '7 days', '8 days'],
    correctAnswer: 1,
    category: 'Old Testament',
    difficulty: 'easy',
    source: 'manual',
    explanation: 'God created the world in 6 days and rested on the 7th day.',
    verse: 'Genesis 1:31-2:2',
    tenantId: 'tenant1'
  },
  {
    id: 'q3',
    text: 'Who betrayed Jesus for 30 pieces of silver?',
    options: ['Peter', 'Judas', 'Thomas', 'Matthew'],
    correctAnswer: 1,
    category: 'New Testament', 
    difficulty: 'medium',
    source: 'manual',
    explanation: 'Judas Iscariot betrayed Jesus to the chief priests for 30 pieces of silver.',
    verse: 'Matthew 26:14-16',
    tenantId: 'tenant1'
  },
  {
    id: 'q4',
    text: 'What is the longest book in the Bible?',
    options: ['Genesis', 'Psalms', 'Isaiah', 'Jeremiah'],
    correctAnswer: 1,
    category: 'General Knowledge',
    difficulty: 'medium',
    source: 'ai',
    explanation: 'Psalms is the longest book in the Bible with 150 chapters.',
    verse: 'Psalms 1:1',
    tenantId: 'tenant1'
  }
];

// Storage utility functions with robust persistence
export const storage = {
  get: (key: string) => {
    console.log(`🔍 storage.get called for key: ${key}`);
    try {
      // For current user, also check URL hash as emergency backup
      if (key === STORAGE_KEYS.CURRENT_USER) {
        // Check URL hash first for current user (survives all reloads)
        const hash = window.location.hash;
        console.log(`🔍 Checking URL hash for user: '${hash}'`);
        if (hash.includes('user=')) {
          try {
            const userMatch = hash.match(/user=([^&]+)/);
            if (userMatch) {
              const userEmail = decodeURIComponent(userMatch[1]);
              console.log(`Found user in URL hash: ${userEmail}`);
              
              // Get full user details from users list (avoid recursive storage call)
              let allUsers = mockUsers;
              try {
                // Try to get users from storage without using this storage.get method to avoid recursion
                const usersJson = localStorage.getItem(STORAGE_KEYS.USERS) || sessionStorage.getItem(STORAGE_KEYS.USERS);
                if (usersJson) {
                  allUsers = JSON.parse(usersJson);
                }
              } catch (usersError) {
                // Fall back to mockUsers
              }
              
              const fullUser = (allUsers as User[]).find(u => u.email === userEmail);
              
              if (fullUser) {
                console.log(`Found full user details for ${userEmail}, restoring to storage`);
                // Immediately save full user details back to storage to prevent future lookups
                try {
                  const jsonValue = JSON.stringify(fullUser);
                  localStorage.setItem(key, jsonValue);
                  sessionStorage.setItem(key, jsonValue);
                  console.log(`Restored ${userEmail} to storage from URL hash`);
                } catch (restoreError) {
                  console.warn('Could not restore user to storage:', restoreError);
                }
                return fullUser;
              } else {
                // Return a basic user object if full details not found
                return { email: userEmail, id: `user_${userEmail}` };
              }
            }
          } catch (hashError) {
            // Continue to storage check
          }
        }
      }

      // Try multiple storage locations for maximum reliability
      const sources = [
        () => localStorage.getItem(key),
        () => sessionStorage.getItem(key),
        // Try with a prefixed key in case of conflicts
        () => localStorage.getItem(`backup_${key}`),
        () => sessionStorage.getItem(`backup_${key}`)
      ];

      for (const getSource of sources) {
        try {
          const item = getSource();
          if (item) {
            const parsed = JSON.parse(item);
            console.log(`Found ${key} in storage:`, key === STORAGE_KEYS.CURRENT_USER ? parsed?.email : 'data');
            return parsed;
          }
        } catch (sourceError) {
          // Continue to next source if this one fails
          continue;
        }
      }
      
      console.log(`No ${key} found in any storage location`);
      return null;
    } catch (error) {
      console.error('Error reading from storage:', error);
      return null;
    }
  },
  
  set: (key: string, value: unknown) => {
    try {
      const jsonValue = JSON.stringify(value);
      
      // For current user, also save to URL hash as emergency backup
      if (key === STORAGE_KEYS.CURRENT_USER && value && isUser(value)) {
        try {
          // Use URL hash to persist user across all reloads and HMR
          const userParam = `user=${encodeURIComponent(value.email)}`;
          const currentHash = window.location.hash;
          
          // Remove existing user param and add new one
          const cleanHash = currentHash.replace(/[&#]?user=[^&]*&?/g, '');
          const separator = cleanHash.includes('#') ? (cleanHash.endsWith('#') ? '' : '&') : '#';
          const newHash = cleanHash + separator + userParam;
          
          window.location.hash = newHash;
          console.log(`Saved user to URL hash: ${value.email}`);
        } catch (hashError) {
          console.warn('Could not save to URL hash:', hashError);
        }
      }
      
      // Save to multiple locations for maximum persistence
      const saveOperations = [
        () => localStorage.setItem(key, jsonValue),
        () => sessionStorage.setItem(key, jsonValue),
        // Backup copies with prefixed keys
        () => localStorage.setItem(`backup_${key}`, jsonValue),
        () => sessionStorage.setItem(`backup_${key}`, jsonValue),
      ];

      let successCount = 0;
      saveOperations.forEach(saveOp => {
        try {
          saveOp();
          successCount++;
        } catch (saveError) {
          // Continue saving to other locations
        }
      });
      
      console.log(`Saved ${key} to ${successCount}/4 storage locations + URL hash`);
      if (key === STORAGE_KEYS.CURRENT_USER && isUser(value)) {
        console.log('User saved:', value.email);
      }
    } catch (error) {
      console.error('Error writing to storage:', error);
    }
  },
  
  remove: (key: string) => {
    try {
      // For current user, also remove from URL hash
      if (key === STORAGE_KEYS.CURRENT_USER) {
        try {
          const currentHash = window.location.hash;
          const cleanHash = currentHash.replace(/[&#]?user=[^&]*&?/g, '');
          window.location.hash = cleanHash;
          console.log('Removed user from URL hash');
        } catch (hashError) {
          console.warn('Could not remove from URL hash:', hashError);
        }
      }
      
      // Remove from all storage locations
      const removeOperations = [
        () => localStorage.removeItem(key),
        () => sessionStorage.removeItem(key),
        () => localStorage.removeItem(`backup_${key}`),
        () => sessionStorage.removeItem(`backup_${key}`)
      ];

      removeOperations.forEach(removeOp => {
        try {
          removeOp();
        } catch (removeError) {
          // Continue removing from other locations
        }
      });
      
      console.log(`Removed ${key} from all storage locations + URL hash`);
    } catch (error) {
      console.error('Error removing from storage:', error);
    }
  }
};

// Plan-based access control functions
export function getTenantPlan(tenantId: string): Plan | null {
  const tenant = mockTenants.find(t => t.id === tenantId);
  if (!tenant) return null;
  
  return defaultPlans.find(p => p.id === tenant.planId) || null;
}

export function hasFeatureAccess(user: User, feature: string): boolean {
  if (!user) return false;
  
  // Normalize role to lowercase for comparison
  const normalizedRole = user.role?.toLowerCase();
  
  // Super admin always has access to all features
  if (normalizedRole === 'super_admin') return true;
  
  // For org_admin and other roles, check tenant plan features
  const plan = user.tenantId ? getTenantPlan(user.tenantId) : null;
  if (!plan) {
    // If no plan found, only super_admin has access
    return false;
  }
  
  // Check if plan includes the feature
  switch (feature) {
    case 'branding':
      return plan.features.some(f => f.includes('Custom branding') || f.includes('Full custom branding'));
    case 'analytics':
      return plan.features.some(f => f.includes('analytics') || f.includes('Analytics'));
    case 'ai-generator':
      return plan.maxQuestionsPerTournament > 50; // AI available for Pro+ plans
    case 'payment-integration':
      return plan.monthlyPrice > 0; // Paid plans only
    case 'unlimited-users':
      return plan.maxUsers === -1;
    case 'unlimited-tournaments':
      return plan.maxTournaments === -1;
    default:
      return true; // Default access for basic features
  }
}

export function canCreateMoreUsers(tenantId: string): boolean {
  const plan = getTenantPlan(tenantId);
  if (!plan) return false;
  
  if (plan.maxUsers === -1) return true; // Unlimited
  
  const tenantUsers = mockUsers.filter(u => u.tenantId === tenantId);
  return tenantUsers.length < plan.maxUsers;
}

export function canCreateMoreTournaments(tenantId: string): boolean {
  const plan = getTenantPlan(tenantId);
  if (!plan) return false;
  
  if (plan.maxTournaments === -1) return true; // Unlimited
  
  const tenantTournaments = mockTournaments.filter(t => t.tenantId === tenantId);
  return tenantTournaments.length < plan.maxTournaments;
}

// Role permission utility functions
export function hasPermission(user: User, permission: string): boolean {
  if (!user) return false;
  
  // Normalize role to lowercase for comparison
  const normalizedRole = user.role?.toLowerCase();
  
  // Super admin has all permissions
  if (normalizedRole === 'super_admin') return true;
  
  // Get role permissions
  const rolePermission = defaultRolePermissions.find(rp => rp.roleId.toLowerCase() === normalizedRole);
  if (!rolePermission) return false;
  
  // Check wildcard permission
  if (rolePermission.permissions.includes('*')) return true;
  
  // Check specific permission
  const hasBasicPermission = rolePermission.permissions.includes(permission);
  
  // For org_admin and other roles, also check if feature is allowed by plan
  if (normalizedRole === 'org_admin' && hasBasicPermission) {
    // Check if the permission requires a plan feature
    const featureMap: Record<string, string> = {
      'branding.manage': 'branding',
      'analytics.view': 'analytics',
      'questions.ai-generate': 'ai-generator',
      'payments.configure': 'payment-integration'
    };
    
    const requiredFeature = featureMap[permission];
    if (requiredFeature) {
      return hasFeatureAccess(user, requiredFeature);
    }
  }
  
  return hasBasicPermission;
}

export function canAccessPage(user: User, page: string): boolean {
  if (!user) return false;
  
  // Normalize role to lowercase for comparison
  const normalizedRole = user.role?.toLowerCase();
  
  // Super admin can access all pages
  if (normalizedRole === 'super_admin') return true;
  
  // Get role permissions
  const rolePermission = defaultRolePermissions.find(rp => rp.roleId.toLowerCase() === normalizedRole);
  if (!rolePermission) return false;
  
  // Check wildcard access
  if (rolePermission.canAccessPages.includes('*')) return true;
  
  // Check specific page access
  const hasPageAccess = rolePermission.canAccessPages.includes(page);
  
  // For pages that require plan features, check plan access
  if (hasPageAccess) {
    const pageFeatureMap: Record<string, string> = {
      'branding': 'branding',
      'analytics': 'analytics',
      'ai-generator': 'ai-generator',
      'payment-integration': 'payment-integration'
    };
    
    const requiredFeature = pageFeatureMap[page];
    if (requiredFeature && normalizedRole !== 'super_admin') {
      return hasFeatureAccess(user, requiredFeature);
    }
  }
  
  return hasPageAccess;
}

export function getUsersByTenant(tenantId: string): User[] {
  const users = storage.get(STORAGE_KEYS.USERS) || [];
  return users.filter(user => user.tenantId === tenantId);
}

export function getRolePermission(roleId: string): RolePermission | undefined {
  return defaultRolePermissions.find(rp => rp.roleId === roleId);
}

// Resource-level permission checking
export function canEditResource(user: User, resourceType: 'tournament' | 'question' | 'user', resourceOwnerId?: string): boolean {
  if (!user) return false;
  
  const normalizedRole = user.role?.toLowerCase();
  
  // Super admin can edit anything
  if (normalizedRole === 'super_admin') return true;
  
  // Org admin can edit resources within their tenant
  if (normalizedRole === 'org_admin') {
    return true; // Within tenant scope (already filtered at query level)
  }
  
  // Resource-specific rules
  switch (resourceType) {
    case 'tournament':
      // Question managers can edit tournaments they created
      if (normalizedRole === 'question_manager' && resourceOwnerId === user.id) {
        return true;
      }
      return false;
      
    case 'question':
      // Question managers can edit questions
      if (normalizedRole === 'question_manager') {
        return true;
      }
      return false;
      
    case 'user':
      // Only admins can edit users
      return normalizedRole === 'org_admin';
      
    default:
      return false;
  }
}

export function canDeleteResource(user: User, resourceType: 'tournament' | 'question' | 'user', resourceOwnerId?: string): boolean {
  if (!user) return false;
  
  const normalizedRole = user.role?.toLowerCase();
  
  // Super admin can delete anything
  if (normalizedRole === 'super_admin') return true;
  
  // Org admin can delete resources within their tenant
  if (normalizedRole === 'org_admin') {
    return true;
  }
  
  // Most other roles cannot delete
  return false;
}

export function canViewResource(user: User, resourceType: 'tournament' | 'question' | 'payment', isPublic: boolean = false): boolean {
  if (!user) return isPublic;
  
  const normalizedRole = user.role?.toLowerCase();
  
  // Super admin and org admin can view everything
  if (normalizedRole === 'super_admin' || normalizedRole === 'org_admin') {
    return true;
  }
  
  // Public resources can be viewed by anyone
  if (isPublic) return true;
  
  // Resource-specific view permissions
  switch (resourceType) {
    case 'tournament':
      return ['participant', 'spectator', 'inspector', 'question_manager'].includes(normalizedRole || '');
      
    case 'question':
      return ['question_manager', 'participant', 'practice_user'].includes(normalizedRole || '');
      
    case 'payment':
      return ['account_officer'].includes(normalizedRole || '');
      
    default:
      return false;
  }
}

export function getAvailableRolesForTenant(tenantId: string): RolePermission[] {
  // Return non-system roles that can be assigned by tenant admin
  return defaultRolePermissions.filter(rp => !rp.isSystemRole || rp.roleId === 'participant' || rp.roleId === 'practice_user');
}

// Centralized role assignment policy
export function getAssignableRoles(creatorUser: User): UserRole[] {
  if (!creatorUser) return [];
  
  const baseRoles: UserRole[] = ['participant', 'practice_user'];
  
  switch (creatorUser.role) {
    case 'super_admin':
      // Super admin can assign all roles
      return ['super_admin', 'org_admin', 'question_manager', 'account_officer', 'inspector', 'participant', 'practice_user'];
    
    case 'org_admin':
      // Org admin can assign internal management roles within their tenant
      return [...baseRoles, 'question_manager', 'account_officer', 'inspector'];
    
    default:
      // Other roles can only assign basic participant roles
      return baseRoles;
  }
}

// Check if a user can assign a specific role
export function canAssignRole(creatorUser: User, targetRole: UserRole): boolean {
  const assignableRoles = getAssignableRoles(creatorUser);
  return assignableRoles.includes(targetRole);
}

// Audit logging functions
export function logAuditEvent(
  creatorUser: User,
  action: AuditLog['action'],
  details: AuditLog['details'],
  targetUserId?: string
): void {
  if (!creatorUser || !creatorUser.tenantId) return;
  
  const auditLog: AuditLog = {
    id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    tenantId: creatorUser.tenantId,
    userId: creatorUser.id,
    targetUserId,
    action,
    details,
    timestamp: new Date().toISOString()
  };
  
  const existingLogs = storage.get(STORAGE_KEYS.AUDIT_LOGS) || [];
  existingLogs.push(auditLog);
  storage.set(STORAGE_KEYS.AUDIT_LOGS, existingLogs);
}

// Get audit logs for a tenant
export function getAuditLogsForTenant(tenantId: string, limit: number = 100): AuditLog[] {
  const allLogs = storage.get(STORAGE_KEYS.AUDIT_LOGS) || [];
  return allLogs
    .filter((log: AuditLog) => log.tenantId === tenantId)
    .sort((a: AuditLog, b: AuditLog) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}

// Test function for role assignment policy (for development/debugging)
export function testRoleAssignmentPolicy(): void {
  console.log('Testing Role Assignment Policy:');
  
  const superAdmin: User = { id: 'sa1', role: 'super_admin', tenantId: 'tenant1' } as User;
  const orgAdmin: User = { id: 'oa1', role: 'org_admin', tenantId: 'tenant1' } as User;
  const participant: User = { id: 'p1', role: 'participant', tenantId: 'tenant1' } as User;
  
  console.log('Super Admin can assign:', getAssignableRoles(superAdmin));
  console.log('Org Admin can assign:', getAssignableRoles(orgAdmin));
  console.log('Participant can assign:', getAssignableRoles(participant));
  
  console.log('\nRole Assignment Tests:');
  console.log('Org Admin can assign question_manager:', canAssignRole(orgAdmin, 'question_manager'));
  console.log('Org Admin can assign org_admin:', canAssignRole(orgAdmin, 'org_admin'));
  console.log('Super Admin can assign org_admin:', canAssignRole(superAdmin, 'org_admin'));
  console.log('Participant can assign anything:', canAssignRole(participant, 'participant'));
}

// Get plan by ID
export function getPlanById(planId: string): Plan | null {
  const plans = storage.get(STORAGE_KEYS.PLANS) || defaultPlans;
  return plans.find((plan: Plan) => plan.id === planId) || null;
}

// Get tenant by ID
export function getTenantById(tenantId: string): Tenant | null {
  const tenants = storage.get(STORAGE_KEYS.TENANTS) || mockTenants;
  return tenants.find((tenant: Tenant) => tenant.id === tenantId) || null;
}

// Initialize mock data
export const initializeMockData = () => {
  // Only initialize if data doesn't exist
  if (!storage.get(STORAGE_KEYS.PLANS)) {
    storage.set(STORAGE_KEYS.PLANS, defaultPlans);
  }
  
  if (!storage.get(STORAGE_KEYS.BILLING)) {
    storage.set(STORAGE_KEYS.BILLING, mockBilling);
  }
  
  if (!storage.get(STORAGE_KEYS.TENANTS)) {
    storage.set(STORAGE_KEYS.TENANTS, mockTenants);
  }
  
  if (!storage.get(STORAGE_KEYS.USERS)) {
    storage.set(STORAGE_KEYS.USERS, mockUsers);
  }
  
  if (!storage.get(STORAGE_KEYS.TOURNAMENTS)) {
    storage.set(STORAGE_KEYS.TOURNAMENTS, mockTournaments);
  }
  
  if (!storage.get(STORAGE_KEYS.QUESTIONS)) {
    storage.set(STORAGE_KEYS.QUESTIONS, mockQuestions);
  }
  
  if (!storage.get(STORAGE_KEYS.PAYMENT_INTEGRATIONS)) {
    storage.set(STORAGE_KEYS.PAYMENT_INTEGRATIONS, mockPaymentIntegrations);
  }
  
  // Initialize role permissions
  if (!storage.get(STORAGE_KEYS.ROLE_PERMISSIONS)) {
    storage.set(STORAGE_KEYS.ROLE_PERMISSIONS, defaultRolePermissions);
  }
  
  // Initialize audit logs
  if (!storage.get(STORAGE_KEYS.AUDIT_LOGS)) {
    storage.set(STORAGE_KEYS.AUDIT_LOGS, []);
  }
  
  // Initialize tenant roles
  if (!storage.get(STORAGE_KEYS.TENANT_ROLES)) {
    storage.set(STORAGE_KEYS.TENANT_ROLES, mockTenantRoles);
  }
};