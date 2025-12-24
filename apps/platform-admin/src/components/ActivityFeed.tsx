import { useState, useEffect } from 'react';
import { Activity, User, Building2, AlertCircle, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { api } from '../lib/api';

interface ActivityItem {
  id: string;
  type: 'user' | 'tenant' | 'system' | 'security';
  action: string;
  description: string;
  user?: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error' | 'info';
}

interface AuditLog {
  id: string;
  action: string;
  resource: string;
  details?: any;
  userEmail?: string;
  createdAt: string;
  status?: string;
}

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
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const logs = await api.get<AuditLog[]>('/audit/logs?limit=10');
        
        // Convert audit logs to activity items
        const activityItems: ActivityItem[] = logs.map(log => {
          // Determine type from resource
          let type: 'user' | 'tenant' | 'system' | 'security' = 'system';
          if (log.resource?.includes('user')) type = 'user';
          else if (log.resource?.includes('tenant')) type = 'tenant';
          else if (log.action?.includes('login') || log.action?.includes('auth')) type = 'security';
          
          // Determine status from action or log status
          let status: 'success' | 'warning' | 'error' | 'info' = 'info';
          if (log.status === 'success' || log.action?.includes('create') || log.action?.includes('update')) status = 'success';
          else if (log.status === 'error' || log.action?.includes('fail') || log.action?.includes('delete')) status = 'error';
          else if (log.action?.includes('suspend') || log.action?.includes('warning')) status = 'warning';
          
          // Format timestamp
          const timestamp = formatTimestamp(log.createdAt);
          
          return {
            id: log.id,
            type,
            action: log.action,
            description: log.details?.description || `${log.action} on ${log.resource}`,
            user: log.userEmail || 'System',
            timestamp,
            status,
          };
        });
        
        setActivities(activityItems);
      } catch (error) {
        console.error('Failed to fetch audit logs:', error);
        // Keep activities empty on error
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const formatTimestamp = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

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
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-2" />
            <span className="text-gray-500">Loading activities...</span>
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No recent activities found.
          </div>
        ) : (
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
        )}
        {!loading && filteredActivities.length === 0 && activities.length > 0 && (
          <div className="text-center py-8 text-gray-500">
            <Activity className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No activities found for this filter</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
