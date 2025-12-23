import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';

interface CreateUserDto {
  email: string;
  password: string;
  name?: string;
  role: string;
  tenantId?: string;
}

interface UpdateUserDto {
  email?: string;
  name?: string;
  role?: string;
  status?: string;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  // Platform Admin Methods
  async findAllForAdmin(search?: string, tenantId?: string) {
    const where: any = {};
    
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (tenantId) {
      where.userTenants = {
        some: { tenantId }
      };
    }

    const users = await this.prisma.user.findMany({
      where,
      include: {
        userTenants: {
          include: {
            tenant: {
              select: {
                id: true,
                name: true,
                subdomain: true,
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    return users.map(user => ({
      id: user.id,
      name: user.name || user.email.split('@')[0],
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
      status: user.status || 'active',
      lastLogin: user.lastLogin?.toISOString() || 'Never',
      createdAt: user.createdAt.toISOString(),
      tenants: user.userTenants.map(ut => ({
        id: ut.tenant.id,
        name: ut.tenant.name,
        subdomain: ut.tenant.subdomain,
      })),
    }));
  }

  async getUserStats() {
    const [total, active, suspended, byRole] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { status: 'active' } }),
      this.prisma.user.count({ where: { status: 'suspended' } }),
      this.prisma.user.groupBy({
        by: ['role'],
        _count: true,
      }),
    ]);

    return {
      total,
      active,
      suspended,
      pending: total - active - suspended,
      byRole: byRole.reduce((acc, curr) => {
        acc[curr.role] = curr._count;
        return acc;
      }, {} as Record<string, number>),
    };
  }

  async createUser(data: CreateUserDto) {
    // Check if user already exists
    const existing = await this.prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        role: data.role,
        status: 'active',
        emailVerified: false,
      },
    });

    // If tenantId provided, create user-tenant relationship
    if (data.tenantId) {
      await this.prisma.userTenant.create({
        data: {
          userId: user.id,
          tenantId: data.tenantId,
          role: data.role,
        },
      });
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt.toISOString(),
    };
  }

  async updateUser(id: string, data: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // If email is being changed, check for conflicts
    if (data.email && data.email !== user.email) {
      const existing = await this.prisma.user.findUnique({
        where: { email: data.email }
      });
      if (existing) {
        throw new ConflictException('Email already in use');
      }
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        ...(data.email && { email: data.email }),
        ...(data.name && { name: data.name }),
        ...(data.role && { role: data.role }),
        ...(data.status && { status: data.status }),
      },
    });

    return {
      id: updated.id,
      email: updated.email,
      name: updated.name,
      role: updated.role,
      status: updated.status,
    };
  }

  async deleteUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Delete user-tenant relationships first
    await this.prisma.userTenant.deleteMany({
      where: { userId: id }
    });

    // Delete user
    await this.prisma.user.delete({ where: { id } });
  }

  async suspendUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: { status: 'suspended' },
    });

    return {
      id: updated.id,
      email: updated.email,
      status: updated.status,
    };
  }

  async activateUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: { status: 'active' },
    });

    return {
      id: updated.id,
      email: updated.email,
      status: updated.status,
    };
  }
}
