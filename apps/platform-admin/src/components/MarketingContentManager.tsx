import React, { useState, useEffect } from 'react';
import type { MarketingContent } from '@repo/types/marketing';
import { ImagePicker } from './ImagePicker';
import { PreviewFrame } from './PreviewFrame';
import { Eye, EyeOff } from 'lucide-react';

interface MarketingContentManagerProps {
  className?: string;
}

export function MarketingContentManager({ className }: MarketingContentManagerProps) {
  const [activeTab, setActiveTab] = useState('hero');
  const [content, setContent] = useState<MarketingContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changeNotes, setChangeNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Fetch current marketing content from API
  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to load from localStorage first
      const savedContent = localStorage.getItem('platform_marketing_content');
      
      if (savedContent) {
        setContent(JSON.parse(savedContent));
      } else {
        // Initialize with default content
        const defaultContent: MarketingContent = {
          hero: {
            headline: 'Transform Bible Learning with AI-Powered Quiz Tournaments',
            subheadline: 'Engage your congregation with interactive, competitive Bible study experiences.',
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
            customerRating: '4.9/5',
            updatedAt: new Date().toISOString()
          },
          testimonials: [],
          pricingTiers: [],
          contactInfo: {
            email: 'support@smartequiz.com',
            phone: '+1 (555) 123-4567',
            address: '123 Church Street, Suite 100',
            supportHours: 'Monday-Friday: 9AM-6PM EST'
          },
          features: [],
          metadata: {
            lastUpdated: new Date().toISOString(),
            version: '1.0',
            updatedBy: 'admin'
          }
        };
        setContent(defaultContent);
        localStorage.setItem('platform_marketing_content', JSON.stringify(defaultContent));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!content) return;

    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      // Update metadata
      const updatedContent = {
        ...content,
        metadata: {
          ...content.metadata,
          lastUpdated: new Date().toISOString(),
          updatedBy: 'admin'
        }
      };

      // Save to localStorage
      localStorage.setItem('platform_marketing_content', JSON.stringify(updatedContent));
      setContent(updatedContent);
      setSuccessMessage('Marketing content saved successfully!');
      setChangeNotes('');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save content');
    } finally {
      setSaving(false);
    }
  };

  const updateHero = (field: string, value: string) => {
    if (!content) return;
    setContent({
      ...content,
      hero: { ...content.hero, [field]: value },
    });
  };

  const updateSocialProof = (field: string, value: number) => {
    if (!content) return;
    setContent({
      ...content,
      socialProof: { ...content.socialProof, [field]: value },
    });
  };

  const updateContact = (field: string, value: string) => {
    if (!content) return;
    setContent({
      ...content,
      contactInfo: { ...content.contactInfo, [field]: value },
    });
  };

  if (loading) {
    return (
      <div className={className}>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.2rem', color: '#666' }}>Loading marketing content...</div>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className={className}>
        <div style={{ padding: '2rem', textAlign: 'center', color: '#dc2626' }}>
          Failed to load marketing content. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          Marketing Site Content Manager
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
          Manage content for the platform marketing website (www.smartequiz.com)
        </p>
        <p style={{ color: '#9ca3af', fontSize: '0.875rem', fontStyle: 'italic' }}>
          Note: Tenant-specific landing pages are managed by each tenant in their own dashboard
        </p>
      </div>

      {error && (
        <div style={{
          margin: '1rem',
          padding: '1rem',
          backgroundColor: '#fee2e2',
          border: '1px solid #dc2626',
          borderRadius: '0.375rem',
          color: '#dc2626'
        }}>
          {error}
        </div>
      )}

      {successMessage && (
        <div style={{
          margin: '1rem',
          padding: '1rem',
          backgroundColor: '#d1fae5',
          border: '1px solid #10b981',
          borderRadius: '0.375rem',
          color: '#065f46'
        }}>
          {successMessage}
        </div>
      )}

      <div style={{ padding: '1.5rem' }}>
        {/* Preview Toggle Button */}
        <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={() => setShowPreview(!showPreview)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              backgroundColor: showPreview ? '#3b82f6' : 'white',
              color: showPreview ? 'white' : '#1f2937',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
            }}
          >
            {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
        </div>

        {/* Main Content Area */}
        <div style={{ display: 'flex', gap: '1.5rem', flexDirection: showPreview ? 'row' : 'column' }}>
          {/* Editor Section */}
          <div style={{ flex: showPreview ? '1' : 'auto', minWidth: showPreview ? '500px' : 'auto' }}>
            {/* Tabs */}
            <div style={{ borderBottom: '1px solid #e5e7eb', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {['hero', 'features', 'testimonials', 'pricing', 'social', 'contact', 'blog', 'legal'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      padding: '0.75rem 1.5rem',
                      border: 'none',
                      borderBottom: activeTab === tab ? '2px solid #3b82f6' : '2px solid transparent',
                  background: 'none',
                  color: activeTab === tab ? '#3b82f6' : '#6b7280',
                  fontWeight: activeTab === tab ? '600' : '400',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  transition: 'all 0.2s',
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Hero Section */}
        {activeTab === 'hero' && (
          <div style={{ maxWidth: '800px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
              Hero Section
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>
                  Headline
                </label>
                <input
                  type="text"
                  value={content.hero.headline}
                  onChange={(e) => updateHero('headline', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '1rem',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>
                  Subheadline
                </label>
                <textarea
                  value={content.hero.subheadline}
                  onChange={(e) => updateHero('subheadline', e.target.value)}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '1rem',
                    resize: 'vertical',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>
                  CTA Text
                </label>
                <input
                  type="text"
                  value={content.hero.ctaText}
                  onChange={(e) => updateHero('ctaText', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '1rem',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>
                  CTA Link
                </label>
                <input
                  type="text"
                  value={content.hero.ctaLink}
                  onChange={(e) => updateHero('ctaLink', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '1rem',
                  }}
                />
              </div>
              
              <div>
                <ImagePicker
                  label="Background Image"
                  description="Hero section background image (recommended: 1920x1080px)"
                  value={content.hero.backgroundImage || ''}
                  onChange={(url) => updateHero('backgroundImage', url)}
                  category="hero-background"
                />
              </div>
            </div>
          </div>
        )}

        {/* Social Proof */}
        {activeTab === 'social' && (
          <div style={{ maxWidth: '800px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
              Social Proof Statistics
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>
                  Total Users
                </label>
                <input
                  type="number"
                  value={content.socialProof.totalUsers}
                  onChange={(e) => updateSocialProof('totalUsers', parseInt(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '1rem',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>
                  Churches Served
                </label>
                <input
                  type="number"
                  value={content.socialProof.totalChurches}
                  onChange={(e) => updateSocialProof('totalChurches', parseInt(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '1rem',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>
                  Questions Generated
                </label>
                <input
                  type="number"
                  value={content.socialProof.totalQuestions}
                  onChange={(e) => updateSocialProof('totalQuestions', parseInt(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '1rem',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>
                  Tournaments Hosted
                </label>
                <input
                  type="number"
                  value={content.socialProof.totalTournaments}
                  onChange={(e) => updateSocialProof('totalTournaments', parseInt(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '1rem',
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Contact Info */}
        {activeTab === 'contact' && (
          <div style={{ maxWidth: '800px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
              Contact Information
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>
                  Email
                </label>
                <input
                  type="email"
                  value={content.contactInfo.email}
                  onChange={(e) => updateContact('email', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '1rem',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>
                  Phone
                </label>
                <input
                  type="tel"
                  value={content.contactInfo.phone}
                  onChange={(e) => updateContact('phone', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '1rem',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>
                  Address
                </label>
                <textarea
                  value={content.contactInfo.address}
                  onChange={(e) => updateContact('address', e.target.value)}
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '1rem',
                    resize: 'vertical',
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Testimonials */}
        {activeTab === 'testimonials' && (
          <div style={{ maxWidth: '1200px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                Testimonials
              </h2>
              <button
                onClick={() => {
                  const newTestimonial = {
                    id: Date.now().toString(),
                    name: '',
                    role: '',
                    organization: '',
                    content: '',
                    rating: 5,
                    initials: '',
                    color: 'blue' as const,
                    avatar: '',
                  };
                  setContent({
                    ...content,
                    testimonials: [...content.testimonials, newTestimonial],
                  });
                }}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontWeight: '500',
                }}
              >
                + Add Testimonial
              </button>
            </div>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {content.testimonials.map((testimonial, index) => (
                <div
                  key={testimonial.id}
                  style={{
                    padding: '1.5rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    backgroundColor: 'white',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600' }}>
                      Testimonial #{index + 1}
                    </h3>
                    <button
                      onClick={() => {
                        setContent({
                          ...content,
                          testimonials: content.testimonials.filter((_, i) => i !== index),
                        });
                      }}
                      style={{
                        padding: '0.25rem 0.75rem',
                        backgroundColor: '#dc2626',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.375rem',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                      }}
                    >
                      Delete
                    </button>
                  </div>

                  <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
                    <div>
                      <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                        Name *
                      </label>
                      <input
                        type="text"
                        value={testimonial.name}
                        onChange={(e) => {
                          const updated = [...content.testimonials];
                          updated[index] = { ...testimonial, name: e.target.value };
                          setContent({ ...content, testimonials: updated });
                        }}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.375rem',
                          fontSize: '0.875rem',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                        Role *
                      </label>
                      <input
                        type="text"
                        value={testimonial.role}
                        onChange={(e) => {
                          const updated = [...content.testimonials];
                          updated[index] = { ...testimonial, role: e.target.value };
                          setContent({ ...content, testimonials: updated });
                        }}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.375rem',
                          fontSize: '0.875rem',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                        Organization *
                      </label>
                      <input
                        type="text"
                        value={testimonial.organization}
                        onChange={(e) => {
                          const updated = [...content.testimonials];
                          updated[index] = { ...testimonial, organization: e.target.value };
                          setContent({ ...content, testimonials: updated });
                        }}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.375rem',
                          fontSize: '0.875rem',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                        Rating
                      </label>
                      <select
                        value={testimonial.rating}
                        onChange={(e) => {
                          const updated = [...content.testimonials];
                          updated[index] = { ...testimonial, rating: parseInt(e.target.value) };
                          setContent({ ...content, testimonials: updated });
                        }}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.375rem',
                          fontSize: '0.875rem',
                        }}
                      >
                        {[1, 2, 3, 4, 5].map(rating => (
                          <option key={rating} value={rating}>{rating} Star{rating > 1 ? 's' : ''}</option>
                        ))}
                      </select>
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                        Testimonial Content *
                      </label>
                      <textarea
                        value={testimonial.content}
                        onChange={(e) => {
                          const updated = [...content.testimonials];
                          updated[index] = { ...testimonial, content: e.target.value };
                          setContent({ ...content, testimonials: updated });
                        }}
                        rows={3}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.375rem',
                          fontSize: '0.875rem',
                          resize: 'vertical',
                        }}
                      />
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                      <ImagePicker
                        label="Avatar Image"
                        description="Optional profile picture for the testimonial"
                        value={testimonial.avatar || ''}
                        onChange={(url) => {
                          const updated = [...content.testimonials];
                          updated[index] = { ...testimonial, avatar: url };
                          setContent({ ...content, testimonials: updated });
                        }}
                        category="testimonial-avatar"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {content.testimonials.length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                  <p>No testimonials yet. Click "Add Testimonial" to create your first one.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Features */}
        {activeTab === 'features' && (
          <div style={{ maxWidth: '1200px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                Features
              </h2>
              <button
                onClick={() => {
                  const newFeature = {
                    id: Date.now().toString(),
                    title: '',
                    description: '',
                    icon: '',
                    imageUrl: '',
                    enabled: true,
                  };
                  setContent({
                    ...content,
                    features: [...content.features, newFeature],
                  });
                }}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontWeight: '500',
                }}
              >
                + Add Feature
              </button>
            </div>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {content.features.map((feature: any, index: number) => (
                <div
                  key={feature.id}
                  style={{
                    padding: '1.5rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    backgroundColor: 'white',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600' }}>
                      Feature #{index + 1}
                    </h3>
                    <button
                      onClick={() => {
                        setContent({
                          ...content,
                          features: content.features.filter((_: any, i: number) => i !== index),
                        });
                      }}
                      style={{
                        padding: '0.25rem 0.75rem',
                        backgroundColor: '#dc2626',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.375rem',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                      }}
                    >
                      Delete
                    </button>
                  </div>

                  <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
                    <div>
                      <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                        Title *
                      </label>
                      <input
                        type="text"
                        value={feature.title}
                        onChange={(e) => {
                          const updated = [...content.features];
                          updated[index] = { ...feature, title: e.target.value };
                          setContent({ ...content, features: updated });
                        }}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.375rem',
                          fontSize: '0.875rem',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                        Icon Name
                      </label>
                      <input
                        type="text"
                        value={feature.icon}
                        placeholder="brain, trophy, users, etc."
                        onChange={(e) => {
                          const updated = [...content.features];
                          updated[index] = { ...feature, icon: e.target.value };
                          setContent({ ...content, features: updated });
                        }}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.375rem',
                          fontSize: '0.875rem',
                        }}
                      />
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                        Description *
                      </label>
                      <textarea
                        value={feature.description}
                        onChange={(e) => {
                          const updated = [...content.features];
                          updated[index] = { ...feature, description: e.target.value };
                          setContent({ ...content, features: updated });
                        }}
                        rows={2}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.375rem',
                          fontSize: '0.875rem',
                          resize: 'vertical',
                        }}
                      />
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                      <ImagePicker
                        label="Feature Icon/Image"
                        description="Icon or image representing this feature"
                        value={feature.imageUrl || ''}
                        onChange={(url) => {
                          const updated = [...content.features];
                          updated[index] = { ...feature, imageUrl: url };
                          setContent({ ...content, features: updated });
                        }}
                        category="feature-icon"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {content.features.length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                  <p>No features yet. Click "Add Feature" to create your first one.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pricing Tab */}
        {activeTab === 'pricing' && (
          <div style={{ maxWidth: '1200px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                Pricing Tiers
              </h2>
              <button
                onClick={() => {
                  const newTier = {
                    id: Date.now().toString(),
                    name: '',
                    price: '',
                    period: 'month',
                    description: '',
                    features: [],
                    highlighted: false,
                    ctaText: 'Get Started',
                    ctaLink: '/auth',
                    order: content.pricingTiers.length + 1,
                  };
                  setContent({
                    ...content,
                    pricingTiers: [...content.pricingTiers, newTier],
                  });
                }}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontWeight: '500',
                }}
              >
                + Add Pricing Tier
              </button>
            </div>

            <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
              {content.pricingTiers.map((tier, index) => (
                <div
                  key={tier.id}
                  style={{
                    padding: '1.5rem',
                    border: tier.highlighted ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    backgroundColor: 'white',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600' }}>
                      Tier #{index + 1}
                    </h3>
                    <button
                      onClick={() => {
                        setContent({
                          ...content,
                          pricingTiers: content.pricingTiers.filter((_, i) => i !== index),
                        });
                      }}
                      style={{
                        padding: '0.25rem 0.75rem',
                        backgroundColor: '#dc2626',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.375rem',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                      }}
                    >
                      Delete
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                        Tier Name *
                      </label>
                      <input
                        type="text"
                        value={tier.name}
                        placeholder="e.g., Professional"
                        onChange={(e) => {
                          const updated = [...content.pricingTiers];
                          updated[index] = { ...tier, name: e.target.value };
                          setContent({ ...content, pricingTiers: updated });
                        }}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.375rem',
                          fontSize: '0.875rem',
                        }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      <div>
                        <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                          Price *
                        </label>
                        <input
                          type="text"
                          value={tier.price}
                          placeholder="$49"
                          onChange={(e) => {
                            const updated = [...content.pricingTiers];
                            updated[index] = { ...tier, price: e.target.value };
                            setContent({ ...content, pricingTiers: updated });
                          }}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '0.375rem',
                            fontSize: '0.875rem',
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                          Period
                        </label>
                        <select
                          value={tier.period}
                          onChange={(e) => {
                            const updated = [...content.pricingTiers];
                            updated[index] = { ...tier, period: e.target.value };
                            setContent({ ...content, pricingTiers: updated });
                          }}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '0.375rem',
                            fontSize: '0.875rem',
                          }}
                        >
                          <option value="month">per month</option>
                          <option value="year">per year</option>
                          <option value="one-time">one-time</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                        Description
                      </label>
                      <textarea
                        value={tier.description}
                        placeholder="Perfect for growing teams"
                        onChange={(e) => {
                          const updated = [...content.pricingTiers];
                          updated[index] = { ...tier, description: e.target.value };
                          setContent({ ...content, pricingTiers: updated });
                        }}
                        rows={2}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.375rem',
                          fontSize: '0.875rem',
                          resize: 'vertical',
                        }}
                      />
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <input
                          type="checkbox"
                          checked={tier.highlighted}
                          onChange={(e) => {
                            const updated = [...content.pricingTiers];
                            updated[index] = { ...tier, highlighted: e.target.checked };
                            setContent({ ...content, pricingTiers: updated });
                          }}
                          id={`highlighted-${index}`}
                        />
                        <label htmlFor={`highlighted-${index}`} style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                          Highlight this tier (Most Popular)
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {content.pricingTiers.length === 0 && (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                <p>No pricing tiers yet. Click "Add Pricing Tier" to create your first one.</p>
              </div>
            )}
          </div>
        )}

        {/* Blog Tab */}
        {activeTab === 'blog' && (
          <div style={{ maxWidth: '1200px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
              Blog Management
            </h2>
            <div style={{ 
              padding: '2rem', 
              backgroundColor: '#f9fafb', 
              borderRadius: '0.5rem', 
              border: '1px dashed #d1d5db',
              textAlign: 'center'
            }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
                Blog System Coming Soon
              </h3>
              <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
                Full blog management with posts, categories, tags, SEO optimization, and rich text editor.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '2rem' }}>
                <div style={{ padding: '1rem', backgroundColor: 'white', borderRadius: '0.375rem' }}>
                  <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>✍️ Rich Text Editor</p>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>WYSIWYG editor for blog posts</p>
                </div>
                <div style={{ padding: '1rem', backgroundColor: 'white', borderRadius: '0.375rem' }}>
                  <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>📂 Categories & Tags</p>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Organize content effectively</p>
                </div>
                <div style={{ padding: '1rem', backgroundColor: 'white', borderRadius: '0.375rem' }}>
                  <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>🔍 SEO Optimization</p>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Meta tags, descriptions, keywords</p>
                </div>
                <div style={{ padding: '1rem', backgroundColor: 'white', borderRadius: '0.375rem' }}>
                  <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>📅 Scheduling</p>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Schedule posts for future dates</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Legal Tab */}
        {activeTab === 'legal' && (
          <div style={{ maxWidth: '1200px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
              Legal Pages Management
            </h2>
            <div style={{ 
              padding: '2rem', 
              backgroundColor: '#f9fafb', 
              borderRadius: '0.5rem', 
              border: '1px dashed #d1d5db',
              textAlign: 'center'
            }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
                Legal Pages System Coming Soon
              </h3>
              <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
                Manage Privacy Policy, Terms of Service, Cookie Policy, and other legal documents with version control.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '2rem' }}>
                <div style={{ padding: '1rem', backgroundColor: 'white', borderRadius: '0.375rem' }}>
                  <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>📄 Privacy Policy</p>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>GDPR compliant templates</p>
                </div>
                <div style={{ padding: '1rem', backgroundColor: 'white', borderRadius: '0.375rem' }}>
                  <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>📋 Terms of Service</p>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Customizable legal terms</p>
                </div>
                <div style={{ padding: '1rem', backgroundColor: 'white', borderRadius: '0.375rem' }}>
                  <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>🍪 Cookie Policy</p>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Cookie consent management</p>
                </div>
                <div style={{ padding: '1rem', backgroundColor: 'white', borderRadius: '0.375rem' }}>
                  <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>📜 Version Control</p>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Track changes and versions</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Change Notes */}
        <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #e5e7eb' }}>
          <div style={{ maxWidth: '800px' }}>
            <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>
              Change Notes (Optional)
            </label>
            <textarea
              value={changeNotes}
              onChange={(e) => setChangeNotes(e.target.value)}
              placeholder="Describe what you changed and why..."
              rows={2}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '1rem',
                resize: 'vertical',
                marginBottom: '1rem',
              }}
            />
          </div>
        </div>

        {/* Save Button */}
        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: saving ? '#9ca3af' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: saving ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseOver={(e) => {
              if (!saving) e.currentTarget.style.backgroundColor = '#2563eb';
            }}
            onMouseOut={(e) => {
              if (!saving) e.currentTarget.style.backgroundColor = '#3b82f6';
            }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            onClick={fetchContent}
            disabled={saving || loading}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: 'white',
              color: '#374151',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: (saving || loading) ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseOver={(e) => {
              if (!saving && !loading) e.currentTarget.style.backgroundColor = '#f3f4f6';
            }}
            onMouseOut={(e) => {
              if (!saving && !loading) e.currentTarget.style.backgroundColor = 'white';
            }}
          >
            Reload
          </button>
        </div>
          </div>

          {/* Preview Section */}
          {showPreview && content && (
            <div style={{ flex: '1', minWidth: '500px', height: '900px' }}>
              <PreviewFrame content={content} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
