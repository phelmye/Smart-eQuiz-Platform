import { useState, useEffect } from 'react';
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
import { 
  Search, 
  Download, 
  RefreshCw, 
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { api } from '../lib/api';

interface AuditLog {
  id: string;
  userId: string | null;
  tenantId: string | null;
  action: string;
  resource: string;
  resourceId: string | null;
  changes: any;
  metadata: any;
  success: boolean;
  errorMsg: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

interface AuditStats {
  total: number;
  byAction: Record<string, number>;
  byResource: Record<string, number>;
  successRate: number;
}

interface FilterState {
  tenantId: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  success: string;
  startDate: string;
  endDate: string;
}

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState<FilterState>({
    tenantId: '',
    userId: '',
    action: '',
    resource: '',
    resourceId: '',
    success: '',
    startDate: '',
    endDate: '',
  });

  // Fetch audit logs
  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query params
      const params: Record<string, string> = {};
      if (filters.tenantId) params.tenantId = filters.tenantId;
      if (filters.userId) params.userId = filters.userId;
      if (filters.action) params.action = filters.action;
      if (filters.resource) params.resource = filters.resource;
      if (filters.resourceId) params.resourceId = filters.resourceId;
      if (filters.success !== '') params.success = filters.success;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      
      const data = await api.get<AuditLog[]>('/audit/logs', params);
      setLogs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch audit logs');
      console.error('Error fetching audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const data = await api.get<AuditStats>('/audit/stats', { period: 'week' });
      setStats(data);
    } catch (err) {
      console.error('Error fetching audit stats:', err);
    }
  };

  // Initial load
  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, []);

  // Apply filters
  useEffect(() => {
    if (!loading) {
      fetchLogs();
    }
  }, [filters]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchLogs();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, filters]);

  const columns: ColumnDef<AuditLog>[] = [
    {
      accessorKey: 'createdAt',
      header: 'Timestamp',
      cell: ({ row }) => (
        <div className="text-sm min-w-[140px]">
          <div className="font-medium text-gray-900">
            {new Date(row.original.createdAt).toLocaleDateString()}
          </div>
          <div className="text-gray-500">
            {new Date(row.original.createdAt).toLocaleTimeString()}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'action',
      header: 'Action',
      cell: ({ row }) => (
        <div className="text-sm min-w-[120px]">
          <div className="font-medium text-gray-900">{row.original.action}</div>
          <div className="text-gray-500 text-xs">{row.original.resource}</div>
        </div>
      ),
    },
    {
      accessorKey: 'userId',
      header: 'User',
      cell: ({ row }) => (
        <div className="text-sm text-gray-600 font-mono">
          {row.original.userId ? row.original.userId.substring(0, 12) + '...' : 'System'}
        </div>
      ),
    },
    {
      accessorKey: 'tenantId',
      header: 'Tenant',
      cell: ({ row }) => (
        <div className="text-sm text-gray-600 font-mono">
          {row.original.tenantId ? row.original.tenantId.substring(0, 12) + '...' : 'N/A'}
        </div>
      ),
    },
    {
      accessorKey: 'success',
      header: 'Status',
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          {row.original.success ? (
            <Badge className="bg-green-100 text-green-800 flex items-center space-x-1">
              <CheckCircle className="h-3 w-3" />
              <span>Success</span>
            </Badge>
          ) : (
            <Badge className="bg-red-100 text-red-800 flex items-center space-x-1">
              <XCircle className="h-3 w-3" />
              <span>Failed</span>
            </Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'ipAddress',
      header: 'IP Address',
      cell: ({ row }) => (
        <span className="text-sm text-gray-600 font-mono">
          {row.original.ipAddress || 'N/A'}
        </span>
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
          Details
        </button>
      ),
    },
  ];

  const table = useReactTable({
    data: logs,
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
        pageSize: 100,
      },
    },
  });

  const exportLogsCSV = async () => {
    try {
      // Build query params
      const params: Record<string, string> = { format: 'csv' };
      if (filters.tenantId) params.tenantId = filters.tenantId;
      if (filters.userId) params.userId = filters.userId;
      if (filters.action) params.action = filters.action;
      if (filters.resource) params.resource = filters.resource;
      if (filters.resourceId) params.resourceId = filters.resourceId;
      if (filters.success !== '') params.success = filters.success;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      // Use fetch directly for blob response
      const token = localStorage.getItem('token');
      const queryString = new URLSearchParams(params).toString();
      const url = `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/audit/export?${queryString}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Error exporting logs:', err);
      alert('Failed to export logs. Please try again.');
    }
  };

  const exportLogsJSON = async () => {
    try {
      const params: Record<string, string> = { format: 'json' };
      if (filters.tenantId) params.tenantId = filters.tenantId;
      if (filters.userId) params.userId = filters.userId;
      if (filters.action) params.action = filters.action;
      if (filters.resource) params.resource = filters.resource;
      if (filters.resourceId) params.resourceId = filters.resourceId;
      if (filters.success !== '') params.success = filters.success;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const data = await api.get<AuditLog[]>('/audit/export', params);
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting logs:', err);
      alert('Failed to export logs. Please try again.');
    }
  };

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      tenantId: '',
      userId: '',
      action: '',
      resource: '',
      resourceId: '',
      success: '',
      startDate: '',
      endDate: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
        <p className="mt-2 text-gray-600">
          Complete audit trail of all system operations for compliance and security
        </p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total.toLocaleString()}</div>
              <p className="text-xs text-gray-500 mt-1">Last 7 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {(stats.successRate * 100).toFixed(1)}%
              </div>
              <p className="text-xs text-gray-500 mt-1">Operations succeeded</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Top Action</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold">
                {Object.entries(stats.byAction).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {Object.entries(stats.byAction).sort((a, b) => b[1] - a[1])[0]?.[1] || 0} events
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Top Resource</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold">
                {Object.entries(stats.byResource).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {Object.entries(stats.byResource).sort((a, b) => b[1] - a[1])[0]?.[1] || 0} events
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search logs..."
                  value={globalFilter ?? ''}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2"
              >
                <Filter className="h-4 w-4" />
                <span>Filters</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`flex items-center space-x-2 ${autoRefresh ? 'bg-blue-50 border-blue-300' : ''}`}
              >
                <Clock className="h-4 w-4" />
                <span>Auto-refresh</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={fetchLogs}
                disabled={loading}
                className="flex items-center space-x-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </Button>

              <div className="relative group">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </Button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 hidden group-hover:block z-10">
                  <button
                    onClick={exportLogsCSV}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Export as CSV
                  </button>
                  <button
                    onClick={exportLogsJSON}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Export as JSON
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tenant ID
                  </label>
                  <Input
                    value={filters.tenantId}
                    onChange={(e) => handleFilterChange('tenantId', e.target.value)}
                    placeholder="Filter by tenant..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    User ID
                  </label>
                  <Input
                    value={filters.userId}
                    onChange={(e) => handleFilterChange('userId', e.target.value)}
                    placeholder="Filter by user..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Action
                  </label>
                  <select
                    value={filters.action}
                    onChange={(e) => handleFilterChange('action', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All actions</option>
                    <option value="LOGIN">Login</option>
                    <option value="LOGOUT">Logout</option>
                    <option value="LOGIN_FAILED">Login Failed</option>
                    <option value="CREATE">Create</option>
                    <option value="UPDATE">Update</option>
                    <option value="DELETE">Delete</option>
                    <option value="ACCESS">Access</option>
                    <option value="EXPORT">Export</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Resource
                  </label>
                  <select
                    value={filters.resource}
                    onChange={(e) => handleFilterChange('resource', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All resources</option>
                    <option value="USER">User</option>
                    <option value="TENANT">Tenant</option>
                    <option value="TOURNAMENT">Tournament</option>
                    <option value="QUESTION">Question</option>
                    <option value="PARTICIPANT">Participant</option>
                    <option value="SETTINGS">Settings</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Resource ID
                  </label>
                  <Input
                    value={filters.resourceId}
                    onChange={(e) => handleFilterChange('resourceId', e.target.value)}
                    placeholder="Filter by resource ID..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={filters.success}
                    onChange={(e) => handleFilterChange('success', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All statuses</option>
                    <option value="true">Success only</option>
                    <option value="false">Failed only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <Input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <Input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="flex items-center space-x-2"
                >
                  <XCircle className="h-4 w-4" />
                  <span>Clear Filters</span>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {error && (
            <div className="p-4 bg-red-50 border-b border-red-200">
              <div className="flex items-center space-x-2 text-red-800">
                <AlertCircle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            </div>
          )}

          {loading && logs.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Loading audit logs...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <p>No audit logs found matching your criteria.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <th
                            key={header.id}
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
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
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing{' '}
                  <span className="font-medium">
                    {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
                  </span>{' '}
                  to{' '}
                  <span className="font-medium">
                    {Math.min(
                      (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                      logs.length
                    )}
                  </span>{' '}
                  of <span className="font-medium">{logs.length}</span> results
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.setPageIndex(0)}
                    disabled={!table.getCanPreviousPage()}
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-gray-700">
                    Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                    disabled={!table.getCanNextPage()}
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader className="border-b border-gray-200">
              <div className="flex items-center justify-between">
                <CardTitle>Audit Log Details</CardTitle>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">ID:</span>
                    <span className="ml-2 font-mono">{selectedLog.id}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Timestamp:</span>
                    <span className="ml-2">{new Date(selectedLog.createdAt).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Action:</span>
                    <span className="ml-2 font-semibold">{selectedLog.action}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Resource:</span>
                    <span className="ml-2 font-semibold">{selectedLog.resource}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Resource ID:</span>
                    <span className="ml-2 font-mono text-xs">{selectedLog.resourceId || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <span className="ml-2">
                      {selectedLog.success ? (
                        <Badge className="bg-green-100 text-green-800">Success</Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800">Failed</Badge>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* User Info */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">User Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">User ID:</span>
                    <span className="ml-2 font-mono text-xs">{selectedLog.userId || 'System'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Tenant ID:</span>
                    <span className="ml-2 font-mono text-xs">{selectedLog.tenantId || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">IP Address:</span>
                    <span className="ml-2 font-mono">{selectedLog.ipAddress || 'N/A'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-600">User Agent:</span>
                    <span className="ml-2 text-xs break-all">{selectedLog.userAgent || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Changes */}
              {selectedLog.changes && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Changes</h3>
                  <pre className="bg-gray-50 p-4 rounded-md text-xs overflow-x-auto">
                    {JSON.stringify(selectedLog.changes, null, 2)}
                  </pre>
                </div>
              )}

              {/* Metadata */}
              {selectedLog.metadata && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Metadata</h3>
                  <pre className="bg-gray-50 p-4 rounded-md text-xs overflow-x-auto">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}

              {/* Error Message */}
              {selectedLog.errorMsg && (
                <div>
                  <h3 className="text-sm font-semibold text-red-900 mb-3">Error Message</h3>
                  <div className="bg-red-50 p-4 rounded-md text-sm text-red-800">
                    {selectedLog.errorMsg}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
