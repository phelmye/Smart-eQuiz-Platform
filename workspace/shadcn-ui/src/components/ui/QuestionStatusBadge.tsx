import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { QuestionStatus, QuestionApprovalStatus } from '@/lib/mockData';
import { FileText, Clock, CheckCircle, Lock, Play, History, Archive } from 'lucide-react';

interface QuestionStatusBadgeProps {
  status: QuestionStatus;
  approvalStatus?: QuestionApprovalStatus;
  showTooltip?: boolean;
  showIcon?: boolean;
  size?: 'sm' | 'default' | 'lg';
}

const statusConfig: Record<QuestionStatus, {
  color: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}> = {
  [QuestionStatus.DRAFT]: {
    color: 'gray',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-800',
    borderColor: 'border-gray-300',
    label: 'Draft',
    description: 'Question is being created or edited',
    icon: FileText
  },
  [QuestionStatus.AI_PENDING_REVIEW]: {
    color: 'yellow',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    borderColor: 'border-yellow-300',
    label: 'Pending Review',
    description: 'AI-generated question awaiting approval',
    icon: Clock
  },
  [QuestionStatus.QUESTION_POOL]: {
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    borderColor: 'border-green-300',
    label: 'Question Pool',
    description: 'Available for practice and tournament selection',
    icon: CheckCircle
  },
  [QuestionStatus.TOURNAMENT_RESERVED]: {
    color: 'blue',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    borderColor: 'border-blue-300',
    label: 'Tournament Reserved',
    description: 'Locked for upcoming tournament (hidden from practice)',
    icon: Lock
  },
  [QuestionStatus.TOURNAMENT_ACTIVE]: {
    color: 'purple',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-800',
    borderColor: 'border-purple-300',
    label: 'Tournament Active',
    description: 'Currently being used in active tournament',
    icon: Play
  },
  [QuestionStatus.RECENT_TOURNAMENT]: {
    color: 'teal',
    bgColor: 'bg-teal-100',
    textColor: 'text-teal-800',
    borderColor: 'border-teal-300',
    label: 'Recent Tournament',
    description: 'From last tournament - available for practice',
    icon: History
  },
  [QuestionStatus.ARCHIVED]: {
    color: 'red',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    borderColor: 'border-red-300',
    label: 'Archived',
    description: 'Retired question - no longer in use',
    icon: Archive
  }
};

const approvalStatusConfig: Record<QuestionApprovalStatus, {
  bgColor: string;
  textColor: string;
  borderColor: string;
  label: string;
}> = {
  [QuestionApprovalStatus.PENDING]: {
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-700',
    borderColor: 'border-yellow-200',
    label: 'Pending'
  },
  [QuestionApprovalStatus.APPROVED]: {
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
    label: 'Approved'
  },
  [QuestionApprovalStatus.REJECTED]: {
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    borderColor: 'border-red-200',
    label: 'Rejected'
  },
  [QuestionApprovalStatus.NEEDS_REVISION]: {
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-200',
    label: 'Needs Revision'
  }
};

export function QuestionStatusBadge({ 
  status, 
  approvalStatus, 
  showTooltip = true,
  showIcon = true,
  size = 'default'
}: QuestionStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    default: 'text-sm px-2.5 py-0.5',
    lg: 'text-base px-3 py-1'
  };
  
  const iconSizes = {
    sm: 'h-3 w-3',
    default: 'h-3.5 w-3.5',
    lg: 'h-4 w-4'
  };

  const badge = (
    <div className="inline-flex items-center gap-1.5">
      <span 
        className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${config.bgColor} ${config.textColor} ${config.borderColor} ${sizeClasses[size]}`}
      >
        {showIcon && <Icon className={iconSizes[size]} />}
        {config.label}
      </span>
      
      {approvalStatus && (
        <span 
          className={`inline-flex items-center rounded-full border font-medium ${approvalStatusConfig[approvalStatus].bgColor} ${approvalStatusConfig[approvalStatus].textColor} ${approvalStatusConfig[approvalStatus].borderColor} ${sizeClasses[size]}`}
        >
          {approvalStatusConfig[approvalStatus].label}
        </span>
      )}
    </div>
  );

  if (!showTooltip) {
    return badge;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent>
          <div className="max-w-xs">
            <p className="font-semibold">{config.label}</p>
            <p className="text-sm text-gray-600">{config.description}</p>
            {approvalStatus && (
              <p className="text-xs text-gray-500 mt-1">
                Approval: {approvalStatusConfig[approvalStatus].label}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Compact version for table cells
export function QuestionStatusDot({ 
  status, 
  showLabel = false 
}: { 
  status: QuestionStatus; 
  showLabel?: boolean;
}) {
  const config = statusConfig[status];
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-flex items-center gap-2">
            <span 
              className={`inline-block w-2.5 h-2.5 rounded-full ${config.bgColor} ${config.borderColor} border-2`}
              aria-label={config.label}
            />
            {showLabel && (
              <span className="text-sm text-gray-700">{config.label}</span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-semibold">{config.label}</p>
          <p className="text-sm text-gray-600">{config.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Status legend component for displaying all statuses
export function QuestionStatusLegend() {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-sm text-gray-700">Question Status Legend</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {Object.entries(statusConfig).map(([status, config]) => {
          const Icon = config.icon;
          return (
            <div key={status} className="flex items-start gap-2 text-sm">
              <Icon className={`h-4 w-4 mt-0.5 ${config.textColor}`} />
              <div>
                <div className="font-medium">{config.label}</div>
                <div className="text-xs text-gray-600">{config.description}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
