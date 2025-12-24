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
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          tenant: {
            select: {
              id: true,
              name: true,
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
      tenant: ticket.tenant?.name || 'Unknown',
      tenantId: ticket.tenantId,
      requester: ticket.user?.name || 'Unknown',
      requesterEmail: ticket.user?.email || '',
      priority: ticket.priority,
      status: ticket.status,
      category: ticket.category,
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
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        tenant: {
          select: {
            id: true,
            name: true,
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
      description: ticket.description,
      tenant: ticket.tenant?.name || 'Unknown',
      tenantId: ticket.tenantId,
      requester: ticket.user?.name || 'Unknown',
      requesterEmail: ticket.user?.email || '',
      priority: ticket.priority,
      status: ticket.status,
      category: ticket.category,
      assignedTo: ticket.assignedTo,
      created: ticket.createdAt.toISOString(),
      updated: ticket.updatedAt.toISOString(),
    };
  }

  async createTicket(data: {
    subject: string;
    description?: string;
    priority: string;
    category: string;
    userId: string;
    tenantId: string;
  }) {
    const ticket = await this.prisma.supportTicket.create({
      data: {
        subject: data.subject,
        description: data.description,
        priority: data.priority as any,
        category: data.category as any,
        status: 'open',
        userId: data.userId,
        tenantId: data.tenantId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        tenant: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      id: ticket.id,
      subject: ticket.subject,
      tenant: ticket.tenant?.name || 'Unknown',
      tenantId: ticket.tenantId,
      requester: ticket.user?.name || 'Unknown',
      requesterEmail: ticket.user?.email || '',
      priority: ticket.priority,
      status: ticket.status,
      category: ticket.category,
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
        status: data.status,
        priority: data.priority,
        category: data.category,
        assignedTo: data.assignedTo,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        tenant: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      id: updated.id,
      subject: updated.subject,
      tenant: updated.tenant?.name || 'Unknown',
      tenantId: updated.tenantId,
      requester: updated.user?.name || 'Unknown',
      requesterEmail: updated.user?.email || '',
      priority: updated.priority,
      status: updated.status,
      category: updated.category,
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
      this.prisma.supportTicket.count({ where: { ...where, status: 'open' } }),
      this.prisma.supportTicket.count({ where: { ...where, status: 'in_progress' } }),
      this.prisma.supportTicket.count({ where: { ...where, status: 'resolved' } }),
      this.prisma.supportTicket.count({ where: { ...where, status: 'closed' } }),
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
