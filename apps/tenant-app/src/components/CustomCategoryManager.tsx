import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Power, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CustomQuestionCategory,
  createCustomCategory,
  getCustomCategories,
  updateCustomCategory,
  deleteCustomCategory,
  toggleCustomCategory,
  TOURNAMENT_FEATURES,
  hasFeatureAccess,
  type User
} from '@/lib/mockData';

interface CustomCategoryManagerProps {
  tenantId: string;
  currentUser: User;
  onCategoryChange?: () => void;
}

const PRESET_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16'
];

const PRESET_ICONS = ['📖', '🎵', '✝️', '📚', '⛪', '🙏', '📜', '💡', '🌟', '🔔'];

export function CustomCategoryManager({ tenantId, currentUser, onCategoryChange }: CustomCategoryManagerProps) {
  const [categories, setCategories] = useState<CustomQuestionCategory[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CustomQuestionCategory | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: PRESET_COLORS[0],
    icon: PRESET_ICONS[0]
  });

  const hasAccess = hasFeatureAccess(currentUser, TOURNAMENT_FEATURES.CUSTOM_CATEGORIES);

  useEffect(() => {
    loadCategories();
  }, [tenantId]);

  const loadCategories = () => {
    const allCategories = getCustomCategories(tenantId, false);
    setCategories(allCategories);
  };

  const handleOpenDialog = (category?: CustomQuestionCategory) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description,
        color: category.color,
        icon: category.icon || PRESET_ICONS[0]
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        description: '',
        color: PRESET_COLORS[0],
        icon: PRESET_ICONS[0]
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingCategory(null);
  };

  const handleSave = () => {
    if (!formData.name.trim()) return;

    if (editingCategory) {
      updateCustomCategory(editingCategory.id, formData);
    } else {
      createCustomCategory(tenantId, {
        ...formData,
        tenantId,
        isActive: true,
        createdBy: currentUser.id
      });
    }

    loadCategories();
    handleCloseDialog();
    onCategoryChange?.();
  };

  const handleToggle = (categoryId: string) => {
    toggleCustomCategory(categoryId);
    loadCategories();
    onCategoryChange?.();
  };

  const handleDelete = (categoryId: string) => {
    if (window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      deleteCustomCategory(categoryId);
      loadCategories();
      onCategoryChange?.();
    }
  };

  if (!hasAccess) {
    return (
      <Alert>
        <AlertDescription>
          Custom categories are an Enterprise feature. Upgrade your plan to create unlimited custom question categories.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Custom Categories</h3>
          <p className="text-sm text-muted-foreground">
            Create custom question categories for your tournaments
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      {categories.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <p>No custom categories yet.</p>
              <p className="text-sm mt-2">Click "Add Category" to create your first custom category.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Card key={category.id} className={!category.isActive ? 'opacity-60' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{category.icon}</span>
                    <div>
                      <CardTitle className="text-base">{category.name}</CardTitle>
                      <Badge
                        variant={category.isActive ? 'default' : 'secondary'}
                        style={{ backgroundColor: category.isActive ? category.color : undefined }}
                      >
                        {category.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleToggle(category.id)}
                      title={category.isActive ? 'Deactivate' : 'Activate'}
                    >
                      <Power className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleOpenDialog(category)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDelete(category.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{category.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Edit Category' : 'Create Category'}</DialogTitle>
            <DialogDescription>
              {editingCategory
                ? 'Update your custom question category details.'
                : 'Create a new custom question category for your tournaments.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Category Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Church History"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of this category"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex gap-2 flex-wrap">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    className={`w-8 h-8 rounded-full border-2 ${
                      formData.color === color ? 'border-foreground' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData({ ...formData, color })}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Icon</Label>
              <div className="flex gap-2 flex-wrap">
                {PRESET_ICONS.map((icon) => (
                  <button
                    key={icon}
                    className={`w-10 h-10 text-xl rounded border-2 ${
                      formData.icon === icon ? 'border-foreground' : 'border-border'
                    }`}
                    onClick={() => setFormData({ ...formData, icon })}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!formData.name.trim()}>
              <Save className="mr-2 h-4 w-4" />
              {editingCategory ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CustomCategoryManager;
