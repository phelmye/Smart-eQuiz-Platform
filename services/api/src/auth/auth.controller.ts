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
    // set refresh token as httpOnly cookie
    res.cookie('refresh_token', tokens.refresh_token, { httpOnly: true, sameSite: 'lax' });
    // Return refresh token in body only when explicitly enabled for dev/test flows
    if (process.env.RETURN_REFRESH_IN_BODY === 'true') {
      return { access_token: tokens.access_token, refresh_token: tokens.refresh_token };
    }
    return { access_token: tokens.access_token };
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
