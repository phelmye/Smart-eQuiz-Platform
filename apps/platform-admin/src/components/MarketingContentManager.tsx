import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Save, 
  Plus, 
  Trash2, 
  Eye, 
  Star, 
  Users, 
  DollarSign, 
  MessageSquare,
  Settings,
  Globe,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  organization: string;
  content: string;
  rating: number;
  initials: string;
  color: string;
}

interface SocialProof {
  activeUsers: string;
  churchesServed: string;
  quizzesHosted: string;
  customerRating: string;
}

interface PricingTier {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  highlighted: boolean;
  ctaText: string;
  ctaLink: string;
}

interface HeroSection {
  headline: string;
  subheadline: string;
  ctaPrimary: string;
  ctaSecondary: string;
  ctaPrimaryLink: string;
  ctaSecondaryLink: string;
}

interface ContactInfo {
  email: string;
  phone: string;
  address: string;
  supportHours: string;
}

interface MarketingContent {
  hero: HeroSection;
  socialProof: SocialProof;
  testimonials: Testimonial[];
  pricingTiers: PricingTier[];
  contactInfo: ContactInfo;
  features: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
  }>;
}

const defaultContent: MarketingContent = {
  hero: {
    headline: 'The Ultimate Bible Quiz Platform',
    subheadline: 'Empower your church community with engaging Bible quizzes, tournaments, and comprehensive learning tools',
    ctaPrimary: 'Start Free Trial',
    ctaSecondary: 'Watch Demo',
    ctaPrimaryLink: '/signup',
    ctaSecondaryLink: '#demo'
  },
  socialProof: {
    activeUsers: '2,500+',
    churchesServed: '500+',
    quizzesHosted: '50K+',
    customerRating: '4.9/5'
  },
  testimonials: [
    {
      id: '1',
      name: 'Sarah Mitchell',
      role: 'Youth Director',
      organization: 'Grace Community Church',
      content: 'Smart eQuiz has completely transformed our youth Bible quiz program. The AI question generation saves us hours of preparation time, and the kids love the interactive tournaments!',
      rating: 5,
      initials: 'SM',
      color: 'blue'
    },
    {
      id: '2',
      name: 'James Rodriguez',
      role: 'Regional Coordinator',
      organization: 'Bible Quiz Network',
      content: "We've been using Smart eQuiz for regional competitions, and the tournament management features are incredible. Everything runs smoothly, and the real-time scoring keeps everyone engaged.",
      rating: 5,
      initials: 'JR',
      color: 'green'
    },
    {
      id: '3',
      name: 'Emily Patterson',
      role: 'Education Director',
      organization: 'First Baptist Church',
      content: "The analytics and reporting features give us valuable insights into our students' progress. The custom branding makes it feel like our own platform. Highly recommend!",
      rating: 5,
      initials: 'EP',
      color: 'purple'
    }
  ],
  pricingTiers: [
    {
      id: '1',
      name: 'Free',
      price: '$0',
      period: '/month',
      description: 'Perfect for small groups getting started',
      features: ['Up to 10 participants', '100 questions', 'Basic analytics', 'Email support'],
      highlighted: false,
      ctaText: 'Get Started',
      ctaLink: '/signup?plan=free'
    },
    {
      id: '2',
      name: 'Pro',
      price: '$29',
      period: '/month',
      description: 'Ideal for growing church programs',
      features: ['Up to 100 participants', 'Unlimited questions', 'Advanced analytics', 'AI question generation', 'Priority support', 'Custom branding'],
      highlighted: true,
      ctaText: 'Start Free Trial',
      ctaLink: '/signup?plan=pro'
    },
    {
      id: '3',
      name: 'Professional',
      price: '$59',
      period: '/month',
      description: 'For established programs and regional competitions',
      features: ['Up to 500 participants', 'Everything in Pro', 'Tournament management', 'Multi-tenant support', 'Dedicated support', 'API access'],
      highlighted: false,
      ctaText: 'Contact Sales',
      ctaLink: '/contact'
    },
    {
      id: '4',
      name: 'Enterprise',
      price: '$99',
      period: '/month',
      description: 'For large organizations and networks',
      features: ['Unlimited participants', 'Everything in Professional', 'Custom domain', 'White-label option', 'SLA guarantee', 'Account manager'],
      highlighted: false,
      ctaText: 'Contact Sales',
      ctaLink: '/contact'
    }
  ],
  contactInfo: {
    email: 'support@smartequiz.com',
    phone: '+1 (555) 123-4567',
    address: '123 Church Street, Suite 100, Your City, ST 12345',
    supportHours: 'Monday - Friday: 9:00 AM - 6:00 PM EST'
  },
  features: [
    {
      id: '1',
      title: 'AI-Powered Question Generation',
      description: 'Generate high-quality Bible quiz questions instantly using advanced AI technology',
      icon: 'brain'
    },
    {
      id: '2',
      title: 'Real-Time Tournaments',
      description: 'Host engaging live tournaments with automatic scoring and bracket management',
      icon: 'trophy'
    },
    {
      id: '3',
      title: 'Advanced Analytics',
      description: 'Track participant progress with detailed analytics and performance insights',
      icon: 'chart'
    },
    {
      id: '4',
      title: 'Custom Branding',
      description: 'Personalize your quiz platform with custom colors, logos, and themes',
      icon: 'palette'
    },
    {
      id: '5',
      title: 'Multi-Tenant Architecture',
      description: 'Manage multiple organizations and churches from a single platform',
      icon: 'building'
    },
    {
      id: '6',
      title: 'Mobile Responsive',
      description: 'Fully responsive design works seamlessly on all devices',
      icon: 'smartphone'
    }
  ]
};

export default function MarketingContentManager() {
  const [content, setContent] = useState<MarketingContent>(defaultContent);
  const [activeTab, setActiveTab] = useState('hero');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // In production, this would send to API
    console.log('Saving marketing content:', content);
    localStorage.setItem('marketingContent', JSON.stringify(content));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const addTestimonial = () => {
    const newTestimonial: Testimonial = {
      id: Date.now().toString(),
      name: '',
      role: '',
      organization: '',
      content: '',
      rating: 5,
      initials: '',
      color: 'blue'
    };
    setContent({
      ...content,
      testimonials: [...content.testimonials, newTestimonial]
    });
  };

  const updateTestimonial = (id: string, field: keyof Testimonial, value: string | number) => {
    setContent({
      ...content,
      testimonials: content.testimonials.map(t =>
        t.id === id ? { ...t, [field]: value } : t
      )
    });
  };

  const deleteTestimonial = (id: string) => {
    setContent({
      ...content,
      testimonials: content.testimonials.filter(t => t.id !== id)
    });
  };

  const addPricingTier = () => {
    const newTier: PricingTier = {
      id: Date.now().toString(),
      name: '',
      price: '',
      period: '/month',
      description: '',
      features: [],
      highlighted: false,
      ctaText: 'Get Started',
      ctaLink: '/signup'
    };
    setContent({
      ...content,
      pricingTiers: [...content.pricingTiers, newTier]
    });
  };

  const updatePricingTier = (id: string, field: keyof PricingTier, value: any) => {
    setContent({
      ...content,
      pricingTiers: content.pricingTiers.map(t =>
        t.id === id ? { ...t, [field]: value } : t
      )
    });
  };

  const deletePricingTier = (id: string) => {
    setContent({
      ...content,
      pricingTiers: content.pricingTiers.filter(t => t.id !== id)
    });
  };

  const addFeatureToTier = (tierId: string) => {
    setContent({
      ...content,
      pricingTiers: content.pricingTiers.map(t =>
        t.id === tierId ? { ...t, features: [...t.features, ''] } : t
      )
    });
  };

  const updateTierFeature = (tierId: string, index: number, value: string) => {
    setContent({
      ...content,
      pricingTiers: content.pricingTiers.map(t =>
        t.id === tierId
          ? { ...t, features: t.features.map((f, i) => i === index ? value : f) }
          : t
      )
    });
  };

  const deleteTierFeature = (tierId: string, index: number) => {
    setContent({
      ...content,
      pricingTiers: content.pricingTiers.map(t =>
        t.id === tierId
          ? { ...t, features: t.features.filter((_, i) => i !== index) }
          : t
      )
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Marketing Content Manager</h1>
            <p className="text-gray-600 mt-2">
              Manage all content displayed on the marketing website
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>

        {saved && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <AlertDescription className="text-green-800">
              ✓ Marketing content saved successfully!
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-6 w-full">
            <TabsTrigger value="hero">Hero Section</TabsTrigger>
            <TabsTrigger value="social">Social Proof</TabsTrigger>
            <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="contact">Contact Info</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
          </TabsList>

          {/* Hero Section */}
          <TabsContent value="hero" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Hero Section Content</CardTitle>
                <CardDescription>Main headline and call-to-action buttons on homepage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Headline</Label>
                  <Input
                    value={content.hero.headline}
                    onChange={e => setContent({
                      ...content,
                      hero: { ...content.hero, headline: e.target.value }
                    })}
                    placeholder="Enter main headline"
                  />
                </div>
                <div>
                  <Label>Subheadline</Label>
                  <Textarea
                    value={content.hero.subheadline}
                    onChange={e => setContent({
                      ...content,
                      hero: { ...content.hero, subheadline: e.target.value }
                    })}
                    placeholder="Enter supporting text"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Primary CTA Text</Label>
                    <Input
                      value={content.hero.ctaPrimary}
                      onChange={e => setContent({
                        ...content,
                        hero: { ...content.hero, ctaPrimary: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label>Primary CTA Link</Label>
                    <Input
                      value={content.hero.ctaPrimaryLink}
                      onChange={e => setContent({
                        ...content,
                        hero: { ...content.hero, ctaPrimaryLink: e.target.value }
                      })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Secondary CTA Text</Label>
                    <Input
                      value={content.hero.ctaSecondary}
                      onChange={e => setContent({
                        ...content,
                        hero: { ...content.hero, ctaSecondary: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label>Secondary CTA Link</Label>
                    <Input
                      value={content.hero.ctaSecondaryLink}
                      onChange={e => setContent({
                        ...content,
                        hero: { ...content.hero, ctaSecondaryLink: e.target.value }
                      })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Social Proof */}
          <TabsContent value="social" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Social Proof Statistics</CardTitle>
                <CardDescription>Display key metrics to build trust and credibility</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Active Users</Label>
                  <Input
                    value={content.socialProof.activeUsers}
                    onChange={e => setContent({
                      ...content,
                      socialProof: { ...content.socialProof, activeUsers: e.target.value }
                    })}
                    placeholder="e.g., 2,500+"
                  />
                </div>
                <div>
                  <Label>Churches Served</Label>
                  <Input
                    value={content.socialProof.churchesServed}
                    onChange={e => setContent({
                      ...content,
                      socialProof: { ...content.socialProof, churchesServed: e.target.value }
                    })}
                    placeholder="e.g., 500+"
                  />
                </div>
                <div>
                  <Label>Quizzes Hosted</Label>
                  <Input
                    value={content.socialProof.quizzesHosted}
                    onChange={e => setContent({
                      ...content,
                      socialProof: { ...content.socialProof, quizzesHosted: e.target.value }
                    })}
                    placeholder="e.g., 50K+"
                  />
                </div>
                <div>
                  <Label>Customer Rating</Label>
                  <Input
                    value={content.socialProof.customerRating}
                    onChange={e => setContent({
                      ...content,
                      socialProof: { ...content.socialProof, customerRating: e.target.value }
                    })}
                    placeholder="e.g., 4.9/5"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Testimonials */}
          <TabsContent value="testimonials" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Customer Testimonials</h3>
                <p className="text-sm text-gray-600">Showcase positive feedback from satisfied customers</p>
              </div>
              <Button onClick={addTestimonial}>
                <Plus className="w-4 h-4 mr-2" />
                Add Testimonial
              </Button>
            </div>

            {content.testimonials.map((testimonial, index) => (
              <Card key={testimonial.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      <CardTitle className="text-lg">Testimonial #{index + 1}</CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteTestimonial(testimonial.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Name</Label>
                      <Input
                        value={testimonial.name}
                        onChange={e => updateTestimonial(testimonial.id, 'name', e.target.value)}
                        placeholder="Customer name"
                      />
                    </div>
                    <div>
                      <Label>Role</Label>
                      <Input
                        value={testimonial.role}
                        onChange={e => updateTestimonial(testimonial.id, 'role', e.target.value)}
                        placeholder="e.g., Youth Director"
                      />
                    </div>
                    <div>
                      <Label>Organization</Label>
                      <Input
                        value={testimonial.organization}
                        onChange={e => updateTestimonial(testimonial.id, 'organization', e.target.value)}
                        placeholder="Church or organization"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Testimonial Content</Label>
                    <Textarea
                      value={testimonial.content}
                      onChange={e => updateTestimonial(testimonial.id, 'content', e.target.value)}
                      placeholder="Customer feedback..."
                      rows={4}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Rating</Label>
                      <div className="flex items-center gap-1 mt-2">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star
                            key={star}
                            className={`w-5 h-5 cursor-pointer ${
                              star <= testimonial.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                            onClick={() => updateTestimonial(testimonial.id, 'rating', star)}
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label>Initials</Label>
                      <Input
                        value={testimonial.initials}
                        onChange={e => updateTestimonial(testimonial.id, 'initials', e.target.value)}
                        placeholder="e.g., SM"
                        maxLength={2}
                      />
                    </div>
                    <div>
                      <Label>Avatar Color</Label>
                      <select
                        value={testimonial.color}
                        onChange={e => updateTestimonial(testimonial.id, 'color', e.target.value)}
                        className="w-full px-3 py-2 border rounded-md"
                      >
                        <option value="blue">Blue</option>
                        <option value="green">Green</option>
                        <option value="purple">Purple</option>
                        <option value="red">Red</option>
                        <option value="yellow">Yellow</option>
                        <option value="pink">Pink</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Pricing */}
          <TabsContent value="pricing" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Pricing Tiers</h3>
                <p className="text-sm text-gray-600">Configure pricing plans and features</p>
              </div>
              <Button onClick={addPricingTier}>
                <Plus className="w-4 h-4 mr-2" />
                Add Pricing Tier
              </Button>
            </div>

            {content.pricingTiers.map((tier, index) => (
              <Card key={tier.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      <CardTitle className="text-lg">Pricing Tier #{index + 1}</CardTitle>
                      {tier.highlighted && (
                        <Badge className="bg-yellow-500">Most Popular</Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deletePricingTier(tier.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Plan Name</Label>
                      <Input
                        value={tier.name}
                        onChange={e => updatePricingTier(tier.id, 'name', e.target.value)}
                        placeholder="e.g., Pro"
                      />
                    </div>
                    <div>
                      <Label>Price</Label>
                      <Input
                        value={tier.price}
                        onChange={e => updatePricingTier(tier.id, 'price', e.target.value)}
                        placeholder="e.g., $29"
                      />
                    </div>
                    <div>
                      <Label>Period</Label>
                      <Input
                        value={tier.period}
                        onChange={e => updatePricingTier(tier.id, 'period', e.target.value)}
                        placeholder="e.g., /month"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={tier.description}
                      onChange={e => updatePricingTier(tier.id, 'description', e.target.value)}
                      placeholder="Brief description of this plan"
                      rows={2}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={tier.highlighted}
                      onChange={e => updatePricingTier(tier.id, 'highlighted', e.target.checked)}
                      className="w-4 h-4"
                    />
                    <Label>Highlight this tier (Most Popular)</Label>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label>Features</Label>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => addFeatureToTier(tier.id)}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add Feature
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {tier.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex gap-2">
                          <Input
                            value={feature}
                            onChange={e => updateTierFeature(tier.id, featureIndex, e.target.value)}
                            placeholder="Feature description"
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteTierFeature(tier.id, featureIndex)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>CTA Button Text</Label>
                      <Input
                        value={tier.ctaText}
                        onChange={e => updatePricingTier(tier.id, 'ctaText', e.target.value)}
                        placeholder="e.g., Get Started"
                      />
                    </div>
                    <div>
                      <Label>CTA Link</Label>
                      <Input
                        value={tier.ctaLink}
                        onChange={e => updatePricingTier(tier.id, 'ctaLink', e.target.value)}
                        placeholder="e.g., /signup?plan=pro"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Contact Info */}
          <TabsContent value="contact" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>Displayed on the contact page and footer</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </Label>
                  <Input
                    type="email"
                    value={content.contactInfo.email}
                    onChange={e => setContent({
                      ...content,
                      contactInfo: { ...content.contactInfo, email: e.target.value }
                    })}
                    placeholder="support@smartequiz.com"
                  />
                </div>
                <div>
                  <Label className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone Number
                  </Label>
                  <Input
                    value={content.contactInfo.phone}
                    onChange={e => setContent({
                      ...content,
                      contactInfo: { ...content.contactInfo, phone: e.target.value }
                    })}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div>
                  <Label className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Office Address
                  </Label>
                  <Textarea
                    value={content.contactInfo.address}
                    onChange={e => setContent({
                      ...content,
                      contactInfo: { ...content.contactInfo, address: e.target.value }
                    })}
                    placeholder="123 Church Street, Suite 100..."
                    rows={2}
                  />
                </div>
                <div>
                  <Label className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Support Hours
                  </Label>
                  <Input
                    value={content.contactInfo.supportHours}
                    onChange={e => setContent({
                      ...content,
                      contactInfo: { ...content.contactInfo, supportHours: e.target.value }
                    })}
                    placeholder="Monday - Friday: 9:00 AM - 6:00 PM EST"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Features */}
          <TabsContent value="features" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Platform Features</CardTitle>
                <CardDescription>Key features displayed on homepage and features page</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Feature management coming soon. Currently showing {content.features.length} features.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {content.features.map(feature => (
                    <div key={feature.id} className="p-4 border rounded-lg">
                      <h4 className="font-semibold">{feature.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Marketing Site Sync
          </h3>
          <p className="text-sm text-blue-800">
            Changes made here will be automatically synchronized to the marketing website. 
            In production, this connects to a CMS API or database that the marketing site reads from.
          </p>
        </div>
      </div>
    </div>
  );
}
