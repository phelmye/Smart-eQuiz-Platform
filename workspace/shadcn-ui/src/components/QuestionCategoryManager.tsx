import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Edit, Trash2, BookOpen, AlertTriangle, Crown, Info, ArrowLeft, LogOut } from 'lucide-react';
import { useAuth } from './AuthSystem';
import { 
  User, 
  Plan, 
  Tenant,
  STORAGE_KEYS, 
  storage,
  getTenantById,
  getPlanById
} from '@/lib/mockData';

interface QuestionCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  tenantId: string;
  isActive: boolean;
  questionCount: number;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}

interface QuestionCategoryManagerProps {
  user: User;
  onBack: () => void;
}

export default function QuestionCategoryManager({ user, onBack }: QuestionCategoryManagerProps) {
  const { logout } = useAuth();
  const [categories, setCategories] = useState<QuestionCategory[]>([]);
  const [userPlan, setUserPlan] = useState<Plan | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<QuestionCategory | null>(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    color: '#3b82f6'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const availableColors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
    '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#6366f1'
  ];

  useEffect(() => {
    loadCategories();
    loadUserPlan();
  }, [user]);

  const loadCategories = () => {
    const allCategories = storage.get(STORAGE_KEYS.QUESTIONS) || [];
    const tenantCategories = allCategories.filter(c => c.tenantId === user.tenantId);
    setCategories(tenantCategories);
  };

  const loadUserPlan = () => {
    const tenant = getTenantById(user.tenantId);
    if (tenant) {
      const plan = getPlanById(tenant.planId);
      setUserPlan(plan);
    }
  };

  const canCreateCategory = () => {
    if (!userPlan || !userPlan.maxQuestionCategories) return false;
    if (userPlan.maxQuestionCategories === -1) return true; // Unlimited
    return categories.length < userPlan.maxQuestionCategories;
  };

  const getRemainingCategories = () => {
    if (!userPlan || !userPlan.maxQuestionCategories || userPlan.maxQuestionCategories === -1) return null;
    return userPlan.maxQuestionCategories - categories.length;
  };

  const handleCreateCategory = () => {
    if (!newCategory.name.trim()) {
      setError('Category name is required');
      return;
    }

    if (categories.some(c => c.name.toLowerCase() === newCategory.name.toLowerCase())) {
      setError('Category with this name already exists');
      return;
    }

    if (!canCreateCategory()) {
      setError(`Maximum ${userPlan?.maxQuestionCategories} categories allowed for your plan`);
      return;
    }

    const categoryToCreate: QuestionCategory = {
      id: `category_${Date.now()}`,
      name: newCategory.name.trim(),
      description: newCategory.description.trim(),
      color: newCategory.color,
      tenantId: user.tenantId,
      isActive: true,
      questionCount: 0,
      createdBy: user.id,
      createdAt: new Date().toISOString()
    };

    const allCategories = storage.get(STORAGE_KEYS.QUESTIONS) || [];
    const updatedCategories = [...allCategories, categoryToCreate];
    storage.set(STORAGE_KEYS.QUESTIONS, updatedCategories);

    setCategories(prev => [...prev, categoryToCreate]);
    setNewCategory({ name: '', description: '', color: '#3b82f6' });
    setIsCreateDialogOpen(false);
    setSuccess('Category created successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleUpdateCategory = () => {
    if (!selectedCategory) return;

    if (!selectedCategory.name.trim()) {
      setError('Category name is required');
      return;
    }

    if (categories.some(c => 
      c.id !== selectedCategory.id && 
      c.name.toLowerCase() === selectedCategory.name.toLowerCase()
    )) {
      setError('Category with this name already exists');
      return;
    }

    const allCategories = storage.get(STORAGE_KEYS.QUESTIONS) || [];
    const updatedCategories = allCategories.map(c => 
      c.id === selectedCategory.id 
        ? { ...selectedCategory, updatedAt: new Date().toISOString() }
        : c
    );
    
    storage.set(STORAGE_KEYS.QUESTIONS, updatedCategories);
    setCategories(prev => prev.map(c => 
      c.id === selectedCategory.id 
        ? { ...selectedCategory, updatedAt: new Date().toISOString() }
        : c
    ));

    setIsEditDialogOpen(false);
    setSelectedCategory(null);
    setSuccess('Category updated successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleDeleteCategory = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;

    const allCategories = storage.get(STORAGE_KEYS.QUESTIONS) || [];
    const updatedCategories = allCategories.filter(c => c.id !== categoryId);
    storage.set(STORAGE_KEYS.QUESTIONS, updatedCategories);

    setCategories(prev => prev.filter(c => c.id !== categoryId));
    setSuccess('Category deleted successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Question Categories</h1>
                <p className="text-gray-600 mt-1">
                  Organize your questions into categories for better tournament management
                </p>
              </div>
            </div>
            {canCreateCategory() && (
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Category</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="categoryName">Category Name</Label>
                      <Input
                        id="categoryName"
                        value={newCategory.name}
                        onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                        placeholder="Enter category name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="categoryDescription">Description (Optional)</Label>
                      <Textarea
                        id="categoryDescription"
                        value={newCategory.description}
                        onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                        placeholder="Enter category description"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label>Color</Label>
                      <div className="flex gap-2 mt-2">
                        {availableColors.map(color => (
                          <button
                            key={color}
                            type="button"
                            className={`w-8 h-8 rounded-full border-2 ${
                              newCategory.color === color ? 'border-gray-800' : 'border-gray-300'
                            }`}
                            style={{ backgroundColor: color }}
                            onClick={() => setNewCategory({ ...newCategory, color })}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button onClick={handleCreateCategory} className="flex-1">
                        Create Category
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setIsCreateDialogOpen(false);
                          setNewCategory({ name: '', description: '', color: '#3b82f6' });
                          clearMessages();
                        }}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
            <Button variant="outline" size="sm" onClick={logout} className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Plan Limits Alert */}
        {userPlan && (
          <Alert className="border-blue-200 bg-blue-50">
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium">Plan: {userPlan?.displayName}</span>
                  {(userPlan?.maxQuestionCategories ?? 0) === -1 ? (
                    <span className="text-green-700 ml-2">• Unlimited categories</span>
                  ) : (
                    <span className="text-blue-700 ml-2">
                      • {categories.length} / {userPlan?.maxQuestionCategories ?? 0} categories used
                    </span>
                  )}
                </div>
                {(userPlan?.maxQuestionCategories ?? 0) !== -1 && (
                  <Badge variant={canCreateCategory() ? "secondary" : "destructive"}>
                    {canCreateCategory() 
                      ? `${getRemainingCategories()} remaining` 
                      : 'Limit reached'
                    }
                  </Badge>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Messages */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {/* Categories Stats */}
        <div className="flex justify-between items-center mb-4">
          <Badge variant="outline" className="text-sm">
            {categories.length} {categories.length === 1 ? 'Category' : 'Categories'}
          </Badge>
        </div>

        {/* Categories Grid */}
        <div className="grid gap-4">
        {categories.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="w-16 h-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Categories Yet</h3>
              <p className="text-gray-600 text-center mb-4">
                Create your first question category to start organizing your questions
              </p>
              {canCreateCategory() ? (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  Create First Category
                </Button>
              ) : (
                <div className="text-center">
                  <Badge variant="destructive" className="mb-2">
                    Category Limit Reached
                  </Badge>
                  <p className="text-sm text-gray-600">
                    Your plan allows up to {userPlan?.maxQuestionCategories} categories.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          categories.map(category => (
            <Card key={category.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: category.color }}
                    />
                    {category.name}
                    <Badge variant="outline" className="ml-2">
                      {category.questionCount} questions
                    </Badge>
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedCategory(category);
                        setIsEditDialogOpen(true);
                        clearMessages();
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Category</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{category.name}"? This action cannot be undone.
                            {category.questionCount > 0 && (
                              <span className="block mt-2 text-red-600 font-medium">
                                Warning: This category contains {category.questionCount} questions.
                              </span>
                            )}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteCategory(category.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {category.description && (
                  <p className="text-gray-600 mb-4">{category.description}</p>
                )}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Created: {new Date(category.createdAt).toLocaleDateString()}</span>
                  {category.updatedAt && (
                    <span>Updated: {new Date(category.updatedAt).toLocaleDateString()}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Category Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          {selectedCategory && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="editCategoryName">Category Name</Label>
                <Input
                  id="editCategoryName"
                  value={selectedCategory.name}
                  onChange={(e) => setSelectedCategory({ ...selectedCategory, name: e.target.value })}
                  placeholder="Enter category name"
                />
              </div>

              <div>
                <Label htmlFor="editCategoryDescription">Description (Optional)</Label>
                <Textarea
                  id="editCategoryDescription"
                  value={selectedCategory.description}
                  onChange={(e) => setSelectedCategory({ ...selectedCategory, description: e.target.value })}
                  placeholder="Enter category description"
                  rows={3}
                />
              </div>

              <div>
                <Label>Color</Label>
                <div className="flex gap-2 mt-2">
                  {availableColors.map(color => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 ${
                        selectedCategory.color === color ? 'border-gray-800' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setSelectedCategory({ ...selectedCategory, color })}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleUpdateCategory} className="flex-1">
                  Update Category
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setSelectedCategory(null);
                    clearMessages();
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

      {/* Plan Upgrade Notice */}
      {!canCreateCategory() && userPlan?.maxQuestionCategories !== -1 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Crown className="w-6 h-6 text-orange-600" />
              <div>
                <h3 className="font-semibold text-orange-800">Category Limit Reached</h3>
                <p className="text-orange-700 mt-1">
                  You've reached the maximum of {userPlan?.maxQuestionCategories ?? 0} categories for your {userPlan?.displayName ?? 'current plan'}. 
                  To create more categories, you can either delete existing ones or upgrade to a higher plan.
                </p>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline" className="border-orange-300 text-orange-800">
                    Upgrade Plan
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-orange-800"
                    onClick={() => {
                      // TODO: Implement plan upgrade info modal
                      console.log('Show plan upgrade information');
                    }}
                  >
                    Learn More
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      </div>
    </div>
  );
}