import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, Check, ArrowRight, Crown, HelpCircle } from 'lucide-react';
import { FeatureDisplayInfo } from '@/lib/mockData';

interface FeaturePreviewOverlayProps {
  featureInfo: FeatureDisplayInfo;
  onUpgrade: () => void;
  children: React.ReactNode;
  blur?: boolean;
}

export const FeaturePreviewOverlay: React.FC<FeaturePreviewOverlayProps> = ({
  featureInfo,
  onUpgrade,
  children,
  blur = true
}) => {
  return (
    <div className="relative min-h-screen">
      {/* Background content - blurred/greyed out */}
      <div className={`${blur ? 'blur-sm' : ''} opacity-40 pointer-events-none select-none`}>
        {children}
      </div>

      {/* Overlay with upgrade CTA */}
      <div className="absolute inset-0 flex items-center justify-center p-6 bg-gradient-to-br from-blue-50/95 via-purple-50/95 to-pink-50/95">
        <Card className="max-w-2xl w-full shadow-2xl border-2 border-blue-200">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Lock className="w-10 h-10 text-white" />
              </div>
            </div>
            
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {featureInfo.featureName}
            </CardTitle>
            
            <CardDescription className="text-lg mt-2">
              Unlock this powerful feature to take your platform to the next level
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Current vs Required Plan */}
            <div className="flex items-center justify-center gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">Current Plan</p>
                <Badge variant="outline" className="text-base px-4 py-1">
                  {featureInfo.currentPlan}
                </Badge>
              </div>
              
              <ArrowRight className="w-6 h-6 text-gray-400" />
              
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">Required Plan</p>
                <Badge className="text-base px-4 py-1 bg-gradient-to-r from-blue-600 to-purple-600">
                  <Crown className="w-4 h-4 mr-1 inline" />
                  {featureInfo.requiredPlan}
                </Badge>
              </div>
            </div>

            {/* Benefits List */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Check className="w-5 h-5 text-green-500 mr-2" />
                What you'll unlock:
              </h4>
              <ul className="space-y-3">
                {featureInfo.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start text-gray-700">
                    <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Upgrade Button */}
            <Button
              onClick={onUpgrade}
              size="lg"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-6 text-lg"
            >
              <Crown className="w-5 h-5 mr-2" />
              Upgrade to {featureInfo.requiredPlan}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            {/* Help Text */}
            <Alert className="bg-blue-50 border-blue-200">
              <HelpCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-sm text-blue-800">
                <strong>Need help choosing?</strong> Contact your administrator or our support team to discuss which plan is right for your organization.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FeaturePreviewOverlay;
