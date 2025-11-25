'use client';

import { useState } from 'react';
import Link from 'next/link';

/**
 * Affiliate Registration Page
 * Public-facing page for affiliate program sign-ups
 */

interface FormData {
  fullName: string;
  email: string;
  country: string;
  website: string;
  socialMedia: string;
  payoutMethod: 'stripe' | 'paypal' | 'bank_transfer' | 'crypto';
  payoutCurrency: string;
  marketingPlan: string;
  experienceLevel: 'beginner' | 'intermediate' | 'expert';
  monthlyTraffic: string;
  agreeToTerms: boolean;
}

const initialFormData: FormData = {
  fullName: '',
  email: '',
  country: '',
  website: '',
  socialMedia: '',
  payoutMethod: 'paypal',
  payoutCurrency: 'USD',
  marketingPlan: '',
  experienceLevel: 'beginner',
  monthlyTraffic: '',
  agreeToTerms: false
};

export default function AffiliatePage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [submitted, setSubmitted] = useState(false);

  const updateField = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateStep1 = () => {
    const newErrors: Partial<FormData> = {};
    
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.country.trim()) newErrors.country = 'Country is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Partial<FormData> = {};
    
    if (!formData.website.trim() && !formData.socialMedia.trim()) {
      newErrors.website = 'Please provide at least a website or social media link';
    }
    if (!formData.marketingPlan.trim()) {
      newErrors.marketingPlan = 'Please describe how you plan to promote our platform';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    if (!formData.agreeToTerms) {
      alert('You must agree to the terms and conditions to continue.');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep3()) return;

    // TODO: Send to API
    console.log('Affiliate application submitted:', formData);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl p-8">
          <div className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Application Submitted!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for applying to become a Smart eQuiz affiliate partner
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-900">
                <strong>Check your email!</strong> We've sent a verification link to <strong>{formData.email}</strong>
              </p>
            </div>

            <div className="text-left space-y-3 mb-8">
              <h4 className="font-semibold text-gray-900">What happens next?</h4>
              <ol className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-600 font-semibold text-xs flex-shrink-0">1</span>
                  <span><strong>Verify your email</strong> - Click the link we sent you</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-600 font-semibold text-xs flex-shrink-0">2</span>
                  <span><strong>Application review</strong> - We'll review within 1-2 business days</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-600 font-semibold text-xs flex-shrink-0">3</span>
                  <span><strong>Get approved</strong> - Receive your affiliate dashboard access</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-600 font-semibold text-xs flex-shrink-0">4</span>
                  <span><strong>Start earning</strong> - Begin promoting Smart eQuiz!</span>
                </li>
              </ol>
            </div>

            <Link 
              href="/"
              className="inline-block w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Return to Homepage
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="inline-block mb-4 px-4 py-1 bg-blue-600 text-white text-sm rounded-full">Affiliate Program</span>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Become an Affiliate Partner
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Earn up to 35% recurring commission by promoting Smart eQuiz to churches and Christian organizations
          </p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg p-6 text-center border border-blue-200">
            <div className="text-3xl mb-2">📈</div>
            <h3 className="font-semibold text-gray-900">Up to 35% Commission</h3>
            <p className="text-sm text-gray-600 mt-1">Recurring revenue for up to 24 months</p>
          </div>
          <div className="bg-white rounded-lg p-6 text-center border border-purple-200">
            <div className="text-3xl mb-2">🎁</div>
            <h3 className="font-semibold text-gray-900">Performance Bonuses</h3>
            <p className="text-sm text-gray-600 mt-1">Earn up to $500 per referral milestone</p>
          </div>
          <div className="bg-white rounded-lg p-6 text-center border border-green-200">
            <div className="text-3xl mb-2">✅</div>
            <h3 className="font-semibold text-gray-900">Monthly Payouts</h3>
            <p className="text-sm text-gray-600 mt-1">Get paid via PayPal, Stripe, or bank transfer</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`flex items-center justify-center h-10 w-10 rounded-full font-semibold ${
                  step >= stepNum ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {stepNum}
                </div>
                {stepNum < 3 && (
                  <div className={`h-1 w-12 ${step > stepNum ? 'bg-blue-600' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between max-w-md mx-auto mt-2 text-sm text-gray-600">
            <span>Personal Info</span>
            <span>Marketing</span>
            <span>Payment</span>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-2">
            {step === 1 && 'Personal Information'}
            {step === 2 && 'Marketing & Experience'}
            {step === 3 && 'Payment & Terms'}
          </h2>
          <p className="text-gray-600 mb-6">
            {step === 1 && 'Tell us about yourself'}
            {step === 2 && 'Share your marketing approach'}
            {step === 3 && 'Choose your payout method'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* STEP 1 */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => updateField('fullName', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.fullName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="John Smith"
                  />
                  {errors.fullName && (
                    <p className="text-sm text-red-600 mt-1">{errors.fullName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="john@example.com"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                    Country *
                  </label>
                  <select
                    id="country"
                    value={formData.country}
                    onChange={(e) => updateField('country', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.country ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select your country</option>
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="GB">United Kingdom</option>
                    <option value="AU">Australia</option>
                    <option value="NG">Nigeria</option>
                    <option value="KE">Kenya</option>
                    <option value="ZA">South Africa</option>
                    <option value="OTHER">Other</option>
                  </select>
                  {errors.country && (
                    <p className="text-sm text-red-600 mt-1">{errors.country}</p>
                  )}
                </div>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                    Website URL
                  </label>
                  <input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => updateField('website', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://yourchurch.com"
                  />
                </div>

                <div>
                  <label htmlFor="socialMedia" className="block text-sm font-medium text-gray-700 mb-1">
                    Social Media Profile
                  </label>
                  <input
                    id="socialMedia"
                    type="text"
                    value={formData.socialMedia}
                    onChange={(e) => updateField('socialMedia', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="@yourusername"
                  />
                  {errors.website && (
                    <p className="text-sm text-red-600 mt-1">{errors.website}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="experienceLevel" className="block text-sm font-medium text-gray-700 mb-1">
                    Marketing Experience
                  </label>
                  <select
                    id="experienceLevel"
                    value={formData.experienceLevel}
                    onChange={(e) => updateField('experienceLevel', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="monthlyTraffic" className="block text-sm font-medium text-gray-700 mb-1">
                    Monthly Traffic/Reach
                  </label>
                  <select
                    id="monthlyTraffic"
                    value={formData.monthlyTraffic}
                    onChange={(e) => updateField('monthlyTraffic', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select range</option>
                    <option value="0-1000">0 - 1,000</option>
                    <option value="1000-5000">1,000 - 5,000</option>
                    <option value="5000-10000">5,000 - 10,000</option>
                    <option value="10000+">10,000+</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="marketingPlan" className="block text-sm font-medium text-gray-700 mb-1">
                    How will you promote Smart eQuiz? *
                  </label>
                  <textarea
                    id="marketingPlan"
                    value={formData.marketingPlan}
                    onChange={(e) => updateField('marketingPlan', e.target.value)}
                    rows={5}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.marketingPlan ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Describe your marketing strategy..."
                  />
                  {errors.marketingPlan && (
                    <p className="text-sm text-red-600 mt-1">{errors.marketingPlan}</p>
                  )}
                </div>
              </div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="payoutMethod" className="block text-sm font-medium text-gray-700 mb-1">
                    Payout Method *
                  </label>
                  <select
                    id="payoutMethod"
                    value={formData.payoutMethod}
                    onChange={(e) => updateField('payoutMethod', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="paypal">PayPal</option>
                    <option value="stripe">Stripe</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="crypto">Cryptocurrency</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="payoutCurrency" className="block text-sm font-medium text-gray-700 mb-1">
                    Currency *
                  </label>
                  <select
                    id="payoutCurrency"
                    value={formData.payoutCurrency}
                    onChange={(e) => updateField('payoutCurrency', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="CAD">CAD</option>
                  </select>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-3">Commission Structure</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-800">🥉 Bronze</span>
                      <span className="font-semibold">20% for 3 months</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-800">🥈 Silver</span>
                      <span className="font-semibold">25% for 6 months</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-800">🥇 Gold</span>
                      <span className="font-semibold">30% for 12 months</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-800">💎 Platinum</span>
                      <span className="font-semibold">35% for 24 months</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-4">
                  <input
                    type="checkbox"
                    id="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={(e) => updateField('agreeToTerms', e.target.checked)}
                    className="mt-1"
                  />
                  <label htmlFor="agreeToTerms" className="text-sm cursor-pointer">
                    I agree to the <Link href="/terms" className="text-blue-600 hover:underline">Terms & Conditions</Link> and <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
                  </label>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-4 border-t">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
              ) : (
                <div></div>
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Next Step →
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Submit Application
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
