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
  ApiUnauthorizedResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { LoginDto, LoginResponseDto } from './dto/login.dto';
import { RegisterDto, RegisterResponseDto } from './dto/register.dto';
import { AuditService, AuditAction } from '../audit/audit.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly auditService: AuditService,
  ) {}

  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('register')
  @ApiOperation({ 
    summary: 'Register new tenant and admin user',
    description: `
Creates a new tenant organization and admin user account.

**Returns:**
- New tenant with subdomain
- Admin user account
- JWT tokens for immediate login

**Trial:**
- 14 days free trial automatically activated
- No credit card required

**Security:**
- Rate limited to 3 registrations per minute per IP
- Subdomain uniqueness enforced
- Email uniqueness enforced
    `
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Registration successful',
    type: RegisterResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiConflictResponse({ description: 'Subdomain or email already exists' })
  async register(
    @Body() body: RegisterDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    try {
      const result = await this.authService.register(body);
      
      // Set refresh token cookie
      res.cookie('refresh_token', result.refresh_token, { 
        httpOnly: true, 
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Log registration
      await this.auditService.logAuth(
        AuditAction.LOGIN, // Using LOGIN as proxy for registration success
        result.userId,
        result.tenantId,
        req.ip,
        req.headers['user-agent'],
        true,
        'New tenant registration',
      );

      // Return data without refresh_token in body
      return {
        success: result.success,
        tenantId: result.tenantId,
        userId: result.userId,
        subdomain: result.subdomain,
        tenantUrl: result.tenantUrl,
        access_token: result.access_token,
      };
    } catch (error) {
      // Log failed registration
      await this.auditService.logAuth(
        AuditAction.LOGIN_FAILED,
        body.email,
        undefined,
        req.ip,
        req.headers['user-agent'],
        false,
        `Registration failed: ${error.message}`,
      );

      if (error.message === 'Subdomain already taken') {
        return { error: 'subdomain_taken', message: 'This subdomain is already in use' };
      }
      if (error.message === 'Email already registered') {
        return { error: 'email_exists', message: 'This email is already registered' };
      }
      return { error: 'registration_failed', message: 'Registration failed. Please try again.' };
    }
  }

  // Stricter rate limit for login endpoint (5 requests per 60 seconds per IP)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
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
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    const user = await this.authService.validateUser(body.email, body.password);
    
    if (!user) {
      // Log failed login attempt
      await this.auditService.logAuth(
        AuditAction.LOGIN_FAILED,
        body.email, // Use email as identifier for failed attempts
        undefined,
        req.ip,
        req.headers['user-agent'],
        false,
        'Invalid credentials',
      );
      res.status(401);
      return { error: 'invalid_credentials', message: 'Invalid email or password' };
    }
    
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
    
    // Log successful login
    await this.auditService.logAuth(
      AuditAction.LOGIN,
      fullUser.id,
      userResponse.tenantId || undefined,
      req.ip,
      req.headers['user-agent'],
      true,
    );
    
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
