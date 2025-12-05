import { useState, useEffect } from 'react';
import axios from 'axios';

interface LandingPageContent {
  id: string;
  tenantId: string;
  section: string;
  content: Record<string, any>;
  version: number;
  isActive: boolean;
  effectiveDate: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface LandingPageContentResponse {
  HERO?: LandingPageContent;
  STATS?: LandingPageContent;
  FEATURES?: LandingPageContent;
  TESTIMONIALS?: LandingPageContent;
  BRANDING?: LandingPageContent;
}

interface UseLandingPageContentReturn {
  content: LandingPageContentResponse;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * React hook to fetch active landing page content from API
 * 
 * IMPORTANT: This replaces localStorage-based content management.
 * DO NOT revert to localStorage pattern - it causes:
 * - No version control
 * - No audit trail
 * - Data loss risk
 * - No scheduled publishing
 * 
 * @param tenantId - Tenant ID to fetch content for
 * @returns Object with content, loading state, error, and refetch function
 * 
 * @example
 * ```typescript
 * const { content, loading, error } = useLandingPageContent(tenant.id);
 * 
 * if (loading) return <LoadingSpinner />;
 * if (error) return <ErrorDisplay error={error} />;
 * 
 * return <HeroSection data={content.HERO?.content} />;
 * ```
 */
export function useLandingPageContent(tenantId: string): UseLandingPageContentReturn {
  const [content, setContent] = useState<LandingPageContentResponse>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchContent = async () => {
    if (!tenantId) {
      setError(new Error('Tenant ID is required'));
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await axios.get<LandingPageContentResponse>(
        '/api/landing-page/active',
        {
          headers: { 'X-Tenant-Id': tenantId },
        }
      );

      setContent(response.data);
    } catch (err) {
      const error = err as Error;
      console.error('Failed to fetch landing page content:', error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, [tenantId]);

  return {
    content,
    loading,
    error,
    refetch: fetchContent,
  };
}

/**
 * Create new landing page content version
 * 
 * @param tenantId - Tenant ID
 * @param section - Section type (HERO, STATS, etc.)
 * @param content - Section content as JSON
 * @param effectiveDate - Optional effective date
 * @returns Created content version
 */
export async function createLandingPageContent(
  tenantId: string,
  section: string,
  content: Record<string, any>,
  effectiveDate?: string
): Promise<LandingPageContent> {
  const response = await axios.post<LandingPageContent>(
    '/api/landing-page',
    {
      section,
      content,
      effectiveDate,
    },
    {
      headers: { 'X-Tenant-Id': tenantId },
    }
  );

  return response.data;
}

/**
 * Activate a landing page content version
 * 
 * @param tenantId - Tenant ID
 * @param contentId - Content version ID to activate
 * @returns Activated content version
 */
export async function activateLandingPageContent(
  tenantId: string,
  contentId: string
): Promise<LandingPageContent> {
  const response = await axios.post<LandingPageContent>(
    `/api/landing-page/${contentId}/activate`,
    {},
    {
      headers: { 'X-Tenant-Id': tenantId },
    }
  );

  return response.data;
}

/**
 * Get version history for a section
 * 
 * @param tenantId - Tenant ID
 * @param section - Section type
 * @returns Array of content versions (latest first)
 */
export async function getLandingPageHistory(
  tenantId: string,
  section: string
): Promise<Partial<LandingPageContent>[]> {
  const response = await axios.get<Partial<LandingPageContent>[]>(
    `/api/landing-page/section/${section}/history`,
    {
      headers: { 'X-Tenant-Id': tenantId },
    }
  );

  return response.data;
}
