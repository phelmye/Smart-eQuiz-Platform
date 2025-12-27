import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { logger } from '../lib/logger';

export interface PaymentTransaction {
  id: string;
  tenantId: string;
  provider: 'STRIPE' | 'PAYPAL' | 'PAYONEER' | 'WORLDFIRST';
  providerTransactionId: string;
  amount: number; // in cents
  currency: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  type: 'SUBSCRIPTION' | 'ONE_TIME' | 'REFUND';
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  tenant?: {
    id: string;
    name: string;
    subdomain: string;
  };
}

export interface PaymentGateway {
  provider: 'STRIPE' | 'PAYPAL' | 'PAYONEER' | 'WORLDFIRST';
  enabled: boolean;
  configured: boolean;
  displayName: string;
  description: string;
}

export interface RevenueStats {
  totalRevenue: number;
  byProvider: {
    provider: string;
    revenue: number;
    transactionCount: number;
    percentage: number;
  }[];
  byCurrency: {
    currency: string;
    revenue: number;
    transactionCount: number;
  }[];
  byStatus: {
    status: string;
    count: number;
    percentage: number;
  }[];
  recentTransactions: PaymentTransaction[];
}

export interface TransactionFilters {
  status?: string;
  provider?: string;
  tenantId?: string;
  startDate?: string;
  endDate?: string;
}

export function useBilling() {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [stats, setStats] = useState<RevenueStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async (filters?: TransactionFilters) => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.get<PaymentTransaction[]>('/payments/admin/transactions', filters as any);
      setTransactions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
      logger.error('Error fetching transactions', err as Error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGateways = async () => {
    try {
      setError(null);
      const data = await api.get<PaymentGateway[]>('/payments/gateways');
      setGateways(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch payment gateways');
      logger.error('Error fetching gateways', err as Error);
    }
  };

  const fetchRevenueStats = async (tenantId?: string) => {
    try {
      setError(null);
      const params = tenantId ? { tenantId } : undefined;
      const data = await api.get<RevenueStats>('/payments/admin/revenue-stats', params as any);
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch revenue stats');
      logger.error('Error fetching revenue stats', err as Error);
    }
  };

  const exportTransactions = async (filters?: TransactionFilters): Promise<void> => {
    try {
      setError(null);
      // Note: This endpoint returns CSV data, not JSON
      const token = localStorage.getItem('platform_admin_token');
      const params = new URLSearchParams(filters as any);
      const url = `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/payments/admin/export?${params.toString()}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to export transactions');
      }

      // Download CSV file
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `transactions-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to export transactions';
      throw new Error(message);
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      await Promise.all([
        fetchTransactions(),
        fetchGateways(),
        fetchRevenueStats(),
      ]);
      setLoading(false);
    };

    loadInitialData();
  }, []);

  return {
    transactions,
    gateways,
    stats,
    loading,
    error,
    fetchTransactions,
    fetchGateways,
    fetchRevenueStats,
    exportTransactions,
  };
}
