import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  Activity,
  Server,
  Database,
  Cloud,
  Wifi,
  HardDrive,
  Cpu,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface ServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'down';
  uptime: number;
  responseTime: number;
  lastChecked: string;
}

interface SystemMetric {
  timestamp: string;
  cpu: number;
  memory: number;
  disk: number;
  network: number;
}

export default function SystemHealth() {
  const [services] = useState<ServiceStatus[]>([
    {
      name: 'API Server',
      status: 'operational',
      uptime: 99.98,
      responseTime: 45,
      lastChecked: new Date().toISOString(),
    },
    {
      name: 'Database',
      status: 'operational',
      uptime: 99.99,
      responseTime: 12,
      lastChecked: new Date().toISOString(),
    },
    {
      name: 'CDN',
      status: 'operational',
      uptime: 99.95,
      responseTime: 28,
      lastChecked: new Date().toISOString(),
    },
    {
      name: 'Email Service',
      status: 'operational',
      uptime: 99.92,
      responseTime: 156,
      lastChecked: new Date().toISOString(),
    },
    {
      name: 'Storage',
      status: 'operational',
      uptime: 99.97,
      responseTime: 34,
      lastChecked: new Date().toISOString(),
    },
    {
      name: 'Authentication',
      status: 'operational',
      uptime: 99.99,
      responseTime: 23,
      lastChecked: new Date().toISOString(),
    },
  ]);

  // System metrics data
  const [metrics] = useState<SystemMetric[]>([
    { timestamp: '00:00', cpu: 45, memory: 62, disk: 58, network: 32 },
    { timestamp: '04:00', cpu: 38, memory: 64, disk: 58, network: 28 },
    { timestamp: '08:00', cpu: 52, memory: 68, disk: 59, network: 45 },
    { timestamp: '12:00', cpu: 68, memory: 72, disk: 59, network: 62 },
    { timestamp: '16:00', cpu: 58, memory: 70, disk: 60, network: 54 },
    { timestamp: '20:00', cpu: 42, memory: 66, disk: 60, network: 38 },
    { timestamp: '23:59', cpu: 48, memory: 65, disk: 60, network: 35 },
  ]);

  // Recent incidents
  const incidents = [
    {
      id: '1',
      title: 'Increased API Response Time',
      status: 'resolved',
      severity: 'medium',
      startTime: '2024-02-14T15:30:00Z',
      endTime: '2024-02-14T16:15:00Z',
      duration: '45 minutes',
      affectedServices: ['API Server'],
    },
    {
      id: '2',
      title: 'Database Connection Pool Saturation',
      status: 'resolved',
      severity: 'high',
      startTime: '2024-02-12T08:20:00Z',
      endTime: '2024-02-12T09:05:00Z',
      duration: '45 minutes',
      affectedServices: ['Database', 'API Server'],
    },
  ];

  const statusColors = {
    operational: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
    degraded: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: AlertCircle },
    down: { bg: 'bg-red-100', text: 'text-red-800', icon: AlertCircle },
  };

  const serviceIcons = {
    'API Server': Server,
    'Database': Database,
    'CDN': Cloud,
    'Email Service': Wifi,
    'Storage': HardDrive,
    'Authentication': Activity,
  };

  const getStatusIcon = (status: ServiceStatus['status']) => {
    const StatusIcon = statusColors[status].icon;
    return StatusIcon;
  };

  const getResponseTimeColor = (time: number) => {
    if (time < 50) return 'text-green-600';
    if (time < 100) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getUptimeColor = (uptime: number) => {
    if (uptime >= 99.9) return 'text-green-600';
    if (uptime >= 99.0) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">System Health</h1>
        <p className="mt-1 text-sm text-gray-500">
          Monitor platform infrastructure and service status
        </p>
      </div>

      {/* Overall Status */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">All Systems Operational</h2>
                <p className="text-sm text-gray-600">Last updated: {new Date().toLocaleString()}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-green-600">99.97%</p>
              <p className="text-sm text-gray-600">30-day uptime</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service) => {
          const Icon = serviceIcons[service.name as keyof typeof serviceIcons] || Server;
          const StatusIcon = getStatusIcon(service.status);
          const colors = statusColors[service.status];

          return (
            <Card key={service.name}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{service.name}</h3>
                    </div>
                  </div>
                  <Badge className={`${colors.bg} ${colors.text}`}>
                    <StatusIcon className="h-3 w-3 mr-1 inline" />
                    {service.status}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Uptime</span>
                    <span className={`font-semibold ${getUptimeColor(service.uptime)}`}>
                      {service.uptime}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Response Time</span>
                    <span className={`font-semibold ${getResponseTimeColor(service.responseTime)}`}>
                      {service.responseTime}ms
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Last Check</span>
                    <span className="text-gray-900">
                      {new Date(service.lastChecked).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* System Metrics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CPU & Memory */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Cpu className="h-5 w-5" />
              <span>CPU & Memory Usage</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={metrics}>
                <defs>
                  <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorMemory" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => `${value}%`}
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb' }}
                />
                <Area
                  type="monotone"
                  dataKey="cpu"
                  stroke="#3b82f6"
                  fill="url(#colorCpu)"
                  name="CPU"
                />
                <Area
                  type="monotone"
                  dataKey="memory"
                  stroke="#8b5cf6"
                  fill="url(#colorMemory)"
                  name="Memory"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Disk & Network */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <HardDrive className="h-5 w-5" />
              <span>Disk & Network Usage</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={metrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => `${value}%`}
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb' }}
                />
                <Line
                  type="monotone"
                  dataKey="disk"
                  stroke="#f97316"
                  strokeWidth={2}
                  dot={{ fill: '#f97316', r: 3 }}
                  name="Disk"
                />
                <Line
                  type="monotone"
                  dataKey="network"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: '#10b981', r: 3 }}
                  name="Network"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Current System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">CPU Usage</p>
                <p className="text-2xl font-bold text-gray-900">48%</p>
              </div>
              <Cpu className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '48%' }}></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Memory</p>
                <p className="text-2xl font-bold text-gray-900">65%</p>
              </div>
              <Activity className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div className="bg-purple-600 h-2 rounded-full" style={{ width: '65%' }}></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Disk Space</p>
                <p className="text-2xl font-bold text-gray-900">60%</p>
              </div>
              <HardDrive className="h-8 w-8 text-orange-600" />
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div className="bg-orange-600 h-2 rounded-full" style={{ width: '60%' }}></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Network</p>
                <p className="text-2xl font-bold text-gray-900">35%</p>
              </div>
              <Wifi className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '35%' }}></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Incidents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Recent Incidents</span>
            <Badge className="bg-blue-100 text-blue-800">
              {incidents.length} total
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {incidents.map((incident) => (
              <div
                key={incident.id}
                className="flex items-start justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-semibold text-gray-900">{incident.title}</h3>
                    <Badge
                      className={
                        incident.severity === 'high'
                          ? 'bg-red-100 text-red-800'
                          : incident.severity === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                      }
                    >
                      {incident.severity}
                    </Badge>
                    <Badge className="bg-green-100 text-green-800">{incident.status}</Badge>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{incident.duration}</span>
                    </div>
                    <span>•</span>
                    <span>{new Date(incident.startTime).toLocaleString()}</span>
                    <span>•</span>
                    <span>{incident.affectedServices.join(', ')}</span>
                  </div>
                </div>
              </div>
            ))}

            {incidents.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-600" />
                <p>No incidents in the past 30 days</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                <p className="text-2xl font-bold text-gray-900">45ms</p>
                <p className="text-sm text-green-600 mt-1 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  12% faster than last week
                </p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">2.4M</p>
                <p className="text-sm text-green-600 mt-1 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  8% increase
                </p>
              </div>
              <Server className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Error Rate</p>
                <p className="text-2xl font-bold text-gray-900">0.03%</p>
                <p className="text-sm text-green-600 mt-1 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  15% improvement
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
