import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, Gift, Settings, TrendingUp, CheckCircle, Clock, 
  XCircle, DollarSign, Trophy, Zap 
} from 'lucide-react';
import { User, Tenant, storage, STORAGE_KEYS } from '@/lib/mockData';

/**
 * Participant Referral Program (Tier 3)
 * 
 * Tenant Admin Control Panel for managing user-to-user referrals
 * 
 * Features:
 * - Enable/disable referral program
 * - Configure reward type (points, credits, tournament entries)
 * - Set reward amounts in tenant's currency
 * - Approve/reject reward requests
 * - Track referral performance
 * - Process payouts (for credits)
 */

interface ParticipantReferral {
  id: string;
  referrerId: string;
  referrerName: string;
  referredUserId: string;
  referredUserName: string;
  status: 'pending' | 'completed' | 'rewarded';
  referredUserActive: boolean;
  rewardType: 'points' | 'credits' | 'tournament_entries';
  rewardAmount: number;
  rewardCurrency?: string;
  createdAt: string;
  rewardedAt?: string;
}

interface ReferralConfig {
  enabled: boolean;
  rewardType: 'points' | 'credits' | 'tournament_entries';
  rewardAmount: number;
  currency: string;
  minimumActivity: {
    quizzesCompleted?: number;
    tournamentsJoined?: number;
  };
}

export default function ParticipantReferrals({ user, tenant }: { user: User; tenant: Tenant }) {
  // Referral program configuration
  const [config, setConfig] = useState<ReferralConfig>({
    enabled: tenant.referralProgramEnabled || false,
    rewardType: tenant.referralRewardType || 'points',
    rewardAmount: tenant.referralRewardAmount || 100,
    currency: 'USD', // TODO: Get from tenant settings
    minimumActivity: {
      quizzesCompleted: 10,
      tournamentsJoined: 1
    }
  });

  // Mock referrals data
  const [referrals, setReferrals] = useState<ParticipantReferral[]>([
    {
      id: 'ref-1',
      referrerId: 'user-1',
      referrerName: 'John Doe',
      referredUserId: 'user-5',
      referredUserName: 'Jane Smith',
      status: 'completed',
      referredUserActive: true,
      rewardType: 'points',
      rewardAmount: 100,
      createdAt: '2025-01-15',
      rewardedAt: '2025-01-20'
    },
    {
      id: 'ref-2',
      referrerId: 'user-2',
      referrerName: 'Mary Johnson',
      referredUserId: 'user-6',
      referredUserName: 'Bob Wilson',
      status: 'pending',
      referredUserActive: false,
      rewardType: 'points',
      rewardAmount: 100,
      createdAt: '2025-01-18'
    }
  ]);

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const stats = {
    totalReferrals: referrals.length,
    pending: referrals.filter(r => r.status === 'pending').length,
    completed: referrals.filter(r => r.status === 'completed').length,
    rewarded: referrals.filter(r => r.status === 'rewarded').length,
    totalRewardsIssued: referrals
      .filter(r => r.status === 'rewarded')
      .reduce((sum, r) => sum + r.rewardAmount, 0)
  };

  const updateConfig = (field: string, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    // TODO: API call to update tenant referral settings
    console.log('Saving referral config:', config);
    
    // Update tenant in storage
    const tenants = storage.get(STORAGE_KEYS.TENANTS) || [];
    const updated = tenants.map((t: Tenant) => 
      t.id === tenant.id 
        ? { 
            ...t, 
            referralProgramEnabled: config.enabled,
            referralRewardType: config.rewardType,
            referralRewardAmount: config.rewardAmount
          }
        : t
    );
    storage.set(STORAGE_KEYS.TENANTS, updated);
    
    setHasUnsavedChanges(false);
    alert('Referral program settings saved successfully!');
  };

  const approveReward = (referral: ParticipantReferral) => {
    setReferrals(prev => prev.map(r =>
      r.id === referral.id
        ? { ...r, status: 'rewarded', rewardedAt: new Date().toISOString() }
        : r
    ));
    // TODO: API call to approve reward
    console.log('Approved reward for:', referral.id);
  };

  const rejectReferral = (referral: ParticipantReferral) => {
    setReferrals(prev => prev.filter(r => r.id !== referral.id));
    // TODO: API call to reject referral
    console.log('Rejected referral:', referral.id);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'rewarded':
        return <Badge className="bg-green-500 text-white"><CheckCircle className="h-3 w-3 mr-1" />Rewarded</Badge>;
      case 'completed':
        return <Badge className="bg-blue-500 text-white"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500 text-white"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Participant Referral Program</h2>
          <p className="text-gray-500 mt-1">Reward participants for inviting friends to join your organization</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Label htmlFor="program-enabled" className="text-sm">Program Enabled</Label>
            <Switch
              id="program-enabled"
              checked={config.enabled}
              onCheckedChange={(checked) => updateConfig('enabled', checked)}
            />
          </div>
          <Button 
            onClick={handleSave}
            disabled={!hasUnsavedChanges}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Save Changes
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
              <Clock className="h-4 w-4" />
              Pending
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Completed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.completed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Gift className="h-4 w-4" />
              Rewarded
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.rewarded}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Total Issued
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats.totalRewardsIssued} {config.rewardType}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="settings" className="w-full">
        <TabsList>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="referrals">Referrals</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
        </TabsList>

        {/* SETTINGS TAB */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Reward Configuration
              </CardTitle>
              <CardDescription>
                Configure what participants earn when they successfully refer friends
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!config.enabled && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    ⚠️ The referral program is currently <strong>disabled</strong>. 
                    Enable it above to allow participants to earn rewards for referrals.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-6">
                {/* Reward Type */}
                <div>
                  <Label htmlFor="reward-type">Reward Type</Label>
                  <select
                    id="reward-type"
                    value={config.rewardType}
                    onChange={(e) => updateConfig('rewardType', e.target.value)}
                    className="mt-1 w-full px-3 py-2 border rounded-md"
                    disabled={!config.enabled}
                  >
                    <option value="points">Points (XP/Practice Points)</option>
                    <option value="credits">Credits ({config.currency})</option>
                    <option value="tournament_entries">Free Tournament Entries</option>
                  </select>
                  <p className="text-sm text-gray-500 mt-1">
                    {config.rewardType === 'points' && 'Participants earn XP or practice points'}
                    {config.rewardType === 'credits' && 'Participants earn wallet credits for tournament fees'}
                    {config.rewardType === 'tournament_entries' && 'Participants get free tournament entry passes'}
                  </p>
                </div>

                {/* Reward Amount */}
                <div>
                  <Label htmlFor="reward-amount">Reward Amount</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="reward-amount"
                      type="number"
                      min="1"
                      value={config.rewardAmount}
                      onChange={(e) => updateConfig('rewardAmount', parseInt(e.target.value))}
                      disabled={!config.enabled}
                    />
                    <span className="px-3 py-2 bg-gray-100 rounded-md text-sm">
                      {config.rewardType === 'points' && 'points'}
                      {config.rewardType === 'credits' && config.currency}
                      {config.rewardType === 'tournament_entries' && 'entries'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Amount awarded per successful referral
                  </p>
                </div>
              </div>

              {/* Minimum Activity Requirements */}
              <div className="border-t pt-6">
                <h4 className="font-semibold mb-3">Minimum Activity Requirements</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Referred users must meet these criteria before the referrer receives their reward:
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="min-quizzes">Quizzes Completed</Label>
                    <Input
                      id="min-quizzes"
                      type="number"
                      min="0"
                      value={config.minimumActivity.quizzesCompleted}
                      onChange={(e) => updateConfig('minimumActivity', {
                        ...config.minimumActivity,
                        quizzesCompleted: parseInt(e.target.value)
                      })}
                      disabled={!config.enabled}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="min-tournaments">Tournaments Joined</Label>
                    <Input
                      id="min-tournaments"
                      type="number"
                      min="0"
                      value={config.minimumActivity.tournamentsJoined}
                      onChange={(e) => updateConfig('minimumActivity', {
                        ...config.minimumActivity,
                        tournamentsJoined: parseInt(e.target.value)
                      })}
                      disabled={!config.enabled}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Preview: User Experience</h4>
                <p className="text-sm text-blue-800">
                  When participants refer a friend who completes {config.minimumActivity.quizzesCompleted} quizzes 
                  and joins {config.minimumActivity.tournamentsJoined} tournament(s), they will receive{' '}
                  <strong>{config.rewardAmount} {config.rewardType}</strong>
                  {config.rewardType === 'credits' && ` (${config.currency})`}.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* REFERRALS TAB */}
        <TabsContent value="referrals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Referral Activity</CardTitle>
              <CardDescription>Track all participant referrals and their status</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Referrer</TableHead>
                    <TableHead>Referred User</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Activity</TableHead>
                    <TableHead>Reward</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {referrals.map((ref) => (
                    <TableRow key={ref.id}>
                      <TableCell className="font-medium">{ref.referrerName}</TableCell>
                      <TableCell>{ref.referredUserName}</TableCell>
                      <TableCell>{getStatusBadge(ref.status)}</TableCell>
                      <TableCell>
                        {ref.referredUserActive ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800">
                            <XCircle className="h-3 w-3 mr-1" />
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getRewardIcon(ref.rewardType)}
                          <span>{ref.rewardAmount} {ref.rewardType}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">{ref.createdAt}</TableCell>
                      <TableCell>
                        {ref.status === 'completed' ? (
                          <Button
                            size="sm"
                            onClick={() => approveReward(ref)}
                          >
                            Approve Reward
                          </Button>
                        ) : ref.status === 'pending' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => rejectReferral(ref)}
                          >
                            Reject
                          </Button>
                        ) : (
                          <span className="text-sm text-gray-400">Completed</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* REWARDS TAB */}
        <TabsContent value="rewards" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Reward Approvals</CardTitle>
              <CardDescription>Review and approve rewards for completed referrals</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">
                {stats.completed === 0 
                  ? 'No pending reward approvals at this time.'
                  : `${stats.completed} referral(s) waiting for reward approval.`}
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
