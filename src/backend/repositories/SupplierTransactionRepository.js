const BaseRepository = require('./BaseRepository');

/**
 * Supplier Transaction Repository
 * Handles database operations for supplier ledger/transactions
 */
class SupplierTransactionRepository extends BaseRepository {
    constructor(db) {
        super(db, 'supplier_transactions');
    }

    /**
     * Get all transactions for a specific supplier (Situation)
     * @param {number} supplierId 
     * @returns {Array} Array of transactions
     */
    findBySupplier(supplierId) {
        try {
            const stmt = this.db.prepare(`
        SELECT * FROM ${this.tableName} 
        WHERE supplier_id = ? 
        ORDER BY date ASC, created_at ASC
      `);
            return stmt.all(supplierId);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get last transaction for balance calculation
     * @param {number} supplierId 
     * @returns {Object|null}
     */
    getLastTransaction(supplierId) {
        try {
            const stmt = this.db.prepare(`
        SELECT * FROM ${this.tableName} 
        WHERE supplier_id = ? 
        ORDER BY date DESC, created_at DESC 
        LIMIT 1
      `);
            return stmt.get(supplierId) || null;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = SupplierTransactionRepository;
