import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ChannelType, SenderType, ChannelStatus, ParticipantRole } from '@prisma/client';
import { CreateChannelDto } from './dto/create-channel.dto';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new chat channel with tenant isolation
   */
  async createChannel(
    tenantId: string,
    userId: string,
    createChannelDto: CreateChannelDto
  ) {
    const { type, contextId, participantIds } = createChannelDto;

    // Verify all participants belong to this tenant
    const users = await this.prisma.user.findMany({
      where: {
        id: { in: [userId, ...participantIds] },
        tenants: { some: { tenantId } }
      }
    });

    if (users.length !== participantIds.length + 1) {
      throw new ForbiddenException('Cannot create cross-tenant channel');
    }

    // Determine sender type for creator
    const creatorSenderType = await this.getUserSenderType(userId, tenantId);

    // Create channel with participants
    const channel = await this.prisma.chatChannel.create({
      data: {
        tenantId,
        type,
        contextId,
        createdBy: userId,
        status: ChannelStatus.ACTIVE,
        participants: {
          create: [
            {
              userId,
              userType: creatorSenderType,
              role: ParticipantRole.ADMIN
            },
            ...participantIds.map(id => ({
              userId: id,
              userType: SenderType.PARTICIPANT, // Default, can be enhanced
              role: ParticipantRole.MEMBER
            }))
          ]
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: { id: true, email: true, role: true }
            }
          }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 50
        }
      }
    });

    // If support ticket, create ticket record
    if (type === ChannelType.SUPPORT && createChannelDto.subject) {
      await this.prisma.supportTicket.create({
        data: {
          channelId: channel.id,
          tenantId,
          subject: createChannelDto.subject,
          category: (createChannelDto.category as any) || 'OTHER',
          priority: (createChannelDto.priority as any) || 'MEDIUM',
          createdBy: userId,
          status: 'OPEN'
        }
      });
    }

    return channel;
  }

  /**
   * Get all channels for a user (tenant-scoped)
   */
  async getUserChannels(userId: string, tenantId: string) {
    return this.prisma.chatChannel.findMany({
      where: {
        tenantId, // ✅ CRITICAL: Tenant isolation
        participants: {
          some: {
            userId,
            leftAt: null
          }
        },
        status: { not: ChannelStatus.ARCHIVED }
      },
      include: {
        participants: {
          where: { leftAt: null },
          include: {
            user: {
              select: { id: true, email: true, role: true }
            }
          }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1 // Latest message for preview
        },
        ticket: true,
        creator: {
          select: { id: true, email: true, role: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
  }

  /**
   * Get specific channel with all messages
   */
  async getChannel(channelId: string, userId: string, tenantId: string) {
    const channel = await this.prisma.chatChannel.findFirst({
      where: {
        id: channelId,
        tenantId, // ✅ Tenant isolation
        participants: {
          some: { userId, leftAt: null }
        }
      },
      include: {
        participants: {
          where: { leftAt: null },
          include: {
            user: {
              select: { id: true, email: true, role: true }
            }
          }
        },
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            sender: {
              select: { id: true, email: true, role: true }
            }
          }
        },
        ticket: true
      }
    });

    if (!channel) {
      throw new NotFoundException('Channel not found or access denied');
    }

    // Mark messages as read
    await this.markMessagesAsRead(channelId, userId);

    return channel;
  }

  /**
   * Send a message in a channel
   */
  async sendMessage(
    channelId: string,
    senderId: string,
    tenantId: string,
    sendMessageDto: SendMessageDto
  ) {
    // Verify channel belongs to tenant
    const channel = await this.prisma.chatChannel.findFirst({
      where: { id: channelId, tenantId },
      include: { participants: true }
    });

    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    // Verify sender is participant
    const isParticipant = channel.participants.some(
      p => p.userId === senderId && !p.leftAt
    );

    if (!isParticipant) {
      throw new ForbiddenException('Not a participant in this channel');
    }

    const senderType = await this.getUserSenderType(senderId, tenantId);

    const message = await this.prisma.chatMessage.create({
      data: {
        channelId,
        senderId,
        senderType,
        content: sendMessageDto.content,
        metadata: sendMessageDto.metadata as any
      },
      include: {
        sender: {
          select: { id: true, email: true, role: true }
        }
      }
    });

    // Update channel's updatedAt
    await this.prisma.chatChannel.update({
      where: { id: channelId },
      data: { updatedAt: new Date() }
    });

    return message;
  }

  /**
   * Escalate channel to super admin
   */
  async escalateToSuperAdmin(
    channelId: string,
    tenantId: string,
    userId: string,
    reason: string
  ) {
    // Verify user owns this channel
    const channel = await this.prisma.chatChannel.findFirst({
      where: { id: channelId, tenantId },
      include: { ticket: true }
    });

    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    // Get super admin user
    const superAdmin = await this.prisma.user.findFirst({
      where: { role: 'SUPER_ADMIN' }
    });

    if (!superAdmin) {
      throw new NotFoundException('No super admin available');
    }

    // Update channel status
    await this.prisma.chatChannel.update({
      where: { id: channelId },
      data: {
        status: ChannelStatus.ESCALATED,
        escalatedTo: superAdmin.id
      }
    });

    // Update ticket if exists
    if (channel.ticket) {
      await this.prisma.supportTicket.update({
        where: { channelId },
        data: {
          status: 'ESCALATED',
          escalatedTo: superAdmin.id
        }
      });
    }

    // Add super admin as participant
    await this.prisma.chatParticipant.upsert({
      where: {
        channelId_userId: { channelId, userId: superAdmin.id }
      },
      create: {
        channelId,
        userId: superAdmin.id,
        userType: SenderType.SUPER_ADMIN,
        role: ParticipantRole.ADMIN
      },
      update: {
        leftAt: null // Re-add if previously left
      }
    });

    // Send system message
    await this.prisma.chatMessage.create({
      data: {
        channelId,
        senderId: userId,
        senderType: SenderType.SYSTEM,
        content: `Ticket escalated to platform support. Reason: ${reason}`
      }
    });

    return this.getChannel(channelId, userId, tenantId);
  }

  /**
   * Assign channel to team member
   */
  async assignToTeamMember(
    channelId: string,
    tenantId: string,
    teamMemberId: string
  ) {
    // Verify team member belongs to tenant
    const teamMember = await this.prisma.user.findFirst({
      where: {
        id: teamMemberId,
        tenants: { some: { tenantId } }
      }
    });

    if (!teamMember) {
      throw new ForbiddenException('Team member not found in this tenant');
    }

    await this.prisma.chatChannel.update({
      where: { id: channelId },
      data: { assignedTo: teamMemberId }
    });

    // Add team member as participant if not already
    await this.prisma.chatParticipant.upsert({
      where: {
        channelId_userId: { channelId, userId: teamMemberId }
      },
      create: {
        channelId,
        userId: teamMemberId,
        userType: SenderType.MANAGEMENT_TEAM,
        role: ParticipantRole.ADMIN
      },
      update: {
        leftAt: null // Re-add if previously left
      }
    });

    // Send system message
    await this.prisma.chatMessage.create({
      data: {
        channelId,
        senderId: teamMemberId,
        senderType: SenderType.SYSTEM,
        content: `Assigned to ${teamMember.email}`
      }
    });

    return this.getChannel(channelId, teamMemberId, tenantId);
  }

  /**
   * Mark channel as resolved
   */
  async resolveChannel(
    channelId: string,
    tenantId: string,
    userId: string,
    resolution?: string
  ) {
    const channel = await this.prisma.chatChannel.findFirst({
      where: { id: channelId, tenantId },
      include: { ticket: true }
    });

    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    await this.prisma.chatChannel.update({
      where: { id: channelId },
      data: { status: ChannelStatus.RESOLVED }
    });

    if (channel.ticket) {
      await this.prisma.supportTicket.update({
        where: { channelId },
        data: {
          status: 'RESOLVED',
          resolvedAt: new Date(),
          resolvedBy: userId,
          resolution
        }
      });
    }

    // Send system message
    await this.prisma.chatMessage.create({
      data: {
        channelId,
        senderId: userId,
        senderType: SenderType.SYSTEM,
        content: resolution || 'Channel resolved'
      }
    });

    return this.getChannel(channelId, userId, tenantId);
  }

  /**
   * Archive a channel
   */
  async archiveChannel(channelId: string, tenantId: string, userId: string) {
    const channel = await this.prisma.chatChannel.findFirst({
      where: { id: channelId, tenantId }
    });

    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    return this.prisma.chatChannel.update({
      where: { id: channelId },
      data: { status: ChannelStatus.ARCHIVED }
    });
  }

  /**
   * Mark messages as read by user
   */
  private async markMessagesAsRead(channelId: string, userId: string) {
    await this.prisma.chatMessage.updateMany({
      where: {
        channelId,
        NOT: {
          readBy: {
            has: userId
          }
        }
      },
      data: {
        readBy: {
          push: userId
        }
      }
    });

    // Update last read timestamp
    await this.prisma.chatParticipant.updateMany({
      where: { channelId, userId },
      data: { lastReadAt: new Date() }
    });
  }

  /**
   * Determine user's sender type based on role and tenant
   */
  private async getUserSenderType(
    userId: string,
    tenantId: string
  ): Promise<SenderType> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        tenants: {
          where: { tenantId }
        }
      }
    });

    if (!user) {
      return SenderType.PARTICIPANT;
    }

    if (user.role === 'SUPER_ADMIN') {
      return SenderType.SUPER_ADMIN;
    }

    const userTenant = user.tenants[0];
    if (userTenant?.role === 'ORG_ADMIN') {
      return SenderType.TENANT_ADMIN;
    }

    // Check if user is in management team (has special permissions)
    if (
      userTenant?.role === 'QUESTION_MANAGER' ||
      userTenant?.role === 'INSPECTOR'
    ) {
      return SenderType.MANAGEMENT_TEAM;
    }

    return SenderType.PARTICIPANT;
  }
}
