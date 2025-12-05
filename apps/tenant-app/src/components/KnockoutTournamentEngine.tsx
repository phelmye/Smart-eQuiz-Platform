import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  GitBranch, 
  List, 
  Settings, 
  Play,
  Users,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import BracketVisualization from './BracketVisualization';
import MatchManagement from './MatchManagement';
import { 
  Tournament,
  TournamentBracket,
  KnockoutMatch,
  getTournamentBracket,
  generateTournamentBracket,
  getTournamentMatches,
  getBracketStandings
} from '@/lib/mockData';
import { useState, useEffect } from 'react';

interface KnockoutTournamentEngineProps {
  tournament: Tournament;
  tenantId: string;
  onBack?: () => void;
}

export default function KnockoutTournamentEngine({ 
  tournament, 
  tenantId 
}: KnockoutTournamentEngineProps) {
  const [bracket, setBracket] = useState<TournamentBracket | null>(null);
  const [matches, setMatches] = useState<KnockoutMatch[]>([]);
  const [activeTab, setActiveTab] = useState('bracket');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadBracketData();
  }, [tournament.id]);

  const loadBracketData = () => {
    const bracketData = getTournamentBracket(tournament.id);
    const matchesData = getTournamentMatches(tournament.id);
    
    setBracket(bracketData);
    setMatches(matchesData);
    setLoading(false);
  };

  const handleGenerateBracket = () => {
    if (!tournament.knockoutConfig) {
      alert('Knockout configuration is missing');
      return;
    }

    setGenerating(true);

    // Get qualified participants
    // In real implementation, fetch from tournament applications
    const participantIds = tournament.participants || [];
    const participantTypes: Record<string, 'individual' | 'parish'> = {};
    
    participantIds.forEach(id => {
      // In real implementation, determine type from application data
      participantTypes[id] = 'individual';
    });

    try {
      const newBracket = generateTournamentBracket(
        tournament.id,
        tournament.knockoutConfig,
        participantIds,
        participantTypes
      );

      setBracket(newBracket);
      loadBracketData();
    } catch (error) {
      console.error('Failed to generate bracket:', error);
      alert('Failed to generate bracket. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleMatchClick = (match: KnockoutMatch) => {
    // Switch to matches tab and highlight the match
    setActiveTab('matches');
  };

  const getFormatDisplayName = () => {
    if (!tournament.tournamentFormat) return 'Standard';
    
    const names: Record<string, string> = {
      standard: 'Standard (All participants)',
      single_elimination: 'Single Elimination',
      double_elimination: 'Double Elimination',
      swiss_system: 'Swiss System'
    };
    
    return names[tournament.tournamentFormat] || tournament.tournamentFormat;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Standard tournament (not knockout)
  if (!tournament.tournamentFormat || tournament.tournamentFormat === 'standard') {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <GitBranch className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Standard Tournament Format
          </h3>
          <p className="text-gray-500">
            This tournament uses the standard all-participants format, not knockout brackets.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Knockout tournament without bracket
  if (!bracket) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="w-6 h-6" />
            Knockout Tournament Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tournament info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">
                  Ready to Generate Bracket
                </h4>
                <p className="text-sm text-blue-700">
                  {tournament.currentParticipants} participants are registered. 
                  Click the button below to generate the tournament bracket.
                </p>
              </div>
            </div>
          </div>

          {/* Configuration summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Tournament Format</p>
              <p className="text-lg font-semibold">{getFormatDisplayName()}</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Participants</p>
              <p className="text-lg font-semibold">{tournament.currentParticipants}</p>
            </div>

            {tournament.knockoutConfig && (
              <>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">Seeding Method</p>
                  <p className="text-lg font-semibold capitalize">
                    {tournament.knockoutConfig.seedingMethod.replace('_', ' ')}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">Match Type</p>
                  <p className="text-lg font-semibold capitalize">
                    {tournament.knockoutConfig.matchType.replace('_', ' ')}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">Questions per Match</p>
                  <p className="text-lg font-semibold">
                    {tournament.knockoutConfig.questionsPerMatch}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">Time Limit</p>
                  <p className="text-lg font-semibold">
                    {tournament.knockoutConfig.matchTimeLimitMinutes} minutes
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Generate button */}
          <div className="pt-4 border-t">
            <Button 
              size="lg" 
              className="w-full"
              onClick={handleGenerateBracket}
              disabled={generating || tournament.currentParticipants < 2}
            >
              {generating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating Bracket...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Generate Tournament Bracket
                </>
              )}
            </Button>
            
            {tournament.currentParticipants < 2 && (
              <p className="text-sm text-amber-600 text-center mt-2">
                At least 2 participants required to generate bracket
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Knockout tournament with bracket
  const standings = getBracketStandings(tournament.id);
  const completedMatches = matches.filter(m => m.status === 'completed').length;
  const totalMatches = matches.length;
  const progress = totalMatches > 0 ? (completedMatches / totalMatches) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tournament Format</p>
                <p className="text-lg font-bold">{getFormatDisplayName()}</p>
              </div>
              <GitBranch className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Participants</p>
                <p className="text-lg font-bold">{bracket.totalParticipants}</p>
              </div>
              <Users className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Current Round</p>
                <p className="text-lg font-bold">
                  {bracket.currentRound} / {bracket.totalRounds}
                </p>
              </div>
              <List className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Progress</p>
                <p className="text-lg font-bold">{Math.round(progress)}%</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress bar */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Tournament Progress</span>
              <span className="text-gray-600">
                {completedMatches} / {totalMatches} matches completed
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Winner announcement */}
      {bracket.winnerId && (
        <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-center gap-4">
              <Trophy className="w-12 h-12 text-yellow-500" />
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-1">Tournament Complete!</h2>
                <p className="text-lg font-semibold text-gray-700">
                  Champion: {standings.winner}
                </p>
                {standings.runnerUp && (
                  <p className="text-sm text-gray-600 mt-1">
                    Runner-up: {standings.runnerUp}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main content tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="bracket">
            <GitBranch className="w-4 h-4 mr-2" />
            Bracket View
          </TabsTrigger>
          <TabsTrigger value="matches">
            <List className="w-4 h-4 mr-2" />
            Match Management
          </TabsTrigger>
          <TabsTrigger value="standings">
            <Trophy className="w-4 h-4 mr-2" />
            Standings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bracket" className="mt-6">
          <BracketVisualization
            tournamentId={tournament.id}
            onMatchClick={handleMatchClick}
            showParticipantDetails={true}
            compact={false}
          />
        </TabsContent>

        <TabsContent value="matches" className="mt-6">
          <MatchManagement
            tournamentId={tournament.id}
            tenantId={tenantId}
            onMatchUpdated={loadBracketData}
          />
        </TabsContent>

        <TabsContent value="standings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Tournament Standings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {standings.participants.map((participant, index) => (
                  <div 
                    key={participant.participantId}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold">
                        {participant.placement || index + 1}
                      </div>
                      <div>
                        <p className="font-semibold">
                          Participant {participant.participantId.slice(-4)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {participant.wins}W - {participant.losses}L
                        </p>
                      </div>
                    </div>
                    <div>
                      {participant.isEliminated ? (
                        <Badge variant="destructive">Eliminated</Badge>
                      ) : (
                        <Badge variant="default">Active</Badge>
                      )}
                    </div>
                  </div>
                ))}
                
                {standings.participants.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No standings data available yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
