import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, X, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { Badge } from './ui/badge';
import { api } from '../lib/api';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

interface AuditLog {
  id: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: any;
  userEmail?: string;
  createdAt: string;
  success?: boolean;
}

const typeIcons = {
  info: Info,
  success: CheckCircle,
  warning: AlertCircle,
  error: AlertCircle,
};

const typeColors = {
  info: 'text-blue-600 bg-blue-50',
  success: 'text-green-600 bg-green-50',
  warning: 'text-yellow-600 bg-yellow-50',
  error: 'text-red-600 bg-red-50',
};

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const navigate = useNavigate();

  // Fetch recent audit logs and convert to notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const logs = await api.get<AuditLog[]>('/audit/logs?limit=20');
        
        // Convert audit logs to notifications
        const notificationItems: Notification[] = logs
          .filter(log => {
            // Only show important actions
            const importantActions = ['create', 'delete', 'suspend', 'activate', 'update', 'fail', 'error'];
            return importantActions.some(action => log.action?.toLowerCase().includes(action));
          })
          .map(log => {
            // Determine notification type
            let type: 'info' | 'success' | 'warning' | 'error' = 'info';
            if (log.success === false || log.action?.includes('fail') || log.action?.includes('error')) {
              type = 'error';
            } else if (log.action?.includes('delete') || log.action?.includes('suspend')) {
              type = 'warning';
            } else if (log.action?.includes('create') || log.action?.includes('activate')) {
              type = 'success';
            }
            
            // Format title
            const title = formatTitle(log.action, log.resource);
            
            // Format message
            const message = formatMessage(log);
            
            // Format timestamp
            const time = formatTimestamp(log.createdAt);
            
            return {
              id: log.id,
              type,
              title,
              message,
              time,
              read: false, // All new notifications are unread
            };
          });
        
        setNotifications(notificationItems);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const formatTitle = (action: string, resource: string): string => {
    const actionMap: Record<string, string> = {
      'create': 'Created',
      'update': 'Updated',
      'delete': 'Deleted',
      'suspend': 'Suspended',
      'activate': 'Activated',
      'login': 'Login',
      'logout': 'Logout',
      'fail': 'Failed',
      'error': 'Error',
    };
    
    const actionWord = Object.keys(actionMap).find(key => 
      action?.toLowerCase().includes(key)
    );
    const actionText = actionWord ? actionMap[actionWord] : action;
    
    const resourceText = resource?.charAt(0).toUpperCase() + resource?.slice(1);
    
    return `${resourceText} ${actionText}`;
  };

  const formatMessage = (log: AuditLog): string => {
    const user = log.userEmail || 'System';
    const resource = log.resource || 'resource';
    const action = log.action || 'modified';
    
    if (log.details?.description) {
      return log.details.description;
    }
    
    return `${user} ${action} ${resource}${log.resourceId ? ` (ID: ${log.resourceId.slice(0, 8)}...)` : ''}`;
  };

  const formatTimestamp = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs bg-red-600">
            {unreadCount}
          </Badge>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Notification Panel */}
          <div className="absolute right-0 top-12 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No notifications</p>
                </div>
              ) : (
                notifications.map((notification) => {
                  const Icon = typeIcons[notification.type];
                  return (
                    <div
                      key={notification.id}
                      className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                        !notification.read ? 'bg-blue-50/50' : ''
                      }`}
                      onClick={() => {
                        markAsRead(notification.id);
                        setIsOpen(false);
                        navigate('/audit-logs');
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-2 rounded-full ${typeColors[notification.type]}`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-medium text-sm text-gray-900">
                              {notification.title}
                            </h4>
                            <div className="flex items-center gap-1">
                              {!notification.read && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(notification.id);
                                  }}
                                  className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-600"
                                  title="Mark as read"
                                >
                                  <Check className="w-3 h-3" />
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification.id);
                                }}
                                className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-600"
                                title="Delete"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {notification.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200 bg-gray-50 text-center">
                <button 
                  onClick={() => {
                    setIsOpen(false);
                    navigate('/audit-logs');
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View all notifications
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
