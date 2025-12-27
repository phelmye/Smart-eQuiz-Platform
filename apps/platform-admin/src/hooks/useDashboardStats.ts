import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { logger } from '../lib/logger';

export interface DashboardStats {
  totalTenants: number;
  activeTenants: number;
  trialTenants: number;
  suspendedTenants: number;
  totalUsers: number;
  activeUsers: number;
  mrr: number;
  arr: number;
  tenantGrowth: number;
  userGrowth: number;
}

export interface ChartData {
  revenueData: Array<{ month: string; revenue: number; target: number }>;
  tenantGrowthData: Array<{ month: string; tenants: number }>;
  tenantsByPlan: Array<{ name: string; value: number }>;
}

export interface Activity {
  type: string;
  description: string;
  timestamp: string;
}

export interface DashboardData {
  stats: DashboardStats;
  charts: ChartData;
  activities: Activity[];
}

export function useDashboardStats() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<DashboardData>('/analytics/dashboard-stats');
      setData(response);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch dashboard statistics');
      logger.error('Dashboard stats error', err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    data,
    loading,
    error,
    refresh: fetchStats,
  };
}
