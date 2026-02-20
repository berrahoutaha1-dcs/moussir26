const BaseModel = require('./BaseModel');

/**
 * Product Model
 * Represents a product entity with validation and transformation
 */
class ProductModel extends BaseModel {
  constructor(data = {}) {
    super(data);
    
    this.codeBar = data.codeBar || data.code_bar || null;
    this.ean = data.ean || null;
    this.designation = data.designation || '';
    this.pricePrivate = data.pricePrivate !== undefined ? parseFloat(data.pricePrivate) : (data.price_private !== undefined ? parseFloat(data.price_private) : 0);
    this.priceUpa = data.priceUpa !== undefined ? parseFloat(data.priceUpa) : (data.price_upa !== undefined ? parseFloat(data.price_upa) : 0);
    this.categoryId = data.categoryId || data.category_id || null;
    this.familyId = data.familyId || data.family_id || null;
    this.brandId = data.brandId || data.brand_id || null;
    this.supplierId = data.supplierId || data.supplier_id || null;
    this.stock = data.stock !== undefined ? parseFloat(data.stock) : 0;
    this.sukh = data.sukh !== undefined ? parseFloat(data.sukh) : 0;
    
    // Related data (from joins)
    this.categoryName = data.categoryName || data.category_name || null;
    this.familyName = data.familyName || data.family_name || null;
    this.brandName = data.brandName || data.brand_name || null;
    this.supplierName = data.supplierName || data.supplier_name || null;
  }

  /**
   * Convert to database format
   * @returns {Object} Database format
   */
  toDatabase() {
    return {
      id: this.id,
      code_bar: this.codeBar,
      ean: this.ean,
      designation: this.designation,
      price_private: this.pricePrivate,
      price_upa: this.priceUpa,
      category_id: this.categoryId,
      family_id: this.familyId,
      brand_id: this.brandId,
      supplier_id: this.supplierId,
      stock: this.stock,
      sukh: this.sukh,
      created_at: this.createdAt,
      updated_at: this.updatedAt
    };
  }

  /**
   * Create model from database format
   * @param {Object} dbData - Database format data
   * @returns {ProductModel} Model instance
   */
  static fromDatabase(dbData) {
    if (!dbData) return null;
    
    return new ProductModel({
      id: dbData.id,
      codeBar: dbData.code_bar,
      ean: dbData.ean,
      designation: dbData.designation,
      pricePrivate: dbData.price_private,
      priceUpa: dbData.price_upa,
      categoryId: dbData.category_id,
      familyId: dbData.family_id,
      brandId: dbData.brand_id,
      supplierId: dbData.supplier_id,
      stock: dbData.stock,
      sukh: dbData.sukh,
      categoryName: dbData.category_name,
      familyName: dbData.family_name,
      brandName: dbData.brand_name,
      supplierName: dbData.supplier_name,
      createdAt: dbData.created_at,
      updatedAt: dbData.updated_at
    });
  }

  /**
   * Validate product data
   * @param {boolean} isUpdate - Whether this is an update operation
   * @returns {Object} Validation result
   */
  validate(isUpdate = false) {
    const errors = {};

    if (!isUpdate || this.designation !== undefined) {
      if (!this.designation || this.designation.trim().length === 0) {
        errors.designation = 'Product designation is required';
      }
    }

    if (this.pricePrivate !== undefined && (isNaN(this.pricePrivate) || this.pricePrivate < 0)) {
      errors.pricePrivate = 'Private price must be a valid positive number';
    }

    if (this.priceUpa !== undefined && (isNaN(this.priceUpa) || this.priceUpa < 0)) {
      errors.priceUpa = 'UPA price must be a valid positive number';
    }

    if (this.stock !== undefined && isNaN(this.stock)) {
      errors.stock = 'Stock must be a valid number';
    }

    if (this.codeBar && this.codeBar.length > 50) {
      errors.codeBar = 'Barcode must be less than 50 characters';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Calculate margin percentage
   * @returns {number} Margin percentage
   */
  getMargin() {
    if (this.priceUpa === 0) return 0;
    return ((this.pricePrivate - this.priceUpa) / this.priceUpa) * 100;
  }

  /**
   * Check if product is in stock
   * @returns {boolean} True if stock > 0
   */
  isInStock() {
    return this.stock > 0;
  }

  /**
   * Check if product is low stock
   * @param {number} threshold - Low stock threshold
   * @returns {boolean} True if stock <= threshold
   */
  isLowStock(threshold = 10) {
    return this.stock <= threshold;
  }
}

module.exports = ProductModel;

