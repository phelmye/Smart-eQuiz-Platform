import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { join } from 'path';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TournamentsModule } from './tournaments/tournaments.module';
import { QuestionsModule } from './questions/questions.module';
import { PracticeModule } from './practice/practice.module';
import { MatchesModule } from './matches/matches.module';
import { MarketingModule } from './marketing/marketing.module';
import { MediaModule } from './media/media.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AuditModule } from './audit/audit.module';
import { ChatModule } from './chat/chat.module';
import { TenantMiddleware } from './common/tenant.middleware';
import { PrismaModule } from './prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Rate limiting - Enterprise SaaS standard
    ThrottlerModule.forRoot([{
      ttl: 60000,       // Time window in milliseconds (60 seconds)
      limit: 100,       // Max 100 requests per minute (global default)
    }]),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    TournamentsModule,
    QuestionsModule,
    PracticeModule,
    MatchesModule,
    MarketingModule,
    MediaModule,
    AnalyticsModule,
    AuditModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [
    // Apply rate limiting globally to all endpoints
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantMiddleware).forRoutes('*');
  }
}
