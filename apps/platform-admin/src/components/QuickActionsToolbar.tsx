import { useState } from 'react';
import { Plus, UserPlus, Building2, FileText, Mail, Download, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface QuickAction {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  action: () => void;
  color: string;
}

export function QuickActionsToolbar() {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

  const actions: QuickAction[] = [
    {
      id: 'add-tenant',
      name: 'New Tenant',
      description: 'Register organization',
      icon: Building2,
      action: () => navigate('/tenants'),
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      id: 'add-user',
      name: 'New User',
      description: 'Add platform user',
      icon: UserPlus,
      action: () => navigate('/users'),
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      id: 'new-ticket',
      name: 'New Ticket',
      description: 'Create support ticket',
      icon: FileText,
      action: () => navigate('/support'),
      color: 'bg-purple-500 hover:bg-purple-600',
    },
    {
      id: 'send-broadcast',
      name: 'Broadcast',
      description: 'Send email to all',
      icon: Mail,
      action: () => {
        // TODO: Implement broadcast email feature
        console.log('Navigate to broadcast email feature');
        // navigate('/broadcast');
      },
      color: 'bg-orange-500 hover:bg-orange-600',
    },
    {
      id: 'export-data',
      name: 'Export Data',
      description: 'Download reports',
      icon: Download,
      action: () => navigate('/reports'),
      color: 'bg-indigo-500 hover:bg-indigo-600',
    },
    {
      id: 'settings',
      name: 'Settings',
      description: 'Configure platform',
      icon: Settings,
      action: () => navigate('/settings'),
      color: 'bg-gray-500 hover:bg-gray-600',
    },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Expanded Actions */}
      {isExpanded && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 -z-10"
            onClick={() => setIsExpanded(false)}
          />
          
          {/* Actions Grid */}
          <div className="absolute bottom-20 right-0 mb-2">
            <div className="grid grid-cols-2 gap-3 bg-white p-4 rounded-lg shadow-2xl border border-gray-200 w-80">
              {actions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    onClick={() => {
                      action.action();
                      setIsExpanded(false);
                    }}
                    className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center text-white transition-transform group-hover:scale-110`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-900">
                        {action.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {action.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Main FAB Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white transition-all ${
          isExpanded
            ? 'bg-red-500 hover:bg-red-600 rotate-45'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Tooltip */}
      {!isExpanded && (
        <div className="absolute bottom-16 right-0 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
          Quick Actions
          <div className="absolute bottom-0 right-6 transform translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
        </div>
      )}
    </div>
  );
}
