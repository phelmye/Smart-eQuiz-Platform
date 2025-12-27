/**
 * Centralized Logging Utility for Platform Admin
 * 
 * Production-ready logger with configurable log levels and structured output.
 * Replaces scattered console.log statements with proper logging infrastructure.
 * 
 * Usage:
 *   import { logger } from '@/lib/logger';
 *   logger.info('Tenant created', { tenantId: tenant.id });
 *   logger.error('API request failed', error);
 *   logger.debug('Component mounted', { component: 'Dashboard' });
 */

const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  NONE: 4,
} as const;

type LogLevel = typeof LogLevel[keyof typeof LogLevel];

interface LogContext {
  [key: string]: any;
}

class Logger {
  private level: LogLevel;
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = import.meta.env.DEV;
    
    // Configure log level from environment or default based on mode
    const envLevel = import.meta.env.VITE_LOG_LEVEL?.toUpperCase();
    if (envLevel && envLevel in LogLevel) {
      this.level = LogLevel[envLevel as keyof typeof LogLevel];
    } else {
      // Default: DEBUG in dev, INFO in production
      this.level = this.isDevelopment ? LogLevel.DEBUG : LogLevel.INFO;
    }
  }

  /**
   * Set the minimum log level
   */
  setLevel(level: LogLevel): void {
    this.level = level;
  }

  /**
   * Get current log level
   */
  getLevel(): LogLevel {
    return this.level;
  }

  /**
   * Debug logs - verbose information for debugging
   * Only shown in development or when LOG_LEVEL=DEBUG
   */
  debug(message: string, context?: LogContext): void {
    if (this.level <= LogLevel.DEBUG) {
      this.log('debug', '🔍', message, context);
    }
  }

  /**
   * Info logs - general informational messages
   */
  info(message: string, context?: LogContext): void {
    if (this.level <= LogLevel.INFO) {
      this.log('info', 'ℹ️', message, context);
    }
  }

  /**
   * Success logs - operation completed successfully
   */
  success(message: string, context?: LogContext): void {
    if (this.level <= LogLevel.INFO) {
      this.log('info', '✅', message, context);
    }
  }

  /**
   * Warning logs - something unexpected but not critical
   */
  warn(message: string, context?: LogContext): void {
    if (this.level <= LogLevel.WARN) {
      this.log('warn', '⚠️', message, context);
    }
  }

  /**
   * Error logs - something went wrong
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    if (this.level <= LogLevel.ERROR) {
      const errorContext = {
        ...context,
        ...(error instanceof Error && {
          errorMessage: error.message,
          errorStack: this.isDevelopment ? error.stack : undefined,
        }),
      };
      this.log('error', '❌', message, errorContext);
    }
  }

  /**
   * Group related logs together
   */
  group(label: string, callback: () => void): void {
    if (this.level <= LogLevel.DEBUG && this.isDevelopment) {
      console.group(label);
      callback();
      console.groupEnd();
    }
  }

  /**
   * Internal log method
   */
  private log(
    method: 'debug' | 'info' | 'warn' | 'error',
    icon: string,
    message: string,
    context?: LogContext
  ): void {
    const timestamp = new Date().toISOString();
    const prefix = this.isDevelopment ? `${icon} [${timestamp}]` : `[${timestamp}]`;
    
    if (context && Object.keys(context).length > 0) {
      console[method](prefix, message, context);
    } else {
      console[method](prefix, message);
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Export convenience methods for specific domains
export const authLogger = {
  login: (email: string) => logger.info('Admin login attempt', { email }),
  loginSuccess: (userId: string, email: string) => logger.success('Admin logged in', { userId, email }),
  loginFailure: (email: string) => logger.warn('Admin login failed', { email }),
  logout: (userId: string) => logger.info('Admin logged out', { userId }),
  sessionRestored: (userId: string) => logger.debug('Admin session restored', { userId }),
};

export const apiLogger = {
  request: (endpoint: string, method: string) => logger.debug('API request', { endpoint, method }),
  response: (endpoint: string, status: number) => logger.debug('API response', { endpoint, status }),
  error: (endpoint: string, error: Error) => logger.error('API error', error, { endpoint }),
  retry: (endpoint: string, attempt: number) => logger.warn('API retry', { endpoint, attempt }),
};

export const tenantLogger = {
  create: (tenantId: string) => logger.success('Tenant created', { tenantId }),
  update: (tenantId: string) => logger.success('Tenant updated', { tenantId }),
  suspend: (tenantId: string) => logger.warn('Tenant suspended', { tenantId }),
  activate: (tenantId: string) => logger.success('Tenant activated', { tenantId }),
  delete: (tenantId: string) => logger.warn('Tenant deleted', { tenantId }),
};

export const billingLogger = {
  transaction: (amount: number, type: string) => logger.info('Billing transaction', { amount, type }),
  refund: (transactionId: string) => logger.warn('Refund processed', { transactionId }),
  failure: (error: Error) => logger.error('Billing failure', error),
};

// Environment variable configuration in .env:
// VITE_LOG_LEVEL=DEBUG   # Show all logs (development default)
// VITE_LOG_LEVEL=INFO    # Show info, warn, error (production default)
// VITE_LOG_LEVEL=WARN    # Show only warnings and errors
// VITE_LOG_LEVEL=ERROR   # Show only errors
// VITE_LOG_LEVEL=NONE    # Disable all logs
