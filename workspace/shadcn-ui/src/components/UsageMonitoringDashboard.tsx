import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ArrowLeft,
  Users,
  Trophy,
  HardDrive,
  Activity,
  AlertTriangle,
  TrendingUp,
  Calendar,
  RefreshCw,
  Download
} from 'lucide-react';
import { Tenant, Plan, storage, STORAGE_KEYS, getTenantById, getPlanById, getUsersByTenant, formatCurrency } from '@/lib/mockData';

interface UsageMonitoringDashboardProps {
  onBack: () => void;
}

interface TenantUsageMetrics {
  tenantId: string;
  tenantName: string;
  planName: string;
  metrics: {
    users: { current: number; limit: number; percentage: number };
    tournaments: { current: number; limit: number; percentage: number };
    storage: { usedMB: number; limitMB: number; percentage: number };
    apiCalls: { today: number; month: number; limit: number };
  };
  healthScore: number;
  status: 'healthy' | 'warning' | 'critical';
  alerts: Array<{ type: 'info' | 'warning' | 'error'; message: string }>;
  lastActivity: string;
}

export const UsageMonitoringDashboard: React.FC<UsageMonitoringDashboardProps> = ({ onBack }) => {
  const [tenantMetrics, setTenantMetrics] = useState<TenantUsageMetrics[]>([]);
  const [selectedView, setSelectedView] = useState<'overview' | 'details'>('overview');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadUsageMetrics();
  }, []);

  const loadUsageMetrics = () => {
    setIsLoading(true);
    
    const tenants: Tenant[] = storage.get(STORAGE_KEYS.TENANTS) || [];
    const metrics: TenantUsageMetrics[] = [];

    tenants.forEach(tenant => {
      const plan = getPlanById(tenant.planId);
      if (!plan) return;

      const currentUsers = tenant.currentUsers || getUsersByTenant(tenant.id).length;
      const currentTournaments = tenant.currentTournaments || 0;
      const storageUsed = tenant.storageUsedMB || 0;

      // Calculate limits
      const userLimit = plan.maxUsers === -1 ? 1000 : plan.maxUsers;
      const tournamentLimit = plan.maxTournaments === -1 ? 100 : plan.maxTournaments;
      const storageLimit = 1000; // 1GB default

      // Calculate percentages
      const userPercentage = (currentUsers / userLimit) * 100;
      const tournamentPercentage = (currentTournaments / tournamentLimit) * 100;
      const storagePercentage = (storageUsed / storageLimit) * 100;

      // Generate alerts
      const alerts: TenantUsageMetrics['alerts'] = [];
      if (userPercentage >= 90) {
        alerts.push({ type: 'error', message: 'User limit almost reached' });
      } else if (userPercentage >= 75) {
        alerts.push({ type: 'warning', message: 'Approaching user limit' });
      }
      
      if (tournamentPercentage >= 90) {
        alerts.push({ type: 'error', message: 'Tournament limit almost reached' });
      } else if (tournamentPercentage >= 75) {
        alerts.push({ type: 'warning', message: 'Approaching tournament limit' });
      }

      if (storagePercentage >= 90) {
        alerts.push({ type: 'error', message: 'Storage almost full' });
      } else if (storagePercentage >= 75) {
        alerts.push({ type: 'warning', message: 'Storage space running low' });
      }

      // Calculate health score (0-100)
      const healthScore = Math.max(
        0,
        100 - (userPercentage * 0.4 + tournamentPercentage * 0.3 + storagePercentage * 0.3)
      );

      // Determine status
      let status: TenantUsageMetrics['status'] = 'healthy';
      if (healthScore < 30 || alerts.some(a => a.type === 'error')) {
        status = 'critical';
      } else if (healthScore < 60 || alerts.some(a => a.type === 'warning')) {
        status = 'warning';
      }

      metrics.push({
        tenantId: tenant.id,
        tenantName: tenant.name,
        planName: plan.displayName || plan.name,
        metrics: {
          users: { current: currentUsers, limit: userLimit, percentage: userPercentage },
          tournaments: { current: currentTournaments, limit: tournamentLimit, percentage: tournamentPercentage },
          storage: { usedMB: storageUsed, limitMB: storageLimit, percentage: storagePercentage },
          apiCalls: { today: Math.floor(Math.random() * 1000), month: Math.floor(Math.random() * 20000), limit: 50000 }
        },
        healthScore: Math.round(healthScore),
        status,
        alerts,
        lastActivity: tenant.lastActivityAt || new Date().toISOString()
      });
    });

    // Sort by health score (critical first)
    metrics.sort((a, b) => a.healthScore - b.healthScore);
    
    setTenantMetrics(metrics);
    setIsLoading(false);
  };

  const getStatusBadge = (status: TenantUsageMetrics['status']) => {
    const config = {
      healthy: { variant: 'default', label: 'Healthy', color: 'text-green-600' },
      warning: { variant: 'secondary', label: 'Warning', color: 'text-yellow-600' },
      critical: { variant: 'destructive', label: 'Critical', color: 'text-red-600' }
    };
    return config[status];
  };

  const getTotalAlerts = () => {
    return tenantMetrics.reduce((sum, t) => sum + t.alerts.length, 0);
  };

  const getCriticalTenants = () => {
    return tenantMetrics.filter(t => t.status === 'critical').length;
  };

  const exportReport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      summary: {
        totalTenants: tenantMetrics.length,
        criticalTenants: getCriticalTenants(),
        totalAlerts: getTotalAlerts()
      },
      tenants: tenantMetrics
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `usage-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Usage Monitoring</h1>
                <p className="text-gray-600">Track resource consumption across all tenants</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={loadUsageMetrics} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="outline" onClick={exportReport}>
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Tenants</p>
                  <p className="text-2xl font-bold">{tenantMetrics.length}</p>
                </div>
                <Activity className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Critical Status</p>
                  <p className="text-2xl font-bold text-red-600">{getCriticalTenants()}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Active Alerts</p>
                  <p className="text-2xl font-bold text-yellow-600">{getTotalAlerts()}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Avg Health Score</p>
                  <p className="text-2xl font-bold">
                    {tenantMetrics.length > 0
                      ? Math.round(tenantMetrics.reduce((sum, t) => sum + t.healthScore, 0) / tenantMetrics.length)
                      : 0}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tenant Usage Table */}
        <Card>
          <CardHeader>
            <CardTitle>Tenant Resource Usage</CardTitle>
            <CardDescription>Real-time monitoring of resource consumption</CardDescription>
          </CardHeader>
          <CardContent>
            {tenantMetrics.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No tenant data available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {tenantMetrics.map(tenant => (
                  <Card key={tenant.tenantId} className="border-l-4" style={{
                    borderLeftColor: tenant.status === 'critical' ? '#ef4444' : tenant.status === 'warning' ? '#f59e0b' : '#10b981'
                  }}>
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        {/* Tenant Header */}
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">{tenant.tenantName}</h3>
                            <p className="text-sm text-gray-500">{tenant.planName} Plan</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={getStatusBadge(tenant.status).variant as any}>
                              {getStatusBadge(tenant.status).label}
                            </Badge>
                            <div className="text-right">
                              <div className="text-sm font-semibold">Health Score</div>
                              <div className={`text-2xl font-bold ${getStatusBadge(tenant.status).color}`}>
                                {tenant.healthScore}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Alerts */}
                        {tenant.alerts.length > 0 && (
                          <div className="space-y-2">
                            {tenant.alerts.map((alert, idx) => (
                              <Alert key={idx} variant={alert.type === 'error' ? 'destructive' : 'default'}>
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription>{alert.message}</AlertDescription>
                              </Alert>
                            ))}
                          </div>
                        )}

                        {/* Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Users */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                Users
                              </span>
                              <span className="font-medium">
                                {tenant.metrics.users.current} / {tenant.metrics.users.limit}
                              </span>
                            </div>
                            <Progress value={tenant.metrics.users.percentage} className="h-2" />
                            <p className="text-xs text-gray-500">
                              {tenant.metrics.users.percentage.toFixed(1)}% used
                            </p>
                          </div>

                          {/* Tournaments */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="flex items-center gap-1">
                                <Trophy className="h-4 w-4" />
                                Tournaments
                              </span>
                              <span className="font-medium">
                                {tenant.metrics.tournaments.current} / {tenant.metrics.tournaments.limit}
                              </span>
                            </div>
                            <Progress value={tenant.metrics.tournaments.percentage} className="h-2" />
                            <p className="text-xs text-gray-500">
                              {tenant.metrics.tournaments.percentage.toFixed(1)}% used
                            </p>
                          </div>

                          {/* Storage */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="flex items-center gap-1">
                                <HardDrive className="h-4 w-4" />
                                Storage
                              </span>
                              <span className="font-medium">
                                {tenant.metrics.storage.usedMB.toFixed(1)} MB / {tenant.metrics.storage.limitMB} MB
                              </span>
                            </div>
                            <Progress value={tenant.metrics.storage.percentage} className="h-2" />
                            <p className="text-xs text-gray-500">
                              {tenant.metrics.storage.percentage.toFixed(1)}% used
                            </p>
                          </div>
                        </div>

                        {/* Last Activity */}
                        <div className="flex items-center justify-between text-sm text-gray-500 pt-2 border-t">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Last Activity
                          </span>
                          <span>{new Date(tenant.lastActivity).toLocaleString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UsageMonitoringDashboard;
