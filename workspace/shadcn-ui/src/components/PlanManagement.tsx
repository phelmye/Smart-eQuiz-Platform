import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Trash2, Edit, Plus, Shield, DollarSign, Users, Trophy, HelpCircle } from 'lucide-react';
import { Plan, storage, STORAGE_KEYS, defaultPlans, calculateYearlyPrice, calculateYearlyDiscount, formatCurrency } from '@/lib/mockData';

interface PlanManagementProps {
  onBack: () => void;
}

const PlanManagement: React.FC<PlanManagementProps> = ({ onBack }) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newFeature, setNewFeature] = useState('');

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = () => {
    try {
      const storedPlans = storage.get(STORAGE_KEYS.PLANS) || defaultPlans;
      setPlans(storedPlans);
    } catch (error) {
      console.error('Error loading plans:', error);
      setError('Failed to load plans');
    }
  };

  const savePlans = (updatedPlans: Plan[]) => {
    try {
      storage.set(STORAGE_KEYS.PLANS, updatedPlans);
      setPlans(updatedPlans);
      setSuccess('Plans updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error saving plans:', error);
      setError('Failed to save plans');
    }
  };

  const createNewPlan = () => {
    const newPlan: Plan = {
      id: `plan-${Date.now()}`,
      name: '',
      displayName: '',
      description: '',
      monthlyPrice: 0,
      yearlyDiscountPercent: 0,
      billingOptions: ['monthly'],
      maxUsers: 100,
      maxTournaments: 10,
      maxQuestionsPerTournament: 50,
      maxQuestionCategories: 3,
      features: [],
      isDefault: false,
      isActive: true,
      createdAt: new Date().toISOString()
    };
    setEditingPlan(newPlan);
    setIsCreateDialogOpen(true);
  };

  const editPlan = (plan: Plan) => {
    setEditingPlan({ ...plan });
    setIsEditDialogOpen(true);
  };

  const deletePlan = (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    if (plan?.isDefault) {
      setError('Default plans cannot be deleted');
      return;
    }

    if (window.confirm('Are you sure you want to delete this plan? This action cannot be undone.')) {
      const updatedPlans = plans.filter(p => p.id !== planId);
      savePlans(updatedPlans);
    }
  };

  const handleSavePlan = () => {
    if (!editingPlan) return;

    // Validation
    if (!editingPlan.displayName.trim()) {
      setError('Display name is required');
      return;
    }
    if (!editingPlan.description.trim()) {
      setError('Description is required');
      return;
    }
    if (editingPlan.monthlyPrice < 0) {
      setError('Monthly price cannot be negative');
      return;
    }
    if (editingPlan.yearlyDiscountPercent < 0 || editingPlan.yearlyDiscountPercent > 100) {
      setError('Yearly discount must be between 0% and 100%');
      return;
    }

    // Generate name from display name if not set
    if (!editingPlan.name.trim()) {
      editingPlan.name = editingPlan.displayName.toLowerCase().replace(/\s+/g, '-');
    }

    const updatedPlan = {
      ...editingPlan,
      updatedAt: new Date().toISOString()
    };

    let updatedPlans: Plan[];
    const existingIndex = plans.findIndex(p => p.id === editingPlan.id);

    if (existingIndex >= 0) {
      // Update existing plan
      updatedPlans = [...plans];
      updatedPlans[existingIndex] = updatedPlan;
    } else {
      // Add new plan
      updatedPlans = [...plans, updatedPlan];
    }

    savePlans(updatedPlans);
    setEditingPlan(null);
    setIsCreateDialogOpen(false);
    setIsEditDialogOpen(false);
    setError('');
  };

  const togglePlanActive = (planId: string) => {
    const updatedPlans = plans.map(plan => 
      plan.id === planId ? { ...plan, isActive: !plan.isActive } : plan
    );
    savePlans(updatedPlans);
  };

  const addFeature = () => {
    if (!editingPlan || !newFeature.trim()) return;
    
    setEditingPlan({
      ...editingPlan,
      features: [...editingPlan.features, newFeature.trim()]
    });
    setNewFeature('');
  };

  const removeFeature = (index: number) => {
    if (!editingPlan) return;
    
    setEditingPlan({
      ...editingPlan,
      features: editingPlan.features.filter((_, i) => i !== index)
    });
  };

  const formatPrice = (monthlyPrice: number, yearlyDiscountPercent: number) => {
    if (monthlyPrice === 0) return 'Free';
    
    const monthlyFormatted = formatCurrency(monthlyPrice);
    
    if (yearlyDiscountPercent > 0) {
      const yearlyPrice = calculateYearlyPrice(monthlyPrice, yearlyDiscountPercent);
      const yearlyFormatted = formatCurrency(yearlyPrice);
      return `${monthlyFormatted}/mo • ${yearlyFormatted}/yr (save ${yearlyDiscountPercent}%)`;
    }
    
    return `${monthlyFormatted}/month`;
  };

  const formatLimit = (limit: number) => {
    return limit === -1 ? 'Unlimited' : limit.toLocaleString();
  };

  const formatLimitWithUnit = (limit: number, unit: string) => {
    return limit === -1 ? 'Unlimited' : `${limit.toLocaleString()} ${unit}`;
  };

  const PlanDialog = ({ isOpen, onClose, title }: { isOpen: boolean; onClose: () => void; title: string }) => (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {editingPlan?.isDefault ? 'Edit the details of this default plan' : 'Configure the plan details and features'}
          </DialogDescription>
        </DialogHeader>

        {editingPlan && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={editingPlan.displayName}
                  onChange={(e) => setEditingPlan({ ...editingPlan, displayName: e.target.value })}
                  placeholder="e.g., Pro Plan"
                  disabled={editingPlan.isDefault}
                />
              </div>
              <div>
                <Label htmlFor="monthlyPrice">Monthly Price ($)</Label>
                <Input
                  id="monthlyPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={editingPlan.monthlyPrice}
                  onChange={(e) => setEditingPlan({ ...editingPlan, monthlyPrice: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="yearlyDiscount">Yearly Discount (%)</Label>
                <Input
                  id="yearlyDiscount"
                  type="number"
                  min="0"
                  max="100"
                  value={editingPlan.yearlyDiscountPercent}
                  onChange={(e) => setEditingPlan({ ...editingPlan, yearlyDiscountPercent: Number(e.target.value) })}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Discount applied to yearly billing
                </p>
              </div>
              <div>
                <Label>Billing Options</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="monthlyBilling"
                      checked={editingPlan.billingOptions.includes('monthly')}
                      onCheckedChange={(checked) => {
                        const newOptions = checked 
                          ? [...editingPlan.billingOptions.filter(opt => opt !== 'monthly'), 'monthly'] as ('monthly' | 'yearly')[]
                          : editingPlan.billingOptions.filter(opt => opt !== 'monthly') as ('monthly' | 'yearly')[];
                        setEditingPlan({ ...editingPlan, billingOptions: newOptions });
                      }}
                    />
                    <Label htmlFor="monthlyBilling" className="text-sm">Monthly billing</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="yearlyBilling"
                      checked={editingPlan.billingOptions.includes('yearly')}
                      onCheckedChange={(checked) => {
                        const newOptions = checked 
                          ? [...editingPlan.billingOptions.filter(opt => opt !== 'yearly'), 'yearly'] as ('monthly' | 'yearly')[]
                          : editingPlan.billingOptions.filter(opt => opt !== 'yearly') as ('monthly' | 'yearly')[];
                        setEditingPlan({ ...editingPlan, billingOptions: newOptions });
                      }}
                    />
                    <Label htmlFor="yearlyBilling" className="text-sm">Yearly billing</Label>
                  </div>
                </div>
              </div>

              {/* Pricing Preview */}
              {editingPlan.monthlyPrice > 0 && (
                <div className="border rounded-lg p-4 bg-muted/50">
                  <h4 className="font-semibold mb-2">Pricing Preview</h4>
                  <div className="space-y-2 text-sm">
                    {editingPlan.billingOptions.includes('monthly') && (
                      <div className="flex justify-between">
                        <span>Monthly:</span>
                        <span className="font-medium">{formatCurrency(editingPlan.monthlyPrice)}/month</span>
                      </div>
                    )}
                    {editingPlan.billingOptions.includes('yearly') && (
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span>Yearly:</span>
                          <span className="font-medium">
                            {formatCurrency(calculateYearlyPrice(editingPlan.monthlyPrice, editingPlan.yearlyDiscountPercent))}/year
                          </span>
                        </div>
                        {editingPlan.yearlyDiscountPercent > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span>Yearly Savings:</span>
                            <span className="font-medium">
                              {formatCurrency(calculateYearlyDiscount(editingPlan.monthlyPrice, editingPlan.yearlyDiscountPercent))} ({editingPlan.yearlyDiscountPercent}% off)
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editingPlan.description}
                onChange={(e) => setEditingPlan({ ...editingPlan, description: e.target.value })}
                placeholder="Describe what this plan offers..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="maxUsers">Max Users</Label>
                <div className="space-y-2">
                  <Input
                    id="maxUsers"
                    type="number"
                    min="1"
                    value={editingPlan.maxUsers === -1 ? '' : editingPlan.maxUsers}
                    onChange={(e) => setEditingPlan({ ...editingPlan, maxUsers: Number(e.target.value) || 1 })}
                    placeholder={editingPlan.maxUsers === -1 ? 'Unlimited' : undefined}
                    disabled={editingPlan.maxUsers === -1}
                  />
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="unlimitedUsers"
                      checked={editingPlan.maxUsers === -1}
                      onCheckedChange={(checked) => setEditingPlan({ 
                        ...editingPlan, 
                        maxUsers: checked ? -1 : 100 
                      })}
                    />
                    <Label htmlFor="unlimitedUsers" className="text-sm">Unlimited</Label>
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="maxTournaments">Max Tournaments</Label>
                <div className="space-y-2">
                  <Input
                    id="maxTournaments"
                    type="number"
                    min="1"
                    value={editingPlan.maxTournaments === -1 ? '' : editingPlan.maxTournaments}
                    onChange={(e) => setEditingPlan({ ...editingPlan, maxTournaments: Number(e.target.value) || 1 })}
                    placeholder={editingPlan.maxTournaments === -1 ? 'Unlimited' : undefined}
                    disabled={editingPlan.maxTournaments === -1}
                  />
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="unlimitedTournaments"
                      checked={editingPlan.maxTournaments === -1}
                      onCheckedChange={(checked) => setEditingPlan({ 
                        ...editingPlan, 
                        maxTournaments: checked ? -1 : 10 
                      })}
                    />
                    <Label htmlFor="unlimitedTournaments" className="text-sm">Unlimited</Label>
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="maxQuestions">Max Questions per Tournament</Label>
                <div className="space-y-2">
                  <Input
                    id="maxQuestions"
                    type="number"
                    min="1"
                    value={editingPlan.maxQuestionsPerTournament === -1 ? '' : editingPlan.maxQuestionsPerTournament}
                    onChange={(e) => setEditingPlan({ ...editingPlan, maxQuestionsPerTournament: Number(e.target.value) || 1 })}
                    placeholder={editingPlan.maxQuestionsPerTournament === -1 ? 'Unlimited' : undefined}
                    disabled={editingPlan.maxQuestionsPerTournament === -1}
                  />
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="unlimitedQuestions"
                      checked={editingPlan.maxQuestionsPerTournament === -1}
                      onCheckedChange={(checked) => setEditingPlan({ 
                        ...editingPlan, 
                        maxQuestionsPerTournament: checked ? -1 : 50 
                      })}
                    />
                    <Label htmlFor="unlimitedQuestions" className="text-sm">Unlimited</Label>
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="maxCategories">Max Question Categories</Label>
                <div className="space-y-2">
                  <Input
                    id="maxCategories"
                    type="number"
                    min="1"
                    value={editingPlan.maxQuestionCategories === -1 ? '' : editingPlan.maxQuestionCategories}
                    onChange={(e) => setEditingPlan({ ...editingPlan, maxQuestionCategories: Number(e.target.value) || 1 })}
                    placeholder={editingPlan.maxQuestionCategories === -1 ? 'Unlimited' : undefined}
                    disabled={editingPlan.maxQuestionCategories === -1}
                  />
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="unlimitedCategories"
                      checked={editingPlan.maxQuestionCategories === -1}
                      onCheckedChange={(checked) => setEditingPlan({ 
                        ...editingPlan, 
                        maxQuestionCategories: checked ? -1 : 3 
                      })}
                    />
                    <Label htmlFor="unlimitedCategories" className="text-sm">Unlimited</Label>
                  </div>
                  <p className="text-xs text-gray-500">
                    Controls how many question categories users can create. Pro plans typically have 3 categories.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <Label>Features</Label>
              <div className="space-y-2">
                {editingPlan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input value={feature} disabled className="flex-1" />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeFeature(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    placeholder="Add a new feature..."
                    onKeyPress={(e) => e.key === 'Enter' && addFeature()}
                  />
                  <Button type="button" onClick={addFeature}>Add</Button>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={editingPlan.isActive}
                onCheckedChange={(checked) => setEditingPlan({ ...editingPlan, isActive: checked })}
              />
              <Label htmlFor="isActive">Plan is active</Label>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSavePlan}>
            Save Plan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Plan Management</h1>
          <p className="text-gray-600 mt-2">Manage subscription plans for your platform</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={createNewPlan} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create New Plan
          </Button>
          <Button variant="outline" onClick={onBack}>
            Back to Dashboard
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-4">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.id} className={`relative ${!plan.isActive ? 'opacity-60' : ''}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {plan.displayName}
                    {plan.isDefault && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        Default
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <DollarSign className="h-4 w-4" />
                    {formatPrice(plan.monthlyPrice, plan.yearlyDiscountPercent)}
                  </CardDescription>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => editPlan(plan)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  {!plan.isDefault && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deletePlan(plan.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <p className="text-sm text-gray-600 mb-4">{plan.description}</p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4" />
                  <span>{formatLimitWithUnit(plan.maxUsers, 'users')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Trophy className="h-4 w-4" />
                  <span>{formatLimitWithUnit(plan.maxTournaments, 'tournaments')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <HelpCircle className="h-4 w-4" />
                  <span>{formatLimitWithUnit(plan.maxQuestionsPerTournament, 'questions per tournament')}</span>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-sm font-medium">Features:</Label>
                <ul className="text-sm space-y-1">
                  {plan.features.slice(0, 3).map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 bg-blue-600 rounded-full" />
                      {feature}
                    </li>
                  ))}
                  {plan.features.length > 3 && (
                    <li className="text-gray-500">
                      +{plan.features.length - 3} more features
                    </li>
                  )}
                </ul>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <Badge variant={plan.isActive ? 'default' : 'secondary'}>
                  {plan.isActive ? 'Active' : 'Inactive'}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => togglePlanActive(plan.id)}
                >
                  {plan.isActive ? 'Deactivate' : 'Activate'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <PlanDialog
        isOpen={isCreateDialogOpen}
        onClose={() => {
          setIsCreateDialogOpen(false);
          setEditingPlan(null);
          setError('');
        }}
        title="Create New Plan"
      />

      <PlanDialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setEditingPlan(null);
          setError('');
        }}
        title="Edit Plan"
      />
    </div>
  );
};

export default PlanManagement;