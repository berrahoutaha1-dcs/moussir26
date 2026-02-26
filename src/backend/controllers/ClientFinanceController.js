const ClientFinanceService = require('../services/ClientFinanceService');
const ErrorHandler = require('../utils/ErrorHandler');

/**
 * Client Finance Controller
 * Handles IPC requests for client payments and transactions
 */
class ClientFinanceController {
    constructor(db) {
        this.service = new ClientFinanceService(db);
    }

    async createPayment(event, paymentData) {
        try {
            if (!paymentData || !paymentData.client_id) {
                return { success: false, error: 'Payment data and Client ID are required' };
            }
            return await this.service.createPayment(paymentData);
        } catch (error) {
            return ErrorHandler.handleError(error, 'ClientFinanceController.createPayment');
        }
    }

    async getPaymentsByClient(event, clientId) {
        try {
            if (!clientId) {
                return { success: false, error: 'Client ID is required' };
            }
            return await this.service.getPaymentsByClient(clientId);
        } catch (error) {
            return ErrorHandler.handleError(error, 'ClientFinanceController.getPaymentsByClient');
        }
    }

    async getTransactionsByClient(event, clientId) {
        try {
            if (!clientId) {
                return { success: false, error: 'Client ID is required' };
            }
            return await this.service.getTransactionsByClient(clientId);
        } catch (error) {
            return ErrorHandler.handleError(error, 'ClientFinanceController.getTransactionsByClient');
        }
    }
}

module.exports = ClientFinanceController;
