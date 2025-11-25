import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query,
  UseGuards,
  Req 
} from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { UpdateWebhookDto } from './dto/update-webhook.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../auth/tenant.guard';
import { TenantId } from '../common/tenant-id.decorator';

@Controller('webhooks')
@UseGuards(JwtAuthGuard, TenantGuard)
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post()
  create(
    @TenantId() tenantId: string,
    @Req() req: any,
    @Body() createWebhookDto: CreateWebhookDto
  ) {
    return this.webhookService.create(tenantId, req.user.id, createWebhookDto);
  }

  @Get()
  findAll(@TenantId() tenantId: string) {
    return this.webhookService.findAll(tenantId);
  }

  @Get(':id')
  findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.webhookService.findOne(tenantId, id);
  }

  @Put(':id')
  update(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() updateWebhookDto: UpdateWebhookDto
  ) {
    return this.webhookService.update(tenantId, id, updateWebhookDto);
  }

  @Delete(':id')
  remove(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.webhookService.remove(tenantId, id);
  }

  @Post(':id/test')
  test(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.webhookService.testWebhook(tenantId, id);
  }

  @Get(':id/deliveries')
  getDeliveries(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Query('limit') limit?: string
  ) {
    return this.webhookService.getDeliveries(
      tenantId,
      id,
      limit ? parseInt(limit) : 100
    );
  }

  @Post('deliveries/:deliveryId/retry')
  retryDelivery(
    @TenantId() tenantId: string,
    @Param('deliveryId') deliveryId: string
  ) {
    return this.webhookService.retryDelivery(tenantId, deliveryId);
  }
}
