import { useState } from 'react';
import { Save, Plus, Mail, Bell, Shield, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

export default function Settings() {
  const [emailTemplates] = useState([ // setEmailTemplates unused
    // Authentication & Onboarding
    { id: '1', name: 'Welcome Email', subject: 'Welcome to Smart eQuiz Platform!', type: 'onboarding', category: 'Auth' },
    { id: '2', name: 'Email Verification', subject: 'Verify your email address', type: 'auth', category: 'Auth' },
    { id: '3', name: 'Password Reset Request', subject: 'Reset your password', type: 'auth', category: 'Auth' },
    { id: '4', name: 'Password Reset Confirmation', subject: 'Your password has been reset', type: 'auth', category: 'Auth' },
    { id: '5', name: 'Email Change Confirmation', subject: 'Confirm your new email address', type: 'auth', category: 'Auth' },
    
    // Billing & Subscriptions
    { id: '6', name: 'Invoice', subject: 'Your invoice is ready', type: 'billing', category: 'Billing' },
    { id: '7', name: 'Payment Receipt', subject: 'Payment received - Thank you!', type: 'billing', category: 'Billing' },
    { id: '8', name: 'Payment Failed', subject: 'Payment failed - Action required', type: 'billing', category: 'Billing' },
    { id: '9', name: 'Subscription Upgrade', subject: 'Subscription upgraded successfully', type: 'billing', category: 'Billing' },
    { id: '10', name: 'Subscription Downgrade', subject: 'Subscription downgraded', type: 'billing', category: 'Billing' },
    { id: '11', name: 'Subscription Renewal', subject: 'Subscription renewed successfully', type: 'billing', category: 'Billing' },
    { id: '12', name: 'Subscription Expiring Soon', subject: 'Your subscription expires in 7 days', type: 'billing', category: 'Billing' },
    { id: '13', name: 'Trial Ending Soon', subject: 'Your trial ends in 3 days', type: 'billing', category: 'Billing' },
    { id: '14', name: 'Trial Ended', subject: 'Your trial has ended', type: 'billing', category: 'Billing' },
    { id: '15', name: 'Subscription Canceled', subject: 'Subscription canceled', type: 'billing', category: 'Billing' },
    
    // Tenant Management
    { id: '16', name: 'Tenant Account Created', subject: 'Your organization account is ready', type: 'tenant', category: 'Tenant' },
    { id: '17', name: 'User Invitation', subject: 'You\'ve been invited to join an organization', type: 'tenant', category: 'Tenant' },
    { id: '18', name: 'User Added to Organization', subject: 'You\'ve been added to an organization', type: 'tenant', category: 'Tenant' },
    { id: '19', name: 'User Removed from Organization', subject: 'You\'ve been removed from an organization', type: 'tenant', category: 'Tenant' },
    { id: '20', name: 'Role Changed', subject: 'Your role has been updated', type: 'tenant', category: 'Tenant' },
    
    // Notifications & Alerts
    { id: '21', name: 'Usage Limit Warning', subject: 'Usage limit warning - 80% reached', type: 'notification', category: 'Alerts' },
    { id: '22', name: 'Usage Limit Exceeded', subject: 'Usage limit exceeded', type: 'notification', category: 'Alerts' },
    { id: '23', name: 'Security Alert', subject: 'Unusual login activity detected', type: 'security', category: 'Alerts' },
    { id: '24', name: '2FA Enabled', subject: 'Two-factor authentication enabled', type: 'security', category: 'Alerts' },
    { id: '25', name: '2FA Disabled', subject: 'Two-factor authentication disabled', type: 'security', category: 'Alerts' },
    
    // Support & Communication
    { id: '26', name: 'Support Ticket Created', subject: 'Support ticket #{ticketId} created', type: 'support', category: 'Support' },
    { id: '27', name: 'Support Ticket Response', subject: 'New response on ticket #{ticketId}', type: 'support', category: 'Support' },
    { id: '28', name: 'Support Ticket Resolved', subject: 'Support ticket #{ticketId} resolved', type: 'support', category: 'Support' },
    { id: '29', name: 'System Maintenance Notice', subject: 'Scheduled maintenance on {date}', type: 'notification', category: 'Support' },
    { id: '30', name: 'Feature Announcement', subject: 'New feature: {featureName}', type: 'notification', category: 'Support' },
    
    // Marketing & Engagement
    { id: '31', name: 'Product Update Newsletter', subject: 'What\'s new in Smart eQuiz Platform', type: 'marketing', category: 'Marketing' },
    { id: '32', name: 'Re-engagement Email', subject: 'We miss you! Here\'s what you\'ve missed', type: 'marketing', category: 'Marketing' },
    { id: '33', name: 'Feature Tips', subject: 'Tips to get more from Smart eQuiz Platform', type: 'marketing', category: 'Marketing' },
    { id: '34', name: 'Customer Feedback Request', subject: 'How are we doing?', type: 'marketing', category: 'Marketing' },
    { id: '35', name: 'Referral Program', subject: 'Refer a friend and earn rewards', type: 'marketing', category: 'Marketing' },
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
        <p className="text-gray-500 mt-1">Configure platform settings and preferences</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">
            <Globe className="mr-2 h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="mr-2 h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="email">
            <Mail className="mr-2 h-4 w-4" />
            Email Templates
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Manage your platform's general configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="platform-name">Platform Name</Label>
                  <Input id="platform-name" defaultValue="Smart eQuiz Platform" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="support-email">Support Email</Label>
                  <Input id="support-email" type="email" defaultValue="support@equiz.com" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select defaultValue="utc">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="utc">UTC</SelectItem>
                      <SelectItem value="est">EST</SelectItem>
                      <SelectItem value="pst">PST</SelectItem>
                      <SelectItem value="cst">CST</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select defaultValue="usd">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usd">USD</SelectItem>
                      <SelectItem value="eur">EUR</SelectItem>
                      <SelectItem value="gbp">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                <Select defaultValue="off">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="off">Off</SelectItem>
                    <SelectItem value="on">On</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500">
                  Enable maintenance mode to temporarily disable access for all users
                </p>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => {
                  // TODO: Implement general settings save functionality
                  console.log('General settings saved successfully');
                }}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Configure security and authentication settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Two-Factor Authentication</h4>
                    <p className="text-sm text-gray-500">
                      Require 2FA for all admin accounts
                    </p>
                  </div>
                  <Select defaultValue="optional">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="disabled">Disabled</SelectItem>
                      <SelectItem value="optional">Optional</SelectItem>
                      <SelectItem value="required">Required</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Session Timeout</h4>
                    <p className="text-sm text-gray-500">
                      Automatically log out inactive users
                    </p>
                  </div>
                  <Select defaultValue="30">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Password Policy</h4>
                    <p className="text-sm text-gray-500">
                      Minimum password requirements
                    </p>
                  </div>
                  <Select defaultValue="strong">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weak">Weak (6+ chars)</SelectItem>
                      <SelectItem value="medium">Medium (8+ chars)</SelectItem>
                      <SelectItem value="strong">Strong (12+ chars)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">IP Whitelist</h4>
                    <p className="text-sm text-gray-500">
                      Restrict access to specific IP addresses
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => console.log('Configure IP whitelist')}>
                    Configure
                  </Button>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => {
                  // TODO: Implement security settings save functionality
                  console.log('Security settings saved successfully');
                }}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure notification preferences and channels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">New Tenant Signup</h4>
                    <p className="text-sm text-gray-500">
                      Get notified when a new tenant signs up
                    </p>
                  </div>
                  <Select defaultValue="email">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="disabled">Disabled</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="slack">Slack</SelectItem>
                      <SelectItem value="both">Email + Slack</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Payment Received</h4>
                    <p className="text-sm text-gray-500">
                      Notifications for successful payments
                    </p>
                  </div>
                  <Select defaultValue="email">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="disabled">Disabled</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="slack">Slack</SelectItem>
                      <SelectItem value="both">Email + Slack</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Payment Failed</h4>
                    <p className="text-sm text-gray-500">
                      Alerts for failed payment attempts
                    </p>
                  </div>
                  <Select defaultValue="both">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="disabled">Disabled</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="slack">Slack</SelectItem>
                      <SelectItem value="both">Email + Slack</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">System Errors</h4>
                    <p className="text-sm text-gray-500">
                      Critical system error notifications
                    </p>
                  </div>
                  <Select defaultValue="both">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="disabled">Disabled</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="slack">Slack</SelectItem>
                      <SelectItem value="both">Email + Slack</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end">
                <Button>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Templates */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Email Templates</CardTitle>
                  <CardDescription>
                    Customize email templates sent to users ({emailTemplates.length} templates)
                  </CardDescription>
                </div>
                <Button size="sm" onClick={() => {
                  // TODO: Implement create new email template functionality
                  console.log('Create new email template');
                }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Template
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">📧 Comprehensive Email System</h4>
                <p className="text-sm text-blue-800">
                  All essential enterprise SaaS email templates are included. Each template supports:
                  <span className="ml-2">✓ Variable substitution</span>
                  <span className="ml-2">✓ HTML/Plain text</span>
                  <span className="ml-2">✓ Custom branding</span>
                  <span className="ml-2">✓ Multi-language</span>
                </p>
              </div>

              <div className="space-y-6">
                {['Auth', 'Billing', 'Tenant', 'Alerts', 'Support', 'Marketing'].map((category) => {
                  const categoryTemplates = emailTemplates.filter(t => t.category === category);
                  if (categoryTemplates.length === 0) return null;

                  return (
                    <div key={category} className="space-y-2">
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        {category === 'Auth' && '🔐'}
                        {category === 'Billing' && '💳'}
                        {category === 'Tenant' && '🏢'}
                        {category === 'Alerts' && '⚠️'}
                        {category === 'Support' && '💬'}
                        {category === 'Marketing' && '📢'}
                        {category} Templates ({categoryTemplates.length})
                      </h3>
                      <div className="grid gap-3">
                        {categoryTemplates.map((template) => (
                          <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{template.name}</h4>
                                <Badge variant="secondary" className="text-xs">{template.type}</Badge>
                              </div>
                              <p className="text-sm text-gray-500 mt-1">{template.subject}</p>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => {
                                // TODO: Implement edit template functionality
                                console.log(`Edit template: ${template.name}`);
                              }}>
                                Edit
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => {
                                // TODO: Implement preview template functionality
                                console.log(`Preview template: ${template.name}`);
                              }}>
                                Preview
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
