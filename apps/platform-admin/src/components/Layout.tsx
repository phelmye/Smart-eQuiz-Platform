import type { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  BarChart3, 
  Settings,
  LogOut,
  Menu,
  Globe,
  Image,
  ChevronDown,
  CreditCard,
  FileText,
  Headphones,
  FileBarChart,
  Activity,
  Code,
  Key,
  Wallet
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { GlobalSearch } from './GlobalSearch';
import { NotificationCenter } from './NotificationCenter';
import { QuickActionsToolbar } from './QuickActionsToolbar';
import { KeyboardShortcuts } from './KeyboardShortcuts';
import { SystemStatusIndicator } from './SystemStatusIndicator';
import { Breadcrumbs } from './Breadcrumbs';
import { Footer } from './Footer';
import { LanguageSwitcher } from './LanguageSwitcher';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Badge } from './ui/badge';

interface LayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Tenants', href: '/tenants', icon: Building2 },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Billing', href: '/billing', icon: CreditCard },
  { name: 'Payments', href: '/payments', icon: Wallet },
  { name: 'Support', href: '/support', icon: Headphones },
  { name: 'Audit Logs', href: '/audit-logs', icon: FileText },
  { name: 'Reports', href: '/reports', icon: FileBarChart },
  { name: 'System Health', href: '/system-health', icon: Activity },
  { name: 'API Docs', href: '/api-docs', icon: Code },
  { name: 'Marketing', href: '/marketing', icon: Globe },
  { name: 'API Keys', href: '/api-keys', icon: Key },
  { name: 'API Governance', href: '/api-governance', icon: Shield },
  { name: 'Media Library', href: '/media', icon: Image },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200">
        {/* Logo */}
        <div className="flex items-center gap-2 h-16 px-6 border-b border-gray-200">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
            S
          </div>
          <div>
            <h1 className="font-bold text-gray-900">Smart eQuiz</h1>
            <p className="text-xs text-gray-500">Platform Admin</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 px-3 py-2 w-full hover:bg-gray-50 rounded-lg transition-colors">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {user ? getInitials(user.name) : 'SA'}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.name || 'Super Admin'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.email || 'admin@smartequiz.com'}
                  </p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                  <Badge variant="secondary" className="w-fit mt-1">
                    {user?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                  </Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Content */}
      <div className="pl-64">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => {
                // TODO: Implement mobile menu toggle
                console.log('Toggle mobile menu');
              }}
              className="lg:hidden text-gray-500"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900">
              {navigation.find(item => item.href === location.pathname)?.name || 'Dashboard'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher variant="compact" />
            <SystemStatusIndicator />
            <GlobalSearch />
            <NotificationCenter />
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6 min-h-[calc(100vh-8rem)]">
          <Breadcrumbs />
          {children}
        </main>

        {/* Footer */}
        <Footer />
      </div>

      {/* Quick Actions Toolbar */}
      <QuickActionsToolbar />
      
      {/* Keyboard Shortcuts Helper */}
      <KeyboardShortcuts />
    </div>
  );
}
