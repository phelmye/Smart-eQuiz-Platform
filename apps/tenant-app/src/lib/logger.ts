/**
 * Centralized Logging Utility
 * 
 * Production-ready logger with configurable log levels and structured output.
 * Replaces scattered console.log statements with proper logging infrastructure.
 * 
 * Usage:
 *   import { logger } from '@/lib/logger';
 *   logger.info('User logged in', { userId: user.id });
 *   logger.error('API request failed', error);
 *   logger.debug('Component mounted', { component: 'Dashboard' });
 */

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
  login: (email: string) => logger.info('User login attempt', { email }),
  loginSuccess: (userId: string, email: string) => logger.success('User logged in', { userId, email }),
  loginFailure: (email: string) => logger.warn('Login failed', { email }),
  logout: (userId: string) => logger.info('User logged out', { userId }),
  register: (email: string) => logger.info('User registration attempt', { email }),
  registerSuccess: (userId: string) => logger.success('User registered', { userId }),
  sessionRestored: (userId: string) => logger.debug('Session restored', { userId }),
};

export const apiLogger = {
  request: (endpoint: string, method: string) => logger.debug('API request', { endpoint, method }),
  response: (endpoint: string, status: number) => logger.debug('API response', { endpoint, status }),
  error: (endpoint: string, error: Error) => logger.error('API error', error, { endpoint }),
  retry: (endpoint: string, attempt: number) => logger.warn('API retry', { endpoint, attempt }),
};

export const componentLogger = {
  mount: (component: string) => logger.debug('Component mounted', { component }),
  unmount: (component: string) => logger.debug('Component unmounted', { component }),
  render: (component: string, props?: any) => logger.debug('Component rendering', { component, props }),
  error: (component: string, error: Error) => logger.error('Component error', error, { component }),
};

export const storageLogger = {
  read: (key: string) => logger.debug('Storage read', { key }),
  write: (key: string) => logger.debug('Storage write', { key }),
  delete: (key: string) => logger.debug('Storage delete', { key }),
};

export const tournamentLogger = {
  create: (tournamentId: string) => logger.success('Tournament created', { tournamentId }),
  update: (tournamentId: string) => logger.success('Tournament updated', { tournamentId }),
  start: (tournamentId: string) => logger.info('Tournament started', { tournamentId }),
  complete: (tournamentId: string) => logger.success('Tournament completed', { tournamentId }),
};

export const questionLogger = {
  create: (questionId: string) => logger.success('Question created', { questionId }),
  update: (questionId: string) => logger.success('Question updated', { questionId }),
  delete: (questionId: string) => logger.success('Question deleted', { questionId }),
};

// Environment variable configuration in .env:
// VITE_LOG_LEVEL=DEBUG   # Show all logs (development default)
// VITE_LOG_LEVEL=INFO    # Show info, warn, error (production default)
// VITE_LOG_LEVEL=WARN    # Show only warnings and errors
// VITE_LOG_LEVEL=ERROR   # Show only errors
// VITE_LOG_LEVEL=NONE    # Disable all logs
