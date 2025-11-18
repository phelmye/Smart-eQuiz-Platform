import React, { useState, useEffect, lazy, Suspense } from 'react';
import { AuthSystem, useAuth } from '@/components/AuthSystem';
import { FullScreenLoader } from '@/components/ui/loading-spinner';
import ErrorBoundary from '@/components/ui/error-boundary';
import { initializeMockData, mockTournaments } from '@/lib/mockData';

// Dynamic imports for code splitting - components are loaded only when needed
const Dashboard = lazy(() => import('@/components/Dashboard').then(module => ({ default: module.Dashboard })));
const PracticeMode = lazy(() => import('@/components/PracticeMode').then(module => ({ default: module.PracticeMode })));
const TournamentBuilder = lazy(() => import('@/components/TournamentBuilder').then(module => ({ default: module.TournamentBuilder })));
const LiveMatch = lazy(() => import('@/components/LiveMatch').then(module => ({ default: module.LiveMatch })));
const QuestionBank = lazy(() => import('@/components/QuestionBank'));
const UserManagement = lazy(() => import('@/components/UserManagement'));
const TournamentEngine = lazy(() => import('@/components/TournamentEngine').then(module => ({ default: module.TournamentEngine })));
const AIQuestionGenerator = lazy(() => import('@/components/AIQuestionGenerator').then(module => ({ default: module.AIQuestionGenerator })));
const TenantManagement = lazy(() => import('@/components/TenantManagement').then(module => ({ default: module.TenantManagement })));
const SystemSettings = lazy(() => import('@/components/SystemSettings').then(module => ({ default: module.SystemSettings })));
const DebugPage = lazy(() => import('@/components/DebugPage'));

// Pre-tournament & Application components
const PreTournamentQuestionManager = lazy(() => import('@/components/PreTournamentQuestionManager'));
const PreTournamentQuiz = lazy(() => import('@/components/PreTournamentQuiz').then(module => ({ default: module.PreTournamentQuiz })));
const ApplicationManagement = lazy(() => import('@/components/ApplicationManagement'));
const PracticeAccessApplication = lazy(() => import('@/components/PracticeAccessApplication'));
const TournamentApplication = lazy(() => import('@/components/TournamentApplication'));

// Payment & Subscription components
const PaymentIntegrationManagement = lazy(() => import('@/components/PaymentIntegrationManagement').then(module => ({ default: module.PaymentIntegrationManagement })));
const BillingSelection = lazy(() => import('@/components/BillingSelection'));
const SubscriptionManagement = lazy(() => import('@/components/SubscriptionManagement'));
const PlanManagement = lazy(() => import('@/components/PlanManagement'));

// Admin & Management components
const NotificationCenter = lazy(() => import('@/components/NotificationCenter'));
const HelpCenter = lazy(() => import('@/components/HelpCenter'));
const SecurityCenter = lazy(() => import('@/components/SecurityCenter'));
const AuditLogViewer = lazy(() => import('@/components/AuditLogViewer'));
const ReportingExports = lazy(() => import('@/components/ReportingExports'));

// Tournament Management components
const CertificateGenerator = lazy(() => import('@/components/CertificateGenerator'));
const EmailTemplateManager = lazy(() => import('@/components/EmailTemplateManager'));
const WinnersHallOfFame = lazy(() => import('@/components/WinnersHallOfFame'));
const LiveTournamentSpectator = lazy(() => import('@/components/LiveTournamentSpectator'));
const MatchManagement = lazy(() => import('@/components/MatchManagement'));
const PrizeAwardManagement = lazy(() => import('@/components/PrizeAwardManagement'));
const BracketVisualization = lazy(() => import('@/components/BracketVisualization'));
const KnockoutTournamentEngine = lazy(() => import('@/components/KnockoutTournamentEngine'));

// Question & Category Management
const BonusQuestionManager = lazy(() => import('@/components/BonusQuestionManager'));
const CustomCategoryManager = lazy(() => import('@/components/CustomCategoryManager'));
const QuestionCategoryManager = lazy(() => import('@/components/QuestionCategoryManager'));
const RoundQuestionConfigBuilder = lazy(() => import('@/components/RoundQuestionConfigBuilder'));
const TemplateLibrary = lazy(() => import('@/components/TemplateLibrary'));

// User & Role Management
const TeamManagement = lazy(() => import('@/components/TeamManagement'));
const TenantRoleCustomization = lazy(() => import('@/components/TenantRoleCustomization'));
const RoleManagement = lazy(() => import('@/components/RoleManagement'));

// Settings & Customization
const ThemeSettings = lazy(() => import('@/components/ThemeSettings'));
const BrandingSettings = lazy(() => import('@/components/BrandingSettings'));

type Page = 'auth' | 'dashboard' | 'practice' | 'tournament-builder' | 'live-match' | 'question-bank' | 'user-management' | 'tournaments' | 'ai-generator' | 'tenant-management' | 'system-settings' | 'plan-management' | 'billing' | 'payment-integration' | 'debug' | 
  'pre-tournament-questions' | 'pre-tournament-quiz' | 'applications' | 'practice-application' | 'tournament-application' | 
  'subscription-management' | 'notifications' | 'help' | 'security' | 'audit-logs' | 'reports' | 
  'certificates' | 'email-templates' | 'hall-of-fame' | 'spectator' | 'match-management' | 'prize-management' | 'brackets' | 'knockout-tournament' | 
  'bonus-questions' | 'custom-categories' | 'question-categories' | 'round-config' | 'templates' | 
  'team-management' | 'role-customization' | 'role-management' | 'theme-settings' | 'branding';

// Main content component that uses auth context
const AppContent: React.FC = () => {
  const { user, isAuthenticated, isInitializing } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  // Mock tenant data for components that require it
  const mockTenant = {
    id: 'demo-tenant',
    name: 'Demo Organization',
    subdomain: 'demo',
    customDomainVerified: false,
    planId: 'professional',
    status: 'active' as const,
    primaryColor: '#3b82f6',
    sslEnabled: true,
    paymentIntegrationEnabled: true,
    maxUsers: 100,
    maxTournaments: 50,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Navigate to dashboard when authenticated
  useEffect(() => {
    console.log('🔍 Index.tsx - Auth state changed:', { 
      isAuthenticated, 
      user: user?.email, 
      isInitializing,
      currentPage 
    });
    
    if (isAuthenticated && user && !isInitializing) {
      console.log('🔍 Index.tsx - User is authenticated, navigating to dashboard');
      setCurrentPage('dashboard');
    } else {
      console.log('🔍 Index.tsx - Still not authenticated or initializing:', { 
        isAuthenticated, 
        hasUser: !!user, 
        isInitializing 
      });
    }
  }, [isAuthenticated, user, isInitializing]);

  const handleLogout = () => {
    setCurrentPage('auth');
  };

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
  };

  const handleBackToDashboard = () => {
    setCurrentPage('dashboard');
  };



  // Show loading while initializing authentication
  if (isInitializing) {
    console.log('🔍 Index.tsx - Showing loading screen, isInitializing:', isInitializing);
    return <FullScreenLoader text="Initializing..." />;
  }

  // Show auth system if not authenticated
  if (!isAuthenticated || !user) {
    console.log('🔍 Index.tsx - Showing auth system because:', { 
      isAuthenticated, 
      hasUser: !!user, 
      isInitializing 
    });
    return <AuthSystem onAuthSuccess={() => {
      console.log('🔍 Index.tsx - onAuthSuccess callback triggered - authentication should be handled by AuthProvider');
      // Don't manually set page - let the auth state change trigger the re-render naturally
    }} />;
  }

  // Show main application content
  return (
    <ErrorBoundary>
      <Suspense fallback={<FullScreenLoader text={`Loading ${currentPage.replace('-', ' ')}...`} />}>
        {(() => {
          switch (currentPage) {
            case 'dashboard':
              return <Dashboard onNavigate={handleNavigate} />;
            case 'practice':
              return <PracticeMode onBack={handleBackToDashboard} />;
            case 'tournament-builder':
              return <TournamentBuilder onBack={handleBackToDashboard} onNavigate={handleNavigate} />;
            case 'live-match':
              return <LiveMatch onBack={handleBackToDashboard} />;
            case 'question-bank':
              return <QuestionBank onBack={handleBackToDashboard} />;
            case 'user-management':
              return <UserManagement onBack={handleBackToDashboard} />;
            case 'tournaments':
              return <TournamentEngine onBack={handleBackToDashboard} />;
            case 'ai-generator':
              return <AIQuestionGenerator onBack={handleBackToDashboard} />;
            case 'tenant-management':
              return <TenantManagement onBack={handleBackToDashboard} />;
            case 'system-settings':
              return <SystemSettings onBack={handleBackToDashboard} />;
            case 'debug':
              return <DebugPage onBack={handleBackToDashboard} />;
            
            // Pre-tournament & Application Management
            case 'pre-tournament-questions':
              return <PreTournamentQuestionManager tournamentId="demo-tournament" onBack={handleBackToDashboard} />;
            case 'pre-tournament-quiz':
              return <PreTournamentQuiz applicationId="demo-app" onBack={handleBackToDashboard} />;
            case 'applications':
              return <ApplicationManagement onBack={handleBackToDashboard} />;
            case 'practice-application':
              return <PracticeAccessApplication />;
            case 'tournament-application':
              return <TournamentApplication onBack={handleBackToDashboard} />;
            
            // Payment & Subscription
            case 'payment-integration':
              return <PaymentIntegrationManagement onBack={handleBackToDashboard} />;
            case 'billing':
              return <BillingSelection availablePlans={[]} onSelectPlan={() => {}} />;
            case 'subscription-management':
              return <SubscriptionManagement user={user} tenant={mockTenant} onBack={handleBackToDashboard} />;
            case 'plan-management':
              return <PlanManagement onBack={handleBackToDashboard} />;
            
            // Admin & Management
            case 'notifications':
              return <NotificationCenter onBack={handleBackToDashboard} />;
            case 'help':
              return <HelpCenter onBack={handleBackToDashboard} />;
            case 'security':
              return <SecurityCenter user={user} onBack={handleBackToDashboard} />;
            case 'audit-logs':
              return <AuditLogViewer onBack={handleBackToDashboard} />;
            case 'reports':
              return <ReportingExports user={user} tenant={mockTenant} onBack={handleBackToDashboard} />;
            
            // Tournament Management
            case 'certificates':
              // Mock award for demo purposes
              const mockAward = {
                id: 'demo-award-1',
                tenantId: mockTenant.id,
                tournamentId: 'demo-tournament',
                prizeConfigId: 'demo-config',
                winnerId: user?.id || 'demo-user',
                winnerName: user?.name || 'Demo User',
                winnerType: 'individual' as const,
                awardType: 'position' as const,
                position: 1,
                positionLabel: '1st Place',
                prizeDescription: 'First Place Champion',
                prizes: [],
                recipientId: user?.id || 'demo-user',
                awardedAt: new Date().toISOString(),
                status: 'claimed' as const,
                winnerAcknowledged: false,
                certificateGenerated: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              };
              return <CertificateGenerator award={mockAward} type="winner" userId={user?.id} />;
            case 'email-templates':
              return <EmailTemplateManager onBack={handleBackToDashboard} />;
            case 'hall-of-fame':
              return <WinnersHallOfFame tenantId={mockTenant.id} />;
            case 'spectator':
              // Use first available tournament for spectator mode
              const spectatorTournament = mockTournaments.find(t => t.tenantId === mockTenant.id) || mockTournaments[0];
              return <LiveTournamentSpectator tournament={spectatorTournament} onBack={handleBackToDashboard} />;
            case 'match-management':
              return <MatchManagement tournamentId="demo-tournament" tenantId={mockTenant.id} onBack={handleBackToDashboard} />;
            case 'prize-management':
              return <PrizeAwardManagement tenantId={mockTenant.id} tournamentId="demo-tournament" />;
            case 'brackets':
              return <BracketVisualization tournamentId="demo-tournament" onBack={handleBackToDashboard} />;
            case 'knockout-tournament':
              // Use first available tournament
              const knockoutTournament = mockTournaments.find(t => t.tenantId === mockTenant.id) || mockTournaments[0];
              return <KnockoutTournamentEngine tournament={knockoutTournament} tenantId={mockTenant.id} onBack={handleBackToDashboard} />;
            
            // Question & Category Management
            case 'bonus-questions':
              return <BonusQuestionManager tenantId={mockTenant.id} userId={user?.id || 'demo-user'} onBack={handleBackToDashboard} />;
            case 'custom-categories':
              return <CustomCategoryManager tenantId={mockTenant.id} currentUser={user} />;
            case 'question-categories':
              return <QuestionCategoryManager user={user} onBack={handleBackToDashboard} />;
            case 'round-config':
              return <RoundQuestionConfigBuilder totalRounds={3} onConfigsChange={() => {}} tenantId={mockTenant.id} currentUser={user} onBack={handleBackToDashboard} />;
            case 'templates':
              return <TemplateLibrary tenantId={mockTenant.id} currentUser={user} onApplyTemplate={() => {}} />;
            
            // User & Role Management
            case 'team-management':
              return <TeamManagement user={user} tenant={mockTenant} onBack={handleBackToDashboard} />;
            case 'role-customization':
              return <TenantRoleCustomization onBack={handleBackToDashboard} />;
            case 'role-management':
              return <RoleManagement user={user} onBack={handleBackToDashboard} />;
            
            // Settings & Customization
            case 'theme-settings':
              return <ThemeSettings onBack={handleBackToDashboard} />;
            case 'branding':
              return <BrandingSettings onBack={handleBackToDashboard} />;
            
            default:
              return <Dashboard onNavigate={handleNavigate} />;
          }
        })()}
      </Suspense>
    </ErrorBoundary>
  );
};

// Main Index component
export default function Index() {
  useEffect(() => {
    // Initialize mock data on app start
    initializeMockData();
  }, []);

  return <AppContent />;
}