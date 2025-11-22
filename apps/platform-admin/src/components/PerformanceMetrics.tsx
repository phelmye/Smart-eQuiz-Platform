import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Activity, Zap, Clock, TrendingUp } from 'lucide-react';

export function PerformanceMetrics() {
  const metrics = [
    {
      name: 'API Response Time',
      value: '145ms',
      change: '-12%',
      status: 'good',
      icon: Zap,
    },
    {
      name: 'Database Queries',
      value: '2.3k/min',
      change: '+5%',
      status: 'good',
      icon: Activity,
    },
    {
      name: 'Avg Load Time',
      value: '1.2s',
      change: '-8%',
      status: 'good',
      icon: Clock,
    },
    {
      name: 'Active Sessions',
      value: '3,842',
      change: '+18%',
      status: 'excellent',
      icon: TrendingUp,
    },
  ];

  const statusColors = {
    excellent: 'bg-green-100 text-green-800',
    good: 'bg-blue-100 text-blue-800',
    warning: 'bg-yellow-100 text-yellow-800',
    critical: 'bg-red-100 text-red-800',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Performance Metrics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div
                key={metric.name}
                className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className="w-5 h-5 text-gray-400" />
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${statusColors[metric.status as keyof typeof statusColors]}`}
                  >
                    {metric.status}
                  </span>
                </div>
                <div className="mt-2">
                  <p className="text-2xl font-bold text-gray-900">
                    {metric.value}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">{metric.name}</p>
                  <p
                    className={`text-xs mt-2 ${
                      metric.change.startsWith('-')
                        ? 'text-green-600'
                        : 'text-blue-600'
                    }`}
                  >
                    {metric.change} from yesterday
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
