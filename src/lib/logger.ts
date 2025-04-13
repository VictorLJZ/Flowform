/**
 * Basic logger functionality for the application
 * In a production environment, you would replace this with
 * a more robust solution like Winston, Pino, or a hosted solution
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LoggerOptions {
  level?: LogLevel;
  metadata?: Record<string, any>;
}

/**
 * Structured logger with different log levels and metadata support
 */
class Logger {
  private isDev = process.env.NODE_ENV !== 'production';

  /**
   * Log an info message
   */
  info(message: string, metadata?: Record<string, any>) {
    this.log('info', message, metadata);
  }

  /**
   * Log a warning message
   */
  warn(message: string, metadata?: Record<string, any>) {
    this.log('warn', message, metadata);
  }

  /**
   * Log an error message
   */
  error(message: string, metadata?: Record<string, any>) {
    this.log('error', message, metadata);
  }

  /**
   * Log a debug message (only shown in development)
   */
  debug(message: string, metadata?: Record<string, any>) {
    if (this.isDev) {
      this.log('debug', message, metadata);
    }
  }

  /**
   * Internal logging method
   */
  private log(level: LogLevel, message: string, metadata?: Record<string, any>) {
    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    if (level === 'error') {
      console.error(formattedMessage, metadata || '');
    } else if (level === 'warn') {
      console.warn(formattedMessage, metadata || '');
    } else {
      console.log(formattedMessage, metadata || '');
    }
    
    // In production, you would send this to your logging service
    // For example: logstashClient.send({ level, message, metadata, timestamp });
  }
}

// Export a singleton instance
export const logger = new Logger();
