import { useState } from 'react';
import { Keyboard } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';

interface Shortcut {
  keys: string[];
  description: string;
  category: 'navigation' | 'actions' | 'general';
}

const shortcuts: Shortcut[] = [
  // Navigation
  { keys: ['Ctrl/Cmd', 'K'], description: 'Open global search', category: 'navigation' },
  { keys: ['G', 'D'], description: 'Go to Dashboard', category: 'navigation' },
  { keys: ['G', 'T'], description: 'Go to Tenants', category: 'navigation' },
  { keys: ['G', 'U'], description: 'Go to Users', category: 'navigation' },
  { keys: ['G', 'S'], description: 'Go to Settings', category: 'navigation' },
  
  // Actions
  { keys: ['N', 'T'], description: 'New Tenant', category: 'actions' },
  { keys: ['N', 'U'], description: 'New User', category: 'actions' },
  { keys: ['N', 'S'], description: 'New Support Ticket', category: 'actions' },
  { keys: ['Ctrl/Cmd', 'E'], description: 'Export current view', category: 'actions' },
  { keys: ['Ctrl/Cmd', 'R'], description: 'Refresh data', category: 'actions' },
  
  // General
  { keys: ['?'], description: 'Show this help', category: 'general' },
  { keys: ['Esc'], description: 'Close dialogs/modals', category: 'general' },
];

export function KeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 p-3 bg-white rounded-full shadow-lg border border-gray-200 hover:shadow-xl transition-shadow z-50"
        title="Keyboard Shortcuts (Press ?)"
      >
        <Keyboard className="w-5 h-5 text-gray-600" />
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Keyboard className="w-5 h-5" />
              Keyboard Shortcuts
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Navigation Shortcuts */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700">Navigation</Badge>
              </h3>
              <div className="space-y-2">
                {shortcuts
                  .filter((s) => s.category === 'navigation')
                  .map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50"
                    >
                      <span className="text-sm text-gray-700">{shortcut.description}</span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, i) => (
                          <div key={i} className="flex items-center gap-1">
                            <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded">
                              {key}
                            </kbd>
                            {i < shortcut.keys.length - 1 && (
                              <span className="text-gray-400 text-xs">+</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Action Shortcuts */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Badge variant="outline" className="bg-green-50 text-green-700">Actions</Badge>
              </h3>
              <div className="space-y-2">
                {shortcuts
                  .filter((s) => s.category === 'actions')
                  .map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50"
                    >
                      <span className="text-sm text-gray-700">{shortcut.description}</span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, i) => (
                          <div key={i} className="flex items-center gap-1">
                            <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded">
                              {key}
                            </kbd>
                            {i < shortcut.keys.length - 1 && (
                              <span className="text-gray-400 text-xs">+</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* General Shortcuts */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Badge variant="outline" className="bg-purple-50 text-purple-700">General</Badge>
              </h3>
              <div className="space-y-2">
                {shortcuts
                  .filter((s) => s.category === 'general')
                  .map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50"
                    >
                      <span className="text-sm text-gray-700">{shortcut.description}</span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, i) => (
                          <div key={i} className="flex items-center gap-1">
                            <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded">
                              {key}
                            </kbd>
                            {i < shortcut.keys.length - 1 && (
                              <span className="text-gray-400 text-xs">+</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Pro Tips */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">💡 Pro Tips</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Press <kbd className="px-1.5 py-0.5 text-xs bg-white border rounded">Ctrl/Cmd + K</kbd> anytime to quickly search and navigate</li>
                <li>• Use the floating action button (bottom right) for quick actions</li>
                <li>• Click the bell icon to view real-time notifications</li>
                <li>• Export data to CSV from any list view using the export button</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
