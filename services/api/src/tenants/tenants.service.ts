import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateTenantDto, UpdateTenantDto, TenantStatus } from './dto/tenant.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const tenants = await this.prisma.tenant.findMany({
      include: {
        plan: true,
        _count: {
          select: {
            userTenants: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate MRR and format response
    return tenants.map(tenant => ({
      id: tenant.id,
      name: tenant.name,
      subdomain: tenant.subdomain || '',
      customDomain: tenant.customDomain || '',
      plan: tenant.plan?.name || 'Starter',
      planId: tenant.planId || '',
      status: this.mapStatus(tenant.suspended, tenant.plan?.name),
      users: tenant._count.userTenants,
      mrr: this.calculateMRR(tenant.plan?.name),
      maxUsers: tenant.maxUsers || 0,
      maxStorage: tenant.maxStorage || 0,
      joined: tenant.createdAt.toISOString(),
      createdAt: tenant.createdAt.toISOString(),
      updatedAt: tenant.updatedAt.toISOString(),
    }));
  }

  async findOne(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: {
        plan: true,
        userTenants: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                username: true,
              },
            },
          },
        },
      },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }

    return {
      ...tenant,
      status: this.mapStatus(tenant.suspended, tenant.plan?.name),
      users: tenant.userTenants.length,
      mrr: this.calculateMRR(tenant.plan?.name),
    };
  }

  async create(createTenantDto: CreateTenantDto) {
    const { adminEmail, planId, subdomain, ...tenantData } = createTenantDto;

    // Check if subdomain already exists
    if (subdomain) {
      const existing = await this.prisma.tenant.findUnique({
        where: { subdomain },
      });
      if (existing) {
        throw new ConflictException(`Subdomain ${subdomain} is already taken`);
      }
    }

    // Get default plan if not provided
    let selectedPlanId = planId;
    if (!selectedPlanId) {
      const defaultPlan = await this.prisma.plan.findFirst({
        where: { name: 'Starter' },
      });
      selectedPlanId = defaultPlan?.id;
    }

    // Create tenant
    const tenant = await this.prisma.tenant.create({
      data: {
        ...tenantData,
        subdomain: subdomain || this.generateSubdomain(tenantData.name),
        planId: selectedPlanId,
        suspended: createTenantDto.status === TenantStatus.SUSPENDED,
      },
      include: {
        plan: true,
      },
    });

    // Create admin user for the tenant
    try {
      const hashedPassword = await bcrypt.hash('Welcome123!', 10); // Temporary password
      const adminUser = await this.prisma.user.create({
        data: {
          email: adminEmail,
          username: adminEmail.split('@')[0],
          password: hashedPassword,
          role: 'ORG_ADMIN',
        },
      });

      // Link admin user to tenant
      await this.prisma.userTenant.create({
        data: {
          userId: adminUser.id,
          tenantId: tenant.id,
          role: 'ORG_ADMIN',
        },
      });
    } catch (error) {
      // If user creation fails, log but don't fail tenant creation
      console.error('Failed to create admin user:', error);
    }

    return {
      ...tenant,
      status: this.mapStatus(tenant.suspended, tenant.plan?.name),
      users: 1, // Just created admin
      mrr: this.calculateMRR(tenant.plan?.name),
    };
  }

  async update(id: string, updateTenantDto: UpdateTenantDto) {
    const tenant = await this.findOne(id);

    // Check subdomain uniqueness if being changed
    if (updateTenantDto.subdomain && updateTenantDto.subdomain !== tenant.subdomain) {
      const existing = await this.prisma.tenant.findUnique({
        where: { subdomain: updateTenantDto.subdomain },
      });
      if (existing) {
        throw new ConflictException(`Subdomain ${updateTenantDto.subdomain} is already taken`);
      }
    }

    const updated = await this.prisma.tenant.update({
      where: { id },
      data: {
        ...updateTenantDto,
        suspended: updateTenantDto.status === TenantStatus.SUSPENDED ? true : 
                   updateTenantDto.status === TenantStatus.ACTIVE ? false : 
                   undefined,
      },
      include: {
        plan: true,
        _count: {
          select: {
            userTenants: true,
          },
        },
      },
    });

    return {
      ...updated,
      status: this.mapStatus(updated.suspended, updated.plan?.name),
      users: updated._count.userTenants,
      mrr: this.calculateMRR(updated.plan?.name),
    };
  }

  async remove(id: string) {
    const tenant = await this.findOne(id);

    // Delete associated user-tenant relationships first
    await this.prisma.userTenant.deleteMany({
      where: { tenantId: id },
    });

    // Delete tenant
    await this.prisma.tenant.delete({
      where: { id },
    });

    return { message: `Tenant ${tenant.name} has been deleted` };
  }

  async suspend(id: string) {
    return this.prisma.tenant.update({
      where: { id },
      data: { suspended: true },
    });
  }

  async activate(id: string) {
    return this.prisma.tenant.update({
      where: { id },
      data: { suspended: false },
    });
  }

  // Helper methods
  private generateSubdomain(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 20);
  }

  private mapStatus(suspended: boolean, planName?: string): TenantStatus {
    if (suspended) return TenantStatus.SUSPENDED;
    if (planName === 'Trial') return TenantStatus.TRIAL;
    return TenantStatus.ACTIVE;
  }

  private calculateMRR(planName?: string): number {
    const prices: Record<string, number> = {
      'Starter': 1900,
      'Professional': 4900,
      'Enterprise': 14900,
    };
    return prices[planName || ''] || 0;
  }
}
