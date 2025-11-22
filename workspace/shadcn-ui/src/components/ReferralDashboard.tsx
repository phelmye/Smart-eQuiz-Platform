import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Copy, Share2, Users, Gift, TrendingUp, CheckCircle, 
  Clock, ExternalLink, Mail, MessageSquare, Zap, DollarSign, Trophy
} from 'lucide-react';
import { User, Tenant } from '@/lib/mockData';

/**
 * Referral Dashboard (Participant View)
 * 
 * Allows participants to:
 * - Generate and share referral links
 * - Track referrals and rewards
 * - View reward history
 * - Share via email/social media
 */

interface Referral {
  id: string;
  referredUserName: string;
  status: 'pending' | 'active' | 'rewarded';
  joinedDate: string;
  activityStatus: 'incomplete' | 'qualifying' | 'qualified';
  quizzesCompleted: number;
  tournamentsJoined: number;
  rewardEarned?: number;
  rewardType?: string;
}

export default function ReferralDashboard({ user, tenant }: { user: User; tenant: Tenant }) {
  const referralCode = `${user.id.slice(0, 8).toUpperCase()}`;
  const tenantDomain = (tenant as any).subdomain || tenant.id || 'tenant';
  const referralLink = `https://${tenantDomain}.smartequiz.com/join?ref=${referralCode}`;
  
  const [copied, setCopied] = useState(false);

  // Mock referral data
  const [referrals] = useState<Referral[]>([
    {
      id: 'ref-1',
      referredUserName: 'Jane Smith',
      status: 'rewarded',
      joinedDate: '2025-01-15',
      activityStatus: 'qualified',
      quizzesCompleted: 12,
      tournamentsJoined: 2,
      rewardEarned: 100,
      rewardType: 'points'
    },
    {
      id: 'ref-2',
      referredUserName: 'Bob Wilson',
      status: 'active',
      joinedDate: '2025-01-20',
      activityStatus: 'qualifying',
      quizzesCompleted: 7,
      tournamentsJoined: 1
    },
    {
      id: 'ref-3',
      referredUserName: 'Alice Brown',
      status: 'pending',
      joinedDate: '2025-01-22',
      activityStatus: 'incomplete',
      quizzesCompleted: 2,
      tournamentsJoined: 0
    }
  ]);

  const stats = {
    totalReferrals: referrals.length,
    activeReferrals: referrals.filter(r => r.status === 'active' || r.status === 'rewarded').length,
    totalRewards: referrals.reduce((sum, r) => sum + (r.rewardEarned || 0), 0),
    pendingRewards: referrals.filter(r => r.activityStatus === 'qualifying').length
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Join me on ${tenant.name}!`);
    const body = encodeURIComponent(
      `I've been using ${tenant.name} for Bible quizzes and tournaments, and I think you'd love it!\n\n` +
      `Join using my referral link: ${referralLink}\n\n` +
      `See you there!`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const shareViaSocial = (platform: string) => {
    const text = encodeURIComponent(`Join me on ${tenant.name} for Bible quizzes!`);
    const url = encodeURIComponent(referralLink);
    
    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`);
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`);
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${text}%20${url}`);
        break;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'rewarded':
        return <Badge className="bg-green-500 text-white"><CheckCircle className="h-3 w-3 mr-1" />Rewarded</Badge>;
      case 'active':
        return <Badge className="bg-blue-500 text-white"><Users className="h-3 w-3 mr-1" />Active</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500 text-white"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getActivityBadge = (status: string) => {
    switch (status) {
      case 'qualified':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Qualified</Badge>;
      case 'qualifying':
        return <Badge className="bg-blue-100 text-blue-800"><TrendingUp className="h-3 w-3 mr-1" />In Progress</Badge>;
      case 'incomplete':
        return <Badge className="bg-gray-100 text-gray-800"><Clock className="h-3 w-3 mr-1" />Incomplete</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'points':
        return <Zap className="h-4 w-4 text-yellow-500" />;
      case 'credits':
        return <DollarSign className="h-4 w-4 text-green-500" />;
      case 'tournament_entries':
        return <Trophy className="h-4 w-4 text-purple-500" />;
      default:
        return <Gift className="h-4 w-4" />;
    }
  };

  // Check if program is enabled
  if (!tenant.referralProgramEnabled) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
              <Users className="h-6 w-6 text-gray-400" />
            </div>
            <CardTitle>Referral Program Not Available</CardTitle>
            <CardDescription className="mt-2">
              The referral program is currently disabled by your organization administrator.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Referral Dashboard</h2>
        <p className="text-gray-500 mt-1">Invite friends and earn rewards when they join!</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Referrals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReferrals}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Active Members
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeReferrals}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Gift className="h-4 w-4" />
              Total Rewards
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats.totalRewards} {tenant.referralRewardType}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Pending Rewards
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingRewards}</div>
          </CardContent>
        </Card>
      </div>

      {/* Referral Link Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Your Referral Link
          </CardTitle>
          <CardDescription>
            Share this link with friends to earn {tenant.referralRewardAmount} {tenant.referralRewardType} per successful referral
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Link Display */}
          <div className="flex gap-2">
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

          {/* Social Share Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button onClick={shareViaEmail} variant="outline" size="sm">
              <Mail className="h-4 w-4 mr-2" />
              Email
            </Button>
            <Button onClick={() => shareViaSocial('whatsapp')} variant="outline" size="sm">
              <MessageSquare className="h-4 w-4 mr-2" />
              WhatsApp
            </Button>
            <Button onClick={() => shareViaSocial('facebook')} variant="outline" size="sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              Facebook
            </Button>
            <Button onClick={() => shareViaSocial('twitter')} variant="outline" size="sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              Twitter
            </Button>
          </div>

          {/* Reward Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">How It Works</h4>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Share your referral link with friends</li>
              <li>They sign up using your link</li>
              <li>Once they complete the required activities, you both earn rewards!</li>
              <li>You receive: <strong>{tenant.referralRewardAmount} {tenant.referralRewardType}</strong></li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Referrals Table */}
      <Card>
        <CardHeader>
          <CardTitle>Your Referrals</CardTitle>
          <CardDescription>Track the progress of people you've referred</CardDescription>
        </CardHeader>
        <CardContent>
          {referrals.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No referrals yet. Start sharing your link above!</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Referred User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Activity Progress</TableHead>
                  <TableHead>Quizzes</TableHead>
                  <TableHead>Tournaments</TableHead>
                  <TableHead>Reward</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {referrals.map((ref) => (
                  <TableRow key={ref.id}>
                    <TableCell className="font-medium">{ref.referredUserName}</TableCell>
                    <TableCell>{getStatusBadge(ref.status)}</TableCell>
                    <TableCell>{getActivityBadge(ref.activityStatus)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{ref.quizzesCompleted}/10</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{ref.tournamentsJoined}/1</Badge>
                    </TableCell>
                    <TableCell>
                      {ref.rewardEarned ? (
                        <div className="flex items-center gap-2">
                          {getRewardIcon(ref.rewardType!)}
                          <span className="text-green-600 font-semibold">
                            +{ref.rewardEarned}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">{ref.joinedDate}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
