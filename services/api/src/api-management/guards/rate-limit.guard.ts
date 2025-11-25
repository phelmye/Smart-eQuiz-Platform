import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

// Simple in-memory rate limiter (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // Get rate limit from API key context or use default
    const apiKeyContext = request.apiKey;
    const rateLimit = apiKeyContext?.rateLimit || 60; // default 60 req/min

    // Create rate limit key
    const identifier = apiKeyContext?.apiKeyId || request.ip;
    const key = `rate_limit:${identifier}`;

    // Get or create rate limit entry
    const now = Date.now();
    let entry = rateLimitStore.get(key);

    // Reset if window expired
    if (!entry || now > entry.resetAt) {
      entry = {
        count: 0,
        resetAt: now + 60000 // 60 seconds
      };
      rateLimitStore.set(key, entry);
    }

    // Set response headers
    response.setHeader('X-RateLimit-Limit', rateLimit.toString());
    response.setHeader('X-RateLimit-Remaining', Math.max(0, rateLimit - entry.count - 1).toString());
    response.setHeader('X-RateLimit-Reset', entry.resetAt.toString());

    // Check if limit exceeded
    if (entry.count >= rateLimit) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      response.setHeader('Retry-After', retryAfter.toString());

      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Rate limit exceeded',
          error: 'Too Many Requests',
          retryAfter
        },
        HttpStatus.TOO_MANY_REQUESTS
      );
    }

    // Increment counter
    entry.count++;
    rateLimitStore.set(key, entry);

    // Cleanup old entries periodically
    if (Math.random() < 0.01) { // 1% chance
      this.cleanup();
    }

    return true;
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (now > entry.resetAt) {
        rateLimitStore.delete(key);
      }
    }
  }
}
