import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Plus, Edit, Shield, Users, AlertCircle } from 'lucide-react';
import { 
  User, 
  UserRole,
  RolePermission, 
  STORAGE_KEYS, 
  storage, 
  getAvailableRolesForTenant,
  getUsersByTenant,
  getRolePermission
} from '@/lib/mockData';

interface RoleManagementProps {
  user: User;
}

export default function RoleManagement({ user }: RoleManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [availableRoles, setAvailableRoles] = useState<RolePermission[]>([]);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: '' as UserRole,
    password: ''
  });

  useEffect(() => {
    if (user.tenantId) {
      loadUsers();
      setAvailableRoles(getAvailableRolesForTenant(user.tenantId));
    }
  }, [user.tenantId]);

  const loadUsers = () => {
    if (user.tenantId) {
      const tenantUsers = getUsersByTenant(user.tenantId);
      setUsers(tenantUsers);
    }
  };

  const handleCreateUser = () => {
    if (!newUser.name || !newUser.email || !newUser.role || !user.tenantId) {
      alert('Please fill in all required fields');
      return;
    }

    const allUsers = storage.get(STORAGE_KEYS.USERS) || [];
    
    // Check if user already exists
    if (allUsers.some(u => u.email === newUser.email)) {
      alert('User with this email already exists');
      return;
    }

    const userId = `user_${Date.now()}`;
    const userToCreate: User = {
      id: userId,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      tenantId: user.tenantId,
      xp: 0,
      level: 1,
      badges: [],
      walletBalance: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      lastLoginAt: null
    };

    allUsers.push(userToCreate);
    storage.set(STORAGE_KEYS.USERS, allUsers);
    
    // Reset form
    setNewUser({ name: '', email: '', role: '' as UserRole, password: '' });
    setIsAddUserOpen(false);
    loadUsers();
    
    console.log(`✅ User created: ${newUser.name} with role ${newUser.role}`);
  };

  const handleUpdateUserRole = (userId: string, newRole: UserRole) => {
    const allUsers = storage.get(STORAGE_KEYS.USERS) || [];
    const userIndex = allUsers.findIndex(u => u.id === userId);
    
    if (userIndex !== -1) {
      allUsers[userIndex].role = newRole;
      storage.set(STORAGE_KEYS.USERS, allUsers);
      loadUsers();
      setIsEditUserOpen(false);
      setSelectedUser(null);
      
      console.log(`✅ User role updated: ${allUsers[userIndex].name} -> ${newRole}`);
    }
  };

  const handleToggleUserStatus = (userId: string) => {
    const allUsers = storage.get(STORAGE_KEYS.USERS) || [];
    const userIndex = allUsers.findIndex(u => u.id === userId);
    
    if (userIndex !== -1) {
      allUsers[userIndex].isActive = !allUsers[userIndex].isActive;
      storage.set(STORAGE_KEYS.USERS, allUsers);
      loadUsers();
      
      const status = allUsers[userIndex].isActive ? 'Active' : 'Inactive';
      console.log(`✅ User status toggled: ${allUsers[userIndex].name} -> ${status}`);
    }
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
      case 'super_admin':
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Role Management</h1>
          <p className="text-gray-600 mt-2">
            Manage internal users and their access permissions for your organization
          </p>
        </div>
        
        <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="Enter full name"
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="Enter email address"
                />
              </div>
              
              <div>
                <Label htmlFor="role">Role</Label>
                <Select onValueChange={(value) => setNewUser({ ...newUser, role: value as UserRole })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRoles.map((role) => (
                      <SelectItem key={role.roleId} value={role.roleId}>
                        <div className="flex items-center gap-2">
                          {getRoleIcon(role.roleId as UserRole)}
                          <div>
                            <div className="font-medium">{role.roleName}</div>
                            <div className="text-sm text-gray-500">{role.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="password">Temporary Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="Enter temporary password"
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button onClick={handleCreateUser} className="flex-1">
                  Create User
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsAddUserOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Role Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {availableRoles.map((role) => (
          <Card key={role.roleId} className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                {getRoleIcon(role.roleId as UserRole)}
                {role.roleName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm mb-3">{role.description}</p>
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700">Permissions:</div>
                <div className="flex flex-wrap gap-1">
                  {role.permissions.slice(0, 3).map((permission) => (
                    <Badge key={permission} variant="secondary" className="text-xs">
                      {permission.split('.')[0]}
                    </Badge>
                  ))}
                  {role.permissions.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{role.permissions.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Organization Users</CardTitle>
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
              {users.map((u) => (
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
                        {getRolePermission(u.role)?.roleName || u.role}
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
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedUser(u);
                          setIsEditUserOpen(true);
                        }}
                        disabled={u.role === 'org_admin' || u.role === 'super_admin'}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleUserStatus(u.id)}
                        disabled={u.role === 'org_admin' || u.role === 'super_admin'}
                      >
                        {u.isActive ? 'Disable' : 'Enable'}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User Role</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium">{selectedUser.name}</div>
                <div className="text-sm text-gray-500">{selectedUser.email}</div>
              </div>
              
              <div>
                <Label htmlFor="editRole">New Role</Label>
                <Select 
                  defaultValue={selectedUser.role}
                  onValueChange={(value) => handleUpdateUserRole(selectedUser.id, value as UserRole)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRoles.map((role) => (
                      <SelectItem key={role.roleId} value={role.roleId}>
                        <div className="flex items-center gap-2">
                          {getRoleIcon(role.roleId as UserRole)}
                          <div>
                            <div className="font-medium">{role.roleName}</div>
                            <div className="text-sm text-gray-500">{role.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsEditUserOpen(false);
                    setSelectedUser(null);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}