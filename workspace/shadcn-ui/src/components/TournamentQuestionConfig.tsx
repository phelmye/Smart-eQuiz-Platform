import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Lock, 
  Zap, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Plus,
  Minus,
  Info
} from 'lucide-react';
import {
  Question,
  QuestionStatus,
  TournamentQuestionConfig,
  storage,
  STORAGE_KEYS
} from '@/lib/mockData';
import { QuestionStatusBadge } from './QuestionStatusBadge';

interface TournamentQuestionConfigPanelProps {
  tournamentId: string;
  tournamentName: string;
  onSave: (config: TournamentQuestionConfig) => void;
  onCancel: () => void;
}

interface CategoryDistribution {
  category: string;
  available: number;
  selected: number;
  minimum: number;
}

type AutoRotationMode = 'immediate' | 'delayed' | 'manual';

export const TournamentQuestionConfigPanel: React.FC<TournamentQuestionConfigPanelProps> = ({
  tournamentId,
  tournamentName,
  onSave,
  onCancel
}) => {
  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [categoryDistributions, setCategoryDistributions] = useState<CategoryDistribution[]>([]);
  const [autoRotationMode, setAutoRotationMode] = useState<AutoRotationMode>('immediate');
  const [delayHours, setDelayHours] = useState<number>(24);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  useEffect(() => {
    loadAvailableQuestions();
  }, []);

  useEffect(() => {
    updateCategoryDistributions();
    validateSelection();
  }, [selectedQuestionIds, availableQuestions]);

  const loadAvailableQuestions = () => {
    const allQuestions = storage.get(STORAGE_KEYS.QUESTIONS) as Question[] || [];
    
    // Get questions from the pool (available for tournaments)
    const poolQuestions = allQuestions.filter(q => 
      q.status === QuestionStatus.QUESTION_POOL
    );

    setAvailableQuestions(poolQuestions);

    // Load existing config if any
    const configs = storage.get(STORAGE_KEYS.TOURNAMENT_QUESTION_CONFIGS) as TournamentQuestionConfig[] || [];
    const existingConfig = configs.find(c => c.tournamentId === tournamentId);

    if (existingConfig) {
      setSelectedQuestionIds(existingConfig.selectedQuestionIds);
      setAutoRotationMode(existingConfig.practiceReleaseMode);
      setDelayHours(existingConfig.delayHours || 24);
    }
  };

  const updateCategoryDistributions = () => {
    const categories = new Map<string, CategoryDistribution>();

    // Initialize with available questions
    availableQuestions.forEach(q => {
      if (!categories.has(q.category)) {
        categories.set(q.category, {
          category: q.category,
          available: 0,
          selected: 0,
          minimum: 10
        });
      }
      const dist = categories.get(q.category)!;
      dist.available++;
      if (selectedQuestionIds.includes(q.id)) {
        dist.selected++;
      }
    });

    setCategoryDistributions(Array.from(categories.values()).sort((a, b) => 
      a.category.localeCompare(b.category)
    ));
  };

  const validateSelection = () => {
    const errors: string[] = [];

    // Check minimum per category (10)
    categoryDistributions.forEach(dist => {
      if (dist.selected > 0 && dist.selected < dist.minimum) {
        errors.push(`${dist.category}: Need ${dist.minimum - dist.selected} more (min: ${dist.minimum})`);
      }
    });

    // Check that at least one category has questions
    if (selectedQuestionIds.length === 0) {
      errors.push('Select at least one question');
    }

    // Check that used categories meet minimum
    const usedCategories = categoryDistributions.filter(d => d.selected > 0);
    if (usedCategories.length === 0 && selectedQuestionIds.length > 0) {
      errors.push('Invalid selection state');
    }

    setValidationErrors(errors);
  };

  const handleToggleQuestion = (questionId: string) => {
    setSelectedQuestionIds(prev => 
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const handleToggleCategory = (category: string) => {
    const categoryQuestions = availableQuestions
      .filter(q => q.category === category)
      .map(q => q.id);

    const allSelected = categoryQuestions.every(id => selectedQuestionIds.includes(id));

    if (allSelected) {
      // Deselect all from this category
      setSelectedQuestionIds(prev => prev.filter(id => !categoryQuestions.includes(id)));
    } else {
      // Select all from this category
      setSelectedQuestionIds(prev => {
        const newIds = [...prev];
        categoryQuestions.forEach(id => {
          if (!newIds.includes(id)) {
            newIds.push(id);
          }
        });
        return newIds;
      });
    }
  };

  const handleAutoSelectMinimum = (category: string, minimum: number) => {
    const categoryQuestions = availableQuestions.filter(q => q.category === category);
    const currentDist = categoryDistributions.find(d => d.category === category);
    
    if (!currentDist) return;

    const needed = minimum - currentDist.selected;
    if (needed <= 0) return;

    const unselected = categoryQuestions.filter(q => !selectedQuestionIds.includes(q.id));
    const toSelect = unselected.slice(0, needed).map(q => q.id);

    setSelectedQuestionIds(prev => [...prev, ...toSelect]);
  };

  const handleSave = () => {
    if (validationErrors.length > 0) {
      return;
    }

    const config: TournamentQuestionConfig = {
      tournamentId,
      tenantId: 'current-tenant', // Should come from auth context
      selectionMode: 'manual',
      selectedQuestionIds: selectedQuestionIds,
      practiceReleaseMode: autoRotationMode,
      delayHours: autoRotationMode === 'delayed' ? delayHours : undefined,
      validationStatus: 'valid',
      minimumQuestionsPerCategory: 10,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'current-user' // Should come from auth context
    };

    // Save to storage
    const configs = storage.get(STORAGE_KEYS.TOURNAMENT_QUESTION_CONFIGS) as TournamentQuestionConfig[] || [];
    const existingIndex = configs.findIndex(c => c.tournamentId === tournamentId);
    
    if (existingIndex >= 0) {
      configs[existingIndex] = config;
    } else {
      configs.push(config);
    }

    storage.set(STORAGE_KEYS.TOURNAMENT_QUESTION_CONFIGS, configs);

    onSave(config);
  };

  const filteredQuestions = filterCategory === 'all' 
    ? availableQuestions
    : availableQuestions.filter(q => q.category === filterCategory);

  const categories = Array.from(new Set(availableQuestions.map(q => q.category))).sort();

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>Tournament Question Configuration</CardTitle>
          <CardDescription>
            Configure questions for: <strong>{tournamentName}</strong>
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Auto-Rotation Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Practice Release Mode</CardTitle>
          <CardDescription>
            How should questions become available for practice after the tournament?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Immediate */}
            <div
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                autoRotationMode === 'immediate'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setAutoRotationMode('immediate')}
            >
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold">Immediate</h3>
              </div>
              <p className="text-sm text-gray-600">
                Questions available right after tournament ends
              </p>
            </div>

            {/* Delayed */}
            <div
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                autoRotationMode === 'delayed'
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setAutoRotationMode('delayed')}
            >
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-orange-600" />
                <h3 className="font-semibold">Delayed</h3>
              </div>
              <p className="text-sm text-gray-600">
                Delay release for a specified time period
              </p>
            </div>

            {/* Manual */}
            <div
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                autoRotationMode === 'manual'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setAutoRotationMode('manual')}
            >
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold">Manual</h3>
              </div>
              <p className="text-sm text-gray-600">
                Admin manually releases questions
              </p>
            </div>
          </div>

          {autoRotationMode === 'delayed' && (
            <div className="pt-4 border-t">
              <Label htmlFor="delayHours">Delay Duration (hours)</Label>
              <Input
                id="delayHours"
                type="number"
                min="1"
                max="168"
                value={delayHours}
                onChange={(e) => setDelayHours(parseInt(e.target.value) || 24)}
                className="mt-1 max-w-xs"
              />
              <p className="text-xs text-gray-500 mt-1">
                Questions will be available {delayHours} hours after tournament completion
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Distribution Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Category Distribution</CardTitle>
          <CardDescription>
            Ensure each category has at least 10 questions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categoryDistributions.map(dist => {
              const percentage = dist.available > 0 ? (dist.selected / dist.available) * 100 : 0;
              const isValid = dist.selected === 0 || dist.selected >= dist.minimum;
              const needsMore = dist.selected > 0 && dist.selected < dist.minimum;

              return (
                <div key={dist.category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={dist.selected === dist.available}
                        onCheckedChange={() => handleToggleCategory(dist.category)}
                      />
                      <span className="font-medium">{dist.category}</span>
                      {!isValid && (
                        <Badge variant="destructive" className="text-xs">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Need {dist.minimum - dist.selected} more
                        </Badge>
                      )}
                      {dist.selected >= dist.minimum && dist.selected > 0 && (
                        <Badge variant="default" className="text-xs bg-green-100 text-green-700">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Valid
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-600">
                        {dist.selected} / {dist.available} selected
                      </span>
                      {needsMore && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAutoSelectMinimum(dist.category, dist.minimum)}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Auto-fill to {dist.minimum}
                        </Button>
                      )}
                    </div>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </div>

          {categoryDistributions.length === 0 && (
            <Alert>
              <Info className="w-4 h-4" />
              <AlertDescription>
                No questions available in the question pool. Please add questions first.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription>
            <div className="font-semibold mb-2">Please fix the following issues:</div>
            <ul className="list-disc list-inside space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index} className="text-sm">{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Question Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Select Questions</CardTitle>
              <CardDescription>
                {selectedQuestionIds.length} questions selected from {availableQuestions.length} available
              </CardDescription>
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredQuestions.map(question => (
              <div
                key={question.id}
                className={`p-3 border rounded-lg flex items-start gap-3 cursor-pointer transition-all ${
                  selectedQuestionIds.includes(question.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleToggleQuestion(question.id)}
              >
                <Checkbox
                  checked={selectedQuestionIds.includes(question.id)}
                  onCheckedChange={() => handleToggleQuestion(question.id)}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium">{question.text}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">{question.category}</Badge>
                    <Badge variant="outline" className="text-xs">{question.difficulty}</Badge>
                    <span className="text-xs text-gray-500">Used {question.usageCount}x</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          onClick={handleSave}
          disabled={validationErrors.length > 0}
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Save Configuration
        </Button>
      </div>
    </div>
  );
};

export default TournamentQuestionConfigPanel;
