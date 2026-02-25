/**
 * Logger Utility
 * Centralized logging system with different log levels
 * Supports .env configuration
 */
class Logger {
  constructor(context = 'App') {
    this.context = context;
    const app = require('electron').app;
    this.isDevelopment = process.env.NODE_ENV === 'development' || !app.isPackaged;
    
    // Get log level from .env or default
    const envLogLevel = process.env.LOG_LEVEL || (this.isDevelopment ? 'debug' : 'error');
    this.logLevel = this.getLogLevelPriority(envLogLevel);
  }

  /**
   * Get numeric priority for log level
   * @private
   */
  getLogLevelPriority(level) {
    const levels = { debug: 0, info: 1, warn: 2, error: 3 };
    return levels[level.toLowerCase()] || 1;
  }

  /**
   * Check if should log at this level
   * @private
   */
  shouldLog(level) {
    const levels = { debug: 0, info: 1, warn: 2, error: 3 };
    return levels[level.toLowerCase()] >= this.logLevel;
  }

  /**
   * Format log message
   * @private
   */
  formatMessage(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const context = `[${this.context}]`;
    const levelTag = `[${level}]`;
    
    let logMessage = `${timestamp} ${context} ${levelTag} ${message}`;
    
    if (data) {
      logMessage += `\n${JSON.stringify(data, null, 2)}`;
    }
    
    return logMessage;
  }

  /**
   * Log info message
   */
  info(message, data = null) {
    if (this.shouldLog('info')) {
      console.log(this.formatMessage('INFO', message, data));
    }
  }

  /**
   * Log warning message
   */
  warn(message, data = null) {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('WARN', message, data));
    }
  }

  /**
   * Log error message
   */
  error(message, error = null) {
    if (this.shouldLog('error')) {
      const errorData = error ? {
        message: error.message,
        stack: error.stack,
        code: error.code
      } : null;
      
      console.error(this.formatMessage('ERROR', message, errorData));
    }
  }

  /**
   * Log debug message
   */
  debug(message, data = null) {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('DEBUG', message, data));
    }
  }

  /**
   * Log database operation
   */
  db(operation, table, data = null) {
    if (this.isDevelopment) {
      this.debug(`DB ${operation} on ${table}`, data);
    }
  }

  /**
   * Create logger instance for specific context
   */
  static create(context) {
    return new Logger(context);
  }
}

// Export singleton instance
const logger = new Logger('Backend');

module.exports = logger;
module.exports.Logger = Logger;

