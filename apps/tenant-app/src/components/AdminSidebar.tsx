import React, { useState, useEffect } from 'react';
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
  ChevronDown,
  Edit,
  Menu,
  UserPlus,
  UserCog,
  Lock,
  Eye,
  Plus,
  List,
  Sparkles,
  FolderTree,
  DollarSign,
  Wallet,
  Layers,
  Paintbrush,
  Server,
  BellRing,
  FileText,
  Tags,
  BookTemplate,
  Globe,
  MessageCircle,
  Code
} from 'lucide-react';
import { User, hasPermission, hasFeatureAccess, storage, getRolePermission } from '@/lib/mockData';

interface AdminSidebarProps {
  currentPage?: string;
  onNavigate: (page: string, action?: string) => void;
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
  // State for expanded menu groups
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['dashboard']);

  // Toggle group expansion
  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  // Check login-as modes
  const originalSuperAdmin = storage.get('original_super_admin');
  const originalUser = storage.get('original_user');
  
  const isSuperAdminLoginMode = originalSuperAdmin && user?.role === 'org_admin';
  const isUserLoginMode = originalUser && originalUser.id !== user?.id;

  // Hierarchical menu structure with groups and sub-items
  const menuGroups = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      type: 'single',
      page: 'dashboard',
      requiredRoles: ['super_admin', 'org_admin', 'question_manager', 'account_officer', 'participant', 'inspector', 'moderator', 'practice_user'],
      requiredPermission: null,
      planFeature: null
    },
    {
      id: 'users',
      label: 'Users',
      icon: Users,
      type: 'group',
      requiredRoles: ['super_admin', 'org_admin', 'moderator'],
      requiredPermission: 'users.read',
      planFeature: null,
      children: [
        {
          id: 'user-management',
          label: 'All Users',
          icon: List,
          page: 'user-management',
          requiredRoles: ['super_admin', 'org_admin', 'moderator'],
          requiredPermission: 'users.read'
        },
        {
          id: 'user-add',
          label: 'Add User',
          icon: UserPlus,
          page: 'user-management',
          action: 'add',
          requiredRoles: ['super_admin', 'org_admin'],
          requiredPermission: 'users.create'
        },
        {
          id: 'role-management',
          label: 'Roles & Permissions',
          icon: Shield,
          page: 'role-management',
          requiredRoles: ['super_admin'],
          requiredPermission: 'roles.manage'
        },
        {
          id: 'role-customization',
          label: 'Customize Roles',
          icon: Shield,
          page: 'role-customization',
          badge: 'New',
          requiredRoles: ['super_admin', 'org_admin'],
          requiredPermission: 'roles.manage'
        },
        {
          id: 'role-component-management',
          label: 'Component Features',
          icon: Layers,
          page: 'role-component-management',
          badge: 'Advanced',
          requiredRoles: ['super_admin'],
          requiredPermission: 'system.configure'
        },
        {
          id: 'access-control',
          label: 'Access Control',
          icon: Lock,
          page: 'access-control',
          requiredRoles: ['super_admin', 'org_admin'],
          requiredPermission: 'users.read'
        }
      ]
    },
    {
      id: 'tournaments',
      label: 'Tournaments',
      icon: Trophy,
      type: 'group',
      requiredRoles: ['super_admin', 'org_admin', 'question_manager', 'inspector', 'moderator'],
      requiredPermission: 'tournaments.read',
      planFeature: null,
      children: [
        {
          id: 'tournaments-list',
          label: 'All Tournaments',
          icon: List,
          page: 'tournaments',
          requiredRoles: ['super_admin', 'org_admin', 'question_manager', 'inspector', 'moderator'],
          requiredPermission: 'tournaments.read'
        },
        {
          id: 'tournaments-create',
          label: 'Create Tournament',
          icon: Plus,
          page: 'tournaments',
          action: 'create',
          requiredRoles: ['super_admin', 'org_admin'],
          requiredPermission: 'tournaments.create'
        },
        {
          id: 'tournaments-settings',
          label: 'Settings',
          icon: Settings,
          page: 'tournaments',
          requiredRoles: ['super_admin', 'org_admin'],
          requiredPermission: 'tournaments.update'
        }
      ]
    },
    {
      id: 'questions',
      label: 'Questions',
      icon: BookOpen,
      type: 'group',
      requiredRoles: ['super_admin', 'org_admin', 'question_manager'],
      requiredPermission: 'questions.read',
      planFeature: null,
      children: [
        {
          id: 'question-bank',
          label: 'Question Bank',
          icon: BookOpen,
          page: 'question-bank',
          requiredRoles: ['super_admin', 'org_admin', 'question_manager'],
          requiredPermission: 'questions.read'
        },
        {
          id: 'question-add',
          label: 'Add Questions',
          icon: Plus,
          page: 'question-bank',
          action: 'add',
          requiredRoles: ['super_admin', 'org_admin', 'question_manager'],
          requiredPermission: 'questions.create'
        },
        {
          id: 'question-categories',
          label: 'Categories',
          icon: FolderTree,
          page: 'question-categories',
          requiredRoles: ['super_admin', 'org_admin', 'question_manager'],
          requiredPermission: 'questions.manage-categories'
        },
        {
          id: 'custom-categories',
          label: 'Custom Categories',
          icon: Tags,
          page: 'custom-categories',
          badge: 'Enterprise',
          requiredRoles: ['super_admin', 'org_admin', 'question_manager'],
          requiredPermission: 'questions.read',
          planFeature: 'tournaments.custom_categories'
        },
        {
          id: 'round-templates',
          label: 'Round Templates',
          icon: BookTemplate,
          page: 'round-templates',
          badge: 'Pro',
          requiredRoles: ['super_admin', 'org_admin', 'question_manager'],
          requiredPermission: 'questions.read',
          planFeature: 'tournaments.round_templates'
        },
        {
          id: 'ai-generator',
          label: 'AI Generator',
          icon: Sparkles,
          page: 'ai-generator',
          badge: 'AI',
          requiredRoles: ['super_admin', 'org_admin', 'question_manager'],
          requiredPermission: 'questions.create',
          planFeature: 'ai-generator'
        }
      ]
    },
    {
      id: 'finance',
      label: 'Finance',
      icon: DollarSign,
      type: 'group',
      requiredRoles: ['super_admin', 'org_admin', 'account_officer'],
      requiredPermission: 'payments.read',
      planFeature: null,
      children: [
        {
          id: 'payments',
          label: 'Payments',
          icon: Wallet,
          page: 'payments',
          requiredRoles: ['super_admin', 'org_admin', 'account_officer'],
          requiredPermission: 'payments.read'
        },
        {
          id: 'billing',
          label: 'Billing & Plans',
          icon: Receipt,
          page: 'billing',
          requiredRoles: ['super_admin', 'org_admin', 'account_officer'],
          requiredPermission: 'billing.read'
        },
        {
          id: 'payment-integration',
          label: 'Payment Integration',
          icon: CreditCard,
          page: 'payment-integration',
          badge: 'Config',
          requiredRoles: ['super_admin', 'org_admin'],
          requiredPermission: 'billing.read',
          planFeature: 'payment-integration'
        }
      ]
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      type: 'single',
      page: 'analytics',
      requiredRoles: ['super_admin', 'org_admin', 'account_officer', 'inspector', 'moderator'],
      requiredPermission: 'analytics.view',
      planFeature: 'analytics'
    },
    {
      id: 'system',
      label: 'System',
      icon: Settings,
      type: 'group',
      requiredRoles: ['super_admin', 'org_admin'],
      requiredPermission: null,
      planFeature: null,
      children: [
        {
          id: 'tenant-management',
          label: 'Tenants',
          icon: Building,
          page: 'tenant-management',
          requiredRoles: ['super_admin'],
          requiredPermission: 'tenant.manage'
        },
        {
          id: 'plan-management',
          label: 'Plans',
          icon: Layers,
          page: 'plan-management',
          requiredRoles: ['super_admin'],
          requiredPermission: 'tenant.manage'
        },
        {
          id: 'branding',
          label: 'Branding',
          icon: Paintbrush,
          page: 'branding',
          requiredRoles: ['super_admin', 'org_admin'],
          requiredPermission: 'branding.manage',
          planFeature: 'branding'
        },
        {
          id: 'theme-settings',
          label: 'Theme',
          icon: Palette,
          page: 'theme-settings',
          badge: 'New',
          requiredRoles: ['super_admin', 'org_admin'],
          requiredPermission: 'branding.manage',
          planFeature: 'branding'
        },
        {
          id: 'landing-page',
          label: 'Landing Page',
          icon: Globe,
          page: 'landing-page',
          badge: 'New',
          requiredRoles: ['super_admin', 'org_admin'],
          requiredPermission: 'settings.manage',
          planFeature: 'branding'
        },
        {
          id: 'system-settings',
          label: 'System Settings',
          icon: Server,
          page: 'system-settings',
          requiredRoles: ['super_admin'],
          requiredPermission: 'tenant.manage'
        },
        {
          id: 'security',
          label: 'Security Center',
          icon: Shield,
          page: 'security',
          badge: 'New',
          requiredRoles: ['super_admin'],
          requiredPermission: null
        },
        {
          id: 'subscription-management',
          label: 'Subscription',
          icon: CreditCard,
          page: 'subscription-management',
          badge: 'New',
          requiredRoles: ['super_admin', 'org_admin'],
          requiredPermission: null
        },
        {
          id: 'team-management',
          label: 'Team Management',
          icon: Users,
          page: 'team-management',
          badge: 'New',
          requiredRoles: ['super_admin', 'org_admin'],
          requiredPermission: null
        },
        {
          id: 'reporting-exports',
          label: 'Reports & Exports',
          icon: FileText,
          page: 'reporting-exports',
          badge: 'New',
          requiredRoles: ['super_admin', 'org_admin'],
          requiredPermission: null
        },
        {
          id: 'notifications',
          label: 'Notifications',
          icon: BellRing,
          page: 'notifications',
          requiredRoles: ['super_admin', 'org_admin'],
          requiredPermission: null
        },
        {
          id: 'email-templates',
          label: 'Email Templates',
          icon: FileText,
          page: 'email-templates',
          badge: 'New',
          requiredRoles: ['super_admin', 'org_admin'],
          requiredPermission: 'tenant.manage'
        },
        {
          id: 'terms',
          label: 'Terms of Service',
          icon: FileText,
          page: 'terms',
          requiredRoles: ['super_admin', 'org_admin'],
          requiredPermission: null
        },
        {
          id: 'privacy',
          label: 'Privacy Policy',
          icon: Shield,
          page: 'privacy',
          requiredRoles: ['super_admin', 'org_admin'],
          requiredPermission: null
        },
        {
          id: 'audit-logs',
          label: 'Audit Logs',
          icon: FileText,
          page: 'audit-logs',
          requiredRoles: ['super_admin', 'org_admin'],
          requiredPermission: null
        }
      ]
    },
    {
      id: 'help',
      label: 'Help & Support',
      icon: HelpCircle,
      type: 'single',
      page: 'help',
      requiredRoles: ['super_admin', 'org_admin', 'question_manager', 'account_officer', 'inspector'],
      requiredPermission: null,
      planFeature: null
    },
    {
      id: 'chat',
      label: 'Messages',
      icon: MessageCircle,
      type: 'single',
      page: 'chat',
      requiredRoles: ['super_admin', 'org_admin', 'question_manager', 'account_officer', 'inspector', 'moderator', 'participant', 'practice_user'],
      requiredPermission: 'chat.access',
      planFeature: null
    },
    {
      id: 'api-management',
      label: 'API Management',
      icon: Code,
      type: 'single',
      page: 'api-management',
      badge: 'New',
      requiredRoles: ['super_admin', 'org_admin', 'question_manager', 'account_officer'],
      requiredPermission: 'api.manage',
      planFeature: 'api-management'
    }
  ];

  // Auto-expand groups with active children when currentPage changes
  useEffect(() => {
    menuGroups.forEach((group: any) => {
      if (group.type === 'group' && group.children) {
        const hasActiveChild = group.children.some((child: any) => currentPage === child.page);
        if (hasActiveChild && !expandedGroups.includes(group.id)) {
          setExpandedGroups(prev => [...prev, group.id]);
        }
      }
    });
  }, [currentPage]);

  // Helper function to check if menu item/group should be visible
  const isItemVisible = (item: any) => {
    // Normalize user role to lowercase for comparison
    const normalizedUserRole = userRole?.toLowerCase();
    const normalizedRequiredRoles = item.requiredRoles.map((role: string) => role.toLowerCase());
    
    // Check if user role is allowed
    if (!normalizedRequiredRoles.includes(normalizedUserRole)) {
      return false;
    }
    
    // Check permission if required and user is available
    if (item.requiredPermission && user && !hasPermission(user, item.requiredPermission)) {
      return false;
    }
    
    // Check plan feature access
    if (item.planFeature && user && !hasFeatureAccess(user, item.planFeature)) {
      return false;
    }
    
    return true;
  };

  // Filter menu groups and their children
  const visibleMenuGroups = menuGroups.map(group => {
    if (group.type === 'single') {
      // Single items - check if visible
      return isItemVisible(group) ? group : null;
    } else {
      // Group items - filter children
      const visibleChildren = group.children?.filter(child => isItemVisible(child)) || [];
      
      // Only show group if it has visible children and user has access to the group
      if (visibleChildren.length > 0 && isItemVisible(group)) {
        return { ...group, children: visibleChildren };
      }
      return null;
    }
  }).filter(Boolean);

  return (
    <div className={cn(
      "bg-white border-r border-gray-200 flex flex-col transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        {!collapsed && (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Trophy className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-bold text-gray-900 truncate">Admin Panel</h2>
                <p className="text-xs text-gray-500 truncate">Management Console</p>
              </div>
            </div>
            {onToggleCollapse && (
              <Button
                size="sm"
                variant="outline"
                onClick={onToggleCollapse}
                className="h-8 w-8 p-0 hover:bg-gray-100 border-gray-300 flex-shrink-0"
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
        {visibleMenuGroups.map((group: any) => {
          const GroupIcon = group.icon;
          
          // Single menu item (no sub-items)
          if (group.type === 'single') {
            const isActive = currentPage === group.page;
            
            return (
              <Button
                key={group.id}
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start h-10",
                  isActive && "bg-blue-50 text-blue-700 border-blue-200",
                  collapsed && "justify-center px-2"
                )}
                onClick={() => onNavigate(group.page, (group as any).action)}
              >
                <GroupIcon className={cn("h-4 w-4", !collapsed && "mr-3")} />
                {!collapsed && (
                  <span className="flex-1 text-left">{group.label}</span>
                )}
              </Button>
            );
          }
          
          // Group menu item (with sub-items)
          const isExpanded = expandedGroups.includes(group.id);
          const hasActiveChild = group.children?.some((child: any) => currentPage === child.page);
          
          return (
            <div key={group.id} className="space-y-1">
              {/* Group Header */}
              <Button
                variant={hasActiveChild ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start h-10",
                  hasActiveChild && "bg-blue-50 text-blue-700",
                  collapsed && "justify-center px-2"
                )}
                onClick={() => !collapsed && toggleGroup(group.id)}
              >
                <GroupIcon className={cn("h-4 w-4", !collapsed && "mr-3")} />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left">{group.label}</span>
                    <ChevronDown 
                      className={cn(
                        "h-4 w-4 transition-transform",
                        isExpanded && "transform rotate-180"
                      )}
                    />
                  </>
                )}
              </Button>
              
              {/* Sub-items */}
              {!collapsed && isExpanded && group.children && (
                <div className="ml-4 space-y-1 border-l-2 border-gray-200 pl-2">
                  {group.children.map((child: any) => {
                    const ChildIcon = child.icon;
                    const isActive = currentPage === child.page;
                    
                    return (
                      <Button
                        key={child.id}
                        variant={isActive ? "secondary" : "ghost"}
                        size="sm"
                        className={cn(
                          "w-full justify-start h-9 text-sm",
                          isActive && "bg-blue-50 text-blue-700 border-blue-200"
                        )}
                        onClick={() => onNavigate(child.page, (child as any).action)}
                      >
                        <ChildIcon className="h-3.5 w-3.5 mr-2" />
                        <span className="flex-1 text-left">{child.label}</span>
                        {child.badge && (
                          <Badge 
                            variant="secondary" 
                            className="ml-auto text-xs px-1.5 py-0"
                          >
                            {child.badge}
                          </Badge>
                        )}
                      </Button>
                    );
                  })}
                </div>
              )}
            </div>
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