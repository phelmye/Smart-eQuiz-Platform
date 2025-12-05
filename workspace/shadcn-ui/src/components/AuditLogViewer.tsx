import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Shield, User, Clock } from 'lucide-react';
import { useAuth } from './AuthSystem';
import { getAuditLogsForTenant, AuditLog, mockUsers } from '@/lib/mockData';

interface AuditLogViewerProps {
  onBack: () => void;
}

const AuditLogViewer: React.FC<AuditLogViewerProps> = ({ onBack }) => {
  const { user: currentUser } = useAuth();
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    if (currentUser?.tenantId) {
      const logs = getAuditLogsForTenant(currentUser.tenantId, 50);
      setAuditLogs(logs);
    }
  }, [currentUser]);

  const getUserName = (userId: string) => {
    const user = mockUsers.find(u => u.id === userId);
    return user ? user.name : userId;
  };

  const getActionColor = (action: string) => {
    if (action.includes('create')) return 'bg-green-100 text-green-800';
    if (action.includes('update')) return 'bg-blue-100 text-blue-800';
    if (action.includes('delete')) return 'bg-red-100 text-red-800';
    if (action.includes('suspend')) return 'bg-orange-100 text-orange-800';
    if (action.includes('reactivate')) return 'bg-green-100 text-green-800';
    if (action.includes('login')) return 'bg-purple-100 text-purple-800';
    if (action.includes('payment')) return 'bg-yellow-100 text-yellow-800';
    if (action.includes('export') || action.includes('import')) return 'bg-cyan-100 text-cyan-800';
    return 'bg-gray-100 text-gray-800';
  };

  const formatActionDetails = (log: AuditLog) => {
    const actionType = log.action.split('.')[0];
    const actionVerb = log.action.split('.')[1];
    
    switch (log.action) {
      case 'user.create':
        return `Created user with role: ${log.details.roleName || log.details.newValue?.role}`;
      case 'user.update':
        return `Updated user from ${log.details.previousValue?.role} to ${log.details.newValue?.role}`;
      case 'user.delete':
        return `Deleted user (${log.details.previousValue?.name})`;
      case 'user.login':
        return `User logged in`;
      case 'user.login_failed':
        return `Failed login attempt ${log.details.errorMessage ? ': ' + log.details.errorMessage : ''}`;
      case 'role.assign':
        return `Assigned role: ${log.details.roleName}`;
      case 'tenant.suspend':
        return `Suspended tenant: ${log.details.reason}`;
      case 'tenant.reactivate':
        return `Reactivated tenant`;
      case 'tournament.create':
        return `Created tournament`;
      case 'tournament.start':
        return `Started tournament`;
      case 'question.create':
        return `Created question`;
      case 'payment.processed':
        return `Payment processed: ${log.details.metadata?.amount || 'N/A'}`;
      case 'payment.failed':
        return `Payment failed: ${log.details.errorMessage || 'Unknown error'}`;
      case 'data.export':
        return `Exported ${log.entityType} data`;
      case 'settings.update':
        return `Updated ${log.entityType || 'system'} settings`;
      default:
        return `${actionVerb.charAt(0).toUpperCase() + actionVerb.slice(1)} ${actionType}`;
    }
  };

  if (!currentUser || !['org_admin', 'super_admin'].includes(currentUser.role)) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-bold text-red-600 mb-4">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to view audit logs.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Audit Log</h1>
                <p className="text-gray-600">Track administrative actions and changes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Audit Log Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {auditLogs.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No audit logs found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Target User</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm text-gray-600">
                        {new Date(log.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{getUserName(log.userId)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getActionColor(log.action)}>
                          {log.action.replace('.', ' ').toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatActionDetails(log)}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {log.targetUserId ? getUserName(log.targetUserId) : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuditLogViewer;