import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Lock, Zap, Crown, CheckCircle2, ArrowRight } from 'lucide-react';

interface UpgradePromptProps {
  feature: string;
  requiredPlan: string;
  description?: string;
  benefits?: string[];
  size?: 'small' | 'medium' | 'large';
  inline?: boolean;
  onUpgrade?: () => void;
}

export const UpgradePrompt: React.FC<UpgradePromptProps> = ({
  feature,
  requiredPlan,
  description,
  benefits,
  size = 'medium',
  inline = false,
  onUpgrade
}) => {
  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      // Navigate to billing/plans page
      console.log('Navigating to upgrade page for:', requiredPlan);
      // TODO: Implement navigation
    }
  };

  // Inline version for smaller contexts
  if (inline) {
    return (
      <Alert className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <Lock className="h-4 w-4 text-purple-600" />
        <AlertDescription className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-purple-900">
              <strong>{feature}</strong> is available on the <strong>{requiredPlan}</strong> plan
            </span>
          </div>
          <Button size="sm" className="ml-4" onClick={handleUpgrade}>
            <Zap className="h-3 w-3 mr-1" />
            Upgrade
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Small version for cards
  if (size === 'small') {
    return (
      <div className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Lock className="h-4 w-4 text-purple-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-purple-900 text-sm mb-1">{feature}</h4>
            <p className="text-xs text-purple-700 mb-2">
              Available on <Badge variant="outline" className="text-purple-700 border-purple-300">{requiredPlan}</Badge>
            </p>
            <Button size="sm" className="w-full" onClick={handleUpgrade}>
              <Zap className="h-3 w-3 mr-1" />
              Upgrade Now
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Medium version (default)
  if (size === 'medium') {
    return (
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 via-blue-50 to-purple-50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Crown className="h-5 w-5 text-purple-600" />
            </div>
            <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-300">
              {requiredPlan} Feature
            </Badge>
          </div>
          <CardTitle className="text-xl text-purple-900">{feature}</CardTitle>
          {description && (
            <CardDescription className="text-purple-700">
              {description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {benefits && benefits.length > 0 && (
            <div className="mb-4 space-y-2">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>
          )}
          <Button className="w-full" size="lg" onClick={handleUpgrade}>
            <Zap className="h-4 w-4 mr-2" />
            Upgrade to {requiredPlan}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Large version for full-page locks
  return (
    <div className="min-h-[400px] flex items-center justify-center p-8">
      <Card className="max-w-2xl w-full border-2 border-purple-200 bg-gradient-to-br from-purple-50 via-blue-50 to-purple-50 shadow-xl">
        <CardHeader className="text-center pb-3">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl shadow-lg">
              <Crown className="h-12 w-12 text-white" />
            </div>
          </div>
          <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-300 mx-auto mb-3">
            {requiredPlan} Feature
          </Badge>
          <CardTitle className="text-3xl text-purple-900 mb-2">{feature}</CardTitle>
          {description && (
            <CardDescription className="text-lg text-purple-700">
              {description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {benefits && benefits.length > 0 && (
            <div className="mb-6 space-y-3 bg-white/50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">What you'll get:</h4>
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>
          )}
          <Button className="w-full" size="lg" onClick={handleUpgrade}>
            <Zap className="h-5 w-5 mr-2" />
            Upgrade to {requiredPlan}
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
          <p className="text-center text-sm text-gray-600 mt-4">
            Unlock powerful features to take your tournaments to the next level
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

// Specialized component for feature-locked sections
interface FeatureLockedSectionProps {
  feature: string;
  requiredPlan: string;
  children?: React.ReactNode;
  blur?: boolean;
}

export const FeatureLockedSection: React.FC<FeatureLockedSectionProps> = ({
  feature,
  requiredPlan,
  children,
  blur = true
}) => {
  return (
    <div className="relative">
      {children && (
        <div className={blur ? 'filter blur-sm opacity-50 pointer-events-none' : 'opacity-30 pointer-events-none'}>
          {children}
        </div>
      )}
      <div className="absolute inset-0 flex items-center justify-center">
        <UpgradePrompt 
          feature={feature}
          requiredPlan={requiredPlan}
          size="medium"
        />
      </div>
    </div>
  );
};
