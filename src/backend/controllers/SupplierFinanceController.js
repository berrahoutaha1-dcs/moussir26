const SupplierFinanceService = require('../services/SupplierFinanceService');
const ErrorHandler = require('../utils/ErrorHandler');

/**
 * Supplier Finance Controller
 * Handles IPC requests for payments and transactions
 */
class SupplierFinanceController {
    constructor(db) {
        this.service = new SupplierFinanceService(db);
    }

    async createPayment(event, paymentData) {
        try {
            if (!paymentData || !paymentData.supplier_id) {
                return { success: false, error: 'Payment data and Supplier ID are required' };
            }
            return await this.service.createPayment(paymentData);
        } catch (error) {
            return ErrorHandler.handleError(error, 'SupplierFinanceController.createPayment');
        }
    }

    async getPaymentsBySupplier(event, supplierId) {
        try {
            if (!supplierId) {
                return { success: false, error: 'Supplier ID is required' };
            }
            return await this.service.getPaymentsBySupplier(supplierId);
        } catch (error) {
            return ErrorHandler.handleError(error, 'SupplierFinanceController.getPaymentsBySupplier');
        }
    }

    async getTransactionsBySupplier(event, supplierId) {
        try {
            if (!supplierId) {
                return { success: false, error: 'Supplier ID is required' };
            }
            return await this.service.getTransactionsBySupplier(supplierId);
        } catch (error) {
            return ErrorHandler.handleError(error, 'SupplierFinanceController.getTransactionsBySupplier');
        }
    }
}

module.exports = SupplierFinanceController;
