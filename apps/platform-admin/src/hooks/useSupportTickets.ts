import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { logger } from '../lib/logger';

export interface Ticket {
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
  responseTime?: number;
  messages: number;
}

export interface TicketFilters {
  tenantId?: string;
  status?: string;
  priority?: string;
  category?: string;
  limit?: number;
  offset?: number;
}

export interface CreateTicketData {
  subject: string;
  description?: string;
  priority: string;
  category: string;
}

export interface UpdateTicketData {
  status?: string;
  priority?: string;
  category?: string;
  assignedTo?: string;
}

export function useSupportTickets(filters?: TicketFilters) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters?.tenantId) params.append('tenantId', filters.tenantId);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.priority) params.append('priority', filters.priority);
      if (filters?.category) params.append('category', filters.category);
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.offset) params.append('offset', filters.offset.toString());

      const response = await api.get<{
        tickets: Ticket[];
        total: number;
      }>(`/support/tickets?${params}`);

      setTickets(response.tickets);
      setTotal(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tickets');
      logger.error('Error fetching tickets', err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [
    filters?.tenantId,
    filters?.status,
    filters?.priority,
    filters?.category,
    filters?.limit,
    filters?.offset,
  ]);

  const createTicket = async (data: CreateTicketData): Promise<Ticket> => {
    try {
      const newTicket = await api.post<Ticket>('/support/tickets', data);
      setTickets((prev) => [newTicket, ...prev]);
      setTotal((prev) => prev + 1);
      return newTicket;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create ticket';
      throw new Error(message);
    }
  };

  const updateTicket = async (id: string, data: UpdateTicketData): Promise<Ticket> => {
    try {
      const updated = await api.put<Ticket>(`/support/tickets/${id}`, data);
      setTickets((prev) => prev.map((t) => (t.id === id ? updated : t)));
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update ticket';
      throw new Error(message);
    }
  };

  const addMessage = async (ticketId: string, content: string): Promise<void> => {
    try {
      await api.post(`/support/tickets/${ticketId}/messages`, { content });
      // Refresh tickets to get updated message count
      await fetchTickets();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add message';
      throw new Error(message);
    }
  };

  return {
    tickets,
    total,
    loading,
    error,
    fetchTickets,
    createTicket,
    updateTicket,
    addMessage,
  };
}
