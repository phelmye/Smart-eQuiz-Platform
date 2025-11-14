import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
  Shield, 
  Search,
  Filter,
  Eye,
  Edit,
  Plus,
  ChevronLeft
} from 'lucide-react';
import { 
  User, 
  UserRole,
  STORAGE_KEYS, 
  storage, 
  getUsersByTenant,
  getRolePermission,
  hasPermission,
  canCreateMoreUsers,
  getAssignableRoles,
  canAssignRole,
  logAuditEvent
} from '@/lib/mockData';

interface UserManagementWithLoginAsProps {
  user: User;
  onLoginAs: (targetUser: User) => void;
  onLogoutFromUser?: () => void;
}

export default function UserManagementWithLoginAs({ 
  user, 
  onLoginAs,
  onLogoutFromUser 
}: UserManagementWithLoginAsProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'participant' as UserRole,
    tenantId: user.tenantId || '',
    walletBalance: 0,
    isActive: true
  });

  // Check if currently logged in as another user
  const originalUser = storage.get('original_user');
  const isLoginAsMode = originalUser && originalUser.id !== user.id;

  useEffect(() => {
    loadUsers();
  }, [user.tenantId]);

  const loadUsers = () => {
    if (user.tenantId) {
      const tenantUsers = getUsersByTenant(user.tenantId);
      // Exclude super_admin and current user from the list
      const filteredUsers = tenantUsers.filter(u => 
        u.role !== 'super_admin' && 
        u.id !== user.id
      );
      setUsers(filteredUsers);
    }
  };

  const canLoginAs = (targetUser: User): boolean => {
    // Only org_admin can login as others
    if (user.role?.toLowerCase() !== 'org_admin') return false;
    
    // Cannot login as other org_admins
    if (targetUser.role?.toLowerCase() === 'org_admin') return false;
    
    // Cannot login as super_admin
    if (targetUser.role?.toLowerCase() === 'super_admin') return false;
    
    // Must be same tenant
    return targetUser.tenantId === user.tenantId;
  };

  const handleLoginAs = (targetUser: User) => {
    if (!canLoginAs(targetUser)) {
      alert('You do not have permission to login as this user.');
      return;
    }

    // Store original user info for logout
    storage.set('original_user', user);
    
    // Set current user to the target user
    storage.set(STORAGE_KEYS.CURRENT_USER, targetUser);
    
    // Notify parent component about the login
    onLoginAs(targetUser);
    
    console.log(`🔄 ${user.name} logged in as ${targetUser.name} (${targetUser.role})`);
  };

  const handleLogoutFromUser = () => {
    if (onLogoutFromUser) {
      onLogoutFromUser();
    }
  };

  const resetForm = () => {
    setNewUser({
      name: '',
      email: '',
      role: 'participant' as UserRole,
      tenantId: user.tenantId || '',
      walletBalance: 0,
      isActive: true
    });
  };

  const openCreateDialog = () => {
    if (!hasPermission(user, 'users.create')) {
      alert('You do not have permission to create users.');
      return;
    }

    setEditingUser(null);
    resetForm();
    setIsCreateDialogOpen(true);
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
    if (user?.role === 'org_admin' && !editingUser && user.tenantId) {
      if (!canCreateMoreUsers(user.tenantId)) {
        alert('Your current plan has reached the maximum number of users. Please upgrade your plan to add more users.');
        return;
      }
    }

    // Use centralized role assignment policy
    if (!canAssignRole(user, newUser.role)) {
      const assignableRoles = getAssignableRoles(user);
      alert(`You cannot assign the role '${newUser.role}'. Available roles: ${assignableRoles.join(', ')}`);
      return;
    }

    // For org_admin, always use their tenant ID
    const assignedTenantId = user?.tenantId || 'tenant1';

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
        user,
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
        user,
        'user.create',
        {
          newValue: {
            name: userToSave.name,
            email: userToSave.email,
            role: userToSave.role,
            isActive: userToSave.isActive
          }
        },
        userToSave.id
      );
    }

    setIsCreateDialogOpen(false);
    loadUsers(); // Refresh the user list
    resetForm();
  };

  const getRoleBadgeColor = (role: UserRole) => {
    const colors: Record<UserRole, string> = {
      super_admin: 'bg-red-100 text-red-800',
      org_admin: 'bg-purple-100 text-purple-800',
      question_manager: 'bg-blue-100 text-blue-800',
      account_officer: 'bg-green-100 text-green-800',
      participant: 'bg-gray-100 text-gray-800',
      inspector: 'bg-orange-100 text-orange-800',
      practice_user: 'bg-yellow-100 text-yellow-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'org_admin':
        return <Shield className="w-4 h-4" />;
      case 'question_manager':
        return <Edit className="w-4 h-4" />;
      case 'account_officer':
        return <Users className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const getLoginAsTooltip = (targetUser: User): string => {
    if (!canLoginAs(targetUser)) {
      if (targetUser.role?.toLowerCase() === 'org_admin') {
        return 'Cannot login as another organization admin';
      }
      return 'You do not have permission to login as this user';
    }
    return `Login as ${targetUser.name} to access their permissions and view`;
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const managementRoles = ['question_manager', 'account_officer', 'inspector'];
  const managementUsers = filteredUsers.filter(u => managementRoles.includes(u.role));
  const otherUsers = filteredUsers.filter(u => !managementRoles.includes(u.role));

  return (
    <div className="space-y-6">
      {/* Login As Banner */}
      {isLoginAsMode && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-yellow-600" />
                <div>
                  <div className="font-medium text-yellow-800">
                    Logged in as: {user.name}
                  </div>
                  <div className="text-sm text-yellow-600">
                    Role: {getRolePermission(user.role)?.roleName || user.role}
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleLogoutFromUser}
                className="border-yellow-300 hover:bg-yellow-100 text-yellow-700"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Return to {originalUser?.name}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">
            Manage users in your organization and access their accounts
          </p>
        </div>
        
        {hasPermission(user, 'users.create') && (
          <Button onClick={openCreateDialog} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add User
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{managementUsers.length}</div>
                <div className="text-sm text-gray-500">Management Users</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{otherUsers.length}</div>
                <div className="text-sm text-gray-500">Regular Users</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <LogIn className="w-8 h-8 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">
                  {managementUsers.filter(u => canLoginAs(u)).length}
                </div>
                <div className="text-sm text-gray-500">Accessible Accounts</div>
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
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as UserRole | 'all')}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="all">All Roles</option>
                <option value="question_manager">Question Manager</option>
                <option value="account_officer">Account Officer</option>
                <option value="inspector">Inspector</option>
                <option value="participant">Participant</option>
                <option value="practice_user">Practice User</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Management Users Table */}
      {managementUsers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Management Users ({managementUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {managementUsers.map((u) => {
                  const rolePermission = getRolePermission(u.role);
                  const canLogin = canLoginAs(u);
                  
                  return (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{u.name}</div>
                          <div className="text-sm text-gray-500">{u.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleBadgeColor(u.role)}>
                          <div className="flex items-center gap-1">
                            {getRoleIcon(u.role)}
                            {rolePermission?.roleName || u.role}
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {rolePermission?.description || 'No description'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={u.isActive ? "default" : "secondary"}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : 'Never'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleLoginAs(u)}
                            disabled={!canLogin || !u.isActive}
                            className="flex items-center gap-1"
                            title={getLoginAsTooltip(u)}
                          >
                            <LogIn className="w-3 h-3" />
                            Login As
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => console.log('View user details:', u.id)}
                          >
                            <Eye className="w-3 h-3" />
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
      )}

      {/* Other Users Table */}
      {otherUsers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Other Users ({otherUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {otherUsers.map((u) => {
                  const rolePermission = getRolePermission(u.role);
                  
                  return (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{u.name}</div>
                          <div className="text-sm text-gray-500">{u.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleBadgeColor(u.role)}>
                          <div className="flex items-center gap-1">
                            {getRoleIcon(u.role)}
                            {rolePermission?.roleName || u.role}
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={u.isActive ? "default" : "secondary"}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : 'Never'}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => console.log('View user details:', u.id)}
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit User Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Edit User' : 'Create New User'}</DialogTitle>
            <DialogDescription>
              {editingUser ? 'Update user information' : 'Add a new user to your organization'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name *
              </Label>
              <Input
                id="name"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                className="col-span-3"
                placeholder="Enter user name"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className="col-span-3"
                placeholder="Enter email address"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role *
              </Label>
              <Select
                value={newUser.role}
                onValueChange={(value: UserRole) => setNewUser({ ...newUser, role: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {getAssignableRoles(user).map((role) => (
                    <SelectItem key={role} value={role}>
                      {getRolePermission(role)?.roleName || role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="walletBalance" className="text-right">
                Wallet Balance
              </Label>
              <Input
                id="walletBalance"
                type="number"
                value={newUser.walletBalance}
                onChange={(e) => setNewUser({ ...newUser, walletBalance: Number(e.target.value) })}
                className="col-span-3"
                placeholder="0"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="isActive" className="text-right">
                Status
              </Label>
              <Select
                value={newUser.isActive ? 'active' : 'inactive'}
                onValueChange={(value) => setNewUser({ ...newUser, isActive: value === 'active' })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
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
        </DialogContent>
      </Dialog>
    </div>
  );
}