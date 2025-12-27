import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';
import { notificationLogger } from '../common/logger.service';

interface RegisterTokenDto {
  userId: string;
  token: string;
  deviceType: 'ios' | 'android';
  deviceName?: string;
  tenantId: string; // Required for tenant isolation
}

interface SendNotificationDto {
  userIds: string[];
  title: string;
  body: string;
  data?: any;
  sound?: string;
  badge?: number;
  priority?: 'default' | 'normal' | 'high';
  channelId?: string;
}

@Injectable()
export class NotificationsService {
  private expo: Expo;

  constructor(private prisma: PrismaService) {
    this.expo = new Expo();
  }

  /**
   * Register a push notification token for a user
   */
  async registerToken(dto: RegisterTokenDto): Promise<{ success: boolean; message: string }> {
    const { userId, token, deviceType, deviceName, tenantId } = dto;

    // Validate the Expo push token
    if (!Expo.isExpoPushToken(token)) {
      throw new BadRequestException('Invalid Expo push token');
    }

    try {
      // Check if token already exists for this user in this tenant
      const existingToken = await this.prisma.pushToken.findFirst({
        where: { 
          userId, 
          token,
          user: { userTenants: { some: { tenantId } } }
        },
      });

      if (existingToken) {
        // Update last active time
        await this.prisma.pushToken.update({
          where: { id: existingToken.id },
          data: { lastUsedAt: new Date() },
        });
        return { success: true, message: 'Token already registered and updated' };
      }

      // Create new token record
      await this.prisma.pushToken.create({
        data: {
          userId,
          token,
          deviceType,
          deviceName: deviceName || `${deviceType.toUpperCase()} Device`,
          isActive: true,
          lastUsedAt: new Date(),
        },
      });

      return { success: true, message: 'Token registered successfully' };
    } catch (error) {
      notificationLogger.pushError(error as Error, { userId, deviceType });
      throw new BadRequestException('Failed to register push token');
    }
  }

  /**
   * Unregister a push notification token
   */
  async unregisterToken(userId: string, token: string, tenantId: string): Promise<{ success: boolean; message: string }> {
    try {
      const pushToken = await this.prisma.pushToken.findFirst({
        where: { 
          userId, 
          token,
          user: { userTenants: { some: { tenantId } } }
        },
      });

      if (!pushToken) {
        return { success: true, message: 'Token not found (already unregistered)' };
      }

      // Soft delete by marking as inactive
      await this.prisma.pushToken.update({
        where: { id: pushToken.id },
        data: { isActive: false },
      });

      return { success: true, message: 'Token unregistered successfully' };
    } catch (error) {
      notificationLogger.pushError(error as Error, { token });
      throw new BadRequestException('Failed to unregister push token');
    }
  }

  /**
   * Get all active tokens for a user
   */
  async getUserTokens(userId: string, tenantId: string): Promise<string[]> {
    const tokens = await this.prisma.pushToken.findMany({
      where: {
        userId,
        isActive: true,
        user: { userTenants: { some: { tenantId } } }
      },
      select: {
        token: true,
      },
    });

    return tokens.map(t => t.token);
  }

  /**
   * Send push notification to specific users
   */
  async sendNotification(dto: SendNotificationDto, tenantId: string): Promise<{ success: boolean; sent: number; failed: number }> {
    const { userIds, title, body, data, sound, badge, priority, channelId } = dto;

    // Get all active tokens for the users within this tenant
    const tokens = await this.prisma.pushToken.findMany({
      where: {
        userId: { in: userIds },
        isActive: true,
        user: { userTenants: { some: { tenantId } } }
      },
      select: {
        token: true,
        userId: true,
      },
    });

    if (tokens.length === 0) {
      return { success: true, sent: 0, failed: 0 };
    }

    // Prepare messages
    const messages: ExpoPushMessage[] = tokens.map(({ token }) => ({
      to: token,
      sound: sound || 'default',
      title,
      body,
      data: data || {},
      badge: badge,
      priority: priority || 'high',
      channelId: channelId || 'default',
    }));

    // Send in chunks (Expo recommends max 100 per request)
    const chunks = this.expo.chunkPushNotifications(messages);
    let successCount = 0;
    let failureCount = 0;

    for (const chunk of chunks) {
      try {
        const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
        
        // Count successes and failures
        ticketChunk.forEach((ticket: ExpoPushTicket) => {
          if (ticket.status === 'ok') {
            successCount++;
          } else {
            failureCount++;
            notificationLogger.pushError(new Error('Push notification failed'), ticket);
          }
        });
      } catch (error) {
        notificationLogger.pushError(error as Error, { chunkSize: chunk.length });
        failureCount += chunk.length;
      }
    }

    // Log notification send
    await this.prisma.notificationLog.create({
      data: {
        userIds,
        title,
        body,
        sentCount: successCount,
        failedCount: failureCount,
        sentAt: new Date(),
      },
    });

    return {
      success: successCount > 0,
      sent: successCount,
      failed: failureCount,
    };
  }

  /**
   * Send notification to all users (broadcast) - TENANT SCOPED
   */
  async broadcastNotification(
    tenantId: string, // Required - no platform-wide broadcasts
    title: string,
    body: string,
    data?: any
  ): Promise<{ success: boolean; sent: number; failed: number }> {
    // Get all active tokens for users in this tenant only
    const tokens = await this.prisma.pushToken.findMany({
      where: {
        isActive: true,
        user: {
          userTenants: { some: { tenantId } }
        },
      },
      select: {
        token: true,
      },
    });

    if (tokens.length === 0) {
      return { success: true, sent: 0, failed: 0 };
    }

    const messages: ExpoPushMessage[] = tokens.map(({ token }) => ({
      to: token,
      sound: 'default',
      title,
      body,
      data: data || {},
    }));

    const chunks = this.expo.chunkPushNotifications(messages);
    let successCount = 0;
    let failureCount = 0;

    for (const chunk of chunks) {
      try {
        const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
        
        ticketChunk.forEach((ticket: ExpoPushTicket) => {
          if (ticket.status === 'ok') {
            successCount++;
          } else {
            failureCount++;
          }
        });
      } catch (error) {
        notificationLogger.pushError(error as Error, { chunkSize: chunk.length, broadcast: true });
        failureCount += chunk.length;
      }
    }

    return {
      success: successCount > 0,
      sent: successCount,
      failed: failureCount,
    };
  }

  /**
   * Clean up inactive tokens (run periodically) - TENANT SCOPED
   */
  async cleanupInactiveTokens(tenantId: string, daysInactive: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysInactive);

    const result = await this.prisma.pushToken.deleteMany({
      where: {
        isActive: false,
        lastUsedAt: { lt: cutoffDate },
        user: { userTenants: { some: { tenantId } } }
      },
    });

    return result.count;
  }
}
