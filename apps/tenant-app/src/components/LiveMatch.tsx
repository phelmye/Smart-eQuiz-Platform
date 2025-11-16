import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, Clock, Users, Trophy, Zap, Crown, Target } from 'lucide-react';
import { useAuth } from './AuthSystem';
import { storage, STORAGE_KEYS, Tournament, Question, User } from '@/lib/mockData';

interface LiveMatchProps {
  onBack: () => void;
}

interface MatchState {
  tournament: Tournament;
  questions: Question[];
  currentQuestionIndex: number;
  timeLeft: number;
  participants: User[];
  leaderboard: { userId: string; score: number; timeUsed: number }[];
  userAnswers: { [questionId: string]: number };
  isSpectating: boolean;
  matchPhase: 'waiting' | 'active' | 'between' | 'completed';
}

export const LiveMatch: React.FC<LiveMatchProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [matchState, setMatchState] = useState<MatchState | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);

  useEffect(() => {
    loadActiveTournament();
  }, [user]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (matchState && matchState.matchPhase === 'active' && matchState.timeLeft > 0) {
      timer = setTimeout(() => {
        setMatchState(prev => prev ? { ...prev, timeLeft: prev.timeLeft - 1 } : null);
      }, 1000);
    } else if (matchState && matchState.timeLeft === 0 && matchState.matchPhase === 'active') {
      handleTimeUp();
    }
    return () => clearTimeout(timer);
  }, [matchState?.timeLeft, matchState?.matchPhase]);

  const loadActiveTournament = () => {
    const tournaments = storage.get(STORAGE_KEYS.TOURNAMENTS) || [];
    const activeTournament = tournaments.find((t: Tournament) => 
      t.status === 'active' && (
        user?.role === 'super_admin' || 
        t.tenantId === user?.tenantId
      )
    );

    if (!activeTournament) {
      return;
    }

    const questions = storage.get(STORAGE_KEYS.QUESTIONS) || [];
    const tournamentQuestions = questions.filter((q: Question) => 
      activeTournament.questions.includes(q.id)
    );

    const users = storage.get(STORAGE_KEYS.USERS) || [];
    const participants = users.filter((u: User) => 
      activeTournament.participants.includes(u.id)
    );

    const isParticipating = user && activeTournament.participants.includes(user.id);
    const isSpectating = !isParticipating;

    // Generate mock leaderboard
    const leaderboard = participants.map((participant: User) => ({
      userId: participant.id,
      score: Math.floor(Math.random() * 8) + 2, // Random score between 2-10
      timeUsed: Math.floor(Math.random() * 300) + 60 // Random time between 60-360 seconds
    })).sort((a, b) => b.score - a.score || a.timeUsed - b.timeUsed);

    setMatchState({
      tournament: activeTournament,
      questions: tournamentQuestions,
      currentQuestionIndex: Math.floor(Math.random() * tournamentQuestions.length), // Simulate current question
      timeLeft: 25, // 25 seconds left on current question
      participants,
      leaderboard,
      userAnswers: {},
      isSpectating,
      matchPhase: 'active'
    });
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (hasAnswered || !matchState || matchState.isSpectating) return;
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = () => {
    if (!matchState || selectedAnswer === null || hasAnswered) return;

    const currentQuestion = matchState.questions[matchState.currentQuestionIndex];
    const newAnswers = {
      ...matchState.userAnswers,
      [currentQuestion.id]: selectedAnswer
    };

    setMatchState(prev => prev ? { ...prev, userAnswers: newAnswers } : null);
    setHasAnswered(true);

    // Update user's score in leaderboard
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    if (isCorrect && user) {
      const updatedLeaderboard = matchState.leaderboard.map(entry => 
        entry.userId === user.id 
          ? { ...entry, score: entry.score + 1 }
          : entry
      ).sort((a, b) => b.score - a.score || a.timeUsed - b.timeUsed);

      setMatchState(prev => prev ? { ...prev, leaderboard: updatedLeaderboard } : null);
    }
  };

  const handleTimeUp = () => {
    if (!matchState) return;

    // Simulate moving to next question or ending match
    if (matchState.currentQuestionIndex < matchState.questions.length - 1) {
      setTimeout(() => {
        setMatchState(prev => prev ? {
          ...prev,
          currentQuestionIndex: prev.currentQuestionIndex + 1,
          timeLeft: 30,
          matchPhase: 'active'
        } : null);
        setSelectedAnswer(null);
        setHasAnswered(false);
      }, 2000);
    } else {
      setMatchState(prev => prev ? { ...prev, matchPhase: 'completed' } : null);
    }
  };

  const getUserById = (userId: string) => {
    return matchState?.participants.find(p => p.id === userId);
  };

  const getUserRank = () => {
    if (!user || !matchState) return 0;
    return matchState.leaderboard.findIndex(entry => entry.userId === user.id) + 1;
  };

  if (!matchState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-4 mb-6">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Live Match</h1>
              <p className="text-gray-600">No active tournaments found</p>
            </div>
          </div>

          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8 text-center">
              <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-600 mb-4">No Active Tournaments</h2>
              <p className="text-gray-500 mb-6">
                There are currently no live tournaments available. Check back later or create a new tournament.
              </p>
              <Button onClick={onBack}>Back to Dashboard</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (matchState.matchPhase === 'completed') {
    const userEntry = matchState.leaderboard.find(entry => entry.userId === user?.id);
    const userRank = getUserRank();

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="max-w-3xl mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Trophy className="h-8 w-8 text-purple-600" />
              </div>
              <CardTitle className="text-2xl">Tournament Complete!</CardTitle>
              <CardDescription>Final results for {matchState.tournament.name}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!matchState.isSpectating && userEntry && (
                <div className="text-center p-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg">
                  <div className="text-3xl font-bold mb-2">#{userRank}</div>
                  <div className="text-lg">Your Final Rank</div>
                  <div className="text-sm opacity-90 mt-2">
                    Score: {userEntry.score} | Time: {Math.floor(userEntry.timeUsed / 60)}:{(userEntry.timeUsed % 60).toString().padStart(2, '0')}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Crown className="h-5 w-5 text-yellow-500 mr-2" />
                  Final Leaderboard
                </h3>
                <div className="space-y-2">
                  {matchState.leaderboard.slice(0, 10).map((entry, index) => {
                    const participant = getUserById(entry.userId);
                    if (!participant) return null;

                    return (
                      <div
                        key={entry.userId}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          entry.userId === user?.id ? 'bg-purple-50 border-2 border-purple-200' : 'bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            index === 0 ? 'bg-yellow-500 text-white' :
                            index === 1 ? 'bg-gray-400 text-white' :
                            index === 2 ? 'bg-amber-600 text-white' :
                            'bg-gray-200 text-gray-600'
                          }`}>
                            {index + 1}
                          </div>
                          <Avatar>
                            <AvatarFallback>{participant.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{participant.name}</div>
                            <div className="text-sm text-gray-500">
                              {Math.floor(entry.timeUsed / 60)}:{(entry.timeUsed % 60).toString().padStart(2, '0')}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">{entry.score}</div>
                          <div className="text-sm text-gray-500">points</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{matchState.participants.length}</div>
                  <div className="text-sm text-blue-600">Total Participants</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">${matchState.tournament.prizePool}</div>
                  <div className="text-sm text-green-600">Prize Pool</div>
                </div>
              </div>

              <Button onClick={onBack} className="w-full" size="lg">
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentQuestion = matchState.questions[matchState.currentQuestionIndex];
  const progress = ((matchState.currentQuestionIndex + 1) / matchState.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{matchState.tournament.name}</h1>
                <p className="text-gray-600">
                  {matchState.isSpectating ? 'Spectating' : 'Participating'} • Question {matchState.currentQuestionIndex + 1} of {matchState.questions.length}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-purple-600">
                <Clock className="h-5 w-5" />
                <span className="font-mono text-xl font-bold">{matchState.timeLeft}s</span>
              </div>
              <Badge variant="outline" className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>{matchState.participants.length} participants</span>
              </Badge>
            </div>
          </div>

          <Progress value={progress} className="h-3" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Question Area */}
          <div className="lg:col-span-2">
            <Card>
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
                {matchState.isSpectating ? (
                  <div className="text-center p-8 bg-gray-50 rounded-lg">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">Spectating Mode</h3>
                    <p className="text-gray-500">You're watching this tournament as a spectator</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleAnswerSelect(index)}
                        disabled={hasAnswered}
                        className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                          hasAnswered
                            ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                            : selectedAnswer === index
                            ? 'border-purple-500 bg-purple-50 text-purple-800'
                            : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                            selectedAnswer === index && !hasAnswered
                              ? 'border-purple-500 bg-purple-500 text-white'
                              : 'border-gray-300'
                          }`}>
                            {String.fromCharCode(65 + index)}
                          </div>
                          <span>{option}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {!matchState.isSpectating && !hasAnswered && (
                  <Button 
                    onClick={handleSubmitAnswer}
                    disabled={selectedAnswer === null}
                    className="w-full"
                    size="lg"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Submit Answer
                  </Button>
                )}

                {hasAnswered && (
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-green-600 font-medium">Answer Submitted!</div>
                    <div className="text-sm text-green-600">Waiting for other participants...</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Leaderboard Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-base">
                  <Crown className="h-5 w-5 text-yellow-500 mr-2" />
                  Live Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {matchState.leaderboard.slice(0, 8).map((entry, index) => {
                    const participant = getUserById(entry.userId);
                    if (!participant) return null;

                    return (
                      <div
                        key={entry.userId}
                        className={`flex items-center justify-between p-2 rounded ${
                          entry.userId === user?.id ? 'bg-purple-50 border border-purple-200' : 'bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            index === 0 ? 'bg-yellow-500 text-white' :
                            index === 1 ? 'bg-gray-400 text-white' :
                            index === 2 ? 'bg-amber-600 text-white' :
                            'bg-gray-200 text-gray-600'
                          }`}>
                            {index + 1}
                          </div>
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="text-xs">
                              {participant.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium truncate">
                            {participant.name}
                          </span>
                        </div>
                        <div className="text-sm font-bold">
                          {entry.score}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-base">
                  <Target className="h-5 w-5 text-blue-500 mr-2" />
                  Tournament Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Entry Fee:</span>
                  <span className="font-medium">${matchState.tournament.entryFee}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Prize Pool:</span>
                  <span className="font-medium text-green-600">${matchState.tournament.prizePool}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Participants:</span>
                  <span className="font-medium">{matchState.participants.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Category:</span>
                  <span className="font-medium">{matchState.tournament.category}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};