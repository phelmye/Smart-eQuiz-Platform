'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';

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

interface PricingContentProps {
  pricingPlans: PricingPlan[];
}

export default function PricingContent({ pricingPlans }: PricingContentProps) {
  const [interval, setInterval] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');

  // Filter plans by selected interval
  const filteredPlans = pricingPlans.filter(plan => plan.interval === interval);

  // Calculate yearly savings
  const getYearlyPrice = (monthlyPrice: number) => monthlyPrice * 12;
  const getYearlySavings = (monthlyPrice: number) => Math.round(monthlyPrice * 12 * 0.2); // 20% discount

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Simple, Transparent Pricing</h1>
          <p className="text-xl max-w-3xl mx-auto text-blue-100">
            Choose the perfect plan for your organization. All plans include a 14-day free trial.
          </p>
        </div>
      </section>

      {/* Pricing Toggle */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center gap-4">
            <span className={`text-lg font-medium ${interval === 'MONTHLY' ? 'text-blue-600' : 'text-gray-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setInterval(interval === 'MONTHLY' ? 'YEARLY' : 'MONTHLY')}
              className={`relative w-16 h-8 rounded-full transition-colors ${
                interval === 'YEARLY' ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                  interval === 'YEARLY' ? 'translate-x-8' : ''
                }`}
              />
            </button>
            <span className={`text-lg font-medium ${interval === 'YEARLY' ? 'text-blue-600' : 'text-gray-500'}`}>
              Yearly
            </span>
            {interval === 'YEARLY' && (
              <span className="ml-2 px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
                Save 20%
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12 pb-24">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8">
            {filteredPlans.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-white rounded-xl shadow-lg overflow-hidden transition-transform hover:scale-105 ${
                  plan.highlighted ? 'ring-4 ring-blue-600' : ''
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute top-0 right-0 bg-blue-600 text-white px-4 py-1 text-sm font-semibold">
                    Popular
                  </div>
                )}
                
                <div className="p-8">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-6">{plan.description}</p>
                  
                  <div className="mb-6">
                    <span className="text-5xl font-bold">${plan.price}</span>
                    <span className="text-gray-600">/{interval === 'MONTHLY' ? 'month' : 'year'}</span>
                  </div>

                  {interval === 'YEARLY' && (
                    <p className="text-sm text-green-600 font-medium mb-4">
                      Save ${getYearlySavings(plan.price)} per year
                    </p>
                  )}
                  
                  <a
                    href={plan.ctaUrl || '/signup'}
                    className={`block w-full text-center py-3 px-6 rounded-lg font-semibold transition-colors mb-6 ${
                      plan.highlighted
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {plan.ctaText || 'Get Started'}
                  </a>
                  
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {filteredPlans.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No pricing plans available for this billing interval.</p>
            </div>
          )}
        </div>
      </section>

      {/* FAQ CTA */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Have Questions?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Check out our FAQ or contact our sales team for more information.
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="/faq"
              className="px-6 py-3 bg-gray-100 text-gray-900 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              View FAQ
            </a>
            <a
              href="/contact"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Contact Sales
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
