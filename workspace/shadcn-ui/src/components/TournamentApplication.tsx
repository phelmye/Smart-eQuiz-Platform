import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Trophy, Clock, Users, CheckCircle2, XCircle, AlertCircle, Loader2, Target } from 'lucide-react';
import { useAuth } from '@/components/AuthSystem';
import {
  Tournament,
  TournamentApplication as TournamentApplicationType,
  canApplyToTournament,
  applyToTournament,
  getUserTournamentApplications,
  hasFeatureAccess,
  canAccessPracticeMode,
  User
} from '@/lib/mockData';

interface TournamentApplicationProps {
  tournament?: Tournament;
  onBack?: () => void;
}

export const TournamentApplication: React.FC<TournamentApplicationProps> = ({ tournament, onBack }) => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<TournamentApplicationType[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(tournament || null);
  const [isApplying, setIsApplying] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    if (user) {
      const userApps = getUserTournamentApplications(user.id);
      setApplications(userApps);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-600 mb-4">Authentication Required</h2>
            <p className="text-gray-600">Please log in to apply for tournaments.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleApply = async (tournamentId: string) => {
    setIsApplying(true);
    setApplicationStatus(null);

    try {
      // Check if user can apply
      const canApply = canApplyToTournament(user, tournamentId);
      if (!canApply.allowed) {
        setApplicationStatus({
          success: false,
          message: canApply.reason || 'You cannot apply to this tournament'
        });
        setIsApplying(false);
        return;
      }

      // Submit application
      const result = applyToTournament(user.id, tournamentId);
      
      if (result.success) {
        setApplicationStatus({
          success: true,
          message: 'Application submitted successfully! Check your email for next steps.'
        });
        
        // Refresh applications
        const updatedApps = getUserTournamentApplications(user.id);
        setApplications(updatedApps);
      } else {
        setApplicationStatus({
          success: false,
          message: result.message || 'Application failed. Please try again.'
        });
      }
    } catch (error) {
      setApplicationStatus({
        success: false,
        message: 'An error occurred. Please try again later.'
      });
    } finally {
      setIsApplying(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
          <Clock className="h-3 w-3 mr-1" /> Pending
        </Badge>;
      case 'quiz_available':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          <Target className="h-3 w-3 mr-1" /> Quiz Available
        </Badge>;
      case 'quiz_in_progress':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
          <Loader2 className="h-3 w-3 mr-1 animate-spin" /> In Progress
        </Badge>;
      case 'qualified':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle2 className="h-3 w-3 mr-1" /> Qualified
        </Badge>;
      case 'disqualified':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          <XCircle className="h-3 w-3 mr-1" /> Disqualified
        </Badge>;
      case 'auto_qualified':
        return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
          <CheckCircle2 className="h-3 w-3 mr-1" /> Auto-Qualified
        </Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getQualificationPathwayBadge = (pathway: string) => {
    switch (pathway) {
      case 'quiz':
        return <Badge variant="secondary">📝 Pre-Tournament Quiz</Badge>;
      case 'practice_points':
        return <Badge variant="secondary">⭐ Practice Points</Badge>;
      case 'direct_invitation':
        return <Badge variant="secondary">✉️ Direct Invitation</Badge>;
      default:
        return <Badge variant="secondary">{pathway}</Badge>;
    }
  };

  // User's applications overview
  const myApplications = applications.filter(app => app.userId === user.id);
  const pendingApplications = myApplications.filter(app => 
    app.status === 'pending' || app.status === 'quiz_available' || app.status === 'quiz_in_progress'
  );
  const qualifiedApplications = myApplications.filter(app => 
    app.status === 'qualified' || app.status === 'auto_qualified'
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tournament Applications</h1>
            <p className="text-gray-600 mt-1">Apply to participate in upcoming tournaments</p>
          </div>
          {onBack && (
            <Button variant="outline" onClick={onBack}>
              ← Back
            </Button>
          )}
        </div>

        {/* Application Status Alert */}
        {applicationStatus && (
          <Alert className={applicationStatus.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
            <AlertDescription className={applicationStatus.success ? 'text-green-800' : 'text-red-800'}>
              {applicationStatus.message}
            </AlertDescription>
          </Alert>
        )}

        {/* User Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Applications</p>
                  <p className="text-2xl font-bold text-gray-900">{myApplications.length}</p>
                </div>
                <Trophy className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Review</p>
                  <p className="text-2xl font-bold text-yellow-600">{pendingApplications.length}</p>
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
                  <p className="text-2xl font-bold text-green-600">{qualifiedApplications.length}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Practice Access Status */}
        {user.practiceAccessStatus !== 'approved' && (
          <Alert className="bg-blue-50 border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Tip:</strong> You can earn <strong>Practice Points</strong> to auto-qualify for tournaments! 
              {user.practiceAccessStatus === 'none' && ' Apply for practice access first to start earning points.'}
              {user.practiceAccessStatus === 'pending' && ' Your practice access application is under review.'}
              {user.practiceAccessStatus === 'rejected' && ' Your practice access was not approved. Contact support for details.'}
            </AlertDescription>
          </Alert>
        )}

        {/* My Applications */}
        {myApplications.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>My Applications</CardTitle>
              <CardDescription>Track your tournament application progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myApplications.map((app) => (
                  <div key={app.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">
                            Tournament #{app.tournamentId.slice(-6)}
                          </h3>
                          {getStatusBadge(app.status)}
                          {getQualificationPathwayBadge(app.qualificationPathway)}
                        </div>
                        
                        <div className="space-y-2 text-sm text-gray-600">
                          <p>Applied: {new Date(app.appliedAt).toLocaleDateString()}</p>
                          
                          {app.qualificationPathway === 'quiz' && app.quizAttempts && (
                            <div>
                              <p className="font-medium text-gray-900 mb-1">Quiz Attempts:</p>
                              <div className="space-y-1 ml-4">
                                {app.quizAttempts.map((attempt, idx) => (
                                  <div key={idx} className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs">
                                      Attempt {attempt.attemptNumber}
                                    </Badge>
                                    <span className={attempt.passed ? 'text-green-600' : 'text-red-600'}>
                                      Score: {attempt.score}% {attempt.passed ? '✓' : '✗'}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      ({new Date(attempt.completedAt).toLocaleDateString()})
                                    </span>
                                  </div>
                                ))}
                              </div>
                              
                              {app.finalScore && (
                                <p className="mt-2 font-medium text-gray-900">
                                  Final Score: <span className="text-blue-600">{app.finalScore}%</span>
                                  {app.scoringMethodUsed && ` (${app.scoringMethodUsed})`}
                                </p>
                              )}
                              
                              {app.status === 'quiz_available' && (
                                <Button 
                                  size="sm" 
                                  className="mt-2"
                                  onClick={() => {
                                    // Navigate to quiz
                                    console.log('Take quiz for application:', app.id);
                                  }}
                                >
                                  {app.quizAttempts?.length ? 'Retake Quiz' : 'Take Quiz'}
                                </Button>
                              )}
                            </div>
                          )}

                          {app.qualificationPathway === 'practice_points' && (
                            <div>
                              <p>Practice Points Used: <strong>{app.practicePointsUsed || 0}</strong></p>
                              <p className="text-green-600 font-medium">✓ Auto-Qualified via Practice Points</p>
                            </div>
                          )}

                          {app.qualificationPathway === 'direct_invitation' && app.invitedBy && (
                            <div>
                              <p className="text-purple-600 font-medium">✉️ Invited by Admin</p>
                              <p className="text-xs">Invited: {new Date(app.invitedAt || '').toLocaleDateString()}</p>
                            </div>
                          )}

                          {app.status === 'disqualified' && app.disqualificationReason && (
                            <Alert className="bg-red-50 border-red-200 mt-2">
                              <AlertDescription className="text-red-800 text-xs">
                                <strong>Reason:</strong> {app.disqualificationReason}
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Available Tournaments (Placeholder) */}
        <Card>
          <CardHeader>
            <CardTitle>Available Tournaments</CardTitle>
            <CardDescription>Apply to participate in upcoming tournaments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-gray-500">
              <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No open tournaments at the moment.</p>
              <p className="text-sm mt-2">Check back later for new opportunities!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
