import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from './ui/input';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: 'tenant' | 'user' | 'ticket' | 'page';
  path: string;
}

const mockSearchData: SearchResult[] = [
  { id: '1', title: 'Dashboard', description: 'Platform overview and metrics', category: 'page', path: '/' },
  { id: '2', title: 'Tenants', description: 'Manage organization accounts', category: 'page', path: '/tenants' },
  { id: '3', title: 'Users', description: 'Manage platform users', category: 'page', path: '/users' },
  { id: '4', title: 'Analytics', description: 'View detailed metrics', category: 'page', path: '/analytics' },
  { id: '5', title: 'Settings', description: 'Configure platform preferences', category: 'page', path: '/settings' },
  { id: '6', title: 'Support Tickets', description: 'Manage customer support', category: 'page', path: '/support' },
  { id: '7', title: 'Reports', description: 'Generate and export reports', category: 'page', path: '/reports' },
  { id: '8', title: 'System Health', description: 'Monitor infrastructure', category: 'page', path: '/system-health' },
  { id: '9', title: 'API Documentation', description: 'API reference and guides', category: 'page', path: '/api-docs' },
  { id: '10', title: 'Audit Logs', description: 'View system activity', category: 'page', path: '/audit-logs' },
];

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (query.trim()) {
      const filtered = mockSearchData.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.description.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered);
    } else {
      setResults([]);
    }
  }, [query]);

  const handleSelect = (result: SearchResult) => {
    navigate(result.path);
    setIsOpen(false);
    setQuery('');
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
      >
        <Search className="w-4 h-4" />
        <span>Search...</span>
        <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono text-gray-500 bg-white border border-gray-300 rounded">
          <span>⌘</span>K
        </kbd>
      </button>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={() => setIsOpen(false)}
      />

      {/* Search Modal */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl z-50 p-4">
        <div className="bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center gap-3 p-4 border-b border-gray-200">
            <Search className="w-5 h-5 text-gray-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search pages, tenants, users..."
              className="flex-1 border-0 focus:ring-0 text-base"
              autoFocus
            />
            <button
              onClick={() => {
                setIsOpen(false);
                setQuery('');
              }}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto">
            {results.length === 0 && query && (
              <div className="p-8 text-center text-gray-500">
                No results found for "{query}"
              </div>
            )}
            {results.length === 0 && !query && (
              <div className="p-8 text-center text-gray-500">
                Start typing to search...
              </div>
            )}
            {results.map((result) => (
              <button
                key={result.id}
                onClick={() => handleSelect(result)}
                className="w-full flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{result.title}</div>
                  <div className="text-sm text-gray-500">{result.description}</div>
                </div>
                <div className="text-xs text-gray-400 capitalize bg-gray-100 px-2 py-1 rounded">
                  {result.category}
                </div>
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-3 border-t border-gray-200 text-xs text-gray-500 bg-gray-50">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded">↑↓</kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded">↵</kbd>
                Select
              </span>
            </div>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded">ESC</kbd>
              Close
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
