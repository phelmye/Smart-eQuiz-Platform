import { Building2, Users, DollarSign, TrendingUp } from 'lucide-react';

export default function Dashboard() {
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

  const recentTenants = [
    { name: 'Acme University', plan: 'Enterprise', status: 'active', joined: '2 hours ago' },
    { name: 'Tech Academy', plan: 'Professional', status: 'active', joined: '5 hours ago' },
    { name: 'Global Institute', plan: 'Starter', status: 'trial', joined: '1 day ago' },
    { name: 'Learning Hub', plan: 'Professional', status: 'active', joined: '2 days ago' },
    { name: 'Education Plus', plan: 'Enterprise', status: 'active', joined: '3 days ago' },
  ];

  return (
    <div className="space-y-6">
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
            <button className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <p className="font-medium text-gray-900">Create New Tenant</p>
              <p className="text-sm text-gray-500">Set up a new organization account</p>
            </button>
            <button className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <p className="font-medium text-gray-900">View All Users</p>
              <p className="text-sm text-gray-500">Manage platform users</p>
            </button>
            <button className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <p className="font-medium text-gray-900">Platform Analytics</p>
              <p className="text-sm text-gray-500">View detailed metrics and reports</p>
            </button>
            <button className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <p className="font-medium text-gray-900">System Settings</p>
              <p className="text-sm text-gray-500">Configure platform preferences</p>
            </button>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div>
              <p className="font-medium text-gray-900">API Server</p>
              <p className="text-sm text-gray-600">Operational</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div>
              <p className="font-medium text-gray-900">Database</p>
              <p className="text-sm text-gray-600">Operational</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div>
              <p className="font-medium text-gray-900">CDN</p>
              <p className="text-sm text-gray-600">Operational</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
