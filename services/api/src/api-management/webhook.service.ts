import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { UpdateWebhookDto } from './dto/update-webhook.dto';
import { WebhookEvent, WebhookStatus, WebhookDeliveryStatus } from '@prisma/client';
import * as crypto from 'crypto';
import axios from 'axios';

@Injectable()
export class WebhookService {
  constructor(private prisma: PrismaService) {}

  /**
   * Generate webhook signing secret
   */
  private generateSecret(): string {
    return `whsec_${crypto.randomBytes(32).toString('base64url')}`;
  }

  /**
   * Create HMAC signature for webhook payload
   */
  private createSignature(payload: string, secret: string): string {
    return crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
  }

  /**
   * Create a new webhook
   */
  async create(tenantId: string, userId: string, dto: CreateWebhookDto) {
    const secret = this.generateSecret();

    return this.prisma.webhook.create({
      data: {
        tenantId,
        url: dto.url,
        description: dto.description,
        events: dto.events,
        secret, // Store encrypted in production
        retryAttempts: dto.retryAttempts || 3,
        timeout: dto.timeout || 30000,
        createdBy: userId,
      }
    });
  }

  /**
   * List all webhooks for a tenant
   */
  async findAll(tenantId: string) {
    return this.prisma.webhook.findMany({
      where: { tenantId },
      select: {
        id: true,
        url: true,
        description: true,
        events: true,
        status: true,
        retryAttempts: true,
        timeout: true,
        lastTriggeredAt: true,
        lastSuccessAt: true,
        lastFailureAt: true,
        failureCount: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Get webhook details including secret
   */
  async findOne(tenantId: string, id: string) {
    const webhook = await this.prisma.webhook.findFirst({
      where: { id, tenantId }
    });

    if (!webhook) {
      throw new NotFoundException('Webhook not found');
    }

    return webhook;
  }

  /**
   * Update webhook settings
   */
  async update(tenantId: string, id: string, dto: UpdateWebhookDto) {
    const existing = await this.prisma.webhook.findFirst({
      where: { id, tenantId }
    });

    if (!existing) {
      throw new NotFoundException('Webhook not found');
    }

    return this.prisma.webhook.update({
      where: { id },
      data: dto
    });
  }

  /**
   * Delete a webhook
   */
  async remove(tenantId: string, id: string) {
    const existing = await this.prisma.webhook.findFirst({
      where: { id, tenantId }
    });

    if (!existing) {
      throw new NotFoundException('Webhook not found');
    }

    await this.prisma.webhook.delete({ where: { id } });
    return { message: 'Webhook deleted successfully' };
  }

  /**
   * Emit an event to all subscribed webhooks
   */
  async emitEvent(
    tenantId: string,
    eventType: WebhookEvent,
    data: any
  ) {
    // Find all active webhooks subscribed to this event
    const webhooks = await this.prisma.webhook.findMany({
      where: {
        tenantId,
        status: WebhookStatus.ACTIVE,
        events: { has: eventType }
      }
    });

    if (webhooks.length === 0) {
      return; // No webhooks to trigger
    }

    const eventId = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    const payload = {
      id: eventId,
      type: eventType,
      timestamp,
      data
    };

    // Create delivery records for each webhook
    const deliveries = await Promise.all(
      webhooks.map(webhook =>
        this.prisma.webhookDelivery.create({
          data: {
            webhookId: webhook.id,
            eventType,
            eventId,
            payload,
            status: WebhookDeliveryStatus.PENDING,
            maxAttempts: webhook.retryAttempts,
          }
        })
      )
    );

    // Trigger deliveries asynchronously
    deliveries.forEach(delivery => {
      this.deliverWebhook(delivery.id).catch(err => {
        console.error(`Webhook delivery ${delivery.id} failed:`, err);
      });
    });

    return { eventId, webhooksTriggered: webhooks.length };
  }

  /**
   * Deliver a webhook (with retries)
   */
  async deliverWebhook(deliveryId: string) {
    const delivery = await this.prisma.webhookDelivery.findUnique({
      where: { id: deliveryId },
      include: { webhook: true }
    });

    if (!delivery || delivery.status === WebhookDeliveryStatus.SUCCESS) {
      return; // Already delivered
    }

    const { webhook, payload } = delivery;

    try {
      const payloadString = JSON.stringify(payload);
      const signature = this.createSignature(payloadString, webhook.secret);

      const response = await axios.post(webhook.url, payload, {
        timeout: webhook.timeout,
        headers: {
          'Content-Type': 'application/json',
          'X-SmartEquiz-Signature': `sha256=${signature}`,
          'X-SmartEquiz-Event': delivery.eventType,
          'X-SmartEquiz-Delivery-ID': delivery.id,
          'X-SmartEquiz-Event-ID': delivery.eventId,
        }
      });

      // Success
      await this.prisma.webhookDelivery.update({
        where: { id: deliveryId },
        data: {
          status: WebhookDeliveryStatus.SUCCESS,
          statusCode: response.status,
          responseBody: JSON.stringify(response.data).substring(0, 1000), // Truncate
          deliveredAt: new Date(),
          attempts: delivery.attempts + 1,
        }
      });

      // Update webhook success stats
      await this.prisma.webhook.update({
        where: { id: webhook.id },
        data: {
          lastTriggeredAt: new Date(),
          lastSuccessAt: new Date(),
          failureCount: 0, // Reset failure count on success
        }
      });

    } catch (error: any) {
      const attempts = delivery.attempts + 1;
      const shouldRetry = attempts < delivery.maxAttempts;

      const updateData: any = {
        status: shouldRetry ? WebhookDeliveryStatus.RETRYING : WebhookDeliveryStatus.FAILED,
        statusCode: error.response?.status,
        errorMessage: error.message,
        responseBody: error.response?.data ? JSON.stringify(error.response.data).substring(0, 1000) : null,
        attempts,
      };

      if (shouldRetry) {
        // Exponential backoff: 1min, 5min, 15min
        const retryDelays = [60000, 300000, 900000];
        const delay = retryDelays[attempts - 1] || 900000;
        updateData.nextRetryAt = new Date(Date.now() + delay);
      }

      await this.prisma.webhookDelivery.update({
        where: { id: deliveryId },
        data: updateData
      });

      // Update webhook failure stats
      await this.prisma.webhook.update({
        where: { id: webhook.id },
        data: {
          lastTriggeredAt: new Date(),
          lastFailureAt: new Date(),
          failureCount: { increment: 1 },
          // Auto-pause after 10 consecutive failures
          status: webhook.failureCount >= 9 ? WebhookStatus.FAILED : webhook.status,
        }
      });

      // Schedule retry if needed
      if (shouldRetry) {
        setTimeout(() => {
          this.deliverWebhook(deliveryId).catch(console.error);
        }, updateData.nextRetryAt.getTime() - Date.now());
      }
    }
  }

  /**
   * Test a webhook with a sample payload
   */
  async testWebhook(tenantId: string, id: string) {
    const webhook = await this.findOne(tenantId, id);

    const testPayload = {
      id: `test_${crypto.randomUUID()}`,
      type: WebhookEvent.USER_CREATED,
      timestamp: new Date().toISOString(),
      data: {
        test: true,
        message: 'This is a test webhook delivery',
        webhook_id: id,
      }
    };

    const delivery = await this.prisma.webhookDelivery.create({
      data: {
        webhookId: id,
        eventType: WebhookEvent.USER_CREATED,
        eventId: testPayload.id,
        payload: testPayload,
        status: WebhookDeliveryStatus.PENDING,
        maxAttempts: 1, // Don't retry test deliveries
      }
    });

    // Deliver immediately
    await this.deliverWebhook(delivery.id);

    // Return updated delivery status
    return this.prisma.webhookDelivery.findUnique({
      where: { id: delivery.id }
    });
  }

  /**
   * Get webhook delivery logs
   */
  async getDeliveries(tenantId: string, webhookId: string, limit: number = 100) {
    // Verify webhook belongs to tenant
    const webhook = await this.findOne(tenantId, webhookId);

    return this.prisma.webhookDelivery.findMany({
      where: { webhookId },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
  }

  /**
   * Retry a failed webhook delivery
   */
  async retryDelivery(tenantId: string, deliveryId: string) {
    const delivery = await this.prisma.webhookDelivery.findUnique({
      where: { id: deliveryId },
      include: { webhook: true }
    });

    if (!delivery || delivery.webhook.tenantId !== tenantId) {
      throw new NotFoundException('Delivery not found');
    }

    if (delivery.status === WebhookDeliveryStatus.SUCCESS) {
      throw new Error('Cannot retry successful delivery');
    }

    // Reset status and retry
    await this.prisma.webhookDelivery.update({
      where: { id: deliveryId },
      data: {
        status: WebhookDeliveryStatus.PENDING,
        nextRetryAt: null,
      }
    });

    await this.deliverWebhook(deliveryId);

    return { message: 'Delivery retry initiated' };
  }
}
