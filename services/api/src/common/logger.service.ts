/**
 * Centralized Logger Service for NestJS Backend
 * 
 * Provides structured logging with levels, timestamps, and context.
 * Integrates with NestJS dependency injection and supports production logging.
 */

import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}

interface LogContext {
  [key: string]: any;
}

@Injectable()
export class LoggerService implements NestLoggerService {
  private currentLevel: LogLevel;
  private serviceName: string;

  constructor(serviceName: string = 'API') {
    this.serviceName = serviceName;
    this.currentLevel = this.getLogLevel();
  }

  private getLogLevel(): LogLevel {
    const env = process.env.NODE_ENV || 'development';
    const configLevel = process.env.LOG_LEVEL?.toUpperCase();

    if (configLevel) {
      return LogLevel[configLevel as keyof typeof LogLevel] ?? LogLevel.INFO;
    }

    return env === 'production' ? LogLevel.INFO : LogLevel.DEBUG;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.currentLevel;
  }

  private formatMessage(
    level: string,
    message: string,
    context?: string,
    metadata?: LogContext,
  ): string {
    const timestamp = new Date().toISOString();
    const ctx = context || this.serviceName;
    
    const parts = [
      `[${timestamp}]`,
      `[${level}]`,
      `[${ctx}]`,
      message,
    ];

    if (metadata && Object.keys(metadata).length > 0) {
      parts.push(JSON.stringify(metadata));
    }

    return parts.join(' ');
  }

  debug(message: string, context?: string, metadata?: LogContext): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.log(this.formatMessage('DEBUG', message, context, metadata));
    }
  }

  log(message: string, context?: string, metadata?: LogContext): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.log(this.formatMessage('INFO', message, context, metadata));
    }
  }

  info(message: string, context?: string, metadata?: LogContext): void {
    this.log(message, context, metadata);
  }

  warn(message: string, context?: string, metadata?: LogContext): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage('WARN', message, context, metadata));
    }
  }

  error(
    message: string,
    trace?: string | Error,
    context?: string,
    metadata?: LogContext,
  ): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const errorMessage = this.formatMessage('ERROR', message, context, metadata);
      
      if (trace instanceof Error) {
        console.error(errorMessage, trace.stack || trace.message);
      } else if (trace) {
        console.error(errorMessage, trace);
      } else {
        console.error(errorMessage);
      }
    }
  }

  verbose(message: string, context?: string): void {
    this.debug(message, context);
  }

  fatal(message: string, trace?: string, context?: string): void {
    this.error(message, trace, context);
  }
}

// Global logger instance
export const logger = new LoggerService('API');

// Domain-specific loggers
export const authLogger = {
  login: (userId: string, email: string) =>
    logger.info(`User login`, 'Auth', { userId, email }),
  
  loginSuccess: (userId: string, method: string = 'password') =>
    logger.info(`Login successful`, 'Auth', { userId, method }),
  
  loginFailure: (email: string, reason: string) =>
    logger.warn(`Login failed`, 'Auth', { email, reason }),
  
  logout: (userId: string) =>
    logger.info(`User logout`, 'Auth', { userId }),
  
  tokenRefresh: (userId: string) =>
    logger.debug(`Token refreshed`, 'Auth', { userId }),
  
  sessionExpired: (userId: string) =>
    logger.info(`Session expired`, 'Auth', { userId }),
};

export const tenantLogger = {
  create: (tenantId: string, name: string) =>
    logger.info(`Tenant created`, 'Tenant', { tenantId, name }),
  
  update: (tenantId: string, changes: string[]) =>
    logger.info(`Tenant updated`, 'Tenant', { tenantId, changes }),
  
  suspend: (tenantId: string, reason: string) =>
    logger.warn(`Tenant suspended`, 'Tenant', { tenantId, reason }),
  
  activate: (tenantId: string) =>
    logger.info(`Tenant activated`, 'Tenant', { tenantId }),
  
  delete: (tenantId: string) =>
    logger.info(`Tenant deleted`, 'Tenant', { tenantId }),
};

export const notificationLogger = {
  pushRegistered: (userId: string, token: string) =>
    logger.info(`Push token registered`, 'Notification', { userId, tokenPrefix: token.substring(0, 10) }),
  
  pushUnregistered: (token: string) =>
    logger.info(`Push token unregistered`, 'Notification', { tokenPrefix: token.substring(0, 10) }),
  
  pushSent: (count: number, success: number, failed: number) =>
    logger.info(`Push notifications sent`, 'Notification', { count, success, failed }),
  
  pushError: (error: Error, context: any) =>
    logger.error(`Push notification failed`, error, 'Notification', context),
  
  broadcast: (type: string, recipientCount: number) =>
    logger.info(`Notification broadcast`, 'Notification', { type, recipientCount }),
};

export const mediaLogger = {
  uploadStart: (filename: string, size: number) =>
    logger.info(`Media upload started`, 'Media', { filename, sizeBytes: size }),
  
  uploadComplete: (assetId: string, filename: string) =>
    logger.info(`Media upload complete`, 'Media', { assetId, filename }),
  
  uploadFailed: (filename: string, error: Error) =>
    logger.error(`Media upload failed`, error, 'Media', { filename }),
  
  processingStart: (assetId: string, type: string) =>
    logger.info(`Media processing started`, 'Media', { assetId, type }),
  
  processingComplete: (assetId: string, variants: number) =>
    logger.info(`Media processing complete`, 'Media', { assetId, variants }),
  
  deleteSuccess: (assetIds: string[]) =>
    logger.info(`Media deleted`, 'Media', { count: assetIds.length }),
  
  deleteFailed: (error: Error) =>
    logger.error(`Media deletion failed`, error, 'Media'),
};

export const healthLogger = {
  check: (service: string, status: 'up' | 'down', latency?: number) =>
    logger.debug(`Health check`, 'Health', { service, status, latencyMs: latency }),
  
  checkFailed: (service: string, error: Error) =>
    logger.error(`Health check failed`, error, 'Health', { service }),
};

export const auditLogger = {
  logFailed: (error: Error, action: string) =>
    logger.error(`Audit log failed`, error, 'Audit', { action }),
};

export const analyticsLogger = {
  statsFailed: (error: Error, query: string) =>
    logger.error(`Analytics stats failed`, error, 'Analytics', { query }),
};

export const webhookLogger = {
  deliveryStart: (webhookId: string, url: string) =>
    logger.info(`Webhook delivery started`, 'Webhook', { webhookId, url }),
  
  deliverySuccess: (deliveryId: string, statusCode: number) =>
    logger.info(`Webhook delivered`, 'Webhook', { deliveryId, statusCode }),
  
  deliveryFailed: (deliveryId: string, error: Error) =>
    logger.error(`Webhook delivery failed`, error, 'Webhook', { deliveryId }),
  
  retryScheduled: (deliveryId: string, attempt: number) =>
    logger.info(`Webhook retry scheduled`, 'Webhook', { deliveryId, attempt }),
};

export const apiLogger = {
  requestLogged: (method: string, path: string, statusCode: number, duration: number) =>
    logger.debug(`API request`, 'API', { method, path, statusCode, durationMs: duration }),
  
  logFailed: (error: Error) =>
    logger.error(`API logging failed`, error, 'API'),
};
