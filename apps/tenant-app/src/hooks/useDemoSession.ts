import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api';

export interface DemoSession {
  sessionToken: string;
  templateVersion: string;
  expiresAt: string;
  mergedData: any;
  isDemo: boolean;
}

export interface DemoAnalyticsEvent {
  eventType: 'feature_used' | 'page_viewed' | 'action_completed';
  featureName: string;
  metadata?: any;
}

/**
 * Hook for managing demo tenant sessions
 * Automatically creates session on mount and tracks it in localStorage
 */
export function useDemoSession() {
  const [session, setSession] = useState<DemoSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize or restore session
  useEffect(() => {
    initializeSession();
  }, []);

  const initializeSession = async () => {
    try {
      setIsLoading(true);
      
      // Check for existing session token in localStorage
      const existingToken = localStorage.getItem('demo_session_token');
      
      // Call API to get or create session
      const response = await apiClient.post('/demo/session', {
        sessionToken: existingToken || undefined,
      });

      const sessionData = {
        ...response.data,
        isDemo: true,
      };

      // Store token in localStorage
      localStorage.setItem('demo_session_token', sessionData.sessionToken);
      
      setSession(sessionData);
      setError(null);
    } catch (err: any) {
      console.error('Failed to initialize demo session:', err);
      setError(err.message || 'Failed to initialize demo session');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Update session with new changes
   */
  const updateSession = useCallback(async (changes: any) => {
    if (!session) return;

    try {
      await apiClient.put(`/demo/session/${session.sessionToken}`, {
        changes,
      });

      // Refresh session data
      const response = await apiClient.get(`/demo/session/${session.sessionToken}`);
      setSession({
        ...response.data,
        isDemo: true,
      });
    } catch (err: any) {
      console.error('Failed to update demo session:', err);
      throw err;
    }
  }, [session]);

  /**
   * Track analytics event
   */
  const trackEvent = useCallback(async (event: DemoAnalyticsEvent) => {
    if (!session) return;

    try {
      await apiClient.post('/demo/track', {
        sessionId: session.sessionToken,
        eventType: event.eventType,
        featureName: event.featureName,
        metadata: event.metadata,
      });
    } catch (err) {
      // Silent fail for analytics
      console.warn('Failed to track demo event:', err);
    }
  }, [session]);

  /**
   * Reset session (create new one)
   */
  const resetSession = useCallback(async () => {
    localStorage.removeItem('demo_session_token');
    await initializeSession();
  }, []);

  /**
   * Get time remaining before session expires
   */
  const getTimeRemaining = useCallback(() => {
    if (!session) return 0;
    
    const now = new Date().getTime();
    const expires = new Date(session.expiresAt).getTime();
    return Math.max(0, expires - now);
  }, [session]);

  /**
   * Format time remaining as string
   */
  const getTimeRemainingFormatted = useCallback(() => {
    const ms = getTimeRemaining();
    if (ms === 0) return 'Expired';

    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);

    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  }, [getTimeRemaining]);

  return {
    session,
    isLoading,
    error,
    isDemo: !!session,
    updateSession,
    trackEvent,
    resetSession,
    getTimeRemaining,
    getTimeRemainingFormatted,
  };
}
