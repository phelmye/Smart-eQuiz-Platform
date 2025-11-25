import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Map route names to display names
  const routeNameMap: Record<string, string> = {
    'tenants': 'Tenants',
    'users': 'Users',
    'analytics': 'Analytics',
    'billing': 'Billing',
    'support': 'Support Tickets',
    'audit-logs': 'Audit Logs',
    'reports': 'Reports',
    'system-health': 'System Health',
    'api-docs': 'API Documentation',
    'settings': 'Settings',
    'marketing': 'Marketing',
    'media': 'Media Library',
  };

  // Don't show breadcrumbs on dashboard
  if (pathnames.length === 0) {
    return null;
  }

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
      <Link 
        to="/" 
        className="flex items-center hover:text-gray-900 transition-colors"
      >
        <Home className="w-4 h-4" />
      </Link>
      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const displayName = routeNameMap[name] || name.charAt(0).toUpperCase() + name.slice(1);

        return (
          <div key={name} className="flex items-center">
            <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
            {isLast ? (
              <span className="font-medium text-gray-900">{displayName}</span>
            ) : (
              <Link 
                to={routeTo} 
                className="hover:text-gray-900 transition-colors"
              >
                {displayName}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
