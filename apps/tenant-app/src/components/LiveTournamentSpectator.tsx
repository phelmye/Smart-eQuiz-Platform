import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Trophy, Eye, Clock, Users, TrendingUp, 
  BarChart, Activity, Zap, Award, Target 
} from 'lucide-react';
import { useAuth } from '@/components/AuthSystem';
import { Tournament, LiveTournamentView } from '@/lib/mockData';

interface LiveTournamentSpectatorProps {
  tournament: Tournament;
  onBack?: () => void;
}

export const LiveTournamentSpectator: React.FC<LiveTournamentSpectatorProps> = ({ 
  tournament, 
  onBack 
}) => {
  const { user } = useAuth();
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [liveData, setLiveData] = useState<LiveTournamentView>({
    tournamentId: tournament.id,
    status: tournament.status as 'upcoming' | 'in_progress' | 'completed',
    participants: [
      {
        userId: 'user_1',
        displayName: 'John Doe',
        currentScore: 850,
        correctAnswers: 17,
        averageTime: 45,
        status: 'active',
        rank: 1
      },
      {
        userId: 'user_2',
        displayName: 'Jane Smith',
        currentScore: 820,
        correctAnswers: 16,
        averageTime: 52,
        status: 'active',
        rank: 2
      },
      {
        userId: 'user_3',
        displayName: 'Mike Johnson',
        currentScore: 780,
        correctAnswers: 15,
        averageTime: 48,
        status: 'active',
        rank: 3
      },
      {
        userId: 'user_4',
        displayName: 'Sarah Wilson',
        currentScore: 750,
        correctAnswers: 15,
        averageTime: 55,
        status: 'finished',
        rank: 4
      },
      {
        userId: 'user_5',
        displayName: 'Tom Brown',
        currentScore: 720,
        correctAnswers: 14,
        averageTime: 60,
        status: 'active',
        rank: 5
      },
    ],
    metrics: {
      totalParticipants: 50,
      activeParticipants: 48,
      finishedParticipants: 2,
      droppedParticipants: 0,
      averageScore: 650,
      averageTimePerQuestion: 52
    },
    questionProgress: {
      currentQuestion: 17,
      totalQuestions: 20,
      answeredBy: 48,
      averageTime: 48
    },
    lastUpdated: new Date().toISOString()
  });

  // Simulate real-time updates
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // Simulate score updates
      setLiveData(prev => ({
        ...prev,
        participants: prev.participants.map(p => ({
          ...p,
          currentScore: p.currentScore + Math.floor(Math.random() * 10),
          correctAnswers: p.correctAnswers + (Math.random() > 0.7 ? 1 : 0)
        })).sort((a, b) => b.currentScore - a.currentScore).map((p, idx) => ({
          ...p,
          rank: idx + 1
        })),
        lastUpdated: new Date().toISOString()
      }));
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getRankBadge = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { label: string; color: string }> = {
      active: { label: 'Active', color: 'bg-green-100 text-green-800' },
      finished: { label: 'Finished', color: 'bg-blue-100 text-blue-800' },
      disconnected: { label: 'Disconnected', color: 'bg-red-100 text-red-800' }
    };
    const config = configs[status] || configs.active;
    return (
      <Badge variant="outline" className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const progressPercentage = (liveData.questionProgress.currentQuestion / liveData.questionProgress.totalQuestions) * 100;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-lg">
                  <Trophy className="h-8 w-8" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-2xl font-bold">{tournament.name}</h1>
                    <Badge variant="secondary" className="bg-red-500 text-white animate-pulse">
                      <Activity className="h-3 w-3 mr-1" />
                      LIVE
                    </Badge>
                    <Badge variant="secondary" className="bg-white/20 text-white">
                      <Eye className="h-3 w-3 mr-1" />
                      {tournament.spectatorCount || 0} watching
                    </Badge>
                  </div>
                  <p className="text-white/90">{tournament.description}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="secondary" 
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className="bg-white/20 hover:bg-white/30 text-white"
                >
                  {autoRefresh ? '⏸️ Pause' : '▶️ Resume'} Auto-Refresh
                </Button>
                {onBack && (
                  <Button variant="secondary" onClick={onBack} className="bg-white/20 hover:bg-white/30 text-white">
                    ← Exit
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tournament Progress */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Target className="h-6 w-6 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Tournament Progress</p>
                    <p className="text-lg font-bold text-gray-900">
                      Question {liveData.questionProgress.currentQuestion} of {liveData.questionProgress.totalQuestions}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Participants Answered</p>
                  <p className="text-lg font-bold text-gray-900">
                    {liveData.questionProgress.answeredBy} / {liveData.metrics.totalParticipants}
                  </p>
                </div>
              </div>
              <Progress value={progressPercentage} className="h-3" />
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>{progressPercentage.toFixed(1)}% Complete</span>
                <span>Avg time: {liveData.questionProgress.averageTime}s</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-xs text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{liveData.metrics.totalParticipants}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Activity className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-xs text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-green-600">{liveData.metrics.activeParticipants}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Award className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-xs text-gray-600">Finished</p>
                  <p className="text-2xl font-bold text-purple-600">{liveData.metrics.finishedParticipants}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="text-xs text-gray-600">Avg Score</p>
                  <p className="text-2xl font-bold text-orange-600">{liveData.metrics.averageScore}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Zap className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-xs text-gray-600">Avg Time</p>
                  <p className="text-2xl font-bold text-yellow-600">{liveData.metrics.averageTimePerQuestion}s</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="leaderboard" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="leaderboard">
              <Trophy className="h-4 w-4 mr-2" />
              Live Leaderboard
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="participants">
              <Users className="h-4 w-4 mr-2" />
              All Participants
            </TabsTrigger>
          </TabsList>

          {/* Live Leaderboard Tab */}
          <TabsContent value="leaderboard" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Top Performers
                </CardTitle>
                <CardDescription>
                  Real-time ranking • Updates every 3 seconds
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {liveData.participants.slice(0, 10).map((participant) => (
                    <div 
                      key={participant.userId} 
                      className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                        participant.rank <= 3 
                          ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300' 
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="text-2xl font-bold w-12 text-center">
                          {getRankBadge(participant.rank)}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{participant.displayName}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            <span>{participant.correctAnswers} correct</span>
                            <span>•</span>
                            <span>{participant.averageTime}s avg</span>
                            <span>•</span>
                            {getStatusBadge(participant.status)}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold text-blue-600">{participant.currentScore}</p>
                          <p className="text-xs text-gray-500">points</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Score Distribution</CardTitle>
                  <CardDescription>Performance breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600">800+ points</span>
                        <span className="text-sm font-medium">3 participants</span>
                      </div>
                      <Progress value={6} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600">700-799 points</span>
                        <span className="text-sm font-medium">8 participants</span>
                      </div>
                      <Progress value={16} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600">600-699 points</span>
                        <span className="text-sm font-medium">15 participants</span>
                      </div>
                      <Progress value={30} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600">500-599 points</span>
                        <span className="text-sm font-medium">18 participants</span>
                      </div>
                      <Progress value={36} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600">Below 500</span>
                        <span className="text-sm font-medium">6 participants</span>
                      </div>
                      <Progress value={12} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Speed Analysis</CardTitle>
                  <CardDescription>Average time per question</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600">Under 30s</span>
                        <span className="text-sm font-medium">5 participants</span>
                      </div>
                      <Progress value={10} className="h-2 bg-green-200" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600">30-45s</span>
                        <span className="text-sm font-medium">12 participants</span>
                      </div>
                      <Progress value={24} className="h-2 bg-blue-200" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600">45-60s</span>
                        <span className="text-sm font-medium">20 participants</span>
                      </div>
                      <Progress value={40} className="h-2 bg-yellow-200" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600">Over 60s</span>
                        <span className="text-sm font-medium">13 participants</span>
                      </div>
                      <Progress value={26} className="h-2 bg-orange-200" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Tournament Insights</CardTitle>
                <CardDescription>Key statistics and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-600 mb-1">Fastest Answer</p>
                    <p className="text-2xl font-bold text-blue-900">18s</p>
                    <p className="text-xs text-blue-600">Question 3</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-600 mb-1">Highest Score</p>
                    <p className="text-2xl font-bold text-green-900">850</p>
                    <p className="text-xs text-green-600">John Doe</p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <p className="text-sm text-orange-600 mb-1">Hardest Question</p>
                    <p className="text-2xl font-bold text-orange-900">Q5</p>
                    <p className="text-xs text-orange-600">40% correct</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm text-purple-600 mb-1">Easiest Question</p>
                    <p className="text-2xl font-bold text-purple-900">Q12</p>
                    <p className="text-xs text-purple-600">95% correct</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* All Participants Tab */}
          <TabsContent value="participants" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Participants</CardTitle>
                <CardDescription>
                  {liveData.metrics.totalParticipants} participants in total
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Correct</TableHead>
                      <TableHead>Avg Time</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {liveData.participants.map((participant) => (
                      <TableRow key={participant.userId}>
                        <TableCell className="font-medium text-center">
                          {getRankBadge(participant.rank)}
                        </TableCell>
                        <TableCell className="font-medium">{participant.displayName}</TableCell>
                        <TableCell className="font-bold text-blue-600">{participant.currentScore}</TableCell>
                        <TableCell>{participant.correctAnswers}/{liveData.questionProgress.currentQuestion}</TableCell>
                        <TableCell>{participant.averageTime}s</TableCell>
                        <TableCell>{getStatusBadge(participant.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Last Updated */}
        <div className="text-center text-sm text-gray-500">
          <Clock className="h-4 w-4 inline mr-1" />
          Last updated: {new Date(liveData.lastUpdated).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default LiveTournamentSpectator;
