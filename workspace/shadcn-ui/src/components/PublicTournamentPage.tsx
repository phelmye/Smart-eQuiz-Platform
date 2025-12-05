import React, { useState, useEffect } from 'react';
import { Trophy, Calendar, Users, DollarSign, Clock, Share2, Heart, TrendingUp, Building2, Award, Sparkles, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Tournament,
  TournamentPrize,
  TournamentDonation,
  TournamentApplication,
  getTournamentPrize,
  getTournamentDonations,
  getTournamentDonationTotal,
  getTopDonors,
  getTournamentApplications,
  mockTournaments
} from '@/lib/mockData';
import { PrizeShowcase } from './PrizeShowcase';
import { WinnersHallOfFame } from './WinnersHallOfFame';

interface PublicTournamentPageProps {
  tournamentId: string;
  showNavigation?: boolean;
  onRegister?: () => void;
  onDonate?: () => void;
}

export const PublicTournamentPage: React.FC<PublicTournamentPageProps> = ({
  tournamentId,
  showNavigation = true,
  onRegister,
  onDonate
}) => {
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [prizeConfig, setPrizeConfig] = useState<TournamentPrize | null>(null);
  const [donations, setDonations] = useState<TournamentDonation[]>([]);
  const [donationTotal, setDonationTotal] = useState(0);
  const [applications, setApplications] = useState<TournamentApplication[]>([]);
  const [timeUntilStart, setTimeUntilStart] = useState('');

  useEffect(() => {
    loadTournamentData();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [tournamentId]);

  const loadTournamentData = () => {
    const tournamentData = mockTournaments.find(t => t.id === tournamentId);
    if (tournamentData) {
      setTournament(tournamentData);
      
      // Load prize configuration
      const prizeData = getTournamentPrize(tournamentId);
      setPrizeConfig(prizeData);
      
      // Load donations
      const donationData = getTournamentDonations(tournamentId);
      setDonations(donationData);
      setDonationTotal(getTournamentDonationTotal(tournamentId));
      
      // Load applications
      const appData = getTournamentApplications(tournamentId);
      setApplications(appData);
    }
  };

  const updateCountdown = () => {
    if (!tournament) return;
    
    const now = new Date().getTime();
    const start = new Date(tournament.startDate).getTime();
    const distance = start - now;
    
    if (distance < 0) {
      setTimeUntilStart('Started');
      return;
    }
    
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
    setTimeUntilStart(`${days}d ${hours}h ${minutes}m ${seconds}s`);
  };

  const getStatusBadge = () => {
    if (!tournament) return null;
    
    const statusConfig = {
      scheduled: { label: 'Upcoming', variant: 'secondary' as const },
      active: { label: 'Live Now', variant: 'default' as const },
      completed: { label: 'Completed', variant: 'outline' as const },
      cancelled: { label: 'Cancelled', variant: 'destructive' as const }
    };
    
    const config = statusConfig[tournament.status];
    return <Badge variant={config.variant} className="text-sm">{config.label}</Badge>;
  };

  const getParishCount = () => {
    const parishes = new Set(applications.map(app => app.parishId).filter(Boolean));
    return parishes.size;
  };

  if (!tournament) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">Tournament not found</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                {getStatusBadge()}
                {tournament.status === 'active' && (
                  <Badge variant="destructive" className="animate-pulse">
                    🔴 Live
                  </Badge>
                )}
              </div>
              <h1 className="text-4xl font-bold mb-3">{tournament.name}</h1>
              <p className="text-xl text-blue-100 mb-4">{tournament.description}</p>
              
              {/* Quick Stats */}
              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(tournament.startDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{applications.length} Registered</span>
                </div>
                {getParishCount() > 0 && (
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    <span>{getParishCount()} Parishes</span>
                  </div>
                )}
              </div>
            </div>
            
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>

          {/* Countdown Timer */}
          {tournament.status === 'scheduled' && timeUntilStart && timeUntilStart !== 'Started' && (
            <Card className="border-none shadow-xl">
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Starts in</p>
                  <p className="text-3xl font-bold text-gray-900">{timeUntilStart}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* CTA Buttons */}
          <div className="flex gap-4 mt-6">
            {tournament.status === 'scheduled' && (
              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-blue-50"
                onClick={onRegister}
              >
                <Trophy className="h-5 w-5 mr-2" />
                Register Now
              </Button>
            )}
            {onDonate && (
              <Button 
                size="lg" 
                variant="outline" 
                className="bg-transparent border-white text-white hover:bg-white/10"
                onClick={onDonate}
              >
                <Heart className="h-5 w-5 mr-2" />
                Donate
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Live Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Live Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600">{applications.length}</div>
                    <p className="text-sm text-muted-foreground mt-1">Participants</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-3xl font-bold text-purple-600">{getParishCount()}</div>
                    <p className="text-sm text-muted-foreground mt-1">Parishes</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-3xl font-bold text-green-600">{tournament.spectatorCount}</div>
                    <p className="text-sm text-muted-foreground mt-1">Watching</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Prizes */}
            {prizeConfig && prizeConfig.displaySettings.showPrizesPublicly && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-600" />
                    Prizes & Rewards
                  </CardTitle>
                  <CardDescription>Win amazing prizes!</CardDescription>
                </CardHeader>
                <CardContent>
                  <PrizeShowcase prizeConfig={prizeConfig} showPublicView={true} compact={true} />
                </CardContent>
              </Card>
            )}

            {/* Past Winners (if completed tournament) */}
            {tournament.status === 'completed' && (
              <WinnersHallOfFame tournamentId={tournamentId} limit={5} compact={true} />
            )}

            {/* About */}
            <Card>
              <CardHeader>
                <CardTitle>About This Tournament</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Category</h4>
                  <Badge>{tournament.category}</Badge>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Difficulty</h4>
                  <Badge variant="outline">{tournament.difficulty}</Badge>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Tournament Details</h4>
                  <p className="text-sm text-muted-foreground">{tournament.description}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Donation Progress (if enabled) */}
            {onDonate && donationTotal > 0 && (
              <Card className="border-2 border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Heart className="h-5 w-5 text-red-500" />
                    Support This Tournament
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Raised</span>
                      <span className="font-bold">${donationTotal.toLocaleString()}</span>
                    </div>
                    <Progress value={65} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-2">
                      {donations.length} donation{donations.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  
                  <Button className="w-full" onClick={onDonate}>
                    <Heart className="h-4 w-4 mr-2" />
                    Donate Now
                  </Button>

                  {/* Top Donors */}
                  {donations.length > 0 && (
                    <div>
                      <Separator className="my-3" />
                      <h4 className="font-semibold text-sm mb-3">Top Supporters</h4>
                      <div className="space-y-2">
                        {getTopDonors(tournamentId, 5).map((donation, i) => (
                          <div key={donation.id} className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2">
                              <Award className="h-3 w-3 text-yellow-600" />
                              {donation.donorName}
                            </span>
                            <span className="font-semibold">${donation.amount}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tournament Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Start Date</span>
                  <span className="font-medium">
                    {new Date(tournament.startDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">End Date</span>
                  <span className="font-medium">
                    {new Date(tournament.endDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Max Participants</span>
                  <span className="font-medium">{tournament.maxParticipants}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Category</span>
                  <Badge variant="secondary">{tournament.category}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Registration Status */}
            {tournament.status === 'scheduled' && (
              <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
                <CardContent className="p-6 text-center">
                  <Sparkles className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                  <h3 className="font-bold text-lg mb-2">Spots Available!</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {tournament.maxParticipants - applications.length} of {tournament.maxParticipants} spots remaining
                  </p>
                  <Button className="w-full" size="lg" onClick={onRegister}>
                    Register Now
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
