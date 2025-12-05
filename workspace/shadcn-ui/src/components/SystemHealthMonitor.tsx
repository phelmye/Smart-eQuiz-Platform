import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Activity,
  Database,
  Server,
  HardDrive,
  Mail,
  CreditCard,
  RefreshCw,
  Clock,
  TrendingUp,
  Zap
} from 'lucide-react';

interface SystemHealthMonitorProps {
  onBack: () => void;
}

interface ServiceStatus {
  name: string;
  status: 'up' | 'down' | 'degraded';
  responseTime: number;
  lastChecked: string;
  uptime24h: number;
  icon: React.ElementType;
  details?: string;
}

interface SystemMetrics {
  avgResponseTime: number;
  errorRate: number;
  activeConnections: number;
  requestsPerMinute: number;
}

interface SystemHealth {
  overallStatus: 'operational' | 'degraded' | 'outage';
  uptime: number;
  services: ServiceStatus[];
  metrics: SystemMetrics;
  recentIncidents: Array<{
    id: string;
    title: string;
    status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
    timestamp: string;
    description: string;
  }>;
}

export const SystemHealthMonitor: React.FC<SystemHealthMonitorProps> = ({ onBack }) => {
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    checkSystemHealth();
    // Auto-refresh every 60 seconds
    const interval = setInterval(checkSystemHealth, 60000);
    return () => clearInterval(interval);
  }, []);

  const checkSystemHealth = async () => {
    setIsLoading(true);
    
    // Simulate health check (in production, this would call actual health endpoints)
    await new Promise(resolve => setTimeout(resolve, 500));

    const services: ServiceStatus[] = [
      {
        name: 'API Server',
        status: 'up',
        responseTime: Math.floor(Math.random() * 50) + 20,
        lastChecked: new Date().toISOString(),
        uptime24h: 99.9,
        icon: Server,
        details: 'All endpoints responding normally'
      },
      {
        name: 'Database',
        status: 'up',
        responseTime: Math.floor(Math.random() * 30) + 10,
        lastChecked: new Date().toISOString(),
        uptime24h: 100,
        icon: Database,
        details: 'Connection pool healthy'
      },
      {
        name: 'Storage Service',
        status: 'up',
        responseTime: Math.floor(Math.random() * 100) + 50,
        lastChecked: new Date().toISOString(),
        uptime24h: 99.8,
        icon: HardDrive,
        details: '234 GB used of 1 TB'
      },
      {
        name: 'Email Service',
        status: Math.random() > 0.9 ? 'degraded' : 'up',
        responseTime: Math.floor(Math.random() * 200) + 100,
        lastChecked: new Date().toISOString(),
        uptime24h: 99.5,
        icon: Mail,
        details: Math.random() > 0.9 ? 'Experiencing delays' : 'All emails sending normally'
      },
      {
        name: 'Payment Gateway',
        status: 'up',
        responseTime: Math.floor(Math.random() * 150) + 80,
        lastChecked: new Date().toISOString(),
        uptime24h: 99.9,
        icon: CreditCard,
        details: 'Stripe API responding normally'
      }
    ];

    // Determine overall status
    const hasDown = services.some(s => s.status === 'down');
    const hasDegraded = services.some(s => s.status === 'degraded');
    const overallStatus = hasDown ? 'outage' : hasDegraded ? 'degraded' : 'operational';

    // Calculate metrics
    const avgResponseTime = Math.round(
      services.reduce((sum, s) => sum + s.responseTime, 0) / services.length
    );
    const uptime = Math.min(...services.map(s => s.uptime24h));

    const health: SystemHealth = {
      overallStatus,
      uptime,
      services,
      metrics: {
        avgResponseTime,
        errorRate: Math.random() * 0.5, // 0-0.5%
        activeConnections: Math.floor(Math.random() * 500) + 100,
        requestsPerMinute: Math.floor(Math.random() * 5000) + 1000
      },
      recentIncidents: []
    };

    setSystemHealth(health);
    setLastUpdate(new Date());
    setIsLoading(false);
  };

  const getStatusBadge = (status: 'operational' | 'degraded' | 'outage' | 'up' | 'down') => {
    const config = {
      operational: { variant: 'default', label: 'Operational', icon: CheckCircle, color: 'text-green-600' },
      up: { variant: 'default', label: 'Up', icon: CheckCircle, color: 'text-green-600' },
      degraded: { variant: 'secondary', label: 'Degraded', icon: AlertTriangle, color: 'text-yellow-600' },
      outage: { variant: 'destructive', label: 'Outage', icon: XCircle, color: 'text-red-600' },
      down: { variant: 'destructive', label: 'Down', icon: XCircle, color: 'text-red-600' }
    };
    return config[status] || config.operational;
  };

  const getServiceStatusIcon = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'up':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'degraded':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'down':
        return <XCircle className="h-5 w-5 text-red-600" />;
    }
  };

  if (!systemHealth) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const StatusIcon = getStatusBadge(systemHealth.overallStatus).icon;

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
                <h1 className="text-3xl font-bold text-gray-900">System Health</h1>
                <p className="text-gray-600">Real-time system status and performance monitoring</p>
              </div>
            </div>
            <Button variant="outline" onClick={checkSystemHealth} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Overall Status Banner */}
        <Alert
          variant={systemHealth.overallStatus === 'outage' ? 'destructive' : 'default'}
          className="mb-6"
        >
          <StatusIcon className="h-5 w-5" />
          <AlertDescription className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-lg">
                System Status: {getStatusBadge(systemHealth.overallStatus).label}
              </div>
              <div className="text-sm mt-1">
                All services are {systemHealth.overallStatus === 'operational' ? 'running normally' : 'experiencing issues'}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">24h Uptime</div>
              <div className="text-2xl font-bold">{systemHealth.uptime.toFixed(2)}%</div>
            </div>
          </AlertDescription>
        </Alert>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Avg Response Time</p>
                  <p className="text-2xl font-bold">{systemHealth.metrics.avgResponseTime}ms</p>
                </div>
                <Zap className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Error Rate</p>
                  <p className="text-2xl font-bold">{systemHealth.metrics.errorRate.toFixed(2)}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Active Connections</p>
                  <p className="text-2xl font-bold">{systemHealth.metrics.activeConnections}</p>
                </div>
                <Activity className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Requests/Min</p>
                  <p className="text-2xl font-bold">{systemHealth.metrics.requestsPerMinute}</p>
                </div>
                <Server className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Services Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Service Status</CardTitle>
            <CardDescription>Individual service health and performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {systemHealth.services.map((service, index) => {
                const ServiceIcon = service.icon;
                return (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <ServiceIcon className="h-8 w-8 text-gray-600" />
                      <div>
                        <div className="font-semibold">{service.name}</div>
                        <div className="text-sm text-gray-500">{service.details}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Response Time</div>
                        <div className="font-semibold">{service.responseTime}ms</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">24h Uptime</div>
                        <div className="font-semibold">{service.uptime24h}%</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getServiceStatusIcon(service.status)}
                        <Badge variant={getStatusBadge(service.status).variant as any}>
                          {getStatusBadge(service.status).label}
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Last Update */}
        <div className="text-center text-sm text-gray-500 flex items-center justify-center gap-2">
          <Clock className="h-4 w-4" />
          Last updated: {lastUpdate.toLocaleTimeString()} • Auto-refresh every 60 seconds
        </div>
      </div>
    </div>
  );
};

export default SystemHealthMonitor;
