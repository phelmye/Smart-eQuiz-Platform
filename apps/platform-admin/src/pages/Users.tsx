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
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Ban,
  CheckCircle,
  Mail,
  Download,
  MoreHorizontal,
  UserCog,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { exportToCSV, generateFilename } from '../lib/exportHelpers';
import { useToast } from '../hooks/use-toast';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'user';
  tenant: string;
  tenantId: string;
  status: 'active' | 'suspended' | 'pending';
  lastLogin: string;
  createdAt: string;
  emailVerified: boolean;
}

const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@acme.com',
    role: 'admin',
    tenant: 'Acme University',
    tenantId: 't1',
    status: 'active',
    lastLogin: '2 hours ago',
    createdAt: '2024-01-15',
    emailVerified: true,
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@techacademy.com',
    role: 'user',
    tenant: 'Tech Academy',
    tenantId: 't2',
    status: 'active',
    lastLogin: '1 day ago',
    createdAt: '2024-01-20',
    emailVerified: true,
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike@global.com',
    role: 'admin',
    tenant: 'Global Institute',
    tenantId: 't3',
    status: 'pending',
    lastLogin: 'Never',
    createdAt: '2024-02-01',
    emailVerified: false,
  },
  {
    id: '4',
    name: 'Sarah Williams',
    email: 'sarah@learninghub.com',
    role: 'user',
    tenant: 'Learning Hub',
    tenantId: 't4',
    status: 'active',
    lastLogin: '5 hours ago',
    createdAt: '2024-01-28',
    emailVerified: true,
  },
  {
    id: '5',
    name: 'Bob Anderson',
    email: 'bob@edplus.com',
    role: 'super_admin',
    tenant: 'Education Plus',
    tenantId: 't5',
    status: 'active',
    lastLogin: '30 minutes ago',
    createdAt: '2024-01-10',
    emailVerified: true,
  },
  {
    id: '6',
    name: 'Alice Brown',
    email: 'alice@smartschool.com',
    role: 'user',
    tenant: 'Smart School',
    tenantId: 't6',
    status: 'suspended',
    lastLogin: '2 weeks ago',
    createdAt: '2024-02-05',
    emailVerified: true,
  },
];

const statusColors = {
  active: 'bg-green-100 text-green-800',
  suspended: 'bg-red-100 text-red-800',
  pending: 'bg-yellow-100 text-yellow-800',
};

const roleColors = {
  super_admin: 'bg-purple-100 text-purple-800',
  admin: 'bg-blue-100 text-blue-800',
  user: 'bg-gray-100 text-gray-800',
};

export default function Users() {
  const [data, setData] = useState<User[]>(mockUsers);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const { toast } = useToast();
  
  // Dialogs
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user' as User['role'],
    tenantId: '',
    status: 'active' as User['status'],
  });

  const columns: ColumnDef<User>[] = [
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
      header: 'Name',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-gray-900">{row.original.name}</div>
          <div className="text-sm text-gray-500">{row.original.email}</div>
        </div>
      ),
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => (
        <Badge className={roleColors[row.original.role]}>
          {row.original.role.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      accessorKey: 'tenant',
      header: 'Tenant',
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
      accessorKey: 'lastLogin',
      header: 'Last Login',
    },
    {
      accessorKey: 'emailVerified',
      header: 'Verified',
      cell: ({ row }) => (
        <div className="flex items-center">
          {row.original.emailVerified ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <Ban className="h-5 w-5 text-gray-400" />
          )}
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => handleView(row.original)}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleEdit(row.original)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit User
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Mail className="mr-2 h-4 w-4" />
              Send Email
            </DropdownMenuItem>
            <DropdownMenuItem>
              <UserCog className="mr-2 h-4 w-4" />
              Reset Password
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {row.original.status === 'active' ? (
              <DropdownMenuItem>
                <Ban className="mr-2 h-4 w-4" />
                Suspend User
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem>
                <CheckCircle className="mr-2 h-4 w-4" />
                Activate User
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => handleDelete(row.original)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
  });

  const handleView = (user: User) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      status: user.status,
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleCreate = () => {
    console.log('Creating user:', formData);
    setIsCreateModalOpen(false);
    resetForm();
  };

  const handleUpdate = () => {
    console.log('Updating user:', selectedUser?.id, formData);
    setIsEditModalOpen(false);
    resetForm();
  };

  const handleDeleteConfirm = () => {
    setData(data.filter((u) => u.id !== selectedUser?.id));
    setIsDeleteModalOpen(false);
    setSelectedUser(null);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      role: 'user',
      tenantId: '',
      status: 'active',
    });
  };

  const handleBulkAction = (action: string) => {
    const selected = table.getSelectedRowModel().rows.map((row) => row.original);
    console.log('Bulk action:', action, selected);
  };

  const handleExport = () => {
    const exportData = data.map(user => ({
      'Name': user.name,
      'Email': user.email,
      'Role': user.role,
      'Tenant': user.tenant,
      'Status': user.status,
      'Last Active': user.lastActive,
    }));
    exportToCSV(exportData, { filename: generateFilename('users', 'csv') });
    toast({
      title: "Export Successful",
      description: `Exported ${data.length} users to CSV file.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Users</h2>
          <p className="text-gray-500 mt-1">
            Manage platform users across all tenants
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <Select
            value={(columnFilters.find((f) => f.id === 'status')?.value as string) || 'all'}
            onValueChange={(value) => {
              if (value === 'all') {
                setColumnFilters(columnFilters.filter((f) => f.id !== 'status'));
              } else {
                setColumnFilters([
                  ...columnFilters.filter((f) => f.id !== 'status'),
                  { id: 'status', value },
                ]);
              }
            }}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={(columnFilters.find((f) => f.id === 'role')?.value as string) || 'all'}
            onValueChange={(value) => {
              if (value === 'all') {
                setColumnFilters(columnFilters.filter((f) => f.id !== 'role'));
              } else {
                setColumnFilters([
                  ...columnFilters.filter((f) => f.id !== 'role'),
                  { id: 'role', value },
                ]);
              }
            }}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="super_admin">Super Admin</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="user">User</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>

        {/* Bulk Actions */}
        {table.getSelectedRowModel().rows.length > 0 && (
          <div className="mt-4 flex items-center gap-2 p-3 bg-blue-50 rounded-md">
            <span className="text-sm font-medium text-blue-900">
              {table.getSelectedRowModel().rows.length} selected
            </span>
            <div className="flex gap-2 ml-auto">
              <Button size="sm" variant="outline" onClick={() => handleBulkAction('activate')}>
                Activate
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleBulkAction('suspend')}>
                Suspend
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleBulkAction('email')}>
                Send Email
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-red-600"
                onClick={() => handleBulkAction('delete')}
              >
                Delete
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
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
                    <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm">
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
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
            <div className="text-sm text-gray-700">
              Page {table.getState().pagination.pageIndex + 1} of{' '}
              {table.getPageCount()}
            </div>
          </div>
        </div>
      </div>

      {/* Create User Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Add a new user to the platform
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) =>
                    setFormData({ ...formData, role: value as User['role'] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tenant">Tenant</Label>
                <Select
                  value={formData.tenantId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, tenantId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select tenant" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="t1">Acme University</SelectItem>
                    <SelectItem value="t2">Tech Academy</SelectItem>
                    <SelectItem value="t3">Global Institute</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Create User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email Address</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) =>
                    setFormData({ ...formData, role: value as User['role'] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value as User['status'] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-tenant">Tenant</Label>
                <Select
                  value={formData.tenantId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, tenantId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="t1">Acme University</SelectItem>
                    <SelectItem value="t2">Tech Academy</SelectItem>
                    <SelectItem value="t3">Global Institute</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View User Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              View detailed user information
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500">Name</Label>
                  <p className="font-medium">{selectedUser.name}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Email</Label>
                  <p className="font-medium">{selectedUser.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500">Role</Label>
                  <Badge className={roleColors[selectedUser.role]}>
                    {selectedUser.role.replace('_', ' ')}
                  </Badge>
                </div>
                <div>
                  <Label className="text-gray-500">Status</Label>
                  <Badge className={statusColors[selectedUser.status]}>
                    {selectedUser.status}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500">Tenant</Label>
                  <p className="font-medium">{selectedUser.tenant}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Email Verified</Label>
                  <p className="font-medium">
                    {selectedUser.emailVerified ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500">Last Login</Label>
                  <p className="font-medium">{selectedUser.lastLogin}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Created At</Label>
                  <p className="font-medium">{selectedUser.createdAt}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="py-4">
              <p className="text-sm">
                <span className="font-medium">User:</span> {selectedUser.name} (
                {selectedUser.email})
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
