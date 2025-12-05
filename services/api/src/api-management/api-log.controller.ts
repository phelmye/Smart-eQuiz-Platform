import { 
  Controller, 
  Get, 
  Query,
  UseGuards 
} from '@nestjs/common';
import { ApiLogService } from './api-log.service';
import { ApiLogQueryDto } from './dto/api-log-query.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../auth/tenant.guard';
import { TenantId } from '../common/tenant-id.decorator';

@Controller('api-logs')
@UseGuards(JwtAuthGuard, TenantGuard)
export class ApiLogController {
  constructor(private readonly apiLogService: ApiLogService) {}

  @Get()
  query(
    @TenantId() tenantId: string,
    @Query() queryDto: ApiLogQueryDto
  ) {
    return this.apiLogService.query(tenantId, queryDto);
  }

  @Get('stats')
  getStats(
    @TenantId() tenantId: string,
    @Query('days') days?: string
  ) {
    return this.apiLogService.getStats(
      tenantId,
      days ? parseInt(days) : 7
    );
  }
}
