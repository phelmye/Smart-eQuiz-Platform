import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { 
  AlertTriangle, 
  Clock, 
  Mail, 
  Pause, 
  Play, 
  Settings, 
  TrendingUp,
  XCircle,
  CheckCircle,
  Calendar,
  DollarSign,
  Users,
  ChevronLeft,
  RefreshCw,
  Ban,
  Send
} from 'lucide-react';
import { 
  Tenant, 
  mockTenants,
  formatCurrency,
  logAuditEvent
} from '../lib/mockData';

interface DunningManagementProps {
  onBack: () => void;
}

interface DunningCase {
  id: string;
  tenantId: string;
  tenantName: string;
  invoiceId: string;
  invoiceNumber: string;
  amount: number;
  dueDate: string;
  daysPastDue: number;
  status: 'active' | 'in_grace' | 'suspended' | 'recovered' | 'written_off';
  stage: 1 | 2 | 3 | 4; // Dunning stage
  attemptsCount: number;
  lastAttemptDate?: string;
  nextAttemptDate?: string;
  emailsSent: number;
  lastEmailSent?: string;
  gracePeriodEnds?: string;
  suspendedAt?: string;
  recoveredAt?: string;
  createdAt: string;
  updatedAt?: string;
}

interface DunningSchedule {
  stage: number;
  daysAfterDue: number;
  emailTemplate: 'reminder' | 'urgent' | 'final_notice' | 'suspension_warning';
  action: 'send_email' | 'send_email_and_suspend' | 'write_off';
  description: string;
}

interface DunningConfig {
  enabled: boolean;
  gracePeriodDays: number;
  maxRetryAttempts: number;
  retryIntervalDays: number;
  suspendAfterDays: number;
  writeOffAfterDays: number;
  autoSuspend: boolean;
  notifyAdminsOnSuspension: boolean;
  schedule: DunningSchedule[];
  emailTemplates: {
    reminder: string;
    urgent: string;
    finalNotice: string;
    suspensionWarning: string;
    suspensionNotice: string;
    recoveryWelcome: string;
  };
}

const DunningManagement: React.FC<DunningManagementProps> = ({ onBack }) => {
  const [cases, setCases] = useState<DunningCase[]>([]);
  const [config, setConfig] = useState<DunningConfig>({
    enabled: true,
    gracePeriodDays: 3,
    maxRetryAttempts: 3,
    retryIntervalDays: 3,
    suspendAfterDays: 14,
    writeOffAfterDays: 90,
    autoSuspend: true,
    notifyAdminsOnSuspension: true,
    schedule: [
      { 
        stage: 1, 
        daysAfterDue: 1, 
        emailTemplate: 'reminder', 
        action: 'send_email',
        description: 'Friendly payment reminder' 
      },
      { 
        stage: 2, 
        daysAfterDue: 7, 
        emailTemplate: 'urgent', 
        action: 'send_email',
        description: 'Urgent payment notice' 
      },
      { 
        stage: 3, 
        daysAfterDue: 14, 
        emailTemplate: 'final_notice', 
        action: 'send_email',
        description: 'Final notice before suspension' 
      },
      { 
        stage: 4, 
        daysAfterDue: 21, 
        emailTemplate: 'suspension_warning', 
        action: 'send_email_and_suspend',
        description: 'Account suspended due to non-payment' 
      }
    ],
    emailTemplates: {
      reminder: 'Hi {tenant_name}, your invoice {invoice_number} for {amount} is now past due. Please submit payment at your earliest convenience.',
      urgent: 'URGENT: Your invoice {invoice_number} for {amount} is {days_overdue} days overdue. Please make payment immediately to avoid service interruption.',
      finalNotice: 'FINAL NOTICE: Your account will be suspended in 7 days if payment of {amount} is not received for invoice {invoice_number}.',
      suspensionWarning: 'Your account has been suspended due to non-payment. Invoice {invoice_number} for {amount} remains unpaid after {days_overdue} days.',
      suspensionNotice: 'Your Smart eQuiz Platform account has been suspended due to overdue payment. Contact support to restore access.',
      recoveryWelcome: 'Welcome back! Your account has been restored. Thank you for resolving your outstanding payment.'
    }
  });
  const [selectedCase, setSelectedCase] = useState<DunningCase | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showCaseDetails, setShowCaseDetails] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'grace' | 'suspended' | 'recovered'>('active');

  useEffect(() => {
    loadDunningCases();
  }, []);

  const loadDunningCases = () => {
    // Generate sample dunning cases
    const generated = generateSampleCases();
    setCases(generated);
  };

  const generateSampleCases = (): DunningCase[] => {
    const dunningCases: DunningCase[] = [];
    const now = new Date();
    
    // Simulate some overdue accounts
    const overdueAccounts = [
      { tenantId: 'tenant2', daysOverdue: 5, recovered: false },
      { tenantId: 'tenant3', daysOverdue: 15, recovered: false },
      { tenantId: 'tenant1', daysOverdue: 25, recovered: false },
      { tenantId: 'tenant2', daysOverdue: 8, recovered: true },
    ];

    overdueAccounts.forEach((account, index) => {
      const tenant = mockTenants.find(t => t.id === account.tenantId);
      if (!tenant) return;

      const dueDate = new Date(now);
      dueDate.setDate(dueDate.getDate() - account.daysOverdue);
      
      const amount = 29.99 + (Math.random() * 100);
      const invoiceNumber = `INV-2025-${String(index + 100).padStart(4, '0')}`;
      
      // Determine stage based on days overdue
      let stage: 1 | 2 | 3 | 4 = 1;
      if (account.daysOverdue >= 21) stage = 4;
      else if (account.daysOverdue >= 14) stage = 3;
      else if (account.daysOverdue >= 7) stage = 2;
      
      // Determine status
      let status: DunningCase['status'] = 'active';
      let suspendedAt: string | undefined;
      let recoveredAt: string | undefined;
      
      if (account.recovered) {
        status = 'recovered';
        recoveredAt = new Date(now.getTime() - Math.random() * 2 * 24 * 60 * 60 * 1000).toISOString();
      } else if (account.daysOverdue >= config.suspendAfterDays) {
        status = 'suspended';
        suspendedAt = new Date(dueDate.getTime() + config.suspendAfterDays * 24 * 60 * 60 * 1000).toISOString();
      } else if (account.daysOverdue <= config.gracePeriodDays) {
        status = 'in_grace';
      }

      const attemptsCount = Math.min(stage, config.maxRetryAttempts);
      const lastAttemptDate = new Date(now.getTime() - Math.random() * 24 * 60 * 60 * 1000).toISOString();
      const nextAttemptDate = status === 'active' || status === 'in_grace'
        ? new Date(now.getTime() + config.retryIntervalDays * 24 * 60 * 60 * 1000).toISOString()
        : undefined;

      const gracePeriodEnds = status === 'in_grace'
        ? new Date(dueDate.getTime() + config.gracePeriodDays * 24 * 60 * 60 * 1000).toISOString()
        : undefined;

      dunningCases.push({
        id: `case-${tenant.id}-${index}`,
        tenantId: tenant.id,
        tenantName: tenant.name,
        invoiceId: `invoice-${index}`,
        invoiceNumber,
        amount,
        dueDate: dueDate.toISOString(),
        daysPastDue: account.daysOverdue,
        status,
        stage,
        attemptsCount,
        lastAttemptDate,
        nextAttemptDate,
        emailsSent: attemptsCount,
        lastEmailSent: lastAttemptDate,
        gracePeriodEnds,
        suspendedAt,
        recoveredAt,
        createdAt: dueDate.toISOString(),
        updatedAt: new Date().toISOString()
      });
    });

    return dunningCases.sort((a, b) => b.daysPastDue - a.daysPastDue);
  };

  const handleRetryPayment = async (caseItem: DunningCase) => {
    setIsProcessing(true);
    
    // Simulate payment retry
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Update case
    const updatedCases = cases.map(c => 
      c.id === caseItem.id 
        ? { 
            ...c, 
            attemptsCount: c.attemptsCount + 1,
            lastAttemptDate: new Date().toISOString(),
            nextAttemptDate: new Date(Date.now() + config.retryIntervalDays * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date().toISOString()
          }
        : c
    );
    setCases(updatedCases);
    
    logAuditEvent({
      action: 'billing.payment_retry',
      details: `Payment retry initiated for ${caseItem.tenantName}`,
      metadata: {
        caseId: caseItem.id,
        tenantId: caseItem.tenantId,
        invoiceNumber: caseItem.invoiceNumber,
        attempt: caseItem.attemptsCount + 1
      }
    });
    
    setIsProcessing(false);
  };

  const handleSendReminder = async (caseItem: DunningCase) => {
    setIsProcessing(true);
    
    // Simulate email sending
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update case
    const updatedCases = cases.map(c => 
      c.id === caseItem.id 
        ? { 
            ...c, 
            emailsSent: c.emailsSent + 1,
            lastEmailSent: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        : c
    );
    setCases(updatedCases);
    
    logAuditEvent({
      action: 'billing.reminder_sent',
      details: `Payment reminder sent to ${caseItem.tenantName}`,
      metadata: {
        caseId: caseItem.id,
        tenantId: caseItem.tenantId,
        invoiceNumber: caseItem.invoiceNumber,
        emailCount: caseItem.emailsSent + 1
      }
    });
    
    setIsProcessing(false);
  };

  const handleSuspendAccount = async (caseItem: DunningCase) => {
    if (!confirm(`Are you sure you want to suspend ${caseItem.tenantName}? This will immediately block their access.`)) {
      return;
    }

    setIsProcessing(true);
    
    // Simulate suspension
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update case
    const updatedCases = cases.map(c => 
      c.id === caseItem.id 
        ? { 
            ...c, 
            status: 'suspended' as const,
            suspendedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        : c
    );
    setCases(updatedCases);
    
    // Update tenant in mockData (would be API call in production)
    const tenant = mockTenants.find(t => t.id === caseItem.tenantId);
    if (tenant) {
      tenant.status = 'suspended';
      tenant.suspendedAt = new Date().toISOString();
      tenant.suspensionReason = `Non-payment: Invoice ${caseItem.invoiceNumber}`;
    }
    
    logAuditEvent({
      action: 'tenant.suspended',
      details: `Tenant ${caseItem.tenantName} suspended due to non-payment`,
      metadata: {
        caseId: caseItem.id,
        tenantId: caseItem.tenantId,
        invoiceNumber: caseItem.invoiceNumber,
        daysOverdue: caseItem.daysPastDue,
        amount: caseItem.amount
      }
    });
    
    setIsProcessing(false);
    setShowCaseDetails(false);
  };

  const handleMarkPaid = async (caseItem: DunningCase) => {
    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Update case
    const updatedCases = cases.map(c => 
      c.id === caseItem.id 
        ? { 
            ...c, 
            status: 'recovered' as const,
            recoveredAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        : c
    );
    setCases(updatedCases);
    
    // Reactivate tenant if suspended
    const tenant = mockTenants.find(t => t.id === caseItem.tenantId);
    if (tenant && tenant.status === 'suspended') {
      tenant.status = 'active';
      tenant.suspendedAt = undefined;
      tenant.suspensionReason = undefined;
    }
    
    logAuditEvent({
      action: 'billing.payment_recovered',
      details: `Payment recovered for ${caseItem.tenantName}`,
      metadata: {
        caseId: caseItem.id,
        tenantId: caseItem.tenantId,
        invoiceNumber: caseItem.invoiceNumber,
        amount: caseItem.amount,
        daysToRecover: caseItem.daysPastDue
      }
    });
    
    setIsProcessing(false);
    setShowCaseDetails(false);
  };

  const handleSaveSettings = () => {
    logAuditEvent({
      action: 'system.dunning_settings_updated',
      details: 'Dunning management settings updated',
      metadata: config
    });
    setShowSettings(false);
  };

  const getStatusBadge = (status: DunningCase['status']) => {
    const variants = {
      active: { variant: 'default' as const, icon: Clock, color: 'text-blue-600', label: 'Active' },
      in_grace: { variant: 'secondary' as const, icon: Clock, color: 'text-yellow-600', label: 'Grace Period' },
      suspended: { variant: 'destructive' as const, icon: Ban, color: 'text-red-600', label: 'Suspended' },
      recovered: { variant: 'default' as const, icon: CheckCircle, color: 'text-green-600', label: 'Recovered' },
      written_off: { variant: 'secondary' as const, icon: XCircle, color: 'text-gray-600', label: 'Written Off' }
    };
    
    const config = variants[status];
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant}>
        <Icon className={`h-3 w-3 mr-1 ${config.color}`} />
        {config.label}
      </Badge>
    );
  };

  const getStageBadge = (stage: number) => {
    const colors = ['bg-blue-100 text-blue-800', 'bg-yellow-100 text-yellow-800', 'bg-orange-100 text-orange-800', 'bg-red-100 text-red-800'];
    return (
      <Badge variant="secondary" className={colors[stage - 1] || colors[0]}>
        Stage {stage}
      </Badge>
    );
  };

  const getFilteredCases = () => {
    switch (activeTab) {
      case 'grace':
        return cases.filter(c => c.status === 'in_grace');
      case 'suspended':
        return cases.filter(c => c.status === 'suspended');
      case 'recovered':
        return cases.filter(c => c.status === 'recovered');
      default:
        return cases.filter(c => c.status === 'active');
    }
  };

  const getStatistics = () => {
    const activeCases = cases.filter(c => c.status === 'active' || c.status === 'in_grace');
    const suspendedCases = cases.filter(c => c.status === 'suspended');
    const recoveredCases = cases.filter(c => c.status === 'recovered');
    
    return {
      totalCases: cases.length,
      activeCases: activeCases.length,
      activeAmount: activeCases.reduce((sum, c) => sum + c.amount, 0),
      suspendedCases: suspendedCases.length,
      suspendedAmount: suspendedCases.reduce((sum, c) => sum + c.amount, 0),
      recoveredCases: recoveredCases.length,
      recoveredAmount: recoveredCases.reduce((sum, c) => sum + c.amount, 0),
      recoveryRate: cases.length > 0 ? (recoveredCases.length / cases.length * 100) : 0,
      averageDaysToRecover: recoveredCases.length > 0 
        ? recoveredCases.reduce((sum, c) => sum + c.daysPastDue, 0) / recoveredCases.length 
        : 0
    };
  };

  const stats = getStatistics();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Dunning Management</h1>
            <p className="text-gray-600 mt-1">Automated payment recovery and account suspension</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setShowSettings(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button onClick={loadDunningCases} disabled={isProcessing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isProcessing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Status Alert */}
      <Alert className={config.enabled ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {config.enabled ? (
              <Play className="h-4 w-4 text-green-600 mr-2" />
            ) : (
              <Pause className="h-4 w-4 text-yellow-600 mr-2" />
            )}
            <AlertDescription className={config.enabled ? 'text-green-800' : 'text-yellow-800'}>
              {config.enabled ? (
                <>
                  Automated dunning is <strong>enabled</strong>. 
                  Grace period: {config.gracePeriodDays} days. 
                  Auto-suspend after: {config.suspendAfterDays} days overdue.
                </>
              ) : (
                <>
                  Automated dunning is <strong>disabled</strong>. 
                  Payment failures must be handled manually.
                </>
              )}
            </AlertDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setConfig({ ...config, enabled: !config.enabled })}
          >
            {config.enabled ? 'Disable' : 'Enable'}
          </Button>
        </div>
      </Alert>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Active Cases</CardDescription>
            <CardTitle className="text-2xl">{stats.activeCases}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              {formatCurrency(stats.activeAmount)} at risk
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Suspended</CardDescription>
            <CardTitle className="text-2xl text-red-600">{stats.suspendedCases}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              {formatCurrency(stats.suspendedAmount)} outstanding
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Recovered</CardDescription>
            <CardTitle className="text-2xl text-green-600">{stats.recoveredCases}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              {formatCurrency(stats.recoveredAmount)} collected
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Recovery Rate</CardDescription>
            <CardTitle className="text-2xl">{stats.recoveryRate.toFixed(1)}%</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Avg {stats.averageDaysToRecover.toFixed(0)} days to recover
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dunning Cases List */}
      <Card>
        <CardHeader>
          <CardTitle>Dunning Cases</CardTitle>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList>
              <TabsTrigger value="active">
                Active ({cases.filter(c => c.status === 'active').length})
              </TabsTrigger>
              <TabsTrigger value="grace">
                Grace Period ({cases.filter(c => c.status === 'in_grace').length})
              </TabsTrigger>
              <TabsTrigger value="suspended">
                Suspended ({cases.filter(c => c.status === 'suspended').length})
              </TabsTrigger>
              <TabsTrigger value="recovered">
                Recovered ({cases.filter(c => c.status === 'recovered').length})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {getFilteredCases().map(caseItem => (
              <div key={caseItem.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div>
                      <div className="font-medium">{caseItem.tenantName}</div>
                      <div className="text-sm text-gray-600">{caseItem.invoiceNumber}</div>
                    </div>
                    {getStatusBadge(caseItem.status)}
                    {getStageBadge(caseItem.stage)}
                  </div>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <span className="text-red-600 font-medium">{caseItem.daysPastDue} days overdue</span>
                    <span>Due: {new Date(caseItem.dueDate).toLocaleDateString()}</span>
                    <span>{caseItem.emailsSent} emails sent</span>
                    <span>{caseItem.attemptsCount} retry attempts</span>
                  </div>
                  {caseItem.nextAttemptDate && (
                    <div className="text-xs text-gray-400 mt-1">
                      Next attempt: {new Date(caseItem.nextAttemptDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="font-semibold text-red-600">{formatCurrency(caseItem.amount)}</div>
                    <div className="text-sm text-gray-500">Amount Due</div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedCase(caseItem);
                      setShowCaseDetails(true);
                    }}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            ))}
            
            {getFilteredCases().length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No cases found for this filter
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Case Details Dialog */}
      <Dialog open={showCaseDetails} onOpenChange={setShowCaseDetails}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Dunning Case Details</DialogTitle>
          </DialogHeader>
          
          {selectedCase && (
            <div className="space-y-6 py-4">
              <div className="flex justify-between items-start border-b pb-4">
                <div>
                  <h2 className="text-2xl font-bold">{selectedCase.tenantName}</h2>
                  <p className="text-gray-600">{selectedCase.invoiceNumber}</p>
                </div>
                <div className="text-right">
                  {getStatusBadge(selectedCase.status)}
                  <div className="mt-2">{getStageBadge(selectedCase.stage)}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Invoice Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-medium text-red-600">{formatCurrency(selectedCase.amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Due Date:</span>
                      <span>{new Date(selectedCase.dueDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Days Overdue:</span>
                      <span className="font-medium text-red-600">{selectedCase.daysPastDue} days</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Recovery Progress</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Emails Sent:</span>
                      <span>{selectedCase.emailsSent}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Attempts:</span>
                      <span>{selectedCase.attemptsCount} / {config.maxRetryAttempts}</span>
                    </div>
                    {selectedCase.lastEmailSent && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last Email:</span>
                        <span>{new Date(selectedCase.lastEmailSent).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {selectedCase.gracePeriodEnds && (
                <Alert className="border-yellow-200 bg-yellow-50">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    Grace period ends: {new Date(selectedCase.gracePeriodEnds).toLocaleDateString()}
                  </AlertDescription>
                </Alert>
              )}

              {selectedCase.suspendedAt && (
                <Alert className="border-red-200 bg-red-50">
                  <Ban className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    Account suspended on: {new Date(selectedCase.suspendedAt).toLocaleDateString()}
                  </AlertDescription>
                </Alert>
              )}

              {selectedCase.recoveredAt && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Payment recovered on: {new Date(selectedCase.recoveredAt).toLocaleDateString()}
                  </AlertDescription>
                </Alert>
              )}

              <div>
                <h3 className="font-semibold mb-3">Dunning Schedule</h3>
                <div className="space-y-2">
                  {config.schedule.map((stage, index) => (
                    <div 
                      key={index} 
                      className={`p-3 rounded border ${selectedCase.stage >= stage.stage ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'}`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">Stage {stage.stage}: {stage.description}</div>
                          <div className="text-sm text-gray-600 mt-1">
                            Day {stage.daysAfterDue} after due date
                          </div>
                        </div>
                        {selectedCase.stage === stage.stage && (
                          <Badge variant="default">Current</Badge>
                        )}
                        {selectedCase.stage > stage.stage && (
                          <Badge variant="secondary">Completed</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex justify-between">
            <div className="flex space-x-2">
              {selectedCase && selectedCase.status !== 'recovered' && selectedCase.status !== 'written_off' && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => selectedCase && handleSendReminder(selectedCase)}
                    disabled={isProcessing}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Reminder
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => selectedCase && handleRetryPayment(selectedCase)}
                    disabled={isProcessing || selectedCase.attemptsCount >= config.maxRetryAttempts}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry Payment
                  </Button>
                </>
              )}
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setShowCaseDetails(false)}>
                Close
              </Button>
              {selectedCase && selectedCase.status !== 'recovered' && selectedCase.status !== 'written_off' && (
                <>
                  {selectedCase.status !== 'suspended' && (
                    <Button
                      variant="destructive"
                      onClick={() => selectedCase && handleSuspendAccount(selectedCase)}
                      disabled={isProcessing}
                    >
                      <Ban className="h-4 w-4 mr-2" />
                      Suspend Account
                    </Button>
                  )}
                  <Button
                    onClick={() => selectedCase && handleMarkPaid(selectedCase)}
                    disabled={isProcessing}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Paid
                  </Button>
                </>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Dunning Management Settings</DialogTitle>
            <DialogDescription>
              Configure automated payment recovery and suspension rules
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <h3 className="font-semibold">Timing Configuration</h3>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gracePeriod">Grace Period (Days)</Label>
                  <Input
                    id="gracePeriod"
                    type="number"
                    min="0"
                    max="30"
                    value={config.gracePeriodDays}
                    onChange={(e) => setConfig({ ...config, gracePeriodDays: parseInt(e.target.value) })}
                  />
                  <p className="text-xs text-gray-500">Days before dunning starts</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="suspendAfter">Auto-Suspend After (Days)</Label>
                  <Input
                    id="suspendAfter"
                    type="number"
                    min="1"
                    max="90"
                    value={config.suspendAfterDays}
                    onChange={(e) => setConfig({ ...config, suspendAfterDays: parseInt(e.target.value) })}
                  />
                  <p className="text-xs text-gray-500">Days overdue before suspension</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="retryInterval">Retry Interval (Days)</Label>
                  <Input
                    id="retryInterval"
                    type="number"
                    min="1"
                    max="30"
                    value={config.retryIntervalDays}
                    onChange={(e) => setConfig({ ...config, retryIntervalDays: parseInt(e.target.value) })}
                  />
                  <p className="text-xs text-gray-500">Days between retry attempts</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxRetries">Max Retry Attempts</Label>
                  <Input
                    id="maxRetries"
                    type="number"
                    min="1"
                    max="10"
                    value={config.maxRetryAttempts}
                    onChange={(e) => setConfig({ ...config, maxRetryAttempts: parseInt(e.target.value) })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="writeOffAfter">Write Off After (Days)</Label>
                  <Input
                    id="writeOffAfter"
                    type="number"
                    min="30"
                    max="365"
                    value={config.writeOffAfterDays}
                    onChange={(e) => setConfig({ ...config, writeOffAfterDays: parseInt(e.target.value) })}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Automation Settings</h3>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-Suspend Accounts</Label>
                  <p className="text-xs text-gray-500">Automatically suspend after grace period</p>
                </div>
                <input
                  type="checkbox"
                  checked={config.autoSuspend}
                  onChange={(e) => setConfig({ ...config, autoSuspend: e.target.checked })}
                  className="h-4 w-4"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Notify Admins on Suspension</Label>
                  <p className="text-xs text-gray-500">Send email when account is suspended</p>
                </div>
                <input
                  type="checkbox"
                  checked={config.notifyAdminsOnSuspension}
                  onChange={(e) => setConfig({ ...config, notifyAdminsOnSuspension: e.target.checked })}
                  className="h-4 w-4"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Dunning Schedule</h3>
              <div className="text-sm text-gray-600 mb-2">
                Configure when emails are sent based on days overdue
              </div>
              
              {config.schedule.map((stage, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Stage {stage.stage}</Label>
                      <Input
                        type="number"
                        min="0"
                        max="90"
                        value={stage.daysAfterDue}
                        onChange={(e) => {
                          const newSchedule = [...config.schedule];
                          newSchedule[index].daysAfterDue = parseInt(e.target.value);
                          setConfig({ ...config, schedule: newSchedule });
                        }}
                      />
                      <p className="text-xs text-gray-500">Days after due</p>
                    </div>
                    
                    <div className="space-y-2 col-span-2">
                      <Label>Description</Label>
                      <Input
                        value={stage.description}
                        onChange={(e) => {
                          const newSchedule = [...config.schedule];
                          newSchedule[index].description = e.target.value;
                          setConfig({ ...config, schedule: newSchedule });
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettings(false)}>Cancel</Button>
            <Button onClick={handleSaveSettings}>Save Settings</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DunningManagement;
