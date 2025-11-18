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
import { Search, Plus, Eye, Edit, Trash2 } from 'lucide-react';

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

  const columns: ColumnDef<Tenant>[] = [
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
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${planColors[row.original.plan]}`}>
          {row.original.plan}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[row.original.status]}`}>
          {row.original.status}
        </span>
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
      cell: () => (
        <div className="flex items-center justify-end gap-2">
          <button className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700">
            <Eye className="w-4 h-4" />
          </button>
          <button className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700">
            <Edit className="w-4 h-4" />
          </button>
          <button className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-red-600">
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
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tenants</h2>
          <p className="text-gray-500 mt-1">Manage all organization accounts</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-5 h-5" />
          Add Tenant
        </button>
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
        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search tenants..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
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
    </div>
  );
}
