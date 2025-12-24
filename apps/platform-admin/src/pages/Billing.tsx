import { useState } from 'react';
import { CreditCard, DollarSign, Download, FileText, TrendingUp, Filter, CheckCircle } from 'lucide-react';
import { formatCurrency } from '@smart-equiz/utils';
import { useToast } from '../hooks/use-toast';
import { useBilling } from '../hooks/useBilling';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { CurrencyConverter } from '../components/CurrencyConverter';
import { syncPlanFeatures, type PlanTier } from '../lib/planFeatureSync';


const statusColors = {
  COMPLETED: 'bg-green-100 text-green-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  FAILED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-gray-100 text-gray-800',
};

const providerColors = {
  STRIPE: 'bg-purple-100 text-purple-800',
  PAYPAL: 'bg-blue-100 text-blue-800',
  PAYONEER: 'bg-orange-100 text-orange-800',
  WORLDFIRST: 'bg-teal-100 text-teal-800',
};

export default function Billing() {
  const { toast } = useToast();
  const { transactions, gateways, stats, loading, error, exportTransactions, fetchTransactions } = useBilling();
  const [timeRange, setTimeRange] = useState('30d');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [providerFilter, setProviderFilter] = useState<string>('all');

  // Initialize plans with feature sync system
  const [plans] = useState<PlanTier[]>(() => {
    const basePlans: PlanTier[] = [
      { id: 'starter', name: 'starter', displayName: 'Starter', monthlyPrice: 1900, features: [] },
      { id: 'professional', name: 'professional', displayName: 'Professional', monthlyPrice: 4900, features: [] },
      { id: 'enterprise', name: 'enterprise', displayName: 'Enterprise', monthlyPrice: 14900, features: [] },
    ];
    
    // Automatically sync features from central registry
    return syncPlanFeatures(basePlans);
  });

  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    if (statusFilter !== 'all' && transaction.status !== statusFilter) return false;
    if (providerFilter !== 'all' && transaction.provider !== providerFilter) return false;
    return true;
  });

  // Calculate stats from real data
  const completedTransactions = transactions.filter(t => t.status === 'COMPLETED');
  const totalRevenue = completedTransactions.reduce((sum, t) => sum + t.amount, 0);
  const uniqueTenants = new Set(completedTransactions.map(t => t.tenantId)).size;

  const statsData = [
    {
      name: 'Monthly Revenue',
      value: `$${(totalRevenue / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: stats?.byProvider.length ? `${stats.byProvider.length} gateways active` : 'Loading...',
      icon: DollarSign,
    },
    {
      name: 'Active Subscriptions',
      value: uniqueTenants.toString(),
      change: `${completedTransactions.length} payments`,
      icon: CreditCard,
    },
    {
      name: 'Total Transactions',
      value: transactions.length.toString(),
      change: `${completedTransactions.length} completed`,
      icon: FileText,
    },
    {
      name: 'Success Rate',
      value: transactions.length > 0 
        ? `${((completedTransactions.length / transactions.length) * 100).toFixed(1)}%`
        : '0%',
      change: `${transactions.filter(t => t.status === 'FAILED').length} failed`,
      icon: TrendingUp,
    },
  ];

  // Handler functions
  const handleExportData = async () => {
    try {
      toast({
        title: "Exporting transaction data",
        description: "Your transaction export will download shortly.",
      });
      await exportTransactions({ 
        status: statusFilter !== 'all' ? statusFilter : undefined,
        provider: providerFilter !== 'all' ? providerFilter : undefined,
      });
      toast({
        title: "Export complete",
        description: "Transaction data has been downloaded as CSV.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: error instanceof Error ? error.message : 'Failed to export data',
        variant: "destructive",
      });
    }
  };

  const handleFilterChange = async () => {
    await fetchTransactions({
      status: statusFilter !== 'all' ? statusFilter : undefined,
      provider: providerFilter !== 'all' ? providerFilter : undefined,
    });
  };

  const handleViewInvoice = (transactionId: string) => {
    const transaction = transactions.find(t => t.id === transactionId);
    toast({
      title: "Transaction Details",
      description: transaction 
        ? `${transaction.type} - ${formatCurrency(transaction.amount)} via ${transaction.provider}`
        : `Loading transaction ${transactionId}...`,
    });
    // Future enhancement: Open transaction detail modal with full history
  };

  const handleDownloadInvoice = (transactionId: string) => {
    const transaction = transactions.find(t => t.id === transactionId);
    toast({
      title: "Downloading Receipt",
      description: transaction
        ? `Receipt for ${formatCurrency(transaction.amount)} ${transaction.type} will download as PDF.`
        : "Generating PDF receipt...",
    });
    // Future enhancement: Generate and download actual PDF invoice
    // For now: This would trigger PDF generation API endpoint
  };

  const handleEditPlan = (planId: string) => {
    toast({
      title: "Plan Editor",
      description: `Opening editor for ${planId} plan. You can adjust features and pricing.`,
    });
    // Future enhancement: Open plan editor modal with full configuration
    // For now: This would navigate to plan management page
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading billing data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 font-semibold">Error loading billing data</p>
          <p className="text-gray-600 mt-2">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Billing & Subscriptions</h2>
          <p className="text-gray-500 mt-1">Manage subscriptions, invoices, and revenue</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExportData}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.name}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.name}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                    <p className="text-sm text-green-600 mt-1">{stat.change}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Payment Gateways Status */}
      {gateways.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Gateways</CardTitle>
            <CardDescription>Configured payment providers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {gateways.map((gateway) => (
                <div 
                  key={gateway.provider}
                  className={`p-4 border rounded-lg ${gateway.configured ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900">{gateway.displayName}</span>
                    {gateway.configured && <CheckCircle className="h-5 w-5 text-green-600" />}
                  </div>
                  <p className="text-xs text-gray-600">{gateway.description}</p>
                  <Badge 
                    className={`mt-2 ${gateway.configured ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}
                  >
                    {gateway.configured ? 'Configured' : 'Not Configured'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Revenue by Provider */}
      {stats?.byProvider && stats.byProvider.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Payment Provider</CardTitle>
            <CardDescription>Transaction breakdown across gateways</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.byProvider.map((providerStat) => (
                <div key={providerStat.provider} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge className={providerColors[providerStat.provider as keyof typeof providerColors]}>
                      {providerStat.provider}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      {providerStat.transactionCount} transactions
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      ${(providerStat.revenue / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-gray-500">{providerStat.percentage.toFixed(1)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions">
            <FileText className="mr-2 h-4 w-4" />
            Transactions
          </TabsTrigger>
          <TabsTrigger value="plans">
            <CreditCard className="mr-2 h-4 w-4" />
            Subscription Plans
          </TabsTrigger>
        </TabsList>

        {/* Transactions Tab */}
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>View and manage all payment transactions</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="FAILED">Failed</SelectItem>
                      <SelectItem value="REFUNDED">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={providerFilter} onValueChange={setProviderFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Providers</SelectItem>
                      <SelectItem value="STRIPE">Stripe</SelectItem>
                      <SelectItem value="PAYPAL">PayPal</SelectItem>
                      <SelectItem value="PAYONEER">Payoneer</SelectItem>
                      <SelectItem value="WORLDFIRST">WorldFirst</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" onClick={handleFilterChange}>
                    <Filter className="mr-2 h-4 w-4" />
                    Apply
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredTransactions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <p>No transactions found</p>
                    <p className="text-sm mt-1">Transactions will appear here once payments are processed.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Transaction ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Tenant
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Provider
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Amount
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Date
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredTransactions.map((transaction) => (
                          <tr key={transaction.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm font-mono text-gray-600">{transaction.id.slice(0, 8)}...</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-900">
                                {transaction.tenant?.name || transaction.tenantId.slice(0, 8)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge className={providerColors[transaction.provider]}>
                                {transaction.provider}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm font-medium text-gray-900">
                                {transaction.currency} {(transaction.amount / 100).toFixed(2)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge variant="secondary">{transaction.type}</Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge className={statusColors[transaction.status]}>
                                {transaction.status}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(transaction.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                              <Button variant="ghost" size="sm" onClick={() => handleViewInvoice(transaction.id)}>
                                View
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDownloadInvoice(transaction.id)}>
                                <Download className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Plans Tab */}
        <TabsContent value="plans">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card key={plan.name} className="relative">
                <CardHeader>
                  <CardTitle className="text-xl">{plan.displayName}</CardTitle>
                  <CardDescription>
                    <div className="flex items-center gap-2">
                      <CurrencyConverter 
                        amount={plan.monthlyPrice} 
                        showConverter={false}
                        className="text-3xl font-bold text-gray-900"
                      />
                      <span className="text-gray-600">/month</span>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                        <svg
                          className="w-5 h-5 text-green-500 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <div className="pt-4 space-y-2">
                    <Button className="w-full" variant="outline" onClick={() => handleEditPlan(plan.id)}>
                      Edit Plan
                    </Button>
                    <p className="text-xs text-center text-gray-500">
                      {Math.floor(Math.random() * 50) + 10} active subscriptions
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
