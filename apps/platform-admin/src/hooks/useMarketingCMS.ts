import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Types
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  status: 'DRAFT' | 'PUBLISHED';
  featuredImage?: string;
  tags?: string[];
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  order: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  organization: string;
  quote: string;
  rating: number;
  avatar?: string;
  featured?: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  interval: 'MONTH' | 'YEAR';
  features: string[];
  highlighted?: boolean;
  ctaText: string;
  ctaLink: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface HeroContent {
  id?: string;
  headline: string;
  subheadline: string;
  ctaPrimary: string;
  ctaPrimaryLink: string;
  ctaSecondary?: string;
  ctaSecondaryLink?: string;
  backgroundImage?: string;
  videoUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

export function useMarketingCMS<T>(
  endpoint: 'blog-posts' | 'features' | 'testimonials' | 'pricing-plans' | 'faqs' | 'hero'
) {
  const { token } = useAuth();
  const [data, setData] = useState<T | T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/marketing-cms/${endpoint}`, {
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch ${endpoint}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error(`Error fetching ${endpoint}:`, err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [endpoint, token]);

  const create = async (payload: Partial<T>) => {
    try {
      const response = await fetch(`${API_URL}/marketing-cms/${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create');
      }

      const created = await response.json();
      
      // Update local state
      if (Array.isArray(data)) {
        setData([...data, created] as T[]);
      } else {
        setData(created);
      }
      
      return created;
    } catch (err) {
      throw err;
    }
  };

  const update = async (id: string, payload: Partial<T>) => {
    try {
      const response = await fetch(`${API_URL}/marketing-cms/${endpoint}/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update');
      }

      const updated = await response.json();
      
      // Update local state
      if (Array.isArray(data)) {
        setData(
          (data as T[]).map((item: any) => (item.id === id ? updated : item))
        );
      } else {
        setData(updated);
      }
      
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const remove = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/marketing-cms/${endpoint}/${id}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to delete');
      }

      // Update local state
      if (Array.isArray(data)) {
        setData((data as T[]).filter((item: any) => item.id !== id));
      }
    } catch (err) {
      throw err;
    }
  };

  const refresh = () => {
    fetchData();
  };

  return {
    data,
    loading,
    error,
    create,
    update,
    remove,
    refresh,
  };
}
