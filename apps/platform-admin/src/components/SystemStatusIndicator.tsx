import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

type SystemStatus = 'operational' | 'degraded' | 'down';

export function SystemStatusIndicator() {
  const [status, setStatus] = useState<SystemStatus>('operational');
  const [showDetails, setShowDetails] = useState(false);

  // Simulate status check (in production, this would be a real API call)
  useEffect(() => {
    const checkStatus = () => {
      // Simulate checking system health
      const random = Math.random();
      if (random > 0.95) {
        setStatus('degraded');
      } else if (random > 0.98) {
        setStatus('down');
      } else {
        setStatus('operational');
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const statusConfig = {
    operational: {
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      icon: CheckCircle,
      label: 'All Systems Operational',
      description: 'All services are running normally',
    },
    degraded: {
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      icon: AlertCircle,
      label: 'Degraded Performance',
      description: 'Some services experiencing delays',
    },
    down: {
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      icon: AlertCircle,
      label: 'Service Disruption',
      description: 'Some services are currently unavailable',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className="relative">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`flex items-center gap-2 px-3 py-1.5 ${config.bgColor} rounded-full hover:opacity-80 transition-opacity`}
        title="System Status"
      >
        <div className="relative">
          <Icon className={`w-4 h-4 ${config.color}`} />
          {status === 'operational' && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          )}
        </div>
        <span className={`text-sm font-medium ${config.color} hidden sm:inline`}>
          {config.label}
        </span>
      </button>

      {showDetails && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDetails(false)}
          ></div>
          <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
            <div className="flex items-start gap-3 mb-3">
              <Icon className={`w-5 h-5 ${config.color} mt-0.5`} />
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{config.label}</h4>
                <p className="text-sm text-gray-600 mt-1">{config.description}</p>
              </div>
            </div>

            <div className="space-y-2 border-t pt-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">API Server</span>
                <span className={status === 'operational' ? 'text-green-600' : 'text-yellow-600'}>
                  {status === 'operational' ? 'Operational' : 'Degraded'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Database</span>
                <span className="text-green-600">Operational</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">CDN</span>
                <span className="text-green-600">Operational</span>
              </div>
            </div>

            <Link
              to="/system-health"
              className="block mt-3 pt-3 border-t text-sm text-blue-600 hover:text-blue-800 font-medium text-center"
              onClick={() => setShowDetails(false)}
            >
              View Full Status Page →
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
