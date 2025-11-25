import { Building2, Users, DollarSign, TrendingUp, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ActivityFeed } from '../components/ActivityFeed';
import { PerformanceMetrics } from '../components/PerformanceMetrics';
import { TenantsOverview } from '../components/TenantsOverview';
import { WelcomeBanner } from '../components/WelcomeBanner';
import { useToast } from '../hooks/use-toast';

export default function Dashboard() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast({
        title: "Dashboard Refreshed",
        description: "All data has been updated successfully.",
      });
    }, 1000);
  };

  const stats = [
    {
      name: 'Total Tenants',
      value: '248',
      change: '+12.5%',
      changeType: 'increase',
      icon: Building2,
    },
    {
      name: 'Active Users',
      value: '12,543',
      change: '+8.2%',
      changeType: 'increase',
      icon: Users,
    },
    {
      name: 'Monthly Revenue',
      value: '$54,239',
      change: '+15.3%',
      changeType: 'increase',
      icon: DollarSign,
    },
    {
      name: 'Platform Growth',
      value: '23.8%',
      change: '+4.1%',
      changeType: 'increase',
      icon: TrendingUp,
    },
  ];

  // Revenue trend data
  const revenueData = [
    { month: 'Jan', revenue: 35000, target: 32000 },
    { month: 'Feb', revenue: 38000, target: 35000 },
    { month: 'Mar', revenue: 42000, target: 38000 },
    { month: 'Apr', revenue: 45000, target: 40000 },
    { month: 'May', revenue: 48000, target: 43000 },
    { month: 'Jun', revenue: 54239, target: 45000 },
  ];

  // User growth data
  const userGrowthData = [
    { month: 'Jan', users: 8500 },
    { month: 'Feb', users: 9200 },
    { month: 'Mar', users: 10100 },
    { month: 'Apr', users: 10800 },
    { month: 'May', users: 11600 },
    { month: 'Jun', users: 12543 },
  ];

  // Tenant distribution by plan
  const planDistribution = [
    { name: 'Starter', value: 95, color: '#3b82f6' },
    { name: 'Professional', value: 118, color: '#8b5cf6' },
    { name: 'Enterprise', value: 35, color: '#f97316' },
  ];

  // Activity data
  const activityData = [
    { day: 'Mon', logins: 1200, quizzes: 850, assessments: 420 },
    { day: 'Tue', logins: 1400, quizzes: 920, assessments: 510 },
    { day: 'Wed', logins: 1300, quizzes: 880, assessments: 480 },
    { day: 'Thu', logins: 1500, quizzes: 1020, assessments: 560 },
    { day: 'Fri', logins: 1350, quizzes: 950, assessments: 520 },
    { day: 'Sat', logins: 800, quizzes: 580, assessments: 280 },
    { day: 'Sun', logins: 650, quizzes: 420, assessments: 210 },
  ];

  const recentTenants = [
    { name: 'Acme University', plan: 'Enterprise', status: 'active', joined: '2 hours ago' },
    { name: 'Tech Academy', plan: 'Professional', status: 'active', joined: '5 hours ago' },
    { name: 'Global Institute', plan: 'Starter', status: 'trial', joined: '1 day ago' },
    { name: 'Learning Hub', plan: 'Professional', status: 'active', joined: '2 days ago' },
    { name: 'Education Plus', plan: 'Enterprise', status: 'active', joined: '3 days ago' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <WelcomeBanner />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back! Here's what's happening today.</p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          disabled={isRefreshing}
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="bg-white overflow-hidden rounded-lg border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="mt-2 text-3xl font-semibold text-gray-900">{stat.value}</p>
                  <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    {stat.change} from last month
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Performance Metrics */}
      <PerformanceMetrics />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => `$${value.toLocaleString()}`}
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb' }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#colorRevenue)"
                  name="Revenue"
                />
                <Area
                  type="monotone"
                  dataKey="target"
                  stroke="#94a3b8"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  fill="none"
                  name="Target"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Growth */}
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb' }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  dot={{ fill: '#8b5cf6', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Active Users"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Weekly Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb' }}
                />
                <Legend />
                <Bar dataKey="logins" fill="#3b82f6" name="Logins" />
                <Bar dataKey="quizzes" fill="#8b5cf6" name="Quizzes" />
                <Bar dataKey="assessments" fill="#f97316" name="Assessments" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Plan Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={planDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {planDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 flex justify-center space-x-4">
              {planDistribution.map((plan) => (
                <div key={plan.name} className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: plan.color }}
                  />
                  <span className="text-sm text-gray-600">
                    {plan.name} ({plan.value})
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Tenants */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Tenants</h3>
          <div className="space-y-4">
            {recentTenants.map((tenant, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-medium">
                    {tenant.name.substring(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{tenant.name}</p>
                    <p className="text-xs text-gray-500">{tenant.joined}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mb-1">
                    {tenant.plan}
                  </span>
                  <p className="text-xs text-gray-500">
                    {tenant.status === 'active' ? (
                      <span className="text-green-600">● Active</span>
                    ) : (
                      <span className="text-yellow-600">● Trial</span>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link to="/tenants" className="block w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <p className="font-medium text-gray-900">Create New Tenant</p>
              <p className="text-sm text-gray-500">Set up a new organization account</p>
            </Link>
            <Link to="/users" className="block w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <p className="font-medium text-gray-900">View All Users</p>
              <p className="text-sm text-gray-500">Manage platform users</p>
            </Link>
            <Link to="/analytics" className="block w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <p className="font-medium text-gray-900">Platform Analytics</p>
              <p className="text-sm text-gray-500">View detailed metrics and reports</p>
            </Link>
            <Link to="/settings" className="block w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <p className="font-medium text-gray-900">System Settings</p>
              <p className="text-sm text-gray-500">Configure platform preferences</p>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity & Tenants Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityFeed />
        <TenantsOverview />
      </div>

      {/* System Status */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">System Status</h3>
          <Link to="/system-health" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            View Details →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/system-health" className="flex items-center gap-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div>
              <p className="font-medium text-gray-900">API Server</p>
              <p className="text-sm text-gray-600">Operational</p>
            </div>
          </Link>
          <Link to="/system-health" className="flex items-center gap-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div>
              <p className="font-medium text-gray-900">Database</p>
              <p className="text-sm text-gray-600">Operational</p>
            </div>
          </Link>
          <Link to="/system-health" className="flex items-center gap-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div>
              <p className="font-medium text-gray-900">CDN</p>
              <p className="text-sm text-gray-600">Operational</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
