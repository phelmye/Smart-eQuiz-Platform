/**
 * Marketing Content Management System Types
 * Shared types for managing marketing website content
 */

export interface MarketingHeroSection {
  headline: string;
  subheadline: string;
  ctaPrimary: string;
  ctaSecondary: string;
  ctaPrimaryLink: string;
  ctaSecondaryLink: string;
  backgroundImage?: string;
  videoUrl?: string;
}

export interface MarketingSocialProof {
  activeUsers: string;
  churchesServed: string;
  quizzesHosted: string;
  customerRating: string;
  updatedAt?: string;
}

export interface MarketingTestimonial {
  id: string;
  name: string;
  role: string;
  organization: string;
  content: string;
  rating: number;
  initials: string;
  color: 'blue' | 'green' | 'purple' | 'red' | 'yellow' | 'pink' | 'indigo' | 'gray';
  avatarUrl?: string;
  videoUrl?: string;
  featured?: boolean;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface MarketingPricingTier {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  highlighted: boolean;
  ctaText: string;
  ctaLink: string;
  popular?: boolean;
  stripePriceId?: string;
  order?: number;
  enabled?: boolean;
}

export interface MarketingContactInfo {
  email: string;
  phone: string;
  address: string;
  supportHours: string;
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    youtube?: string;
  };
}

export interface MarketingFeature {
  id: string;
  title: string;
  description: string;
  icon: string;
  category?: string;
  order?: number;
  enabled?: boolean;
  imageUrl?: string;
  learnMoreUrl?: string;
}

export interface MarketingFAQ {
  id: string;
  question: string;
  answer: string;
  category?: string;
  order?: number;
}

export interface MarketingBlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  authorBio?: string;
  authorAvatar?: string;
  featuredImage?: string;
  tags: string[];
  category: string;
  published: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MarketingCaseStudy {
  id: string;
  title: string;
  slug: string;
  organization: string;
  industry: string;
  problem: string;
  solution: string;
  results: string[];
  testimonialId?: string;
  featuredImage?: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MarketingLegalPage {
  id: string;
  type: 'privacy' | 'terms' | 'cookies' | 'gdpr' | 'accessibility';
  title: string;
  content: string;
  version: string;
  effectiveDate: string;
  lastUpdated: string;
}

export interface MarketingFooter {
  companyName: string;
  tagline: string;
  copyrightText: string;
  links: {
    product: Array<{ label: string; href: string }>;
    company: Array<{ label: string; href: string }>;
    resources: Array<{ label: string; href: string }>;
    legal: Array<{ label: string; href: string }>;
  };
}

export interface MarketingAnnouncement {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  link?: string;
  linkText?: string;
  enabled: boolean;
  startDate?: string;
  endDate?: string;
}

/**
 * Complete Marketing Content Structure
 */
export interface MarketingContent {
  hero: MarketingHeroSection;
  socialProof: MarketingSocialProof;
  testimonials: MarketingTestimonial[];
  pricingTiers: MarketingPricingTier[];
  contactInfo: MarketingContactInfo;
  features: MarketingFeature[];
  faqs?: MarketingFAQ[];
  footer?: MarketingFooter;
  announcements?: MarketingAnnouncement[];
  seo?: {
    title: string;
    description: string;
    keywords: string[];
    ogImage?: string;
  };
  metadata?: {
    lastUpdated: string;
    version: string;
    updatedBy: string;
  };
}

/**
 * API Response Types
 */
export interface MarketingContentResponse {
  success: boolean;
  data: MarketingContent;
  error?: string;
}

export interface MarketingContentUpdateRequest {
  section: keyof MarketingContent;
  data: any;
  updatedBy: string;
}

export interface MarketingContentUpdateResponse {
  success: boolean;
  message: string;
  data?: MarketingContent;
  error?: string;
}

/**
 * Content Management Permissions
 */
export interface MarketingContentPermissions {
  canEditHero: boolean;
  canEditPricing: boolean;
  canEditTestimonials: boolean;
  canEditFeatures: boolean;
  canEditContact: boolean;
  canEditLegal: boolean;
  canEditBlog: boolean;
  canPublish: boolean;
  canDelete: boolean;
}

/**
 * Audit Log for Content Changes
 */
export interface MarketingContentAuditLog {
  id: string;
  userId: string;
  userName: string;
  action: 'create' | 'update' | 'delete' | 'publish' | 'unpublish';
  section: string;
  itemId?: string;
  changes: {
    before: any;
    after: any;
  };
  timestamp: string;
  ipAddress?: string;
}
