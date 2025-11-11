import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Clock, Trophy, Star, RotateCcw, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from './AuthSystem';
import { storage, STORAGE_KEYS, Question, BIBLE_CATEGORIES, User } from '@/lib/mockData';

interface PracticeModeProps {
  onBack: () => void;
}

interface PracticeSession {
  questions: Question[];
  currentQuestionIndex: number;
  answers: number[];
  score: number;
  timeLeft: number;
  isCompleted: boolean;
  startTime: number;
}

export const PracticeMode: React.FC<PracticeModeProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [questionCount, setQuestionCount] = useState(10);
  const [session, setSession] = useState<PracticeSession | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [timePerQuestion] = useState(30); // 30 seconds per question

  useEffect(() => {
    loadQuestions();
  }, [user]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (session && !session.isCompleted && session.timeLeft > 0) {
      timer = setTimeout(() => {
        setSession(prev => prev ? { ...prev, timeLeft: prev.timeLeft - 1 } : null);
      }, 1000);
    } else if (session && session.timeLeft === 0 && !session.isCompleted) {
      handleTimeUp();
    }
    return () => clearTimeout(timer);
  }, [session?.timeLeft]);

  const loadQuestions = () => {
    const savedQuestions = storage.get(STORAGE_KEYS.QUESTIONS) || [];
    const tenantQuestions = savedQuestions.filter((q: Question) => 
      user?.role === 'super_admin' || q.tenantId === user?.tenantId
    );
    setAvailableQuestions(tenantQuestions);
  };

  const getFilteredQuestions = () => {
    let filtered = availableQuestions;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(q => q.category === selectedCategory);
    }

    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(q => q.difficulty === selectedDifficulty);
    }

    return filtered;
  };

  const startPractice = () => {
    const filtered = getFilteredQuestions();
    if (filtered.length === 0) {
      alert('No questions available for the selected criteria');
      return;
    }

    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    const practiceQuestions = shuffled.slice(0, Math.min(questionCount, shuffled.length));

    setSession({
      questions: practiceQuestions,
      currentQuestionIndex: 0,
      answers: new Array(practiceQuestions.length).fill(-1),
      score: 0,
      timeLeft: timePerQuestion,
      isCompleted: false,
      startTime: Date.now()
    });
    setSelectedAnswer(null);
    setShowResult(false);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = () => {
    if (!session || selectedAnswer === null) return;

    const currentQuestion = session.questions[session.currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    
    const newAnswers = [...session.answers];
    newAnswers[session.currentQuestionIndex] = selectedAnswer;
    
    const newScore = session.score + (isCorrect ? 1 : 0);

    setSession(prev => prev ? {
      ...prev,
      answers: newAnswers,
      score: newScore
    } : null);

    setShowResult(true);

    // Auto advance after 2 seconds
    setTimeout(() => {
      if (session.currentQuestionIndex < session.questions.length - 1) {
        setSession(prev => prev ? {
          ...prev,
          currentQuestionIndex: prev.currentQuestionIndex + 1,
          timeLeft: timePerQuestion
        } : null);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        completeSession(newScore);
      }
    }, 2000);
  };

  const handleTimeUp = () => {
    if (!session) return;

    const newAnswers = [...session.answers];
    newAnswers[session.currentQuestionIndex] = -1; // -1 indicates no answer

    setSession(prev => prev ? {
      ...prev,
      answers: newAnswers
    } : null);

    setShowResult(true);

    setTimeout(() => {
      if (session.currentQuestionIndex < session.questions.length - 1) {
        setSession(prev => prev ? {
          ...prev,
          currentQuestionIndex: prev.currentQuestionIndex + 1,
          timeLeft: timePerQuestion
        } : null);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        completeSession(session.score);
      }
    }, 2000);
  };

  const completeSession = (finalScore: number) => {
    if (!session || !user) return;

    const totalQuestions = session.questions.length;
    const percentage = Math.round((finalScore / totalQuestions) * 100);
    const timeTaken = Math.round((Date.now() - session.startTime) / 1000);
    
    // Calculate XP earned (base 10 XP per correct answer, bonus for perfect score)
    const baseXP = finalScore * 10;
    const perfectBonus = percentage === 100 ? 50 : 0;
    const speedBonus = timeTaken < (totalQuestions * timePerQuestion * 0.5) ? 25 : 0;
    const totalXP = baseXP + perfectBonus + speedBonus;

    // Update user XP
    const users = storage.get(STORAGE_KEYS.USERS) || [];
    const updatedUsers = users.map((u: User) => 
      u.id === user.id ? { ...u, xp: u.xp + totalXP } : u
    );
    storage.set(STORAGE_KEYS.USERS, updatedUsers);

    setSession(prev => prev ? { ...prev, isCompleted: true } : null);
  };

  const resetPractice = () => {
    setSession(null);
    setSelectedAnswer(null);
    setShowResult(false);
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center space-x-4 mb-4">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Practice Mode</h1>
                <p className="text-gray-600">Test your Bible knowledge with practice questions</p>
              </div>
            </div>
          </div>

          {/* Setup Card */}
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <span>Start Practice Session</span>
              </CardTitle>
              <CardDescription>
                Configure your practice session settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {BIBLE_CATEGORIES.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Difficulty</label>
                  <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
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
                <label className="block text-sm font-medium mb-2">Number of Questions</label>
                <Select value={questionCount.toString()} onValueChange={(value) => setQuestionCount(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 Questions</SelectItem>
                    <SelectItem value="10">10 Questions</SelectItem>
                    <SelectItem value="15">15 Questions</SelectItem>
                    <SelectItem value="20">20 Questions</SelectItem>
                    <SelectItem value="25">25 Questions</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Available Questions</h4>
                <p className="text-sm text-blue-700">
                  {getFilteredQuestions().length} questions match your criteria
                </p>
              </div>

              <Button 
                onClick={startPractice} 
                className="w-full" 
                size="lg"
                disabled={getFilteredQuestions().length === 0}
              >
                Start Practice Session
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (session.isCompleted) {
    const percentage = Math.round((session.score / session.questions.length) * 100);
    const timeTaken = Math.round((Date.now() - session.startTime) / 1000);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Trophy className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Practice Complete!</CardTitle>
              <CardDescription>Great job on completing your practice session</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {session.score}/{session.questions.length}
                </div>
                <div className="text-lg text-gray-600">
                  {percentage}% Correct
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{timeTaken}s</div>
                  <div className="text-sm text-blue-600">Time Taken</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    +{session.score * 10 + (percentage === 100 ? 50 : 0)}
                  </div>
                  <div className="text-sm text-yellow-600">XP Earned</div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Performance Breakdown</h4>
                {session.questions.map((question, index) => (
                  <div key={question.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center space-x-2">
                      {session.answers[index] === question.correctAnswer ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span className="text-sm truncate max-w-xs">
                        {question.text.substring(0, 50)}...
                      </span>
                    </div>
                    <Badge variant={question.difficulty === 'easy' ? 'secondary' : question.difficulty === 'medium' ? 'default' : 'destructive'}>
                      {question.difficulty}
                    </Badge>
                  </div>
                ))}
              </div>

              <div className="flex space-x-4">
                <Button onClick={resetPractice} variant="outline" className="flex-1">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Practice Again
                </Button>
                <Button onClick={onBack} className="flex-1">
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentQuestion = session.questions[session.currentQuestionIndex];
  const progress = ((session.currentQuestionIndex + 1) / session.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={onBack}>
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
                <span className="font-mono text-lg">{session.timeLeft}s</span>
              </div>
              <Badge variant="outline">
                Score: {session.score}/{session.currentQuestionIndex + (showResult ? 1 : 0)}
              </Badge>
            </div>
          </div>

          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge variant="outline">{currentQuestion.category}</Badge>
              <Badge variant={
                currentQuestion.difficulty === 'easy' ? 'secondary' :
                currentQuestion.difficulty === 'medium' ? 'default' : 'destructive'
              }>
                {currentQuestion.difficulty}
              </Badge>
            </div>
            <CardTitle className="text-xl leading-relaxed">
              {currentQuestion.text}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => !showResult && handleAnswerSelect(index)}
                  disabled={showResult}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                    showResult
                      ? index === currentQuestion.correctAnswer
                        ? 'border-green-500 bg-green-50 text-green-800'
                        : index === selectedAnswer && index !== currentQuestion.correctAnswer
                        ? 'border-red-500 bg-red-50 text-red-800'
                        : 'border-gray-200 bg-gray-50'
                      : selectedAnswer === index
                      ? 'border-blue-500 bg-blue-50 text-blue-800'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                      showResult
                        ? index === currentQuestion.correctAnswer
                          ? 'border-green-500 bg-green-500 text-white'
                          : index === selectedAnswer && index !== currentQuestion.correctAnswer
                          ? 'border-red-500 bg-red-500 text-white'
                          : 'border-gray-300'
                        : selectedAnswer === index
                        ? 'border-blue-500 bg-blue-500 text-white'
                        : 'border-gray-300'
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span>{option}</span>
                  </div>
                </button>
              ))}
            </div>

            {showResult && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Explanation</h4>
                <p className="text-sm text-gray-700">{currentQuestion.explanation}</p>
                {currentQuestion.verse && (
                  <p className="text-sm text-blue-600 mt-2 font-medium">
                    Reference: {currentQuestion.verse}
                  </p>
                )}
              </div>
            )}

            {!showResult && (
              <Button 
                onClick={handleSubmitAnswer}
                disabled={selectedAnswer === null}
                className="w-full"
                size="lg"
              >
                Submit Answer
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};