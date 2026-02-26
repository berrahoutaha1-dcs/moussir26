const ClientPaymentRepository = require('../repositories/ClientPaymentRepository');
const ClientTransactionRepository = require('../repositories/ClientTransactionRepository');
const ClientRepository = require('../repositories/ClientRepository');
const ResponseHelper = require('../utils/ResponseHelper');
const ErrorHandler = require('../utils/ErrorHandler');

/**
 * Client Finance Service
 * Handles payments, transactions and balance synchronization
 */
class ClientFinanceService {
    constructor(db) {
        this.paymentRepo = new ClientPaymentRepository(db);
        this.transactionRepo = new ClientTransactionRepository(db);
        this.clientRepo = new ClientRepository(db);
        this.db = db;
    }

    /**
     * Create a payment
     * @param {Object} paymentData 
     */
    async createPayment(paymentData) {
        const transaction = this.db.transaction(() => {
            // 1. Get current client to get current solde
            const client = this.clientRepo.findById(paymentData.client_id);
            if (!client) throw new Error('Client not found');

            // 2. Create Payment record
            const payment = this.paymentRepo.create(paymentData);

            // 3. Update Client Balance
            // Handle balance update logic consistently with ClientPaymentModal.js
            const currentSolde = client.solde || 0;
            const currentType = client.type_solde || 'positif';
            const currentPaid = client.montant_paye || 0;

            let currentBalanceValue = currentType === 'negatif' ? -currentSolde : currentSolde;
            let newBalanceValue = currentBalanceValue + paymentData.amount;

            const newSolde = Math.abs(newBalanceValue);
            const newType = newBalanceValue >= 0 ? 'positif' : 'negatif';
            const newPaid = currentPaid + paymentData.amount;

            this.clientRepo.update(client.id, {
                solde: newSolde,
                type_solde: newType,
                montant_paye: newPaid
            });

            // 4. Create Transaction record (Ledger)
            this.transactionRepo.create({
                client_id: client.id,
                type: 'payment',
                date: paymentData.date,
                amount: paymentData.amount,
                debit: paymentData.amount, // Payments are debited from the account
                credit: 0,
                balance_after: newBalanceValue,
                reference: paymentData.reference,
                description: `Paiement ${paymentData.method}${paymentData.note ? ': ' + paymentData.note : ''}`
            });

            return payment;
        });

        try {
            const result = transaction();
            return ResponseHelper.success(result, 'Payment recorded successfully');
        } catch (error) {
            return ErrorHandler.handleError(error, 'ClientFinanceService.createPayment');
        }
    }

    /**
     * Get payments by client
     */
    async getPaymentsByClient(clientId) {
        try {
            const payments = this.paymentRepo.findByClient(clientId);
            return ResponseHelper.success(payments);
        } catch (error) {
            return ErrorHandler.handleError(error, 'ClientFinanceService.getPaymentsByClient');
        }
    }

    /**
     * Get transactions by client (Situation)
     */
    async getTransactionsByClient(clientId) {
        try {
            const transactions = this.transactionRepo.findByClient(clientId);
            return ResponseHelper.success(transactions);
        } catch (error) {
            return ErrorHandler.handleError(error, 'ClientFinanceService.getTransactionsByClient');
        }
    }
}

module.exports = ClientFinanceService;
