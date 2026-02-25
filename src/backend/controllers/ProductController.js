const ProductService = require('../services/ProductService');
const ErrorHandler = require('../utils/ErrorHandler');

/**
 * Product Controller
 * Handles IPC requests for products
 */
class ProductController {
    constructor(db) {
        this.service = new ProductService(db);
    }

    async getAll(event, options = {}) {
        try {
            return await this.service.getAll(options);
        } catch (error) {
            return ErrorHandler.handleError(error, 'ProductController.getAll');
        }
    }

    async getById(event, id) {
        try {
            if (!id) return { success: false, error: 'Product ID is required' };
            return await this.service.getById(id);
        } catch (error) {
            return ErrorHandler.handleError(error, 'ProductController.getById');
        }
    }

    async getByBarcode(event, barcode) {
        try {
            if (!barcode) return { success: false, error: 'Barcode is required' };
            return await this.service.getByBarcode(barcode);
        } catch (error) {
            return ErrorHandler.handleError(error, 'ProductController.getByBarcode');
        }
    }

    async create(event, productData) {
        try {
            if (!productData) return { success: false, error: 'Product data is required' };
            return await this.service.create(productData);
        } catch (error) {
            return ErrorHandler.handleError(error, 'ProductController.create');
        }
    }

    async update(event, id, productData) {
        try {
            if (!id) return { success: false, error: 'Product ID is required' };
            if (!productData) return { success: false, error: 'Product data is required' };
            return await this.service.update(id, productData);
        } catch (error) {
            return ErrorHandler.handleError(error, 'ProductController.update');
        }
    }

    async delete(event, id) {
        try {
            if (!id) return { success: false, error: 'Product ID is required' };
            return await this.service.delete(id);
        } catch (error) {
            return ErrorHandler.handleError(error, 'ProductController.delete');
        }
    }

    async search(event, searchTerm) {
        try {
            return await this.service.search(searchTerm);
        } catch (error) {
            return ErrorHandler.handleError(error, 'ProductController.search');
        }
    }
}

module.exports = ProductController;
