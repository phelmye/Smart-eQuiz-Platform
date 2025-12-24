import { useState, useEffect } from 'react';
import { apiClient } from '../lib/apiClient';

export interface Tournament {
  id: string;
  name: string;
  description?: string;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  tenantId: string;
  entryFee: number;
  prizePool: number;
  maxParticipants: number;
  participants: string[];
  questions: string[];
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

export function useTournaments() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getTournaments();
      setTournaments(data);
    } catch (err: any) {
      console.error('Failed to fetch tournaments:', err);
      setError(err.message || 'Failed to load tournaments');
      setTournaments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTournaments();
  }, []);

  return {
    tournaments,
    loading,
    error,
    refetch: fetchTournaments,
  };
}
