import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Trophy, Star, Zap, Award, TrendingUp, CheckCircle2, XCircle, 
  Clock, Sparkles, RefreshCw, Plus, Eye, Filter, Search,
  BarChart3, Target, Flame, Crown, Diamond, Shield
} from 'lucide-react';
import {
  Question,
  getBonusQuestionConfig,
  getUserBonusEligibility,
  getUserPracticeAnalytics,
  getEligibleBonusQuestions,
  createBonusQuestionRequest,
  retwistBonusQuestions,
  getBonusQuestionRequests,
  approveBonusQuestions,
  BonusQuestionRequest
} from '@/lib/mockData';
import type { Question as QuestionType } from '@/lib/mockData';

interface BonusQuestionManagerProps {
  tenantId: string;
  userId: string;
  tournamentId?: string;
  onQuestionsAdded?: (questions: Question[]) => void;
  onBack?: () => void;
}

const tierIcons = {
  1: Shield,
  2: Star,
  3: Crown,
  4: Trophy,
  5: Diamond
};

const tierColors = {
  1: 'text-orange-600',
  2: 'text-gray-400',
  3: 'text-yellow-500',
  4: 'text-purple-600',
  5: 'text-cyan-400'
};

const tierNames = {
  1: 'Bronze',
  2: 'Silver',
  3: 'Gold',
  4: 'Platinum',
  5: 'Diamond'
};

const retwistStrategyDescriptions = {
  synonym: 'Replace words with biblical synonyms while maintaining meaning',
  paraphrase: 'Restructure sentences for variety',
  perspective: 'Change narrative viewpoint or framing',
  context: 'Add biblical references and historical context',
  creative: 'AI-powered creative transformations',
  hybrid: 'Combine multiple strategies for maximum variation'
};

export default function BonusQuestionManager({ 
  tenantId, 
  userId, 
  tournamentId,
  onQuestionsAdded 
}: BonusQuestionManagerProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'select' | 'requests'>('overview');
  const [eligibility, setEligibility] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [config, setConfig] = useState<any>(null);
  const [eligibleQuestions, setEligibleQuestions] = useState<Question[]>([]);
  const [requests, setRequests] = useState<BonusQuestionRequest[]>([]);
  
  // Selection state
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set());
  const [useDirectly, setUseDirectly] = useState(false);
  const [retwistStrategy, setRetwistStrategy] = useState<string>('paraphrase');
  const [retwistQuality, setRetwistQuality] = useState<string>('standard');
  const [generateVariations, setGenerateVariations] = useState(1);
  const [addContext, setAddContext] = useState(false);
  const [expandExplanations, setExpandExplanations] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  
  // Filters
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');

  useEffect(() => {
    loadData();
  }, [tenantId, userId]);

  const loadData = () => {
    const cfg = getBonusQuestionConfig(tenantId);
    const elig = getUserBonusEligibility(tenantId, userId);
    const anl = getUserPracticeAnalytics(tenantId, userId);
    const reqs = getBonusQuestionRequests({ tenantId, requestedBy: userId });
    
    setConfig(cfg);
    setEligibility(elig);
    setAnalytics(anl);
    setRequests(reqs);
    
    if (elig.eligible) {
      const questions = getEligibleBonusQuestions(tenantId, userId, {
        limit: elig.questionsRemaining
      });
      setEligibleQuestions(questions);
    }
  };

  const handleQuestionToggle = (questionId: string) => {
    const newSelected = new Set(selectedQuestions);
    if (newSelected.has(questionId)) {
      newSelected.delete(questionId);
    } else {
      if (eligibility && newSelected.size >= eligibility.questionsRemaining) {
        alert(`You can only select ${eligibility.questionsRemaining} questions at your current tier`);
        return;
      }
      newSelected.add(questionId);
    }
    setSelectedQuestions(newSelected);
  };

  const handleCreateRequest = async () => {
    if (selectedQuestions.size === 0) {
      alert('Please select at least one question');
      return;
    }

    setIsProcessing(true);
    setProcessingStatus('Creating request...');

    try {
      const request = createBonusQuestionRequest(
        tenantId,
        userId,
        {
          sourceQuestionIds: Array.from(selectedQuestions),
          tournamentId,
          useDirectly,
          retwistStrategy: retwistStrategy as any,
          retwistQuality: retwistQuality as any,
          generateVariations,
          addBiblicalContext: addContext,
          expandExplanations,
          retwistPrompt: customPrompt || undefined
        }
      );

      if ('error' in request) {
        alert(request.error);
        setIsProcessing(false);
        return;
      }

      if (!useDirectly) {
        setProcessingStatus('Generating variations...');
        await retwistBonusQuestions(request.id);
      }

      setProcessingStatus('Complete!');
      setTimeout(() => {
        setIsProcessing(false);
        setProcessingStatus('');
        setSelectedQuestions(new Set());
        loadData();
        setActiveTab('requests');
      }, 1000);
    } catch (error) {
      console.error('Error creating bonus question request:', error);
      alert('Failed to create bonus question request');
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  const handleApproveRequest = (requestId: string, questionIds: string[]) => {
    const result = approveBonusQuestions(
      requestId, 
      userId, 
      questionIds,
      tournamentId ? 'tournament' : 'pool'
    );

    if (result.success) {
      loadData();
      if (onQuestionsAdded) {
        // Reload to get approved questions
        loadData();
      }
    } else {
      alert(result.error);
    }
  };

  const renderTierBadge = (tier: number) => {
    const Icon = tierIcons[tier as keyof typeof tierIcons];
    const color = tierColors[tier as keyof typeof tierColors];
    const name = tierNames[tier as keyof typeof tierNames];
    
    return (
      <div className="flex items-center gap-2">
        <Icon className={`h-5 w-5 ${color}`} />
        <span className="font-semibold">{name} Tier</span>
      </div>
    );
  };

  const renderOverviewTab = () => {
    if (!eligibility || !analytics) return null;

    const currentTier = config?.unlockTiers.find((t: any) => t.tier === eligibility.currentTier);
    const nextTier = eligibility.nextTier 
      ? config?.unlockTiers.find((t: any) => t.tier === eligibility.nextTier.tier)
      : null;

    return (
      <div className="space-y-6">
        {/* Eligibility Status */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {renderTierBadge(eligibility.currentTier)}
                </CardTitle>
                <CardDescription>
                  {eligibility.eligible 
                    ? `You can select up to ${eligibility.questionsRemaining} bonus questions`
                    : 'Complete more practice sessions to unlock bonus questions'}
                </CardDescription>
              </div>
              <Badge variant={eligibility.eligible ? 'default' : 'secondary'}>
                {eligibility.eligible ? 'Eligible' : 'Not Eligible'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {!eligibility.eligible && eligibility.nextTier && (
              <Alert>
                <TrendingUp className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-semibold">Next Tier: {tierNames[eligibility.nextTier.tier as keyof typeof tierNames]}</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center justify-between">
                        <span>Practice Sessions:</span>
                        <span>{analytics.totalPracticeSessions} / {eligibility.nextTier.requirements.practiceSessions}</span>
                      </div>
                      <Progress 
                        value={(analytics.totalPracticeSessions / eligibility.nextTier.requirements.practiceSessions) * 100} 
                        className="h-2"
                      />
                      
                      <div className="flex items-center justify-between mt-2">
                        <span>Average Accuracy:</span>
                        <span>{analytics.averageAccuracy}% / {eligibility.nextTier.requirements.minimumAccuracy}%</span>
                      </div>
                      <Progress 
                        value={(analytics.averageAccuracy / eligibility.nextTier.requirements.minimumAccuracy) * 100} 
                        className="h-2"
                      />
                      
                      <div className="flex items-center justify-between mt-2">
                        <span>Current Streak:</span>
                        <span>{analytics.currentStreak} / {eligibility.nextTier.requirements.streakDays} days</span>
                      </div>
                      <Progress 
                        value={(analytics.currentStreak / eligibility.nextTier.requirements.streakDays) * 100} 
                        className="h-2"
                      />
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Practice Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Practice Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Target className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold">{analytics.totalPracticeSessions}</div>
                <div className="text-sm text-gray-600">Practice Sessions</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <div className="text-2xl font-bold">{analytics.averageAccuracy}%</div>
                <div className="text-sm text-gray-600">Average Accuracy</div>
              </div>
              
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <Flame className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                <div className="text-2xl font-bold">{analytics.currentStreak}</div>
                <div className="text-sm text-gray-600">Current Streak</div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Trophy className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <div className="text-2xl font-bold">{analytics.longestStreak}</div>
                <div className="text-sm text-gray-600">Longest Streak</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tier Benefits */}
        {currentTier && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Current Tier Benefits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Questions per period:</span>
                  <Badge>{currentTier.maxQuestions}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Retwist quality:</span>
                  <Badge variant="outline">{currentTier.allowedRetwistQuality.join(', ')}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Max variations:</span>
                  <Badge>{currentTier.maxVariations}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span>Features:</span>
                  <div className="flex flex-wrap gap-1">
                    {currentTier.features.map((feature: string) => (
                      <Badge key={feature} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Achievements */}
        {analytics.achievements && analytics.achievements.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Achievements Unlocked
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {analytics.achievements.map((achievement: any) => (
                  <Badge key={achievement.id} variant="outline" className="p-2">
                    <Trophy className="h-4 w-4 mr-1" />
                    {achievement.name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {eligibility.eligible && (
          <Button 
            size="lg" 
            className="w-full"
            onClick={() => setActiveTab('select')}
          >
            <Plus className="h-5 w-5 mr-2" />
            Select Bonus Questions
          </Button>
        )}
      </div>
    );
  };

  const renderSelectTab = () => {
    if (!eligibility?.eligible) {
      return (
        <Alert>
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            You are not currently eligible for bonus questions. Complete more practice sessions to unlock this feature.
          </AlertDescription>
        </Alert>
      );
    }

    const filteredQuestions = eligibleQuestions.filter(q => {
      if (categoryFilter !== 'all' && q.category !== categoryFilter) return false;
      if (difficultyFilter !== 'all' && q.difficulty !== difficultyFilter) return false;
      if (searchQuery && !q.text.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });

    const categories = Array.from(new Set(eligibleQuestions.map(q => q.category)));

    return (
      <div className="space-y-6">
        {/* Selection Summary */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{selectedQuestions.size} / {eligibility.questionsRemaining}</div>
                <div className="text-sm text-gray-600">Questions Selected</div>
              </div>
              <Button 
                onClick={handleCreateRequest}
                disabled={selectedQuestions.size === 0 || isProcessing}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    {processingStatus}
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Create Request
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Options */}
        <Card>
          <CardHeader>
            <CardTitle>Processing Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Direct Use vs Retwist */}
            <div className="space-y-3">
              <Label>Question Processing</Label>
              <RadioGroup value={useDirectly ? 'direct' : 'retwist'} onValueChange={(v) => setUseDirectly(v === 'direct')}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="direct" id="direct" />
                  <Label htmlFor="direct" className="font-normal">
                    Use directly (copy questions as-is)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="retwist" id="retwist" />
                  <Label htmlFor="retwist" className="font-normal">
                    Retwist with AI (create variations)
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {!useDirectly && (
              <>
                <Separator />
                
                {/* Retwist Strategy */}
                <div className="space-y-3">
                  <Label>Retwist Strategy</Label>
                  <Select value={retwistStrategy} onValueChange={setRetwistStrategy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="synonym">Synonym Replacement</SelectItem>
                      <SelectItem value="paraphrase">Paraphrase</SelectItem>
                      <SelectItem value="perspective">Change Perspective</SelectItem>
                      <SelectItem value="context">Add Biblical Context</SelectItem>
                      <SelectItem value="creative">Creative AI</SelectItem>
                      <SelectItem value="hybrid">Hybrid (Multiple Strategies)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-600">
                    {retwistStrategyDescriptions[retwistStrategy as keyof typeof retwistStrategyDescriptions]}
                  </p>
                </div>

                {/* Quality Level */}
                <div className="space-y-3">
                  <Label>Quality Level</Label>
                  <Select value={retwistQuality} onValueChange={setRetwistQuality}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Variations */}
                <div className="space-y-3">
                  <Label>Variations per Question: {generateVariations}</Label>
                  <Input 
                    type="range" 
                    min="1" 
                    max={eligibility.currentTier >= 3 ? 5 : eligibility.currentTier >= 2 ? 3 : 1}
                    value={generateVariations}
                    onChange={(e) => setGenerateVariations(parseInt(e.target.value))}
                  />
                  <p className="text-sm text-gray-600">
                    Generate {generateVariations} variation{generateVariations > 1 ? 's' : ''} of each selected question
                  </p>
                </div>

                {/* Additional Options */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="addContext" 
                      checked={addContext}
                      onCheckedChange={(checked) => setAddContext(checked as boolean)}
                    />
                    <Label htmlFor="addContext" className="font-normal">
                      Add biblical context and references
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="expandExplanations" 
                      checked={expandExplanations}
                      onCheckedChange={(checked) => setExpandExplanations(checked as boolean)}
                    />
                    <Label htmlFor="expandExplanations" className="font-normal">
                      Expand explanations and details
                    </Label>
                  </div>
                </div>

                {/* Custom Prompt */}
                <div className="space-y-3">
                  <Label>Custom Instructions (Optional)</Label>
                  <Textarea 
                    placeholder="Add any specific instructions for the AI retwisting..."
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    rows={3}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Questions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Label>Category</Label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex-1">
                <Label>Difficulty</Label>
                <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Difficulties</SelectItem>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Question List */}
        <Card>
          <CardHeader>
            <CardTitle>Available Questions ({filteredQuestions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-3">
                {filteredQuestions.map(question => (
                  <Card 
                    key={question.id}
                    className={`cursor-pointer transition-colors ${
                      selectedQuestions.has(question.id) ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleQuestionToggle(question.id)}
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <Checkbox 
                          checked={selectedQuestions.has(question.id)}
                          onCheckedChange={() => handleQuestionToggle(question.id)}
                        />
                        <div className="flex-1">
                          <p className="font-medium mb-2">{question.text}</p>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline">{question.category}</Badge>
                            <Badge variant="secondary">{question.difficulty}</Badge>
                            {question.tags?.includes('high-quality') && (
                              <Badge className="bg-green-100 text-green-800">
                                <Star className="h-3 w-3 mr-1" />
                                High Quality
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderRequestsTab = () => {
    return (
      <div className="space-y-4">
        {requests.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">No bonus question requests yet</p>
            </CardContent>
          </Card>
        ) : (
          requests.map(request => (
            <Card key={request.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      Request #{request.id.slice(0, 8)}
                    </CardTitle>
                    <CardDescription>
                      {new Date(request.requestedAt).toLocaleString()}
                    </CardDescription>
                  </div>
                  <Badge variant={
                    request.status === 'completed' ? 'default' :
                    request.status === 'failed' ? 'destructive' :
                    request.status === 'awaiting_approval' ? 'secondary' :
                    'outline'
                  }>
                    {request.status.replace(/_/g, ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Source Questions:</span>
                    <div className="font-semibold">{request.sourceQuestionIds.length}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Generated:</span>
                    <div className="font-semibold">{request.generatedQuestionIds.length}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Strategy:</span>
                    <div className="font-semibold capitalize">{request.retwistStrategy || 'Direct'}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Quality:</span>
                    <div className="font-semibold capitalize">{request.retwistQuality || 'N/A'}</div>
                  </div>
                </div>

                {request.status === 'awaiting_approval' && (
                  <>
                    <Separator />
                    <div className="flex gap-2">
                      <Button 
                        size="sm"
                        onClick={() => handleApproveRequest(request.id, request.generatedQuestionIds)}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Approve All
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        Review Questions
                      </Button>
                    </div>
                  </>
                )}

                {request.status === 'completed' && (
                  <Alert>
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription>
                      Request completed. {request.generatedQuestionIds.length} questions added to{' '}
                      {request.tournamentId ? 'tournament' : 'question pool'}.
                    </AlertDescription>
                  </Alert>
                )}

                {request.status === 'failed' && request.error && (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>{request.error}</AlertDescription>
                  </Alert>
                )}

                {['analyzing', 'retwisting', 'generating_variations'].includes(request.status) && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress</span>
                      <span>{request.progress}%</span>
                    </div>
                    <Progress value={request.progress} />
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Zap className="h-8 w-8 text-yellow-500" />
          Bonus Questions
        </h1>
        <p className="text-gray-600">
          Reward your practice dedication with bonus questions for tournaments
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="select">
            <Plus className="h-4 w-4 mr-2" />
            Select Questions
          </TabsTrigger>
          <TabsTrigger value="requests">
            <Clock className="h-4 w-4 mr-2" />
            Requests ({requests.length})
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="overview">{renderOverviewTab()}</TabsContent>
          <TabsContent value="select">{renderSelectTab()}</TabsContent>
          <TabsContent value="requests">{renderRequestsTab()}</TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
