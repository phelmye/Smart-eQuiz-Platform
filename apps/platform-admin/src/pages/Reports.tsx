import { useState } from 'react';
import { Download, FileText, Calendar, TrendingUp, Users, DollarSign, Activity, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface Report {
  id: string;
  name: string;
  category: 'revenue' | 'users' | 'tenants' | 'activity' | 'custom';
  description: string;
  lastGenerated: string;
  schedule?: 'daily' | 'weekly' | 'monthly';
  format: 'pdf' | 'excel' | 'csv';
}

const predefinedReports: Report[] = [
  {
    id: 'rev-001',
    name: 'Monthly Revenue Report',
    category: 'revenue',
    description: 'Comprehensive breakdown of revenue by tenant, plan, and payment method',
    lastGenerated: '2024-02-15T08:00:00Z',
    schedule: 'monthly',
    format: 'pdf',
  },
  {
    id: 'user-001',
    name: 'User Growth Analysis',
    category: 'users',
    description: 'User registration trends, active user metrics, and churn analysis',
    lastGenerated: '2024-02-15T07:30:00Z',
    schedule: 'weekly',
    format: 'excel',
  },
  {
    id: 'ten-001',
    name: 'Tenant Performance Report',
    category: 'tenants',
    description: 'Usage statistics, engagement metrics, and plan utilization per tenant',
    lastGenerated: '2024-02-14T23:00:00Z',
    schedule: 'monthly',
    format: 'pdf',
  },
  {
    id: 'act-001',
    name: 'Platform Activity Dashboard',
    category: 'activity',
    description: 'Quiz creations, assessments taken, and overall platform engagement',
    lastGenerated: '2024-02-15T06:00:00Z',
    schedule: 'daily',
    format: 'excel',
  },
  {
    id: 'rev-002',
    name: 'Subscription Changes Report',
    category: 'revenue',
    description: 'Plan upgrades, downgrades, and cancellation trends',
    lastGenerated: '2024-02-15T05:00:00Z',
    format: 'csv',
  },
  {
    id: 'user-002',
    name: 'Support Ticket Analytics',
    category: 'users',
    description: 'Ticket volume, resolution times, and customer satisfaction metrics',
    lastGenerated: '2024-02-14T22:00:00Z',
    schedule: 'weekly',
    format: 'pdf',
  },
];

const categoryColors = {
  revenue: 'bg-green-100 text-green-800',
  users: 'bg-blue-100 text-blue-800',
  tenants: 'bg-purple-100 text-purple-800',
  activity: 'bg-orange-100 text-orange-800',
  custom: 'bg-gray-100 text-gray-800',
};

const categoryIcons = {
  revenue: DollarSign,
  users: Users,
  tenants: Activity,
  activity: TrendingUp,
  custom: FileText,
};

export default function Reports() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dateRange, setDateRange] = useState({ start: '2024-02-01', end: '2024-02-15' });
  const [showCustomBuilder, setShowCustomBuilder] = useState(false);

  // Sample data for quick insights
  const revenueByMonth = [
    { month: 'Aug', revenue: 38000 },
    { month: 'Sep', revenue: 42000 },
    { month: 'Oct', revenue: 45000 },
    { month: 'Nov', revenue: 48000 },
    { month: 'Dec', revenue: 51000 },
    { month: 'Jan', revenue: 54000 },
    { month: 'Feb', revenue: 54239 },
  ];

  const tenantsByPlan = [
    { plan: 'Starter', count: 95, revenue: 180500 },
    { plan: 'Professional', count: 118, revenue: 578200 },
    { plan: 'Enterprise', count: 35, revenue: 521650 },
  ];

  const filteredReports = selectedCategory === 'all'
    ? predefinedReports
    : predefinedReports.filter(report => report.category === selectedCategory);

  const generateReport = (reportId: string) => {
    alert(`Generating report: ${reportId}\nThis would trigger the backend to generate and download the report.`);
  };

  const scheduleReport = (reportId: string) => {
    alert(`Scheduling report: ${reportId}\nThis would open a modal to configure the schedule.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="mt-1 text-sm text-gray-500">
            Generate comprehensive reports and export data for analysis
          </p>
        </div>
        <button 
          onClick={() => setShowCustomBuilder(!showCustomBuilder)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <FileText className="h-4 w-4" />
          <span>{showCustomBuilder ? 'Hide Custom Builder' : 'Custom Report'}</span>
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Reports</p>
                <p className="text-2xl font-bold text-gray-900">{predefinedReports.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Scheduled</p>
                <p className="text-2xl font-bold text-green-600">
                  {predefinedReports.filter(r => r.schedule).length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Generated Today</p>
                <p className="text-2xl font-bold text-purple-600">4</p>
              </div>
              <Activity className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Export Formats</p>
                <p className="text-2xl font-bold text-orange-600">3</p>
              </div>
              <Download className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend (Last 7 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => `$${value.toLocaleString()}`}
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb' }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue by Plan */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Subscription Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={tenantsByPlan}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="plan" />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => `$${value.toLocaleString()}`}
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb' }}
                />
                <Legend />
                <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filter by:</span>
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Categories</option>
          <option value="revenue">Revenue</option>
          <option value="users">Users</option>
          <option value="tenants">Tenants</option>
          <option value="activity">Activity</option>
          <option value="custom">Custom</option>
        </select>

        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-600">From:</label>
          <Input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            className="w-40"
          />
          <label className="text-sm text-gray-600">To:</label>
          <Input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            className="w-40"
          />
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports.map((report) => {
          const Icon = categoryIcons[report.category];
          return (
            <Card key={report.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{report.name}</h3>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {report.description}
                </p>

                <div className="flex items-center space-x-2 mb-4">
                  <Badge className={categoryColors[report.category]}>
                    {report.category}
                  </Badge>
                  {report.schedule && (
                    <Badge className="bg-yellow-100 text-yellow-800">
                      {report.schedule}
                    </Badge>
                  )}
                  <Badge className="bg-gray-100 text-gray-800">
                    {report.format.toUpperCase()}
                  </Badge>
                </div>

                <div className="text-xs text-gray-500 mb-4">
                  Last generated: {new Date(report.lastGenerated).toLocaleString()}
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => generateReport(report.id)}
                    className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    <Download className="h-4 w-4" />
                    <span>Generate</span>
                  </button>
                  {!report.schedule && (
                    <button
                      onClick={() => scheduleReport(report.id)}
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                    >
                      <Calendar className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Custom Report Builder */}
      {showCustomBuilder && (
        <Card>
          <CardHeader>
            <CardTitle>Custom Report Builder</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Report Name
                  </label>
                  <Input placeholder="e.g., Q1 Performance Summary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Revenue</option>
                    <option>Users</option>
                    <option>Tenants</option>
                    <option>Activity</option>
                    <option>Custom</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Range
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Last 7 days</option>
                    <option>Last 30 days</option>
                    <option>Last 3 months</option>
                    <option>Last 6 months</option>
                    <option>Last year</option>
                    <option>Custom range</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Format
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>PDF</option>
                    <option>Excel</option>
                    <option>CSV</option>
                    <option>JSON</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Schedule
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>One-time</option>
                    <option>Daily</option>
                    <option>Weekly</option>
                    <option>Monthly</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Metrics to Include
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    'Total Revenue',
                    'Active Users',
                    'New Tenants',
                    'Churn Rate',
                    'MRR Growth',
                    'Conversion Rate',
                    'Support Tickets',
                    'Platform Usage',
                  ].map((metric) => (
                    <label key={metric} className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded text-blue-600" defaultChecked />
                      <span className="text-sm text-gray-700">{metric}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <button 
                  onClick={() => alert('Save report template')}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Save as Template
                </button>
                <button 
                  onClick={() => alert('Generate custom report')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Generate Report
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
