/**
 * Create API Key Dialog
 * 
 * Modal for creating new tenant API keys with scope selection and configuration.
 */

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import {
  Key,
  AlertTriangle,
  Copy,
  CheckCircle,
  Info,
  Plus
} from 'lucide-react';
import {
  apiManagementClient,
  type ApiKeyType,
  type CreateApiKeyDto,
  type ApiKey,
  API_SCOPES,
  getAllScopes,
  getScopeDisplayName,
  getScopeDescription
} from '@/lib/apiManagementClient';

interface CreateApiKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function CreateApiKeyDialog({
  open,
  onOpenChange,
  onSuccess
}: CreateApiKeyDialogProps) {
  const [step, setStep] = useState<'form' | 'success'>(  'form');
  const [formData, setFormData] = useState<CreateApiKeyDto>({
    name: '',
    description: '',
    type: 'SECRET',
    scopes: [],
    rateLimit: 600,
    ipWhitelist: []
  });
  const [createdKey, setCreatedKey] = useState<ApiKey | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const availableScopes = getAllScopes();

  const handleScopeToggle = (scope: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      scopes: checked
        ? [...prev.scopes, scope]
        : prev.scopes.filter(s => s !== scope)
    }));
  };

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      setError('API key name is required');
      return;
    }

    if (formData.scopes.length === 0) {
      setError('Please select at least one scope');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const key = await apiManagementClient.createApiKey(formData);
      
      setCreatedKey(key);
      setStep('success');
      
    } catch (err) {
      console.error('Failed to create API key:', err);
      setError(err instanceof Error ? err.message : 'Failed to create API key');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyKey = () => {
    if (createdKey?.key) {
      navigator.clipboard.writeText(createdKey.key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    if (step === 'success') {
      onSuccess();
    }
    
    // Reset state
    setStep('form');
    setFormData({
      name: '',
      description: '',
      type: 'SECRET',
      scopes: [],
      rateLimit: 600,
      ipWhitelist: []
    });
    setCreatedKey(null);
    setError(null);
    setCopied(false);
    
    onOpenChange(false);
  };

  const getRateLimitRecommendation = (type: ApiKeyType): number => {
    switch (type) {
      case 'PUBLIC':
        return 60; // Lower for public keys
      case 'TEST':
        return 100; // Moderate for testing
      case 'SECRET':
        return 600; // Higher for production
      default:
        return 300;
    }
  };

  const handleTypeChange = (type: ApiKeyType) => {
    setFormData(prev => ({
      ...prev,
      type,
      rateLimit: getRateLimitRecommendation(type)
    }));
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {step === 'form' ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                Create New API Key
              </DialogTitle>
              <DialogDescription>
                Generate a new API key to access your tenant data programmatically
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">API Key Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Production Mobile App"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    A descriptive name to identify this API key
                  </p>
                </div>

                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="e.g., API key for iOS and Android mobile applications"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="type">Key Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleTypeChange(value as ApiKeyType)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SECRET">
                        <div>
                          <div className="font-medium">Secret Key</div>
                          <div className="text-xs text-gray-500">For server-side applications (recommended)</div>
                        </div>
                      </SelectItem>
                      <SelectItem value="PUBLIC">
                        <div>
                          <div className="font-medium">Public Key</div>
                          <div className="text-xs text-gray-500">For client-side applications (limited permissions)</div>
                        </div>
                      </SelectItem>
                      <SelectItem value="TEST">
                        <div>
                          <div className="font-medium">Test Key</div>
                          <div className="text-xs text-gray-500">For development and testing</div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="rateLimit">Rate Limit (requests per minute) *</Label>
                  <Input
                    id="rateLimit"
                    type="number"
                    min={1}
                    max={10000}
                    value={formData.rateLimit}
                    onChange={(e) => setFormData(prev => ({ ...prev, rateLimit: parseInt(e.target.value) }))}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Maximum API requests allowed per minute
                  </p>
                </div>
              </div>

              {/* Permissions / Scopes */}
              <div>
                <Label className="text-base font-semibold">Permissions (Scopes) *</Label>
                <p className="text-sm text-gray-600 mb-4">
                  Select the API endpoints this key can access
                </p>

                <div className="space-y-3">
                  {/* Quick Actions */}
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, scopes: availableScopes }))}
                    >
                      Select All
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, scopes: [] }))}
                    >
                      Clear All
                    </Button>
                  </div>

                  {/* Scope Groups */}
                  <div className="grid gap-3">
                    {/* Users */}
                    <Card className="p-4">
                      <h4 className="font-semibold text-sm mb-3">User Management</h4>
                      <div className="space-y-2">
                        {Object.values(API_SCOPES.USERS)
                          .filter(scope => !scope.endsWith(':*'))
                          .map(scope => (
                            <div key={scope} className="flex items-start gap-3">
                              <Checkbox
                                id={scope}
                                checked={formData.scopes.includes(scope)}
                                onCheckedChange={(checked) => handleScopeToggle(scope, checked as boolean)}
                              />
                              <div className="flex-1">
                                <Label htmlFor={scope} className="text-sm font-medium cursor-pointer">
                                  {getScopeDisplayName(scope)}
                                </Label>
                                <p className="text-xs text-gray-500">
                                  {getScopeDescription(scope)}
                                </p>
                              </div>
                            </div>
                          ))}
                      </div>
                    </Card>

                    {/* Tournaments */}
                    <Card className="p-4">
                      <h4 className="font-semibold text-sm mb-3">Tournament Management</h4>
                      <div className="space-y-2">
                        {Object.values(API_SCOPES.TOURNAMENTS)
                          .filter(scope => !scope.endsWith(':*'))
                          .map(scope => (
                            <div key={scope} className="flex items-start gap-3">
                              <Checkbox
                                id={scope}
                                checked={formData.scopes.includes(scope)}
                                onCheckedChange={(checked) => handleScopeToggle(scope, checked as boolean)}
                              />
                              <div className="flex-1">
                                <Label htmlFor={scope} className="text-sm font-medium cursor-pointer">
                                  {getScopeDisplayName(scope)}
                                </Label>
                                <p className="text-xs text-gray-500">
                                  {getScopeDescription(scope)}
                                </p>
                              </div>
                            </div>
                          ))}
                      </div>
                    </Card>

                    {/* Questions */}
                    <Card className="p-4">
                      <h4 className="font-semibold text-sm mb-3">Question Bank</h4>
                      <div className="space-y-2">
                        {Object.values(API_SCOPES.QUESTIONS)
                          .filter(scope => !scope.endsWith(':*'))
                          .map(scope => (
                            <div key={scope} className="flex items-start gap-3">
                              <Checkbox
                                id={scope}
                                checked={formData.scopes.includes(scope)}
                                onCheckedChange={(checked) => handleScopeToggle(scope, checked as boolean)}
                              />
                              <div className="flex-1">
                                <Label htmlFor={scope} className="text-sm font-medium cursor-pointer">
                                  {getScopeDisplayName(scope)}
                                </Label>
                                <p className="text-xs text-gray-500">
                                  {getScopeDescription(scope)}
                                </p>
                              </div>
                            </div>
                          ))}
                      </div>
                    </Card>

                    {/* Other scopes */}
                    <Card className="p-4">
                      <h4 className="font-semibold text-sm mb-3">Other Permissions</h4>
                      <div className="space-y-2">
                        {[
                          ...Object.values(API_SCOPES.ANALYTICS),
                          ...Object.values(API_SCOPES.PAYMENTS),
                          ...Object.values(API_SCOPES.WEBHOOKS)
                        ]
                          .filter(scope => !scope.endsWith(':*') && scope !== 'admin:full')
                          .map(scope => (
                            <div key={scope} className="flex items-start gap-3">
                              <Checkbox
                                id={scope}
                                checked={formData.scopes.includes(scope)}
                                onCheckedChange={(checked) => handleScopeToggle(scope, checked as boolean)}
                              />
                              <div className="flex-1">
                                <Label htmlFor={scope} className="text-sm font-medium cursor-pointer">
                                  {getScopeDisplayName(scope)}
                                </Label>
                                <p className="text-xs text-gray-500">
                                  {getScopeDescription(scope)}
                                </p>
                              </div>
                            </div>
                          ))}
                      </div>
                    </Card>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-red-800">{error}</div>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose} disabled={loading}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={loading}>
                {loading ? (
                  <>Creating...</>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create API Key
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                API Key Created Successfully
              </DialogTitle>
              <DialogDescription>
                Save this API key now - it won't be shown again!
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* API Key Display */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-semibold mb-1">Save Your API Key Now</p>
                    <p>
                      This is the only time you'll see the full API key. Store it securely
                      (e.g., in a password manager or environment variable).
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <Label>Your API Key</Label>
                <div className="flex items-center gap-2 mt-2">
                  <code className="flex-1 text-sm bg-gray-100 px-4 py-3 rounded border border-gray-300 font-mono break-all">
                    {createdKey?.key}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyKey}
                    className="flex-shrink-0"
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-600">Key Name</Label>
                  <p className="text-sm font-medium">{createdKey?.name}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Key Type</Label>
                  <p className="text-sm font-medium">{createdKey?.type}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Rate Limit</Label>
                  <p className="text-sm font-medium">{createdKey?.rateLimit} req/min</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Scopes</Label>
                  <p className="text-sm font-medium">{createdKey?.scopes.length} permissions</p>
                </div>
              </div>

              {/* Usage Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-2">How to use this API key:</p>
                    <pre className="bg-blue-100 px-3 py-2 rounded text-xs font-mono overflow-x-auto">
{`curl -H "Authorization: Bearer ${createdKey?.key}" \\
     https://api.smartequiz.com/v1/users`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={handleClose}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Done - I've Saved the Key
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
