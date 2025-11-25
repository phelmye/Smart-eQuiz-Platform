import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Zap, RefreshCw, Download, CheckCircle, Loader2, AlertCircle, Edit, Eye, Check, X, Clock, Sparkles } from 'lucide-react';
import { useAuth } from './AuthSystem';
import { 
  storage, 
  STORAGE_KEYS, 
  Question, 
  BIBLE_CATEGORIES, 
  hasPermission,
  QuestionStatus,
  QuestionApprovalStatus,
  getAIGenerationConfig,
  canGenerateAIQuestions,
  createAIGenerationRequest,
  getAIGenerationRequests,
  updateQuestionStatus
} from '@/lib/mockData';

interface AIQuestionGeneratorProps {
  onBack: () => void;
}

interface GenerationSettings {
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  count: number;
  topic: string;
  includeVerses: boolean;
  includeExplanations: boolean;
  model: string;
}

interface PendingQuestion extends Question {
  status: QuestionStatus;
  approvalStatus: QuestionApprovalStatus;
  aiGeneratedAt: string;
  aiModel: string;
  createdBy: string;
}

export const AIQuestionGenerator: React.FC<AIQuestionGeneratorProps> = ({ onBack }) => {
  const { user, tenant } = useAuth();
  const [settings, setSettings] = useState<GenerationSettings>({
    category: '',
    difficulty: 'medium',
    count: 10,
    topic: '',
    includeVerses: true,
    includeExplanations: true,
    model: 'gpt-4'
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
  const [pendingQuestions, setPendingQuestions] = useState<PendingQuestion[]>([]);
  const [progress, setProgress] = useState(0);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [aiConfig, setAiConfig] = useState<any>(null);
  const [generationRequests, setGenerationRequests] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('generate');
  
  // Review dialog state
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewingQuestion, setReviewingQuestion] = useState<PendingQuestion | null>(null);
  const [editedQuestion, setEditedQuestion] = useState<PendingQuestion | null>(null);
  const [destination, setDestination] = useState<'pool' | 'tournament'>('pool');
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    if (user?.tenantId) {
      // Load AI config
      const config = getAIGenerationConfig(user.tenantId);
      setAiConfig(config);
      
      // Load generation requests
      const requests = getAIGenerationRequests(user.tenantId);
      setGenerationRequests(requests);
      
      // Load pending questions
      loadPendingQuestions();
    }
  }, [user]);

  const loadPendingQuestions = () => {
    if (!user?.tenantId) return;
    
    const allQuestions = storage.get<Question[]>(STORAGE_KEYS.QUESTIONS) || [];
    const pending = allQuestions.filter(
      q => q.tenantId === user.tenantId && 
           q.status === QuestionStatus.AI_PENDING_REVIEW
    ) as PendingQuestion[];
    
    setPendingQuestions(pending);
  };

  const aiQuestionTemplates = [
    {
      category: 'Old Testament',
      questions: [
        {
          text: 'Who was the first king of Israel?',
          options: ['Saul', 'David', 'Solomon', 'Samuel'],
          correctAnswer: 0,
          explanation: 'Saul was anointed as the first king of Israel by the prophet Samuel.',
          verse: '1 Samuel 10:1'
        },
        {
          text: 'How many days and nights did it rain during the flood?',
          options: ['30', '40', '50', '60'],
          correctAnswer: 1,
          explanation: 'It rained for 40 days and 40 nights during the great flood.',
          verse: 'Genesis 7:12'
        },
        {
          text: 'What did God use to destroy Sodom and Gomorrah?',
          options: ['Flood', 'Fire and brimstone', 'Earthquake', 'Plague'],
          correctAnswer: 1,
          explanation: 'God destroyed Sodom and Gomorrah with fire and brimstone from heaven.',
          verse: 'Genesis 19:24'
        }
      ]
    },
    {
      category: 'New Testament',
      questions: [
        {
          text: 'How many apostles did Jesus choose?',
          options: ['10', '11', '12', '13'],
          correctAnswer: 2,
          explanation: 'Jesus chose 12 apostles to be his closest disciples.',
          verse: 'Matthew 10:1-4'
        },
        {
          text: 'Where was Jesus born?',
          options: ['Nazareth', 'Jerusalem', 'Bethlehem', 'Capernaum'],
          correctAnswer: 2,
          explanation: 'Jesus was born in Bethlehem, as prophesied in the Old Testament.',
          verse: 'Matthew 2:1'
        },
        {
          text: 'Who baptized Jesus?',
          options: ['Peter', 'John the Baptist', 'Andrew', 'James'],
          correctAnswer: 1,
          explanation: 'John the Baptist baptized Jesus in the Jordan River.',
          verse: 'Matthew 3:13-17'
        }
      ]
    },
    {
      category: 'Gospels',
      questions: [
        {
          text: 'Which Gospel was written by a doctor?',
          options: ['Matthew', 'Mark', 'Luke', 'John'],
          correctAnswer: 2,
          explanation: 'Luke was a physician and wrote the Gospel of Luke.',
          verse: 'Colossians 4:14'
        },
        {
          text: 'How many loaves and fishes did Jesus use to feed the 5000?',
          options: ['3 loaves, 1 fish', '5 loaves, 2 fish', '7 loaves, 3 fish', '2 loaves, 5 fish'],
          correctAnswer: 1,
          explanation: 'Jesus used 5 loaves and 2 fish to feed the multitude of 5000.',
          verse: 'Matthew 14:17-21'
        }
      ]
    },
    {
      category: 'Psalms & Proverbs',
      questions: [
        {
          text: 'Who wrote most of the Psalms?',
          options: ['Solomon', 'David', 'Moses', 'Asaph'],
          correctAnswer: 1,
          explanation: 'King David wrote the majority of the Psalms in the Bible.',
          verse: 'Psalm 1:1'
        },
        {
          text: 'Complete this verse: "Trust in the Lord with all your heart and..."',
          options: ['lean on your own understanding', 'lean not on your own understanding', 'follow your heart', 'seek wisdom'],
          correctAnswer: 1,
          explanation: 'This is from Proverbs 3:5, teaching us to trust God rather than our own wisdom.',
          verse: 'Proverbs 3:5'
        }
      ]
    }
  ];

  const generateQuestions = async () => {
    if (!settings.category || !user) {
      alert('Please select a category');
      return;
    }

    // Check if can generate
    const check = canGenerateAIQuestions(user.tenantId, settings.count);
    if (!check.allowed) {
      alert(check.reason || 'Cannot generate questions at this time');
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setGeneratedQuestions([]);

    // Create generation request
    const request = createAIGenerationRequest(user.tenantId, user.id, {
      count: settings.count,
      category: settings.category,
      difficulty: settings.difficulty,
      topics: settings.topic ? [settings.topic] : undefined,
      model: settings.model,
      temperature: 0.7
    });

    if ('error' in request) {
      alert(request.error);
      setIsGenerating(false);
      return;
    }

    // Simulate AI generation with progress
    const totalSteps = settings.count;
    const questions: Question[] = [];

    for (let i = 0; i < totalSteps; i++) {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Get template questions for the category
      const categoryTemplate = aiQuestionTemplates.find(t => t.category === settings.category);
      const templateQuestions = categoryTemplate?.questions || aiQuestionTemplates[0].questions;
      
      // Select a random template question
      const template = templateQuestions[Math.floor(Math.random() * templateQuestions.length)];
      
      // Create variations of the template
      const variations = [
        template,
        { ...template, text: template.text.replace(/\b\w+\b/, 'which') },
        { ...template, text: `In the Bible, ${template.text.toLowerCase()}` }
      ];
      
      const selectedTemplate = variations[Math.floor(Math.random() * variations.length)];
      
      const question: PendingQuestion = {
        id: `ai_q_${Date.now()}_${i}`,
        tenantId: user.tenantId,
        question: selectedTemplate.text,
        options: [...selectedTemplate.options].sort(() => Math.random() - 0.5), // Shuffle options
        correctAnswer: selectedTemplate.options.indexOf(selectedTemplate.options[selectedTemplate.correctAnswer]),
        category: settings.category,
        difficulty: settings.difficulty,
        points: settings.difficulty === 'easy' ? 10 : settings.difficulty === 'medium' ? 15 : 20,
        timeLimit: 30,
        
        // New lifecycle fields
        status: QuestionStatus.AI_PENDING_REVIEW,
        approvalStatus: QuestionApprovalStatus.PENDING,
        aiGeneratedAt: new Date().toISOString(),
        aiModel: settings.model,
        aiPrompt: settings.topic || 'General Bible questions',
        createdBy: user.id,
        usageCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Fix correct answer index after shuffling
      question.correctAnswer = question.options.indexOf(selectedTemplate.options[selectedTemplate.correctAnswer]);
      
      questions.push(question);
      setProgress(((i + 1) / totalSteps) * 100);
    }

    // Save questions as AI_PENDING_REVIEW
    const allQuestions = storage.get<Question[]>(STORAGE_KEYS.QUESTIONS) || [];
    allQuestions.push(...questions);
    storage.set(STORAGE_KEYS.QUESTIONS, allQuestions);

    setGeneratedQuestions(questions);
    setIsGenerating(false);
    
    // Reload config and pending questions
    const updatedConfig = getAIGenerationConfig(user.tenantId);
    setAiConfig(updatedConfig);
    loadPendingQuestions();
    
    // Switch to pending tab
    setActiveTab('pending');
    
    alert(`Generated ${questions.length} questions for review!`);
  };

  const saveSelectedQuestions = () => {
    if (selectedQuestions.length === 0) {
      alert('Please select at least one question to save');
      return;
    }

    const questionsToSave = generatedQuestions.filter(q => selectedQuestions.includes(q.id));
    const allQuestions = storage.get(STORAGE_KEYS.QUESTIONS) || [];
    
    allQuestions.push(...questionsToSave);
    storage.set(STORAGE_KEYS.QUESTIONS, allQuestions);

    alert(`${questionsToSave.length} questions saved successfully!`);
    setGeneratedQuestions([]);
    setSelectedQuestions([]);
  };

  // Open review dialog
  const openReviewDialog = (question: PendingQuestion) => {
    setReviewingQuestion(question);
    setEditedQuestion({ ...question });
    setDestination('pool');
    setRejectionReason('');
    setReviewDialogOpen(true);
  };

  // Approve question
  const handleApprove = () => {
    if (!editedQuestion || !user) return;
    
    // Update question in storage
    const allQuestions = storage.get<Question[]>(STORAGE_KEYS.QUESTIONS) || [];
    const index = allQuestions.findIndex(q => q.id === editedQuestion.id);
    
    if (index !== -1) {
      // Update with edited values
      allQuestions[index] = {
        ...editedQuestion,
        approvalStatus: QuestionApprovalStatus.APPROVED,
        approvedBy: user.id,
        approvedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Update status based on destination
      updateQuestionStatus(editedQuestion.id, 
        destination === 'pool' ? QuestionStatus.QUESTION_POOL : QuestionStatus.TOURNAMENT_RESERVED,
        {
          reason: `Approved and added to ${destination}`,
          userId: user.id
        }
      );
      
      storage.set(STORAGE_KEYS.QUESTIONS, allQuestions);
      
      // Reload pending questions
      loadPendingQuestions();
      setReviewDialogOpen(false);
      alert(`Question approved and added to ${destination}!`);
    }
  };

  // Reject question
  const handleReject = () => {
    if (!reviewingQuestion || !user || !rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    
    const allQuestions = storage.get<Question[]>(STORAGE_KEYS.QUESTIONS) || [];
    const index = allQuestions.findIndex(q => q.id === reviewingQuestion.id);
    
    if (index !== -1) {
      allQuestions[index] = {
        ...allQuestions[index],
        approvalStatus: QuestionApprovalStatus.REJECTED,
        reviewedBy: user.id,
        reviewedAt: new Date().toISOString(),
        rejectionReason: rejectionReason,
        updatedAt: new Date().toISOString()
      } as Question;
      
      storage.set(STORAGE_KEYS.QUESTIONS, allQuestions);
      
      loadPendingQuestions();
      setReviewDialogOpen(false);
      alert('Question rejected');
    }
  };

  // Mark for revision
  const handleNeedsRevision = () => {
    if (!reviewingQuestion || !user) return;
    
    const allQuestions = storage.get<Question[]>(STORAGE_KEYS.QUESTIONS) || [];
    const index = allQuestions.findIndex(q => q.id === reviewingQuestion.id);
    
    if (index !== -1) {
      allQuestions[index] = {
        ...allQuestions[index],
        approvalStatus: QuestionApprovalStatus.NEEDS_REVISION,
        reviewedBy: user.id,
        reviewedAt: new Date().toISOString(),
        revisionNotes: rejectionReason,
        updatedAt: new Date().toISOString()
      } as Question;
      
      storage.set(STORAGE_KEYS.QUESTIONS, allQuestions);
      
      loadPendingQuestions();
      setReviewDialogOpen(false);
      alert('Question marked for revision');
    }
  };

  const exportQuestions = () => {
    const questionsToExport = selectedQuestions.length > 0 
      ? generatedQuestions.filter(q => selectedQuestions.includes(q.id))
      : generatedQuestions;

    const dataStr = JSON.stringify(questionsToExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ai-generated-questions-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const toggleQuestionSelection = (questionId: string) => {
    setSelectedQuestions(prev => 
      prev.includes(questionId) 
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const selectAllQuestions = () => {
    setSelectedQuestions(generatedQuestions.map(q => q.id));
  };

  const clearSelection = () => {
    setSelectedQuestions([]);
  };

  // Allow super_admin, org_admin, and question_manager to use AI generator
  if (!user || (!hasPermission(user, 'questions.create') && user.role !== 'org_admin' && user.role !== 'super_admin' && user.role !== 'question_manager')) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-bold text-red-600 mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-4">You need admin privileges to use the AI Question Generator.</p>
            <Button onClick={onBack}>Back to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="h-8 w-8 text-yellow-500" />
                AI Question Generator
              </h1>
              <p className="text-gray-600">Generate Bible quiz questions using AI assistance</p>
            </div>
          </div>
          
          {/* AI Usage Banner */}
          {aiConfig && (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <div>
                  <strong>Plan Usage:</strong> {aiConfig.questionsUsedThisMonth} / {aiConfig.monthlyQuestionLimit === -1 ? '∞' : aiConfig.monthlyQuestionLimit} questions this month
                  {aiConfig.monthlyQuestionLimit !== -1 && (
                    <span className="text-sm text-gray-600 ml-2">
                      ({Math.round((aiConfig.questionsUsedThisMonth / aiConfig.monthlyQuestionLimit) * 100)}% used)
                    </span>
                  )}
                </div>
                <span className="text-sm text-gray-600">
                  Resets: {new Date(aiConfig.resetDate).toLocaleDateString()}
                </span>
              </AlertDescription>
            </Alert>
          )}
          
          {/* Pending Approvals Alert */}
          {pendingQuestions.length > 0 && (
            <Alert className="mb-4 border-yellow-500 bg-yellow-50">
              <Clock className="h-4 w-4 text-yellow-600" />
              <AlertDescription>
                <strong className="text-yellow-800">{pendingQuestions.length} questions</strong> awaiting your approval
                <Button 
                  variant="link" 
                  size="sm" 
                  className="ml-2 text-yellow-700 underline"
                  onClick={() => setActiveTab('pending')}
                >
                  Review Now →
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="generate">
              <Zap className="h-4 w-4 mr-2" />
              Generate
            </TabsTrigger>
            <TabsTrigger value="pending">
              <Clock className="h-4 w-4 mr-2" />
              Pending Approval ({pendingQuestions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings Panel */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  <span>Generation Settings</span>
                </CardTitle>
                <CardDescription>Configure AI question generation parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Category *</Label>
                  <Select value={settings.category} onValueChange={(value) => setSettings(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {BIBLE_CATEGORIES.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Difficulty</Label>
                  <Select value={settings.difficulty} onValueChange={(value) => setSettings(prev => ({ ...prev, difficulty: value as 'easy' | 'medium' | 'hard' }))}>
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

                <div>
                  <Label htmlFor="count">Number of Questions</Label>
                  <Input
                    id="count"
                    type="number"
                    min="1"
                    max="50"
                    value={settings.count}
                    onChange={(e) => setSettings(prev => ({ ...prev, count: parseInt(e.target.value) || 10 }))}
                  />
                </div>

                <div>
                  <Label htmlFor="topic">Specific Topic (Optional)</Label>
                  <Input
                    id="topic"
                    value={settings.topic}
                    onChange={(e) => setSettings(prev => ({ ...prev, topic: e.target.value }))}
                    placeholder="e.g., Creation, Miracles, Parables"
                  />
                </div>

                <div>
                  <Label>AI Model</Label>
                  <Select value={settings.model} onValueChange={(value) => setSettings(prev => ({ ...prev, model: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {aiConfig && aiConfig.enabledModels.map((model: string) => (
                        <SelectItem key={model} value={model}>
                          {model === 'gpt-4' ? 'GPT-4 (Best Quality)' :
                           model === 'gpt-3.5-turbo' ? 'GPT-3.5 Turbo (Fast)' :
                           model === 'claude-3' ? 'Claude 3' :
                           model === 'claude-3-opus' ? 'Claude 3 Opus (Premium)' : model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="include-verses"
                      checked={settings.includeVerses}
                      onChange={(e) => setSettings(prev => ({ ...prev, includeVerses: e.target.checked }))}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="include-verses">Include Bible verse references</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="include-explanations"
                      checked={settings.includeExplanations}
                      onChange={(e) => setSettings(prev => ({ ...prev, includeExplanations: e.target.checked }))}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="include-explanations">Include answer explanations</Label>
                  </div>
                </div>

                <Button 
                  onClick={generateQuestions} 
                  disabled={isGenerating || !settings.category}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Generate Questions
                    </>
                  )}
                </Button>

                {isGenerating && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Generated Questions */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Generated Questions</CardTitle>
                    <CardDescription>
                      {generatedQuestions.length > 0 && `${generatedQuestions.length} questions generated`}
                    </CardDescription>
                  </div>
                  
                  {generatedQuestions.length > 0 && (
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={selectAllQuestions}>
                        Select All
                      </Button>
                      <Button variant="outline" size="sm" onClick={clearSelection}>
                        Clear
                      </Button>
                      <Button variant="outline" size="sm" onClick={exportQuestions}>
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                      <Button size="sm" onClick={saveSelectedQuestions}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Save Selected
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {generatedQuestions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Zap className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No questions generated yet. Configure settings and click "Generate Questions" to start.</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {generatedQuestions.map((question, index) => (
                      <div 
                        key={question.id} 
                        className={`p-4 border rounded-lg ${
                          selectedQuestions.includes(question.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <input
                            type="checkbox"
                            checked={selectedQuestions.includes(question.id)}
                            onChange={() => toggleQuestionSelection(question.id)}
                            className="w-4 h-4 mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <Badge variant="outline">Question {index + 1}</Badge>
                              <div className="flex space-x-2">
                                <Badge variant={question.difficulty === 'easy' ? 'secondary' : question.difficulty === 'medium' ? 'default' : 'destructive'}>
                                  {question.difficulty}
                                </Badge>
                                <Badge variant="outline">{question.category}</Badge>
                              </div>
                            </div>
                            
                            <h4 className="font-medium mb-2">{question.text}</h4>
                            
                            <div className="grid grid-cols-2 gap-2 mb-2">
                              {question.options.map((option, optionIndex) => (
                                <div 
                                  key={optionIndex}
                                  className={`p-2 text-sm rounded ${
                                    optionIndex === question.correctAnswer 
                                      ? 'bg-green-100 text-green-800 font-medium' 
                                      : 'bg-gray-100'
                                  }`}
                                >
                                  {String.fromCharCode(65 + optionIndex)}. {option}
                                </div>
                              ))}
                            </div>
                            
                            {question.explanation && (
                              <p className="text-sm text-gray-600 mb-1">
                                <strong>Explanation:</strong> {question.explanation}
                              </p>
                            )}
                            
                            {question.verse && (
                              <p className="text-sm text-blue-600">
                                <strong>Reference:</strong> {question.verse}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
          </TabsContent>

          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Pending Approval</CardTitle>
                <CardDescription>
                  Review and approve AI-generated questions before adding them to your question bank
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingQuestions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No questions pending approval</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingQuestions.map((question, index) => (
                      <div key={question.id} className="p-4 border rounded-lg bg-yellow-50 border-yellow-200">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                              AI_PENDING_REVIEW
                            </Badge>
                            <Badge variant={question.difficulty === 'easy' ? 'secondary' : question.difficulty === 'medium' ? 'default' : 'destructive'}>
                              {question.difficulty}
                            </Badge>
                            <Badge variant="outline">{question.category}</Badge>
                          </div>
                          <span className="text-xs text-gray-500">
                            Generated {new Date(question.aiGeneratedAt).toRelativeTimeString ? 
                              new Date(question.aiGeneratedAt).toLocaleString() : 
                              new Date(question.aiGeneratedAt).toLocaleString()}
                          </span>
                        </div>
                        
                        <h4 className="font-medium mb-3">{question.question}</h4>
                        
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          {question.options.map((option, optionIndex) => (
                            <div 
                              key={optionIndex}
                              className={`p-2 text-sm rounded ${
                                optionIndex === question.correctAnswer 
                                  ? 'bg-green-100 text-green-800 font-medium border-2 border-green-400' 
                                  : 'bg-white border'
                              }`}
                            >
                              {String.fromCharCode(65 + optionIndex)}. {option}
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex items-center justify-between pt-3 border-t">
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Model:</span> {question.aiModel}
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => openReviewDialog(question)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Review
                            </Button>
                            <Button 
                              variant="default" 
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => {
                                openReviewDialog(question);
                              }}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Review Dialog */}
        <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Review AI-Generated Question</DialogTitle>
              <DialogDescription>
                Edit the question if needed, then approve or reject it
              </DialogDescription>
            </DialogHeader>
            
            {editedQuestion && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-question">Question Text *</Label>
                  <Textarea
                    id="edit-question"
                    value={editedQuestion.question}
                    onChange={(e) => setEditedQuestion({ ...editedQuestion, question: e.target.value })}
                    rows={3}
                    className="mt-1"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Options</Label>
                  {editedQuestion.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="w-6 text-sm font-medium">{String.fromCharCode(65 + index)}.</span>
                      <Input
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...editedQuestion.options];
                          newOptions[index] = e.target.value;
                          setEditedQuestion({ ...editedQuestion, options: newOptions });
                        }}
                        className={index === editedQuestion.correctAnswer ? 'border-green-500 border-2' : ''}
                      />
                      <input
                        type="radio"
                        checked={editedQuestion.correctAnswer === index}
                        onChange={() => setEditedQuestion({ ...editedQuestion, correctAnswer: index })}
                        className="w-5 h-5"
                      />
                    </div>
                  ))}
                  <p className="text-xs text-gray-500">Select the correct answer using the radio button</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Category</Label>
                    <Select 
                      value={editedQuestion.category} 
                      onValueChange={(value) => setEditedQuestion({ ...editedQuestion, category: value })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {BIBLE_CATEGORIES.map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Difficulty</Label>
                    <Select 
                      value={editedQuestion.difficulty} 
                      onValueChange={(value) => setEditedQuestion({ ...editedQuestion, difficulty: value as 'easy' | 'medium' | 'hard' })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label>Add to:</Label>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={destination === 'pool'}
                        onChange={() => setDestination('pool')}
                        className="w-4 h-4"
                      />
                      <span>Question Pool (for practice)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={destination === 'tournament'}
                        onChange={() => setDestination('tournament')}
                        className="w-4 h-4"
                      />
                      <span>Upcoming Tournament</span>
                    </label>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="rejection-reason">Notes / Rejection Reason</Label>
                  <Textarea
                    id="rejection-reason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                    placeholder="Optional: Add notes or reason for rejection/revision"
                    className="mt-1"
                  />
                </div>
              </div>
            )}
            
            <DialogFooter className="flex gap-2">
              <Button 
                variant="destructive" 
                onClick={handleReject}
                disabled={!rejectionReason.trim()}
              >
                <X className="h-4 w-4 mr-1" />
                Reject
              </Button>
              <Button 
                variant="outline" 
                onClick={handleNeedsRevision}
              >
                <Edit className="h-4 w-4 mr-1" />
                Needs Revision
              </Button>
              <Button 
                variant="default"
                onClick={handleApprove}
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="h-4 w-4 mr-1" />
                Approve & Add to {destination === 'pool' ? 'Pool' : 'Tournament'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};