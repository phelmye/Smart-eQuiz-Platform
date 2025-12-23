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
        tenants: {
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
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email.split('@')[0],
      email: user.email,
      role: user.role,
      emailVerified: false, // Field doesn't exist in schema
      status: 'active', // Field doesn't exist in schema
      lastLogin: 'Never', // Field doesn't exist in schema
      createdAt: user.createdAt.toISOString(),
      tenants: user.tenants.map(ut => ({
        id: ut.tenant.id,
        name: ut.tenant.name,
        subdomain: ut.tenant.subdomain,
      })),
    }));
  }

  async getUserStats() {
    const [total, byRole] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.groupBy({
        by: ['role'],
        _count: true,
      }),
    ]);

    return {
      total,
      active: total, // Status field doesn't exist
      suspended: 0, // Status field doesn't exist
      pending: 0,
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
        passwordHash: hashedPassword,
        firstName: data.name?.split(' ')[0] || '',
        lastName: data.name?.split(' ').slice(1).join(' ') || '',
        role: data.role as any, // Cast to avoid enum type issues
      },
    });

    // If tenantId provided, create user-tenant relationship
    if (data.tenantId) {
      await this.prisma.userTenant.create({
        data: {
          userId: user.id,
          tenantId: data.tenantId,
          role: data.role as any, // Cast to avoid enum type issues
        },
      });
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
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
        ...(data.firstName && { firstName: data.firstName }),
        ...(data.lastName && { lastName: data.lastName }),
        ...(data.role && { role: data.role }),
      },
    });

    return {
      id: updated.id,
      email: updated.email,
      firstName: updated.firstName,
      lastName: updated.lastName,
      role: updated.role,
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

    // Note: User model doesn't have status field
    // This method could be extended when status field is added to schema
    return {
      id: user.id,
      email: user.email,
      message: 'User suspension not implemented (no status field in schema)',
    };
  }

  async activateUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Note: User model doesn't have status field
    // This method could be extended when status field is added to schema
    return {
      id: user.id,
      email: user.email,
      message: 'User activation not implemented (no status field in schema)',
    };
  }
}
