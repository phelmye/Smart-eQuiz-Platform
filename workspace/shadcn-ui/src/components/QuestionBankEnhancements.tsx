import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Search, Filter, Eye, History, CheckSquare, XSquare, 
  Sparkles, Clock, ChevronDown, ChevronUp 
} from 'lucide-react';
import { 
  Question, 
  QuestionStatus, 
  QuestionApprovalStatus,
  QuestionLifecycleLog,
  storage, 
  STORAGE_KEYS,
  updateQuestionStatus
} from '@/lib/mockData';
import { QuestionStatusBadge, ApprovalStatusBadge, CombinedStatusBadges } from './QuestionStatusBadge';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

interface EnhancedQuestionFiltersProps {
  onFiltersChange: (filters: QuestionFilters) => void;
}

interface QuestionFilters {
  search: string;
  status: QuestionStatus | 'all';
  approvalStatus: QuestionApprovalStatus | 'all';
  source: 'all' | 'manual' | 'ai';
  category: string;
  difficulty: 'all' | 'easy' | 'medium' | 'hard';
}

interface LifecycleHistoryDialogProps {
  questionId: string;
  questionText: string;
  isOpen: boolean;
  onClose: () => void;
}

const LifecycleHistoryDialog: React.FC<LifecycleHistoryDialogProps> = ({ 
  questionId, 
  questionText,
  isOpen, 
  onClose 
}) => {
  const [logs, setLogs] = useState<QuestionLifecycleLog[]>([]);

  useEffect(() => {
    if (isOpen) {
      const allLogs = storage.get(STORAGE_KEYS.QUESTION_LIFECYCLE_LOGS) as QuestionLifecycleLog[] || [];
      const questionLogs = allLogs
        .filter(log => log.questionId === questionId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setLogs(questionLogs);
    }
  }, [isOpen, questionId]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Lifecycle History</DialogTitle>
          <DialogDescription className="text-sm">
            {questionText.substring(0, 100)}{questionText.length > 100 ? '...' : ''}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {logs.length === 0 ? (
            <Alert>
              <AlertDescription>No lifecycle events recorded for this question.</AlertDescription>
            </Alert>
          ) : (
            logs.map((log, index) => (
              <Card key={log.id} className="border-l-4 border-l-blue-500">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <QuestionStatusBadge status={log.fromStatus} showTooltip={false} />
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                        <QuestionStatusBadge status={log.toStatus} showTooltip={false} />
                      </div>
                      
                      <p className="text-sm text-gray-600">{log.reason}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>
                          {log.triggeredBy === 'user' ? 'User' : 'System'} action
                        </span>
                        <span>•</span>
                        <span>{new Date(log.createdAt).toLocaleString()}</span>
                        {log.tournamentId && (
                          <>
                            <span>•</span>
                            <span>Tournament: {log.tournamentId}</span>
                          </>
                        )}
                      </div>

                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <details className="text-xs">
                          <summary className="cursor-pointer text-gray-500">Show metadata</summary>
                          <pre className="mt-2 p-2 bg-gray-50 rounded overflow-x-auto">
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Helper component
const ChevronRight: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

export const EnhancedQuestionFilters: React.FC<EnhancedQuestionFiltersProps> = ({ onFiltersChange }) => {
  const [filters, setFilters] = useState<QuestionFilters>({
    search: '',
    status: 'all',
    approvalStatus: 'all',
    source: 'all',
    category: 'all',
    difficulty: 'all'
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleFilterChange = (key: keyof QuestionFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {showAdvanced ? 'Less' : 'More'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search questions..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Status Filter */}
          <div>
            <label className="text-sm font-medium mb-1 block">Status</label>
            <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value={QuestionStatus.DRAFT}>Draft</SelectItem>
                <SelectItem value={QuestionStatus.AI_PENDING_REVIEW}>Pending Review</SelectItem>
                <SelectItem value={QuestionStatus.QUESTION_POOL}>Question Pool</SelectItem>
                <SelectItem value={QuestionStatus.TOURNAMENT_RESERVED}>Reserved</SelectItem>
                <SelectItem value={QuestionStatus.TOURNAMENT_ACTIVE}>In Tournament</SelectItem>
                <SelectItem value={QuestionStatus.RECENT_TOURNAMENT}>Recent</SelectItem>
                <SelectItem value={QuestionStatus.ARCHIVED}>Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Source Filter */}
          <div>
            <label className="text-sm font-medium mb-1 block">Source</label>
            <Select value={filters.source} onValueChange={(value) => handleFilterChange('source', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="ai">AI Generated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Difficulty Filter */}
          <div>
            <label className="text-sm font-medium mb-1 block">Difficulty</label>
            <Select value={filters.difficulty} onValueChange={(value) => handleFilterChange('difficulty', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            {/* Approval Status Filter */}
            <div>
              <label className="text-sm font-medium mb-1 block">Approval Status</label>
              <Select value={filters.approvalStatus} onValueChange={(value) => handleFilterChange('approvalStatus', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Approval States</SelectItem>
                  <SelectItem value={QuestionApprovalStatus.PENDING}>Pending</SelectItem>
                  <SelectItem value={QuestionApprovalStatus.APPROVED}>Approved</SelectItem>
                  <SelectItem value={QuestionApprovalStatus.REJECTED}>Rejected</SelectItem>
                  <SelectItem value={QuestionApprovalStatus.NEEDS_REVISION}>Needs Revision</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="text-sm font-medium mb-1 block">Category</label>
              <Input
                placeholder="Filter by category..."
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface BulkActionBarProps {
  selectedCount: number;
  onApproveSelected: () => void;
  onRejectSelected: () => void;
  onClearSelection: () => void;
}

export const BulkActionBar: React.FC<BulkActionBarProps> = ({
  selectedCount,
  onApproveSelected,
  onRejectSelected,
  onClearSelection
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <Card className="shadow-lg border-2 border-blue-500">
        <CardContent className="py-3 px-6">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">
              {selectedCount} question{selectedCount !== 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                variant="default"
                onClick={onApproveSelected}
                className="flex items-center gap-1"
              >
                <CheckSquare className="w-4 h-4" />
                Approve
              </Button>
              <Button 
                size="sm" 
                variant="destructive"
                onClick={onRejectSelected}
                className="flex items-center gap-1"
              >
                <XSquare className="w-4 h-4" />
                Reject
              </Button>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={onClearSelection}
              >
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

interface QuestionTableRowProps {
  question: Question;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onViewHistory: (question: Question) => void;
  onPreview: (question: Question) => void;
}

export const QuestionTableRow: React.FC<QuestionTableRowProps> = ({
  question,
  isSelected,
  onSelect,
  onViewHistory,
  onPreview
}) => {
  return (
    <TableRow className={isSelected ? 'bg-blue-50' : ''}>
      <TableCell>
        <Checkbox 
          checked={isSelected}
          onCheckedChange={() => onSelect(question.id)}
        />
      </TableCell>
      <TableCell className="max-w-md">
        <div className="space-y-1">
          <p className="font-medium">{question.text.substring(0, 80)}{question.text.length > 80 ? '...' : ''}</p>
          <div className="flex items-center gap-2 flex-wrap">
            {question.source === 'ai' && (
              <Badge variant="secondary" className="text-xs flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                AI
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">{question.category}</Badge>
            <Badge variant="outline" className="text-xs">{question.difficulty}</Badge>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <CombinedStatusBadges 
          status={question.status}
          approvalStatus={question.approvalStatus}
        />
      </TableCell>
      <TableCell className="text-sm text-gray-600">
        {question.usageCount}x
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Button 
            size="sm" 
            variant="ghost"
            onClick={() => onViewHistory(question)}
          >
            <History className="w-4 h-4" />
          </Button>
          <Button 
            size="sm" 
            variant="ghost"
            onClick={() => onPreview(question)}
          >
            <Eye className="w-4 h-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

// Export the lifecycle history dialog for use in QuestionBank
export { LifecycleHistoryDialog };
