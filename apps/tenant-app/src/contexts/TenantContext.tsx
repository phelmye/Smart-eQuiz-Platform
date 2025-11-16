import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Tenant } from '@smart-equiz/types';

interface TenantContextType {
  tenant: Tenant | null;
  subdomain: string;
  isLoading: boolean;
  setTenant: (tenant: Tenant) => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within TenantProvider');
  }
  return context;
};

interface TenantProviderProps {
  children: ReactNode;
}

export const TenantProvider = ({ children }: TenantProviderProps) => {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [subdomain, setSubdomain] = useState('');

  useEffect(() => {
    // Extract subdomain from URL
    // Format: subdomain.smartequiz.com or localhost:5174 (for development)
    const hostname = window.location.hostname;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      // Development mode - check for tenant parameter or use demo tenant
      const urlParams = new URLSearchParams(window.location.search);
      const tenantParam = urlParams.get('tenant');
      setSubdomain(tenantParam || 'demo');
      
      // Mock tenant data for development
      setTenant({
        id: 'demo-tenant-id',
        name: 'Demo Organization',
        subdomain: tenantParam || 'demo',
        plan: 'Professional',
        status: 'active',
        maxUsers: 100,
        maxQuestionsPerTournament: 1000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setIsLoading(false);
    } else {
      // Production mode - extract subdomain
      const parts = hostname.split('.');
      if (parts.length >= 3) {
        const extractedSubdomain = parts[0];
        setSubdomain(extractedSubdomain);
        
        // In production, fetch tenant data from API
        fetchTenantData(extractedSubdomain);
      } else {
        console.error('Invalid subdomain format');
        setIsLoading(false);
      }
    }
  }, []);

  const fetchTenantData = async (sub: string) => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/tenants/${sub}`);
      // const data = await response.json();
      
      // Mock data for now
      setTenant({
        id: `tenant-${sub}`,
        name: `${sub.charAt(0).toUpperCase() + sub.slice(1)} Organization`,
        subdomain: sub,
        plan: 'Professional',
        status: 'active',
        maxUsers: 100,
        maxQuestionsPerTournament: 1000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to fetch tenant data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    tenant,
    subdomain,
    isLoading,
    setTenant,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading {subdomain}...</p>
        </div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Tenant Not Found</h1>
          <p className="text-gray-600">
            The organization "{subdomain}" could not be found or is not active.
          </p>
          <a href="https://smartequiz.com" className="mt-4 inline-block text-blue-600 hover:underline">
            Go to Smart eQuiz Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
};
