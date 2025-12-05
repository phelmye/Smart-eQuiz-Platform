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
  type RowSelectionState,
} from '@tanstack/react-table';
import { Search, Plus, Eye, Edit, Trash2, Mail, RefreshCw, Ban, CheckCircle, Download, LogIn } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Checkbox } from '../components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { exportToCSV, generateFilename } from '../lib/exportHelpers';
import { useToast } from '../hooks/use-toast';

interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  plan: 'Starter' | 'Professional' | 'Enterprise';
  status: 'active' | 'trial' | 'suspended' | 'cancelled';
  users: number;
  mrr: number;
  joined: string;
}

const mockTenants: Tenant[] = [
  { id: '1', name: 'Acme University', subdomain: 'acme', plan: 'Enterprise', status: 'active', users: 450, mrr: 14900, joined: '2024-01-15' },
  { id: '2', name: 'Tech Academy', subdomain: 'techacademy', plan: 'Professional', status: 'active', users: 125, mrr: 4900, joined: '2024-01-20' },
  { id: '3', name: 'Global Institute', subdomain: 'global', plan: 'Starter', status: 'trial', users: 35, mrr: 0, joined: '2024-02-01' },
  { id: '4', name: 'Learning Hub', subdomain: 'learninghub', plan: 'Professional', status: 'active', users: 89, mrr: 4900, joined: '2024-01-28' },
  { id: '5', name: 'Education Plus', subdomain: 'edplus', plan: 'Enterprise', status: 'active', users: 320, mrr: 14900, joined: '2024-01-10' },
  { id: '6', name: 'Smart School', subdomain: 'smartschool', plan: 'Starter', status: 'active', users: 42, mrr: 1900, joined: '2024-02-05' },
  { id: '7', name: 'Future Academy', subdomain: 'future', plan: 'Professional', status: 'suspended', users: 67, mrr: 0, joined: '2024-01-05' },
  { id: '8', name: 'Knowledge Base', subdomain: 'knowledge', plan: 'Starter', status: 'active', users: 28, mrr: 1900, joined: '2024-02-10' },
];

const statusColors = {
  active: 'bg-green-100 text-green-800',
  trial: 'bg-yellow-100 text-yellow-800',
  suspended: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
};

const planColors = {
  Starter: 'bg-blue-100 text-blue-800',
  Professional: 'bg-purple-100 text-purple-800',
  Enterprise: 'bg-orange-100 text-orange-800',
};

export default function Tenants() {
  const [data] = useState<Tenant[]>(mockTenants);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const { toast } = useToast();

  const columns: ColumnDef<Tenant>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'name',
      header: 'Organization',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-gray-900">{row.original.name}</div>
          <div className="text-sm text-gray-500">{row.original.subdomain}.smartequiz.com</div>
        </div>
      ),
    },
    {
      accessorKey: 'plan',
      header: 'Plan',
      cell: ({ row }) => (
        <Badge className={planColors[row.original.plan]}>
          {row.original.plan}
        </Badge>
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
      accessorKey: 'users',
      header: 'Users',
      cell: ({ row }) => <div className="text-gray-900">{row.original.users.toLocaleString()}</div>,
    },
    {
      accessorKey: 'mrr',
      header: 'MRR',
      cell: ({ row }) => (
        <div className="text-gray-900 font-medium">
          ${row.original.mrr.toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: 'joined',
      header: 'Joined',
      cell: ({ row }) => (
        <div className="text-gray-500 text-sm">
          {new Date(row.original.joined).toLocaleDateString()}
        </div>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          <button 
            onClick={() => handleLoginAsTenant(row.original)}
            className="p-1 hover:bg-blue-50 rounded text-blue-600 hover:text-blue-700"
            title="Login as This Tenant"
          >
            <LogIn className="w-4 h-4" />
          </button>
          <button 
            onClick={() => {
              setSelectedTenant(row.original);
              setIsViewModalOpen(true);
            }}
            className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button 
            onClick={() => {
              setSelectedTenant(row.original);
              setIsEditModalOpen(true);
            }}
            className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700"
            title="Edit Tenant"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button 
            onClick={() => {
              if (confirm(`Delete ${row.original.name}? This action cannot be undone.`)) {
                toast({
                  title: "Tenant Deleted",
                  description: `${row.original.name} has been deleted.`,
                  variant: "destructive"
                });
              }
            }}
            className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-red-600"
            title="Delete Tenant"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      rowSelection,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const selectedCount = Object.keys(rowSelection).length;

  const handleBulkAction = (action: string) => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const selectedTenants = selectedRows.map(row => row.original.name);
    alert(`${action} action for ${selectedCount} tenant(s):\n${selectedTenants.join(', ')}`);
  };

  const handleExport = () => {
    const exportData = data.map(tenant => ({
      'Organization': tenant.name,
      'Subdomain': tenant.subdomain,
      'Plan': tenant.plan,
      'Status': tenant.status,
      'Users': tenant.users,
      'MRR': tenant.mrr,
      'Joined': tenant.joined,
    }));
    exportToCSV(exportData, { filename: generateFilename('tenants', 'csv') });
    toast({
      title: "Export Successful",
      description: `Exported ${data.length} tenants to CSV file.`,
    });
  };

  const handleLoginAsTenant = (tenant: Tenant) => {
    // Store impersonation session
    const impersonationData = {
      adminId: 'super_admin_id', // In production, get from auth context
      adminEmail: 'admin@smartequiz.com',
      tenantId: tenant.id,
      tenantName: tenant.name,
      tenantSubdomain: tenant.subdomain,
      impersonatedAt: new Date().toISOString(),
    };
    
    localStorage.setItem('impersonation_session', JSON.stringify(impersonationData));
    
    // Show confirmation
    toast({
      title: "Impersonation Started",
      description: `Logging in as ${tenant.name}. Redirecting...`,
    });
    
    // Redirect to tenant app (in production, this would be the actual tenant URL)
    setTimeout(() => {
      window.open(
        `https://${tenant.subdomain}.smartequiz.com?impersonate=true`,
        '_blank'
      );
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tenants</h2>
          <p className="text-gray-500 mt-1">Manage all organization accounts</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-5 h-5" />
            Export
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Tenant
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Total Tenants</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{data.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Active</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {data.filter(t => t.status === 'active').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">On Trial</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">
            {data.filter(t => t.status === 'trial').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Total MRR</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            ${data.reduce((sum, t) => sum + t.mrr, 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        {/* Search and Filters */}
        <div className="p-4 border-b border-gray-200 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search tenants..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              <option value="active">Active</option>
              <option value="trial">Trial</option>
              <option value="suspended">Suspended</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => {
                if (e.target.value) {
                  setColumnFilters([{ id: 'plan', value: e.target.value }]);
                } else {
                  setColumnFilters([]);
                }
              }}
            >
              <option value="">All Plans</option>
              <option value="Starter">Starter</option>
              <option value="Professional">Professional</option>
              <option value="Enterprise">Enterprise</option>
            </select>
          </div>

          {/* Bulk Actions */}
          {selectedCount > 0 && (
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium text-blue-900">
                {selectedCount} tenant(s) selected
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleBulkAction('Reactivate')}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-md hover:bg-green-200 text-sm"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Reactivate</span>
                </button>
                <button
                  onClick={() => handleBulkAction('Suspend')}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm"
                >
                  <Ban className="h-4 w-4" />
                  <span>Suspend</span>
                </button>
                <button
                  onClick={() => handleBulkAction('Change Plan')}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 text-sm"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Change Plan</span>
                </button>
                <button
                  onClick={() => handleBulkAction('Send Notification')}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-sm"
                >
                  <Mail className="h-4 w-4" />
                  <span>Notify</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
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
            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
            {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, data.length)} of{' '}
            {data.length} results
          </div>
          <div className="flex items-center gap-2">
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

      {/* Add Tenant Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Tenant</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tenant-name">Organization Name</Label>
              <Input id="tenant-name" placeholder="Acme Corporation" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tenant-subdomain">Subdomain</Label>
              <div className="flex items-center gap-2">
                <Input id="tenant-subdomain" placeholder="acme" />
                <span className="text-sm text-gray-500">.smartequiz.com</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tenant-plan">Plan</Label>
              <Select defaultValue="starter">
                <SelectTrigger id="tenant-plan">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="starter">Starter - $29/month</SelectItem>
                  <SelectItem value="professional">Professional - $99/month</SelectItem>
                  <SelectItem value="enterprise">Enterprise - $299/month</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tenant-email">Admin Email</Label>
              <Input id="tenant-email" type="email" placeholder="admin@acme.com" />
            </div>
          </div>
          <DialogFooter>
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                toast({
                  title: "Tenant Created",
                  description: "New tenant has been successfully created.",
                });
                setIsAddModalOpen(false);
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Create Tenant
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Tenant Details Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Tenant Details</DialogTitle>
          </DialogHeader>
          {selectedTenant && (
            <div className="space-y-6 py-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500">Organization Name</Label>
                  <p className="font-semibold text-lg">{selectedTenant.name}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Subdomain</Label>
                  <p className="font-semibold">{selectedTenant.subdomain}.smartequiz.com</p>
                </div>
                <div>
                  <Label className="text-gray-500">Plan</Label>
                  <Badge className={planColors[selectedTenant.plan]}>{selectedTenant.plan}</Badge>
                </div>
                <div>
                  <Label className="text-gray-500">Status</Label>
                  <Badge className={statusColors[selectedTenant.status]}>{selectedTenant.status}</Badge>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{selectedTenant.users}</p>
                  <p className="text-sm text-gray-600">Total Users</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">${selectedTenant.mrr}</p>
                  <p className="text-sm text-gray-600">Monthly Revenue</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">${selectedTenant.mrr * 12}</p>
                  <p className="text-sm text-gray-600">Annual Revenue</p>
                </div>
              </div>

              {/* Additional Info */}
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Joined Date</span>
                  <span className="font-medium">{new Date(selectedTenant.joined).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Account Age</span>
                  <span className="font-medium">{Math.floor((Date.now() - new Date(selectedTenant.joined).getTime()) / (1000 * 60 * 60 * 24))} days</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Access URL</span>
                  <a href={`https://${selectedTenant.subdomain}.smartequiz.com`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {selectedTenant.subdomain}.smartequiz.com ↗
                  </a>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => handleLoginAsTenant(selectedTenant)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  Login as {selectedTenant.name}
                </button>
                <button
                  onClick={() => {
                    setIsViewModalOpen(false);
                    setTimeout(() => {
                      setIsEditModalOpen(true);
                    }, 200);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    toast({
                      title: "Email Sent",
                      description: `Notification sent to ${selectedTenant.name}`,
                    });
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Mail className="w-4 h-4 inline mr-2" />
                  Send Email
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Tenant Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Tenant</DialogTitle>
          </DialogHeader>
          {selectedTenant && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-tenant-name">Organization Name</Label>
                <Input id="edit-tenant-name" defaultValue={selectedTenant.name} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-tenant-subdomain">Subdomain</Label>
                <div className="flex items-center gap-2">
                  <Input id="edit-tenant-subdomain" defaultValue={selectedTenant.subdomain} />
                  <span className="text-sm text-gray-500">.smartequiz.com</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-tenant-plan">Plan</Label>
                <Select defaultValue={selectedTenant.plan.toLowerCase()}>
                  <SelectTrigger id="edit-tenant-plan">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="starter">Starter - $29/month</SelectItem>
                    <SelectItem value="professional">Professional - $99/month</SelectItem>
                    <SelectItem value="enterprise">Enterprise - $299/month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-tenant-status">Status</Label>
                <Select defaultValue={selectedTenant.status}>
                  <SelectTrigger id="edit-tenant-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="trial">Trial</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-tenant-users">Max Users</Label>
                <Input id="edit-tenant-users" type="number" defaultValue={selectedTenant.users} />
              </div>
            </div>
          )}
          <DialogFooter>
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                toast({
                  title: "Changes Saved",
                  description: "Tenant details have been updated successfully.",
                });
                setIsEditModalOpen(false);
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Save Changes
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
