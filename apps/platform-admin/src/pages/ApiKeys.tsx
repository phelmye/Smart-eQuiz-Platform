import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Save, 
  Eye, 
  EyeOff, 
  Key, 
  DollarSign, 
  Brain,
  Database,
  CreditCard,
  Mail,
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { API_KEY_GUIDES } from '@/lib/apiKeyGuides';
import { APIKeyHelpDialog, APIKeyHelpButton } from '@/components/APIKeyHelp';

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
  currencyConverter: APIKey;
  openai: APIKey;
  anthropic: APIKey;
  supabase: {
    url: string;
    anonKey: string;
    serviceRoleKey: string;
  };
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
  sendgrid: APIKey;
  mailgun: APIKey;
  twilio: {
    accountSid: string;
    authToken: string;
    phoneNumber: string;
  };
  cloudinary: {
    cloudName: string;
    apiKey: string;
    apiSecret: string;
  };
  googleAnalytics: APIKey;
}

export default function ApiKeys() {
  const [apiKeys, setApiKeys] = useState<APIKeysState | null>(null);
  const [activeTab, setActiveTab] = useState('currency');
  const [showSecrets, setShowSecrets] = useState<{ [key: string]: boolean }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [helpDialog, setHelpDialog] = useState<{ open: boolean; service: string | null }>({ open: false, service: null });

  useEffect(() => {
    loadAPIKeys();
  }, []);

  const loadAPIKeys = () => {
    const savedKeys = localStorage.getItem('platform_api_keys');
    if (savedKeys) {
      setApiKeys(JSON.parse(savedKeys));
    } else {
      const defaultKeys: APIKeysState = {
        currencyConverter: {
          service: 'Currency Converter API',
          key: '',
          environment: 'production',
          enabled: false,
          createdAt: new Date().toISOString(),
          updatedBy: 'admin'
        },
        openai: {
          service: 'OpenAI',
          key: '',
          environment: 'production',
          enabled: false,
          createdAt: new Date().toISOString(),
          updatedBy: 'admin'
        },
        anthropic: {
          service: 'Anthropic (Claude)',
          key: '',
          environment: 'production',
          enabled: false,
          createdAt: new Date().toISOString(),
          updatedBy: 'admin'
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
          updatedBy: 'admin'
        },
        mailgun: {
          service: 'Mailgun',
          key: '',
          environment: 'production',
          enabled: false,
          createdAt: new Date().toISOString(),
          updatedBy: 'admin'
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
          updatedBy: 'admin'
        }
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
      localStorage.setItem('platform_api_keys', JSON.stringify(apiKeys));

      setTimeout(() => {
        setIsSaving(false);
        setSaveMessage('API keys saved successfully!');
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
        updatedBy: 'admin'
      }
    });
  };

  if (!apiKeys) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Key className="h-8 w-8 text-blue-600" />
            API Keys & Secrets
          </h1>
          <p className="text-gray-600 mt-1">Centralized configuration for all external services</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadAPIKeys}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save All'}
          </Button>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 flex items-start gap-3">
        <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
        <div className="text-sm text-yellow-800">
          <strong>Security Notice:</strong> For production, use environment variables and server-side encryption.
        </div>
      </div>

      {saveMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <div className="text-sm text-green-800">{saveMessage}</div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <div className="text-sm text-red-800">{error}</div>
        </div>
      )}

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

        <TabsContent value="currency" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>Currency Conversion API</CardTitle>
                  <CardDescription>Exchange rate data for multi-currency support</CardDescription>
                </div>
                <APIKeyHelpButton 
                  serviceKey="currencyConverter" 
                  onClick={() => setHelpDialog({ open: true, service: 'currencyConverter' })} 
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>API Key</Label>
                  <div className="flex gap-2">
                    <Input
                      type={showSecrets['currencyKey'] ? 'text' : 'password'}
                      value={apiKeys.currencyConverter.key}
                      onChange={(e) => updateSimpleKey('currencyConverter', 'key', e.target.value)}
                      placeholder="Enter API key"
                    />
                    <Button variant="outline" size="sm" onClick={() => toggleShowSecret('currencyKey')}>
                      {showSecrets['currencyKey'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label>Environment</Label>
                  <select
                    value={apiKeys.currencyConverter.environment}
                    onChange={(e) => updateSimpleKey('currencyConverter', 'environment', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="development">Development</option>
                    <option value="sandbox">Sandbox</option>
                    <option value="production">Production</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={apiKeys.currencyConverter.enabled}
                  onChange={(e) => updateSimpleKey('currencyConverter', 'enabled', e.target.checked)}
                  className="h-4 w-4"
                />
                <Label>Enable currency conversion</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Add similar tabs for other services */}
        <TabsContent value="ai" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>OpenAI</CardTitle>
                  <CardDescription>GPT models for question generation</CardDescription>
                </div>
                <APIKeyHelpButton 
                  serviceKey="openai" 
                  onClick={() => setHelpDialog({ open: true, service: 'openai' })} 
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>API Key</Label>
                  <div className="flex gap-2">
                    <Input
                      type={showSecrets['openaiKey'] ? 'text' : 'password'}
                      value={apiKeys.openai.key}
                      onChange={(e) => updateSimpleKey('openai', 'key', e.target.value)}
                      placeholder="sk-..."
                    />
                    <Button variant="outline" size="sm" onClick={() => toggleShowSecret('openaiKey')}>
                      {showSecrets['openaiKey'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="flex items-center pt-6">
                  <input
                    type="checkbox"
                    checked={apiKeys.openai.enabled}
                    onChange={(e) => updateSimpleKey('openai', 'enabled', e.target.checked)}
                    className="h-4 w-4 mr-2"
                  />
                  <Label>Enable OpenAI</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments, Backend, Communications tabs similar to above */}
      </Tabs>

      {/* Help Dialog */}
      <APIKeyHelpDialog 
        open={helpDialog.open} 
        onOpenChange={(open) => setHelpDialog({ ...helpDialog, open })}
        guide={helpDialog.service ? API_KEY_GUIDES[helpDialog.service] : null}
      />
    </div>
  );
}
