const BaseRepository = require('./BaseRepository');

/**
 * Client Transaction Repository
 */
class ClientTransactionRepository extends BaseRepository {
    constructor(db) {
        super(db, 'client_transactions');
    }

    /**
     * Find transactions by client ID
     * @param {number} clientId 
     * @returns {Array}
     */
    findByClient(clientId) {
        try {
            const stmt = this.db.prepare(`
        SELECT * FROM ${this.tableName} 
        WHERE client_id = ? 
        ORDER BY date DESC, created_at DESC
      `);
            return stmt.all(clientId);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get latest transaction for a client
     * @param {number} clientId 
     * @returns {Object|null}
     */
    findLatestByClient(clientId) {
        try {
            const stmt = this.db.prepare(`
        SELECT * FROM ${this.tableName} 
        WHERE client_id = ? 
        ORDER BY date DESC, created_at DESC 
        LIMIT 1
      `);
            return stmt.get(clientId) || null;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = ClientTransactionRepository;
