import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { X, Clock, RefreshCw, Rocket } from 'lucide-react';
import { useDemoSession } from '@/hooks/useDemoSession';

interface DemoBannerProps {
  onUpgrade?: () => void;
}

export function DemoBanner({ onUpgrade }: DemoBannerProps) {
  const { session, isDemo, getTimeRemainingFormatted, resetSession } = useDemoSession();
  const [timeRemaining, setTimeRemaining] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  const [isResetting, setIsResetting] = useState(false);

  // Update time remaining every second
  useEffect(() => {
    if (!isDemo) return;

    const interval = setInterval(() => {
      setTimeRemaining(getTimeRemainingFormatted());
    }, 1000);

    return () => clearInterval(interval);
  }, [isDemo, getTimeRemainingFormatted]);

  const handleReset = async () => {
    setIsResetting(true);
    try {
      await resetSession();
    } finally {
      setIsResetting(false);
    }
  };

  if (!isDemo || !isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Demo info */}
          <div className="flex items-center gap-3 flex-1">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Clock className="h-4 w-4" />
              <span>DEMO MODE</span>
            </div>
            <div className="hidden md:block text-sm opacity-90">
              Session expires in: <span className="font-semibold">{timeRemaining}</span>
            </div>
            <div className="hidden lg:block text-xs opacity-75">
              Your changes are temporary and will be reset after the session expires
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Reset button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              disabled={isResetting}
              className="text-white hover:bg-white/20 hover:text-white"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isResetting ? 'animate-spin' : ''}`} />
              Reset Demo
            </Button>

            {/* Upgrade button */}
            {onUpgrade && (
              <Button
                size="sm"
                onClick={onUpgrade}
                className="bg-white text-blue-600 hover:bg-blue-50"
              >
                <Rocket className="h-4 w-4 mr-2" />
                Upgrade to Save Your Work
              </Button>
            )}

            {/* Close button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="text-white hover:bg-white/20 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Mobile: Time remaining */}
        <div className="md:hidden text-xs opacity-90 mt-2">
          Session expires in: <span className="font-semibold">{timeRemaining}</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Simple banner for non-authenticated demo pages
 */
export function SimpleDemoBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <Alert className="fixed top-0 left-0 right-0 z-50 rounded-none border-0 bg-blue-600 text-white">
      <div className="flex items-center justify-between">
        <AlertDescription className="text-white">
          <strong>Demo Mode:</strong> You're viewing a demonstration. Sign up to create your own quiz platform!
        </AlertDescription>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsVisible(false)}
          className="text-white hover:bg-white/20"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Alert>
  );
}
