import { ExternalLink, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import type { APIKeyGuide } from '@/lib/apiKeyGuides';

interface APIKeyHelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guide: APIKeyGuide | null;
}

export function APIKeyHelpDialog({ open, onOpenChange, guide }: APIKeyHelpDialogProps) {
  if (!guide) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <HelpCircle className="h-6 w-6 text-blue-600" />
            How to get {guide.service} API Key
          </DialogTitle>
          <DialogDescription>
            Provider: {guide.provider}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Quick Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={() => window.open(guide.signupUrl, '_blank', 'noopener,noreferrer')}
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Sign Up / Login
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open(guide.docsUrl, '_blank', 'noopener,noreferrer')}
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              View Documentation
            </Button>
          </div>

          {/* Step-by-step Instructions */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Step-by-Step Setup:</h3>
            <ol className="space-y-3">
              {guide.instructions.map((instruction, index) => (
                <li key={index} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  <span className="text-gray-700 pt-0.5">{instruction}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Testing Info */}
          {guide.testingInfo && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">💡 Testing & Pricing Info:</h4>
              <p className="text-sm text-blue-800">{guide.testingInfo}</p>
            </div>
          )}

          {/* Quick Links */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">📎 Quick Links:</h4>
            <div className="space-y-2">
              <a
                href={guide.signupUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
              >
                <ExternalLink className="h-3 w-3" />
                {guide.signupUrl}
              </a>
              <a
                href={guide.docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
              >
                <ExternalLink className="h-3 w-3" />
                {guide.docsUrl}
              </a>
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-900 mb-2">🔒 Security Best Practices:</h4>
            <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
              <li>Never share your API keys publicly or commit them to version control</li>
              <li>Use environment variables in production environments</li>
              <li>Rotate keys regularly and revoke unused keys</li>
              <li>Use different keys for development, staging, and production</li>
              <li>Monitor API usage and set up billing alerts</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface APIKeyHelpButtonProps {
  serviceKey: string;
  onClick: () => void;
}

export function APIKeyHelpButton({ serviceKey: _serviceKey, onClick }: APIKeyHelpButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
      title="How to get this API key"
    >
      <HelpCircle className="h-4 w-4 mr-1" />
      Setup Guide
    </Button>
  );
}
