import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  LogIn, 
  Users, 
  Building, 
  CreditCard, 
  Calendar,
  Search,
  Filter,
  Eye,
  Settings,
  Ban,
  CheckCircle,
  HardDrive,
  Activity,
  AlertCircle
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Tenant, 
  User, 
  Plan,
  STORAGE_KEYS, 
  storage, 
  getUsersByTenant,
  formatCurrency,
  logAuditEvent
} from '@/lib/mockData';

interface TenantManagementForSuperAdminProps {
  user: User;
  onLoginAs: (tenantId: string) => void;
}

export default function TenantManagementForSuperAdmin({ user, onLoginAs }: TenantManagementForSuperAdminProps) {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [suspensionReason, setSuspensionReason] = useState('');

  useEffect(() => {
    loadTenants();
    loadPlans();
  }, []);

  const loadTenants = () => {
    const allTenants = storage.get(STORAGE_KEYS.TENANTS) || [];
    setTenants(allTenants);
  };

  const loadPlans = () => {
    const allPlans = storage.get(STORAGE_KEYS.PLANS) || [];
    setPlans(allPlans);
  };

  const getTenantPlan = (planId: string) => {
    return plans.find(plan => plan.id === planId);
  };

  const getTenantUserCount = (tenantId: string) => {
    return getUsersByTenant(tenantId).length;
  };

  const getTenantAdmins = (tenantId: string) => {
    const tenantUsers = getUsersByTenant(tenantId);
    return tenantUsers.filter(user => user.role?.toLowerCase() === 'org_admin');
  };

  const handleLoginAs = (tenant: Tenant) => {
    const tenantAdmins = getTenantAdmins(tenant.id);
    
    if (tenantAdmins.length === 0) {
      alert(`No organization admin found for ${tenant.name}. Cannot login as tenant.`);
      return;
    }

    const primaryAdmin = tenantAdmins[0]; // Use first admin found
    
    // Store original super admin info for logout
    storage.set('original_super_admin', user);
    
    // Set current user to the tenant admin
    storage.set(STORAGE_KEYS.CURRENT_USER, primaryAdmin);
    
    // Notify parent component about the login
    onLoginAs(tenant.id);
    
    console.log(`🔄 Super admin logged in as ${primaryAdmin.name} (${tenant.name})`);
  };

  const handleSuspendTenant = () => {
    if (!selectedTenant || !suspensionReason.trim()) {
      alert('Please provide a reason for suspension');
      return;
    }

    const updatedTenants = tenants.map(t => 
      t.id === selectedTenant.id 
        ? {
            ...t,
            status: 'suspended' as const,
            suspendedAt: new Date().toISOString(),
            suspendedBy: user.id,
            suspensionReason: suspensionReason
          }
        : t
    );

    storage.set(STORAGE_KEYS.TENANTS, updatedTenants);
    setTenants(updatedTenants);
    
    // Log audit event
    logAuditEvent({
      tenantId: selectedTenant.id,
      userId: user.id,
      action: 'tenant.suspend',
      entityType: 'tenant',
      entityId: selectedTenant.id,
      details: {
        reason: suspensionReason,
        tenantName: selectedTenant.name
      }
    });
    
    setShowSuspendDialog(false);
    setSuspensionReason('');
    setSelectedTenant(null);
  };

  const handleReactivateTenant = (tenant: Tenant) => {
    if (!window.confirm(`Reactivate ${tenant.name}?`)) return;

    const updatedTenants = tenants.map(t => 
      t.id === tenant.id 
        ? {
            ...t,
            status: 'active' as const,
            suspendedAt: undefined,
            suspendedBy: undefined,
            suspensionReason: undefined
          }
        : t
    );

    storage.set(STORAGE_KEYS.TENANTS, updatedTenants);
    setTenants(updatedTenants);
    
    // Log audit event
    logAuditEvent({
      tenantId: tenant.id,
      userId: user.id,
      action: 'tenant.reactivate',
      entityType: 'tenant',
      entityId: tenant.id,
      details: {
        previousStatus: 'suspended',
        tenantName: tenant.name
      }
    });
  };

  const openSuspendDialog = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setShowSuspendDialog(true);
  };

  const openDetailsDialog = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setShowDetailsDialog(true);
  };

  const getStatusBadge = (tenant: Tenant) => {
    const status = tenant.status || 'active';
    const variants = {
      active: 'default',
      suspended: 'destructive',
      deactivated: 'secondary'
    };
    
    return (
      <Badge variant={variants[status] as any}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPlanBadge = (planId: string) => {
    const plan = getTenantPlan(planId);
    if (!plan) return <Badge variant="secondary">Unknown</Badge>;
    
    const colors = {
      'plan-free': 'bg-gray-100 text-gray-800',
      'plan-pro': 'bg-blue-100 text-blue-800', 
      'plan-enterprise': 'bg-purple-100 text-purple-800'
    };
    
    return (
      <Badge className={colors[plan.id as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {plan.name}
      </Badge>
    );
  };

  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = tenant.name.toLowerCase().includes(searchTerm.toLowerCase());
    const tenantStatus = tenant.status || 'active';
    const matchesStatus = statusFilter === 'all' || statusFilter === tenantStatus;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tenant Management</h1>
          <p className="text-gray-600 mt-2">
            Manage all tenant accounts and access their dashboards
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Building className="w-8 h-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{tenants.length}</div>
                <div className="text-sm text-gray-500">Total Tenants</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold">
                  {tenants.reduce((sum, tenant) => sum + getTenantUserCount(tenant.id), 0)}
                </div>
                <div className="text-sm text-gray-500">Total Users</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CreditCard className="w-8 h-8 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">
                  {tenants.filter(t => t.planId !== 'plan-free').length}
                </div>
                <div className="text-sm text-gray-500">Paid Plans</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">
                  {tenants.filter(t => (t.status || 'active') === 'active').length}
                </div>
                <div className="text-sm text-gray-500">Active Tenants</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Search tenants..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'suspended')}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tenants Table */}
      <Card>
        <CardHeader>
          <CardTitle>Tenant Accounts ({filteredTenants.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organization</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Admin</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTenants.map((tenant) => {
                const plan = getTenantPlan(tenant.planId);
                const userCount = getTenantUserCount(tenant.id);
                const admins = getTenantAdmins(tenant.id);
                const primaryAdmin = admins[0];
                const tenantStatus = tenant.status || 'active';
                
                return (
                  <TableRow key={tenant.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{tenant.name}</div>
                        <div className="text-sm text-gray-500">{tenant.id}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getPlanBadge(tenant.planId)}
                      {plan && (
                        <div className="text-xs text-gray-500 mt-1">
                          {plan.monthlyPrice > 0 ? formatCurrency(plan.monthlyPrice) + '/mo' : 'Free'}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span>{tenant.currentUsers || userCount}</span>
                        {plan && plan.maxUsers !== -1 && (
                          <span className="text-xs text-gray-500">/ {plan.maxUsers}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-xs text-gray-600">
                          Tournaments: {tenant.currentTournaments || 0}
                          {plan && plan.maxTournaments !== -1 && `/ ${plan.maxTournaments}`}
                        </div>
                        <div className="text-xs text-gray-600 flex items-center gap-1">
                          <HardDrive className="w-3 h-3" />
                          {tenant.storageUsedMB?.toFixed(1) || 0} MB
                        </div>
                        {tenant.lastActivityAt && (
                          <div className="text-xs text-gray-500">
                            Active {new Date(tenant.lastActivityAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {primaryAdmin ? (
                        <div>
                          <div className="font-medium text-sm">{primaryAdmin.name}</div>
                          <div className="text-xs text-gray-500">{primaryAdmin.email}</div>
                        </div>
                      ) : (
                        <span className="text-sm text-red-600">No Admin</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {getStatusBadge(tenant)}
                        {tenant.suspensionReason && (
                          <div className="text-xs text-gray-500 max-w-xs truncate\" title={tenant.suspensionReason}>
                            {tenant.suspensionReason}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDetailsDialog(tenant)}
                          title="View details"
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleLoginAs(tenant)}
                          disabled={admins.length === 0 || tenantStatus === 'suspended'}
                          title={
                            admins.length === 0 
                                ? 'No admin available'
                                : tenantStatus === 'suspended'
                                ? 'Cannot login to suspended tenant'
                                : `Login as ${primaryAdmin?.name}`
                          }
                        >
                          <LogIn className="w-3 h-3" />
                        </Button>
                        
                        {tenantStatus === 'active' ? (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => openSuspendDialog(tenant)}
                            title="Suspend tenant"
                          >
                            <Ban className="w-3 h-3" />
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleReactivateTenant(tenant)}
                            title="Reactivate tenant"
                          >
                            <CheckCircle className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Suspension Dialog */}
      <Dialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend Tenant</DialogTitle>
            <DialogDescription>
              Are you sure you want to suspend {selectedTenant?.name}? Users will not be able to log in.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This will immediately prevent all users from accessing this tenant's account.
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Label htmlFor="reason">Suspension Reason</Label>
              <Textarea
                id="reason"
                placeholder="Enter reason for suspension (required)..."
                value={suspensionReason}
                onChange={(e) => setSuspensionReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowSuspendDialog(false);
              setSuspensionReason('');
              setSelectedTenant(null);
            }}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleSuspendTenant}>
              Suspend Tenant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tenant Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tenant Details</DialogTitle>
            <DialogDescription>
              {selectedTenant?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedTenant && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Account Info</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">ID:</span> {selectedTenant.id}
                    </div>
                    <div>
                      <span className="text-gray-500">Plan:</span> {getTenantPlan(selectedTenant.planId)?.name}
                    </div>
                    <div>
                      <span className="text-gray-500">Created:</span> {new Date(selectedTenant.createdAt).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="text-gray-500">Status:</span> {getStatusBadge(selectedTenant)}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Usage Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-500">Users</span>
                        <span>{selectedTenant.currentUsers || 0} / {selectedTenant.maxUsers === -1 ? '∞' : selectedTenant.maxUsers}</span>
                      </div>
                      {selectedTenant.maxUsers !== -1 && (
                        <Progress value={(selectedTenant.currentUsers || 0) / selectedTenant.maxUsers * 100} />
                      )}
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-500">Tournaments</span>
                        <span>{selectedTenant.currentTournaments || 0} / {selectedTenant.maxTournaments === -1 ? '∞' : selectedTenant.maxTournaments}</span>
                      </div>
                      {selectedTenant.maxTournaments !== -1 && (
                        <Progress value={(selectedTenant.currentTournaments || 0) / selectedTenant.maxTournaments * 100} />
                      )}
                    </div>
                    <div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Storage</span>
                        <span>{selectedTenant.storageUsedMB?.toFixed(1) || 0} MB</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {selectedTenant.status === 'suspended' && (
                <Alert variant="destructive">
                  <Ban className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-semibold">Suspended</div>
                    <div className="text-sm mt-1">
                      Reason: {selectedTenant.suspensionReason}
                    </div>
                    {selectedTenant.suspendedAt && (
                      <div className="text-sm mt-1">
                        Suspended on: {new Date(selectedTenant.suspendedAt).toLocaleString()}
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {selectedTenant.lastActivityAt && (
                <div className="text-sm text-gray-600">
                  Last activity: {new Date(selectedTenant.lastActivityAt).toLocaleString()}
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowDetailsDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}