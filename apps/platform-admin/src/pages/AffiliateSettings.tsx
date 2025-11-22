import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Settings, TrendingUp, Calendar } from 'lucide-react';

/**
 * Affiliate Commission Settings (Super Admin)
 * 
 * Configure commission durations at multiple levels:
 * 1. Global tier defaults (Bronze: 3mo, Silver: 6mo, etc.)
 * 2. Plan-based overrides (Basic: 1mo, Enterprise: 6mo)
 * 3. Promotional campaigns (Holiday boost: +3 months)
 */

interface TierConfig {
  tierName: string;
  commissionRate: number;
  recurringMonths: number;
  bonusPerReferral: number;
  displayName: string;
  color: string;
}

interface PlanOverride {
  planId: string;
  planName: string;
  recurringMonths: number;
  notes: string;
}

export default function AffiliateSettings() {
  // Tier configurations
  const [tiers, setTiers] = useState<TierConfig[]>([
    {
      tierName: 'bronze',
      commissionRate: 20,
      recurringMonths: 3,
      bonusPerReferral: 0,
      displayName: 'Bronze Partner',
      color: '#CD7F32'
    },
    {
      tierName: 'silver',
      commissionRate: 25,
      recurringMonths: 6,
      bonusPerReferral: 50,
      displayName: 'Silver Partner',
      color: '#C0C0C0'
    },
    {
      tierName: 'gold',
      commissionRate: 30,
      recurringMonths: 12,
      bonusPerReferral: 100,
      displayName: 'Gold Partner',
      color: '#FFD700'
    },
    {
      tierName: 'platinum',
      commissionRate: 35,
      recurringMonths: 24,
      bonusPerReferral: 500,
      displayName: 'Platinum Partner',
      color: '#E5E4E2'
    }
  ]);

  // Plan-based overrides
  const [planOverrides, setPlanOverrides] = useState<PlanOverride[]>([
    {
      planId: 'basic',
      planName: 'Basic',
      recurringMonths: 1,
      notes: 'Low-value plan = shorter duration'
    },
    {
      planId: 'professional',
      planName: 'Professional',
      recurringMonths: 2,
      notes: 'Standard plan duration'
    },
    {
      planId: 'premium',
      planName: 'Premium',
      recurringMonths: 3,
      notes: 'Mid-tier plan'
    },
    {
      planId: 'enterprise',
      planName: 'Enterprise',
      recurringMonths: 6,
      notes: 'High-value plan = longer duration'
    }
  ]);

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const updateTier = (tierName: string, field: string, value: number) => {
    setTiers(prev => prev.map(t => 
      t.tierName === tierName ? { ...t, [field]: value } : t
    ));
    setHasUnsavedChanges(true);
  };

  const updatePlanOverride = (planId: string, months: number) => {
    setPlanOverrides(prev => prev.map(p =>
      p.planId === planId ? { ...p, recurringMonths: months } : p
    ));
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    // TODO: API call to save settings
    console.log('Saving tier configs:', tiers);
    console.log('Saving plan overrides:', planOverrides);
    setHasUnsavedChanges(false);
    alert('Settings saved successfully!');
  };

  const calculateExampleEarnings = (planPrice: number, tier: TierConfig) => {
    const monthly = (planPrice * tier.commissionRate) / 100;
    const total = monthly * tier.recurringMonths;
    return { monthly, total };
  };

  const durationOptions = [
    { value: 1, label: '1 month' },
    { value: 2, label: '2 months' },
    { value: 3, label: '3 months' },
    { value: 6, label: '6 months' },
    { value: 12, label: '12 months' },
    { value: 18, label: '18 months' },
    { value: 24, label: '24 months' },
    { value: 999, label: 'Lifetime (999 months)' }
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Affiliate Program Settings</h1>
          <p className="text-gray-500 mt-1">Configure commission tiers and duration policies</p>
        </div>
        <Button 
          onClick={handleSave}
          disabled={!hasUnsavedChanges}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="tiers" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="tiers">Commission Tiers</TabsTrigger>
          <TabsTrigger value="plans">Plan Overrides</TabsTrigger>
        </TabsList>

        {/* TIER CONFIGURATION */}
        <TabsContent value="tiers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Commission Tier Configuration
              </CardTitle>
              <CardDescription>
                Set default commission rates and durations for each affiliate tier
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {tiers.map((tier) => (
                  <div key={tier.tierName} className="border rounded-lg p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                          style={{ backgroundColor: tier.color }}
                        >
                          {tier.tierName[0].toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">{tier.displayName}</h3>
                          <p className="text-sm text-gray-500">{tier.tierName.toUpperCase()} TIER</p>
                        </div>
                      </div>
                      <Badge className="text-sm px-4 py-1">
                        {tier.commissionRate}% commission
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      {/* Commission Rate */}
                      <div>
                        <Label htmlFor={`${tier.tierName}-rate`}>Commission Rate (%)</Label>
                        <Input
                          id={`${tier.tierName}-rate`}
                          type="number"
                          min="0"
                          max="100"
                          value={tier.commissionRate}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateTier(tier.tierName, 'commissionRate', parseInt(e.target.value))}
                          className="mt-1"
                        />
                      </div>

                      {/* Duration */}
                      <div>
                        <Label htmlFor={`${tier.tierName}-duration`}>Commission Duration</Label>
                        <select
                          id={`${tier.tierName}-duration`}
                          value={tier.recurringMonths}
                          onChange={(e) => updateTier(tier.tierName, 'recurringMonths', parseInt(e.target.value))}
                          className="mt-1 w-full px-3 py-2 border rounded-md"
                        >
                          {durationOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>

                      {/* Bonus */}
                      <div>
                        <Label htmlFor={`${tier.tierName}-bonus`}>Bonus per Referral ($)</Label>
                        <Input
                          id={`${tier.tierName}-bonus`}
                          type="number"
                          min="0"
                          value={tier.bonusPerReferral}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateTier(tier.tierName, 'bonusPerReferral', parseInt(e.target.value))}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    {/* Example Earnings */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Example Earnings (Professional Plan @ $49/month)</h4>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-gray-500">Monthly Commission</div>
                          <div className="text-lg font-semibold text-blue-600">
                            ${calculateExampleEarnings(49, tier).monthly.toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500">Total Commission</div>
                          <div className="text-lg font-semibold text-green-600">
                            ${calculateExampleEarnings(49, tier).total.toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500">With Bonus</div>
                          <div className="text-lg font-semibold text-purple-600">
                            ${(calculateExampleEarnings(49, tier).total + tier.bonusPerReferral).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PLAN OVERRIDES */}
        <TabsContent value="plans" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Plan-Based Duration Overrides
              </CardTitle>
              <CardDescription>
                Override commission durations based on the tenant plan being sold
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Higher-value plans can have longer commission periods to incentivize promoting premium subscriptions.
              </p>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plan</TableHead>
                    <TableHead>Plan Price</TableHead>
                    <TableHead>Commission Duration</TableHead>
                    <TableHead>Example Earnings (Bronze 20%)</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {planOverrides.map((plan) => {
                    const planPrices: Record<string, number> = {
                      basic: 19,
                      professional: 49,
                      premium: 99,
                      enterprise: 199
                    };
                    const price = planPrices[plan.planId] || 0;
                    const monthlyCommission = (price * 20) / 100;
                    const totalEarnings = monthlyCommission * plan.recurringMonths;

                    return (
                      <TableRow key={plan.planId}>
                        <TableCell className="font-medium">{plan.planName}</TableCell>
                        <TableCell>${price}/month</TableCell>
                        <TableCell>
                          <select
                            value={plan.recurringMonths}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updatePlanOverride(plan.planId, parseInt(e.target.value))}
                            className="px-3 py-1 border rounded-md"
                          >
                            {durationOptions.filter(o => o.value <= 12).map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-semibold text-green-600">${totalEarnings.toFixed(2)} total</div>
                            <div className="text-gray-500">${monthlyCommission.toFixed(2)}/mo × {plan.recurringMonths}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">{plan.notes}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">💡 Strategy Tip</h4>
                <p className="text-sm text-blue-800">
                  Setting shorter durations for lower-tier plans and longer durations for premium plans 
                  creates a natural incentive for affiliates to promote your highest-value subscriptions.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Commission Strategy Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className="text-sm text-gray-500 mb-1">Shortest Duration</div>
              <div className="text-2xl font-bold text-gray-900">
                {Math.min(...planOverrides.map(p => p.recurringMonths))} month
              </div>
              <div className="text-xs text-gray-500">Basic plan referrals</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Longest Duration</div>
              <div className="text-2xl font-bold text-gray-900">
                {Math.max(...tiers.map(t => t.recurringMonths === 999 ? 0 : t.recurringMonths))} months
              </div>
              <div className="text-xs text-gray-500">
                {tiers.find(t => t.recurringMonths === Math.max(...tiers.map(t => t.recurringMonths)))?.displayName}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Highest Commission</div>
              <div className="text-2xl font-bold text-green-600">
                {Math.max(...tiers.map(t => t.commissionRate))}%
              </div>
              <div className="text-xs text-gray-500">Platinum tier</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Max Bonus</div>
              <div className="text-2xl font-bold text-purple-600">
                ${Math.max(...tiers.map(t => t.bonusPerReferral))}
              </div>
              <div className="text-xs text-gray-500">Per referral</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
