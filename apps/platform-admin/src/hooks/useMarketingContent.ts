import { useState, useEffect } from 'react';

/**
 * React hook for Marketing CMS content management
 * 
 * Current Implementation: localStorage (Phase 1)
 * Future: API integration when backend is deployed (Phase 2)
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
      // TODO: Replace with API calls when backend is ready
      // const response = await fetch('/api/marketing-content');
      // const data = await response.json();
      
      // Phase 1: localStorage implementation
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
      // TODO: Replace with API call
      // await fetch('/api/marketing-content/blog', {
      //   method: post.id ? 'PUT' : 'POST',
      //   body: JSON.stringify(post),
      // });
      
      const updated = blogPosts.some(p => p.id === post.id)
        ? blogPosts.map(p => p.id === post.id ? post : p)
        : [...blogPosts, post];
      
      setBlogPosts(updated);
      localStorage.setItem('marketing_blog_posts', JSON.stringify(updated));
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
      // TODO: Replace with API call
      // await fetch(`/api/marketing-content/blog/${id}`, { method: 'DELETE' });
      
      const updated = blogPosts.filter(p => p.id !== id);
      setBlogPosts(updated);
      localStorage.setItem('marketing_blog_posts', JSON.stringify(updated));
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
      const updated = features.some(f => f.id === feature.id)
        ? features.map(f => f.id === feature.id ? feature : f)
        : [...features, feature];
      
      setFeatures(updated);
      localStorage.setItem('marketing_features', JSON.stringify(updated));
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
      const updated = features.filter(f => f.id !== id);
      setFeatures(updated);
      localStorage.setItem('marketing_features', JSON.stringify(updated));
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
      const updated = testimonials.some(t => t.id === testimonial.id)
        ? testimonials.map(t => t.id === testimonial.id ? testimonial : t)
        : [...testimonials, testimonial];
      
      setTestimonials(updated);
      localStorage.setItem('marketing_testimonials', JSON.stringify(updated));
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
      const updated = testimonials.filter(t => t.id !== id);
      setTestimonials(updated);
      localStorage.setItem('marketing_testimonials', JSON.stringify(updated));
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
      const updated = pricingPlans.some(p => p.id === plan.id)
        ? pricingPlans.map(p => p.id === plan.id ? plan : p)
        : [...pricingPlans, plan];
      
      setPricingPlans(updated);
      localStorage.setItem('marketing_pricing', JSON.stringify(updated));
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
      const updated = pricingPlans.filter(p => p.id !== id);
      setPricingPlans(updated);
      localStorage.setItem('marketing_pricing', JSON.stringify(updated));
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
      const updated = faqs.some(f => f.id === faq.id)
        ? faqs.map(f => f.id === faq.id ? faq : f)
        : [...faqs, faq];
      
      setFAQs(updated);
      localStorage.setItem('marketing_faqs', JSON.stringify(updated));
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
      const updated = faqs.filter(f => f.id !== id);
      setFAQs(updated);
      localStorage.setItem('marketing_faqs', JSON.stringify(updated));
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
      setHero(newHero);
      localStorage.setItem('marketing_hero', JSON.stringify(newHero));
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
