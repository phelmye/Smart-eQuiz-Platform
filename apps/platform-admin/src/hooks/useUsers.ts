import { useState, useEffect } from 'react';
import { api } from '../lib/api';

interface Tenant {
  id: string;
  name: string;
  subdomain: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'user';
  status: 'active' | 'suspended' | 'pending';
  emailVerified: boolean;
  lastLogin: string;
  createdAt: string;
  tenants?: Tenant[];
}

interface UserStats {
  total: number;
  active: number;
  suspended: number;
  pending: number;
  byRole: Record<string, number>;
}

interface CreateUserData {
  email: string;
  password: string;
  name?: string;
  role: string;
  tenantId?: string;
}

interface UpdateUserData {
  email?: string;
  name?: string;
  role?: string;
  status?: string;
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async (search?: string, tenantId?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (tenantId) params.append('tenantId', tenantId);
      
      const response = await api.get<User[]>(`/users?${params.toString()}`);
      setUsers(response.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch users';
      setError(message);
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStats = async (): Promise<UserStats | null> => {
    try {
      const response = await api.get<UserStats>('/users/stats');
      return response.data;
    } catch (err) {
      console.error('Error fetching user stats:', err);
      return null;
    }
  };

  const createUser = async (data: CreateUserData): Promise<void> => {
    try {
      const response = await api.post<User>('/users', data);
      setUsers(prev => [response.data, ...prev]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create user';
      throw new Error(message);
    }
  };

  const updateUser = async (id: string, data: UpdateUserData): Promise<void> => {
    try {
      const response = await api.put<User>(`/users/${id}`, data);
      setUsers(prev => prev.map(user => 
        user.id === id ? { ...user, ...response.data } : user
      ));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update user';
      throw new Error(message);
    }
  };

  const deleteUser = async (id: string): Promise<void> => {
    try {
      await api.delete(`/users/${id}`);
      setUsers(prev => prev.filter(user => user.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete user';
      throw new Error(message);
    }
  };

  const suspendUser = async (id: string): Promise<void> => {
    try {
      await api.post(`/users/${id}/suspend`);
      setUsers(prev => prev.map(user => 
        user.id === id ? { ...user, status: 'suspended' as const } : user
      ));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to suspend user';
      throw new Error(message);
    }
  };

  const activateUser = async (id: string): Promise<void> => {
    try {
      await api.post(`/users/${id}/activate`);
      setUsers(prev => prev.map(user => 
        user.id === id ? { ...user, status: 'active' as const } : user
      ));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to activate user';
      throw new Error(message);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    error,
    fetchUsers,
    getStats,
    createUser,
    updateUser,
    deleteUser,
    suspendUser,
    activateUser,
  };
}
