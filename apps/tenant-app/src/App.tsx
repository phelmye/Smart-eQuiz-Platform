import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/components/AuthSystem';
import { TenantProvider } from '@/contexts/TenantContext';
import { loadSavedTheme } from '@/lib/theme';
import { storage, STORAGE_KEYS } from '@/lib/mockData';
import { useEffect } from 'react';
import Index from './pages/Index';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient();

function App() {
  console.log('🔍 App component rendering');
  
  // Load and apply saved theme on mount
  useEffect(() => {
    const currentUser = storage.get(STORAGE_KEYS.CURRENT_USER);
    if (currentUser?.tenantId) {
      loadSavedTheme(currentUser.tenantId);
    }
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <TenantProvider>
        <TooltipProvider>
          <Toaster />
          <AuthProvider>
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
      </TenantProvider>
    </QueryClientProvider>
  );
}

export default App;
