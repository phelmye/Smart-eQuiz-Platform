import { Body, Controller, Post, Res, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response, Request } from 'express';

class LoginDto {
  email: string;
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: LoginDto, @Res({ passthrough: true }) res: Response) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) return { error: 'invalid_credentials' };
    const tokens = await this.authService.login(user);
    
    // Fetch full user details for response
    const fullUser = await this.authService.getUserById(user.id);
    
    // set refresh token as httpOnly cookie
    res.cookie('refresh_token', tokens.refresh_token, { httpOnly: true, sameSite: 'lax' });
    
    // Return user info along with access token
    const userResponse = {
      id: fullUser.id,
      email: fullUser.email,
      username: fullUser.email.split('@')[0], // Use email prefix as username
      role: fullUser.role,
      tenantId: null, // Will need to fetch from UserTenant relation if needed
      totalXp: 0, // XP is tracked in PracticeProgress, not User model
      currentLevel: 1, // Level calculated from practice progress
      createdAt: fullUser.createdAt,
    };
    
    // Return refresh token in body only when explicitly enabled for dev/test flows
    if (process.env.RETURN_REFRESH_IN_BODY === 'true') {
      return { access_token: tokens.access_token, refresh_token: tokens.refresh_token, user: userResponse };
    }
    return { access_token: tokens.access_token, user: userResponse };
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    // expect cookie-parser to populate req.cookies
    const rt = req.cookies && req.cookies['refresh_token'];
    if (!rt) return { error: 'no_refresh' };
    const tokens = await this.authService.refresh(rt);
    if (!tokens) return { error: 'invalid_refresh' };
    res.cookie('refresh_token', tokens.refresh_token, { httpOnly: true, sameSite: 'lax' });
    return { access_token: tokens.access_token };
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const rt = req.cookies && req.cookies['refresh_token'];
    if (rt) {
      // best-effort: try to find the user via refresh token and clear their stored value
      const maybe = await this.authService.refresh(rt);
      if (maybe && maybe.userId) {
        await this.authService.clearRefreshToken(maybe.userId).catch(() => {});
      }
    }
    res.clearCookie('refresh_token');
    return { ok: true };
  }
}
