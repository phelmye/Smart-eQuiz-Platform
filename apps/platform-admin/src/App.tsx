import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Tenants from './pages/Tenants';
import Users from './pages/Users';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Media from './pages/Media';
import Billing from './pages/Billing';
import PaymentIntegration from './pages/PaymentIntegration';
import AuditLogs from './pages/AuditLogs';
import SupportTickets from './pages/SupportTickets';
import Reports from './pages/Reports';
import SystemHealth from './pages/SystemHealth';
import ApiDocumentation from './pages/ApiDocumentation';
import MarketingManagement from './pages/MarketingManagement';
import ApiKeys from './pages/ApiKeys';
import { Toaster } from './components/ui/toaster';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/tenants" element={<Tenants />} />
                    <Route path="/users" element={<Users />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/billing" element={<Billing />} />
                    <Route path="/payments" element={<PaymentIntegration />} />
                    <Route path="/support" element={<SupportTickets />} />
                    <Route path="/audit-logs" element={<AuditLogs />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/system-health" element={<SystemHealth />} />
                    <Route path="/api-docs" element={<ApiDocumentation />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/marketing" element={<MarketingManagement />} />
                    <Route path="/api-keys" element={<ApiKeys />} />
                    <Route path="/media" element={<Media />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
      <Toaster />
    </BrowserRouter>
  );
}

