const BaseRepository = require('./BaseRepository');

/**
 * Supplier Repository
 * Handles all database operations for suppliers
 */
class SupplierRepository extends BaseRepository {
  constructor(db) {
    super(db, 'suppliers');
  }

  /**
   * Find supplier by code
   * @param {string} code - Supplier code
   * @returns {Object|null} Supplier or null
   */
  findByCode(code) {
    return this.findByField('code_supplier', code);
  }

  /**
   * Find suppliers by category
   * @param {string} category - Activity category
   * @returns {Array} Array of suppliers
   */
  findByCategory(category) {
    return this.findAllByField('categorie_activite', category);
  }

  /**
   * Find suppliers by status
   * @param {string} status - Supplier status
   * @returns {Array} Array of suppliers
   */
  findByStatus(status) {
    return this.findAllByField('statut', status);
  }

  /**
   * Search suppliers by name or code
   * @param {string} searchTerm - Search term
   * @returns {Array} Array of matching suppliers
   */
  search(searchTerm) {
    try {
      const query = `
        SELECT * FROM ${this.tableName}
        WHERE nom_entreprise LIKE ? 
           OR code_supplier LIKE ?
        ORDER BY nom_entreprise ASC
      `;
      const searchPattern = `%${searchTerm}%`;
      const stmt = this.db.prepare(query);
      return stmt.all(searchPattern, searchPattern);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get suppliers with balance summary
   * @returns {Array} Suppliers with calculated balances
   */
  getWithBalanceSummary() {
    try {
      const query = `
        SELECT 
          s.*,
          CASE 
            WHEN s.type_solde = 'positif' THEN s.solde
            ELSE -s.solde
          END as balance
        FROM ${this.tableName} s
        ORDER BY s.nom_entreprise ASC
      `;
      const stmt = this.db.prepare(query);
      return stmt.all();
    } catch (error) {
      throw error;
    }
  }
}

module.exports = SupplierRepository;

