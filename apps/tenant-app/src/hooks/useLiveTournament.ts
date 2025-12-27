import { useState, useEffect, useCallback } from 'react';
import { apiLogger } from '@/lib/logger';
import { apiClient } from '../lib/apiClient';

export interface LiveParticipant {
  userId: string;
  displayName: string;
  currentScore: number;
  correctAnswers: number;
  averageTime: number;
  status: 'active' | 'finished' | 'disconnected';
  rank: number;
}

export interface LiveTournamentMetrics {
  totalParticipants: number;
  activeParticipants: number;
  finishedParticipants: number;
  droppedParticipants: number;
  averageScore: number;
  averageTimePerQuestion: number;
}

export interface QuestionProgress {
  currentQuestion: number;
  totalQuestions: number;
  answeredBy: number;
  averageTime: number;
}

export interface LiveTournamentData {
  tournamentId: string;
  status: 'upcoming' | 'in_progress' | 'completed';
  participants: LiveParticipant[];
  metrics: LiveTournamentMetrics;
  questionProgress: QuestionProgress;
  lastUpdated: string;
}

export function useLiveTournament(tournamentId: string, autoRefresh: boolean = true, refreshInterval: number = 3000) {
  const [data, setData] = useState<LiveTournamentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLiveData = useCallback(async () => {
    try {
      setError(null);
      const response = await apiClient.getLiveTournament(tournamentId);
      setData(response);
      setLoading(false);
    } catch (err: any) {
      apiLogger.error('/api fetch live tournament data:', err);
      setError(err.message || 'Failed to load live data');
      setLoading(false);
    }
  }, [tournamentId]);

  // Initial fetch
  useEffect(() => {
    fetchLiveData();
  }, [fetchLiveData]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchLiveData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchLiveData]);

  return {
    data,
    loading,
    error,
    refresh: fetchLiveData,
  };
}

