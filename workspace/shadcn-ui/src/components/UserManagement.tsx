import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Plus, Edit, Trash2, Search, UserPlus, Mail, Shield, DollarSign, Users } from 'lucide-react';
import { useAuth } from './AuthSystem';
import { storage, STORAGE_KEYS, User, Tenant, UserRole, mockUsers, getAvailableRolesForTenant, canCreateMoreUsers, defaultPlans, hasPermission, getAssignableRoles, canAssignRole, logAuditEvent } from '@/lib/mockData';

interface UserManagementProps {
  onBack: () => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ onBack }) => {
  const { user: currentUser, tenant } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'participant' as UserRole,
    tenantId: '',
    walletBalance: 0,
    isActive: true
  });

  useEffect(() => {
    loadUsers();
    loadTenants();
  }, [currentUser, tenant]);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, filterRole, filterStatus]);

  const loadUsers = () => {
    const savedUsers = storage.get(STORAGE_KEYS.USERS) || mockUsers;
    let filteredUsers = savedUsers;

    if (currentUser?.role === 'super_admin') {
      filteredUsers = savedUsers;
    } else if (currentUser?.role === 'org_admin') {
      filteredUsers = savedUsers.filter((u: User) => u.tenantId === currentUser.tenantId);
    } else {
      filteredUsers = [];
    }

    setUsers(filteredUsers);
  };

  const loadTenants = () => {
    const savedTenants = storage.get(STORAGE_KEYS.TENANTS) || [];
    setTenants(savedTenants);
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterRole && filterRole !== 'all') {
      filtered = filtered.filter(u => u.role === filterRole);
    }

    if (filterStatus && filterStatus !== 'all') {
      filtered = filtered.filter(u => 
        filterStatus === 'active' ? u.isActive !== false : u.isActive === false
      );
    }

    setFilteredUsers(filtered);
  };

  const handleCreateUser = () => {
    if (!newUser.name || !newUser.email) {
      alert('Please fill in all required fields');
      return;
    }

    // Check if email already exists
    const allUsers = storage.get(STORAGE_KEYS.USERS) || [];
    if (allUsers.some((u: User) => u.email === newUser.email && (!editingUser || u.id !== editingUser.id))) {
      alert('A user with this email already exists');
      return;
    }

    // For org_admin, check if they can create more users based on their plan
    if (currentUser?.role === 'org_admin' && !editingUser && currentUser.tenantId) {
      if (!canCreateMoreUsers(currentUser.tenantId)) {
        alert('Your current plan has reached the maximum number of users. Please upgrade your plan to add more users.');
        return;
      }
    }

    // Double-check creator has create permission
    if (currentUser && !hasPermission(currentUser, 'users.create')) {
      alert('You do not have permission to create users.');
      return;
    }

    // Use centralized role assignment policy
    if (!canAssignRole(currentUser, newUser.role)) {
      const assignableRoles = getAssignableRoles(currentUser);
      alert(`You cannot assign the role '${newUser.role}'. Available roles: ${assignableRoles.join(', ')}`);
      return;
    }

    // For org_admin, always use their tenant ID. For super_admin, use selected tenant or current tenant
    const assignedTenantId = currentUser?.role === 'org_admin' 
      ? currentUser.tenantId 
      : newUser.tenantId || currentUser?.tenantId || 'tenant1';

    const userToSave: User = {
      id: editingUser?.id || `user_${Date.now()}`,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      tenantId: assignedTenantId,
      walletBalance: newUser.walletBalance,
      xp: editingUser?.xp || 0,
      level: editingUser?.level || 1,
      badges: editingUser?.badges || [],
      isActive: newUser.isActive,
      createdAt: editingUser?.createdAt || new Date().toISOString(),
      lastLoginAt: editingUser?.lastLoginAt
    };

    if (editingUser) {
      const updatedUsers = allUsers.map((u: User) => 
        u.id === editingUser.id ? userToSave : u
      );
      storage.set(STORAGE_KEYS.USERS, updatedUsers);
      
      // Log user update audit event
      logAuditEvent(
        currentUser,
        'user.update',
        {
          previousValue: {
            name: editingUser.name,
            email: editingUser.email,
            role: editingUser.role,
            isActive: editingUser.isActive
          },
          newValue: {
            name: userToSave.name,
            email: userToSave.email,
            role: userToSave.role,
            isActive: userToSave.isActive
          }
        },
        userToSave.id
      );
    } else {
      allUsers.push(userToSave);
      storage.set(STORAGE_KEYS.USERS, allUsers);
      
      // Log user creation audit event
      logAuditEvent(
        currentUser,
        'user.create',
        {
          newValue: {
            name: userToSave.name,
            email: userToSave.email,
            role: userToSave.role,
            tenantId: userToSave.tenantId
          },
          roleName: userToSave.role
        },
        userToSave.id
      );
    }

    loadUsers();
    setIsCreateDialogOpen(false);
    setEditingUser(null);
    resetForm();
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setNewUser({
      name: user.name,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      walletBalance: user.walletBalance,
      isActive: user.isActive !== false
    });
    setIsCreateDialogOpen(true);
  };

  const handleDeleteUser = (userId: string) => {
    if (userId === currentUser?.id) {
      alert('You cannot delete your own account');
      return;
    }

    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      const allUsers = storage.get(STORAGE_KEYS.USERS) || [];
      const userToDelete = allUsers.find((u: User) => u.id === userId);
      const updatedUsers = allUsers.filter((u: User) => u.id !== userId);
      
      storage.set(STORAGE_KEYS.USERS, updatedUsers);
      
      // Log user deletion audit event
      if (currentUser && userToDelete) {
        logAuditEvent(
          currentUser,
          'user.delete',
          {
            previousValue: {
              name: userToDelete.name,
              email: userToDelete.email,
              role: userToDelete.role
            },
            reason: 'User manually deleted by administrator'
          },
          userId
        );
      }
      
      loadUsers();
    }
  };

  const handleToggleUserStatus = (userId: string) => {
    const allUsers = storage.get(STORAGE_KEYS.USERS) || [];
    const updatedUsers = allUsers.map((u: User) => 
      u.id === userId ? { ...u, isActive: !(u.isActive !== false) } : u
    );
    storage.set(STORAGE_KEYS.USERS, updatedUsers);
    loadUsers();
  };

  const resetForm = () => {
    setNewUser({
      name: '',
      email: '',
      role: 'participant',
      tenantId: currentUser?.role === 'org_admin' ? currentUser.tenantId : '',
      walletBalance: 0,
      isActive: true
    });
  };

  // Open create dialog with permission checks
  const openCreateDialog = () => {
    if (!currentUser) return;

    // Ensure the user has permission to create users
    if (!hasPermission(currentUser, 'users.create')) {
      alert('You do not have permission to create users.');
      return;
    }

    setEditingUser(null);
    resetForm();
    setIsCreateDialogOpen(true);
  };

  const getTenantName = (tenantId: string) => {
    const tenant = tenants.find(t => t.id === tenantId);
    return tenant?.name || 'Unknown';
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'super_admin': return 'Super Admin';
      case 'org_admin': return 'Organization Admin';
      case 'question_manager': return 'Question Manager';
      case 'account_officer': return 'Account Officer';
      case 'inspector': return 'Quiz Inspector';
      case 'participant': return 'Participant';
      case 'practice_user': return 'Practice User';
      default: return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-red-100 text-red-800';
      case 'org_admin': return 'bg-purple-100 text-purple-800';
      case 'question_manager': return 'bg-blue-100 text-blue-800';
      case 'account_officer': return 'bg-yellow-100 text-yellow-800';
      case 'inspector': return 'bg-indigo-100 text-indigo-800';
      case 'participant': return 'bg-green-100 text-green-800';
      case 'practice_user': return 'bg-teal-100 text-teal-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!currentUser || !['org_admin', 'super_admin'].includes(currentUser.role)) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-bold text-red-600 mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-4">You need admin privileges to manage users.</p>
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
                <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                <p className="text-gray-600">Manage user accounts and permissions</p>
              </div>
            </div>

            <Button onClick={() => openCreateDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>

          {/* Plan Information for org_admin */}
          {currentUser?.role === 'org_admin' && currentUser.tenantId && (
            <div className="mb-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Users className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">
                          Users: {users.length} / {(() => {
                            const plan = (() => { 
                              const tenant = tenants.find(t => t.id === currentUser.tenantId);
                              return tenant ? defaultPlans.find(p => p.id === tenant.planId) : null;
                            })();
                            return plan ? (plan.maxUsers === -1 ? '∞' : plan.maxUsers) : 'Unknown';
                          })()}
                        </p>
                        <p className="text-sm text-gray-500">
                          {canCreateMoreUsers(currentUser.tenantId) 
                            ? 'You can add more users to your organization' 
                            : 'You have reached your plan limit. Upgrade to add more users.'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <Label htmlFor="search">Search Users</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label>Filter by Role</Label>
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger>
                  <SelectValue placeholder="All roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All roles</SelectItem>
                  <SelectItem value="participant">Participant</SelectItem>
                  <SelectItem value="practice_user">Practice User</SelectItem>
                  <SelectItem value="question_manager">Question Manager</SelectItem>
                  <SelectItem value="account_officer">Account Officer</SelectItem>
                  <SelectItem value="inspector">Quiz Inspector</SelectItem>
                  <SelectItem value="org_admin">Organization Admin</SelectItem>
                  {currentUser.role?.toLowerCase() === 'super_admin' && (
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Filter by Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setFilterRole('all');
                  setFilterStatus('all');
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <UserPlus className="h-8 w-8 text-blue-600" />
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
                  <Shield className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold">{users.filter(u => u.role === 'org_admin' || u.role === 'super_admin').length}</p>
                    <p className="text-sm text-gray-600">Admins</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Mail className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">{users.filter(u => u.isActive !== false).length}</p>
                    <p className="text-sm text-gray-600">Active Users</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-8 w-8 text-yellow-600" />
                  <div>
                    <p className="text-2xl font-bold">
                      ${users.reduce((sum, u) => sum + u.walletBalance, 0).toFixed(0)}
                    </p>
                    <p className="text-sm text-gray-600">Total Balance</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Users ({filteredUsers.length})</CardTitle>
            <CardDescription>Manage user accounts and their permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Wallet Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleColor(user.role)}>
                        {user.role.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{getTenantName(user.tenantId)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">${user.walletBalance.toFixed(2)}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.isActive !== false ? 'default' : 'secondary'}>
                        {user.isActive !== false ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {user.lastLoginAt 
                          ? new Date(user.lastLoginAt).toLocaleDateString()
                          : 'Never'
                        }
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditUser(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleUserStatus(user.id)}
                        >
                          {user.isActive !== false ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={user.id === currentUser?.id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit User Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? 'Edit User' : 'Create New User'}
            </DialogTitle>
            <DialogDescription>
              {editingUser ? 'Update user details below.' : 'Add a new user to the platform.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="user-name">Full Name *</Label>
                <Input
                  id="user-name"
                  value={newUser.name}
                  onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter full name"
                />
              </div>
              
              <div>
                <Label htmlFor="user-email">Email Address *</Label>
                <Input
                  id="user-email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email address"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Role</Label>
                <Select value={newUser.role} onValueChange={(value: UserRole) => setNewUser(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currentUser && getAssignableRoles(currentUser).map(role => (
                      <SelectItem key={role} value={role}>
                        {getRoleDisplayName(role)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {currentUser?.role === 'super_admin' && (
                <div>
                  <Label>Organization</Label>
                  <Select value={newUser.tenantId} onValueChange={(value) => setNewUser(prev => ({ ...prev, tenantId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select organization" />
                    </SelectTrigger>
                    <SelectContent>
                      {tenants.map(tenant => (
                        <SelectItem key={tenant.id} value={tenant.id}>{tenant.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="wallet-balance">Wallet Balance ($)</Label>
                <Input
                  id="wallet-balance"
                  type="number"
                  min="0"
                  step="0.01"
                  value={newUser.walletBalance}
                  onChange={(e) => setNewUser(prev => ({ ...prev, walletBalance: parseFloat(e.target.value) || 0 }))}
                />
              </div>

              <div className="flex items-center space-x-2 pt-6">
                <input
                  type="checkbox"
                  id="is-active"
                  checked={newUser.isActive}
                  onChange={(e) => setNewUser(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="w-4 h-4"
                />
                <Label htmlFor="is-active">Active User</Label>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateUser}>
                {editingUser ? 'Update User' : 'Create User'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;