import { useState, useEffect } from 'react';
import { apiLogger } from '@/lib/logger';

export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  customDomain?: string;
  status: 'active' | 'suspended' | 'trial';
  plan: string;
  maxUsers?: number;
  createdAt: string;
  updatedAt: string;
}

// Note: This hook is for platform-admin use (super_admin only)
// Tenant app users get their tenant from AuthContext
export function useTenants() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      setError(null);
      // API call would go here
      // const data = await api.get('/tenants');
      // For now, return empty until platform-admin integration
      setTenants([]);
    } catch (err: any) {
      apiLogger.error('/api fetch tenants:', err);
      setError(err.message || 'Failed to load tenants');
      setTenants([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  return {
    tenants,
    loading,
    error,
    refetch: fetchTenants,
  };
}

export function useTenant(id: string) {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTenant = async () => {
    try {
      setLoading(true);
      setError(null);
      // API call would go here
      // const data = await api.get(`/tenants/${id}`);
      setTenant(null);
    } catch (err: any) {
      apiLogger.error('/api fetch tenant:', err);
      setError(err.message || 'Failed to load tenant');
      setTenant(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchTenant();
    }
  }, [id]);

  return {
    tenant,
    loading,
    error,
    refetch: fetchTenant,
  };
}

