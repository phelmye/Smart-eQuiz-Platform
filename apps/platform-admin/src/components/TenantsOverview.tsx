import { useState } from 'react';
import { Building2, Users, TrendingUp, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { useTenants } from '../hooks/useTenants';

interface TenantOverview {
  id: string;
  name: string;
  plan: string;
  status: 'active' | 'trial' | 'suspended' | 'cancelled';
  users: number;
  mrr: number;
  health: 'excellent' | 'good' | 'warning' | 'critical';
  lastActivity: string;
}

const statusColors = {
  active: 'bg-green-100 text-green-800',
  trial: 'bg-yellow-100 text-yellow-800',
  suspended: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
};

const healthColors = {
  excellent: 'text-green-600',
  good: 'text-blue-600',
  warning: 'text-yellow-600',
  critical: 'text-red-600',
};

const healthIcons = {
  excellent: CheckCircle,
  good: CheckCircle,
  warning: AlertTriangle,
  critical: AlertTriangle,
};

export function TenantsOverview() {
  const [sortBy, setSortBy] = useState<'name' | 'users' | 'mrr'>('mrr');
  const { tenants, loading } = useTenants();

  // Convert API tenants to TenantOverview format with calculated health
  const tenantOverviews: TenantOverview[] = tenants.map(tenant => {
    // Calculate health based on activity and status
    let health: 'excellent' | 'good' | 'warning' | 'critical' = 'good';
    if (tenant.status === 'suspended' || tenant.status === 'cancelled') {
      health = 'critical';
    } else if (tenant.status === 'trial') {
      health = 'warning';
    } else if (tenant.status === 'active' && tenant.mrr > 100) {
      health = 'excellent';
    }

    // Calculate last activity (you can enhance this with actual API data)
    const daysSinceUpdate = Math.floor((Date.now() - new Date(tenant.updatedAt).getTime()) / (1000 * 60 * 60 * 24));
    const lastActivity = daysSinceUpdate === 0 ? 'Today' : 
                        daysSinceUpdate === 1 ? 'Yesterday' :
                        `${daysSinceUpdate} days ago`;

    return {
      id: tenant.id,
      name: tenant.name,
      plan: tenant.plan || 'Starter',
      status: tenant.status,
      users: tenant.users || 0,
      mrr: tenant.mrr || 0,
      health,
      lastActivity,
    };
  });

  const sortedTenants = [...tenantOverviews].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'users') return b.users - a.users;
    if (sortBy === 'mrr') return b.mrr - a.mrr;
    return 0;
  });

  const totalMRR = tenantOverviews.reduce((sum, t) => sum + t.mrr, 0);
  const totalUsers = tenantOverviews.reduce((sum, t) => sum + t.users, 0);
  const activeTenants = tenantOverviews.filter((t) => t.status === 'active').length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Top Tenants
          </CardTitle>
          <Link
            to="/tenants"
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            View All →
          </Link>
        </div>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{activeTenants}</p>
            <p className="text-xs text-gray-600">Active Tenants</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">${totalMRR.toLocaleString()}</p>
            <p className="text-xs text-gray-600">Total MRR</p>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">{totalUsers.toLocaleString()}</p>
            <p className="text-xs text-gray-600">Total Users</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-2" />
            <span className="text-gray-500">Loading tenants...</span>
          </div>
        ) : tenants.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No tenants found. Create your first tenant to get started.
          </div>
        ) : (
          <>
        {/* Sort Controls */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-gray-600">Sort by:</span>
          <button
            onClick={() => setSortBy('mrr')}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              sortBy === 'mrr'
                ? 'bg-blue-100 text-blue-700 font-medium'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Revenue
          </button>
          <button
            onClick={() => setSortBy('users')}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              sortBy === 'users'
                ? 'bg-blue-100 text-blue-700 font-medium'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setSortBy('name')}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              sortBy === 'name'
                ? 'bg-blue-100 text-blue-700 font-medium'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Name
          </button>
        </div>

        {/* Tenants List */}
        <div className="space-y-3">
          {sortedTenants.slice(0, 5).map((tenant) => {
            const HealthIcon = healthIcons[tenant.health];
            return (
              <Link
                key={tenant.id}
                to={`/tenants`}
                className="block p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900">{tenant.name}</h4>
                      <Badge className={`text-xs ${statusColors[tenant.status]}`}>
                        {tenant.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {tenant.users.toLocaleString()} users
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        ${tenant.mrr}/mo
                      </span>
                      <span className="text-xs text-gray-400">
                        {tenant.lastActivity}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">
                      {tenant.plan}
                    </span>
                    <HealthIcon className={`w-5 h-5 ${healthColors[tenant.health]}`} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
        </>
        )}
      </CardContent>
    </Card>
  );
}
