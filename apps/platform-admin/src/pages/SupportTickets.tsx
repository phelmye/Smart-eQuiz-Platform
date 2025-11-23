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
import { Search, Plus, User, Clock, Download } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { exportToCSV, generateFilename } from '../lib/exportHelpers';
import { useToast } from '../hooks/use-toast';

interface Ticket {
  id: string;
  subject: string;
  tenant: string;
  tenantId: string;
  requester: string;
  requesterEmail: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';
  category: 'technical' | 'billing' | 'feature_request' | 'bug_report' | 'general';
  assignedTo?: string;
  created: string;
  updated: string;
  responseTime?: number; // in minutes
  messages: number;
}

interface Message {
  id: string;
  author: string;
  authorRole: 'customer' | 'support';
  content: string;
  timestamp: string;
  attachments?: string[];
}

const mockTickets: Ticket[] = [
  {
    id: 'TKT-001',
    subject: 'Unable to access quiz results',
    tenant: 'Acme University',
    tenantId: 'tenant_123',
    requester: 'John Smith',
    requesterEmail: 'john@acme.edu',
    priority: 'high',
    status: 'in_progress',
    category: 'technical',
    assignedTo: 'Mike Support',
    created: '2024-02-15T10:30:00Z',
    updated: '2024-02-15T14:45:00Z',
    responseTime: 45,
    messages: 3,
  },
  {
    id: 'TKT-002',
    subject: 'Upgrade to Enterprise plan',
    tenant: 'Tech Academy',
    tenantId: 'tenant_456',
    requester: 'Sarah Johnson',
    requesterEmail: 'sarah@techacademy.com',
    priority: 'medium',
    status: 'waiting_customer',
    category: 'billing',
    assignedTo: 'Lisa Admin',
    created: '2024-02-15T09:15:00Z',
    updated: '2024-02-15T13:20:00Z',
    responseTime: 30,
    messages: 5,
  },
  {
    id: 'TKT-003',
    subject: 'Feature request: Bulk student import',
    tenant: 'Global Institute',
    tenantId: 'tenant_789',
    requester: 'Mike Chen',
    requesterEmail: 'mike@global.edu',
    priority: 'low',
    status: 'open',
    category: 'feature_request',
    created: '2024-02-15T08:00:00Z',
    updated: '2024-02-15T08:00:00Z',
    messages: 1,
  },
  {
    id: 'TKT-004',
    subject: 'Quiz timer not working correctly',
    tenant: 'Learning Hub',
    tenantId: 'tenant_321',
    requester: 'Emma Davis',
    requesterEmail: 'emma@learninghub.com',
    priority: 'urgent',
    status: 'open',
    category: 'bug_report',
    created: '2024-02-15T14:30:00Z',
    updated: '2024-02-15T14:30:00Z',
    messages: 1,
  },
  {
    id: 'TKT-005',
    subject: 'Invoice inquiry',
    tenant: 'Education Plus',
    tenantId: 'tenant_654',
    requester: 'David Wilson',
    requesterEmail: 'david@edplus.com',
    priority: 'medium',
    status: 'resolved',
    category: 'billing',
    assignedTo: 'Sarah Manager',
    created: '2024-02-14T15:00:00Z',
    updated: '2024-02-15T11:30:00Z',
    responseTime: 60,
    messages: 4,
  },
  {
    id: 'TKT-006',
    subject: 'How to create custom question types',
    tenant: 'Smart School',
    tenantId: 'tenant_987',
    requester: 'Lisa Brown',
    requesterEmail: 'lisa@smartschool.edu',
    priority: 'low',
    status: 'closed',
    category: 'general',
    assignedTo: 'Mike Support',
    created: '2024-02-14T10:00:00Z',
    updated: '2024-02-14T16:30:00Z',
    responseTime: 120,
    messages: 2,
  },
];

const mockMessages: Record<string, Message[]> = {
  'TKT-001': [
    {
      id: 'msg_1',
      author: 'John Smith',
      authorRole: 'customer',
      content: 'Hi, I\'m unable to access the quiz results for my class. When I click on "View Results", I get an error message saying "Failed to load data". This is urgent as I need to submit grades today.',
      timestamp: '2024-02-15T10:30:00Z',
    },
    {
      id: 'msg_2',
      author: 'Mike Support',
      authorRole: 'support',
      content: 'Hello John, thank you for reaching out. I\'m sorry to hear you\'re experiencing this issue. I\'ve checked your account and found that there was a temporary issue with the database connection. I\'ve resolved it and your results should now be accessible. Can you please try again and let me know if it works?',
      timestamp: '2024-02-15T11:15:00Z',
    },
    {
      id: 'msg_3',
      author: 'John Smith',
      authorRole: 'customer',
      content: 'Perfect! It\'s working now. Thank you so much for the quick response!',
      timestamp: '2024-02-15T11:20:00Z',
    },
  ],
};

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
};

const statusColors = {
  open: 'bg-green-100 text-green-800',
  in_progress: 'bg-blue-100 text-blue-800',
  waiting_customer: 'bg-yellow-100 text-yellow-800',
  resolved: 'bg-purple-100 text-purple-800',
  closed: 'bg-gray-100 text-gray-800',
};

const categoryColors = {
  technical: 'bg-red-50 text-red-700',
  billing: 'bg-green-50 text-green-700',
  feature_request: 'bg-purple-50 text-purple-700',
  bug_report: 'bg-orange-50 text-orange-700',
  general: 'bg-blue-50 text-blue-700',
};

export default function SupportTickets() {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'updated', desc: true }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);
  const { toast } = useToast();

  const columns: ColumnDef<Ticket>[] = [
    {
      accessorKey: 'id',
      header: 'Ticket ID',
      cell: ({ row }) => (
        <span className="font-mono text-sm font-medium text-gray-900">
          {row.original.id}
        </span>
      ),
    },
    {
      accessorKey: 'subject',
      header: 'Subject',
      cell: ({ row }) => (
        <div className="max-w-xs">
          <div className="font-medium text-gray-900 truncate">{row.original.subject}</div>
          <div className="text-sm text-gray-500">{row.original.tenant}</div>
        </div>
      ),
    },
    {
      accessorKey: 'requester',
      header: 'Requester',
      cell: ({ row }) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">{row.original.requester}</div>
          <div className="text-gray-500">{row.original.requesterEmail}</div>
        </div>
      ),
    },
    {
      accessorKey: 'priority',
      header: 'Priority',
      cell: ({ row }) => (
        <Badge className={priorityColors[row.original.priority]}>
          {row.original.priority}
        </Badge>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge className={statusColors[row.original.status]}>
          {row.original.status.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => (
        <Badge className={categoryColors[row.original.category]}>
          {row.original.category.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      accessorKey: 'assignedTo',
      header: 'Assigned To',
      cell: ({ row }) => (
        <span className="text-sm text-gray-900">
          {row.original.assignedTo || 'Unassigned'}
        </span>
      ),
    },
    {
      accessorKey: 'updated',
      header: 'Last Updated',
      cell: ({ row }) => (
        <span className="text-sm text-gray-600">
          {new Date(row.original.updated).toLocaleDateString()}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <button
          onClick={() => setSelectedTicket(row.original)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          View
        </button>
      ),
    },
  ];

  const table = useReactTable({
    data: mockTickets,
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

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    // In a real app, this would send the message to the backend
    alert(`Message sent: ${newMessage}`);
    setNewMessage('');
  };

  const handleUpdateStatus = (status: Ticket['status']) => {
    if (!selectedTicket) return;
    // In a real app, this would update the status in the backend
    alert(`Ticket ${selectedTicket.id} status updated to: ${status}`);
    setSelectedTicket({ ...selectedTicket, status });
  };

  const handleExport = () => {
    const exportData = mockTickets.map(ticket => ({
      'ID': ticket.id,
      'Subject': ticket.subject,
      'Tenant': ticket.tenant,
      'Requester': ticket.requester,
      'Email': ticket.requesterEmail,
      'Priority': ticket.priority,
      'Status': ticket.status,
      'Category': ticket.category,
      'Assigned To': ticket.assignedTo || 'Unassigned',
      'Created': ticket.created,
      'Updated': ticket.updated,
      'Messages': ticket.messages,
    }));
    exportToCSV(exportData, { filename: generateFilename('support-tickets', 'csv') });
    toast({
      title: "Export Successful",
      description: `Exported ${mockTickets.length} support tickets to CSV file.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage customer support requests and inquiries
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleExport}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
          <button 
            onClick={() => setIsNewTicketModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            <span>New Ticket</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Open</p>
              <p className="text-2xl font-bold text-green-600">
                {mockTickets.filter((t) => t.status === 'open').length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-blue-600">
                {mockTickets.filter((t) => t.status === 'in_progress').length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Waiting</p>
              <p className="text-2xl font-bold text-yellow-600">
                {mockTickets.filter((t) => t.status === 'waiting_customer').length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Resolved</p>
              <p className="text-2xl font-bold text-purple-600">
                {mockTickets.filter((t) => t.status === 'resolved').length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Avg Response</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(
                  mockTickets
                    .filter((t) => t.responseTime)
                    .reduce((sum, t) => sum + (t.responseTime || 0), 0) /
                    mockTickets.filter((t) => t.responseTime).length
                )}m
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search tickets..."
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
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="waiting_customer">Waiting Customer</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>

        <select
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={(e) => {
            if (e.target.value) {
              setColumnFilters([{ id: 'priority', value: e.target.value }]);
            } else {
              setColumnFilters([]);
            }
          }}
        >
          <option value="">All Priorities</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <select
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={(e) => {
            if (e.target.value) {
              setColumnFilters([{ id: 'category', value: e.target.value }]);
            } else {
              setColumnFilters([]);
            }
          }}
        >
          <option value="">All Categories</option>
          <option value="technical">Technical</option>
          <option value="billing">Billing</option>
          <option value="feature_request">Feature Request</option>
          <option value="bug_report">Bug Report</option>
          <option value="general">General</option>
        </select>
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

      {/* Ticket Details Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="font-mono text-sm font-medium text-gray-600">
                      {selectedTicket.id}
                    </span>
                    <Badge className={priorityColors[selectedTicket.priority]}>
                      {selectedTicket.priority}
                    </Badge>
                    <Badge className={statusColors[selectedTicket.status]}>
                      {selectedTicket.status.replace('_', ' ')}
                    </Badge>
                    <Badge className={categoryColors[selectedTicket.category]}>
                      {selectedTicket.category.replace('_', ' ')}
                    </Badge>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">{selectedTicket.subject}</h2>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <User className="h-4 w-4" />
                      <span>{selectedTicket.requester}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{new Date(selectedTicket.created).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {/* Ticket Info */}
              <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tenant</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedTicket.tenant}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Assigned To</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedTicket.assignedTo || 'Unassigned'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Requester Email</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedTicket.requesterEmail}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Response Time</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedTicket.responseTime ? `${selectedTicket.responseTime}m` : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversation</h3>
                <div className="space-y-4">
                  {(mockMessages[selectedTicket.id] || []).map((message) => (
                    <div
                      key={message.id}
                      className={`p-4 rounded-lg ${
                        message.authorRole === 'customer'
                          ? 'bg-gray-50 border border-gray-200'
                          : 'bg-blue-50 border border-blue-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">{message.author}</span>
                          <Badge
                            className={
                              message.authorRole === 'customer'
                                ? 'bg-gray-200 text-gray-700'
                                : 'bg-blue-200 text-blue-700'
                            }
                          >
                            {message.authorRole}
                          </Badge>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(message.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-700">{message.content}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reply Form */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Add Reply</label>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Type your message here..."
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleUpdateStatus('in_progress')}
                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                  >
                    Mark In Progress
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('waiting_customer')}
                    className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200"
                  >
                    Waiting for Customer
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('resolved')}
                    className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                  >
                    Resolve
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedTicket(null)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleSendMessage}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Send Reply
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Ticket Modal */}
      <Dialog open={isNewTicketModalOpen} onOpenChange={setIsNewTicketModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Support Ticket</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="ticket-tenant">Tenant</Label>
              <Select defaultValue="tenant_123">
                <SelectTrigger id="ticket-tenant">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tenant_123">Acme University</SelectItem>
                  <SelectItem value="tenant_456">TechCorp Inc</SelectItem>
                  <SelectItem value="tenant_789">Global Learning</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ticket-subject">Subject</Label>
              <Input id="ticket-subject" placeholder="Brief description of the issue" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ticket-requester">Requester Name</Label>
              <Input id="ticket-requester" placeholder="John Smith" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ticket-email">Requester Email</Label>
              <Input id="ticket-email" type="email" placeholder="john@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ticket-priority">Priority</Label>
              <Select defaultValue="medium">
                <SelectTrigger id="ticket-priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ticket-category">Category</Label>
              <Select defaultValue="technical">
                <SelectTrigger id="ticket-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="billing">Billing</SelectItem>
                  <SelectItem value="feature_request">Feature Request</SelectItem>
                  <SelectItem value="bug_report">Bug Report</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ticket-description">Description</Label>
              <textarea
                id="ticket-description"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Provide detailed information about the issue..."
              />
            </div>
          </div>
          <DialogFooter>
            <button
              onClick={() => setIsNewTicketModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                alert('Ticket creation functionality would be implemented here');
                setIsNewTicketModalOpen(false);
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Create Ticket
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
