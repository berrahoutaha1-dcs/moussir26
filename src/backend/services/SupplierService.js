const SupplierRepository = require('../repositories/SupplierRepository');
const SupplierModel = require('../models/SupplierModel');
const ResponseHelper = require('../utils/ResponseHelper');
const ErrorHandler = require('../utils/ErrorHandler');

/**
 * Supplier Service
 * Business logic layer for suppliers
 * Handles validation, business rules, and coordinates with repository
 */
class SupplierService {
  constructor(db) {
    this.repository = new SupplierRepository(db);
  }

  /**
   * Get all suppliers
   * @param {Object} options - Query options
   * @returns {Object} Response object
   */
  async getAll(options = {}) {
    try {
      const suppliers = this.repository.findAll(options);
      // Convert database format to models
      const models = suppliers.map(s => SupplierModel.fromDatabase(s));
      return ResponseHelper.success(models);
    } catch (error) {
      return ErrorHandler.handleError(error, 'SupplierService.getAll');
    }
  }

  /**
   * Get supplier by ID
   * @param {number} id - Supplier ID
   * @returns {Object} Response object
   */
  async getById(id) {
    try {
      const supplier = this.repository.findById(id);
      
      if (!supplier) {
        return ResponseHelper.notFound('Supplier');
      }
      
      // Convert to model
      const model = SupplierModel.fromDatabase(supplier);
      return ResponseHelper.success(model);
    } catch (error) {
      return ErrorHandler.handleError(error, 'SupplierService.getById');
    }
  }

  /**
   * Create new supplier
   * @param {Object} supplierData - Supplier data
   * @returns {Object} Response object
   */
  async create(supplierData) {
    try {
      // Create model from input data
      const model = new SupplierModel(supplierData);
      
      // Validate using model
      const validation = model.validate(false);
      if (!validation.isValid) {
        return ErrorHandler.handleValidationError(validation.errors);
      }

      // Check if code already exists
      const existing = this.repository.findByCode(model.codeSupplier);
      if (existing) {
        return ResponseHelper.error('Supplier code already exists', 'DUPLICATE_CODE');
      }

      // Convert model to database format
      const dbData = model.toDatabase();
      delete dbData.id; // Remove id for insert
      delete dbData.created_at;
      delete dbData.updated_at;
      
      // Create supplier
      const result = this.repository.create(dbData);
      
      // Return as model
      const createdModel = SupplierModel.fromDatabase(result);
      return ResponseHelper.success(createdModel, 'Supplier created successfully');
    } catch (error) {
      return ErrorHandler.handleDatabaseError(error);
    }
  }

  /**
   * Update supplier
   * @param {number} id - Supplier ID
   * @param {Object} supplierData - Updated supplier data
   * @returns {Object} Response object
   */
  async update(id, supplierData) {
    try {
      // Check if supplier exists
      const existing = this.repository.findById(id);
      if (!existing) {
        return ResponseHelper.notFound('Supplier');
      }

      // Create model with existing data merged with updates
      const existingModel = SupplierModel.fromDatabase(existing);
      const updatedModel = new SupplierModel({ ...existingModel.toJSON(), ...supplierData });
      
      // Validate using model
      const validation = updatedModel.validate(true);
      if (!validation.isValid) {
        return ErrorHandler.handleValidationError(validation.errors);
      }

      // Check code uniqueness if code is being changed
      if (supplierData.codeSupplier && supplierData.codeSupplier !== existing.code_supplier) {
        const codeExists = this.repository.findByCode(supplierData.codeSupplier);
        if (codeExists) {
          return ResponseHelper.error('Supplier code already exists', 'DUPLICATE_CODE');
        }
      }

      // Convert model to database format (only changed fields)
      const dbData = updatedModel.toDatabase();
      delete dbData.id;
      delete dbData.created_at;
      delete dbData.updated_at; // Let DB handle this
      
      // Update supplier
      const result = this.repository.update(id, dbData);
      
      if (!result) {
        return ResponseHelper.notFound('Supplier');
      }
      
      // Return as model
      const updated = SupplierModel.fromDatabase(result);
      return ResponseHelper.success(updated, 'Supplier updated successfully');
    } catch (error) {
      return ErrorHandler.handleDatabaseError(error);
    }
  }

  /**
   * Delete supplier
   * @param {number} id - Supplier ID
   * @returns {Object} Response object
   */
  async delete(id) {
    try {
      // Check if supplier exists
      const existing = this.repository.findById(id);
      if (!existing) {
        return ResponseHelper.notFound('Supplier');
      }

      // Check if supplier has related products
      // This is a business rule - you might want to prevent deletion if supplier has products
      // For now, we'll allow deletion (cascade will handle it if foreign keys are set)

      const deleted = this.repository.delete(id);
      
      if (!deleted) {
        return ResponseHelper.notFound('Supplier');
      }
      
      return ResponseHelper.success(null, 'Supplier deleted successfully');
    } catch (error) {
      return ErrorHandler.handleDatabaseError(error);
    }
  }

  /**
   * Search suppliers
   * @param {string} searchTerm - Search term
   * @returns {Object} Response object
   */
  async search(searchTerm) {
    try {
      if (!searchTerm || searchTerm.trim().length === 0) {
        return ResponseHelper.error('Search term is required', 'INVALID_INPUT');
      }

      const suppliers = this.repository.search(searchTerm.trim());
      // Convert to models
      const models = suppliers.map(s => SupplierModel.fromDatabase(s));
      return ResponseHelper.success(models);
    } catch (error) {
      return ErrorHandler.handleError(error, 'SupplierService.search');
    }
  }
}

module.exports = SupplierService;

