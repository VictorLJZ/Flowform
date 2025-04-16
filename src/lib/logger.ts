/**
 * Basic logger functionality for the application
 * In a production environment, you would replace this with
 * a more robust solution like Winston, Pino, or a hosted solution
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

// Using Record<string, unknown> for type-safe metadata objects
type LogMetadata = Record<string, unknown>;

/**
 * Structured logger with different log levels and metadata support
 */
class Logger {
  private isDev = process.env.NODE_ENV !== 'production';

  /**
   * Log an info message
   */
  info(message: string, metadata?: LogMetadata) {
    this.log('info', message, metadata);
  }

  /**
   * Log a warning message
   */
  warn(message: string, metadata?: LogMetadata) {
    this.log('warn', message, metadata);
  }

  /**
   * Log an error message
   */
  error(message: string, metadata?: LogMetadata) {
    this.log('error', message, metadata);
  }

  /**
   * Log a debug message (only shown in development)
   */
  debug(message: string, metadata?: LogMetadata) {
    // Only log debug messages in development
    if (this.isDev) {
      this.log('debug', message, metadata);
    }
  }

  /**
   * Internal logging method
   */
  private log(level: LogLevel, message: string, metadata?: LogMetadata) {
    const timestamp = new Date().toISOString();
    // Object construction for logging removed as it wasn't being used
    
    // In production, you would send this to a logging service
    // For now, we just use console methods with appropriate color formatting
    switch (level) {
      case 'info':
        console.log(`ℹ️ [${timestamp}] INFO: ${message}`, metadata || '');
        break;
      case 'warn':
        console.warn(`⚠️ [${timestamp}] WARN: ${message}`, metadata || '');
        break;
      case 'error':
        console.error(`❌ [${timestamp}] ERROR: ${message}`, metadata || '');
        break;
      case 'debug':
        console.debug(`🐞 [${timestamp}] DEBUG: ${message}`, metadata || '');
        break;
    }
  }
}

// Export a singleton instance
export const logger = new Logger();
