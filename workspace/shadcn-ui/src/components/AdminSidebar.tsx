import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  CreditCard, 
  Receipt,
  Palette, 
  HelpCircle, 
  BookOpen, 
  Trophy, 
  Zap, 
  Building, 
  Settings, 
  Shield, 
  Bell,
  ChevronLeft,
  ChevronRight,
  Edit,
  Menu
} from 'lucide-react';
import { User, hasPermission, hasFeatureAccess, storage, getRolePermission } from '@/lib/mockData';

interface AdminSidebarProps {
  currentPage?: string;
  onNavigate: (page: string) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  userRole?: string;
  user?: User;
  onLogoutFromTenant?: () => void;
  onLogoutFromUser?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ 
  currentPage = 'dashboard', 
  onNavigate, 
  collapsed = false,
  onToggleCollapse,
  userRole = 'org_admin',
  onLogoutFromTenant,
  onLogoutFromUser,
  user
}) => {
  // Check login-as modes
  const originalSuperAdmin = storage.get('original_super_admin');
  const originalUser = storage.get('original_user');
  
  const isSuperAdminLoginMode = originalSuperAdmin && user?.role === 'org_admin';
  const isUserLoginMode = originalUser && originalUser.id !== user?.id;

  const allMenuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
      requiredRoles: ['super_admin', 'org_admin', 'question_manager', 'account_officer', 'participant', 'inspector', 'practice_user'],
      requiredPermission: null,
      planFeature: null
    },
    {
      id: 'user-management',
      label: 'User Management',
      icon: Users,
      badge: null,
      requiredRoles: ['super_admin', 'org_admin'],
      requiredPermission: 'users.read',
      planFeature: null
    },
    {
      id: 'role-management',
      label: 'Role Management',
      icon: Shield,
      badge: null,
      requiredRoles: ['super_admin'], // Only super_admin can manage roles
      requiredPermission: 'roles.manage',
      planFeature: null
    },
    {
      id: 'role-component-management',
      label: 'Role Component Features',
      icon: Settings,
      badge: 'Advanced',
      requiredRoles: ['super_admin'], // Only super_admin can configure component features
      requiredPermission: 'system.configure',
      planFeature: null
    },
    {
      id: 'tenant-management',
      label: 'Tenant Management',
      icon: Building,
      badge: null,
      requiredRoles: ['super_admin'],
      requiredPermission: 'tenant.manage',
      planFeature: null
    },
    {
      id: 'tournaments',
      label: 'Tournaments',
      icon: Trophy,
      badge: null,
      requiredRoles: ['super_admin', 'org_admin', 'question_manager', 'inspector'],
      requiredPermission: 'tournaments.read',
      planFeature: null
    },
    {
      id: 'question-bank',
      label: 'Questions',
      icon: BookOpen,
      badge: null,
      requiredRoles: ['super_admin', 'org_admin', 'question_manager'],
      requiredPermission: 'questions.read',
      planFeature: null
    },
    {
      id: 'ai-generator',
      label: 'AI Generator',
      icon: Zap,
      badge: 'AI',
      requiredRoles: ['super_admin', 'org_admin', 'question_manager'],
      requiredPermission: 'questions.create',
      planFeature: 'ai-generator'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      badge: null,
      requiredRoles: ['super_admin', 'org_admin', 'account_officer', 'inspector'],
      requiredPermission: 'analytics.view',
      planFeature: 'analytics'
    },
    {
      id: 'payments',
      label: 'Payments',
      icon: CreditCard,
      badge: null,
      requiredRoles: ['super_admin', 'org_admin', 'account_officer'],
      requiredPermission: 'payments.read',
      planFeature: null
    },
    {
      id: 'billing',
      label: 'Billing & Plans',
      icon: Receipt,
      badge: null,
      requiredRoles: ['super_admin', 'org_admin', 'account_officer'],
      requiredPermission: 'billing.read',
      planFeature: null
    },
    {
      id: 'payment-integration',
      label: 'Payment Integration',
      icon: Settings,
      badge: 'Config',
      requiredRoles: ['super_admin', 'org_admin'],
      requiredPermission: 'billing.read',
      planFeature: 'payment-integration'
    },
    {
      id: 'branding',
      label: 'Branding',
      icon: Palette,
      badge: 'New',
      requiredRoles: ['super_admin', 'org_admin'],
      requiredPermission: 'branding.manage',
      planFeature: 'branding'
    },
    {
      id: 'plan-management',
      label: 'Plans',
      icon: CreditCard,
      badge: 'New',
      requiredRoles: ['super_admin'], // Only super_admin can manage plans
      requiredPermission: 'tenant.manage',
      planFeature: null
    },
    {
      id: 'system-settings',
      label: 'System',
      icon: Settings,
      badge: null,
      requiredRoles: ['super_admin'], // Keep global system settings for super_admin only
      requiredPermission: 'tenant.manage',
      planFeature: null
    },
    {
      id: 'security',
      label: 'Security',
      icon: Shield,
      badge: null,
      requiredRoles: ['super_admin'], // Only super_admin can access security settings
      requiredPermission: 'tenant.manage',
      planFeature: null
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      badge: null,
      requiredRoles: ['super_admin', 'org_admin'],
      requiredPermission: null,
      planFeature: null
    },
    {
      id: 'audit-logs',
      label: 'Audit Logs',
      icon: Shield,
      badge: null,
      requiredRoles: ['super_admin', 'org_admin'],
      requiredPermission: null,
      planFeature: null
    },
    {
      id: 'help',
      label: 'Help & Support',
      icon: HelpCircle,
      badge: null,
      requiredRoles: ['super_admin', 'org_admin', 'question_manager', 'account_officer', 'inspector'],
      requiredPermission: null,
      planFeature: null
    }
  ];

  // Filter menu items based on user role, permissions, and plan features
  const visibleMenuItems = allMenuItems.filter((item: any) => {
    // Check if user role is allowed
    if (!item.requiredRoles.includes(userRole)) {
      return false;
    }
    
    // Check permission if required and user is available
    if (item.requiredPermission && user && !hasPermission(user, item.requiredPermission)) {
      return false;
    }
    
    // Check plan feature access for org_admin (super_admin bypasses plan restrictions)
    if (item.planFeature && user && user.role === 'org_admin' && !hasFeatureAccess(user, item.planFeature)) {
      return false;
    }
    
    return true;
  });

  // Use the filtered menu items
  const menuItems = visibleMenuItems;

  return (
    <div className={cn(
      "bg-white border-r border-gray-200 flex flex-col transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        {!collapsed && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Trophy className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900">Admin Panel</h2>
                <p className="text-xs text-gray-500">Management Console</p>
              </div>
            </div>
            {onToggleCollapse && (
              <Button
                size="sm"
                variant="outline"
                onClick={onToggleCollapse}
                className="h-8 w-8 p-0 hover:bg-gray-100 border-gray-300"
                title="Toggle sidebar"
              >
                <Menu className="h-4 w-4 text-gray-700" />
              </Button>
            )}
          </div>
        )}
        {collapsed && (
          <div className="flex flex-col items-center space-y-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Trophy className="h-5 w-5 text-white" />
            </div>
            {onToggleCollapse && (
              <Button
                size="sm"
                variant="outline"
                onClick={onToggleCollapse}
                className="h-8 w-8 p-0 hover:bg-gray-100 border-gray-300"
                title="Toggle sidebar"
              >
                <Menu className="h-4 w-4 text-gray-700" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Login As Banners */}
      {(isSuperAdminLoginMode || isUserLoginMode) && !collapsed && (
        <div className="bg-yellow-50 border-b border-yellow-200 p-3 space-y-2">
          {/* Super Admin Login-As Banner */}
          {isSuperAdminLoginMode && (
            <div className="flex items-center gap-2 text-yellow-800">
              <Shield className="w-4 h-4" />
              <div className="flex-1">
                <div className="text-xs font-medium">Super Admin → Tenant:</div>
                <div className="text-sm font-semibold">{user?.name}</div>
              </div>
            </div>
          )}
          
          {/* User Login-As Banner */}
          {isUserLoginMode && (
            <div className="flex items-center gap-2 text-blue-800 bg-blue-50 p-2 rounded">
              <Users className="w-4 h-4" />
              <div className="flex-1">
                <div className="text-xs font-medium">Logged in as:</div>
                <div className="text-sm font-semibold">
                  {user?.name} ({getRolePermission(user?.role || '')?.roleName})
                </div>
              </div>
            </div>
          )}
          
          {/* Logout Buttons */}
          <div className="space-y-1">
            {isUserLoginMode && onLogoutFromUser && (
              <Button
                size="sm"
                variant="outline"
                onClick={onLogoutFromUser}
                className="w-full text-xs flex items-center gap-1 border-blue-300 hover:bg-blue-100"
              >
                <ChevronLeft className="w-3 h-3" />
                Return to {originalUser?.name}
              </Button>
            )}
            
            {isSuperAdminLoginMode && onLogoutFromTenant && (
              <Button
                size="sm"
                variant="outline"
                onClick={onLogoutFromTenant}
                className="w-full text-xs flex items-center gap-1 border-yellow-300 hover:bg-yellow-100"
              >
                <ChevronLeft className="w-3 h-3" />
                Return to Super Admin
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start h-10",
                isActive && "bg-blue-50 text-blue-700 border-blue-200",
                collapsed && "justify-center px-2"
              )}
              onClick={() => onNavigate(item.id)}
            >
              <Icon className={cn("h-4 w-4", !collapsed && "mr-3")} />
              {!collapsed && (
                <>
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <Badge 
                      variant={item.badge === 'New' ? 'default' : 'secondary'} 
                      className="text-xs"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </>
              )}
            </Button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        {!collapsed && (
          <div className="text-xs text-gray-500 space-y-1">
            <p>Smart eQuiz Platform</p>
            <p>Admin Console v1.0</p>
          </div>
        )}
      </div>
    </div>
  );
};