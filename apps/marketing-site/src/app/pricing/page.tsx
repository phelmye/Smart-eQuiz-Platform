'use client';

import { useEffect, useState } from 'react';
import PricingContent from './PricingContent';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: 'MONTH' | 'YEAR';
  features: string[];
  highlighted: boolean;
  ctaText?: string;
  ctaLink?: string;
  isActive: boolean;
}

// Sample fallback data
const samplePricingPlans: PricingPlan[] = [
  {
    id: '1',
    name: 'Starter',
    description: 'Perfect for small churches',
    price: 29,
    interval: 'MONTH',
    features: [
      'Up to 50 participants',
      'Unlimited practice quizzes',
      'Basic analytics',
      'Email support',
      '5 GB storage',
    ],
    highlighted: false,
    ctaText: 'Start Free Trial',
    ctaLink: '/signup',
    isActive: true,
  },
  {
    id: '2',
    name: 'Professional',
    description: 'For growing organizations',
    price: 79,
    interval: 'MONTH',
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
    ctaLink: '/signup',
    isActive: true,
  },
  {
    id: '3',
    name: 'Enterprise',
    description: 'For large organizations',
    price: 199,
    interval: 'MONTH',
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
    ctaLink: '/contact',
    isActive: true,
  },
];

export default function PricingPage() {
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>(samplePricingPlans);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPricingPlans() {
      try {
        const res = await fetch(`${API_URL}/marketing-cms/pricing-plans`);
        if (res.ok) {
          const data = await res.json();
          // Normalize interval values from API (MONTHLY/YEARLY -> MONTH/YEAR)
          const normalizedPlans = data
            .filter((plan: any) => plan.isActive)
            .map((plan: any) => ({
              ...plan,
              interval: plan.interval === 'MONTHLY' ? 'MONTH' : plan.interval === 'YEARLY' ? 'YEAR' : plan.interval
            }));
          setPricingPlans(normalizedPlans);
        }
      } catch (error) {
        console.error('Error fetching pricing plans:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchPricingPlans();
  }, []);

  return <PricingContent pricingPlans={pricingPlans} />;
}
