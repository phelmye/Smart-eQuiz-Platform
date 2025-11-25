import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
  WsException
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { ChatService } from './chat.service';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  tenantId?: string;
}

@WebSocketGateway({
  namespace: '/chat',
  cors: {
    origin: '*', // Configure properly for production
    credentials: true
  }
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger = new Logger('ChatGateway');
  private userSockets = new Map<string, string>(); // userId -> socketId

  constructor(private chatService: ChatService) {}

  handleConnection(client: AuthenticatedSocket) {
    const userId = client.handshake.query.userId as string;
    const tenantId = client.handshake.query.tenantId as string;

    if (!userId || !tenantId) {
      this.logger.warn('Connection rejected: missing userId or tenantId');
      client.disconnect();
      return;
    }

    client.userId = userId;
    client.tenantId = tenantId;

    this.userSockets.set(userId, client.id);
    client.join(`tenant:${tenantId}`); // ✅ Tenant-scoped room
    client.join(`user:${userId}`);

    this.logger.log(`User ${userId} connected to tenant ${tenantId}`);
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      this.userSockets.delete(client.userId);
      this.logger.log(`User ${client.userId} disconnected`);
    }
  }

  @SubscribeMessage('join_channel')
  async handleJoinChannel(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody()
    payload: { channelId: string }
  ) {
    try {
      const { channelId } = payload;
      const { userId, tenantId } = client;

      if (!userId || !tenantId) {
        throw new WsException('Not authenticated');
      }

      // Verify user has access to this channel
      const channel = await this.chatService.getChannel(
        channelId,
        userId,
        tenantId
      );

      if (!channel) {
        throw new WsException('Channel not found or access denied');
      }

      client.join(`channel:${channelId}`);
      client.emit('joined_channel', { channelId });

      this.logger.log(`User ${userId} joined channel ${channelId}`);
    } catch (error) {
      this.logger.error(`Error joining channel: ${error.message}`);
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('leave_channel')
  handleLeaveChannel(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: { channelId: string }
  ) {
    const { channelId } = payload;
    client.leave(`channel:${channelId}`);
    client.emit('left_channel', { channelId });
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody()
    payload: { channelId: string; content: string; metadata?: any }
  ) {
    try {
      const { channelId, content, metadata } = payload;
      const { userId, tenantId } = client;

      if (!userId || !tenantId) {
        throw new WsException('Not authenticated');
      }

      // Save message via service (includes tenant verification)
      const message = await this.chatService.sendMessage(
        channelId,
        userId,
        tenantId,
        { content, metadata }
      );

      // Broadcast to all participants in the channel
      this.server.to(`channel:${channelId}`).emit('new_message', {
        channelId,
        message: {
          id: message.id,
          content: message.content,
          senderId: message.senderId,
          senderType: message.senderType,
          sender: message.sender,
          metadata: message.metadata,
          createdAt: message.createdAt
        }
      });

      this.logger.log(
        `Message sent in channel ${channelId} by user ${userId}`
      );
    } catch (error) {
      this.logger.error(`Error sending message: ${error.message}`);
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: { channelId: string; userName: string }
  ) {
    const { channelId, userName } = payload;
    const { userId } = client;

    // Broadcast to others in channel (not sender)
    client.to(`channel:${channelId}`).emit('user_typing', {
      channelId,
      userId,
      userName
    });
  }

  @SubscribeMessage('stop_typing')
  handleStopTyping(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: { channelId: string }
  ) {
    const { channelId } = payload;
    const { userId } = client;

    client.to(`channel:${channelId}`).emit('user_stop_typing', {
      channelId,
      userId
    });
  }

  /**
   * Notify super admin about escalation
   */
  notifySuperAdmin(ticketId: string, tenantId: string, subject: string) {
    // Broadcast to all super admin users
    this.server.emit('ticket_escalated', {
      ticketId,
      tenantId,
      subject,
      timestamp: new Date()
    });

    this.logger.log(`Ticket ${ticketId} escalated to super admin`);
  }

  /**
   * Notify user about channel assignment
   */
  notifyUserAssigned(userId: string, channelId: string, message: string) {
    this.server.to(`user:${userId}`).emit('channel_assigned', {
      channelId,
      message,
      timestamp: new Date()
    });

    this.logger.log(`User ${userId} notified about channel ${channelId}`);
  }

  /**
   * Notify channel participants about status change
   */
  notifyChannelStatusChange(
    channelId: string,
    status: string,
    message: string
  ) {
    this.server.to(`channel:${channelId}`).emit('channel_status_changed', {
      channelId,
      status,
      message,
      timestamp: new Date()
    });
  }
}
