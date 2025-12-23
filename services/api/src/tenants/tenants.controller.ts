import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { CreateTenantDto, UpdateTenantDto } from './dto/tenant.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../common/roles.decorator';

@Controller('tenants')
@UseGuards(JwtAuthGuard)
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get()
  @Roles('SUPER_ADMIN')
  findAll() {
    return this.tenantsService.findAll();
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'ORG_ADMIN')
  findOne(@Param('id') id: string) {
    return this.tenantsService.findOne(id);
  }

  @Post()
  @Roles('SUPER_ADMIN')
  create(@Body() createTenantDto: CreateTenantDto) {
    return this.tenantsService.create(createTenantDto);
  }

  @Put(':id')
  @Roles('SUPER_ADMIN')
  update(@Param('id') id: string, @Body() updateTenantDto: UpdateTenantDto) {
    return this.tenantsService.update(id, updateTenantDto);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.tenantsService.remove(id);
  }

  @Post(':id/suspend')
  @Roles('SUPER_ADMIN')
  suspend(@Param('id') id: string) {
    return this.tenantsService.suspend(id);
  }

  @Post(':id/activate')
  @Roles('SUPER_ADMIN')
  activate(@Param('id') id: string) {
    return this.tenantsService.activate(id);
  }
}
