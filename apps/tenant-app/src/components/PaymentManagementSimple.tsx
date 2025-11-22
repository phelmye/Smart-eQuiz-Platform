import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CreditCard, AlertTriangle, LogOut, FileText } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from './AuthSystem';
import { hasPermission } from '@/lib/mockData';
import { isPaymentIntegrationEnabled } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';

interface PaymentManagementProps {
  onBack: () => void;
}

export const PaymentManagementSimple: React.FC<PaymentManagementProps> = ({ onBack }) => {
  const { user, logout } = useAuth();
  const { toast } = useToast();

  // Check if user is admin
  // Allow super_admin, org_admin, and account_officer to view payments
  if (!user || (!hasPermission(user, 'payments.read') && user.role !== 'org_admin' && user.role !== 'super_admin' && user.role !== 'account_officer')) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">You need admin privileges to manage payments.</p>
            <Button onClick={onBack}>Back to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check payment integration status
  const paymentEnabled = user.tenantId ? isPaymentIntegrationEnabled(user.tenantId) : false;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Payment Management</h1>
                <p className="text-gray-600">Manage transactions, payouts, and payment integrations</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={logout} className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Payment Status Alert */}
        {!paymentEnabled && (
          <Alert className="mb-6 border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              Payment integration is currently disabled. Configure payment providers in the Payment Integration settings to enable monetary features.
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Transaction Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Transaction Overview
              </CardTitle>
              <CardDescription>
                Summary of payment activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Transactions</span>
                  <span className="font-medium">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pending Payouts</span>
                  <span className="font-medium">$0.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Revenue</span>
                  <span className="font-medium text-green-600">$0.00</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common payment management tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full" 
                disabled={!paymentEnabled}
                onClick={() => toast({
                  title: "Manual Deposit",
                  description: "Manual deposit feature coming soon. This will allow you to record manual payments.",
                })}
              >
                Manual Deposit
              </Button>
              <Button 
                className="w-full" 
                variant="outline"
                disabled={!paymentEnabled}
                onClick={() => toast({
                  title: "Process Payout",
                  description: "Payout processing feature coming soon. This will handle participant payouts.",
                })}
              >
                Process Payout
              </Button>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => toast({
                  title: "View Reports",
                  description: "Redirecting to payment reports...",
                })}
              >
                <FileText className="h-4 w-4 mr-2" />
                View Reports
              </Button>
            </CardContent>
          </Card>

          {/* Integration Status */}
          <Card>
            <CardHeader>
              <CardTitle>Integration Status</CardTitle>
              <CardDescription>
                Payment provider configuration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    paymentEnabled 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {paymentEnabled ? 'Active' : 'Disabled'}
                  </span>
                </div>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => toast({
                    title: "Configure Integration",
                    description: "Navigate to Settings > Payment Integration to configure payment providers.",
                  })}
                >
                  Configure Integration
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions Table */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>
              Latest payment activities in your organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              {paymentEnabled 
                ? "No transactions yet. Transactions will appear here once users start making payments."
                : "Enable payment integration to start tracking transactions."
              }
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentManagementSimple;