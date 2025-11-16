import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Lock, AlertTriangle, Crown } from 'lucide-react';
import { 
  User, 
  STORAGE_KEYS, 
  storage
} from '@/lib/mockData';

interface RoleComponentFeatures {
  roleId: string;
  roleName: string;
  componentFeatures: string[];
}

interface ComponentAccessControlProps {
  user: User;
  componentId: string;
  featureId?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showAccessDenied?: boolean;
}

interface FeatureAccessControlProps {
  user: User;
  featureId: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

// Main component access control wrapper
export default function ComponentAccessControl({
  user,
  componentId,
  featureId,
  children,
  fallback,
  showAccessDenied = true
}: ComponentAccessControlProps) {
  // Super admin has access to everything
  if (user.role?.toLowerCase() === 'super_admin') {
    return <>{children}</>;
  }

  const hasAccess = checkComponentAccess(user, componentId, featureId);
  
  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showAccessDenied) {
    return null;
  }

  return (
    <AccessDeniedCard 
      componentId={componentId}
      featureId={featureId}
      userRole={user.role}
    />
  );
}

// Feature-level access control (more granular)
export function FeatureAccessControl({
  user,
  featureId,
  children,
  fallback
}: FeatureAccessControlProps) {
  // Super admin has access to everything
  if (user.role?.toLowerCase() === 'super_admin') {
    return <>{children}</>;
  }

  const hasAccess = checkFeatureAccess(user, featureId);
  
  if (hasAccess) {
    return <>{children}</>;
  }

  return fallback ? <>{fallback}</> : null;
}

// Hook for checking access in components
export function useComponentAccess(user: User, componentId: string, featureId?: string) {
  if (user.role === 'super_admin') {
    return { hasAccess: true, reason: 'super_admin' };
  }

  const hasAccess = checkComponentAccess(user, componentId, featureId);
  
  return {
    hasAccess,
    reason: hasAccess ? 'granted' : 'denied'
  };
}

// Hook for checking feature access
export function useFeatureAccess(user: User, featureId: string) {
  if (user.role === 'super_admin') {
    return { hasAccess: true, reason: 'super_admin' };
  }

  const hasAccess = checkFeatureAccess(user, featureId);
  
  return {
    hasAccess,
    reason: hasAccess ? 'granted' : 'denied'
  };
}

// Core access checking logic
function checkComponentAccess(user: User, componentId: string, featureId?: string): boolean {
  const roleFeatures = getRoleFeatures(user.role);
  
  if (!roleFeatures) {
    console.warn(`⚠️ No features found for role: ${user.role}. Available roles:`, 
      (storage.get(STORAGE_KEYS.ROLE_PERMISSIONS) || []).map((r: any) => r.roleName));
    
    // Fallback: ORG_ADMIN should have access to all features
    if (user.role?.toLowerCase() === 'org_admin') {
      console.log('✅ Granting access to ORG_ADMIN via fallback');
      return true;
    }
    return false;
  }

  // Wildcard check for super_admin
  if (roleFeatures.componentFeatures.includes('*')) {
    return true;
  }

  if (featureId) {
    // Check specific feature access
    const hasAccess = roleFeatures.componentFeatures.includes(featureId);
    if (!hasAccess && user.role?.toLowerCase() === 'org_admin') {
      console.warn(`⚠️ ORG_ADMIN missing feature: ${featureId}. Current features:`, roleFeatures.componentFeatures);
    }
    return hasAccess;
  }

  // Check if role has any features for this component
  const componentFeatureIds = getComponentFeatureIds(componentId);
  return componentFeatureIds.some(fId => roleFeatures.componentFeatures.includes(fId));
}

function checkFeatureAccess(user: User, featureId: string): boolean {
  const roleFeatures = getRoleFeatures(user.role);
  
  if (!roleFeatures) {
    return false;
  }

  return roleFeatures.componentFeatures.includes(featureId);
}

function getRoleFeatures(roleName: string): RoleComponentFeatures | null {
  const allRoleFeatures = storage.get(STORAGE_KEYS.ROLE_PERMISSIONS) || [];
  // Case-insensitive comparison to handle role name variations
  const normalizedRoleName = roleName?.toLowerCase();
  return allRoleFeatures.find(rf => rf.roleName?.toLowerCase() === normalizedRoleName) || null;
}

function getComponentFeatureIds(componentId: string): string[] {
  // This should match the COMPONENT_FEATURES from mockData.ts
  const componentFeatureMap: Record<string, string[]> = {
    'question-bank': [
      'view-questions',
      'create-questions', 
      'edit-questions',
      'delete-questions',
      'manage-categories',
      'bulk-import',
      'export-questions'
    ],
    'analytics': [
      'view-basic-analytics',
      'view-advanced-analytics',
      'export-reports',
      'real-time-analytics'
    ],
    'user-management': [
      'view-users',
      'create-users',
      'edit-users',
      'delete-users',
      'assign-roles',
      'login-as-user'
    ],
    'tournament-builder': [
      'view-tournaments',
      'create-tournaments',
      'edit-tournaments',
      'delete-tournaments',
      'advanced-settings'
    ],
    'branding-settings': [
      'view-branding',
      'edit-branding',
      'upload-assets',
      'custom-css'
    ],
    'tenant-management': [
      'view-tenants',
      'create-tenants',
      'edit-tenants',
      'delete-tenants',
      'login-as-tenant'
    ],
    'system-settings': [
      'view-settings',
      'edit-settings',
      'manage-integrations'
    ]
  };

  return componentFeatureMap[componentId] || [];
}

// Access denied component
function AccessDeniedCard({ 
  componentId, 
  featureId, 
  userRole 
}: { 
  componentId: string;
  featureId?: string;
  userRole: string;
}) {
  const componentNames: Record<string, string> = {
    'question-bank': 'Question Bank',
    'analytics': 'Analytics',
    'user-management': 'User Management',
    'tournament-builder': 'Tournament Builder',
    'branding-settings': 'Branding Settings',
    'tenant-management': 'Tenant Management',
    'system-settings': 'System Settings'
  };

  const componentName = componentNames[componentId] || 'Component';
  const roleDisplayName = userRole.replace('_', ' ').toUpperCase();

  return (
    <div className="flex items-center justify-center min-h-[400px] p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-red-100 rounded-full w-fit">
            <Lock className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">
            Access Restricted
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div>
            <p className="text-gray-600 mb-2">
              Your role <Badge variant="outline" className="mx-1">{roleDisplayName}</Badge> 
              doesn't have access to {featureId ? 'this feature' : componentName}.
            </p>
            {featureId && (
              <p className="text-sm text-gray-500">
                Feature: <code className="bg-gray-100 px-1 py-0.5 rounded">{featureId}</code>
              </p>
            )}
          </div>

          <Alert className="text-left">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Contact your administrator to request access to this {featureId ? 'feature' : 'component'}. 
              They can configure role permissions to grant you the necessary access.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => window.history.back()}
            >
              Go Back
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                const message = `Hi, I need access to ${componentName}${featureId ? ` (${featureId})` : ''}. My current role is ${roleDisplayName}.`;
                window.alert(`Contact your administrator with this message:\n\n${message}`);
              }}
            >
              Request Access
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Convenience components for common access patterns
export function AdminOnly({ 
  user, 
  children, 
  fallback 
}: { 
  user: User; 
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  if (['super_admin', 'org_admin'].includes(user.role)) {
    return <>{children}</>;
  }
  return fallback ? <>{fallback}</> : null;
}

export function SuperAdminOnly({ 
  user, 
  children, 
  fallback 
}: { 
  user: User; 
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  if (user.role === 'super_admin') {
    return <>{children}</>;
  }
  return fallback ? <>{fallback}</> : null;
}

export function RoleBasedComponent({
  user,
  allowedRoles,
  children,
  fallback
}: {
  user: User;
  allowedRoles: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  if (allowedRoles.includes(user.role)) {
    return <>{children}</>;
  }
  return fallback ? <>{fallback}</> : null;
}

// Badge component for showing access status
export function AccessBadge({ 
  user, 
  featureId, 
  className = "" 
}: { 
  user: User;
  featureId: string;
  className?: string;
}) {
  if (user.role === 'super_admin') {
    return (
      <Badge variant="secondary" className={`bg-purple-100 text-purple-800 ${className}`}>
        <Crown className="w-3 h-3 mr-1" />
        Full Access
      </Badge>
    );
  }

  const hasAccess = checkFeatureAccess(user, featureId);
  
  return (
    <Badge 
      variant={hasAccess ? "secondary" : "destructive"}
      className={`${hasAccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} ${className}`}
    >
      {hasAccess ? (
        <>
          <Shield className="w-3 h-3 mr-1" />
          Granted
        </>
      ) : (
        <>
          <Lock className="w-3 h-3 mr-1" />
          Denied
        </>
      )}
    </Badge>
  );
}