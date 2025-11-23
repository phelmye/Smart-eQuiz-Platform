import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Check, 
  ArrowRight, 
  ArrowLeft,
  Users,
  Trophy,
  Settings,
  Sparkles,
  X
} from 'lucide-react';
import { storage, STORAGE_KEYS } from '@/lib/mockData';

interface OnboardingWizardProps {
  onComplete: () => void;
  onSkip?: () => void;
}

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  content: React.ReactNode;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  onComplete,
  onSkip
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    organizationType: '',
    teamSize: '',
    primaryUse: '',
    goals: [] as string[],
    preferences: {
      emailNotifications: true,
      weeklyDigest: true,
      tournamentAlerts: true
    }
  });

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Smart eQuiz Platform! 🎉',
      description: 'Let\'s get you set up in just a few steps',
      icon: Sparkles,
      content: (
        <div className="space-y-6 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center">
            <Sparkles className="h-12 w-12 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-2">You're all set!</h3>
            <p className="text-gray-600">
              We'll help you customize your experience to get the most out of Smart eQuiz.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
            <div className="text-center">
              <div className="bg-blue-100 h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-2">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <p className="text-xs font-medium">Manage Teams</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-2">
                <Trophy className="h-6 w-6 text-purple-600" />
              </div>
              <p className="text-xs font-medium">Run Tournaments</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-2">
                <Settings className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-xs font-medium">Track Analytics</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'organization',
      title: 'Tell us about your organization',
      description: 'This helps us personalize your experience',
      icon: Users,
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">What type of organization are you?</label>
            <div className="grid grid-cols-2 gap-3">
              {['Educational Institution', 'Corporate', 'Non-Profit', 'Individual'].map((type) => (
                <Button
                  key={type}
                  variant={formData.organizationType === type ? 'default' : 'outline'}
                  className="h-auto py-3 justify-start"
                  onClick={() => setFormData({ ...formData, organizationType: type })}
                >
                  {formData.organizationType === type && (
                    <Check className="mr-2 h-4 w-4" />
                  )}
                  {type}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Team size</label>
            <div className="grid grid-cols-2 gap-3">
              {['1-10', '11-50', '51-200', '200+'].map((size) => (
                <Button
                  key={size}
                  variant={formData.teamSize === size ? 'default' : 'outline'}
                  className="h-auto py-3"
                  onClick={() => setFormData({ ...formData, teamSize: size })}
                >
                  {formData.teamSize === size && (
                    <Check className="mr-2 h-4 w-4" />
                  )}
                  {size} people
                </Button>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'usage',
      title: 'How will you use Smart eQuiz?',
      description: 'Select your primary use case',
      icon: Trophy,
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Primary use case</label>
            <div className="space-y-2">
              {[
                { value: 'training', label: 'Employee Training & Assessment', desc: 'Test knowledge and skills' },
                { value: 'education', label: 'Student Education', desc: 'Classroom quizzes and exams' },
                { value: 'tournaments', label: 'Competitive Tournaments', desc: 'Engage through competition' },
                { value: 'certification', label: 'Certification Programs', desc: 'Professional certifications' }
              ].map((use) => (
                <Button
                  key={use.value}
                  variant={formData.primaryUse === use.value ? 'default' : 'outline'}
                  className="w-full h-auto py-4 justify-start text-left"
                  onClick={() => setFormData({ ...formData, primaryUse: use.value })}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {formData.primaryUse === use.value && (
                        <Check className="h-4 w-4" />
                      )}
                      <span className="font-medium">{use.label}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{use.desc}</p>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'goals',
      title: 'What are your goals?',
      description: 'Select all that apply',
      icon: Settings,
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">I want to...</label>
            <div className="space-y-2">
              {[
                'Increase engagement',
                'Improve knowledge retention',
                'Track performance metrics',
                'Run competitive events',
                'Certify learners',
                'Gamify learning'
              ].map((goal) => (
                <Button
                  key={goal}
                  variant={formData.goals.includes(goal) ? 'default' : 'outline'}
                  className="w-full justify-start"
                  onClick={() => {
                    const newGoals = formData.goals.includes(goal)
                      ? formData.goals.filter(g => g !== goal)
                      : [...formData.goals, goal];
                    setFormData({ ...formData, goals: newGoals });
                  }}
                >
                  {formData.goals.includes(goal) && (
                    <Check className="mr-2 h-4 w-4" />
                  )}
                  {goal}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'complete',
      title: 'You\'re all set! 🚀',
      description: 'Start creating amazing quiz experiences',
      icon: Check,
      content: (
        <div className="space-y-6 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mx-auto flex items-center justify-center">
            <Check className="h-12 w-12 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-2">Setup Complete!</h3>
            <p className="text-gray-600">
              Your workspace is ready. Here's what you can do next:
            </p>
          </div>
          <div className="space-y-3 max-w-md mx-auto text-left">
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="bg-blue-100 h-8 w-8 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-blue-600">1</span>
              </div>
              <div>
                <p className="font-medium text-sm">Create your first question</p>
                <p className="text-xs text-gray-600">Build your question bank</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
              <div className="bg-purple-100 h-8 w-8 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-purple-600">2</span>
              </div>
              <div>
                <p className="font-medium text-sm">Invite your team</p>
                <p className="text-xs text-gray-600">Collaborate with colleagues</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
              <div className="bg-green-100 h-8 w-8 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-green-600">3</span>
              </div>
              <div>
                <p className="font-medium text-sm">Launch a tournament</p>
                <p className="text-xs text-gray-600">Engage your audience</p>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;
  const currentStepData = steps[currentStep];
  const StepIcon = currentStepData.icon;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Save onboarding data
      const currentUser = storage.get(STORAGE_KEYS.CURRENT_USER);
      if (currentUser) {
        currentUser.onboardingCompleted = true;
        currentUser.onboardingData = formData;
        storage.set(STORAGE_KEYS.CURRENT_USER, currentUser);
      }
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return true;
      case 1: return formData.organizationType && formData.teamSize;
      case 2: return formData.primaryUse;
      case 3: return formData.goals.length > 0;
      case 4: return true;
      default: return true;
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 z-50 overflow-y-auto">
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          {/* Header */}
          <div className="p-6 border-b">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <StepIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{currentStepData.title}</h2>
                  <p className="text-sm text-gray-500">{currentStepData.description}</p>
                </div>
              </div>
              {onSkip && currentStep < steps.length - 1 && (
                <Button variant="ghost" size="sm" onClick={onSkip}>
                  <X className="h-4 w-4 mr-1" />
                  Skip
                </Button>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Step {currentStep + 1} of {steps.length}</span>
                <Badge variant="secondary">{Math.round(progress)}%</Badge>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </div>

          {/* Content */}
          <CardContent className="p-6 min-h-[400px]">
            {currentStepData.content}
          </CardContent>

          {/* Footer */}
          <div className="p-6 border-t bg-gray-50">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={currentStep === 0}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                size="lg"
              >
                {currentStep === steps.length - 1 ? (
                  <>
                    Get Started
                    <Check className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default OnboardingWizard;
