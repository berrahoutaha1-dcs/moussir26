const ServiceRepository = require('../repositories/ServiceRepository');
const ServiceCategoryRepository = require('../repositories/ServiceCategoryRepository');
const ServiceModel = require('../models/ServiceModel');
const ResponseHelper = require('../utils/ResponseHelper');
const ErrorHandler = require('../utils/ErrorHandler');

/**
 * Service Management Service
 */
class ServiceManagementService {
    constructor(db) {
        this.db = db;
        this.repository = new ServiceRepository(db);
        this.categoryRepository = new ServiceCategoryRepository(db);
    }

    async getAll() {
        try {
            const rows = this.repository.findAll();
            const models = rows.map(row => ServiceModel.fromDatabase(row));
            return ResponseHelper.success(models);
        } catch (error) {
            return ErrorHandler.handleDatabaseError(error);
        }
    }

    async getById(id) {
        try {
            const row = this.repository.findById(id);
            if (!row) return ResponseHelper.notFound('Service');
            return ResponseHelper.success(ServiceModel.fromDatabase(row));
        } catch (error) {
            return ErrorHandler.handleDatabaseError(error);
        }
    }

    async create(data) {
        try {
            if (!data.name) return ResponseHelper.error('Service name is required');
            const id = this.repository.create(data);
            const newService = this.repository.findById(id);
            return ResponseHelper.success(ServiceModel.fromDatabase(newService), 'Service created successfully');
        } catch (error) {
            return ErrorHandler.handleDatabaseError(error);
        }
    }

    async update(id, data) {
        try {
            const updated = this.repository.update(id, data);
            if (!updated) return ResponseHelper.notFound('Service');
            const updatedService = this.repository.findById(id);
            return ResponseHelper.success(ServiceModel.fromDatabase(updatedService), 'Service updated successfully');
        } catch (error) {
            return ErrorHandler.handleDatabaseError(error);
        }
    }

    async delete(id) {
        try {
            const deleted = this.repository.delete(id);
            if (!deleted) return ResponseHelper.notFound('Service');
            return ResponseHelper.success(null, 'Service deleted successfully');
        } catch (error) {
            return ErrorHandler.handleDatabaseError(error);
        }
    }

    async search(searchTerm) {
        try {
            const rows = this.repository.search(searchTerm);
            const models = rows.map(row => ServiceModel.fromDatabase(row));
            return ResponseHelper.success(models);
        } catch (error) {
            return ErrorHandler.handleDatabaseError(error);
        }
    }

    // Category methods
    async getAllCategories() {
        try {
            const categories = this.categoryRepository.findAll();
            return ResponseHelper.success(categories);
        } catch (error) {
            return ErrorHandler.handleDatabaseError(error);
        }
    }

    async createCategory(data) {
        try {
            if (!data.name) return ResponseHelper.error('Category name is required');
            const id = this.categoryRepository.create(data);
            const newCategory = this.categoryRepository.findById(id);
            return ResponseHelper.success(newCategory, 'Category created successfully');
        } catch (error) {
            return ErrorHandler.handleDatabaseError(error);
        }
    }

    async updateCategory(id, data) {
        try {
            const updated = this.categoryRepository.update(id, data);
            if (!updated) return ResponseHelper.notFound('Category');
            const updatedCategory = this.categoryRepository.findById(id);
            return ResponseHelper.success(updatedCategory, 'Category updated successfully');
        } catch (error) {
            return ErrorHandler.handleDatabaseError(error);
        }
    }

    async deleteCategory(id) {
        try {
            const deleted = this.categoryRepository.delete(id);
            if (!deleted) return ResponseHelper.notFound('Category');
            return ResponseHelper.success(null, 'Category deleted successfully');
        } catch (error) {
            return ErrorHandler.handleDatabaseError(error);
        }
    }
}

module.exports = ServiceManagementService;
