import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Clock, CheckCircle2, Circle, Play, Users } from 'lucide-react';
import { 
  TournamentBracket, 
  KnockoutMatch, 
  getTournamentBracket,
  getTournamentMatches,
  getMatch
} from '@/lib/mockData';
import { useState, useEffect } from 'react';

interface BracketVisualizationProps {
  tournamentId: string;
  onMatchClick?: (match: KnockoutMatch) => void;
  showParticipantDetails?: boolean;
  compact?: boolean;
}

interface MatchCardProps {
  match: KnockoutMatch;
  participant1Name: string;
  participant2Name: string;
  onClick?: () => void;
  compact?: boolean;
}

const MatchCard: React.FC<MatchCardProps> = ({ 
  match, 
  participant1Name, 
  participant2Name, 
  onClick, 
  compact = false 
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'ready': return 'bg-yellow-500';
      case 'scheduled': return 'bg-gray-400';
      default: return 'bg-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-4 h-4" />;
      case 'in_progress': return <Play className="w-4 h-4" />;
      case 'ready': return <Clock className="w-4 h-4" />;
      default: return <Circle className="w-4 h-4" />;
    }
  };

  const isWinner = (participantId?: string) => {
    return match.winnerId && match.winnerId === participantId;
  };

  return (
    <Card 
      className={`${compact ? 'w-48' : 'w-64'} hover:shadow-md transition-shadow cursor-pointer`}
      onClick={onClick}
    >
      <CardHeader className={`${compact ? 'p-2' : 'p-3'} pb-2`}>
        <div className="flex items-center justify-between">
          <span className={`${compact ? 'text-xs' : 'text-sm'} font-medium text-gray-600`}>
            Match {match.matchNumber}
          </span>
          <Badge variant="outline" className={`${compact ? 'text-xs px-1' : ''}`}>
            <div className="flex items-center gap-1">
              {getStatusIcon(match.status)}
              <span className={compact ? 'text-xs' : ''}>{match.status.replace('_', ' ')}</span>
            </div>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className={compact ? 'p-2 pt-0' : 'p-3 pt-0'}>
        <div className="space-y-1">
          {/* Participant 1 */}
          <div className={`flex items-center justify-between p-2 rounded ${
            isWinner(match.participant1Id) 
              ? 'bg-green-50 border-2 border-green-500' 
              : match.winnerId 
                ? 'bg-gray-50 opacity-60' 
                : 'bg-gray-50'
          }`}>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {match.participant1Type === 'parish' && (
                <Users className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} text-purple-600 flex-shrink-0`} />
              )}
              <span className={`${compact ? 'text-xs' : 'text-sm'} font-medium truncate`}>
                {match.participant1Id ? participant1Name : 'TBD'}
              </span>
              {match.participant1Seed && (
                <Badge variant="secondary" className={compact ? 'text-xs px-1' : ''}>
                  #{match.participant1Seed}
                </Badge>
              )}
            </div>
            {match.participant1Score !== undefined && (
              <span className={`${compact ? 'text-sm' : 'text-lg'} font-bold ml-2`}>
                {match.participant1Score}
              </span>
            )}
            {isWinner(match.participant1Id) && (
              <Trophy className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} text-yellow-500 ml-1 flex-shrink-0`} />
            )}
          </div>

          {/* VS divider */}
          <div className="text-center">
            <span className={`${compact ? 'text-xs' : 'text-sm'} text-gray-400 font-semibold`}>VS</span>
          </div>

          {/* Participant 2 */}
          <div className={`flex items-center justify-between p-2 rounded ${
            isWinner(match.participant2Id) 
              ? 'bg-green-50 border-2 border-green-500' 
              : match.winnerId 
                ? 'bg-gray-50 opacity-60' 
                : 'bg-gray-50'
          }`}>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {match.participant2Type === 'parish' && (
                <Users className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} text-purple-600 flex-shrink-0`} />
              )}
              <span className={`${compact ? 'text-xs' : 'text-sm'} font-medium truncate`}>
                {match.participant2Id ? participant2Name : match.participant1Id ? 'TBD' : 'BYE'}
              </span>
              {match.participant2Seed && (
                <Badge variant="secondary" className={compact ? 'text-xs px-1' : ''}>
                  #{match.participant2Seed}
                </Badge>
              )}
            </div>
            {match.participant2Score !== undefined && (
              <span className={`${compact ? 'text-sm' : 'text-lg'} font-bold ml-2`}>
                {match.participant2Score}
              </span>
            )}
            {isWinner(match.participant2Id) && (
              <Trophy className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} text-yellow-500 ml-1 flex-shrink-0`} />
            )}
          </div>
        </div>

        {!compact && match.scheduledStartTime && match.status === 'scheduled' && (
          <div className="mt-2 pt-2 border-t">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>{new Date(match.scheduledStartTime).toLocaleString()}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default function BracketVisualization({ 
  tournamentId, 
  onMatchClick,
  showParticipantDetails = true,
  compact = false 
}: BracketVisualizationProps) {
  const [bracket, setBracket] = useState<TournamentBracket | null>(null);
  const [matches, setMatches] = useState<KnockoutMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBracket = () => {
      const bracketData = getTournamentBracket(tournamentId);
      const matchesData = getTournamentMatches(tournamentId);
      
      setBracket(bracketData);
      setMatches(matchesData);
      setLoading(false);
    };

    loadBracket();
  }, [tournamentId]);

  const getParticipantName = (participantId: string | undefined): string => {
    if (!participantId) return 'TBD';
    // In real implementation, fetch from user/parish data
    return `Participant ${participantId.slice(-4)}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading bracket...</p>
        </div>
      </div>
    );
  }

  if (!bracket) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Bracket Generated</h3>
          <p className="text-gray-500">
            This tournament hasn't generated a knockout bracket yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  const renderSingleEliminationBracket = () => {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Tournament Bracket</h2>
            <p className="text-gray-600 mt-1">
              {bracket.format.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())} • {bracket.totalParticipants} Participants
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-sm">
              Round {bracket.currentRound} of {bracket.totalRounds}
            </Badge>
            <Badge variant="outline" className="text-sm">
              {bracket.completedMatches.length} / {matches.length} Complete
            </Badge>
          </div>
        </div>

        {/* Bracket rounds */}
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-8 min-w-max">
            {bracket.rounds.filter(r => r.roundName !== 'Third Place').map((round) => {
              const roundMatches = matches.filter(m => 
                round.matches.includes(m.id) && m.bracket === 'main'
              );

              return (
                <div key={round.roundNumber} className="flex flex-col">
                  {/* Round header */}
                  <div className="mb-4 text-center">
                    <h3 className={`${compact ? 'text-sm' : 'text-lg'} font-bold`}>
                      {round.roundName}
                    </h3>
                    <p className={`${compact ? 'text-xs' : 'text-sm'} text-gray-500`}>
                      {roundMatches.filter(m => m.status === 'completed').length} / {roundMatches.length} Complete
                    </p>
                  </div>

                  {/* Matches */}
                  <div className="flex flex-col gap-8 justify-around flex-1">
                    {roundMatches.map((match) => (
                      <div key={match.id} className="relative">
                        <MatchCard
                          match={match}
                          participant1Name={getParticipantName(match.participant1Id)}
                          participant2Name={getParticipantName(match.participant2Id)}
                          onClick={() => onMatchClick?.(match)}
                          compact={compact}
                        />
                        
                        {/* Connection line to next round */}
                        {round.roundNumber < bracket.totalRounds && (
                          <div className="absolute top-1/2 -right-8 w-8 h-0.5 bg-gray-300"></div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Third place playoff */}
        {bracket.rounds.find(r => r.roundName === 'Third Place') && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-bold mb-4">Third Place Playoff</h3>
            <div className="flex justify-center">
              {(() => {
                const thirdPlaceRound = bracket.rounds.find(r => r.roundName === 'Third Place');
                const thirdPlaceMatch = thirdPlaceRound ? matches.find(m => m.id === thirdPlaceRound.matches[0]) : null;
                
                return thirdPlaceMatch ? (
                  <MatchCard
                    match={thirdPlaceMatch}
                    participant1Name={getParticipantName(thirdPlaceMatch.participant1Id)}
                    participant2Name={getParticipantName(thirdPlaceMatch.participant2Id)}
                    onClick={() => onMatchClick?.(thirdPlaceMatch)}
                    compact={compact}
                  />
                ) : null;
              })()}
            </div>
          </div>
        )}

        {/* Winner announcement */}
        {bracket.winnerId && (
          <div className="border-t pt-6">
            <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-300">
              <CardContent className="p-6 text-center">
                <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Tournament Champion</h2>
                <p className="text-xl font-semibold text-gray-700">
                  {getParticipantName(bracket.winnerId)}
                </p>
                {bracket.runnerUpId && (
                  <p className="text-sm text-gray-600 mt-2">
                    Runner-up: {getParticipantName(bracket.runnerUpId)}
                  </p>
                )}
                {bracket.thirdPlaceId && (
                  <p className="text-sm text-gray-600">
                    Third Place: {getParticipantName(bracket.thirdPlaceId)}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6">
      {bracket.format === 'single_elimination' && renderSingleEliminationBracket()}
      {bracket.format === 'double_elimination' && (
        <div className="text-center p-8">
          <p className="text-gray-600">Double elimination bracket visualization coming soon</p>
        </div>
      )}
      {bracket.format === 'swiss_system' && (
        <div className="text-center p-8">
          <p className="text-gray-600">Swiss system standings visualization coming soon</p>
        </div>
      )}
    </div>
  );
}
