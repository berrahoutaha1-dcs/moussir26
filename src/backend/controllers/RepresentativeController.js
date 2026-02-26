const RepresentativeService = require('../services/RepresentativeService');
const ErrorHandler = require('../utils/ErrorHandler');

class RepresentativeController {
    constructor(db) {
        this.service = new RepresentativeService(db);
    }

    async getAll(event, options = {}) {
        try {
            return await this.service.getAll();
        } catch (error) {
            return ErrorHandler.handleError(error, 'RepresentativeController.getAll');
        }
    }

    async getById(event, id) {
        try {
            if (!id) return { success: false, error: 'Representative ID is required' };
            return await this.service.getById(id);
        } catch (error) {
            return ErrorHandler.handleError(error, 'RepresentativeController.getById');
        }
    }

    async create(event, data) {
        try {
            if (!data) return { success: false, error: 'Representative data is required' };
            return await this.service.create(data);
        } catch (error) {
            return ErrorHandler.handleError(error, 'RepresentativeController.create');
        }
    }

    async update(event, id, data) {
        try {
            if (!id) return { success: false, error: 'Representative ID is required' };
            if (!data) return { success: false, error: 'Representative data is required' };
            return await this.service.update(id, data);
        } catch (error) {
            return ErrorHandler.handleError(error, 'RepresentativeController.update');
        }
    }

    async delete(event, id) {
        try {
            if (!id) return { success: false, error: 'Representative ID is required' };
            return await this.service.delete(id);
        } catch (error) {
            return ErrorHandler.handleError(error, 'RepresentativeController.delete');
        }
    }

    async search(event, searchTerm) {
        try {
            return await this.service.search(searchTerm);
        } catch (error) {
            return ErrorHandler.handleError(error, 'RepresentativeController.search');
        }
    }
}

module.exports = RepresentativeController;
