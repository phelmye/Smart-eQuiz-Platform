import React, { useState, useEffect } from 'react';
import type { MarketingContent } from '@repo/types/marketing';

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

  // Fetch current marketing content from API
  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/marketing/content', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch marketing content');
      }

      const data = await response.json();
      setContent(data);
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

      const response = await fetch('/api/marketing/content', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          content,
          changeNotes: changeNotes || 'Content updated via CMS',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save marketing content');
      }

      const updatedContent = await response.json();
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
      contact: { ...content.contact, [field]: value },
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
          Marketing Content Manager
        </h1>
        <p style={{ color: '#6b7280' }}>
          Control all aspects of your marketing website content. Changes take effect immediately.
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
                  value={content.contact.email}
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
                  value={content.contact.phone}
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
                  value={content.contact.address}
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

        {/* Other tabs */}
        {['features', 'testimonials', 'pricing', 'blog', 'legal'].includes(activeTab) && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', textTransform: 'capitalize' }}>
              {activeTab} Editor
            </h2>
            <p>Advanced {activeTab} management coming soon. Full CRUD interface with drag-and-drop ordering.</p>
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
    </div>
  );
}
