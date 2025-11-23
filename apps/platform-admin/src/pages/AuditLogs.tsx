import { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from '@tanstack/react-table';
import { Search, Download, User, Activity } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';

interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  actorEmail: string;
  action: string;
  resource: string;
  resourceId: string;
  status: 'success' | 'failure' | 'warning';
  ipAddress: string;
  userAgent: string;
  changes?: {
    field: string;
    oldValue: string;
    newValue: string;
  }[];
  metadata?: Record<string, any>;
}

const mockAuditLogs: AuditLog[] = [
  {
    id: '1',
    timestamp: '2024-02-15T14:30:22Z',
    actor: 'John Admin',
    actorEmail: 'admin@equiz.com',
    action: 'user.create',
    resource: 'user',
    resourceId: 'user_123',
    status: 'success',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    changes: [
      { field: 'email', oldValue: '', newValue: 'newuser@example.com' },
      { field: 'role', oldValue: '', newValue: 'admin' },
    ],
  },
  {
    id: '2',
    timestamp: '2024-02-15T14:25:10Z',
    actor: 'Sarah Manager',
    actorEmail: 'sarah@equiz.com',
    action: 'tenant.suspend',
    resource: 'tenant',
    resourceId: 'tenant_456',
    status: 'success',
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    changes: [
      { field: 'status', oldValue: 'active', newValue: 'suspended' },
      { field: 'reason', oldValue: '', newValue: 'Payment overdue' },
    ],
  },
  {
    id: '3',
    timestamp: '2024-02-15T14:20:45Z',
    actor: 'Mike Support',
    actorEmail: 'mike@equiz.com',
    action: 'settings.update',
    resource: 'settings',
    resourceId: 'settings_global',
    status: 'success',
    ipAddress: '192.168.1.102',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    changes: [
      { field: 'sessionTimeout', oldValue: '30', newValue: '60' },
    ],
  },
  {
    id: '4',
    timestamp: '2024-02-15T14:15:30Z',
    actor: 'John Admin',
    actorEmail: 'admin@equiz.com',
    action: 'user.delete',
    resource: 'user',
    resourceId: 'user_789',
    status: 'failure',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    metadata: { error: 'User has active subscriptions' },
  },
  {
    id: '5',
    timestamp: '2024-02-15T14:10:15Z',
    actor: 'Lisa Admin',
    actorEmail: 'lisa@equiz.com',
    action: 'billing.invoice',
    resource: 'invoice',
    resourceId: 'inv_001',
    status: 'success',
    ipAddress: '192.168.1.103',
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64)',
    changes: [
      { field: 'amount', oldValue: '', newValue: '$14,900' },
      { field: 'tenant', oldValue: '', newValue: 'Acme University' },
    ],
  },
  {
    id: '6',
    timestamp: '2024-02-15T14:05:00Z',
    actor: 'Sarah Manager',
    actorEmail: 'sarah@equiz.com',
    action: 'tenant.plan_change',
    resource: 'tenant',
    resourceId: 'tenant_123',
    status: 'success',
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    changes: [
      { field: 'plan', oldValue: 'Professional', newValue: 'Enterprise' },
      { field: 'mrr', oldValue: '$4,900', newValue: '$14,900' },
    ],
  },
  {
    id: '7',
    timestamp: '2024-02-15T14:00:45Z',
    actor: 'Mike Support',
    actorEmail: 'mike@equiz.com',
    action: 'api_key.create',
    resource: 'api_key',
    resourceId: 'key_abc123',
    status: 'success',
    ipAddress: '192.168.1.102',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    changes: [
      { field: 'name', oldValue: '', newValue: 'Production API Key' },
      { field: 'permissions', oldValue: '', newValue: 'read,write' },
    ],
  },
  {
    id: '8',
    timestamp: '2024-02-15T13:55:30Z',
    actor: 'John Admin',
    actorEmail: 'admin@equiz.com',
    action: 'user.role_change',
    resource: 'user',
    resourceId: 'user_456',
    status: 'warning',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    changes: [
      { field: 'role', oldValue: 'admin', newValue: 'support' },
    ],
    metadata: { warning: 'Reduced privileges' },
  },
];

const statusColors = {
  success: 'bg-green-100 text-green-800',
  failure: 'bg-red-100 text-red-800',
  warning: 'bg-yellow-100 text-yellow-800',
};

const actionIcons: Record<string, string> = {
  'user.create': '👤',
  'user.update': '✏️',
  'user.delete': '🗑️',
  'user.role_change': '🔄',
  'tenant.create': '🏢',
  'tenant.suspend': '⏸️',
  'tenant.plan_change': '📈',
  'settings.update': '⚙️',
  'billing.invoice': '💰',
  'api_key.create': '🔑',
};

export default function AuditLogs() {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'timestamp', desc: true }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const columns: ColumnDef<AuditLog>[] = [
    {
      accessorKey: 'timestamp',
      header: 'Timestamp',
      cell: ({ row }) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">
            {new Date(row.original.timestamp).toLocaleDateString()}
          </div>
          <div className="text-gray-500">
            {new Date(row.original.timestamp).toLocaleTimeString()}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'action',
      header: 'Action',
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <span className="text-lg">{actionIcons[row.original.action] || '📋'}</span>
          <div className="text-sm">
            <div className="font-medium text-gray-900">{row.original.action}</div>
            <div className="text-gray-500">{row.original.resource}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'actor',
      header: 'Actor',
      cell: ({ row }) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">{row.original.actor}</div>
          <div className="text-gray-500">{row.original.actorEmail}</div>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge className={statusColors[row.original.status]}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: 'ipAddress',
      header: 'IP Address',
      cell: ({ row }) => (
        <span className="text-sm text-gray-600 font-mono">{row.original.ipAddress}</span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <button
          onClick={() => setSelectedLog(row.original)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          View Details
        </button>
      ),
    },
  ];

  const table = useReactTable({
    data: mockAuditLogs,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  const exportLogs = () => {
    const csv = [
      ['Timestamp', 'Actor', 'Action', 'Resource', 'Status', 'IP Address'].join(','),
      ...mockAuditLogs.map(log =>
        [
          log.timestamp,
          log.actor,
          log.action,
          log.resource,
          log.status,
          log.ipAddress,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track all system activities and administrative actions
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Events</p>
                <p className="text-2xl font-bold text-gray-900">{mockAuditLogs.length}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-green-600">
                  {Math.round((mockAuditLogs.filter(l => l.status === 'success').length / mockAuditLogs.length) * 100)}%
                </p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Failed Actions</p>
                <p className="text-2xl font-bold text-red-600">
                  {mockAuditLogs.filter(l => l.status === 'failure').length}
                </p>
              </div>
              <Activity className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unique Actors</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(mockAuditLogs.map(l => l.actorEmail)).size}
                </p>
              </div>
              <User className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search logs..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-10"
          />
        </div>

        <select
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={(e) => {
            if (e.target.value) {
              setColumnFilters([{ id: 'status', value: e.target.value }]);
            } else {
              setColumnFilters([]);
            }
          }}
        >
          <option value="">All Status</option>
          <option value="success">Success</option>
          <option value="failure">Failure</option>
          <option value="warning">Warning</option>
        </select>

        <select
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={(e) => {
            if (e.target.value) {
              setColumnFilters([{ id: 'resource', value: e.target.value }]);
            } else {
              setColumnFilters([]);
            }
          }}
        >
          <option value="">All Resources</option>
          <option value="user">Users</option>
          <option value="tenant">Tenants</option>
          <option value="settings">Settings</option>
          <option value="billing">Billing</option>
          <option value="api_key">API Keys</option>
        </select>

        <button
          onClick={exportLogs}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download className="h-4 w-4" />
          <span>Export</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center space-x-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() && (
                          <span>{header.column.getIsSorted() === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                table.getFilteredRowModel().rows.length
              )}{' '}
              of {table.getFilteredRowModel().rows.length} results
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Audit Log Details</h2>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Timestamp</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(selectedLog.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <Badge className={`mt-1 ${statusColors[selectedLog.status]}`}>
                      {selectedLog.status}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Actor</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedLog.actor}</p>
                    <p className="text-sm text-gray-500">{selectedLog.actorEmail}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">IP Address</label>
                    <p className="mt-1 text-sm text-gray-900 font-mono">{selectedLog.ipAddress}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Action</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedLog.action}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Resource</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedLog.resource}</p>
                    <p className="text-sm text-gray-500">{selectedLog.resourceId}</p>
                  </div>
                </div>

                {selectedLog.changes && selectedLog.changes.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Changes</label>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      {selectedLog.changes.map((change, idx) => (
                        <div key={idx} className="text-sm">
                          <span className="font-medium text-gray-900">{change.field}:</span>
                          {change.oldValue && (
                            <span className="text-red-600 line-through ml-2">{change.oldValue}</span>
                          )}
                          <span className="text-green-600 ml-2">{change.newValue}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedLog.metadata && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Metadata</label>
                    <pre className="bg-gray-50 rounded-lg p-4 text-sm text-gray-900 overflow-x-auto">
                      {JSON.stringify(selectedLog.metadata, null, 2)}
                    </pre>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">User Agent</label>
                  <p className="mt-1 text-sm text-gray-600 font-mono break-all">
                    {selectedLog.userAgent}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
