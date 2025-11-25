import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, CheckCircle2, XCircle, Clock, Mail, 
  BarChart, Filter, Search, Download, UserPlus 
} from 'lucide-react';
import { useAuth } from '@/components/AuthSystem';
import {
  TournamentApplication,
  Tournament,
  User as UserType,
  getAllTournamentApplications,
  getTournamentApplications,
  hasPermission
} from '@/lib/mockData';

interface ApplicationManagementProps {
  tournamentId?: string;
  onBack?: () => void;
}

export const ApplicationManagement: React.FC<ApplicationManagementProps> = ({ 
  tournamentId, 
  onBack 
}) => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<TournamentApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<TournamentApplication[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<TournamentApplication | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    action: 'approve' | 'reject' | 'invite' | null;
    application?: TournamentApplication;
  }>({ open: false, action: null });
  const [actionData, setActionData] = useState<{
    reason?: string;
    message?: string;
  }>({});

  useEffect(() => {
    loadApplications();
  }, [tournamentId]);

  useEffect(() => {
    filterApplications();
  }, [applications, searchQuery, statusFilter]);

  const loadApplications = () => {
    const apps = tournamentId 
      ? getTournamentApplications(tournamentId)
      : getAllTournamentApplications();
    setApplications(apps);
  };

  const filterApplications = () => {
    let filtered = [...applications];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(app => 
        app.userId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.tournamentId.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredApplications(filtered);
  };

  const handleApprove = (application: TournamentApplication) => {
    setActionDialog({ open: true, action: 'approve', application });
  };

  const handleReject = (application: TournamentApplication) => {
    setActionDialog({ open: true, action: 'reject', application });
  };

  const handleInvite = () => {
    setActionDialog({ open: true, action: 'invite' });
  };

  const executeAction = () => {
    // TODO: Implement actual approval/rejection logic
    console.log('Execute action:', actionDialog.action, actionData);
    setActionDialog({ open: false, action: null });
    setActionData({});
    loadApplications();
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { variant: any; icon: any; label: string; color: string }> = {
      pending: { 
        variant: 'outline', 
        icon: Clock, 
        label: 'Pending', 
        color: 'text-yellow-700 bg-yellow-50 border-yellow-200' 
      },
      quiz_available: { 
        variant: 'outline', 
        icon: Clock, 
        label: 'Quiz Available', 
        color: 'text-blue-700 bg-blue-50 border-blue-200' 
      },
      quiz_in_progress: { 
        variant: 'outline', 
        icon: Clock, 
        label: 'In Progress', 
        color: 'text-purple-700 bg-purple-50 border-purple-200' 
      },
      qualified: { 
        variant: 'outline', 
        icon: CheckCircle2, 
        label: 'Qualified', 
        color: 'text-green-700 bg-green-50 border-green-200' 
      },
      auto_qualified: { 
        variant: 'outline', 
        icon: CheckCircle2, 
        label: 'Auto-Qualified', 
        color: 'text-emerald-700 bg-emerald-50 border-emerald-200' 
      },
      disqualified: { 
        variant: 'outline', 
        icon: XCircle, 
        label: 'Disqualified', 
        color: 'text-red-700 bg-red-50 border-red-200' 
      },
    };

    const config = configs[status] || configs.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getPathwayBadge = (pathway: string) => {
    const labels: Record<string, string> = {
      quiz: '📝 Quiz',
      practice_points: '⭐ Practice Points',
      direct_invitation: '✉️ Invited'
    };
    return <Badge variant="secondary">{labels[pathway] || pathway}</Badge>;
  };

  // Check permissions
  if (!user || !hasPermission(user, 'tournaments.manage')) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8 text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-600 mb-4">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to manage tournament applications.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Statistics
  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending' || a.status === 'quiz_available').length,
    qualified: applications.filter(a => a.status === 'qualified' || a.status === 'auto_qualified').length,
    disqualified: applications.filter(a => a.status === 'disqualified').length,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Application Management</h1>
            <p className="text-gray-600 mt-1">Review and manage tournament applications</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleInvite} variant="default">
              <UserPlus className="h-4 w-4 mr-2" />
              Direct Invite
            </Button>
            {onBack && (
              <Button variant="outline" onClick={onBack}>
                ← Back
              </Button>
            )}
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Applications</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Review</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Qualified</p>
                  <p className="text-2xl font-bold text-green-600">{stats.qualified}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Disqualified</p>
                  <p className="text-2xl font-bold text-red-600">{stats.disqualified}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by user ID or tournament ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[200px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="quiz_available">Quiz Available</SelectItem>
                  <SelectItem value="quiz_in_progress">In Progress</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="auto_qualified">Auto-Qualified</SelectItem>
                  <SelectItem value="disqualified">Disqualified</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Applications Table */}
        <Card>
          <CardHeader>
            <CardTitle>Applications</CardTitle>
            <CardDescription>
              {filteredApplications.length} application{filteredApplications.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Tournament</TableHead>
                  <TableHead>Pathway</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Applied</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No applications found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredApplications.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell className="font-medium">{app.userId.slice(0, 8)}...</TableCell>
                      <TableCell>{app.tournamentId.slice(0, 8)}...</TableCell>
                      <TableCell>{getPathwayBadge(app.qualificationPathway)}</TableCell>
                      <TableCell>{getStatusBadge(app.status)}</TableCell>
                      <TableCell>
                        {app.finalScore ? (
                          <span className="font-medium">{app.finalScore.toFixed(1)}%</span>
                        ) : app.quizAttempts && app.quizAttempts.length > 0 ? (
                          <div className="text-sm">
                            <div>{app.quizAttempts.length} attempt{app.quizAttempts.length !== 1 ? 's' : ''}</div>
                            <div className="text-gray-500">
                              Latest: {app.quizAttempts[app.quizAttempts.length - 1].score.toFixed(1)}%
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {new Date(app.appliedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedApplication(app)}
                          >
                            View
                          </Button>
                          {(app.status === 'pending' || app.status === 'quiz_available') && (
                            <>
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleApprove(app)}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleReject(app)}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Application Details Dialog */}
        <Dialog open={!!selectedApplication} onOpenChange={(open) => !open && setSelectedApplication(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Application Details</DialogTitle>
              <DialogDescription>
                Review complete application information
              </DialogDescription>
            </DialogHeader>
            {selectedApplication && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-600">User ID</Label>
                    <p className="font-medium">{selectedApplication.userId}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Tournament ID</Label>
                    <p className="font-medium">{selectedApplication.tournamentId}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Status</Label>
                    <div className="mt-1">{getStatusBadge(selectedApplication.status)}</div>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Pathway</Label>
                    <div className="mt-1">{getPathwayBadge(selectedApplication.qualificationPathway)}</div>
                  </div>
                </div>

                {selectedApplication.quizAttempts && selectedApplication.quizAttempts.length > 0 && (
                  <div>
                    <Label className="text-sm text-gray-600 mb-2 block">Quiz Attempts</Label>
                    <div className="space-y-2">
                      {selectedApplication.quizAttempts.map((attempt) => (
                        <div key={attempt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline">Attempt {attempt.attemptNumber}</Badge>
                            <span className={attempt.passed ? 'text-green-600 font-medium' : 'text-gray-600'}>
                              {attempt.score.toFixed(1)}%
                            </span>
                            {attempt.passed && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                          </div>
                          <span className="text-sm text-gray-500">
                            {Math.floor(attempt.timeTaken / 60)}m {attempt.timeTaken % 60}s
                          </span>
                        </div>
                      ))}
                    </div>
                    {selectedApplication.finalScore && (
                      <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-blue-800">Final Score ({selectedApplication.scoringMethodUsed || 'average'})</span>
                          <span className="text-lg font-bold text-blue-900">{selectedApplication.finalScore.toFixed(1)}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {selectedApplication.practicePointsUsed && (
                  <Alert className="bg-emerald-50 border-emerald-200">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <AlertDescription className="text-emerald-800">
                      Auto-qualified with <strong>{selectedApplication.practicePointsUsed}</strong> practice points
                    </AlertDescription>
                  </Alert>
                )}

                {selectedApplication.disqualificationReason && (
                  <Alert className="bg-red-50 border-red-200">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      <strong>Disqualification Reason:</strong><br />
                      {selectedApplication.disqualificationReason}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedApplication(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Action Dialog (Approve/Reject/Invite) */}
        <Dialog open={actionDialog.open} onOpenChange={(open) => !open && setActionDialog({ open: false, action: null })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {actionDialog.action === 'approve' && 'Approve Application'}
                {actionDialog.action === 'reject' && 'Reject Application'}
                {actionDialog.action === 'invite' && 'Direct Invite User'}
              </DialogTitle>
              <DialogDescription>
                {actionDialog.action === 'approve' && 'Approve this user to participate in the tournament'}
                {actionDialog.action === 'reject' && 'Reject this application with a reason'}
                {actionDialog.action === 'invite' && 'Directly invite a user to the tournament'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {actionDialog.action === 'reject' && (
                <div>
                  <Label htmlFor="reason">Reason for Rejection</Label>
                  <Textarea
                    id="reason"
                    placeholder="Explain why this application is being rejected..."
                    value={actionData.reason || ''}
                    onChange={(e) => setActionData({ ...actionData, reason: e.target.value })}
                    rows={4}
                  />
                </div>
              )}
              {actionDialog.action === 'invite' && (
                <>
                  <div>
                    <Label htmlFor="userId">User ID</Label>
                    <Input
                      id="userId"
                      placeholder="Enter user ID to invite..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="message">Invitation Message (Optional)</Label>
                    <Textarea
                      id="message"
                      placeholder="Add a personalized message..."
                      value={actionData.message || ''}
                      onChange={(e) => setActionData({ ...actionData, message: e.target.value })}
                      rows={3}
                    />
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setActionDialog({ open: false, action: null })}>
                Cancel
              </Button>
              <Button onClick={executeAction}>
                Confirm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
