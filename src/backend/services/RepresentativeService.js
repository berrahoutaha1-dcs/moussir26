const RepresentativeRepository = require('../repositories/RepresentativeRepository');
const RepresentativeModel = require('../models/RepresentativeModel');
const ResponseHelper = require('../utils/ResponseHelper');
const ErrorHandler = require('../utils/ErrorHandler');

class RepresentativeService {
    constructor(db) {
        this.repository = new RepresentativeRepository(db);
    }

    /**
     * Get all representatives
     * @returns {Object} Response object
     */
    async getAll() {
        try {
            const records = this.repository.findAllSorted();
            const models = records.map(r => RepresentativeModel.fromDatabase(r));
            return ResponseHelper.success(models);
        } catch (error) {
            return ErrorHandler.handleError(error, 'RepresentativeService.getAll');
        }
    }

    /**
     * Get representative by ID
     * @param {number} id - Representative ID
     * @returns {Object} Response object
     */
    async getById(id) {
        try {
            const record = this.repository.findById(id);
            if (!record) return ResponseHelper.notFound('Representative');
            const model = RepresentativeModel.fromDatabase(record);
            return ResponseHelper.success(model);
        } catch (error) {
            return ErrorHandler.handleError(error, 'RepresentativeService.getById');
        }
    }

    /**
     * Create new representative
     * @param {Object} data - Representative data
     * @returns {Object} Response object
     */
    async create(data) {
        try {
            const model = new RepresentativeModel(data);
            const validation = model.validate();
            if (!validation.isValid) {
                return ErrorHandler.handleValidationError(validation.errors);
            }

            const dbData = model.toDatabase();
            delete dbData.id;
            delete dbData.created_at;
            delete dbData.updated_at;

            const result = this.repository.create(dbData);
            const createdModel = RepresentativeModel.fromDatabase(result);
            return ResponseHelper.success(createdModel, 'Représentant créé avec succès');
        } catch (error) {
            return ErrorHandler.handleDatabaseError(error);
        }
    }

    /**
     * Update representative
     * @param {number} id - Representative ID
     * @param {Object} data - Updated data
     * @returns {Object} Response object
     */
    async update(id, data) {
        try {
            const existing = this.repository.findById(id);
            if (!existing) return ResponseHelper.notFound('Representative');

            const existingModel = RepresentativeModel.fromDatabase(existing);
            const updatedModel = new RepresentativeModel({ ...existingModel.toJSON(), ...data });

            const validation = updatedModel.validate();
            if (!validation.isValid) {
                return ErrorHandler.handleValidationError(validation.errors);
            }

            const dbData = updatedModel.toDatabase();
            delete dbData.id;
            delete dbData.created_at;
            delete dbData.updated_at;

            const result = this.repository.update(id, dbData);
            if (!result) return ResponseHelper.notFound('Representative');

            const updated = RepresentativeModel.fromDatabase(result);
            return ResponseHelper.success(updated, 'Représentant mis à jour avec succès');
        } catch (error) {
            return ErrorHandler.handleDatabaseError(error);
        }
    }

    /**
     * Delete representative
     * @param {number} id - Representative ID
     * @returns {Object} Response object
     */
    async delete(id) {
        try {
            const deleted = this.repository.delete(id);
            if (!deleted) return ResponseHelper.notFound('Representative');
            return ResponseHelper.success(null, 'Représentant supprimé avec succès');
        } catch (error) {
            return ErrorHandler.handleDatabaseError(error);
        }
    }

    /**
     * Search representatives
     * @param {string} searchTerm - Search term
     * @returns {Object} Response object
     */
    async search(searchTerm) {
        try {
            if (!searchTerm || searchTerm.trim().length === 0) {
                return this.getAll();
            }
            const records = this.repository.search(searchTerm.trim());
            const models = records.map(r => RepresentativeModel.fromDatabase(r));
            return ResponseHelper.success(models);
        } catch (error) {
            return ErrorHandler.handleError(error, 'RepresentativeService.search');
        }
    }
}

module.exports = RepresentativeService;
