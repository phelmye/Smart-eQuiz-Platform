import { Controller, Post, Delete, UseGuards, Get } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { Role } from '@prisma/client';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * Check if sample data exists in the database
   * GET /api/admin/sample-data/status
   */
  @Get('sample-data/status')
  async getSampleDataStatus() {
    return this.adminService.getSampleDataStatus();
  }

  /**
   * Seed the database with sample data
   * POST /api/admin/sample-data/seed
   * 
   * Only works if no sample data exists yet
   */
  @Post('sample-data/seed')
  async seedSampleData() {
    return this.adminService.seedSampleData();
  }

  /**
   * Clear all sample data from the database
   * DELETE /api/admin/sample-data
   * 
   * This removes all records marked with isSample: true
   */
  @Delete('sample-data')
  async clearSampleData() {
    return this.adminService.clearSampleData();
  }
}
