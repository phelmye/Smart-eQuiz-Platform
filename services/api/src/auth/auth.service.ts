import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma.service';
import { randomBytes } from 'crypto';

interface Tokens { access_token: string; refresh_token: string; userId?: string }

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService, private readonly prisma: PrismaService) {}

  async validateUser(email: string, pass: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    const ok = await bcrypt.compare(pass, user.passwordHash);
    if (!ok) return null;
    return { id: user.id, email: user.email, role: user.role };
  }

  async getUserById(userId: string) {
    return this.prisma.user.findUnique({ where: { id: userId } });
  }

  async login(user: any): Promise<Tokens> {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);
    // create a refresh token and persist its hash
    const refreshToken = randomBytes(48).toString('hex');
    const hash = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({ where: { id: user.id }, data: { refreshTokenHash: hash } });
    // For non-browser clients we return the refresh token payload as well (dev only)
    return { access_token: accessToken, refresh_token: refreshToken };
  }

  async refresh(refreshToken: string): Promise<Tokens | null> {
    // find user with matching refreshTokenHash
    const users = await this.prisma.user.findMany({ where: { refreshTokenHash: { not: null } } });
    for (const u of users) {
      if (u.refreshTokenHash && await bcrypt.compare(refreshToken, u.refreshTokenHash)) {
        const payload = { sub: u.id, email: u.email, role: u.role };
        const accessToken = this.jwtService.sign(payload);
        // rotate refresh token
        const newRefresh = randomBytes(48).toString('hex');
        const newHash = await bcrypt.hash(newRefresh, 10);
        await this.prisma.user.update({ where: { id: u.id }, data: { refreshTokenHash: newHash } });
        return { access_token: accessToken, refresh_token: newRefresh, userId: u.id };
      }
    }
    return null;
  }

  async clearRefreshToken(userId: string) {
    await this.prisma.user.update({ where: { id: userId }, data: { refreshTokenHash: null } });
  }

  async register(data: {
    organizationName: string;
    subdomain: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    plan?: string;
  }) {
    // Check if subdomain already exists
    const existingTenant = await this.prisma.tenant.findFirst({
      where: { subdomain: data.subdomain }
    });
    if (existingTenant) {
      throw new Error('Subdomain already taken');
    }

    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email }
    });
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Get the selected plan (default to Essential if not found)
    const planName = data.plan || 'professional';
    let plan = await this.prisma.plan.findFirst({
      where: { 
        name: { 
          equals: planName, 
          mode: 'insensitive' 
        } 
      }
    });

    // If plan doesn't exist, use Essential as fallback
    if (!plan) {
      plan = await this.prisma.plan.findFirst({
        where: { name: { contains: 'Essential', mode: 'insensitive' } }
      });
    }

    // Create tenant and admin user in a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Create tenant
      const tenant = await tx.tenant.create({
        data: {
          name: data.organizationName,
          subdomain: data.subdomain,
          planId: plan?.id,
          isActive: true,
          trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days trial
        }
      });

      // Hash password
      const passwordHash = await bcrypt.hash(data.password, 10);

      // Create admin user
      const user = await tx.user.create({
        data: {
          email: data.email,
          passwordHash,
          role: 'ORG_ADMIN',
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
        }
      });

      // Link user to tenant
      await tx.userTenant.create({
        data: {
          userId: user.id,
          tenantId: tenant.id,
        }
      });

      return { tenant, user };
    });

    // Generate login tokens
    const tokens = await this.login({
      id: result.user.id,
      email: result.user.email,
      role: result.user.role,
    });

    return {
      success: true,
      tenantId: result.tenant.id,
      userId: result.user.id,
      subdomain: result.tenant.subdomain,
      tenantUrl: `https://${result.tenant.subdomain}.smartequiz.com`,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    };
  }
}
