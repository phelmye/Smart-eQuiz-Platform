import { Controller, Post, Delete, Body, Param, UseGuards, Get, Query } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../common/tenant.guard';
import { TenantId } from '../common/tenant.decorator';
import { UserId } from '../common/user-id.decorator';

@Controller('notifications')
@UseGuards(JwtAuthGuard, TenantGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * Register a push notification token for the current user
   * POST /api/notifications/register-token
   */
  @Post('register-token')
  async registerToken(
    @UserId() userId: string,
    @Body() body: { token: string; deviceType: 'ios' | 'android'; deviceName?: string }
  ) {
    return this.notificationsService.registerToken({
      userId,
      token: body.token,
      deviceType: body.deviceType,
      deviceName: body.deviceName,
    });
  }

  /**
   * Unregister a push notification token
   * DELETE /api/notifications/unregister-token
   */
  @Delete('unregister-token')
  async unregisterToken(
    @UserId() userId: string,
    @Body() body: { token: string }
  ) {
    return this.notificationsService.unregisterToken(userId, body.token);
  }

  /**
   * Get all active tokens for the current user
   * GET /api/notifications/tokens
   */
  @Get('tokens')
  async getUserTokens(@UserId() userId: string) {
    const tokens = await this.notificationsService.getUserTokens(userId);
    return { tokens };
  }

  /**
   * Send notification to specific users (admin only)
   * POST /api/notifications/send
   */
  @Post('send')
  async sendNotification(
    @TenantId() tenantId: string,
    @Body() body: {
      userIds: string[];
      title: string;
      body: string;
      data?: any;
      sound?: string;
      badge?: number;
      priority?: 'default' | 'normal' | 'high';
      channelId?: string;
    }
  ) {
    return this.notificationsService.sendNotification({
      userIds: body.userIds,
      title: body.title,
      body: body.body,
      data: body.data,
      sound: body.sound,
      badge: body.badge,
      priority: body.priority,
      channelId: body.channelId,
    });
  }

  /**
   * Broadcast notification to all users in tenant (admin only)
   * POST /api/notifications/broadcast
   */
  @Post('broadcast')
  async broadcastNotification(
    @TenantId() tenantId: string,
    @Body() body: {
      title: string;
      body: string;
      data?: any;
    }
  ) {
    return this.notificationsService.broadcastNotification(
      body.title,
      body.body,
      body.data,
      tenantId
    );
  }

  /**
   * Clean up inactive tokens (admin only)
   * POST /api/notifications/cleanup
   */
  @Post('cleanup')
  async cleanupTokens(@Query('days') days?: string) {
    const daysInactive = days ? parseInt(days) : 30;
    const count = await this.notificationsService.cleanupInactiveTokens(daysInactive);
    return { success: true, tokensRemoved: count };
  }
}
