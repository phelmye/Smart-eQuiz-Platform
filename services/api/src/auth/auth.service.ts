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
}
