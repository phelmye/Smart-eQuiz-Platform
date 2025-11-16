import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Plus, Edit, Trash2, Building, Users, Calendar, Crown } from 'lucide-react';
import { useAuth } from './AuthSystem';
import { storage, STORAGE_KEYS, Tenant, User, Tournament, hasPermission } from '@/lib/mockData';

interface TenantManagementProps {
  onBack: () => void;
}

export const TenantManagement: React.FC<TenantManagementProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [newTenant, setNewTenant] = useState({
    name: '',
    plan: 'free' as 'free' | 'pro' | 'enterprise',
    primaryColor: '#2563eb',
    logoUrl: '',
    maxUsers: 100,
    maxTournaments: 10
  });

  useEffect(() => {
    loadTenants();
    loadUsers();
  }, []);

  const loadTenants = () => {
    const savedTenants = storage.get(STORAGE_KEYS.TENANTS) || [];
    setTenants(savedTenants);
  };

  const loadUsers = () => {
    const savedUsers = storage.get(STORAGE_KEYS.USERS) || [];
    setUsers(savedUsers);
  };

  const handleCreateTenant = () => {
    if (!newTenant.name) {
      alert('Please enter a tenant name');
      return;
    }

    const tenant: Tenant = {
      id: editingTenant?.id || `tenant_${Date.now()}`,
      name: newTenant.name,
      plan: newTenant.plan,
      primaryColor: newTenant.primaryColor,
      logoUrl: newTenant.logoUrl,
      maxUsers: newTenant.maxUsers,
      maxTournaments: newTenant.maxTournaments,
      createdAt: editingTenant?.createdAt || new Date().toISOString()
    };

    const allTenants = storage.get(STORAGE_KEYS.TENANTS) || [];
    if (editingTenant) {
      const updatedTenants = allTenants.map((t: Tenant) => 
        t.id === editingTenant.id ? tenant : t
      );
      storage.set(STORAGE_KEYS.TENANTS, updatedTenants);
    } else {
      allTenants.push(tenant);
      storage.set(STORAGE_KEYS.TENANTS, allTenants);
    }

    loadTenants();
    setIsCreateDialogOpen(false);
    setEditingTenant(null);
    resetForm();
  };

  const handleEditTenant = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setNewTenant({
      name: tenant.name,
      plan: tenant.plan,
      primaryColor: tenant.primaryColor,
      logoUrl: tenant.logoUrl || '',
      maxUsers: tenant.maxUsers,
      maxTournaments: tenant.maxTournaments
    });
    setIsCreateDialogOpen(true);
  };

  const handleDeleteTenant = (tenantId: string) => {
    if (confirm('Are you sure you want to delete this tenant? This will affect all associated users.')) {
      const allTenants = storage.get(STORAGE_KEYS.TENANTS) || [];
      const updatedTenants = allTenants.filter((t: Tenant) => t.id !== tenantId);
      storage.set(STORAGE_KEYS.TENANTS, updatedTenants);
      loadTenants();
    }
  };

  const resetForm = () => {
    setNewTenant({
      name: '',
      plan: 'free',
      primaryColor: '#2563eb',
      logoUrl: '',
      maxUsers: 100,
      maxTournaments: 10
    });
  };

  const getTenantStats = (tenantId: string) => {
    const tenantUsers = users.filter(u => u.tenantId === tenantId);
    const tournaments = storage.get(STORAGE_KEYS.TOURNAMENTS) || [];
    const tenantTournaments = tournaments.filter((t: Tournament) => t.tenantId === tenantId);
    
    return {
      userCount: tenantUsers.length,
      tournamentCount: tenantTournaments.length,
      adminCount: tenantUsers.filter(u => u.role === 'org_admin').length
    };
  };

  const getPlanLimits = (plan: string) => {
    switch (plan) {
      case 'free':
        return { maxUsers: 100, maxTournaments: 10, features: ['Basic tournaments', 'User management'] };
      case 'pro':
        return { maxUsers: 500, maxTournaments: 50, features: ['Advanced analytics', 'Custom branding', 'Priority support'] };
      case 'enterprise':
        return { maxUsers: 1000, maxTournaments: 100, features: ['White-label solution', 'API access', 'Dedicated support'] };
      default:
        return { maxUsers: 100, maxTournaments: 10, features: [] };
    }
  };

  if (!user || !hasPermission(user, 'tenants.manage')) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-bold text-red-600 mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-4">You need super admin privileges to manage tenants.</p>
            <Button onClick={onBack}>Back to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                <h1 className="text-3xl font-bold text-gray-900">Tenant Management</h1>
                <p className="text-gray-600">Manage organizations and their subscriptions</p>
              </div>
            </div>

            <Button onClick={() => { setEditingTenant(null); resetForm(); setIsCreateDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Tenant
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Building className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{tenants.length}</p>
                    <p className="text-sm text-gray-600">Total Tenants</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Users className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">{users.length}</p>
                    <p className="text-sm text-gray-600">Total Users</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Crown className="h-8 w-8 text-yellow-600" />
                  <div>
                    <p className="text-2xl font-bold">{tenants.filter(t => t.plan === 'enterprise').length}</p>
                    <p className="text-sm text-gray-600">Enterprise</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold">{tenants.filter(t => t.plan === 'pro').length}</p>
                    <p className="text-sm text-gray-600">Pro Plans</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tenants Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Tenants</CardTitle>
            <CardDescription>Manage organization accounts and subscriptions</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Organization</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Tournaments</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tenants.map((tenant) => {
                  const stats = getTenantStats(tenant.id);
                  return (
                    <TableRow key={tenant.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                            style={{ backgroundColor: tenant.primaryColor }}
                          >
                            {tenant.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium">{tenant.name}</div>
                            <div className="text-sm text-gray-500">{tenant.id}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          tenant.plan === 'enterprise' ? 'default' :
                          tenant.plan === 'pro' ? 'secondary' : 'outline'
                        }>
                          {tenant.plan}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{stats.userCount}/{tenant.maxUsers}</div>
                          <div className="text-gray-500">{stats.adminCount} admins</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {stats.tournamentCount}/{tenant.maxTournaments}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(tenant.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditTenant(tenant)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTenant(tenant.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Create/Edit Tenant Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingTenant ? 'Edit Tenant' : 'Create New Tenant'}
              </DialogTitle>
              <DialogDescription>
                {editingTenant ? 'Update tenant details below.' : 'Set up a new organization account.'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tenant-name">Organization Name *</Label>
                  <Input
                    id="tenant-name"
                    value={newTenant.name}
                    onChange={(e) => setNewTenant(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter organization name"
                  />
                </div>
                
                <div>
                  <Label>Subscription Plan</Label>
                  <Select value={newTenant.plan} onValueChange={(value) => setNewTenant(prev => ({ ...prev, plan: value as 'free' | 'pro' | 'enterprise' }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free Plan</SelectItem>
                      <SelectItem value="pro">Pro Plan</SelectItem>
                      <SelectItem value="enterprise">Enterprise Plan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primary-color">Primary Color</Label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      id="primary-color"
                      value={newTenant.primaryColor}
                      onChange={(e) => setNewTenant(prev => ({ ...prev, primaryColor: e.target.value }))}
                      className="w-12 h-10 border rounded cursor-pointer"
                    />
                    <Input
                      value={newTenant.primaryColor}
                      onChange={(e) => setNewTenant(prev => ({ ...prev, primaryColor: e.target.value }))}
                      placeholder="#2563eb"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="logo-url">Logo URL (Optional)</Label>
                  <Input
                    id="logo-url"
                    value={newTenant.logoUrl}
                    onChange={(e) => setNewTenant(prev => ({ ...prev, logoUrl: e.target.value }))}
                    placeholder="/images/photo1762695857.jpg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="max-users">Max Users</Label>
                  <Input
                    id="max-users"
                    type="number"
                    min="1"
                    value={newTenant.maxUsers}
                    onChange={(e) => setNewTenant(prev => ({ ...prev, maxUsers: parseInt(e.target.value) || 100 }))}
                  />
                </div>

                <div>
                  <Label htmlFor="max-tournaments">Max Tournaments</Label>
                  <Input
                    id="max-tournaments"
                    type="number"
                    min="1"
                    value={newTenant.maxTournaments}
                    onChange={(e) => setNewTenant(prev => ({ ...prev, maxTournaments: parseInt(e.target.value) || 10 }))}
                  />
                </div>
              </div>

              {/* Plan Features Preview */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Plan Features</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>Max Users:</strong> {getPlanLimits(newTenant.plan).maxUsers}</p>
                    <p><strong>Max Tournaments:</strong> {getPlanLimits(newTenant.plan).maxTournaments}</p>
                  </div>
                  <div>
                    <p><strong>Features:</strong></p>
                    <ul className="list-disc list-inside">
                      {getPlanLimits(newTenant.plan).features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTenant}>
                  {editingTenant ? 'Update Tenant' : 'Create Tenant'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};