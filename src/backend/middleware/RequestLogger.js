const logger = require('../utils/Logger');

/**
 * Request Logger Middleware
 * Logs all IPC requests for debugging and monitoring
 */
class RequestLogger {
  /**
   * Log incoming request
   * @param {string} channel - IPC channel name
   * @param {*} data - Request data
   */
  static logRequest(channel, data) {
    logger.debug(`IPC Request: ${channel}`, {
      channel,
      hasData: !!data,
      dataSize: data ? JSON.stringify(data).length : 0
    });
  }

  /**
   * Log response
   * @param {string} channel - IPC channel name
   * @param {Object} response - Response object
   * @param {number} duration - Request duration in ms
   */
  static logResponse(channel, response, duration = null) {
    const logData = {
      channel,
      success: response.success,
      duration: duration ? `${duration}ms` : null
    };

    if (response.success) {
      logger.debug(`IPC Response: ${channel}`, logData);
    } else {
      logger.error(`IPC Error: ${channel}`, {
        ...logData,
        error: response.error,
        code: response.code
      });
    }
  }

  /**
   * Wrap IPC handler with logging
   * @param {string} channel - IPC channel name
   * @param {Function} handler - Handler function
   * @returns {Function} Wrapped handler
   */
  static wrapHandler(channel, handler) {
    return async (event, ...args) => {
      const startTime = Date.now();
      
      RequestLogger.logRequest(channel, args);
      
      try {
        const response = await handler(event, ...args);
        const duration = Date.now() - startTime;
        RequestLogger.logResponse(channel, response, duration);
        return response;
      } catch (error) {
        const duration = Date.now() - startTime;
        RequestLogger.logResponse(channel, {
          success: false,
          error: error.message,
          code: 'HANDLER_ERROR'
        }, duration);
        throw error;
      }
    };
  }
}

module.exports = RequestLogger;

