import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, DollarSign, TrendingUp, Award, CheckCircle, XCircle, 
  Clock, Search, Download, MoreHorizontal 
} from 'lucide-react';

/**
 * Affiliates Management (Platform Admin)
 * 
 * TIER 1: Global Affiliates Management
 * - Approve/reject affiliate applications
 * - Set commission tiers
 * - Process payouts
 * - Monitor performance
 * - Detect fraud
 * 
 * TIER 2: Tenant Referral Tracking  
 * - View tenant-to-tenant referrals
 * - Manage commission rates
 * - Process tenant payouts
 */

interface Affiliate {
  id: string;
  fullName: string;
  email: string;
  countryCode: string;
  affiliateCode: string;
  status: 'pending' | 'active' | 'suspended' | 'banned';
  commissionTier: 'bronze' | 'silver' | 'gold' | 'platinum';
  commissionRate: number;
  payoutCurrency: string;
  payoutMethod: string;
  totalReferrals: number;
  successfulConversions: number;
  totalEarned: number;
  pendingPayout: number;
  createdAt: string;
}

interface TenantReferral {
  id: string;
  referrerTenantName: string;
  referredTenantName: string;
  conversionStatus: string;
  commissionAmount: number;
  monthsPaid: number;
  recurringMonths: number;
  createdAt: string;
}

// Mock data
const mockAffiliates: Affiliate[] = [
  {
    id: '1',
    fullName: 'John Marketer',
    email: 'john@example.com',
    countryCode: 'US',
    affiliateCode: 'JOHN-AFFILIATE-2025',
    status: 'active',
    commissionTier: 'gold',
    commissionRate: 30,
    payoutCurrency: 'USD',
    payoutMethod: 'paypal',
    totalReferrals: 45,
    successfulConversions: 28,
    totalEarned: 8400,
    pendingPayout: 1200,
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    fullName: 'Sarah Promoter',
    email: 'sarah@example.com',
    countryCode: 'NG',
    affiliateCode: 'SARAH-PROMO-2025',
    status: 'pending',
    commissionTier: 'bronze',
    commissionRate: 20,
    payoutCurrency: 'NGN',
    payoutMethod: 'bank_transfer',
    totalReferrals: 0,
    successfulConversions: 0,
    totalEarned: 0,
    pendingPayout: 0,
    createdAt: '2025-01-10'
  }
];

const mockTenantReferrals: TenantReferral[] = [
  {
    id: '1',
    referrerTenantName: 'First Baptist Church',
    referredTenantName: 'Second Baptist Church',
    conversionStatus: 'active_subscriber',
    commissionAmount: 29.85,
    monthsPaid: 3,
    recurringMonths: 12,
    createdAt: '2024-10-01'
  }
];

export default function Affiliates() {
  const { toast } = useToast();
  const [affiliates, setAffiliates] = useState<Affiliate[]>(mockAffiliates);
  const [tenantReferrals] = useState<TenantReferral[]>(mockTenantReferrals);
  const [selectedAffiliate, setSelectedAffiliate] = useState<Affiliate | null>(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Calculate summary stats
  const stats = {
    totalAffiliates: affiliates.length,
    activeAffiliates: affiliates.filter(a => a.status === 'active').length,
    pendingApprovals: affiliates.filter(a => a.status === 'pending').length,
    totalEarnings: affiliates.reduce((sum, a) => sum + a.totalEarned, 0),
    pendingPayouts: affiliates.reduce((sum, a) => sum + a.pendingPayout, 0),
    totalConversions: affiliates.reduce((sum, a) => sum + a.successfulConversions, 0)
  };

  const handleApproveAffiliate = (affiliate: Affiliate) => {
    setAffiliates(prev => prev.map(a => 
      a.id === affiliate.id 
        ? { ...a, status: 'active' }
        : a
    ));
    setShowApprovalDialog(false);
    toast({
      title: "Affiliate Approved",
      description: `${affiliate.fullName} has been approved and can now start earning commissions.`,
    });
    // TODO: API call to approve affiliate
    console.log('Approved affiliate:', affiliate.id);
  };

  const handleRejectAffiliate = (affiliate: Affiliate) => {
    setAffiliates(prev => prev.filter(a => a.id !== affiliate.id));
    setShowApprovalDialog(false);
    toast({
      title: "Affiliate Rejected",
      description: `${affiliate.fullName}'s application has been rejected.`,
    });
    // TODO: API call to reject affiliate
    console.log('Rejected affiliate:', affiliate.id);
  };

  const handleProcessPayout = (affiliate: Affiliate) => {
    toast({
      title: "Process Payout",
      description: `Opening payout processing for ${affiliate.fullName} - $${affiliate.pendingPayout.toFixed(2)}`,
    });
    // TODO: Open payout processing dialog
    console.log('Process payout for:', affiliate.id, affiliate.pendingPayout);
  };

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'platinum': return 'bg-gray-200 text-gray-900';
      case 'gold': return 'bg-yellow-100 text-yellow-900';
      case 'silver': return 'bg-gray-100 text-gray-700';
      default: return 'bg-orange-100 text-orange-900';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge className="bg-green-500 text-white">Active</Badge>;
      case 'pending': return <Badge className="bg-yellow-500 text-white">Pending</Badge>;
      case 'suspended': return <Badge className="bg-red-500 text-white">Suspended</Badge>;
      case 'banned': return <Badge className="bg-black text-white">Banned</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const filteredAffiliates = affiliates.filter(a => {
    const matchesSearch = a.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         a.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         a.affiliateCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || a.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Affiliate Program</h1>
          <p className="text-gray-500 mt-1">Manage global affiliates and tenant referrals</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Affiliates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAffiliates}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Active
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeAffiliates}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending Approval
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingApprovals}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Total Conversions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalConversions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Earned
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalEarnings.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Pending Payouts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">${stats.pendingPayouts.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs: Tier 1 vs Tier 2 */}
      <Tabs defaultValue="tier1" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="tier1">Global Affiliates (Tier 1)</TabsTrigger>
          <TabsTrigger value="tier2">Tenant Referrals (Tier 2)</TabsTrigger>
        </TabsList>

        {/* TIER 1: Global Affiliates */}
        <TabsContent value="tier1" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Affiliate Management</CardTitle>
              <CardDescription>Approve applications, set commission tiers, and process payouts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, email, or code..."
                    value={searchQuery}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border rounded-md"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              {/* Affiliates Table */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Affiliate</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tier</TableHead>
                      <TableHead>Performance</TableHead>
                      <TableHead>Earnings</TableHead>
                      <TableHead>Payout</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAffiliates.map((affiliate) => (
                      <TableRow key={affiliate.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{affiliate.fullName}</div>
                            <div className="text-sm text-gray-500">{affiliate.email}</div>
                            <div className="text-xs text-gray-400 font-mono">{affiliate.affiliateCode}</div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(affiliate.status)}</TableCell>
                        <TableCell>
                          <Badge className={getTierBadgeColor(affiliate.commissionTier)}>
                            {affiliate.commissionTier.toUpperCase()} ({affiliate.commissionRate}%)
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{affiliate.successfulConversions} conversions</div>
                            <div className="text-gray-500">{affiliate.totalReferrals} total referrals</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold">${affiliate.totalEarned.toLocaleString()}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium text-blue-600">${affiliate.pendingPayout.toLocaleString()}</div>
                            <div className="text-gray-500">{affiliate.payoutCurrency} via {affiliate.payoutMethod}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {affiliate.status === 'pending' ? (
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedAffiliate(affiliate);
                                setShowApprovalDialog(true);
                              }}
                            >
                              Review
                            </Button>
                          ) : affiliate.pendingPayout >= 50 ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleProcessPayout(affiliate)}
                            >
                              Pay Out
                            </Button>
                          ) : (
                            <Button size="sm" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TIER 2: Tenant Referrals */}
        <TabsContent value="tier2" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tenant Referral Tracking</CardTitle>
              <CardDescription>Monitor tenant-to-tenant referrals and commission payments</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Referrer Tenant</TableHead>
                    <TableHead>Referred Tenant</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tenantReferrals.map((ref) => (
                    <TableRow key={ref.id}>
                      <TableCell className="font-medium">{ref.referrerTenantName}</TableCell>
                      <TableCell>{ref.referredTenantName}</TableCell>
                      <TableCell>
                        <Badge className="bg-green-500 text-white">{ref.conversionStatus}</Badge>
                      </TableCell>
                      <TableCell className="font-semibold">${ref.commissionAmount}/month</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{ref.monthsPaid}/{ref.recurringMonths} months paid</div>
                          <div className="text-gray-500">
                            ${(ref.commissionAmount * ref.monthsPaid).toFixed(2)} total
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">{ref.createdAt}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Approval Dialog */}
      {selectedAffiliate && (
        <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Review Affiliate Application</DialogTitle>
              <DialogDescription>
                Decide whether to approve or reject this affiliate application
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-500">Name</div>
                  <div>{selectedAffiliate.fullName}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Email</div>
                  <div>{selectedAffiliate.email}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Country</div>
                  <div>{selectedAffiliate.countryCode}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Payout Method</div>
                  <div>{selectedAffiliate.payoutMethod}</div>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-500 mb-2">Affiliate Code</div>
                <div className="font-mono bg-gray-100 p-2 rounded">{selectedAffiliate.affiliateCode}</div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => handleApproveAffiliate(selectedAffiliate)}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => handleRejectAffiliate(selectedAffiliate)}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
