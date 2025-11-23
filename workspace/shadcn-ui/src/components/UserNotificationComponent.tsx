import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Bell,
  Clock,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  History,
  XCircle,
  Info,
  ExternalLink
} from 'lucide-react';
import {
  Question,
  QuestionStatus,
  Tournament,
  User,
  storage,
  STORAGE_KEYS
} from '@/lib/mockData';

interface UserNotificationComponentProps {
  user: User;
  onNavigate?: (page: string) => void;
}

interface Notification {
  id: string;
  type: 'practice_available' | 'practice_delayed' | 'ai_limit_warning' | 'ai_limit_reached' | 'tournament_upcoming' | 'question_approved' | 'question_rejected';
  title: string;
  message: string;
  timestamp: string;
  priority: 'low' | 'medium' | 'high';
  actionLabel?: string;
  actionPage?: string;
  isRead: boolean;
  metadata?: {
    hoursRemaining?: number;
    questionCount?: number;
    tournamentName?: string;
    availableAt?: string;
    questionsUsed?: number;
    questionsLimit?: number;
  };
}

export const UserNotificationComponent: React.FC<UserNotificationComponentProps> = ({
  user,
  onNavigate
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    loadNotifications();
    // Refresh notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const loadNotifications = () => {
    const notifs: Notification[] = [];
    const questions = storage.get(STORAGE_KEYS.QUESTIONS) as Question[] || [];
    const tournaments = storage.get(STORAGE_KEYS.TOURNAMENTS) as Tournament[] || [];
    
    const tenantQuestions = questions.filter(q => q.tenantId === user.tenantId);
    const now = new Date();

    // Check for recent tournament questions with delayed release
    const recentQuestions = tenantQuestions.filter(q => 
      q.status === QuestionStatus.RECENT_TOURNAMENT && 
      q.availableForPracticeDate
    );

    const delayedQuestions = recentQuestions.filter(q => {
      const availableDate = new Date(q.availableForPracticeDate!);
      return availableDate > now;
    });

    const availableQuestions = recentQuestions.filter(q => {
      const availableDate = new Date(q.availableForPracticeDate!);
      const recentlyAvailable = availableDate <= now && (now.getTime() - availableDate.getTime()) < 24 * 60 * 60 * 1000;
      return recentlyAvailable;
    });

    // Group delayed questions by tournament
    const tournamentDelayMap = new Map<string, { tournament: Tournament; questions: Question[]; hoursRemaining: number }>();
    delayedQuestions.forEach(q => {
      if (q.tournamentId) {
        const tournament = tournaments.find(t => t.id === q.tournamentId);
        if (tournament) {
          if (!tournamentDelayMap.has(q.tournamentId)) {
            const availableDate = new Date(q.availableForPracticeDate!);
            const hoursRemaining = Math.ceil((availableDate.getTime() - now.getTime()) / (1000 * 60 * 60));
            tournamentDelayMap.set(q.tournamentId, {
              tournament,
              questions: [],
              hoursRemaining
            });
          }
          tournamentDelayMap.get(q.tournamentId)!.questions.push(q);
        }
      }
    });

    // Create notifications for delayed releases
    tournamentDelayMap.forEach(({ tournament, questions: tQuestions, hoursRemaining }, tournamentId) => {
      if (hoursRemaining <= 24) {
        notifs.push({
          id: `delayed-${tournamentId}`,
          type: 'practice_delayed',
          title: 'Questions Available Soon',
          message: `${tQuestions.length} questions from "${tournament.name}" will be available for practice in ${hoursRemaining} hour${hoursRemaining !== 1 ? 's' : ''}.`,
          timestamp: new Date().toISOString(),
          priority: hoursRemaining <= 6 ? 'high' : 'medium',
          actionLabel: 'View Practice Mode',
          actionPage: 'practice',
          isRead: false,
          metadata: {
            hoursRemaining,
            questionCount: tQuestions.length,
            tournamentName: tournament.name,
            availableAt: tQuestions[0].availableForPracticeDate
          }
        });
      }
    });

    // Create notifications for newly available questions
    const tournamentAvailableMap = new Map<string, { tournament: Tournament; questions: Question[] }>();
    availableQuestions.forEach(q => {
      if (q.tournamentId) {
        const tournament = tournaments.find(t => t.id === q.tournamentId);
        if (tournament) {
          if (!tournamentAvailableMap.has(q.tournamentId)) {
            tournamentAvailableMap.set(q.tournamentId, {
              tournament,
              questions: []
            });
          }
          tournamentAvailableMap.get(q.tournamentId)!.questions.push(q);
        }
      }
    });

    tournamentAvailableMap.forEach(({ tournament, questions: tQuestions }, tournamentId) => {
      notifs.push({
        id: `available-${tournamentId}`,
        type: 'practice_available',
        title: 'New Questions Available!',
        message: `${tQuestions.length} questions from "${tournament.name}" are now available for practice.`,
        timestamp: new Date().toISOString(),
        priority: 'high',
        actionLabel: 'Practice Now',
        actionPage: 'practice',
        isRead: false,
        metadata: {
          questionCount: tQuestions.length,
          tournamentName: tournament.name
        }
      });
    });

    // AI Generation Limit Warnings (for question managers)
    if (['super_admin', 'org_admin', 'question_manager'].includes(user.role)) {
      const aiQuestions = tenantQuestions.filter(q => q.source === 'ai');
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const monthlyAIQuestions = aiQuestions.filter(q => {
        const created = new Date(q.createdAt);
        return created.getMonth() === currentMonth && created.getFullYear() === currentYear;
      });

      // Get plan limits (mock - should come from actual plan)
      const planLimits: Record<string, number> = {
        'plan-free': 10,
        'plan-pro': 50,
        'plan-professional': 200,
        'plan-enterprise': -1 // unlimited
      };

      const tenants = storage.get(STORAGE_KEYS.TENANTS) || [];
      const tenant = tenants.find((t: any) => t.id === user.tenantId);
      const limit = tenant ? (planLimits[tenant.planId] || 10) : 10;

      if (limit > 0) {
        const usagePercentage = (monthlyAIQuestions.length / limit) * 100;

        if (monthlyAIQuestions.length >= limit) {
          notifs.push({
            id: 'ai-limit-reached',
            type: 'ai_limit_reached',
            title: 'AI Generation Limit Reached',
            message: `You've used all ${limit} AI-generated questions for this month. Upgrade your plan for more.`,
            timestamp: new Date().toISOString(),
            priority: 'high',
            actionLabel: 'View Plans',
            actionPage: 'billing',
            isRead: false,
            metadata: {
              questionsUsed: monthlyAIQuestions.length,
              questionsLimit: limit
            }
          });
        } else if (usagePercentage >= 80) {
          notifs.push({
            id: 'ai-limit-warning',
            type: 'ai_limit_warning',
            title: 'AI Generation Limit Warning',
            message: `You've used ${monthlyAIQuestions.length} of ${limit} AI-generated questions this month (${usagePercentage.toFixed(0)}%).`,
            timestamp: new Date().toISOString(),
            priority: 'medium',
            actionLabel: 'Generate Questions',
            actionPage: 'ai-generator',
            isRead: false,
            metadata: {
              questionsUsed: monthlyAIQuestions.length,
              questionsLimit: limit
            }
          });
        }
      }
    }

    // Check for upcoming tournaments (next 48 hours)
    const upcomingTournaments = tournaments.filter(t => {
      if (t.tenantId !== user.tenantId || t.status !== 'scheduled') return false;
      const startDate = new Date(t.startDate);
      const hoursUntilStart = (startDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      return hoursUntilStart > 0 && hoursUntilStart <= 48;
    });

    upcomingTournaments.forEach(tournament => {
      const startDate = new Date(tournament.startDate);
      const hoursUntilStart = Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60));
      
      notifs.push({
        id: `tournament-${tournament.id}`,
        type: 'tournament_upcoming',
        title: 'Tournament Starting Soon',
        message: `"${tournament.name}" starts in ${hoursUntilStart} hour${hoursUntilStart !== 1 ? 's' : ''}.`,
        timestamp: new Date().toISOString(),
        priority: hoursUntilStart <= 12 ? 'high' : 'medium',
        actionLabel: 'View Tournament',
        actionPage: 'tournament-builder',
        isRead: false,
        metadata: {
          tournamentName: tournament.name,
          hoursRemaining: hoursUntilStart
        }
      });
    });

    // Sort by priority and timestamp
    notifs.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    setNotifications(notifs);
    setUnreadCount(notifs.filter(n => !n.isRead).length);
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'practice_available': return CheckCircle;
      case 'practice_delayed': return Clock;
      case 'ai_limit_warning': return AlertTriangle;
      case 'ai_limit_reached': return XCircle;
      case 'tournament_upcoming': return Bell;
      case 'question_approved': return CheckCircle;
      case 'question_rejected': return XCircle;
      default: return Info;
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'practice_available': return 'text-green-600';
      case 'practice_delayed': return 'text-orange-600';
      case 'ai_limit_warning': return 'text-yellow-600';
      case 'ai_limit_reached': return 'text-red-600';
      case 'tournament_upcoming': return 'text-blue-600';
      case 'question_approved': return 'text-green-600';
      case 'question_rejected': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getNotificationBorderColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-orange-500';
      case 'low': return 'border-l-blue-500';
      default: return 'border-l-gray-300';
    }
  };

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleNotificationAction = (notification: Notification) => {
    handleMarkAsRead(notification.id);
    if (notification.actionPage && onNavigate) {
      onNavigate(notification.actionPage);
    }
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const displayedNotifications = showAll ? notifications : notifications.slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle>Notifications</CardTitle>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="rounded-full">
                {unreadCount}
              </Badge>
            )}
          </div>
          {notifications.length > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
              Mark All Read
            </Button>
          )}
        </div>
        <CardDescription>
          Stay updated on question availability, AI limits, and tournaments
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <Alert>
              <Bell className="h-4 w-4" />
              <AlertDescription>
                No new notifications. You're all caught up!
              </AlertDescription>
            </Alert>
          ) : (
            <>
              {displayedNotifications.map(notification => {
                const Icon = getNotificationIcon(notification.type);
                const iconColor = getNotificationColor(notification.type);
                const borderColor = getNotificationBorderColor(notification.priority);

                return (
                  <Alert
                    key={notification.id}
                    className={`relative border-l-4 ${borderColor} ${notification.isRead ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className={`h-5 w-5 mt-0.5 ${iconColor}`} />
                      <div className="flex-1 min-w-0">
                        <AlertTitle className="text-sm font-semibold mb-1">
                          {notification.title}
                          {!notification.isRead && (
                            <span className="ml-2 inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                          )}
                        </AlertTitle>
                        <AlertDescription className="text-sm">
                          {notification.message}
                        </AlertDescription>
                        
                        {notification.metadata && (
                          <div className="mt-2 text-xs text-gray-500">
                            {notification.metadata.hoursRemaining !== undefined && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {notification.metadata.hoursRemaining} hour{notification.metadata.hoursRemaining !== 1 ? 's' : ''} remaining
                              </div>
                            )}
                            {notification.metadata.questionCount !== undefined && (
                              <div className="flex items-center gap-1 mt-1">
                                <Sparkles className="h-3 w-3" />
                                {notification.metadata.questionCount} questions
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex items-center gap-2 mt-3">
                          {notification.actionLabel && notification.actionPage && (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleNotificationAction(notification)}
                            >
                              {notification.actionLabel}
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </Button>
                          )}
                          {!notification.isRead && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleMarkAsRead(notification.id)}
                            >
                              Mark as Read
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Alert>
                );
              })}

              {notifications.length > 5 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAll(!showAll)}
                  className="w-full"
                >
                  {showAll ? 'Show Less' : `Show All (${notifications.length - 5} more)`}
                </Button>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserNotificationComponent;
