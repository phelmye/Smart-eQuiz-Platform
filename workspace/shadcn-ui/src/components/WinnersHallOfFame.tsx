import React, { useState, useEffect } from 'react';
import { Trophy, Star, Calendar, Building2, Award, MessageSquare, ExternalLink, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  PrizeAward, 
  Tournament,
  User,
  getPastWinners, 
  getTournamentWinners,
  storage,
  STORAGE_KEYS,
  mockTournaments
} from '@/lib/mockData';

interface WinnersHallOfFameProps {
  tenantId?: string;
  tournamentId?: string; // If specified, show only winners from this tournament
  limit?: number;
  showTestimonials?: boolean;
  compact?: boolean;
}

export const WinnersHallOfFame: React.FC<WinnersHallOfFameProps> = ({
  tenantId,
  tournamentId,
  limit = 10,
  showTestimonials = true,
  compact = false
}) => {
  const [winners, setWinners] = useState<PrizeAward[]>([]);
  const [selectedView, setSelectedView] = useState<'recent' | 'top_champions'>('recent');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWinners();
  }, [tenantId, tournamentId, limit]);

  const loadWinners = () => {
    setLoading(true);
    try {
      let loadedWinners: PrizeAward[];
      
      if (tournamentId) {
        loadedWinners = getTournamentWinners(tournamentId, limit);
      } else {
        loadedWinners = getPastWinners(tenantId, limit);
      }
      
      setWinners(loadedWinners);
    } finally {
      setLoading(false);
    }
  };

  // Get user details
  const getUserDetails = (userId: string): User | null => {
    const users = storage.get(STORAGE_KEYS.USERS) || [];
    return users.find((u: User) => u.id === userId) || null;
  };

  // Get tournament details
  const getTournamentDetails = (tournamentId: string): Tournament | null => {
    return mockTournaments.find(t => t.id === tournamentId) || null;
  };

  // Get medal emoji
  const getMedalEmoji = (position: number): string => {
    if (position === 1) return '🥇';
    if (position === 2) return '🥈';
    if (position === 3) return '🥉';
    return '🏅';
  };

  // Render winner card
  const renderWinnerCard = (award: PrizeAward, index: number) => {
    const user = award.winnerType === 'individual' ? getUserDetails(award.winnerId) : null;
    const tournament = getTournamentDetails(award.tournamentId);
    const medal = getMedalEmoji(award.position);
    const isTopThree = award.position <= 3;

    return (
      <Card 
        key={award.id} 
        className={`${isTopThree ? 'border-2 border-yellow-400 shadow-lg' : ''} ${
          compact ? 'p-3' : ''
        }`}
      >
        <CardContent className={compact ? 'p-4' : 'p-6'}>
          <div className="space-y-4">
            {/* Winner Header */}
            <div className="flex items-start gap-4">
              {/* Medal/Avatar */}
              <div className="relative">
                <Avatar className={compact ? 'h-12 w-12' : 'h-16 w-16'}>
                  <AvatarFallback className={`text-xl ${
                    isTopThree ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100'
                  }`}>
                    {medal}
                  </AvatarFallback>
                </Avatar>
                {award.position <= 3 && (
                  <div className="absolute -top-1 -right-1">
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  </div>
                )}
              </div>

              {/* Winner Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-bold ${compact ? 'text-lg' : 'text-xl'} truncate`}>
                      {award.winnerName}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {award.positionLabel}
                    </p>
                  </div>
                  {award.winnerType === 'parish' && (
                    <Badge variant="secondary" className="flex-shrink-0">
                      <Building2 className="h-3 w-3 mr-1" />
                      Parish
                    </Badge>
                  )}
                </div>

                {/* Tournament Info */}
                {tournament && !tournamentId && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                    <Trophy className="h-3 w-3" />
                    <span className="truncate">{tournament.name}</span>
                  </div>
                )}

                {/* Date */}
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {new Date(award.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Prizes */}
            {award.prizes.length > 0 && (
              <>
                <Separator />
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Prizes Won</p>
                  <div className="space-y-1">
                    {award.prizes.map((prize, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <Award className="h-3 w-3 text-primary flex-shrink-0" />
                        <span className="truncate">{prize.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Sponsor */}
            {award.sponsor && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Building2 className="h-3 w-3" />
                <span>Sponsored by <span className="font-semibold">{award.sponsor.sponsorName}</span></span>
              </div>
            )}

            {/* Testimonial */}
            {showTestimonials && award.testimonial && (
              <>
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-3 w-3 text-muted-foreground" />
                    <p className="text-xs font-semibold text-muted-foreground">Winner's Words</p>
                  </div>
                  <blockquote className="text-sm italic text-muted-foreground border-l-2 border-primary pl-3">
                    "{award.testimonial}"
                  </blockquote>
                </div>
              </>
            )}

            {/* View Profile Link (if individual) */}
            {award.winnerType === 'individual' && user && (
              <Button variant="outline" size="sm" className="w-full">
                <span>View Profile</span>
                <ExternalLink className="h-3 w-3 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Render champions list (top 3 of each tournament)
  const renderChampionsList = () => {
    // Group winners by tournament
    const championsByTournament = winners.reduce((acc, winner) => {
      if (winner.position === 1) {
        if (!acc[winner.tournamentId]) {
          acc[winner.tournamentId] = [];
        }
        acc[winner.tournamentId].push(winner);
      }
      return acc;
    }, {} as Record<string, PrizeAward[]>);

    return (
      <div className="space-y-4">
        {Object.entries(championsByTournament).map(([tournamentId, champions]) => {
          const tournament = getTournamentDetails(tournamentId);
          return (
            <div key={tournamentId}>
              {tournament && (
                <div className="mb-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-yellow-600" />
                    {tournament.name}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {new Date(tournament.startDate).getFullYear()}
                  </p>
                </div>
              )}
              <div className={`grid ${compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'} gap-4`}>
                {champions.map((champion, i) => renderWinnerCard(champion, i))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (winners.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            {tournamentId ? 'No winners have been announced yet.' : 'No past winners to display.'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <Trophy className="h-6 w-6 text-yellow-600" />
          </div>
          <div>
            <h2 className={`font-bold ${compact ? 'text-xl' : 'text-2xl'}`}>
              {tournamentId ? 'Tournament Winners' : 'Hall of Fame'}
            </h2>
            <p className="text-sm text-muted-foreground">
              Celebrating our champions
            </p>
          </div>
        </div>
        {winners.length > 0 && (
          <Badge variant="secondary" className="text-lg px-3 py-1">
            {winners.length} Winner{winners.length !== 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {/* Tabs for different views (only if not showing specific tournament) */}
      {!tournamentId && (
        <Tabs value={selectedView} onValueChange={(v) => setSelectedView(v as any)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="recent">Recent Winners</TabsTrigger>
            <TabsTrigger value="top_champions">Champions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="recent" className="mt-6">
            <div className={`grid ${compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'} gap-4`}>
              {winners.map((winner, i) => renderWinnerCard(winner, i))}
            </div>
          </TabsContent>
          
          <TabsContent value="top_champions" className="mt-6">
            {renderChampionsList()}
          </TabsContent>
        </Tabs>
      )}

      {/* Simple grid for specific tournament */}
      {tournamentId && (
        <div className={`grid ${compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'} gap-4`}>
          {winners.map((winner, i) => renderWinnerCard(winner, i))}
        </div>
      )}
    </div>
  );
};
