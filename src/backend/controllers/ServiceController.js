const ServiceManagementService = require('../services/ServiceManagementService');
const ErrorHandler = require('../utils/ErrorHandler');

/**
 * Service Controller
 */
class ServiceController {
    constructor(db) {
        this.service = new ServiceManagementService(db);
    }

    async getAll(event) {
        try {
            return await this.service.getAll();
        } catch (error) {
            return ErrorHandler.handleError(error, 'ServiceController.getAll');
        }
    }

    async getById(event, id) {
        try {
            return await this.service.getById(id);
        } catch (error) {
            return ErrorHandler.handleError(error, 'ServiceController.getById');
        }
    }

    async create(event, data) {
        try {
            return await this.service.create(data);
        } catch (error) {
            return ErrorHandler.handleError(error, 'ServiceController.create');
        }
    }

    async update(event, id, data) {
        try {
            return await this.service.update(id, data);
        } catch (error) {
            return ErrorHandler.handleError(error, 'ServiceController.update');
        }
    }

    async delete(event, id) {
        try {
            return await this.service.delete(id);
        } catch (error) {
            return ErrorHandler.handleError(error, 'ServiceController.delete');
        }
    }

    async search(event, searchTerm) {
        try {
            return await this.service.search(searchTerm);
        } catch (error) {
            return ErrorHandler.handleError(error, 'ServiceController.search');
        }
    }

    // Category methods
    async getAllCategories(event) {
        try {
            return await this.service.getAllCategories();
        } catch (error) {
            return ErrorHandler.handleError(error, 'ServiceController.getAllCategories');
        }
    }

    async createCategory(event, data) {
        try {
            return await this.service.createCategory(data);
        } catch (error) {
            return ErrorHandler.handleError(error, 'ServiceController.createCategory');
        }
    }

    async updateCategory(event, id, data) {
        try {
            return await this.service.updateCategory(id, data);
        } catch (error) {
            return ErrorHandler.handleError(error, 'ServiceController.updateCategory');
        }
    }

    async deleteCategory(event, id) {
        try {
            return await this.service.deleteCategory(id);
        } catch (error) {
            return ErrorHandler.handleError(error, 'ServiceController.deleteCategory');
        }
    }
}

module.exports = ServiceController;
