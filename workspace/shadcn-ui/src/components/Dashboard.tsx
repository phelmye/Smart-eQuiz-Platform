import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Trophy, Users, BookOpen, Star, Coins, Calendar, Play, Settings, LogOut, Menu, X, ChevronLeft } from 'lucide-react';
import { useAuth } from './AuthSystem';
import { AdminSidebar } from './AdminSidebar';
import UserManagement from './UserManagement';
import UserManagementWithLoginAs from './UserManagementWithLoginAs';
import TenantManagementForSuperAdmin from './TenantManagementForSuperAdmin';
import { Analytics } from './Analytics';
import PaymentManagementSimple from './PaymentManagementSimple';
import { BrandingSettings } from './BrandingSettings';
import { QuestionBank } from './QuestionBank';
import { TournamentEngine } from './TournamentEngine';
import { AIQuestionGenerator } from './AIQuestionGenerator';
import { TenantManagement } from './TenantManagement';
import { SystemSettings } from './SystemSettings';
import PlanManagement from './PlanManagement';
import BillingSelection from './BillingSelection';
import PaymentIntegrationManagement from './PaymentIntegrationManagement';
import RoleManagement from './RoleManagement';
import RoleComponentManagement from './RoleComponentManagement';
import QuestionCategoryManager from './QuestionCategoryManager';
import AccessControl from './AccessControl';
import ComponentAccessControl from './ComponentAccessControl';
import AuditLogViewer from './AuditLogViewer';
import { Tournament, User, XP_LEVELS, AVAILABLE_BADGES, storage, STORAGE_KEYS, mockTournaments, defaultPlans, mockBilling, canAccessPage } from '@/lib/mockData';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { user, tenant, logout } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userStats, setUserStats] = useState({
    totalQuizzes: 0,
    averageScore: 0,
    winRate: 0,
    currentStreak: 0
  });

  const isAdmin = user?.role === 'org_admin' || user?.role === 'super_admin';

  useEffect(() => {
    // Load tournaments
    const savedTournaments = storage.get(STORAGE_KEYS.TOURNAMENTS) || mockTournaments;
    if (user?.role === 'super_admin') {
      setTournaments(savedTournaments);
    } else {
      setTournaments(savedTournaments.filter((t: Tournament) => t.tenantId === user?.tenantId));
    }

    // Calculate user stats (mock data)
    setUserStats({
      totalQuizzes: Math.floor(Math.random() * 50) + 10,
      averageScore: Math.floor(Math.random() * 30) + 70,
      winRate: Math.floor(Math.random() * 40) + 30,
      currentStreak: Math.floor(Math.random() * 10) + 1
    });
  }, [user]);

  const getCurrentLevel = () => {
    if (!user) return XP_LEVELS[0];
    return XP_LEVELS.find(level => user.xp >= level.xpRequired) || XP_LEVELS[0];
  };

  const getNextLevel = () => {
    if (!user) return XP_LEVELS[1];
    const currentLevel = getCurrentLevel();
    const nextLevelIndex = XP_LEVELS.findIndex(level => level.level === currentLevel.level) + 1;
    return XP_LEVELS[nextLevelIndex] || XP_LEVELS[XP_LEVELS.length - 1];
  };

  const getXPProgress = () => {
    if (!user) return 0;
    const currentLevel = getCurrentLevel();
    const nextLevel = getNextLevel();
    const progress = ((user.xp - currentLevel.xpRequired) / (nextLevel.xpRequired - currentLevel.xpRequired)) * 100;
    return Math.min(progress, 100);
  };

  const getUserBadges = () => {
    if (!user) return [];
    return AVAILABLE_BADGES.filter(badge => user.badges.includes(badge.name));
  };

  const handleSidebarNavigate = (page: string) => {
    if (['practice', 'tournament-builder', 'live-match'].includes(page)) {
      onNavigate(page);
    } else {
      setCurrentPage(page);
    }
  };

  const handleBackToDashboard = () => {
    setCurrentPage('dashboard');
  };

  const handleLoginAsTenant = (tenantId: string) => {
    // Reload the current user (now the tenant admin)
    const updatedUser = storage.get(STORAGE_KEYS.CURRENT_USER);
    if (updatedUser) {
      // Force re-authentication with new user
      window.location.reload();
    }
  };

  const handleLogoutFromTenant = () => {
    const originalSuperAdmin = storage.get('original_super_admin');
    if (originalSuperAdmin) {
      // Restore original super admin
      storage.set(STORAGE_KEYS.CURRENT_USER, originalSuperAdmin);
      storage.remove('original_super_admin');
      
      console.log('🔄 Returned to super admin account');
      // Force page refresh to update user context
      window.location.reload();
    }
  };

  const handleLoginAsUser = (targetUser: User) => {
    // Force page refresh to update user context
    window.location.reload();
  };

  const handleLogoutFromUser = () => {
    const originalUser = storage.get('original_user');
    if (originalUser) {
      // Restore original user
      storage.set(STORAGE_KEYS.CURRENT_USER, originalUser);
      storage.remove('original_user');
      
      console.log(`🔄 Returned to ${originalUser.name} account`);
      // Force page refresh to update user context
      window.location.reload();
    }
  };

  const getBreadcrumb = () => {
    const pageMap: Record<string, string> = {
      'dashboard': 'Dashboard',
      'user-management': 'User Management',
      'role-management': 'Role Management',
      'tenant-management': 'Tenant Management',
      'audit-logs': 'Audit Logs',
      'analytics': 'Analytics', 
      'payments': 'Payments',
      'branding': 'Branding Settings',
      'question-bank': 'Question Bank',
      'tournaments': 'Tournaments',
      'ai-generator': 'AI Generator',
      'system-settings': 'System Settings',
      'plan-management': 'Plan Management',
      'billing': 'Billing & Plans',
      'payment-integration': 'Payment Integration'
    };

    if (currentPage === 'dashboard') {
      return [{ label: 'Dashboard' }];
    }

    return [
      { label: 'Dashboard', onClick: handleBackToDashboard },
      { label: pageMap[currentPage] || 'Unknown Page' }
    ];
  };

  const renderPageContent = () => {
    switch (currentPage) {
      case 'user-management':
        return (
          <AccessControl 
            user={user} 
            requiredPage="user-management"
            requiredPermission="users.read"
            fallbackMessage="Only organization administrators can manage users."
          >
            {user?.role === 'org_admin' ? (
              <UserManagementWithLoginAs 
                user={user}
                onLoginAs={handleLoginAsUser}
                onLogoutFromUser={handleLogoutFromUser}
              />
            ) : (
              <UserManagement onBack={handleBackToDashboard} />
            )}
          </AccessControl>
        );
      case 'role-management':
        return (
          <AccessControl 
            user={user} 
            requiredPage="role-management"
            requiredPermission="roles.manage"
            fallbackMessage="Only organization administrators can manage user roles and permissions."
          >
            <RoleManagement user={user} />
          </AccessControl>
        );
      case 'tenant-management':
        return (
          <AccessControl 
            user={user} 
            requiredPage="tenant-management"
            requiredPermission="tenant.manage"
            fallbackMessage="Only super administrators can manage tenant accounts."
          >
            <TenantManagementForSuperAdmin 
              user={user} 
              onLoginAs={handleLoginAsTenant}
            />
          </AccessControl>
        );
      case 'audit-logs':
        return (
          <AccessControl 
            user={user} 
            requiredPage="audit-logs"
            requiredPermission={null}
            fallbackMessage="Only administrators can view audit logs."
          >
            <AuditLogViewer onBack={handleBackToDashboard} />
          </AccessControl>
        );
      case 'analytics':
        return (
          <AccessControl 
            user={user} 
            requiredPage="analytics"
            requiredPermission="analytics.view"
            fallbackMessage="You need analytics access permissions to view this page."
          >
            <Analytics onBack={handleBackToDashboard} />
          </AccessControl>
        );
      case 'payments':
        return (
          <AccessControl 
            user={user} 
            requiredPage="payments"
            requiredPermission="payments.read"
            fallbackMessage="You need payment management permissions to access this page."
          >
            <PaymentManagementSimple onBack={handleBackToDashboard} />
          </AccessControl>
        );
      case 'branding':
        return (
          <AccessControl 
            user={user} 
            requiredPage="branding"
            requiredPermission="branding.manage"
            fallbackMessage="Only organization administrators can manage branding settings."
          >
            <BrandingSettings onBack={handleBackToDashboard} />
          </AccessControl>
        );
      case 'question-bank':
        return (
          <AccessControl 
            user={user} 
            requiredPage="question-bank"
            requiredPermission="questions.read"
            fallbackMessage="You need question management permissions to access this page."
          >
            <QuestionBank 
              onBack={handleBackToDashboard} 
              onNavigateToCategories={() => setCurrentPage('question-categories')}
            />
          </AccessControl>
        );
      case 'tournaments':
        return (
          <AccessControl 
            user={user} 
            requiredPage="tournaments"
            requiredPermission="tournaments.read"
            fallbackMessage="You need tournament access permissions to view this page."
          >
            <TournamentEngine onBack={handleBackToDashboard} />
          </AccessControl>
        );
      case 'ai-generator':
        return (
          <AccessControl 
            user={user} 
            requiredPage="ai-generator"
            requiredPermission="questions.create"
            fallbackMessage="You need question creation permissions to access the AI generator."
          >
            <AIQuestionGenerator onBack={handleBackToDashboard} />
          </AccessControl>
        );
      case 'system-settings':
        return <SystemSettings onBack={handleBackToDashboard} />;
      case 'plan-management':
        return <PlanManagement onBack={handleBackToDashboard} />;
      case 'billing':
        return <BillingSelection 
          availablePlans={defaultPlans}
          currentSubscription={user?.tenantId ? mockBilling.find(b => b.tenantId === user.tenantId) : undefined}
          onSelectPlan={(planId, billingCycle) => {
            console.log('Selected plan:', planId, 'with billing cycle:', billingCycle);
          }}
          onUpgrade={(planId, billingCycle) => {
            console.log('Upgrading to plan:', planId, 'with billing cycle:', billingCycle);
          }}
          onDowngrade={(planId, billingCycle) => {
            console.log('Downgrading to plan:', planId, 'with billing cycle:', billingCycle);
          }}
        />;
      case 'payment-integration':
        return <PaymentIntegrationManagement onBack={handleBackToDashboard} />;
      case 'role-component-management':
        return (
          <ComponentAccessControl
            user={user}
            componentId="system-settings"
            featureId="manage-role-features"
          >
            <RoleComponentManagement user={user} onBack={handleBackToDashboard} />
          </ComponentAccessControl>
        );
      case 'question-categories':
        return (
          <ComponentAccessControl
            user={user}
            componentId="question-bank"
            featureId="manage-categories"
          >
            <QuestionCategoryManager user={user} onBack={handleBackToDashboard} />
          </ComponentAccessControl>
        );
      default:
        return null;
    }
  };

  if (!user) return null;



  // Render sub-pages with full layout
  const pageContent = renderPageContent();
  if (pageContent) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        {/* Persistent Sidebar */}
        {isAdmin && (
          <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} transition-all duration-300 ease-in-out`}>
            <AdminSidebar
              currentPage={currentPage}
              onNavigate={handleSidebarNavigate}
              collapsed={sidebarCollapsed}
              onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
              userRole={user?.role}
              user={user}
              onLogoutFromTenant={handleLogoutFromTenant}
              onLogoutFromUser={handleLogoutFromUser}
            />
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Navigation Bar */}
          <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Left Section - Menu Toggle, Back Button, Breadcrumb */}
              <div className="flex items-center space-x-4">
                {/* Sidebar Toggle */}
                {isAdmin && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    className="flex items-center space-x-2"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                )}

                {/* Back Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToDashboard}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Back</span>
                </Button>

                {/* Breadcrumb */}
                <nav className="flex items-center space-x-2 text-sm">
                  {getBreadcrumb().map((item, index) => (
                    <React.Fragment key={index}>
                      {index > 0 && (
                        <span className="text-gray-400">/</span>
                      )}
                      {item.onClick ? (
                        <button
                          onClick={item.onClick}
                          className="text-gray-600 hover:text-gray-900 transition-colors"
                        >
                          {item.label}
                        </button>
                      ) : (
                        <span className="text-gray-900 font-medium">
                          {item.label}
                        </span>
                      )}
                    </React.Fragment>
                  ))}
                </nav>
              </div>

              {/* Right Section - User Info */}
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{user.name || user.email}</span>
                  <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {user.role?.replace('_', ' ').toUpperCase() || 'USER'}
                  </span>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-6">
            {pageContent}
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex">
      {/* Admin Sidebar */}
      {isAdmin && (
        <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} transition-all duration-300 ease-in-out`}>
          <AdminSidebar
            currentPage={currentPage}
            onNavigate={handleSidebarNavigate}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            userRole={user?.role}
            user={user}
            onLogoutFromTenant={handleLogoutFromTenant}
            onLogoutFromUser={handleLogoutFromUser}
          />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                {isAdmin && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  >
                    {sidebarCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
                  </Button>
                )}
                <h1 className="text-xl font-bold text-blue-900">
                  {currentPage === 'role-management' ? 'Role Management' :
                   currentPage === 'role-component-management' ? 'Role Component Features' :
                   currentPage === 'question-categories' ? 'Question Categories' :
                   currentPage === 'audit-logs' ? 'Audit Logs' :
                   currentPage === 'question-bank' ? 'Question Bank' :
                   currentPage === 'user-management' ? 'User Management' :
                   currentPage === 'analytics' ? 'Analytics' :
                   currentPage === 'tournaments' ? 'Tournament Management' :
                   currentPage === 'payments' ? 'Payment Management' :
                   currentPage === 'branding' ? 'Branding Settings' :
                   currentPage === 'ai-generator' ? 'AI Question Generator' :
                   currentPage === 'tenant-management' ? 'Tenant Management' :
                   currentPage === 'system-settings' ? 'System Settings' :
                   currentPage === 'plan-management' ? 'Plan Management' :
                   currentPage === 'billing' ? 'Billing & Plans' :
                   currentPage === 'payment-integration' ? 'Payment Integration' :
                   currentPage === 'security' ? 'Security & Logs' :
                   currentPage === 'notifications' ? 'Notifications' :
                   currentPage === 'settings' ? 'Settings' :
                   currentPage === 'help' ? 'Help & Support' :
                   'Smart eQuiz Dashboard'}
                </h1>
                {tenant && (
                  <Badge variant="outline" style={{ borderColor: tenant.primaryColor }}>
                    {tenant.name}
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Coins className="h-4 w-4 text-yellow-600" />
                  <span className="font-medium">${(user.walletBalance || 0).toFixed(2)}</span>
                </div>
                
                <Avatar>
                  <AvatarFallback>{user.name?.split(' ').map(n => n[0]).join('') || user.email?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
                
                <div className="text-sm">
                  <p className="font-medium">{user.name || user.email}</p>
                  <p className="text-gray-500 capitalize">{user.role?.replace('_', ' ') || 'User'}</p>
                </div>
                
                <Button variant="ghost" size="sm" onClick={logout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {currentPage === 'dashboard' && (
            <div className="max-w-7xl mx-auto">
              <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="tournaments">Tournaments</TabsTrigger>
                  <TabsTrigger value="practice">Practice</TabsTrigger>
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  {/* User Progress Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Star className="h-5 w-5 text-yellow-500" />
                        <span>Your Progress</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Current Level</p>
                          <p className="text-2xl font-bold text-blue-900">{getCurrentLevel().title}</p>
                          <p className="text-sm text-gray-500">Level {getCurrentLevel().level}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">XP Points</p>
                          <p className="text-2xl font-bold text-green-600">{user.xp}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress to {getNextLevel().title}</span>
                          <span>{Math.round(getXPProgress())}%</span>
                        </div>
                        <Progress value={getXPProgress()} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-2">
                          <BookOpen className="h-8 w-8 text-blue-600" />
                          <div>
                            <p className="text-2xl font-bold">{userStats.totalQuizzes}</p>
                            <p className="text-sm text-gray-600">Total Quizzes</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-2">
                          <Trophy className="h-8 w-8 text-yellow-600" />
                          <div>
                            <p className="text-2xl font-bold">{userStats.averageScore}%</p>
                            <p className="text-sm text-gray-600">Average Score</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-2">
                          <Users className="h-8 w-8 text-green-600" />
                          <div>
                            <p className="text-2xl font-bold">{userStats.winRate}%</p>
                            <p className="text-sm text-gray-600">Win Rate</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-8 w-8 text-purple-600" />
                          <div>
                            <p className="text-2xl font-bold">{userStats.currentStreak}</p>
                            <p className="text-sm text-gray-600">Day Streak</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Quick Practice</CardTitle>
                        <CardDescription>Start a practice session to improve your skills</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button onClick={() => onNavigate('practice')} className="w-full">
                          <Play className="h-4 w-4 mr-2" />
                          Start Practice
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Active Tournaments</CardTitle>
                        <CardDescription>Join ongoing tournaments</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {tournaments.filter(t => t.status === 'scheduled' || t.status === 'active').slice(0, 2).map(tournament => (
                            <div key={tournament.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div>
                                <p className="font-medium text-sm">{tournament.name}</p>
                                <p className="text-xs text-gray-500">{tournament.category}</p>
                              </div>
                              <Badge variant={tournament.status === 'active' ? 'default' : 'secondary'}>
                                {tournament.status}
                              </Badge>
                            </div>
                          ))}
                          <Button variant="outline" onClick={() => setCurrentPage('tournaments')} className="w-full mt-2">
                            View All Tournaments
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="tournaments">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h2 className="text-2xl font-bold">Tournaments</h2>
                      {isAdmin && (
                        <Button onClick={() => onNavigate('tournament-builder')}>
                          Create Tournament
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {tournaments.map(tournament => (
                        <Card key={tournament.id}>
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <CardTitle className="text-lg">{tournament.name}</CardTitle>
                              <Badge variant={
                                tournament.status === 'active' ? 'default' :
                                tournament.status === 'scheduled' ? 'secondary' :
                                tournament.status === 'completed' ? 'outline' : 'destructive'
                              }>
                                {tournament.status}
                              </Badge>
                            </div>
                            <CardDescription>{tournament.description}</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="flex justify-between text-sm">
                              <span>Entry Fee:</span>
                              <span className="font-medium">${tournament.entryFee}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Prize Pool:</span>
                              <span className="font-medium text-green-600">${tournament.prizePool}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Participants:</span>
                              <span>{tournament.currentParticipants}/{tournament.maxParticipants}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Spectators:</span>
                              <span>{tournament.spectatorCount}</span>
                            </div>
                            
                            <div className="pt-2">
                              {tournament.status === 'scheduled' && (
                                <Button 
                                  className="w-full" 
                                  disabled={tournament.participants.includes(user.id)}
                                  onClick={() => onNavigate('tournament-detail')}
                                >
                                  {tournament.participants.includes(user.id) ? 'Registered' : 'Join Tournament'}
                                </Button>
                              )}
                              {tournament.status === 'active' && (
                                <Button 
                                  className="w-full" 
                                  onClick={() => onNavigate('live-match')}
                                >
                                  {tournament.participants.includes(user.id) ? 'Enter Match' : 'Watch Live'}
                                </Button>
                              )}
                              {tournament.status === 'completed' && (
                                <Button variant="outline" className="w-full">
                                  View Results
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="practice">
                  <Card>
                    <CardHeader>
                      <CardTitle>Practice Mode</CardTitle>
                      <CardDescription>Improve your Bible knowledge with practice quizzes</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button onClick={() => onNavigate('practice')} size="lg" className="w-full">
                        <Play className="h-5 w-5 mr-2" />
                        Start Practice Session
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="profile">
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Profile Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Name</p>
                            <p className="font-medium">{user.name || user.email}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Email</p>
                            <p className="font-medium">{user.email}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Role</p>
                            <p className="font-medium capitalize">{user.role?.replace('_', ' ') || 'User'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Organization</p>
                            <p className="font-medium">{tenant?.name || 'Default'}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Achievements & Badges</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {getUserBadges().map(badge => (
                            <div key={badge.id} className="text-center p-4 bg-gray-50 rounded-lg">
                              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                <Trophy className="h-6 w-6 text-yellow-600" />
                              </div>
                              <p className="font-medium text-sm">{badge.name}</p>
                              <p className="text-xs text-gray-500">{badge.description}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};