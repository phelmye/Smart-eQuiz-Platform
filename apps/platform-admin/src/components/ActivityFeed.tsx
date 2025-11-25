import { useState } from 'react';
import { Activity, User, Building2, AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

interface ActivityItem {
  id: string;
  type: 'user' | 'tenant' | 'system' | 'security';
  action: string;
  description: string;
  user?: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error' | 'info';
}

const mockActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'tenant',
    action: 'New Registration',
    description: 'Acme University registered with Enterprise plan',
    user: 'System',
    timestamp: '2 minutes ago',
    status: 'success',
  },
  {
    id: '2',
    type: 'user',
    action: 'Bulk Import',
    description: '150 users imported to TechCorp Inc',
    user: 'Admin User',
    timestamp: '15 minutes ago',
    status: 'success',
  },
  {
    id: '3',
    type: 'system',
    action: 'Payment Failed',
    description: 'Payment processing failed for Learning Hub',
    user: 'Payment System',
    timestamp: '1 hour ago',
    status: 'error',
  },
  {
    id: '4',
    type: 'security',
    action: 'Login Attempt',
    description: 'Multiple failed login attempts detected',
    user: 'Security Monitor',
    timestamp: '2 hours ago',
    status: 'warning',
  },
  {
    id: '5',
    type: 'tenant',
    action: 'Plan Upgrade',
    description: 'Global Institute upgraded to Professional plan',
    user: 'Billing System',
    timestamp: '3 hours ago',
    status: 'success',
  },
  {
    id: '6',
    type: 'user',
    action: 'Password Reset',
    description: 'Password reset completed for john@example.com',
    user: 'Security System',
    timestamp: '4 hours ago',
    status: 'info',
  },
  {
    id: '7',
    type: 'system',
    action: 'Database Backup',
    description: 'Automated database backup completed successfully',
    user: 'System',
    timestamp: '5 hours ago',
    status: 'success',
  },
  {
    id: '8',
    type: 'tenant',
    action: 'Subscription Cancelled',
    description: 'Education Plus cancelled their subscription',
    user: 'Billing System',
    timestamp: '6 hours ago',
    status: 'warning',
  },
];

const typeIcons = {
  user: User,
  tenant: Building2,
  system: Activity,
  security: AlertCircle,
};

const statusIcons = {
  success: CheckCircle,
  warning: AlertCircle,
  error: XCircle,
  info: Clock,
};

const statusColors = {
  success: 'text-green-600 bg-green-50',
  warning: 'text-yellow-600 bg-yellow-50',
  error: 'text-red-600 bg-red-50',
  info: 'text-blue-600 bg-blue-50',
};

export function ActivityFeed() {
  const [activities] = useState<ActivityItem[]>(mockActivities);
  const [filter, setFilter] = useState<string>('all');

  const filteredActivities = activities.filter((activity) =>
    filter === 'all' ? true : activity.type === filter
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Recent Activity
          </CardTitle>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Activity</option>
            <option value="user">Users</option>
            <option value="tenant">Tenants</option>
            <option value="system">System</option>
            <option value="security">Security</option>
          </select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredActivities.map((activity) => {
            const TypeIcon = typeIcons[activity.type];
            const StatusIcon = statusIcons[activity.status];
            
            return (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full flex-shrink-0">
                  <TypeIcon className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm text-gray-900">
                          {activity.action}
                        </h4>
                        <Badge
                          variant="secondary"
                          className="text-xs capitalize"
                        >
                          {activity.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        {activity.description}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-gray-500">
                          by {activity.user}
                        </span>
                        <span className="text-xs text-gray-400">
                          {activity.timestamp}
                        </span>
                      </div>
                    </div>
                    <div
                      className={`p-1.5 rounded-full ${statusColors[activity.status]}`}
                    >
                      <StatusIcon className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {filteredActivities.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Activity className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No activities found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
