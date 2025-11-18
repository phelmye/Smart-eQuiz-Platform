import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Save, RefreshCw, Shield, Globe, Bell, Database, Zap } from 'lucide-react';
import { useAuth } from './AuthSystem';
import { TenantTextCustomization } from './TenantTextCustomization';
import { storage, STORAGE_KEYS, hasPermission } from '@/lib/mockData';

interface SystemSettingsProps {
  onBack: () => void;
}

interface SystemConfig {
  platform: {
    name: string;
    description: string;
    version: string;
    maintenanceMode: boolean;
    allowRegistration: boolean;
    defaultUserRole: string;
  };
  email: {
    enabled: boolean;
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
    fromEmail: string;
    fromName: string;
  };
  security: {
    sessionTimeout: number;
    passwordMinLength: number;
    requireEmailVerification: boolean;
    enableTwoFactor: boolean;
    maxLoginAttempts: number;
    lockoutDuration: number;
  };
  features: {
    enableAIGeneration: boolean;
    enableAnalytics: boolean;
    enablePayments: boolean;
    enableNotifications: boolean;
    enableFileUpload: boolean;
    maxFileSize: number;
  };
  limits: {
    maxUsersPerTenant: number;
    maxTournamentsPerTenant: number;
    maxQuestionsPerTournament: number;
    maxParticipantsPerTournament: number;
  };
}

const defaultConfig: SystemConfig = {
  platform: {
    name: 'Smart eQuiz Platform',
    description: 'Bible Tournament & Practice System',
    version: '1.0.0',
    maintenanceMode: false,
    allowRegistration: true,
    defaultUserRole: 'participant'
  },
  email: {
    enabled: false,
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    fromEmail: '',
    fromName: 'Smart eQuiz Platform'
  },
  security: {
    sessionTimeout: 24,
    passwordMinLength: 6,
    requireEmailVerification: false,
    enableTwoFactor: false,
    maxLoginAttempts: 5,
    lockoutDuration: 15
  },
  features: {
    enableAIGeneration: true,
    enableAnalytics: true,
    enablePayments: true,
    enableNotifications: true,
    enableFileUpload: true,
    maxFileSize: 5
  },
  limits: {
    maxUsersPerTenant: 1000,
    maxTournamentsPerTenant: 100,
    maxQuestionsPerTournament: 50,
    maxParticipantsPerTournament: 500
  }
};

export const SystemSettings: React.FC<SystemSettingsProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [config, setConfig] = useState<SystemConfig>(defaultConfig);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('platform');

  useEffect(() => {
    loadSystemConfig();
  }, []);

  const loadSystemConfig = () => {
    const savedConfig = storage.get('system_config') || defaultConfig;
    setConfig(savedConfig);
  };

  const saveSystemConfig = async () => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      storage.set('system_config', config);
      alert('System settings saved successfully!');
    } catch (error) {
      alert('Failed to save system settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetToDefaults = () => {
    if (confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
      setConfig(defaultConfig);
    }
  };

  const updateConfig = (section: keyof SystemConfig, field: string, value: string | number | boolean) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  if (!user || !hasPermission(user, 'system.settings')) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-bold text-red-600 mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-4">You need super admin privileges to access system settings.</p>
            <Button onClick={onBack}>Back to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
                <p className="text-gray-600">Configure global platform settings and preferences</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={resetToDefaults}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset to Defaults
              </Button>
              
              <Button onClick={saveSystemConfig} disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>

          {config.platform.maintenanceMode && (
            <Alert className="mb-4">
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Maintenance mode is enabled. Only super admins can access the platform.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="platform">Platform</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="limits">Limits</TabsTrigger>
            <TabsTrigger value="customization">Text</TabsTrigger>
          </TabsList>

          <TabsContent value="platform" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5" />
                  <span>Platform Configuration</span>
                </CardTitle>
                <CardDescription>Basic platform settings and information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="platform-name">Platform Name</Label>
                    <Input
                      id="platform-name"
                      value={config.platform.name}
                      onChange={(e) => updateConfig('platform', 'name', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="platform-version">Version</Label>
                    <Input
                      id="platform-version"
                      value={config.platform.version}
                      onChange={(e) => updateConfig('platform', 'version', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="platform-description">Description</Label>
                  <Textarea
                    id="platform-description"
                    value={config.platform.description}
                    onChange={(e) => updateConfig('platform', 'description', e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Maintenance Mode</Label>
                      <p className="text-sm text-gray-500">Disable platform access for maintenance</p>
                    </div>
                    <Switch
                      checked={config.platform.maintenanceMode}
                      onCheckedChange={(checked) => updateConfig('platform', 'maintenanceMode', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Allow User Registration</Label>
                      <p className="text-sm text-gray-500">Enable new user account creation</p>
                    </div>
                    <Switch
                      checked={config.platform.allowRegistration}
                      onCheckedChange={(checked) => updateConfig('platform', 'allowRegistration', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Security Settings</span>
                </CardTitle>
                <CardDescription>Configure authentication and security policies</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="session-timeout">Session Timeout (hours)</Label>
                    <Input
                      id="session-timeout"
                      type="number"
                      min="1"
                      max="168"
                      value={config.security.sessionTimeout}
                      onChange={(e) => updateConfig('security', 'sessionTimeout', parseInt(e.target.value) || 24)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="password-min-length">Minimum Password Length</Label>
                    <Input
                      id="password-min-length"
                      type="number"
                      min="6"
                      max="50"
                      value={config.security.passwordMinLength}
                      onChange={(e) => updateConfig('security', 'passwordMinLength', parseInt(e.target.value) || 6)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="max-login-attempts">Max Login Attempts</Label>
                    <Input
                      id="max-login-attempts"
                      type="number"
                      min="3"
                      max="10"
                      value={config.security.maxLoginAttempts}
                      onChange={(e) => updateConfig('security', 'maxLoginAttempts', parseInt(e.target.value) || 5)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="lockout-duration">Lockout Duration (minutes)</Label>
                    <Input
                      id="lockout-duration"
                      type="number"
                      min="5"
                      max="60"
                      value={config.security.lockoutDuration}
                      onChange={(e) => updateConfig('security', 'lockoutDuration', parseInt(e.target.value) || 15)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Require Email Verification</Label>
                      <p className="text-sm text-gray-500">Users must verify email before accessing platform</p>
                    </div>
                    <Switch
                      checked={config.security.requireEmailVerification}
                      onCheckedChange={(checked) => updateConfig('security', 'requireEmailVerification', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enable Two-Factor Authentication</Label>
                      <p className="text-sm text-gray-500">Allow users to enable 2FA for their accounts</p>
                    </div>
                    <Switch
                      checked={config.security.enableTwoFactor}
                      onCheckedChange={(checked) => updateConfig('security', 'enableTwoFactor', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="email" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>Email Configuration</span>
                </CardTitle>
                <CardDescription>Configure SMTP settings for email notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Label>Enable Email Notifications</Label>
                    <p className="text-sm text-gray-500">Send system emails and notifications</p>
                  </div>
                  <Switch
                    checked={config.email.enabled}
                    onCheckedChange={(checked) => updateConfig('email', 'enabled', checked)}
                  />
                </div>

                {config.email.enabled && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="smtp-host">SMTP Host</Label>
                        <Input
                          id="smtp-host"
                          value={config.email.smtpHost}
                          onChange={(e) => updateConfig('email', 'smtpHost', e.target.value)}
                          placeholder="smtp.gmail.com"
                        />
                      </div>

                      <div>
                        <Label htmlFor="smtp-port">SMTP Port</Label>
                        <Input
                          id="smtp-port"
                          type="number"
                          value={config.email.smtpPort}
                          onChange={(e) => updateConfig('email', 'smtpPort', parseInt(e.target.value) || 587)}
                        />
                      </div>

                      <div>
                        <Label htmlFor="smtp-user">SMTP Username</Label>
                        <Input
                          id="smtp-user"
                          value={config.email.smtpUser}
                          onChange={(e) => updateConfig('email', 'smtpUser', e.target.value)}
                        />
                      </div>

                      <div>
                        <Label htmlFor="smtp-password">SMTP Password</Label>
                        <Input
                          id="smtp-password"
                          type="password"
                          value={config.email.smtpPassword}
                          onChange={(e) => updateConfig('email', 'smtpPassword', e.target.value)}
                        />
                      </div>

                      <div>
                        <Label htmlFor="from-email">From Email</Label>
                        <Input
                          id="from-email"
                          type="email"
                          value={config.email.fromEmail}
                          onChange={(e) => updateConfig('email', 'fromEmail', e.target.value)}
                          placeholder="noreply@example.com"
                        />
                      </div>

                      <div>
                        <Label htmlFor="from-name">From Name</Label>
                        <Input
                          id="from-name"
                          value={config.email.fromName}
                          onChange={(e) => updateConfig('email', 'fromName', e.target.value)}
                        />
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>Feature Toggles</span>
                </CardTitle>
                <CardDescription>Enable or disable platform features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>AI Question Generation</Label>
                      <p className="text-sm text-gray-500">Enable AI-powered question generation</p>
                    </div>
                    <Switch
                      checked={config.features.enableAIGeneration}
                      onCheckedChange={(checked) => updateConfig('features', 'enableAIGeneration', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Analytics Dashboard</Label>
                      <p className="text-sm text-gray-500">Enable analytics and reporting features</p>
                    </div>
                    <Switch
                      checked={config.features.enableAnalytics}
                      onCheckedChange={(checked) => updateConfig('features', 'enableAnalytics', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Payment Processing</Label>
                      <p className="text-sm text-gray-500">Enable tournament entry fees and payouts</p>
                    </div>
                    <Switch
                      checked={config.features.enablePayments}
                      onCheckedChange={(checked) => updateConfig('features', 'enablePayments', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-gray-500">Enable real-time notifications</p>
                    </div>
                    <Switch
                      checked={config.features.enableNotifications}
                      onCheckedChange={(checked) => updateConfig('features', 'enableNotifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>File Upload</Label>
                      <p className="text-sm text-gray-500">Allow users to upload files and images</p>
                    </div>
                    <Switch
                      checked={config.features.enableFileUpload}
                      onCheckedChange={(checked) => updateConfig('features', 'enableFileUpload', checked)}
                    />
                  </div>
                </div>

                {config.features.enableFileUpload && (
                  <div>
                    <Label htmlFor="max-file-size">Maximum File Size (MB)</Label>
                    <Input
                      id="max-file-size"
                      type="number"
                      min="1"
                      max="100"
                      value={config.features.maxFileSize}
                      onChange={(e) => updateConfig('features', 'maxFileSize', parseInt(e.target.value) || 5)}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="limits" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5" />
                  <span>System Limits</span>
                </CardTitle>
                <CardDescription>Configure platform resource limits</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="max-users-per-tenant">Max Users per Tenant</Label>
                    <Input
                      id="max-users-per-tenant"
                      type="number"
                      min="10"
                      value={config.limits.maxUsersPerTenant}
                      onChange={(e) => updateConfig('limits', 'maxUsersPerTenant', parseInt(e.target.value) || 1000)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="max-tournaments-per-tenant">Max Tournaments per Tenant</Label>
                    <Input
                      id="max-tournaments-per-tenant"
                      type="number"
                      min="1"
                      value={config.limits.maxTournamentsPerTenant}
                      onChange={(e) => updateConfig('limits', 'maxTournamentsPerTenant', parseInt(e.target.value) || 100)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="max-questions-per-tournament">Max Questions per Tournament</Label>
                    <Input
                      id="max-questions-per-tournament"
                      type="number"
                      min="5"
                      value={config.limits.maxQuestionsPerTournament}
                      onChange={(e) => updateConfig('limits', 'maxQuestionsPerTournament', parseInt(e.target.value) || 50)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="max-participants-per-tournament">Max Participants per Tournament</Label>
                    <Input
                      id="max-participants-per-tournament"
                      type="number"
                      min="2"
                      value={config.limits.maxParticipantsPerTournament}
                      onChange={(e) => updateConfig('limits', 'maxParticipantsPerTournament', parseInt(e.target.value) || 500)}
                    />
                  </div>
                </div>

                <Alert>
                  <Database className="h-4 w-4" />
                  <AlertDescription>
                    These limits apply globally across all tenants. Individual tenant plans may have lower limits.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="customization" className="space-y-6">
            <TenantTextCustomization />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};