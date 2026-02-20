const logger = require('./Logger');
const { ERROR_CODES } = require('../constants');

/**
 * Error Handler Utility
 * Centralized error handling and logging
 */
class ErrorHandler {
  /**
   * Handle database errors
   * @param {Error} error - Error object
   * @returns {Object} Formatted error response
   */
  static handleDatabaseError(error) {
    logger.error('Database Error', error);
    
    // SQLite specific error codes
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return {
        success: false,
        error: 'Duplicate entry. This record already exists.',
        code: ERROR_CODES.DUPLICATE_ENTRY
      };
    }
    
    if (error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
      return {
        success: false,
        error: 'Foreign key constraint violation. Related record does not exist.',
        code: ERROR_CODES.FOREIGN_KEY_VIOLATION
      };
    }
    
    if (error.code === 'SQLITE_CONSTRAINT_NOTNULL') {
      return {
        success: false,
        error: 'Required field is missing.',
        code: ERROR_CODES.NULL_CONSTRAINT
      };
    }
    
    // Generic database error
    return {
      success: false,
      error: error.message || 'Database operation failed',
      code: ERROR_CODES.DATABASE_ERROR
    };
  }

  /**
   * Handle validation errors
   * @param {Object} errors - Validation errors object
   * @returns {Object} Formatted validation error response
   */
  static handleValidationError(errors) {
    logger.warn('Validation Error', errors);
    return {
      success: false,
      error: 'Validation failed',
      errors,
      code: ERROR_CODES.VALIDATION_ERROR
    };
  }

  /**
   * Handle generic errors
   * @param {Error} error - Error object
   * @param {string} context - Context where error occurred
   * @returns {Object} Formatted error response
   */
  static handleError(error, context = 'Unknown') {
    logger.error(`Error in ${context}`, error);
    
    return {
      success: false,
      error: error.message || 'An unexpected error occurred',
      code: ERROR_CODES.INTERNAL_ERROR,
      context
    };
  }

  /**
   * Wrap async function with error handling
   * @param {Function} fn - Async function to wrap
   * @returns {Function} Wrapped function with error handling
   */
  static asyncHandler(fn) {
    return async (...args) => {
      try {
        return await fn(...args);
      } catch (error) {
        return ErrorHandler.handleError(error, fn.name);
      }
    };
  }
}

module.exports = ErrorHandler;

