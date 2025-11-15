import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ArrowLeft, Calendar, Users, Trophy, DollarSign, Settings, Play, Shield, Target, Layers, BookTemplate, Tags } from 'lucide-react';
import { useAuth } from './AuthSystem';
import { 
  storage, 
  STORAGE_KEYS, 
  Tournament, 
  Question, 
  BIBLE_CATEGORIES, 
  hasPermission,
  TOURNAMENT_FEATURES,
  hasTournamentFeatureAccess,
  getRequiredPlanForFeature,
  getAllParishes,
  RoundQuestionConfig
} from '@/lib/mockData';
import { UpgradePrompt } from './UpgradePrompt';
import RoundQuestionConfigBuilder from './RoundQuestionConfigBuilder';
import { TemplateLibrary } from './TemplateLibrary';
import { CustomCategoryManager } from './CustomCategoryManager';

interface TournamentBuilderProps {
  onBack: () => void;
  onNavigate: (page: string) => void;
}

export const TournamentBuilder: React.FC<TournamentBuilderProps> = ({ onBack, onNavigate }) => {
  const { user, tenant } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
  const [parishes, setParishes] = useState<any[]>([]);
  const [roundConfigDialogOpen, setRoundConfigDialogOpen] = useState(false);
  const [templateLibraryOpen, setTemplateLibraryOpen] = useState(false);
  const [customCategoryOpen, setCustomCategoryOpen] = useState(false);
  const [tournament, setTournament] = useState({
    name: '',
    description: '',
    category: '',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    entryFee: 0,
    prizePool: 0,
    maxParticipants: 50,
    startDate: '',
    endDate: '',
    selectedQuestions: [] as string[],
    autoSelectQuestions: true,
    questionCount: 10,
    timeLimit: 30,
    allowSpectators: true,
    requireApproval: false,
    // Participation config
    participationMode: 'individual' as 'individual' | 'parish' | 'both',
    maxParticipantsPerParish: undefined as number | undefined,
    minParticipantsPerParish: undefined as number | undefined,
    // Parish scoring config
    enableParishScoring: false,
    parishScoringMethod: 'average' as 'average' | 'total' | 'topN' | 'weighted',
    topNCount: 5,
    parishDisplayMode: 'dual' as 'parish_only' | 'individual_only' | 'dual',
    // Eligibility restrictions
    enableEligibility: false,
    ageMin: undefined as number | undefined,
    ageMax: undefined as number | undefined,
    allowedGenders: [] as Array<'male' | 'female' | 'other' | 'prefer_not_to_say'>,
    allowedParishes: [] as string[],
    requiredProfileCompletion: undefined as number | undefined,
    // Knockout tournament config
    tournamentFormat: 'standard' as 'standard' | 'single_elimination' | 'double_elimination' | 'swiss_system',
    seedingMethod: 'qualification_score' as 'random' | 'qualification_score' | 'practice_points' | 'manual' | 'registration_order',
    matchType: 'head_to_head' as 'head_to_head' | 'simultaneous_quiz',
    questionsPerMatch: 10,
    matchTimeLimit: 15,
    thirdPlacePlayoff: false,
    autoScheduleMatches: true,
    roundQuestionConfigs: [] as any[] // Will be populated when configuring rounds
  });

  useEffect(() => {
    loadQuestions();
    loadParishes();
  }, [user, tenant]);

  const loadQuestions = () => {
    const savedQuestions = storage.get(STORAGE_KEYS.QUESTIONS) || [];
    const tenantQuestions = savedQuestions.filter((q: Question) => 
      user?.role === 'super_admin' || q.tenantId === user?.tenantId
    );
    setAvailableQuestions(tenantQuestions);
  };

  const loadParishes = () => {
    const allParishes = getAllParishes();
    const tenantParishes = allParishes.filter(p => p.tenantId === user?.tenantId);
    setParishes(tenantParishes);
  };

  const handleCreateTournament = () => {
    if (!tournament.name || !tournament.category || !tournament.startDate || !tournament.endDate) {
      alert('Please fill in all required fields');
      return;
    }

    let selectedQuestions = tournament.selectedQuestions;
    
    if (tournament.autoSelectQuestions) {
      const categoryQuestions = availableQuestions.filter(q => 
        tournament.category === 'General Knowledge' || q.category === tournament.category
      );
      const difficultyQuestions = categoryQuestions.filter(q => q.difficulty === tournament.difficulty);
      const questionsToUse = difficultyQuestions.length >= tournament.questionCount 
        ? difficultyQuestions 
        : categoryQuestions;
      
      selectedQuestions = questionsToUse
        .sort(() => Math.random() - 0.5)
        .slice(0, tournament.questionCount)
        .map(q => q.id);
    }

    const newTournament: Tournament = {
      id: `tournament${Date.now()}`,
      name: tournament.name,
      description: tournament.description,
      category: tournament.category,
      difficulty: tournament.difficulty,
      entryFee: tournament.entryFee,
      prizePool: tournament.prizePool,
      maxParticipants: tournament.maxParticipants,
      currentParticipants: 0,
      spectatorCount: 0,
      startDate: new Date(tournament.startDate).toISOString(),
      endDate: new Date(tournament.endDate).toISOString(),
      status: 'scheduled',
      participants: [],
      spectators: [],
      questions: selectedQuestions,
      createdBy: user?.id || 'user1',
      tenantId: user?.tenantId || 'tenant1',
      createdAt: new Date().toISOString(),
      // Participation config
      participationConfig: tournament.participationMode !== 'individual' ? {
        mode: tournament.participationMode,
        maxParticipantsPerParish: tournament.maxParticipantsPerParish,
        minParticipantsPerParish: tournament.minParticipantsPerParish,
        allowParishCaptains: false,
        allowMultiParishTeams: false
      } : undefined,
      // Parish scoring config
      parishScoringConfig: tournament.enableParishScoring ? {
        enabled: true,
        scoringMethod: tournament.parishScoringMethod,
        topNCount: tournament.parishScoringMethod === 'topN' ? tournament.topNCount : undefined,
        displayMode: tournament.parishDisplayMode
      } : undefined,
      // Eligibility restrictions
      eligibilityRestrictions: tournament.enableEligibility ? {
        enabled: true,
        ageMin: tournament.ageMin,
        ageMax: tournament.ageMax,
        allowedGenders: tournament.allowedGenders.length > 0 ? tournament.allowedGenders : undefined,
        allowedParishes: tournament.allowedParishes.length > 0 ? tournament.allowedParishes : undefined,
        requiredProfileCompletion: tournament.requiredProfileCompletion
      } : undefined
    };

    const allTournaments = storage.get(STORAGE_KEYS.TOURNAMENTS) || [];
    allTournaments.push(newTournament);
    storage.set(STORAGE_KEYS.TOURNAMENTS, allTournaments);

    alert('Tournament created successfully!');
    onBack();
  };

  const getFilteredQuestions = () => {
    return availableQuestions.filter(q => 
      tournament.category === 'General Knowledge' || q.category === tournament.category
    );
  };

  const steps = [
    { id: 1, title: 'Basic Info', icon: Settings },
    { id: 2, title: 'Participants', icon: Users },
    { id: 3, title: 'Advanced', icon: Shield },
    { id: 4, title: 'Prizes', icon: Trophy },
    { id: 5, title: 'Questions', icon: Target },
    { id: 6, title: 'Schedule', icon: Calendar },
    { id: 7, title: 'Review', icon: Play }
  ];

  if (!user || !hasPermission(user, 'tournaments.create')) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-bold text-red-600 mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-4">You need admin privileges to create tournaments.</p>
            <Button onClick={onBack}>Back to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create Tournament</h1>
              <p className="text-gray-600">Set up a new Bible quiz tournament</p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    isActive ? 'border-blue-600 bg-blue-600 text-white' :
                    isCompleted ? 'border-green-600 bg-green-600 text-white' :
                    'border-gray-300 bg-white text-gray-400'
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-0.5 ml-4 ${isCompleted ? 'bg-green-600' : 'bg-gray-300'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <Card>
          <CardContent className="p-6">
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Tournament Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tournament-name">Tournament Name *</Label>
                      <Input
                        id="tournament-name"
                        value={tournament.name}
                        onChange={(e) => setTournament(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter tournament name"
                      />
                    </div>
                    
                    <div>
                      <Label>Category *</Label>
                      <Select value={tournament.category} onValueChange={(value) => setTournament(prev => ({ ...prev, category: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="General Knowledge">General Knowledge</SelectItem>
                          {BIBLE_CATEGORIES.map(category => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={tournament.description}
                      onChange={(e) => setTournament(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe your tournament..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div>
                      <Label>Difficulty</Label>
                      <Select value={tournament.difficulty} onValueChange={(value) => setTournament(prev => ({ ...prev, difficulty: value as 'easy' | 'medium' | 'hard' }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="entry-fee">Entry Fee ($)</Label>
                      <Input
                        id="entry-fee"
                        type="number"
                        min="0"
                        step="0.01"
                        value={tournament.entryFee}
                        onChange={(e) => setTournament(prev => ({ ...prev, entryFee: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="prize-pool">Prize Pool ($)</Label>
                      <Input
                        id="prize-pool"
                        type="number"
                        min="0"
                        step="0.01"
                        value={tournament.prizePool}
                        onChange={(e) => setTournament(prev => ({ ...prev, prizePool: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Participant Settings</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="max-participants">Maximum Participants</Label>
                      <Input
                        id="max-participants"
                        type="number"
                        min="1"
                        max="1000"
                        value={tournament.maxParticipants}
                        onChange={(e) => setTournament(prev => ({ ...prev, maxParticipants: parseInt(e.target.value) || 50 }))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="time-limit">Time Limit (minutes per question)</Label>
                      <Input
                        id="time-limit"
                        type="number"
                        min="10"
                        max="300"
                        value={tournament.timeLimit}
                        onChange={(e) => setTournament(prev => ({ ...prev, timeLimit: parseInt(e.target.value) || 30 }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-4 mt-6">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="allow-spectators"
                        checked={tournament.allowSpectators}
                        onCheckedChange={(checked) => setTournament(prev => ({ ...prev, allowSpectators: !!checked }))}
                      />
                      <Label htmlFor="allow-spectators">Allow spectators to watch</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="require-approval"
                        checked={tournament.requireApproval}
                        onCheckedChange={(checked) => setTournament(prev => ({ ...prev, requireApproval: !!checked }))}
                      />
                      <Label htmlFor="require-approval">Require admin approval for participants</Label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-purple-600" />
                    Advanced Tournament Features
                  </h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Configure parish/group participation, scoring methods, and eligibility restrictions
                  </p>

                  {/* Tournament Format Section */}
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center">
                        <Trophy className="h-4 w-4 mr-2" />
                        Tournament Format
                      </CardTitle>
                      <CardDescription>
                        Choose between standard or knockout tournament formats
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {hasTournamentFeatureAccess(user?.tenantId || '', TOURNAMENT_FEATURES.KNOCKOUT_TOURNAMENTS) ? (
                        <div className="space-y-4">
                          <div>
                            <Label>Format Type</Label>
                            <Select 
                              value={tournament.tournamentFormat || 'standard'} 
                              onValueChange={(value) => setTournament(prev => ({ 
                                ...prev, 
                                tournamentFormat: value as any
                              }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="standard">Standard (All participants compete)</SelectItem>
                                <SelectItem value="single_elimination">Single Elimination Bracket</SelectItem>
                                <SelectItem value="double_elimination" disabled={!hasTournamentFeatureAccess(user?.tenantId || '', TOURNAMENT_FEATURES.DOUBLE_ELIMINATION)}>
                                  Double Elimination Bracket {!hasTournamentFeatureAccess(user?.tenantId || '', TOURNAMENT_FEATURES.DOUBLE_ELIMINATION) && '(Enterprise)'}
                                </SelectItem>
                                <SelectItem value="swiss_system" disabled={!hasTournamentFeatureAccess(user?.tenantId || '', TOURNAMENT_FEATURES.SWISS_SYSTEM)}>
                                  Swiss System {!hasTournamentFeatureAccess(user?.tenantId || '', TOURNAMENT_FEATURES.SWISS_SYSTEM) && '(Enterprise)'}
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-gray-500 mt-1">
                              {(!tournament.tournamentFormat || tournament.tournamentFormat === 'standard') && 'Traditional format - all participants compete at the same time'}
                              {tournament.tournamentFormat === 'single_elimination' && 'Bracket-style tournament - lose once and you\'re eliminated'}
                              {tournament.tournamentFormat === 'double_elimination' && 'Two chances - participants must lose twice to be eliminated'}
                              {tournament.tournamentFormat === 'swiss_system' && 'Round-based pairing - no elimination, best overall record wins'}
                            </p>
                          </div>

                          {tournament.tournamentFormat && tournament.tournamentFormat !== 'standard' && (
                            <div className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <Label>Seeding Method</Label>
                                  <Select 
                                    value={tournament.seedingMethod || 'qualification_score'} 
                                    onValueChange={(value) => setTournament(prev => ({ 
                                      ...prev, 
                                      seedingMethod: value as any
                                    }))}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="qualification_score">By Qualification Score</SelectItem>
                                      <SelectItem value="practice_points">By Practice Points</SelectItem>
                                      <SelectItem value="registration_order">Registration Order</SelectItem>
                                      <SelectItem value="random">Random</SelectItem>
                                      <SelectItem value="manual">Manual (Admin assigns)</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div>
                                  <Label>Match Type</Label>
                                  <Select 
                                    value={tournament.matchType || 'head_to_head'} 
                                    onValueChange={(value) => setTournament(prev => ({ 
                                      ...prev, 
                                      matchType: value as any
                                    }))}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="head_to_head">Head-to-Head Quiz</SelectItem>
                                      <SelectItem value="simultaneous_quiz">Simultaneous Quiz (Same questions)</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div>
                                  <Label>Questions per Match</Label>
                                  <Input
                                    type="number"
                                    min="5"
                                    max="50"
                                    value={tournament.questionsPerMatch || 10}
                                    onChange={(e) => setTournament(prev => ({ 
                                      ...prev, 
                                      questionsPerMatch: parseInt(e.target.value) || 10 
                                    }))}
                                  />
                                </div>

                                <div>
                                  <Label>Match Time Limit (minutes)</Label>
                                  <Input
                                    type="number"
                                    min="5"
                                    max="60"
                                    value={tournament.matchTimeLimit || 15}
                                    onChange={(e) => setTournament(prev => ({ 
                                      ...prev, 
                                      matchTimeLimit: parseInt(e.target.value) || 15 
                                    }))}
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id="third-place"
                                    checked={tournament.thirdPlacePlayoff || false}
                                    onCheckedChange={(checked) => setTournament(prev => ({ 
                                      ...prev, 
                                      thirdPlacePlayoff: !!checked 
                                    }))}
                                  />
                                  <Label htmlFor="third-place">
                                    Third place playoff
                                  </Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id="auto-schedule"
                                    checked={tournament.autoScheduleMatches !== false}
                                    onCheckedChange={(checked) => setTournament(prev => ({ 
                                      ...prev, 
                                      autoScheduleMatches: !!checked 
                                    }))}
                                  />
                                  <Label htmlFor="auto-schedule">
                                    Auto-schedule matches
                                  </Label>
                                </div>
                              </div>

                              <div className="bg-white p-3 rounded border border-blue-300">
                                <p className="text-xs text-blue-800 font-medium mb-1">
                                  🏆 Knockout Tournament Features:
                                </p>
                                <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                                  <li>Automatic bracket generation based on participant count</li>
                                  <li>Visual bracket display with match tracking</li>
                                  <li>Match management and result recording</li>
                                  <li>Automatic winner advancement to next round</li>
                                  <li>Bye assignment for non-power-of-2 participants</li>
                                </ul>
                              </div>

                              {/* Round Question Configuration Button */}
                              <div className="border-t pt-4 space-y-3">
                                <div className="flex items-center justify-between mb-2">
                                  <div>
                                    <Label className="text-base flex items-center gap-2">
                                      <Layers className="w-4 h-4" />
                                      Round-Specific Questions
                                    </Label>
                                    <p className="text-xs text-gray-600 mt-1">
                                      Configure unique question categories and delivery modes for each round
                                    </p>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setTemplateLibraryOpen(true)}
                                    >
                                      <BookTemplate className="w-4 h-4 mr-2" />
                                      Templates
                                    </Button>
                                    <Button
                                      variant="outline"
                                      onClick={() => setRoundConfigDialogOpen(true)}
                                    >
                                      <Settings className="w-4 h-4 mr-2" />
                                      Configure Rounds
                                    </Button>
                                  </div>
                                </div>

                                {/* Custom Categories Button (Enterprise) */}
                                {hasTournamentFeatureAccess(user, TOURNAMENT_FEATURES.CUSTOM_CATEGORIES) && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                    onClick={() => setCustomCategoryOpen(true)}
                                  >
                                    <Tags className="w-4 h-4 mr-2" />
                                    Manage Custom Categories
                                  </Button>
                                )}
                                
                                {tournament.roundQuestionConfigs && tournament.roundQuestionConfigs.length > 0 && (
                                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <p className="text-sm text-green-800 font-medium">
                                      ✓ {tournament.roundQuestionConfigs.length} rounds configured with custom question settings
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <UpgradePrompt
                          feature="Knockout Tournament Format"
                          requiredPlan={getRequiredPlanForFeature(TOURNAMENT_FEATURES.KNOCKOUT_TOURNAMENTS) || 'Professional'}
                          description="Run bracket-style elimination tournaments with automatic bracket generation"
                          benefits={[
                            'Single & double elimination formats',
                            'Swiss system tournaments (Enterprise)',
                            'Visual bracket displays',
                            'Automatic match pairing and advancement',
                            'Third-place playoffs'
                          ]}
                          size="small"
                        />
                      )}
                    </CardContent>
                  </Card>

                  {/* Participation Mode Section */}
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        Participation Mode
                      </CardTitle>
                      <CardDescription>
                        Choose how participants can register for this tournament
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {hasTournamentFeatureAccess(user?.tenantId || '', TOURNAMENT_FEATURES.PARISH_GROUP_MODE) ? (
                        <div className="space-y-4">
                          <div>
                            <Label>Participation Type</Label>
                            <Select 
                              value={tournament.participationMode} 
                              onValueChange={(value) => setTournament(prev => ({ 
                                ...prev, 
                                participationMode: value as 'individual' | 'parish' | 'both' 
                              }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="individual">Individual Only</SelectItem>
                                <SelectItem value="parish">Parish/Group Only</SelectItem>
                                <SelectItem value="both">Both (Individual + Parish)</SelectItem>
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-gray-500 mt-1">
                              {tournament.participationMode === 'individual' && 'Participants compete as individuals'}
                              {tournament.participationMode === 'parish' && 'Participants must register as part of a parish/group'}
                              {tournament.participationMode === 'both' && 'Participants can choose to compete individually or as part of a parish/group'}
                            </p>
                          </div>

                          {tournament.participationMode !== 'individual' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                              <div>
                                <Label htmlFor="min-parish-participants">Min per Parish (optional)</Label>
                                <Input
                                  id="min-parish-participants"
                                  type="number"
                                  min="1"
                                  placeholder="e.g., 3"
                                  value={tournament.minParticipantsPerParish || ''}
                                  onChange={(e) => setTournament(prev => ({ 
                                    ...prev, 
                                    minParticipantsPerParish: e.target.value ? parseInt(e.target.value) : undefined 
                                  }))}
                                />
                              </div>
                              <div>
                                <Label htmlFor="max-parish-participants">Max per Parish (optional)</Label>
                                <Input
                                  id="max-parish-participants"
                                  type="number"
                                  min="1"
                                  placeholder="e.g., 10"
                                  value={tournament.maxParticipantsPerParish || ''}
                                  onChange={(e) => setTournament(prev => ({ 
                                    ...prev, 
                                    maxParticipantsPerParish: e.target.value ? parseInt(e.target.value) : undefined 
                                  }))}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <UpgradePrompt
                          feature="Parish/Group Tournament Mode"
                          requiredPlan={getRequiredPlanForFeature(TOURNAMENT_FEATURES.PARISH_GROUP_MODE) || 'Professional'}
                          description="Enable team-based competition where parishes or groups compete together"
                          benefits={[
                            'Allow parishes/groups to compete as teams',
                            'Track parish-level scores and rankings',
                            'Build community engagement',
                            'Control participants per parish'
                          ]}
                          size="small"
                        />
                      )}
                    </CardContent>
                  </Card>

                  {/* Parish Scoring Section */}
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center">
                        <Trophy className="h-4 w-4 mr-2" />
                        Parish Scoring
                      </CardTitle>
                      <CardDescription>
                        Configure how parish/group scores are calculated
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {hasTournamentFeatureAccess(user?.tenantId || '', TOURNAMENT_FEATURES.PARISH_SCORING) ? (
                        <div className="space-y-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="enable-parish-scoring"
                              checked={tournament.enableParishScoring}
                              onCheckedChange={(checked) => setTournament(prev => ({ 
                                ...prev, 
                                enableParishScoring: !!checked 
                              }))}
                              disabled={tournament.participationMode === 'individual'}
                            />
                            <Label htmlFor="enable-parish-scoring">
                              Enable parish/group scoring
                            </Label>
                          </div>

                          {tournament.enableParishScoring && (
                            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                              <div>
                                <Label>Scoring Method</Label>
                                <Select 
                                  value={tournament.parishScoringMethod} 
                                  onValueChange={(value) => setTournament(prev => ({ 
                                    ...prev, 
                                    parishScoringMethod: value as 'average' | 'total' | 'topN' | 'weighted' 
                                  }))}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="average">Average (Total ÷ Active Members)</SelectItem>
                                    <SelectItem value="total">Total (Sum of All Scores)</SelectItem>
                                    <SelectItem value="topN">Top N (Best N Scores)</SelectItem>
                                    <SelectItem value="weighted">Weighted (With Participation Bonus)</SelectItem>
                                  </SelectContent>
                                </Select>
                                <p className="text-xs text-gray-500 mt-1">
                                  {tournament.parishScoringMethod === 'average' && 'Fair for groups with different sizes'}
                                  {tournament.parishScoringMethod === 'total' && 'Rewards larger participation'}
                                  {tournament.parishScoringMethod === 'topN' && 'Quality over quantity'}
                                  {tournament.parishScoringMethod === 'weighted' && 'Average with participation rate bonus'}
                                </p>
                              </div>

                              {tournament.parishScoringMethod === 'topN' && (
                                <div>
                                  <Label htmlFor="top-n-count">Number of Top Scores</Label>
                                  <Input
                                    id="top-n-count"
                                    type="number"
                                    min="1"
                                    max="20"
                                    value={tournament.topNCount}
                                    onChange={(e) => setTournament(prev => ({ 
                                      ...prev, 
                                      topNCount: parseInt(e.target.value) || 5 
                                    }))}
                                  />
                                </div>
                              )}

                              <div>
                                <Label>Leaderboard Display</Label>
                                <Select 
                                  value={tournament.parishDisplayMode} 
                                  onValueChange={(value) => setTournament(prev => ({ 
                                    ...prev, 
                                    parishDisplayMode: value as 'parish_only' | 'individual_only' | 'dual' 
                                  }))}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="parish_only">Parish Names Only</SelectItem>
                                    <SelectItem value="individual_only">Individual Names Only</SelectItem>
                                    <SelectItem value="dual">Both (Dual Leaderboards)</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <UpgradePrompt
                          feature="Parish Scoring System"
                          requiredPlan={getRequiredPlanForFeature(TOURNAMENT_FEATURES.PARISH_SCORING) || 'Professional'}
                          description="Calculate and display parish/group scores with multiple scoring methods"
                          benefits={[
                            'Average, total, or top-N scoring methods',
                            'Weighted scoring with participation bonus',
                            'Dual leaderboards (parish + individual)',
                            'Automatic score calculation'
                          ]}
                          size="small"
                        />
                      )}
                    </CardContent>
                  </Card>

                  {/* Eligibility Restrictions Section */}
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center">
                        <Target className="h-4 w-4 mr-2" />
                        Eligibility Restrictions
                      </CardTitle>
                      <CardDescription>
                        Control who can apply to this tournament
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {hasTournamentFeatureAccess(user?.tenantId || '', TOURNAMENT_FEATURES.ELIGIBILITY_RESTRICTIONS) ? (
                        <div className="space-y-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="enable-eligibility"
                              checked={tournament.enableEligibility}
                              onCheckedChange={(checked) => setTournament(prev => ({ 
                                ...prev, 
                                enableEligibility: !!checked 
                              }))}
                            />
                            <Label htmlFor="enable-eligibility">
                              Enable eligibility restrictions
                            </Label>
                          </div>

                          {tournament.enableEligibility && (
                            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                              {/* Age Restrictions */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="age-min">Minimum Age (optional)</Label>
                                  <Input
                                    id="age-min"
                                    type="number"
                                    min="1"
                                    max="100"
                                    placeholder="e.g., 18"
                                    value={tournament.ageMin || ''}
                                    onChange={(e) => setTournament(prev => ({ 
                                      ...prev, 
                                      ageMin: e.target.value ? parseInt(e.target.value) : undefined 
                                    }))}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="age-max">Maximum Age (optional)</Label>
                                  <Input
                                    id="age-max"
                                    type="number"
                                    min="1"
                                    max="100"
                                    placeholder="e.g., 65"
                                    value={tournament.ageMax || ''}
                                    onChange={(e) => setTournament(prev => ({ 
                                      ...prev, 
                                      ageMax: e.target.value ? parseInt(e.target.value) : undefined 
                                    }))}
                                  />
                                </div>
                              </div>

                              {/* Gender Restrictions */}
                              <div>
                                <Label>Allowed Genders (leave empty for all)</Label>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                  {(['male', 'female', 'other', 'prefer_not_to_say'] as const).map((gender) => (
                                    <div key={gender} className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`gender-${gender}`}
                                        checked={tournament.allowedGenders.includes(gender)}
                                        onCheckedChange={(checked) => {
                                          if (checked) {
                                            setTournament(prev => ({
                                              ...prev,
                                              allowedGenders: [...prev.allowedGenders, gender]
                                            }));
                                          } else {
                                            setTournament(prev => ({
                                              ...prev,
                                              allowedGenders: prev.allowedGenders.filter(g => g !== gender)
                                            }));
                                          }
                                        }}
                                      />
                                      <Label htmlFor={`gender-${gender}`} className="text-sm capitalize">
                                        {gender.replace('_', ' ')}
                                      </Label>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Parish Restrictions */}
                              <div>
                                <Label>Allowed Parishes (leave empty for all)</Label>
                                <div className="mt-2 max-h-40 overflow-y-auto border rounded-md p-3">
                                  {parishes.length > 0 ? (
                                    parishes.map((parish) => (
                                      <div key={parish.id} className="flex items-center space-x-2 mb-2">
                                        <Checkbox
                                          id={`parish-${parish.id}`}
                                          checked={tournament.allowedParishes.includes(parish.id)}
                                          onCheckedChange={(checked) => {
                                            if (checked) {
                                              setTournament(prev => ({
                                                ...prev,
                                                allowedParishes: [...prev.allowedParishes, parish.id]
                                              }));
                                            } else {
                                              setTournament(prev => ({
                                                ...prev,
                                                allowedParishes: prev.allowedParishes.filter(id => id !== parish.id)
                                              }));
                                            }
                                          }}
                                        />
                                        <Label htmlFor={`parish-${parish.id}`} className="text-sm">
                                          {parish.name}
                                        </Label>
                                      </div>
                                    ))
                                  ) : (
                                    <p className="text-sm text-gray-500">No parishes available</p>
                                  )}
                                </div>
                              </div>

                              {/* Profile Completion Requirement */}
                              <div>
                                <Label htmlFor="profile-completion">Required Profile Completion (%)</Label>
                                <Input
                                  id="profile-completion"
                                  type="number"
                                  min="0"
                                  max="100"
                                  placeholder="e.g., 80"
                                  value={tournament.requiredProfileCompletion || ''}
                                  onChange={(e) => setTournament(prev => ({ 
                                    ...prev, 
                                    requiredProfileCompletion: e.target.value ? parseInt(e.target.value) : undefined 
                                  }))}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                  Users must have completed their profile to this percentage to apply
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <UpgradePrompt
                          feature="Eligibility Restrictions"
                          requiredPlan={getRequiredPlanForFeature(TOURNAMENT_FEATURES.ELIGIBILITY_RESTRICTIONS) || 'Professional'}
                          description="Control tournament access with age, gender, location, and profile requirements"
                          benefits={[
                            'Age range restrictions',
                            'Gender-specific tournaments',
                            'Parish/location filtering',
                            'Profile completion requirements'
                          ]}
                          size="small"
                        />
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Prizes & Rewards
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Configure prizes and rewards for tournament winners. This builds credibility and encourages participation.
                  </p>

                  {/* Prize Management Feature Check */}
                  {!hasTournamentFeatureAccess(user?.tenantId, TOURNAMENT_FEATURES.PRIZE_MANAGEMENT) ? (
                    <UpgradePrompt
                      feature="Prize Management"
                      requiredPlan={getRequiredPlanForFeature(TOURNAMENT_FEATURES.PRIZE_MANAGEMENT) || 'Professional'}
                      description="Configure prizes, awards, and rewards to recognize tournament winners and build credibility."
                      benefits={[
                        'Position-based prizes (1st, 2nd, 3rd, etc.)',
                        'Cash prizes and physical awards',
                        'Digital certificates and badges',
                        'Participation rewards',
                        'Public prize showcase',
                        'Winners hall of fame'
                      ]}
                      size="medium"
                    />
                  ) : (
                    <div className="space-y-6">
                      {/* Enable Prizes */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Enable Prize System</CardTitle>
                          <CardDescription>Activate prizes and rewards for this tournament</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="enable-prizes"
                              checked={tournament.prizesEnabled || false}
                              onCheckedChange={(checked) => 
                                setTournament(prev => ({ ...prev, prizesEnabled: !!checked }))
                              }
                            />
                            <Label htmlFor="enable-prizes" className="cursor-pointer">
                              Enable prizes and rewards for this tournament
                            </Label>
                          </div>
                        </CardContent>
                      </Card>

                      {tournament.prizesEnabled && (
                        <>
                          {/* Quick Setup */}
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-base">Quick Prize Setup</CardTitle>
                              <CardDescription>Configure basic prize structure</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              {/* Total Prize Pool */}
                              <div>
                                <Label>Total Prize Pool (Display Text)</Label>
                                <Input
                                  placeholder="e.g., $10,000+ in prizes"
                                  value={tournament.prizePoolDisplay || ''}
                                  onChange={(e) => 
                                    setTournament(prev => ({ ...prev, prizePoolDisplay: e.target.value }))
                                  }
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                  This will be displayed publicly to attract participants
                                </p>
                              </div>

                              {/* Prize Structure */}
                              <div>
                                <Label>Prize Structure</Label>
                                <Select
                                  value={tournament.prizeStructure || 'top_n'}
                                  onValueChange={(value) =>
                                    setTournament(prev => ({ ...prev, prizeStructure: value }))
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="top_n">Top N positions (1st, 2nd, 3rd, etc.)</SelectItem>
                                    <SelectItem value="top_percentage">Top percentage of participants</SelectItem>
                                    <SelectItem value="threshold_based">Score threshold (e.g., 90%+)</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Number of Winning Positions */}
                              {tournament.prizeStructure === 'top_n' && (
                                <div>
                                  <Label>Number of Winning Positions</Label>
                                  <Input
                                    type="number"
                                    min="1"
                                    max="20"
                                    value={tournament.numberOfWinners || 3}
                                    onChange={(e) =>
                                      setTournament(prev => ({ 
                                        ...prev, 
                                        numberOfWinners: parseInt(e.target.value) || 3 
                                      }))
                                    }
                                  />
                                  <p className="text-xs text-muted-foreground mt-1">
                                    How many top positions will receive prizes (e.g., 3 for top 3)
                                  </p>
                                </div>
                              )}

                              {/* Top Percentage */}
                              {tournament.prizeStructure === 'top_percentage' && (
                                <div>
                                  <Label>Top Percentage</Label>
                                  <Input
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={tournament.topPercentage || 10}
                                    onChange={(e) =>
                                      setTournament(prev => ({ 
                                        ...prev, 
                                        topPercentage: parseInt(e.target.value) || 10 
                                      }))
                                    }
                                  />
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Percentage of top performers who will receive prizes (e.g., top 10%)
                                  </p>
                                </div>
                              )}

                              {/* Score Threshold */}
                              {tournament.prizeStructure === 'threshold_based' && (
                                <div>
                                  <Label>Minimum Score (%)</Label>
                                  <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={tournament.minScoreForPrize || 90}
                                    onChange={(e) =>
                                      setTournament(prev => ({ 
                                        ...prev, 
                                        minScoreForPrize: parseInt(e.target.value) || 90 
                                      }))
                                    }
                                  />
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Anyone scoring at or above this percentage wins a prize
                                  </p>
                                </div>
                              )}
                            </CardContent>
                          </Card>

                          {/* Prize Display Settings */}
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-base">Display Settings</CardTitle>
                              <CardDescription>Control how prizes are shown publicly</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="show-prizes-publicly"
                                  checked={tournament.showPrizesPublicly !== false}
                                  onCheckedChange={(checked) =>
                                    setTournament(prev => ({ ...prev, showPrizesPublicly: !!checked }))
                                  }
                                />
                                <Label htmlFor="show-prizes-publicly" className="cursor-pointer">
                                  Show prizes to non-logged-in visitors
                                </Label>
                              </div>

                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="show-prize-amounts"
                                  checked={tournament.showPrizeAmounts !== false}
                                  onCheckedChange={(checked) =>
                                    setTournament(prev => ({ ...prev, showPrizeAmounts: !!checked }))
                                  }
                                />
                                <Label htmlFor="show-prize-amounts" className="cursor-pointer">
                                  Show actual cash amounts (uncheck to just say "Cash Prize")
                                </Label>
                              </div>

                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="enable-participation-reward"
                                  checked={tournament.participationRewardEnabled || false}
                                  onCheckedChange={(checked) =>
                                    setTournament(prev => ({ ...prev, participationRewardEnabled: !!checked }))
                                  }
                                />
                                <Label htmlFor="enable-participation-reward" className="cursor-pointer">
                                  All participants receive a certificate/badge
                                </Label>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Advanced Prize Configuration Note */}
                          {hasTournamentFeatureAccess(user?.tenantId, TOURNAMENT_FEATURES.ADVANCED_PRIZE_FEATURES) && (
                            <Card className="border-purple-200 bg-purple-50">
                              <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                  <Trophy className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                                  <div>
                                    <p className="text-sm font-semibold text-purple-900">
                                      Advanced Prize Configuration Available
                                    </p>
                                    <p className="text-xs text-purple-700 mt-1">
                                      After creating the tournament, you can configure detailed prize information including:
                                      specific cash amounts, physical prizes, sponsors, category awards, and more from the
                                      tournament management page.
                                    </p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-6">`
                <div>
                  <h3 className="text-lg font-semibold mb-4">Question Selection</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="auto-select"
                        checked={tournament.autoSelectQuestions}
                        onCheckedChange={(checked) => setTournament(prev => ({ ...prev, autoSelectQuestions: !!checked }))}
                      />
                      <Label htmlFor="auto-select">Automatically select questions</Label>
                    </div>

                    {tournament.autoSelectQuestions ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="question-count">Number of Questions</Label>
                          <Input
                            id="question-count"
                            type="number"
                            min="5"
                            max="50"
                            value={tournament.questionCount}
                            onChange={(e) => setTournament(prev => ({ ...prev, questionCount: parseInt(e.target.value) || 10 }))}
                          />
                        </div>
                        <div className="flex items-end">
                          <Badge variant="outline">
                            {getFilteredQuestions().length} questions available
                          </Badge>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <Label>Select Questions Manually</Label>
                        <div className="mt-2 max-h-64 overflow-y-auto border rounded-md p-4">
                          {getFilteredQuestions().map((question) => (
                            <div key={question.id} className="flex items-center space-x-2 mb-2">
                              <Checkbox
                                id={`question-${question.id}`}
                                checked={tournament.selectedQuestions.includes(question.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setTournament(prev => ({
                                      ...prev,
                                      selectedQuestions: [...prev.selectedQuestions, question.id]
                                    }));
                                  } else {
                                    setTournament(prev => ({
                                      ...prev,
                                      selectedQuestions: prev.selectedQuestions.filter(id => id !== question.id)
                                    }));
                                  }
                                }}
                              />
                              <Label htmlFor={`question-${question.id}`} className="text-sm">
                                {question.text.substring(0, 100)}...
                              </Label>
                              <Badge variant="outline" className="text-xs">
                                {question.difficulty}
                              </Badge>
                            </div>
                          ))}
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                          Selected: {tournament.selectedQuestions.length} questions
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 6 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Schedule Settings</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="start-date">Start Date & Time *</Label>
                      <Input
                        id="start-date"
                        type="datetime-local"
                        value={tournament.startDate}
                        onChange={(e) => setTournament(prev => ({ ...prev, startDate: e.target.value }))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="end-date">End Date & Time *</Label>
                      <Input
                        id="end-date"
                        type="datetime-local"
                        value={tournament.endDate}
                        onChange={(e) => setTournament(prev => ({ ...prev, endDate: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Tournament Duration</h4>
                    <p className="text-sm text-blue-700">
                      {tournament.startDate && tournament.endDate ? (
                        `Duration: ${Math.round((new Date(tournament.endDate).getTime() - new Date(tournament.startDate).getTime()) / (1000 * 60))} minutes`
                      ) : (
                        'Please select start and end times to see duration'
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 7 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Review & Create Tournament</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Basic Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div><strong>Name:</strong> {tournament.name}</div>
                        <div><strong>Category:</strong> {tournament.category}</div>
                        <div><strong>Difficulty:</strong> {tournament.difficulty}</div>
                        <div><strong>Description:</strong> {tournament.description || 'None'}</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Financial Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div><strong>Entry Fee:</strong> ${tournament.entryFee}</div>
                        <div><strong>Prize Pool:</strong> ${tournament.prizePool}</div>
                        <div><strong>Max Participants:</strong> {tournament.maxParticipants}</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Questions</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div><strong>Selection:</strong> {tournament.autoSelectQuestions ? 'Automatic' : 'Manual'}</div>
                        <div><strong>Count:</strong> {tournament.autoSelectQuestions ? tournament.questionCount : tournament.selectedQuestions.length}</div>
                        <div><strong>Time Limit:</strong> {tournament.timeLimit} min/question</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Schedule</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div><strong>Start:</strong> {tournament.startDate ? new Date(tournament.startDate).toLocaleString() : 'Not set'}</div>
                        <div><strong>End:</strong> {tournament.endDate ? new Date(tournament.endDate).toLocaleString() : 'Not set'}</div>
                        <div><strong>Spectators:</strong> {tournament.allowSpectators ? 'Allowed' : 'Not allowed'}</div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                disabled={currentStep === 1}
              >
                Previous
              </Button>
              
              {currentStep < 6 ? (
                <Button
                  onClick={() => setCurrentStep(prev => Math.min(6, prev + 1))}
                >
                  Next
                </Button>
              ) : (
                <Button onClick={handleCreateTournament}>
                  Create Tournament
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Round Question Configuration Dialog */}
      <Dialog open={roundConfigDialogOpen} onOpenChange={setRoundConfigDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Configure Round Questions</DialogTitle>
            <DialogDescription>
              Set up unique question categories and delivery modes for each tournament round.
              Each round can have mixed or staged category presentation.
            </DialogDescription>
          </DialogHeader>
          
          <RoundQuestionConfigBuilder
            totalRounds={
              tournament.tournamentFormat === 'single_elimination' 
                ? Math.ceil(Math.log2(tournament.maxParticipants)) 
                : tournament.tournamentFormat === 'double_elimination'
                  ? Math.ceil(Math.log2(tournament.maxParticipants)) * 2
                  : 5 // Default for Swiss
            }
            initialConfigs={tournament.roundQuestionConfigs}
            tenantId={tenant?.id || ''}
            currentUser={user!}
            onConfigsChange={(configs) => {
              setTournament(prev => ({ 
                ...prev, 
                roundQuestionConfigs: configs 
              }));
            }}
          />

          <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => setRoundConfigDialogOpen(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Template Library Dialog */}
      <Dialog open={templateLibraryOpen} onOpenChange={setTemplateLibraryOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Round Configuration Templates</DialogTitle>
            <DialogDescription>
              Browse and apply pre-built round configurations or create your own templates
            </DialogDescription>
          </DialogHeader>
          
          <TemplateLibrary
            tenantId={tenant?.id || ''}
            currentUser={user!}
            onApplyTemplate={(configs: RoundQuestionConfig[]) => {
              setTournament(prev => ({ 
                ...prev, 
                roundQuestionConfigs: configs 
              }));
              setTemplateLibraryOpen(false);
              setRoundConfigDialogOpen(true); // Open config dialog to review
            }}
          />

          <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => setTemplateLibraryOpen(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Custom Category Manager Dialog */}
      <Dialog open={customCategoryOpen} onOpenChange={setCustomCategoryOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Custom Question Categories</DialogTitle>
            <DialogDescription>
              Create and manage custom question categories for your tournaments (Enterprise Feature)
            </DialogDescription>
          </DialogHeader>
          
          <CustomCategoryManager
            tenantId={tenant?.id || ''}
            currentUser={user!}
            onCategoryChange={() => {
              // Optionally refresh data or show notification
            }}
          />

          <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => setCustomCategoryOpen(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};