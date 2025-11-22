import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  DollarSign, TrendingUp, Users, CheckCircle, Copy, 
  ExternalLink, CreditCard, Gift, Target, Clock, ArrowUpRight
} from 'lucide-react';
import { Affiliate, AffiliateReferral, AffiliatePayout, storage, STORAGE_KEYS, calculateCommissionEarnings, calculateAffiliateProgression } from '@/lib/mockData';

/**
 * Affiliate Dashboard (Self-Service Portal for Affiliates)
 * 
 * Allows approved affiliates to:
 * - View earnings and performance stats
 * - Generate referral links with UTM tracking
 * - Track conversions and referrals
 * - Request payouts (minimum $50)
 * - View tier progression
 * - Access marketing materials
 */

interface AffiliateDashboardProps {
  affiliateId: string;
}

export default function AffiliateDashboard({ affiliateId }: AffiliateDashboardProps) {
  // Mock affiliate data - in production, fetch from API
  const [affiliate] = useState<Affiliate>({
    id: affiliateId,
    fullName: 'John Marketer',
    email: 'john@example.com',
    country: 'United States',
    countryCode: 'US',
    website: 'https://christianblogger.com',
    socialMedia: '@johnmarketer',
    affiliateCode: 'AFF123456',
    status: 'active',
    commissionTier: 'gold',
    commissionRate: 30,
    payoutMethod: 'paypal',
    payoutCurrency: 'USD',
    createdAt: '2024-11-01',
    totalReferrals: 45,
    successfulConversions: 28,
    totalEarned: 8400,
    pendingPayout: 1200,
    monthlyEarnings: 2800,
    yearlyEarnings: 8400
  });

  // Mock referral data
  const [referrals] = useState<AffiliateReferral[]>([
    {
      id: 'ref-1',
      referrerType: 'affiliate',
      referrerId: affiliateId,
      referralCode: 'AFF123456',
      tenantId: 'tenant-1',
      tenantName: 'First Baptist Church',
      tenantPlanId: 'professional',
      subscriptionPlan: 'professional',
      conversionStatus: 'converted',
      signupDate: '2025-01-10',
      conversionDate: '2025-01-12',
      subscriptionValue: 49,
      commissionAmount: 14.70,
      commissionCurrency: 'USD',
      recurringMonths: 12,
      monthsPaid: 2,
      totalEarned: 29.40,
      nextPaymentDate: '2025-02-12',
      fraudScore: 0.0,
      createdAt: '2025-01-10'
    },
    {
      id: 'ref-2',
      referrerType: 'affiliate',
      referrerId: affiliateId,
      referralCode: 'AFF123456',
      tenantId: 'tenant-2',
      tenantName: 'Community Bible Study',
      tenantPlanId: '',
      subscriptionPlan: '',
      conversionStatus: 'signed_up',
      signupDate: '2025-01-18',
      subscriptionValue: 0,
      commissionAmount: 0,
      commissionCurrency: 'USD',
      recurringMonths: 0,
      monthsPaid: 0,
      totalEarned: 0,
      fraudScore: 0.0,
      createdAt: '2025-01-18'
    }
  ]);

  // Mock payout history
  const [payouts] = useState<AffiliatePayout[]>([
    {
      id: 'payout-1',
      recipientType: 'affiliate',
      recipientId: affiliateId,
      affiliateId,
      amount: 850,
      currency: 'USD',
      payoutMethod: 'paypal',
      status: 'completed',
      periodStart: '2024-12-01',
      periodEnd: '2024-12-31',
      referralIds: ['ref-1'],
      taxFormRequired: false,
      taxFormSubmitted: false,
      requestedAt: '2025-01-01',
      processedAt: '2025-01-05',
      referenceNumber: 'PAY-20250105-001',
      createdAt: '2025-01-01'
    }
  ]);

  const [copied, setCopied] = useState(false);
  const [utmSource, setUtmSource] = useState('');
  const [utmMedium, setUtmMedium] = useState('');
  const [utmCampaign, setUtmCampaign] = useState('');

  // Calculate tier progression
  const progression = calculateAffiliateProgression(affiliate);

  // Generate referral link
  const baseReferralLink = `https://smartequiz.com/signup?ref=${affiliate.affiliateCode}`;
  const referralLink = utmSource || utmMedium || utmCampaign
    ? `${baseReferralLink}&utm_source=${utmSource || 'affiliate'}&utm_medium=${utmMedium || 'referral'}&utm_campaign=${utmCampaign || 'default'}`
    : baseReferralLink;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePayoutRequest = () => {
    if (affiliate.pendingPayout < 50) {
      alert(`Minimum payout is $50. You currently have $${affiliate.pendingPayout} pending.`);
      return;
    }

    // TODO: API call to request payout
    console.log('Payout requested:', affiliate.pendingPayout);
    alert(`Payout request submitted for $${affiliate.pendingPayout}. You'll receive it within 5-7 business days via ${affiliate.payoutMethod}.`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'converted':
        return <Badge className="bg-green-500 text-white"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>;
      case 'signed_up':
        return <Badge className="bg-yellow-500 text-white"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'clicked':
        return <Badge variant="outline">Clicked</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'bronze':
        return <Badge className="bg-orange-600 text-white">🥉 Bronze</Badge>;
      case 'silver':
        return <Badge className="bg-gray-400 text-white">🥈 Silver</Badge>;
      case 'gold':
        return <Badge className="bg-yellow-500 text-white">🥇 Gold</Badge>;
      case 'platinum':
        return <Badge className="bg-purple-600 text-white">💎 Platinum</Badge>;
      default:
        return <Badge>{tier}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Affiliate Dashboard</h1>
            <p className="text-gray-500 mt-1">Welcome back, {affiliate.fullName}!</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Affiliate Code</div>
            <div className="text-lg font-mono font-bold text-blue-600">{affiliate.affiliateCode}</div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Total Earned
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ${affiliate.totalEarned.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500 mt-1">All-time earnings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Pending Payout
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                ${affiliate.pendingPayout.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {affiliate.pendingPayout >= 50 ? 'Ready to withdraw' : `$${50 - affiliate.pendingPayout} to minimum`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Conversions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {affiliate.successfulConversions}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {affiliate.totalReferrals} total referrals
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                This Month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                ${affiliate.monthlyEarnings?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {((affiliate.monthlyEarnings || 0) / (affiliate.yearlyEarnings || 1) * 100).toFixed(0)}% of yearly
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tier Progression */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Commission Tier Progress
                </CardTitle>
                <CardDescription>
                  Current tier: {getTierBadge(affiliate.commissionTier)} ({affiliate.commissionRate}% commission)
                </CardDescription>
              </div>
              {progression.nextTier && (
                <Button variant="outline" size="sm">
                  <Gift className="mr-2 h-4 w-4" />
                  Next: {getTierBadge(progression.nextTier.tierName)}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {progression.nextTier ? (
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">
                    {affiliate.successfulConversions} / {progression.nextTier.minConversions} conversions
                  </span>
                  <span className="font-semibold text-blue-600">
                    {progression.progressPercentage}% complete
                  </span>
                </div>
                <Progress value={progression.progressPercentage} className="h-3" />
                <p className="text-sm text-gray-600 mt-2">
                  {progression.nextTier.minConversions - affiliate.successfulConversions} more conversion(s) to unlock{' '}
                  <strong>{progression.nextTier.commissionRate}% commission</strong> and{' '}
                  <strong>${progression.nextTier.bonusPerReferral} bonus per referral!</strong>
                </p>
              </div>
            ) : (
              <Alert className="bg-purple-50 border-purple-200">
                <CheckCircle className="h-4 w-4 text-purple-600" />
                <AlertDescription className="text-purple-900">
                  🎉 <strong>Congratulations!</strong> You've reached the highest tier (Platinum) with 35% commission and $500 bonuses!
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="links" className="w-full">
          <TabsList>
            <TabsTrigger value="links">Referral Links</TabsTrigger>
            <TabsTrigger value="referrals">My Referrals</TabsTrigger>
            <TabsTrigger value="payouts">Payouts</TabsTrigger>
            <TabsTrigger value="materials">Marketing Materials</TabsTrigger>
          </TabsList>

          {/* REFERRAL LINKS TAB */}
          <TabsContent value="links" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Generate Referral Link</CardTitle>
                <CardDescription>
                  Create tracked links with UTM parameters to measure campaign performance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* UTM Parameters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">UTM Source</label>
                    <Input
                      value={utmSource}
                      onChange={(e) => setUtmSource(e.target.value)}
                      placeholder="e.g., facebook, newsletter"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">UTM Medium</label>
                    <Input
                      value={utmMedium}
                      onChange={(e) => setUtmMedium(e.target.value)}
                      placeholder="e.g., social, email"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">UTM Campaign</label>
                    <Input
                      value={utmCampaign}
                      onChange={(e) => setUtmCampaign(e.target.value)}
                      placeholder="e.g., summer2025"
                    />
                  </div>
                </div>

                {/* Generated Link */}
                <div>
                  <label className="text-sm font-medium">Your Referral Link</label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      value={referralLink}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button onClick={copyToClipboard} variant="outline">
                      <Copy className="h-4 w-4 mr-2" />
                      {copied ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                </div>

                {/* Quick Links */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-3">Pre-made Campaign Links</h4>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => {
                        setUtmSource('facebook');
                        setUtmMedium('social');
                        setUtmCampaign('organic');
                      }}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Facebook Post Link
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => {
                        setUtmSource('email');
                        setUtmMedium('newsletter');
                        setUtmCampaign('weekly');
                      }}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Email Newsletter Link
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => {
                        setUtmSource('blog');
                        setUtmMedium('content');
                        setUtmCampaign('review');
                      }}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Blog Review Link
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* REFERRALS TAB */}
          <TabsContent value="referrals" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Referral Activity</CardTitle>
                <CardDescription>Track your referrals and their conversion status</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Organization</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Earned</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Next Payment</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {referrals.map((ref) => (
                      <TableRow key={ref.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{ref.tenantName}</div>
                            <div className="text-xs text-gray-500">{ref.signupDate}</div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(ref.conversionStatus)}</TableCell>
                        <TableCell>
                          {ref.subscriptionPlan ? (
                            <Badge variant="outline">{ref.subscriptionPlan}</Badge>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {ref.totalEarned > 0 ? (
                            <span className="font-semibold text-green-600">
                              ${ref.totalEarned.toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-gray-400">$0.00</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {ref.recurringMonths > 0 ? (
                            <div>
                              <div className="text-sm text-gray-600">
                                {ref.monthsPaid}/{ref.recurringMonths} months
                              </div>
                              <Progress
                                value={(ref.monthsPaid / ref.recurringMonths) * 100}
                                className="h-2 mt-1"
                              />
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {ref.nextPaymentDate ? (
                            <span className="text-sm text-gray-600">{ref.nextPaymentDate}</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PAYOUTS TAB */}
          <TabsContent value="payouts" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Payout Management</CardTitle>
                    <CardDescription>
                      Request payouts and view payment history (minimum: $50)
                    </CardDescription>
                  </div>
                  <Button
                    onClick={handlePayoutRequest}
                    disabled={affiliate.pendingPayout < 50}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Request Payout (${affiliate.pendingPayout})
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-sm text-gray-600">Payout Method</div>
                      <div className="font-semibold text-gray-900 capitalize">{affiliate.payoutMethod}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Currency</div>
                      <div className="font-semibold text-gray-900">{affiliate.payoutCurrency}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Processing Time</div>
                      <div className="font-semibold text-gray-900">5-7 days</div>
                    </div>
                  </div>
                </div>

                <h4 className="font-semibold mb-3">Payout History</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Reference</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payouts.map((payout) => (
                      <TableRow key={payout.id}>
                        <TableCell>{payout.processedAt || payout.requestedAt}</TableCell>
                        <TableCell className="font-semibold">
                          ${payout.amount} {payout.currency}
                        </TableCell>
                        <TableCell className="capitalize">{payout.payoutMethod}</TableCell>
                        <TableCell>
                          {payout.status === 'completed' && (
                            <Badge className="bg-green-500 text-white">Completed</Badge>
                          )}
                          {payout.status === 'processing' && (
                            <Badge className="bg-blue-500 text-white">Processing</Badge>
                          )}
                          {payout.status === 'pending' && (
                            <Badge className="bg-yellow-500 text-white">Pending</Badge>
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {payout.referenceNumber || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* MARKETING MATERIALS TAB */}
          <TabsContent value="materials" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Marketing Resources</CardTitle>
                <CardDescription>
                  Download banners, logos, and promotional content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Brand Assets</h4>
                    <ul className="space-y-2 text-sm">
                      <li>
                        <a href="#" className="text-blue-600 hover:underline flex items-center gap-2">
                          <ExternalLink className="h-4 w-4" />
                          Smart eQuiz Logo Pack (PNG, SVG)
                        </a>
                      </li>
                      <li>
                        <a href="#" className="text-blue-600 hover:underline flex items-center gap-2">
                          <ExternalLink className="h-4 w-4" />
                          Brand Guidelines PDF
                        </a>
                      </li>
                    </ul>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Banner Ads</h4>
                    <ul className="space-y-2 text-sm">
                      <li>
                        <a href="#" className="text-blue-600 hover:underline flex items-center gap-2">
                          <ExternalLink className="h-4 w-4" />
                          728x90 Leaderboard Banner
                        </a>
                      </li>
                      <li>
                        <a href="#" className="text-blue-600 hover:underline flex items-center gap-2">
                          <ExternalLink className="h-4 w-4" />
                          300x250 Medium Rectangle
                        </a>
                      </li>
                      <li>
                        <a href="#" className="text-blue-600 hover:underline flex items-center gap-2">
                          <ExternalLink className="h-4 w-4" />
                          1200x628 Social Media Banner
                        </a>
                      </li>
                    </ul>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Email Templates</h4>
                    <ul className="space-y-2 text-sm">
                      <li>
                        <a href="#" className="text-blue-600 hover:underline flex items-center gap-2">
                          <ExternalLink className="h-4 w-4" />
                          Introduction Email Template
                        </a>
                      </li>
                      <li>
                        <a href="#" className="text-blue-600 hover:underline flex items-center gap-2">
                          <ExternalLink className="h-4 w-4" />
                          Newsletter Insert Template
                        </a>
                      </li>
                    </ul>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Social Media</h4>
                    <ul className="space-y-2 text-sm">
                      <li>
                        <a href="#" className="text-blue-600 hover:underline flex items-center gap-2">
                          <ExternalLink className="h-4 w-4" />
                          Pre-written Social Posts
                        </a>
                      </li>
                      <li>
                        <a href="#" className="text-blue-600 hover:underline flex items-center gap-2">
                          <ExternalLink className="h-4 w-4" />
                          Instagram Story Templates
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>

                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-900">
                    <strong>Pro Tip:</strong> Use the UTM parameters in the "Referral Links" tab to track which marketing materials perform best!
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
