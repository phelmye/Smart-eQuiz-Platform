import React from 'react';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Shield, CreditCard, AlertTriangle, Settings } from 'lucide-react';
import { useAuth } from './AuthSystem';
import { canUsePaymentFeature, getPaymentIntegrationStatus } from '../lib/mockData';

interface PaymentGateProps {
  children: React.ReactNode;
  feature: 'tournaments' | 'rewards' | 'cashout' | 'scoreExchange';
  fallbackTitle?: string;
  fallbackDescription?: string;
  onConfigurePayments?: () => void;
}

export const PaymentGate: React.FC<PaymentGateProps> = ({
  children,
  feature,
  fallbackTitle,
  fallbackDescription,
  onConfigurePayments
}) => {
  const { user } = useAuth();
  
  if (!user?.tenantId) {
    return null;
  }

  const canUse = canUsePaymentFeature(user.tenantId, feature);
  const status = getPaymentIntegrationStatus(user.tenantId);

  if (canUse) {
    return <>{children}</>;
  }

  // Determine the specific issue and show appropriate message
  const getStatusMessage = () => {
    if (!status.tenantEnabled) {
      return {
        title: 'Payment Integration Disabled',
        description: 'Payment features are currently disabled for your organization. Please contact your administrator to enable payment integration.',
        icon: <Shield className="h-8 w-8 text-gray-400" />,
        showConfigButton: user.role === 'org_admin' || user.role === 'super_admin'
      };
    }

    if (!status.hasIntegration || !status.isConfigured) {
      return {
        title: 'Payment Integration Not Configured',
        description: 'Payment processing is not set up for your organization. Configure a payment provider to enable monetary features.',
        icon: <CreditCard className="h-8 w-8 text-orange-400" />,
        showConfigButton: user.role === 'org_admin' || user.role === 'super_admin'
      };
    }

    if (!status.isEnabled) {
      return {
        title: 'Payment Integration Disabled',
        description: 'Payment processing is configured but currently disabled. Please enable it in the payment integration settings.',
        icon: <AlertTriangle className="h-8 w-8 text-yellow-400" />,
        showConfigButton: user.role === 'org_admin' || user.role === 'super_admin'
      };
    }

    return {
      title: 'Feature Not Available',
      description: `The ${feature} feature is not enabled for your payment integration. Please check your payment integration settings.`,
      icon: <Settings className="h-8 w-8 text-gray-400" />,
      showConfigButton: user.role === 'org_admin' || user.role === 'super_admin'
    };
  };

  const statusMessage = getStatusMessage();

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          {statusMessage.icon}
        </div>
        <CardTitle>{fallbackTitle || statusMessage.title}</CardTitle>
        <CardDescription>
          {fallbackDescription || statusMessage.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {status.provider && (
          <div className="text-center text-sm text-gray-500">
            Current provider: <span className="font-medium capitalize">{status.provider}</span>
          </div>
        )}
        
        {statusMessage.showConfigButton && onConfigurePayments && (
          <Button onClick={onConfigurePayments} className="w-full">
            <Settings className="h-4 w-4 mr-2" />
            Configure Payment Integration
          </Button>
        )}
        
        {!statusMessage.showConfigButton && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Contact your administrator to enable payment features for your organization.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentGate;