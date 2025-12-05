import { Metadata } from 'next';
import PricingContent from './PricingContent';

export const metadata: Metadata = {
  title: 'Pricing - Smart eQuiz Platform',
  description: 'Choose the perfect plan for your Bible quiz program. Simple, transparent pricing with no hidden fees.',
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: 'MONTHLY' | 'YEARLY';
  features: string[];
  highlighted: boolean;
  ctaText?: string;
  ctaUrl?: string;
  isActive: boolean;
}

// Sample fallback data
const samplePricingPlans: PricingPlan[] = [
  {
    id: '1',
    name: 'Starter',
    description: 'Perfect for small churches',
    price: 29,
    interval: 'MONTHLY',
    features: [
      'Up to 50 participants',
      'Unlimited practice quizzes',
      'Basic analytics',
      'Email support',
      '5 GB storage',
    ],
    highlighted: false,
    ctaText: 'Start Free Trial',
    ctaUrl: '/signup',
    isActive: true,
  },
  {
    id: '2',
    name: 'Professional',
    description: 'For growing organizations',
    price: 79,
    interval: 'MONTHLY',
    features: [
      'Up to 200 participants',
      'Advanced analytics',
      'AI question generation',
      'Priority support',
      '50 GB storage',
      'Custom branding',
    ],
    highlighted: true,
    ctaText: 'Start Free Trial',
    ctaUrl: '/signup',
    isActive: true,
  },
  {
    id: '3',
    name: 'Enterprise',
    description: 'For large organizations',
    price: 199,
    interval: 'MONTHLY',
    features: [
      'Unlimited participants',
      'Multi-location support',
      'Dedicated support',
      'Unlimited storage',
      'Advanced security',
      'Custom integrations',
    ],
    highlighted: false,
    ctaText: 'Contact Sales',
    ctaUrl: '/contact',
    isActive: true,
  },
];

async function getPricingPlans(): Promise<PricingPlan[]> {
  try {
    const res = await fetch(`${API_URL}/marketing-cms/pricing-plans`, {
      next: { revalidate: 60 }, // ISR: Revalidate every 60 seconds
    });

    if (!res.ok) {
      throw new Error('Failed to fetch pricing plans');
    }

    const plans = await res.json();
    return plans.filter((plan: PricingPlan) => plan.isActive);
  } catch (error) {
    console.error('Error fetching pricing plans:', error);
    return samplePricingPlans;
  }
}

export default async function PricingPage() {
  const pricingPlans = await getPricingPlans();

  return <PricingContent pricingPlans={pricingPlans} />;
}
