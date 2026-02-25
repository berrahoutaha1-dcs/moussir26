const ClientService = require('../services/ClientService');
const ErrorHandler = require('../utils/ErrorHandler');

/**
 * Client Controller
 * Handles IPC requests and delegates to service layer
 */
class ClientController {
    constructor(db) {
        this.service = new ClientService(db);
    }

    async getAll(event, options = {}) {
        try {
            return await this.service.getAll(options);
        } catch (error) {
            return ErrorHandler.handleError(error, 'ClientController.getAll');
        }
    }

    async getById(event, id) {
        try {
            return await this.service.getById(id);
        } catch (error) {
            return ErrorHandler.handleError(error, 'ClientController.getById');
        }
    }

    async create(event, clientData) {
        try {
            return await this.service.create(clientData);
        } catch (error) {
            return ErrorHandler.handleError(error, 'ClientController.create');
        }
    }

    async update(event, id, clientData) {
        try {
            return await this.service.update(id, clientData);
        } catch (error) {
            return ErrorHandler.handleError(error, 'ClientController.update');
        }
    }

    async delete(event, id) {
        try {
            return await this.service.delete(id);
        } catch (error) {
            return ErrorHandler.handleError(error, 'ClientController.delete');
        }
    }

    async search(event, searchTerm) {
        try {
            return await this.service.search(searchTerm);
        } catch (error) {
            return ErrorHandler.handleError(error, 'ClientController.search');
        }
    }
}

module.exports = ClientController;
