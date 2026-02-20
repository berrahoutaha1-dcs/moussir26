const BaseRepository = require('./BaseRepository');

/**
 * Client Repository
 * Handles all database operations for clients
 */
class ClientRepository extends BaseRepository {
  constructor(db) {
    super(db, 'clients');
  }

  /**
   * Find client by code
   * @param {string} code - Client code
   * @returns {Object|null} Client or null
   */
  findByCode(code) {
    return this.findByField('code_client', code);
  }

  /**
   * Find clients by city
   * @param {string} city - City name
   * @returns {Array} Array of clients
   */
  findByCity(city) {
    return this.findAllByField('ville', city);
  }

  /**
   * Find clients by status
   * @param {string} status - Client status
   * @returns {Array} Array of clients
   */
  findByStatus(status) {
    return this.findAllByField('statut', status);
  }

  /**
   * Search clients by name or code
   * @param {string} searchTerm - Search term
   * @returns {Array} Array of matching clients
   */
  search(searchTerm) {
    try {
      const query = `
        SELECT * FROM ${this.tableName}
        WHERE nom_complet LIKE ? 
           OR code_client LIKE ?
        ORDER BY nom_complet ASC
      `;
      const searchPattern = `%${searchTerm}%`;
      const stmt = this.db.prepare(query);
      return stmt.all(searchPattern, searchPattern);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get clients with balance summary
   * @returns {Array} Clients with calculated balances
   */
  getWithBalanceSummary() {
    try {
      const query = `
        SELECT 
          c.*,
          CASE 
            WHEN c.type_solde = 'positif' THEN c.solde
            ELSE -c.solde
          END as balance
        FROM ${this.tableName} c
        ORDER BY c.nom_complet ASC
      `;
      const stmt = this.db.prepare(query);
      return stmt.all();
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ClientRepository;

