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
          f.name as family_name,
          b.name as brand_name,
          s.nom_entreprise as supplier_name
        FROM ${this.tableName} p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN product_families f ON p.family_id = f.id
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
          f.name as family_name,
          b.name as brand_name,
          s.nom_entreprise as supplier_name
        FROM ${this.tableName} p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN product_families f ON p.family_id = f.id
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

  /**
   * Get stock breakdown by depot for a product
   * @param {number} productId - Product ID
   * @returns {Array} Array of {id, name, quantity}
   */
  getDepotStocks(productId) {
    try {
      const query = `
        SELECT pds.storehouse_id as id, s.name, pds.quantity
        FROM product_depot_stocks pds
        JOIN storehouses s ON pds.storehouse_id = s.id
        WHERE pds.product_id = ?
      `;
      return this.db.prepare(query).all(productId);
    } catch (error) {
      console.error('Error fetching depot stocks:', error);
      return [];
    }
  }

  /**
   * Save stock breakdown by depot for a product
   * @param {number} productId - Product ID
   * @param {Array} stocks - Array of {id, quantity}
   */
  saveDepotStocks(productId, stocks) {
    if (!stocks || !Array.isArray(stocks)) return;
    console.log(`[Repository] Saving stocks for product ${productId}:`, JSON.stringify(stocks));

    try {
      const deleteStmt = this.db.prepare('DELETE FROM product_depot_stocks WHERE product_id = ?');
      const insertStmt = this.db.prepare(`
        INSERT INTO product_depot_stocks (product_id, storehouse_id, quantity)
        VALUES (?, ?, ?)
      `);

      const transaction = this.db.transaction((id, stockList) => {
        const delResult = deleteStmt.run(id);
        console.log(`[Repository] Deleted ${delResult.changes} old stock rows for product ${id}`);
        for (const stock of stockList) {
          if (stock.id && parseFloat(stock.quantity) > 0) {
            insertStmt.run(id, stock.id, parseFloat(stock.quantity));
            console.log(`[Repository] Inserted stock for depot ${stock.id}: ${stock.quantity}`);
          }
        }
      });

      transaction(productId, stocks);
      console.log('[Repository] Transaction committed successfully');
    } catch (error) {
      console.error('[Repository] Error saving depot stocks:', error);
      throw error;
    }
  }
}

module.exports = ProductRepository;

