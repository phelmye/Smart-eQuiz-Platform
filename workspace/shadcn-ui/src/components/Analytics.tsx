import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, BarChart3, TrendingUp, Users, Trophy, DollarSign, Calendar, Download, RefreshCw } from 'lucide-react';
import { useAuth } from './AuthSystem';
import { User, Tournament, Question, storage, STORAGE_KEYS, mockUsers, mockTournaments, mockQuestions, BIBLE_CATEGORIES, hasPermission } from '@/lib/mockData';

interface AnalyticsProps {
  onBack: () => void;
}

interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  totalTournaments: number;
  activeTournaments: number;
  totalQuestions: number;
  totalRevenue: number;
  avgTournamentSize: number;
  userGrowthRate: number;
  popularCategories: { category: string; count: number; percentage: number }[];
  tournamentStats: { status: string; count: number; percentage: number }[];
  userEngagement: { level: string; users: number; percentage: number }[];
  revenueByMonth: { month: string; revenue: number; tournaments: number }[];
}

interface ExtendedUser extends User {
  isActive?: boolean;
}

export const Analytics: React.FC<AnalyticsProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('30d');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, [user, timeRange]);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const users = storage.get(STORAGE_KEYS.USERS) || mockUsers;
    const tournaments = storage.get(STORAGE_KEYS.TOURNAMENTS) || mockTournaments;
    const questions = storage.get(STORAGE_KEYS.QUESTIONS) || mockQuestions;

    // Filter data based on user role
    const filteredUsers = user?.role === 'super_admin' ? users : 
      users.filter((u: User) => u.tenantId === user?.tenantId);
    const filteredTournaments = user?.role === 'super_admin' ? tournaments :
      tournaments.filter((t: Tournament) => t.tenantId === user?.tenantId);
    const filteredQuestions = user?.role === 'super_admin' ? questions :
      questions.filter((q: Question) => q.tenantId === user?.tenantId);

    // Calculate analytics
    const totalUsers = filteredUsers.length;
    const activeUsers = filteredUsers.filter((u: ExtendedUser) => u.isActive !== false).length;
    const totalTournaments = filteredTournaments.length;
    const activeTournaments = filteredTournaments.filter((t: Tournament) => t.status === 'active').length;
    const totalQuestions = filteredQuestions.length;
    const totalRevenue = filteredTournaments.reduce((sum: number, t: Tournament) => sum + (t.entryFee * t.currentParticipants), 0);
    const avgTournamentSize = totalTournaments > 0 ? 
      filteredTournaments.reduce((sum: number, t: Tournament) => sum + t.currentParticipants, 0) / totalTournaments : 0;

    // Popular categories
    const categoryCount: { [key: string]: number } = {};
    filteredQuestions.forEach((q: Question) => {
      categoryCount[q.category] = (categoryCount[q.category] || 0) + 1;
    });
    
    const popularCategories = Object.entries(categoryCount)
      .map(([category, count]) => ({
        category,
        count,
        percentage: Math.round((count / totalQuestions) * 100)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Tournament stats
    const statusCount: { [key: string]: number } = {};
    filteredTournaments.forEach((t: Tournament) => {
      statusCount[t.status] = (statusCount[t.status] || 0) + 1;
    });

    const tournamentStats = Object.entries(statusCount)
      .map(([status, count]) => ({
        status: status.charAt(0).toUpperCase() + status.slice(1),
        count,
        percentage: Math.round((count / totalTournaments) * 100)
      }));

    // User engagement levels
    const levelCount: { [key: string]: number } = {};
    filteredUsers.forEach((u: User) => {
      const levelRange = u.level <= 2 ? 'Beginner' : u.level <= 5 ? 'Intermediate' : 'Advanced';
      levelCount[levelRange] = (levelCount[levelRange] || 0) + 1;
    });

    const userEngagement = Object.entries(levelCount)
      .map(([level, users]) => ({
        level,
        users,
        percentage: Math.round((users / totalUsers) * 100)
      }));

    // Revenue by month (mock data)
    const revenueByMonth = [
      { month: 'Jan', revenue: Math.floor(Math.random() * 1000) + 500, tournaments: Math.floor(Math.random() * 10) + 5 },
      { month: 'Feb', revenue: Math.floor(Math.random() * 1000) + 600, tournaments: Math.floor(Math.random() * 12) + 6 },
      { month: 'Mar', revenue: Math.floor(Math.random() * 1000) + 700, tournaments: Math.floor(Math.random() * 15) + 8 },
      { month: 'Apr', revenue: Math.floor(Math.random() * 1000) + 800, tournaments: Math.floor(Math.random() * 18) + 10 },
      { month: 'May', revenue: Math.floor(Math.random() * 1000) + 900, tournaments: Math.floor(Math.random() * 20) + 12 },
      { month: 'Jun', revenue: Math.floor(Math.random() * 1000) + 1000, tournaments: Math.floor(Math.random() * 22) + 15 }
    ];

    setAnalyticsData({
      totalUsers,
      activeUsers,
      totalTournaments,
      activeTournaments,
      totalQuestions,
      totalRevenue,
      avgTournamentSize: Math.round(avgTournamentSize),
      userGrowthRate: Math.floor(Math.random() * 30) + 10, // Mock growth rate
      popularCategories,
      tournamentStats,
      userEngagement,
      revenueByMonth
    });

    setIsLoading(false);
  };

  const exportData = () => {
    if (!analyticsData) return;
    
    const dataToExport = {
      generatedAt: new Date().toISOString(),
      timeRange,
      ...analyticsData
    };
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!user || !hasPermission(user, 'analytics.view')) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-bold text-red-600 mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-4">You need admin privileges to view analytics.</p>
            <Button onClick={onBack}>Back to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading || !analyticsData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-4 mb-6">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600">Loading analytics data...</p>
            </div>
          </div>
          
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
                <p className="text-gray-600">Platform performance and insights</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" onClick={loadAnalyticsData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              
              <Button onClick={exportData}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="tournaments">Tournaments</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">{analyticsData.totalUsers}</p>
                      <p className="text-sm text-gray-600">Total Users</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="mt-2">
                    <Badge variant="secondary" className="text-xs">
                      +{analyticsData.userGrowthRate}% growth
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">{analyticsData.totalTournaments}</p>
                      <p className="text-sm text-gray-600">Total Tournaments</p>
                    </div>
                    <Trophy className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div className="mt-2">
                    <Badge variant="default" className="text-xs">
                      {analyticsData.activeTournaments} active
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">${analyticsData.totalRevenue}</p>
                      <p className="text-sm text-gray-600">Total Revenue</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="mt-2">
                    <Badge variant="outline" className="text-xs">
                      ${Math.round(analyticsData.totalRevenue / analyticsData.totalTournaments || 0)} avg/tournament
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">{analyticsData.totalQuestions}</p>
                      <p className="text-sm text-gray-600">Total Questions</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="mt-2">
                    <Badge variant="secondary" className="text-xs">
                      {BIBLE_CATEGORIES.length} categories
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Popular Categories</CardTitle>
                  <CardDescription>Most used question categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.popularCategories.map((category, index) => (
                      <div key={category.category} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            index === 0 ? 'bg-blue-500' :
                            index === 1 ? 'bg-green-500' :
                            index === 2 ? 'bg-yellow-500' :
                            index === 3 ? 'bg-purple-500' : 'bg-gray-500'
                          }`} />
                          <span className="font-medium">{category.category}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">{category.count}</span>
                          <div className="w-20">
                            <Progress value={category.percentage} className="h-2" />
                          </div>
                          <span className="text-sm font-medium">{category.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tournament Status</CardTitle>
                  <CardDescription>Distribution of tournament states</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.tournamentStats.map((stat, index) => (
                      <div key={stat.status} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Badge variant={
                            stat.status === 'Active' ? 'default' :
                            stat.status === 'Scheduled' ? 'secondary' :
                            stat.status === 'Completed' ? 'outline' : 'destructive'
                          }>
                            {stat.status}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">{stat.count}</span>
                          <div className="w-20">
                            <Progress value={stat.percentage} className="h-2" />
                          </div>
                          <span className="text-sm font-medium">{stat.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Engagement Levels</CardTitle>
                  <CardDescription>Users by experience level</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.userEngagement.map((level, index) => (
                      <div key={level.level} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            level.level === 'Beginner' ? 'bg-red-500' :
                            level.level === 'Intermediate' ? 'bg-yellow-500' : 'bg-green-500'
                          }`} />
                          <span className="font-medium">{level.level}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">{level.users}</span>
                          <div className="w-20">
                            <Progress value={level.percentage} className="h-2" />
                          </div>
                          <span className="text-sm font-medium">{level.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>User Activity</CardTitle>
                  <CardDescription>Active vs inactive users</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span className="font-medium">Active Users</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">{analyticsData.activeUsers}</span>
                        <div className="w-20">
                          <Progress value={Math.round((analyticsData.activeUsers / analyticsData.totalUsers) * 100)} className="h-2" />
                        </div>
                        <span className="text-sm font-medium">
                          {Math.round((analyticsData.activeUsers / analyticsData.totalUsers) * 100)}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 rounded-full bg-gray-500" />
                        <span className="font-medium">Inactive Users</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">{analyticsData.totalUsers - analyticsData.activeUsers}</span>
                        <div className="w-20">
                          <Progress value={Math.round(((analyticsData.totalUsers - analyticsData.activeUsers) / analyticsData.totalUsers) * 100)} className="h-2" />
                        </div>
                        <span className="text-sm font-medium">
                          {Math.round(((analyticsData.totalUsers - analyticsData.activeUsers) / analyticsData.totalUsers) * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tournaments" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600">{analyticsData.avgTournamentSize}</p>
                    <p className="text-sm text-gray-600">Average Participants</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">{analyticsData.activeTournaments}</p>
                    <p className="text-sm text-gray-600">Active Tournaments</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-purple-600">
                      {Math.round((analyticsData.activeTournaments / analyticsData.totalTournaments) * 100)}%
                    </p>
                    <p className="text-sm text-gray-600">Activity Rate</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Question Distribution</CardTitle>
                <CardDescription>Questions by category and difficulty</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-medium mb-4">By Category</h4>
                    <div className="space-y-3">
                      {analyticsData.popularCategories.map((category, index) => (
                        <div key={category.category} className="flex items-center justify-between">
                          <span className="text-sm">{category.category}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-16">
                              <Progress value={category.percentage} className="h-2" />
                            </div>
                            <span className="text-sm font-medium w-8">{category.count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-4">By Difficulty</h4>
                    <div className="space-y-3">
                      {['Easy', 'Medium', 'Hard'].map((difficulty, index) => {
                        const count = Math.floor(Math.random() * 20) + 5;
                        const percentage = Math.round((count / analyticsData.totalQuestions) * 100);
                        return (
                          <div key={difficulty} className="flex items-center justify-between">
                            <span className="text-sm">{difficulty}</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-16">
                                <Progress value={percentage} className="h-2" />
                              </div>
                              <span className="text-sm font-medium w-8">{count}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
                <CardDescription>Monthly revenue and tournament count</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.revenueByMonth.map((month, index) => (
                    <div key={month.month} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 text-center">
                          <span className="font-medium">{month.month}</span>
                        </div>
                        <div>
                          <p className="font-bold text-lg">${month.revenue}</p>
                          <p className="text-sm text-gray-600">{month.tournaments} tournaments</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <TrendingUp className={`h-4 w-4 ${index > 0 && month.revenue > analyticsData.revenueByMonth[index - 1].revenue ? 'text-green-500' : 'text-gray-400'}`} />
                        <span className="text-sm font-medium">
                          ${Math.round(month.revenue / month.tournaments)} avg
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};