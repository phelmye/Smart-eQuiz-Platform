import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Calendar, Users, Trophy, DollarSign, Settings, Play } from 'lucide-react';
import { useAuth } from './AuthSystem';
import { storage, STORAGE_KEYS, Tournament, Question, BIBLE_CATEGORIES } from '@/lib/mockData';

interface TournamentBuilderProps {
  onBack: () => void;
  onNavigate: (page: string) => void;
}

export const TournamentBuilder: React.FC<TournamentBuilderProps> = ({ onBack, onNavigate }) => {
  const { user, tenant } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
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
    requireApproval: false
  });

  useEffect(() => {
    loadQuestions();
  }, [user, tenant]);

  const loadQuestions = () => {
    const savedQuestions = storage.get(STORAGE_KEYS.QUESTIONS) || [];
    const tenantQuestions = savedQuestions.filter((q: Question) => 
      user?.role === 'super_admin' || q.tenantId === user?.tenantId
    );
    setAvailableQuestions(tenantQuestions);
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
      createdAt: new Date().toISOString()
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
    { id: 3, title: 'Questions', icon: Trophy },
    { id: 4, title: 'Schedule', icon: Calendar },
    { id: 5, title: 'Review', icon: Play }
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

            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Schedule Tournament</h3>
                  
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

            {currentStep === 5 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Review Tournament</h3>
                  
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
              
              {currentStep < 5 ? (
                <Button
                  onClick={() => setCurrentStep(prev => Math.min(5, prev + 1))}
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
    </div>
  );
};