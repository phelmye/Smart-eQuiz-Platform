import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Trash2, 
  MoveUp, 
  MoveDown, 
  Layers, 
  Shuffle,
  List,
  Clock,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { RoundQuestionConfig, RoundCategoryDistribution, QuestionCategoryType } from '@/lib/mockData';
import { useState } from 'react';

interface RoundQuestionConfigBuilderProps {
  totalRounds: number;
  onConfigsChange: (configs: RoundQuestionConfig[]) => void;
  initialConfigs?: RoundQuestionConfig[];
}

const CATEGORY_OPTIONS: Array<{ value: QuestionCategoryType; label: string; color: string }> = [
  { value: 'general_bible', label: 'General Bible Knowledge', color: 'bg-blue-100 text-blue-800' },
  { value: 'ccc_hymns', label: 'CCC Hymns & Worship', color: 'bg-purple-100 text-purple-800' },
  { value: 'specific_study', label: 'Specific Bible Study', color: 'bg-green-100 text-green-800' },
  { value: 'doctrine', label: 'Doctrine', color: 'bg-orange-100 text-orange-800' },
  { value: 'tenets', label: 'Tenets', color: 'bg-red-100 text-red-800' },
  { value: 'custom', label: 'Custom Category', color: 'bg-gray-100 text-gray-800' }
];

const DEFAULT_ROUND_CONFIG: RoundQuestionConfig = {
  roundNumber: 1,
  roundName: 'Round 1',
  totalQuestions: 10,
  timeLimitMinutes: 15,
  categoryDistribution: [
    { category: 'general_bible', questionCount: 5 },
    { category: 'specific_study', questionCount: 5 }
  ],
  questionDeliveryMode: 'mixed',
  excludePreviousRoundQuestions: true,
  allowQuestionReuse: false,
  randomizeQuestionOrder: true,
  randomizeOptionOrder: true
};

export default function RoundQuestionConfigBuilder({
  totalRounds,
  onConfigsChange,
  initialConfigs
}: RoundQuestionConfigBuilderProps) {
  const [configs, setConfigs] = useState<RoundQuestionConfig[]>(
    initialConfigs || generateDefaultConfigs(totalRounds)
  );
  const [expandedRound, setExpandedRound] = useState<number>(1);

  function generateDefaultConfigs(rounds: number): RoundQuestionConfig[] {
    const roundNames = ['Round 1', 'Quarter Finals', 'Semi Finals', 'Finals', 'Round 5', 'Round 6'];
    
    return Array.from({ length: rounds }, (_, i) => ({
      ...DEFAULT_ROUND_CONFIG,
      roundNumber: i + 1,
      roundName: roundNames[i] || `Round ${i + 1}`,
      totalQuestions: 10 + (i * 5), // Increase questions per round
      timeLimitMinutes: 15 + (i * 5)
    }));
  }

  const updateConfig = (roundNumber: number, updates: Partial<RoundQuestionConfig>) => {
    const newConfigs = configs.map(config =>
      config.roundNumber === roundNumber ? { ...config, ...updates } : config
    );
    setConfigs(newConfigs);
    onConfigsChange(newConfigs);
  };

  const addCategory = (roundNumber: number) => {
    const config = configs.find(c => c.roundNumber === roundNumber);
    if (!config) return;

    const newDistribution: RoundCategoryDistribution = {
      category: 'general_bible',
      questionCount: 5
    };

    updateConfig(roundNumber, {
      categoryDistribution: [...config.categoryDistribution, newDistribution]
    });
  };

  const removeCategory = (roundNumber: number, index: number) => {
    const config = configs.find(c => c.roundNumber === roundNumber);
    if (!config || config.categoryDistribution.length <= 1) return;

    const newDistribution = config.categoryDistribution.filter((_, i) => i !== index);
    updateConfig(roundNumber, { categoryDistribution: newDistribution });
  };

  const updateCategory = (
    roundNumber: number, 
    index: number, 
    updates: Partial<RoundCategoryDistribution>
  ) => {
    const config = configs.find(c => c.roundNumber === roundNumber);
    if (!config) return;

    const newDistribution = config.categoryDistribution.map((cat, i) =>
      i === index ? { ...cat, ...updates } : cat
    );
    updateConfig(roundNumber, { categoryDistribution: newDistribution });
  };

  const moveCategoryUp = (roundNumber: number, index: number) => {
    if (index === 0) return;
    const config = configs.find(c => c.roundNumber === roundNumber);
    if (!config) return;

    const newDistribution = [...config.categoryDistribution];
    [newDistribution[index - 1], newDistribution[index]] = 
    [newDistribution[index], newDistribution[index - 1]];
    
    updateConfig(roundNumber, { categoryDistribution: newDistribution });
  };

  const moveCategoryDown = (roundNumber: number, index: number) => {
    const config = configs.find(c => c.roundNumber === roundNumber);
    if (!config || index === config.categoryDistribution.length - 1) return;

    const newDistribution = [...config.categoryDistribution];
    [newDistribution[index], newDistribution[index + 1]] = 
    [newDistribution[index + 1], newDistribution[index]];
    
    updateConfig(roundNumber, { categoryDistribution: newDistribution });
  };

  const getTotalQuestions = (config: RoundQuestionConfig): number => {
    return config.categoryDistribution.reduce((sum, cat) => sum + cat.questionCount, 0);
  };

  const getCategoryColor = (category: QuestionCategoryType): string => {
    return CATEGORY_OPTIONS.find(opt => opt.value === category)?.color || 'bg-gray-100 text-gray-800';
  };

  const getCategoryLabel = (category: QuestionCategoryType): string => {
    return CATEGORY_OPTIONS.find(opt => opt.value === category)?.label || category;
  };

  return (
    <div className="space-y-4">
      {/* Summary Banner */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-blue-900">Round-by-Round Question Configuration</h4>
              <p className="text-sm text-blue-700">
                Configure unique question sets and categories for each tournament round
              </p>
            </div>
            <Badge variant="outline" className="bg-white">
              {totalRounds} Rounds
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Round Configurations */}
      {configs.map((config) => {
        const totalQs = getTotalQuestions(config);
        const isExpanded = expandedRound === config.roundNumber;
        const hasValidConfig = totalQs === config.totalQuestions;

        return (
          <Card key={config.roundNumber} className={isExpanded ? 'border-blue-500 shadow-md' : ''}>
            <CardHeader 
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => setExpandedRound(isExpanded ? 0 : config.roundNumber)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                    {config.roundNumber}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{config.roundName}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <span>{config.totalQuestions} questions</span>
                      <span>•</span>
                      <Clock className="w-3 h-3" />
                      <span>{config.timeLimitMinutes} min</span>
                      <span>•</span>
                      <Badge variant="outline" className="text-xs">
                        {config.questionDeliveryMode === 'mixed' ? (
                          <><Shuffle className="w-3 h-3 mr-1" /> Mixed</>
                        ) : (
                          <><Layers className="w-3 h-3 mr-1" /> Staged</>
                        )}
                      </Badge>
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {hasValidConfig ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                  )}
                </div>
              </div>
            </CardHeader>

            {isExpanded && (
              <CardContent className="space-y-6 pt-6 border-t">
                {/* Basic Settings */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Round Name</Label>
                    <Input
                      value={config.roundName}
                      onChange={(e) => updateConfig(config.roundNumber, { roundName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Total Questions</Label>
                    <Input
                      type="number"
                      min="5"
                      max="100"
                      value={config.totalQuestions}
                      onChange={(e) => updateConfig(config.roundNumber, { 
                        totalQuestions: parseInt(e.target.value) || 10 
                      })}
                    />
                  </div>
                  <div>
                    <Label>Time Limit (minutes)</Label>
                    <Input
                      type="number"
                      min="5"
                      max="120"
                      value={config.timeLimitMinutes}
                      onChange={(e) => updateConfig(config.roundNumber, { 
                        timeLimitMinutes: parseInt(e.target.value) || 15 
                      })}
                    />
                  </div>
                </div>

                {/* Question Delivery Mode */}
                <div>
                  <Label>Question Delivery Mode</Label>
                  <Select 
                    value={config.questionDeliveryMode}
                    onValueChange={(value: 'mixed' | 'staged_by_category') => 
                      updateConfig(config.roundNumber, { questionDeliveryMode: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mixed">
                        <div className="flex items-center gap-2">
                          <Shuffle className="w-4 h-4" />
                          <div>
                            <div className="font-medium">Mixed (Shuffled)</div>
                            <div className="text-xs text-gray-500">All questions randomly shuffled together</div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="staged_by_category">
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4" />
                          <div>
                            <div className="font-medium">Staged by Category</div>
                            <div className="text-xs text-gray-500">Present each category as a separate stage</div>
                          </div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {config.questionDeliveryMode === 'staged_by_category' && (
                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <List className="w-4 h-4 text-blue-600 mt-0.5" />
                        <div className="text-sm text-blue-800">
                          <p className="font-medium mb-1">Staged Presentation</p>
                          <p className="text-xs">
                            Participants will see all questions from Category 1, then all from Category 2, etc.
                            The order below determines the presentation sequence.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Category Distribution */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-base">Category Distribution</Label>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => addCategory(config.roundNumber)}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Category
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {config.categoryDistribution.map((cat, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        {/* Category Selection */}
                        <div className="flex-1">
                          <Select
                            value={cat.category}
                            onValueChange={(value: QuestionCategoryType) =>
                              updateCategory(config.roundNumber, index, { category: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {CATEGORY_OPTIONS.map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  <Badge className={opt.color}>{opt.label}</Badge>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Question Count */}
                        <div className="w-32">
                          <Input
                            type="number"
                            min="1"
                            max="50"
                            value={cat.questionCount}
                            onChange={(e) =>
                              updateCategory(config.roundNumber, index, { 
                                questionCount: parseInt(e.target.value) || 1 
                              })
                            }
                            placeholder="Questions"
                          />
                        </div>

                        {/* Difficulty (optional) */}
                        <div className="w-32">
                          <Select
                            value={cat.difficulty || 'medium'}
                            onValueChange={(value: 'easy' | 'medium' | 'hard') =>
                              updateCategory(config.roundNumber, index, { difficulty: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="easy">Easy</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="hard">Hard</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Order Controls */}
                        {config.questionDeliveryMode === 'staged_by_category' && (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => moveCategoryUp(config.roundNumber, index)}
                              disabled={index === 0}
                            >
                              <MoveUp className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => moveCategoryDown(config.roundNumber, index)}
                              disabled={index === config.categoryDistribution.length - 1}
                            >
                              <MoveDown className="w-4 h-4" />
                            </Button>
                          </div>
                        )}

                        {/* Remove */}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeCategory(config.roundNumber, index)}
                          disabled={config.categoryDistribution.length <= 1}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {/* Validation Warning */}
                  {!hasValidConfig && (
                    <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                        <div className="text-sm text-amber-800">
                          <p className="font-medium">Question Count Mismatch</p>
                          <p className="text-xs mt-1">
                            Category questions ({totalQs}) don't match total questions ({config.totalQuestions}).
                            Please adjust the counts.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Presentation Preview */}
                {config.questionDeliveryMode === 'staged_by_category' && (
                  <div className="border-t pt-4">
                    <Label className="text-sm text-gray-600 mb-2 block">Presentation Order Preview</Label>
                    <div className="flex flex-wrap gap-2">
                      {config.categoryDistribution.map((cat, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Badge className={getCategoryColor(cat.category)}>
                            Stage {index + 1}: {getCategoryLabel(cat.category)} ({cat.questionCount}Q)
                          </Badge>
                          {index < config.categoryDistribution.length - 1 && (
                            <span className="text-gray-400">→</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
