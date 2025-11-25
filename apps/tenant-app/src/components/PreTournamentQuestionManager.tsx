import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft, Plus, Trash2, Copy, Shuffle, Lock, Unlock, 
  AlertCircle, CheckCircle2, Info, TrendingUp 
} from 'lucide-react';
import { useAuth } from '@/components/AuthSystem';
import {
  Question,
  PreTournamentQuestion,
  Tournament,
  QuestionStatus,
  storage,
  STORAGE_KEYS,
  copyQuestionToPreTournament,
  getPreTournamentQuestions,
  deletePreTournamentQuestion,
  releasePreTournamentQuestions,
  getPreTournamentQuestionStats
} from '@/lib/mockData';

interface PreTournamentQuestionManagerProps {
  tournamentId: string;
  onBack: () => void;
}

export const PreTournamentQuestionManager: React.FC<PreTournamentQuestionManagerProps> = ({ 
  tournamentId, 
  onBack 
}) => {
  const { user } = useAuth();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [mainBankQuestions, setMainBankQuestions] = useState<Question[]>([]);
  const [preTournamentQuestions, setPreTournamentQuestions] = useState<PreTournamentQuestion[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('add');
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, [tournamentId, user]);

  const loadData = () => {
    // Load tournament
    const tournaments = storage.get(STORAGE_KEYS.TOURNAMENTS) || [];
    const t = tournaments.find((t: Tournament) => t.id === tournamentId);
    setTournament(t || null);

    // Load main bank questions
    const allQuestions = storage.get(STORAGE_KEYS.QUESTIONS) || [];
    const tenantQuestions = allQuestions.filter((q: Question) => 
      q.tenantId === user?.tenantId && q.status !== QuestionStatus.ARCHIVED
    );
    setMainBankQuestions(tenantQuestions);

    // Load pre-tournament questions
    const ptQuestions = getPreTournamentQuestions(tournamentId, false);
    setPreTournamentQuestions(ptQuestions);

    // Load statistics
    const statistics = getPreTournamentQuestionStats(tournamentId);
    setStats(statistics);
  };

  const handleCopyQuestion = async (questionId: string, createVariation: boolean, intensity: 'low' | 'medium' | 'high' = 'medium') => {
    if (!user) return;

    const result = copyQuestionToPreTournament(
      questionId,
      tournamentId,
      user.id,
      createVariation,
      intensity
    );

    if (result.success) {
      setMessage({ type: 'success', text: result.message || 'Question added successfully' });
      loadData();
    } else {
      setMessage({ type: 'error', text: result.message || 'Failed to add question' });
    }

    setTimeout(() => setMessage(null), 5000);
  };

  const handleDeleteQuestion = (questionId: string) => {
    const result = deletePreTournamentQuestion(questionId, tournamentId);

    if (result.success) {
      setMessage({ type: 'success', text: result.message || 'Question deleted' });
      loadData();
    } else {
      setMessage({ type: 'error', text: result.message || 'Failed to delete question' });
    }

    setTimeout(() => setMessage(null), 5000);
  };

  const handleReleaseQuestions = () => {
    if (!user) return;

    const result = releasePreTournamentQuestions(tournamentId, user.id);

    if (result.success) {
      setMessage({ 
        type: 'success', 
        text: `${result.releasedCount} questions released to main bank` 
      });
      loadData();
    } else {
      setMessage({ type: 'error', text: result.message || 'Failed to release questions' });
    }

    setTimeout(() => setMessage(null), 5000);
  };

  const getFilteredMainQuestions = () => {
    let filtered = mainBankQuestions;

    if (searchTerm) {
      filtered = filtered.filter(q => 
        q.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(q => q.category === selectedCategory);
    }

    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(q => q.difficulty === selectedDifficulty);
    }

    return filtered;
  };

  const getCategories = () => {
    const categories = new Set(mainBankQuestions.map(q => q.category));
    return Array.from(categories);
  };

  const isAlreadyInPool = (questionId: string) => {
    return preTournamentQuestions.some(
      ptq => ptq.sourceQuestionId === questionId && !ptq.isVariation
    );
  };

  const getRequiredPoolSize = () => {
    if (!tournament?.qualificationConfig?.quizSettings) return 0;
    const { questionsCount, maxRetakes } = tournament.qualificationConfig.quizSettings;
    return questionsCount * maxRetakes;
  };

  const poolSizeStatus = () => {
    const required = getRequiredPoolSize();
    const current = stats?.totalQuestions || 0;
    
    if (current >= required) {
      return { status: 'sufficient', color: 'text-green-600', bg: 'bg-green-50' };
    } else if (current >= required * 0.5) {
      return { status: 'partial', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    } else {
      return { status: 'insufficient', color: 'text-red-600', bg: 'bg-red-50' };
    }
  };

  if (!tournament) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Tournament not found</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Pre-Tournament Questions</h1>
              <p className="text-gray-600">{tournament.name}</p>
            </div>
          </div>
          
          {tournament.status === 'active' && (
            <Button onClick={handleReleaseQuestions} variant="outline">
              <Unlock className="h-4 w-4 mr-2" />
              Release Questions to Main Bank
            </Button>
          )}
        </div>

        {/* Message Alert */}
        {message && (
          <Alert className={
            message.type === 'success' ? 'bg-green-50 border-green-200' :
            message.type === 'error' ? 'bg-red-50 border-red-200' :
            'bg-blue-50 border-blue-200'
          }>
            {message.type === 'success' ? <CheckCircle2 className="h-4 w-4 text-green-600" /> :
             message.type === 'error' ? <AlertCircle className="h-4 w-4 text-red-600" /> :
             <Info className="h-4 w-4 text-blue-600" />}
            <AlertDescription className={
              message.type === 'success' ? 'text-green-800' :
              message.type === 'error' ? 'text-red-800' :
              'text-blue-800'
            }>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Questions</p>
                  <p className="text-2xl font-bold">{stats?.totalQuestions || 0}</p>
                </div>
                <Lock className="h-8 w-8 text-blue-500" />
              </div>
              <div className="mt-2">
                <p className="text-xs text-gray-500">
                  Required: {getRequiredPoolSize()}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Variations</p>
                  <p className="text-2xl font-bold">{stats?.variations || 0}</p>
                </div>
                <Shuffle className="h-8 w-8 text-purple-500" />
              </div>
              <div className="mt-2">
                <p className="text-xs text-gray-500">
                  Twisted questions
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Direct Copies</p>
                  <p className="text-2xl font-bold">{stats?.directCopies || 0}</p>
                </div>
                <Copy className="h-8 w-8 text-green-500" />
              </div>
              <div className="mt-2">
                <p className="text-xs text-gray-500">
                  From main bank
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Available</p>
                  <p className="text-2xl font-bold">{stats?.questionsAvailable || 0}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-500" />
              </div>
              <div className="mt-2">
                <p className="text-xs text-gray-500">
                  Unused questions
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pool Size Status */}
        <Alert className={poolSizeStatus().bg}>
          <Info className={`h-4 w-4 ${poolSizeStatus().color}`} />
          <AlertDescription className={poolSizeStatus().color}>
            {poolSizeStatus().status === 'sufficient' && 
              `✓ Pool size is sufficient (${stats?.totalQuestions}/${getRequiredPoolSize()} questions)`}
            {poolSizeStatus().status === 'partial' && 
              `⚠ Pool size is partial (${stats?.totalQuestions}/${getRequiredPoolSize()} questions). Add more questions or create variations.`}
            {poolSizeStatus().status === 'insufficient' && 
              `✗ Pool size is insufficient (${stats?.totalQuestions}/${getRequiredPoolSize()} questions). You need ${getRequiredPoolSize() - (stats?.totalQuestions || 0)} more questions.`}
          </AlertDescription>
        </Alert>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="add">Add from Main Bank</TabsTrigger>
            <TabsTrigger value="manage">Manage Pool ({preTournamentQuestions.length})</TabsTrigger>
          </TabsList>

          {/* Add Questions Tab */}
          <TabsContent value="add" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Copy Questions from Main Bank</CardTitle>
                <CardDescription>
                  Select questions to add to the isolated pre-tournament pool. You can copy directly or create twisted variations.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Search</Label>
                    <Input
                      placeholder="Search questions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {getCategories().map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Difficulty</Label>
                    <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
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

                {/* Question List */}
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {getFilteredMainQuestions().map((question) => (
                    <Card key={question.id} className="relative">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">{question.category}</Badge>
                              <Badge variant={
                                question.difficulty === 'easy' ? 'secondary' :
                                question.difficulty === 'medium' ? 'default' : 'destructive'
                              }>
                                {question.difficulty}
                              </Badge>
                              {isAlreadyInPool(question.id) && (
                                <Badge variant="outline" className="bg-green-50 text-green-700">
                                  ✓ In Pool
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm font-medium mb-1">{question.text}</p>
                            <div className="text-xs text-gray-500">
                              {question.options.map((opt, idx) => (
                                <span key={idx} className={idx === question.correctAnswer ? 'text-green-600 font-medium' : ''}>
                                  {opt}{idx < question.options.length - 1 ? ' • ' : ''}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCopyQuestion(question.id, false)}
                              disabled={isAlreadyInPool(question.id)}
                            >
                              <Copy className="h-4 w-4 mr-1" />
                              Copy
                            </Button>
                            <Select 
                              onValueChange={(intensity) => 
                                handleCopyQuestion(question.id, true, intensity as any)
                              }
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue placeholder="Twist" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Low Twist</SelectItem>
                                <SelectItem value="medium">Medium Twist</SelectItem>
                                <SelectItem value="high">High Twist</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {getFilteredMainQuestions().length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No questions found matching your filters
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Manage Pool Tab */}
          <TabsContent value="manage" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pre-Tournament Question Pool</CardTitle>
                <CardDescription>
                  These questions are isolated and will only be used for this tournament's qualification quiz.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {preTournamentQuestions.map((question) => (
                    <Card key={question.id} className="relative">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">{question.category}</Badge>
                              <Badge variant={
                                question.difficulty === 'easy' ? 'secondary' :
                                question.difficulty === 'medium' ? 'default' : 'destructive'
                              }>
                                {question.difficulty}
                              </Badge>
                              {question.isVariation && (
                                <Badge className="bg-purple-100 text-purple-700">
                                  <Shuffle className="h-3 w-3 mr-1" />
                                  Twisted
                                </Badge>
                              )}
                              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                <Lock className="h-3 w-3 mr-1" />
                                {question.status}
                              </Badge>
                            </div>
                            <p className="text-sm font-medium mb-1">{question.text}</p>
                            <div className="text-xs text-gray-500 mb-2">
                              {question.options.map((opt, idx) => (
                                <span key={idx} className={idx === question.correctAnswer ? 'text-green-600 font-medium' : ''}>
                                  {opt}{idx < question.options.length - 1 ? ' • ' : ''}
                                </span>
                              ))}
                            </div>
                            <div className="text-xs text-gray-400">
                              Used by {question.usedByUsers.length} user(s)
                            </div>
                          </div>
                          
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteQuestion(question.id)}
                            disabled={question.usedByUsers.length > 0}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {preTournamentQuestions.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No questions in pool yet. Add questions from the main bank.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PreTournamentQuestionManager;
