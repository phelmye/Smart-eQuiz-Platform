import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { CheckCircle, CreditCard, Calendar, TrendingUp } from 'lucide-react';
import { Plan, TenantBilling, calculateYearlyPrice, calculateYearlyDiscount, formatCurrency } from '../lib/mockData';

interface BillingSelectionProps {
  availablePlans: Plan[];
  currentSubscription?: TenantBilling;
  onSelectPlan: (planId: string, billingCycle: 'monthly' | 'yearly') => void;
  onUpgrade?: (planId: string, billingCycle: 'monthly' | 'yearly') => void;
  onDowngrade?: (planId: string, billingCycle: 'monthly' | 'yearly') => void;
}

export const BillingSelection: React.FC<BillingSelectionProps> = ({
  availablePlans,
  currentSubscription,
  onSelectPlan,
  onUpgrade,
  onDowngrade
}) => {
  const [selectedBillingCycle, setSelectedBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const getPlanPrice = (plan: Plan, cycle: 'monthly' | 'yearly') => {
    if (plan.monthlyPrice === 0) return 0;
    return cycle === 'monthly' 
      ? plan.monthlyPrice 
      : calculateYearlyPrice(plan.monthlyPrice, plan.yearlyDiscountPercent);
  };

  const getPlanSavings = (plan: Plan) => {
    if (plan.monthlyPrice === 0 || plan.yearlyDiscountPercent === 0) return null;
    return calculateYearlyDiscount(plan.monthlyPrice, plan.yearlyDiscountPercent);
  };

  const isCurrentPlan = (planId: string) => {
    return currentSubscription?.planId === planId;
  };

  const canChangeBilling = (plan: Plan) => {
    return plan.billingOptions.length > 1;
  };

  const renderPlanFeatures = (plan: Plan) => {
    const features = [];
    
    if (plan.maxUsers === -1) {
      features.push('Unlimited users');
    } else {
      features.push(`Up to ${plan.maxUsers} users`);
    }
    
    if (plan.maxTournaments === -1) {
      features.push('Unlimited tournaments');
    } else {
      features.push(`${plan.maxTournaments} tournaments per year`);
    }
    
    if (plan.maxQuestionsPerTournament === -1) {
      features.push('Unlimited questions per tournament');
    } else {
      features.push(`${plan.maxQuestionsPerTournament} questions per tournament`);
    }

    return features;
  };

  const getActionButton = (plan: Plan) => {
    if (!currentSubscription) {
      return (
        <Button 
          onClick={() => onSelectPlan(plan.id, selectedBillingCycle)}
          className="w-full"
        >
          Get Started
        </Button>
      );
    }

    if (isCurrentPlan(plan.id)) {
      return (
        <Button variant="outline" className="w-full" disabled>
          <CheckCircle className="h-4 w-4 mr-2" />
          Current Plan
        </Button>
      );
    }

    // Determine if this is an upgrade or downgrade based on price
    const currentPlan = availablePlans.find(p => p.id === currentSubscription.planId);
    const currentPrice = currentPlan ? getPlanPrice(currentPlan, currentSubscription.billingCycle) : 0;
    const newPrice = getPlanPrice(plan, selectedBillingCycle);
    
    const isUpgrade = newPrice > currentPrice;

    return (
      <Button 
        onClick={() => isUpgrade 
          ? onUpgrade?.(plan.id, selectedBillingCycle)
          : onDowngrade?.(plan.id, selectedBillingCycle)
        }
        className="w-full"
        variant={isUpgrade ? "default" : "secondary"}
      >
        {isUpgrade ? 'Upgrade' : 'Downgrade'} to {plan.displayName}
      </Button>
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Choose Your Plan</h2>
        <p className="text-muted-foreground">
          Select the perfect plan for your organization's needs
        </p>
      </div>

      {/* Billing Cycle Toggle */}
      <div className="flex items-center justify-center space-x-4 p-4 bg-muted/50 rounded-lg">
        <Label htmlFor="billing-toggle" className="text-sm font-medium">
          Monthly
        </Label>
        <Switch
          id="billing-toggle"
          checked={selectedBillingCycle === 'yearly'}
          onCheckedChange={(checked) => 
            setSelectedBillingCycle(checked ? 'yearly' : 'monthly')
          }
        />
        <Label htmlFor="billing-toggle" className="text-sm font-medium">
          Yearly
        </Label>
        {selectedBillingCycle === 'yearly' && (
          <Badge variant="secondary" className="ml-2">
            <TrendingUp className="h-3 w-3 mr-1" />
            Save up to {Math.max(...availablePlans.map(p => p.yearlyDiscountPercent))}%
          </Badge>
        )}
      </div>

      {/* Plans Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {availablePlans.map((plan) => {
          const currentPrice = getPlanPrice(plan, selectedBillingCycle);
          const savings = getPlanSavings(plan);
          const features = renderPlanFeatures(plan);
          const isPopular = plan.name.toLowerCase() === 'pro';
          const isCurrent = isCurrentPlan(plan.id);
          const canBill = plan.billingOptions.includes(selectedBillingCycle);

          return (
            <Card 
              key={plan.id} 
              className={`relative ${isPopular ? 'border-primary shadow-lg scale-105' : ''} ${isCurrent ? 'border-green-500' : ''}`}
            >
              {isPopular && (
                <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                  Most Popular
                </Badge>
              )}
              {isCurrent && (
                <Badge variant="secondary" className="absolute -top-2 right-4">
                  Current
                </Badge>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-xl">{plan.displayName}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                
                <div className="space-y-2">
                  {plan.monthlyPrice === 0 ? (
                    <div className="text-3xl font-bold">Free</div>
                  ) : canBill ? (
                    <div className="space-y-1">
                      <div className="text-3xl font-bold">
                        {formatCurrency(currentPrice)}
                        <span className="text-base font-normal text-muted-foreground">
                          /{selectedBillingCycle === 'yearly' ? 'year' : 'month'}
                        </span>
                      </div>
                      
                      {selectedBillingCycle === 'yearly' && savings && savings > 0 && (
                        <div className="text-sm text-green-600 font-medium">
                          Save {formatCurrency(savings)} per year ({plan.yearlyDiscountPercent}% off)
                        </div>
                      )}
                      
                      {selectedBillingCycle === 'monthly' && plan.billingOptions.includes('yearly') && plan.yearlyDiscountPercent > 0 && (
                        <div className="text-sm text-muted-foreground">
                          Or pay yearly and save {plan.yearlyDiscountPercent}%
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      {selectedBillingCycle === 'yearly' ? 'Monthly billing only' : 'Yearly billing only'}
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                
                {canBill && getActionButton(plan)}
                
                {!canBill && (
                  <Button variant="outline" className="w-full" disabled>
                    Not available for {selectedBillingCycle} billing
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Current Subscription Info */}
      {currentSubscription && (
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5" />
              <span>Current Subscription</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Plan:</span>
              <span className="font-medium">
                {availablePlans.find(p => p.id === currentSubscription.planId)?.displayName}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Billing Cycle:</span>
              <span className="font-medium capitalize">{currentSubscription.billingCycle}</span>
            </div>
            <div className="flex justify-between">
              <span>Next Billing Date:</span>
              <span className="font-medium">
                {new Date(currentSubscription.nextBillingDate).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Status:</span>
              <Badge variant={currentSubscription.status === 'active' ? 'default' : 'secondary'}>
                {currentSubscription.status}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BillingSelection;