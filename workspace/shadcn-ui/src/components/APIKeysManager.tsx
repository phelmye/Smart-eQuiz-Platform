import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  EyeOff, 
  Key, 
  Shield, 
  DollarSign, 
  Zap, 
  Database,
  CreditCard,
  Mail,
  Brain,
  Globe,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { storage, STORAGE_KEYS, User, hasPermission } from '@/lib/mockData';

interface APIKey {
  service: string;
  key: string;
  secret?: string;
  environment: 'development' | 'production' | 'sandbox';
  enabled: boolean;
  lastUsed?: string;
  createdAt: string;
  updatedBy: string;
}

interface APIKeysState {
  // Currency & Exchange Rates
  currencyConverter: APIKey;
  
  // AI Services
  openai: APIKey;
  anthropic: APIKey;
  
  // Database & Backend
  supabase: {
    url: string;
    anonKey: string;
    serviceRoleKey: string;
  };
  
  // Payment Gateways
  stripe: {
    publishableKey: string;
    secretKey: string;
    webhookSecret: string;
  };
  paystack: {
    publicKey: string;
    secretKey: string;
  };
  flutterwave: {
    publicKey: string;
    secretKey: string;
    encryptionKey: string;
  };
  
  // Email Services
  sendgrid: APIKey;
  mailgun: APIKey;
  
  // SMS Services
  twilio: {
    accountSid: string;
    authToken: string;
    phoneNumber: string;
  };
  
  // Cloud Storage
  cloudinary: {
    cloudName: string;
    apiKey: string;
    apiSecret: string;
  };
  
  // Analytics
  googleAnalytics: APIKey;
  
  // Other
  custom: APIKey[];
}

interface APIKeysManagerProps {
  user: User;
  onBack: () => void;
}

export const APIKeysManager: React.FC<APIKeysManagerProps> = ({ user, onBack }) => {
  const [apiKeys, setApiKeys] = useState<APIKeysState | null>(null);
  const [activeTab, setActiveTab] = useState('currency');
  const [showSecrets, setShowSecrets] = useState<{ [key: string]: boolean }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check permissions
  if (!hasPermission(user, 'system.configure')) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-bold text-red-600 mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-4">You need admin privileges to manage API keys.</p>
            <Button onClick={onBack}>Back to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  useEffect(() => {
    loadAPIKeys();
  }, []);

  const loadAPIKeys = () => {
    const savedKeys = storage.get(STORAGE_KEYS.API_KEYS);
    if (savedKeys) {
      setApiKeys(savedKeys);
    } else {
      // Initialize with empty structure
      const defaultKeys: APIKeysState = {
        currencyConverter: {
          service: 'Currency Converter API',
          key: '',
          environment: 'production',
          enabled: false,
          createdAt: new Date().toISOString(),
          updatedBy: user.email
        },
        openai: {
          service: 'OpenAI',
          key: '',
          environment: 'production',
          enabled: false,
          createdAt: new Date().toISOString(),
          updatedBy: user.email
        },
        anthropic: {
          service: 'Anthropic (Claude)',
          key: '',
          environment: 'production',
          enabled: false,
          createdAt: new Date().toISOString(),
          updatedBy: user.email
        },
        supabase: {
          url: '',
          anonKey: '',
          serviceRoleKey: ''
        },
        stripe: {
          publishableKey: '',
          secretKey: '',
          webhookSecret: ''
        },
        paystack: {
          publicKey: '',
          secretKey: ''
        },
        flutterwave: {
          publicKey: '',
          secretKey: '',
          encryptionKey: ''
        },
        sendgrid: {
          service: 'SendGrid',
          key: '',
          environment: 'production',
          enabled: false,
          createdAt: new Date().toISOString(),
          updatedBy: user.email
        },
        mailgun: {
          service: 'Mailgun',
          key: '',
          environment: 'production',
          enabled: false,
          createdAt: new Date().toISOString(),
          updatedBy: user.email
        },
        twilio: {
          accountSid: '',
          authToken: '',
          phoneNumber: ''
        },
        cloudinary: {
          cloudName: '',
          apiKey: '',
          apiSecret: ''
        },
        googleAnalytics: {
          service: 'Google Analytics',
          key: '',
          environment: 'production',
          enabled: false,
          createdAt: new Date().toISOString(),
          updatedBy: user.email
        },
        custom: []
      };
      setApiKeys(defaultKeys);
    }
  };

  const handleSave = () => {
    if (!apiKeys) return;

    setIsSaving(true);
    setSaveMessage(null);
    setError(null);

    try {
      // Save to localStorage (in production, this would encrypt sensitive data)
      storage.set(STORAGE_KEYS.API_KEYS, apiKeys);

      setTimeout(() => {
        setIsSaving(false);
        setSaveMessage('API keys saved successfully! ✓');
        setTimeout(() => setSaveMessage(null), 3000);
      }, 500);
    } catch (err) {
      setError('Failed to save API keys. Please try again.');
      setIsSaving(false);
    }
  };

  const toggleShowSecret = (keyName: string) => {
    setShowSecrets(prev => ({
      ...prev,
      [keyName]: !prev[keyName]
    }));
  };

  const updateSimpleKey = (service: keyof APIKeysState, field: string, value: any) => {
    if (!apiKeys) return;
    setApiKeys({
      ...apiKeys,
      [service]: {
        ...(apiKeys[service] as any),
        [field]: value,
        updatedBy: user.email
      }
    });
  };

  const updateNestedKey = (service: keyof APIKeysState, field: string, value: string) => {
    if (!apiKeys) return;
    setApiKeys({
      ...apiKeys,
      [service]: {
        ...(apiKeys[service] as any),
        [field]: value
      }
    });
  };

  if (!apiKeys) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading API keys...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Key className="h-8 w-8 mr-3 text-blue-600" />
                API Keys & Secrets Manager
              </h1>
              <p className="text-gray-600 mt-1">Centralized configuration for all external services</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={loadAPIKeys}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save All Keys'}
            </Button>
          </div>
        </div>

        {/* Security Warning */}
        <Alert className="mb-4 bg-yellow-50 border-yellow-300">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>Security Notice:</strong> API keys are stored in browser localStorage. For production, use environment variables and server-side encryption.
          </AlertDescription>
        </Alert>

        {saveMessage && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-4 flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            {saveMessage}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}
      </div>

      {/* Content Tabs */}
      <div className="max-w-7xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="currency">
              <DollarSign className="h-4 w-4 mr-2" />
              Currency
            </TabsTrigger>
            <TabsTrigger value="ai">
              <Brain className="h-4 w-4 mr-2" />
              AI Services
            </TabsTrigger>
            <TabsTrigger value="payments">
              <CreditCard className="h-4 w-4 mr-2" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="backend">
              <Database className="h-4 w-4 mr-2" />
              Backend
            </TabsTrigger>
            <TabsTrigger value="communications">
              <Mail className="h-4 w-4 mr-2" />
              Communications
            </TabsTrigger>
          </TabsList>

          {/* Currency Tab */}
          <TabsContent value="currency" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Currency Conversion API</CardTitle>
                <CardDescription>Exchange rate data for multi-currency support</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="currencyKey">API Key</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="currencyKey"
                        type={showSecrets['currencyKey'] ? 'text' : 'password'}
                        value={apiKeys.currencyConverter.key}
                        onChange={(e) => updateSimpleKey('currencyConverter', 'key', e.target.value)}
                        placeholder="Enter API key"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleShowSecret('currencyKey')}
                      >
                        {showSecrets['currencyKey'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="currencyEnv">Environment</Label>
                    <select
                      id="currencyEnv"
                      value={apiKeys.currencyConverter.environment}
                      onChange={(e) => updateSimpleKey('currencyConverter', 'environment', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="development">Development</option>
                      <option value="sandbox">Sandbox</option>
                      <option value="production">Production</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="currencyEnabled"
                    checked={apiKeys.currencyConverter.enabled}
                    onChange={(e) => updateSimpleKey('currencyConverter', 'enabled', e.target.checked)}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="currencyEnabled" className="cursor-pointer">
                    Enable currency conversion
                  </Label>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">Supported Providers</h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• ExchangeRate-API (exchangerate-api.com)</li>
                    <li>• Open Exchange Rates (openexchangerates.org)</li>
                    <li>• Fixer.io</li>
                    <li>• CurrencyLayer</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Services Tab */}
          <TabsContent value="ai" className="mt-6 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>OpenAI</CardTitle>
                <CardDescription>GPT models for question generation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="openaiKey">API Key</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="openaiKey"
                        type={showSecrets['openaiKey'] ? 'text' : 'password'}
                        value={apiKeys.openai.key}
                        onChange={(e) => updateSimpleKey('openai', 'key', e.target.value)}
                        placeholder="sk-..."
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleShowSecret('openaiKey')}
                      >
                        {showSecrets['openaiKey'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 pt-6">
                    <input
                      type="checkbox"
                      id="openaiEnabled"
                      checked={apiKeys.openai.enabled}
                      onChange={(e) => updateSimpleKey('openai', 'enabled', e.target.checked)}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="openaiEnabled" className="cursor-pointer">
                      Enable OpenAI
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Anthropic (Claude)</CardTitle>
                <CardDescription>Alternative AI model for question generation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="anthropicKey">API Key</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="anthropicKey"
                        type={showSecrets['anthropicKey'] ? 'text' : 'password'}
                        value={apiKeys.anthropic.key}
                        onChange={(e) => updateSimpleKey('anthropic', 'key', e.target.value)}
                        placeholder="sk-ant-..."
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleShowSecret('anthropicKey')}
                      >
                        {showSecrets['anthropicKey'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 pt-6">
                    <input
                      type="checkbox"
                      id="anthropicEnabled"
                      checked={apiKeys.anthropic.enabled}
                      onChange={(e) => updateSimpleKey('anthropic', 'enabled', e.target.checked)}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="anthropicEnabled" className="cursor-pointer">
                      Enable Anthropic
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="mt-6 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Stripe</CardTitle>
                <CardDescription>International payment processing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="stripePublishable">Publishable Key</Label>
                  <Input
                    id="stripePublishable"
                    type="text"
                    value={apiKeys.stripe.publishableKey}
                    onChange={(e) => updateNestedKey('stripe', 'publishableKey', e.target.value)}
                    placeholder="pk_..."
                  />
                </div>

                <div>
                  <Label htmlFor="stripeSecret">Secret Key</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="stripeSecret"
                      type={showSecrets['stripeSecret'] ? 'text' : 'password'}
                      value={apiKeys.stripe.secretKey}
                      onChange={(e) => updateNestedKey('stripe', 'secretKey', e.target.value)}
                      placeholder="sk_..."
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleShowSecret('stripeSecret')}
                    >
                      {showSecrets['stripeSecret'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="stripeWebhook">Webhook Secret</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="stripeWebhook"
                      type={showSecrets['stripeWebhook'] ? 'text' : 'password'}
                      value={apiKeys.stripe.webhookSecret}
                      onChange={(e) => updateNestedKey('stripe', 'webhookSecret', e.target.value)}
                      placeholder="whsec_..."
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleShowSecret('stripeWebhook')}
                    >
                      {showSecrets['stripeWebhook'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Paystack</CardTitle>
                <CardDescription>African payment gateway</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="paystackPublic">Public Key</Label>
                  <Input
                    id="paystackPublic"
                    type="text"
                    value={apiKeys.paystack.publicKey}
                    onChange={(e) => updateNestedKey('paystack', 'publicKey', e.target.value)}
                    placeholder="pk_..."
                  />
                </div>

                <div>
                  <Label htmlFor="paystackSecret">Secret Key</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="paystackSecret"
                      type={showSecrets['paystackSecret'] ? 'text' : 'password'}
                      value={apiKeys.paystack.secretKey}
                      onChange={(e) => updateNestedKey('paystack', 'secretKey', e.target.value)}
                      placeholder="sk_..."
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleShowSecret('paystackSecret')}
                    >
                      {showSecrets['paystackSecret'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Flutterwave</CardTitle>
                <CardDescription>African payment gateway</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="flutterwavePublic">Public Key</Label>
                  <Input
                    id="flutterwavePublic"
                    type="text"
                    value={apiKeys.flutterwave.publicKey}
                    onChange={(e) => updateNestedKey('flutterwave', 'publicKey', e.target.value)}
                    placeholder="FLWPUBK-..."
                  />
                </div>

                <div>
                  <Label htmlFor="flutterwaveSecret">Secret Key</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="flutterwaveSecret"
                      type={showSecrets['flutterwaveSecret'] ? 'text' : 'password'}
                      value={apiKeys.flutterwave.secretKey}
                      onChange={(e) => updateNestedKey('flutterwave', 'secretKey', e.target.value)}
                      placeholder="FLWSECK-..."
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleShowSecret('flutterwaveSecret')}
                    >
                      {showSecrets['flutterwaveSecret'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="flutterwaveEncryption">Encryption Key</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="flutterwaveEncryption"
                      type={showSecrets['flutterwaveEncryption'] ? 'text' : 'password'}
                      value={apiKeys.flutterwave.encryptionKey}
                      onChange={(e) => updateNestedKey('flutterwave', 'encryptionKey', e.target.value)}
                      placeholder="FLWSECK_TEST-..."
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleShowSecret('flutterwaveEncryption')}
                    >
                      {showSecrets['flutterwaveEncryption'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Backend Tab */}
          <TabsContent value="backend" className="mt-6 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Supabase</CardTitle>
                <CardDescription>Database and authentication backend</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="supabaseUrl">Project URL</Label>
                  <Input
                    id="supabaseUrl"
                    type="text"
                    value={apiKeys.supabase.url}
                    onChange={(e) => updateNestedKey('supabase', 'url', e.target.value)}
                    placeholder="https://xxxxx.supabase.co"
                  />
                </div>

                <div>
                  <Label htmlFor="supabaseAnon">Anon Key (Public)</Label>
                  <Input
                    id="supabaseAnon"
                    type="text"
                    value={apiKeys.supabase.anonKey}
                    onChange={(e) => updateNestedKey('supabase', 'anonKey', e.target.value)}
                    placeholder="eyJhbGc..."
                  />
                </div>

                <div>
                  <Label htmlFor="supabaseService">Service Role Key (Secret)</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="supabaseService"
                      type={showSecrets['supabaseService'] ? 'text' : 'password'}
                      value={apiKeys.supabase.serviceRoleKey}
                      onChange={(e) => updateNestedKey('supabase', 'serviceRoleKey', e.target.value)}
                      placeholder="eyJhbGc..."
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleShowSecret('supabaseService')}
                    >
                      {showSecrets['supabaseService'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cloudinary</CardTitle>
                <CardDescription>Image and video storage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="cloudinaryName">Cloud Name</Label>
                  <Input
                    id="cloudinaryName"
                    type="text"
                    value={apiKeys.cloudinary.cloudName}
                    onChange={(e) => updateNestedKey('cloudinary', 'cloudName', e.target.value)}
                    placeholder="your-cloud-name"
                  />
                </div>

                <div>
                  <Label htmlFor="cloudinaryKey">API Key</Label>
                  <Input
                    id="cloudinaryKey"
                    type="text"
                    value={apiKeys.cloudinary.apiKey}
                    onChange={(e) => updateNestedKey('cloudinary', 'apiKey', e.target.value)}
                    placeholder="123456789012345"
                  />
                </div>

                <div>
                  <Label htmlFor="cloudinarySecret">API Secret</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="cloudinarySecret"
                      type={showSecrets['cloudinarySecret'] ? 'text' : 'password'}
                      value={apiKeys.cloudinary.apiSecret}
                      onChange={(e) => updateNestedKey('cloudinary', 'apiSecret', e.target.value)}
                      placeholder="xxxxxxxxxxxxx"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleShowSecret('cloudinarySecret')}
                    >
                      {showSecrets['cloudinarySecret'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Communications Tab */}
          <TabsContent value="communications" className="mt-6 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>SendGrid</CardTitle>
                <CardDescription>Email delivery service</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="sendgridKey">API Key</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="sendgridKey"
                      type={showSecrets['sendgridKey'] ? 'text' : 'password'}
                      value={apiKeys.sendgrid.key}
                      onChange={(e) => updateSimpleKey('sendgrid', 'key', e.target.value)}
                      placeholder="SG...."
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleShowSecret('sendgridKey')}
                    >
                      {showSecrets['sendgridKey'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="sendgridEnabled"
                    checked={apiKeys.sendgrid.enabled}
                    onChange={(e) => updateSimpleKey('sendgrid', 'enabled', e.target.checked)}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="sendgridEnabled" className="cursor-pointer">
                    Enable SendGrid
                  </Label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Twilio</CardTitle>
                <CardDescription>SMS and voice services</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="twilioSid">Account SID</Label>
                  <Input
                    id="twilioSid"
                    type="text"
                    value={apiKeys.twilio.accountSid}
                    onChange={(e) => updateNestedKey('twilio', 'accountSid', e.target.value)}
                    placeholder="AC..."
                  />
                </div>

                <div>
                  <Label htmlFor="twilioToken">Auth Token</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="twilioToken"
                      type={showSecrets['twilioToken'] ? 'text' : 'password'}
                      value={apiKeys.twilio.authToken}
                      onChange={(e) => updateNestedKey('twilio', 'authToken', e.target.value)}
                      placeholder="your-auth-token"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleShowSecret('twilioToken')}
                    >
                      {showSecrets['twilioToken'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="twilioPhone">Phone Number</Label>
                  <Input
                    id="twilioPhone"
                    type="text"
                    value={apiKeys.twilio.phoneNumber}
                    onChange={(e) => updateNestedKey('twilio', 'phoneNumber', e.target.value)}
                    placeholder="+1234567890"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Google Analytics</CardTitle>
                <CardDescription>Website analytics tracking</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="gaKey">Measurement ID</Label>
                  <Input
                    id="gaKey"
                    type="text"
                    value={apiKeys.googleAnalytics.key}
                    onChange={(e) => updateSimpleKey('googleAnalytics', 'key', e.target.value)}
                    placeholder="G-XXXXXXXXXX"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="gaEnabled"
                    checked={apiKeys.googleAnalytics.enabled}
                    onChange={(e) => updateSimpleKey('googleAnalytics', 'enabled', e.target.checked)}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="gaEnabled" className="cursor-pointer">
                    Enable Google Analytics
                  </Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default APIKeysManager;
