import { useState, useEffect } from 'react';
import { api } from '../lib/api';

export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  customDomain?: string;
  plan: string;
  planId?: string;
  status: 'active' | 'trial' | 'suspended' | 'cancelled';
  users: number;
  mrr: number;
  maxUsers?: number;
  maxStorage?: number;
  joined: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTenantData {
  name: string;
  subdomain?: string;
  customDomain?: string;
  adminEmail: string;
  planId?: string;
  status?: 'active' | 'trial' | 'suspended' | 'cancelled';
}

export interface UpdateTenantData {
  name?: string;
  subdomain?: string;
  customDomain?: string;
  planId?: string;
  status?: 'active' | 'trial' | 'suspended' | 'cancelled';
  maxUsers?: number;
  maxStorage?: number;
}

export function useTenants() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.get<Tenant[]>('/tenants');
      setTenants(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tenants');
      console.error('Error fetching tenants:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const createTenant = async (data: CreateTenantData): Promise<Tenant> => {
    try {
      const newTenant = await api.post<Tenant>('/tenants', data);
      setTenants(prev => [newTenant, ...prev]);
      return newTenant;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create tenant';
      throw new Error(message);
    }
  };

  const updateTenant = async (id: string, data: UpdateTenantData): Promise<Tenant> => {
    try {
      const updated = await api.put<Tenant>(`/tenants/${id}`, data);
      setTenants(prev => prev.map(t => t.id === id ? updated : t));
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update tenant';
      throw new Error(message);
    }
  };

  const deleteTenant = async (id: string): Promise<void> => {
    try {
      await api.delete(`/tenants/${id}`);
      setTenants(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete tenant';
      throw new Error(message);
    }
  };

  const suspendTenant = async (id: string): Promise<Tenant> => {
    try {
      const updated = await api.post<Tenant>(`/tenants/${id}/suspend`, {});
      setTenants(prev => prev.map(t => t.id === id ? { ...t, status: 'suspended' } : t));
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to suspend tenant';
      throw new Error(message);
    }
  };

  const activateTenant = async (id: string): Promise<Tenant> => {
    try {
      const updated = await api.post<Tenant>(`/tenants/${id}/activate`, {});
      setTenants(prev => prev.map(t => t.id === id ? { ...t, status: 'active' } : t));
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to activate tenant';
      throw new Error(message);
    }
  };

  return {
    tenants,
    loading,
    error,
    fetchTenants,
    createTenant,
    updateTenant,
    deleteTenant,
    suspendTenant,
    activateTenant,
  };
}
