const ClientRepository = require('../repositories/ClientRepository');
const ClientModel = require('../models/ClientModel');
const ResponseHelper = require('../utils/ResponseHelper');
const ErrorHandler = require('../utils/ErrorHandler');

/**
 * Client Service
 * Business logic layer for clients
 */
class ClientService {
    constructor(db) {
        this.repository = new ClientRepository(db);
        this.db = db;
    }

    /**
     * Get all clients
     */
    async getAll(options = {}) {
        try {
            const clients = this.repository.getWithBalanceSummary(options);
            const models = clients.map(c => ClientModel.fromDatabase(c));
            return ResponseHelper.success(models);
        } catch (error) {
            return ErrorHandler.handleError(error, 'ClientService.getAll');
        }
    }

    /**
     * Get client by ID
     */
    async getById(id) {
        try {
            const client = this.repository.findById(id);
            if (!client) return ResponseHelper.notFound('Client');
            return ResponseHelper.success(ClientModel.fromDatabase(client));
        } catch (error) {
            return ErrorHandler.handleError(error, 'ClientService.getById');
        }
    }

    /**
     * Create new client
     */
    async create(clientData) {
        try {
            const model = new ClientModel(clientData);
            const validation = model.validate(false);
            if (!validation.isValid) return ErrorHandler.handleValidationError(validation.errors);

            const existing = this.repository.findByCode(model.codeClient);
            if (existing) return ResponseHelper.error('Client code already exists', 'DUPLICATE_CODE');

            const dbData = model.toDatabase();
            delete dbData.id;
            delete dbData.created_at;
            delete dbData.updated_at;

            const result = this.repository.create(dbData);
            return ResponseHelper.success(ClientModel.fromDatabase(result), 'Client created successfully');
        } catch (error) {
            return ErrorHandler.handleDatabaseError(error);
        }
    }

    /**
     * Update client
     */
    async update(id, clientData) {
        try {
            const existing = this.repository.findById(id);
            if (!existing) return ResponseHelper.notFound('Client');

            const existingModel = ClientModel.fromDatabase(existing);
            const updatedModel = new ClientModel({ ...existingModel.toJSON(), ...clientData });

            const validation = updatedModel.validate(true);
            if (!validation.isValid) return ErrorHandler.handleValidationError(validation.errors);

            if (clientData.codeClient && clientData.codeClient !== existing.code_client) {
                const codeExists = this.repository.findByCode(clientData.codeClient);
                if (codeExists) return ResponseHelper.error('Client code already exists', 'DUPLICATE_CODE');
            }

            const dbData = updatedModel.toDatabase();
            delete dbData.id;
            delete dbData.created_at;
            delete dbData.updated_at;

            const result = this.repository.update(id, dbData);
            return ResponseHelper.success(ClientModel.fromDatabase(result), 'Client updated successfully');
        } catch (error) {
            return ErrorHandler.handleDatabaseError(error);
        }
    }

    /**
     * Delete client
     */
    async delete(id) {
        try {
            const deleted = this.repository.delete(id);
            if (!deleted) return ResponseHelper.notFound('Client');
            return ResponseHelper.success(null, 'Client deleted successfully');
        } catch (error) {
            return ErrorHandler.handleDatabaseError(error);
        }
    }

    /**
     * Search clients
     */
    async search(searchTerm) {
        try {
            const clients = this.repository.search(searchTerm);
            const models = clients.map(c => ClientModel.fromDatabase(c));
            return ResponseHelper.success(models);
        } catch (error) {
            return ErrorHandler.handleError(error, 'ClientService.search');
        }
    }
}

module.exports = ClientService;
