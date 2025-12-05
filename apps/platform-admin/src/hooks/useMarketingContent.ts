import { useState, useEffect } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * React hook for Marketing CMS content management
 * 
 * Implementation: Full API integration with backend
 * 
 * Usage:
 * ```tsx
 * const { blogPosts, loading, error, saveBlogPost, deleteBlogPost } = useMarketingContent();
 * ```
 */

export interface BlogPost {
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

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  order: number;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  organization: string;
  quote: string;
  avatar: string;
  rating: number;
  featured: boolean;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  highlighted: boolean;
  ctaText: string;
  ctaLink: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
}

export interface HeroContent {
  headline: string;
  subheadline: string;
  ctaPrimary: string;
  ctaSecondary: string;
  ctaPrimaryLink: string;
  ctaSecondaryLink: string;
  backgroundImage: string;
  videoUrl?: string;
}

interface UseMarketingContentReturn {
  // Data
  blogPosts: BlogPost[];
  features: Feature[];
  testimonials: Testimonial[];
  pricingPlans: PricingPlan[];
  faqs: FAQ[];
  hero: HeroContent;
  
  // State
  loading: boolean;
  error: Error | null;
  saving: boolean;
  
  // Blog operations
  saveBlogPost: (post: BlogPost) => Promise<void>;
  deleteBlogPost: (id: string) => Promise<void>;
  
  // Feature operations
  saveFeature: (feature: Feature) => Promise<void>;
  deleteFeature: (id: string) => Promise<void>;
  
  // Testimonial operations
  saveTestimonial: (testimonial: Testimonial) => Promise<void>;
  deleteTestimonial: (id: string) => Promise<void>;
  
  // Pricing operations
  savePricingPlan: (plan: PricingPlan) => Promise<void>;
  deletePricingPlan: (id: string) => Promise<void>;
  
  // FAQ operations
  saveFAQ: (faq: FAQ) => Promise<void>;
  deleteFAQ: (id: string) => Promise<void>;
  
  // Hero operations
  saveHero: (hero: HeroContent) => Promise<void>;
  
  // Utility
  refetch: () => Promise<void>;
}

const DEFAULT_HERO: HeroContent = {
  headline: 'Transform Bible Learning with Smart eQuiz',
  subheadline: 'Create engaging quiz tournaments for your congregation',
  ctaPrimary: 'Start Free Trial',
  ctaSecondary: 'Watch Demo',
  ctaPrimaryLink: '/signup',
  ctaSecondaryLink: '/demo',
  backgroundImage: '/images/hero-bg.jpg',
};

export function useMarketingContent(): UseMarketingContentReturn {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
  const [faqs, setFAQs] = useState<FAQ[]>([]);
  const [hero, setHero] = useState<HeroContent>(DEFAULT_HERO);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Load all content on mount
  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/marketing-cms/all`);
      if (!response.ok) throw new Error('Failed to fetch content');
      
      const data = await response.json();
      
      setBlogPosts(data.blogPosts || []);
      setFeatures(data.features || []);
      setTestimonials(data.testimonials || []);
      setPricingPlans(data.pricingPlans || []);
      setFAQs(data.faqs || []);
      if (data.hero) setHero(data.hero);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load content'));
    } finally {
      setLoading(false);
    }
  };

  // Blog operations
  const saveBlogPost = async (post: BlogPost) => {
    setSaving(true);
    setError(null);
    
    try {
      const isUpdate = blogPosts.some(p => p.id === post.id);
      const url = isUpdate 
        ? `${API_BASE_URL}/marketing-cms/blog-posts/${post.id}`
        : `${API_BASE_URL}/marketing-cms/blog-posts`;
      
      const response = await fetch(url, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(post),
      });
      
      if (!response.ok) throw new Error('Failed to save blog post');
      const savedPost = await response.json();
      
      const updated = isUpdate
        ? blogPosts.map(p => p.id === post.id ? savedPost : p)
        : [...blogPosts, savedPost];
      
      setBlogPosts(updated);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to save blog post'));
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const deleteBlogPost = async (id: string) => {
    setSaving(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/marketing-cms/blog-posts/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete blog post');
      
      const updated = blogPosts.filter(p => p.id !== id);
      setBlogPosts(updated);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete blog post'));
      throw err;
    } finally {
      setSaving(false);
    }
  };

  // Feature operations
  const saveFeature = async (feature: Feature) => {
    setSaving(true);
    setError(null);
    
    try {
      const isUpdate = features.some(f => f.id === feature.id);
      const url = isUpdate
        ? `${API_BASE_URL}/marketing-cms/features/${feature.id}`
        : `${API_BASE_URL}/marketing-cms/features`;
      
      const response = await fetch(url, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feature),
      });
      
      if (!response.ok) throw new Error('Failed to save feature');
      const savedFeature = await response.json();
      
      const updated = isUpdate
        ? features.map(f => f.id === feature.id ? savedFeature : f)
        : [...features, savedFeature];
      
      setFeatures(updated);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to save feature'));
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const deleteFeature = async (id: string) => {
    setSaving(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/marketing-cms/features/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete feature');
      
      const updated = features.filter(f => f.id !== id);
      setFeatures(updated);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete feature'));
      throw err;
    } finally {
      setSaving(false);
    }
  };

  // Testimonial operations
  const saveTestimonial = async (testimonial: Testimonial) => {
    setSaving(true);
    setError(null);
    
    try {
      const isUpdate = testimonials.some(t => t.id === testimonial.id);
      const url = isUpdate
        ? `${API_BASE_URL}/marketing-cms/testimonials/${testimonial.id}`
        : `${API_BASE_URL}/marketing-cms/testimonials`;
      
      const response = await fetch(url, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testimonial),
      });
      
      if (!response.ok) throw new Error('Failed to save testimonial');
      const savedTestimonial = await response.json();
      
      const updated = isUpdate
        ? testimonials.map(t => t.id === testimonial.id ? savedTestimonial : t)
        : [...testimonials, savedTestimonial];
      
      setTestimonials(updated);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to save testimonial'));
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const deleteTestimonial = async (id: string) => {
    setSaving(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/marketing-cms/testimonials/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete testimonial');
      
      const updated = testimonials.filter(t => t.id !== id);
      setTestimonials(updated);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete testimonial'));
      throw err;
    } finally {
      setSaving(false);
    }
  };

  // Pricing operations
  const savePricingPlan = async (plan: PricingPlan) => {
    setSaving(true);
    setError(null);
    
    try {
      const isUpdate = pricingPlans.some(p => p.id === plan.id);
      const url = isUpdate
        ? `${API_BASE_URL}/marketing-cms/pricing-plans/${plan.id}`
        : `${API_BASE_URL}/marketing-cms/pricing-plans`;
      
      const response = await fetch(url, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(plan),
      });
      
      if (!response.ok) throw new Error('Failed to save pricing plan');
      const savedPlan = await response.json();
      
      const updated = isUpdate
        ? pricingPlans.map(p => p.id === plan.id ? savedPlan : p)
        : [...pricingPlans, savedPlan];
      
      setPricingPlans(updated);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to save pricing plan'));
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const deletePricingPlan = async (id: string) => {
    setSaving(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/marketing-cms/pricing-plans/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete pricing plan');
      
      const updated = pricingPlans.filter(p => p.id !== id);
      setPricingPlans(updated);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete pricing plan'));
      throw err;
    } finally {
      setSaving(false);
    }
  };

  // FAQ operations
  const saveFAQ = async (faq: FAQ) => {
    setSaving(true);
    setError(null);
    
    try {
      const isUpdate = faqs.some(f => f.id === faq.id);
      const url = isUpdate
        ? `${API_BASE_URL}/marketing-cms/faqs/${faq.id}`
        : `${API_BASE_URL}/marketing-cms/faqs`;
      
      const response = await fetch(url, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(faq),
      });
      
      if (!response.ok) throw new Error('Failed to save FAQ');
      const savedFaq = await response.json();
      
      const updated = isUpdate
        ? faqs.map(f => f.id === faq.id ? savedFaq : f)
        : [...faqs, savedFaq];
      
      setFAQs(updated);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to save FAQ'));
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const deleteFAQ = async (id: string) => {
    setSaving(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/marketing-cms/faqs/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete FAQ');
      
      const updated = faqs.filter(f => f.id !== id);
      setFAQs(updated);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete FAQ'));
      throw err;
    } finally {
      setSaving(false);
    }
  };

  // Hero operations
  const saveHero = async (newHero: HeroContent) => {
    setSaving(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/marketing-cms/hero`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newHero),
      });
      
      if (!response.ok) throw new Error('Failed to save hero content');
      const savedHero = await response.json();
      
      setHero(savedHero);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to save hero content'));
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const refetch = async () => {
    await loadContent();
  };

  return {
    blogPosts,
    features,
    testimonials,
    pricingPlans,
    faqs,
    hero,
    loading,
    error,
    saving,
    saveBlogPost,
    deleteBlogPost,
    saveFeature,
    deleteFeature,
    saveTestimonial,
    deleteTestimonial,
    savePricingPlan,
    deletePricingPlan,
    saveFAQ,
    deleteFAQ,
    saveHero,
    refetch,
  };
}
