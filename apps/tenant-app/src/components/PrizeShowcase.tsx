import React from 'react';
import { Trophy, Award, DollarSign, Medal, Gift, Star, Building2, Users, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { TournamentPrize, PositionPrize, CategoryPrize } from '@/lib/mockData';

interface PrizeShowcaseProps {
  prizeConfig: TournamentPrize;
  showPublicView?: boolean; // If true, respects display settings for public
  compact?: boolean; // Compact view for embedding
}

export const PrizeShowcase: React.FC<PrizeShowcaseProps> = ({ 
  prizeConfig, 
  showPublicView = false,
  compact = false 
}) => {
  // Respect public display settings
  if (showPublicView && !prizeConfig.displaySettings.showPrizesPublicly) {
    return (
      <Alert>
        <Trophy className="h-4 w-4" />
        <AlertDescription>
          Prize information will be announced soon!
        </AlertDescription>
      </Alert>
    );
  }

  const showCashAmounts = !showPublicView || prizeConfig.displaySettings.showCashAmounts;
  const showSponsors = !showPublicView || prizeConfig.displaySettings.showSponsors;

  // Get medal emoji for top 3
  const getMedalEmoji = (position: number): string => {
    if (position === 1) return '🥇';
    if (position === 2) return '🥈';
    if (position === 3) return '🥉';
    return '';
  };

  // Format prize description
  const formatPrizeDescription = (prize: PositionPrize): string[] => {
    const items: string[] = [];
    
    if (prize.cashAmount && showCashAmounts) {
      items.push(`${prize.currency || '$'} ${prize.cashAmount.toLocaleString()}`);
    } else if (prize.cashAmount && !showCashAmounts) {
      items.push('Cash Prize');
    }
    
    if (prize.physicalPrize) {
      items.push(prize.physicalPrize.name);
    }
    
    if (prize.digitalRewards) {
      items.push(...prize.digitalRewards.map(r => r.description));
    }
    
    return items;
  };

  // Render position prize card
  const renderPositionPrize = (prize: PositionPrize, index: number) => {
    const prizeItems = formatPrizeDescription(prize);
    const isTopThree = prize.position <= 3 && !prize.positionRange;
    const medal = getMedalEmoji(prize.position);

    return (
      <Card 
        key={index} 
        className={`${isTopThree ? 'border-2 border-yellow-500 shadow-lg' : ''} ${
          compact ? 'p-3' : ''
        }`}
      >
        <CardHeader className={compact ? 'p-3 pb-2' : ''}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className={`flex items-center gap-2 ${compact ? 'text-lg' : 'text-xl'}`}>
                {medal && <span className="text-2xl">{medal}</span>}
                {prize.positionRange ? (
                  <span>{prize.positionRange.from}{ordinalSuffix(prize.positionRange.from)} - {prize.positionRange.to}{ordinalSuffix(prize.positionRange.to)} Place</span>
                ) : (
                  <span>{prize.position}{ordinalSuffix(prize.position)} Place</span>
                )}
              </CardTitle>
              <CardDescription className="mt-1">
                {prize.label}
              </CardDescription>
            </div>
            {prize.prizeType === 'multiple' && (
              <Badge variant="secondary" className="ml-2">
                <Gift className="h-3 w-3 mr-1" />
                Multiple
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent className={compact ? 'p-3 pt-0' : ''}>
          <div className="space-y-2">
            {prizeItems.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                {prize.cashAmount && i === 0 ? (
                  <DollarSign className="h-4 w-4 text-green-600" />
                ) : prize.physicalPrize && i === (prize.cashAmount ? 1 : 0) ? (
                  <Trophy className="h-4 w-4 text-yellow-600" />
                ) : (
                  <Award className="h-4 w-4 text-blue-600" />
                )}
                <span className={prize.cashAmount && i === 0 ? 'font-semibold text-green-600' : ''}>
                  {item}
                </span>
              </div>
            ))}
            
            {showSponsors && prize.sponsoredBy && (
              <>
                <Separator className="my-2" />
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Building2 className="h-3 w-3" />
                  <span>Sponsored by <span className="font-semibold">{prize.sponsoredBy.sponsorName}</span></span>
                </div>
                {prize.sponsoredBy.sponsorMessage && (
                  <p className="text-xs text-muted-foreground italic">
                    "{prize.sponsoredBy.sponsorMessage}"
                  </p>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Render category prize
  const renderCategoryPrize = (categoryPrize: CategoryPrize, index: number) => {
    return (
      <Card key={index} className="border-purple-200 bg-purple-50">
        <CardHeader className={compact ? 'p-3 pb-2' : ''}>
          <CardTitle className={`flex items-center gap-2 ${compact ? 'text-lg' : 'text-xl'}`}>
            <Star className="h-5 w-5 text-purple-600" />
            {categoryPrize.categoryName}
          </CardTitle>
          {categoryPrize.categoryDescription && (
            <CardDescription>{categoryPrize.categoryDescription}</CardDescription>
          )}
        </CardHeader>
        <CardContent className={compact ? 'p-3 pt-0' : ''}>
          <div className="space-y-3">
            {categoryPrize.prizes.map((prize, i) => {
              const prizeItems = formatPrizeDescription(prize);
              return (
                <div key={i} className="flex items-start gap-2">
                  <Medal className="h-4 w-4 text-purple-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{prize.label}</p>
                    <div className="space-y-1 mt-1">
                      {prizeItems.map((item, j) => (
                        <p key={j} className="text-xs text-muted-foreground">• {item}</p>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Prize Pool Header */}
      {prizeConfig.displaySettings.prizePoolTotal && (
        <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Trophy className="h-6 w-6 text-yellow-600" />
                <h3 className="text-lg font-semibold text-yellow-900">Total Prize Pool</h3>
              </div>
              <p className="text-3xl font-bold text-yellow-700">
                {prizeConfig.displaySettings.prizePoolTotal}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Position-based Prizes */}
      {prizeConfig.positionPrizes && prizeConfig.positionPrizes.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Top Performers</h3>
          </div>
          <div className={`grid ${compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'} gap-4`}>
            {prizeConfig.positionPrizes.map((prize, i) => renderPositionPrize(prize, i))}
          </div>
        </div>
      )}

      {/* Category Prizes */}
      {prizeConfig.categoryPrizes && prizeConfig.categoryPrizes.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-semibold">Special Awards</h3>
          </div>
          <div className={`grid ${compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'} gap-4`}>
            {prizeConfig.categoryPrizes.map((prize, i) => renderCategoryPrize(prize, i))}
          </div>
        </div>
      )}

      {/* Participation Reward */}
      {prizeConfig.participationReward?.enabled && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 mb-1">All Participants Receive</h4>
                <p className="text-sm text-blue-700">{prizeConfig.participationReward.description}</p>
                {prizeConfig.participationReward.digitalRewards && (
                  <div className="mt-2 space-y-1">
                    {prizeConfig.participationReward.digitalRewards.map((reward, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-blue-600">
                        <Sparkles className="h-3 w-3" />
                        <span>{reward.description}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Distribution Notes */}
      {!showPublicView && prizeConfig.distributionNotes && (
        <Alert>
          <AlertDescription className="text-sm">
            <strong>Distribution Notes:</strong> {prizeConfig.distributionNotes}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

// Helper function for ordinal suffix
function ordinalSuffix(num: number): string {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) return 'st';
  if (j === 2 && k !== 12) return 'nd';
  if (j === 3 && k !== 13) return 'rd';
  return 'th';
}
