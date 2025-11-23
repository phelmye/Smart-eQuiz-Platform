import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ChevronLeft,
  RefreshCw,
  Activity,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Users,
  Zap,
  History,
  Archive,
  Sparkles,
  BarChart3,
  FileEdit,
  Lock
} from 'lucide-react';
import {
  Question,
  QuestionStatus,
  QuestionApprovalStatus,
  QuestionLifecycleLog,
  Tournament,
  storage,
  STORAGE_KEYS
} from '@/lib/mockData';
import { QuestionStatusBadge, ApprovalStatusBadge, STATUS_CONFIG, APPROVAL_CONFIG } from './QuestionStatusBadge';

interface AdminLifecycleDashboardProps {
  onBack: () => void;
  tenantId: string;
}

interface StatusDistribution {
  status: QuestionStatus;
  count: number;
  percentage: number;
}

interface ApprovalDistribution {
  status: QuestionApprovalStatus;
  count: number;
  percentage: number;
}

interface CategoryHealth {
  category: string;
  total: number;
  inPool: number;
  pendingReview: number;
  healthScore: number;
}

interface AIUsageStats {
  totalGenerated: number;
  pendingReview: number;
  approved: number;
  rejected: number;
  approvalRate: number;
  averageReviewTime: number; // hours
}

interface RecentEvent {
  id: string;
  type: 'status_change' | 'approval' | 'tournament' | 'practice_release';
  questionId: string;
  questionText: string;
  fromStatus?: QuestionStatus;
  toStatus?: QuestionStatus;
  timestamp: string;
  user?: string;
}

export const AdminLifecycleDashboard: React.FC<AdminLifecycleDashboardProps> = ({
  onBack,
  tenantId
}) => {
  const [statusDistribution, setStatusDistribution] = useState<StatusDistribution[]>([]);
  const [approvalDistribution, setApprovalDistribution] = useState<ApprovalDistribution[]>([]);
  const [categoryHealth, setCategoryHealth] = useState<CategoryHealth[]>([]);
  const [aiUsageStats, setAIUsageStats] = useState<AIUsageStats | null>(null);
  const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'categories' | 'ai' | 'events'>('overview');

  useEffect(() => {
    loadDashboardData();
  }, [tenantId]);

  const loadDashboardData = () => {
    setIsLoading(true);

    const questions = storage.get(STORAGE_KEYS.QUESTIONS) as Question[] || [];
    const lifecycleLogs = storage.get(STORAGE_KEYS.QUESTION_LIFECYCLE_LOGS) as QuestionLifecycleLog[] || [];
    const tenantQuestions = questions.filter(q => q.tenantId === tenantId);

    // Calculate status distribution
    const statusCounts = new Map<QuestionStatus, number>();
    Object.values(QuestionStatus).forEach(status => {
      statusCounts.set(status, tenantQuestions.filter(q => q.status === status).length);
    });

    const totalQuestions = tenantQuestions.length;
    const statusDist: StatusDistribution[] = Array.from(statusCounts.entries()).map(([status, count]) => ({
      status,
      count,
      percentage: totalQuestions > 0 ? (count / totalQuestions) * 100 : 0
    }));
    setStatusDistribution(statusDist);

    // Calculate approval distribution
    const approvalCounts = new Map<QuestionApprovalStatus, number>();
    Object.values(QuestionApprovalStatus).forEach(status => {
      approvalCounts.set(status, tenantQuestions.filter(q => q.approvalStatus === status).length);
    });

    const approvalDist: ApprovalDistribution[] = Array.from(approvalCounts.entries()).map(([status, count]) => ({
      status,
      count,
      percentage: totalQuestions > 0 ? (count / totalQuestions) * 100 : 0
    }));
    setApprovalDistribution(approvalDist);

    // Calculate category health
    const categoryMap = new Map<string, CategoryHealth>();
    tenantQuestions.forEach(q => {
      if (!categoryMap.has(q.category)) {
        categoryMap.set(q.category, {
          category: q.category,
          total: 0,
          inPool: 0,
          pendingReview: 0,
          healthScore: 0
        });
      }
      const health = categoryMap.get(q.category)!;
      health.total++;
      if (q.status === QuestionStatus.QUESTION_POOL) health.inPool++;
      if (q.status === QuestionStatus.AI_PENDING_REVIEW) health.pendingReview++;
    });

    const categoryHealthData = Array.from(categoryMap.values()).map(cat => ({
      ...cat,
      healthScore: cat.total > 0 ? (cat.inPool / cat.total) * 100 : 0
    })).sort((a, b) => b.healthScore - a.healthScore);
    setCategoryHealth(categoryHealthData);

    // Calculate AI usage statistics
    const aiQuestions = tenantQuestions.filter(q => q.source === 'ai');
    const aiPendingReview = aiQuestions.filter(q => q.status === QuestionStatus.AI_PENDING_REVIEW).length;
    const aiApproved = aiQuestions.filter(q => q.approvalStatus === QuestionApprovalStatus.APPROVED).length;
    const aiRejected = aiQuestions.filter(q => q.approvalStatus === QuestionApprovalStatus.REJECTED).length;

    // Calculate average review time from lifecycle logs
    const reviewLogs = lifecycleLogs.filter(
      log => log.toStatus === QuestionStatus.QUESTION_POOL && 
             log.fromStatus === QuestionStatus.AI_PENDING_REVIEW
    );
    
    let avgReviewTime = 0;
    if (reviewLogs.length > 0) {
      const reviewTimes = reviewLogs.map(log => {
        const created = aiQuestions.find(q => q.id === log.questionId)?.createdAt;
        if (created) {
          const reviewDate = new Date(log.createdAt);
          const createdDate = new Date(created);
          return (reviewDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60); // hours
        }
        return 24; // default 24 hours
      });
      avgReviewTime = reviewTimes.reduce((sum, time) => sum + time, 0) / reviewTimes.length;
    }

    setAIUsageStats({
      totalGenerated: aiQuestions.length,
      pendingReview: aiPendingReview,
      approved: aiApproved,
      rejected: aiRejected,
      approvalRate: aiQuestions.length > 0 ? (aiApproved / aiQuestions.length) * 100 : 0,
      averageReviewTime: avgReviewTime
    });

    // Get recent events from lifecycle logs
    const tenantLogs = lifecycleLogs
      .filter(log => tenantQuestions.some(q => q.id === log.questionId))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 20);

    const events: RecentEvent[] = tenantLogs.map(log => {
      const question = tenantQuestions.find(q => q.id === log.questionId);
      let eventType: RecentEvent['type'] = 'status_change';
      
      if (log.toStatus === QuestionStatus.QUESTION_POOL && log.fromStatus === QuestionStatus.AI_PENDING_REVIEW) {
        eventType = 'approval';
      } else if (log.toStatus === QuestionStatus.TOURNAMENT_ACTIVE) {
        eventType = 'tournament';
      } else if (log.toStatus === QuestionStatus.RECENT_TOURNAMENT) {
        eventType = 'practice_release';
      }

      return {
        id: log.id,
        type: eventType,
        questionId: log.questionId,
        questionText: question?.text.substring(0, 60) + '...' || 'Unknown question',
        fromStatus: log.fromStatus,
        toStatus: log.toStatus,
        timestamp: log.createdAt,
        user: log.userId
      };
    });
    setRecentEvents(events);

    setIsLoading(false);
  };

  const getEventIcon = (type: RecentEvent['type']) => {
    switch (type) {
      case 'approval': return CheckCircle;
      case 'tournament': return Zap;
      case 'practice_release': return History;
      default: return Activity;
    }
  };

  const getEventColor = (type: RecentEvent['type']) => {
    switch (type) {
      case 'approval': return 'text-green-600';
      case 'tournament': return 'text-purple-600';
      case 'practice_release': return 'text-orange-600';
      default: return 'text-blue-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>AI Question Lifecycle Dashboard</CardTitle>
              <CardDescription>
                Monitor question status, AI usage, and lifecycle events
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={loadDashboardData} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="categories">
            <TrendingUp className="h-4 w-4 mr-2" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="ai">
            <Sparkles className="h-4 w-4 mr-2" />
            AI Usage
          </TabsTrigger>
          <TabsTrigger value="events">
            <Activity className="h-4 w-4 mr-2" />
            Recent Events
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Questions</p>
                    <p className="text-2xl font-bold">
                      {statusDistribution.reduce((sum, s) => sum + s.count, 0)}
                    </p>
                  </div>
                  <FileEdit className="h-8 w-8 text-gray-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Pending Review</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {statusDistribution.find(s => s.status === QuestionStatus.AI_PENDING_REVIEW)?.count || 0}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">In Pool</p>
                    <p className="text-2xl font-bold text-green-600">
                      {statusDistribution.find(s => s.status === QuestionStatus.QUESTION_POOL)?.count || 0}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">In Tournaments</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {statusDistribution.find(s => s.status === QuestionStatus.TOURNAMENT_ACTIVE)?.count || 0}
                    </p>
                  </div>
                  <Zap className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Question Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {statusDistribution
                  .filter(s => s.count > 0)
                  .sort((a, b) => b.count - a.count)
                  .map(dist => (
                    <div key={dist.status} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <QuestionStatusBadge status={dist.status} showTooltip={false} />
                          <span className="text-sm text-gray-600">
                            {dist.count} question{dist.count !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <span className="text-sm font-medium">{dist.percentage.toFixed(1)}%</span>
                      </div>
                      <Progress value={dist.percentage} className="h-2" />
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Approval Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Approval Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {approvalDistribution
                  .filter(a => a.count > 0)
                  .map(dist => (
                    <div key={dist.status} className="p-4 border rounded-lg">
                      <ApprovalStatusBadge status={dist.status} showTooltip={false} className="mb-2" />
                      <p className="text-2xl font-bold">{dist.count}</p>
                      <p className="text-sm text-gray-500">{dist.percentage.toFixed(1)}%</p>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Category Health Scores</CardTitle>
              <CardDescription>
                Percentage of questions available in the pool per category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoryHealth.length === 0 ? (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>No categories found. Add questions to see category health.</AlertDescription>
                  </Alert>
                ) : (
                  categoryHealth.map(cat => (
                    <div key={cat.category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">{cat.category}</span>
                          <div className="text-sm text-gray-500">
                            {cat.inPool} in pool / {cat.total} total
                            {cat.pendingReview > 0 && (
                              <span className="text-yellow-600 ml-2">
                                ({cat.pendingReview} pending review)
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{cat.healthScore.toFixed(0)}%</span>
                          {cat.healthScore >= 70 ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : cat.healthScore >= 40 ? (
                            <AlertTriangle className="h-5 w-5 text-yellow-600" />
                          ) : (
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                          )}
                        </div>
                      </div>
                      <Progress value={cat.healthScore} className="h-2" />
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Usage Tab */}
        <TabsContent value="ai" className="space-y-4">
          {aiUsageStats && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">AI Generated</p>
                        <p className="text-2xl font-bold">{aiUsageStats.totalGenerated}</p>
                      </div>
                      <Sparkles className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Approval Rate</p>
                        <p className="text-2xl font-bold text-green-600">
                          {aiUsageStats.approvalRate.toFixed(1)}%
                        </p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Avg Review Time</p>
                        <p className="text-2xl font-bold">{aiUsageStats.averageReviewTime.toFixed(1)}h</p>
                      </div>
                      <Clock className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">AI Question Pipeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-yellow-600" />
                        <div>
                          <p className="font-medium">Pending Review</p>
                          <p className="text-sm text-gray-500">Awaiting approval</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-lg px-4 py-1">
                        {aiUsageStats.pendingReview}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium">Approved</p>
                          <p className="text-sm text-gray-500">Added to question pool</p>
                        </div>
                      </div>
                      <Badge variant="default" className="text-lg px-4 py-1 bg-green-100 text-green-700">
                        {aiUsageStats.approved}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                        <div>
                          <p className="font-medium">Rejected</p>
                          <p className="text-sm text-gray-500">Not suitable for use</p>
                        </div>
                      </div>
                      <Badge variant="destructive" className="text-lg px-4 py-1">
                        {aiUsageStats.rejected}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Recent Events Tab */}
        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Lifecycle Events</CardTitle>
              <CardDescription>Last 20 question status changes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentEvents.length === 0 ? (
                  <Alert>
                    <Activity className="h-4 w-4" />
                    <AlertDescription>No recent events. Lifecycle activity will appear here.</AlertDescription>
                  </Alert>
                ) : (
                  recentEvents.map(event => {
                    const EventIcon = getEventIcon(event.type);
                    return (
                      <div key={event.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50">
                        <EventIcon className={`h-5 w-5 mt-0.5 ${getEventColor(event.type)}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{event.questionText}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {event.fromStatus && (
                              <QuestionStatusBadge status={event.fromStatus} showTooltip={false} showIcon={false} />
                            )}
                            {event.fromStatus && event.toStatus && (
                              <span className="text-gray-400">→</span>
                            )}
                            {event.toStatus && (
                              <QuestionStatusBadge status={event.toStatus} showTooltip={false} showIcon={false} />
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(event.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminLifecycleDashboard;
