const BaseRepository = require('./BaseRepository');

/**
 * Product Repository
 * Handles all database operations for products
 */
class ProductRepository extends BaseRepository {
  constructor(db) {
    super(db, 'products');
  }

  /**
   * Find product by barcode
   * @param {string} barcode - Product barcode
   * @returns {Object|null} Product or null
   */
  findByBarcode(barcode) {
    return this.findByField('code_bar', barcode);
  }

  /**
   * Find products by category
   * @param {number} categoryId - Category ID
   * @returns {Array} Array of products
   */
  findByCategory(categoryId) {
    return this.findAllByField('category_id', categoryId);
  }

  /**
   * Find products by supplier
   * @param {number} supplierId - Supplier ID
   * @returns {Array} Array of products
   */
  findBySupplier(supplierId) {
    return this.findAllByField('supplier_id', supplierId);
  }

  /**
   * Get products with related data (joins)
   * @param {Object} options - Query options
   * @returns {Array} Products with category, family, brand, supplier info
   */
  findAllWithRelations(options = {}) {
    try {
      let query = `
        SELECT 
          p.*,
          c.name as category_name,
          pf.name as family_name,
          b.name as brand_name,
          s.nom_entreprise as supplier_name
        FROM ${this.tableName} p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN product_families pf ON p.family_id = pf.id
        LEFT JOIN brands b ON p.brand_id = b.id
        LEFT JOIN suppliers s ON p.supplier_id = s.id
      `;

      const params = [];

      // Add WHERE clause if needed
      if (options.categoryId) {
        query += ` WHERE p.category_id = ?`;
        params.push(options.categoryId);
      }

      // Add ORDER BY
      if (options.orderBy) {
        query += ` ORDER BY ${options.orderBy}`;
      } else {
        query += ` ORDER BY p.created_at DESC`;
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
   * Search products by designation or barcode
   * @param {string} searchTerm - Search term
   * @returns {Array} Array of matching products
   */
  search(searchTerm) {
    try {
      const query = `
        SELECT 
          p.*,
          c.name as category_name,
          pf.name as family_name,
          b.name as brand_name,
          s.nom_entreprise as supplier_name
        FROM ${this.tableName} p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN product_families pf ON p.family_id = pf.id
        LEFT JOIN brands b ON p.brand_id = b.id
        LEFT JOIN suppliers s ON p.supplier_id = s.id
        WHERE p.designation LIKE ? 
           OR p.code_bar LIKE ?
        ORDER BY p.designation ASC
      `;
      const searchPattern = `%${searchTerm}%`;
      const stmt = this.db.prepare(query);
      return stmt.all(searchPattern, searchPattern);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get low stock products
   * @param {number} threshold - Stock threshold
   * @returns {Array} Products with stock below threshold
   */
  getLowStock(threshold = 10) {
    try {
      const query = `
        SELECT * FROM ${this.tableName}
        WHERE stock <= ?
        ORDER BY stock ASC
      `;
      const stmt = this.db.prepare(query);
      return stmt.all(threshold);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update product stock
   * @param {number} id - Product ID
   * @param {number} quantity - Quantity to add/subtract
   * @returns {Object|null} Updated product or null
   */
  updateStock(id, quantity) {
    try {
      const query = `
        UPDATE ${this.tableName}
        SET stock = stock + ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      const stmt = this.db.prepare(query);
      const result = stmt.run(quantity, id);
      
      if (result.changes === 0) {
        return null;
      }
      
      return this.findById(id);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ProductRepository;

