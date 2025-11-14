import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, XCircle, BookOpen, Trophy, ArrowRight } from 'lucide-react';
import { useAuth } from './AuthSystem';
import { applyForPracticeAccess, canAccessPracticeMode } from '@/lib/mockData';

export const PracticeAccessApplication: React.FC = () => {
  const { user } = useAuth();
  const [isApplying, setIsApplying] = useState(false);
  const [message, setMessage] = useState('');

  if (!user) return null;

  const handleApply = async () => {
    setIsApplying(true);
    setMessage('');

    try {
      const success = applyForPracticeAccess(user.id);
      
      if (success) {
        setMessage('Application submitted successfully! An administrator will review your request.');
        // Force re-render by updating state
        window.location.reload();
      } else {
        setMessage('Unable to submit application. You may have already applied.');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    } finally {
      setIsApplying(false);
    }
  };

  const getStatusBadge = () => {
    switch (user.practiceAccessStatus) {
      case 'approved':
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">Not Applied</Badge>;
    }
  };

  const getQualificationBadge = () => {
    switch (user.qualificationStatus) {
      case 'approved_participant':
        return <Badge className="bg-green-600"><Trophy className="w-3 h-3 mr-1" />Tournament Participant</Badge>;
      case 'qualified':
        return <Badge className="bg-blue-500"><Trophy className="w-3 h-3 mr-1" />Qualified</Badge>;
      case 'in_training':
        return <Badge className="bg-purple-500"><BookOpen className="w-3 h-3 mr-1" />In Training</Badge>;
      default:
        return <Badge variant="outline">Not Qualified</Badge>;
    }
  };

  const canApply = user.practiceAccessStatus === 'none' || user.practiceAccessStatus === 'rejected';
  const hasAccess = canAccessPracticeMode(user);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Practice Mode Access
            {getStatusBadge()}
          </CardTitle>
          <CardDescription>
            Apply for practice mode access to train and improve your skills
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Status */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-sm font-medium text-blue-900 mb-1">Current Role</div>
              <div className="text-lg font-bold text-blue-700 capitalize">{user.role}</div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="text-sm font-medium text-purple-900 mb-1">Qualification Status</div>
              <div className="mt-1">{getQualificationBadge()}</div>
            </div>
          </div>

          {/* Practice Access Flow */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Your Journey to Tournament Participation</h3>
            
            <div className="space-y-3">
              {/* Step 1 */}
              <div className={`flex items-start gap-3 p-4 rounded-lg border-2 ${
                user.practiceAccessStatus === 'approved' ? 'bg-green-50 border-green-200' : 
                user.practiceAccessStatus === 'pending' ? 'bg-yellow-50 border-yellow-200' : 
                'bg-gray-50 border-gray-200'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  user.practiceAccessStatus === 'approved' ? 'bg-green-500 text-white' : 
                  user.practiceAccessStatus === 'pending' ? 'bg-yellow-500 text-white' : 
                  'bg-gray-300 text-gray-600'
                }`}>
                  1
                </div>
                <div className="flex-1">
                  <div className="font-semibold">Apply for Practice Access</div>
                  <div className="text-sm text-gray-600">
                    Submit an application to gain access to practice quizzes and training materials
                  </div>
                  {user.practiceAccessStatus === 'pending' && (
                    <div className="mt-2 text-sm text-yellow-700 font-medium">
                      ⏳ Application under review by administrators
                    </div>
                  )}
                  {user.practiceAccessStatus === 'approved' && (
                    <div className="mt-2 text-sm text-green-700 font-medium">
                      ✓ Access approved! You can now practice.
                    </div>
                  )}
                </div>
              </div>

              {/* Step 2 */}
              <div className={`flex items-start gap-3 p-4 rounded-lg border-2 ${
                user.qualificationStatus === 'in_training' || user.qualificationStatus === 'qualified' || user.qualificationStatus === 'approved_participant'
                  ? 'bg-purple-50 border-purple-200' 
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  user.qualificationStatus === 'in_training' || user.qualificationStatus === 'qualified' || user.qualificationStatus === 'approved_participant'
                    ? 'bg-purple-500 text-white' 
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  2
                </div>
                <div className="flex-1">
                  <div className="font-semibold">Training Phase</div>
                  <div className="text-sm text-gray-600">
                    Practice with quizzes, improve your scores, and build experience
                  </div>
                  {user.qualificationStatus === 'in_training' && (
                    <div className="mt-2 text-sm text-purple-700 font-medium">
                      📚 Currently in training phase
                    </div>
                  )}
                </div>
              </div>

              {/* Step 3 */}
              <div className={`flex items-start gap-3 p-4 rounded-lg border-2 ${
                user.qualificationStatus === 'qualified' || user.qualificationStatus === 'approved_participant'
                  ? 'bg-blue-50 border-blue-200' 
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  user.qualificationStatus === 'qualified' || user.qualificationStatus === 'approved_participant'
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  3
                </div>
                <div className="flex-1">
                  <div className="font-semibold">Qualification Assessment</div>
                  <div className="text-sm text-gray-600">
                    Administrators review your progress and qualify you for tournaments
                  </div>
                  {user.qualificationStatus === 'qualified' && (
                    <div className="mt-2 text-sm text-blue-700 font-medium">
                      🎯 Qualified! Awaiting final approval for tournament participation.
                    </div>
                  )}
                </div>
              </div>

              {/* Step 4 */}
              <div className={`flex items-start gap-3 p-4 rounded-lg border-2 ${
                user.qualificationStatus === 'approved_participant'
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  user.qualificationStatus === 'approved_participant'
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  4
                </div>
                <div className="flex-1">
                  <div className="font-semibold">Tournament Participant</div>
                  <div className="text-sm text-gray-600">
                    Full access to participate in tournaments and championships
                  </div>
                  {user.qualificationStatus === 'approved_participant' && (
                    <div className="mt-2 text-sm text-green-700 font-medium">
                      🏆 Congratulations! You are now a tournament participant.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {canApply && (
            <div className="pt-4 border-t">
              <Alert className="mb-4">
                <AlertDescription>
                  <strong>Ready to start your journey?</strong><br />
                  Apply for practice access to begin training. An administrator will review your application within 24-48 hours.
                </AlertDescription>
              </Alert>
              <Button 
                onClick={handleApply} 
                disabled={isApplying}
                className="w-full"
                size="lg"
              >
                {isApplying ? 'Submitting...' : 'Apply for Practice Access'}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          )}

          {hasAccess && user.qualificationStatus === 'in_training' && (
            <Alert className="bg-purple-50 border-purple-200">
              <AlertDescription className="text-purple-900">
                <strong>You now have practice access!</strong><br />
                Keep practicing to improve your skills. Administrators will qualify you for tournaments based on your progress.
              </AlertDescription>
            </Alert>
          )}

          {message && (
            <Alert>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
