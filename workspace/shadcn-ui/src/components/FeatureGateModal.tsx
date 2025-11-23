import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  Crown, 
  Zap, 
  TrendingUp, 
  Lock,
  Check,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface FeatureGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName: string;
  featureDescription: string;
  requiredPlan: 'starter' | 'professional' | 'enterprise';
  currentPlan: 'free' | 'starter' | 'professional' | 'enterprise';
  onUpgrade?: () => void;
}

const PLAN_HIERARCHY = {
  free: 0,
  starter: 1,
  professional: 2,
  enterprise: 3
};

const PLAN_DETAILS = {
  starter: {
    name: 'Starter',
    price: 29,
    icon: Zap,
    color: 'blue',
    features: [
      '100 questions',
      'Basic tournaments',
      'Email support',
      'Custom branding'
    ]
  },
  professional: {
    name: 'Professional',
    price: 79,
    icon: TrendingUp,
    color: 'purple',
    features: [
      'Unlimited questions',
      'Advanced tournaments',
      'Priority support',
      'Advanced analytics',
      'API access'
    ]
  },
  enterprise: {
    name: 'Enterprise',
    price: 199,
    icon: Crown,
    color: 'yellow',
    features: [
      'Everything in Professional',
      'Dedicated support',
      'Custom integrations',
      'SLA guarantee',
      'Multi-tenant management'
    ]
  }
};

export const FeatureGateModal: React.FC<FeatureGateModalProps> = ({
  isOpen,
  onClose,
  featureName,
  featureDescription,
  requiredPlan,
  currentPlan,
  onUpgrade
}) => {
  if (!isOpen) return null;

  const planDetails = PLAN_DETAILS[requiredPlan];
  const Icon = planDetails.icon;
  const isUpgradeAvailable = PLAN_HIERARCHY[currentPlan] < PLAN_HIERARCHY[requiredPlan];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-lg w-full relative">
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-4 top-4"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>

        <CardHeader className="pb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className={`h-12 w-12 bg-${planDetails.color}-100 rounded-lg flex items-center justify-center`}>
              <Lock className={`h-6 w-6 text-${planDetails.color}-600`} />
            </div>
            <div>
              <CardTitle className="text-xl">{featureName}</CardTitle>
              <CardDescription>Premium Feature</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Feature Description */}
          <div className="bg-gray-50 rounded-lg p-4 border">
            <p className="text-sm text-gray-700">{featureDescription}</p>
          </div>

          {/* Required Plan */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Icon className={`h-5 w-5 text-${planDetails.color}-600`} />
              <h3 className="font-semibold">
                Available in {planDetails.name} Plan
              </h3>
              <Badge variant="secondary" className="ml-auto">
                ${planDetails.price}/mo
              </Badge>
            </div>

            <ul className="space-y-2">
              {planDetails.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA Section */}
          <div className="space-y-3 pt-2">
            {isUpgradeAvailable ? (
              <>
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={onUpgrade}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Upgrade to {planDetails.name}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <p className="text-xs text-center text-gray-500">
                  Unlock this feature and more. Cancel anytime.
                </p>
              </>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-900 text-center">
                  <Check className="inline h-4 w-4 mr-1" />
                  You already have access to this feature!
                </p>
              </div>
            )}
          </div>

          {/* Comparison Link */}
          <div className="text-center pt-2">
            <button 
              className="text-sm text-blue-600 hover:underline"
              onClick={() => {
                onClose();
                // Navigate to pricing page
                window.location.hash = '#pricing';
              }}
            >
              Compare all plans →
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeatureGateModal;
