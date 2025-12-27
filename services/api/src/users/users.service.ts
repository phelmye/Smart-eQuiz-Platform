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
  firstName?: string;
  lastName?: string;
  role?: string;
  // Note: status field doesn't exist in User model
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string, tenantId?: string) {
    if (!tenantId) {
      // Used only for authentication - return user without tenant filtering
      return this.prisma.user.findUnique({ where: { email } });
    }
    
    // For tenant-scoped operations, check user belongs to tenant
    return this.prisma.user.findFirst({
      where: {
        email,
        userTenants: {
          some: { tenantId }
        }
      }
    });
  }

  async findById(id: string, tenantId?: string) {
    if (!tenantId) {
      // Super admin can access any user
      return this.prisma.user.findUnique({ where: { id } });
    }
    
    // For tenant-scoped operations, verify user belongs to tenant
    return this.prisma.user.findFirst({
      where: {
        id,
        userTenants: {
          some: { tenantId }
        }
      }
    });
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

  async getUserStats(tenantId?: string) {
    const where: any = {};
    
    // If tenantId provided, filter to tenant users only
    if (tenantId) {
      where.userTenants = {
        some: { tenantId }
      };
    }
    
    const [total, byRole] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.groupBy({
        by: ['role'],
        where,
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
    // Check if user already exists in this tenant (if tenantId provided)
    if (data.tenantId) {
      const existing = await this.prisma.user.findFirst({
        where: {
          email: data.email,
          userTenants: {
            some: { tenantId: data.tenantId }
          }
        }
      });
      
      if (existing) {
        throw new ConflictException('User with this email already exists in this tenant');
      }
    } else {
      // For super admin creating users without tenant, check global uniqueness
      const existing = await this.prisma.user.findUnique({
        where: { email: data.email }
      });

      if (existing) {
        throw new ConflictException('User with this email already exists');
      }
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

  async updateUser(id: string, data: UpdateUserDto, tenantId?: string) {
    // Find user and verify tenant access
    const user = await this.findById(id, tenantId);
    
    if (!user) {
      throw new NotFoundException('User not found or access denied');
    }

    // If email is being changed, check for conflicts within tenant scope
    if (data.email && data.email !== user.email) {
      if (tenantId) {
        const existing = await this.prisma.user.findFirst({
          where: {
            email: data.email,
            userTenants: {
              some: { tenantId }
            }
          }
        });
        if (existing) {
          throw new ConflictException('Email already in use in this tenant');
        }
      } else {
        const existing = await this.prisma.user.findUnique({
          where: { email: data.email }
        });
        if (existing) {
          throw new ConflictException('Email already in use');
        }
      }
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        ...(data.email && { email: data.email }),
        ...(data.firstName && { firstName: data.firstName }),
        ...(data.lastName && { lastName: data.lastName }),
        ...(data.role && { role: data.role as any }), // Cast to avoid enum type issues
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

  async deleteUser(id: string, tenantId?: string) {
    // Find user and verify tenant access
    const user = await this.findById(id, tenantId);
    
    if (!user) {
      throw new NotFoundException('User not found or access denied');
    }

    // Delete user-tenant relationships first
    await this.prisma.userTenant.deleteMany({
      where: { userId: id }
    });

    // Delete user
    await this.prisma.user.delete({ where: { id } });
  }

  async suspendUser(id: string, tenantId?: string) {
    // Find user and verify tenant access
    const user = await this.findById(id, tenantId);
    
    if (!user) {
      throw new NotFoundException('User not found or access denied');
    }

    // Note: User model doesn't have status field
    // This method could be extended when status field is added to schema
    return {
      id: user.id,
      email: user.email,
      message: 'User suspension not implemented (no status field in schema)',
    };
  }

  async activateUser(id: string, tenantId?: string) {
    // Find user and verify tenant access
    const user = await this.findById(id, tenantId);
    
    if (!user) {
      throw new NotFoundException('User not found or access denied');
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
