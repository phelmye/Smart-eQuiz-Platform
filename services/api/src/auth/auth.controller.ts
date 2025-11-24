import { Body, Controller, Post, Res, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response, Request } from 'express';
import { Throttle } from '@nestjs/throttler';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBody,
  ApiCookieAuth,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse 
} from '@nestjs/swagger';
import { LoginDto, LoginResponseDto } from './dto/login.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Stricter rate limit for login endpoint (5 requests per minute per IP)
  @Throttle(5, 60)
  @Post('login')
  @ApiOperation({ 
    summary: 'User login',
    description: `
Authenticates a user with email and password credentials.

**Returns:**
- JWT access token (15 min expiry) in response body
- JWT refresh token (7 days expiry) in HTTP-only cookie

**Multi-Tenancy:**
- Users are automatically scoped to their tenant
- Super admins have access to all tenants

**Security:**
- Failed login attempts are rate-limited (5 attempts per minute)
- Passwords are hashed with bcrypt
- Refresh tokens are stored securely in database
    `
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Login successful',
    type: LoginResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Missing required fields' })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
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
  @ApiOperation({ 
    summary: 'Refresh access token',
    description: `
Generates a new access token using a valid refresh token from cookies.

**Authentication:**
- Requires refresh token in HTTP-only cookie
- No Authorization header needed

**Returns:**
- New JWT access token (15 min expiry)
- New JWT refresh token (7 days expiry) in cookie

**Security:**
- Refresh token rotation for enhanced security
- Old refresh token is invalidated after use
    `
  })
  @ApiCookieAuth('refresh_token')
  @ApiResponse({ 
    status: 201, 
    description: 'Token refreshed successfully',
    schema: {
      properties: {
        access_token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
      }
    }
  })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing refresh token' })
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
  @ApiOperation({ 
    summary: 'User logout',
    description: `
Logs out the current user by invalidating their refresh token.

**Actions:**
- Clears refresh token cookie
- Invalidates refresh token in database
- Client should discard access token

**Note:**
- Access tokens remain valid until expiry (15 minutes)
- For immediate access revocation, implement token blacklist
    `
  })
  @ApiCookieAuth('refresh_token')
  @ApiResponse({ 
    status: 201, 
    description: 'Logout successful',
    schema: {
      properties: {
        ok: { type: 'boolean', example: true }
      }
    }
  })
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
