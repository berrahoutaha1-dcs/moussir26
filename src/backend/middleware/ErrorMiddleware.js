const ErrorHandler = require('../utils/ErrorHandler');
const logger = require('../utils/Logger');

/**
 * Error Middleware
 * Catches and handles errors in IPC handlers
 */
class ErrorMiddleware {
  /**
   * Wrap handler with error catching
   * @param {Function} handler - Handler function
   * @param {string} context - Context name for logging
   * @returns {Function} Wrapped handler
   */
  static wrap(handler, context = 'Unknown') {
    return async (event, ...args) => {
      try {
        return await handler(event, ...args);
      } catch (error) {
        logger.error(`Error in ${context}`, error);
        return ErrorHandler.handleError(error, context);
      }
    };
  }

  /**
   * Handle async errors
   * @param {Function} fn - Async function
   * @param {string} context - Context name
   * @returns {Function} Wrapped function
   */
  static asyncHandler(fn, context = 'Unknown') {
    return async (...args) => {
      try {
        return await fn(...args);
      } catch (error) {
        logger.error(`Error in ${context}`, error);
        return ErrorHandler.handleError(error, context);
      }
    };
  }
}

module.exports = ErrorMiddleware;

