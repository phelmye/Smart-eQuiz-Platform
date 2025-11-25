import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  Key, 
  Smartphone, 
  History, 
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  Trash2,
  Lock,
  Unlock,
  Monitor,
  MapPin,
  Clock,
  Activity
} from 'lucide-react';
import { storage, STORAGE_KEYS } from '@/lib/mockData';

interface SecurityCenterProps {
  user: any;
  onBack?: () => void;
}

interface SecuritySession {
  id: string;
  device: string;
  browser: string;
  location: string;
  ipAddress: string;
  loginTime: string;
  lastActive: string;
  current: boolean;
}

interface LoginHistory {
  id: string;
  timestamp: string;
  device: string;
  browser: string;
  location: string;
  ipAddress: string;
  status: 'success' | 'failed' | 'suspicious';
  reason?: string;
}

interface ApiKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  createdAt: string;
  lastUsed: string | null;
  expiresAt: string | null;
  active: boolean;
}

interface SecurityAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: string;
  dismissed: boolean;
}

const SecurityCenter: React.FC<SecurityCenterProps> = ({ user, onBack }) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('password');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessions, setSessions] = useState<SecuritySession[]>([]);
  const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);
  const [showApiKey, setShowApiKey] = useState<{ [key: string]: boolean }>({});
  const [newApiKeyName, setNewApiKeyName] = useState('');
  
  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordFeedback, setPasswordFeedback] = useState<string[]>([]);

  // Load security data
  useEffect(() => {
    loadSecurityData();
  }, [user]);

  const loadSecurityData = () => {
    // Load 2FA status
    const twoFactorSettings = storage.get(`${STORAGE_KEYS.USERS}_2fa_${user?.id}`) || { enabled: false };
    setTwoFactorEnabled(twoFactorSettings.enabled);

    // Load active sessions
    const mockSessions: SecuritySession[] = [
      {
        id: 'session-1',
        device: 'Windows PC',
        browser: 'Chrome 120.0',
        location: 'Lagos, Nigeria',
        ipAddress: '197.210.226.45',
        loginTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        lastActive: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        current: true
      },
      {
        id: 'session-2',
        device: 'iPhone 14',
        browser: 'Safari 17.0',
        location: 'Abuja, Nigeria',
        ipAddress: '197.210.226.78',
        loginTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        lastActive: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        current: false
      }
    ];
    setSessions(mockSessions);

    // Load login history
    const mockHistory: LoginHistory[] = [
      {
        id: 'login-1',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        device: 'Windows PC',
        browser: 'Chrome 120.0',
        location: 'Lagos, Nigeria',
        ipAddress: '197.210.226.45',
        status: 'success'
      },
      {
        id: 'login-2',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        device: 'iPhone 14',
        browser: 'Safari 17.0',
        location: 'Abuja, Nigeria',
        ipAddress: '197.210.226.78',
        status: 'success'
      },
      {
        id: 'login-3',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        device: 'Unknown Device',
        browser: 'Chrome 119.0',
        location: 'London, UK',
        ipAddress: '81.2.69.142',
        status: 'failed',
        reason: 'Invalid password'
      },
      {
        id: 'login-4',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        device: 'Windows PC',
        browser: 'Chrome 120.0',
        location: 'Lagos, Nigeria',
        ipAddress: '197.210.226.45',
        status: 'success'
      }
    ];
    setLoginHistory(mockHistory);

    // Load API keys
    const savedApiKeys = storage.get(`${STORAGE_KEYS.USERS}_api_keys_${user?.id}`) || [];
    setApiKeys(savedApiKeys);

    // Load security alerts
    const mockAlerts: SecurityAlert[] = [
      {
        id: 'alert-1',
        type: 'warning',
        title: 'Suspicious Login Attempt',
        message: 'Failed login attempt from London, UK (81.2.69.142) 3 days ago',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        dismissed: false
      },
      {
        id: 'alert-2',
        type: 'info',
        title: 'New Device Login',
        message: 'New login from iPhone 14 in Abuja, Nigeria',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        dismissed: false
      }
    ];
    setSecurityAlerts(mockAlerts);
  };

  // Calculate password strength
  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    const feedback: string[] = [];

    if (password.length >= 8) strength += 25;
    else feedback.push('Use at least 8 characters');

    if (password.length >= 12) strength += 10;
    
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    else feedback.push('Include both uppercase and lowercase letters');

    if (/\d/.test(password)) strength += 20;
    else feedback.push('Include at least one number');

    if (/[^a-zA-Z0-9]/.test(password)) strength += 20;
    else feedback.push('Include at least one special character');

    setPasswordStrength(strength);
    setPasswordFeedback(feedback);
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordForm(prev => ({ ...prev, [field]: value }));
    if (field === 'newPassword') {
      calculatePasswordStrength(value);
    }
  };

  const handleChangePassword = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match!",
        variant: "destructive"
      });
      return;
    }

    if (passwordStrength < 60) {
      toast({
        title: "Weak Password",
        description: "Password is too weak. Please use a stronger password.",
        variant: "destructive"
      });
      return;
    }

    // Simulate password change
    toast({
      title: "Success",
      description: "Password changed successfully!"
    });
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setPasswordStrength(0);
    setPasswordFeedback([]);
  };

  const handleToggle2FA = () => {
    const newStatus = !twoFactorEnabled;
    setTwoFactorEnabled(newStatus);
    storage.set(`${STORAGE_KEYS.USERS}_2fa_${user?.id}`, { enabled: newStatus });
    
    if (newStatus) {
      toast({
        title: "2FA Enabled",
        description: "Two-factor authentication enabled! You will receive a setup guide via email."
      });
    } else {
      toast({
        title: "2FA Disabled",
        description: "Two-factor authentication disabled."
      });
    }
  };

  const handleTerminateSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    toast({
      title: "Session Terminated",
      description: "Session terminated successfully."
    });
  };

  const handleGenerateApiKey = () => {
    if (!newApiKeyName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a name for the API key",
        variant: "destructive"
      });
      return;
    }

    const newKey: ApiKey = {
      id: `api-key-${Date.now()}`,
      name: newApiKeyName,
      key: `eq_${Math.random().toString(36).substr(2, 32)}`,
      permissions: ['read', 'write'],
      createdAt: new Date().toISOString(),
      lastUsed: null,
      expiresAt: null,
      active: true
    };

    const updatedKeys = [...apiKeys, newKey];
    setApiKeys(updatedKeys);
    storage.set(`${STORAGE_KEYS.USERS}_api_keys_${user?.id}`, updatedKeys);
    setNewApiKeyName('');
    toast({
      title: "API Key Generated",
      description: "API key generated successfully! Make sure to copy it now - you won't be able to see it again."
    });
  };

  const handleRevokeApiKey = (keyId: string) => {
    const updatedKeys = apiKeys.filter(k => k.id !== keyId);
    setApiKeys(updatedKeys);
    storage.set(`${STORAGE_KEYS.USERS}_api_keys_${user?.id}`, updatedKeys);
    toast({
      title: "API Key Revoked",
      description: "API key revoked successfully."
    });
  };

  const handleCopyApiKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({
      title: "Copied!",
      description: "API key copied to clipboard!"
    });
  };

  const handleDismissAlert = (alertId: string) => {
    setSecurityAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, dismissed: true } : alert
    ));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 40) return 'bg-red-500';
    if (passwordStrength < 60) return 'bg-yellow-500';
    if (passwordStrength < 80) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthLabel = () => {
    if (passwordStrength < 40) return 'Weak';
    if (passwordStrength < 60) return 'Fair';
    if (passwordStrength < 80) return 'Good';
    return 'Strong';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Shield className="h-8 w-8 text-blue-600" />
                Security Center
              </h1>
              <p className="text-gray-600 mt-2">Manage your account security and privacy settings</p>
            </div>
            {onBack && (
              <Button variant="outline" onClick={onBack}>
                Back to Dashboard
              </Button>
            )}
          </div>
        </div>

        {/* Security Alerts */}
        {securityAlerts.filter(a => !a.dismissed).length > 0 && (
          <div className="mb-6 space-y-3">
            {securityAlerts.filter(a => !a.dismissed).map(alert => (
              <Alert key={alert.id} className={
                alert.type === 'error' ? 'border-red-500 bg-red-50' :
                alert.type === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                'border-blue-500 bg-blue-50'
              }>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <div>
                    <strong>{alert.title}</strong>
                    <p className="text-sm mt-1">{alert.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{formatDate(alert.timestamp)}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDismissAlert(alert.id)}
                  >
                    Dismiss
                  </Button>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="password">
              <Lock className="h-4 w-4 mr-2" />
              Password
            </TabsTrigger>
            <TabsTrigger value="2fa">
              <Smartphone className="h-4 w-4 mr-2" />
              Two-Factor Auth
            </TabsTrigger>
            <TabsTrigger value="sessions">
              <Monitor className="h-4 w-4 mr-2" />
              Sessions
            </TabsTrigger>
            <TabsTrigger value="api-keys">
              <Key className="h-4 w-4 mr-2" />
              API Keys
            </TabsTrigger>
          </TabsList>

          {/* Password Tab */}
          <TabsContent value="password">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your password to keep your account secure</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="current-password">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordForm.currentPassword}
                      onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="new-password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordForm.newPassword}
                      onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  
                  {passwordForm.newPassword && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">Password Strength:</span>
                        <span className={`text-sm font-semibold ${
                          passwordStrength < 40 ? 'text-red-600' :
                          passwordStrength < 60 ? 'text-yellow-600' :
                          passwordStrength < 80 ? 'text-blue-600' :
                          'text-green-600'
                        }`}>
                          {getPasswordStrengthLabel()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${getPasswordStrengthColor()}`}
                          style={{ width: `${passwordStrength}%` }}
                        />
                      </div>
                      {passwordFeedback.length > 0 && (
                        <ul className="mt-2 space-y-1">
                          {passwordFeedback.map((tip, index) => (
                            <li key={index} className="text-xs text-gray-600 flex items-start gap-1">
                              <span className="text-yellow-600 mt-0.5">•</span>
                              {tip}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button onClick={handleChangePassword}>
                    Update Password
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })}
                  >
                    Cancel
                  </Button>
                </div>

                <Alert className="mt-4">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Password Requirements:</strong>
                    <ul className="mt-2 space-y-1 text-sm">
                      <li>• At least 8 characters long</li>
                      <li>• Mix of uppercase and lowercase letters</li>
                      <li>• At least one number</li>
                      <li>• At least one special character</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 2FA Tab */}
          <TabsContent value="2fa">
            <Card>
              <CardHeader>
                <CardTitle>Two-Factor Authentication</CardTitle>
                <CardDescription>Add an extra layer of security to your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${twoFactorEnabled ? 'bg-green-100' : 'bg-gray-100'}`}>
                      {twoFactorEnabled ? (
                        <Unlock className="h-5 w-5 text-green-600" />
                      ) : (
                        <Lock className="h-5 w-5 text-gray-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold">
                        Two-Factor Authentication
                      </h3>
                      <p className="text-sm text-gray-600">
                        Status: {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={twoFactorEnabled}
                    onCheckedChange={handleToggle2FA}
                  />
                </div>

                {twoFactorEnabled ? (
                  <Alert className="bg-green-50 border-green-500">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription>
                      <strong className="text-green-900">Two-factor authentication is enabled</strong>
                      <p className="text-green-800 mt-1">Your account is protected with an additional security layer.</p>
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Enhance your security</strong>
                      <p className="mt-1">Enable two-factor authentication to protect your account from unauthorized access.</p>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-4">
                  <h4 className="font-semibold">How it works:</h4>
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">1</span>
                      </div>
                      <div>
                        <p className="font-medium">Enable 2FA</p>
                        <p className="text-sm text-gray-600">Toggle the switch above to activate</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">2</span>
                      </div>
                      <div>
                        <p className="font-medium">Set up your authenticator</p>
                        <p className="text-sm text-gray-600">Use Google Authenticator or similar app</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">3</span>
                      </div>
                      <div>
                        <p className="font-medium">Enter code on login</p>
                        <p className="text-sm text-gray-600">You'll need to enter a code from your app each time you sign in</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sessions Tab */}
          <TabsContent value="sessions">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Active Sessions</CardTitle>
                  <CardDescription>Manage devices that are currently logged into your account</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {sessions.map(session => (
                      <div key={session.id} className="flex items-start justify-between p-4 border rounded-lg">
                        <div className="flex gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Monitor className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{session.device}</h4>
                              {session.current && (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                                  Current Session
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{session.browser}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {session.location}
                              </span>
                              <span>{session.ipAddress}</span>
                            </div>
                            <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                              <span>Logged in: {formatDate(session.loginTime)}</span>
                              <span>Last active: {formatDate(session.lastActive)}</span>
                            </div>
                          </div>
                        </div>
                        {!session.current && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleTerminateSession(session.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Terminate
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Login History</CardTitle>
                  <CardDescription>Recent login activity on your account</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {loginHistory.map(login => (
                      <div key={login.id} className="flex items-start gap-3 p-3 border rounded-lg">
                        <div className={`p-2 rounded-lg ${
                          login.status === 'success' ? 'bg-green-100' :
                          login.status === 'failed' ? 'bg-red-100' :
                          'bg-yellow-100'
                        }`}>
                          <Activity className={`h-4 w-4 ${
                            login.status === 'success' ? 'text-green-600' :
                            login.status === 'failed' ? 'text-red-600' :
                            'text-yellow-600'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{login.device} • {login.browser}</h4>
                            <Badge variant={
                              login.status === 'success' ? 'default' :
                              login.status === 'failed' ? 'destructive' :
                              'secondary'
                            }>
                              {login.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {login.location} • {login.ipAddress}
                          </p>
                          {login.reason && (
                            <p className="text-sm text-red-600 mt-1">{login.reason}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(login.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* API Keys Tab */}
          <TabsContent value="api-keys">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>API Keys</CardTitle>
                  <CardDescription>Manage API keys for programmatic access to your account</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-3">
                    <Input
                      placeholder="API key name (e.g., Mobile App, Integration)"
                      value={newApiKeyName}
                      onChange={(e) => setNewApiKeyName(e.target.value)}
                    />
                    <Button onClick={handleGenerateApiKey}>
                      <Key className="h-4 w-4 mr-2" />
                      Generate Key
                    </Button>
                  </div>

                  {apiKeys.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Key className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No API keys yet</p>
                      <p className="text-sm">Generate your first API key to get started</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {apiKeys.map(apiKey => (
                        <div key={apiKey.id} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold">{apiKey.name}</h4>
                              <p className="text-sm text-gray-600 mt-1">
                                Created {formatDate(apiKey.createdAt)}
                              </p>
                              {apiKey.lastUsed && (
                                <p className="text-xs text-gray-500">
                                  Last used: {formatDate(apiKey.lastUsed)}
                                </p>
                              )}
                            </div>
                            <Badge variant={apiKey.active ? 'default' : 'secondary'}>
                              {apiKey.active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-2">
                            <Input
                              type={showApiKey[apiKey.id] ? 'text' : 'password'}
                              value={apiKey.key}
                              readOnly
                              className="font-mono text-sm"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowApiKey(prev => ({ ...prev, [apiKey.id]: !prev[apiKey.id] }))}
                            >
                              {showApiKey[apiKey.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCopyApiKey(apiKey.key)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRevokeApiKey(apiKey.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="flex gap-2 mt-3">
                            {apiKey.permissions.map(permission => (
                              <Badge key={permission} variant="outline">
                                {permission}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Important:</strong> Keep your API keys secure. Never share them publicly or commit them to version control.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SecurityCenter;
