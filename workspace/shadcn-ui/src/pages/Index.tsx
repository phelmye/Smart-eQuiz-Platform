import React, { useState, useEffect, lazy, Suspense } from 'react';
import { AuthSystem, useAuth } from '@/components/AuthSystem';
import { FullScreenLoader } from '@/components/ui/loading-spinner';
import ErrorBoundary from '@/components/ui/error-boundary';
import { initializeMockData, mockTenants, Tenant } from '@/lib/mockData';
import TenantLandingPage from '@/components/TenantLandingPage';

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

type Page = 'auth' | 'dashboard' | 'practice' | 'tournament-builder' | 'live-match' | 'question-bank' | 'user-management' | 'tournaments' | 'ai-generator' | 'tenant-management' | 'system-settings' | 'plan-management' | 'billing' | 'payment-integration' | 'debug';

// Main content component that uses auth context
const AppContent: React.FC = () => {
  const { user, isAuthenticated, isInitializing } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [, forceUpdate] = useState(0);
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);

  // Detect tenant from URL
  useEffect(() => {
    const detectTenantFromUrl = (): Tenant | null => {
      const hostname = window.location.hostname;
      const isDevelopment = hostname === 'localhost' || hostname === '127.0.0.1';
      
      if (isDevelopment) {
        // Check URL parameter first
        const urlParams = new URLSearchParams(window.location.search);
        const tenantParam = urlParams.get('tenant');
        if (tenantParam) {
          return mockTenants.find(t => t.id === tenantParam) || mockTenants[0];
        }
        // Default to first tenant for development
        return mockTenants[0];
      }
      
      // Production: subdomain detection
      const parts = hostname.split('.');
      if (parts.length >= 3) {
        const subdomain = parts[0];
        if (subdomain === 'www' || subdomain === 'admin') {
          return mockTenants[0];
        }
        
        // Map subdomain to tenant
        const subdomainToTenant: Record<string, string> = {
          'firstbaptist': 'tenant1',
          'grace': 'tenant2',
          'stmarys': 'tenant3',
        };
        
        const tenantId = subdomainToTenant[subdomain] || 'tenant1';
        return mockTenants.find(t => t.id === tenantId) || mockTenants[0];
      }
      
      return mockTenants[0];
    };
    
    const tenant = detectTenantFromUrl();
    setCurrentTenant(tenant);
  }, []);

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
      // Force a re-render to ensure dashboard shows
      forceUpdate(n => n + 1);
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

  // Show tenant landing page if not authenticated
  if (!isAuthenticated || !user) {
    console.log('🔍 Index.tsx - Showing landing page because:', { 
      isAuthenticated, 
      hasUser: !!user, 
      isInitializing 
    });
    
    if (currentTenant) {
      return (
        <TenantLandingPage 
          tenant={currentTenant}
          onAuthSuccess={() => {
            console.log('🔍 Index.tsx - Landing page auth success callback triggered');
            setCurrentPage('dashboard');
            forceUpdate(n => n + 1);
          }}
        />
      );
    }
    
    // Fallback to auth system if tenant not detected
    return <AuthSystem onAuthSuccess={() => {
      console.log('🔍 Index.tsx - onAuthSuccess callback triggered');
      setCurrentPage('dashboard');
      forceUpdate(n => n + 1);
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