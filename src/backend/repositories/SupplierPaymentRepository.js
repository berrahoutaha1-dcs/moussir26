const BaseRepository = require('./BaseRepository');

/**
 * Supplier Payment Repository
 * Handles database operations for supplier payments
 */
class SupplierPaymentRepository extends BaseRepository {
    constructor(db) {
        super(db, 'supplier_payments');
    }

    /**
     * Get all payments for a specific supplier
     * @param {number} supplierId 
     * @returns {Array} Array of payments
     */
    findBySupplier(supplierId) {
        try {
            const stmt = this.db.prepare(`
        SELECT * FROM ${this.tableName} 
        WHERE supplier_id = ? 
        ORDER BY date DESC, created_at DESC
      `);
            return stmt.all(supplierId);
        } catch (error) {
            throw error;
        }
    }
}

module.exports = SupplierPaymentRepository;
