import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Plus, Edit, Shield, Users, AlertCircle, Settings } from 'lucide-react';
import { 
  User, 
  UserRole,
  COMPONENT_FEATURES,
  ComponentFeatureSet,
  ComponentFeature,
  STORAGE_KEYS, 
  storage
} from '@/lib/mockData';

interface RoleComponentFeatures {
  roleId: string;
  roleName: string;
  componentFeatures: string[]; // Array of feature IDs
  createdAt: string;
  updatedAt: string;
}

interface RoleComponentManagementProps {
  user: User;
  onBack: () => void;
}

export default function RoleComponentManagement({ user, onBack }: RoleComponentManagementProps) {
  const [roleFeatures, setRoleFeatures] = useState<RoleComponentFeatures[]>([]);
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false);
  const [isEditRoleOpen, setIsEditRoleOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleComponentFeatures | null>(null);
  const [newRole, setNewRole] = useState({
    roleName: '',
    componentFeatures: [] as string[]
  });

  // Available role types for selection
  const AVAILABLE_ROLES: UserRole[] = [
    'org_admin', 
    'question_manager', 
    'account_officer', 
    'participant', 
    'inspector', 
    'practice_user'
  ];

  useEffect(() => {
    loadRoleFeatures();
  }, []);

  const loadRoleFeatures = () => {
    const storedRoleFeatures = storage.get(STORAGE_KEYS.ROLE_PERMISSIONS) || [];
    setRoleFeatures(storedRoleFeatures);
  };

  const handleCreateRole = () => {
    if (!newRole.roleName) {
      alert('Please select a role');
      return;
    }

    // Check if role already exists
    if (roleFeatures.some(rf => rf.roleName === newRole.roleName)) {
      alert('Component features for this role already exist');
      return;
    }

    const roleFeature: RoleComponentFeatures = {
      roleId: `role_${Date.now()}`,
      roleName: newRole.roleName,
      componentFeatures: newRole.componentFeatures,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedRoleFeatures = [...roleFeatures, roleFeature];
    storage.set(STORAGE_KEYS.ROLE_PERMISSIONS, updatedRoleFeatures);
    setRoleFeatures(updatedRoleFeatures);

    // Reset form
    setNewRole({
      roleName: '',
      componentFeatures: []
    });
    setIsCreateRoleOpen(false);

    alert(`Component features configured for ${newRole.roleName} role successfully!`);
  };

  const handleUpdateRole = () => {
    if (!selectedRole) return;

    const updatedRoleFeatures = roleFeatures.map(rf => 
      rf.roleId === selectedRole.roleId 
        ? { ...selectedRole, updatedAt: new Date().toISOString() }
        : rf
    );

    storage.set(STORAGE_KEYS.ROLE_PERMISSIONS, updatedRoleFeatures);
    setRoleFeatures(updatedRoleFeatures);
    setIsEditRoleOpen(false);
    setSelectedRole(null);

    alert('Role component features updated successfully!');
  };

  const handleDeleteRole = (roleId: string) => {
    if (confirm('Are you sure you want to delete this role configuration? This cannot be undone.')) {
      const updatedRoleFeatures = roleFeatures.filter(rf => rf.roleId !== roleId);
      storage.set(STORAGE_KEYS.ROLE_PERMISSIONS, updatedRoleFeatures);
      setRoleFeatures(updatedRoleFeatures);
    }
  };

  const toggleFeatureForNewRole = (featureId: string) => {
    setNewRole(prev => ({
      ...prev,
      componentFeatures: (prev.componentFeatures || []).includes(featureId)
        ? (prev.componentFeatures || []).filter(id => id !== featureId)
        : [...(prev.componentFeatures || []), featureId]
    }));
  };

  const toggleFeatureForSelectedRole = (featureId: string) => {
    if (!selectedRole) return;
    
    setSelectedRole(prev => ({
      ...prev!,
      componentFeatures: (prev!.componentFeatures || []).includes(featureId)
        ? (prev!.componentFeatures || []).filter(id => id !== featureId)
        : [...(prev!.componentFeatures || []), featureId]
    }));
  };

  const getFeaturesByCategory = (features: ComponentFeature[]) => {
    return {
      core: features.filter(f => f.category === 'core'),
      advanced: features.filter(f => f.category === 'advanced'),
      admin: features.filter(f => f.category === 'admin')
    };
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'core': return 'bg-blue-100 text-blue-800';
      case 'advanced': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Only super admin can access this component
  if (user.role !== 'super_admin') {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">Only Super Administrators can manage role component features.</p>
          <Button onClick={onBack}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Role Component Features</h1>
          <p className="text-gray-600 mt-2">
            Configure which component features each role can access. Users inherit these permissions when assigned roles.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Dialog open={isCreateRoleOpen} onOpenChange={setIsCreateRoleOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Configure Role Features
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Configure Component Features for Role</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="role">Select Role</Label>
                  <Select onValueChange={(value) => setNewRole({ ...newRole, roleName: value as UserRole })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {AVAILABLE_ROLES.filter(role => 
                        !roleFeatures.some(rf => rf.roleName === role)
                      ).map(role => (
                        <SelectItem key={role} value={role}>
                          {role.replace('_', ' ').toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Component Features</Label>
                  <p className="text-sm text-gray-600 mb-4">
                    Select which features this role can access in each component
                  </p>
                  
                  <Accordion type="multiple" className="w-full">
                    {COMPONENT_FEATURES.map((componentSet: ComponentFeatureSet) => {
                      const categorizedFeatures = getFeaturesByCategory(componentSet.features);
                      
                      return (
                        <AccordionItem key={componentSet.componentId} value={componentSet.componentId}>
                          <AccordionTrigger className="text-left">
                            <div className="flex items-center gap-2">
                              <Settings className="w-4 h-4" />
                              {componentSet.componentName}
                              <Badge variant="outline" className="ml-2">
                                {(newRole.componentFeatures || []).filter(fId => 
                                  componentSet.features.some(f => f.id === fId)
                                ).length} / {componentSet.features?.length || 0} features
                              </Badge>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="space-y-4">
                            {(['core', 'advanced', 'admin'] as const).map(category => {
                              const categoryFeatures = categorizedFeatures[category];
                              if (categoryFeatures.length === 0) return null;
                              
                              return (
                                <div key={category} className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <Badge className={getCategoryBadgeColor(category)}>
                                      {category.toUpperCase()}
                                    </Badge>
                                  </div>
                                  <div className="grid grid-cols-1 gap-2 ml-4">
                                    {categoryFeatures.map(feature => (
                                      <div key={feature.id} className="flex items-center space-x-2">
                                        <Checkbox
                                          id={feature.id}
                                          checked={(newRole.componentFeatures || []).includes(feature.id)}
                                          onCheckedChange={() => toggleFeatureForNewRole(feature.id)}
                                        />
                                        <Label htmlFor={feature.id} className="flex-1 cursor-pointer">
                                          <div>
                                            <div className="font-medium">{feature.name}</div>
                                            <div className="text-sm text-gray-500">{feature.description}</div>
                                          </div>
                                        </Label>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={handleCreateRole}
                    disabled={!newRole.roleName}
                    className="flex-1"
                  >
                    Configure Role Features
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsCreateRoleOpen(false);
                      setNewRole({ roleName: '', componentFeatures: [] });
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Existing Role Configurations */}
      <div className="grid gap-4">
        {roleFeatures.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Settings className="w-16 h-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Role Configurations</h3>
              <p className="text-gray-600 text-center mb-4">
                Start by configuring component features for different roles
              </p>
              <Button onClick={() => setIsCreateRoleOpen(true)}>
                Configure First Role
              </Button>
            </CardContent>
          </Card>
        ) : (
          roleFeatures.map(roleFeature => (
            <Card key={roleFeature.roleId}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    {roleFeature.roleName.replace('_', ' ').toUpperCase()}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedRole(roleFeature);
                        setIsEditRoleOpen(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeleteRole(roleFeature.roleId)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">
                      Component Features ({(roleFeature.componentFeatures || []).length} enabled)
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {COMPONENT_FEATURES.map(componentSet => {
                        const enabledFeatures = componentSet.features.filter(f => 
                          (roleFeature.componentFeatures || []).includes(f.id)
                        );
                        
                        if (enabledFeatures.length === 0) return null;
                        
                        return (
                          <div key={componentSet.componentId} className="border rounded-lg p-3">
                            <h4 className="font-medium mb-2">{componentSet.componentName}</h4>
                            <div className="space-y-1">
                              {enabledFeatures.map(feature => (
                                <div key={feature.id} className="flex items-center gap-2">
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs ${getCategoryBadgeColor(feature.category)}`}
                                  >
                                    {feature.category}
                                  </Badge>
                                  <span className="text-sm">{feature.name}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    Created: {new Date(roleFeature.createdAt).toLocaleDateString()}
                    {roleFeature.updatedAt !== roleFeature.createdAt && (
                      <> • Updated: {new Date(roleFeature.updatedAt).toLocaleDateString()}</>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Role Dialog */}
      <Dialog open={isEditRoleOpen} onOpenChange={setIsEditRoleOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Edit Component Features - {selectedRole?.roleName.replace('_', ' ').toUpperCase()}
            </DialogTitle>
          </DialogHeader>
          {selectedRole && (
            <div className="space-y-6">
              <div>
                <Label>Component Features</Label>
                <p className="text-sm text-gray-600 mb-4">
                  Update which features this role can access in each component
                </p>
                
                <Accordion type="multiple" className="w-full">
                  {COMPONENT_FEATURES.map((componentSet: ComponentFeatureSet) => {
                    const categorizedFeatures = getFeaturesByCategory(componentSet.features);
                    
                    return (
                      <AccordionItem key={componentSet.componentId} value={componentSet.componentId}>
                        <AccordionTrigger className="text-left">
                          <div className="flex items-center gap-2">
                            <Settings className="w-4 h-4" />
                            {componentSet.componentName}
                            <Badge variant="outline" className="ml-2">
                              {(selectedRole.componentFeatures || []).filter(fId => 
                                componentSet.features.some(f => f.id === fId)
                              ).length} / {componentSet.features?.length || 0} features
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4">
                          {(['core', 'advanced', 'admin'] as const).map(category => {
                            const categoryFeatures = categorizedFeatures[category];
                            if (categoryFeatures.length === 0) return null;
                            
                            return (
                              <div key={category} className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Badge className={getCategoryBadgeColor(category)}>
                                    {category.toUpperCase()}
                                  </Badge>
                                </div>
                                <div className="grid grid-cols-1 gap-2 ml-4">
                                  {categoryFeatures.map(feature => (
                                    <div key={feature.id} className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`edit-${feature.id}`}
                                        checked={(selectedRole.componentFeatures || []).includes(feature.id)}
                                        onCheckedChange={() => toggleFeatureForSelectedRole(feature.id)}
                                      />
                                      <Label htmlFor={`edit-${feature.id}`} className="flex-1 cursor-pointer">
                                        <div>
                                          <div className="font-medium">{feature.name}</div>
                                          <div className="text-sm text-gray-500">{feature.description}</div>
                                        </div>
                                      </Label>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button onClick={handleUpdateRole} className="flex-1">
                  Update Role Features
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsEditRoleOpen(false);
                    setSelectedRole(null);
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