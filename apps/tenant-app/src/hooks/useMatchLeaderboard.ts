import { useState, useEffect } from 'react';
import { apiClient } from '../lib/apiClient';

export interface MatchLeaderboardEntry {
  userId: string;
  userName: string;
  score: number;
  matchesPlayed: number;
  matchesWon: number;
  winRate: number;
  averageScore: number;
  rank: number;
}

export function useMatchLeaderboard(tournamentId: string) {
  const [leaderboard, setLeaderboard] = useState<MatchLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiClient.getMatchLeaderboard(tournamentId);
        setLeaderboard(data);
      } catch (err: any) {
        console.error('Failed to fetch match leaderboard:', err);
        setError(err.message || 'Failed to load match leaderboard');
        setLeaderboard([]);
      } finally {
        setLoading(false);
      }
    };

    if (tournamentId) {
      fetchLeaderboard();
    }
  }, [tournamentId]);

  return { leaderboard, loading, error };
}
