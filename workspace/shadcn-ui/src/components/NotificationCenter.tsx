import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bell,
  Check,
  X,
  Mail,
  Trophy,
  Users,
  CreditCard,
  Settings,
  AlertCircle,
  Info,
  CheckCircle,
  Trash2
} from 'lucide-react';
import { storage, STORAGE_KEYS } from '@/lib/mockData';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'tournament' | 'payment' | 'user';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

export const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = () => {
    const stored = storage.get(STORAGE_KEYS.NOTIFICATIONS) || [];
    setNotifications(stored);
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success': return CheckCircle;
      case 'warning': return AlertCircle;
      case 'error': return X;
      case 'tournament': return Trophy;
      case 'payment': return CreditCard;
      case 'user': return Users;
      default: return Info;
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      case 'tournament': return 'text-purple-600 bg-purple-100';
      case 'payment': return 'text-blue-600 bg-blue-100';
      case 'user': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const markAsRead = (notificationId: string) => {
    const updated = notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    );
    setNotifications(updated);
    storage.set(STORAGE_KEYS.NOTIFICATIONS, updated);
  };

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    storage.set(STORAGE_KEYS.NOTIFICATIONS, updated);
  };

  const deleteNotification = (notificationId: string) => {
    const updated = notifications.filter(n => n.id !== notificationId);
    setNotifications(updated);
    storage.set(STORAGE_KEYS.NOTIFICATIONS, updated);
  };

  const clearAll = () => {
    setNotifications([]);
    storage.set(STORAGE_KEYS.NOTIFICATIONS, []);
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Bell className="h-8 w-8" />
          Notifications
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {unreadCount}
            </Badge>
          )}
        </h1>
        <p className="text-gray-600 mt-1">Stay updated with your latest activities</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Notification Center</CardTitle>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                  <Check className="h-4 w-4 mr-1" />
                  Mark all read
                </Button>
              )}
              {notifications.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearAll}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Clear all
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="all">
                All {notifications.length > 0 && `(${notifications.length})`}
              </TabsTrigger>
              <TabsTrigger value="unread">
                Unread {unreadCount > 0 && `(${unreadCount})`}
              </TabsTrigger>
              <TabsTrigger value="read">
                Read {notifications.length - unreadCount > 0 && `(${notifications.length - unreadCount})`}
              </TabsTrigger>
            </TabsList>

            <TabsContent value={filter}>
              <ScrollArea className="h-[600px]">
                {filteredNotifications.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Bell className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No notifications</h3>
                    <p className="text-gray-500 text-sm">
                      {filter === 'unread' 
                        ? "You're all caught up! No unread notifications."
                        : filter === 'read'
                        ? "No read notifications yet."
                        : "You don't have any notifications yet."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredNotifications.map((notification) => {
                      const Icon = getNotificationIcon(notification.type);
                      const colorClass = getNotificationColor(notification.type);

                      return (
                        <div
                          key={notification.id}
                          className={`p-4 rounded-lg border transition-colors ${
                            notification.read 
                              ? 'bg-white border-gray-200' 
                              : 'bg-blue-50 border-blue-200'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                              <Icon className="h-5 w-5" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-sm">
                                    {notification.title}
                                  </h4>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-gray-400 mt-2">
                                    {formatTimestamp(notification.timestamp)}
                                  </p>
                                </div>
                                <div className="flex items-center gap-1">
                                  {!notification.read && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => markAsRead(notification.id)}
                                      title="Mark as read"
                                    >
                                      <Check className="h-4 w-4" />
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => deleteNotification(notification.id)}
                                    title="Delete"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>

                              {notification.actionUrl && notification.actionLabel && (
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="px-0 mt-2"
                                  onClick={() => {
                                    markAsRead(notification.id);
                                    window.location.href = notification.actionUrl!;
                                  }}
                                >
                                  {notification.actionLabel} →
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-gray-500">Receive notifications via email</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => {
                // TODO: Open email notification settings modal
                console.log('Configure email notifications');
              }}>
                Configure
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Trophy className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium">Tournament Alerts</p>
                  <p className="text-sm text-gray-500">Get notified about tournament updates</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => {
                // TODO: Open tournament alerts settings modal
                console.log('Configure tournament alerts');
              }}>
                Configure
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium">User Activity</p>
                  <p className="text-sm text-gray-500">Team member activity notifications</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => {
                // TODO: Open user activity settings modal
                console.log('Configure user activity notifications');
              }}>
                Configure
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationCenter;
