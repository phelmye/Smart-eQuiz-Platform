import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Play, Trash2, Edit, Plus, RefreshCw, BarChart, CheckCircle } from 'lucide-react';
import { apiClient } from '@/lib/api';

interface DemoTemplate {
  id: string;
  version: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    demoSessions: number;
  };
}

interface DemoAnalytics {
  totalSessions: number;
  activeSessions: number;
  popularFeatures: Array<{ feature: string; count: number }>;
  eventTypes: Array<{ type: string; count: number }>;
}

export default function DemoManagement() {
  const [templates, setTemplates] = useState<DemoTemplate[]>([]);
  const [analytics, setAnalytics] = useState<DemoAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<DemoTemplate | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    version: '',
    name: '',
    description: '',
    templateData: '',
  });

  useEffect(() => {
    loadTemplates();
    loadAnalytics();
  }, []);

  const loadTemplates = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get('/demo/templates');
      setTemplates(response.data);
    } catch (error) {
      console.error('Failed to load demo templates:', error);
      alert('Failed to load demo templates');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const response = await apiClient.get('/demo/analytics');
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  const handleCreate = async () => {
    try {
      let parsedData;
      try {
        parsedData = JSON.parse(formData.templateData);
      } catch (e) {
        alert('Invalid JSON in template data');
        return;
      }

      await apiClient.post('/demo/templates', {
        version: formData.version,
        name: formData.name,
        description: formData.description,
        templateData: parsedData,
      });

      setShowCreateDialog(false);
      setFormData({ version: '', name: '', description: '', templateData: '' });
      loadTemplates();
      alert('Template created successfully');
    } catch (error: any) {
      console.error('Failed to create template:', error);
      alert(error.response?.data?.message || 'Failed to create template');
    }
  };

  const handleUpdate = async () => {
    if (!selectedTemplate) return;

    try {
      let parsedData;
      if (formData.templateData) {
        try {
          parsedData = JSON.parse(formData.templateData);
        } catch (e) {
          alert('Invalid JSON in template data');
          return;
        }
      }

      await apiClient.put(`/demo/templates/${selectedTemplate.id}`, {
        name: formData.name,
        description: formData.description,
        ...(parsedData && { templateData: parsedData }),
      });

      setShowEditDialog(false);
      setSelectedTemplate(null);
      setFormData({ version: '', name: '', description: '', templateData: '' });
      loadTemplates();
      alert('Template updated successfully');
    } catch (error: any) {
      console.error('Failed to update template:', error);
      alert(error.response?.data?.message || 'Failed to update template');
    }
  };

  const handleActivate = async (templateId: string) => {
    try {
      await apiClient.post(`/demo/templates/${templateId}/activate`);
      loadTemplates();
      alert('Template activated successfully');
    } catch (error: any) {
      console.error('Failed to activate template:', error);
      alert(error.response?.data?.message || 'Failed to activate template');
    }
  };

  const handleDelete = async () => {
    if (!selectedTemplate) return;

    try {
      await apiClient.delete(`/demo/templates/${selectedTemplate.id}`);
      setShowDeleteDialog(false);
      setSelectedTemplate(null);
      loadTemplates();
      alert('Template deleted successfully');
    } catch (error: any) {
      console.error('Failed to delete template:', error);
      alert(error.response?.data?.message || 'Failed to delete template');
    }
  };

  const handleForceCleanup = async () => {
    if (!confirm('Force cleanup all expired demo sessions?')) return;

    try {
      await apiClient.post('/demo/cleanup');
      loadTemplates();
      loadAnalytics();
      alert('Cleanup completed successfully');
    } catch (error) {
      console.error('Failed to force cleanup:', error);
      alert('Failed to force cleanup');
    }
  };

  const openEditDialog = (template: DemoTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      version: template.version,
      name: template.name,
      description: template.description || '',
      templateData: '', // Don't pre-fill template data for security
    });
    setShowEditDialog(true);
  };

  const openDeleteDialog = (template: DemoTemplate) => {
    setSelectedTemplate(template);
    setShowDeleteDialog(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Loading demo management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Demo Tenant Management</h1>
          <p className="text-gray-600 mt-1">
            Manage demo templates and track demo usage analytics
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowAnalytics(!showAnalytics)}>
            <BarChart className="h-4 w-4 mr-2" />
            {showAnalytics ? 'Hide' : 'Show'} Analytics
          </Button>
          <Button variant="outline" onClick={handleForceCleanup}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Force Cleanup
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </Button>
        </div>
      </div>

      {/* Analytics */}
      {showAnalytics && analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalSessions}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{analytics.activeSessions}</div>
            </CardContent>
          </Card>
          <Card className="md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Popular Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {analytics.popularFeatures.slice(0, 3).map((feature, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span>{feature.feature}</span>
                    <span className="font-medium">{feature.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Templates Table */}
      <Card>
        <CardHeader>
          <CardTitle>Demo Templates</CardTitle>
          <CardDescription>
            Create and manage demo templates. Only one template can be active at a time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {templates.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No templates yet. Create your first demo template to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Version</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Active Sessions</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell className="font-mono text-sm">{template.version}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{template.name}</div>
                        {template.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {template.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {template.isActive ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {template._count?.demoSessions || 0}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {new Date(template.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {!template.isActive && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleActivate(template.id)}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(template)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteDialog(template)}
                          disabled={template.isActive}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Demo Template</DialogTitle>
            <DialogDescription>
              Create a new demo template with pre-configured data
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="version">Version *</Label>
              <Input
                id="version"
                placeholder="v1.0"
                value={formData.version}
                onChange={(e) => setFormData({ ...formData, version: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="Basic Quiz Demo"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="A basic demo showcasing quiz creation features"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="templateData">Template Data (JSON) *</Label>
              <Textarea
                id="templateData"
                placeholder='{"questions": [], "tournaments": [], ...}'
                className="font-mono text-sm h-64"
                value={formData.templateData}
                onChange={(e) => setFormData({ ...formData, templateData: e.target.value })}
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter JSON data for the demo template
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Create Template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
            <DialogDescription>
              Update template name and description. Template data can only be set during creation.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Update Template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the demo template "{selectedTemplate?.name}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
