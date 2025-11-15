import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

/**
 * Standard Admin Page Layout Wrapper
 * Provides consistent container, padding, and max-width across all admin pages
 */
interface AdminPageLayoutProps {
  children: React.ReactNode;
  maxWidth?: 'max-w-6xl' | 'max-w-7xl';
}

export const AdminPageLayout: React.FC<AdminPageLayoutProps> = ({ 
  children, 
  maxWidth = 'max-w-7xl' 
}) => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className={`${maxWidth} mx-auto`}>
        {children}
      </div>
    </div>
  );
};

/**
 * Standard Admin Page Header
 * Consistent header structure with back button, title, subtitle, and action buttons
 */
interface AdminHeaderProps {
  onBack: () => void;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  backButtonLabel?: string;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ 
  onBack, 
  title, 
  subtitle, 
  actions,
  backButtonLabel = 'Back'
}) => {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={onBack} title={backButtonLabel}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
          </div>
        </div>
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Standard Stats Grid Component
 * Consistent grid layout for statistics cards
 */
interface StatsGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export const StatsGrid: React.FC<StatsGridProps> = ({ 
  children, 
  columns = 4,
  className = ''
}) => {
  const gridClasses = {
    2: 'grid-cols-1 lg:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-4'
  };

  return (
    <div className={`grid ${gridClasses[columns]} gap-6 mb-6 ${className}`}>
      {children}
    </div>
  );
};

/**
 * Standard Stat Card Content
 * Consistent stat card layout with icon, value, and label
 */
interface StatCardContentProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  badge?: React.ReactNode;
}

export const StatCardContent: React.FC<StatCardContentProps> = ({ 
  icon, 
  value, 
  label,
  badge
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        {icon}
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-gray-600">{label}</p>
        </div>
      </div>
      {badge && <div>{badge}</div>}
    </div>
  );
};

/**
 * Standard spacing and typography constants for consistency
 */
export const LAYOUT_CONSTANTS = {
  // Spacing
  OUTER_PADDING: 'p-6',
  SECTION_GAP: 'mb-6',
  HEADER_GAP: 'mb-4',
  CARD_PADDING: 'p-6',
  FLEX_GAP_SMALL: 'space-x-2',
  FLEX_GAP_MEDIUM: 'space-x-4',
  
  // Typography
  PAGE_TITLE: 'text-3xl font-bold text-gray-900',
  PAGE_SUBTITLE: 'text-gray-600',
  CARD_TITLE: 'text-xl font-semibold text-gray-900',
  CARD_DESCRIPTION: 'text-sm text-gray-600',
  STAT_VALUE: 'text-2xl font-bold',
  STAT_LABEL: 'text-sm text-gray-600',
  
  // Container
  MAX_WIDTH: 'max-w-7xl',
  CONTAINER_BG: 'min-h-screen bg-gray-50'
};
