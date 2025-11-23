import React, { useState, useEffect } from 'react';
import { Trophy, CheckCircle, Clock, XCircle, DollarSign, Upload, FileText, Mail, Eye, Edit } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  PrizeAward,
  Tournament,
  User,
  getTournamentPrizeAwards,
  updatePrizeAwardStatus,
  storage,
  STORAGE_KEYS,
  mockTournaments
} from '@/lib/mockData';

interface PrizeAwardManagementProps {
  tournamentId: string;
  tenantId: string;
  onClose?: () => void;
}

export const PrizeAwardManagement: React.FC<PrizeAwardManagementProps> = ({
  tournamentId,
  tenantId,
  onClose
}) => {
  const [awards, setAwards] = useState<PrizeAward[]>([]);
  const [filteredAwards, setFilteredAwards] = useState<PrizeAward[]>([]);
  const [selectedAward, setSelectedAward] = useState<PrizeAward | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDistributeDialogOpen, setIsDistributeDialogOpen] = useState(false);
  const [distributionData, setDistributionData] = useState({
    method: 'bank_transfer' as PrizeAward['distributionProof']['method'],
    referenceNumber: '',
    notes: ''
  });

  useEffect(() => {
    loadAwards();
  }, [tournamentId]);

  useEffect(() => {
    filterAwards();
  }, [awards, statusFilter]);

  const loadAwards = () => {
    const loadedAwards = getTournamentPrizeAwards(tournamentId);
    setAwards(loadedAwards.sort((a, b) => a.position - b.position));
  };

  const filterAwards = () => {
    if (statusFilter === 'all') {
      setFilteredAwards(awards);
    } else {
      setFilteredAwards(awards.filter(a => a.status === statusFilter));
    }
  };

  const getUserDetails = (userId: string): User | null => {
    const users = storage.get(STORAGE_KEYS.USERS) || [];
    return users.find((u: User) => u.id === userId) || null;
  };

  const getTournamentDetails = (): Tournament | null => {
    return mockTournaments.find(t => t.id === tournamentId) || null;
  };

  const getStatusBadge = (status: PrizeAward['status']) => {
    const variants = {
      pending: { label: 'Pending', variant: 'secondary' as const, icon: Clock },
      notified: { label: 'Notified', variant: 'default' as const, icon: Mail },
      claimed: { label: 'Claimed', variant: 'default' as const, icon: CheckCircle },
      distributed: { label: 'Distributed', variant: 'default' as const, icon: CheckCircle },
      declined: { label: 'Declined', variant: 'destructive' as const, icon: XCircle }
    };
    
    const config = variants[status];
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const handleNotifyWinner = (award: PrizeAward) => {
    const result = updatePrizeAwardStatus(award.id, 'notified');
    if (result.success) {
      loadAwards();
      alert(`Winner ${award.winnerName} has been notified via email.`);
    }
  };

  const handleMarkClaimed = (award: PrizeAward) => {
    const result = updatePrizeAwardStatus(award.id, 'claimed');
    if (result.success) {
      loadAwards();
      alert(`Prize marked as claimed by ${award.winnerName}.`);
    }
  };

  const handleDistribute = () => {
    if (!selectedAward) return;

    const result = updatePrizeAwardStatus(selectedAward.id, 'distributed', {
      distributionProof: {
        method: distributionData.method,
        referenceNumber: distributionData.referenceNumber,
        notes: distributionData.notes
      },
      distributedBy: 'current_admin_id' // Should come from auth context
    });

    if (result.success) {
      loadAwards();
      setIsDistributeDialogOpen(false);
      setDistributionData({ method: 'bank_transfer', referenceNumber: '', notes: '' });
      alert(`Prize distributed to ${selectedAward.winnerName}!`);
    }
  };

  const getTotalPrizeValue = () => {
    return awards.reduce((sum, award) => {
      const cashPrizes = award.prizes.filter(p => p.cashAmount);
      return sum + cashPrizes.reduce((s, p) => s + (p.cashAmount || 0), 0);
    }, 0);
  };

  const getStatusCounts = () => {
    return {
      pending: awards.filter(a => a.status === 'pending').length,
      notified: awards.filter(a => a.status === 'notified').length,
      claimed: awards.filter(a => a.status === 'claimed').length,
      distributed: awards.filter(a => a.status === 'distributed').length,
      declined: awards.filter(a => a.status === 'declined').length
    };
  };

  const tournament = getTournamentDetails();
  const statusCounts = getStatusCounts();
  const totalValue = getTotalPrizeValue();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Trophy className="h-6 w-6 text-yellow-600" />
          Prize Award Management
        </h2>
        {tournament && (
          <p className="text-muted-foreground mt-1">{tournament.name}</p>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{awards.length}</div>
            <p className="text-xs text-muted-foreground">Total Awards</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">{statusCounts.pending}</div>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{statusCounts.notified}</div>
            <p className="text-xs text-muted-foreground">Notified</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{statusCounts.distributed}</div>
            <p className="text-xs text-muted-foreground">Distributed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">${totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total Value</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Label>Filter by Status:</Label>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Awards ({awards.length})</SelectItem>
            <SelectItem value="pending">Pending ({statusCounts.pending})</SelectItem>
            <SelectItem value="notified">Notified ({statusCounts.notified})</SelectItem>
            <SelectItem value="claimed">Claimed ({statusCounts.claimed})</SelectItem>
            <SelectItem value="distributed">Distributed ({statusCounts.distributed})</SelectItem>
            <SelectItem value="declined">Declined ({statusCounts.declined})</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Awards Table */}
      <Card>
        <CardHeader>
          <CardTitle>Prize Awards</CardTitle>
          <CardDescription>Manage prize distribution and tracking</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredAwards.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {statusFilter === 'all' ? 'No prize awards found' : `No ${statusFilter} awards`}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Position</TableHead>
                    <TableHead>Winner</TableHead>
                    <TableHead>Prizes</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAwards.map((award) => {
                    const user = getUserDetails(award.winnerId);
                    return (
                      <TableRow key={award.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {award.position <= 3 && (
                              <span className="text-xl">
                                {award.position === 1 ? '🥇' : award.position === 2 ? '🥈' : '🥉'}
                              </span>
                            )}
                            <div>
                              <div className="font-semibold">{award.positionLabel}</div>
                              <div className="text-xs text-muted-foreground">#{award.position}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{award.winnerName}</div>
                            <div className="text-xs text-muted-foreground">{award.winnerEmail}</div>
                            {award.winnerType === 'parish' && (
                              <Badge variant="secondary" className="mt-1">Parish</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {award.prizes.map((prize, i) => (
                              <div key={i} className="text-sm flex items-center gap-1">
                                {prize.cashAmount ? (
                                  <DollarSign className="h-3 w-3 text-green-600" />
                                ) : (
                                  <Trophy className="h-3 w-3 text-yellow-600" />
                                )}
                                <span>{prize.description}</span>
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(award.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {award.status === 'pending' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleNotifyWinner(award)}
                              >
                                <Mail className="h-3 w-3 mr-1" />
                                Notify
                              </Button>
                            )}
                            {(award.status === 'notified' || award.status === 'claimed') && (
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedAward(award);
                                  setIsDistributeDialogOpen(true);
                                }}
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Distribute
                              </Button>
                            )}
                            {award.status === 'notified' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleMarkClaimed(award)}
                              >
                                Claimed
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Distribution Dialog */}
      <Dialog open={isDistributeDialogOpen} onOpenChange={setIsDistributeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Prize as Distributed</DialogTitle>
            <DialogDescription>
              Record the distribution details for {selectedAward?.winnerName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label>Distribution Method</Label>
              <Select
                value={distributionData.method}
                onValueChange={(value: any) =>
                  setDistributionData(prev => ({ ...prev, method: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                  <SelectItem value="digital">Digital Payment</SelectItem>
                  <SelectItem value="pickup">Physical Pickup</SelectItem>
                  <SelectItem value="mail">Mail/Courier</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Reference Number</Label>
              <Input
                placeholder="e.g., Transaction ID, Receipt #, Tracking #"
                value={distributionData.referenceNumber}
                onChange={(e) =>
                  setDistributionData(prev => ({ ...prev, referenceNumber: e.target.value }))
                }
              />
            </div>

            <div>
              <Label>Notes (Optional)</Label>
              <Textarea
                placeholder="Additional distribution details..."
                value={distributionData.notes}
                onChange={(e) =>
                  setDistributionData(prev => ({ ...prev, notes: e.target.value }))
                }
                rows={3}
              />
            </div>

            {selectedAward && (
              <Alert>
                <AlertDescription>
                  <strong>Prizes to be marked as distributed:</strong>
                  <ul className="mt-2 space-y-1">
                    {selectedAward.prizes.map((prize, i) => (
                      <li key={i} className="text-sm">• {prize.description}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDistributeDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleDistribute}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark as Distributed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PrizeAwardManagement;
