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
import { Search, Plus, Eye, Edit, Trash2, Mail, RefreshCw, Ban, CheckCircle, Download, LogIn, Loader2 } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Checkbox } from '../components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { exportToCSV, generateFilename } from '../lib/exportHelpers';
import { useToast } from '../hooks/use-toast';
import { useTenants, type Tenant } from '../hooks/useTenants';

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
  const {
    tenants,
    loading,
    error,
    fetchTenants,
    createTenant,
    updateTenant,
    deleteTenant,
    suspendTenant,
    activateTenant,
  } = useTenants();
  
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    subdomain: '',
    adminEmail: '',
    planId: '',
    status: 'active' as 'active' | 'trial' | 'suspended' | 'cancelled',
  });
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
              setFormData({
                name: row.original.name,
                subdomain: row.original.subdomain,
                adminEmail: '',
                planId: '',
                status: row.original.status,
              });
              setIsEditModalOpen(true);
            }}
            className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700"
            title="Edit Tenant"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button 
            onClick={() => handleDeleteTenant(row.original)}
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
    data: tenants,
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
    const exportData = tenants.map(tenant => ({
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
      description: `Exported ${tenants.length} tenants to CSV file.`,
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

  const handleDeleteTenant = async (tenant: Tenant) => {
    if (!confirm(`Delete ${tenant.name}? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteTenant(tenant.id);
      toast({
        title: "Tenant Deleted",
        description: `${tenant.name} has been deleted successfully.`,
      });
    } catch (err) {
      toast({
        title: "Delete Failed",
        description: err instanceof Error ? err.message : 'Failed to delete tenant',
        variant: "destructive",
      });
    }
  };

  const handleSuspendTenant = async (tenant: Tenant) => {
    try {
      if (tenant.status === 'suspended') {
        await activateTenant(tenant.id);
        toast({
          title: "Tenant Activated",
          description: `${tenant.name} has been activated.`,
        });
      } else {
        await suspendTenant(tenant.id);
        toast({
          title: "Tenant Suspended",
          description: `${tenant.name} has been suspended.`,
        });
      }
    } catch (err) {
      toast({
        title: "Action Failed",
        description: err instanceof Error ? err.message : 'Operation failed',
        variant: "destructive",
      });
    }
  };

  const handleCreateTenant = async () => {
    if (!formData.name || !formData.adminEmail) {
      toast({
        title: "Validation Error",
        description: "Name and Admin Email are required",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      await createTenant({
        name: formData.name,
        subdomain: formData.subdomain || undefined,
        adminEmail: formData.adminEmail,
        status: formData.status,
      });

      toast({
        title: "Tenant Created",
        description: `${formData.name} has been created successfully.`,
      });

      setIsAddModalOpen(false);
      setFormData({
        name: '',
        subdomain: '',
        adminEmail: '',
        planId: '',
        status: 'active',
      });
    } catch (err) {
      toast({
        title: "Creation Failed",
        description: err instanceof Error ? err.message : 'Failed to create tenant',
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateTenant = async () => {
    if (!selectedTenant) return;

    setIsSaving(true);
    try {
      await updateTenant(selectedTenant.id, {
        name: formData.name,
        subdomain: formData.subdomain || undefined,
        status: formData.status,
      });

      toast({
        title: "Tenant Updated",
        description: `${formData.name} has been updated successfully.`,
      });

      setIsEditModalOpen(false);
      setSelectedTenant(null);
    } catch (err) {
      toast({
        title: "Update Failed",
        description: err instanceof Error ? err.message : 'Failed to update tenant',
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading tenants...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          <p className="font-semibold">Error loading tenants</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Main Content */}
      {!loading && !error && (
        <>
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
          <p className="text-2xl font-bold text-gray-900 mt-1">{tenants.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Active</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {tenants.filter(t => t.status === 'active').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">On Trial</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">
            {tenants.filter(t => t.status === 'trial').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Total MRR</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            ${tenants.reduce((sum, t) => sum + t.mrr, 0).toLocaleString()}
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
              <Label htmlFor="tenant-name">Organization Name *</Label>
              <Input 
                id="tenant-name" 
                placeholder="Acme Corporation"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tenant-subdomain">Subdomain (optional)</Label>
              <div className="flex items-center gap-2">
                <Input 
                  id="tenant-subdomain" 
                  placeholder="acme"
                  value={formData.subdomain}
                  onChange={(e) => setFormData({...formData, subdomain: e.target.value})}
                />
                <span className="text-sm text-gray-500">.smartequiz.com</span>
              </div>
              <p className="text-xs text-gray-500">Leave blank to auto-generate from name</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tenant-email">Admin Email *</Label>
              <Input 
                id="tenant-email" 
                type="email" 
                placeholder="admin@acme.com"
                value={formData.adminEmail}
                onChange={(e) => setFormData({...formData, adminEmail: e.target.value})}
              />
              <p className="text-xs text-gray-500">Temporary password "Welcome123!" will be sent</p>
            </div>
          </div>
          <DialogFooter>
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={isSaving}
            >
              Cancel
            </button>
            <Button
              onClick={handleCreateTenant}
              className="px-4 py-2 text-sm font-medium"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Tenant'
              )}
            </Button>
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
      {/* Edit Tenant Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={(open) => {
        setIsEditModalOpen(open);
        if (!open) {
          setSelectedTenant(null);
          setFormData({
            name: '',
            subdomain: '',
            adminEmail: '',
            planId: '',
            status: 'active',
          });
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Tenant</DialogTitle>
          </DialogHeader>
          {selectedTenant && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-tenant-name">Organization Name</Label>
                <Input 
                  id="edit-tenant-name" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-tenant-subdomain">Subdomain</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    id="edit-tenant-subdomain" 
                    value={formData.subdomain}
                    onChange={(e) => setFormData({...formData, subdomain: e.target.value})}
                  />
                  <span className="text-sm text-gray-500">.smartequiz.com</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-tenant-status">Status</Label>
                <Select 
                  value={formData.status}
                  onValueChange={(value) => setFormData({...formData, status: value})}
                >
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
            </div>
          )}
          <DialogFooter>
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={isSaving}
            >
              Cancel
            </button>
            <Button
              onClick={handleUpdateTenant}
              className="px-4 py-2 text-sm font-medium"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
        </>
      )}
    </div>
  );
}
