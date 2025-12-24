import { useState, useEffect } from 'react';
import { apiClient } from '../lib/apiClient';

export interface Match {
  id: string;
  tournamentId: string;
  status: 'waiting' | 'active' | 'completed';
  participants: string[];
  currentQuestionIndex: number;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}

export function useMatches(tournamentId?: string) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getMatches(tournamentId);
      setMatches(data);
    } catch (err: any) {
      console.error('Failed to fetch matches:', err);
      setError(err.message || 'Failed to load matches');
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [tournamentId]);

  return {
    matches,
    loading,
    error,
    refetch: fetchMatches,
  };
}
