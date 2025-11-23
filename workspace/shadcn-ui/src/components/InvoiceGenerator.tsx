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
import { 
  FileText, 
  Download, 
  Send, 
  Calendar, 
  DollarSign, 
  Settings, 
  Play, 
  Pause,
  CheckCircle,
  AlertCircle,
  Clock,
  ChevronLeft,
  RefreshCw
} from 'lucide-react';
import { 
  Tenant, 
  Plan, 
  TenantBilling,
  mockTenants,
  defaultPlans,
  mockBilling,
  formatCurrency,
  logAuditEvent
} from '../lib/mockData';

interface InvoiceGeneratorProps {
  onBack: () => void;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  tenantId: string;
  tenantName: string;
  planId: string;
  planName: string;
  billingCycle: 'monthly' | 'yearly';
  amount: number;
  taxAmount: number;
  totalAmount: number;
  status: 'draft' | 'scheduled' | 'sent' | 'paid' | 'overdue' | 'void';
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  lineItems: InvoiceLineItem[];
  notes?: string;
  emailSent: boolean;
  emailSentAt?: string;
  createdAt: string;
  updatedAt?: string;
}

interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

interface ScheduleConfig {
  enabled: boolean;
  dayOfMonth: number; // 1-28
  generateDaysBefore: number; // Days before due date to generate
  sendImmediately: boolean;
  taxRate: number; // Percentage
  paymentTermsDays: number; // Days until due
  emailTemplate: string;
  autoRetryFailed: boolean;
  notifyOnFailure: boolean;
}

const InvoiceGenerator: React.FC<InvoiceGeneratorProps> = ({ onBack }) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [scheduleConfig, setScheduleConfig] = useState<ScheduleConfig>({
    enabled: true,
    dayOfMonth: 1,
    generateDaysBefore: 3,
    sendImmediately: true,
    taxRate: 0,
    paymentTermsDays: 14,
    emailTemplate: 'default',
    autoRetryFailed: true,
    notifyOnFailure: true
  });
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'scheduled' | 'sent' | 'overdue'>('all');

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = () => {
    // Generate some sample invoices
    const generated = generateSampleInvoices();
    setInvoices(generated);
  };

  const generateSampleInvoices = (): Invoice[] => {
    const invoiceList: Invoice[] = [];
    const now = new Date();
    
    // Generate invoices for active paid subscriptions
    const paidTenants = mockBilling.filter(b => 
      b.status === 'active' && 
      b.planId !== 'plan-free'
    );

    paidTenants.forEach((billing, index) => {
      const tenant = mockTenants.find(t => t.id === billing.tenantId);
      const plan = defaultPlans.find(p => p.id === billing.planId);
      
      if (!tenant || !plan) return;

      // Calculate amounts
      const baseAmount = billing.billingCycle === 'monthly' 
        ? plan.monthlyPrice 
        : plan.monthlyPrice * 12 * (1 - plan.yearlyDiscountPercent / 100);
      
      const taxAmount = baseAmount * (scheduleConfig.taxRate / 100);
      const totalAmount = baseAmount + taxAmount;

      // Generate current month invoice
      const invoiceNumber = `INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${String(index + 1).padStart(4, '0')}`;
      
      const periodStart = new Date(billing.currentPeriodStart);
      const periodEnd = new Date(billing.currentPeriodEnd);
      const issueDate = new Date(periodStart);
      issueDate.setDate(issueDate.getDate() - scheduleConfig.generateDaysBefore);
      
      const dueDate = new Date(issueDate);
      dueDate.setDate(dueDate.getDate() + scheduleConfig.paymentTermsDays);

      // Determine status
      let status: Invoice['status'] = 'sent';
      let paidDate: string | undefined;
      
      if (billing.status === 'active') {
        if (new Date() < issueDate) {
          status = 'scheduled';
        } else if (new Date() > dueDate) {
          status = Math.random() > 0.8 ? 'overdue' : 'paid';
          if (status === 'paid') {
            paidDate = new Date(dueDate.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString();
          }
        } else {
          status = Math.random() > 0.3 ? 'paid' : 'sent';
          if (status === 'paid') {
            paidDate = new Date().toISOString();
          }
        }
      }

      invoiceList.push({
        id: `invoice-${tenant.id}-${index}`,
        invoiceNumber,
        tenantId: tenant.id,
        tenantName: tenant.name,
        planId: plan.id,
        planName: plan.displayName,
        billingCycle: billing.billingCycle,
        amount: baseAmount,
        taxAmount,
        totalAmount,
        status,
        issueDate: issueDate.toISOString(),
        dueDate: dueDate.toISOString(),
        paidDate,
        billingPeriodStart: periodStart.toISOString(),
        billingPeriodEnd: periodEnd.toISOString(),
        lineItems: [
          {
            description: `${plan.displayName} - ${billing.billingCycle === 'monthly' ? 'Monthly' : 'Annual'} Subscription`,
            quantity: 1,
            unitPrice: baseAmount,
            amount: baseAmount
          }
        ],
        notes: billing.billingCycle === 'yearly' && plan.yearlyDiscountPercent > 0
          ? `Includes ${plan.yearlyDiscountPercent}% annual discount`
          : undefined,
        emailSent: status !== 'scheduled' && status !== 'draft',
        emailSentAt: status !== 'scheduled' && status !== 'draft' ? issueDate.toISOString() : undefined,
        createdAt: issueDate.toISOString(),
        updatedAt: new Date().toISOString()
      });
    });

    return invoiceList.sort((a, b) => 
      new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()
    );
  };

  const handleGenerateInvoices = async () => {
    setIsGenerating(true);
    
    // Simulate invoice generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Log audit event
    logAuditEvent({
      action: 'billing.invoices_generated',
      details: `Generated ${mockBilling.filter(b => b.planId !== 'plan-free').length} invoices for billing cycle`,
      metadata: {
        scheduleEnabled: scheduleConfig.enabled,
        sendImmediately: scheduleConfig.sendImmediately
      }
    });
    
    loadInvoices();
    setIsGenerating(false);
  };

  const handleSendInvoice = async (invoice: Invoice) => {
    setIsSending(true);
    
    // Simulate email sending
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Update invoice status
    const updatedInvoices = invoices.map(inv => 
      inv.id === invoice.id 
        ? { ...inv, status: 'sent' as const, emailSent: true, emailSentAt: new Date().toISOString() }
        : inv
    );
    setInvoices(updatedInvoices);
    
    // Log audit event
    logAuditEvent({
      action: 'billing.invoice_sent',
      details: `Invoice ${invoice.invoiceNumber} sent to ${invoice.tenantName}`,
      metadata: {
        invoiceId: invoice.id,
        tenantId: invoice.tenantId,
        amount: invoice.totalAmount
      }
    });
    
    setIsSending(false);
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    // Simulate PDF download
    console.log('Downloading invoice:', invoice.invoiceNumber);
    
    logAuditEvent({
      action: 'billing.invoice_downloaded',
      details: `Invoice ${invoice.invoiceNumber} downloaded`,
      metadata: {
        invoiceId: invoice.id,
        tenantId: invoice.tenantId
      }
    });
  };

  const handleSaveSettings = () => {
    logAuditEvent({
      action: 'system.billing_settings_updated',
      details: 'Invoice generation settings updated',
      metadata: scheduleConfig
    });
    setShowSettings(false);
  };

  const getStatusBadge = (status: Invoice['status']) => {
    const variants = {
      draft: { variant: 'secondary' as const, icon: Clock, color: 'text-gray-600' },
      scheduled: { variant: 'secondary' as const, icon: Calendar, color: 'text-blue-600' },
      sent: { variant: 'default' as const, icon: Send, color: 'text-blue-600' },
      paid: { variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' },
      overdue: { variant: 'destructive' as const, icon: AlertCircle, color: 'text-red-600' },
      void: { variant: 'secondary' as const, icon: AlertCircle, color: 'text-gray-400' }
    };
    
    const config = variants[status];
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="capitalize">
        <Icon className={`h-3 w-3 mr-1 ${config.color}`} />
        {status}
      </Badge>
    );
  };

  const getFilteredInvoices = () => {
    switch (activeTab) {
      case 'scheduled':
        return invoices.filter(inv => inv.status === 'scheduled');
      case 'sent':
        return invoices.filter(inv => inv.status === 'sent');
      case 'overdue':
        return invoices.filter(inv => inv.status === 'overdue');
      default:
        return invoices;
    }
  };

  const getTotals = () => {
    const filtered = getFilteredInvoices();
    return {
      count: filtered.length,
      total: filtered.reduce((sum, inv) => sum + inv.totalAmount, 0),
      paid: filtered.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.totalAmount, 0),
      pending: filtered.filter(inv => inv.status === 'sent' || inv.status === 'scheduled').reduce((sum, inv) => sum + inv.totalAmount, 0),
      overdue: filtered.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.totalAmount, 0)
    };
  };

  const totals = getTotals();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Invoice Generator</h1>
            <p className="text-gray-600 mt-1">Automated billing and invoice management</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setShowSettings(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button onClick={handleGenerateInvoices} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Generate Invoices
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Schedule Status Alert */}
      <Alert className={scheduleConfig.enabled ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {scheduleConfig.enabled ? (
              <Play className="h-4 w-4 text-green-600 mr-2" />
            ) : (
              <Pause className="h-4 w-4 text-yellow-600 mr-2" />
            )}
            <AlertDescription className={scheduleConfig.enabled ? 'text-green-800' : 'text-yellow-800'}>
              {scheduleConfig.enabled ? (
                <>
                  Automated invoice generation is <strong>enabled</strong>. 
                  Invoices will be generated on day {scheduleConfig.dayOfMonth} of each month, 
                  {scheduleConfig.generateDaysBefore} days before due date.
                </>
              ) : (
                <>
                  Automated invoice generation is <strong>disabled</strong>. 
                  Invoices must be generated manually.
                </>
              )}
            </AlertDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setScheduleConfig({ ...scheduleConfig, enabled: !scheduleConfig.enabled })}
          >
            {scheduleConfig.enabled ? 'Disable' : 'Enable'}
          </Button>
        </div>
      </Alert>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Invoices</CardDescription>
            <CardTitle className="text-2xl">{totals.count}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              {formatCurrency(totals.total)} total value
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Paid</CardDescription>
            <CardTitle className="text-2xl text-green-600">{formatCurrency(totals.paid)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              {invoices.filter(inv => inv.status === 'paid').length} invoices
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Pending</CardDescription>
            <CardTitle className="text-2xl text-blue-600">{formatCurrency(totals.pending)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              {invoices.filter(inv => inv.status === 'sent' || inv.status === 'scheduled').length} invoices
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Overdue</CardDescription>
            <CardTitle className="text-2xl text-red-600">{formatCurrency(totals.overdue)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              {invoices.filter(inv => inv.status === 'overdue').length} invoices
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoice List */}
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList>
              <TabsTrigger value="all">All ({invoices.length})</TabsTrigger>
              <TabsTrigger value="scheduled">
                Scheduled ({invoices.filter(inv => inv.status === 'scheduled').length})
              </TabsTrigger>
              <TabsTrigger value="sent">
                Sent ({invoices.filter(inv => inv.status === 'sent').length})
              </TabsTrigger>
              <TabsTrigger value="overdue">
                Overdue ({invoices.filter(inv => inv.status === 'overdue').length})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {getFilteredInvoices().map(invoice => (
              <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div>
                      <div className="font-medium">{invoice.invoiceNumber}</div>
                      <div className="text-sm text-gray-600">{invoice.tenantName}</div>
                    </div>
                    {getStatusBadge(invoice.status)}
                  </div>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <span>Issue: {new Date(invoice.issueDate).toLocaleDateString()}</span>
                    <span>Due: {new Date(invoice.dueDate).toLocaleDateString()}</span>
                    {invoice.paidDate && (
                      <span className="text-green-600">Paid: {new Date(invoice.paidDate).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(invoice.totalAmount)}</div>
                    <div className="text-sm text-gray-500">{invoice.planName}</div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedInvoice(invoice);
                        setShowPreview(true);
                      }}
                    >
                      Preview
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadInvoice(invoice)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    {(invoice.status === 'scheduled' || invoice.status === 'draft') && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleSendInvoice(invoice)}
                        disabled={isSending}
                      >
                        <Send className="h-4 w-4 mr-1" />
                        Send
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {getFilteredInvoices().length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No invoices found for this filter
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Invoice Generation Settings</DialogTitle>
            <DialogDescription>
              Configure automated invoice generation and email delivery
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <h3 className="font-semibold">Schedule Configuration</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dayOfMonth">Generation Day of Month</Label>
                  <Input
                    id="dayOfMonth"
                    type="number"
                    min="1"
                    max="28"
                    value={scheduleConfig.dayOfMonth}
                    onChange={(e) => setScheduleConfig({ ...scheduleConfig, dayOfMonth: parseInt(e.target.value) })}
                  />
                  <p className="text-xs text-gray-500">Day 1-28 to generate invoices</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="generateDaysBefore">Generate Days Before Due</Label>
                  <Input
                    id="generateDaysBefore"
                    type="number"
                    min="0"
                    max="30"
                    value={scheduleConfig.generateDaysBefore}
                    onChange={(e) => setScheduleConfig({ ...scheduleConfig, generateDaysBefore: parseInt(e.target.value) })}
                  />
                  <p className="text-xs text-gray-500">Days before due date</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="paymentTerms">Payment Terms (Days)</Label>
                  <Input
                    id="paymentTerms"
                    type="number"
                    min="1"
                    max="90"
                    value={scheduleConfig.paymentTermsDays}
                    onChange={(e) => setScheduleConfig({ ...scheduleConfig, paymentTermsDays: parseInt(e.target.value) })}
                  />
                  <p className="text-xs text-gray-500">Days until invoice is due</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="taxRate">Tax Rate (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={scheduleConfig.taxRate}
                    onChange={(e) => setScheduleConfig({ ...scheduleConfig, taxRate: parseFloat(e.target.value) })}
                  />
                  <p className="text-xs text-gray-500">Applied to all invoices</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Email Settings</h3>
              
              <div className="space-y-2">
                <Label htmlFor="emailTemplate">Email Template</Label>
                <Select
                  value={scheduleConfig.emailTemplate}
                  onValueChange={(value) => setScheduleConfig({ ...scheduleConfig, emailTemplate: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default Invoice Email</SelectItem>
                    <SelectItem value="professional">Professional Template</SelectItem>
                    <SelectItem value="minimal">Minimal Template</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Send Immediately</Label>
                  <p className="text-xs text-gray-500">Email invoice as soon as generated</p>
                </div>
                <input
                  type="checkbox"
                  checked={scheduleConfig.sendImmediately}
                  onChange={(e) => setScheduleConfig({ ...scheduleConfig, sendImmediately: e.target.checked })}
                  className="h-4 w-4"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-Retry Failed</Label>
                  <p className="text-xs text-gray-500">Automatically retry failed email deliveries</p>
                </div>
                <input
                  type="checkbox"
                  checked={scheduleConfig.autoRetryFailed}
                  onChange={(e) => setScheduleConfig({ ...scheduleConfig, autoRetryFailed: e.target.checked })}
                  className="h-4 w-4"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Notify on Failure</Label>
                  <p className="text-xs text-gray-500">Alert admins when invoice delivery fails</p>
                </div>
                <input
                  type="checkbox"
                  checked={scheduleConfig.notifyOnFailure}
                  onChange={(e) => setScheduleConfig({ ...scheduleConfig, notifyOnFailure: e.target.checked })}
                  className="h-4 w-4"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettings(false)}>Cancel</Button>
            <Button onClick={handleSaveSettings}>Save Settings</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invoice Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Invoice Preview</DialogTitle>
          </DialogHeader>
          
          {selectedInvoice && (
            <div className="space-y-6 py-4">
              <div className="flex justify-between items-start border-b pb-4">
                <div>
                  <h2 className="text-2xl font-bold">INVOICE</h2>
                  <p className="text-gray-600">{selectedInvoice.invoiceNumber}</p>
                </div>
                {getStatusBadge(selectedInvoice.status)}
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Bill To:</h3>
                  <p className="text-sm">{selectedInvoice.tenantName}</p>
                </div>
                <div className="text-right">
                  <div className="space-y-1 text-sm">
                    <div><strong>Issue Date:</strong> {new Date(selectedInvoice.issueDate).toLocaleDateString()}</div>
                    <div><strong>Due Date:</strong> {new Date(selectedInvoice.dueDate).toLocaleDateString()}</div>
                    {selectedInvoice.paidDate && (
                      <div className="text-green-600"><strong>Paid:</strong> {new Date(selectedInvoice.paidDate).toLocaleDateString()}</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-b pb-2 text-sm text-gray-600">
                Billing Period: {new Date(selectedInvoice.billingPeriodStart).toLocaleDateString()} - {new Date(selectedInvoice.billingPeriodEnd).toLocaleDateString()}
              </div>

              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left">
                    <th className="pb-2">Description</th>
                    <th className="pb-2 text-right">Qty</th>
                    <th className="pb-2 text-right">Unit Price</th>
                    <th className="pb-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoice.lineItems.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-3">{item.description}</td>
                      <td className="py-3 text-right">{item.quantity}</td>
                      <td className="py-3 text-right">{formatCurrency(item.unitPrice)}</td>
                      <td className="py-3 text-right font-medium">{formatCurrency(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(selectedInvoice.amount)}</span>
                  </div>
                  {selectedInvoice.taxAmount > 0 && (
                    <div className="flex justify-between">
                      <span>Tax ({scheduleConfig.taxRate}%):</span>
                      <span>{formatCurrency(selectedInvoice.taxAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>{formatCurrency(selectedInvoice.totalAmount)}</span>
                  </div>
                </div>
              </div>

              {selectedInvoice.notes && (
                <div className="bg-gray-50 p-4 rounded">
                  <h4 className="font-semibold mb-1">Notes:</h4>
                  <p className="text-sm text-gray-600">{selectedInvoice.notes}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreview(false)}>Close</Button>
            {selectedInvoice && (
              <>
                <Button variant="outline" onClick={() => selectedInvoice && handleDownloadInvoice(selectedInvoice)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                {(selectedInvoice.status === 'scheduled' || selectedInvoice.status === 'draft') && (
                  <Button onClick={() => selectedInvoice && handleSendInvoice(selectedInvoice)}>
                    <Send className="h-4 w-4 mr-2" />
                    Send Invoice
                  </Button>
                )}
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InvoiceGenerator;
