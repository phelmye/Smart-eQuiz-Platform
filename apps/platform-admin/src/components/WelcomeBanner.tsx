import { useState, useEffect } from 'react';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function WelcomeBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has dismissed the banner before
    const dismissed = localStorage.getItem('welcomeBannerDismissed');
    if (!dismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('welcomeBannerDismissed', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="mb-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg overflow-hidden">
      <div className="px-6 py-4 relative">
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          aria-label="Dismiss welcome banner"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 mt-1">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
          </div>

          <div className="flex-1 text-white">
            <h3 className="text-xl font-bold mb-2">
              Welcome to Platform Admin! 🎉
            </h3>
            <p className="text-white/90 mb-4 max-w-3xl">
              Manage your entire Smart eQuiz platform from this central dashboard. 
              Monitor tenants, track revenue, handle support tickets, and configure 
              system settings all in one place.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/tenants"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
              >
                View Tenants
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/settings"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-lg font-medium hover:bg-white/30 transition-colors backdrop-blur-sm"
              >
                Configure Settings
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={handleDismiss}
                className="inline-flex items-center gap-2 px-4 py-2 text-white/90 hover:text-white transition-colors"
              >
                Got it, thanks!
              </button>
            </div>
          </div>
        </div>

        {/* Quick Tips */}
        <div className="mt-4 pt-4 border-t border-white/20">
          <p className="text-sm text-white/80 flex items-center gap-2">
            💡 <span className="font-medium">Pro Tip:</span> 
            Press <kbd className="px-2 py-0.5 bg-white/20 rounded text-xs font-mono">⌘K</kbd> 
            or <kbd className="px-2 py-0.5 bg-white/20 rounded text-xs font-mono">Ctrl+K</kbd> 
            for quick navigation
          </p>
        </div>
      </div>
    </div>
  );
}
