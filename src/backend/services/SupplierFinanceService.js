const SupplierPaymentRepository = require('../repositories/SupplierPaymentRepository');
const SupplierTransactionRepository = require('../repositories/SupplierTransactionRepository');
const SupplierRepository = require('../repositories/SupplierRepository');
const ResponseHelper = require('../utils/ResponseHelper');
const ErrorHandler = require('../utils/ErrorHandler');

/**
 * Supplier Finance Service
 * Handles payments, transactions and balance synchronization
 */
class SupplierFinanceService {
    constructor(db) {
        this.paymentRepo = new SupplierPaymentRepository(db);
        this.transactionRepo = new SupplierTransactionRepository(db);
        this.supplierRepo = new SupplierRepository(db);
        this.db = db;
    }

    /**
     * Create a payment
     * @param {Object} paymentData 
     */
    async createPayment(paymentData) {
        const transaction = this.db.transaction(() => {
            // 1. Get current supplier to get current solde
            const supplier = this.supplierRepo.findById(paymentData.supplier_id);
            if (!supplier) throw new Error('Supplier not found');

            // 2. Create Payment record
            const payment = this.paymentRepo.create(paymentData);

            // 3. Update Supplier Balance
            // Assuming 'positif' means we owe them (Credit). Payment reduces what we owe.
            const currentSolde = supplier.solde || 0;
            const newSolde = currentSolde - paymentData.amount;

            this.supplierRepo.update(supplier.id, { solde: newSolde });

            // 4. Create Transaction record (Ledger)
            this.transactionRepo.create({
                supplier_id: supplier.id,
                type: 'payment',
                date: paymentData.date,
                amount: paymentData.amount,
                debit: 0,
                credit: paymentData.amount,
                balance_after: newSolde,
                reference: paymentData.reference,
                description: `Paiement ${paymentData.method}${paymentData.note ? ': ' + paymentData.note : ''}`
            });

            return payment;
        });

        try {
            const result = transaction();
            return ResponseHelper.success(result, 'Payment recorded successfully');
        } catch (error) {
            return ErrorHandler.handleError(error, 'SupplierFinanceService.createPayment');
        }
    }

    /**
     * Get payments by supplier
     */
    async getPaymentsBySupplier(supplierId) {
        try {
            const payments = this.paymentRepo.findBySupplier(supplierId);
            return ResponseHelper.success(payments);
        } catch (error) {
            return ErrorHandler.handleError(error, 'SupplierFinanceService.getPaymentsBySupplier');
        }
    }

    /**
     * Get transactions by supplier (Situation)
     */
    async getTransactionsBySupplier(supplierId) {
        try {
            const transactions = this.transactionRepo.findBySupplier(supplierId);
            return ResponseHelper.success(transactions);
        } catch (error) {
            return ErrorHandler.handleError(error, 'SupplierFinanceService.getTransactionsBySupplier');
        }
    }
}

module.exports = SupplierFinanceService;
