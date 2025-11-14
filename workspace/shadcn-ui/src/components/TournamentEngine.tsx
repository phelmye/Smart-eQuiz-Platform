import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Plus, Edit, Trash2, Play, Pause, Square, Users, Trophy, Calendar, DollarSign } from 'lucide-react';
import { useAuth } from './AuthSystem';
import { storage, STORAGE_KEYS, Tournament, User, BIBLE_CATEGORIES } from '@/lib/mockData';

interface TournamentEngineProps {
  onBack: () => void;
}

export const TournamentEngine: React.FC<TournamentEngineProps> = ({ onBack }) => {
  const { user, tenant } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);
  const [newTournament, setNewTournament] = useState({
    name: '',
    description: '',
    category: '',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    entryFee: 0,
    prizePool: 0,
    maxParticipants: 50,
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    loadTournaments();
  }, [user, tenant]);

  const loadTournaments = () => {
    const savedTournaments = storage.get(STORAGE_KEYS.TOURNAMENTS) || [];
    const tenantTournaments = savedTournaments.filter((t: Tournament) => 
      user?.role === 'super_admin' || t.tenantId === user?.tenantId
    );
    setTournaments(tenantTournaments);
  };

  const handleCreateTournament = () => {
    if (!newTournament.name || !newTournament.category || !newTournament.startDate || !newTournament.endDate) {
      alert('Please fill in all required fields');
      return;
    }

    const tournament: Tournament = {
      id: `tournament${Date.now()}`,
      name: newTournament.name,
      description: newTournament.description,
      category: newTournament.category,
      difficulty: newTournament.difficulty,
      entryFee: newTournament.entryFee,
      prizePool: newTournament.prizePool,
      maxParticipants: newTournament.maxParticipants,
      currentParticipants: 0,
      spectatorCount: 0,
      startDate: new Date(newTournament.startDate).toISOString(),
      endDate: new Date(newTournament.endDate).toISOString(),
      status: 'scheduled',
      participants: [],
      spectators: [],
      questions: [],
      createdBy: user?.id || 'user1',
      tenantId: user?.tenantId || 'tenant1',
      createdAt: new Date().toISOString()
    };

    const allTournaments = storage.get(STORAGE_KEYS.TOURNAMENTS) || [];
    if (editingTournament) {
      const updatedTournaments = allTournaments.map((t: Tournament) => 
        t.id === editingTournament.id ? { ...tournament, id: editingTournament.id } : t
      );
      storage.set(STORAGE_KEYS.TOURNAMENTS, updatedTournaments);
    } else {
      allTournaments.push(tournament);
      storage.set(STORAGE_KEYS.TOURNAMENTS, allTournaments);
    }

    loadTournaments();
    setIsCreateDialogOpen(false);
    setEditingTournament(null);
    resetForm();
  };

  const handleEditTournament = (tournament: Tournament) => {
    setEditingTournament(tournament);
    setNewTournament({
      name: tournament.name,
      description: tournament.description,
      category: tournament.category,
      difficulty: tournament.difficulty,
      entryFee: tournament.entryFee,
      prizePool: tournament.prizePool,
      maxParticipants: tournament.maxParticipants,
      startDate: tournament.startDate.split('T')[0] + 'T' + tournament.startDate.split('T')[1].substring(0, 5),
      endDate: tournament.endDate.split('T')[0] + 'T' + tournament.endDate.split('T')[1].substring(0, 5)
    });
    setIsCreateDialogOpen(true);
  };

  const handleDeleteTournament = (tournamentId: string) => {
    if (confirm('Are you sure you want to delete this tournament?')) {
      const allTournaments = storage.get(STORAGE_KEYS.TOURNAMENTS) || [];
      const updatedTournaments = allTournaments.filter((t: Tournament) => t.id !== tournamentId);
      storage.set(STORAGE_KEYS.TOURNAMENTS, updatedTournaments);
      loadTournaments();
    }
  };

  const handleTournamentStatusChange = (tournamentId: string, newStatus: Tournament['status']) => {
    const allTournaments = storage.get(STORAGE_KEYS.TOURNAMENTS) || [];
    const updatedTournaments = allTournaments.map((t: Tournament) => 
      t.id === tournamentId ? { ...t, status: newStatus } : t
    );
    storage.set(STORAGE_KEYS.TOURNAMENTS, updatedTournaments);
    loadTournaments();
  };

  const resetForm = () => {
    setNewTournament({
      name: '',
      description: '',
      category: '',
      difficulty: 'medium',
      entryFee: 0,
      prizePool: 0,
      maxParticipants: 50,
      startDate: '',
      endDate: ''
    });
  };

  const getStatusColor = (status: Tournament['status']) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user || !hasPermission(user, 'tournaments.read')) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-bold text-red-600 mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-4">You need admin privileges to manage tournaments.</p>
            <Button onClick={onBack}>Back to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Tournament Management</h1>
                <p className="text-gray-600">Create and manage Bible quiz tournaments</p>
              </div>
            </div>

            <Button onClick={() => { setEditingTournament(null); resetForm(); setIsCreateDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Create Tournament
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{tournaments.filter(t => t.status === 'scheduled').length}</p>
                    <p className="text-sm text-gray-600">Scheduled</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Play className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">{tournaments.filter(t => t.status === 'active').length}</p>
                    <p className="text-sm text-gray-600">Active</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Trophy className="h-8 w-8 text-yellow-600" />
                  <div>
                    <p className="text-2xl font-bold">{tournaments.filter(t => t.status === 'completed').length}</p>
                    <p className="text-sm text-gray-600">Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold">
                      ${tournaments.reduce((sum, t) => sum + t.prizePool, 0).toFixed(0)}
                    </p>
                    <p className="text-sm text-gray-600">Total Prizes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tournaments Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Tournaments</CardTitle>
            <CardDescription>Manage your Bible quiz tournaments</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tournament</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Participants</TableHead>
                  <TableHead>Prize Pool</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tournaments.map((tournament) => (
                  <TableRow key={tournament.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{tournament.name}</div>
                        <div className="text-sm text-gray-500">{tournament.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{tournament.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(tournament.status)}>
                        {tournament.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span>{tournament.currentParticipants}/{tournament.maxParticipants}</span>
                      </div>
                    </TableCell>
                    <TableCell>${tournament.prizePool}</TableCell>
                    <TableCell>
                      {new Date(tournament.startDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {tournament.status === 'scheduled' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleTournamentStatusChange(tournament.id, 'active')}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                        {tournament.status === 'active' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleTournamentStatusChange(tournament.id, 'completed')}
                          >
                            <Square className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditTournament(tournament)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTournament(tournament.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Tournament Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTournament ? 'Edit Tournament' : 'Create New Tournament'}
            </DialogTitle>
            <DialogDescription>
              {editingTournament ? 'Update tournament details below.' : 'Set up a new Bible quiz tournament.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tournament-name">Tournament Name *</Label>
                <Input
                  id="tournament-name"
                  value={newTournament.name}
                  onChange={(e) => setNewTournament(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter tournament name"
                />
              </div>
              
              <div>
                <Label>Category *</Label>
                <Select value={newTournament.category} onValueChange={(value) => setNewTournament(prev => ({ ...prev, category: value }))}>
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

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newTournament.description}
                onChange={(e) => setNewTournament(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your tournament..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Difficulty</Label>
                <Select value={newTournament.difficulty} onValueChange={(value) => setNewTournament(prev => ({ ...prev, difficulty: value as 'easy' | 'medium' | 'hard' }))}>
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
                  value={newTournament.entryFee}
                  onChange={(e) => setNewTournament(prev => ({ ...prev, entryFee: parseFloat(e.target.value) || 0 }))}
                />
              </div>

              <div>
                <Label htmlFor="prize-pool">Prize Pool ($)</Label>
                <Input
                  id="prize-pool"
                  type="number"
                  min="0"
                  step="0.01"
                  value={newTournament.prizePool}
                  onChange={(e) => setNewTournament(prev => ({ ...prev, prizePool: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="max-participants">Max Participants</Label>
                <Input
                  id="max-participants"
                  type="number"
                  min="1"
                  value={newTournament.maxParticipants}
                  onChange={(e) => setNewTournament(prev => ({ ...prev, maxParticipants: parseInt(e.target.value) || 50 }))}
                />
              </div>

              <div>
                <Label htmlFor="start-date">Start Date & Time *</Label>
                <Input
                  id="start-date"
                  type="datetime-local"
                  value={newTournament.startDate}
                  onChange={(e) => setNewTournament(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="end-date">End Date & Time *</Label>
                <Input
                  id="end-date"
                  type="datetime-local"
                  value={newTournament.endDate}
                  onChange={(e) => setNewTournament(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTournament}>
                {editingTournament ? 'Update Tournament' : 'Create Tournament'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};