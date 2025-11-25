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
  Settings
} from 'lucide-react';
import { 
  Tenant, 
  User, 
  Plan,
  STORAGE_KEYS, 
  storage, 
  getUsersByTenant,
  formatCurrency
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

  const getStatusBadge = (tenant: Tenant) => {
    // For now, assume all tenants are active since the interface doesn't have isActive
    const isActive = true; // You might want to add isActive to the Tenant interface
    return (
      <Badge variant={isActive ? "default" : "secondary"}>
        {isActive ? 'Active' : 'Suspended'}
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
    
    // For now, all tenants are considered active since isActive is not in the interface
    const isActive = true;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && isActive) ||
                         (statusFilter === 'suspended' && !isActive);
    
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
              <Calendar className="w-8 h-8 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">
                  {tenants.length}
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
                <TableHead>Admin</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTenants.map((tenant) => {
                const plan = getTenantPlan(tenant.planId);
                const userCount = getTenantUserCount(tenant.id);
                const admins = getTenantAdmins(tenant.id);
                const primaryAdmin = admins[0];
                
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
                        <span>{userCount}</span>
                        {plan && (
                          <span className="text-xs text-gray-500">/ {plan.maxUsers}</span>
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
                      {getStatusBadge(tenant)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(tenant.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleLoginAs(tenant)}
                          disabled={admins.length === 0}
                          className="flex items-center gap-1"
                          title={
                            admins.length === 0 
                                ? 'No admin available'
                                : `Login as ${primaryAdmin?.name}`
                          }
                        >
                          <LogIn className="w-3 h-3" />
                          Login As
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => console.log('View tenant details:', tenant.id)}
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => console.log('Configure tenant:', tenant.id)}
                        >
                          <Settings className="w-3 h-3" />
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
    </div>
  );
}