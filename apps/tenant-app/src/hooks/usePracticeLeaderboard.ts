import { useState, useEffect } from 'react';
import { apiLogger } from '@/lib/logger';
import { apiClient } from '../lib/apiClient';

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  rank: number;
}

export function usePracticeLeaderboard(categoryId?: string, limit: number = 10) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiClient.getPracticeLeaderboard(categoryId, limit);
        setLeaderboard(data);
      } catch (err: any) {
        apiLogger.error('/api fetch practice leaderboard:', err);
        setError(err.message || 'Failed to load leaderboard');
        setLeaderboard([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [categoryId, limit]);

  return { leaderboard, loading, error };
}

