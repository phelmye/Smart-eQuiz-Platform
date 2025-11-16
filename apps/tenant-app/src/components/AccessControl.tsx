import React from 'react';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, canAccessPage, hasPermission } from '@/lib/mockData';

interface AccessControlProps {
  user: User;
  requiredPage?: string;
  requiredPermission?: string;
  children: React.ReactNode;
  fallbackMessage?: string;
  onGoBack?: () => void;
}

export default function AccessControl({ 
  user, 
  requiredPage, 
  requiredPermission, 
  children, 
  fallbackMessage,
  onGoBack 
}: AccessControlProps) {
  // Check page access
  const hasPageAccess = requiredPage ? canAccessPage(user, requiredPage) : true;
  
  // Check permission access
  const hasRequiredPermission = requiredPermission ? hasPermission(user, requiredPermission) : true;
  
  // If user has access, render children
  if (hasPageAccess && hasRequiredPermission) {
    return <>{children}</>;
  }
  
  // Render access denied message
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">
            Access Denied
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              {fallbackMessage || 
                "You don't have permission to access this page or perform this action."
              }
            </p>
            
            <div className="bg-gray-50 p-3 rounded-lg text-sm">
              <div className="font-medium text-gray-700 mb-2">Your Current Access:</div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Role:</span>
                  <span className="font-medium capitalize">{user.role.replace('_', ' ')}</span>
                </div>
                {requiredPage && (
                  <div className="flex justify-between">
                    <span>Page Access:</span>
                    <span className={hasPageAccess ? "text-green-600" : "text-red-600"}>
                      {hasPageAccess ? "✓ Allowed" : "✗ Denied"}
                    </span>
                  </div>
                )}
                {requiredPermission && (
                  <div className="flex justify-between">
                    <span>Permission:</span>
                    <span className={hasRequiredPermission ? "text-green-600" : "text-red-600"}>
                      {hasRequiredPermission ? "✓ Granted" : "✗ Missing"}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <p className="text-sm text-gray-500 mt-4">
              Please contact your organization administrator if you believe you should have access to this resource.
            </p>
          </div>
          
          <div className="flex gap-2">
            {onGoBack && (
              <Button 
                onClick={onGoBack}
                className="flex-1 flex items-center gap-2"
                variant="outline"
              >
                <ArrowLeft className="w-4 h-4" />
                Go Back
              </Button>
            )}
            <Button 
              onClick={() => window.history.back()}
              className="flex-1"
            >
              Return to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}