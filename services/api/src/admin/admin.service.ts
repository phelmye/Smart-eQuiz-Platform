import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { BlogPostStatus, TicketStatus, TicketPriority, TicketCategory } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  /**
   * Check if sample data exists
   */
  async getSampleDataStatus() {
    const [tenants, supportTickets, users, auditLogs, blogPosts] = await Promise.all([
      this.prisma.tenant.count({ where: { isSample: true } }),
      this.prisma.supportTicket.count({ where: { isSample: true } }),
      this.prisma.user.count({ where: { isSample: true } }),
      this.prisma.auditLog.count({ where: { isSample: true } }),
      this.prisma.marketingBlogPost.count({ where: { isSample: true } }),
    ]);

    const total = tenants + supportTickets + users + auditLogs + blogPosts;

    return {
      hasSampleData: total > 0,
      counts: {
        tenants,
        supportTickets,
        users,
        auditLogs,
        blogPosts,
        total,
      },
    };
  }

  /**
   * Seed database with sample data
   */
  async seedSampleData() {
    // Check if sample data already exists
    const status = await this.getSampleDataStatus();
    if (status.hasSampleData) {
      throw new BadRequestException('Sample data already exists. Clear it first before reseeding.');
    }

    const results = {
      tenants: 0,
      users: 0,
      supportTickets: 0,
      auditLogs: 0,
      message: 'Sample data seeded successfully',
    };

    // 1. Create sample tenants
    const sampleTenants = [
      {
        name: 'First Baptist Church (Sample)',
        subdomain: 'firstbaptist-demo',
        planId: null,
        subscriptionStatus: 'active',
        isActive: true,
        isSample: true,
        users: 145,
        mrr: 49,
      },
      {
        name: 'Grace Community Church (Sample)',
        subdomain: 'gracecommunity-demo',
        planId: null,
        subscriptionStatus: 'trial',
        isActive: true,
        isSample: true,
        users: 87,
        mrr: 0,
      },
      {
        name: 'Hillside Fellowship (Sample)',
        subdomain: 'hillside-demo',
        planId: null,
        subscriptionStatus: 'active',
        isActive: true,
        isSample: true,
        users: 312,
        mrr: 99,
      },
    ];

    for (const tenantData of sampleTenants) {
      await this.prisma.tenant.create({
        data: {
          name: tenantData.name,
          subdomain: tenantData.subdomain,
          subscriptionStatus: tenantData.subscriptionStatus,
          isActive: tenantData.isActive,
          isSample: tenantData.isSample,
        },
      });
      results.tenants++;
    }

    // 2. Create sample support tickets
    const tenants = await this.prisma.tenant.findMany({ where: { isSample: true } });
    if (tenants.length > 0) {
      const firstTenant = tenants[0];
      
      // Get or create a sample user for this tenant
      const sampleUser = await this.prisma.user.create({
        data: {
          email: `sample.user@${firstTenant.subdomain}.com`,
          passwordHash: await bcrypt.hash('SamplePassword123!', 10),
          firstName: 'Sample',
          lastName: 'User',
          role: 'PARTICIPANT',
          isSample: true,
        },
      });
      results.users++;

      // Create sample support tickets (without full chat channel setup for now)
      // Note: Real tickets need chat channels, so we'll skip this for now
      // and let the UI show empty state
      
      // 3. Create sample audit logs
      const sampleLogs = [
        {
          action: 'tenant.created',
          resource: 'tenant',
          userId: sampleUser.id,
          tenantId: firstTenant.id,
          details: { tenantName: firstTenant.name },
          isSample: true,
        },
        {
          action: 'user.login',
          resource: 'auth',
          userId: sampleUser.id,
          tenantId: firstTenant.id,
          details: { method: 'password' },
          isSample: true,
        },
      ];

      for (const log of sampleLogs) {
        await this.prisma.auditLog.create({ data: log });
        results.auditLogs++;
      }
    }

    // 4. Mark existing blog posts as sample
    await this.prisma.marketingBlogPost.updateMany({
      data: { isSample: true },
    });

    return results;
  }

  /**
   * Clear all sample data from database
   */
  async clearSampleData() {
    const results = {
      tenants: 0,
      users: 0,
      supportTickets: 0,
      auditLogs: 0,
      blogPosts: 0,
      message: 'Sample data cleared successfully',
    };

    // Delete in correct order to respect foreign keys
    
    // 1. Clear audit logs (no foreign key dependencies)
    const deletedLogs = await this.prisma.auditLog.deleteMany({
      where: { isSample: true },
    });
    results.auditLogs = deletedLogs.count;

    // 2. Clear support tickets (depends on users/tenants)
    const deletedTickets = await this.prisma.supportTicket.deleteMany({
      where: { isSample: true },
    });
    results.supportTickets = deletedTickets.count;

    // 3. Clear sample users (depends on tenants via UserTenant)
    // First clear UserTenant relationships
    await this.prisma.userTenant.deleteMany({
      where: { 
        user: { isSample: true } 
      },
    });
    
    const deletedUsers = await this.prisma.user.deleteMany({
      where: { isSample: true },
    });
    results.users = deletedUsers.count;

    // 4. Clear tenants (has dependencies on many tables)
    const deletedTenants = await this.prisma.tenant.deleteMany({
      where: { isSample: true },
    });
    results.tenants = deletedTenants.count;

    // 5. Reset blog posts isSample flag (don't delete, just unmark)
    await this.prisma.marketingBlogPost.updateMany({
      where: { isSample: true },
      data: { isSample: false },
    });

    return results;
  }
}
