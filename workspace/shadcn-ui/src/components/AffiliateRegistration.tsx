import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, UserPlus, Mail, Globe, CreditCard, 
  TrendingUp, Gift, ArrowRight, AlertCircle 
} from 'lucide-react';
import { storage, STORAGE_KEYS, Affiliate } from '@/lib/mockData';

/**
 * Affiliate Registration Flow (Public Page)
 * 
 * Allows anyone to apply to become an affiliate partner
 * 
 * Features:
 * - Multi-step registration form
 * - Email verification (mock)
 * - Super admin approval workflow
 * - Clear commission tier information
 * - Marketing resource preview
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

export default function AffiliateRegistration() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [submitted, setSubmitted] = useState(false);

  const updateField = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
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

    // Generate affiliate code
    const affiliateCode = `AFF${Date.now().toString().slice(-6)}`;

    // Create new affiliate application
    const newAffiliate: Affiliate = {
      id: `aff-${Date.now()}`,
      fullName: formData.fullName,
      email: formData.email,
      country: formData.country,
      countryCode: formData.country, // In production, map country name to ISO code
      website: formData.website || '',
      socialMedia: formData.socialMedia || '',
      affiliateCode,
      status: 'pending',
      commissionTier: 'bronze',
      commissionRate: 20,
      payoutMethod: formData.payoutMethod,
      payoutCurrency: formData.payoutCurrency,
      createdAt: new Date().toISOString(),
      totalReferrals: 0,
      successfulConversions: 0,
      totalEarned: 0,
      pendingPayout: 0,
      marketingPlan: formData.marketingPlan,
      experienceLevel: formData.experienceLevel,
      monthlyTraffic: formData.monthlyTraffic
    };

    // Save to storage
    const affiliates = storage.get(STORAGE_KEYS.AFFILIATES) || [];
    affiliates.push(newAffiliate);
    storage.set(STORAGE_KEYS.AFFILIATES, affiliates);

    // TODO: Send verification email
    console.log('Affiliate application submitted:', newAffiliate);

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Application Submitted!</CardTitle>
            <CardDescription className="text-base mt-2">
              Thank you for applying to become a Smart eQuiz affiliate partner
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="bg-blue-50 border-blue-200">
              <Mail className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-900">
                <strong>Check your email!</strong> We've sent a verification link to <strong>{formData.email}</strong>
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">What happens next?</h4>
              <ol className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-600 font-semibold text-xs flex-shrink-0">1</span>
                  <span><strong>Verify your email</strong> - Click the link we sent you to confirm your email address</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-600 font-semibold text-xs flex-shrink-0">2</span>
                  <span><strong>Application review</strong> - Our team will review your application within 1-2 business days</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-600 font-semibold text-xs flex-shrink-0">3</span>
                  <span><strong>Get approved</strong> - Once approved, you'll receive your affiliate dashboard access and unique referral links</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-600 font-semibold text-xs flex-shrink-0">4</span>
                  <span><strong>Start earning</strong> - Begin promoting Smart eQuiz and earn commissions on every successful referral!</span>
                </li>
              </ol>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-semibold text-purple-900 mb-2">Your Commission Tier: Bronze</h4>
              <p className="text-sm text-purple-800">
                You'll start at our <strong>Bronze tier (20% commission)</strong>. As you refer more customers, you'll automatically progress to Silver (25%), Gold (30%), and Platinum (35%) tiers with increased bonuses!
              </p>
            </div>

            <Button 
              onClick={() => window.location.href = '/'}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Return to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge className="mb-4 bg-blue-600 text-white">Affiliate Program</Badge>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Become an Affiliate Partner
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Earn up to 35% recurring commission by promoting Smart eQuiz to churches, Bible study groups, and Christian organizations
          </p>
        </div>

        {/* Benefits Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-white border-blue-200">
            <CardContent className="pt-6 text-center">
              <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900">Up to 35% Commission</h3>
              <p className="text-sm text-gray-600 mt-1">Recurring revenue for up to 24 months</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-purple-200">
            <CardContent className="pt-6 text-center">
              <Gift className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900">Performance Bonuses</h3>
              <p className="text-sm text-gray-600 mt-1">Earn up to $500 per referral milestone</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-green-200">
            <CardContent className="pt-6 text-center">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900">Monthly Payouts</h3>
              <p className="text-sm text-gray-600 mt-1">Get paid via PayPal, Stripe, or bank transfer</p>
            </CardContent>
          </Card>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3].map((stepNum) => (
              <React.Fragment key={stepNum}>
                <div className={`flex items-center justify-center h-10 w-10 rounded-full font-semibold ${
                  step >= stepNum 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {stepNum}
                </div>
                {stepNum < 3 && (
                  <div className={`h-1 w-12 ${
                    step > stepNum ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="flex justify-between max-w-md mx-auto mt-2 text-sm text-gray-600">
            <span>Personal Info</span>
            <span>Marketing</span>
            <span>Payment</span>
          </div>
        </div>

        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>
              {step === 1 && 'Personal Information'}
              {step === 2 && 'Marketing & Experience'}
              {step === 3 && 'Payment & Terms'}
            </CardTitle>
            <CardDescription>
              {step === 1 && 'Tell us about yourself'}
              {step === 2 && 'Share your marketing approach and experience'}
              {step === 3 && 'Choose your payout method and review terms'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* STEP 1: Personal Information */}
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => updateField('fullName', e.target.value)}
                      placeholder="John Smith"
                      className={errors.fullName ? 'border-red-500' : ''}
                    />
                    {errors.fullName && (
                      <p className="text-sm text-red-600 mt-1">{errors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      placeholder="john@example.com"
                      className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="country">Country *</Label>
                    <select
                      id="country"
                      value={formData.country}
                      onChange={(e) => updateField('country', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md ${errors.country ? 'border-red-500' : ''}`}
                    >
                      <option value="">Select your country</option>
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="GB">United Kingdom</option>
                      <option value="AU">Australia</option>
                      <option value="NG">Nigeria</option>
                      <option value="KE">Kenya</option>
                      <option value="ZA">South Africa</option>
                      <option value="IN">India</option>
                      <option value="PH">Philippines</option>
                      <option value="BR">Brazil</option>
                      <option value="MX">Mexico</option>
                      <option value="OTHER">Other</option>
                    </select>
                    {errors.country && (
                      <p className="text-sm text-red-600 mt-1">{errors.country}</p>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 2: Marketing & Experience */}
              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="website">Website URL</Label>
                    <Input
                      id="website"
                      type="url"
                      value={formData.website}
                      onChange={(e) => updateField('website', e.target.value)}
                      placeholder="https://yourchurch.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="socialMedia">Social Media Profile</Label>
                    <Input
                      id="socialMedia"
                      value={formData.socialMedia}
                      onChange={(e) => updateField('socialMedia', e.target.value)}
                      placeholder="@yourusername or profile URL"
                    />
                    {errors.website && (
                      <p className="text-sm text-red-600 mt-1">{errors.website}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="experienceLevel">Affiliate Marketing Experience</Label>
                    <select
                      id="experienceLevel"
                      value={formData.experienceLevel}
                      onChange={(e) => updateField('experienceLevel', e.target.value as any)}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="beginner">Beginner - Just getting started</option>
                      <option value="intermediate">Intermediate - Some experience</option>
                      <option value="expert">Expert - Established affiliate marketer</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="monthlyTraffic">Estimated Monthly Traffic/Reach</Label>
                    <select
                      id="monthlyTraffic"
                      value={formData.monthlyTraffic}
                      onChange={(e) => updateField('monthlyTraffic', e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="">Select range</option>
                      <option value="0-1000">0 - 1,000 visitors/followers</option>
                      <option value="1000-5000">1,000 - 5,000 visitors/followers</option>
                      <option value="5000-10000">5,000 - 10,000 visitors/followers</option>
                      <option value="10000-50000">10,000 - 50,000 visitors/followers</option>
                      <option value="50000+">50,000+ visitors/followers</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="marketingPlan">How will you promote Smart eQuiz? *</Label>
                    <textarea
                      id="marketingPlan"
                      value={formData.marketingPlan}
                      onChange={(e) => updateField('marketingPlan', e.target.value)}
                      placeholder="Describe your marketing strategy, target audience, and promotional channels..."
                      rows={5}
                      className={`w-full px-3 py-2 border rounded-md ${errors.marketingPlan ? 'border-red-500' : ''}`}
                    />
                    {errors.marketingPlan && (
                      <p className="text-sm text-red-600 mt-1">{errors.marketingPlan}</p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">
                      Example: I manage a Christian blog with 10K monthly readers and will create review posts, tutorials, and social media campaigns targeting church youth groups.
                    </p>
                  </div>
                </div>
              )}

              {/* STEP 3: Payment & Terms */}
              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="payoutMethod">Preferred Payout Method *</Label>
                    <select
                      id="payoutMethod"
                      value={formData.payoutMethod}
                      onChange={(e) => updateField('payoutMethod', e.target.value as any)}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="paypal">PayPal</option>
                      <option value="stripe">Stripe (Bank Transfer)</option>
                      <option value="bank_transfer">Direct Bank Transfer</option>
                      <option value="crypto">Cryptocurrency</option>
                    </select>
                    <p className="text-sm text-gray-500 mt-1">
                      Minimum payout: $50 USD. Payouts processed monthly.
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="payoutCurrency">Payout Currency *</Label>
                    <select
                      id="payoutCurrency"
                      value={formData.payoutCurrency}
                      onChange={(e) => updateField('payoutCurrency', e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="CAD">CAD - Canadian Dollar</option>
                      <option value="AUD">AUD - Australian Dollar</option>
                      <option value="NGN">NGN - Nigerian Naira</option>
                      <option value="KES">KES - Kenyan Shilling</option>
                      <option value="ZAR">ZAR - South African Rand</option>
                    </select>
                  </div>

                  {/* Commission Tiers Info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-3">Commission Structure</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-blue-800">🥉 Bronze (Start here)</span>
                        <span className="font-semibold text-blue-900">20% for 3 months</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-800">🥈 Silver (10+ conversions)</span>
                        <span className="font-semibold text-blue-900">25% for 6 months + $50 bonus</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-800">🥇 Gold (50+ conversions)</span>
                        <span className="font-semibold text-blue-900">30% for 12 months + $100 bonus</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-800">💎 Platinum (100+ conversions)</span>
                        <span className="font-semibold text-blue-900">35% for 24 months + $500 bonus</span>
                      </div>
                    </div>
                  </div>

                  {/* Terms Checkbox */}
                  <div className="flex items-start gap-3 pt-4">
                    <input
                      type="checkbox"
                      id="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={(e) => updateField('agreeToTerms', e.target.checked)}
                      className="mt-1"
                    />
                    <Label htmlFor="agreeToTerms" className="text-sm cursor-pointer">
                      I agree to the <a href="/terms" className="text-blue-600 hover:underline">Affiliate Terms & Conditions</a> and <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>. I understand that my application will be reviewed and I must verify my email before approval.
                    </Label>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-4 border-t">
                {step > 1 ? (
                  <Button type="button" variant="outline" onClick={handleBack}>
                    Back
                  </Button>
                ) : (
                  <div></div>
                )}

                {step < 3 ? (
                  <Button type="button" onClick={handleNext} className="bg-blue-600 hover:bg-blue-700">
                    Next Step
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button type="submit" className="bg-green-600 hover:bg-green-700">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Submit Application
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer Note */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Questions? Contact our affiliate team at <a href="mailto:affiliates@smartequiz.com" className="text-blue-600 hover:underline">affiliates@smartequiz.com</a>
        </p>
      </div>
    </div>
  );
}
