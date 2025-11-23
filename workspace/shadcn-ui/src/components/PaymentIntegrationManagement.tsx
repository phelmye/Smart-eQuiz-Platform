import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  ArrowLeft, 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Shield, 
  Settings,
  Eye,
  EyeOff,
  Save
} from 'lucide-react';
import { PaymentIntegration, mockPaymentIntegrations, storage, STORAGE_KEYS, hasFeatureAccess, getFeatureDisplayInfo } from '../lib/mockData';
import { useAuth } from './AuthSystem';
import { FeaturePreviewOverlay } from './FeaturePreviewOverlay';

interface PaymentIntegrationManagementProps {
  onBack: () => void;
}

export const PaymentIntegrationManagement: React.FC<PaymentIntegrationManagementProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [paymentIntegrations, setPaymentIntegrations] = useState<PaymentIntegration[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<'stripe' | 'paypal' | 'square' | 'razorpay' | 'paystack' | 'flutterwave' | 'interswitch' | 'remita' | 'gtpay' | 'voguepay'>('stripe');
  const [showSecrets, setShowSecrets] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Feature access check
  const isLocked = user ? !hasFeatureAccess(user, 'payment-integration') : true;
  const featureInfo = user ? getFeatureDisplayInfo(user, 'payment-integration') : null;

  useEffect(() => {
    // Load payment integrations for current tenant
    const saved = storage.get(STORAGE_KEYS.PAYMENT_INTEGRATIONS) || mockPaymentIntegrations;
    const tenantIntegrations = saved.filter((pi: PaymentIntegration) => pi.tenantId === user?.tenantId);
    setPaymentIntegrations(tenantIntegrations);
  }, [user?.tenantId]);

  const getCurrentIntegration = () => {
    return paymentIntegrations.find(pi => pi.provider === selectedProvider);
  };

  const createNewIntegration = (): PaymentIntegration => {
    return {
      id: `payment_${Date.now()}`,
      tenantId: user?.tenantId || '',
      provider: selectedProvider,
      isEnabled: false,
      isConfigured: false,
      configuration: {
        publishableKey: '',
        secretKey: '',
        webhookSecret: '',
        clientId: '',
        clientSecret: '',
        environment: 'sandbox'
      },
      supportedFeatures: {
        tournaments: false,
        rewards: false,
        cashout: false,
        scoreExchange: false
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  };

  const updateIntegration = (updates: Partial<PaymentIntegration>) => {
    const currentIntegration = getCurrentIntegration();
    const updatedIntegration = currentIntegration 
      ? { ...currentIntegration, ...updates, updatedAt: new Date().toISOString() }
      : { ...createNewIntegration(), ...updates };

    const updatedIntegrations = currentIntegration
      ? paymentIntegrations.map(pi => pi.id === currentIntegration.id ? updatedIntegration : pi)
      : [...paymentIntegrations, updatedIntegration];

    setPaymentIntegrations(updatedIntegrations);

    // Update global storage
    const allIntegrations = storage.get(STORAGE_KEYS.PAYMENT_INTEGRATIONS) || mockPaymentIntegrations;
    const globalUpdated = currentIntegration
      ? allIntegrations.map((pi: PaymentIntegration) => pi.id === currentIntegration.id ? updatedIntegration : pi)
      : [...allIntegrations, updatedIntegration];

    storage.set(STORAGE_KEYS.PAYMENT_INTEGRATIONS, globalUpdated);
  };

  const handleSaveConfiguration = async () => {
    setSaveStatus('saving');
    
    try {
      const currentIntegration = getCurrentIntegration();
      if (!currentIntegration) return;

      // Validate configuration
      const isConfigured = validateConfiguration(currentIntegration);
      
      updateIntegration({ 
        isConfigured,
        updatedAt: new Date().toISOString()
      });

      setSaveStatus('saved');
      setIsEditing(false);

      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    }
  };

  const validateConfiguration = (integration: PaymentIntegration): boolean => {
    const { configuration, provider } = integration;
    
    switch (provider) {
      case 'stripe':
        return !!(configuration.publishableKey && configuration.secretKey);
      case 'paypal':
        return !!(configuration.clientId && configuration.clientSecret);
      case 'square':
        return !!(configuration.publishableKey && configuration.secretKey);
      case 'razorpay':
        return !!(configuration.publishableKey && configuration.secretKey);
      default:
        return false;
    }
  };

  const getStatusBadge = (integration?: PaymentIntegration) => {
    if (!integration) {
      return <Badge variant="secondary">Not Set Up</Badge>;
    }
    
    if (integration.isEnabled && integration.isConfigured) {
      return <Badge variant="default" className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>;
    }
    
    if (integration.isConfigured && !integration.isEnabled) {
      return <Badge variant="secondary"><Settings className="h-3 w-3 mr-1" />Configured</Badge>;
    }
    
    if (!integration.isConfigured) {
      return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Incomplete</Badge>;
    }

    return <Badge variant="secondary">Unknown</Badge>;
  };

  const renderProviderConfiguration = (integration?: PaymentIntegration) => {
    const currentConfig = integration?.configuration || createNewIntegration().configuration;

    const handleConfigChange = (field: string, value: string) => {
      updateIntegration({
        configuration: {
          ...currentConfig,
          [field]: value
        }
      });
    };

    switch (selectedProvider) {
      case 'stripe':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="publishableKey">Publishable Key</Label>
                <Input
                  id="publishableKey"
                  type={showSecrets ? 'text' : 'password'}
                  value={currentConfig.publishableKey}
                  onChange={(e) => handleConfigChange('publishableKey', e.target.value)}
                  placeholder="pk_test_..."
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="secretKey">Secret Key</Label>
                <Input
                  id="secretKey"
                  type={showSecrets ? 'text' : 'password'}
                  value={currentConfig.secretKey}
                  onChange={(e) => handleConfigChange('secretKey', e.target.value)}
                  placeholder="sk_test_..."
                  disabled={!isEditing}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="webhookSecret">Webhook Secret (Optional)</Label>
              <Input
                id="webhookSecret"
                type={showSecrets ? 'text' : 'password'}
                value={currentConfig.webhookSecret}
                onChange={(e) => handleConfigChange('webhookSecret', e.target.value)}
                placeholder="whsec_..."
                disabled={!isEditing}
              />
            </div>
          </div>
        );

      case 'paypal':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clientId">Client ID</Label>
                <Input
                  id="clientId"
                  type={showSecrets ? 'text' : 'password'}
                  value={currentConfig.clientId}
                  onChange={(e) => handleConfigChange('clientId', e.target.value)}
                  placeholder="Your PayPal Client ID"
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="clientSecret">Client Secret</Label>
                <Input
                  id="clientSecret"
                  type={showSecrets ? 'text' : 'password'}
                  value={currentConfig.clientSecret}
                  onChange={(e) => handleConfigChange('clientSecret', e.target.value)}
                  placeholder="Your PayPal Client Secret"
                  disabled={!isEditing}
                />
              </div>
            </div>
          </div>
        );

      case 'square':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="publishableKey">Application ID</Label>
                <Input
                  id="publishableKey"
                  type={showSecrets ? 'text' : 'password'}
                  value={currentConfig.publishableKey}
                  onChange={(e) => handleConfigChange('publishableKey', e.target.value)}
                  placeholder="Your Square Application ID"
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="secretKey">Access Token</Label>
                <Input
                  id="secretKey"
                  type={showSecrets ? 'text' : 'password'}
                  value={currentConfig.secretKey}
                  onChange={(e) => handleConfigChange('secretKey', e.target.value)}
                  placeholder="Your Square Access Token"
                  disabled={!isEditing}
                />
              </div>
            </div>
          </div>
        );

      case 'razorpay':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="publishableKey">Key ID</Label>
                <Input
                  id="publishableKey"
                  type={showSecrets ? 'text' : 'password'}
                  value={currentConfig.publishableKey}
                  onChange={(e) => handleConfigChange('publishableKey', e.target.value)}
                  placeholder="rzp_test_..."
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="secretKey">Key Secret</Label>
                <Input
                  id="secretKey"
                  type={showSecrets ? 'text' : 'password'}
                  value={currentConfig.secretKey}
                  onChange={(e) => handleConfigChange('secretKey', e.target.value)}
                  placeholder="Your Razorpay Key Secret"
                  disabled={!isEditing}
                />
              </div>
            </div>
          </div>
        );

      // Nigerian Payment Gateways
      case 'paystack':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="publishableKey">Public Key</Label>
                <Input
                  id="publishableKey"
                  type={showSecrets ? 'text' : 'password'}
                  value={currentConfig.publishableKey}
                  onChange={(e) => handleConfigChange('publishableKey', e.target.value)}
                  placeholder="pk_test_..."
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="secretKey">Secret Key</Label>
                <Input
                  id="secretKey"
                  type={showSecrets ? 'text' : 'password'}
                  value={currentConfig.secretKey}
                  onChange={(e) => handleConfigChange('secretKey', e.target.value)}
                  placeholder="sk_test_..."
                  disabled={!isEditing}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="webhookSecret">Webhook Secret (Optional)</Label>
              <Input
                id="webhookSecret"
                type={showSecrets ? 'text' : 'password'}
                value={currentConfig.webhookSecret}
                onChange={(e) => handleConfigChange('webhookSecret', e.target.value)}
                placeholder="Your webhook secret"
                disabled={!isEditing}
              />
            </div>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Paystack supports NGN, USD, GHS, and ZAR. Supports cards, bank transfer, USSD, and mobile money.
              </AlertDescription>
            </Alert>
          </div>
        );

      case 'flutterwave':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="publishableKey">Public Key</Label>
                <Input
                  id="publishableKey"
                  type={showSecrets ? 'text' : 'password'}
                  value={currentConfig.publishableKey}
                  onChange={(e) => handleConfigChange('publishableKey', e.target.value)}
                  placeholder="FLWPUBK-..."
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="secretKey">Secret Key</Label>
                <Input
                  id="secretKey"
                  type={showSecrets ? 'text' : 'password'}
                  value={currentConfig.secretKey}
                  onChange={(e) => handleConfigChange('secretKey', e.target.value)}
                  placeholder="FLWSECK-..."
                  disabled={!isEditing}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="webhookSecret">Webhook Hash (Optional)</Label>
              <Input
                id="webhookSecret"
                type={showSecrets ? 'text' : 'password'}
                value={currentConfig.webhookSecret}
                onChange={(e) => handleConfigChange('webhookSecret', e.target.value)}
                placeholder="Your webhook hash"
                disabled={!isEditing}
              />
            </div>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Flutterwave supports multiple African currencies including NGN, KES, GHS, UGX, ZAR, and more. Supports cards, mobile money, bank transfer, and USSD.
              </AlertDescription>
            </Alert>
          </div>
        );

      case 'interswitch':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="publishableKey">Product ID</Label>
                <Input
                  id="publishableKey"
                  type={showSecrets ? 'text' : 'password'}
                  value={currentConfig.publishableKey}
                  onChange={(e) => handleConfigChange('publishableKey', e.target.value)}
                  placeholder="Your Interswitch Product ID"
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="secretKey">MAC Key</Label>
                <Input
                  id="secretKey"
                  type={showSecrets ? 'text' : 'password'}
                  value={currentConfig.secretKey}
                  onChange={(e) => handleConfigChange('secretKey', e.target.value)}
                  placeholder="Your MAC Key"
                  disabled={!isEditing}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="clientId">Pay Item ID</Label>
              <Input
                id="clientId"
                value={currentConfig.clientId}
                onChange={(e) => handleConfigChange('clientId', e.target.value)}
                placeholder="Your Pay Item ID"
                disabled={!isEditing}
              />
            </div>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Interswitch WebPAY supports Verve cards, MasterCard, Visa, and Quickteller payments in Nigeria.
              </AlertDescription>
            </Alert>
          </div>
        );

      case 'remita':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="publishableKey">Merchant ID</Label>
                <Input
                  id="publishableKey"
                  type={showSecrets ? 'text' : 'password'}
                  value={currentConfig.publishableKey}
                  onChange={(e) => handleConfigChange('publishableKey', e.target.value)}
                  placeholder="Your Merchant ID"
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="secretKey">API Key</Label>
                <Input
                  id="secretKey"
                  type={showSecrets ? 'text' : 'password'}
                  value={currentConfig.secretKey}
                  onChange={(e) => handleConfigChange('secretKey', e.target.value)}
                  placeholder="Your API Key"
                  disabled={!isEditing}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="clientId">Service Type ID</Label>
              <Input
                id="clientId"
                value={currentConfig.clientId}
                onChange={(e) => handleConfigChange('clientId', e.target.value)}
                placeholder="Your Service Type ID"
                disabled={!isEditing}
              />
            </div>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Remita supports bank transfers, card payments, and salary-based loans. Popular for government payments.
              </AlertDescription>
            </Alert>
          </div>
        );

      case 'gtpay':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="publishableKey">Merchant ID</Label>
                <Input
                  id="publishableKey"
                  value={currentConfig.publishableKey}
                  onChange={(e) => handleConfigChange('publishableKey', e.target.value)}
                  placeholder="Your GTBank Merchant ID"
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="secretKey">Hash Key</Label>
                <Input
                  id="secretKey"
                  type={showSecrets ? 'text' : 'password'}
                  value={currentConfig.secretKey}
                  onChange={(e) => handleConfigChange('secretKey', e.target.value)}
                  placeholder="Your Hash Key"
                  disabled={!isEditing}
                />
              </div>
            </div>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                GTBank payment gateway for Nigerian merchants. Supports cards and bank transfers.
              </AlertDescription>
            </Alert>
          </div>
        );

      case 'voguepay':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="publishableKey">Merchant ID</Label>
                <Input
                  id="publishableKey"
                  value={currentConfig.publishableKey}
                  onChange={(e) => handleConfigChange('publishableKey', e.target.value)}
                  placeholder="Your VoguePay Merchant ID"
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="secretKey">API Key</Label>
                <Input
                  id="secretKey"
                  type={showSecrets ? 'text' : 'password'}
                  value={currentConfig.secretKey}
                  onChange={(e) => handleConfigChange('secretKey', e.target.value)}
                  placeholder="Your VoguePay API Key"
                  disabled={!isEditing}
                />
              </div>
            </div>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                VoguePay supports Nigerian bank cards, international cards, and mobile payments.
              </AlertDescription>
            </Alert>
          </div>
        );
    }
  };

  const currentIntegration = getCurrentIntegration();

  // Render locked feature preview if needed
  if (isLocked && featureInfo) {
    return (
      <FeaturePreviewOverlay
        featureInfo={featureInfo}
        onUpgrade={() => {
          window.location.hash = 'billing';
        }}
        blur={true}
      >
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <div className="flex items-center space-x-4 mb-4">
                <Button variant="ghost" onClick={onBack}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Payment Integration</h1>
                  <p className="text-gray-600 mt-1">
                    Configure payment providers to enable monetary features
                  </p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card><CardContent className="p-6"><div className="h-40" /></CardContent></Card>
              <Card><CardContent className="p-6"><div className="h-40" /></CardContent></Card>
              <Card><CardContent className="p-6"><div className="h-40" /></CardContent></Card>
            </div>
          </div>
        </div>
      </FeaturePreviewOverlay>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Payment Integration</h1>
              <p className="text-gray-600 mt-1">
                Configure payment providers to enable monetary features like tournament entries, rewards, and cashouts
              </p>
            </div>
          </div>
        </div>

        {/* Status Alert */}
        {!currentIntegration?.isEnabled && (
          <Alert className="mb-6 border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              Payment integration is currently disabled. Users cannot make payments, exchange scores for rewards, or cash out winnings until you configure and enable a payment provider.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Provider Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Payment Providers
              </CardTitle>
              <CardDescription>
                Choose and configure your preferred payment provider
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* International Payment Providers */}
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">International Providers</h3>
                {(['stripe', 'paypal', 'square', 'razorpay'] as const).map((provider) => {
                  const integration = paymentIntegrations.find(pi => pi.provider === provider);
                  return (
                    <div
                      key={provider}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors mb-3 ${
                        selectedProvider === provider 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedProvider(provider)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium capitalize">{provider}</h4>
                          <p className="text-sm text-gray-500">
                            {provider === 'stripe' && 'Accept cards, digital wallets, and more'}
                            {provider === 'paypal' && 'PayPal and PayPal Credit payments'}
                            {provider === 'square' && 'Square payment processing'}
                            {provider === 'razorpay' && 'Popular in India and Southeast Asia'}
                          </p>
                        </div>
                        {getStatusBadge(integration)}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Nigerian Payment Providers */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Nigerian Payment Providers</h3>
                {(['paystack', 'flutterwave', 'interswitch', 'remita', 'gtpay', 'voguepay'] as const).map((provider) => {
                  const integration = paymentIntegrations.find(pi => pi.provider === provider);
                  return (
                    <div
                      key={provider}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors mb-3 ${
                        selectedProvider === provider 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedProvider(provider)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium capitalize flex items-center">
                            {provider}
                            <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">🇳🇬 NG</span>
                          </h4>
                          <p className="text-sm text-gray-500">
                            {provider === 'paystack' && 'Leading Nigerian payment gateway - Cards, Bank Transfer, USSD'}
                            {provider === 'flutterwave' && 'Pan-African payments - Cards, Mobile Money, Bank Transfer'}
                            {provider === 'interswitch' && 'Verve cards, WebPAY, Quickteller integration'}
                            {provider === 'remita' && 'Government & enterprise payments, salary loans'}
                            {provider === 'gtpay' && 'Guaranty Trust Bank payment gateway'}
                            {provider === 'voguepay' && 'Nigerian online payment platform'}
                          </p>
                        </div>
                        {getStatusBadge(integration)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Configuration */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="capitalize">{selectedProvider} Configuration</CardTitle>
                  <CardDescription>
                    Configure your {selectedProvider} payment settings
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSecrets(!showSecrets)}
                  >
                    {showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    {showSecrets ? 'Hide' : 'Show'} Keys
                  </Button>
                  {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)}>
                      <Settings className="h-4 w-4 mr-2" />
                      Edit Configuration
                    </Button>
                  ) : (
                    <div className="flex space-x-2">
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSaveConfiguration} disabled={saveStatus === 'saving'}>
                        <Save className="h-4 w-4 mr-2" />
                        {saveStatus === 'saving' ? 'Saving...' : 'Save'}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Environment Selection */}
              <div>
                <Label htmlFor="environment">Environment</Label>
                <Select
                  value={currentIntegration?.configuration.environment || 'sandbox'}
                  onValueChange={(value: 'sandbox' | 'production') => 
                    updateIntegration({
                      configuration: {
                        ...currentIntegration?.configuration,
                        environment: value
                      }
                    })
                  }
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sandbox">Sandbox (Testing)</SelectItem>
                    <SelectItem value="production">Production (Live)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Provider-specific configuration */}
              {renderProviderConfiguration(currentIntegration)}

              {/* Enable/Disable Toggle */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enableIntegration" className="text-base font-medium">
                      Enable Payment Integration
                    </Label>
                    <p className="text-sm text-gray-500">
                      Allow users to make payments and access monetary features
                    </p>
                  </div>
                  <Switch
                    id="enableIntegration"
                    checked={currentIntegration?.isEnabled || false}
                    onCheckedChange={(enabled) => updateIntegration({ isEnabled: enabled })}
                    disabled={!currentIntegration?.isConfigured}
                  />
                </div>
                {!currentIntegration?.isConfigured && (
                  <p className="text-sm text-orange-600 mt-2">
                    Complete the configuration above to enable payment integration
                  </p>
                )}
              </div>

              {/* Save Status */}
              {saveStatus === 'saved' && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Configuration saved successfully!
                  </AlertDescription>
                </Alert>
              )}

              {saveStatus === 'error' && (
                <Alert className="border-red-200 bg-red-50">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    Failed to save configuration. Please try again.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Feature Controls */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Payment Features</CardTitle>
            <CardDescription>
              Control which features require payment processing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { key: 'tournaments', label: 'Tournament Entry Fees', description: 'Allow paid tournament participation' },
                { key: 'rewards', label: 'Monetary Rewards', description: 'Enable cash and gift card rewards' },
                { key: 'cashout', label: 'Prize Cashout', description: 'Allow winners to cash out prizes' },
                { key: 'scoreExchange', label: 'Score Exchange', description: 'Exchange points for real rewards' }
              ].map((feature) => (
                <div key={feature.key} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="font-medium">{feature.label}</Label>
                    <Switch
                      checked={currentIntegration?.supportedFeatures[feature.key as keyof PaymentIntegration['supportedFeatures']] || false}
                      onCheckedChange={(enabled) => 
                        updateIntegration({
                          supportedFeatures: {
                            ...currentIntegration?.supportedFeatures,
                            [feature.key]: enabled
                          }
                        })
                      }
                      disabled={!currentIntegration?.isEnabled}
                    />
                  </div>
                  <p className="text-sm text-gray-500">{feature.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentIntegrationManagement;