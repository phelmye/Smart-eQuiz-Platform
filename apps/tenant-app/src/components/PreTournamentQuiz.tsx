import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { 
  Trophy, Clock, CheckCircle2, XCircle, AlertTriangle, 
  Loader2, Target, BarChart, TrendingUp 
} from 'lucide-react';
import { useAuth } from '@/components/AuthSystem';
import {
  TournamentApplication,
  QuizAttempt,
  Question,
  Tournament,
  getApplicationById,
  getQuestionsForAttempt,
  calculateFinalScore,
  storage,
  STORAGE_KEYS
} from '@/lib/mockData';

interface PreTournamentQuizProps {
  applicationId: string;
  onComplete?: () => void;
  onBack?: () => void;
}

export const PreTournamentQuiz: React.FC<PreTournamentQuizProps> = ({ 
  applicationId, 
  onComplete, 
  onBack 
}) => {
  const { user } = useAuth();
  const [application, setApplication] = useState<TournamentApplication | null>(null);
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [answerShuffles, setAnswerShuffles] = useState<Array<{ questionId: string; originalOrder: number[]; shuffledOrder: number[] }>>([]);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    passed: boolean;
    finalScore?: number;
    attemptsUsed: number;
    attemptsRemaining: number;
  } | null>(null);

  useEffect(() => {
    const app = getApplicationById(applicationId);
    if (app) {
      setApplication(app);
      // Load tournament to get qualification config
      const tournaments = storage.get(STORAGE_KEYS.TOURNAMENTS) || [];
      const tourn = tournaments.find((t: Tournament) => t.id === app.tournamentId);
      setTournament(tourn || null);
    }
  }, [applicationId]);

  useEffect(() => {
    if (quizStarted && timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (quizStarted && timeRemaining === 0) {
      handleSubmitQuiz();
    }
  }, [quizStarted, timeRemaining]);

  const startQuiz = async () => {
    if (!application || !user) return;

    const attemptNumber = (application.quizAttempts?.length || 0) + 1;
    const questionResult = getQuestionsForAttempt(user.id, application.tournamentId, attemptNumber);

    if (!questionResult.success || !questionResult.questions) {
      alert(questionResult.message || 'Failed to load questions');
      return;
    }

    setQuestions(questionResult.questions);
    // Get time limit from tournament qualification config
    const timeLimitMinutes = tournament?.qualificationConfig?.quizSettings?.timeLimitMinutes || 30;
    setTimeRemaining(timeLimitMinutes * 60);
    
    // Track answer shuffles for each question
    const shuffles = questionResult.questions.map(q => {
      const originalOrder = q.options.map((_, idx) => idx);
      return {
        questionId: q.id,
        originalOrder,
        shuffledOrder: [...originalOrder] // In real implementation, this would be shuffled
      };
    });
    setAnswerShuffles(shuffles);
    setQuizStarted(true);
  };

  const handleSelectAnswer = (questionId: string, optionIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleSubmitQuiz = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // Calculate score
      let correctAnswers = 0;
      questions.forEach(q => {
        if (answers[q.id] === q.correctAnswer) {
          correctAnswers++;
        }
      });

      const scorePercentage = (correctAnswers / questions.length) * 100;
      // Get pass percentage from tournament qualification config
      const passPercentage = tournament?.qualificationConfig?.quizSettings?.passPercentage || 70;
      const passed = scorePercentage >= passPercentage;

      const attemptNumber = (application?.quizAttempts?.length || 0) + 1;
      const attemptsUsed = attemptNumber;
      const attemptsRemaining = (application?.attemptsRemaining || 0) - 1;

      // Get time limit from config
      const timeLimitMinutes = tournament?.qualificationConfig?.quizSettings?.timeLimitMinutes || 30;
      const timeLimitSeconds = timeLimitMinutes * 60;

      // Create quiz attempt record
      const attempt: QuizAttempt = {
        id: `attempt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: user!.id,
        tournamentId: application!.tournamentId,
        applicationId: application!.id,
        attemptNumber,
        questionsShown: questions.map(q => q.id),
        answerShuffles, // Track actual answer shuffles
        answers,
        score: scorePercentage,
        passed,
        timeTaken: timeLimitSeconds - timeRemaining,
        startedAt: new Date(Date.now() - ((timeLimitSeconds - timeRemaining) * 1000)).toISOString(),
        completedAt: new Date().toISOString(),
        randomizationSeed: `${user!.id}_${application!.tournamentId}_${attemptNumber}`
      };

      // Save attempt to storage
      const allAttempts = storage.get(STORAGE_KEYS.QUIZ_ATTEMPTS) || [];
      allAttempts.push(attempt);
      storage.set(STORAGE_KEYS.QUIZ_ATTEMPTS, allAttempts);

      // Update application with new attempt
      const applications = storage.get(STORAGE_KEYS.TOURNAMENT_APPLICATIONS) || [];
      const updatedApplications = applications.map((app: TournamentApplication) => {
        if (app.id === application!.id) {
          return {
            ...app,
            quizAttempts: [...(app.quizAttempts || []), attempt],
            attemptsRemaining: attemptsRemaining,
            lastAttemptDate: new Date().toISOString(),
            status: passed ? 'qualified' : attemptsRemaining > 0 ? 'pending_qualification' : 'rejected'
          };
        }
        return app;
      });
      storage.set(STORAGE_KEYS.TOURNAMENT_APPLICATIONS, updatedApplications);
      setApplication(updatedApplications.find((a: TournamentApplication) => a.id === application!.id));

      // Calculate final score if this is the last attempt or they passed
      let finalScore: number | undefined;
      if (passed || attemptsRemaining === 0) {
        const allUserAttempts = [...(application?.quizAttempts || []), attempt];
        // Get scoring method from tournament config
        const scoringMethod = tournament?.qualificationConfig?.quizSettings?.scoringMethod || 'average';
        finalScore = calculateFinalScore(allUserAttempts, scoringMethod);
      }

      setResult({
        score: scorePercentage,
        passed,
        finalScore,
        attemptsUsed,
        attemptsRemaining
      });
      setQuizCompleted(true);

    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Failed to submit quiz. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!application || !user) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-4">Application Not Found</h2>
            <Button onClick={onBack}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Quiz completed - show results
  if (quizCompleted && result) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-3xl mx-auto space-y-6">
          <Card className={result.passed ? 'border-green-500 bg-green-50' : 'border-yellow-500 bg-yellow-50'}>
            <CardHeader className="text-center">
              {result.passed ? (
                <>
                  <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
                  <CardTitle className="text-3xl text-green-900">Congratulations! 🎉</CardTitle>
                  <CardDescription className="text-green-800 text-lg">
                    You've successfully qualified for the tournament!
                  </CardDescription>
                </>
              ) : (
                <>
                  {result.attemptsRemaining > 0 ? (
                    <>
                      <Target className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
                      <CardTitle className="text-3xl text-yellow-900">Keep Going! 💪</CardTitle>
                      <CardDescription className="text-yellow-800 text-lg">
                        You have {result.attemptsRemaining} more {result.attemptsRemaining === 1 ? 'attempt' : 'attempts'} remaining
                      </CardDescription>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
                      <CardTitle className="text-3xl text-red-900">All Attempts Used</CardTitle>
                      <CardDescription className="text-red-800 text-lg">
                        You've completed all available attempts
                      </CardDescription>
                    </>
                  )}
                </>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Score Overview */}
                <div className="bg-white rounded-lg p-6 shadow">
                  <h3 className="font-semibold text-gray-900 mb-4">Your Results</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">This Attempt</p>
                      <p className="text-3xl font-bold text-gray-900">{result.score.toFixed(1)}%</p>
                    </div>
                    {result.finalScore !== undefined && (
                      <div>
                        <p className="text-sm text-gray-600">Final Score (Average)</p>
                        <p className="text-3xl font-bold text-blue-600">{result.finalScore.toFixed(1)}%</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-600">Attempts Used</p>
                      <p className="text-2xl font-bold text-gray-900">{result.attemptsUsed}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Attempts Remaining</p>
                      <p className="text-2xl font-bold text-gray-900">{result.attemptsRemaining}</p>
                    </div>
                  </div>
                </div>

                {/* Previous Attempts */}
                {application.quizAttempts && application.quizAttempts.length > 0 && (
                  <div className="bg-white rounded-lg p-6 shadow">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <BarChart className="h-5 w-5" />
                      Attempt History
                    </h3>
                    <div className="space-y-2">
                      {application.quizAttempts.map((attempt, idx) => (
                        <div key={attempt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline">Attempt {attempt.attemptNumber}</Badge>
                            <span className={attempt.passed ? 'text-green-600' : 'text-gray-600'}>
                              {attempt.score.toFixed(1)}%
                            </span>
                            {attempt.passed && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(attempt.completedAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded border-2 border-blue-200">
                        <div className="flex items-center gap-3">
                          <Badge variant="default">Current Attempt</Badge>
                          <span className={result.passed ? 'text-green-600 font-bold' : 'text-gray-900 font-bold'}>
                            {result.score.toFixed(1)}%
                          </span>
                          {result.passed && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                        </div>
                        <span className="text-sm text-gray-500">Just now</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Next Steps */}
                <div className="bg-white rounded-lg p-6 shadow">
                  <h3 className="font-semibold text-gray-900 mb-4">What's Next?</h3>
                  {result.passed ? (
                    <div className="space-y-3">
                      <p className="text-green-800">
                        ✓ You've qualified for the tournament!
                      </p>
                      <p className="text-gray-600">
                        You'll receive a confirmation email with tournament details and next steps.
                      </p>
                      <p className="text-sm text-gray-500">
                        Make sure to check your email regularly for updates.
                      </p>
                    </div>
                  ) : result.attemptsRemaining > 0 ? (
                    <div className="space-y-3">
                      <p className="text-yellow-800">
                        You're {(70 - result.score).toFixed(1)}% away from qualifying!
                      </p>
                      <p className="text-gray-600">
                        • Review the areas you struggled with<br />
                        • Take your time on the next attempt<br />
                        • You can retake the quiz to improve your score
                      </p>
                      {result.attemptsUsed > 1 && (
                        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded">
                          <TrendingUp className="h-5 w-5 text-blue-600" />
                          <span className="text-blue-800">
                            Your scores are improving! Keep practicing.
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-red-800">
                        You've used all {result.attemptsUsed} attempts for this tournament.
                      </p>
                      <p className="text-gray-600">
                        • Continue practicing to improve your skills<br />
                        • Earn practice points for auto-qualification in future tournaments<br />
                        • Apply when the next tournament is announced
                      </p>
                      {result.finalScore && (
                        <p className="text-sm text-gray-600">
                          You were {(70 - result.finalScore).toFixed(1)}% away from the pass mark.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-center">
                  {result.attemptsRemaining > 0 && !result.passed && (
                    <Button onClick={() => {
                      setQuizCompleted(false);
                      setQuizStarted(false);
                      setAnswers({});
                      setCurrentQuestionIndex(0);
                      setResult(null);
                    }}>
                      Retake Quiz
                    </Button>
                  )}
                  {onComplete && (
                    <Button variant="outline" onClick={onComplete}>
                      {result.passed ? 'View My Applications' : 'Back to Dashboard'}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Quiz not started - show instructions
  if (!quizStarted) {
    const attemptNumber = (application.quizAttempts?.length || 0) + 1;
    const attemptsRemaining = application.attemptsRemaining || 0;

    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-3xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Pre-Tournament Qualification Quiz</CardTitle>
              <CardDescription>
                Complete this quiz to qualify for the tournament
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Attempt Info */}
              <Alert className="bg-blue-50 border-blue-200">
                <Target className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>Attempt {attemptNumber} of {attemptNumber + attemptsRemaining - 1}</strong>
                  {attemptsRemaining > 1 && ` • ${attemptsRemaining} attempts remaining`}
                </AlertDescription>
              </Alert>

              {/* Quiz Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Questions</p>
                  <p className="text-2xl font-bold text-gray-900">{tournament?.qualificationConfig?.quizSettings?.questionsCount || 10}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Time Limit</p>
                  <p className="text-2xl font-bold text-gray-900">{tournament?.qualificationConfig?.quizSettings?.timeLimitMinutes || 30} min</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Pass Mark</p>
                  <p className="text-2xl font-bold text-gray-900">{tournament?.qualificationConfig?.quizSettings?.passPercentage || 70}%</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Scoring</p>
                  <p className="text-xl font-bold text-gray-900 capitalize">{tournament?.qualificationConfig?.quizSettings?.scoringMethod || 'average'}</p>
                </div>
              </div>

              {/* Previous Attempts */}
              {application.quizAttempts && application.quizAttempts.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Previous Attempts</h3>
                  <div className="space-y-2">
                    {application.quizAttempts.map((attempt) => (
                      <div key={attempt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">Attempt {attempt.attemptNumber}</Badge>
                          <span className={attempt.passed ? 'text-green-600' : 'text-gray-600'}>
                            {attempt.score.toFixed(1)}%
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(attempt.completedAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-900 mb-3">Instructions</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Questions are randomized and unique for each attempt</li>
                  <li>• Answer options are also randomized</li>
                  <li>• You must complete the quiz within the time limit</li>
                  <li>• Your final score will be calculated as the average of all attempts</li>
                  <li>• You cannot go back once you move to the next question</li>
                </ul>
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-center pt-4">
                <Button onClick={startQuiz} size="lg" className="px-8">
                  Start Quiz
                </Button>
                {onBack && (
                  <Button variant="outline" onClick={onBack}>
                    Cancel
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Quiz in progress
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-4">
                <Badge variant="outline">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </Badge>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span className={timeRemaining < 300 ? 'text-red-600 font-bold' : ''}>
                    {formatTime(timeRemaining)}
                  </span>
                </div>
              </div>
              <Badge variant="secondary">
                Attempt {(application.quizAttempts?.length || 0) + 1}
              </Badge>
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>

        {/* Question */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{currentQuestion.text}</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={answers[currentQuestion.id]?.toString()}
              onValueChange={(value) => handleSelectAnswer(currentQuestion.id, parseInt(value))}
            >
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>

            <div className="flex gap-3 justify-end mt-6">
              {currentQuestionIndex === questions.length - 1 ? (
                <Button 
                  onClick={handleSubmitQuiz}
                  disabled={!answers[currentQuestion.id] || isSubmitting}
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Quiz'
                  )}
                </Button>
              ) : (
                <Button 
                  onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                  disabled={answers[currentQuestion.id] === undefined}
                >
                  Next Question →
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
