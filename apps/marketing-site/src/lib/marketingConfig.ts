/**
 * Marketing Site Configuration
 * Managed by Super Admin
 */

export interface MarketingSiteConfig {
  siteName: string;
  logoUrl: string;
  logoAlt: string;
  headerMenu: HeaderMenuItem[];
  footerSections: FooterSection[];
  footerNote: string;
  contactEmail: string;
  socialLinks: SocialLink[];
}

export interface HeaderMenuItem {
  label: string;
  href: string;
  highlighted?: boolean;
}

export interface FooterSection {
  title: string;
  links: FooterLink[];
}

export interface FooterLink {
  label: string;
  href: string;
}

export interface SocialLink {
  platform: 'twitter' | 'facebook' | 'linkedin' | 'instagram' | 'youtube';
  url: string;
}

// Default configuration (can be overridden by super admin settings)
export const defaultMarketingConfig: MarketingSiteConfig = {
  siteName: 'Smart eQuiz',
  logoUrl: '/logo.svg',
  logoAlt: 'Smart eQuiz Logo',
  headerMenu: [
    { label: 'Features', href: '/features' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Demo', href: '/demo' },
    { label: 'Docs', href: '/docs' },
    { label: 'Affiliate Program', href: '/affiliate' },
    { label: 'Sign In', href: '/platform-login' },
    { label: 'Start Free Trial', href: '/signup', highlighted: true },
  ],
  footerSections: [
    {
      title: 'Product',
      links: [
        { label: 'Features', href: '/features' },
        { label: 'Pricing', href: '/pricing' },
        { label: 'Demo', href: '/demo' },
        { label: 'Documentation', href: '/docs' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About', href: '/about' },
        { label: 'Contact', href: '/contact' },
        { label: 'Affiliate Program', href: '/affiliate' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { label: 'Help Center', href: '/docs' },
        { label: 'Community', href: '/community' },
        { label: 'Status', href: '/status' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy', href: '/privacy' },
        { label: 'Terms', href: '/terms' },
        { label: 'Security', href: '/security' },
      ],
    },
  ],
  footerNote: '© 2025 Smart eQuiz Platform. All rights reserved.',
  contactEmail: 'support@smartequiz.com',
  socialLinks: [
    { platform: 'twitter', url: 'https://twitter.com/smartequiz' },
    { platform: 'facebook', url: 'https://facebook.com/smartequiz' },
    { platform: 'linkedin', url: 'https://linkedin.com/company/smartequiz' },
  ],
};

// In production, this would fetch from an API endpoint managed by super admin
export async function getMarketingConfig(): Promise<MarketingSiteConfig> {
  // TODO: Fetch from API endpoint
  // const response = await fetch('/api/admin/marketing-config');
  // return response.json();
  
  return defaultMarketingConfig;
}
