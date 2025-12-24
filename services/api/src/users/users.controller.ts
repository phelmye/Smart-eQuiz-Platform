import { Controller, Get, Post, Put, Delete, Body, Param, Req, UseGuards, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { AuditService, AuditAction, AuditResource } from '../audit/audit.service';

interface CreateUserDto {
  email: string;
  password: string;
  name?: string;
  role: string;
  tenantId?: string;
}

interface UpdateUserDto {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  // Note: status field doesn't exist in User model
}

@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly auditService: AuditService,
  ) {}

  @Get('me')
  @Roles('SUPER_ADMIN','ORG_ADMIN','PARTICIPANT','SPECTATOR')
  async me(@Req() req: any) {
    const user = await this.usersService.findById(req.user.userId);
    
    // Log user data access
    await this.auditService.logAccess(
      req.user.userId,
      req.user.tenantId,
      AuditResource.USER,
      user.id,
      true,
      req.ip,
    );
    
    return { id: user.id, email: user.email, role: user.role };
  }

  // Platform Admin Endpoints (Super Admin Only)
  @Get()
  @Roles('SUPER_ADMIN')
  async findAll(@Query('search') search?: string, @Query('tenantId') tenantId?: string) {
    const users = await this.usersService.findAllForAdmin(search, tenantId);
    return users;
  }

  @Get('stats')
  @Roles('SUPER_ADMIN')
  async getStats() {
    const stats = await this.usersService.getUserStats();
    return stats;
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'ORG_ADMIN')
  async findOne(@Param('id') id: string, @Req() req: any) {
    const user = await this.usersService.findById(id);
    
    await this.auditService.logAccess(
      req.user.userId,
      req.user.tenantId,
      AuditResource.USER,
      id,
      true,
      req.ip,
    );
    
    return user;
  }

  @Post()
  @Roles('SUPER_ADMIN')
  async create(@Body() createUserDto: CreateUserDto, @Req() req: any) {
    const user = await this.usersService.createUser(createUserDto);
    
    await this.auditService.log({
      userId: req.user.userId,
      tenantId: req.user.tenantId,
      action: AuditAction.CREATE,
      resource: AuditResource.USER,
      resourceId: user.id,
      changes: { email: createUserDto.email, role: createUserDto.role },
      ipAddress: req.ip,
    });
    
    return user;
  }

  @Put(':id')
  @Roles('SUPER_ADMIN')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Req() req: any) {
    const user = await this.usersService.updateUser(id, updateUserDto);
    
    await this.auditService.log({
      userId: req.user.userId,
      tenantId: req.user.tenantId,
      action: AuditAction.UPDATE,
      resource: AuditResource.USER,
      resourceId: id,
      changes: updateUserDto,
      ipAddress: req.ip,
    });
    
    return user;
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN')
  async remove(@Param('id') id: string, @Req() req: any) {
    await this.usersService.deleteUser(id);
    
    await this.auditService.log({
      userId: req.user.userId,
      tenantId: req.user.tenantId,
      action: AuditAction.DELETE,
      resource: AuditResource.USER,
      resourceId: id,
      changes: null,
      ipAddress: req.ip,
    });
    
    return { message: 'User deleted successfully' };
  }

  @Post(':id/suspend')
  @Roles('SUPER_ADMIN')
  async suspend(@Param('id') id: string, @Req() req: any) {
    const user = await this.usersService.suspendUser(id);
    
    await this.auditService.log({
      userId: req.user.userId,
      tenantId: req.user.tenantId,
      action: AuditAction.UPDATE,
      resource: AuditResource.USER,
      resourceId: id,
      changes: { status: 'suspended' },
      ipAddress: req.ip,
    });
    
    return user;
  }

  @Post(':id/activate')
  @Roles('SUPER_ADMIN')
  async activate(@Param('id') id: string, @Req() req: any) {
    const user = await this.usersService.activateUser(id);
    
    await this.auditService.log({
      userId: req.user.userId,
      tenantId: req.user.tenantId,
      action: AuditAction.UPDATE,
      resource: AuditResource.USER,
      resourceId: id,
      changes: { status: 'active' },
      ipAddress: req.ip,
    });
    
    return user;
  }
}
