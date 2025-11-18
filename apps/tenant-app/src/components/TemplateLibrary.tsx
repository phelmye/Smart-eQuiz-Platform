import React, { useState, useEffect } from 'react';
import { BookTemplate, Star, Download, Trash2, Copy, Users, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  RoundConfigTemplate,
  RoundQuestionConfig,
  getRoundTemplates,
  applyRoundTemplate,
  deleteRoundTemplate,
  cloneRoundTemplate,
  rateRoundTemplate,
  TOURNAMENT_FEATURES,
  hasFeatureAccess,
  type User
} from '@/lib/mockData';

interface TemplateLibraryProps {
  tenantId: string;
  currentUser: User;
  onApplyTemplate: (roundConfigs: RoundQuestionConfig[]) => void;
  onClose?: () => void;
}

const TEMPLATE_TYPE_LABELS: Record<string, { label: string; description: string }> = {
  beginner: { label: 'Beginner', description: 'Simple rounds for newcomers' },
  intermediate: { label: 'Intermediate', description: 'Balanced difficulty progression' },
  advanced: { label: 'Advanced', description: 'Challenging multi-category rounds' },
  expert: { label: 'Expert', description: 'Maximum difficulty and complexity' },
  custom: { label: 'Custom', description: 'User-created templates' }
};

export function TemplateLibrary({ tenantId, currentUser, onApplyTemplate, onClose }: TemplateLibraryProps) {
  const [templates, setTemplates] = useState<RoundConfigTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<RoundConfigTemplate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<string>('all');

  const hasAccess = hasFeatureAccess(currentUser, TOURNAMENT_FEATURES.ROUND_CONFIG_TEMPLATES);

  useEffect(() => {
    loadTemplates();
  }, [tenantId]);

  useEffect(() => {
    filterTemplates();
  }, [templates, searchQuery, selectedTab]);

  const loadTemplates = () => {
    const allTemplates = getRoundTemplates(tenantId, true);
    setTemplates(allTemplates);
  };

  const filterTemplates = () => {
    let filtered = templates;

    // Filter by tab
    if (selectedTab === 'my-templates') {
      filtered = filtered.filter(t => t.tenantId === tenantId);
    } else if (selectedTab === 'public') {
      filtered = filtered.filter(t => t.isPublic && t.tenantId !== tenantId);
    } else if (selectedTab !== 'all') {
      filtered = filtered.filter(t => t.templateType === selectedTab);
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        t =>
          t.name.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query)
      );
    }

    setFilteredTemplates(filtered);
  };

  const handleApply = (templateId: string) => {
    const roundConfigs = applyRoundTemplate(templateId);
    onApplyTemplate(roundConfigs);
    loadTemplates(); // Refresh to update usage count
  };

  const handleClone = (templateId: string, templateName: string) => {
    const cloned = cloneRoundTemplate(templateId, tenantId, `${templateName} (Copy)`);
    if (cloned) {
      loadTemplates();
    }
  };

  const handleDelete = (templateId: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      deleteRoundTemplate(templateId);
      loadTemplates();
    }
  };

  const handleRate = (templateId: string, rating: number) => {
    rateRoundTemplate(templateId, rating);
    loadTemplates();
  };

  if (!hasAccess) {
    return (
      <Alert>
        <AlertDescription>
          Template library is a Professional feature. Upgrade your plan to access pre-built round configurations.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Template Library</h3>
          <p className="text-sm text-muted-foreground">
            Choose from pre-built round configurations or create your own
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="all">All Templates</TabsTrigger>
          <TabsTrigger value="my-templates">My Templates</TabsTrigger>
          <TabsTrigger value="public">Public</TabsTrigger>
          <TabsTrigger value="beginner">Beginner</TabsTrigger>
          <TabsTrigger value="intermediate">Intermediate</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="space-y-4">
          {filteredTemplates.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  <BookTemplate className="mx-auto h-12 w-12 mb-2 opacity-50" />
                  <p>No templates found.</p>
                  <p className="text-sm mt-2">
                    {searchQuery ? 'Try a different search term.' : 'Create your first template from a tournament configuration.'}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredTemplates.map((template) => (
                <Card key={template.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <CardTitle className="text-base">{template.name}</CardTitle>
                          {template.isPublic && (
                            <Badge variant="secondary">
                              <Users className="mr-1 h-3 w-3" />
                              Public
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Badge variant="outline">
                            {TEMPLATE_TYPE_LABELS[template.templateType]?.label || template.templateType}
                          </Badge>
                          <span className="text-muted-foreground">
                            {template.numberOfRounds} rounds
                          </span>
                        </div>
                      </div>
                    </div>
                    <CardDescription className="mt-2">{template.description}</CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4" />
                          <span>{template.usageCount} uses</span>
                        </div>
                        {template.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span>{template.rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => handleApply(template.id)}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Use Template
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleClone(template.id, template.name)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      {template.tenantId === tenantId && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive"
                          onClick={() => handleDelete(template.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    {template.tenantId !== tenantId && (
                      <div className="flex gap-1 mt-3 pt-3 border-t">
                        <span className="text-xs text-muted-foreground mr-2">Rate:</span>
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            key={rating}
                            onClick={() => handleRate(template.id, rating)}
                            className="text-yellow-400 hover:scale-110 transition-transform"
                          >
                            <Star
                              className={`h-4 w-4 ${
                                template.rating && rating <= template.rating ? 'fill-yellow-400' : ''
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default TemplateLibrary;
