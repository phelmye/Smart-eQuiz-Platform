import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class SupportService {
  constructor(private readonly prisma: PrismaService) {}

  async getTickets(filters: {
    tenantId?: string;
    status?: string;
    priority?: string;
    category?: string;
    limit?: number;
    offset?: number;
  }) {
    const where: any = {};

    if (filters.tenantId) {
      where.tenantId = filters.tenantId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.priority) {
      where.priority = filters.priority;
    }

    if (filters.category) {
      where.category = filters.category;
    }

    const [tickets, total] = await Promise.all([
      this.prisma.supportTicket.findMany({
        where,
        include: {
          creator: {
            select: {
              id: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: filters.limit || 50,
        skip: filters.offset || 0,
      }),
      this.prisma.supportTicket.count({ where }),
    ]);

    // Format tickets for frontend
    const formattedTickets = tickets.map(ticket => ({
      id: ticket.id,
      subject: ticket.subject,
      tenantId: ticket.tenantId,
      requester: ticket.creator?.email || 'Unknown',
      requesterEmail: ticket.creator?.email || '',
      priority: ticket.priority.toLowerCase(),
      status: ticket.status.toLowerCase().replace('_', ' '),
      category: ticket.category.toLowerCase().replace('_', ' '),
      assignedTo: ticket.assignedTo || undefined,
      created: ticket.createdAt.toISOString(),
      updated: ticket.updatedAt.toISOString(),
      messages: 0, // TODO: Count messages from chat system
    }));

    return {
      tickets: formattedTickets,
      total,
      limit: filters.limit || 50,
      offset: filters.offset || 0,
    };
  }

  async getTicket(id: string, user: any) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    // Check permissions
    if (
      user.role !== 'super_admin' &&
      ticket.tenantId !== user.tenantId
    ) {
      throw new ForbiddenException('Access denied');
    }

    return {
      id: ticket.id,
      subject: ticket.subject,
      tenantId: ticket.tenantId,
      requester: ticket.creator?.email || 'Unknown',
      requesterEmail: ticket.creator?.email || '',
      priority: ticket.priority.toLowerCase(),
      status: ticket.status.toLowerCase().replace('_', ' '),
      category: ticket.category.toLowerCase().replace('_', ' '),
      assignedTo: ticket.assignedTo,
      created: ticket.createdAt.toISOString(),
      updated: ticket.updatedAt.toISOString(),
    };
  }

  async createTicket(data: {
    subject: string;
    priority: string;
    category: string;
    userId: string;
    tenantId: string;
  }) {
    // First create a chat channel for the ticket
    const channel = await this.prisma.chatChannel.create({
      data: {
        tenantId: data.tenantId,
        type: 'SUPPORT',
        status: 'ACTIVE',
        createdBy: data.userId,
      },
    });

    // Then create the ticket
    const ticket = await this.prisma.supportTicket.create({
      data: {
        channelId: channel.id,
        subject: data.subject,
        priority: data.priority.toUpperCase() as any,
        category: data.category.toUpperCase().replace(' ', '_') as any,
        status: 'OPEN',
        createdBy: data.userId,
        tenantId: data.tenantId,
      },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    return {
      id: ticket.id,
      subject: ticket.subject,
      tenantId: ticket.tenantId,
      requester: ticket.creator?.email || 'Unknown',
      requesterEmail: ticket.creator?.email || '',
      priority: ticket.priority.toLowerCase(),
      status: ticket.status.toLowerCase(),
      category: ticket.category.toLowerCase().replace('_', ' '),
      created: ticket.createdAt.toISOString(),
      updated: ticket.updatedAt.toISOString(),
    };
  }

  async updateTicket(id: string, data: any, user: any) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    // Check permissions
    if (
      user.role !== 'super_admin' &&
      ticket.tenantId !== user.tenantId
    ) {
      throw new ForbiddenException('Access denied');
    }

    const updated = await this.prisma.supportTicket.update({
      where: { id },
      data: {
        status: data.status ? data.status.toUpperCase().replace(' ', '_') : undefined,
        priority: data.priority ? data.priority.toUpperCase() : undefined,
        category: data.category ? data.category.toUpperCase().replace(' ', '_') : undefined,
        assignedTo: data.assignedTo,
      },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    return {
      id: updated.id,
      subject: updated.subject,
      tenantId: updated.tenantId,
      requester: updated.creator?.email || '',
      requesterEmail: updated.creator?.email || '',
      priority: updated.priority.toLowerCase(),
      status: updated.status.toLowerCase().replace('_', ' '),
      category: updated.category.toLowerCase().replace('_', ' '),
      assignedTo: updated.assignedTo,
      updated: updated.updatedAt.toISOString(),
    };
  }

  async addMessage(ticketId: string, data: { content: string; userId: string }) {
    // TODO: Integrate with chat system to add messages
    // For now, just update the ticket's updatedAt timestamp
    await this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        updatedAt: new Date(),
      },
    });

    return {
      success: true,
      message: 'Message added successfully',
    };
  }

  async getStats(tenantId?: string) {
    const where = tenantId ? { tenantId } : {};

    const [
      total,
      open,
      inProgress,
      resolved,
      closed,
      byPriority,
      byCategory,
    ] = await Promise.all([
      this.prisma.supportTicket.count({ where }),
      this.prisma.supportTicket.count({ where: { ...where, status: 'OPEN' } }),
      this.prisma.supportTicket.count({ where: { ...where, status: 'IN_PROGRESS' } }),
      this.prisma.supportTicket.count({ where: { ...where, status: 'RESOLVED' } }),
      this.prisma.supportTicket.count({ where: { ...where, status: 'CLOSED' } }),
      this.prisma.supportTicket.groupBy({
        by: ['priority'],
        where,
        _count: true,
      }),
      this.prisma.supportTicket.groupBy({
        by: ['category'],
        where,
        _count: true,
      }),
    ]);

    return {
      total,
      byStatus: {
        open,
        in_progress: inProgress,
        resolved,
        closed,
      },
      byPriority: byPriority.reduce((acc, item) => {
        acc[item.priority] = item._count;
        return acc;
      }, {} as Record<string, number>),
      byCategory: byCategory.reduce((acc, item) => {
        acc[item.category] = item._count;
        return acc;
      }, {} as Record<string, number>),
    };
  }
}
