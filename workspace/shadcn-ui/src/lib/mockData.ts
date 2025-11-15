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
  TENANT_ROLE_CUSTOMIZATIONS: 'equiz_tenant_role_customizations', // NEW: Phase 2
  AUDIT_LOGS: 'equiz_audit_logs',
  CURRENT_USER: 'equiz_current_user',
  BRANDING: 'equiz_branding',
  THEME_CONFIGS: 'equiz_theme_configs', // Theme/template settings per tenant
  TOURNAMENT_APPLICATIONS: 'equiz_tournament_applications',
  QUIZ_ATTEMPTS: 'equiz_quiz_attempts',
  PRACTICE_POINTS: 'equiz_practice_points',
  PARISHES: 'equiz_parishes',
  USER_PROFILES: 'equiz_user_profiles',
  PARISH_TOURNAMENT_STATS: 'equiz_parish_tournament_stats',
  TOURNAMENT_PRIZES: 'equiz_tournament_prizes',
  PRIZE_AWARDS: 'equiz_prize_awards',
  PAYMENT_GATEWAYS: 'equiz_payment_gateways',
  TOURNAMENT_PAYMENTS: 'equiz_tournament_payments',
  TOURNAMENT_DONATIONS: 'equiz_tournament_donations',
  KNOCKOUT_BRACKETS: 'equiz_knockout_brackets',
  KNOCKOUT_MATCHES: 'equiz_knockout_matches',
  PARTICIPANT_JOURNEYS: 'equiz_participant_journeys',
  CUSTOM_CATEGORIES: 'equiz_custom_categories',
  ROUND_CONFIG_TEMPLATES: 'equiz_round_config_templates',
  AI_GENERATION_CONFIGS: 'equiz_ai_generation_configs',
  AI_GENERATION_REQUESTS: 'equiz_ai_generation_requests',
  TOURNAMENT_QUESTION_CONFIGS: 'equiz_tournament_question_configs',
  QUESTION_LIFECYCLE_LOGS: 'equiz_question_lifecycle_logs',
  BONUS_QUESTION_CONFIGS: 'equiz_bonus_question_configs',
  BONUS_QUESTION_REQUESTS: 'equiz_bonus_question_requests'
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

// Parish/Organization Contact Person
export interface ParishContactPerson {
  name: string;
  phoneNumber: string;
  emailAddress: string;
}

// Parish/Organization Authority
export interface ParishAuthority {
  name: string;
  phoneNumber: string;
  emailAddress: string;
  address: string;
}

// Parish/Organization Location
export interface ParishLocation {
  address: string;
  latitude?: number;
  longitude?: number;
  mapUrl?: string;
}

// Parish/Organization interface
export interface Parish {
  id: string;
  name: string;
  displayName?: string; // Custom display name set by tenant admin
  tenantId: string;
  
  // Authority (Person in charge)
  authority: ParishAuthority;
  
  // Contact Person
  contactPerson: ParishContactPerson;
  
  // Parish Contact Details
  parishPhoneNumber: string;
  parishEmailAddress: string;
  
  // Location
  location: ParishLocation;
  
  // Images
  parishImage?: string; // Landscape 16:9 ratio
  
  // Status
  isActive: boolean;
  isVerified: boolean;
  
  // Metadata
  createdBy: string; // User ID who added this parish
  createdAt: string;
  updatedAt?: string;
  verifiedBy?: string;
  verifiedAt?: string;
}

// Next of Kin information
export interface NextOfKin {
  name: string;
  relationship: string;
  phoneNumber: string;
  address: string;
}

// Bank Account information
export interface BankAccount {
  bankName: string;
  accountNumber: string;
  accountName: string;
  bankCode?: string;
}

// Social Media Accounts
export interface SocialAccounts {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  whatsapp?: string;
  telegram?: string;
}

// User Profile (Extended Information)
export interface UserProfile {
  userId: string;
  
  // Personal Information
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  phoneNumber?: string;
  alternatePhoneNumber?: string;
  homeAddress?: string;
  profilePicture?: string; // Square or portrait format
  
  // Parish/Organization
  parishId?: string; // Reference to Parish ID
  
  // Next of Kin
  nextOfKin?: NextOfKin;
  
  // Bank Account for Cashout
  bankAccount?: BankAccount;
  
  // Social Media
  socialAccounts?: SocialAccounts;
  
  // Profile Completion
  profileCompletionPercentage: number;
  isProfileComplete: boolean;
  
  // Metadata
  createdAt: string;
  updatedAt?: string;
}

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
  // Practice mode application
  practiceAccessStatus?: 'none' | 'pending' | 'approved' | 'rejected';
  practiceAccessAppliedAt?: string;
  practiceAccessApprovedAt?: string;
  practiceAccessApprovedBy?: string;
  // Tournament qualification
  qualificationStatus?: 'not_qualified' | 'in_training' | 'qualified' | 'approved_participant';
  qualificationApprovedAt?: string;
  qualificationApprovedBy?: string;
  // Extended profile reference
  hasExtendedProfile?: boolean;
  profileCompletionPercentage?: number;
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

// Advanced Tournament Feature Definitions
export const TOURNAMENT_FEATURES = {
  // Basic Features (All Plans)
  BASIC_TOURNAMENTS: 'tournaments.basic',
  INDIVIDUAL_PARTICIPATION: 'tournaments.individual',
  BASIC_SCORING: 'tournaments.basic_scoring',
  
  // Advanced Features (Professional Plan and above)
  PARISH_GROUP_MODE: 'tournaments.parish_mode',           // Allow parish/group participation
  MIXED_MODE: 'tournaments.mixed_mode',                   // Both individual + parish in same tournament
  PARISH_SCORING: 'tournaments.parish_scoring',           // Average/Total scoring for parishes
  MAX_PARTICIPANTS_PER_PARISH: 'tournaments.max_per_parish', // Limit members per parish
  ELIGIBILITY_RESTRICTIONS: 'tournaments.eligibility',    // Age, location, gender filters
  ADVANCED_SCORING_METHODS: 'tournaments.advanced_scoring', // Highest/Latest scoring (already implemented)
  DUAL_LEADERBOARDS: 'tournaments.dual_leaderboards',     // Separate individual & parish boards
  PRIZE_MANAGEMENT: 'tournaments.prize_management',       // Prize configuration and distribution
  CERTIFICATE_GENERATION: 'tournaments.certificates',     // Auto-generate certificates
  ENTRY_FEES: 'tournaments.entry_fees',                   // Charge entry fees
  PAYMENT_INTEGRATION: 'tournaments.payment_integration', // Payment gateway setup
  
  // Professional Features (Enterprise Plan)
  PARISH_CAPTAIN_ROLES: 'tournaments.parish_captains',    // Designated parish leaders
  MULTI_PARISH_TEAMS: 'tournaments.multi_parish',         // Cross-parish team formation
  CUSTOM_ELIGIBILITY_RULES: 'tournaments.custom_eligibility', // Advanced rule builder
  AUTOMATED_BRACKETS: 'tournaments.brackets',             // Tournament bracket generation
  TEAM_MANAGEMENT_DASHBOARD: 'tournaments.team_dashboard', // Parish admin dashboard
  ADVANCED_PRIZE_FEATURES: 'tournaments.advanced_prizes', // Multiple prize categories, sponsors
  AUTO_PRIZE_DISTRIBUTION: 'tournaments.auto_distribution', // Automatic prize awards
  PUBLIC_DONATIONS: 'tournaments.donations',              // Public donation campaigns
  PARISH_ENTRY_FEES: 'tournaments.parish_fees',           // Parish/group fee collection
  CUSTOM_PAYMENT_GATEWAYS: 'tournaments.custom_gateways', // Multiple payment providers
  PAYMENT_ANALYTICS: 'tournaments.payment_analytics',      // Revenue tracking and reports
  
  // Knockout Tournament Features (Professional+)
  KNOCKOUT_TOURNAMENTS: 'tournaments.knockout',           // Bracket-style elimination
  BRACKET_VISUALIZATION: 'tournaments.bracket_view',      // Visual bracket display
  DOUBLE_ELIMINATION: 'tournaments.double_elimination',   // Double elimination brackets
  SWISS_SYSTEM: 'tournaments.swiss_system',               // Swiss-system tournaments
  
  // Advanced Round Configuration Features
  ROUND_CONFIG_TEMPLATES: 'tournaments.round_templates',  // Pre-built round configurations (Professional+)
  QUESTION_POOL_VALIDATION: 'tournaments.pool_validation', // Real-time question availability checks (Professional+)
  CLONE_ROUND_CONFIG: 'tournaments.clone_rounds',         // Duplicate round settings (Professional+)
  
  // Enterprise Round Features
  CUSTOM_CATEGORIES: 'tournaments.custom_categories',     // Unlimited custom question categories (Enterprise)
  CATEGORY_WEIGHTING: 'tournaments.category_weighting'    // Scoring multipliers per category (Enterprise)
};

// Feature to Plan Mapping
export const FEATURE_PLAN_REQUIREMENTS: Record<string, string[]> = {
  // Basic features available to all plans
  [TOURNAMENT_FEATURES.BASIC_TOURNAMENTS]: ['starter', 'pro', 'professional', 'enterprise'],
  [TOURNAMENT_FEATURES.INDIVIDUAL_PARTICIPATION]: ['starter', 'pro', 'professional', 'enterprise'],
  [TOURNAMENT_FEATURES.BASIC_SCORING]: ['starter', 'pro', 'professional', 'enterprise'],
  
  // Advanced features for Professional and Enterprise
  [TOURNAMENT_FEATURES.PARISH_GROUP_MODE]: ['professional', 'enterprise'],
  [TOURNAMENT_FEATURES.MIXED_MODE]: ['professional', 'enterprise'],
  [TOURNAMENT_FEATURES.PARISH_SCORING]: ['professional', 'enterprise'],
  [TOURNAMENT_FEATURES.MAX_PARTICIPANTS_PER_PARISH]: ['professional', 'enterprise'],
  [TOURNAMENT_FEATURES.ELIGIBILITY_RESTRICTIONS]: ['professional', 'enterprise'],
  [TOURNAMENT_FEATURES.ADVANCED_SCORING_METHODS]: ['professional', 'enterprise'],
  [TOURNAMENT_FEATURES.DUAL_LEADERBOARDS]: ['professional', 'enterprise'],
  [TOURNAMENT_FEATURES.PRIZE_MANAGEMENT]: ['professional', 'enterprise'],
  [TOURNAMENT_FEATURES.CERTIFICATE_GENERATION]: ['professional', 'enterprise'],
  [TOURNAMENT_FEATURES.ENTRY_FEES]: ['professional', 'enterprise'],
  [TOURNAMENT_FEATURES.PAYMENT_INTEGRATION]: ['professional', 'enterprise'],
  
  // Professional features for Enterprise only
  [TOURNAMENT_FEATURES.PARISH_CAPTAIN_ROLES]: ['enterprise'],
  [TOURNAMENT_FEATURES.MULTI_PARISH_TEAMS]: ['enterprise'],
  [TOURNAMENT_FEATURES.CUSTOM_ELIGIBILITY_RULES]: ['enterprise'],
  [TOURNAMENT_FEATURES.AUTOMATED_BRACKETS]: ['enterprise'],
  [TOURNAMENT_FEATURES.TEAM_MANAGEMENT_DASHBOARD]: ['enterprise'],
  [TOURNAMENT_FEATURES.ADVANCED_PRIZE_FEATURES]: ['enterprise'],
  [TOURNAMENT_FEATURES.AUTO_PRIZE_DISTRIBUTION]: ['enterprise'],
  [TOURNAMENT_FEATURES.PUBLIC_DONATIONS]: ['enterprise'],
  [TOURNAMENT_FEATURES.PARISH_ENTRY_FEES]: ['enterprise'],
  [TOURNAMENT_FEATURES.CUSTOM_PAYMENT_GATEWAYS]: ['enterprise'],
  [TOURNAMENT_FEATURES.PAYMENT_ANALYTICS]: ['enterprise'],
  
  // Knockout Tournament Features (Professional+)
  [TOURNAMENT_FEATURES.KNOCKOUT_TOURNAMENTS]: ['professional', 'enterprise'],
  [TOURNAMENT_FEATURES.BRACKET_VISUALIZATION]: ['professional', 'enterprise'],
  [TOURNAMENT_FEATURES.DOUBLE_ELIMINATION]: ['enterprise'],
  [TOURNAMENT_FEATURES.SWISS_SYSTEM]: ['enterprise'],
  
  // Advanced Round Configuration Features (Professional+)
  [TOURNAMENT_FEATURES.ROUND_CONFIG_TEMPLATES]: ['professional', 'enterprise'],
  [TOURNAMENT_FEATURES.QUESTION_POOL_VALIDATION]: ['professional', 'enterprise'],
  [TOURNAMENT_FEATURES.CLONE_ROUND_CONFIG]: ['professional', 'enterprise'],
  
  // Enterprise Round Features
  [TOURNAMENT_FEATURES.CUSTOM_CATEGORIES]: ['enterprise'],
  [TOURNAMENT_FEATURES.CATEGORY_WEIGHTING]: ['enterprise']
};

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

// NEW: Tenant-specific role customization (Phase 2)
export interface TenantRoleCustomization {
  id: string;
  tenantId: string;
  roleId: string; // Base role being customized
  displayName?: string; // Custom display name for this role in this tenant
  customPermissions: {
    add: string[];    // Additional permissions granted
    remove: string[]; // Base permissions revoked
  };
  customPages: {
    add: string[];    // Additional pages granted
    remove: string[]; // Base pages revoked
  };
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  notes?: string; // Why this customization was made
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
  // Customizable field labels for tenant-specific terminology
  customFieldLabels?: {
    parishSingular?: string; // e.g., "Parish", "Church", "Organization", "Team"
    parishPlural?: string; // e.g., "Parishes", "Churches", "Organizations", "Teams"
    parishMember?: string; // e.g., "Member", "Parishioner", "Team Member"
    parishLeader?: string; // e.g., "Parish Priest", "Pastor", "Team Leader"
  };
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
  
  // Qualification settings
  qualificationConfig?: {
    enabled: boolean;
    quizEnabled: boolean;
    quizSettings?: PreTournamentQuizConfig;
    practicePointsThreshold?: number;
    allowDirectInvitation: boolean;
  };
  
  // Participation Mode Configuration (Advanced Feature)
  participationConfig?: {
    mode: 'individual' | 'parish' | 'both'; // Individual only, Parish only, or Mixed
    maxParticipantsPerParish?: number; // Maximum members from one parish (e.g., 10)
    minParticipantsPerParish?: number; // Minimum members required (e.g., 3)
    allowParishCaptains?: boolean; // Enable parish captain roles (Enterprise feature)
    allowMultiParishTeams?: boolean; // Allow cross-parish teams (Enterprise feature)
  };
  
  // Parish Scoring Configuration (Advanced Feature)
  parishScoringConfig?: {
    enabled: boolean;
    scoringMethod: 'average' | 'total' | 'topN' | 'weighted'; // How to calculate parish score
    topNCount?: number; // If using topN, how many top scores to count
    displayMode: 'parish_only' | 'individual_only' | 'dual'; // Which leaderboards to show
  };
  
  // Eligibility Restrictions (Advanced Feature)
  eligibilityRestrictions?: {
    enabled: boolean;
    ageMin?: number; // Minimum age requirement
    ageMax?: number; // Maximum age requirement
    allowedGenders?: Array<'male' | 'female' | 'other' | 'prefer_not_to_say'>;
    allowedParishes?: string[]; // Restrict to specific parishes (IDs)
    requiredProfileCompletion?: number; // Percentage (0-100)
    customRules?: Array<{
      field: string;
      operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'between';
      value: any;
      message?: string; // Error message to show user
    }>;
  };
  
  // Tournament Format (Professional+ Feature)
  tournamentFormat?: TournamentFormat; // 'standard' or knockout variants
  knockoutConfig?: KnockoutTournamentConfig;
}

// Pre-tournament quiz configuration
export interface PreTournamentQuizConfig {
  enabled: boolean;
  questionsCount: number; // 10-50 questions per attempt
  passPercentage: number; // 50-90%
  timeLimitMinutes: number; // 15-60 minutes
  
  // Retake settings
  allowRetakes: boolean;
  maxRetakes: number; // Total attempts (1-5)
  retakeWaitTimeMinutes?: number; // Optional cooldown
  
  // Question pool requirement
  questionPoolSize: number; // Required: questionsCount × maxRetakes
  questionPoolRequirementMet: boolean;
  
  // Question settings
  categoryMatch: boolean;
  difficultyLevel: 'easy' | 'medium' | 'hard';
  preventQuestionReuse: boolean; // Default: true
  randomizeQuestionOrder: boolean; // Default: true
  randomizeAnswerOptions: boolean; // Default: true
  
  // Scoring method
  scoringMethod: 'average' | 'highest' | 'latest'; // Default: average
}

// Quiz attempt record
export interface QuizAttempt {
  id: string;
  userId: string;
  tournamentId: string;
  applicationId: string;
  attemptNumber: number; // 1, 2, 3, etc.
  questionsShown: string[]; // Question IDs used in this attempt
  answerShuffles: {
    questionId: string;
    originalOrder: number[];
    shuffledOrder: number[];
  }[];
  answers: Record<string, number>; // questionId -> selected option index
  score: number; // Percentage
  passed: boolean;
  timeTaken: number; // Seconds
  startedAt: string;
  completedAt: string;
  randomizationSeed: string; // For audit
}

// Tournament application
export interface TournamentApplication {
  id: string;
  userId: string;
  tournamentId: string;
  status: 'pending' | 'quiz_available' | 'quiz_in_progress' | 'qualified' | 'auto_qualified' | 'disqualified' | 'invited';
  qualificationPathway: 'quiz' | 'practice_points' | 'direct_invitation';
  
  // Participation type (NEW)
  participationType: 'individual' | 'parish'; // How user is participating
  parishId?: string; // If participating as parish member
  parishDisplayName?: string; // Cached for performance
  
  // Application tracking
  appliedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  
  // Quiz pathway
  quizAttempts?: QuizAttempt[];
  attemptsRemaining?: number;
  nextAttemptAvailableAt?: string; // For cooldown
  finalScore?: number; // Calculated based on scoring method
  scoringMethodUsed?: 'average' | 'highest' | 'latest';
  
  // Practice points pathway
  practicePointsUsed?: number;
  autoQualified?: boolean;
  
  // Direct invitation pathway
  invitedBy?: string;
  invitedAt?: string;
  invitationMessage?: string;
  
  // Disqualification
  disqualified?: boolean;
  disqualificationReason?: string;
  disqualifiedAt?: string;
  disqualifiedBy?: string;
  
  // Metadata
  lastStatusChange: string;
  notificationsSent: string[]; // Event types
}

// Parish Tournament Statistics (Advanced Feature)
export interface ParishTournamentStats {
  id: string;
  tournamentId: string;
  parishId: string;
  parishName: string;
  parishDisplayName?: string; // Custom display name
  
  // Member tracking
  registeredMembers: string[]; // User IDs who applied as parish members
  qualifiedMembers: string[]; // User IDs who qualified
  activeMembers: string[]; // User IDs who actually participated
  
  // Scoring
  memberScores: Record<string, number>; // userId -> individual score
  totalScore: number; // Sum of all member scores
  averageScore: number; // Total / active members
  topNScore?: number; // If using topN scoring
  weightedScore?: number; // If using weighted scoring
  finalScore: number; // Based on scoring method configured
  
  // Rankings
  parishRank?: number; // Overall rank among parishes
  individualRanks: Record<string, number>; // userId -> their individual rank
  
  // Metadata
  lastUpdated: string;
  completedAt?: string;
}

// Prize & Reward System Interfaces

// Physical prize details
export interface PhysicalPrize {
  name: string;
  description: string;
  imageUrl?: string;
  estimatedValue?: number;
}

// Digital reward details
export interface DigitalReward {
  type: 'certificate' | 'badge' | 'points' | 'scholarship' | 'course_access' | 'discount_code';
  value: string | number;
  description: string;
  validUntil?: string;
}

// Prize sponsor information
export interface PrizeSponsor {
  sponsorName: string;
  sponsorLogo?: string;
  sponsorMessage?: string;
  sponsorWebsite?: string;
}

// Individual position prize
export interface PositionPrize {
  position: number; // 1st, 2nd, 3rd, etc.
  positionRange?: { from: number; to: number }; // e.g., 4th-10th place
  label: string; // "Champion", "Runner-up", "Third Place", "Top 10"
  
  // Prize details
  prizeType: 'cash' | 'certificate' | 'trophy' | 'scholarship' | 'product' | 'points' | 'badge' | 'multiple';
  
  // Cash prize
  cashAmount?: number;
  currency?: string;
  
  // Physical prizes
  physicalPrize?: PhysicalPrize;
  
  // Digital rewards
  digitalRewards?: DigitalReward[];
  
  // Sponsorship
  sponsoredBy?: PrizeSponsor;
}

// Category-specific prize (e.g., youngest winner, fastest time)
export interface CategoryPrize {
  category: 'parish_winner' | 'youngest_winner' | 'oldest_winner' | 'fastest_time' | 'most_improved' | 'people_choice' | 'perfect_score' | 'custom';
  categoryName: string;
  categoryDescription?: string;
  prizes: PositionPrize[];
  eligibilityCriteria?: string;
}

// Participation reward for all participants
export interface ParticipationReward {
  enabled: boolean;
  type: 'certificate' | 'badge' | 'points' | 'multiple';
  description: string;
  digitalRewards?: DigitalReward[];
}

// Tournament prize configuration
export interface TournamentPrize {
  id: string;
  tournamentId: string;
  tenantId: string;
  
  // Prize structure
  prizeStructure: 'top_n' | 'top_percentage' | 'threshold_based' | 'all_qualified';
  
  // Position-based prizes (most common)
  positionPrizes?: PositionPrize[];
  
  // Percentage-based (e.g., top 10% get prizes)
  percentagePrizes?: Array<{
    topPercentage: number; // e.g., 10 for top 10%
    prizes: PositionPrize[];
  }>;
  
  // Score threshold (e.g., anyone scoring 90%+ wins)
  thresholdPrizes?: Array<{
    minimumScore: number; // e.g., 90
    prizes: PositionPrize[];
  }>;
  
  // Category-specific prizes
  categoryPrizes?: CategoryPrize[];
  
  // Participation rewards
  participationReward?: ParticipationReward;
  
  // Display settings
  displaySettings: {
    showPrizesPublicly: boolean; // Show to non-logged-in users
    showCashAmounts: boolean; // Hide actual cash amounts if false
    showSponsors: boolean;
    highlightTopPrizes: boolean;
    prizePoolTotal?: string; // e.g., "$25,000+" for display
  };
  
  // Prize distribution
  distributionMethod: 'manual' | 'automatic' | 'hybrid';
  distributionDeadline?: string;
  distributionNotes?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string; // User ID
}

// Prize award tracking
export interface PrizeAward {
  id: string;
  tournamentId: string;
  tenantId: string;
  prizeConfigId: string; // Reference to TournamentPrize
  
  // Winner info
  winnerId: string; // User ID or Parish ID
  winnerType: 'individual' | 'parish';
  winnerName: string;
  winnerEmail?: string;
  
  // Prize details
  position: number;
  positionLabel: string; // "Champion", "1st Runner-up", "4th-10th Place"
  prizeCategory?: string; // "Overall", "Parish Category", "Youngest Winner", etc.
  
  // Awarded prizes
  prizes: Array<{
    type: string;
    description: string;
    cashAmount?: number;
    currency?: string;
    physicalItem?: string;
    digitalReward?: DigitalReward;
  }>;
  
  // Sponsor information (if applicable)
  sponsor?: PrizeSponsor;
  
  // Distribution status
  status: 'pending' | 'notified' | 'claimed' | 'distributed' | 'declined';
  notifiedAt?: string;
  claimedAt?: string;
  distributedAt?: string;
  distributedBy?: string; // User ID of admin who distributed
  
  // Proof of distribution
  distributionProof?: {
    method: 'bank_transfer' | 'cash' | 'cheque' | 'digital' | 'pickup' | 'mail';
    referenceNumber?: string;
    receiptUrl?: string;
    notes?: string;
  };
  
  // Winner acknowledgment
  winnerAcknowledged: boolean;
  acknowledgmentDate?: string;
  testimonial?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

// Practice points tracking
export interface PracticePoints {
  userId: string;
  totalPoints: number;
  pointsHistory: {
    id: string;
    points: number;
    reason: string;
    timestamp: string;
  }[];
  lastUpdated: string;
}

// Payment & Monetization System Interfaces

// Payment gateway configuration
export interface PaymentGatewayConfig {
  id: string;
  tenantId: string;
  provider: 'stripe' | 'paystack' | 'paypal' | 'flutterwave' | 'manual';
  isEnabled: boolean;
  
  // API Credentials (in production, secretKey would be server-side only)
  credentials: {
    publicKey?: string;
    secretKey?: string;
    webhookSecret?: string;
  };
  
  // Configuration
  settings: {
    currency: string; // USD, NGN, GHS, etc.
    acceptedMethods: Array<'card' | 'bank_transfer' | 'mobile_money' | 'ussd'>;
    minimumAmount?: number;
    maximumAmount?: number;
    processingFeeMode: 'absorb' | 'pass_to_user'; // Who pays processing fees
    autoVerifyPayments: boolean;
  };
  
  // For manual payments
  manualPaymentInstructions?: {
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
    instructions?: string;
  };
  
  createdAt: string;
  updatedAt: string;
}

// Tournament fee configuration
export interface TournamentFeeConfig {
  enabled: boolean;
  feeType: 'individual' | 'parish' | 'both'; // Admin chooses
  
  // Pricing
  individualFee?: number;
  parishFee?: number;
  currency: string;
  
  // Payment deadline
  paymentDeadline?: string;
  allowLatePayment: boolean;
  latePaymentPenalty?: number; // Additional fee %
  
  // Parish-specific settings
  parishPaymentMode?: {
    allowAnyMember: boolean; // Any member can pay for parish
    requireCaptainOnly: boolean; // Only captain can pay
    splitPayment: boolean; // Allow multiple members to contribute
  };
  
  // Pre-test options for paid parishes
  preTestMode?: {
    type: 'representative' | 'all_highest_score' | 'all_individual';
    nominationRequired: boolean; // Parish must nominate rep
    nominationDeadline?: string;
  };
  
  // Refund policy
  refundPolicy?: {
    allowRefunds: boolean;
    refundDeadline?: string;
    refundPercentage: number; // 100 = full refund
  };
}

// Tournament payment tracking
export interface TournamentPayment {
  id: string;
  tournamentId: string;
  tenantId: string;
  
  // Payer info
  payerId: string; // User who made payment
  payerEmail: string;
  payerName: string;
  
  // Payment details
  paymentType: 'individual' | 'parish';
  beneficiaryId: string; // User ID or Parish ID
  beneficiaryName: string;
  
  amount: number;
  currency: string;
  processingFee: number;
  totalAmount: number;
  
  // Payment gateway
  provider: 'stripe' | 'paystack' | 'paypal' | 'flutterwave' | 'manual' | 'donation';
  transactionReference: string;
  gatewayResponse?: any;
  
  // Status tracking
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  paymentMethod?: string; // card, bank_transfer, etc.
  paidAt?: string;
  verifiedAt?: string;
  verifiedBy?: string; // User ID of admin who verified
  
  // For manual payments
  manualPaymentProof?: {
    receiptUrl?: string;
    referenceNumber?: string;
    notes?: string;
  };
  
  // Refunds
  refundedAt?: string;
  refundAmount?: number;
  refundReason?: string;
  
  createdAt: string;
  updatedAt: string;
}

// Tournament donation configuration
export interface TournamentDonationConfig {
  enabled: boolean;
  allowAnonymous: boolean; // Allow non-logged-in users
  allowRecurring: boolean; // Monthly donations
  
  // Suggested amounts
  suggestedAmounts: number[];
  minimumAmount?: number;
  maximumAmount?: number;
  
  // Campaign details
  goalAmount?: number;
  showProgress: boolean; // Show progress bar
  
  // Donor recognition
  showDonorList: boolean;
  donorTiers?: Array<{
    name: string; // Bronze, Silver, Gold
    minAmount: number;
    badge: string;
    benefits: string[];
  }>;
  
  // Thank you message
  thankYouMessage?: string;
  sendEmailReceipt: boolean;
}

// Tournament donation tracking
export interface TournamentDonation {
  id: string;
  tournamentId: string;
  tenantId: string;
  
  // Donor info
  donorId?: string; // null if anonymous
  donorEmail?: string;
  donorName: string;
  isAnonymous: boolean;
  
  // Donation details
  amount: number;
  currency: string;
  message?: string;
  
  // Payment
  provider: 'stripe' | 'paystack' | 'paypal' | 'flutterwave' | 'manual';
  transactionReference: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  
  // Recognition
  displayPublicly: boolean;
  donorTier?: string;
  
  createdAt: string;
}

// ============================================
// KNOCKOUT TOURNAMENT SYSTEM INTERFACES
// ============================================

// Tournament format types
export type TournamentFormat = 'standard' | 'single_elimination' | 'double_elimination' | 'swiss_system';

// Question category for tournaments
export type QuestionCategoryType = 
  | 'general_bible' 
  | 'ccc_hymns' 
  | 'specific_study' 
  | 'doctrine' 
  | 'tenets' 
  | 'custom';

// Custom category definition (Enterprise feature)
export interface CustomQuestionCategory {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  color: string; // Hex color for UI display
  icon?: string; // Icon name or emoji
  isActive: boolean;
  createdAt: string;
  createdBy: string;
}

// Category distribution for a round
export interface RoundCategoryDistribution {
  category: QuestionCategoryType;
  questionCount: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  customCategoryName?: string; // For 'custom' type
  customCategoryId?: string; // Reference to CustomQuestionCategory
  weight?: number; // Scoring multiplier (1.0 = normal, 1.5 = 50% bonus, 2.0 = double)
}

// Round-specific question configuration
export interface RoundQuestionConfig {
  roundNumber: number;
  roundName: string;
  
  // Total questions for this round
  totalQuestions: number;
  timeLimitMinutes: number;
  
  // Category distribution
  categoryDistribution: RoundCategoryDistribution[];
  
  // Question delivery mode
  questionDeliveryMode: 'mixed' | 'staged_by_category';
  // mixed: All questions shuffled together
  // staged_by_category: Present all Category A questions first, then Category B, then Category C
  
  // Staging order (only used when questionDeliveryMode = 'staged_by_category')
  categoryPresentationOrder?: QuestionCategoryType[];
  
  // Question uniqueness
  excludePreviousRoundQuestions: boolean;
  allowQuestionReuse: boolean; // Within same round for different matches
  
  // Randomization
  randomizeQuestionOrder: boolean;
  randomizeOptionOrder: boolean;
}

// Round configuration template (Professional+ feature)
export interface RoundConfigTemplate {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  templateType: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'custom';
  isPublic: boolean; // Can be shared across tenants
  
  // Template configuration
  numberOfRounds: number;
  roundConfigs: Omit<RoundQuestionConfig, 'roundNumber' | 'roundName'>[]; // Template without specific round numbers
  
  // Metadata
  usageCount: number;
  rating?: number;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
}

// ============================================
// AI QUESTION GENERATION SYSTEM
// ============================================

// AI Generation Configuration (Plan-based limits)
export interface AIGenerationConfig {
  tenantId: string;
  planId: string;
  
  // Monthly limits based on plan
  monthlyQuestionLimit: number;      // e.g., Pro: 100, Professional: 500, Enterprise: unlimited (-1)
  questionsUsedThisMonth: number;
  resetDate: string;                 // When monthly counter resets
  
  // Generation settings
  defaultModel: 'gpt-4' | 'gpt-3.5-turbo' | 'claude-3' | 'claude-3-opus';
  enabledModels: string[];
  
  // Quality settings
  requireManualApproval: boolean;    // Must approve before use
  autoApproveAfterReview: boolean;   // Auto-approve after editing
  duplicateDetectionEnabled: boolean;
  similarityThreshold: number;        // 0.85 = 85% similarity flags as duplicate
  
  // Metadata
  totalQuestionsGenerated: number;
  totalQuestionsApproved: number;
  totalQuestionsRejected: number;
  averageApprovalTime: number;       // Minutes
  createdAt: string;
  updatedAt: string;
}

// AI Generation Request
export interface AIGenerationRequest {
  id: string;
  tenantId: string;
  requestedBy: string;               // User ID
  
  // Generation parameters
  count: number;                     // Number of questions to generate
  category: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  bibleBooks?: string[];            // Specific books to focus on
  topics?: string[];                 // Specific topics (e.g., 'miracles', 'parables')
  verseRange?: {
    book: string;
    chapterStart: number;
    chapterEnd: number;
  };
  
  // AI settings
  model: string;
  temperature: number;               // 0.7 default, higher = more creative
  customPrompt?: string;             // Additional instructions
  
  // Exclusions (prevent duplicates)
  excludeQuestionIds?: string[];     // Don't generate similar to these
  excludeVerses?: string[];          // Don't use these verses
  
  // Status
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;                  // 0-100
  generatedQuestionIds: string[];
  errorMessage?: string;
  
  // Timing
  requestedAt: string;
  startedAt?: string;
  completedAt?: string;
  processingTime?: number;           // Seconds
}

// Tournament Question Configuration
export interface TournamentQuestionConfig {
  tournamentId: string;
  tenantId: string;
  
  // Question selection mode
  selectionMode: 'manual' | 'auto' | 'hybrid';
  
  // Auto-selection rules
  autoSelectRules?: {
    totalQuestions: number;
    fromPool: number;                // Questions from question_pool status
    fromRecent: number;              // Questions from recent_tournament status
    newQuestions: number;            // Brand new questions (never used)
    byCategory: {
      categoryId: string;
      categoryName: string;
      count: number;
      difficulty?: {
        easy?: number;
        medium?: number;
        hard?: number;
      };
    }[];
    
    // Exclusion rules
    excludeTournamentIds?: string[]; // Don't reuse from these tournaments
    minMonthsSinceLastUse?: number;  // Minimum time before reusing questions
  };
  
  // Selected questions
  selectedQuestionIds: string[];
  reservedAt?: string;               // When questions were locked for tournament
  
  // Release settings
  practiceReleaseMode: 'immediate' | 'delayed' | 'manual';
  delayHours?: number;               // Hours to wait after tournament ends
  releaseScheduledFor?: string;      // Exact date/time for release
  releasedAt?: string;               // Actual release time
  
  // Validation
  validationStatus: 'pending' | 'valid' | 'invalid';
  validationErrors?: string[];
  minimumQuestionsPerCategory: number; // Default: 10
  
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// Question Lifecycle Log (audit trail)
export interface QuestionLifecycleLog {
  id: string;
  questionId: string;
  tenantId: string;
  
  // Status change
  fromStatus: QuestionStatus;
  toStatus: QuestionStatus;
  reason: string;
  
  // Context
  tournamentId?: string;
  triggeredBy: 'user' | 'system' | 'auto_rotation';
  userId?: string;                   // If user-triggered
  
  // Additional data
  metadata?: {
    delayHours?: number;
    scheduledFor?: string;
    approvalStatus?: QuestionApprovalStatus;
    [key: string]: any;
  };
  
  createdAt: string;
}

// Question Duplicate Detection Result
export interface QuestionDuplicateCheck {
  questionId: string;
  isDuplicate: boolean;
  similarQuestions: {
    id: string;
    text: string;
    similarity: number;            // 0-1 (0.85 = 85% similar)
    status: QuestionStatus;
  }[];
  warnings: string[];
}

// ============================================================================
// BONUS QUESTIONS (Reward for practice engagement)
// ============================================================================

// User practice analytics for bonus eligibility
export interface UserPracticeAnalytics {
  userId: string;
  tenantId: string;
  
  // Practice stats
  totalPracticeSessions: number;
  totalQuestionsAnswered: number;
  totalCorrectAnswers: number;
  averageAccuracy: number;                    // 0-100%
  currentStreak: number;                      // Consecutive days
  longestStreak: number;
  
  // Performance by category
  categoryPerformance: {
    category: string;
    questionsAnswered: number;
    correctAnswers: number;
    accuracy: number;
    averageTimePerQuestion: number;           // seconds
    lastPracticed: string;
  }[];
  
  // Bonus eligibility
  bonusQuestionsUnlocked: boolean;
  bonusQuestionsUsedCount: number;
  bonusQuestionsLimit: number;
  lastBonusUnlock: string;
  
  // Achievements
  achievements: {
    id: string;
    name: string;
    description: string;
    unlockedAt: string;
    icon: string;
  }[];
  
  // Time tracking
  totalPracticeTime: number;                  // minutes
  lastPracticeDate: string;
  createdAt: string;
  updatedAt: string;
}

// Question performance tracking
export interface QuestionPerformance {
  questionId: string;
  tenantId: string;
  
  // Usage statistics
  timesUsed: number;
  timesPracticed: number;
  timesInTournament: number;
  
  // Performance metrics
  totalAttempts: number;
  correctAttempts: number;
  incorrectAttempts: number;
  successRate: number;                        // 0-100%
  averageTimeToAnswer: number;                // seconds
  
  // Difficulty assessment
  perceivedDifficulty: 'easier' | 'appropriate' | 'harder';
  difficultyScore: number;                    // 1-10
  
  // User feedback
  userRatings: {
    userId: string;
    rating: number;                           // 1-5 stars
    feedback?: string;
    reportedIssue?: string;
    ratedAt: string;
  }[];
  averageRating: number;
  
  // Quality indicators
  qualityScore: number;                       // 0-100
  flaggedForReview: boolean;
  flagReason?: string;
  
  lastUsed: string;
  createdAt: string;
  updatedAt: string;
}

// Bonus question configuration for tenant (ENHANCED)
export interface BonusQuestionConfig {
  tenantId: string;
  enabled: boolean;
  
  // Eligibility requirements (MULTI-TIER SYSTEM)
  unlockTiers: {
    tier: 1 | 2 | 3 | 4 | 5;
    name: string;
    requirePracticeCount: number;              // Min practice sessions
    requireAccuracy: number;                   // Min accuracy %
    requireStreak: number;                     // Min consecutive days
    questionsLimit: number;                    // Max bonus questions for this tier
    retwistQuality: 'basic' | 'standard' | 'advanced' | 'expert';
    features: string[];                        // Unlocked features
  }[];
  
  // Usage options
  allowDirectUse: boolean;
  allowRetwist: boolean;
  allowDifficultyAdjustment: boolean;        // Can change difficulty level
  allowCategoryChange: boolean;               // Can change category
  allowMultipleVariations: boolean;           // Generate multiple versions
  
  // Approval settings
  autoApproveDirectUse: boolean;
  requireApprovalAfterRetwist: boolean;
  requireQualityScore: number;                // Min quality score (0-100)
  
  // Limits
  maxQuestionsPerTournament: number;
  maxRetwistsPerQuestion: number;             // Prevent over-reuse
  cooldownPeriod: number;                     // Days before reusing question
  
  // Quality control
  eligibleStatuses: QuestionStatus[];
  minQuestionRating: number;                  // Min avg rating (1-5)
  minSuccessRate: number;                     // Min success rate %
  excludeRecentlyUsed: boolean;               // Exclude from last X days
  excludeRecentlyUsedDays: number;
  
  // Gamification
  enableAchievements: boolean;
  enableLeaderboard: boolean;
  pointsPerBonusQuestion: number;
  
  createdAt: string;
  updatedAt: string;
}

// Bonus question request (ENHANCED)
export interface BonusQuestionRequest {
  id: string;
  tenantId: string;
  tournamentId?: string;
  requestedBy: string;
  userTier: number;                           // User's unlock tier
  
  // Selection criteria
  sourceQuestionIds: string[];
  categoryDistribution: {
    category: string;
    count: number;
    targetDifficulty?: 'easy' | 'medium' | 'hard';
  }[];
  
  // Retwist settings (ENHANCED)
  useDirectly: boolean;
  retwistStrategy: 'synonym' | 'paraphrase' | 'perspective' | 'context' | 'creative' | 'hybrid';
  retwistQuality: 'basic' | 'standard' | 'advanced' | 'expert';
  generateVariations: number;                 // Number of variations per question
  retwistPrompt?: string;
  
  // Transformations
  preserveDifficulty: boolean;
  targetDifficulty?: 'easy' | 'medium' | 'hard';
  preserveCategory: boolean;
  targetCategory?: string;
  addBiblicalContext: boolean;
  expandExplanations: boolean;
  
  // Generated questions
  generatedQuestionIds: string[];
  originalQuestionMapping: {
    originalId: string;
    retwistedId: string;
    variationNumber: number;                  // 1, 2, 3... if multiple variations
    strategy: string;
    qualityScore: number;
  }[];
  
  // Status
  status: 'pending' | 'analyzing' | 'retwisting' | 'generating_variations' | 'awaiting_approval' | 'approved' | 'completed' | 'failed';
  progress: number;
  error?: string;
  
  // Analytics
  estimatedQualityScore: number;
  similarityToOriginals: number;              // How different from originals
  
  // Approval
  approvedBy?: string;
  approvedAt?: string;
  rejectedQuestions?: string[];               // IDs of rejected variations
  
  // Timestamps
  requestedAt: string;
  completedAt?: string;
}

// Bonus question template (ENHANCED)
export interface BonusQuestionTemplate {
  originalQuestionId: string;
  originalQuestion: Question;
  
  // Multiple variations with different strategies
  variations: {
    id: string;
    retwistedQuestion: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
    
    // Strategy details
    retwistMethod: 'synonym' | 'paraphrase' | 'perspective' | 'context' | 'ai_creative' | 'hybrid';
    transformations: string[];                // List of applied transformations
    
    // Quality metrics
    similarity: number;                       // How similar to original (0-1)
    readability: number;                      // Readability score (0-100)
    biblicalAccuracy: number;                 // Accuracy score (0-100)
    qualityScore: number;                     // Overall quality (0-100)
    
    // Metadata
    difficulty?: 'easy' | 'medium' | 'hard';
    category?: string;
    estimatedTimeToAnswer?: number;           // seconds
    
    createdAt: string;
  }[];
  
  // Selection
  selectedVariationId?: string;
  selectionReason?: string;
  
  // Performance prediction
  predictedSuccessRate: number;
  predictedDifficulty: 'easy' | 'medium' | 'hard';
  
  createdAt: string;
  updatedAt?: string;
}

// Question pool validation result
export interface QuestionPoolValidation {
  isValid: boolean;
  totalQuestionsNeeded: number;
  totalQuestionsAvailable: number;
  categoryBreakdown: Array<{
    category: QuestionCategoryType;
    customCategoryId?: string;
    needed: number;
    available: number;
    sufficient: boolean;
    difficulty?: {
      easy: { needed: number; available: number };
      medium: { needed: number; available: number };
      hard: { needed: number; available: number };
    };
  }>;
  warnings: string[];
  errors: string[];
}

// Knockout tournament configuration
export interface KnockoutTournamentConfig {
  format: TournamentFormat;
  enabled: boolean;
  
  // Seeding configuration
  seedingMethod: 'random' | 'qualification_score' | 'practice_points' | 'manual' | 'registration_order';
  allowReseedingBetweenRounds?: boolean;
  
  // Match configuration
  matchType: 'head_to_head' | 'simultaneous_quiz';
  questionsPerMatch: number;
  matchTimeLimitMinutes: number;
  
  // Round-specific question configuration (NEW)
  roundQuestionConfigs?: RoundQuestionConfig[];
  
  // Advancement rules
  advancementRule: 'winner_only' | 'points_based' | 'best_of_series';
  bestOfSeries?: number; // For best_of_3, best_of_5, etc.
  tiebreaker: 'sudden_death' | 'time_taken' | 'coin_toss' | 'extra_questions';
  
  // Double elimination specific
  doubleEliminationConfig?: {
    winnersStartInUpperBracket: boolean;
    grandFinalFormat: 'single_match' | 'bracket_reset'; // Winner from lower must win twice
  };
  
  // Swiss system specific
  swissConfig?: {
    numberOfRounds: number;
    pairingAlgorithm: 'dutch' | 'accelerated' | 'modified_median';
    allowRepeatPairings: boolean;
    pointsForWin: number;
    pointsForDraw: number;
    pointsForLoss: number;
  };
  
  // Scheduling
  autoScheduleMatches: boolean;
  timeBetweenMatches?: number; // Minutes
  allowParallelMatches: boolean;
  maxParallelMatches?: number;
  
  // Third place playoff
  thirdPlacePlayoff: boolean;
  
  // Notifications
  notifyBeforeMatch: boolean;
  notificationMinutes?: number;
}

// Match in a knockout tournament
export interface KnockoutMatch {
  id: string;
  tournamentId: string;
  bracketId: string;
  
  // Match identification
  roundNumber: number;
  roundName: string; // 'Round 1', 'Quarter Finals', 'Semi Finals', 'Finals', etc.
  matchNumber: number; // Position within the round
  bracket: 'main' | 'upper' | 'lower' | 'third_place'; // For double elimination
  
  // Participants
  participant1Id?: string; // null if TBD (waiting for previous match)
  participant2Id?: string; // null if TBD or BYE
  participant1Type: 'individual' | 'parish';
  participant2Type: 'individual' | 'parish';
  participant1Seed?: number;
  participant2Seed?: number;
  
  // Match source (for bracket tracking)
  participant1Source?: {
    type: 'seed' | 'winner' | 'loser';
    matchId?: string;
  };
  participant2Source?: {
    type: 'seed' | 'winner' | 'loser';
    matchId?: string;
  };
  
  // Match status
  status: 'scheduled' | 'ready' | 'in_progress' | 'completed' | 'walkover' | 'cancelled';
  scheduledStartTime?: string;
  actualStartTime?: string;
  completedAt?: string;
  
  // Match results
  winnerId?: string;
  participant1Score?: number;
  participant2Score?: number;
  participant1CorrectAnswers?: number;
  participant2CorrectAnswers?: number;
  participant1TimeTaken?: number; // Seconds
  participant2TimeTaken?: number;
  
  // Series tracking (for best-of matches)
  seriesNumber?: number; // 1, 2, 3 for best of 3
  seriesWins?: {
    participant1: number;
    participant2: number;
  };
  
  // Match details
  questionIds: string[];
  questionCategories?: Record<string, QuestionCategoryType>; // questionId -> category
  questionDeliveryMode?: 'mixed' | 'staged_by_category';
  categoryStages?: Array<{
    category: QuestionCategoryType;
    questionIds: string[];
    startIndex: number;
    endIndex: number;
  }>; // For staged delivery tracking
  participant1Answers?: Record<string, number>;
  participant2Answers?: Record<string, number>;
  
  // Progression
  nextMatchId?: string; // Where winner advances
  nextMatchPosition?: 'participant1' | 'participant2';
  loserNextMatchId?: string; // For double elimination
  loserNextMatchPosition?: 'participant1' | 'participant2';
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

// Tournament bracket structure
export interface TournamentBracket {
  id: string;
  tournamentId: string;
  format: TournamentFormat;
  
  // Participants
  totalParticipants: number;
  participantIds: string[];
  participantTypes: Record<string, 'individual' | 'parish'>;
  
  // Seeding
  seeds: Record<string, number>; // participantId -> seed number
  seedingMethod: string;
  seedingCompletedAt?: string;
  
  // Bracket structure
  totalRounds: number;
  matchesPerRound: number[];
  
  // Matches organized by round
  rounds: {
    roundNumber: number;
    roundName: string;
    matches: string[]; // Match IDs
  }[];
  
  // Current state
  currentRound: number;
  completedRounds: number[];
  activeMatches: string[];
  completedMatches: string[];
  
  // Double elimination specific
  upperBracket?: {
    rounds: string[][]; // Match IDs per round
  };
  lowerBracket?: {
    rounds: string[][]; // Match IDs per round
  };
  grandFinals?: {
    matchId: string;
    bracketResetMatchId?: string;
  };
  
  // Swiss system specific
  swissStandings?: {
    participantId: string;
    wins: number;
    draws: number;
    losses: number;
    points: number;
    buchholzScore?: number; // Tiebreaker
    matchesPlayed: string[];
  }[];
  
  // Winners tracking
  winnerId?: string;
  runnerUpId?: string;
  thirdPlaceId?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

// Participant's bracket journey
export interface ParticipantBracketJourney {
  participantId: string;
  tournamentId: string;
  bracketId: string;
  participantType: 'individual' | 'parish';
  
  // Seeding
  seed: number;
  
  // Matches played
  matchesPlayed: {
    matchId: string;
    roundNumber: number;
    roundName: string;
    opponentId: string;
    won: boolean;
    score: number;
    opponentScore: number;
    bracket?: 'upper' | 'lower' | 'main';
  }[];
  
  // Current status
  isEliminated: boolean;
  eliminatedInRound?: number;
  currentBracket?: 'upper' | 'lower' | 'main'; // For double elimination
  
  // Performance stats
  totalWins: number;
  totalLosses: number;
  totalScore: number;
  averageScore: number;
  
  // Final placement
  finalPlacement?: number; // 1st, 2nd, 3rd, etc.
  
  createdAt: string;
  updatedAt: string;
}


export interface LiveTournamentView {
  tournamentId: string;
  status: 'upcoming' | 'in_progress' | 'completed';
  participants: {
    userId: string;
    displayName: string;
    currentScore: number;
    correctAnswers: number;
    averageTime: number;
    status: 'active' | 'finished' | 'disconnected';
    rank: number;
  }[];
  metrics: {
    totalParticipants: number;
    activeParticipants: number;
    finishedParticipants: number;
    droppedParticipants: number;
    averageScore: number;
    averageTimePerQuestion: number;
  };
  questionProgress: {
    currentQuestion: number;
    totalQuestions: number;
    answeredBy: number;
    averageTime: number;
  };
  lastUpdated: string;
}

// Question interface
// Question Status Lifecycle
export enum QuestionStatus {
  DRAFT = 'draft',                          // Being created/edited
  AI_PENDING_REVIEW = 'ai_pending_review',  // AI-generated, awaiting approval
  QUESTION_POOL = 'question_pool',          // Available for practice (approved)
  TOURNAMENT_RESERVED = 'tournament_reserved', // Locked for upcoming tournament
  TOURNAMENT_ACTIVE = 'tournament_active',  // Currently in use in tournament
  RECENT_TOURNAMENT = 'recent_tournament',  // Last tournament (available for practice)
  ARCHIVED = 'archived'                     // Retired questions
}

// Question Approval Status
export enum QuestionApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  NEEDS_REVISION = 'needs_revision'
}

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
  
  // New lifecycle fields
  status: QuestionStatus;
  approvalStatus?: QuestionApprovalStatus;
  tournamentId?: string;              // Which tournament is using/used this
  tournamentDate?: string;            // When it was used in tournament
  usageCount: number;                 // How many times used in tournaments
  lastUsedDate?: string;              // Last tournament usage date
  availableForPracticeDate?: string;  // When it becomes available (for delayed release)
  
  // AI generation tracking
  aiGeneratedAt?: string;
  aiModel?: string;                   // e.g., 'gpt-4', 'claude-3'
  aiPrompt?: string;                  // Original prompt used
  
  // Approval workflow
  createdBy: string;                  // User ID who created
  reviewedBy?: string;                // User ID who reviewed
  approvedBy?: string;                // User ID who approved
  reviewedAt?: string;
  approvedAt?: string;
  rejectionReason?: string;
  revisionNotes?: string;
  
  // Metadata
  createdAt: string;
  updatedAt?: string;
  tags?: string[];                    // Additional categorization
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
    id: 'plan-professional',
    name: 'professional',
    displayName: 'Professional Plan',
    description: 'Advanced features for organizations running competitive tournaments with team/parish participation',
    monthlyPrice: 59,
    yearlyDiscountPercent: 10, // 10% discount for yearly billing
    billingOptions: ['monthly', 'yearly'],
    maxUsers: 100,
    maxTournaments: 20,
    maxQuestionsPerTournament: 500,
    maxQuestionCategories: 10,
    features: [
      'Up to 100 users',
      '20 tournaments per year',
      '500 questions per tournament',
      'Advanced analytics & reporting',
      'Full custom branding',
      'Priority support',
      'Parish/Group tournament mode',
      'Mixed participation (Individual + Parish)',
      'Parish scoring & leaderboards',
      'Eligibility restrictions (Age, Location)',
      'Advanced scoring methods',
      'Max participants per parish control',
      'Dual leaderboards',
      'Live match streaming',
      'API access'
    ],
    isDefault: true,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'plan-enterprise',
    name: 'enterprise',
    displayName: 'Enterprise Plan',
    description: 'For large organizations with extensive tournament programs - unlimited features + parish captains',
    monthlyPrice: 99,
    yearlyDiscountPercent: 15, // 15% discount for yearly billing
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
      'All Professional features',
      'Parish captain roles',
      'Multi-parish team alliances',
      'Custom eligibility rule builder',
      'Automated tournament brackets',
      'Team management dashboard',
      'White-label options',
      'Priority feature requests',
      'Custom integrations',
      'On-premise deployment option'
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
      // Role Management
      'roles.manage',
      // Tournament Management - Limited to plan constraints
      'tournaments.create', 'tournaments.read', 'tournaments.update', 'tournaments.delete',
      'tournaments.participate', 'tournaments.inspect',
      // Question Management - Limited to plan constraints
      'questions.create', 'questions.read', 'questions.update', 'questions.delete', 'questions.review', 'questions.answer',
      'questions.manage-categories',
      // Payment & Billing - Read access only
      'payments.read', 'billing.read',
      // Analytics - Basic view access
      'analytics.view',
      // Branding and Customization - If plan allows
      'branding.manage',
      // Monitoring and Inspection
      'participants.monitor',
      // Profile Management
      'profile.manage',
      // System configuration (limited)
      'system.configure'
    ],
    canAccessPages: [
      'dashboard', 'user-management', 'role-management', 'role-customization', 'role-component-management', 
      'access-control', 'tournaments', 'question-bank', 'question-categories', 
      'custom-categories', 'round-templates', 'ai-generator', 'analytics', 
      'payments', 'billing', 'payment-integration', 'branding', 'theme-settings',
      'notifications', 'audit-logs', 'help', 'profile'
    ],
    isSystemRole: true
  },
  {
    roleId: 'question_manager',
    roleName: 'Question Manager',
    description: 'Manage questions and quiz content',
    permissions: [
      'questions.create', 'questions.read', 'questions.update', 'questions.delete',
      'questions.manage-categories',
      'tournaments.read' // can view tournaments to understand context
    ],
    canAccessPages: ['dashboard', 'question-bank', 'question-categories', 'custom-categories', 'round-templates', 'ai-generator', 'tournaments', 'help'],
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

// Check if tenant has access to specific tournament feature
export function hasTournamentFeatureAccess(tenantId: string, feature: string): boolean {
  const plan = getTenantPlan(tenantId);
  if (!plan) return false;
  
  // Check if feature is in the requirements map
  const requiredPlans = FEATURE_PLAN_REQUIREMENTS[feature];
  if (!requiredPlans) return false; // Unknown feature
  
  // Check if current plan is in the allowed plans list
  return requiredPlans.includes(plan.name);
}

// Get required plan for a feature (for upgrade prompts)
export function getRequiredPlanForFeature(feature: string): string | null {
  const requiredPlans = FEATURE_PLAN_REQUIREMENTS[feature];
  if (!requiredPlans || requiredPlans.length === 0) return null;
  
  // Return the lowest tier plan that has this feature
  const planOrder = ['starter', 'pro', 'professional', 'enterprise'];
  for (const planName of planOrder) {
    if (requiredPlans.includes(planName)) {
      const plan = defaultPlans.find(p => p.name === planName);
      return plan?.displayName || null;
    }
  }
  
  return null;
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
  
  // Get base role permissions
  const rolePermission = defaultRolePermissions.find(rp => rp.roleId.toLowerCase() === normalizedRole);
  if (!rolePermission) return false;
  
  // Check wildcard permission
  if (rolePermission.permissions.includes('*')) return true;
  
  // NEW: Phase 2 - Check tenant-specific customizations
  const customization = getTenantRoleCustomization(user.tenantId, user.role);
  
  // If customization exists, apply it
  if (customization && customization.isActive) {
    // Check if permission is explicitly removed
    if (customization.customPermissions.remove.includes(permission)) {
      return false; // Explicitly denied
    }
    
    // Check if permission is explicitly added
    if (customization.customPermissions.add.includes(permission)) {
      return true; // Explicitly granted
    }
  }
  
  // Check base permission
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
  
  // NEW: Phase 2 - Check tenant-specific page customizations
  const customization = getTenantRoleCustomization(user.tenantId, user.role);
  
  if (customization && customization.isActive) {
    // Check if page is explicitly removed
    if (customization.customPages.remove.includes(page)) {
      return false; // Explicitly denied
    }
    
    // Check if page is explicitly added
    if (customization.customPages.add.includes(page)) {
      return true; // Explicitly granted
    }
  }
  
  // Check base page access
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
  return getAssignableRoles(creatorUser).includes(targetRole);
}

// ========================================
// PHASE 2: Tenant Role Customization Functions
// ========================================

// Get tenant role customization
export function getTenantRoleCustomization(tenantId: string | undefined, roleId: string): TenantRoleCustomization | undefined {
  if (!tenantId) return undefined;
  
  const customizations = storage.get(STORAGE_KEYS.TENANT_ROLE_CUSTOMIZATIONS) || [];
  return customizations.find((c: TenantRoleCustomization) => 
    c.tenantId === tenantId && 
    c.roleId.toLowerCase() === roleId.toLowerCase() && 
    c.isActive
  );
}

// Get all customizations for a tenant
export function getTenantRoleCustomizations(tenantId: string): TenantRoleCustomization[] {
  const customizations = storage.get(STORAGE_KEYS.TENANT_ROLE_CUSTOMIZATIONS) || [];
  return customizations.filter((c: TenantRoleCustomization) => c.tenantId === tenantId);
}

// Create or update tenant role customization
export function saveTenantRoleCustomization(customization: Omit<TenantRoleCustomization, 'id' | 'createdAt' | 'updatedAt'>): TenantRoleCustomization {
  const customizations = storage.get(STORAGE_KEYS.TENANT_ROLE_CUSTOMIZATIONS) || [];
  
  // Check if customization already exists
  const existingIndex = customizations.findIndex((c: TenantRoleCustomization) => 
    c.tenantId === customization.tenantId && c.roleId === customization.roleId
  );
  
  const now = new Date().toISOString();
  
  if (existingIndex >= 0) {
    // Update existing
    customizations[existingIndex] = {
      ...customizations[existingIndex],
      ...customization,
      updatedAt: now
    };
    storage.set(STORAGE_KEYS.TENANT_ROLE_CUSTOMIZATIONS, customizations);
    return customizations[existingIndex];
  } else {
    // Create new
    const newCustomization: TenantRoleCustomization = {
      ...customization,
      id: `trc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: now,
      updatedAt: now
    };
    customizations.push(newCustomization);
    storage.set(STORAGE_KEYS.TENANT_ROLE_CUSTOMIZATIONS, customizations);
    return newCustomization;
  }
}

// Delete tenant role customization
export function deleteTenantRoleCustomization(tenantId: string, roleId: string): boolean {
  const customizations = storage.get(STORAGE_KEYS.TENANT_ROLE_CUSTOMIZATIONS) || [];
  const filteredCustomizations = customizations.filter((c: TenantRoleCustomization) => 
    !(c.tenantId === tenantId && c.roleId === roleId)
  );
  
  if (filteredCustomizations.length < customizations.length) {
    storage.set(STORAGE_KEYS.TENANT_ROLE_CUSTOMIZATIONS, filteredCustomizations);
    return true;
  }
  return false;
}

// Get effective permissions for a user (base + customizations)
export function getEffectivePermissions(user: User): string[] {
  if (!user) return [];
  
  const normalizedRole = user.role?.toLowerCase();
  
  // Super admin has all permissions
  if (normalizedRole === 'super_admin') return ['*'];
  
  // Get base role permissions
  const rolePermission = defaultRolePermissions.find(rp => rp.roleId.toLowerCase() === normalizedRole);
  if (!rolePermission) return [];
  
  let permissions = [...rolePermission.permissions];
  
  // Apply tenant customizations
  const customization = getTenantRoleCustomization(user.tenantId, user.role);
  if (customization && customization.isActive) {
    // Remove denied permissions
    permissions = permissions.filter(p => !customization.customPermissions.remove.includes(p));
    
    // Add granted permissions
    permissions = [...new Set([...permissions, ...customization.customPermissions.add])];
  }
  
  return permissions;
}

// Get effective pages for a user (base + customizations)
export function getEffectivePages(user: User): string[] {
  if (!user) return [];
  
  const normalizedRole = user.role?.toLowerCase();
  
  // Super admin can access all pages
  if (normalizedRole === 'super_admin') return ['*'];
  
  // Get base role pages
  const rolePermission = defaultRolePermissions.find(rp => rp.roleId.toLowerCase() === normalizedRole);
  if (!rolePermission) return [];
  
  let pages = [...rolePermission.canAccessPages];
  
  // Apply tenant customizations
  const customization = getTenantRoleCustomization(user.tenantId, user.role);
  if (customization && customization.isActive) {
    // Remove denied pages
    pages = pages.filter(p => !customization.customPages.remove.includes(p));
    
    // Add granted pages
    pages = [...new Set([...pages, ...customization.customPages.add])];
  }
  
  return pages;
}

// Get all available permissions (for UI selection)
export function getAllAvailablePermissions(): string[] {
  const allPermissions = new Set<string>();
  
  defaultRolePermissions.forEach(role => {
    role.permissions.forEach(perm => {
      if (perm !== '*') {
        allPermissions.add(perm);
      }
    });
  });
  
  return Array.from(allPermissions).sort();
}

// Get all available pages (for UI selection)
export function getAllAvailablePages(): string[] {
  const allPages = new Set<string>();
  
  defaultRolePermissions.forEach(role => {
    role.canAccessPages.forEach(page => {
      if (page !== '*') {
        allPages.add(page);
      }
    });
  });
  
  return Array.from(allPages).sort();
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
    // Initialize with component-based features structure for ComponentAccessControl
    const roleComponentFeatures = [
      {
        roleId: 'super_admin',
        roleName: 'super_admin',
        componentFeatures: ['*'] // All features
      },
      {
        roleId: 'org_admin',
        roleName: 'org_admin',
        componentFeatures: [
          // Question Bank features
          'view-questions', 'create-questions', 'edit-questions', 'delete-questions',
          'manage-categories', 'bulk-import', 'export-questions',
          // Analytics features
          'view-basic-analytics', 'view-advanced-analytics', 'export-reports',
          // User Management features
          'view-users', 'create-users', 'edit-users', 'delete-users', 'assign-roles',
          // Tournament Builder features
          'view-tournaments', 'create-tournaments', 'edit-tournaments', 'delete-tournaments', 'advanced-settings',
          // Branding features (plan-dependent)
          'view-branding', 'edit-branding', 'upload-assets',
          // System Settings features
          'view-settings', 'edit-settings', 'manage-integrations'
        ]
      },
      {
        roleId: 'question_manager',
        roleName: 'question_manager',
        componentFeatures: [
          'view-questions', 'create-questions', 'edit-questions', 'delete-questions',
          'manage-categories', 'bulk-import', 'export-questions',
          'view-tournaments'
        ]
      },
      {
        roleId: 'account_officer',
        roleName: 'account_officer',
        componentFeatures: [
          'view-basic-analytics'
        ]
      },
      {
        roleId: 'participant',
        roleName: 'participant',
        componentFeatures: []
      },
      {
        roleId: 'guest',
        roleName: 'guest',
        componentFeatures: []
      },
      {
        roleId: 'moderator',
        roleName: 'moderator',
        componentFeatures: [
          'view-tournaments', 'view-users'
        ]
      }
    ];
    storage.set(STORAGE_KEYS.ROLE_PERMISSIONS, roleComponentFeatures);
  }
  
  // Initialize audit logs
  if (!storage.get(STORAGE_KEYS.AUDIT_LOGS)) {
    storage.set(STORAGE_KEYS.AUDIT_LOGS, []);
  }
  
  // Initialize tenant roles
  if (!storage.get(STORAGE_KEYS.TENANT_ROLES)) {
    storage.set(STORAGE_KEYS.TENANT_ROLES, mockTenantRoles);
  }
  
  // Initialize tournament applications
  if (!storage.get(STORAGE_KEYS.TOURNAMENT_APPLICATIONS)) {
    storage.set(STORAGE_KEYS.TOURNAMENT_APPLICATIONS, []);
  }
  
  // Initialize quiz attempts
  if (!storage.get(STORAGE_KEYS.QUIZ_ATTEMPTS)) {
    storage.set(STORAGE_KEYS.QUIZ_ATTEMPTS, []);
  }
  
  // Initialize practice points
  if (!storage.get(STORAGE_KEYS.PRACTICE_POINTS)) {
    storage.set(STORAGE_KEYS.PRACTICE_POINTS, []);
  }
  
  // Initialize parishes
  if (!storage.get(STORAGE_KEYS.PARISHES)) {
    storage.set(STORAGE_KEYS.PARISHES, []);
  }
  
  // Initialize user profiles
  if (!storage.get(STORAGE_KEYS.USER_PROFILES)) {
    storage.set(STORAGE_KEYS.USER_PROFILES, []);
  }
};

// Practice Access Application Functions
export function applyForPracticeAccess(userId: string): boolean {
  const users = storage.get(STORAGE_KEYS.USERS) || mockUsers;
  const user = users.find((u: User) => u.id === userId);
  
  if (!user) return false;
  if (user.practiceAccessStatus === 'pending' || user.practiceAccessStatus === 'approved') {
    return false; // Already applied or approved
  }
  
  user.practiceAccessStatus = 'pending';
  user.practiceAccessAppliedAt = new Date().toISOString();
  
  storage.set(STORAGE_KEYS.USERS, users);
  storage.set(STORAGE_KEYS.CURRENT_USER, user);
  
  logAuditEvent({
    userId: user.id,
    action: 'apply_practice_access',
    entityType: 'user',
    entityId: user.id,
    details: { status: 'pending' }
  });
  
  return true;
}

export function approvePracticeAccess(userId: string, approverId: string): boolean {
  const users = storage.get(STORAGE_KEYS.USERS) || mockUsers;
  const user = users.find((u: User) => u.id === userId);
  
  if (!user || user.practiceAccessStatus !== 'pending') return false;
  
  user.practiceAccessStatus = 'approved';
  user.practiceAccessApprovedAt = new Date().toISOString();
  user.practiceAccessApprovedBy = approverId;
  user.qualificationStatus = 'in_training'; // User can now train
  
  storage.set(STORAGE_KEYS.USERS, users);
  
  const currentUser = storage.get(STORAGE_KEYS.CURRENT_USER);
  if (currentUser?.id === userId) {
    storage.set(STORAGE_KEYS.CURRENT_USER, user);
  }
  
  logAuditEvent({
    userId: approverId,
    action: 'approve_practice_access',
    entityType: 'user',
    entityId: userId,
    details: { status: 'approved' }
  });
  
  return true;
}

export function rejectPracticeAccess(userId: string, approverId: string, reason?: string): boolean {
  const users = storage.get(STORAGE_KEYS.USERS) || mockUsers;
  const user = users.find((u: User) => u.id === userId);
  
  if (!user || user.practiceAccessStatus !== 'pending') return false;
  
  user.practiceAccessStatus = 'rejected';
  
  storage.set(STORAGE_KEYS.USERS, users);
  
  logAuditEvent({
    userId: approverId,
    action: 'reject_practice_access',
    entityType: 'user',
    entityId: userId,
    details: { status: 'rejected', reason }
  });
  
  return true;
}

export function qualifyUserForTournaments(userId: string, approverId: string): boolean {
  const users = storage.get(STORAGE_KEYS.USERS) || mockUsers;
  const user = users.find((u: User) => u.id === userId);
  
  if (!user) return false;
  if (user.qualificationStatus !== 'in_training') {
    return false; // Must be in training first
  }
  
  user.qualificationStatus = 'qualified';
  
  storage.set(STORAGE_KEYS.USERS, users);
  
  const currentUser = storage.get(STORAGE_KEYS.CURRENT_USER);
  if (currentUser?.id === userId) {
    storage.set(STORAGE_KEYS.CURRENT_USER, user);
  }
  
  logAuditEvent({
    userId: approverId,
    action: 'qualify_user',
    entityType: 'user',
    entityId: userId,
    details: { status: 'qualified' }
  });
  
  return true;
}

export function approveAsParticipant(userId: string, approverId: string): boolean {
  const users = storage.get(STORAGE_KEYS.USERS) || mockUsers;
  const user = users.find((u: User) => u.id === userId);
  
  if (!user) return false;
  if (user.qualificationStatus !== 'qualified') {
    return false; // Must be qualified first
  }
  
  user.role = 'participant'; // Upgrade role to participant
  user.qualificationStatus = 'approved_participant';
  user.qualificationApprovedAt = new Date().toISOString();
  user.qualificationApprovedBy = approverId;
  
  storage.set(STORAGE_KEYS.USERS, users);
  
  const currentUser = storage.get(STORAGE_KEYS.CURRENT_USER);
  if (currentUser?.id === userId) {
    storage.set(STORAGE_KEYS.CURRENT_USER, user);
  }
  
  logAuditEvent({
    userId: approverId,
    action: 'approve_participant',
    entityType: 'user',
    entityId: userId,
    details: { oldRole: 'inspector', newRole: 'participant' }
  });
  
  return true;
}

export function canAccessPracticeMode(user: User): boolean {
  return user.practiceAccessStatus === 'approved';
}

export function canParticipateInTournaments(user: User): boolean {
  const normalizedRole = user.role?.toLowerCase();
  return normalizedRole === 'participant' || 
         normalizedRole === 'org_admin' || 
         normalizedRole === 'super_admin';
}

// ==================== TOURNAMENT APPLICATION FUNCTIONS ====================

// Get all tournament applications
export function getAllTournamentApplications(): TournamentApplication[] {
  return storage.get(STORAGE_KEYS.TOURNAMENT_APPLICATIONS) || [];
}

// Get applications for a specific user
export function getUserTournamentApplications(userId: string): TournamentApplication[] {
  const applications = getAllTournamentApplications();
  return applications.filter(app => app.userId === userId);
}

// Get applications for a specific tournament
export function getTournamentApplications(tournamentId: string): TournamentApplication[] {
  const applications = getAllTournamentApplications();
  return applications.filter(app => app.tournamentId === tournamentId);
}

// Get a specific application
export function getApplicationById(applicationId: string): TournamentApplication | null {
  const applications = getAllTournamentApplications();
  return applications.find(app => app.id === applicationId) || null;
}

// Check if user can apply to tournament
export function canApplyToTournament(user: User, tournamentId: string): { allowed: boolean; reason?: string } {
  // Check if user exists
  if (!user) {
    return { allowed: false, reason: 'User not authenticated' };
  }

  // Check if tournament exists
  const tournaments = storage.get(STORAGE_KEYS.TOURNAMENTS) || mockTournaments;
  const tournament = tournaments.find((t: Tournament) => t.id === tournamentId);
  if (!tournament) {
    return { allowed: false, reason: 'Tournament not found' };
  }

  // Check tournament status
  if (tournament.status === 'completed' || tournament.status === 'cancelled') {
    return { allowed: false, reason: 'Tournament is no longer accepting applications' };
  }

  if (tournament.status === 'active') {
    return { allowed: false, reason: 'Tournament has already started' };
  }

  // Check if max participants reached
  if (tournament.currentParticipants >= tournament.maxParticipants) {
    return { allowed: false, reason: 'Tournament is full' };
  }

  // Check if user already applied
  const existingApplications = getUserTournamentApplications(user.id);
  const existingApp = existingApplications.find(app => app.tournamentId === tournamentId);
  
  if (existingApp) {
    if (existingApp.status === 'qualified' || existingApp.status === 'auto_qualified') {
      return { allowed: false, reason: 'You are already qualified for this tournament' };
    }
    if (existingApp.status === 'disqualified') {
      return { allowed: false, reason: 'You have been disqualified from this tournament' };
    }
    if (existingApp.status === 'pending' || existingApp.status === 'quiz_available' || existingApp.status === 'quiz_in_progress') {
      return { allowed: false, reason: 'You already have an active application for this tournament' };
    }
  }

  return { allowed: true };
}

// Apply to tournament
export function applyToTournament(
  userId: string, 
  tournamentId: string,
  participationType: 'individual' | 'parish' = 'individual',
  parishId?: string
): { success: boolean; message?: string; applicationId?: string } {
  const users = storage.get(STORAGE_KEYS.USERS) || mockUsers;
  const user = users.find((u: User) => u.id === userId);
  
  if (!user) {
    return { success: false, message: 'User not found' };
  }

  const canApply = canApplyToTournament(user, tournamentId);
  if (!canApply.allowed) {
    return { success: false, message: canApply.reason };
  }

  const tournaments = storage.get(STORAGE_KEYS.TOURNAMENTS) || mockTournaments;
  const tournament = tournaments.find((t: Tournament) => t.id === tournamentId);
  
  if (!tournament?.qualificationConfig?.enabled) {
    return { success: false, message: 'Tournament qualification is not configured' };
  }

  // Check eligibility restrictions
  const eligibilityCheck = checkTournamentEligibility(userId, tournamentId);
  if (!eligibilityCheck.eligible) {
    return { 
      success: false, 
      message: `Eligibility requirements not met:\n${eligibilityCheck.reasons.join('\n')}` 
    };
  }

  // Validate participation type against tournament config
  const participationMode = tournament.participationConfig?.mode || 'individual';
  if (participationMode === 'individual' && participationType === 'parish') {
    return { success: false, message: 'This tournament only allows individual participation' };
  }
  if (participationMode === 'parish' && participationType === 'individual') {
    return { success: false, message: 'This tournament only allows parish/group participation' };
  }

  // Validate parish participation
  if (participationType === 'parish') {
    if (!parishId) {
      return { success: false, message: 'Parish ID is required for parish participation' };
    }

    // Check if parish has reached max participants
    const parishCheck = canParishAcceptParticipants(tournamentId, parishId);
    if (!parishCheck.canAccept) {
      return { success: false, message: parishCheck.reason || 'Parish cannot accept more participants' };
    }
  }

  const applications = getAllTournamentApplications();
  const practicePoints = getPracticePoints(userId);

  // Determine qualification pathway
  let status: TournamentApplication['status'] = 'pending';
  let qualificationPathway: TournamentApplication['qualificationPathway'] = 'quiz';
  let autoQualified = false;

  // Check practice points auto-qualification
  if (tournament.qualificationConfig.practicePointsThreshold && 
      practicePoints.totalPoints >= tournament.qualificationConfig.practicePointsThreshold) {
    status = 'auto_qualified';
    qualificationPathway = 'practice_points';
    autoQualified = true;
  } else if (tournament.qualificationConfig.quizEnabled) {
    status = 'quiz_available';
    qualificationPathway = 'quiz';
  }

  // Get parish display name if applicable
  let parishDisplayName: string | undefined;
  if (participationType === 'parish' && parishId) {
    const parish = getParishById(parishId);
    parishDisplayName = parish?.name;
  }

  const application: TournamentApplication = {
    id: `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    tournamentId,
    participationType,
    parishId,
    parishDisplayName,
    status,
    qualificationPathway,
    appliedAt: new Date().toISOString(),
    lastStatusChange: new Date().toISOString(),
    notificationsSent: ['application_received'],
    ...(autoQualified && {
      practicePointsUsed: practicePoints.totalPoints,
      autoQualified: true
    }),
    ...(qualificationPathway === 'quiz' && tournament.qualificationConfig.quizSettings && {
      attemptsRemaining: tournament.qualificationConfig.quizSettings.maxRetakes,
      quizAttempts: []
    })
  };

  applications.push(application);
  storage.set(STORAGE_KEYS.TOURNAMENT_APPLICATIONS, applications);

  // Update parish stats if parish participation
  if (participationType === 'parish' && parishId) {
    updateParishStats(tournamentId, parishId);
  }

  logAuditEvent({
    userId,
    action: 'apply_tournament',
    entityType: 'tournament',
    entityId: tournamentId,
    details: { applicationId: application.id, pathway: qualificationPathway, autoQualified, participationType, parishId }
  });

  return { 
    success: true, 
    message: autoQualified 
      ? 'Congratulations! You are auto-qualified via practice points!' 
      : 'Application submitted successfully. Check your email for next steps.',
    applicationId: application.id
  };
}

// ==================== PRACTICE POINTS FUNCTIONS ====================

// Get practice points for user
export function getPracticePoints(userId: string): PracticePoints {
  const allPoints = storage.get(STORAGE_KEYS.PRACTICE_POINTS) || [];
  const userPoints = allPoints.find((p: PracticePoints) => p.userId === userId);
  
  if (!userPoints) {
    return {
      userId,
      totalPoints: 0,
      pointsHistory: [],
      lastUpdated: new Date().toISOString()
    };
  }
  
  return userPoints;
}

// Add practice points
export function addPracticePoints(userId: string, points: number, reason: string): boolean {
  const allPoints = storage.get(STORAGE_KEYS.PRACTICE_POINTS) || [];
  let userPoints = allPoints.find((p: PracticePoints) => p.userId === userId);
  
  if (!userPoints) {
    userPoints = {
      userId,
      totalPoints: 0,
      pointsHistory: [],
      lastUpdated: new Date().toISOString()
    };
    allPoints.push(userPoints);
  }
  
  userPoints.totalPoints += points;
  userPoints.pointsHistory.push({
    id: `pts_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    points,
    reason,
    timestamp: new Date().toISOString()
  });
  userPoints.lastUpdated = new Date().toISOString();
  
  storage.set(STORAGE_KEYS.PRACTICE_POINTS, allPoints);
  
  return true;
}

// ==================== QUESTION RANDOMIZATION FUNCTIONS ====================

// Shuffle array using Fisher-Yates algorithm
function shuffleArray<T>(array: T[], seed?: string): T[] {
  const arr = [...array];
  const random = seed ? seededRandom(seed) : Math.random;
  
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  
  return arr;
}

// Seeded random number generator
function seededRandom(seed: string): () => number {
  let value = 0;
  for (let i = 0; i < seed.length; i++) {
    value = ((value << 5) - value) + seed.charCodeAt(i);
    value = value & value;
  }
  
  return function() {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

// Get questions for quiz attempt (with randomization and no repeats)
export function getQuestionsForAttempt(
  userId: string, 
  tournamentId: string, 
  attemptNumber: number
): { success: boolean; questions?: Question[]; message?: string } {
  const tournaments = storage.get(STORAGE_KEYS.TOURNAMENTS) || mockTournaments;
  const tournament = tournaments.find((t: Tournament) => t.id === tournamentId);
  
  if (!tournament?.qualificationConfig?.quizSettings) {
    return { success: false, message: 'Quiz configuration not found' };
  }
  
  const config = tournament.qualificationConfig.quizSettings;
  const allQuestions = storage.get(STORAGE_KEYS.QUESTIONS) || mockQuestions;
  
  // Filter questions by category and difficulty
  let availableQuestions = allQuestions.filter((q: Question) => {
    if (config.categoryMatch && q.category !== tournament.category) {
      return false;
    }
    if (q.difficulty !== config.difficultyLevel) {
      return false;
    }
    return true;
  });
  
  // Get previous attempts to exclude used questions
  const applications = getUserTournamentApplications(userId);
  const application = applications.find(app => app.tournamentId === tournamentId);
  
  if (application?.quizAttempts) {
    const usedQuestionIds = application.quizAttempts.flatMap(attempt => attempt.questionsShown);
    availableQuestions = availableQuestions.filter((q: Question) => !usedQuestionIds.includes(q.id));
  }
  
  // Validate sufficient questions
  if (availableQuestions.length < config.questionsCount) {
    return { 
      success: false, 
      message: `Insufficient unique questions available. Need ${config.questionsCount}, have ${availableQuestions.length}` 
    };
  }
  
  // Randomly select questions with seed
  const seed = `${userId}_${tournamentId}_${attemptNumber}_${Date.now()}`;
  const selectedQuestions = shuffleArray(availableQuestions, seed).slice(0, config.questionsCount);
  
  // Shuffle answer options if configured
  if (config.randomizeAnswerOptions) {
    return {
      success: true,
      questions: selectedQuestions.map((q: Question) => ({
        ...q,
        options: shuffleArray(q.options, `${seed}_${q.id}`)
      }))
    };
  }
  
  return { success: true, questions: selectedQuestions };
}

// Calculate final score based on scoring method
export function calculateFinalScore(
  attempts: QuizAttempt[], 
  scoringMethod: 'average' | 'highest' | 'latest'
): number {
  if (attempts.length === 0) return 0;
  
  switch (scoringMethod) {
    case 'average':
      return attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length;
      
    case 'highest':
      return Math.max(...attempts.map(a => a.score));
      
    case 'latest':
      return attempts[attempts.length - 1].score;
      
    default:
      return attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length;
  }
}

// ==================== PARISH/ORGANIZATION MANAGEMENT ====================

// Get all parishes
export function getAllParishes(): Parish[] {
  return storage.get(STORAGE_KEYS.PARISHES) || [];
}

// Get parishes by tenant
export function getParishesByTenant(tenantId: string): Parish[] {
  const parishes = getAllParishes();
  return parishes.filter(p => p.tenantId === tenantId);
}

// Search parishes by name
export function searchParishes(query: string, tenantId?: string): Parish[] {
  let parishes = getAllParishes();
  
  if (tenantId) {
    parishes = parishes.filter(p => p.tenantId === tenantId);
  }
  
  if (!query) return parishes;
  
  const lowerQuery = query.toLowerCase();
  return parishes.filter(p => 
    p.name.toLowerCase().includes(lowerQuery) ||
    p.location.address.toLowerCase().includes(lowerQuery)
  );
}

// Get parish by ID
export function getParishById(parishId: string): Parish | null {
  const parishes = getAllParishes();
  return parishes.find(p => p.id === parishId) || null;
}

// Add new parish
export function addParish(parishData: Omit<Parish, 'id' | 'createdAt' | 'isVerified' | 'verifiedBy' | 'verifiedAt'>): { success: boolean; parishId?: string; message?: string } {
  const parishes = getAllParishes();
  
  // Check for duplicate name in same tenant
  const duplicate = parishes.find(p => 
    p.name.toLowerCase() === parishData.name.toLowerCase() && 
    p.tenantId === parishData.tenantId
  );
  
  if (duplicate) {
    return { success: false, message: 'A parish with this name already exists' };
  }
  
  const newParish: Parish = {
    ...parishData,
    id: `parish_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    isVerified: false // Admin must verify new parishes
  };
  
  parishes.push(newParish);
  storage.set(STORAGE_KEYS.PARISHES, parishes);
  
  logAuditEvent({
    userId: parishData.createdBy,
    action: 'create_parish',
    entityType: 'parish',
    entityId: newParish.id,
    details: { parishName: parishData.name }
  });
  
  return { success: true, parishId: newParish.id };
}

// Update parish
export function updateParish(parishId: string, updates: Partial<Parish>): boolean {
  const parishes = getAllParishes();
  const parishIndex = parishes.findIndex(p => p.id === parishId);
  
  if (parishIndex === -1) return false;
  
  parishes[parishIndex] = {
    ...parishes[parishIndex],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  storage.set(STORAGE_KEYS.PARISHES, parishes);
  return true;
}

// Verify parish (admin action)
export function verifyParish(parishId: string, adminId: string): boolean {
  const parishes = getAllParishes();
  const parishIndex = parishes.findIndex(p => p.id === parishId);
  
  if (parishIndex === -1) return false;
  
  parishes[parishIndex].isVerified = true;
  parishes[parishIndex].verifiedBy = adminId;
  parishes[parishIndex].verifiedAt = new Date().toISOString();
  parishes[parishIndex].updatedAt = new Date().toISOString();
  
  storage.set(STORAGE_KEYS.PARISHES, parishes);
  
  logAuditEvent({
    userId: adminId,
    action: 'verify_parish',
    entityType: 'parish',
    entityId: parishId,
    details: { status: 'verified' }
  });
  
  return true;
}

// ==================== USER PROFILE MANAGEMENT ====================

// Get user profile
export function getUserProfile(userId: string): UserProfile | null {
  const profiles = storage.get(STORAGE_KEYS.USER_PROFILES) || [];
  return profiles.find((p: UserProfile) => p.userId === userId) || null;
}

// Create or update user profile
export function saveUserProfile(profileData: Partial<UserProfile> & { userId: string }): boolean {
  const profiles = storage.get(STORAGE_KEYS.USER_PROFILES) || [];
  const existingIndex = profiles.findIndex((p: UserProfile) => p.userId === profileData.userId);
  
  // Calculate profile completion
  const completionScore = calculateProfileCompletion(profileData);
  
  const updatedProfile: UserProfile = existingIndex >= 0 
    ? {
        ...profiles[existingIndex],
        ...profileData,
        profileCompletionPercentage: completionScore,
        isProfileComplete: completionScore === 100,
        updatedAt: new Date().toISOString()
      }
    : {
        userId: profileData.userId,
        profileCompletionPercentage: completionScore,
        isProfileComplete: completionScore === 100,
        createdAt: new Date().toISOString(),
        ...profileData
      };
  
  if (existingIndex >= 0) {
    profiles[existingIndex] = updatedProfile;
  } else {
    profiles.push(updatedProfile);
  }
  
  storage.set(STORAGE_KEYS.USER_PROFILES, profiles);
  
  // Update user's profile completion percentage
  const users = storage.get(STORAGE_KEYS.USERS) || mockUsers;
  const userIndex = users.findIndex((u: User) => u.id === profileData.userId);
  if (userIndex >= 0) {
    users[userIndex].hasExtendedProfile = true;
    users[userIndex].profileCompletionPercentage = completionScore;
    storage.set(STORAGE_KEYS.USERS, users);
    
    // Update current user if it's the same
    const currentUser = storage.get(STORAGE_KEYS.CURRENT_USER);
    if (currentUser?.id === profileData.userId) {
      currentUser.hasExtendedProfile = true;
      currentUser.profileCompletionPercentage = completionScore;
      storage.set(STORAGE_KEYS.CURRENT_USER, currentUser);
    }
  }
  
  return true;
}

// Calculate profile completion percentage
function calculateProfileCompletion(profile: Partial<UserProfile>): number {
  let score = 0;
  const weights = {
    dateOfBirth: 5,
    gender: 5,
    phoneNumber: 10,
    homeAddress: 10,
    profilePicture: 10,
    parishId: 15,
    nextOfKin: 15,
    bankAccount: 15,
    socialAccounts: 15
  };
  
  if (profile.dateOfBirth) score += weights.dateOfBirth;
  if (profile.gender) score += weights.gender;
  if (profile.phoneNumber) score += weights.phoneNumber;
  if (profile.homeAddress) score += weights.homeAddress;
  if (profile.profilePicture) score += weights.profilePicture;
  if (profile.parishId) score += weights.parishId;
  
  // Next of Kin (check if all required fields are filled)
  if (profile.nextOfKin?.name && profile.nextOfKin?.phoneNumber && profile.nextOfKin?.relationship) {
    score += weights.nextOfKin;
  }
  
  // Bank Account (check if all required fields are filled)
  if (profile.bankAccount?.bankName && profile.bankAccount?.accountNumber && profile.bankAccount?.accountName) {
    score += weights.bankAccount;
  }
  
  // Social Accounts (check if at least one is filled)
  if (profile.socialAccounts && Object.values(profile.socialAccounts).some(v => v)) {
    score += weights.socialAccounts;
  }
  
  return score;
}

// Get profile completion status
export function getProfileCompletionStatus(userId: string): {
  percentage: number;
  missingFields: string[];
  isComplete: boolean;
} {
  const profile = getUserProfile(userId);
  
  if (!profile) {
    return {
      percentage: 0,
      missingFields: ['All profile fields'],
      isComplete: false
    };
  }
  
  const missingFields: string[] = [];
  
  if (!profile.dateOfBirth) missingFields.push('Date of Birth');
  if (!profile.gender) missingFields.push('Gender');
  if (!profile.phoneNumber) missingFields.push('Phone Number');
  if (!profile.homeAddress) missingFields.push('Home Address');
  if (!profile.profilePicture) missingFields.push('Profile Picture');
  if (!profile.parishId) missingFields.push('Parish/Organization');
  if (!profile.nextOfKin?.name) missingFields.push('Next of Kin Information');
  if (!profile.bankAccount?.accountNumber) missingFields.push('Bank Account Details');
  if (!profile.socialAccounts || !Object.values(profile.socialAccounts).some(v => v)) {
    missingFields.push('Social Media Accounts');
  }
  
  return {
    percentage: profile.profileCompletionPercentage,
    missingFields,
    isComplete: profile.isProfileComplete
  };
}

// Get custom field labels for tenant
export function getFieldLabels(tenantId?: string): {
  parishSingular: string;
  parishPlural: string;
  parishMember: string;
  parishLeader: string;
} {
  const defaultLabels = {
    parishSingular: 'Parish/Organization',
    parishPlural: 'Parishes/Organizations',
    parishMember: 'Member',
    parishLeader: 'Authority/Pastor'
  };

  if (!tenantId) return defaultLabels;

  // Get branding config for tenant
  const brandingKey = `${STORAGE_KEYS.BRANDING}_${tenantId}`;
  const branding = storage.get(brandingKey);

  if (!branding || !branding.customFieldLabels) {
    return defaultLabels;
  }

  return {
    parishSingular: branding.customFieldLabels.parishSingular || defaultLabels.parishSingular,
    parishPlural: branding.customFieldLabels.parishPlural || defaultLabels.parishPlural,
    parishMember: branding.customFieldLabels.parishMember || defaultLabels.parishMember,
    parishLeader: branding.customFieldLabels.parishLeader || defaultLabels.parishLeader
  };
}

// ============================================================================
// Parish Tournament Scoring Functions
// ============================================================================

// Calculate parish score based on tournament configuration
export function calculateParishScore(
  tournamentId: string, 
  parishId: string
): ParishTournamentStats | null {
  const tournament = tournaments.find(t => t.id === tournamentId);
  if (!tournament || !tournament.parishScoringConfig?.enabled) return null;
  
  const applications = getAllApplicationsForTournament(tournamentId)
    .filter(app => app.parishId === parishId && app.participationType === 'parish');
  
  if (applications.length === 0) return null;
  
  const memberScores: Record<string, number> = {};
  let totalScore = 0;
  
  // Collect member scores
  applications.forEach(app => {
    if (app.finalScore !== undefined) {
      memberScores[app.userId] = app.finalScore;
      totalScore += app.finalScore;
    }
  });
  
  const activeMembers = Object.keys(memberScores);
  const activeMemberCount = activeMembers.length;
  
  if (activeMemberCount === 0) return null;
  
  let finalScore = 0;
  let topNScore: number | undefined;
  let weightedScore: number | undefined;
  const method = tournament.parishScoringConfig.scoringMethod;
  
  switch (method) {
    case 'average':
      // Divide total by number of active members (user's requirement)
      finalScore = totalScore / activeMemberCount;
      break;
      
    case 'total':
      // Sum of all member scores
      finalScore = totalScore;
      break;
      
    case 'topN': {
      // Sum of top N scores
      const topN = tournament.parishScoringConfig.topNCount || 5;
      const sortedScores = Object.values(memberScores).sort((a, b) => b - a);
      topNScore = sortedScores.slice(0, Math.min(topN, sortedScores.length))
        .reduce((sum, score) => sum + score, 0);
      finalScore = topNScore;
      break;
    }
      
    case 'weighted': {
      // Weighted calculation (can be customized)
      // Default: Average with bonus for participation rate
      const participationRate = activeMemberCount / applications.length;
      weightedScore = (totalScore / activeMemberCount) * (1 + participationRate * 0.1);
      finalScore = weightedScore;
      break;
    }
  }
  
  // Get parish details
  const parish = getParishById(parishId);
  const parishName = parish?.name || 'Unknown Parish';
  const parishDisplayName = applications[0]?.parishDisplayName || parishName;
  
  const stats: ParishTournamentStats = {
    id: `stats_${tournamentId}_${parishId}`,
    tournamentId,
    parishId,
    parishName,
    parishDisplayName,
    registeredMembers: applications.map(a => a.userId),
    qualifiedMembers: applications.filter(a => a.status === 'qualified').map(a => a.userId),
    activeMembers,
    memberScores,
    totalScore,
    averageScore: totalScore / activeMemberCount,
    topNScore,
    weightedScore,
    finalScore,
    individualRanks: {},
    lastUpdated: new Date().toISOString()
  };
  
  return stats;
}

// Get parish leaderboard for a tournament
export function getParishLeaderboard(tournamentId: string): ParishTournamentStats[] {
  const tournament = tournaments.find(t => t.id === tournamentId);
  if (!tournament || !tournament.parishScoringConfig?.enabled) return [];
  
  // Get all parishes with participants
  const applications = getAllApplicationsForTournament(tournamentId);
  const parishIds = [...new Set(applications
    .filter(app => app.participationType === 'parish' && app.parishId)
    .map(app => app.parishId!)
  )];
  
  // Calculate scores for each parish
  const parishStats = parishIds
    .map(parishId => calculateParishScore(tournamentId, parishId))
    .filter((stats): stats is ParishTournamentStats => stats !== null);
  
  // Sort by final score (descending)
  parishStats.sort((a, b) => b.finalScore - a.finalScore);
  
  // Assign ranks
  parishStats.forEach((stats, index) => {
    stats.parishRank = index + 1;
  });
  
  return parishStats;
}

// Update parish statistics after member completes tournament
export function updateParishStats(tournamentId: string, parishId: string): void {
  const stats = calculateParishScore(tournamentId, parishId);
  if (!stats) return;
  
  // Save to storage
  const allStats = storage.get(STORAGE_KEYS.PARISH_TOURNAMENT_STATS) || [];
  const existingIndex = allStats.findIndex(
    (s: ParishTournamentStats) => s.tournamentId === tournamentId && s.parishId === parishId
  );
  
  if (existingIndex >= 0) {
    allStats[existingIndex] = stats;
  } else {
    allStats.push(stats);
  }
  
  storage.set(STORAGE_KEYS.PARISH_TOURNAMENT_STATS, allStats);
}

// Get parish stats for a specific tournament and parish
export function getParishStats(tournamentId: string, parishId: string): ParishTournamentStats | null {
  const allStats = storage.get(STORAGE_KEYS.PARISH_TOURNAMENT_STATS) || [];
  const stats = allStats.find(
    (s: ParishTournamentStats) => s.tournamentId === tournamentId && s.parishId === parishId
  );
  
  // If not found or outdated, recalculate
  if (!stats) {
    return calculateParishScore(tournamentId, parishId);
  }
  
  return stats;
}

// ============================================================================
// Tournament Eligibility Validation Functions
// ============================================================================

// Main eligibility check for a tournament
export function checkTournamentEligibility(
  userId: string,
  tournamentId: string
): { eligible: boolean; reasons: string[] } {
  const tournament = tournaments.find(t => t.id === tournamentId);
  const user = getUserById(userId);
  
  if (!tournament) {
    return { eligible: false, reasons: ['Tournament not found'] };
  }
  
  if (!user) {
    return { eligible: false, reasons: ['User not found'] };
  }
  
  // If restrictions not enabled, everyone is eligible
  if (!tournament.eligibilityRestrictions?.enabled) {
    return { eligible: true, reasons: [] };
  }
  
  const restrictions = tournament.eligibilityRestrictions;
  const reasons: string[] = [];
  
  // Get user profile for detailed checks
  const profile = getUserProfile(userId);
  
  // Check age restrictions
  if (restrictions.ageMin !== undefined || restrictions.ageMax !== undefined) {
    const ageCheck = validateAge(profile, restrictions);
    if (!ageCheck.valid) {
      reasons.push(...ageCheck.reasons);
    }
  }
  
  // Check gender restrictions
  if (restrictions.allowedGenders && restrictions.allowedGenders.length > 0) {
    const genderCheck = validateGender(profile, restrictions);
    if (!genderCheck.valid) {
      reasons.push(...genderCheck.reasons);
    }
  }
  
  // Check parish restrictions
  if (restrictions.allowedParishes && restrictions.allowedParishes.length > 0) {
    const parishCheck = validateParish(profile, restrictions);
    if (!parishCheck.valid) {
      reasons.push(...parishCheck.reasons);
    }
  }
  
  // Check profile completion requirement
  if (restrictions.requiredProfileCompletion !== undefined) {
    const completionCheck = validateProfileCompletion(user, profile, restrictions);
    if (!completionCheck.valid) {
      reasons.push(...completionCheck.reasons);
    }
  }
  
  // Check custom rules (Enterprise feature)
  if (restrictions.customRules && restrictions.customRules.length > 0) {
    const customCheck = validateCustomRules(profile, restrictions.customRules);
    if (!customCheck.valid) {
      reasons.push(...customCheck.reasons);
    }
  }
  
  return {
    eligible: reasons.length === 0,
    reasons
  };
}

// Validate age restrictions
function validateAge(
  profile: UserProfile | null,
  restrictions: NonNullable<Tournament['eligibilityRestrictions']>
): { valid: boolean; reasons: string[] } {
  if (!profile || !profile.dateOfBirth) {
    return { valid: false, reasons: ['Date of birth not set in profile'] };
  }
  
  const birthDate = new Date(profile.dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  const reasons: string[] = [];
  
  if (restrictions.ageMin !== undefined && age < restrictions.ageMin) {
    reasons.push(`Minimum age requirement: ${restrictions.ageMin} years`);
  }
  
  if (restrictions.ageMax !== undefined && age > restrictions.ageMax) {
    reasons.push(`Maximum age requirement: ${restrictions.ageMax} years`);
  }
  
  return {
    valid: reasons.length === 0,
    reasons
  };
}

// Validate gender restrictions
function validateGender(
  profile: UserProfile | null,
  restrictions: NonNullable<Tournament['eligibilityRestrictions']>
): { valid: boolean; reasons: string[] } {
  if (!profile || !profile.gender) {
    return { valid: false, reasons: ['Gender not set in profile'] };
  }
  
  if (!restrictions.allowedGenders || restrictions.allowedGenders.length === 0) {
    return { valid: true, reasons: [] };
  }
  
  const valid = restrictions.allowedGenders.includes(profile.gender);
  
  return {
    valid,
    reasons: valid ? [] : [`This tournament is restricted to: ${restrictions.allowedGenders.join(', ')}`]
  };
}

// Validate parish restrictions
function validateParish(
  profile: UserProfile | null,
  restrictions: NonNullable<Tournament['eligibilityRestrictions']>
): { valid: boolean; reasons: string[] } {
  if (!profile || !profile.parishId) {
    return { valid: false, reasons: ['Parish/Organization not set in profile'] };
  }
  
  if (!restrictions.allowedParishes || restrictions.allowedParishes.length === 0) {
    return { valid: true, reasons: [] };
  }
  
  const valid = restrictions.allowedParishes.includes(profile.parishId);
  
  if (!valid) {
    const allowedParishNames = restrictions.allowedParishes
      .map(id => getParishById(id)?.name || 'Unknown')
      .join(', ');
    return {
      valid: false,
      reasons: [`This tournament is restricted to members of: ${allowedParishNames}`]
    };
  }
  
  return { valid: true, reasons: [] };
}

// Validate profile completion requirement
function validateProfileCompletion(
  user: User,
  profile: UserProfile | null,
  restrictions: NonNullable<Tournament['eligibilityRestrictions']>
): { valid: boolean; reasons: string[] } {
  if (restrictions.requiredProfileCompletion === undefined) {
    return { valid: true, reasons: [] };
  }
  
  const completionPercentage = user.profileCompletionPercentage || 0;
  const required = restrictions.requiredProfileCompletion;
  
  if (completionPercentage < required) {
    return {
      valid: false,
      reasons: [`Profile completion required: ${required}% (current: ${completionPercentage}%)`]
    };
  }
  
  return { valid: true, reasons: [] };
}

// Validate custom rules (Enterprise feature)
function validateCustomRules(
  profile: UserProfile | null,
  customRules: Array<{
    field: string;
    operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'between';
    value: any;
    message?: string;
  }>
): { valid: boolean; reasons: string[] } {
  if (!profile) {
    return { valid: false, reasons: ['Profile not found'] };
  }
  
  const reasons: string[] = [];
  
  for (const rule of customRules) {
    const fieldValue = (profile as any)[rule.field];
    let ruleValid = true;
    
    switch (rule.operator) {
      case 'equals':
        ruleValid = fieldValue === rule.value;
        break;
      case 'contains':
        ruleValid = typeof fieldValue === 'string' && fieldValue.includes(rule.value);
        break;
      case 'greaterThan':
        ruleValid = Number(fieldValue) > Number(rule.value);
        break;
      case 'lessThan':
        ruleValid = Number(fieldValue) < Number(rule.value);
        break;
      case 'between': {
        const num = Number(fieldValue);
        ruleValid = num >= rule.value[0] && num <= rule.value[1];
        break;
      }
    }
    
    if (!ruleValid) {
      reasons.push(rule.message || `Eligibility requirement not met: ${rule.field}`);
    }
  }
  
  return {
    valid: reasons.length === 0,
    reasons
  };
}

// Check if parish can accept more participants
export function canParishAcceptParticipants(
  tournamentId: string,
  parishId: string
): { canAccept: boolean; reason?: string; currentCount: number; maxAllowed?: number } {
  const tournament = tournaments.find(t => t.id === tournamentId);
  
  if (!tournament) {
    return { canAccept: false, reason: 'Tournament not found', currentCount: 0 };
  }
  
  // If no max set, unlimited
  if (!tournament.participationConfig?.maxParticipantsPerParish) {
    return { canAccept: true, currentCount: 0 };
  }
  
  const maxAllowed = tournament.participationConfig.maxParticipantsPerParish;
  const applications = getAllApplicationsForTournament(tournamentId)
    .filter(app => app.parishId === parishId && app.participationType === 'parish');
  
  const currentCount = applications.length;
  const canAccept = currentCount < maxAllowed;
  
  return {
    canAccept,
    reason: canAccept ? undefined : `Parish has reached maximum participants (${maxAllowed})`,
    currentCount,
    maxAllowed
  };
}

// ==================== PRIZE & REWARD MANAGEMENT ====================

// Get all tournament prizes
export function getAllTournamentPrizes(): TournamentPrize[] {
  return storage.get(STORAGE_KEYS.TOURNAMENT_PRIZES) || [];
}

// Get prize configuration for a tournament
export function getTournamentPrize(tournamentId: string): TournamentPrize | null {
  const prizes = getAllTournamentPrizes();
  return prizes.find(p => p.tournamentId === tournamentId) || null;
}

// Save or update tournament prize configuration
export function saveTournamentPrize(prizeData: Omit<TournamentPrize, 'id' | 'createdAt' | 'updatedAt'> | TournamentPrize): { success: boolean; prizeId?: string; message?: string } {
  const prizes = getAllTournamentPrizes();
  
  if ('id' in prizeData && prizeData.id) {
    // Update existing
    const index = prizes.findIndex(p => p.id === prizeData.id);
    if (index === -1) {
      return { success: false, message: 'Prize configuration not found' };
    }
    
    prizes[index] = {
      ...prizeData,
      updatedAt: new Date().toISOString()
    };
    
    storage.set(STORAGE_KEYS.TOURNAMENT_PRIZES, prizes);
    return { success: true, prizeId: prizeData.id, message: 'Prize configuration updated successfully' };
  } else {
    // Create new
    const newPrize: TournamentPrize = {
      ...(prizeData as Omit<TournamentPrize, 'id' | 'createdAt' | 'updatedAt'>),
      id: `prize_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    prizes.push(newPrize);
    storage.set(STORAGE_KEYS.TOURNAMENT_PRIZES, prizes);
    return { success: true, prizeId: newPrize.id, message: 'Prize configuration created successfully' };
  }
}

// Delete tournament prize configuration
export function deleteTournamentPrize(prizeId: string): { success: boolean; message?: string } {
  const prizes = getAllTournamentPrizes();
  const index = prizes.findIndex(p => p.id === prizeId);
  
  if (index === -1) {
    return { success: false, message: 'Prize configuration not found' };
  }
  
  prizes.splice(index, 1);
  storage.set(STORAGE_KEYS.TOURNAMENT_PRIZES, prizes);
  return { success: true, message: 'Prize configuration deleted successfully' };
}

// Get all prize awards
export function getAllPrizeAwards(): PrizeAward[] {
  return storage.get(STORAGE_KEYS.PRIZE_AWARDS) || [];
}

// Get prize awards for a tournament
export function getTournamentPrizeAwards(tournamentId: string): PrizeAward[] {
  const awards = getAllPrizeAwards();
  return awards.filter(a => a.tournamentId === tournamentId);
}

// Get prize awards for a specific winner
export function getWinnerPrizeAwards(winnerId: string): PrizeAward[] {
  const awards = getAllPrizeAwards();
  return awards.filter(a => a.winnerId === winnerId);
}

// Calculate and create prize awards for tournament winners
export function generatePrizeAwards(tournamentId: string): { success: boolean; awards?: PrizeAward[]; message?: string } {
  const tournament = tournaments.find(t => t.id === tournamentId);
  if (!tournament) {
    return { success: false, message: 'Tournament not found' };
  }
  
  const prizeConfig = getTournamentPrize(tournamentId);
  if (!prizeConfig) {
    return { success: false, message: 'No prize configuration found for this tournament' };
  }
  
  // Get qualified applications sorted by score
  const applications = getAllApplicationsForTournament(tournamentId)
    .filter(app => app.status === 'qualified' || app.status === 'auto_qualified')
    .sort((a, b) => (b.finalScore || 0) - (a.finalScore || 0));
  
  if (applications.length === 0) {
    return { success: false, message: 'No qualified participants found' };
  }
  
  const newAwards: PrizeAward[] = [];
  const existingAwards = getTournamentPrizeAwards(tournamentId);
  
  // Generate awards based on prize structure
  if (prizeConfig.prizeStructure === 'top_n' && prizeConfig.positionPrizes) {
    for (const positionPrize of prizeConfig.positionPrizes) {
      if (positionPrize.positionRange) {
        // Range of positions (e.g., 4th-10th)
        for (let pos = positionPrize.positionRange.from; pos <= positionPrize.positionRange.to && pos <= applications.length; pos++) {
          const application = applications[pos - 1];
          
          // Check if award already exists
          if (existingAwards.some(a => a.winnerId === application.userId && a.position === pos)) {
            continue;
          }
          
          newAwards.push(createPrizeAward(tournament, prizeConfig, application, pos, positionPrize));
        }
      } else {
        // Single position
        const pos = positionPrize.position;
        if (pos <= applications.length) {
          const application = applications[pos - 1];
          
          // Check if award already exists
          if (!existingAwards.some(a => a.winnerId === application.userId && a.position === pos)) {
            newAwards.push(createPrizeAward(tournament, prizeConfig, application, pos, positionPrize));
          }
        }
      }
    }
  }
  
  // Handle percentage-based prizes
  if (prizeConfig.prizeStructure === 'top_percentage' && prizeConfig.percentagePrizes) {
    for (const percentagePrize of prizeConfig.percentagePrizes) {
      const topCount = Math.ceil(applications.length * (percentagePrize.topPercentage / 100));
      for (let i = 0; i < topCount && i < applications.length; i++) {
        const application = applications[i];
        const pos = i + 1;
        
        if (!existingAwards.some(a => a.winnerId === application.userId && a.position === pos)) {
          // Use the first prize definition from the percentage config
          if (percentagePrize.prizes.length > 0) {
            newAwards.push(createPrizeAward(tournament, prizeConfig, application, pos, percentagePrize.prizes[0]));
          }
        }
      }
    }
  }
  
  // Handle threshold-based prizes
  if (prizeConfig.prizeStructure === 'threshold_based' && prizeConfig.thresholdPrizes) {
    let position = 1;
    for (const application of applications) {
      for (const thresholdPrize of prizeConfig.thresholdPrizes) {
        if ((application.finalScore || 0) >= thresholdPrize.minimumScore) {
          if (!existingAwards.some(a => a.winnerId === application.userId && a.prizeCategory === 'threshold')) {
            if (thresholdPrize.prizes.length > 0) {
              const award = createPrizeAward(tournament, prizeConfig, application, position, thresholdPrize.prizes[0]);
              award.prizeCategory = 'threshold';
              newAwards.push(award);
            }
          }
          break;
        }
      }
      position++;
    }
  }
  
  // Save all new awards
  if (newAwards.length > 0) {
    const allAwards = [...existingAwards, ...newAwards];
    storage.set(STORAGE_KEYS.PRIZE_AWARDS, allAwards);
  }
  
  return { success: true, awards: newAwards, message: `Generated ${newAwards.length} prize award(s)` };
}

// Helper function to create a prize award object
function createPrizeAward(
  tournament: Tournament,
  prizeConfig: TournamentPrize,
  application: TournamentApplication,
  position: number,
  positionPrize: PositionPrize
): PrizeAward {
  const user = getUsers().find(u => u.id === application.userId);
  
  const prizes: PrizeAward['prizes'] = [];
  
  // Add cash prize if present
  if (positionPrize.cashAmount && positionPrize.currency) {
    prizes.push({
      type: 'cash',
      description: `${positionPrize.currency} ${positionPrize.cashAmount.toLocaleString()}`,
      cashAmount: positionPrize.cashAmount,
      currency: positionPrize.currency
    });
  }
  
  // Add physical prize if present
  if (positionPrize.physicalPrize) {
    prizes.push({
      type: 'physical',
      description: positionPrize.physicalPrize.name,
      physicalItem: positionPrize.physicalPrize.name
    });
  }
  
  // Add digital rewards if present
  if (positionPrize.digitalRewards) {
    for (const reward of positionPrize.digitalRewards) {
      prizes.push({
        type: 'digital',
        description: reward.description,
        digitalReward: reward
      });
    }
  }
  
  return {
    id: `award_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    tournamentId: tournament.id,
    tenantId: tournament.tenantId,
    prizeConfigId: prizeConfig.id,
    winnerId: application.userId,
    winnerType: application.participationType || 'individual',
    winnerName: user?.name || 'Unknown',
    winnerEmail: user?.email,
    position,
    positionLabel: positionPrize.label,
    prizeCategory: 'Overall',
    prizes,
    sponsor: positionPrize.sponsoredBy,
    status: 'pending',
    winnerAcknowledged: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

// Update prize award status
export function updatePrizeAwardStatus(
  awardId: string,
  status: PrizeAward['status'],
  additionalData?: Partial<Pick<PrizeAward, 'distributionProof' | 'distributedBy'>>
): { success: boolean; message?: string } {
  const awards = getAllPrizeAwards();
  const index = awards.findIndex(a => a.id === awardId);
  
  if (index === -1) {
    return { success: false, message: 'Prize award not found' };
  }
  
  const now = new Date().toISOString();
  awards[index] = {
    ...awards[index],
    status,
    updatedAt: now,
    ...(status === 'notified' && { notifiedAt: now }),
    ...(status === 'claimed' && { claimedAt: now }),
    ...(status === 'distributed' && { distributedAt: now }),
    ...additionalData
  };
  
  storage.set(STORAGE_KEYS.PRIZE_AWARDS, awards);
  return { success: true, message: 'Prize award status updated successfully' };
}

// Winner acknowledges prize
export function acknowledgePrize(awardId: string, testimonial?: string): { success: boolean; message?: string } {
  const awards = getAllPrizeAwards();
  const index = awards.findIndex(a => a.id === awardId);
  
  if (index === -1) {
    return { success: false, message: 'Prize award not found' };
  }
  
  awards[index] = {
    ...awards[index],
    winnerAcknowledged: true,
    acknowledgmentDate: new Date().toISOString(),
    testimonial,
    updatedAt: new Date().toISOString()
  };
  
  storage.set(STORAGE_KEYS.PRIZE_AWARDS, awards);
  return { success: true, message: 'Prize acknowledged successfully' };
}

// Get past winners (for hall of fame)
export function getPastWinners(tenantId?: string, limit?: number): PrizeAward[] {
  let awards = getAllPrizeAwards()
    .filter(a => a.status === 'distributed' || a.status === 'claimed')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  if (tenantId) {
    awards = awards.filter(a => a.tenantId === tenantId);
  }
  
  if (limit) {
    awards = awards.slice(0, limit);
  }
  
  return awards;
}

// Get tournament winners for display
export function getTournamentWinners(tournamentId: string, topN: number = 3): PrizeAward[] {
  return getTournamentPrizeAwards(tournamentId)
    .filter(a => a.position <= topN)
    .sort((a, b) => a.position - b.position);
}

// ==================== PAYMENT & MONETIZATION MANAGEMENT ====================

// Get all payment gateways
export function getAllPaymentGateways(): PaymentGatewayConfig[] {
  return storage.get(STORAGE_KEYS.PAYMENT_GATEWAYS) || [];
}

// Get payment gateway by tenant
export function getPaymentGateway(tenantId: string): PaymentGatewayConfig | null {
  const gateways = getAllPaymentGateways();
  return gateways.find(g => g.tenantId === tenantId && g.isEnabled) || null;
}

// Save payment gateway configuration
export function savePaymentGateway(config: Omit<PaymentGatewayConfig, 'id' | 'createdAt' | 'updatedAt'> | PaymentGatewayConfig): { success: boolean; gatewayId?: string; message?: string } {
  const gateways = getAllPaymentGateways();
  
  if ('id' in config && config.id) {
    // Update existing
    const index = gateways.findIndex(g => g.id === config.id);
    if (index === -1) {
      return { success: false, message: 'Payment gateway not found' };
    }
    
    gateways[index] = {
      ...config,
      updatedAt: new Date().toISOString()
    };
    
    storage.set(STORAGE_KEYS.PAYMENT_GATEWAYS, gateways);
    return { success: true, gatewayId: config.id, message: 'Payment gateway updated successfully' };
  } else {
    // Create new
    const newGateway: PaymentGatewayConfig = {
      ...(config as Omit<PaymentGatewayConfig, 'id' | 'createdAt' | 'updatedAt'>),
      id: `gateway_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    gateways.push(newGateway);
    storage.set(STORAGE_KEYS.PAYMENT_GATEWAYS, gateways);
    return { success: true, gatewayId: newGateway.id, message: 'Payment gateway created successfully' };
  }
}

// Get all tournament payments
export function getAllTournamentPayments(): TournamentPayment[] {
  return storage.get(STORAGE_KEYS.TOURNAMENT_PAYMENTS) || [];
}

// Get payments for a tournament
export function getTournamentPayments(tournamentId: string): TournamentPayment[] {
  const payments = getAllTournamentPayments();
  return payments.filter(p => p.tournamentId === tournamentId);
}

// Get payment by ID
export function getPaymentById(paymentId: string): TournamentPayment | null {
  const payments = getAllTournamentPayments();
  return payments.find(p => p.id === paymentId) || null;
}

// Create tournament payment
export function createTournamentPayment(paymentData: Omit<TournamentPayment, 'id' | 'createdAt' | 'updatedAt'>): { success: boolean; paymentId?: string; message?: string } {
  const payments = getAllTournamentPayments();
  
  const newPayment: TournamentPayment = {
    ...paymentData,
    id: `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  payments.push(newPayment);
  storage.set(STORAGE_KEYS.TOURNAMENT_PAYMENTS, payments);
  
  return { success: true, paymentId: newPayment.id, message: 'Payment created successfully' };
}

// Update payment status
export function updatePaymentStatus(paymentId: string, status: TournamentPayment['status'], additionalData?: Partial<TournamentPayment>): { success: boolean; message?: string } {
  const payments = getAllTournamentPayments();
  const index = payments.findIndex(p => p.id === paymentId);
  
  if (index === -1) {
    return { success: false, message: 'Payment not found' };
  }
  
  const now = new Date().toISOString();
  payments[index] = {
    ...payments[index],
    status,
    updatedAt: now,
    ...(status === 'completed' && { paidAt: now }),
    ...additionalData
  };
  
  storage.set(STORAGE_KEYS.TOURNAMENT_PAYMENTS, payments);
  return { success: true, message: 'Payment status updated successfully' };
}

// Check if user/parish has paid for tournament
export function hasUserPaid(tournamentId: string, userId: string): boolean {
  const payments = getTournamentPayments(tournamentId);
  return payments.some(p => 
    p.beneficiaryId === userId && 
    p.status === 'completed'
  );
}

// Check if parish has paid
export function hasParishPaid(tournamentId: string, parishId: string): boolean {
  const payments = getTournamentPayments(tournamentId);
  return payments.some(p => 
    p.beneficiaryId === parishId && 
    p.paymentType === 'parish' &&
    p.status === 'completed'
  );
}

// Get all tournament donations
export function getAllTournamentDonations(): TournamentDonation[] {
  return storage.get(STORAGE_KEYS.TOURNAMENT_DONATIONS) || [];
}

// Get donations for a tournament
export function getTournamentDonations(tournamentId: string): TournamentDonation[] {
  const donations = getAllTournamentDonations();
  return donations.filter(d => d.tournamentId === tournamentId && d.status === 'completed');
}

// Create tournament donation
export function createTournamentDonation(donationData: Omit<TournamentDonation, 'id' | 'createdAt'>): { success: boolean; donationId?: string; message?: string } {
  const donations = getAllTournamentDonations();
  
  const newDonation: TournamentDonation = {
    ...donationData,
    id: `donation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString()
  };
  
  donations.push(newDonation);
  storage.set(STORAGE_KEYS.TOURNAMENT_DONATIONS, donations);
  
  return { success: true, donationId: newDonation.id, message: 'Donation created successfully' };
}

// Get total donations for tournament
export function getTournamentDonationTotal(tournamentId: string): number {
  const donations = getTournamentDonations(tournamentId);
  return donations.reduce((sum, d) => sum + d.amount, 0);
}

// Get top donors for tournament
export function getTopDonors(tournamentId: string, limit: number = 10): TournamentDonation[] {
  const donations = getTournamentDonations(tournamentId)
    .filter(d => d.displayPublicly && !d.isAnonymous);
  
  return donations
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit);
}

// ============================================
// KNOCKOUT TOURNAMENT FUNCTIONS
// ============================================

// Generate a tournament bracket
export function generateTournamentBracket(
  tournamentId: string,
  config: KnockoutTournamentConfig,
  participantIds: string[],
  participantTypes: Record<string, 'individual' | 'parish'>,
  seedingData?: Record<string, number>
): TournamentBracket {
  const bracketId = `bracket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const totalParticipants = participantIds.length;
  
  // Calculate bracket size (next power of 2)
  const bracketSize = Math.pow(2, Math.ceil(Math.log2(totalParticipants)));
  const byesNeeded = bracketSize - totalParticipants;
  
  // Generate seeding
  let seeds: Record<string, number> = {};
  if (seedingData) {
    seeds = seedingData;
  } else {
    seeds = generateSeeding(participantIds, config.seedingMethod);
  }
  
  const bracket: TournamentBracket = {
    id: bracketId,
    tournamentId,
    format: config.format,
    totalParticipants,
    participantIds,
    participantTypes,
    seeds,
    seedingMethod: config.seedingMethod,
    seedingCompletedAt: new Date().toISOString(),
    totalRounds: Math.log2(bracketSize),
    matchesPerRound: [],
    rounds: [],
    currentRound: 1,
    completedRounds: [],
    activeMatches: [],
    completedMatches: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  // Generate matches based on format
  if (config.format === 'single_elimination') {
    generateSingleEliminationMatches(bracket, participantIds, seeds, config, byesNeeded);
  } else if (config.format === 'double_elimination') {
    generateDoubleEliminationMatches(bracket, participantIds, seeds, config, byesNeeded);
  } else if (config.format === 'swiss_system') {
    generateSwissSystemMatches(bracket, participantIds, seeds, config);
  }
  
  // Save bracket
  const brackets = storage.get<TournamentBracket[]>(STORAGE_KEYS.KNOCKOUT_BRACKETS) || [];
  brackets.push(bracket);
  storage.set(STORAGE_KEYS.KNOCKOUT_BRACKETS, brackets);
  
  return bracket;
}

// Generate seeding for participants
function generateSeeding(participantIds: string[], method: string): Record<string, number> {
  const seeds: Record<string, number> = {};
  
  if (method === 'random') {
    const shuffled = [...participantIds].sort(() => Math.random() - 0.5);
    shuffled.forEach((id, index) => {
      seeds[id] = index + 1;
    });
  } else if (method === 'qualification_score') {
    // Would use actual qualification scores
    participantIds.forEach((id, index) => {
      seeds[id] = index + 1;
    });
  } else if (method === 'registration_order') {
    participantIds.forEach((id, index) => {
      seeds[id] = index + 1;
    });
  } else {
    // Default: registration order
    participantIds.forEach((id, index) => {
      seeds[id] = index + 1;
    });
  }
  
  return seeds;
}

// Generate single elimination matches
function generateSingleEliminationMatches(
  bracket: TournamentBracket,
  participantIds: string[],
  seeds: Record<string, number>,
  config: KnockoutTournamentConfig,
  byesNeeded: number
): void {
  const matches: KnockoutMatch[] = [];
  const bracketSize = Math.pow(2, Math.ceil(Math.log2(participantIds.length)));
  const totalRounds = Math.log2(bracketSize);
  
  // Get seeded participants
  const seededParticipants = participantIds.sort((a, b) => seeds[a] - seeds[b]);
  
  // Generate first round matches with standard bracket pairing
  const firstRoundMatches = bracketSize / 2;
  const matchIds: string[] = [];
  
  for (let i = 0; i < firstRoundMatches; i++) {
    const seed1 = i + 1;
    const seed2 = bracketSize - i;
    
    const participant1 = seededParticipants.find(p => seeds[p] === seed1);
    const participant2 = seed2 <= participantIds.length ? seededParticipants.find(p => seeds[p] === seed2) : undefined;
    
    const match = createMatch(
      bracket,
      1,
      getRoundName(1, totalRounds),
      i + 1,
      'main',
      participant1,
      participant2,
      seed1,
      seed2 <= participantIds.length ? seed2 : undefined,
      config
    );
    
    matches.push(match);
    matchIds.push(match.id);
  }
  
  // Generate subsequent rounds (TBD matches)
  for (let round = 2; round <= totalRounds; round++) {
    const matchesInRound = Math.pow(2, totalRounds - round);
    const roundMatchIds: string[] = [];
    
    for (let i = 0; i < matchesInRound; i++) {
      const match = createMatch(
        bracket,
        round,
        getRoundName(round, totalRounds),
        i + 1,
        'main',
        undefined,
        undefined,
        undefined,
        undefined,
        config
      );
      
      // Link to previous round matches
      const prevMatch1Index = i * 2;
      const prevMatch2Index = i * 2 + 1;
      
      if (matchIds[prevMatch1Index] && matchIds[prevMatch2Index]) {
        match.participant1Source = { type: 'winner', matchId: matchIds[prevMatch1Index] };
        match.participant2Source = { type: 'winner', matchId: matchIds[prevMatch2Index] };
      }
      
      matches.push(match);
      roundMatchIds.push(match.id);
    }
    
    matchIds.length = 0;
    matchIds.push(...roundMatchIds);
  }
  
  // Add third place playoff if enabled
  if (config.thirdPlacePlayoff && totalRounds >= 2) {
    const semiFinalMatches = matches.filter(m => m.roundNumber === totalRounds - 1);
    if (semiFinalMatches.length === 2) {
      const thirdPlaceMatch = createMatch(
        bracket,
        totalRounds,
        'Third Place',
        1,
        'third_place',
        undefined,
        undefined,
        undefined,
        undefined,
        config
      );
      thirdPlaceMatch.participant1Source = { type: 'loser', matchId: semiFinalMatches[0].id };
      thirdPlaceMatch.participant2Source = { type: 'loser', matchId: semiFinalMatches[1].id };
      matches.push(thirdPlaceMatch);
    }
  }
  
  // Save all matches
  const existingMatches = storage.get<KnockoutMatch[]>(STORAGE_KEYS.KNOCKOUT_MATCHES) || [];
  storage.set(STORAGE_KEYS.KNOCKOUT_MATCHES, [...existingMatches, ...matches]);
  
  // Update bracket with match structure
  bracket.rounds = [];
  for (let round = 1; round <= totalRounds; round++) {
    const roundMatches = matches.filter(m => m.roundNumber === round && m.bracket === 'main');
    bracket.rounds.push({
      roundNumber: round,
      roundName: getRoundName(round, totalRounds),
      matches: roundMatches.map(m => m.id)
    });
  }
  
  if (config.thirdPlacePlayoff) {
    const thirdPlaceMatch = matches.find(m => m.bracket === 'third_place');
    if (thirdPlaceMatch) {
      bracket.rounds.push({
        roundNumber: totalRounds,
        roundName: 'Third Place',
        matches: [thirdPlaceMatch.id]
      });
    }
  }
  
  bracket.matchesPerRound = bracket.rounds.map(r => r.matches.length);
}

// Generate double elimination matches (simplified version)
function generateDoubleEliminationMatches(
  bracket: TournamentBracket,
  participantIds: string[],
  seeds: Record<string, number>,
  config: KnockoutTournamentConfig,
  byesNeeded: number
): void {
  // Similar to single elimination but with upper and lower brackets
  // This is a simplified implementation - full double elimination is complex
  bracket.upperBracket = { rounds: [] };
  bracket.lowerBracket = { rounds: [] };
  
  // Generate upper bracket (same as single elimination)
  generateSingleEliminationMatches(bracket, participantIds, seeds, config, byesNeeded);
  
  // Would need to add lower bracket logic here
  // Lower bracket gets losers from upper bracket
}

// Generate Swiss system matches (simplified)
function generateSwissSystemMatches(
  bracket: TournamentBracket,
  participantIds: string[],
  seeds: Record<string, number>,
  config: KnockoutTournamentConfig
): void {
  const rounds = config.swissConfig?.numberOfRounds || Math.ceil(Math.log2(participantIds.length));
  
  // Initialize Swiss standings
  bracket.swissStandings = participantIds.map(id => ({
    participantId: id,
    wins: 0,
    draws: 0,
    losses: 0,
    points: 0,
    matchesPlayed: []
  }));
  
  // Generate first round matches (use seeding)
  // Subsequent rounds would be generated dynamically based on standings
  bracket.rounds = [];
  for (let round = 1; round <= rounds; round++) {
    bracket.rounds.push({
      roundNumber: round,
      roundName: `Round ${round}`,
      matches: []
    });
  }
}

// Create a single match
function createMatch(
  bracket: TournamentBracket,
  roundNumber: number,
  roundName: string,
  matchNumber: number,
  bracketType: 'main' | 'upper' | 'lower' | 'third_place',
  participant1Id: string | undefined,
  participant2Id: string | undefined,
  seed1: number | undefined,
  seed2: number | undefined,
  config: KnockoutTournamentConfig
): KnockoutMatch {
  return {
    id: `match_${bracket.tournamentId}_r${roundNumber}_m${matchNumber}_${Date.now()}`,
    tournamentId: bracket.tournamentId,
    bracketId: bracket.id,
    roundNumber,
    roundName,
    matchNumber,
    bracket: bracketType,
    participant1Id,
    participant2Id,
    participant1Type: participant1Id ? bracket.participantTypes[participant1Id] : 'individual',
    participant2Type: participant2Id ? bracket.participantTypes[participant2Id] : 'individual',
    participant1Seed: seed1,
    participant2Seed: seed2,
    status: participant1Id && participant2Id ? 'scheduled' : 'scheduled',
    questionIds: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

// Get round name based on position
function getRoundName(roundNumber: number, totalRounds: number): string {
  const remaining = totalRounds - roundNumber + 1;
  
  if (remaining === 1) return 'Finals';
  if (remaining === 2) return 'Semi Finals';
  if (remaining === 3) return 'Quarter Finals';
  if (remaining === 4) return 'Round of 16';
  if (remaining === 5) return 'Round of 32';
  
  return `Round ${roundNumber}`;
}

// Get tournament bracket
export function getTournamentBracket(tournamentId: string): TournamentBracket | null {
  const brackets = storage.get<TournamentBracket[]>(STORAGE_KEYS.KNOCKOUT_BRACKETS) || [];
  return brackets.find(b => b.tournamentId === tournamentId) || null;
}

// Get match by ID
export function getMatch(matchId: string): KnockoutMatch | null {
  const matches = storage.get<KnockoutMatch[]>(STORAGE_KEYS.KNOCKOUT_MATCHES) || [];
  return matches.find(m => m.id === matchId) || null;
}

// Get matches for a tournament
export function getTournamentMatches(tournamentId: string): KnockoutMatch[] {
  const matches = storage.get<KnockoutMatch[]>(STORAGE_KEYS.KNOCKOUT_MATCHES) || [];
  return matches.filter(m => m.tournamentId === tournamentId);
}

// Get matches for a specific round
export function getRoundMatches(tournamentId: string, roundNumber: number): KnockoutMatch[] {
  return getTournamentMatches(tournamentId).filter(m => m.roundNumber === roundNumber);
}

// Update match result
export function updateMatchResult(
  matchId: string,
  winnerId: string,
  participant1Score: number,
  participant2Score: number,
  participant1Details?: { correctAnswers: number; timeTaken: number; answers: Record<string, number> },
  participant2Details?: { correctAnswers: number; timeTaken: number; answers: Record<string, number> }
): boolean {
  const matches = storage.get<KnockoutMatch[]>(STORAGE_KEYS.KNOCKOUT_MATCHES) || [];
  const matchIndex = matches.findIndex(m => m.id === matchId);
  
  if (matchIndex === -1) return false;
  
  const match = matches[matchIndex];
  match.status = 'completed';
  match.winnerId = winnerId;
  match.participant1Score = participant1Score;
  match.participant2Score = participant2Score;
  match.completedAt = new Date().toISOString();
  match.updatedAt = new Date().toISOString();
  
  if (participant1Details) {
    match.participant1CorrectAnswers = participant1Details.correctAnswers;
    match.participant1TimeTaken = participant1Details.timeTaken;
    match.participant1Answers = participant1Details.answers;
  }
  
  if (participant2Details) {
    match.participant2CorrectAnswers = participant2Details.correctAnswers;
    match.participant2TimeTaken = participant2Details.timeTaken;
    match.participant2Answers = participant2Details.answers;
  }
  
  storage.set(STORAGE_KEYS.KNOCKOUT_MATCHES, matches);
  
  // Update bracket progression
  advanceWinnerToNextMatch(match);
  
  // Update participant journey
  updateParticipantJourney(match);
  
  return true;
}

// Advance winner to next match
function advanceWinnerToNextMatch(completedMatch: KnockoutMatch): void {
  if (!completedMatch.winnerId || !completedMatch.nextMatchId) return;
  
  const matches = storage.get<KnockoutMatch[]>(STORAGE_KEYS.KNOCKOUT_MATCHES) || [];
  const nextMatch = matches.find(m => m.id === completedMatch.nextMatchId);
  
  if (!nextMatch) return;
  
  if (completedMatch.nextMatchPosition === 'participant1') {
    nextMatch.participant1Id = completedMatch.winnerId;
    nextMatch.participant1Type = completedMatch.winnerId === completedMatch.participant1Id 
      ? completedMatch.participant1Type 
      : completedMatch.participant2Type;
  } else if (completedMatch.nextMatchPosition === 'participant2') {
    nextMatch.participant2Id = completedMatch.winnerId;
    nextMatch.participant2Type = completedMatch.winnerId === completedMatch.participant1Id 
      ? completedMatch.participant1Type 
      : completedMatch.participant2Type;
  }
  
  // Check if next match is ready
  if (nextMatch.participant1Id && nextMatch.participant2Id) {
    nextMatch.status = 'ready';
  }
  
  nextMatch.updatedAt = new Date().toISOString();
  storage.set(STORAGE_KEYS.KNOCKOUT_MATCHES, matches);
}

// Update participant journey
function updateParticipantJourney(match: KnockoutMatch): void {
  if (!match.participant1Id || !match.participant2Id) return;
  
  const journeys = storage.get<ParticipantBracketJourney[]>(STORAGE_KEYS.PARTICIPANT_JOURNEYS) || [];
  
  // Update both participants
  [match.participant1Id, match.participant2Id].forEach((participantId, index) => {
    const isParticipant1 = index === 0;
    const won = match.winnerId === participantId;
    const score = isParticipant1 ? match.participant1Score || 0 : match.participant2Score || 0;
    const opponentScore = isParticipant1 ? match.participant2Score || 0 : match.participant1Score || 0;
    const opponentId = isParticipant1 ? match.participant2Id! : match.participant1Id!;
    
    let journey = journeys.find(j => j.participantId === participantId && j.tournamentId === match.tournamentId);
    
    if (!journey) {
      journey = {
        participantId,
        tournamentId: match.tournamentId,
        bracketId: match.bracketId,
        participantType: isParticipant1 ? match.participant1Type : match.participant2Type,
        seed: isParticipant1 ? match.participant1Seed || 0 : match.participant2Seed || 0,
        matchesPlayed: [],
        isEliminated: false,
        totalWins: 0,
        totalLosses: 0,
        totalScore: 0,
        averageScore: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      journeys.push(journey);
    }
    
    // Add match to history
    journey.matchesPlayed.push({
      matchId: match.id,
      roundNumber: match.roundNumber,
      roundName: match.roundName,
      opponentId,
      won,
      score,
      opponentScore,
      bracket: match.bracket
    });
    
    // Update stats
    if (won) {
      journey.totalWins++;
    } else {
      journey.totalLosses++;
      journey.isEliminated = true;
      journey.eliminatedInRound = match.roundNumber;
    }
    
    journey.totalScore += score;
    journey.averageScore = journey.totalScore / journey.matchesPlayed.length;
    journey.updatedAt = new Date().toISOString();
  });
  
  storage.set(STORAGE_KEYS.PARTICIPANT_JOURNEYS, journeys);
}

// Get participant journey
export function getParticipantJourney(participantId: string, tournamentId: string): ParticipantBracketJourney | null {
  const journeys = storage.get<ParticipantBracketJourney[]>(STORAGE_KEYS.PARTICIPANT_JOURNEYS) || [];
  return journeys.find(j => j.participantId === participantId && j.tournamentId === tournamentId) || null;
}

// Get all active matches (ready to play)
export function getActiveMatches(tournamentId: string): KnockoutMatch[] {
  return getTournamentMatches(tournamentId).filter(m => m.status === 'ready' || m.status === 'in_progress');
}

// Start a match
export function startMatch(matchId: string): boolean {
  const matches = storage.get<KnockoutMatch[]>(STORAGE_KEYS.KNOCKOUT_MATCHES) || [];
  const match = matches.find(m => m.id === matchId);
  
  if (!match || match.status !== 'ready') return false;
  
  match.status = 'in_progress';
  match.actualStartTime = new Date().toISOString();
  match.updatedAt = new Date().toISOString();
  
  storage.set(STORAGE_KEYS.KNOCKOUT_MATCHES, matches);
  return true;
}

// Get bracket standings (for display)
export function getBracketStandings(tournamentId: string): {
  winner?: string;
  runnerUp?: string;
  thirdPlace?: string;
  participants: Array<{
    participantId: string;
    placement?: number;
    wins: number;
    losses: number;
    isEliminated: boolean;
  }>;
} {
  const journeys = storage.get<ParticipantBracketJourney[]>(STORAGE_KEYS.PARTICIPANT_JOURNEYS) || [];
  const bracket = getTournamentBracket(tournamentId);
  
  const standings = {
    winner: bracket?.winnerId,
    runnerUp: bracket?.runnerUpId,
    thirdPlace: bracket?.thirdPlaceId,
    participants: journeys
      .filter(j => j.tournamentId === tournamentId)
      .map(j => ({
        participantId: j.participantId,
        placement: j.finalPlacement,
        wins: j.totalWins,
        losses: j.totalLosses,
        isEliminated: j.isEliminated
      }))
      .sort((a, b) => {
        if (a.placement && b.placement) return a.placement - b.placement;
        if (a.placement) return -1;
        if (b.placement) return 1;
        return b.wins - a.wins;
      })
  };
  
  return standings;
}

// ============================================================================
// CUSTOM CATEGORY MANAGEMENT FUNCTIONS (Enterprise)
// ============================================================================

// Create custom category
export function createCustomCategory(
  tenantId: string,
  categoryData: Omit<CustomQuestionCategory, 'id' | 'createdAt'>
): CustomQuestionCategory {
  const categories = storage.get<CustomQuestionCategory[]>(STORAGE_KEYS.CUSTOM_CATEGORIES) || [];
  
  const newCategory: CustomQuestionCategory = {
    ...categoryData,
    id: `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString()
  };
  
  categories.push(newCategory);
  storage.set(STORAGE_KEYS.CUSTOM_CATEGORIES, categories);
  
  return newCategory;
}

// Get all custom categories for a tenant
export function getCustomCategories(tenantId: string, activeOnly: boolean = true): CustomQuestionCategory[] {
  const categories = storage.get<CustomQuestionCategory[]>(STORAGE_KEYS.CUSTOM_CATEGORIES) || [];
  
  let filtered = categories.filter(c => c.tenantId === tenantId);
  if (activeOnly) {
    filtered = filtered.filter(c => c.isActive);
  }
  
  return filtered;
}

// Get custom category by ID
export function getCustomCategory(categoryId: string): CustomQuestionCategory | null {
  const categories = storage.get<CustomQuestionCategory[]>(STORAGE_KEYS.CUSTOM_CATEGORIES) || [];
  return categories.find(c => c.id === categoryId) || null;
}

// Update custom category
export function updateCustomCategory(
  categoryId: string,
  updates: Partial<Omit<CustomQuestionCategory, 'id' | 'tenantId' | 'createdAt' | 'createdBy'>>
): CustomQuestionCategory | null {
  const categories = storage.get<CustomQuestionCategory[]>(STORAGE_KEYS.CUSTOM_CATEGORIES) || [];
  
  const index = categories.findIndex(c => c.id === categoryId);
  if (index === -1) return null;
  
  categories[index] = {
    ...categories[index],
    ...updates
  };
  
  storage.set(STORAGE_KEYS.CUSTOM_CATEGORIES, categories);
  return categories[index];
}

// Delete custom category
export function deleteCustomCategory(categoryId: string): boolean {
  const categories = storage.get<CustomQuestionCategory[]>(STORAGE_KEYS.CUSTOM_CATEGORIES) || [];
  
  const index = categories.findIndex(c => c.id === categoryId);
  if (index === -1) return false;
  
  categories.splice(index, 1);
  storage.set(STORAGE_KEYS.CUSTOM_CATEGORIES, categories);
  
  return true;
}

// Toggle category active status
export function toggleCustomCategory(categoryId: string): CustomQuestionCategory | null {
  const categories = storage.get<CustomQuestionCategory[]>(STORAGE_KEYS.CUSTOM_CATEGORIES) || [];
  
  const index = categories.findIndex(c => c.id === categoryId);
  if (index === -1) return null;
  
  categories[index].isActive = !categories[index].isActive;
  storage.set(STORAGE_KEYS.CUSTOM_CATEGORIES, categories);
  
  return categories[index];
}

// ============================================================================
// ROUND CONFIG TEMPLATE FUNCTIONS (Professional+)
// ============================================================================

// Create template from round configs
export function createRoundTemplate(
  tenantId: string,
  templateData: Omit<RoundConfigTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>
): RoundConfigTemplate {
  const templates = storage.get<RoundConfigTemplate[]>(STORAGE_KEYS.ROUND_CONFIG_TEMPLATES) || [];
  
  const newTemplate: RoundConfigTemplate = {
    ...templateData,
    id: `tpl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    usageCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  templates.push(newTemplate);
  storage.set(STORAGE_KEYS.ROUND_CONFIG_TEMPLATES, templates);
  
  return newTemplate;
}

// Get all templates for a tenant (including public templates)
export function getRoundTemplates(tenantId: string, includePublic: boolean = true): RoundConfigTemplate[] {
  const templates = storage.get<RoundConfigTemplate[]>(STORAGE_KEYS.ROUND_CONFIG_TEMPLATES) || [];
  
  let filtered = templates.filter(t => t.tenantId === tenantId);
  
  if (includePublic) {
    const publicTemplates = templates.filter(t => t.isPublic && t.tenantId !== tenantId);
    filtered = [...filtered, ...publicTemplates];
  }
  
  return filtered.sort((a, b) => {
    // Sort by usage count (popular first), then by rating
    if (b.usageCount !== a.usageCount) {
      return b.usageCount - a.usageCount;
    }
    return (b.rating || 0) - (a.rating || 0);
  });
}

// Get template by ID
export function getRoundTemplate(templateId: string): RoundConfigTemplate | null {
  const templates = storage.get<RoundConfigTemplate[]>(STORAGE_KEYS.ROUND_CONFIG_TEMPLATES) || [];
  return templates.find(t => t.id === templateId) || null;
}

// Apply template to tournament (convert to RoundQuestionConfig array)
export function applyRoundTemplate(templateId: string): RoundQuestionConfig[] {
  const template = getRoundTemplate(templateId);
  if (!template) return [];
  
  // Increment usage count
  const templates = storage.get<RoundConfigTemplate[]>(STORAGE_KEYS.ROUND_CONFIG_TEMPLATES) || [];
  const index = templates.findIndex(t => t.id === templateId);
  if (index !== -1) {
    templates[index].usageCount++;
    storage.set(STORAGE_KEYS.ROUND_CONFIG_TEMPLATES, templates);
  }
  
  // Convert template configs to full RoundQuestionConfig objects
  return template.roundConfigs.map((config, index) => ({
    ...config,
    roundNumber: index + 1,
    roundName: config.roundName || getRoundNameFromNumber(index + 1, template.numberOfRounds)
  }));
}

// Helper to get round name from number
function getRoundNameFromNumber(roundNumber: number, totalRounds: number): string {
  const remaining = totalRounds - roundNumber + 1;
  
  if (remaining === 1) return 'Finals';
  if (remaining === 2) return 'Semi Finals';
  if (remaining === 3) return 'Quarter Finals';
  if (remaining === 4) return 'Round of 16';
  
  return `Round ${roundNumber}`;
}

// Update template
export function updateRoundTemplate(
  templateId: string,
  updates: Partial<Omit<RoundConfigTemplate, 'id' | 'tenantId' | 'createdAt' | 'createdBy' | 'usageCount'>>
): RoundConfigTemplate | null {
  const templates = storage.get<RoundConfigTemplate[]>(STORAGE_KEYS.ROUND_CONFIG_TEMPLATES) || [];
  
  const index = templates.findIndex(t => t.id === templateId);
  if (index === -1) return null;
  
  templates[index] = {
    ...templates[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  storage.set(STORAGE_KEYS.ROUND_CONFIG_TEMPLATES, templates);
  return templates[index];
}

// Rate template
export function rateRoundTemplate(templateId: string, rating: number): RoundConfigTemplate | null {
  if (rating < 1 || rating > 5) return null;
  
  const templates = storage.get<RoundConfigTemplate[]>(STORAGE_KEYS.ROUND_CONFIG_TEMPLATES) || [];
  
  const index = templates.findIndex(t => t.id === templateId);
  if (index === -1) return null;
  
  // Simple average rating (in production, track individual ratings)
  const currentRating = templates[index].rating || 0;
  const usageCount = templates[index].usageCount;
  const newRating = usageCount > 0 
    ? (currentRating * usageCount + rating) / (usageCount + 1)
    : rating;
  
  templates[index].rating = Number(newRating.toFixed(2));
  storage.set(STORAGE_KEYS.ROUND_CONFIG_TEMPLATES, templates);
  
  return templates[index];
}

// Delete template
export function deleteRoundTemplate(templateId: string): boolean {
  const templates = storage.get<RoundConfigTemplate[]>(STORAGE_KEYS.ROUND_CONFIG_TEMPLATES) || [];
  
  const index = templates.findIndex(t => t.id === templateId);
  if (index === -1) return false;
  
  templates.splice(index, 1);
  storage.set(STORAGE_KEYS.ROUND_CONFIG_TEMPLATES, templates);
  
  return true;
}

// Clone template (create a copy for customization)
export function cloneRoundTemplate(templateId: string, tenantId: string, newName?: string): RoundConfigTemplate | null {
  const original = getRoundTemplate(templateId);
  if (!original) return null;
  
  const cloned = createRoundTemplate(tenantId, {
    name: newName || `${original.name} (Copy)`,
    description: original.description,
    templateType: 'custom',
    isPublic: false,
    numberOfRounds: original.numberOfRounds,
    roundConfigs: original.roundConfigs,
    createdBy: original.createdBy
  });
  
  return cloned;
}

// ============================================================================
// QUESTION POOL VALIDATION FUNCTIONS (Professional+)
// ============================================================================

// Validate question pool against round configurations
export function validateQuestionPool(
  tenantId: string,
  roundConfigs: RoundQuestionConfig[]
): QuestionPoolValidation {
  const questions = storage.get<Question[]>(STORAGE_KEYS.QUESTIONS) || [];
  const tenantQuestions = questions.filter(q => q.tenantId === tenantId);
  
  // Calculate total questions needed
  const totalQuestionsNeeded = roundConfigs.reduce((sum, round) => sum + round.totalQuestions, 0);
  const totalQuestionsAvailable = tenantQuestions.length;
  
  // Build category breakdown
  const categoryNeeds = new Map<string, { 
    category: QuestionCategoryType; 
    customCategoryId?: string;
    needed: number; 
    easy?: number; 
    medium?: number; 
    hard?: number;
  }>();
  
  // Calculate needs per category
  roundConfigs.forEach(round => {
    round.categoryDistribution.forEach(dist => {
      const key = dist.customCategoryId || dist.category;
      const existing = categoryNeeds.get(key) || { 
        category: dist.category, 
        customCategoryId: dist.customCategoryId,
        needed: 0,
        easy: 0,
        medium: 0,
        hard: 0
      };
      
      existing.needed += dist.questionCount;
      
      if (dist.difficulty === 'easy') existing.easy! += dist.questionCount;
      else if (dist.difficulty === 'medium') existing.medium! += dist.questionCount;
      else if (dist.difficulty === 'hard') existing.hard! += dist.questionCount;
      else {
        // No specific difficulty - distribute evenly
        const perDiff = Math.ceil(dist.questionCount / 3);
        existing.easy! += perDiff;
        existing.medium! += perDiff;
        existing.hard! += perDiff;
      }
      
      categoryNeeds.set(key, existing);
    });
  });
  
  // Check availability per category
  const categoryBreakdown = Array.from(categoryNeeds.entries()).map(([key, needs]) => {
    const categoryQuestions = tenantQuestions.filter(q => {
      if (needs.customCategoryId) {
        return q.customCategoryId === needs.customCategoryId;
      }
      return q.category === needs.category;
    });
    
    const available = categoryQuestions.length;
    const easyAvailable = categoryQuestions.filter(q => q.difficulty === 'easy').length;
    const mediumAvailable = categoryQuestions.filter(q => q.difficulty === 'medium').length;
    const hardAvailable = categoryQuestions.filter(q => q.difficulty === 'hard').length;
    
    return {
      category: needs.category,
      customCategoryId: needs.customCategoryId,
      needed: needs.needed,
      available,
      sufficient: available >= needs.needed,
      difficulty: {
        easy: { needed: needs.easy || 0, available: easyAvailable },
        medium: { needed: needs.medium || 0, available: mediumAvailable },
        hard: { needed: needs.hard || 0, available: hardAvailable }
      }
    };
  });
  
  // Generate warnings and errors
  const warnings: string[] = [];
  const errors: string[] = [];
  
  categoryBreakdown.forEach(cat => {
    const categoryName = cat.customCategoryId 
      ? getCustomCategory(cat.customCategoryId)?.name || 'Custom Category'
      : cat.category;
    
    if (!cat.sufficient) {
      errors.push(
        `Insufficient questions for ${categoryName}: Need ${cat.needed}, have ${cat.available}`
      );
    }
    
    // Check difficulty levels
    if (cat.difficulty.easy.available < cat.difficulty.easy.needed) {
      warnings.push(
        `Low easy questions for ${categoryName}: Need ${cat.difficulty.easy.needed}, have ${cat.difficulty.easy.available}`
      );
    }
    if (cat.difficulty.medium.available < cat.difficulty.medium.needed) {
      warnings.push(
        `Low medium questions for ${categoryName}: Need ${cat.difficulty.medium.needed}, have ${cat.difficulty.medium.available}`
      );
    }
    if (cat.difficulty.hard.available < cat.difficulty.hard.needed) {
      warnings.push(
        `Low hard questions for ${categoryName}: Need ${cat.difficulty.hard.needed}, have ${cat.difficulty.hard.available}`
      );
    }
  });
  
  // Overall sufficiency check
  if (totalQuestionsAvailable < totalQuestionsNeeded) {
    errors.push(
      `Insufficient total questions: Need ${totalQuestionsNeeded}, have ${totalQuestionsAvailable}`
    );
  }
  
  return {
    isValid: errors.length === 0,
    totalQuestionsNeeded,
    totalQuestionsAvailable,
    categoryBreakdown,
    warnings,
    errors
  };
}

// Quick check if tenant has enough questions
export function hasEnoughQuestions(tenantId: string, requiredCount: number): boolean {
  const questions = storage.get<Question[]>(STORAGE_KEYS.QUESTIONS) || [];
  const tenantQuestions = questions.filter(q => q.tenantId === tenantId);
  return tenantQuestions.length >= requiredCount;
}

// ============================================================================
// AI QUESTION GENERATION FUNCTIONS
// ============================================================================

// Get or create AI generation config for tenant
export function getAIGenerationConfig(tenantId: string): AIGenerationConfig {
  const configs = storage.get<AIGenerationConfig[]>(STORAGE_KEYS.AI_GENERATION_CONFIGS) || [];
  let config = configs.find(c => c.tenantId === tenantId);
  
  if (!config) {
    const tenant = mockTenants.find(t => t.id === tenantId);
    const plan = tenant ? getTenantPlan(tenantId) : null;
    
    // Set limits based on plan
    let monthlyLimit = 50; // Default/Free
    if (plan) {
      if (plan.name === 'pro') monthlyLimit = 100;
      else if (plan.name === 'professional') monthlyLimit = 500;
      else if (plan.name === 'enterprise') monthlyLimit = -1; // Unlimited
    }
    
    config = {
      tenantId,
      planId: plan?.id || 'plan-free',
      monthlyQuestionLimit: monthlyLimit,
      questionsUsedThisMonth: 0,
      resetDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
      defaultModel: 'gpt-4',
      enabledModels: ['gpt-4', 'gpt-3.5-turbo'],
      requireManualApproval: true,
      autoApproveAfterReview: false,
      duplicateDetectionEnabled: true,
      similarityThreshold: 0.85,
      totalQuestionsGenerated: 0,
      totalQuestionsApproved: 0,
      totalQuestionsRejected: 0,
      averageApprovalTime: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    configs.push(config);
    storage.set(STORAGE_KEYS.AI_GENERATION_CONFIGS, configs);
  }
  
  return config;
}

// Check if tenant can generate more AI questions this month
export function canGenerateAIQuestions(tenantId: string, count: number): { allowed: boolean; reason?: string } {
  const config = getAIGenerationConfig(tenantId);
  
  // Check if unlimited
  if (config.monthlyQuestionLimit === -1) {
    return { allowed: true };
  }
  
  // Check if reset needed
  if (new Date(config.resetDate) < new Date()) {
    config.questionsUsedThisMonth = 0;
    config.resetDate = new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString();
    const configs = storage.get<AIGenerationConfig[]>(STORAGE_KEYS.AI_GENERATION_CONFIGS) || [];
    const index = configs.findIndex(c => c.tenantId === tenantId);
    if (index !== -1) {
      configs[index] = config;
      storage.set(STORAGE_KEYS.AI_GENERATION_CONFIGS, configs);
    }
  }
  
  // Check limit
  const remaining = config.monthlyQuestionLimit - config.questionsUsedThisMonth;
  if (remaining < count) {
    return { 
      allowed: false, 
      reason: `Monthly limit reached. ${remaining} questions remaining this month. Resets on ${new Date(config.resetDate).toLocaleDateString()}`
    };
  }
  
  return { allowed: true };
}

// Create AI generation request
export function createAIGenerationRequest(
  tenantId: string,
  userId: string,
  params: Omit<AIGenerationRequest, 'id' | 'tenantId' | 'requestedBy' | 'status' | 'progress' | 'generatedQuestionIds' | 'requestedAt'>
): AIGenerationRequest | { error: string } {
  const check = canGenerateAIQuestions(tenantId, params.count);
  if (!check.allowed) {
    return { error: check.reason || 'Cannot generate questions' };
  }
  
  const request: AIGenerationRequest = {
    id: `ai-req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    tenantId,
    requestedBy: userId,
    ...params,
    status: 'pending',
    progress: 0,
    generatedQuestionIds: [],
    requestedAt: new Date().toISOString()
  };
  
  const requests = storage.get<AIGenerationRequest[]>(STORAGE_KEYS.AI_GENERATION_REQUESTS) || [];
  requests.push(request);
  storage.set(STORAGE_KEYS.AI_GENERATION_REQUESTS, requests);
  
  return request;
}

// Get AI generation requests for tenant
export function getAIGenerationRequests(tenantId: string): AIGenerationRequest[] {
  const requests = storage.get<AIGenerationRequest[]>(STORAGE_KEYS.AI_GENERATION_REQUESTS) || [];
  return requests.filter(r => r.tenantId === tenantId).sort((a, b) => 
    new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
  );
}

// ============================================================================
// QUESTION LIFECYCLE MANAGEMENT FUNCTIONS
// ============================================================================

// Update question status with logging
export function updateQuestionStatus(
  questionId: string,
  newStatus: QuestionStatus,
  context: {
    reason: string;
    userId?: string;
    tournamentId?: string;
    metadata?: any;
  }
): Question | null {
  const questions = storage.get<Question[]>(STORAGE_KEYS.QUESTIONS) || [];
  const index = questions.findIndex(q => q.id === questionId);
  
  if (index === -1) return null;
  
  const oldStatus = questions[index].status;
  questions[index].status = newStatus;
  questions[index].updatedAt = new Date().toISOString();
  
  // Update related fields based on status
  if (newStatus === QuestionStatus.TOURNAMENT_RESERVED || newStatus === QuestionStatus.TOURNAMENT_ACTIVE) {
    questions[index].tournamentId = context.tournamentId;
  }
  
  if (newStatus === QuestionStatus.RECENT_TOURNAMENT) {
    questions[index].usageCount++;
    questions[index].lastUsedDate = new Date().toISOString();
    questions[index].tournamentDate = new Date().toISOString();
  }
  
  storage.set(STORAGE_KEYS.QUESTIONS, questions);
  
  // Log the change
  logQuestionLifecycle(questionId, oldStatus, newStatus, context);
  
  return questions[index];
}

// Log question lifecycle event
function logQuestionLifecycle(
  questionId: string,
  fromStatus: QuestionStatus,
  toStatus: QuestionStatus,
  context: {
    reason: string;
    userId?: string;
    tournamentId?: string;
    metadata?: any;
  }
): void {
  const question = storage.get<Question[]>(STORAGE_KEYS.QUESTIONS)?.find(q => q.id === questionId);
  if (!question) return;
  
  const log: QuestionLifecycleLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    questionId,
    tenantId: question.tenantId,
    fromStatus,
    toStatus,
    reason: context.reason,
    tournamentId: context.tournamentId,
    triggeredBy: context.userId ? 'user' : 'system',
    userId: context.userId,
    metadata: context.metadata,
    createdAt: new Date().toISOString()
  };
  
  const logs = storage.get<QuestionLifecycleLog[]>(STORAGE_KEYS.QUESTION_LIFECYCLE_LOGS) || [];
  logs.push(log);
  storage.set(STORAGE_KEYS.QUESTION_LIFECYCLE_LOGS, logs);
}

// Auto-rotate questions after tournament completion
export async function handleTournamentCompletion(tournamentId: string): Promise<void> {
  const tournaments = storage.get<Tournament[]>(STORAGE_KEYS.TOURNAMENTS) || [];
  const tournament = tournaments.find(t => t.id === tournamentId);
  
  if (!tournament) return;
  
  const questions = storage.get<Question[]>(STORAGE_KEYS.QUESTIONS) || [];
  const config = storage.get<TournamentQuestionConfig[]>(STORAGE_KEYS.TOURNAMENT_QUESTION_CONFIGS)?.find(
    c => c.tournamentId === tournamentId
  );
  
  // Get release mode (default to immediate)
  const releaseMode = config?.practiceReleaseMode || 'immediate';
  const delayHours = config?.delayHours || 0;
  
  // 1. Move current tournament questions to RECENT_TOURNAMENT
  const tournamentQuestions = questions.filter(q => q.tournamentId === tournamentId);
  
  for (const question of tournamentQuestions) {
    if (releaseMode === 'immediate') {
      updateQuestionStatus(question.id, QuestionStatus.RECENT_TOURNAMENT, {
        reason: 'Tournament completed - auto-rotation (immediate)',
        tournamentId,
        metadata: { releaseMode, completedAt: tournament.endDate }
      });
    } else if (releaseMode === 'delayed') {
      const releaseDate = new Date();
      releaseDate.setHours(releaseDate.getHours() + delayHours);
      
      // Keep as TOURNAMENT_ACTIVE but set availability date
      const q = questions.find(qu => qu.id === question.id);
      if (q) {
        q.availableForPracticeDate = releaseDate.toISOString();
        q.updatedAt = new Date().toISOString();
      }
      
      logQuestionLifecycle(question.id, question.status, QuestionStatus.TOURNAMENT_ACTIVE, {
        reason: `Tournament completed - delayed release (${delayHours}h)`,
        tournamentId,
        metadata: { releaseMode, delayHours, releaseDate: releaseDate.toISOString() }
      });
    }
  }
  
  // 2. Move previous RECENT_TOURNAMENT to QUESTION_POOL
  const previousRecentQuestions = questions.filter(q => 
    q.status === QuestionStatus.RECENT_TOURNAMENT &&
    q.tournamentId !== tournamentId &&
    q.tenantId === tournament.tenantId
  );
  
  for (const question of previousRecentQuestions) {
    updateQuestionStatus(question.id, QuestionStatus.QUESTION_POOL, {
      reason: 'Auto-rotation - moved to question pool',
      metadata: { previousTournamentId: question.tournamentId }
    });
  }
  
  // 3. Save updated questions
  storage.set(STORAGE_KEYS.QUESTIONS, questions);
  
  // 4. Update config if exists
  if (config) {
    config.releasedAt = releaseMode === 'immediate' ? new Date().toISOString() : undefined;
    const configs = storage.get<TournamentQuestionConfig[]>(STORAGE_KEYS.TOURNAMENT_QUESTION_CONFIGS) || [];
    const configIndex = configs.findIndex(c => c.tournamentId === tournamentId);
    if (configIndex !== -1) {
      configs[configIndex] = config;
      storage.set(STORAGE_KEYS.TOURNAMENT_QUESTION_CONFIGS, configs);
    }
  }
}

// Get questions available for practice (respects delayed release)
export function getQuestionsForPractice(
  tenantId: string,
  options: {
    source?: 'pool' | 'recent' | 'both';
    category?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    excludeQuestionIds?: string[];
  } = {}
): Question[] {
  const questions = storage.get<Question[]>(STORAGE_KEYS.QUESTIONS) || [];
  const now = new Date();
  
  let filtered = questions.filter(q => q.tenantId === tenantId);
  
  // Filter by source
  if (options.source === 'pool') {
    filtered = filtered.filter(q => q.status === QuestionStatus.QUESTION_POOL);
  } else if (options.source === 'recent') {
    filtered = filtered.filter(q => {
      if (q.status === QuestionStatus.RECENT_TOURNAMENT) {
        // Check if available (no delay or delay passed)
        if (!q.availableForPracticeDate) return true;
        return new Date(q.availableForPracticeDate) <= now;
      }
      return false;
    });
  } else {
    // Both pool and recent
    filtered = filtered.filter(q => {
      if (q.status === QuestionStatus.QUESTION_POOL) return true;
      if (q.status === QuestionStatus.RECENT_TOURNAMENT) {
        if (!q.availableForPracticeDate) return true;
        return new Date(q.availableForPracticeDate) <= now;
      }
      return false;
    });
  }
  
  // Filter by category
  if (options.category) {
    filtered = filtered.filter(q => q.category === options.category);
  }
  
  // Filter by difficulty
  if (options.difficulty) {
    filtered = filtered.filter(q => q.difficulty === options.difficulty);
  }
  
  // Exclude specific questions
  if (options.excludeQuestionIds) {
    filtered = filtered.filter(q => !options.excludeQuestionIds!.includes(q.id));
  }
  
  return filtered;
}

// Check if recent tournament questions are available yet
export function getRecentTournamentQuestionsAvailability(tenantId: string): {
  available: boolean;
  availableAt?: string;
  count: number;
  oldTournamentQuestions?: { tournamentId: string; count: number }[];
} {
  const questions = storage.get<Question[]>(STORAGE_KEYS.QUESTIONS) || [];
  const recentQuestions = questions.filter(q => 
    q.tenantId === tenantId && q.status === QuestionStatus.RECENT_TOURNAMENT
  );
  
  if (recentQuestions.length === 0) {
    // Check for old tournament questions that can be used
    const oldTournamentQuestions = questions.filter(q =>
      q.tenantId === tenantId && q.status === QuestionStatus.QUESTION_POOL && q.tournamentId
    );
    
    const tournamentGroups = new Map<string, number>();
    oldTournamentQuestions.forEach(q => {
      if (q.tournamentId) {
        tournamentGroups.set(q.tournamentId, (tournamentGroups.get(q.tournamentId) || 0) + 1);
      }
    });
    
    return {
      available: false,
      count: 0,
      oldTournamentQuestions: Array.from(tournamentGroups.entries()).map(([id, count]) => ({
        tournamentId: id,
        count
      }))
    };
  }
  
  // Check if any are delayed
  const delayed = recentQuestions.filter(q => q.availableForPracticeDate);
  if (delayed.length === 0) {
    return { available: true, count: recentQuestions.length };
  }
  
  // Find earliest availability
  const earliest = delayed.reduce((min, q) => {
    const date = new Date(q.availableForPracticeDate!);
    return date < min ? date : min;
  }, new Date(delayed[0].availableForPracticeDate!));
  
  const now = new Date();
  if (earliest <= now) {
    return { available: true, count: recentQuestions.length };
  }
  
  return {
    available: false,
    availableAt: earliest.toISOString(),
    count: recentQuestions.length
  };
}

// Validate tournament has minimum questions per category
export function validateTournamentQuestions(tournamentId: string): {
  valid: boolean;
  errors: string[];
  categoryCounts: { category: string; count: number; minimum: number }[];
} {
  const config = storage.get<TournamentQuestionConfig[]>(STORAGE_KEYS.TOURNAMENT_QUESTION_CONFIGS)?.find(
    c => c.tournamentId === tournamentId
  );
  
  if (!config) {
    return { valid: false, errors: ['Tournament question configuration not found'], categoryCounts: [] };
  }
  
  const questions = storage.get<Question[]>(STORAGE_KEYS.QUESTIONS) || [];
  const tournamentQuestions = questions.filter(q => config.selectedQuestionIds.includes(q.id));
  
  const minimum = config.minimumQuestionsPerCategory || 10;
  const categoryCounts = new Map<string, number>();
  
  // Count questions per category
  tournamentQuestions.forEach(q => {
    categoryCounts.set(q.category, (categoryCounts.get(q.category) || 0) + 1);
  });
  
  const errors: string[] = [];
  const results: { category: string; count: number; minimum: number }[] = [];
  
  categoryCounts.forEach((count, category) => {
    results.push({ category, count, minimum });
    if (count < minimum) {
      errors.push(`Category "${category}" has only ${count} questions (minimum: ${minimum})`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors,
    categoryCounts: results
  };
}

// ============================================================================
// BONUS QUESTIONS FUNCTIONS
// ============================================================================

// Get or create bonus question config for tenant
export function getBonusQuestionConfig(tenantId: string): BonusQuestionConfig {
  const configs = storage.get<BonusQuestionConfig[]>(STORAGE_KEYS.BONUS_QUESTION_CONFIGS) || [];
  let config = configs.find(c => c.tenantId === tenantId);
  
  if (!config) {
    config = {
      tenantId,
      enabled: true,
      
      // Multi-tier unlock system
      unlockTiers: [
        {
          tier: 1,
          name: 'Bronze',
          requirePracticeCount: 5,
          requireAccuracy: 60,
          requireStreak: 2,
          questionsLimit: 5,
          retwistQuality: 'basic',
          features: ['Direct Use', 'Basic Retwist']
        },
        {
          tier: 2,
          name: 'Silver',
          requirePracticeCount: 15,
          requireAccuracy: 70,
          requireStreak: 5,
          questionsLimit: 10,
          retwistQuality: 'standard',
          features: ['Direct Use', 'Standard Retwist', 'Difficulty Adjustment']
        },
        {
          tier: 3,
          name: 'Gold',
          requirePracticeCount: 30,
          requireAccuracy: 80,
          requireStreak: 10,
          questionsLimit: 15,
          retwistQuality: 'advanced',
          features: ['All Retwist Options', 'Multiple Variations', 'Category Change']
        },
        {
          tier: 4,
          name: 'Platinum',
          requirePracticeCount: 50,
          requireAccuracy: 85,
          requireStreak: 15,
          questionsLimit: 20,
          retwistQuality: 'expert',
          features: ['Expert AI Retwist', 'Unlimited Variations', 'Context Expansion']
        },
        {
          tier: 5,
          name: 'Diamond',
          requirePracticeCount: 100,
          requireAccuracy: 90,
          requireStreak: 30,
          questionsLimit: 30,
          retwistQuality: 'expert',
          features: ['All Features', 'Priority Processing', 'Custom AI Prompts']
        }
      ],
      
      allowDirectUse: true,
      allowRetwist: true,
      allowDifficultyAdjustment: true,
      allowCategoryChange: true,
      allowMultipleVariations: true,
      
      autoApproveDirectUse: true,
      requireApprovalAfterRetwist: true,
      requireQualityScore: 70,
      
      maxQuestionsPerTournament: 20,
      maxRetwistsPerQuestion: 3,
      cooldownPeriod: 30,
      
      eligibleStatuses: [
        QuestionStatus.QUESTION_POOL,
        QuestionStatus.RECENT_TOURNAMENT
      ],
      minQuestionRating: 3.0,
      minSuccessRate: 50,
      excludeRecentlyUsed: true,
      excludeRecentlyUsedDays: 14,
      
      enableAchievements: true,
      enableLeaderboard: true,
      pointsPerBonusQuestion: 50,
      
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    configs.push(config);
    storage.set(STORAGE_KEYS.BONUS_QUESTION_CONFIGS, configs);
  }
  
  return config;
}

// Get user's bonus eligibility and tier
export function getUserBonusEligibility(userId: string, tenantId: string): {
  eligible: boolean;
  currentTier: number;
  tierName: string;
  questionsLimit: number;
  questionsUsed: number;
  questionsRemaining: number;
  nextTier?: {
    tier: number;
    name: string;
    requirements: {
      practiceNeeded: number;
      accuracyNeeded: number;
      streakNeeded: number;
    };
  };
  achievements: string[];
} {
  const config = getBonusQuestionConfig(tenantId);
  
  if (!config.enabled) {
    return {
      eligible: false,
      currentTier: 0,
      tierName: 'None',
      questionsLimit: 0,
      questionsUsed: 0,
      questionsRemaining: 0,
      achievements: []
    };
  }
  
  // Get user analytics (mock data for now)
  const analytics = getUserPracticeAnalytics(userId, tenantId);
  
  // Determine tier based on performance
  let currentTier = 0;
  let tierConfig = config.unlockTiers[0];
  
  for (const tier of config.unlockTiers) {
    if (
      analytics.totalPracticeSessions >= tier.requirePracticeCount &&
      analytics.averageAccuracy >= tier.requireAccuracy &&
      analytics.currentStreak >= tier.requireStreak
    ) {
      currentTier = tier.tier;
      tierConfig = tier;
    } else {
      break;
    }
  }
  
  const eligible = currentTier > 0;
  const questionsUsed = analytics.bonusQuestionsUsedCount;
  const questionsLimit = eligible ? tierConfig.questionsLimit : 0;
  
  // Find next tier
  const nextTierIndex = config.unlockTiers.findIndex(t => t.tier === currentTier + 1);
  const nextTier = nextTierIndex >= 0 ? config.unlockTiers[nextTierIndex] : undefined;
  
  return {
    eligible,
    currentTier,
    tierName: eligible ? tierConfig.name : 'None',
    questionsLimit,
    questionsUsed,
    questionsRemaining: Math.max(0, questionsLimit - questionsUsed),
    nextTier: nextTier ? {
      tier: nextTier.tier,
      name: nextTier.name,
      requirements: {
        practiceNeeded: Math.max(0, nextTier.requirePracticeCount - analytics.totalPracticeSessions),
        accuracyNeeded: Math.max(0, nextTier.requireAccuracy - analytics.averageAccuracy),
        streakNeeded: Math.max(0, nextTier.requireStreak - analytics.currentStreak)
      }
    } : undefined,
    achievements: analytics.achievements.map(a => a.name)
  };
}

// Get user practice analytics (mock for now - would be tracked in real app)
export function getUserPracticeAnalytics(tenantId: string, userId: string): UserPracticeAnalytics {
  // In production, this would fetch from database
  // For now, return mock data based on user activity
  return {
    userId,
    tenantId,
    totalPracticeSessions: 25,
    totalQuestionsAnswered: 500,
    totalCorrectAnswers: 400,
    averageAccuracy: 80,
    currentStreak: 7,
    longestStreak: 15,
    categoryPerformance: [],
    bonusQuestionsUnlocked: true,
    bonusQuestionsUsedCount: 3,
    bonusQuestionsLimit: 15,
    lastBonusUnlock: new Date().toISOString(),
    achievements: [],
    totalPracticeTime: 600,
    lastPracticeDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

// Get eligible questions for bonus selection (ENHANCED with quality filtering)
export function getEligibleBonusQuestions(
  tenantId: string,
  userId: string,
  options: {
    category?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    minRating?: number;
    minSuccessRate?: number;
    excludeQuestionIds?: string[];
    sortBy?: 'usage' | 'rating' | 'performance' | 'random';
    limit?: number;
  } = {}
): Question[] {
  const config = getBonusQuestionConfig(tenantId);
  
  if (!config.enabled) {
    return [];
  }
  
  // Check user eligibility
  const eligibility = getUserBonusEligibility(userId, tenantId);
  if (!eligibility.eligible) {
    return [];
  }
  
  const questions = storage.get<Question[]>(STORAGE_KEYS.QUESTIONS) || [];
  
  let eligible = questions.filter(q => 
    q.tenantId === tenantId && 
    config.eligibleStatuses.includes(q.status)
  );
  
  // Filter by category
  if (options.category) {
    eligible = eligible.filter(q => q.category === options.category);
  }
  
  // Filter by difficulty
  if (options.difficulty) {
    eligible = eligible.filter(q => q.difficulty === options.difficulty);
  }
  
  // Exclude recently used questions (cooldown period)
  if (config.excludeRecentlyUsed) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - config.excludeRecentlyUsedDays);
    
    eligible = eligible.filter(q => {
      if (!q.lastUsedDate) return true;
      return new Date(q.lastUsedDate) < cutoffDate;
    });
  }
  
  // Filter by quality metrics (mock - in production would use QuestionPerformance data)
  const minRating = options.minRating ?? config.minQuestionRating;
  const minSuccessRate = options.minSuccessRate ?? config.minSuccessRate;
  
  eligible = eligible.filter(q => {
    // Mock quality check - in production would check actual performance data
    const mockRating = 3.5 + Math.random() * 1.5; // 3.5-5.0
    const mockSuccessRate = 60 + Math.random() * 40; // 60-100%
    
    return mockRating >= minRating && mockSuccessRate >= minSuccessRate;
  });
  
  // Exclude specific questions
  if (options.excludeQuestionIds) {
    eligible = eligible.filter(q => !options.excludeQuestionIds!.includes(q.id));
  }
  
  // Sort questions
  const sortBy = options.sortBy || 'usage';
  
  switch (sortBy) {
    case 'usage':
      // Prefer less used questions
      eligible.sort((a, b) => a.usageCount - b.usageCount);
      break;
    case 'rating':
      // Prefer higher rated questions (mock)
      eligible.sort(() => Math.random() - 0.5);
      break;
    case 'performance':
      // Prefer better performing questions (mock)
      eligible.sort(() => Math.random() - 0.5);
      break;
    case 'random':
      // Random shuffle
      eligible.sort(() => Math.random() - 0.5);
      break;
  }
  
  // Apply limit
  if (options.limit && options.limit > 0) {
    eligible = eligible.slice(0, options.limit);
  }
  
  return eligible;
}

// Create bonus question request (ENHANCED)
export function createBonusQuestionRequest(
  tenantId: string,
  userId: string,
  params: {
    sourceQuestionIds: string[];
    tournamentId?: string;
    useDirectly: boolean;
    retwistStrategy?: 'synonym' | 'paraphrase' | 'perspective' | 'context' | 'creative' | 'hybrid';
    retwistQuality?: 'basic' | 'standard' | 'advanced' | 'expert';
    generateVariations?: number;
    retwistPrompt?: string;
    preserveDifficulty?: boolean;
    targetDifficulty?: 'easy' | 'medium' | 'hard';
    preserveCategory?: boolean;
    targetCategory?: string;
    addBiblicalContext?: boolean;
    expandExplanations?: boolean;
  }
): BonusQuestionRequest | { error: string } {
  const config = getBonusQuestionConfig(tenantId);
  
  if (!config.enabled) {
    return { error: 'Bonus questions feature is not enabled for this tenant' };
  }
  
  // Check user eligibility
  const eligibility = getUserBonusEligibility(userId, tenantId);
  if (!eligibility.eligible) {
    return { error: 'You have not unlocked bonus questions yet. Keep practicing!' };
  }
  
  if (params.sourceQuestionIds.length === 0) {
    return { error: 'No questions selected' };
  }
  
  if (params.sourceQuestionIds.length > eligibility.questionsRemaining) {
    return { error: `You can only select ${eligibility.questionsRemaining} more bonus questions (${eligibility.questionsUsed}/${eligibility.questionsLimit} used)` };
  }
  
  if (params.sourceQuestionIds.length > config.maxQuestionsPerTournament) {
    return { error: `Maximum ${config.maxQuestionsPerTournament} bonus questions allowed per tournament` };
  }
  
  if (!params.useDirectly && !config.allowRetwist) {
    return { error: 'Question retwisting is not allowed for this tenant' };
  }
  
  if (params.useDirectly && !config.allowDirectUse) {
    return { error: 'Direct use of questions is not allowed for this tenant' };
  }
  
  // Validate tier-based features
  const tierConfig = config.unlockTiers.find(t => t.tier === eligibility.currentTier);
  if (!tierConfig) {
    return { error: 'Invalid tier configuration' };
  }
  
  const variations = params.generateVariations || 1;
  if (variations > 1 && !config.allowMultipleVariations) {
    return { error: 'Multiple variations not allowed for your tier' };
  }
  
  if (variations > eligibility.currentTier) {
    return { error: `Your tier (${tierConfig.name}) allows up to ${eligibility.currentTier} variation(s) per question` };
  }
  
  // Count questions by category
  const questions = storage.get<Question[]>(STORAGE_KEYS.QUESTIONS) || [];
  const selectedQuestions = questions.filter(q => params.sourceQuestionIds.includes(q.id));
  
  const categoryDistribution = new Map<string, number>();
  selectedQuestions.forEach(q => {
    categoryDistribution.set(q.category, (categoryDistribution.get(q.category) || 0) + 1);
  });
  
  const request: BonusQuestionRequest = {
    id: `bonus-req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    tenantId,
    tournamentId: params.tournamentId,
    requestedBy: userId,
    userTier: eligibility.currentTier,
    sourceQuestionIds: params.sourceQuestionIds,
    categoryDistribution: Array.from(categoryDistribution.entries()).map(([category, count]) => ({
      category,
      count,
      targetDifficulty: params.targetDifficulty
    })),
    useDirectly: params.useDirectly,
    retwistStrategy: params.retwistStrategy || 'hybrid',
    retwistQuality: params.retwistQuality || tierConfig.retwistQuality,
    generateVariations: variations,
    retwistPrompt: params.retwistPrompt,
    preserveDifficulty: params.preserveDifficulty ?? true,
    targetDifficulty: params.targetDifficulty,
    preserveCategory: params.preserveCategory ?? true,
    targetCategory: params.targetCategory,
    addBiblicalContext: params.addBiblicalContext ?? false,
    expandExplanations: params.expandExplanations ?? false,
    generatedQuestionIds: [],
    originalQuestionMapping: [],
    status: params.useDirectly ? 'approved' : 'pending',
    progress: params.useDirectly ? 100 : 0,
    estimatedQualityScore: 0,
    similarityToOriginals: 0,
    requestedAt: new Date().toISOString()
  };
  
  // If using directly, create copies immediately
  if (params.useDirectly) {
    const copies: Question[] = [];
    
    selectedQuestions.forEach(original => {
      const copy: Question = {
        ...original,
        id: `bonus-q-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        status: config.autoApproveDirectUse ? QuestionStatus.TOURNAMENT_RESERVED : QuestionStatus.AI_PENDING_REVIEW,
        approvalStatus: config.autoApproveDirectUse ? QuestionApprovalStatus.APPROVED : QuestionApprovalStatus.PENDING,
        createdBy: userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        usageCount: 0,
        tags: [...(original.tags || []), 'bonus', 'direct-use', `tier-${eligibility.currentTier}`]
      };
      
      if (params.tournamentId) {
        copy.tournamentId = params.tournamentId;
      }
      
      copies.push(copy);
      request.generatedQuestionIds.push(copy.id);
      request.originalQuestionMapping.push({
        originalId: original.id,
        retwistedId: copy.id,
        variationNumber: 1,
        strategy: 'direct',
        qualityScore: 100
      });
    });
    
    // Save copies
    const allQuestions = storage.get<Question[]>(STORAGE_KEYS.QUESTIONS) || [];
    allQuestions.push(...copies);
    storage.set(STORAGE_KEYS.QUESTIONS, allQuestions);
    
    request.status = 'completed';
    request.estimatedQualityScore = 100;
    request.similarityToOriginals = 100;
    request.completedAt = new Date().toISOString();
  }
  
  // Save request
  const requests = storage.get<BonusQuestionRequest[]>(STORAGE_KEYS.BONUS_QUESTION_REQUESTS) || [];
  requests.push(request);
  storage.set(STORAGE_KEYS.BONUS_QUESTION_REQUESTS, requests);
  
  return request;
}

// Retwist questions using AI (ENHANCED with multiple strategies)
export async function retwistBonusQuestions(
  requestId: string
): Promise<{ success: boolean; error?: string; variations?: number }> {
  const requests = storage.get<BonusQuestionRequest[]>(STORAGE_KEYS.BONUS_QUESTION_REQUESTS) || [];
  const requestIndex = requests.findIndex(r => r.id === requestId);
  const request = requests[requestIndex];
  
  if (!request) {
    return { success: false, error: 'Request not found' };
  }
  
  if (request.useDirectly) {
    return { success: false, error: 'This request is set to use questions directly' };
  }
  
  request.status = 'analyzing';
  storage.set(STORAGE_KEYS.BONUS_QUESTION_REQUESTS, requests);
  
  try {
    const questions = storage.get<Question[]>(STORAGE_KEYS.QUESTIONS) || [];
    const sourceQuestions = questions.filter(q => request.sourceQuestionIds.includes(q.id));
    const retwisted: Question[] = [];
    let totalVariations = 0;
    
    request.status = 'retwisting';
    storage.set(STORAGE_KEYS.BONUS_QUESTION_REQUESTS, requests);
    
    for (let i = 0; i < sourceQuestions.length; i++) {
      const original = sourceQuestions[i];
      
      // Generate multiple variations per question
      const numVariations = request.generateVariations;
      
      for (let v = 1; v <= numVariations; v++) {
        // Simulate AI processing time
        await new Promise(resolve => setTimeout(resolve, 300));
        
        request.status = 'generating_variations';
        storage.set(STORAGE_KEYS.BONUS_QUESTION_REQUESTS, requests);
        
        // Generate variation using specified strategy
        const variation = generateAdvancedVariation(
          original, 
          request.retwistStrategy,
          request.retwistQuality,
          {
            addContext: request.addBiblicalContext,
            expandExplanation: request.expandExplanations,
            customPrompt: request.retwistPrompt,
            targetDifficulty: request.targetDifficulty,
            targetCategory: request.targetCategory
          }
        );
        
        const retwistedQuestion: Question = {
          ...original,
          id: `bonus-retwist-${Date.now()}-${i}-${v}-${Math.random().toString(36).substr(2, 9)}`,
          question: variation.question,
          options: variation.options,
          correctAnswer: variation.correctAnswer,
          status: QuestionStatus.AI_PENDING_REVIEW,
          approvalStatus: QuestionApprovalStatus.PENDING,
          aiGeneratedAt: new Date().toISOString(),
          aiModel: `bonus-retwist-${request.retwistQuality}`,
          aiPrompt: request.retwistPrompt || `Retwist using ${request.retwistStrategy} strategy`,
          createdBy: request.requestedBy,
          difficulty: request.preserveDifficulty ? original.difficulty : (variation.difficulty || original.difficulty),
          category: request.preserveCategory ? original.category : (variation.category || original.category),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          usageCount: 0,
          tags: [
            ...(original.tags || []), 
            'bonus', 
            'retwisted', 
            `tier-${request.userTier}`,
            `strategy-${request.retwistStrategy}`,
            `quality-${request.retwistQuality}`,
            `original:${original.id}`,
            `variation-${v}`
          ]
        };
        
        retwisted.push(retwistedQuestion);
        request.generatedQuestionIds.push(retwistedQuestion.id);
        request.originalQuestionMapping.push({
          originalId: original.id,
          retwistedId: retwistedQuestion.id,
          variationNumber: v,
          strategy: request.retwistStrategy,
          qualityScore: variation.qualityScore
        });
        
        totalVariations++;
        request.progress = Math.round((totalVariations / (sourceQuestions.length * numVariations)) * 100);
        storage.set(STORAGE_KEYS.BONUS_QUESTION_REQUESTS, requests);
      }
    }
    
    // Save retwisted questions
    questions.push(...retwisted);
    storage.set(STORAGE_KEYS.QUESTIONS, questions);
    
    // Calculate quality metrics
    const avgQuality = request.originalQuestionMapping.reduce((sum, m) => sum + m.qualityScore, 0) / request.originalQuestionMapping.length;
    const avgSimilarity = 75 - (request.retwistQuality === 'expert' ? 20 : request.retwistQuality === 'advanced' ? 15 : request.retwistQuality === 'standard' ? 10 : 5);
    
    request.status = 'awaiting_approval';
    request.progress = 100;
    request.estimatedQualityScore = Math.round(avgQuality);
    request.similarityToOriginals = avgSimilarity;
    storage.set(STORAGE_KEYS.BONUS_QUESTION_REQUESTS, requests);
    
    return { success: true, variations: totalVariations };
  } catch (error) {
    request.status = 'failed';
    request.error = error instanceof Error ? error.message : 'Unknown error';
    storage.set(STORAGE_KEYS.BONUS_QUESTION_REQUESTS, requests);
    
    return { success: false, error: request.error };
  }
}

// Generate advanced question variation with multiple strategies
function generateAdvancedVariation(
  original: Question,
  strategy: string,
  quality: string,
  options: {
    addContext?: boolean;
    expandExplanation?: boolean;
    customPrompt?: string;
    targetDifficulty?: 'easy' | 'medium' | 'hard';
    targetCategory?: string;
  }
): {
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  category?: string;
  qualityScore: number;
} {
  let question = original.question;
  let questionOptions = [...original.options];
  let correctAnswer = original.correctAnswer;
  let qualityScore = 70;
  
  // Apply strategy-specific transformations
  switch (strategy) {
    case 'synonym':
      question = applySynonymReplacement(question, quality);
      questionOptions = questionOptions.map(opt => applySynonymReplacement(opt, quality));
      qualityScore = quality === 'expert' ? 85 : quality === 'advanced' ? 80 : quality === 'standard' ? 75 : 70;
      break;
      
    case 'paraphrase':
      question = paraphraseAdvanced(question, quality);
      questionOptions = questionOptions.map(opt => paraphraseAdvanced(opt, quality));
      qualityScore = quality === 'expert' ? 90 : quality === 'advanced' ? 85 : quality === 'standard' ? 80 : 75;
      break;
      
    case 'perspective':
      question = changePerspectiveAdvanced(question, quality);
      qualityScore = quality === 'expert' ? 88 : quality === 'advanced' ? 83 : quality === 'standard' ? 78 : 73;
      break;
      
    case 'context':
      question = addBiblicalContextAdvanced(question, original.category, quality);
      qualityScore = quality === 'expert' ? 92 : quality === 'advanced' ? 87 : quality === 'standard' ? 82 : 77;
      break;
      
    case 'creative': {
      const creative = applyCreativeTransformation(question, questionOptions, quality);
      question = creative.question;
      questionOptions = creative.options;
      correctAnswer = creative.correctAnswer;
      qualityScore = quality === 'expert' ? 95 : quality === 'advanced' ? 90 : quality === 'standard' ? 85 : 80;
      break;
    }
      
    case 'hybrid':
      // Combine multiple strategies
      question = applySynonymReplacement(question, quality);
      question = paraphraseAdvanced(question, quality);
      if (Math.random() > 0.5) {
        question = addBiblicalContextAdvanced(question, original.category, quality);
      }
      questionOptions = questionOptions.map(opt => applySynonymReplacement(opt, quality));
      qualityScore = quality === 'expert' ? 93 : quality === 'advanced' ? 88 : quality === 'standard' ? 83 : 78;
      break;
  }
  
  // Add additional context if requested
  if (options.addContext && strategy !== 'context') {
    question = addBiblicalContextAdvanced(question, original.category, quality);
    qualityScore += 5;
  }
  
  // Shuffle options for variety
  const shuffled = shuffleOptionsWithAnswer(questionOptions, correctAnswer);
  questionOptions = shuffled.options;
  correctAnswer = shuffled.correctAnswer;
  
  return {
    question,
    options: questionOptions,
    correctAnswer,
    difficulty: options.targetDifficulty,
    category: options.targetCategory,
    qualityScore: Math.min(100, qualityScore)
  };
}

// Generate question variations for retwisting (deprecated - use generateAdvancedVariation)
function generateQuestionVariations(
  original: Question,
  customPrompt?: string
): Array<{
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  category?: string;
}> {
  // Legacy support - redirect to advanced function
  return [
    generateAdvancedVariation(original, 'paraphrase', 'standard', { customPrompt })
  ];
}

// Advanced synonym replacement with biblical vocabulary
function applySynonymReplacement(text: string, quality: string): string {
  const synonymMap: Record<string, string[]> = {
    'said': ['proclaimed', 'declared', 'spoke', 'uttered', 'testified'],
    'went': ['traveled', 'journeyed', 'proceeded', 'departed', 'ventured'],
    'came': ['arrived', 'approached', 'entered', 'descended', 'appeared'],
    'gave': ['bestowed', 'granted', 'provided', 'offered', 'presented'],
    'made': ['created', 'established', 'formed', 'fashioned', 'constructed'],
    'told': ['instructed', 'informed', 'revealed', 'communicated', 'conveyed'],
    'saw': ['witnessed', 'beheld', 'observed', 'perceived', 'discerned'],
    'heard': ['listened to', 'received word', 'learned', 'was told', 'perceived'],
    'people': ['multitude', 'congregation', 'assembly', 'followers', 'disciples'],
    'God': ['the Lord', 'the Almighty', 'the Creator', 'Yahweh', 'the Divine'],
    'Jesus': ['Christ', 'the Messiah', 'the Son of God', 'our Savior', 'the Lord'],
    'prophet': ['seer', 'man of God', 'messenger', 'oracle', 'herald'],
    'king': ['monarch', 'ruler', 'sovereign', 'regent', 'leader'],
    'temple': ['sanctuary', 'house of God', 'holy place', 'tabernacle', 'shrine'],
    'prayer': ['supplication', 'petition', 'intercession', 'invocation', 'plea'],
    'faith': ['belief', 'trust', 'confidence', 'conviction', 'devotion'],
    'sin': ['transgression', 'iniquity', 'wrongdoing', 'trespass', 'offense'],
    'saved': ['redeemed', 'delivered', 'rescued', 'liberated', 'freed'],
    'holy': ['sacred', 'divine', 'consecrated', 'sanctified', 'hallowed'],
    'blessed': ['favored', 'fortunate', 'endowed', 'graced', 'sanctified'],
    'wrote': ['authored', 'composed', 'penned', 'inscribed', 'recorded'],
    'first': ['initial', 'earliest', 'primary', 'foremost', 'original']
  };
  
  const replacementChance = quality === 'expert' ? 0.7 : quality === 'advanced' ? 0.5 : quality === 'standard' ? 0.3 : 0.2;
  
  let result = text;
  Object.entries(synonymMap).forEach(([word, synonyms]) => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    result = result.replace(regex, (match) => {
      if (Math.random() < replacementChance) {
        return synonyms[Math.floor(Math.random() * synonyms.length)];
      }
      return match;
    });
  });
  
  return result;
}

// Advanced paraphrasing with sentence restructuring
function paraphraseAdvanced(text: string, quality: string): string {
  const patterns = [
    // Question → Who/What/When/Where/Why/How transformations
    { from: /^What did (.+?) do\?$/i, to: 'What action did $1 take?' },
    { from: /^Who was (.+?)\?$/i, to: 'Can you identify who $1 was?' },
    { from: /^Where did (.+?) go\?$/i, to: 'To which place did $1 travel?' },
    { from: /^When did (.+?) happen\?$/i, to: 'At what time did $1 occur?' },
    { from: /^Why did (.+?)\?$/i, to: 'For what reason did $1?' },
    { from: /^How did (.+?)\?$/i, to: 'In what manner did $1?' },
    
    // Biblical phrase restructuring
    { from: /in the beginning/i, to: 'at the dawn of creation' },
    { from: /according to the scriptures/i, to: 'as written in holy text' },
    { from: /it is written/i, to: 'the scripture declares' },
    { from: /in those days/i, to: 'during that era' },
    { from: /the word of the Lord/i, to: "the Lord's divine message" },
    
    // Action restructuring
    { from: /was born in/i, to: 'came into the world in' },
    { from: /preached about/i, to: 'proclaimed the message of' },
    { from: /believed in/i, to: 'placed their faith in' },
    { from: /prayed to/i, to: 'offered supplication to' },
    { from: /testified that/i, to: 'bore witness that' }
  ];
  
  let result = text;
  const numPatterns = quality === 'expert' ? 5 : quality === 'advanced' ? 3 : quality === 'standard' ? 2 : 1;
  
  patterns.slice(0, numPatterns).forEach(pattern => {
    result = result.replace(pattern.from, pattern.to);
  });
  
  return result;
}

// Change question perspective
function changePerspectiveAdvanced(text: string, quality: string): string {
  // Convert 3rd person to 1st person perspective or vice versa
  const perspectives = [
    { from: /he said/gi, to: 'I said' },
    { from: /she said/gi, to: 'I said' },
    { from: /they said/gi, to: 'we said' },
    { from: /he went/gi, to: 'I went' },
    { from: /she went/gi, to: 'I went' },
    { from: /they went/gi, to: 'we went' },
    { from: /his/gi, to: 'my' },
    { from: /her/gi, to: 'my' },
    { from: /their/gi, to: 'our' },
    { from: /he was/gi, to: 'I was' },
    { from: /she was/gi, to: 'I was' },
    { from: /they were/gi, to: 'we were' }
  ];
  
  // Alternatively, add narrative framing
  const narrativeFrames = [
    'From the biblical account, ',
    'As recorded in scripture, ',
    'According to the testimony, ',
    'In the sacred narrative, ',
    'The biblical record shows that '
  ];
  
  let result = text;
  
  if (quality === 'expert' || quality === 'advanced') {
    // Apply perspective shift for advanced quality
    if (Math.random() > 0.5) {
      perspectives.forEach(p => {
        result = result.replace(p.from, p.to);
      });
    } else {
      // Add narrative frame
      result = narrativeFrames[Math.floor(Math.random() * narrativeFrames.length)] + result;
    }
  }
  
  return result;
}

// Add biblical context to question
function addBiblicalContextAdvanced(text: string, category: string, quality: string): string {
  const contextByCategory: Record<string, string[]> = {
    'Old Testament': [
      '(as documented in the Hebrew scriptures)',
      '(in the ancient covenant)',
      '(during the patriarchal period)',
      '(in the prophetic writings)',
      '(according to Mosaic law)'
    ],
    'New Testament': [
      '(in the gospel accounts)',
      '(during the apostolic age)',
      '(in the early church era)',
      '(as Jesus taught)',
      '(in the New Covenant)'
    ],
    'Prophets': [
      '(through divine revelation)',
      '(by prophetic vision)',
      '(as foretold by the prophets)',
      '(through inspired utterance)',
      '(in prophetic declaration)'
    ],
    'Life of Jesus': [
      '(during Christ\'s earthly ministry)',
      '(in the Messianic age)',
      '(during the Incarnation)',
      '(in Jesus\' redemptive mission)',
      '(through Christ\'s teachings)'
    ],
    'Apostles': [
      '(in the apostolic mission)',
      '(during the church\'s foundation)',
      '(through apostolic authority)',
      '(in early Christian testimony)',
      '(by apostolic witness)'
    ]
  };
  
  const contexts = contextByCategory[category] || [
    '(in biblical history)',
    '(according to scripture)',
    '(in the sacred text)',
    '(as recorded in the Bible)',
    '(in God\'s revelation)'
  ];
  
  const contextToAdd = contexts[Math.floor(Math.random() * contexts.length)];
  
  // Insert context at appropriate position
  if (text.includes('?')) {
    return text.replace('?', ` ${contextToAdd}?`);
  }
  
  return `${text} ${contextToAdd}`;
}

// Apply creative AI transformation
function applyCreativeTransformation(
  question: string, 
  options: string[], 
  quality: string
): {
  question: string;
  options: string[];
  correctAnswer: number;
} {
  // Apply multiple transformations for creative variation
  let newQuestion = question;
  let newOptions = [...options];
  
  // Add rhetorical elements for expert quality
  if (quality === 'expert') {
    const rhetoricalFrames = [
      'Consider this: ',
      'Reflect on the following: ',
      'Examine the scriptural account: ',
      'Ponder this biblical truth: ',
      'Contemplate this question: '
    ];
    newQuestion = rhetoricalFrames[Math.floor(Math.random() * rhetoricalFrames.length)] + newQuestion;
  }
  
  // Add descriptive elements
  newQuestion = applySynonymReplacement(newQuestion, quality);
  newQuestion = paraphraseAdvanced(newQuestion, quality);
  newOptions = newOptions.map(opt => applySynonymReplacement(opt, quality));
  
  // Randomly enhance with context
  if (Math.random() > 0.6) {
    newQuestion = addBiblicalContextAdvanced(newQuestion, 'Old Testament', quality);
  }
  
  return {
    question: newQuestion,
    options: newOptions,
    correctAnswer: 0 // Maintain original correct answer after shuffle
  };
}

// Shuffle options while maintaining correct answer
function shuffleOptionsWithAnswer(options: string[], correctAnswer: number): {
  options: string[];
  correctAnswer: number;
} {
  const correctText = options[correctAnswer];
  const shuffled = [...options].sort(() => Math.random() - 0.5);
  const newCorrectIndex = shuffled.indexOf(correctText);
  
  return {
    options: shuffled,
    correctAnswer: newCorrectIndex
  };
}

// Helper: Paraphrase question text (legacy - use applySynonymReplacement)
function paraphraseQuestion(text: string): string {
  return applySynonymReplacement(text, 'standard');
}

// Helper: Paraphrase option text
function paraphraseOption(text: string): string {
  return applySynonymReplacement(text, 'basic');
}

// Helper: Change question perspective (legacy - use changePerspectiveAdvanced)
function changePerspective(text: string): string {
  return changePerspectiveAdvanced(text, 'standard');
}

// Helper: Add contextual information (legacy - use addBiblicalContextAdvanced)
function addContext(text: string, category: string): string {
  return addBiblicalContextAdvanced(text, category, 'standard');
}

// Get bonus question requests with filtering
export function getBonusQuestionRequests(filters?: {
  tenantId?: string;
  requestedBy?: string;
  status?: BonusQuestionRequest['status'];
  tournamentId?: string;
  startDate?: string;
  endDate?: string;
}): BonusQuestionRequest[] {
  let requests = storage.get<BonusQuestionRequest[]>(STORAGE_KEYS.BONUS_QUESTION_REQUESTS) || [];
  
  if (filters) {
    if (filters.tenantId) {
      requests = requests.filter(r => r.tenantId === filters.tenantId);
    }
    if (filters.requestedBy) {
      requests = requests.filter(r => r.requestedBy === filters.requestedBy);
    }
    if (filters.status) {
      requests = requests.filter(r => r.status === filters.status);
    }
    if (filters.tournamentId) {
      requests = requests.filter(r => r.tournamentId === filters.tournamentId);
    }
    if (filters.startDate) {
      requests = requests.filter(r => r.requestedAt >= filters.startDate!);
    }
    if (filters.endDate) {
      requests = requests.filter(r => r.requestedAt <= filters.endDate!);
    }
  }
  
  // Sort by requested date descending
  return requests.sort((a, b) => 
    new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
  );
}

// Update bonus question request status
export function updateBonusQuestionRequestStatus(
  requestId: string,
  status: BonusQuestionRequest['status'],
  error?: string
): { success: boolean; error?: string } {
  const requests = storage.get<BonusQuestionRequest[]>(STORAGE_KEYS.BONUS_QUESTION_REQUESTS) || [];
  const request = requests.find(r => r.id === requestId);
  
  if (!request) {
    return { success: false, error: 'Request not found' };
  }
  
  request.status = status;
  if (error) {
    request.error = error;
  }
  request.updatedAt = new Date().toISOString();
  
  if (status === 'completed' || status === 'failed') {
    request.completedAt = new Date().toISOString();
  }
  
  storage.set(STORAGE_KEYS.BONUS_QUESTION_REQUESTS, requests);
  
  return { success: true };
}

// Cancel bonus question request
export function cancelBonusQuestionRequest(
  requestId: string,
  userId: string
): { success: boolean; error?: string } {
  const requests = storage.get<BonusQuestionRequest[]>(STORAGE_KEYS.BONUS_QUESTION_REQUESTS) || [];
  const request = requests.find(r => r.id === requestId);
  
  if (!request) {
    return { success: false, error: 'Request not found' };
  }
  
  if (request.status === 'completed') {
    return { success: false, error: 'Cannot cancel completed request' };
  }
  
  request.status = 'failed';
  request.error = `Cancelled by user ${userId}`;
  request.completedAt = new Date().toISOString();
  request.updatedAt = new Date().toISOString();
  
  storage.set(STORAGE_KEYS.BONUS_QUESTION_REQUESTS, requests);
  
  return { success: true };
}

// Approve bonus questions (after retwisting)
export function approveBonusQuestions(
  requestId: string,
  userId: string,
  questionIds: string[], // Specific questions to approve
  destination: 'pool' | 'tournament' = 'tournament'
): { success: boolean; error?: string } {
  const requests = storage.get<BonusQuestionRequest[]>(STORAGE_KEYS.BONUS_QUESTION_REQUESTS) || [];
  const request = requests.find(r => r.id === requestId);
  
  if (!request) {
    return { success: false, error: 'Request not found' };
  }
  
  if (request.status !== 'awaiting_approval') {
    return { success: false, error: 'Request is not awaiting approval' };
  }
  
  const questions = storage.get<Question[]>(STORAGE_KEYS.QUESTIONS) || [];
  
  questionIds.forEach(qid => {
    const question = questions.find(q => q.id === qid);
    if (question) {
      question.approvalStatus = QuestionApprovalStatus.APPROVED;
      question.approvedBy = userId;
      question.approvedAt = new Date().toISOString();
      question.status = destination === 'pool' ? QuestionStatus.QUESTION_POOL : QuestionStatus.TOURNAMENT_RESERVED;
      question.updatedAt = new Date().toISOString();
      
      if (destination === 'tournament' && request.tournamentId) {
        question.tournamentId = request.tournamentId;
      }
    }
  });
  
  storage.set(STORAGE_KEYS.QUESTIONS, questions);
  
  request.status = 'completed';
  request.approvedBy = userId;
  request.approvedAt = new Date().toISOString();
  request.completedAt = new Date().toISOString();
  storage.set(STORAGE_KEYS.BONUS_QUESTION_REQUESTS, requests);
  
  return { success: true };
}




