import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, Eye, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';

// Types for marketing content
interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  publishedAt: string;
  featuredImage: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published';
}

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  order: number;
}

interface Testimonial {
  id: string;
  name: string;
  role: string;
  organization: string;
  quote: string;
  avatar: string;
  rating: number;
  featured: boolean;
}

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  highlighted: boolean;
  ctaText: string;
  ctaLink: string;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
}

interface HeroContent {
  headline: string;
  subheadline: string;
  ctaPrimary: string;
  ctaSecondary: string;
  ctaPrimaryLink: string;
  ctaSecondaryLink: string;
  backgroundImage: string;
  videoUrl?: string;
}

export function MarketingContentManager() {
  const [activeSection, setActiveSection] = useState<string>('hero');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Section data
  const [hero, setHero] = useState<HeroContent>({
    headline: 'Transform Bible Learning with Smart eQuiz',
    subheadline: 'Create engaging quiz tournaments for your congregation',
    ctaPrimary: 'Start Free Trial',
    ctaSecondary: 'Watch Demo',
    ctaPrimaryLink: '/signup',
    ctaSecondaryLink: '/demo',
    backgroundImage: '/images/hero-bg.jpg',
  });
  
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
  const [faqs, setFAQs] = useState<FAQ[]>([]);

  // Modal states
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [editingPricing, setEditingPricing] = useState<PricingPlan | null>(null);
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);

  useEffect(() => {
    loadContent();
  }, [activeSection]);

  const loadContent = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load from localStorage (in production, replace with API calls)
      const storedBlogPosts = localStorage.getItem('marketing_blog_posts');
      const storedFeatures = localStorage.getItem('marketing_features');
      const storedTestimonials = localStorage.getItem('marketing_testimonials');
      const storedPricing = localStorage.getItem('marketing_pricing');
      const storedFAQs = localStorage.getItem('marketing_faqs');
      const storedHero = localStorage.getItem('marketing_hero');

      if (storedBlogPosts) setBlogPosts(JSON.parse(storedBlogPosts));
      if (storedFeatures) setFeatures(JSON.parse(storedFeatures));
      if (storedTestimonials) setTestimonials(JSON.parse(storedTestimonials));
      if (storedPricing) setPricingPlans(JSON.parse(storedPricing));
      if (storedFAQs) setFAQs(JSON.parse(storedFAQs));
      if (storedHero) setHero(JSON.parse(storedHero));
    } catch (err) {
      setError('Failed to load content');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const saveContent = async (type: string, data: any) => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      localStorage.setItem(`marketing_${type}`, JSON.stringify(data));
      setSuccess(`${type} saved successfully!`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(`Failed to save ${type}`);
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Blog post management
  const addBlogPost = () => {
    const newPost: BlogPost = {
      id: Date.now().toString(),
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      author: '',
      publishedAt: new Date().toISOString(),
      featuredImage: '',
      category: 'general',
      tags: [],
      status: 'draft',
    };
    setEditingBlog(newPost);
  };

  const saveBlogPost = async () => {
    if (!editingBlog) return;
    
    const updated = blogPosts.some(p => p.id === editingBlog.id)
      ? blogPosts.map(p => p.id === editingBlog.id ? editingBlog : p)
      : [...blogPosts, editingBlog];
    
    setBlogPosts(updated);
    await saveContent('blog_posts', updated);
    setEditingBlog(null);
  };

  const deleteBlogPost = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;
    const updated = blogPosts.filter(p => p.id !== id);
    setBlogPosts(updated);
    await saveContent('blog_posts', updated);
  };

  // Feature management
  const addFeature = () => {
    const newFeature: Feature = {
      id: Date.now().toString(),
      title: '',
      description: '',
      icon: 'star',
      category: 'core',
      order: features.length,
    };
    setEditingFeature(newFeature);
  };

  const saveFeature = async () => {
    if (!editingFeature) return;
    
    const updated = features.some(f => f.id === editingFeature.id)
      ? features.map(f => f.id === editingFeature.id ? editingFeature : f)
      : [...features, editingFeature];
    
    setFeatures(updated);
    await saveContent('features', updated);
    setEditingFeature(null);
  };

  const deleteFeature = async (id: string) => {
    if (!confirm('Are you sure you want to delete this feature?')) return;
    const updated = features.filter(f => f.id !== id);
    setFeatures(updated);
    await saveContent('features', updated);
  };

  // Testimonial management
  const addTestimonial = () => {
    const newTestimonial: Testimonial = {
      id: Date.now().toString(),
      name: '',
      role: '',
      organization: '',
      quote: '',
      avatar: '',
      rating: 5,
      featured: false,
    };
    setEditingTestimonial(newTestimonial);
  };

  const saveTestimonial = async () => {
    if (!editingTestimonial) return;
    
    const updated = testimonials.some(t => t.id === editingTestimonial.id)
      ? testimonials.map(t => t.id === editingTestimonial.id ? editingTestimonial : t)
      : [...testimonials, editingTestimonial];
    
    setTestimonials(updated);
    await saveContent('testimonials', updated);
    setEditingTestimonial(null);
  };

  const deleteTestimonial = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;
    const updated = testimonials.filter(t => t.id !== id);
    setTestimonials(updated);
    await saveContent('testimonials', updated);
  };

  // Pricing plan management
  const addPricingPlan = () => {
    const newPlan: PricingPlan = {
      id: Date.now().toString(),
      name: '',
      price: 0,
      interval: 'month',
      features: [],
      highlighted: false,
      ctaText: 'Get Started',
      ctaLink: '/signup',
    };
    setEditingPricing(newPlan);
  };

  const savePricingPlan = async () => {
    if (!editingPricing) return;
    
    const updated = pricingPlans.some(p => p.id === editingPricing.id)
      ? pricingPlans.map(p => p.id === editingPricing.id ? editingPricing : p)
      : [...pricingPlans, editingPricing];
    
    setPricingPlans(updated);
    await saveContent('pricing', updated);
    setEditingPricing(null);
  };

  const deletePricingPlan = async (id: string) => {
    if (!confirm('Are you sure you want to delete this pricing plan?')) return;
    const updated = pricingPlans.filter(p => p.id !== id);
    setPricingPlans(updated);
    await saveContent('pricing', updated);
  };

  // FAQ management
  const addFAQ = () => {
    const newFAQ: FAQ = {
      id: Date.now().toString(),
      question: '',
      answer: '',
      category: 'general',
      order: faqs.length,
    };
    setEditingFAQ(newFAQ);
  };

  const saveFAQ = async () => {
    if (!editingFAQ) return;
    
    const updated = faqs.some(f => f.id === editingFAQ.id)
      ? faqs.map(f => f.id === editingFAQ.id ? editingFAQ : f)
      : [...faqs, editingFAQ];
    
    setFAQs(updated);
    await saveContent('faqs', updated);
    setEditingFAQ(null);
  };

  const deleteFAQ = async (id: string) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;
    const updated = faqs.filter(f => f.id !== id);
    setFAQs(updated);
    await saveContent('faqs', updated);
  };

  // Save hero content
  const saveHero = async () => {
    await saveContent('hero', hero);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Marketing Content Management</h1>
        <p className="text-gray-600">Manage all content for the marketing website</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          {success}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-4">
          {['hero', 'blog', 'features', 'testimonials', 'pricing', 'faqs'].map(section => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className={`pb-4 px-2 font-medium capitalize ${
                activeSection === section
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {section}
            </button>
          ))}
        </nav>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading content...</p>
        </div>
      ) : (
        <>
          {/* Hero Section */}
          {activeSection === 'hero' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-6">Hero Section</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Headline</label>
                  <input
                    type="text"
                    value={hero.headline}
                    onChange={(e) => setHero({ ...hero, headline: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Subheadline</label>
                  <textarea
                    value={hero.subheadline}
                    onChange={(e) => setHero({ ...hero, subheadline: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Primary CTA Text</label>
                    <input
                      type="text"
                      value={hero.ctaPrimary}
                      onChange={(e) => setHero({ ...hero, ctaPrimary: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Primary CTA Link</label>
                    <input
                      type="text"
                      value={hero.ctaPrimaryLink}
                      onChange={(e) => setHero({ ...hero, ctaPrimaryLink: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Secondary CTA Text</label>
                    <input
                      type="text"
                      value={hero.ctaSecondary}
                      onChange={(e) => setHero({ ...hero, ctaSecondary: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Secondary CTA Link</label>
                    <input
                      type="text"
                      value={hero.ctaSecondaryLink}
                      onChange={(e) => setHero({ ...hero, ctaSecondaryLink: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Background Image URL</label>
                  <input
                    type="text"
                    value={hero.backgroundImage}
                    onChange={(e) => setHero({ ...hero, backgroundImage: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Video URL (Optional)</label>
                  <input
                    type="text"
                    value={hero.videoUrl || ''}
                    onChange={(e) => setHero({ ...hero, videoUrl: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>

                <button
                  onClick={saveHero}
                  disabled={saving}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save Hero Content'}
                </button>
              </div>
            </div>
          )}

          {/* Blog Posts Section */}
          {activeSection === 'blog' && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Blog Posts</h2>
                <button
                  onClick={addBlogPost}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Post
                </button>
              </div>

              <div className="grid gap-4">
                {blogPosts.map(post => (
                  <div key={post.id} className="border rounded-lg p-4 flex justify-between items-start">
                    <div>
                      <h3 className="font-bold">{post.title || 'Untitled Post'}</h3>
                      <p className="text-sm text-gray-600">{post.excerpt}</p>
                      <div className="mt-2 flex gap-2">
                        <span className={`px-2 py-1 text-xs rounded ${
                          post.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {post.status}
                        </span>
                        <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">{post.category}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingBlog(post)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteBlogPost(post.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {blogPosts.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    No blog posts yet. Click "Add Post" to create one.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Features Section */}
          {activeSection === 'features' && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Features</h2>
                <button
                  onClick={addFeature}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Feature
                </button>
              </div>

              <div className="grid gap-4">
                {features.map(feature => (
                  <div key={feature.id} className="border rounded-lg p-4 flex justify-between items-start">
                    <div>
                      <h3 className="font-bold">{feature.title || 'Untitled Feature'}</h3>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                      <span className="mt-2 inline-block px-2 py-1 text-xs rounded bg-purple-100 text-purple-800">
                        {feature.category}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingFeature(feature)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteFeature(feature.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {features.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    No features yet. Click "Add Feature" to create one.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Testimonials Section */}
          {activeSection === 'testimonials' && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Testimonials</h2>
                <button
                  onClick={addTestimonial}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Testimonial
                </button>
              </div>

              <div className="grid gap-4">
                {testimonials.map(testimonial => (
                  <div key={testimonial.id} className="border rounded-lg p-4 flex justify-between items-start">
                    <div>
                      <h3 className="font-bold">{testimonial.name}</h3>
                      <p className="text-sm text-gray-600">{testimonial.role} at {testimonial.organization}</p>
                      <p className="mt-2 text-sm italic">"{testimonial.quote}"</p>
                      <div className="mt-2 flex gap-2">
                        <span className="text-yellow-500">{'★'.repeat(testimonial.rating)}</span>
                        {testimonial.featured && (
                          <span className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-800">Featured</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingTestimonial(testimonial)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteTestimonial(testimonial.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {testimonials.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    No testimonials yet. Click "Add Testimonial" to create one.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Pricing Plans Section */}
          {activeSection === 'pricing' && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Pricing Plans</h2>
                <button
                  onClick={addPricingPlan}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Plan
                </button>
              </div>

              <div className="grid gap-4">
                {pricingPlans.map(plan => (
                  <div key={plan.id} className="border rounded-lg p-4 flex justify-between items-start">
                    <div>
                      <h3 className="font-bold">{plan.name || 'Untitled Plan'}</h3>
                      <p className="text-2xl font-bold text-blue-600">
                        ${plan.price}<span className="text-sm text-gray-600">/{plan.interval}</span>
                      </p>
                      <ul className="mt-2 text-sm space-y-1">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <span className="text-green-500">✓</span> {feature}
                          </li>
                        ))}
                      </ul>
                      {plan.highlighted && (
                        <span className="mt-2 inline-block px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">
                          Most Popular
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingPricing(plan)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deletePricingPlan(plan.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {pricingPlans.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    No pricing plans yet. Click "Add Plan" to create one.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* FAQs Section */}
          {activeSection === 'faqs' && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">FAQs</h2>
                <button
                  onClick={addFAQ}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add FAQ
                </button>
              </div>

              <div className="grid gap-4">
                {faqs.map(faq => (
                  <div key={faq.id} className="border rounded-lg p-4 flex justify-between items-start">
                    <div>
                      <h3 className="font-bold">{faq.question || 'Untitled Question'}</h3>
                      <p className="mt-2 text-sm text-gray-600">{faq.answer}</p>
                      <span className="mt-2 inline-block px-2 py-1 text-xs rounded bg-gray-100 text-gray-800">
                        {faq.category}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingFAQ(faq)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteFAQ(faq.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {faqs.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    No FAQs yet. Click "Add FAQ" to create one.
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Edit Modals */}
      {editingBlog && (
        <EditBlogModal
          blog={editingBlog}
          onChange={setEditingBlog}
          onSave={saveBlogPost}
          onCancel={() => setEditingBlog(null)}
        />
      )}

      {editingFeature && (
        <EditFeatureModal
          feature={editingFeature}
          onChange={setEditingFeature}
          onSave={saveFeature}
          onCancel={() => setEditingFeature(null)}
        />
      )}

      {editingTestimonial && (
        <EditTestimonialModal
          testimonial={editingTestimonial}
          onChange={setEditingTestimonial}
          onSave={saveTestimonial}
          onCancel={() => setEditingTestimonial(null)}
        />
      )}

      {editingPricing && (
        <EditPricingModal
          plan={editingPricing}
          onChange={setEditingPricing}
          onSave={savePricingPlan}
          onCancel={() => setEditingPricing(null)}
        />
      )}

      {editingFAQ && (
        <EditFAQModal
          faq={editingFAQ}
          onChange={setEditingFAQ}
          onSave={saveFAQ}
          onCancel={() => setEditingFAQ(null)}
        />
      )}
    </div>
  );
}

// Modal Components
function EditBlogModal({ blog, onChange, onSave, onCancel }: any) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
          <h2 className="text-2xl font-bold">Edit Blog Post</h2>
          <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              value={blog.title}
              onChange={(e) => onChange({ ...blog, title: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Slug</label>
            <input
              type="text"
              value={blog.slug}
              onChange={(e) => onChange({ ...blog, slug: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="url-friendly-slug"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Excerpt</label>
            <textarea
              value={blog.excerpt}
              onChange={(e) => onChange({ ...blog, excerpt: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Content</label>
            <textarea
              value={blog.content}
              onChange={(e) => onChange({ ...blog, content: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg font-mono text-sm"
              rows={15}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Author</label>
              <input
                type="text"
                value={blog.author}
                onChange={(e) => onChange({ ...blog, author: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                value={blog.category}
                onChange={(e) => onChange({ ...blog, category: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="general">General</option>
                <option value="tutorials">Tutorials</option>
                <option value="updates">Updates</option>
                <option value="case-studies">Case Studies</option>
                <option value="tips">Tips & Best Practices</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Featured Image URL</label>
            <input
              type="text"
              value={blog.featuredImage}
              onChange={(e) => onChange({ ...blog, featuredImage: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              value={blog.status}
              onChange={(e) => onChange({ ...blog, status: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>

        <div className="p-6 border-t flex justify-end gap-4 sticky bottom-0 bg-white">
          <button
            onClick={onCancel}
            className="px-6 py-2 border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Post
          </button>
        </div>
      </div>
    </div>
  );
}

function EditFeatureModal({ feature, onChange, onSave, onCancel }: any) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold">Edit Feature</h2>
          <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              value={feature.title}
              onChange={(e) => onChange({ ...feature, title: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={feature.description}
              onChange={(e) => onChange({ ...feature, description: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Icon (Lucide icon name)</label>
              <input
                type="text"
                value={feature.icon}
                onChange={(e) => onChange({ ...feature, icon: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="star, zap, shield, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                value={feature.category}
                onChange={(e) => onChange({ ...feature, category: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="core">Core Features</option>
                <option value="advanced">Advanced</option>
                <option value="enterprise">Enterprise</option>
                <option value="integrations">Integrations</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-6 border-t flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="px-6 py-2 border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Feature
          </button>
        </div>
      </div>
    </div>
  );
}

function EditTestimonialModal({ testimonial, onChange, onSave, onCancel }: any) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold">Edit Testimonial</h2>
          <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <input
                type="text"
                value={testimonial.name}
                onChange={(e) => onChange({ ...testimonial, name: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Role</label>
              <input
                type="text"
                value={testimonial.role}
                onChange={(e) => onChange({ ...testimonial, role: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="Pastor, Youth Leader, etc."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Organization</label>
            <input
              type="text"
              value={testimonial.organization}
              onChange={(e) => onChange({ ...testimonial, organization: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Quote</label>
            <textarea
              value={testimonial.quote}
              onChange={(e) => onChange({ ...testimonial, quote: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              rows={4}
              placeholder="What did they say about Smart eQuiz?"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Avatar URL</label>
              <input
                type="text"
                value={testimonial.avatar}
                onChange={(e) => onChange({ ...testimonial, avatar: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="https://example.com/avatar.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Rating</label>
              <select
                value={testimonial.rating}
                onChange={(e) => onChange({ ...testimonial, rating: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border rounded-lg"
              >
                {[1, 2, 3, 4, 5].map(num => (
                  <option key={num} value={num}>{num} Stars</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={testimonial.featured}
                onChange={(e) => onChange({ ...testimonial, featured: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm font-medium">Featured Testimonial (show on homepage)</span>
            </label>
          </div>
        </div>

        <div className="p-6 border-t flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="px-6 py-2 border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Testimonial
          </button>
        </div>
      </div>
    </div>
  );
}

function EditPricingModal({ plan, onChange, onSave, onCancel }: any) {
  const [newFeature, setNewFeature] = useState('');

  const addFeature = () => {
    if (newFeature.trim()) {
      onChange({ ...plan, features: [...plan.features, newFeature.trim()] });
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    onChange({ ...plan, features: plan.features.filter((_: any, i: number) => i !== index) });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
          <h2 className="text-2xl font-bold">Edit Pricing Plan</h2>
          <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Plan Name</label>
            <input
              type="text"
              value={plan.name}
              onChange={(e) => onChange({ ...plan, name: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="Free, Pro, Enterprise, etc."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Price ($)</label>
              <input
                type="number"
                value={plan.price}
                onChange={(e) => onChange({ ...plan, price: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 border rounded-lg"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Billing Interval</label>
              <select
                value={plan.interval}
                onChange={(e) => onChange({ ...plan, interval: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="month">per month</option>
                <option value="year">per year</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Features Included</label>
            <div className="space-y-2">
              {plan.features.map((feature: string, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => {
                      const updated = [...plan.features];
                      updated[index] = e.target.value;
                      onChange({ ...plan, features: updated });
                    }}
                    className="flex-1 px-4 py-2 border rounded-lg"
                  />
                  <button
                    onClick={() => removeFeature(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addFeature()}
                  placeholder="Add new feature..."
                  className="flex-1 px-4 py-2 border rounded-lg"
                />
                <button
                  onClick={addFeature}
                  className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">CTA Button Text</label>
              <input
                type="text"
                value={plan.ctaText}
                onChange={(e) => onChange({ ...plan, ctaText: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="Get Started, Contact Sales, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">CTA Link</label>
              <input
                type="text"
                value={plan.ctaLink}
                onChange={(e) => onChange({ ...plan, ctaLink: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="/signup, /contact, etc."
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={plan.highlighted}
                onChange={(e) => onChange({ ...plan, highlighted: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm font-medium">Highlight as "Most Popular" (shown with badge)</span>
            </label>
          </div>
        </div>

        <div className="p-6 border-t flex justify-end gap-4 sticky bottom-0 bg-white">
          <button
            onClick={onCancel}
            className="px-6 py-2 border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Plan
          </button>
        </div>
      </div>
    </div>
  );
}

function EditFAQModal({ faq, onChange, onSave, onCancel }: any) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold">Edit FAQ</h2>
          <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Question</label>
            <input
              type="text"
              value={faq.question}
              onChange={(e) => onChange({ ...faq, question: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="What is...?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Answer</label>
            <textarea
              value={faq.answer}
              onChange={(e) => onChange({ ...faq, answer: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              rows={6}
              placeholder="Provide a clear, helpful answer..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              value={faq.category}
              onChange={(e) => onChange({ ...faq, category: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="general">General</option>
              <option value="pricing">Pricing & Billing</option>
              <option value="technical">Technical</option>
              <option value="account">Account Management</option>
              <option value="features">Features</option>
            </select>
          </div>
        </div>

        <div className="p-6 border-t flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="px-6 py-2 border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save FAQ
          </button>
        </div>
      </div>
    </div>
  );
}
