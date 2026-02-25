/**
 * Base Model Class
 * Provides common functionality for all models
 */
class BaseModel {
  constructor(data = {}) {
    this.id = data.id || null;
    this.createdAt = data.created_at || data.createdAt || null;
    this.updatedAt = data.updated_at || data.updatedAt || null;
  }

  /**
   * Convert model to database format (snake_case)
   * @returns {Object} Database format object
   */
  toDatabase() {
    const dbData = {};
    for (const [key, value] of Object.entries(this)) {
      if (key === 'id' || key === 'createdAt' || key === 'updatedAt' || key === 'totalPaye' || key === 'total_paye') {
        continue; // Handle separately or skip virtual fields
      }
      const dbKey = this.camelToSnake(key);
      if (dbKey === 'total_paye') continue; // Extra safety
      dbData[dbKey] = value;
    }
    return dbData;
  }

  /**
   * Convert database format to model format (camelCase)
   * @param {Object} dbData - Database format object
   * @returns {Object} Model instance
   */
  static fromDatabase(dbData) {
    const modelData = {};
    for (const [key, value] of Object.entries(dbData)) {
      const modelKey = this.snakeToCamel(key);
      modelData[modelKey] = value;
    }
    return new this(modelData);
  }

  /**
   * Convert camelCase to snake_case
   * @param {string} str - camelCase string
   * @returns {string} snake_case string
   */
  camelToSnake(str) {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }

  /**
   * Convert snake_case to camelCase
   * @param {string} str - snake_case string
   * @returns {string} camelCase string
   */
  static snakeToCamel(str) {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  }

  /**
   * Validate model data
   * @returns {Object} Validation result
   */
  validate() {
    return {
      isValid: true,
      errors: {}
    };
  }

  /**
   * Get model as plain object
   * @returns {Object} Plain object
   */
  toJSON() {
    return { ...this };
  }
}

module.exports = BaseModel;

