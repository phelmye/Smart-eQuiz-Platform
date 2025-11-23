import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Play, 
  Trophy, 
  Clock, 
  CheckCircle2, 
  Users, 
  ArrowRight,
  Edit,
  Eye,
  Calendar,
  Target
} from 'lucide-react';
import { 
  KnockoutMatch, 
  getTournamentMatches,
  updateMatchResult,
  startMatch,
  getActiveMatches,
  getRoundMatches
} from '@/lib/mockData';
import { useState, useEffect } from 'react';

interface MatchManagementProps {
  tournamentId: string;
  tenantId: string;
  onMatchUpdated?: () => void;
}

interface MatchResultDialogProps {
  match: KnockoutMatch;
  open: boolean;
  onClose: () => void;
  onSave: (winnerId: string, p1Score: number, p2Score: number) => void;
}

const MatchResultDialog: React.FC<MatchResultDialogProps> = ({ 
  match, 
  open, 
  onClose, 
  onSave 
}) => {
  const [participant1Score, setParticipant1Score] = useState(match.participant1Score || 0);
  const [participant2Score, setParticipant2Score] = useState(match.participant2Score || 0);
  const [participant1Correct, setParticipant1Correct] = useState(match.participant1CorrectAnswers || 0);
  const [participant2Correct, setParticipant2Correct] = useState(match.participant2CorrectAnswers || 0);
  const [participant1Time, setParticipant1Time] = useState(match.participant1TimeTaken || 0);
  const [participant2Time, setParticipant2Time] = useState(match.participant2TimeTaken || 0);

  const handleSave = () => {
    const winnerId = participant1Score > participant2Score 
      ? match.participant1Id! 
      : match.participant2Id!;
    
    onSave(winnerId, participant1Score, participant2Score);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Record Match Result</DialogTitle>
          <DialogDescription>
            Enter the match results for {match.roundName} - Match {match.matchNumber}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6 py-4">
          {/* Participant 1 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              {match.participant1Type === 'parish' && (
                <Users className="w-5 h-5 text-purple-600" />
              )}
              <h3 className="font-semibold">Participant 1</h3>
              {match.participant1Seed && (
                <Badge variant="secondary">Seed #{match.participant1Seed}</Badge>
              )}
            </div>

            <div className="space-y-2">
              <Label>Final Score</Label>
              <Input
                type="number"
                value={participant1Score}
                onChange={(e) => setParticipant1Score(parseInt(e.target.value) || 0)}
                className="text-lg font-bold"
              />
            </div>

            <div className="space-y-2">
              <Label>Correct Answers</Label>
              <Input
                type="number"
                value={participant1Correct}
                onChange={(e) => setParticipant1Correct(parseInt(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label>Time Taken (seconds)</Label>
              <Input
                type="number"
                value={participant1Time}
                onChange={(e) => setParticipant1Time(parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          {/* Participant 2 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              {match.participant2Type === 'parish' && (
                <Users className="w-5 h-5 text-purple-600" />
              )}
              <h3 className="font-semibold">Participant 2</h3>
              {match.participant2Seed && (
                <Badge variant="secondary">Seed #{match.participant2Seed}</Badge>
              )}
            </div>

            <div className="space-y-2">
              <Label>Final Score</Label>
              <Input
                type="number"
                value={participant2Score}
                onChange={(e) => setParticipant2Score(parseInt(e.target.value) || 0)}
                className="text-lg font-bold"
              />
            </div>

            <div className="space-y-2">
              <Label>Correct Answers</Label>
              <Input
                type="number"
                value={participant2Correct}
                onChange={(e) => setParticipant2Correct(parseInt(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label>Time Taken (seconds)</Label>
              <Input
                type="number"
                value={participant2Time}
                onChange={(e) => setParticipant2Time(parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
        </div>

        {/* Winner indicator */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span className="font-semibold">
              Winner: {participant1Score > participant2Score 
                ? 'Participant 1' 
                : participant2Score > participant1Score 
                  ? 'Participant 2' 
                  : 'Tied'}
            </span>
          </div>
          {participant1Score === participant2Score && (
            <p className="text-xs text-center text-amber-600 mt-1">
              ⚠️ Scores are tied. Ensure tiebreaker is applied.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleSave}
            disabled={participant1Score === participant2Score}
          >
            Save Result
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default function MatchManagement({ 
  tournamentId, 
  tenantId, 
  onMatchUpdated 
}: MatchManagementProps) {
  const [matches, setMatches] = useState<KnockoutMatch[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<KnockoutMatch | null>(null);
  const [resultDialogOpen, setResultDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMatches();
  }, [tournamentId]);

  const loadMatches = () => {
    const allMatches = getTournamentMatches(tournamentId);
    setMatches(allMatches);
    setLoading(false);
  };

  const handleStartMatch = (matchId: string) => {
    const success = startMatch(matchId);
    if (success) {
      loadMatches();
      onMatchUpdated?.();
    }
  };

  const handleSaveResult = (winnerId: string, p1Score: number, p2Score: number) => {
    if (!selectedMatch) return;

    const success = updateMatchResult(
      selectedMatch.id,
      winnerId,
      p1Score,
      p2Score,
      {
        correctAnswers: 0,
        timeTaken: 0,
        answers: {}
      },
      {
        correctAnswers: 0,
        timeTaken: 0,
        answers: {}
      }
    );

    if (success) {
      loadMatches();
      onMatchUpdated?.();
      setSelectedMatch(null);
    }
  };

  const getParticipantName = (participantId: string | undefined): string => {
    if (!participantId) return 'TBD';
    return `Participant ${participantId.slice(-4)}`;
  };

  const getMatchesByStatus = (status: string[]) => {
    return matches.filter(m => status.includes(m.status));
  };

  const upcomingMatches = getMatchesByStatus(['scheduled', 'ready']);
  const inProgressMatches = getMatchesByStatus(['in_progress']);
  const completedMatches = getMatchesByStatus(['completed']);

  const renderMatchCard = (match: KnockoutMatch, showActions = true) => {
    const getStatusBadge = (status: string) => {
      const styles: Record<string, string> = {
        completed: 'bg-green-100 text-green-800',
        in_progress: 'bg-blue-100 text-blue-800',
        ready: 'bg-yellow-100 text-yellow-800',
        scheduled: 'bg-gray-100 text-gray-800'
      };
      return (
        <Badge className={styles[status] || styles.scheduled}>
          {status.replace('_', ' ')}
        </Badge>
      );
    };

    return (
      <Card key={match.id} className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">
                {match.roundName} - Match {match.matchNumber}
              </CardTitle>
              <CardDescription>
                {match.bracket !== 'main' && (
                  <Badge variant="outline" className="mr-2">
                    {match.bracket.replace('_', ' ')}
                  </Badge>
                )}
                {getStatusBadge(match.status)}
              </CardDescription>
            </div>
            {match.status === 'completed' && match.winnerId && (
              <Trophy className="w-6 h-6 text-yellow-500" />
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Participants */}
            <div className="space-y-2">
              {/* Participant 1 */}
              <div className={`flex items-center justify-between p-3 rounded ${
                match.winnerId === match.participant1Id 
                  ? 'bg-green-50 border-2 border-green-500' 
                  : 'bg-gray-50'
              }`}>
                <div className="flex items-center gap-2">
                  {match.participant1Type === 'parish' && (
                    <Users className="w-4 h-4 text-purple-600" />
                  )}
                  <span className="font-medium">
                    {match.participant1Id ? getParticipantName(match.participant1Id) : 'TBD'}
                  </span>
                  {match.participant1Seed && (
                    <Badge variant="secondary" className="text-xs">
                      #{match.participant1Seed}
                    </Badge>
                  )}
                </div>
                {match.participant1Score !== undefined && (
                  <span className="text-xl font-bold">{match.participant1Score}</span>
                )}
              </div>

              {/* VS */}
              <div className="text-center text-sm text-gray-500 font-semibold">VS</div>

              {/* Participant 2 */}
              <div className={`flex items-center justify-between p-3 rounded ${
                match.winnerId === match.participant2Id 
                  ? 'bg-green-50 border-2 border-green-500' 
                  : 'bg-gray-50'
              }`}>
                <div className="flex items-center gap-2">
                  {match.participant2Type === 'parish' && (
                    <Users className="w-4 h-4 text-purple-600" />
                  )}
                  <span className="font-medium">
                    {match.participant2Id ? getParticipantName(match.participant2Id) : 'TBD'}
                  </span>
                  {match.participant2Seed && (
                    <Badge variant="secondary" className="text-xs">
                      #{match.participant2Seed}
                    </Badge>
                  )}
                </div>
                {match.participant2Score !== undefined && (
                  <span className="text-xl font-bold">{match.participant2Score}</span>
                )}
              </div>
            </div>

            {/* Match details */}
            {match.scheduledStartTime && (
              <div className="flex items-center gap-2 text-sm text-gray-600 pt-2 border-t">
                <Calendar className="w-4 h-4" />
                <span>{new Date(match.scheduledStartTime).toLocaleString()}</span>
              </div>
            )}

            {match.status === 'completed' && match.completedAt && (
              <div className="flex items-center gap-2 text-sm text-gray-600 pt-2 border-t">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>Completed {new Date(match.completedAt).toLocaleString()}</span>
              </div>
            )}

            {/* Actions */}
            {showActions && (
              <div className="flex gap-2 pt-3 border-t">
                {match.status === 'ready' && match.participant1Id && match.participant2Id && (
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleStartMatch(match.id)}
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Start Match
                  </Button>
                )}
                
                {match.status === 'in_progress' && (
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => {
                      setSelectedMatch(match);
                      setResultDialogOpen(true);
                    }}
                  >
                    <Target className="w-4 h-4 mr-1" />
                    Record Result
                  </Button>
                )}
                
                {match.status === 'completed' && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => {
                      setSelectedMatch(match);
                      setResultDialogOpen(true);
                    }}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit Result
                  </Button>
                )}
                
                <Button size="sm" variant="outline">
                  <Eye className="w-4 h-4 mr-1" />
                  View Details
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Matches</p>
                <p className="text-2xl font-bold">{matches.length}</p>
              </div>
              <Target className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{inProgressMatches.length}</p>
              </div>
              <Play className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-yellow-600">{upcomingMatches.length}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{completedMatches.length}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Match tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="upcoming">
            Upcoming ({upcomingMatches.length})
          </TabsTrigger>
          <TabsTrigger value="in_progress">
            In Progress ({inProgressMatches.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedMatches.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4 mt-4">
          {upcomingMatches.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No upcoming matches</p>
              </CardContent>
            </Card>
          ) : (
            upcomingMatches.map(match => renderMatchCard(match))
          )}
        </TabsContent>

        <TabsContent value="in_progress" className="space-y-4 mt-4">
          {inProgressMatches.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Play className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No matches in progress</p>
              </CardContent>
            </Card>
          ) : (
            inProgressMatches.map(match => renderMatchCard(match))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4 mt-4">
          {completedMatches.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No completed matches yet</p>
              </CardContent>
            </Card>
          ) : (
            completedMatches.map(match => renderMatchCard(match))
          )}
        </TabsContent>
      </Tabs>

      {/* Result dialog */}
      {selectedMatch && (
        <MatchResultDialog
          match={selectedMatch}
          open={resultDialogOpen}
          onClose={() => {
            setResultDialogOpen(false);
            setSelectedMatch(null);
          }}
          onSave={handleSaveResult}
        />
      )}
    </div>
  );
}
