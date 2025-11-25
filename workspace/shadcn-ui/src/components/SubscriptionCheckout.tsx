import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  CreditCard, 
  Check, 
  Loader2, 
  Shield, 
  Lock,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import { storage, STORAGE_KEYS } from '@/lib/mockData';
import { User } from '@/lib/mockData';

interface SubscriptionCheckoutProps {
  selectedPlanId: string;
  billingCycle: 'monthly' | 'annual';
  onBack?: () => void;
  onSuccess?: () => void;
}

interface Plan {
  id: string;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  features: string[];
}

const PLAN_DETAILS: Record<string, Plan> = {
  'plan-free': {
    id: 'plan-free',
    name: 'Free Plan',
    monthlyPrice: 0,
    annualPrice: 0,
    features: ['10 questions', 'Basic analytics', 'Community support']
  },
  'plan-starter': {
    id: 'plan-starter',
    name: 'Starter Plan',
    monthlyPrice: 29,
    annualPrice: 290,
    features: ['100 questions', 'Basic tournaments', 'Email support', 'Custom branding']
  },
  'plan-professional': {
    id: 'plan-professional',
    name: 'Professional Plan',
    monthlyPrice: 79,
    annualPrice: 790,
    features: ['Unlimited questions', 'Advanced tournaments', 'Priority support', 'Advanced analytics', 'API access']
  },
  'plan-enterprise': {
    id: 'plan-enterprise',
    name: 'Enterprise Plan',
    monthlyPrice: 199,
    annualPrice: 1990,
    features: ['Everything in Professional', 'Dedicated support', 'Custom integrations', 'SLA guarantee', 'Multi-tenant management']
  }
};

export const SubscriptionCheckout: React.FC<SubscriptionCheckoutProps> = ({
  selectedPlanId,
  billingCycle,
  onBack,
  onSuccess
}) => {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('card');

  useEffect(() => {
    const user = storage.get(STORAGE_KEYS.CURRENT_USER);
    setCurrentUser(user);
  }, []);

  const plan = PLAN_DETAILS[selectedPlanId];
  const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
  const savings = billingCycle === 'annual' ? (plan.monthlyPrice * 12 - plan.annualPrice) : 0;

  const handleCheckout = async () => {
    setProcessing(true);
    setError(null);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      // In production, this would integrate with Stripe/PayPal
      // For now, we'll update the user's plan in localStorage
      
      if (!currentUser) {
        throw new Error('User not found');
      }

      // Get current tenant
      const tenants = storage.get(STORAGE_KEYS.TENANTS) || [];
      const tenant = tenants.find((t: any) => t.id === currentUser.tenantId);

      if (tenant) {
        // Update tenant's plan
        tenant.planId = selectedPlanId;
        tenant.billingCycle = billingCycle;
        tenant.subscriptionStatus = 'active';
        tenant.nextBillingDate = new Date(Date.now() + (billingCycle === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000).toISOString();

        storage.set(STORAGE_KEYS.TENANTS, tenants);

        // Create billing record
        const billingRecords = storage.get(STORAGE_KEYS.BILLING) || [];
        billingRecords.push({
          id: `billing-${Date.now()}`,
          tenantId: tenant.id,
          planId: selectedPlanId,
          amount: price,
          currency: 'USD',
          status: 'paid',
          billingDate: new Date().toISOString(),
          nextBillingDate: tenant.nextBillingDate,
          paymentMethod: paymentMethod,
          invoiceUrl: '#'
        });
        storage.set(STORAGE_KEYS.BILLING, billingRecords);

        // Send success notification (would be email in production)
        console.log('✅ Subscription activated:', {
          plan: plan.name,
          cycle: billingCycle,
          amount: price
        });

        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  if (!plan) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Invalid plan selected</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {onBack && (
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Plans
          </Button>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>Review your subscription details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{plan.name}</h3>
                    <p className="text-sm text-gray-500 capitalize">{billingCycle} billing</p>
                  </div>
                  <Badge variant="secondary">{billingCycle}</Badge>
                </div>

                <ul className="space-y-2 mt-4">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>${price.toFixed(2)}</span>
                </div>
                {savings > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Annual savings</span>
                    <span>-${savings.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Tax</span>
                  <span>Calculated at checkout</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>${price.toFixed(2)}</span>
                </div>
                <p className="text-xs text-gray-500">
                  {billingCycle === 'monthly' 
                    ? 'Billed monthly. Cancel anytime.' 
                    : 'Billed annually. Save $' + savings.toFixed(0) + ' per year.'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
                <CardDescription>Secure payment processing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Button
                    variant={paymentMethod === 'card' ? 'default' : 'outline'}
                    className="w-full justify-start"
                    onClick={() => setPaymentMethod('card')}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Credit / Debit Card
                  </Button>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Card Number</label>
                    <input
                      type="text"
                      placeholder="4242 4242 4242 4242"
                      className="w-full px-3 py-2 border rounded-md"
                      disabled={processing}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Expiry</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        className="w-full px-3 py-2 border rounded-md"
                        disabled={processing}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">CVC</label>
                      <input
                        type="text"
                        placeholder="123"
                        className="w-full px-3 py-2 border rounded-md"
                        disabled={processing}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Cardholder Name</label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      className="w-full px-3 py-2 border rounded-md"
                      disabled={processing}
                    />
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleCheckout}
                  disabled={processing}
                >
                  {processing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Pay ${price.toFixed(2)}
                    </>
                  )}
                </Button>

                <div className="flex items-center gap-2 text-xs text-gray-500 justify-center">
                  <Shield className="h-3 w-3" />
                  <span>Secured by 256-bit SSL encryption</span>
                </div>
              </CardContent>
            </Card>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                By completing this purchase, you agree to our <button className="underline">Terms of Service</button> and <button className="underline">Privacy Policy</button>. Your subscription will automatically renew unless cancelled.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionCheckout;
