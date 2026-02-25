/**
 * Response Helper Utility
 * Provides standardized response format for all API responses
 */
class ResponseHelper {
  /**
   * Success response
   * @param {*} data - Response data
   * @param {string} message - Optional success message
   * @returns {Object} Standardized success response
   */
  static success(data = null, message = null) {
    return {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Error response
   * @param {string} error - Error message
   * @param {number} code - Optional error code
   * @param {*} details - Optional error details
   * @returns {Object} Standardized error response
   */
  static error(error, code = null, details = null) {
    return {
      success: false,
      error,
      code,
      details,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Validation error response
   * @param {Object} errors - Validation errors object
   * @returns {Object} Standardized validation error response
   */
  static validationError(errors) {
    return {
      success: false,
      error: 'Validation failed',
      errors,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Not found response
   * @param {string} resource - Resource name
   * @returns {Object} Standardized not found response
   */
  static notFound(resource = 'Resource') {
    return {
      success: false,
      error: `${resource} not found`,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = ResponseHelper;

