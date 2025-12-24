import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../lib/apiClient';

export interface User {
  id: string;
  email: string;
  role: string;
  tenantId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  usersByRole: Record<string, number>;
  recentSignups: number;
}

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getCurrentUser();
      setUser(data);
    } catch (err: any) {
      console.error('Failed to fetch current user:', err);
      setError(err.message || 'Failed to load user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return {
    user,
    loading,
    error,
    refetch: fetchUser,
  };
}

export function useUsers(search?: string, tenantId?: string) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      // Note: This would need a new method in apiClient
      // For now, returning empty array
      setUsers([]);
    } catch (err: any) {
      console.error('Failed to fetch users:', err);
      setError(err.message || 'Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, tenantId]);

  return {
    users,
    loading,
    error,
    refetch: fetchUsers,
  };
}
