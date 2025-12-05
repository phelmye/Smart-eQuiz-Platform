import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { 
  CreditCard, 
  Download, 
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  FileText,
  ArrowRight,
  Star,
  Zap,
  Shield,
  Crown,
  AlertTriangle,
  RefreshCw,
  X
} from 'lucide-react';
import { storage, STORAGE_KEYS, defaultPlans } from '@/lib/mockData';

interface SubscriptionManagementProps {
  user: any;
  tenant: any;
  onNavigate?: (page: string, action?: string) => void;
  onBack?: () => void;
}

interface UsageMetrics {
  tournaments: { used: number; limit: number };
  users: { used: number; limit: number };
  questions: { used: number; limit: number };
  storage: { used: number; limit: number };
}

interface Invoice {
  id: string;
  number: string;
  date: string;
  dueDate: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  planName: string;
  downloadUrl?: string;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank';
  last4: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  bankName?: string;
  isDefault: boolean;
}

const SubscriptionManagement: React.FC<SubscriptionManagementProps> = ({ 
  user, 
  tenant,
  onNavigate,
  onBack 
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [usageMetrics, setUsageMetrics] = useState<UsageMetrics>({
    tournaments: { used: 0, limit: 0 },
    users: { used: 0, limit: 0 },
    questions: { used: 0, limit: 0 },
    storage: { used: 0, limit: 0 }
  });
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [autoRenew, setAutoRenew] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  useEffect(() => {
    loadSubscriptionData();
  }, [tenant]);

  const loadSubscriptionData = () => {
    // Load current plan
    const billingData = storage.get(STORAGE_KEYS.BILLING) || {};
    const tenantBilling = billingData[tenant?.id] || {};
    const planId = tenantBilling.planId || 'plan-free';
    const plan = defaultPlans.find(p => p.id === planId);
    setCurrentPlan(plan);

    // Load usage metrics (mock data)
    setUsageMetrics({
      tournaments: { used: 23, limit: plan?.maxTournaments || 0 },
      users: { used: 147, limit: plan?.maxUsers || 0 },
      questions: { used: 1250, limit: plan?.maxQuestionsPerTournament || 0 },
      storage: { used: 2.3, limit: 10 } // GB
    });

    // Load invoices (mock data)
    const mockInvoices: Invoice[] = [
      {
        id: 'inv-001',
        number: 'INV-2025-001',
        date: '2025-11-01',
        dueDate: '2025-11-08',
        amount: 99,
        status: 'paid',
        planName: plan?.name || 'Pro Plan'
      },
      {
        id: 'inv-002',
        number: 'INV-2025-002',
        date: '2025-10-01',
        dueDate: '2025-10-08',
        amount: 99,
        status: 'paid',
        planName: plan?.name || 'Pro Plan'
      },
      {
        id: 'inv-003',
        number: 'INV-2025-003',
        date: '2025-09-01',
        dueDate: '2025-09-08',
        amount: 99,
        status: 'paid',
        planName: plan?.name || 'Pro Plan'
      }
    ];
    setInvoices(mockInvoices);

    // Load payment methods (mock data)
    const mockPaymentMethods: PaymentMethod[] = [
      {
        id: 'pm-001',
        type: 'card',
        last4: '4242',
        brand: 'Visa',
        expiryMonth: 12,
        expiryYear: 2026,
        isDefault: true
      },
      {
        id: 'pm-002',
        type: 'bank',
        last4: '7890',
        bankName: 'First Bank',
        isDefault: false
      }
    ];
    setPaymentMethods(mockPaymentMethods);

    // Load renewal settings
    setAutoRenew(tenantBilling.autoRenew !== false);
    setBillingCycle(tenantBilling.billingCycle || 'monthly');
  };

  const handleUpgrade = (planId: string) => {
    if (onNavigate) {
      onNavigate('subscription-checkout', planId);
    }
  };

  const handleDowngrade = (planId: string) => {
    if (confirm('Are you sure you want to downgrade your plan? Some features may become unavailable.')) {
      alert('Plan downgrade scheduled for next billing cycle.');
    }
  };

  const handleCancelSubscription = () => {
    setShowCancelModal(true);
  };

  const confirmCancelSubscription = () => {
    if (confirm('Are you absolutely sure? Your subscription will be cancelled at the end of the current billing period.')) {
      alert('Subscription cancelled. You will retain access until the end of your billing period.');
      setShowCancelModal(false);
    }
  };

  const handleToggleAutoRenew = () => {
    const newValue = !autoRenew;
    setAutoRenew(newValue);
    
    const billingData = storage.get(STORAGE_KEYS.BILLING) || {};
    billingData[tenant?.id] = { ...billingData[tenant?.id], autoRenew: newValue };
    storage.set(STORAGE_KEYS.BILLING, billingData);

    alert(`Auto-renewal ${newValue ? 'enabled' : 'disabled'} successfully.`);
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    alert(`Downloading invoice ${invoice.number}...`);
    // In a real app, this would trigger PDF download
  };

  const handleSetDefaultPayment = (methodId: string) => {
    setPaymentMethods(prev => prev.map(pm => ({
      ...pm,
      isDefault: pm.id === methodId
    })));
    alert('Default payment method updated.');
  };

  const handleRemovePaymentMethod = (methodId: string) => {
    if (confirm('Remove this payment method?')) {
      setPaymentMethods(prev => prev.filter(pm => pm.id !== methodId));
      alert('Payment method removed.');
    }
  };

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0; // Unlimited
    return Math.min((used / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const calculateAnnualPrice = (plan: any) => {
    if (!plan || !plan.monthlyPrice) return 0;
    const yearlyPrice = plan.monthlyPrice * 12;
    const discount = plan.yearlyDiscountPercent || 0;
    return yearlyPrice * (1 - discount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getNextBillingDate = () => {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return formatDate(nextMonth.toISOString());
  };

  const getPlanIcon = (planId: string) => {
    if (planId.includes('free')) return <Zap className="h-5 w-5" />;
    if (planId.includes('starter')) return <Star className="h-5 w-5" />;
    if (planId.includes('professional')) return <Shield className="h-5 w-5" />;
    if (planId.includes('enterprise')) return <Crown className="h-5 w-5" />;
    return <Star className="h-5 w-5" />;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <CreditCard className="h-8 w-8 text-blue-600" />
                Subscription Management
              </h1>
              <p className="text-gray-600 mt-2">Manage your plan, usage, and billing</p>
            </div>
            {onBack && (
              <Button variant="outline" onClick={onBack}>
                Back to Dashboard
              </Button>
            )}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">
              <TrendingUp className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="usage">
              <Users className="h-4 w-4 mr-2" />
              Usage
            </TabsTrigger>
            <TabsTrigger value="billing">
              <FileText className="h-4 w-4 mr-2" />
              Billing History
            </TabsTrigger>
            <TabsTrigger value="payment">
              <CreditCard className="h-4 w-4 mr-2" />
              Payment Methods
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Current Plan Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Current Plan</span>
                    <div className={`p-2 rounded-lg ${
                      currentPlan?.id.includes('enterprise') ? 'bg-purple-100' :
                      currentPlan?.id.includes('professional') ? 'bg-blue-100' :
                      currentPlan?.id.includes('starter') ? 'bg-green-100' :
                      'bg-gray-100'
                    }`}>
                      {getPlanIcon(currentPlan?.id || '')}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold">{currentPlan?.displayName || currentPlan?.name}</h2>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-3xl font-bold">
                        {formatCurrency(billingCycle === 'monthly' ? 
                          currentPlan?.monthlyPrice || 0 : 
                          calculateAnnualPrice(currentPlan)
                        )}
                      </span>
                      <span className="text-gray-600">/ {billingCycle === 'monthly' ? 'month' : 'year'}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Billing Cycle</span>
                      <Badge>{billingCycle}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Next Billing Date</span>
                      <span className="font-medium">{getNextBillingDate()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Auto-Renewal</span>
                      <Badge variant={autoRenew ? 'default' : 'secondary'}>
                        {autoRenew ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                  </div>

                  <div className="pt-4 space-y-2">
                    <h4 className="font-semibold text-sm">Key Features:</h4>
                    <ul className="space-y-1">
                      <li className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <span>{currentPlan?.features.maxTournaments === -1 ? 'Unlimited' : currentPlan?.features.maxTournaments} tournaments</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <span>{currentPlan?.features.maxParticipants === -1 ? 'Unlimited' : currentPlan?.features.maxParticipants} participants</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <span>{currentPlan?.features.customBranding ? 'Custom branding' : 'Standard branding'}</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <span>{currentPlan?.features.prioritySupport ? 'Priority support' : 'Standard support'}</span>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-4 flex gap-2">
                    <Button 
                      className="flex-1"
                      onClick={() => handleUpgrade(currentPlan?.id)}
                    >
                      Upgrade Plan
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                    {currentPlan?.id !== 'plan-free' && (
                      <Button 
                        variant="outline"
                        onClick={handleCancelSubscription}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Auto-Renewal Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Automatic Renewal</h4>
                        <p className="text-sm text-gray-600">
                          {autoRenew ? 'Your subscription will renew automatically' : 'You will need to manually renew'}
                        </p>
                      </div>
                      <Switch
                        checked={autoRenew}
                        onCheckedChange={handleToggleAutoRenew}
                      />
                    </div>
                    
                    {!autoRenew && (
                      <Alert className="bg-yellow-50 border-yellow-500">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <AlertDescription>
                          <strong>Auto-renewal is disabled.</strong> Your subscription will expire on {getNextBillingDate()} unless you renew manually.
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Available Plans</CardTitle>
                    <CardDescription>Explore other plans that might suit your needs</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {defaultPlans
                      .filter(p => p.id !== currentPlan?.id)
                      .slice(0, 3)
                      .map(plan => (
                        <div key={plan.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                          <div>
                            <h4 className="font-semibold">{plan.displayName}</h4>
                            <p className="text-sm text-gray-600">
                              {formatCurrency(plan.monthlyPrice)}/month
                            </p>
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleUpgrade(plan.id)}
                          >
                            {plan.monthlyPrice > (currentPlan?.monthlyPrice || 0) ? 'Upgrade' : 'Switch'}
                          </Button>
                        </div>
                      ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Usage Tab */}
          <TabsContent value="usage">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Tournaments Usage */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Tournaments</span>
                    <Badge variant="outline">
                      {usageMetrics.tournaments.used} / {usageMetrics.tournaments.limit === -1 ? '∞' : usageMetrics.tournaments.limit}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {usageMetrics.tournaments.limit !== -1 ? (
                    <>
                      <Progress 
                        value={getUsagePercentage(usageMetrics.tournaments.used, usageMetrics.tournaments.limit)} 
                        className="mb-2"
                      />
                      <p className={`text-sm ${getUsageColor(getUsagePercentage(usageMetrics.tournaments.used, usageMetrics.tournaments.limit))}`}>
                        {Math.round(getUsagePercentage(usageMetrics.tournaments.used, usageMetrics.tournaments.limit))}% used
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-green-600">Unlimited tournaments available</p>
                  )}
                </CardContent>
              </Card>

              {/* Users Usage */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Active Users</span>
                    <Badge variant="outline">
                      {usageMetrics.users.used} / {usageMetrics.users.limit === -1 ? '∞' : usageMetrics.users.limit}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {usageMetrics.users.limit !== -1 ? (
                    <>
                      <Progress 
                        value={getUsagePercentage(usageMetrics.users.used, usageMetrics.users.limit)} 
                        className="mb-2"
                      />
                      <p className={`text-sm ${getUsageColor(getUsagePercentage(usageMetrics.users.used, usageMetrics.users.limit))}`}>
                        {Math.round(getUsagePercentage(usageMetrics.users.used, usageMetrics.users.limit))}% used
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-green-600">Unlimited users available</p>
                  )}
                </CardContent>
              </Card>

              {/* Questions Usage */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Question Bank</span>
                    <Badge variant="outline">
                      {usageMetrics.questions.used} / {usageMetrics.questions.limit === -1 ? '∞' : usageMetrics.questions.limit}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {usageMetrics.questions.limit !== -1 ? (
                    <>
                      <Progress 
                        value={getUsagePercentage(usageMetrics.questions.used, usageMetrics.questions.limit)} 
                        className="mb-2"
                      />
                      <p className={`text-sm ${getUsageColor(getUsagePercentage(usageMetrics.questions.used, usageMetrics.questions.limit))}`}>
                        {Math.round(getUsagePercentage(usageMetrics.questions.used, usageMetrics.questions.limit))}% used
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-green-600">Unlimited questions available</p>
                  )}
                </CardContent>
              </Card>

              {/* Storage Usage */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Storage</span>
                    <Badge variant="outline">
                      {usageMetrics.storage.used} GB / {usageMetrics.storage.limit} GB
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Progress 
                    value={getUsagePercentage(usageMetrics.storage.used, usageMetrics.storage.limit)} 
                    className="mb-2"
                  />
                  <p className={`text-sm ${getUsageColor(getUsagePercentage(usageMetrics.storage.used, usageMetrics.storage.limit))}`}>
                    {Math.round(getUsagePercentage(usageMetrics.storage.used, usageMetrics.storage.limit))}% used
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Usage Warning */}
            {Object.entries(usageMetrics).some(([key, value]) => 
              value.limit !== -1 && getUsagePercentage(value.used, value.limit) >= 80
            ) && (
              <Alert className="mt-6 bg-yellow-50 border-yellow-500">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription>
                  <strong>Approaching usage limits</strong>
                  <p className="mt-1">Consider upgrading your plan to avoid service interruptions.</p>
                  <Button 
                    size="sm" 
                    className="mt-3"
                    onClick={() => setActiveTab('overview')}
                  >
                    View Upgrade Options
                  </Button>
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          {/* Billing History Tab */}
          <TabsContent value="billing">
            <Card>
              <CardHeader>
                <CardTitle>Billing History</CardTitle>
                <CardDescription>View and download your invoices</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {invoices.map(invoice => (
                    <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${
                          invoice.status === 'paid' ? 'bg-green-100' :
                          invoice.status === 'pending' ? 'bg-yellow-100' :
                          'bg-red-100'
                        }`}>
                          <FileText className={`h-5 w-5 ${
                            invoice.status === 'paid' ? 'text-green-600' :
                            invoice.status === 'pending' ? 'text-yellow-600' :
                            'text-red-600'
                          }`} />
                        </div>
                        <div>
                          <h4 className="font-semibold">{invoice.number}</h4>
                          <p className="text-sm text-gray-600">{invoice.planName}</p>
                          <p className="text-xs text-gray-500">
                            Issued: {formatDate(invoice.date)} • Due: {formatDate(invoice.dueDate)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(invoice.amount)}</p>
                          <Badge variant={
                            invoice.status === 'paid' ? 'default' :
                            invoice.status === 'pending' ? 'secondary' :
                            'destructive'
                          }>
                            {invoice.status}
                          </Badge>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadInvoice(invoice)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Methods Tab */}
          <TabsContent value="payment">
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>Manage your payment methods</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {paymentMethods.map(method => (
                  <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <CreditCard className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold">
                          {method.type === 'card' ? 
                            `${method.brand} •••• ${method.last4}` :
                            `${method.bankName} •••• ${method.last4}`
                          }
                        </h4>
                        {method.type === 'card' && (
                          <p className="text-sm text-gray-600">
                            Expires {method.expiryMonth?.toString().padStart(2, '0')}/{method.expiryYear}
                          </p>
                        )}
                        {method.isDefault && (
                          <Badge variant="outline" className="mt-1">Default</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!method.isDefault && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetDefaultPayment(method.id)}
                        >
                          Set Default
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemovePaymentMethod(method.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                <Button className="w-full" variant="outline">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Add New Payment Method
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SubscriptionManagement;
