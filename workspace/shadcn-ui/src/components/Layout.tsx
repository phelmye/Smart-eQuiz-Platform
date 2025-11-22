import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Menu, X } from 'lucide-react';
import { AdminSidebar } from './AdminSidebar';
import { useAuth } from './AuthSystem';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  breadcrumb?: Array<{ label: string; onClick?: () => void }>;
  onBack?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  title, 
  breadcrumb = [], 
  onBack 
}) => {
  const { user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);

  // Check if user has admin or management role (should see sidebar)
  const isAdmin = user?.role && ['super_admin', 'org_admin', 'question_manager', 'account_officer', 'inspector', 'moderator'].includes(user.role);

  if (!user) return null;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      {isAdmin && sidebarVisible && (
        <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} transition-all duration-300 ease-in-out`}>
          <AdminSidebar 
            onNavigate={(page) => {
              // This will be handled by parent components
              console.log('Navigate to:', page);
            }}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left Section - Menu Toggle, Back Button, Breadcrumb */}
            <div className="flex items-center space-x-4">
              {/* Mobile Menu Toggle */}
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarVisible(!sidebarVisible)}
                  className="md:hidden"
                >
                  {sidebarVisible ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              )}

              {/* Desktop Sidebar Toggle */}
              {isAdmin && sidebarVisible && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="hidden md:flex"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              )}

              {/* Back Button */}
              {onBack && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBack}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Back</span>
                </Button>
              )}

              {/* Breadcrumb */}
              <nav className="flex items-center space-x-2 text-sm">
                {breadcrumb.map((item, index) => (
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
                {breadcrumb.length === 0 && (
                  <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
                )}
              </nav>
            </div>

            {/* Right Section - User Info */}
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{user.name}</span>
                <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {user.role.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};