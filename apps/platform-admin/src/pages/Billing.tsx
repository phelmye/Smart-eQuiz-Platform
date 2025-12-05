import { useState } from 'react';
import { CreditCard, DollarSign, Download, FileText, TrendingUp, Filter } from 'lucide-react';
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

interface Invoice {
  id: string;
  tenantName: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  date: string;
  plan: string;
}

const mockInvoices: Invoice[] = [
  { id: 'INV-001', tenantName: 'Acme University', amount: 14900, status: 'paid', date: '2024-02-01', plan: 'Enterprise' },
  { id: 'INV-002', tenantName: 'Tech Academy', amount: 4900, status: 'paid', date: '2024-02-01', plan: 'Professional' },
  { id: 'INV-003', tenantName: 'Global Institute', amount: 1900, status: 'pending', date: '2024-02-01', plan: 'Starter' },
  { id: 'INV-004', tenantName: 'Learning Hub', amount: 4900, status: 'paid', date: '2024-02-01', plan: 'Professional' },
  { id: 'INV-005', tenantName: 'Education Plus', amount: 14900, status: 'paid', date: '2024-02-01', plan: 'Enterprise' },
  { id: 'INV-006', tenantName: 'Smart School', amount: 1900, status: 'failed', date: '2024-02-01', plan: 'Starter' },
];

// Plans moved to PlanTier initialization below (uses syncPlanFeatures)
/*
const _plans = [
  { name: 'Starter', price: 1900, features: ['Up to 50 users', '10 GB storage', 'Basic support'], color: 'blue' },
  { name: 'Professional', price: 4900, features: ['Up to 200 users', '50 GB storage', 'Priority support', 'Custom branding'], color: 'purple' },
  { name: 'Enterprise', price: 14900, features: ['Unlimited users', '500 GB storage', 'Dedicated support', 'Custom branding', 'API access', 'SLA'], color: 'orange' },
];
*/

const statusColors = {
  paid: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800',
};

export default function Billing() {
  const [timeRange, setTimeRange] = useState('30d');

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

  const stats = [
    {
      name: 'Monthly Revenue',
      value: `$${mockInvoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0).toLocaleString()}`,
      change: '+12.5%',
      icon: DollarSign,
    },
    {
      name: 'Active Subscriptions',
      value: '245',
      change: '+8 this month',
      icon: CreditCard,
    },
    {
      name: 'Total Invoices',
      value: mockInvoices.length.toString(),
      change: `${mockInvoices.filter(i => i.status === 'paid').length} paid`,
      icon: FileText,
    },
    {
      name: 'Growth Rate',
      value: '15.3%',
      change: '+2.1% vs last month',
      icon: TrendingUp,
    },
  ];

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
          <Button variant="outline" onClick={() => {
            // TODO: Implement export billing data functionality
            console.log('Export billing data');
          }}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
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

      <Tabs defaultValue="invoices" className="space-y-4">
        <TabsList>
          <TabsTrigger value="invoices">
            <FileText className="mr-2 h-4 w-4" />
            Invoices
          </TabsTrigger>
          <TabsTrigger value="plans">
            <CreditCard className="mr-2 h-4 w-4" />
            Subscription Plans
          </TabsTrigger>
        </TabsList>

        {/* Invoices Tab */}
        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Invoices</CardTitle>
                  <CardDescription>View and manage all platform invoices</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => {
                  // TODO: Implement filter invoices functionality
                  console.log('Filter invoices');
                }}>
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Invoice ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Tenant
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Plan
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Amount
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
                      {mockInvoices.map((invoice) => (
                        <tr key={invoice.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-medium text-gray-900">{invoice.id}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900">{invoice.tenantName}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant="secondary">{invoice.plan}</Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-medium text-gray-900">
                              ${(invoice.amount / 100).toFixed(2)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className={statusColors[invoice.status]}>
                              {invoice.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(invoice.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                            <Button variant="ghost" size="sm" onClick={() => {
                              // TODO: Implement view invoice functionality
                              console.log(`View invoice ${invoice.id}`);
                            }}>
                              View
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => {
                              // TODO: Implement download invoice functionality
                              console.log(`Download invoice ${invoice.id}`);
                            }}>
                              <Download className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
                    <Button className="w-full" variant="outline" onClick={() => {
                      // TODO: Implement edit plan functionality
                      console.log(`Edit ${plan.displayName} plan`);
                    }}>
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
