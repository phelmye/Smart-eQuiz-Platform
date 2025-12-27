/**
 * Centralized Logger for Marketing Site (Next.js)
 * 
 * Provides structured logging with levels, timestamps, and context.
 * Compatible with Next.js client and server environments.
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
  private currentLevel: LogLevel;

  constructor() {
    this.currentLevel = this.getLogLevel();
  }

  private getLogLevel(): LogLevel {
    // Check if running in browser or server
    const isBrowser = typeof window !== 'undefined';
    
    if (isBrowser) {
      // Client-side: Use environment variable from build time
      const envLevel = process.env.NEXT_PUBLIC_LOG_LEVEL?.toUpperCase();
      if (envLevel && LogLevel[envLevel as keyof typeof LogLevel] !== undefined) {
        return LogLevel[envLevel as keyof typeof LogLevel];
      }
      return process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG;
    } else {
      // Server-side: Use runtime environment variable
      const envLevel = process.env.LOG_LEVEL?.toUpperCase();
      if (envLevel && LogLevel[envLevel as keyof typeof LogLevel] !== undefined) {
        return LogLevel[envLevel as keyof typeof LogLevel];
      }
      return process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG;
    }
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
    const emoji = this.getEmoji(level);
    
    const parts = [
      `[${timestamp}]`,
      emoji,
      `[${level}]`,
    ];

    if (context) {
      parts.push(`[${context}]`);
    }

    parts.push(message);

    if (metadata && Object.keys(metadata).length > 0) {
      parts.push(JSON.stringify(metadata));
    }

    return parts.join(' ');
  }

  private getEmoji(level: string): string {
    switch (level) {
      case 'DEBUG': return '🔍';
      case 'INFO': return 'ℹ️';
      case 'WARN': return '⚠️';
      case 'ERROR': return '❌';
      default: return '📝';
    }
  }

  debug(message: string, context?: string, metadata?: LogContext): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.log(this.formatMessage('DEBUG', message, context, metadata));
    }
  }

  info(message: string, context?: string, metadata?: LogContext): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.log(this.formatMessage('INFO', message, context, metadata));
    }
  }

  warn(message: string, context?: string, metadata?: LogContext): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage('WARN', message, context, metadata));
    }
  }

  error(message: string, error?: Error | unknown, context?: string, metadata?: LogContext): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const errorMessage = this.formatMessage('ERROR', message, context, metadata);
      
      if (error instanceof Error) {
        console.error(errorMessage, error.stack || error.message);
      } else if (error) {
        console.error(errorMessage, error);
      } else {
        console.error(errorMessage);
      }
    }
  }
}

// Global logger instance
export const logger = new Logger();

// Page-specific loggers for marketing site
export const pageLogger = {
  dataFetch: (page: string, endpoint: string) =>
    logger.debug(`Fetching data for ${page}`, 'Page', { endpoint }),
  
  dataFetchSuccess: (page: string, itemCount: number) =>
    logger.debug(`Data fetch successful`, 'Page', { page, itemCount }),
  
  dataFetchError: (page: string, error: Error) =>
    logger.error(`Failed to fetch data for ${page}`, error, 'Page'),
  
  formSubmit: (form: string, data: any) =>
    logger.info(`Form submitted`, 'Form', { form, ...data }),
  
  formError: (form: string, error: Error) =>
    logger.error(`Form submission failed`, error, 'Form', { form }),
};

export const analyticsLogger = {
  event: (eventName: string, properties?: Record<string, any>) =>
    logger.debug(`Analytics event`, 'Analytics', { eventName, ...properties }),
  
  pageView: (path: string) =>
    logger.debug(`Page view`, 'Analytics', { path }),
  
  conversion: (conversionType: string, value?: number) =>
    logger.info(`Conversion tracked`, 'Analytics', { conversionType, value }),
};

export const errorBoundaryLogger = {
  caught: (error: Error, errorInfo: any) =>
    logger.error(`Error caught by boundary`, error, 'ErrorBoundary', { errorInfo }),
};

export const apiLogger = {
  request: (method: string, url: string) =>
    logger.debug(`API request`, 'API', { method, url }),
  
  response: (status: number, duration: number) =>
    logger.debug(`API response`, 'API', { status, durationMs: duration }),
  
  error: (error: Error, url: string) =>
    logger.error(`API request failed`, error, 'API', { url }),
};
