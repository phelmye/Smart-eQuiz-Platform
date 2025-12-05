import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/components/AuthSystem';
import { TenantProvider } from '@/contexts/TenantContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import Index from './pages/Index';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient();

function App() {
  console.log('🔍 App component rendering');
  
  return (
    <QueryClientProvider client={queryClient}>
      <TenantProvider>
        <ThemeProvider>
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
        </ThemeProvider>
      </TenantProvider>
    </QueryClientProvider>
  );
}

export default App;
