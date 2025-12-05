import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  Clock, 
  History, 
  BookOpen, 
  Zap,
  Info,
  AlertCircle
} from 'lucide-react';
import {
  Question,
  QuestionStatus,
  Tournament,
  storage,
  STORAGE_KEYS
} from '@/lib/mockData';
import { Checkbox } from '@/components/ui/checkbox';

type QuestionSource = 'pool' | 'recent' | 'both';

interface PracticeModeSourceSelectorProps {
  onSourceChange: (source: QuestionSource) => void;
  currentSource?: QuestionSource;
  tenantId: string;
}

interface SourceStats {
  total: number;
  byCategory: Record<string, number>;
  byDifficulty: Record<string, number>;
}

interface RecentTournamentInfo {
  tournament: Tournament;
  questionsCount: number;
  availableAt?: Date;
  isAvailable: boolean;
  delayHoursRemaining?: number;
}

export const PracticeModeSourceSelector: React.FC<PracticeModeSourceSelectorProps> = ({
  onSourceChange,
  currentSource = 'pool',
  tenantId
}) => {
  const [selectedSource, setSelectedSource] = useState<QuestionSource>(currentSource);
  const [poolStats, setPoolStats] = useState<SourceStats>({ total: 0, byCategory: {}, byDifficulty: {} });
  const [recentStats, setRecentStats] = useState<SourceStats>({ total: 0, byCategory: {}, byDifficulty: {} });
  const [recentTournamentInfo, setRecentTournamentInfo] = useState<RecentTournamentInfo | null>(null);
  const [countdown, setCountdown] = useState<string>('');

  useEffect(() => {
    loadStatistics();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [tenantId]);

  useEffect(() => {
    onSourceChange(selectedSource);
  }, [selectedSource]);

  const loadStatistics = () => {
    const questions = storage.get(STORAGE_KEYS.QUESTIONS) as Question[] || [];
    const tournaments = storage.get(STORAGE_KEYS.TOURNAMENTS) as Tournament[] || [];
    const tenantQuestions = questions.filter(q => q.tenantId === tenantId);

    // Pool statistics
    const poolQuestions = tenantQuestions.filter(q => q.status === QuestionStatus.QUESTION_POOL);
    setPoolStats(calculateStats(poolQuestions));

    // Recent tournament statistics
    const recentQuestions = tenantQuestions.filter(q => q.status === QuestionStatus.RECENT_TOURNAMENT);
    setRecentStats(calculateStats(recentQuestions));

    // Find most recent completed tournament
    const completedTournaments = tournaments
      .filter(t => t.tenantId === tenantId && t.status === 'completed')
      .sort((a, b) => new Date(b.endDate || b.startDate).getTime() - new Date(a.endDate || a.startDate).getTime());

    if (completedTournaments.length > 0 && recentQuestions.length > 0) {
      const mostRecent = completedTournaments[0];
      const recentQuestionsList = recentQuestions.filter(q => q.tournamentId === mostRecent.id);

      // Check if questions have delayed release
      const firstQuestion = recentQuestionsList[0];
      let availableAt: Date | undefined;
      let isAvailable = true;
      let delayHoursRemaining: number | undefined;

      if (firstQuestion?.availableForPracticeDate) {
        availableAt = new Date(firstQuestion.availableForPracticeDate);
        isAvailable = new Date() >= availableAt;
        
        if (!isAvailable) {
          const now = new Date();
          const diff = availableAt.getTime() - now.getTime();
          delayHoursRemaining = Math.ceil(diff / (1000 * 60 * 60));
        }
      }

      setRecentTournamentInfo({
        tournament: mostRecent,
        questionsCount: recentQuestionsList.length,
        availableAt,
        isAvailable,
        delayHoursRemaining
      });
    } else {
      setRecentTournamentInfo(null);
    }
  };

  const calculateStats = (questions: Question[]): SourceStats => {
    const byCategory: Record<string, number> = {};
    const byDifficulty: Record<string, number> = {};

    questions.forEach(q => {
      byCategory[q.category] = (byCategory[q.category] || 0) + 1;
      byDifficulty[q.difficulty] = (byDifficulty[q.difficulty] || 0) + 1;
    });

    return {
      total: questions.length,
      byCategory,
      byDifficulty
    };
  };

  const updateCountdown = () => {
    if (!recentTournamentInfo || !recentTournamentInfo.availableAt || recentTournamentInfo.isAvailable) {
      setCountdown('');
      return;
    }

    const now = new Date();
    const target = recentTournamentInfo.availableAt;
    const diff = target.getTime() - now.getTime();

    if (diff <= 0) {
      setCountdown('Available now!');
      // Reload stats to update availability
      setTimeout(loadStatistics, 100);
      return;
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    setCountdown(`${hours}h ${minutes}m ${seconds}s`);
  };

  const handleSourceChange = (source: QuestionSource) => {
    setSelectedSource(source);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>Practice Question Sources</CardTitle>
          <CardDescription>
            Choose which questions to include in your practice sessions
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Source Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Question Pool */}
        <div
          className={`relative cursor-pointer transition-all ${
            selectedSource === 'pool' ? 'ring-2 ring-blue-500' : ''
          }`}
          onClick={() => handleSourceChange('pool')}
        >
          <Card className={selectedSource === 'pool' ? 'border-blue-500' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <CardTitle className="text-lg">Question Pool</CardTitle>
                </div>
                <Checkbox 
                  checked={selectedSource === 'pool' || selectedSource === 'both'}
                  onCheckedChange={(checked) => {
                    if (checked && selectedSource === 'recent') {
                      handleSourceChange('both');
                    } else if (!checked && selectedSource === 'both') {
                      handleSourceChange('recent');
                    } else if (checked) {
                      handleSourceChange('pool');
                    }
                  }}
                />
              </div>
              <CardDescription>Approved questions available for practice</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-blue-600">{poolStats.total}</span>
                  <Badge variant="default" className="bg-blue-100 text-blue-700">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Available
                  </Badge>
                </div>

                {poolStats.total > 0 && (
                  <>
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-gray-700">By Difficulty:</div>
                      <div className="flex gap-2">
                        {Object.entries(poolStats.byDifficulty).map(([difficulty, count]) => (
                          <Badge key={difficulty} variant="outline" className="text-xs">
                            {difficulty}: {count}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-sm font-medium text-gray-700">Categories:</div>
                      <div className="text-xs text-gray-600">
                        {Object.keys(poolStats.byCategory).length} categories
                      </div>
                    </div>
                  </>
                )}

                {poolStats.total === 0 && (
                  <Alert>
                    <Info className="w-4 h-4" />
                    <AlertDescription className="text-xs">
                      No questions in pool yet
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Tournament */}
        <div
          className={`relative cursor-pointer transition-all ${
            selectedSource === 'recent' ? 'ring-2 ring-orange-500' : ''
          }`}
          onClick={() => recentTournamentInfo?.isAvailable && handleSourceChange('recent')}
        >
          <Card className={selectedSource === 'recent' ? 'border-orange-500' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-orange-600" />
                  <CardTitle className="text-lg">Recent Tournament</CardTitle>
                </div>
                <Checkbox 
                  checked={selectedSource === 'recent' || selectedSource === 'both'}
                  disabled={!recentTournamentInfo?.isAvailable}
                  onCheckedChange={(checked) => {
                    if (!recentTournamentInfo?.isAvailable) return;
                    if (checked && selectedSource === 'pool') {
                      handleSourceChange('both');
                    } else if (!checked && selectedSource === 'both') {
                      handleSourceChange('pool');
                    } else if (checked) {
                      handleSourceChange('recent');
                    }
                  }}
                />
              </div>
              <CardDescription>Questions from last completed tournament</CardDescription>
            </CardHeader>
            <CardContent>
              {recentTournamentInfo ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-orange-600">{recentStats.total}</span>
                    {recentTournamentInfo.isAvailable ? (
                      <Badge variant="default" className="bg-green-100 text-green-700">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Available
                      </Badge>
                    ) : (
                      <Badge variant="default" className="bg-yellow-100 text-yellow-700">
                        <Clock className="w-3 h-3 mr-1" />
                        Delayed
                      </Badge>
                    )}
                  </div>

                  <div className="text-sm text-gray-700">
                    <strong>{recentTournamentInfo.tournament.name}</strong>
                  </div>

                  {!recentTournamentInfo.isAvailable && recentTournamentInfo.delayHoursRemaining && (
                    <Alert className="bg-yellow-50 border-yellow-200">
                      <Clock className="w-4 h-4 text-yellow-600" />
                      <AlertDescription className="text-xs">
                        <div className="font-semibold mb-1">Delayed Release</div>
                        <div>Available in: <strong>{countdown}</strong></div>
                        {recentTournamentInfo.availableAt && (
                          <div className="text-gray-600 mt-1">
                            {recentTournamentInfo.availableAt.toLocaleString()}
                          </div>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}

                  {recentStats.total > 0 && recentTournamentInfo.isAvailable && (
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-gray-700">By Difficulty:</div>
                      <div className="flex gap-2 flex-wrap">
                        {Object.entries(recentStats.byDifficulty).map(([difficulty, count]) => (
                          <Badge key={difficulty} variant="outline" className="text-xs">
                            {difficulty}: {count}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Alert>
                  <Info className="w-4 h-4" />
                  <AlertDescription className="text-xs">
                    No recent tournament questions available
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Both Sources */}
        <div
          className={`relative cursor-pointer transition-all ${
            selectedSource === 'both' ? 'ring-2 ring-purple-500' : ''
          }`}
          onClick={() => recentTournamentInfo?.isAvailable && handleSourceChange('both')}
        >
          <Card className={selectedSource === 'both' ? 'border-purple-500' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-purple-600" />
                  <CardTitle className="text-lg">Combined</CardTitle>
                </div>
                <Checkbox 
                  checked={selectedSource === 'both'}
                  disabled={!recentTournamentInfo?.isAvailable}
                  onCheckedChange={(checked) => {
                    if (!recentTournamentInfo?.isAvailable) return;
                    if (checked) {
                      handleSourceChange('both');
                    } else {
                      handleSourceChange('pool');
                    }
                  }}
                />
              </div>
              <CardDescription>Practice with all available questions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-purple-600">
                    {poolStats.total + (recentTournamentInfo?.isAvailable ? recentStats.total : 0)}
                  </span>
                  <Badge variant="default" className="bg-purple-100 text-purple-700">
                    <Zap className="w-3 h-3 mr-1" />
                    Max Variety
                  </Badge>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pool questions:</span>
                    <span className="font-medium">{poolStats.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Recent tournament:</span>
                    <span className="font-medium">
                      {recentTournamentInfo?.isAvailable ? recentStats.total : 0}
                      {!recentTournamentInfo?.isAvailable && recentStats.total > 0 && (
                        <span className="text-yellow-600 ml-1">(delayed)</span>
                      )}
                    </span>
                  </div>
                </div>

                {!recentTournamentInfo?.isAvailable && recentStats.total > 0 && (
                  <Alert className="bg-yellow-50 border-yellow-200">
                    <AlertCircle className="w-4 h-4 text-yellow-600" />
                    <AlertDescription className="text-xs">
                      Recent tournament questions will be added when available
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Current Selection</h3>
              <p className="text-sm text-gray-600">
                {selectedSource === 'pool' && 'Using questions from the Question Pool'}
                {selectedSource === 'recent' && 'Using questions from Recent Tournament'}
                {selectedSource === 'both' && 'Using questions from both Pool and Recent Tournament'}
              </p>
            </div>
            <Badge variant="default" className="text-lg px-4 py-2">
              {selectedSource === 'pool' && poolStats.total}
              {selectedSource === 'recent' && recentStats.total}
              {selectedSource === 'both' && (poolStats.total + (recentTournamentInfo?.isAvailable ? recentStats.total : 0))}
              {' '}questions
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PracticeModeSourceSelector;
