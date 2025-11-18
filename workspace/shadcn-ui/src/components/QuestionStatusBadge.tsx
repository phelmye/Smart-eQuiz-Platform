import React from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  FileEdit, 
  Clock, 
  CheckCircle, 
  Lock, 
  Zap, 
  History, 
  Archive 
} from 'lucide-react';
import { QuestionStatus, QuestionApprovalStatus } from '@/lib/mockData';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface QuestionStatusBadgeProps {
  status: QuestionStatus;
  className?: string;
  showIcon?: boolean;
  showTooltip?: boolean;
}

interface ApprovalStatusBadgeProps {
  status: QuestionApprovalStatus;
  className?: string;
  showIcon?: boolean;
  showTooltip?: boolean;
}

const STATUS_CONFIG = {
  [QuestionStatus.DRAFT]: {
    label: 'Draft',
    variant: 'secondary' as const,
    icon: FileEdit,
    color: 'bg-gray-100 text-gray-700 border-gray-300',
    tooltip: 'Question is being created or edited'
  },
  [QuestionStatus.AI_PENDING_REVIEW]: {
    label: 'Pending Review',
    variant: 'outline' as const,
    icon: Clock,
    color: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    tooltip: 'AI-generated question awaiting approval'
  },
  [QuestionStatus.QUESTION_POOL]: {
    label: 'Available',
    variant: 'default' as const,
    icon: CheckCircle,
    color: 'bg-green-100 text-green-700 border-green-300',
    tooltip: 'Approved and available for practice mode'
  },
  [QuestionStatus.TOURNAMENT_RESERVED]: {
    label: 'Reserved',
    variant: 'secondary' as const,
    icon: Lock,
    color: 'bg-blue-100 text-blue-700 border-blue-300',
    tooltip: 'Locked for upcoming tournament'
  },
  [QuestionStatus.TOURNAMENT_ACTIVE]: {
    label: 'In Tournament',
    variant: 'default' as const,
    icon: Zap,
    color: 'bg-purple-100 text-purple-700 border-purple-300',
    tooltip: 'Currently being used in active tournament'
  },
  [QuestionStatus.RECENT_TOURNAMENT]: {
    label: 'Recent',
    variant: 'outline' as const,
    icon: History,
    color: 'bg-orange-100 text-orange-700 border-orange-300',
    tooltip: 'From last tournament, may have delayed release'
  },
  [QuestionStatus.ARCHIVED]: {
    label: 'Archived',
    variant: 'secondary' as const,
    icon: Archive,
    color: 'bg-gray-100 text-gray-500 border-gray-300',
    tooltip: 'Retired from active use'
  }
};

const APPROVAL_CONFIG = {
  [QuestionApprovalStatus.PENDING]: {
    label: 'Pending',
    variant: 'outline' as const,
    icon: Clock,
    color: 'bg-yellow-50 text-yellow-700 border-yellow-300',
    tooltip: 'Awaiting review and approval'
  },
  [QuestionApprovalStatus.APPROVED]: {
    label: 'Approved',
    variant: 'default' as const,
    icon: CheckCircle,
    color: 'bg-green-50 text-green-700 border-green-300',
    tooltip: 'Question has been approved'
  },
  [QuestionApprovalStatus.REJECTED]: {
    label: 'Rejected',
    variant: 'destructive' as const,
    icon: Archive,
    color: 'bg-red-50 text-red-700 border-red-300',
    tooltip: 'Question was rejected'
  },
  [QuestionApprovalStatus.NEEDS_REVISION]: {
    label: 'Needs Revision',
    variant: 'secondary' as const,
    icon: FileEdit,
    color: 'bg-orange-50 text-orange-700 border-orange-300',
    tooltip: 'Question requires changes before approval'
  }
};

export const QuestionStatusBadge: React.FC<QuestionStatusBadgeProps> = ({ 
  status, 
  className = '',
  showIcon = true,
  showTooltip = true
}) => {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  const badge = (
    <Badge 
      variant={config.variant}
      className={`${config.color} ${className} flex items-center gap-1`}
    >
      {showIcon && <Icon className="w-3 h-3" />}
      {config.label}
    </Badge>
  );

  if (showTooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {badge}
          </TooltipTrigger>
          <TooltipContent>
            <p>{config.tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return badge;
};

export const ApprovalStatusBadge: React.FC<ApprovalStatusBadgeProps> = ({ 
  status, 
  className = '',
  showIcon = true,
  showTooltip = true
}) => {
  const config = APPROVAL_CONFIG[status];
  const Icon = config.icon;

  const badge = (
    <Badge 
      variant={config.variant}
      className={`${config.color} ${className} flex items-center gap-1`}
    >
      {showIcon && <Icon className="w-3 h-3" />}
      {config.label}
    </Badge>
  );

  if (showTooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {badge}
          </TooltipTrigger>
          <TooltipContent>
            <p>{config.tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return badge;
};

// Helper component for displaying both status badges together
interface CombinedStatusBadgesProps {
  status: QuestionStatus;
  approvalStatus?: QuestionApprovalStatus;
  className?: string;
  showIcons?: boolean;
  showTooltips?: boolean;
}

export const CombinedStatusBadges: React.FC<CombinedStatusBadgesProps> = ({
  status,
  approvalStatus,
  className = '',
  showIcons = true,
  showTooltips = true
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <QuestionStatusBadge 
        status={status} 
        showIcon={showIcons}
        showTooltip={showTooltips}
      />
      {approvalStatus && (
        <ApprovalStatusBadge 
          status={approvalStatus}
          showIcon={showIcons}
          showTooltip={showTooltips}
        />
      )}
    </div>
  );
};

// Export individual status configs for use in filters/legends
export { STATUS_CONFIG, APPROVAL_CONFIG };
