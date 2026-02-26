const BaseRepository = require('./BaseRepository');

/**
 * Client Payment Repository
 */
class ClientPaymentRepository extends BaseRepository {
    constructor(db) {
        super(db, 'client_payments');
    }

    /**
     * Find payments by client ID
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
}

module.exports = ClientPaymentRepository;
