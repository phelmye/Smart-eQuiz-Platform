import { useState, useEffect } from 'react';
import { apiClient } from '../lib/apiClient';

export interface PracticeStats {
  totalQuizzes: number;
  averageScore: number;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  totalTimeSpent: number;
  averageTimePerQuestion: number;
  categoriesAttempted: number;
  currentStreak: number;
  bestStreak: number;
}

export function usePracticeStats(categoryId?: string) {
  const [stats, setStats] = useState<PracticeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiClient.getPracticeStats(categoryId);
        setStats(data);
      } catch (err: any) {
        console.error('Failed to fetch practice stats:', err);
        setError(err.message || 'Failed to load practice stats');
        // Fallback to mock data on error
        setStats({
          totalQuizzes: 0,
          averageScore: 0,
          totalQuestions: 0,
          correctAnswers: 0,
          accuracy: 0,
          totalTimeSpent: 0,
          averageTimePerQuestion: 0,
          categoriesAttempted: 0,
          currentStreak: 0,
          bestStreak: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [categoryId]);

  return { stats, loading, error };
}
