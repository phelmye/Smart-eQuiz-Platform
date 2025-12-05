# Security Hardening Guide - Implementation

**Smart eQuiz Platform**  
**Guide Version:** 1.0  
**Target:** Production Deployment  
**Estimated Time:** 14-18 hours

---

## Table of Contents

1. [Critical Fixes (4-6 hours)](#critical-fixes)
2. [High Priority Enhancements (10-12 hours)](#high-priority-enhancements)
3. [Configuration Hardening](#configuration-hardening)
4. [Security Testing](#security-testing)
5. [Production Deployment Checklist](#production-deployment-checklist)

---

## Critical Fixes

### 1. Rate Limiting Implementation (2 hours)

#### Step 1: Install Dependencies

```powershell
cd services/api
pnpm add @nestjs/throttler
```

#### Step 2: Configure ThrottlerModule

**File:** `services/api/src/app.module.ts`

```typescript
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    // Global rate limiting
    ThrottlerModule.forRoot({
      ttl: 60,      // Time window (seconds)
      limit: 100,   // Max requests per window
    }),
    
    // ... other imports
  ],
  providers: [
    // Apply rate limiting globally
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
```

#### Step 3: Configure Auth-Specific Rate Limiting

**File:** `services/api/src/auth/auth.controller.ts`

```typescript
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Throttle(5, 300)  // 5 attempts per 5 minutes
  @ApiOperation({ summary: 'User login' })
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    // ... existing login logic
  }

  @Post('refresh')
  @Throttle(10, 60)  // 10 refreshes per minute
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    // ... existing refresh logic
  }
}
```

#### Step 4: Add Custom Rate Limit Messages

**File:** `services/api/src/common/filters/throttler-exception.filter.ts` (NEW)

```typescript
import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { ThrottlerException } from '@nestjs/throttler';

@Catch(ThrottlerException)
export class ThrottlerExceptionFilter implements ExceptionFilter {
  catch(exception: ThrottlerException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    response.status(429).json({
      statusCode: 429,
      message: 'Too many requests. Please try again later.',
      error: 'Rate Limit Exceeded',
    });
  }
}
```

**Update:** `services/api/src/main.ts`

```typescript
import { ThrottlerExceptionFilter } from './common/filters/throttler-exception.filter';

app.useGlobalFilters(new ThrottlerExceptionFilter());
```

#### Step 5: Environment Configuration

**File:** `services/api/.env.production`

```bash
# Rate Limiting
RATE_LIMIT_TTL=60                 # Time window (seconds)
RATE_LIMIT_MAX=100                # Max requests per window
RATE_LIMIT_AUTH_TTL=300           # Auth window (5 minutes)
RATE_LIMIT_AUTH_MAX=5             # Max login attempts
```

#### Step 6: Test Rate Limiting

```powershell
# Test login rate limit (should fail after 5 attempts)
for ($i=1; $i -le 10; $i++) {
  curl -X POST http://localhost:3001/api/auth/login `
    -H "Content-Type: application/json" `
    -d '{"email":"wrong@example.com","password":"wrong"}'
}
```

**Expected:** 429 Too Many Requests after 5th attempt

---

### 2. CSRF Protection (1 hour)

#### Option A: SameSite Cookie Attribute (RECOMMENDED - Already Implemented)

**File:** `services/api/src/auth/auth.controller.ts`

```typescript
// Update cookie configuration
res.cookie('refresh_token', tokens.refresh_token, {
  httpOnly: true,
  sameSite: 'strict',  // Changed from 'lax' to 'strict'
  secure: process.env.NODE_ENV === 'production',  // HTTPS only in production
  maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days
});
```

**Verification:**
- Login to app
- Open DevTools → Application → Cookies
- Verify `refresh_token` has `SameSite=Strict` and `Secure` flags

#### Option B: CSRF Token Middleware (Alternative for complex flows)

```powershell
cd services/api
pnpm add csurf cookie-parser
```

**File:** `services/api/src/main.ts`

```typescript
import * as csurf from 'csurf';
import * as cookieParser from 'cookie-parser';

app.use(cookieParser());
app.use(csurf({ cookie: { httpOnly: true, sameSite: 'strict' } }));

// Add CSRF token to all responses
app.use((req, res, next) => {
  res.cookie('XSRF-TOKEN', req.csrfToken());
  next();
});
```

**Frontend Update:** `apps/tenant-app/src/lib/apiClient.ts`

```typescript
// Add CSRF token to all requests
axios.interceptors.request.use((config) => {
  const csrfToken = getCookie('XSRF-TOKEN');
  if (csrfToken) {
    config.headers['X-XSRF-TOKEN'] = csrfToken;
  }
  return config;
});
```

**Recommendation:** Use **Option A (SameSite=strict)** for simplicity.

---

### 3. CORS Configuration Update (30 minutes)

**File:** `services/api/src/main.ts`

```typescript
// Replace existing CORS configuration
app.enableCors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      'https://www.smartequiz.com',          // Marketing site
      'https://smartequiz.com',              // Marketing site (no www)
      'https://admin.smartequiz.com',        // Platform admin
      /^https:\/\/[a-z0-9-]+\.smartequiz\.com$/, // Tenant subdomains
    ];

    // Allow localhost in development
    if (process.env.NODE_ENV !== 'production') {
      allowedOrigins.push('http://localhost:3000');  // Marketing site dev
      allowedOrigins.push('http://localhost:5173');  // Platform admin dev
      allowedOrigins.push('http://localhost:5174');  // Tenant app dev
    }

    // Check if origin is allowed
    if (!origin) return callback(null, true);  // Allow non-browser requests
    
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed instanceof RegExp) return allowed.test(origin);
      return allowed === origin;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-Id', 'X-XSRF-TOKEN'],
  maxAge: 86400, // 24 hours
});
```

**Test CORS:**

```powershell
# Should succeed (allowed origin)
curl -X OPTIONS http://localhost:3001/api/auth/login `
  -H "Origin: https://www.smartequiz.com" `
  -H "Access-Control-Request-Method: POST" `
  -v

# Should fail (disallowed origin)
curl -X OPTIONS http://localhost:3001/api/auth/login `
  -H "Origin: https://malicious.com" `
  -H "Access-Control-Request-Method: POST" `
  -v
```

---

### 4. Sentry Error Tracking Integration (1 hour)

#### Step 1: Install Sentry SDK

```powershell
cd services/api
pnpm add @sentry/node @sentry/profiling-node
```

#### Step 2: Configure Sentry

**File:** `services/api/src/main.ts`

```typescript
import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';

async function bootstrap() {
  // Initialize Sentry FIRST
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.SENTRY_ENVIRONMENT || 'production',
      release: process.env.SENTRY_RELEASE || 'smart-equiz-api@2.0.0',
      integrations: [
        new ProfilingIntegration(),
      ],
      tracesSampleRate: 1.0,  // 100% of transactions (adjust for production)
      profilesSampleRate: 1.0,  // 100% of profiles
    });
  }

  const app = await NestFactory.create(AppModule);
  
  // ... rest of bootstrap
}
```

#### Step 3: Add Sentry Error Handler

**File:** `services/api/src/common/filters/sentry-exception.filter.ts` (NEW)

```typescript
import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import * as Sentry from '@sentry/node';

@Catch()
export class SentryExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    // Capture exception in Sentry
    Sentry.captureException(exception);
    
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.getStatus?.() || 500;

    response.status(status).json({
      statusCode: status,
      message: exception.message || 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
}
```

**Update:** `services/api/src/main.ts`

```typescript
import { SentryExceptionFilter } from './common/filters/sentry-exception.filter';

app.useGlobalFilters(new SentryExceptionFilter());
```

#### Step 4: Configure Environment Variables

**File:** `.env.production`

```bash
# Sentry Error Tracking
SENTRY_DSN="https://xxxxx@o123456.ingest.sentry.io/123456"
SENTRY_ENVIRONMENT="production"
SENTRY_RELEASE="smart-equiz-api@2.0.0"
```

#### Step 5: Test Sentry

**Create test endpoint:** `services/api/src/app.controller.ts`

```typescript
@Get('test-error')
testError() {
  throw new Error('Test Sentry integration');
}
```

**Trigger error:**

```powershell
curl http://localhost:3001/api/test-error
```

**Verify:** Check Sentry dashboard for captured error

**Remove test endpoint after verification**

---

### 5. Secure Cookie Flags (15 minutes)

**File:** `services/api/src/auth/auth.controller.ts`

```typescript
// Update all cookie configurations
res.cookie('refresh_token', tokens.refresh_token, {
  httpOnly: true,                                 // Prevent JavaScript access
  sameSite: 'strict',                             // CSRF protection
  secure: process.env.NODE_ENV === 'production',  // HTTPS only in production
  maxAge: 7 * 24 * 60 * 60 * 1000,               // 7 days
  domain: process.env.COOKIE_DOMAIN,              // .smartequiz.com (for subdomains)
});
```

**Environment Configuration:**

```bash
# .env.production
COOKIE_DOMAIN=".smartequiz.com"  # Allows cookies across subdomains
```

**Verification:**

```powershell
# Login and check cookie
curl -X POST http://localhost:3001/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"admin@example.com","password":"password123"}' `
  -c cookies.txt

# Check cookie file
cat cookies.txt
# Should show: HttpOnly, Secure, SameSite=Strict
```

---

### 6. Generate Strong JWT Secrets (15 minutes)

#### Step 1: Generate Secure Secrets

```powershell
# Generate JWT secret (64 characters)
$jwtSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object {[char]$_})
Write-Host "JWT_SECRET=$jwtSecret"

# Generate encryption key (32 bytes = 64 hex chars)
$encryptionKey = -join ((48..57) + (65..70) | Get-Random -Count 64 | ForEach-Object {[char]$_})
Write-Host "ENCRYPTION_KEY=$encryptionKey"

# Generate database encryption key
$dbEncryptionKey = -join ((48..57) + (65..70) | Get-Random -Count 64 | ForEach-Object {[char]$_})
Write-Host "DATABASE_ENCRYPTION_KEY=$dbEncryptionKey"
```

#### Step 2: Update Environment Variables

**DO NOT COMMIT THESE VALUES TO GIT**

**Vercel (Frontend Apps):**
```powershell
# Set in Vercel dashboard → Settings → Environment Variables
# No JWT secrets needed for frontend
```

**Railway (Backend API):**
```powershell
railway variables set JWT_SECRET="<generated_value>"
railway variables set ENCRYPTION_KEY="<generated_value>"
railway variables set DATABASE_ENCRYPTION_KEY="<generated_value>"
```

#### Step 3: Enforce Required Secrets

**File:** `services/api/src/main.ts`

```typescript
async function bootstrap() {
  // Validate required secrets
  const requiredSecrets = ['JWT_SECRET', 'DATABASE_URL'];
  
  for (const secret of requiredSecrets) {
    if (!process.env[secret]) {
      throw new Error(`FATAL: ${secret} environment variable is required`);
    }
    
    // Check JWT_SECRET strength
    if (secret === 'JWT_SECRET' && process.env[secret].length < 32) {
      throw new Error('FATAL: JWT_SECRET must be at least 32 characters');
    }
  }

  // ... rest of bootstrap
}
```

---

## High Priority Enhancements

### 7. Backend Audit Logging (4 hours)

#### Step 1: Create Audit Log Schema

**File:** `services/api/prisma/schema.prisma`

```prisma
model AuditLog {
  id          String   @id @default(uuid())
  tenantId    String
  userId      String?
  action      String   // "user.login", "user.logout", "permission.changed"
  resource    String?  // "User", "Tournament", "Question"
  resourceId  String?
  details     Json?    // Additional context
  ipAddress   String?
  userAgent   String?
  timestamp   DateTime @default(now())
  
  tenant      Tenant   @relation(fields: [tenantId], references: [id])
  user        User?    @relation(fields: [userId], references: [id])
  
  @@index([tenantId, timestamp])
  @@index([userId])
  @@index([action])
}
```

#### Step 2: Create Migration

```powershell
cd services/api
npx prisma migrate dev --name add_audit_logs
```

#### Step 3: Create Audit Service

**File:** `services/api/src/audit/audit.service.ts` (NEW)

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(params: {
    tenantId: string;
    userId?: string;
    action: string;
    resource?: string;
    resourceId?: string;
    details?: any;
    ipAddress?: string;
    userAgent?: string;
  }) {
    await this.prisma.auditLog.create({
      data: {
        ...params,
        timestamp: new Date(),
      },
    });
  }

  async getLogsForTenant(tenantId: string, limit = 100) {
    return this.prisma.auditLog.findMany({
      where: { tenantId },
      orderBy: { timestamp: 'desc' },
      take: limit,
      include: {
        user: {
          select: { email: true, name: true },
        },
      },
    });
  }
}
```

#### Step 4: Create Audit Module

**File:** `services/api/src/audit/audit.module.ts` (NEW)

```typescript
import { Module } from '@nestjs/common';
import { AuditService } from './audit.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
```

#### Step 5: Log Authentication Events

**File:** `services/api/src/auth/auth.service.ts`

```typescript
import { AuditService } from '../audit/audit.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly auditService: AuditService,  // NEW
  ) {}

  async login(user: any, req: any): Promise<Tokens> {
    // ... existing login logic
    
    // Log successful login
    await this.auditService.log({
      tenantId: userTenant.tenantId,
      userId: user.id,
      action: 'auth.login',
      resource: 'User',
      resourceId: user.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return tokens;
  }

  async logout(userId: string, req: any) {
    // ... existing logout logic
    
    // Log logout
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const userTenant = await this.prisma.userTenant.findFirst({ where: { userId } });
    
    await this.auditService.log({
      tenantId: userTenant.tenantId,
      userId: userId,
      action: 'auth.logout',
      resource: 'User',
      resourceId: userId,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }
}
```

#### Step 6: Log Failed Login Attempts

**File:** `services/api/src/auth/auth.controller.ts`

```typescript
@Post('login')
async login(@Body() loginDto: LoginDto, @Req() req: Request) {
  try {
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    
    if (!user) {
      // Log failed attempt
      await this.auditService.log({
        tenantId: 'system',  // Unknown tenant for failed login
        action: 'auth.login.failed',
        details: { email: loginDto.email, reason: 'invalid_credentials' },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });
      
      throw new UnauthorizedException('Invalid credentials');
    }
    
    return this.authService.login(user, req);
  } catch (error) {
    throw error;
  }
}
```

#### Step 7: Create Audit Log Endpoint

**File:** `services/api/src/audit/audit.controller.ts` (NEW)

```typescript
import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AuditService } from './audit.service';

@Controller('audit')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('logs')
  @Roles('SUPER_ADMIN', 'ORG_ADMIN')
  async getLogs(@Req() req: any, @Query('limit') limit?: number) {
    const tenantId = req.user.role === 'SUPER_ADMIN' ? req.query.tenantId : req.user.tenantId;
    return this.auditService.getLogsForTenant(tenantId, limit || 100);
  }
}
```

#### Step 8: Update AppModule

**File:** `services/api/src/app.module.ts`

```typescript
import { AuditModule } from './audit/audit.module';

@Module({
  imports: [
    AuditModule,
    // ... other imports
  ],
})
export class AppModule {}
```

---

### 8. Password Strength Requirements (2 hours)

#### Step 1: Install Validator

```powershell
cd services/api
pnpm add class-validator class-transformer
```

#### Step 2: Create Password Validation Decorator

**File:** `services/api/src/common/validators/password.validator.ts` (NEW)

```typescript
import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isStrongPassword',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') return false;
          
          // Minimum 8 characters
          if (value.length < 8) return false;
          
          // At least one uppercase letter
          if (!/[A-Z]/.test(value)) return false;
          
          // At least one lowercase letter
          if (!/[a-z]/.test(value)) return false;
          
          // At least one number
          if (!/[0-9]/.test(value)) return false;
          
          // At least one special character
          if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) return false;
          
          return true;
        },
        defaultMessage(args: ValidationArguments) {
          return 'Password must be at least 8 characters and contain uppercase, lowercase, number, and special character';
        },
      },
    });
  };
}
```

#### Step 3: Update User DTO

**File:** `services/api/src/users/dto/create-user.dto.ts`

```typescript
import { IsEmail, IsString, MinLength } from 'class-validator';
import { IsStrongPassword } from '../../common/validators/password.validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @IsStrongPassword()
  password: string;
  
  // ... other fields
}
```

#### Step 4: Enable Validation Globally

**File:** `services/api/src/main.ts`

```typescript
import { ValidationPipe } from '@nestjs/common';

app.useGlobalPipes(new ValidationPipe({
  whitelist: true,        // Strip unknown properties
  forbidNonWhitelisted: true,  // Throw error on unknown properties
  transform: true,        // Auto-transform payloads
}));
```

#### Step 5: Check Against Common Passwords

**File:** `services/api/src/common/validators/common-passwords.ts` (NEW)

```typescript
// Top 100 most common passwords
export const COMMON_PASSWORDS = [
  'password', 'password123', '123456', '12345678', 'qwerty',
  'abc123', 'monkey', '1234567', 'letmein', 'trustno1',
  'dragon', 'baseball', 'iloveyou', 'master', 'sunshine',
  'ashley', 'bailey', 'passw0rd', 'shadow', '123123',
  // ... add more
];

export function isCommonPassword(password: string): boolean {
  return COMMON_PASSWORDS.includes(password.toLowerCase());
}
```

**Update validator:**

```typescript
export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      // ... existing decorator config
      validator: {
        validate(value: any, args: ValidationArguments) {
          // ... existing validations
          
          // Check against common passwords
          if (isCommonPassword(value)) return false;
          
          return true;
        },
        defaultMessage(args: ValidationArguments) {
          return 'Password is too common or weak. Choose a stronger password.';
        },
      },
    });
  };
}
```

#### Step 6: Implement Password History (Prevent Reuse)

**File:** `services/api/prisma/schema.prisma`

```prisma
model PasswordHistory {
  id        String   @id @default(uuid())
  userId    String
  hash      String
  createdAt DateTime @default(now())
  
  user      User     @relation(fields: [userId], references: [id])
  
  @@index([userId, createdAt])
}

model User {
  // ... existing fields
  passwordHistory PasswordHistory[]
}
```

**Create migration:**

```powershell
npx prisma migrate dev --name add_password_history
```

**Update password change logic:**

```typescript
async changePassword(userId: string, newPassword: string) {
  // Get last 5 password hashes
  const history = await this.prisma.passwordHistory.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  // Check if new password matches any previous passwords
  for (const entry of history) {
    const matches = await bcrypt.compare(newPassword, entry.hash);
    if (matches) {
      throw new BadRequestException('Cannot reuse previous passwords');
    }
  }

  // Hash new password
  const newHash = await bcrypt.hash(newPassword, 10);

  // Update user password
  await this.prisma.user.update({
    where: { id: userId },
    data: { passwordHash: newHash },
  });

  // Add to history
  await this.prisma.passwordHistory.create({
    data: {
      userId,
      hash: newHash,
    },
  });

  // Keep only last 5 entries
  const allHistory = await this.prisma.passwordHistory.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  if (allHistory.length > 5) {
    const toDelete = allHistory.slice(5).map(h => h.id);
    await this.prisma.passwordHistory.deleteMany({
      where: { id: { in: toDelete } },
    });
  }
}
```

---

### 9. Field-Level Encryption (4 hours)

#### Step 1: Create Encryption Utility

**File:** `services/api/src/common/utils/encryption.util.ts` (NEW)

```typescript
import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits

export class EncryptionUtil {
  private static getKey(): Buffer {
    const key = process.env.ENCRYPTION_KEY;
    if (!key) {
      throw new Error('ENCRYPTION_KEY environment variable is required');
    }
    return Buffer.from(key, 'hex');
  }

  static encrypt(text: string): string {
    const key = this.getKey();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    // Format: iv:authTag:encryptedData
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  static decrypt(encryptedText: string): string {
    const key = this.getKey();
    const parts = encryptedText.split(':');
    
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted text format');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}
```

#### Step 2: Create Encrypted Field Decorator

**File:** `services/api/src/common/decorators/encrypted.decorator.ts` (NEW)

```typescript
import { Transform } from 'class-transformer';
import { EncryptionUtil } from '../utils/encryption.util';

export function Encrypted() {
  return Transform(({ value, type }) => {
    // Encrypt when converting to plain object (before DB save)
    if (type === 1) {  // toPlainOnly
      return EncryptionUtil.encrypt(value);
    }
    
    // Decrypt when converting from plain object (after DB load)
    if (type === 0) {  // toClassOnly
      return EncryptionUtil.decrypt(value);
    }
    
    return value;
  });
}
```

#### Step 3: Use Encryption in Entities

**Example:** Encrypt API keys stored in database

**File:** `services/api/src/integrations/entities/api-key.entity.ts`

```typescript
import { Encrypted } from '../../common/decorators/encrypted.decorator';

export class ApiKey {
  id: string;
  name: string;
  
  @Encrypted()
  secret: string;  // Encrypted in database
  
  createdAt: Date;
  updatedAt: Date;
}
```

#### Step 4: Test Encryption

```typescript
// Test encryption
import { EncryptionUtil } from './common/utils/encryption.util';

const original = 'sk_live_secret_api_key_12345';
const encrypted = EncryptionUtil.encrypt(original);
const decrypted = EncryptionUtil.decrypt(encrypted);

console.log('Original:', original);
console.log('Encrypted:', encrypted);
console.log('Decrypted:', decrypted);
console.log('Match:', original === decrypted);
```

---

## Configuration Hardening

### 10. Helmet.js Security Headers

**File:** `services/api/src/main.ts`

```typescript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https://api.smartequiz.com'],
      fontSrc: ["'self'", 'https:', 'data:'],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));
```

---

### 11. Environment Variable Validation

**File:** `services/api/src/config/env.validation.ts` (NEW)

```typescript
import { plainToClass } from 'class-transformer';
import { IsString, IsNumber, IsUrl, validateSync, MinLength } from 'class-validator';

class EnvironmentVariables {
  @IsString()
  @MinLength(32)
  JWT_SECRET: string;

  @IsUrl({ require_tld: false })
  DATABASE_URL: string;

  @IsString()
  @MinLength(32)
  ENCRYPTION_KEY: string;

  @IsNumber()
  PORT: number = 3001;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToClass(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(`Environment validation failed:\n${errors.toString()}`);
  }

  return validatedConfig;
}
```

**Update:** `services/api/src/app.module.ts`

```typescript
import { ConfigModule } from '@nestjs/config';
import { validate } from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,  // Validate environment on startup
    }),
  ],
})
export class AppModule {}
```

---

## Security Testing

### 12. Automated Security Tests

**File:** `services/api/test/security/tenant-isolation.spec.ts` (NEW)

```typescript
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import * as request from 'supertest';

describe('Tenant Isolation Security Tests', () => {
  let app;
  let prisma: PrismaService;
  let tenant1Token: string;
  let tenant2Token: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
    
    prisma = moduleRef.get<PrismaService>(PrismaService);

    // Login as Tenant 1 user
    const tenant1Login = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'tenant1@example.com', password: 'password123' });
    tenant1Token = tenant1Login.body.access_token;

    // Login as Tenant 2 user
    const tenant2Login = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'tenant2@example.com', password: 'password123' });
    tenant2Token = tenant2Login.body.access_token;
  });

  it('should not allow Tenant 1 to access Tenant 2 data', async () => {
    // Get Tenant 2's tournament ID
    const tenant2Tournaments = await prisma.tournament.findMany({
      where: { tenantId: 'tenant2' },
      take: 1,
    });

    if (tenant2Tournaments.length === 0) {
      throw new Error('No tournaments found for Tenant 2');
    }

    const tenant2TournamentId = tenant2Tournaments[0].id;

    // Attempt to access Tenant 2's tournament as Tenant 1
    const response = await request(app.getHttpServer())
      .get(`/api/tournaments/${tenant2TournamentId}`)
      .set('Authorization', `Bearer ${tenant1Token}`)
      .expect(403);  // Should be forbidden

    expect(response.body.message).toContain('Forbidden');
  });

  it('should allow Tenant 1 to access only their own data', async () => {
    const tenant1Tournaments = await prisma.tournament.findMany({
      where: { tenantId: 'tenant1' },
      take: 1,
    });

    const tenant1TournamentId = tenant1Tournaments[0].id;

    const response = await request(app.getHttpServer())
      .get(`/api/tournaments/${tenant1TournamentId}`)
      .set('Authorization', `Bearer ${tenant1Token}`)
      .expect(200);  // Should succeed

    expect(response.body.id).toBe(tenant1TournamentId);
  });

  afterAll(async () => {
    await app.close();
  });
});
```

**Run tests:**

```powershell
cd services/api
pnpm test -- tenant-isolation.spec.ts
```

---

## Production Deployment Checklist

### Pre-Deployment Security Audit

- [ ] **Rate limiting implemented** (5 login attempts / 5 min)
- [ ] **CSRF protection enabled** (SameSite=strict or csurf)
- [ ] **CORS configured** for all production domains
- [ ] **Sentry error tracking** integrated and tested
- [ ] **Secure cookies** (httpOnly, secure, sameSite)
- [ ] **Strong JWT secrets** generated (64+ characters)
- [ ] **Audit logging** implemented for auth events
- [ ] **Password strength** requirements enforced
- [ ] **Field-level encryption** for sensitive data
- [ ] **Helmet.js** security headers enabled
- [ ] **Environment validation** on startup

### Infrastructure Security

- [ ] **HTTPS/TLS** enforced (Vercel auto-enabled)
- [ ] **Database SSL** required (Supabase/Neon/Railway)
- [ ] **Redis SSL/TLS** enabled (Upstash auto-enabled)
- [ ] **Firewall rules** configured (allow only HTTPS)
- [ ] **DDoS protection** enabled (Vercel/Cloudflare)
- [ ] **Automated backups** configured (daily, 30-day retention)

### Secret Management

- [ ] **JWT_SECRET** set in Railway environment
- [ ] **ENCRYPTION_KEY** set in Railway environment
- [ ] **DATABASE_URL** set with real credentials
- [ ] **REDIS_URL** set with real credentials
- [ ] **Stripe keys** set (live mode)
- [ ] **SendGrid API key** set
- [ ] **Sentry DSN** set
- [ ] **Default/example secrets removed** from codebase

### Monitoring

- [ ] **Sentry alerts** configured (email/Slack)
- [ ] **Uptime monitoring** configured (UptimeRobot)
- [ ] **Database monitoring** enabled (platform dashboard)
- [ ] **API performance** monitored (Sentry APM)
- [ ] **Log retention** configured (30 days minimum)

### Testing

- [ ] **Tenant isolation tests** passing
- [ ] **Permission boundary tests** passing
- [ ] **Rate limiting** verified (manual test)
- [ ] **CSRF protection** verified (manual test)
- [ ] **Password validation** verified (unit tests)
- [ ] **Encryption/decryption** verified (unit tests)

### Documentation

- [ ] **Security policy** documented
- [ ] **Incident response plan** created
- [ ] **Secret rotation schedule** defined
- [ ] **Security audit schedule** defined (quarterly)
- [ ] **Compliance requirements** documented (GDPR, etc.)

---

## Estimated Timeline

### Critical Fixes (4-6 hours)
- **Rate Limiting:** 2 hours
- **CSRF Protection:** 1 hour
- **CORS Configuration:** 30 minutes
- **Sentry Integration:** 1 hour
- **Secure Cookies:** 15 minutes
- **Generate Secrets:** 15 minutes

### High Priority (10-12 hours)
- **Audit Logging:** 4 hours
- **Password Strength:** 2 hours
- **Field Encryption:** 4 hours
- **Helmet.js:** 1 hour
- **Env Validation:** 1 hour

### Total Estimated Time: 14-18 hours

---

## Conclusion

Following this guide will harden the Smart eQuiz Platform to production-ready security standards. Prioritize critical fixes (4-6 hours) before launch, then implement high-priority enhancements within the first week of production.

**Security is an ongoing process.** Schedule quarterly security audits and keep dependencies updated.
