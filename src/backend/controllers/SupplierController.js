const SupplierService = require('../services/SupplierService');
const ErrorHandler = require('../utils/ErrorHandler');

/**
 * Supplier Controller
 * Handles IPC requests and delegates to service layer
 * Acts as the interface between IPC handlers and business logic
 */
class SupplierController {
  constructor(db) {
    this.service = new SupplierService(db);
  }

  /**
   * Handle get all suppliers request
   */
  async getAll(event, options = {}) {
    try {
      return await this.service.getAll(options);
    } catch (error) {
      return ErrorHandler.handleError(error, 'SupplierController.getAll');
    }
  }

  /**
   * Handle get supplier by ID request
   */
  async getById(event, id) {
    try {
      if (!id) {
        return { success: false, error: 'Supplier ID is required' };
      }
      return await this.service.getById(id);
    } catch (error) {
      return ErrorHandler.handleError(error, 'SupplierController.getById');
    }
  }

  /**
   * Handle create supplier request
   */
  async create(event, supplierData) {
    try {
      if (!supplierData) {
        return { success: false, error: 'Supplier data is required' };
      }
      return await this.service.create(supplierData);
    } catch (error) {
      return ErrorHandler.handleError(error, 'SupplierController.create');
    }
  }

  /**
   * Handle update supplier request
   */
  async update(event, id, supplierData) {
    try {
      if (!id) {
        return { success: false, error: 'Supplier ID is required' };
      }
      if (!supplierData) {
        return { success: false, error: 'Supplier data is required' };
      }
      return await this.service.update(id, supplierData);
    } catch (error) {
      return ErrorHandler.handleError(error, 'SupplierController.update');
    }
  }

  /**
   * Handle delete supplier request
   */
  async delete(event, id) {
    try {
      if (!id) {
        return { success: false, error: 'Supplier ID is required' };
      }
      return await this.service.delete(id);
    } catch (error) {
      return ErrorHandler.handleError(error, 'SupplierController.delete');
    }
  }

  /**
   * Handle search suppliers request
   */
  async search(event, searchTerm) {
    try {
      return await this.service.search(searchTerm);
    } catch (error) {
      return ErrorHandler.handleError(error, 'SupplierController.search');
    }
  }
}

module.exports = SupplierController;

