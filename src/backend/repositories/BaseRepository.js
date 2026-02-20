const ErrorHandler = require('../utils/ErrorHandler');

/**
 * Base Repository Class
 * Provides common CRUD operations for all repositories
 * Follows Repository Pattern for data access abstraction
 */
class BaseRepository {
  constructor(db, tableName) {
    this.db = db;
    this.tableName = tableName;
  }

  /**
   * Find all records
   * @param {Object} options - Query options (orderBy, limit, offset)
   * @returns {Array} Array of records
   */
  findAll(options = {}) {
    try {
      let query = `SELECT * FROM ${this.tableName}`;
      const params = [];

      // Add ORDER BY
      if (options.orderBy) {
        query += ` ORDER BY ${options.orderBy}`;
      } else {
        query += ` ORDER BY id DESC`;
      }

      // Add LIMIT and OFFSET
      if (options.limit) {
        query += ` LIMIT ?`;
        params.push(options.limit);
        
        if (options.offset) {
          query += ` OFFSET ?`;
          params.push(options.offset);
        }
      }

      const stmt = this.db.prepare(query);
      return params.length > 0 ? stmt.all(...params) : stmt.all();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find record by ID
   * @param {number} id - Record ID
   * @returns {Object|null} Record or null if not found
   */
  findById(id) {
    try {
      const stmt = this.db.prepare(`SELECT * FROM ${this.tableName} WHERE id = ?`);
      return stmt.get(id) || null;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find record by field
   * @param {string} field - Field name
   * @param {*} value - Field value
   * @returns {Object|null} Record or null if not found
   */
  findByField(field, value) {
    try {
      const stmt = this.db.prepare(`SELECT * FROM ${this.tableName} WHERE ${field} = ?`);
      return stmt.get(value) || null;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find multiple records by field
   * @param {string} field - Field name
   * @param {*} value - Field value
   * @returns {Array} Array of records
   */
  findAllByField(field, value) {
    try {
      const stmt = this.db.prepare(`SELECT * FROM ${this.tableName} WHERE ${field} = ?`);
      return stmt.all(value);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create new record
   * @param {Object} data - Record data
   * @returns {Object} Created record with ID
   */
  create(data) {
    try {
      const fields = Object.keys(data);
      const placeholders = fields.map(() => '?').join(', ');
      const values = fields.map(field => data[field]);

      const query = `
        INSERT INTO ${this.tableName} (${fields.join(', ')})
        VALUES (${placeholders})
      `;

      const stmt = this.db.prepare(query);
      const result = stmt.run(...values);

      return {
        id: result.lastInsertRowid,
        ...data
      };
    } catch (error) {
      throw ErrorHandler.handleDatabaseError(error);
    }
  }

  /**
   * Update record by ID
   * @param {number} id - Record ID
   * @param {Object} data - Updated data
   * @returns {Object|null} Updated record or null if not found
   */
  update(id, data) {
    try {
      const fields = Object.keys(data);
      const setClause = fields.map(field => `${field} = ?`).join(', ');
      const values = fields.map(field => data[field]);
      values.push(id);

      const query = `
        UPDATE ${this.tableName}
        SET ${setClause}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;

      const stmt = this.db.prepare(query);
      const result = stmt.run(...values);

      if (result.changes === 0) {
        return null;
      }

      return this.findById(id);
    } catch (error) {
      throw ErrorHandler.handleDatabaseError(error);
    }
  }

  /**
   * Delete record by ID
   * @param {number} id - Record ID
   * @returns {boolean} True if deleted, false if not found
   */
  delete(id) {
    try {
      const stmt = this.db.prepare(`DELETE FROM ${this.tableName} WHERE id = ?`);
      const result = stmt.run(id);
      return result.changes > 0;
    } catch (error) {
      throw ErrorHandler.handleDatabaseError(error);
    }
  }

  /**
   * Count all records
   * @returns {number} Total count
   */
  count() {
    try {
      const stmt = this.db.prepare(`SELECT COUNT(*) as count FROM ${this.tableName}`);
      return stmt.get().count;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check if record exists
   * @param {number} id - Record ID
   * @returns {boolean} True if exists
   */
  exists(id) {
    try {
      const stmt = this.db.prepare(`SELECT 1 FROM ${this.tableName} WHERE id = ? LIMIT 1`);
      return stmt.get(id) !== undefined;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = BaseRepository;

