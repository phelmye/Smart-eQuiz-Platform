import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Clock, Trophy, Star, RotateCcw, CheckCircle, XCircle, Zap, BookOpen } from 'lucide-react';
import { useAuth } from './AuthSystem';
import { apiClient } from '@/lib/apiClient';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/hooks/use-toast';
import { canAccessPracticeMode } from '@/lib/mockData';

interface PracticeModeProps {
  onBack: () => void;
}

interface PracticeQuestion {
  id: string;
  prompt: string;
  correctOption: string;
  options: string[];
  difficulty: string;
  points: number;
  timeLimit: number;
}

interface PracticeProgress {
  id: string;
  currentLevel: number;
  totalXp: number;
  currentStreak: number;
  longestStreak: number;
  totalQuestionsAnswered: number;
}

interface PracticeSession {
  progress: PracticeProgress;
  questions: PracticeQuestion[];
  currentQuestionIndex: number;
  selectedAnswer: string | null;
  showResult: boolean;
  isCorrect: boolean | null;
  xpEarned: number;
  timeLeft: number;
  startTime: number;
}

interface PracticeStats {
  currentLevel: number;
  totalXp: number;
  currentStreak: number;
  longestStreak: number;
  totalQuestionsAnswered: number;
  correctAnswers: number;
  accuracy: number;
}

export const PracticeMode: React.FC<PracticeModeProps> = ({ onBack }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [stats, setStats] = useState<PracticeStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [session, setSession] = useState<PracticeSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    loadCategories();
    loadStats();
    loadLeaderboard();
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (session && session.timeLeft > 0 && !session.showResult) {
      timer = setTimeout(() => {
        setSession(prev => prev ? { ...prev, timeLeft: prev.timeLeft - 1 } : null);
      }, 1000);
    } else if (session && session.timeLeft === 0 && !session.showResult) {
      handleTimeUp();
    }
    return () => clearTimeout(timer);
  }, [session?.timeLeft]);

  const loadCategories = async () => {
    try {
      const data = await apiClient.getCategories();
      setCategories(data);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load categories',
      });
    }
  };

  const loadStats = async () => {
    try {
      const data = await apiClient.getPracticeStats();
      setStats(data);
    } catch (error: any) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadLeaderboard = async () => {
    try {
      const data = await apiClient.getPracticeLeaderboard();
      setLeaderboard(data);
    } catch (error: any) {
      console.error('Failed to load leaderboard:', error);
    }
  };

  const startPractice = async () => {
    setIsStarting(true);
    try {
      const data = await apiClient.startPractice(selectedCategory || undefined);
      
      if (data.questions.length === 0) {
        toast({
          variant: 'destructive',
          title: 'No Questions',
          description: 'No questions available for this category',
        });
        return;
      }

      setSession({
        progress: data.progress,
        questions: data.questions,
        currentQuestionIndex: 0,
        selectedAnswer: null,
        showResult: false,
        isCorrect: null,
        xpEarned: 0,
        timeLeft: data.questions[0].timeLimit,
        startTime: Date.now(),
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to start practice',
      });
    } finally {
      setIsStarting(false);
    }
  };

  const handleAnswerSelect = (option: string) => {
    if (session && !session.showResult) {
      setSession(prev => prev ? { ...prev, selectedAnswer: option } : null);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!session || !session.selectedAnswer) return;

    setIsLoading(true);
    const currentQuestion = session.questions[session.currentQuestionIndex];
    const isCorrect = session.selectedAnswer === currentQuestion.correctOption;
    const timeSpent = currentQuestion.timeLimit - session.timeLeft;

    try {
      const result = await apiClient.answerPracticeQuestion(session.progress.id, {
        questionId: currentQuestion.id,
        selectedOption: session.selectedAnswer,
        isCorrect,
        timeSpent,
      });

      setSession(prev => prev ? {
        ...prev,
        showResult: true,
        isCorrect: result.correct,
        xpEarned: result.xpEarned,
        progress: result.progress,
      } : null);

      if (result.leveledUp) {
        toast({
          title: '🎉 Level Up!',
          description: `You reached level ${result.progress.currentLevel}!`,
        });
      }

      // Refresh stats
      await loadStats();

      // Auto advance after 2.5 seconds
      setTimeout(() => {
        if (session.currentQuestionIndex < session.questions.length - 1) {
          const nextQuestion = session.questions[session.currentQuestionIndex + 1];
          setSession(prev => prev ? {
            ...prev,
            currentQuestionIndex: prev.currentQuestionIndex + 1,
            selectedAnswer: null,
            showResult: false,
            isCorrect: null,
            xpEarned: 0,
            timeLeft: nextQuestion.timeLimit,
          } : null);
        } else {
          completeSession();
        }
      }, 2500);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to submit answer',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTimeUp = async () => {
    if (!session) return;

    const currentQuestion = session.questions[session.currentQuestionIndex];

    try {
      const result = await apiClient.answerPracticeQuestion(session.progress.id, {
        questionId: currentQuestion.id,
        selectedOption: '',
        isCorrect: false,
        timeSpent: currentQuestion.timeLimit,
      });

      setSession(prev => prev ? {
        ...prev,
        showResult: true,
        isCorrect: false,
        xpEarned: 0,
        progress: result.progress,
      } : null);

      await loadStats();

      setTimeout(() => {
        if (session.currentQuestionIndex < session.questions.length - 1) {
          const nextQuestion = session.questions[session.currentQuestionIndex + 1];
          setSession(prev => prev ? {
            ...prev,
            currentQuestionIndex: prev.currentQuestionIndex + 1,
            selectedAnswer: null,
            showResult: false,
            isCorrect: null,
            xpEarned: 0,
            timeLeft: nextQuestion.timeLimit,
          } : null);
        } else {
          completeSession();
        }
      }, 2500);
    } catch (error: any) {
      console.error('Failed to submit time-up answer:', error);
    }
  };

  const completeSession = () => {
    setSession(null);
    loadStats();
    loadLeaderboard();
    toast({
      title: 'Practice Complete!',
      description: 'Great job! Check your updated stats below.',
    });
  };

  const resetPractice = () => {
    setSession(null);
  };

  // Check if user has practice access
  if (!user || !canAccessPracticeMode(user)) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Practice Access Required</h2>
            <p className="text-gray-600 mb-4">
              You need practice access to use this feature and improve your Bible quiz skills.
            </p>
            
            {user?.practiceAccessStatus === 'none' && (
              <>
                <p className="text-sm text-gray-500 mb-6">
                  Apply for practice access to unlock training materials, practice quizzes, and prepare for tournaments.
                </p>
                <div className="flex gap-3 justify-center">
                  <Button onClick={onBack} variant="outline">Back to Dashboard</Button>
                  <Button onClick={() => window.location.hash = '#practice-access'} className="bg-green-600 hover:bg-green-700">
                    Apply for Practice Access
                  </Button>
                </div>
              </>
            )}
            
            {user?.practiceAccessStatus === 'pending' && (
              <>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-center gap-2 text-yellow-800 font-medium mb-2">
                    <Clock className="h-5 w-5" />
                    Application Under Review
                  </div>
                  <p className="text-sm text-yellow-700">
                    Your practice access application is being reviewed by administrators. You'll be notified within 24-48 hours.
                  </p>
                </div>
                <Button onClick={onBack}>Back to Dashboard</Button>
              </>
            )}
            
            {user?.practiceAccessStatus === 'rejected' && (
              <>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-center gap-2 text-red-800 font-medium mb-2">
                    <XCircle className="h-5 w-5" />
                    Application Rejected
                  </div>
                  <p className="text-sm text-red-700 mb-2">
                    Your previous application was not approved.
                  </p>
                  <p className="text-sm text-red-600">
                    Please contact an administrator for more information or to reapply.
                  </p>
                </div>
                <div className="flex gap-3 justify-center">
                  <Button onClick={onBack} variant="outline">Back to Dashboard</Button>
                  <Button onClick={() => window.location.hash = '#practice-access'}>
                    Reapply for Access
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center space-x-4 mb-4">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Practice Mode</h1>
                <p className="text-gray-600">Test your Bible knowledge and level up!</p>
              </div>
            </div>
          </div>

          {/* Stats Dashboard */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold">Level {stats.currentLevel}</div>
                    <div className="text-sm text-gray-500">{stats.totalXp} Total XP</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Zap className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{stats.currentStreak}</div>
                    <div className="text-sm text-gray-500">Current Streak</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Star className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{stats.longestStreak}</div>
                    <div className="text-sm text-gray-500">Best Streak</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{stats.accuracy}%</div>
                    <div className="text-sm text-gray-500">Accuracy</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Start Practice Card */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  <span>Start Practice Session</span>
                </CardTitle>
                <CardDescription>
                  Practice with 10 random questions to improve your skills
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Category (Optional)</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Categories</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.icon} {category.name} ({category._count?.questions || 0})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">📝 How Practice Works</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Answer 10 random questions</li>
                    <li>• Earn XP based on speed and accuracy</li>
                    <li>• Build your streak with correct answers</li>
                    <li>• Level up every 100 XP!</li>
                  </ul>
                </div>

                <Button 
                  onClick={startPractice} 
                  className="w-full" 
                  size="lg"
                  disabled={isStarting}
                >
                  {isStarting ? 'Starting...' : 'Start Practice Session'}
                </Button>
              </CardContent>
            </Card>

            {/* Leaderboard Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  <span>Top Players</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {leaderboard.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No players yet</p>
                ) : (
                  <div className="space-y-3">
                    {leaderboard.map((player, index) => (
                      <div key={player.userId} className="flex items-center space-x-3">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === 0 ? 'bg-yellow-500 text-white' :
                          index === 1 ? 'bg-gray-400 text-white' :
                          index === 2 ? 'bg-orange-600 text-white' :
                          'bg-gray-200'
                        }`}>
                          {player.rank}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{player.username}</div>
                          <div className="text-xs text-gray-500">Level {player.level}</div>
                        </div>
                        <div className="text-sm font-medium text-blue-600">
                          {player.totalXp} XP
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Active practice session - show current question
  const currentQuestion = session.questions[session.currentQuestionIndex];
  const progress = ((session.currentQuestionIndex + 1) / session.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => resetPractice()}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Practice Session</h1>
                <p className="text-gray-600">Question {session.currentQuestionIndex + 1} of {session.questions.length}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-blue-600">
                <Clock className="h-4 w-4" />
                <span className={`font-mono text-lg ${session.timeLeft <= 5 ? 'text-red-600 animate-pulse' : ''}`}>
                  {session.timeLeft}s
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-orange-500" />
                <span className="font-medium">Level {session.progress.currentLevel}</span>
              </div>
              <Badge variant="outline">
                Streak: {session.progress.currentStreak}
              </Badge>
            </div>
          </div>

          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge variant={
                currentQuestion.difficulty === 'EASY' ? 'secondary' :
                currentQuestion.difficulty === 'MEDIUM' ? 'default' : 'destructive'
              }>
                {currentQuestion.difficulty}
              </Badge>
              <Badge variant="outline">
                {currentQuestion.points} points
              </Badge>
            </div>
            <CardTitle className="text-xl leading-relaxed mt-4">
              {currentQuestion.prompt}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => {
                const isSelected = session.selectedAnswer === option;
                const isCorrect = option === currentQuestion.correctOption;
                const showCorrect = session.showResult && isCorrect;
                const showWrong = session.showResult && isSelected && !isCorrect;

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(option)}
                    disabled={session.showResult || isLoading}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                      showCorrect
                        ? 'border-green-500 bg-green-50 text-green-800'
                        : showWrong
                        ? 'border-red-500 bg-red-50 text-red-800'
                        : isSelected
                        ? 'border-blue-500 bg-blue-50 text-blue-800'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                    } ${session.showResult ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                        showCorrect
                          ? 'border-green-500 bg-green-500 text-white'
                          : showWrong
                          ? 'border-red-500 bg-red-500 text-white'
                          : isSelected
                          ? 'border-blue-500 bg-blue-500 text-white'
                          : 'border-gray-300'
                      }`}>
                        {showCorrect ? '✓' : showWrong ? '✗' : String.fromCharCode(65 + index)}
                      </div>
                      <span className="flex-1">{option}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {session.showResult && (
              <div className={`mt-6 p-4 rounded-lg ${
                session.isCorrect ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'
              }`}>
                <div className="flex items-start space-x-3">
                  {session.isCorrect ? (
                    <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
                  )}
                  <div className="flex-1">
                    <h4 className={`font-bold mb-1 ${session.isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                      {session.isCorrect ? '🎉 Correct!' : '❌ Incorrect'}
                    </h4>
                    <p className={`text-sm mb-2 ${session.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                      {session.isCorrect 
                        ? `Great job! You earned ${session.xpEarned} XP` 
                        : `The correct answer was: ${currentQuestion.correctOption}`
                      }
                    </p>
                    {session.progress.currentStreak > 0 && (
                      <p className="text-sm font-medium text-orange-600">
                        🔥 {session.progress.currentStreak} question streak!
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {!session.showResult && (
              <Button 
                onClick={handleSubmitAnswer}
                disabled={!session.selectedAnswer || isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? 'Submitting...' : 'Submit Answer'}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};