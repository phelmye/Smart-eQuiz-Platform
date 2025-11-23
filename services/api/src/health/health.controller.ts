import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';

interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
  services: {
    database: 'up' | 'down';
    redis: 'up' | 'down';
  };
  performance: {
    responseTime: number;
    memoryUsage: {
      heapUsed: number;
      heapTotal: number;
      rss: number;
      external: number;
    };
  };
}

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({
    summary: 'Health check endpoint',
    description: 'Returns the health status of the API and its dependencies',
  })
  @ApiResponse({
    status: 200,
    description: 'Service is healthy',
  })
  @ApiResponse({
    status: 503,
    description: 'Service is unhealthy',
  })
  async check(): Promise<HealthStatus> {
    const startTime = Date.now();

    // Check database connection
    const databaseHealthy = await this.checkDatabase();

    // Check Redis connection (if configured)
    const redisHealthy = await this.checkRedis();

    // Calculate response time
    const responseTime = Date.now() - startTime;

    // Get memory usage
    const memoryUsage = process.memoryUsage();

    // Determine overall status
    let status: 'healthy' | 'unhealthy' | 'degraded';
    if (databaseHealthy && redisHealthy) {
      status = 'healthy';
    } else if (databaseHealthy || redisHealthy) {
      status = 'degraded';
    } else {
      status = 'unhealthy';
    }

    return {
      status,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: '2.0.0',
      services: {
        database: databaseHealthy ? 'up' : 'down',
        redis: redisHealthy ? 'up' : 'down',
      },
      performance: {
        responseTime,
        memoryUsage: {
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
          rss: Math.round(memoryUsage.rss / 1024 / 1024),
          external: Math.round(memoryUsage.external / 1024 / 1024),
        },
      },
    };
  }

  @Get('live')
  @ApiOperation({
    summary: 'Liveness probe',
    description: 'Simple check if the server is running',
  })
  @ApiResponse({
    status: 200,
    description: 'Server is alive',
  })
  async liveness(): Promise<{ status: string }> {
    return { status: 'ok' };
  }

  @Get('ready')
  @ApiOperation({
    summary: 'Readiness probe',
    description: 'Check if the server is ready to accept requests',
  })
  @ApiResponse({
    status: 200,
    description: 'Server is ready',
  })
  @ApiResponse({
    status: 503,
    description: 'Server is not ready',
  })
  async readiness(): Promise<{ status: string; ready: boolean }> {
    const databaseHealthy = await this.checkDatabase();
    const ready = databaseHealthy;

    return {
      status: ready ? 'ready' : 'not ready',
      ready,
    };
  }

  private async checkDatabase(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }

  private async checkRedis(): Promise<boolean> {
    try {
      // TODO: Implement Redis health check when Redis is configured
      // For now, return true
      return true;
    } catch (error) {
      console.error('Redis health check failed:', error);
      return false;
    }
  }
}
