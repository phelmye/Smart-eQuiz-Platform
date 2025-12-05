import { Link } from 'react-router-dom';
import { Heart, ExternalLink } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="px-6 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left side - Copyright and version */}
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>© {currentYear} Smart eQuiz Platform</span>
            <span className="hidden md:inline">•</span>
            <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-mono">
              v1.0.0
            </span>
          </div>

          {/* Center - Made with love */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Built with</span>
            <Heart className="w-4 h-4 text-red-500 fill-current" />
            <span>by the Platform Team</span>
          </div>

          {/* Right side - Quick links */}
          <div className="flex items-center gap-4 text-sm">
            <Link 
              to="/api-docs" 
              className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1"
            >
              API Docs
            </Link>
            <Link 
              to="/support" 
              className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1"
            >
              Support
            </Link>
            <a
              href="https://status.smartequiz.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1"
            >
              Status
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
