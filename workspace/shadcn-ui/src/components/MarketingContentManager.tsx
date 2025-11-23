import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, RefreshCw, Eye, Globe, FileText, DollarSign, MessageSquare, Mail } from 'lucide-react';
import { storage, STORAGE_KEYS, User, hasPermission } from '@/lib/mockData';

interface MarketingContent {
  hero: {
    headline: string;
    subheadline: string;
    ctaPrimary: string;
    ctaSecondary: string;
    ctaPrimaryLink: string;
    ctaSecondaryLink: string;
    backgroundImage?: string;
  };
  socialProof: {
    activeUsers: string;
    churchesServed: string;
    quizzesHosted: string;
    customerRating: string;
  };
  contact: {
    email: string;
    phone: string;
    address: string;
    supportHours: string;
  };
  pricing: {
    currency: string;
    billingCycle: 'monthly' | 'annual';
  };
  metadata: {
    lastUpdated: string;
    updatedBy: string;
  };
}

interface MarketingContentManagerProps {
  user: User;
  onBack: () => void;
}

export const MarketingContentManager: React.FC<MarketingContentManagerProps> = ({ user, onBack }) => {
  const [content, setContent] = useState<MarketingContent | null>(null);
  const [activeTab, setActiveTab] = useState('hero');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Check permissions
  if (!hasPermission(user, 'system.configure')) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-bold text-red-600 mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-4">You need admin privileges to manage marketing content.</p>
            <Button onClick={onBack}>Back to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = () => {
    const savedContent = storage.get(STORAGE_KEYS.MARKETING_CONTENT);
    if (savedContent) {
      setContent(savedContent);
    } else {
      // Initialize with default content
      const defaultContent: MarketingContent = {
        hero: {
          headline: 'Transform Bible Learning with AI-Powered Quiz Tournaments',
          subheadline: 'Engage your congregation with interactive, competitive Bible study experiences. Create custom tournaments, track progress, and build stronger communities.',
          ctaPrimary: 'Get Started Free',
          ctaSecondary: 'Watch Demo',
          ctaPrimaryLink: '/auth',
          ctaSecondaryLink: '/demo',
          backgroundImage: '/images/hero-bg.jpg'
        },
        socialProof: {
          activeUsers: '10,000+',
          churchesServed: '500+',
          quizzesHosted: '50,000+',
          customerRating: '4.9/5'
        },
        contact: {
          email: 'support@smartequiz.com',
          phone: '+1 (555) 123-4567',
          address: '123 Church Street, Suite 100, City, State 12345',
          supportHours: 'Monday-Friday: 9AM-6PM EST'
        },
        pricing: {
          currency: 'USD',
          billingCycle: 'monthly'
        },
        metadata: {
          lastUpdated: new Date().toISOString(),
          updatedBy: user.email
        }
      };
      setContent(defaultContent);
      storage.set(STORAGE_KEYS.MARKETING_CONTENT, defaultContent);
    }
  };

  const handleSave = () => {
    if (!content) return;

    setIsSaving(true);
    setSaveMessage(null);

    // Update metadata
    const updatedContent = {
      ...content,
      metadata: {
        lastUpdated: new Date().toISOString(),
        updatedBy: user.email
      }
    };

    // Save to localStorage
    storage.set(STORAGE_KEYS.MARKETING_CONTENT, updatedContent);
    setContent(updatedContent);

    // Show success message
    setTimeout(() => {
      setIsSaving(false);
      setSaveMessage('Marketing content updated successfully!');
      setTimeout(() => setSaveMessage(null), 3000);
    }, 500);
  };

  const updateHero = (field: keyof MarketingContent['hero'], value: string) => {
    if (!content) return;
    setContent({
      ...content,
      hero: { ...content.hero, [field]: value }
    });
  };

  const updateSocialProof = (field: keyof MarketingContent['socialProof'], value: string) => {
    if (!content) return;
    setContent({
      ...content,
      socialProof: { ...content.socialProof, [field]: value }
    });
  };

  const updateContact = (field: keyof MarketingContent['contact'], value: string) => {
    if (!content) return;
    setContent({
      ...content,
      contact: { ...content.contact, [field]: value }
    });
  };

  const updatePricing = (field: keyof MarketingContent['pricing'], value: string) => {
    if (!content) return;
    setContent({
      ...content,
      pricing: { ...content.pricing, [field]: value }
    });
  };

  if (!content) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading marketing content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Marketing Content Manager</h1>
              <p className="text-gray-600 mt-1">Manage your marketing website content</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={loadContent}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        {saveMessage && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
            {saveMessage}
          </div>
        )}

        {content.metadata && (
          <div className="text-sm text-gray-500">
            Last updated: {new Date(content.metadata.lastUpdated).toLocaleString()} by {content.metadata.updatedBy}
          </div>
        )}
      </div>

      {/* Content Tabs */}
      <div className="max-w-6xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="hero">
              <Globe className="h-4 w-4 mr-2" />
              Hero Section
            </TabsTrigger>
            <TabsTrigger value="social-proof">
              <FileText className="h-4 w-4 mr-2" />
              Social Proof
            </TabsTrigger>
            <TabsTrigger value="contact">
              <Mail className="h-4 w-4 mr-2" />
              Contact Info
            </TabsTrigger>
            <TabsTrigger value="pricing">
              <DollarSign className="h-4 w-4 mr-2" />
              Pricing
            </TabsTrigger>
          </TabsList>

          {/* Hero Section Tab */}
          <TabsContent value="hero" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Hero Section</CardTitle>
                <CardDescription>Main landing page hero content</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="headline">Headline</Label>
                  <Input
                    id="headline"
                    value={content.hero.headline}
                    onChange={(e) => updateHero('headline', e.target.value)}
                    placeholder="Enter main headline"
                  />
                </div>

                <div>
                  <Label htmlFor="subheadline">Subheadline</Label>
                  <Textarea
                    id="subheadline"
                    value={content.hero.subheadline}
                    onChange={(e) => updateHero('subheadline', e.target.value)}
                    placeholder="Enter supporting text"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ctaPrimary">Primary CTA Text</Label>
                    <Input
                      id="ctaPrimary"
                      value={content.hero.ctaPrimary}
                      onChange={(e) => updateHero('ctaPrimary', e.target.value)}
                      placeholder="Get Started Free"
                    />
                  </div>

                  <div>
                    <Label htmlFor="ctaPrimaryLink">Primary CTA Link</Label>
                    <Input
                      id="ctaPrimaryLink"
                      value={content.hero.ctaPrimaryLink}
                      onChange={(e) => updateHero('ctaPrimaryLink', e.target.value)}
                      placeholder="/auth"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ctaSecondary">Secondary CTA Text</Label>
                    <Input
                      id="ctaSecondary"
                      value={content.hero.ctaSecondary}
                      onChange={(e) => updateHero('ctaSecondary', e.target.value)}
                      placeholder="Watch Demo"
                    />
                  </div>

                  <div>
                    <Label htmlFor="ctaSecondaryLink">Secondary CTA Link</Label>
                    <Input
                      id="ctaSecondaryLink"
                      value={content.hero.ctaSecondaryLink}
                      onChange={(e) => updateHero('ctaSecondaryLink', e.target.value)}
                      placeholder="/demo"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="backgroundImage">Background Image URL</Label>
                  <Input
                    id="backgroundImage"
                    value={content.hero.backgroundImage || ''}
                    onChange={(e) => updateHero('backgroundImage', e.target.value)}
                    placeholder="/images/hero-bg.jpg"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Social Proof Tab */}
          <TabsContent value="social-proof" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Social Proof Metrics</CardTitle>
                <CardDescription>Display key metrics and statistics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="activeUsers">Active Users</Label>
                    <Input
                      id="activeUsers"
                      value={content.socialProof.activeUsers}
                      onChange={(e) => updateSocialProof('activeUsers', e.target.value)}
                      placeholder="10,000+"
                    />
                  </div>

                  <div>
                    <Label htmlFor="churchesServed">Churches Served</Label>
                    <Input
                      id="churchesServed"
                      value={content.socialProof.churchesServed}
                      onChange={(e) => updateSocialProof('churchesServed', e.target.value)}
                      placeholder="500+"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quizzesHosted">Quizzes Hosted</Label>
                    <Input
                      id="quizzesHosted"
                      value={content.socialProof.quizzesHosted}
                      onChange={(e) => updateSocialProof('quizzesHosted', e.target.value)}
                      placeholder="50,000+"
                    />
                  </div>

                  <div>
                    <Label htmlFor="customerRating">Customer Rating</Label>
                    <Input
                      id="customerRating"
                      value={content.socialProof.customerRating}
                      onChange={(e) => updateSocialProof('customerRating', e.target.value)}
                      placeholder="4.9/5"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact Info Tab */}
          <TabsContent value="contact" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>Support and contact details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Support Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={content.contact.email}
                      onChange={(e) => updateContact('email', e.target.value)}
                      placeholder="support@smartequiz.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Support Phone</Label>
                    <Input
                      id="phone"
                      value={content.contact.phone}
                      onChange={(e) => updateContact('phone', e.target.value)}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Business Address</Label>
                  <Input
                    id="address"
                    value={content.contact.address}
                    onChange={(e) => updateContact('address', e.target.value)}
                    placeholder="123 Church Street, Suite 100"
                  />
                </div>

                <div>
                  <Label htmlFor="supportHours">Support Hours</Label>
                  <Input
                    id="supportHours"
                    value={content.contact.supportHours}
                    onChange={(e) => updateContact('supportHours', e.target.value)}
                    placeholder="Monday-Friday: 9AM-6PM EST"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pricing Tab */}
          <TabsContent value="pricing" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Pricing Settings</CardTitle>
                <CardDescription>Global pricing configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <Input
                      id="currency"
                      value={content.pricing.currency}
                      onChange={(e) => updatePricing('currency', e.target.value)}
                      placeholder="USD"
                    />
                  </div>

                  <div>
                    <Label htmlFor="billingCycle">Default Billing Cycle</Label>
                    <select
                      id="billingCycle"
                      value={content.pricing.billingCycle}
                      onChange={(e) => updatePricing('billingCycle', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="annual">Annual</option>
                    </select>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">Note</h3>
                  <p className="text-sm text-blue-700">
                    These settings apply to your marketing site's pricing display. For actual plan pricing and features, go to the Plans management page.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
