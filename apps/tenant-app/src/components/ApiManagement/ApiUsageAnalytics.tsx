/**
 * API Usage Analytics Component
 * 
 * Displays comprehensive analytics about API usage including:
 * - Request volume over time
 * - Success/error rates
 * - Response time metrics
 * - Top endpoints
 * - Status code distribution
 */

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  BarChart3,
  TrendingUp,
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Download
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  apiManagementClient,
  type ApiLogStats
} from '@/lib/apiManagementClient';

export default function ApiUsageAnalytics() {
  const [stats, setStats] = useState<ApiLogStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<number>(7);

  useEffect(() => {
    loadStats();
  }, [timeRange]);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiManagementClient.getApiStats(timeRange);
      setStats(data);
    } catch (err) {
      console.error('Failed to load API statistics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load statistics');
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
    return `${(value * 100).toFixed(1)}%`;
  };

  const formatResponseTime = (ms: number): string => {
    if (ms >= 1000) return `${(ms / 1000).toFixed(2)}s`;
    return `${ms.toFixed(0)}ms`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin text-gray-400 mr-2" />
            <span className="text-gray-600">Loading analytics...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Analytics</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadStats}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats || stats.totalRequests === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No API Usage Yet</h3>
            <p className="text-gray-600">
              Analytics will appear here once you start making API requests
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const successRate = stats.totalRequests > 0
    ? stats.successfulRequests / stats.totalRequests
    : 0;

  return (
    <div className="space-y-6">
      {/* Header with Time Range Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Usage Analytics</h2>
          <p className="text-gray-600">Monitor your API performance and usage patterns</p>
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
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Requests</CardDescription>
            <CardTitle className="text-3xl font-bold">
              {formatNumber(stats.totalRequests)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-gray-600">
              <BarChart3 className="w-4 h-4 mr-2" />
              All API calls
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Success Rate</CardDescription>
            <CardTitle className="text-3xl font-bold flex items-center gap-2">
              {formatPercentage(successRate)}
              {successRate >= 0.95 ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm">
              <span className="text-green-600">{formatNumber(stats.successfulRequests)} successful</span>
              <span className="mx-2">•</span>
              <span className="text-red-600">{formatNumber(stats.failedRequests)} failed</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Avg Response Time</CardDescription>
            <CardTitle className="text-3xl font-bold">
              {formatResponseTime(stats.averageResponseTime)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-xs text-gray-600">
              <div>P50: {formatResponseTime(stats.p50ResponseTime)}</div>
              <div>P95: {formatResponseTime(stats.p95ResponseTime)}</div>
              <div>P99: {formatResponseTime(stats.p99ResponseTime)}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Error Rate</CardDescription>
            <CardTitle className="text-3xl font-bold">
              {formatPercentage(1 - successRate)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-red-600">
              <AlertTriangle className="w-4 h-4 mr-2" />
              {formatNumber(stats.failedRequests)} errors
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Request Volume Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Request Volume Over Time
          </CardTitle>
          <CardDescription>Daily API request count and error rate</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.dailyRequestVolume.length > 0 ? (
              <div className="space-y-2">
                {stats.dailyRequestVolume.map((day) => {
                  const errorRate = day.requests > 0 ? day.errors / day.requests : 0;
                  const maxRequests = Math.max(...stats.dailyRequestVolume.map(d => d.requests));
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
                          {day.errors > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {day.errors} errors ({formatPercentage(errorRate)})
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="h-6 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 transition-all"
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No daily data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Endpoints */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Top Endpoints
            </CardTitle>
            <CardDescription>Most frequently accessed API endpoints</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.topEndpoints.length > 0 ? (
              <div className="space-y-3">
                {stats.topEndpoints.slice(0, 10).map((endpoint, index) => (
                  <div key={endpoint.endpoint} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Badge variant="outline" className="text-xs">
                          #{index + 1}
                        </Badge>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded truncate">
                          {endpoint.endpoint}
                        </code>
                      </div>
                      <div className="flex items-center gap-3 text-sm ml-4">
                        <span className="text-gray-600">{formatNumber(endpoint.count)}</span>
                        <span className="text-gray-400">
                          {formatResponseTime(endpoint.avgResponseTime)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No endpoint data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Code Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              HTTP Status Codes
            </CardTitle>
            <CardDescription>Response status code breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(stats.statusCodeDistribution).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(stats.statusCodeDistribution)
                  .sort(([, a], [, b]) => b - a)
                  .map(([code, count]) => {
                    const percentage = (count / stats.totalRequests) * 100;
                    const codeNum = parseInt(code);
                    let variant: 'default' | 'success' | 'warning' | 'destructive' = 'default';
                    
                    if (codeNum >= 200 && codeNum < 300) variant = 'success';
                    else if (codeNum >= 300 && codeNum < 400) variant = 'default';
                    else if (codeNum >= 400 && codeNum < 500) variant = 'warning';
                    else if (codeNum >= 500) variant = 'destructive';

                    return (
                      <div key={code} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <Badge variant={variant}>{code}</Badge>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-600">{formatNumber(count)}</span>
                            <span className="text-gray-400">({percentage.toFixed(1)}%)</span>
                          </div>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              variant === 'success' ? 'bg-green-500' :
                              variant === 'warning' ? 'bg-yellow-500' :
                              variant === 'destructive' ? 'bg-red-500' :
                              'bg-blue-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No status code data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
