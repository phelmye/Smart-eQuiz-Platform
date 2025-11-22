import { useState } from 'react';
import { CreditCard, DollarSign, Globe, Lock, Check, Settings } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { useToast } from '../hooks/use-toast';
import { CurrencySelector } from '../components/CurrencyConverter';
import type { CurrencyCode } from '@smart-equiz/utils';

interface PaymentGateway {
  id: string;
  name: string;
  enabled: boolean;
  supportedCurrencies: string[];
  regions: string[];
  fees: string;
}

const PAYMENT_GATEWAYS: PaymentGateway[] = [
  {
    id: 'stripe',
    name: 'Stripe',
    enabled: true,
    supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'],
    regions: ['Global'],
    fees: '2.9% + $0.30 per transaction'
  },
  {
    id: 'paystack',
    name: 'Paystack',
    enabled: true,
    supportedCurrencies: ['NGN', 'GHS', 'ZAR', 'USD'],
    regions: ['Africa'],
    fees: '1.5% + ₦100 per transaction'
  },
  {
    id: 'flutterwave',
    name: 'Flutterwave',
    enabled: true,
    supportedCurrencies: ['NGN', 'KES', 'GHS', 'ZAR', 'USD', 'EUR', 'GBP'],
    regions: ['Africa', 'Global'],
    fees: '1.4% per transaction'
  },
  {
    id: 'paypal',
    name: 'PayPal',
    enabled: false,
    supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
    regions: ['Global'],
    fees: '3.49% + $0.49 per transaction'
  },
];

export default function PaymentIntegration() {
  const { toast } = useToast();
  const [selectedGateway, setSelectedGateway] = useState<string>('stripe');
  const [testMode, setTestMode] = useState(true);
  const [autoCurrencyConversion, setAutoCurrencyConversion] = useState(true);
  const [defaultCurrency, setDefaultCurrency] = useState<CurrencyCode>('USD');
  const [configDialog, setConfigDialog] = useState<{ open: boolean; gateway: PaymentGateway | null }>({ open: false, gateway: null });

  // Simulated payment for testing
  const handleTestPayment = (amount: number, currency: CurrencyCode) => {
    const gateway = PAYMENT_GATEWAYS.find(g => g.id === selectedGateway);
    toast({
      title: "Test Payment Initiated",
      description: `${gateway?.name} - ${amount} ${currency} (${testMode ? 'Test' : 'Live'} Mode)`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Payment Integration</h2>
        <p className="text-gray-500 mt-1">
          Configure payment gateways with multi-currency support for global transactions
        </p>
      </div>

      {/* Auto Currency Conversion Banner */}
      {autoCurrencyConversion && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Globe className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 mb-1">
                  Auto Currency Conversion Enabled
                </h4>
                <p className="text-sm text-blue-800">
                  Tenants can pay in their local currency. Payments are automatically converted to {defaultCurrency} using live exchange rates from ExchangeRate-API.
                  Conversion rates are updated hourly.
                </p>
              </div>
              <Check className="h-5 w-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Gateways Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {PAYMENT_GATEWAYS.map((gateway) => (
          <Card key={gateway.id} className={gateway.enabled ? 'border-green-200' : 'opacity-60'}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    gateway.enabled ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    <CreditCard className={`h-6 w-6 ${
                      gateway.enabled ? 'text-green-600' : 'text-gray-400'
                    }`} />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{gateway.name}</CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {gateway.regions.join(', ')}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant={gateway.enabled ? 'default' : 'secondary'}>
                  {gateway.enabled ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Supported Currencies</p>
                <div className="flex flex-wrap gap-1">
                  {gateway.supportedCurrencies.map((curr) => (
                    <Badge key={curr} variant="outline" className="text-xs">
                      {curr}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-700">Transaction Fees</p>
                <p className="text-sm text-gray-600">{gateway.fees}</p>
              </div>

              <div className="pt-2 flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => setConfigDialog({ open: true, gateway })}
                >
                  Configure
                </Button>
                <Button 
                  variant={gateway.enabled ? 'destructive' : 'default'} 
                  size="sm"
                  onClick={() => {
                    toast({
                      title: gateway.enabled ? 'Gateway Disabled' : 'Gateway Enabled',
                      description: `${gateway.name} has been ${gateway.enabled ? 'disabled' : 'enabled'}.`,
                    });
                  }}
                >
                  {gateway.enabled ? 'Disable' : 'Enable'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Currency Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Currency Settings</CardTitle>
          <CardDescription>
            Configure default currency and auto-conversion settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="default-currency">Default Platform Currency</Label>
              <CurrencySelector 
                value={defaultCurrency} 
                onChange={setDefaultCurrency}
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                All internal calculations will be done in this currency
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="auto-conversion">Auto Currency Conversion</Label>
              <Select 
                value={autoCurrencyConversion ? 'enabled' : 'disabled'} 
                onValueChange={(v) => setAutoCurrencyConversion(v === 'enabled')}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="enabled">Enabled (Recommended)</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Allow tenants to pay in their local currency
              </p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <h4 className="font-medium mb-3">Supported Currencies (12)</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'INR', 'BRL', 'MXN', 'ZAR', 'NGN', 'KES'].map((curr) => (
                <div key={curr} className="flex items-center gap-2 p-2 border rounded text-sm">
                  <Globe className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">{curr}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Payment Section */}
      <Card>
        <CardHeader>
          <CardTitle>Test Payment Flow</CardTitle>
          <CardDescription>
            Test payment processing with currency conversion
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <Lock className="h-5 w-5 text-gray-500" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium">Test Mode:</span>
                <Badge variant={testMode ? 'default' : 'destructive'}>
                  {testMode ? 'ON' : 'OFF'}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">
                {testMode 
                  ? 'Using test API keys - No real charges will be made' 
                  : '⚠️ LIVE MODE - Real payments will be processed'
                }
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTestMode(!testMode)}
            >
              Toggle
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gateway-select">Payment Gateway</Label>
              <Select value={selectedGateway} onValueChange={setSelectedGateway}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_GATEWAYS.filter(g => g.enabled).map((gateway) => (
                    <SelectItem key={gateway.id} value={gateway.id}>
                      {gateway.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="test-amount">Test Amount (USD cents)</Label>
              <Input id="test-amount" type="number" defaultValue="1900" placeholder="1900" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4">
            <Button 
              onClick={() => handleTestPayment(1900, 'USD')}
              className="w-full"
            >
              <DollarSign className="mr-2 h-4 w-4" />
              Test Payment (USD)
            </Button>
            <Button 
              onClick={() => handleTestPayment(1900, 'EUR')}
              className="w-full"
              variant="outline"
            >
              <Globe className="mr-2 h-4 w-4" />
              Test Payment (EUR)
            </Button>
            <Button 
              onClick={() => handleTestPayment(1900, 'NGN')}
              className="w-full"
              variant="outline"
            >
              <Globe className="mr-2 h-4 w-4" />
              Test Payment (NGN)
            </Button>
          </div>

          <div className="pt-4 border-t">
            <h4 className="font-medium mb-2">How Currency Conversion Works</h4>
            <ol className="space-y-2 text-sm text-gray-600">
              <li className="flex gap-2">
                <span className="font-medium">1.</span>
                <span>Tenant selects their preferred currency during signup or payment</span>
              </li>
              <li className="flex gap-2">
                <span className="font-medium">2.</span>
                <span>System fetches latest exchange rates from ExchangeRate-API</span>
              </li>
              <li className="flex gap-2">
                <span className="font-medium">3.</span>
                <span>Amount is converted to tenant's currency for display</span>
              </li>
              <li className="flex gap-2">
                <span className="font-medium">4.</span>
                <span>Payment is processed in tenant's local currency via appropriate gateway</span>
              </li>
              <li className="flex gap-2">
                <span className="font-medium">5.</span>
                <span>System stores amount in {defaultCurrency} for reporting consistency</span>
              </li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Integration Status */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-900">Stripe API</span>
              </div>
              <Badge variant="default" className="bg-green-600">Connected</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-900">Paystack API</span>
              </div>
              <Badge variant="default" className="bg-green-600">Connected</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-900">Flutterwave API</span>
              </div>
              <Badge variant="default" className="bg-green-600">Connected</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-900">ExchangeRate-API</span>
              </div>
              <Badge variant="default" className="bg-green-600">Connected</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gateway Configuration Dialog */}
      <Dialog open={configDialog.open} onOpenChange={(open) => setConfigDialog({ ...configDialog, open })}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Configure {configDialog.gateway?.name}</DialogTitle>
            <DialogDescription>
              Set up API keys and webhook settings for {configDialog.gateway?.name} payment processing
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="publishableKey">Publishable Key</Label>
              <Input 
                id="publishableKey" 
                placeholder="pk_test_..." 
                type="text"
              />
            </div>
            
            <div>
              <Label htmlFor="secretKey">Secret Key</Label>
              <Input 
                id="secretKey" 
                placeholder="sk_test_..." 
                type="password"
              />
            </div>
            
            <div>
              <Label htmlFor="webhookSecret">Webhook Secret (Optional)</Label>
              <Input 
                id="webhookSecret" 
                placeholder="whsec_..." 
                type="password"
              />
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex gap-2">
                <Settings className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900 mb-1">
                    Find your API keys in your {configDialog.gateway?.name} dashboard
                  </p>
                  <p className="text-blue-700">
                    For testing, use test mode keys. Switch to live keys when ready for production.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setConfigDialog({ open: false, gateway: null })}
            >
              Cancel
            </Button>
            <Button onClick={() => {
              toast({
                title: "Configuration Saved",
                description: `${configDialog.gateway?.name} settings have been updated.`,
              });
              setConfigDialog({ open: false, gateway: null });
            }}>
              Save Configuration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
