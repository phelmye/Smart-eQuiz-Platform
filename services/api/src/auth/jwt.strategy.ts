import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    });
  }

  async validate(payload: any) {
    // Get user's first tenant (for multi-tenant support)
    const userTenant = await this.prisma.userTenant.findFirst({
      where: { userId: payload.sub },
      include: { tenant: true },
    });
    
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      tenantId: userTenant?.tenantId || 'default',
      tenant: userTenant?.tenant,
    };
  }
}
