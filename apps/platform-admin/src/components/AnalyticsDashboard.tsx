import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import {
  BarChart3,
  TrendingUp,
  Users,
  MousePointerClick,
  Eye,
  Target,
  Globe,
  Monitor,
  RefreshCw,
} from 'lucide-react';

interface AnalyticsDashboardProps {
  className?: string;
}

interface OverviewData {
  overview: {
    totalEvents: number;
    totalConversions: number;
    uniqueVisitors: number;
    ctaClicks: number;
    pageViews: number;
    conversionRate: number;
  };
  topPages: Array<{ url: string; views: number }>;
  eventsByDay: Array<{ date: string; count: number }>;
  conversionsByType: Array<{ type: string; count: number }>;
  dateRange: {
    start: string;
    end: string;
  };
}

export function AnalyticsDashboard({ className }: AnalyticsDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [ctaPerformance, setCtaPerformance] = useState<Array<{ label: string; clicks: number }>>([]);
  const [trafficSources, setTrafficSources] = useState<Array<{ source: string; medium: string | null; count: number }>>([]);
  const [deviceStats, setDeviceStats] = useState<any>(null);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load from localStorage or use mock data
      const savedAnalytics = localStorage.getItem('platform_analytics');
      
      if (savedAnalytics) {
        const data = JSON.parse(savedAnalytics);
        setOverview(data.overview);
        setCtaPerformance(data.ctaPerformance || []);
        setTrafficSources(data.trafficSources || []);
        setDeviceStats(data.deviceStats || null);
      } else {
        // Initialize with mock data
        const mockOverviewData: OverviewData = {
          overview: {
            totalEvents: 15420,
            totalConversions: 892,
            uniqueVisitors: 8945,
            ctaClicks: 1234,
            pageViews: 24567,
            conversionRate: 5.8
          },
          topPages: [
            { url: '/demo', views: 4521 },
            { url: '/pricing', views: 3892 },
            { url: '/features', views: 3204 },
            { url: '/about', views: 2156 },
            { url: '/blog', views: 1894 }
          ],
          eventsByDay: Array.from({ length: 30 }, (_, i) => ({
            date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            count: Math.floor(Math.random() * 500) + 300
          })),
          conversionsByType: [
            { type: 'Sign Up', count: 456 },
            { type: 'Demo Request', count: 234 },
            { type: 'Contact Form', count: 202 }
          ],
          dateRange: {
            start: dateRange.start,
            end: dateRange.end
          }
        };

        const mockCtaData = [
          { label: 'Get Started Free', clicks: 567 },
          { label: 'Request Demo', clicks: 234 },
          { label: 'View Pricing', clicks: 189 },
          { label: 'Contact Sales', clicks: 156 },
          { label: 'Learn More', clicks: 88 }
        ];

        const mockTrafficData = [
          { source: 'Google', medium: 'organic', count: 3456 },
          { source: 'Direct', medium: null, count: 2134 },
          { source: 'Facebook', medium: 'social', count: 1245 },
          { source: 'LinkedIn', medium: 'social', count: 876 },
          { source: 'Email', medium: 'email', count: 543 }
        ];

        const mockDeviceData = {
          desktop: 5234,
          mobile: 2891,
          tablet: 820
        };

        setOverview(mockOverviewData);
        setCtaPerformance(mockCtaData);
        setTrafficSources(mockTrafficData);
        setDeviceStats(mockDeviceData);

        // Save to localStorage
        localStorage.setItem('platform_analytics', JSON.stringify({
          overview: mockOverviewData,
          ctaPerformance: mockCtaData,
          trafficSources: mockTrafficData,
          deviceStats: mockDeviceData,
          lastUpdated: new Date().toISOString()
        }));
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatPercentage = (num: number): string => {
    return `${num.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className={className}>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-purple-600" />
          <span className="ml-3 text-lg text-gray-600">Loading analytics...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {error}</p>
          <button
            onClick={fetchAnalytics}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Marketing Analytics</h1>
        <p className="text-gray-600">
          Track performance, conversions, and user engagement
        </p>
      </div>

      {/* Date Range Selector */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <button
              onClick={fetchAnalytics}
              className="mt-6 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Visitors
              </CardTitle>
              <Users className="w-5 h-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {formatNumber(overview.overview.uniqueVisitors)}
              </div>
              <p className="text-xs text-gray-500 mt-1">Unique visitors tracked</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Page Views
              </CardTitle>
              <Eye className="w-5 h-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {formatNumber(overview.overview.pageViews)}
              </div>
              <p className="text-xs text-gray-500 mt-1">Total page views</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                CTA Clicks
              </CardTitle>
              <MousePointerClick className="w-5 h-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {formatNumber(overview.overview.ctaClicks)}
              </div>
              <p className="text-xs text-gray-500 mt-1">Call-to-action clicks</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Conversion Rate
              </CardTitle>
              <Target className="w-5 h-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {formatPercentage(overview.overview.conversionRate)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {overview.overview.totalConversions} conversions
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Top Pages */}
        {overview && overview.topPages.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Top Pages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {overview.topPages.slice(0, 5).map((page, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {page.url}
                      </p>
                    </div>
                    <div className="ml-4 flex items-center gap-3">
                      <div
                        className="h-2 bg-purple-600 rounded"
                        style={{
                          width: `${(page.views / overview.topPages[0].views) * 100}px`,
                          minWidth: '20px',
                        }}
                      />
                      <span className="text-sm font-semibold text-gray-700 w-12 text-right">
                        {formatNumber(page.views)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* CTA Performance */}
        {ctaPerformance.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MousePointerClick className="w-5 h-5" />
                CTA Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {ctaPerformance.slice(0, 5).map((cta, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {cta.label || 'Unnamed CTA'}
                      </p>
                    </div>
                    <div className="ml-4 flex items-center gap-3">
                      <div
                        className="h-2 bg-green-600 rounded"
                        style={{
                          width: `${(cta.clicks / ctaPerformance[0].clicks) * 100}px`,
                          minWidth: '20px',
                        }}
                      />
                      <span className="text-sm font-semibold text-gray-700 w-12 text-right">
                        {formatNumber(cta.clicks)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Traffic Sources & Device Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Traffic Sources */}
        {trafficSources.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Traffic Sources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {trafficSources.slice(0, 5).map((source, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {source.source || 'Direct'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {source.medium || 'none'}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-gray-700">
                      {formatNumber(source.count)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Device Stats */}
        {deviceStats && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="w-5 h-5" />
                Device Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Device Types */}
                {deviceStats.deviceTypes && deviceStats.deviceTypes.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-2 uppercase">
                      Device Types
                    </p>
                    <div className="space-y-2">
                      {deviceStats.deviceTypes.map((device: any, index: number) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm text-gray-900 capitalize">
                            {device.type || 'Unknown'}
                          </span>
                          <span className="text-sm font-semibold text-gray-700">
                            {formatNumber(device.count)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Browsers */}
                {deviceStats.browsers && deviceStats.browsers.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-2 uppercase">
                      Top Browsers
                    </p>
                    <div className="space-y-2">
                      {deviceStats.browsers.slice(0, 3).map((browser: any, index: number) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm text-gray-900">
                            {browser.name || 'Unknown'}
                          </span>
                          <span className="text-sm font-semibold text-gray-700">
                            {formatNumber(browser.count)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Conversions by Type */}
      {overview && overview.conversionsByType.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Conversions by Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {overview.conversionsByType.map((conversion, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <p className="text-sm text-gray-600 capitalize mb-1">
                    {conversion.type.replace(/_/g, ' ')}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatNumber(conversion.count)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Events Timeline */}
      {overview && overview.eventsByDay && overview.eventsByDay.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Event Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {overview.eventsByDay.map((day: any, index: number) => (
                <div key={index} className="flex items-center gap-4">
                  <span className="text-sm text-gray-600 w-32">
                    {new Date(day.date).toLocaleDateString()}
                  </span>
                  <div className="flex-1">
                    <div
                      className="h-8 bg-purple-500 rounded flex items-center justify-end px-2"
                      style={{
                        width: `${(Number(day.count) / Math.max(...overview.eventsByDay.map((d: any) => Number(d.count)))) * 100}%`,
                        minWidth: '40px',
                      }}
                    >
                      <span className="text-white text-sm font-semibold">
                        {formatNumber(Number(day.count))}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
