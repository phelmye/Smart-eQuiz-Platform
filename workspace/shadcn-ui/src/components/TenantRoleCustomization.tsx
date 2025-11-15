import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Shield, 
  Lock, 
  Unlock, 
  Info,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import type { 
  User, 
  TenantRoleCustomization
} from '@/lib/mockData';
import { 
  defaultRolePermissions,
  getTenantRoleCustomizations,
  saveTenantRoleCustomization,
  deleteTenantRoleCustomization,
  getAllAvailablePermissions,
  getAllAvailablePages,
  getEffectivePermissions,
  getEffectivePages
} from '@/lib/mockData';

interface TenantRoleCustomizationProps {
  tenantId: string;
  currentUser: User;
  onBack: () => void;
}

export function TenantRoleCustomization({ tenantId, currentUser, onBack }: TenantRoleCustomizationProps) {
  const [customizations, setCustomizations] = useState<TenantRoleCustomization[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string>('');
  
  // Form state
  const [formData, setFormData] = useState<{
    displayName: string;
    addPermissions: string[];
    removePermissions: string[];
    addPages: string[];
    removePages: string[];
    notes: string;
    isActive: boolean;
  }>({
    displayName: '',
    addPermissions: [],
    removePermissions: [],
    addPages: [],
    removePages: [],
    notes: '',
    isActive: true
  });

  const [availablePermissions] = useState<string[]>(getAllAvailablePermissions());
  const [availablePages] = useState<string[]>(getAllAvailablePages());

  useEffect(() => {
    loadCustomizations();
  }, [tenantId]);

  const loadCustomizations = () => {
    const data = getTenantRoleCustomizations(tenantId);
    setCustomizations(data);
  };

  const selectableRoles = defaultRolePermissions.filter(
    rp => !rp.isSystemRole || ['participant', 'practice_user'].includes(rp.roleId)
  );

  const handleEditCustomization = (customization: TenantRoleCustomization) => {
    setSelectedRole(customization.roleId);
    setFormData({
      displayName: customization.displayName || '',
      addPermissions: customization.customPermissions.add,
      removePermissions: customization.customPermissions.remove,
      addPages: customization.customPages.add,
      removePages: customization.customPages.remove,
      notes: customization.notes || '',
      isActive: customization.isActive
    });
    setIsEditing(true);
  };

  const handleCreateNew = () => {
    setSelectedRole('');
    setFormData({
      displayName: '',
      addPermissions: [],
      removePermissions: [],
      addPages: [],
      removePages: [],
      notes: '',
      isActive: true
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!selectedRole) {
      alert('Please select a role');
      return;
    }

    const customization = {
      tenantId,
      roleId: selectedRole,
      displayName: formData.displayName || undefined,
      customPermissions: {
        add: formData.addPermissions,
        remove: formData.removePermissions
      },
      customPages: {
        add: formData.addPages,
        remove: formData.removePages
      },
      isActive: formData.isActive,
      createdBy: currentUser.id,
      notes: formData.notes || undefined
    };

    saveTenantRoleCustomization(customization);
    loadCustomizations();
    setIsEditing(false);
    setSelectedRole('');
  };

  const handleDelete = () => {
    if (deleteTarget) {
      deleteTenantRoleCustomization(tenantId, deleteTarget);
      loadCustomizations();
      setShowDeleteDialog(false);
      setDeleteTarget('');
    }
  };

  const confirmDelete = (roleId: string) => {
    setDeleteTarget(roleId);
    setShowDeleteDialog(true);
  };

  const getBaseRole = (roleId: string) => {
    return defaultRolePermissions.find(rp => rp.roleId === roleId);
  };

  const togglePermission = (permission: string, type: 'add' | 'remove') => {
    setFormData(prev => {
      if (type === 'add') {
        const isAlreadyAdded = prev.addPermissions.includes(permission);
        return {
          ...prev,
          addPermissions: isAlreadyAdded
            ? prev.addPermissions.filter(p => p !== permission)
            : [...prev.addPermissions, permission],
          removePermissions: prev.removePermissions.filter(p => p !== permission)
        };
      } else {
        const isAlreadyRemoved = prev.removePermissions.includes(permission);
        return {
          ...prev,
          removePermissions: isAlreadyRemoved
            ? prev.removePermissions.filter(p => p !== permission)
            : [...prev.removePermissions, permission],
          addPermissions: prev.addPermissions.filter(p => p !== permission)
        };
      }
    });
  };

  const togglePage = (page: string, type: 'add' | 'remove') => {
    setFormData(prev => {
      if (type === 'add') {
        const isAlreadyAdded = prev.addPages.includes(page);
        return {
          ...prev,
          addPages: isAlreadyAdded
            ? prev.addPages.filter(p => p !== page)
            : [...prev.addPages, page],
          removePages: prev.removePages.filter(p => p !== page)
        };
      } else {
        const isAlreadyRemoved = prev.removePages.includes(page);
        return {
          ...prev,
          removePages: isAlreadyRemoved
            ? prev.removePages.filter(p => p !== page)
            : [...prev.removePages, page],
          addPages: prev.addPages.filter(p => p !== page)
        };
      }
    });
  };

  if (isEditing) {
    const baseRole = selectedRole ? getBaseRole(selectedRole) : null;
    const basePermissions = baseRole?.permissions.filter(p => p !== '*') || [];
    const basePages = baseRole?.canAccessPages.filter(p => p !== '*') || [];

    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => setIsEditing(false)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to List
          </Button>
          <h2 className="text-2xl font-bold">
            {selectedRole ? `Customize ${baseRole?.roleName}` : 'Create Role Customization'}
          </h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Role Configuration</CardTitle>
            <CardDescription>
              Customize permissions and page access for this role within your organization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Role Selection */}
            <div>
              <Label>Base Role *</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role to customize" />
                </SelectTrigger>
                <SelectContent>
                  {selectableRoles.map(role => (
                    <SelectItem key={role.roleId} value={role.roleId}>
                      {role.roleName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {baseRole && (
                <p className="text-sm text-gray-500 mt-1">{baseRole.description}</p>
              )}
            </div>

            {selectedRole && (
              <>
                {/* Custom Display Name */}
                <div>
                  <Label>Custom Display Name (Optional)</Label>
                  <Input
                    value={formData.displayName}
                    onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                    placeholder={baseRole?.roleName}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Custom name for this role in your organization
                  </p>
                </div>

                <Tabs defaultValue="permissions" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="permissions">Permissions</TabsTrigger>
                    <TabsTrigger value="pages">Page Access</TabsTrigger>
                  </TabsList>

                  <TabsContent value="permissions" className="space-y-4 mt-4">
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Base Permissions:</strong> {basePermissions.length} permissions inherited from {baseRole?.roleName}
                      </AlertDescription>
                    </Alert>

                    <div className="grid gap-4 md:grid-cols-2">
                      {/* Add Permissions */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Plus className="h-4 w-4 text-green-600" />
                            Grant Additional Permissions
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {availablePermissions.filter(p => !basePermissions.includes(p)).map(permission => (
                              <label key={permission} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                                <input
                                  type="checkbox"
                                  checked={formData.addPermissions.includes(permission)}
                                  onChange={() => togglePermission(permission, 'add')}
                                  className="rounded"
                                />
                                <span className="text-sm font-mono">{permission}</span>
                              </label>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Remove Permissions */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm flex items-center gap-2">
                            <X className="h-4 w-4 text-red-600" />
                            Revoke Base Permissions
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {basePermissions.map(permission => (
                              <label key={permission} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                                <input
                                  type="checkbox"
                                  checked={formData.removePermissions.includes(permission)}
                                  onChange={() => togglePermission(permission, 'remove')}
                                  className="rounded"
                                />
                                <span className="text-sm font-mono">{permission}</span>
                              </label>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Summary */}
                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="pt-4">
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span><strong>Will have:</strong> {basePermissions.length - formData.removePermissions.length + formData.addPermissions.length} permissions</span>
                          </div>
                          <div className="text-xs text-gray-600">
                            {formData.addPermissions.length > 0 && (
                              <div>+ {formData.addPermissions.length} added</div>
                            )}
                            {formData.removePermissions.length > 0 && (
                              <div>- {formData.removePermissions.length} removed</div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="pages" className="space-y-4 mt-4">
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Base Pages:</strong> {basePages.length} pages inherited from {baseRole?.roleName}
                      </AlertDescription>
                    </Alert>

                    <div className="grid gap-4 md:grid-cols-2">
                      {/* Add Pages */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Plus className="h-4 w-4 text-green-600" />
                            Grant Additional Pages
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {availablePages.filter(p => !basePages.includes(p)).map(page => (
                              <label key={page} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                                <input
                                  type="checkbox"
                                  checked={formData.addPages.includes(page)}
                                  onChange={() => togglePage(page, 'add')}
                                  className="rounded"
                                />
                                <span className="text-sm">{page}</span>
                              </label>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Remove Pages */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm flex items-center gap-2">
                            <X className="h-4 w-4 text-red-600" />
                            Revoke Base Pages
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {basePages.map(page => (
                              <label key={page} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                                <input
                                  type="checkbox"
                                  checked={formData.removePages.includes(page)}
                                  onChange={() => togglePage(page, 'remove')}
                                  className="rounded"
                                />
                                <span className="text-sm">{page}</span>
                              </label>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Summary */}
                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="pt-4">
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span><strong>Will access:</strong> {basePages.length - formData.removePages.length + formData.addPages.length} pages</span>
                          </div>
                          <div className="text-xs text-gray-600">
                            {formData.addPages.length > 0 && (
                              <div>+ {formData.addPages.length} added</div>
                            )}
                            {formData.removePages.length > 0 && (
                              <div>- {formData.removePages.length} removed</div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>

                {/* Notes */}
                <div>
                  <Label>Notes (Optional)</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Why is this customization needed?"
                    rows={3}
                  />
                </div>

                {/* Active Toggle */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="isActive" className="cursor-pointer">
                    Active (customization is enforced)
                  </Label>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button onClick={handleSave}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Customization
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Role Customization</h2>
            <p className="text-gray-600">Customize role permissions for your organization</p>
          </div>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="mr-2 h-4 w-4" />
          New Customization
        </Button>
      </div>

      <Alert className="mb-6">
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Role customizations allow you to fine-tune permissions for each role in your organization. 
          Base permissions are inherited from the system role, and you can add or remove specific permissions as needed.
        </AlertDescription>
      </Alert>

      {customizations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Customizations Yet
            </h3>
            <p className="text-gray-600 mb-4">
              Create your first role customization to tailor permissions for your organization
            </p>
            <Button onClick={handleCreateNew}>
              <Plus className="mr-2 h-4 w-4" />
              Create Customization
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {customizations.map(customization => {
            const baseRole = getBaseRole(customization.roleId);
            return (
              <Card key={customization.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {customization.displayName || baseRole?.roleName}
                        {!customization.isActive && (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </CardTitle>
                      <CardDescription>{baseRole?.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Plus className="h-3 w-3 text-green-600" />
                      <span>{customization.customPermissions.add.length} permissions added</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <X className="h-3 w-3 text-red-600" />
                      <span>{customization.customPermissions.remove.length} permissions removed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Plus className="h-3 w-3 text-green-600" />
                      <span>{customization.customPages.add.length} pages added</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <X className="h-3 w-3 text-red-600" />
                      <span>{customization.customPages.remove.length} pages removed</span>
                    </div>
                  </div>

                  {customization.notes && (
                    <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                      {customization.notes}
                    </div>
                  )}

                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditCustomization(customization)}
                      className="flex-1"
                    >
                      <Edit className="mr-2 h-3 w-3" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => confirmDelete(customization.roleId)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Role Customization?</DialogTitle>
            <DialogDescription>
              This will remove the customization and all users with this role will revert to the base permissions.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default TenantRoleCustomization;
