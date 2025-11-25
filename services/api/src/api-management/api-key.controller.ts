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
import { ApiKeyService } from './api-key.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { UpdateApiKeyDto } from './dto/update-api-key.dto';
import { RevokeApiKeyDto } from './dto/revoke-api-key.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../auth/tenant.guard';
import { TenantId } from '../common/tenant-id.decorator';

@Controller('api-keys')
@UseGuards(JwtAuthGuard, TenantGuard)
export class ApiKeyController {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  @Post()
  create(
    @TenantId() tenantId: string,
    @Req() req: any,
    @Body() createApiKeyDto: CreateApiKeyDto
  ) {
    return this.apiKeyService.create(tenantId, req.user.id, createApiKeyDto);
  }

  @Get()
  findAll(@TenantId() tenantId: string) {
    return this.apiKeyService.findAll(tenantId);
  }

  @Get('stats')
  getUsageStats(
    @TenantId() tenantId: string,
    @Query('apiKeyId') apiKeyId?: string,
    @Query('days') days?: string
  ) {
    return this.apiKeyService.getUsageStats(
      tenantId, 
      apiKeyId, 
      days ? parseInt(days) : 7
    );
  }

  @Get(':id')
  findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.apiKeyService.findOne(tenantId, id);
  }

  @Put(':id')
  update(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() updateApiKeyDto: UpdateApiKeyDto
  ) {
    return this.apiKeyService.update(tenantId, id, updateApiKeyDto);
  }

  @Post(':id/revoke')
  revoke(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Req() req: any,
    @Body() revokeApiKeyDto: RevokeApiKeyDto
  ) {
    return this.apiKeyService.revoke(tenantId, id, req.user.id, revokeApiKeyDto);
  }

  @Delete(':id')
  remove(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.apiKeyService.remove(tenantId, id);
  }
}
