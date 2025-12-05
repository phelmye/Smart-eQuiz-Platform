import { Metadata } from 'next';
import FAQContent from './FAQContent';

export const metadata: Metadata = {
  title: 'FAQ - Smart eQuiz Platform',
  description: 'Frequently asked questions about Smart eQuiz Platform features, pricing, and support.',
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category?: string;
  order: number;
  isActive: boolean;
}

// Sample fallback data
const sampleFAQs: FAQ[] = [
  {
    id: '1',
    question: 'How do I get started with Smart eQuiz?',
    answer: 'Getting started is easy! Sign up for a free account, create your organization profile, and you can start creating tournaments and managing participants immediately. Our onboarding wizard will guide you through the setup process.',
    category: 'Getting Started',
    order: 1,
    isActive: true,
  },
  {
    id: '2',
    question: 'Can I import my existing questions?',
    answer: 'Yes! You can import questions from Excel, CSV, or other formats. We also provide templates to make the import process smooth. Contact support if you need help with bulk imports.',
    category: 'Getting Started',
    order: 2,
    isActive: true,
  },
  {
    id: '3',
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, Mastercard, American Express), debit cards, and ACH/bank transfers for annual plans. All payments are processed securely through Stripe.',
    category: 'Billing & Pricing',
    order: 3,
    isActive: true,
  },
  {
    id: '4',
    question: 'Can I change my plan later?',
    answer: 'Absolutely! You can upgrade or downgrade your plan at any time from your account settings. Changes take effect at the start of your next billing cycle, and we will prorate any differences.',
    category: 'Billing & Pricing',
    order: 4,
    isActive: true,
  },
  {
    id: '5',
    question: 'Is my data secure?',
    answer: 'Yes! We use enterprise-grade security including SSL encryption, regular backups, and SOC 2 compliance. Your data is stored in secure data centers with 99.9% uptime guarantee. Each tenant data is completely isolated.',
    category: 'Security & Privacy',
    order: 5,
    isActive: true,
  },
  {
    id: '6',
    question: 'Do you offer training or onboarding?',
    answer: 'Yes! All plans include access to our help center, video tutorials, and email support. Professional and Enterprise plans include live onboarding sessions with our team.',
    category: 'Support',
    order: 6,
    isActive: true,
  },
];

async function getFAQs(): Promise<FAQ[]> {
  try {
    const res = await fetch(`${API_URL}/marketing-cms/faqs`, {
      next: { revalidate: 60 }, // ISR: Revalidate every 60 seconds
    });

    if (!res.ok) {
      throw new Error('Failed to fetch FAQs');
    }

    const faqs = await res.json();
    return faqs.filter((faq: FAQ) => faq.isActive);
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    return sampleFAQs;
  }
}

export default async function FAQPage() {
  const faqs = await getFAQs();

  return <FAQContent faqs={faqs} />;
}
