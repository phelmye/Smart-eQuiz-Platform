import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Crown, Users, Building2, Trophy, TrendingUp } from 'lucide-react';
import {
  Tournament,
  TournamentApplication,
  getParishById,
  getParishLeaderboard,
  getTournamentApplications,
  getFieldLabels,
  ParishTournamentStats,
  storage,
  STORAGE_KEYS,
  User
} from '@/lib/mockData';

interface DualLeaderboardProps {
  tournament: Tournament;
  tenantId: string;
}

export const DualLeaderboard: React.FC<DualLeaderboardProps> = ({ tournament, tenantId }) => {
  const [individualLeaderboard, setIndividualLeaderboard] = useState<TournamentApplication[]>([]);
  const [parishLeaderboard, setParishLeaderboard] = useState<ParishTournamentStats[]>([]);
  const fieldLabels = getFieldLabels(tenantId);

  // Helper function to get user by ID
  const getUserById = (userId: string): User | null => {
    const users = storage.get(STORAGE_KEYS.USERS);
    if (!users) return null;
    return users.find((u: User) => u.id === userId) || null;
  };

  useEffect(() => {
    loadLeaderboards();
  }, [tournament.id]);

  const loadLeaderboards = () => {
    // Get all applications for this tournament
    const applications = getTournamentApplications(tournament.id);
    
    // Individual leaderboard: Sort by final score
    const qualifiedApps = applications.filter(app => 
      app.status === 'qualified' || app.status === 'auto_qualified'
    );
    const sortedIndividual = qualifiedApps
      .filter(app => app.finalScore !== undefined)
      .sort((a, b) => (b.finalScore || 0) - (a.finalScore || 0));
    
    setIndividualLeaderboard(sortedIndividual);

    // Parish leaderboard
    if (tournament.parishScoringConfig?.enabled) {
      const parishStats = getParishLeaderboard(tournament.id);
      setParishLeaderboard(parishStats);
    }
  };

  const getRankBadge = (index: number) => {
    if (index === 0) return { bg: 'bg-yellow-500', icon: '🥇', text: 'text-white' };
    if (index === 1) return { bg: 'bg-gray-400', icon: '🥈', text: 'text-white' };
    if (index === 2) return { bg: 'bg-amber-600', icon: '🥉', text: 'text-white' };
    return { bg: 'bg-gray-200', icon: '', text: 'text-gray-600' };
  };

  const displayMode = tournament.parishScoringConfig?.displayMode || 'dual';
  const showIndividual = displayMode === 'individual_only' || displayMode === 'dual';
  const showParish = displayMode === 'parish_only' || displayMode === 'dual';

  // If only one view is enabled, show it directly
  if (showIndividual && !showParish) {
    return <IndividualLeaderboardView applications={individualLeaderboard} getUserById={getUserById} />;
  }

  if (showParish && !showIndividual) {
    return <ParishLeaderboardView stats={parishLeaderboard} fieldLabels={fieldLabels} />;
  }

  // Dual mode: Show tabs
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
          Tournament Leaderboards
        </CardTitle>
        <CardDescription>
          View rankings by individual performance and {fieldLabels.parishSingular.toLowerCase()} teams
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="individual" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="individual" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Individual
            </TabsTrigger>
            <TabsTrigger value="parish" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              {fieldLabels.parishPlural}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="individual" className="mt-6">
            <IndividualLeaderboardView applications={individualLeaderboard} getUserById={getUserById} />
          </TabsContent>

          <TabsContent value="parish" className="mt-6">
            <ParishLeaderboardView stats={parishLeaderboard} fieldLabels={fieldLabels} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

// Individual Leaderboard Component
const IndividualLeaderboardView: React.FC<{ 
  applications: TournamentApplication[];
  getUserById: (userId: string) => User | null;
}> = ({ applications, getUserById }) => {
  const getRankBadge = (index: number) => {
    if (index === 0) return { bg: 'bg-yellow-500', icon: '🥇', text: 'text-white' };
    if (index === 1) return { bg: 'bg-gray-400', icon: '🥈', text: 'text-white' };
    if (index === 2) return { bg: 'bg-amber-600', icon: '🥉', text: 'text-white' };
    return { bg: 'bg-gray-200', icon: '', text: 'text-gray-600' };
  };

  if (applications.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <p>No participants have qualified yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {applications.map((app, index) => {
        const user = getUserById(app.userId);
        if (!user) return null;

        const rankStyle = getRankBadge(index);
        const displayName = app.participationType === 'parish' && app.parishDisplayName 
          ? app.parishDisplayName 
          : user.name;

        return (
          <div
            key={app.id}
            className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center space-x-4 flex-1">
              {/* Rank Badge */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${rankStyle.bg} ${rankStyle.text}`}>
                {rankStyle.icon || (index + 1)}
              </div>

              {/* User Avatar & Name */}
              <Avatar className="w-10 h-10">
                <AvatarFallback className="text-sm bg-blue-500 text-white">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900">{displayName}</p>
                  {app.participationType === 'parish' && (
                    <Badge variant="outline" className="text-xs">
                      <Building2 className="h-3 w-3 mr-1" />
                      {app.parishDisplayName}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-gray-600">
                  {app.qualificationPathway === 'practice_points' ? '⭐ Auto-Qualified' : '📝 Quiz Qualified'}
                </p>
              </div>
            </div>

            {/* Score */}
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600">{app.finalScore}%</p>
              <p className="text-xs text-gray-500">
                {app.scoringMethodUsed && `(${app.scoringMethodUsed})`}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Parish Leaderboard Component
const ParishLeaderboardView: React.FC<{ 
  stats: ParishTournamentStats[]; 
  fieldLabels: ReturnType<typeof getFieldLabels>;
}> = ({ stats, fieldLabels }) => {
  const getRankBadge = (index: number) => {
    if (index === 0) return { bg: 'bg-yellow-500', icon: '🥇', text: 'text-white' };
    if (index === 1) return { bg: 'bg-gray-400', icon: '🥈', text: 'text-white' };
    if (index === 2) return { bg: 'bg-amber-600', icon: '🥉', text: 'text-white' };
    return { bg: 'bg-gray-200', icon: '', text: 'text-gray-600' };
  };

  if (stats.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <p>No {fieldLabels.parishPlural.toLowerCase()} have participated yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {stats.map((stat, index) => {
        const parish = getParishById(stat.parishId);
        const rankStyle = getRankBadge(index);

        return (
          <div
            key={stat.id}
            className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 transition-colors"
          >
            <div className="flex items-center space-x-4 flex-1">
              {/* Rank Badge */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${rankStyle.bg} ${rankStyle.text}`}>
                {rankStyle.icon || (index + 1)}
              </div>

              {/* Parish Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Building2 className="h-4 w-4 text-blue-600" />
                  <p className="font-semibold text-gray-900">{stat.parishDisplayName || stat.parishName}</p>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-600">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {stat.activeMembers.length} active
                  </span>
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    Avg: {stat.averageScore.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Score */}
            <div className="text-right">
              <p className="text-2xl font-bold text-purple-600">{stat.finalScore.toFixed(2)}</p>
              <p className="text-xs text-gray-500">
                {stat.totalScore.toFixed(0)} total
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DualLeaderboard;
