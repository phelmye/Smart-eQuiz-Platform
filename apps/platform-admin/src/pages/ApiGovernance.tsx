/**
 * API Governance Dashboard (Platform Admin)
 * 
 * Super admin dashboard for monitoring and governing tenant API usage across the platform.
 * 
 * IMPORTANT: This is SEPARATE from ApiKeys.tsx (third-party service keys).
 * This dashboard monitors TENANT-GENERATED API keys usage, not platform service keys.
 * 
 * Features:
 * - Platform-wide API usage statistics
 * - Per-tenant API consumption breakdown
 * - Rate limit controls and enforcement
 * - Security alerts and anomaly detection
 * - Revenue attribution for usage-based billing
 */

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Shield,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Activity,
  DollarSign,
  Users,
  Key,
  RefreshCw,
  Download
} from 'lucide-react';

interface PlatformApiStats {
  totalRequests: number;
  totalTenants: number;
  totalApiKeys: number;
  averageResponseTime: number;
  successRate: number;
  topTenants: Array<{
    tenantId: string;
    tenantName: string;
    requests: number;
    apiKeys: number;
    plan: string;
  }>;
  recentAlerts: Array<{
    id: string;
    type: 'rate_limit' | 'security' | 'error_spike';
    tenantId: string;
    tenantName: string;
    message: string;
    timestamp: Date;
  }>;
  dailyUsage: Array<{
    date: string;
    requests: number;
    tenants: number;
  }>;
}

export default function ApiGovernance() {
  const [stats, setStats] = useState<PlatformApiStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<number>(7);

  useEffect(() => {
    loadStats();
  }, [timeRange]);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      // TODO: Replace with actual API call
      // const data = await fetch('/api/admin/api-governance/stats?days=' + timeRange);
      
      // Mock data for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStats({
        totalRequests: 2847392,
        totalTenants: 145,
        totalApiKeys: 523,
        averageResponseTime: 124,
        successRate: 0.9876,
        topTenants: [
          { tenantId: 'ten_001', tenantName: 'First Baptist Church', requests: 458392, apiKeys: 12, plan: 'Enterprise' },
          { tenantId: 'ten_002', tenantName: 'Community Fellowship', requests: 284573, apiKeys: 8, plan: 'Pro' },
          { tenantId: 'ten_003', tenantName: 'Grace Chapel', requests: 192847, apiKeys: 5, plan: 'Pro' },
          { tenantId: 'ten_004', tenantName: 'Hope Church', requests: 147392, apiKeys: 3, plan: 'Starter' },
          { tenantId: 'ten_005', tenantName: 'Faith Community', requests: 98234, apiKeys: 4, plan: 'Starter' },
        ],
        recentAlerts: [
          {
            id: 'alert_001',
            type: 'rate_limit',
            tenantId: 'ten_003',
            tenantName: 'Grace Chapel',
            message: 'Approaching rate limit (95% of quota)',
            timestamp: new Date(Date.now() - 1000 * 60 * 15)
          },
          {
            id: 'alert_002',
            type: 'error_spike',
            tenantId: 'ten_002',
            tenantName: 'Community Fellowship',
            message: 'Error rate spike: 12% (normally 2%)',
            timestamp: new Date(Date.now() - 1000 * 60 * 45)
          },
          {
            id: 'alert_003',
            type: 'security',
            tenantId: 'ten_004',
            tenantName: 'Hope Church',
            message: 'Suspicious activity: API key used from unusual location',
            timestamp: new Date(Date.now() - 1000 * 60 * 120)
          }
        ],
        dailyUsage: [
          { date: '2025-11-18', requests: 387234, tenants: 142 },
          { date: '2025-11-19', requests: 412847, tenants: 143 },
          { date: '2025-11-20', requests: 398573, tenants: 144 },
          { date: '2025-11-21', requests: 429384, tenants: 144 },
          { date: '2025-11-22', requests: 445729, tenants: 145 },
          { date: '2025-11-23', requests: 432918, tenants: 145 },
          { date: '2025-11-24', requests: 340907, tenants: 145 }
        ]
      });
    } catch (err) {
      console.error('Failed to load API governance stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatPercentage = (value: number): string => {
    return `${(value * 100).toFixed(2)}%`;
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getAlertBadge = (type: string) => {
    switch (type) {
      case 'rate_limit':
        return <Badge variant="warning">Rate Limit</Badge>;
      case 'security':
        return <Badge variant="destructive">Security</Badge>;
      case 'error_spike':
        return <Badge variant="destructive">Error Spike</Badge>;
      default:
        return <Badge variant="secondary">Alert</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-gray-400 mr-3" />
        <span className="text-gray-600">Loading API governance data...</span>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Failed to Load Data</h2>
          <Button onClick={loadStats}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Shield className="w-8 h-8" />
            API Governance
          </h1>
          <p className="text-gray-600 mt-2">
            Monitor and manage platform-wide API usage and security
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange.toString()} onValueChange={(v) => setTimeRange(parseInt(v))}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Last 24 Hours</SelectItem>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="90">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total API Requests</CardDescription>
            <CardTitle className="text-3xl font-bold flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              {formatNumber(stats.totalRequests)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600">
            Platform-wide in last {timeRange} days
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Active Tenants</CardDescription>
            <CardTitle className="text-3xl font-bold flex items-center gap-2">
              <Users className="w-6 h-6 text-green-600" />
              {stats.totalTenants}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600">
            {stats.totalApiKeys} API keys total
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Success Rate</CardDescription>
            <CardTitle className="text-3xl font-bold flex items-center gap-2">
              <Activity className="w-6 h-6 text-purple-600" />
              {formatPercentage(stats.successRate)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600">
            {formatNumber(stats.totalRequests * (1 - stats.successRate))} errors
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Avg Response Time</CardDescription>
            <CardTitle className="text-3xl font-bold flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-orange-600" />
              {stats.averageResponseTime}ms
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600">
            Platform-wide average
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Tenants by Usage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Top Tenants by API Usage
            </CardTitle>
            <CardDescription>Highest API consumers for revenue attribution</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Requests</TableHead>
                  <TableHead>Keys</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.topTenants.map((tenant) => (
                  <TableRow key={tenant.tenantId}>
                    <TableCell className="font-medium">{tenant.tenantName}</TableCell>
                    <TableCell>
                      <Badge variant={
                        tenant.plan === 'Enterprise' ? 'default' :
                        tenant.plan === 'Pro' ? 'secondary' : 'outline'
                      }>
                        {tenant.plan}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatNumber(tenant.requests)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Key className="w-4 h-4 text-gray-400" />
                        {tenant.apiKeys}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Security Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Recent Alerts
            </CardTitle>
            <CardDescription>Security and performance alerts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentAlerts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No recent alerts
                </div>
              ) : (
                stats.recentAlerts.map((alert) => (
                  <div key={alert.id} className="border-l-4 border-orange-500 bg-orange-50 p-4 rounded">
                    <div className="flex items-start justify-between mb-2">
                      {getAlertBadge(alert.type)}
                      <span className="text-xs text-gray-500">{formatDate(alert.timestamp)}</span>
                    </div>
                    <p className="font-semibold text-gray-900">{alert.tenantName}</p>
                    <p className="text-sm text-gray-700">{alert.message}</p>
                    <Button variant="link" size="sm" className="p-0 h-auto mt-2">
                      View Details →
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Usage Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Daily Request Volume
          </CardTitle>
          <CardDescription>Platform-wide API usage trend</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.dailyUsage.map((day) => {
              const maxRequests = Math.max(...stats.dailyUsage.map(d => d.requests));
              const barWidth = (day.requests / maxRequests) * 100;

              return (
                <div key={day.date} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">
                      {new Date(day.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                    <div className="flex items-center gap-4">
                      <span className="text-gray-600">{formatNumber(day.requests)} requests</span>
                      <span className="text-gray-400">{day.tenants} tenants</span>
                    </div>
                  </div>
                  <div className="h-6 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Governance Actions</CardTitle>
          <CardDescription>Manage platform-wide API settings and controls</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="justify-start">
              <Shield className="w-4 h-4 mr-2" />
              Set Global Rate Limits
            </Button>
            <Button variant="outline" className="justify-start">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Configure Alert Thresholds
            </Button>
            <Button variant="outline" className="justify-start">
              <Key className="w-4 h-4 mr-2" />
              Audit All API Keys
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
