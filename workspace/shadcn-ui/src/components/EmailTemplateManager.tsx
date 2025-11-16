import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Mail,
  Send,
  Eye,
  Edit,
  Copy,
  CheckCircle,
  AlertCircle,
  Plus,
  Search
} from 'lucide-react';
import { storage, STORAGE_KEYS } from '@/lib/mockData';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  category: 'user' | 'tournament' | 'payment' | 'system';
  description: string;
  htmlContent: string;
  variables: string[];
  active: boolean;
  lastModified: string;
}

const DEFAULT_TEMPLATES: EmailTemplate[] = [
  {
    id: 'welcome',
    name: 'Welcome Email',
    subject: 'Welcome to Smart eQuiz Platform!',
    category: 'user',
    description: 'Sent to new users upon registration',
    htmlContent: `
      <h1>Welcome to Smart eQuiz Platform!</h1>
      <p>Hi {{userName}},</p>
      <p>We're excited to have you on board! Your account has been created successfully.</p>
      <p>Here's what you can do next:</p>
      <ul>
        <li>Create your first quiz</li>
        <li>Invite team members</li>
        <li>Explore tournament features</li>
      </ul>
      <a href="{{dashboardUrl}}">Go to Dashboard</a>
    `,
    variables: ['userName', 'dashboardUrl', 'supportEmail'],
    active: true,
    lastModified: new Date().toISOString()
  },
  {
    id: 'tournament-invite',
    name: 'Tournament Invitation',
    subject: 'You\'re invited to {{tournamentName}}',
    category: 'tournament',
    description: 'Sent when users are invited to tournaments',
    htmlContent: `
      <h1>Tournament Invitation</h1>
      <p>Hi {{userName}},</p>
      <p>You've been invited to participate in <strong>{{tournamentName}}</strong>!</p>
      <p><strong>Tournament Details:</strong></p>
      <ul>
        <li>Start Date: {{startDate}}</li>
        <li>Entry Fee: {{entryFee}}</li>
        <li>Participants: {{participantCount}}</li>
      </ul>
      <a href="{{tournamentUrl}}">Register Now</a>
    `,
    variables: ['userName', 'tournamentName', 'startDate', 'entryFee', 'participantCount', 'tournamentUrl'],
    active: true,
    lastModified: new Date().toISOString()
  },
  {
    id: 'payment-receipt',
    name: 'Payment Receipt',
    subject: 'Receipt for your payment - ${{amount}}',
    category: 'payment',
    description: 'Sent after successful payment',
    htmlContent: `
      <h1>Payment Receipt</h1>
      <p>Hi {{userName}},</p>
      <p>Thank you for your payment!</p>
      <p><strong>Payment Details:</strong></p>
      <ul>
        <li>Amount: {{amount}}</li>
        <li>Date: {{paymentDate}}</li>
        <li>Transaction ID: {{transactionId}}</li>
        <li>Payment Method: {{paymentMethod}}</li>
      </ul>
      <p>{{description}}</p>
      <a href="{{invoiceUrl}}">Download Invoice</a>
    `,
    variables: ['userName', 'amount', 'paymentDate', 'transactionId', 'paymentMethod', 'description', 'invoiceUrl'],
    active: true,
    lastModified: new Date().toISOString()
  },
  {
    id: 'subscription-activated',
    name: 'Subscription Activated',
    subject: 'Your {{planName}} subscription is active',
    category: 'payment',
    description: 'Sent when subscription is activated',
    htmlContent: `
      <h1>Subscription Activated</h1>
      <p>Hi {{userName}},</p>
      <p>Your <strong>{{planName}}</strong> subscription is now active!</p>
      <p><strong>Subscription Details:</strong></p>
      <ul>
        <li>Plan: {{planName}}</li>
        <li>Billing: {{billingCycle}}</li>
        <li>Next billing date: {{nextBillingDate}}</li>
        <li>Amount: {{amount}}</li>
      </ul>
      <p>You now have access to all premium features!</p>
      <a href="{{dashboardUrl}}">Explore Features</a>
    `,
    variables: ['userName', 'planName', 'billingCycle', 'nextBillingDate', 'amount', 'dashboardUrl'],
    active: true,
    lastModified: new Date().toISOString()
  },
  {
    id: 'tournament-reminder',
    name: 'Tournament Reminder',
    subject: '{{tournamentName}} starts in 24 hours!',
    category: 'tournament',
    description: 'Sent 24 hours before tournament starts',
    htmlContent: `
      <h1>Tournament Reminder</h1>
      <p>Hi {{userName}},</p>
      <p><strong>{{tournamentName}}</strong> is starting soon!</p>
      <p><strong>Starts in: 24 hours</strong></p>
      <p>Start time: {{startTime}}</p>
      <p>Make sure you're ready to compete!</p>
      <a href="{{tournamentUrl}}">View Tournament</a>
    `,
    variables: ['userName', 'tournamentName', 'startTime', 'tournamentUrl'],
    active: true,
    lastModified: new Date().toISOString()
  },
  {
    id: 'password-reset',
    name: 'Password Reset',
    subject: 'Reset your password',
    category: 'system',
    description: 'Sent when user requests password reset',
    htmlContent: `
      <h1>Password Reset Request</h1>
      <p>Hi {{userName}},</p>
      <p>We received a request to reset your password.</p>
      <p>Click the button below to create a new password:</p>
      <a href="{{resetUrl}}">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `,
    variables: ['userName', 'resetUrl'],
    active: true,
    lastModified: new Date().toISOString()
  }
];

export const EmailTemplateManager: React.FC = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | EmailTemplate['category']>('all');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = () => {
    let stored = storage.get('email_templates');
    if (!stored || stored.length === 0) {
      stored = DEFAULT_TEMPLATES;
      storage.set('email_templates', stored);
    }
    setTemplates(stored);
  };

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: EmailTemplate['category']) => {
    switch (category) {
      case 'user': return 'bg-blue-100 text-blue-800';
      case 'tournament': return 'bg-purple-100 text-purple-800';
      case 'payment': return 'bg-green-100 text-green-800';
      case 'system': return 'bg-gray-100 text-gray-800';
    }
  };

  const renderPreview = (template: EmailTemplate) => {
    // Sample data for preview
    const sampleData: Record<string, string> = {
      userName: 'John Doe',
      dashboardUrl: 'https://example.com/dashboard',
      supportEmail: 'support@example.com',
      tournamentName: 'Spring Championship 2025',
      startDate: 'March 15, 2025',
      entryFee: '$25.00',
      participantCount: '50',
      tournamentUrl: 'https://example.com/tournament/123',
      amount: '$99.00',
      paymentDate: 'November 16, 2025',
      transactionId: 'TXN-123456',
      paymentMethod: 'Credit Card',
      description: 'Monthly subscription payment',
      invoiceUrl: 'https://example.com/invoice/123',
      planName: 'Pro Plan',
      resetUrl: 'https://example.com/reset-password',
      supportLink: 'https://example.com/support'
    };

    let content = template.htmlContent;
    template.variables.forEach(variable => {
      const value = sampleData[variable] || `[${variable}]`;
      content = content.replace(
        new RegExp(`{{${variable}}}`, 'g'),
        `<strong style="background: #fef3c7; padding: 2px 6px; border-radius: 4px;">${value}</strong>`
      );
    });
    return { __html: content };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Mail className="h-8 w-8" />
          Email Templates
        </h1>
        <p className="text-gray-600 mt-1">Manage automated email notifications</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Template List */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Templates</CardTitle>
            <CardDescription>
              {templates.length} total templates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search templates..."
                className="w-full pl-9 pr-3 py-2 border rounded-md text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Category Filter */}
            <Tabs value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as any)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                <TabsTrigger value="user" className="text-xs">User</TabsTrigger>
              </TabsList>
              <TabsList className="grid w-full grid-cols-2 mt-1">
                <TabsTrigger value="tournament" className="text-xs">Tournament</TabsTrigger>
                <TabsTrigger value="payment" className="text-xs">Payment</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Template List */}
            <ScrollArea className="h-[500px]">
              <div className="space-y-2">
                {filteredTemplates.map((template) => (
                  <div
                    key={template.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedTemplate?.id === template.id
                        ? 'bg-blue-50 border-blue-300'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      setSelectedTemplate(template);
                      setPreviewMode(false);
                    }}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-semibold text-sm">{template.name}</h4>
                      {template.active && (
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{template.description}</p>
                    <Badge className={`text-xs ${getCategoryColor(template.category)}`}>
                      {template.category}
                    </Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <Button className="w-full" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </CardContent>
        </Card>

        {/* Template Editor/Preview */}
        <Card className="md:col-span-2">
          {selectedTemplate ? (
            <>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{selectedTemplate.name}</CardTitle>
                    <CardDescription>{selectedTemplate.description}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={previewMode ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPreviewMode(!previewMode)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm">
                      <Send className="h-4 w-4 mr-1" />
                      Test
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Template Info */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Subject</p>
                    <p className="font-medium text-sm">{selectedTemplate.subject}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Category</p>
                    <Badge className={getCategoryColor(selectedTemplate.category)}>
                      {selectedTemplate.category}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Status</p>
                    <Badge variant={selectedTemplate.active ? 'default' : 'secondary'}>
                      {selectedTemplate.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Last Modified</p>
                    <p className="text-sm">
                      {new Date(selectedTemplate.lastModified).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Variables */}
                <div>
                  <h4 className="font-semibold mb-2 text-sm">Available Variables</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTemplate.variables.map((variable) => (
                      <Badge
                        key={variable}
                        variant="outline"
                        className="cursor-pointer hover:bg-gray-100"
                        onClick={() => {
                          navigator.clipboard.writeText(`{{${variable}}}`);
                        }}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        {variable}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Content */}
                <div>
                  <h4 className="font-semibold mb-2 text-sm">
                    {previewMode ? 'Preview' : 'HTML Content'}
                  </h4>
                  <ScrollArea className="h-[400px] border rounded-lg">
                    {previewMode ? (
                      <div
                        className="p-6 prose max-w-none"
                        dangerouslySetInnerHTML={renderPreview(selectedTemplate)}
                      />
                    ) : (
                      <pre className="p-4 text-xs bg-gray-900 text-gray-100">
                        {selectedTemplate.htmlContent}
                      </pre>
                    )}
                  </ScrollArea>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-[600px]">
              <div className="text-center">
                <Mail className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Template Selected</h3>
                <p className="text-gray-500 text-sm">
                  Select a template from the list to view or edit
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};

export default EmailTemplateManager;
