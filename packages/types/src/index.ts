/**
 * Shared TypeScript types for Smart eQuiz Platform
 * Used across marketing-site, platform-admin, and tenant-app
 */

// ============================================================================
// TENANT & ORGANIZATION TYPES
// ============================================================================

export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  customDomain?: string;
  customDomainVerified: boolean;
  planId: string;
  status: 'active' | 'suspended' | 'cancelled';
  primaryColor: string;
  logoUrl?: string;
  sslEnabled: boolean;
  paymentIntegrationEnabled: boolean;
  maxUsers: number;
  maxTournaments: number;
  createdAt: string;
  updatedAt?: string;
}

export interface TenantBranding {
  logoUrl?: string;
  primaryColor: string;
  accentColor?: string;
  fontFamily?: string;
  customCSS?: string;
}

export interface TenantConfig {
  apiBaseUrl: string;
  websocketUrl: string;
  cdnUrl: string;
  branding: TenantBranding;
  features: TenantFeatures;
}

export interface TenantFeatures {
  practiceMode: boolean;
  tournaments: boolean;
  leaderboard: boolean;
  payments: boolean;
  customBranding: boolean;
  mobileApp: boolean;
}

// ============================================================================
// USER & AUTHENTICATION TYPES
// ============================================================================

export type UserRole = 
  | 'super_admin'        // Platform admin only
  | 'org_admin'          // Tenant administrator
  | 'question_manager'   // Manages questions
  | 'account_officer'    // Billing & payments
  | 'inspector'          // Monitors tournaments
  | 'moderator'          // Manages participants
  | 'participant'        // Competes in tournaments
  | 'spectator';         // View only

export interface User {
  id: string;
  tenantId: string | null;  // null for super_admin
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  xp: number;
  level: number;
  badges: string[];
  walletBalance: number;
  createdAt: string;
  lastLoginAt?: string;
}

export interface AuthToken {
  userId: string;
  email: string;
  role: UserRole;
  tenantId: string | null;
  exp: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  tenantId?: string;
  role?: UserRole;
}

export interface TenantRegistration {
  organizationName: string;
  subdomain: string;
  adminName: string;
  adminEmail: string;
  phone: string;
  password: string;
  planId: string;
}

// ============================================================================
// PLAN & BILLING TYPES
// ============================================================================

export type CurrencyCode = 
  | 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'JPY' 
  | 'INR' | 'BRL' | 'MXN' | 'ZAR' | 'NGN' | 'KES';

export interface Plan {
  id: string;
  name: string;
  displayName: string;
  description: string;
  monthlyPrice: number;
  yearlyDiscountPercent: number;
  billingOptions: ('monthly' | 'yearly')[];
  currency: CurrencyCode;
  maxUsers: number;
  maxTournaments: number;
  maxQuestionsPerTournament: number;
  maxQuestionCategories: number;
  features: string[];
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface TenantBilling {
  tenantId: string;
  planId: string;
  billingCycle: 'monthly' | 'yearly';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  status: 'active' | 'past_due' | 'cancelled' | 'trialing';
  nextBillingDate: string;
  amountDue: number;
  currency: CurrencyCode;
  preferredCurrency: CurrencyCode;
  discountApplied?: number;
}

export interface Invoice {
  id: string;
  tenantId: string;
  number: string;
  amount: number;
  currency: CurrencyCode;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  dueDate: string;
  paidDate?: string;
  description: string;
  items: InvoiceItem[];
  createdAt: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  currency: CurrencyCode;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account';
  last4: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

// ============================================================================
// TOURNAMENT TYPES
// ============================================================================

export interface Tournament {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  createdBy: string;
  status: 'draft' | 'scheduled' | 'active' | 'completed' | 'cancelled';
  startDate?: string;
  endDate?: string;
  entryFee: number;
  maxParticipants?: number;
  participants: string[];
  winners?: string[];
  rounds: TournamentRound[];
  settings: TournamentSettings;
  createdAt: string;
  updatedAt?: string;
}

export interface TournamentRound {
  id: string;
  roundNumber: number;
  name: string;
  questionCount: number;
  timeLimit: number;
  categories: string[];
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  status: 'pending' | 'active' | 'completed';
}

export interface TournamentSettings {
  isPublic: boolean;
  requireApproval: boolean;
  allowLateRegistration: boolean;
  showLeaderboard: boolean;
  recordMatches: boolean;
}

export interface TournamentParticipant {
  userId: string;
  tournamentId: string;
  status: 'registered' | 'approved' | 'rejected' | 'withdrawn';
  score: number;
  rank?: number;
  registeredAt: string;
}

// ============================================================================
// QUESTION TYPES
// ============================================================================

export interface Question {
  id: string;
  tenantId: string;
  category: string;
  question: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  reference?: string;  // Bible reference
  tags: string[];
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}

export interface QuestionCategory {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  questionCount: number;
  isActive: boolean;
}

export interface QuestionBank {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  questions: string[];  // Question IDs
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
}

// ============================================================================
// PRACTICE MODE TYPES
// ============================================================================

export interface PracticeSession {
  id: string;
  userId: string;
  tenantId: string;
  categoryId?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  questionCount: number;
  correctAnswers: number;
  score: number;
  duration: number;  // seconds
  startedAt: string;
  completedAt?: string;
}

export interface PracticeQuestion {
  questionId: string;
  userAnswer?: string;
  isCorrect?: boolean;
  timeSpent: number;  // seconds
  answeredAt?: string;
}

// ============================================================================
// ANALYTICS & METRICS TYPES
// ============================================================================

export interface PlatformMetrics {
  totalTenants: number;
  activeTenants: number;
  totalUsers: number;
  totalTournaments: number;
  monthlyRecurringRevenue: number;
  annualRecurringRevenue: number;
  churnRate: number;
  newSignups: number;
}

export interface TenantMetrics {
  tenantId: string;
  activeUsers: number;
  tournamentsHeld: number;
  questionsCreated: number;
  practiceSessionsCompleted: number;
  revenueCollected: number;
  avgUserEngagement: number;
}

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  score: number;
  rank: number;
  xp: number;
  level: number;
  tournamentsWon: number;
  badges: string[];
}

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export interface Notification {
  id: string;
  userId: string;
  tenantId: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  actionUrl?: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
}

export interface EmailTemplate {
  id: string;
  tenantId?: string;  // null for platform-wide templates
  name: string;
  subject: string;
  htmlContent: string;
  variables: string[];
  category: 'auth' | 'tournament' | 'payment' | 'system';
  isActive: boolean;
}

// ============================================================================
// SUPPORT & TICKETS TYPES
// ============================================================================

export interface SupportTicket {
  id: string;
  tenantId: string;
  userId: string;
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  assignedTo?: string;
  messages: TicketMessage[];
  createdAt: string;
  resolvedAt?: string;
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  userId: string;
  message: string;
  isInternal: boolean;  // Internal notes not visible to tenant
  createdAt: string;
}

// ============================================================================
// AUDIT LOG TYPES
// ============================================================================

export interface AuditLog {
  id: string;
  userId: string;
  tenantId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  changes?: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
  meta?: ApiMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface ApiMeta {
  timestamp: string;
  requestId: string;
  version: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// ============================================================================
// WEBHOOK TYPES
// ============================================================================

export interface WebhookEvent {
  id: string;
  tenantId: string;
  type: string;
  payload: Record<string, any>;
  createdAt: string;
}

export interface WebhookEndpoint {
  id: string;
  tenantId: string;
  url: string;
  events: string[];
  secret: string;
  isActive: boolean;
  createdAt: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type AppType = 'marketing' | 'admin' | 'tenant';

export type TenantStatus = Tenant['status'];
export type BillingStatus = TenantBilling['status'];
export type TournamentStatus = Tournament['status'];
export type TicketStatus = SupportTicket['status'];
export type InvoiceStatus = Invoice['status'];

export type SortOrder = 'asc' | 'desc';

export interface SortOptions {
  field: string;
  order: SortOrder;
}

export interface FilterOptions {
  [key: string]: any;
}

export interface SearchOptions {
  query: string;
  fields?: string[];
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const USER_ROLES: readonly UserRole[] = [
  'super_admin',
  'org_admin',
  'question_manager',
  'account_officer',
  'inspector',
  'moderator',
  'participant',
  'spectator'
] as const;

export const TENANT_STATUSES: readonly TenantStatus[] = [
  'active',
  'suspended',
  'cancelled'
] as const;

export const TOURNAMENT_STATUSES: readonly TournamentStatus[] = [
  'draft',
  'scheduled',
  'active',
  'completed',
  'cancelled'
] as const;

// Export all types
export type * from './index';
