import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';

async function bootstrap() {
  // Initialize Sentry for error monitoring
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      integrations: [
        new ProfilingIntegration(),
      ],
      // Performance Monitoring
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      // Profiling
      profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    });
    console.log('✅ Sentry error monitoring initialized');
  } else {
    console.log('⚠️  Sentry DSN not configured - error monitoring disabled');
  }

  try {
    const app = await NestFactory.create(AppModule);
    app.use(cookieParser());
    app.setGlobalPrefix('api');
    
    // Enable global validation with class-validator
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }));
    
    // Enable CORS for frontend
    app.enableCors({
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true,
    });

    // Swagger/OpenAPI Configuration
    const config = new DocumentBuilder()
      .setTitle('Smart eQuiz Platform API')
      .setDescription(`
# Smart eQuiz Platform REST API Documentation

Multi-tenant SaaS platform for Bible quiz tournaments, practice sessions, and competitive championships.

## Features
- **Multi-Tenant Architecture**: Complete data isolation per organization
- **Role-Based Access Control**: 9 distinct roles with customizable permissions  
- **AI Question Generation**: Advanced AI for creating contextual Bible questions
- **Tournament Management**: Real-time competitive events with scoring
- **Practice Mode**: Unlimited practice with personalized difficulty adjustment
- **Analytics & Reporting**: Comprehensive metrics and insights
- **Payment Integration**: Stripe-powered subscription management
- **Referral System**: 3-tier participant referral tracking

## Authentication
All protected endpoints require a JWT token in the Authorization header:
\`\`\`
Authorization: Bearer <token>
\`\`\`

Obtain tokens via the \`/auth/login\` endpoint.

## Multi-Tenancy
Most endpoints require a valid \`tenantId\`. Super admins can access all tenants, 
while tenant-level users are automatically scoped to their organization.

## Rate Limiting
- Public endpoints: 100 requests/hour
- Authenticated endpoints: 1000 requests/hour
- Admin endpoints: Unlimited

## Error Codes
- **400**: Bad Request - Invalid parameters
- **401**: Unauthorized - Missing or invalid token
- **403**: Forbidden - Insufficient permissions
- **404**: Not Found - Resource doesn't exist
- **409**: Conflict - Duplicate resource
- **422**: Unprocessable Entity - Validation failed
- **429**: Too Many Requests - Rate limit exceeded
- **500**: Internal Server Error - Server-side issue
      `)
      .setVersion('2.0')
      .setContact(
        'Smart eQuiz Platform Support',
        'https://smartequiz.com/support',
        'support@smartequiz.com'
      )
      .setLicense('Proprietary', 'https://smartequiz.com/license')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'Authorization',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth'
      )
      .addTag('Authentication', 'Login, registration, token refresh, logout')
      .addTag('Tenants', 'Tenant CRUD, subscription management, branding')
      .addTag('Users', 'User management, profiles, roles, permissions')
      .addTag('Tournaments', 'Tournament creation, management, participation')
      .addTag('Questions', 'Question bank CRUD, categories, AI generation')
      .addTag('Practice', 'Practice sessions, progress tracking, analytics')
      .addTag('Teams', 'Team management, rosters, parishes')
      .addTag('Analytics', 'Metrics, reports, leaderboards')
      .addTag('Payments', 'Subscriptions, invoices, payment methods')
      .addTag('Media', 'File uploads, media library, asset management')
      .addTag('Marketing', 'Marketing content CMS, landing pages')
      .addTag('Referrals', 'Affiliate and participant referral tracking')
      .addTag('Notifications', 'Notification center, email templates')
      .addTag('Support', 'Help center, tickets, knowledge base')
      .addTag('Audit', 'Audit logs, security events')
      .addServer('http://localhost:3000', 'Development Server')
      .addServer('https://api-staging.smartequiz.com', 'Staging Server')
      .addServer('https://api.smartequiz.com', 'Production Server')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      customSiteTitle: 'Smart eQuiz API Documentation',
      customfavIcon: 'https://smartequiz.com/favicon.ico',
      customCss: `
        .swagger-ui .topbar { display: none }
        .swagger-ui .info .title { color: #2563eb; }
        .swagger-ui .scheme-container { background: #f8fafc; padding: 15px; border-radius: 5px; }
      `,
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        filter: true,
        showExtensions: true,
        showCommonExtensions: true,
        docExpansion: 'none',
        defaultModelsExpandDepth: 2,
        defaultModelExpandDepth: 2,
      },
    });
    
    const port = process.env.PORT || 3001;
    console.log(`📚 API Documentation available at http://localhost:${port}/api/docs`);
    
    await app.listen(port);
    console.log(`API server listening on http://localhost:${port}`);
    
    // Keep process alive and handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('Received SIGINT, shutting down gracefully...');
      await app.close();
      process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
      console.log('Received SIGTERM, shutting down gracefully...');
      await app.close();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
}

// Catch unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Catch uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

bootstrap().catch(err => {
  console.error('Bootstrap failed:', err);
  process.exit(1);
});
