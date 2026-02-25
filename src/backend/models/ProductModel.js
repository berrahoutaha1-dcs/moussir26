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
    this.purchasePrice = data.purchasePrice !== undefined ? parseFloat(data.purchasePrice) : (data.purchase_price !== undefined ? parseFloat(data.purchase_price) : 0);
    this.taxPercent = data.taxPercent !== undefined ? parseFloat(data.taxPercent) : (data.tax_percent !== undefined ? parseFloat(data.tax_percent) : 0);
    this.wholesalePrice = data.wholesalePrice !== undefined ? parseFloat(data.wholesalePrice) : (data.wholesale_price !== undefined ? parseFloat(data.wholesale_price) : 0);
    this.semiWholesalePrice = data.semiWholesalePrice !== undefined ? parseFloat(data.semiWholesalePrice) : (data.semi_wholesale_price !== undefined ? parseFloat(data.semi_wholesale_price) : 0);
    this.retailPrice = data.retailPrice !== undefined ? parseFloat(data.retailPrice) : (data.retail_price !== undefined ? parseFloat(data.retail_price) : 0);
    this.categoryId = data.categoryId || data.category_id || null;
    this.familyId = data.familyId || data.family_id || null;
    this.brandId = data.brandId || data.brand_id || null;
    this.supplierId = data.supplierId || data.supplier_id || null;
    this.stockCategory = data.stockCategory || data.stock_category || 'store_item';
    this.stockManagement = data.stockManagement || data.stock_management || 'unit';
    this.shelf = data.shelf || null;
    this.color = data.color || null;
    this.size = data.size || null;
    this.stock = data.stock !== undefined ? parseFloat(data.stock) : 0;
    this.sukh = data.sukh !== undefined ? parseFloat(data.sukh) : 0;
    this.alertDate = data.alertDate || data.alert_date || null;
    this.alertQuantity = data.alertQuantity !== undefined ? parseFloat(data.alertQuantity) : (data.alert_quantity !== undefined ? parseFloat(data.alert_quantity) : 0);
    this.batchNumber = data.batchNumber || data.batch_number || null;
    this.expiryDate = data.expiryDate || data.expiry_date || null;
    this.imagePath = data.imagePath || data.image_path || null;
    this.storehouseStocks = data.storehouseStocks || [];

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
      purchase_price: this.purchasePrice,
      tax_percent: this.taxPercent,
      wholesale_price: this.wholesalePrice,
      semi_wholesale_price: this.semiWholesalePrice,
      retail_price: this.retailPrice,
      category_id: this.categoryId,
      family_id: this.familyId,
      brand_id: this.brandId,
      supplier_id: this.supplierId,
      stock_category: this.stockCategory,
      stock_management: this.stockManagement,
      shelf: this.shelf,
      color: this.color,
      size: this.size,
      stock: this.stock,
      sukh: this.sukh,
      alert_date: this.alertDate,
      alert_quantity: this.alertQuantity,
      batch_number: this.batchNumber,
      expiry_date: this.expiryDate,
      image_path: this.imagePath,
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
      purchasePrice: dbData.purchase_price,
      taxPercent: dbData.tax_percent,
      wholesalePrice: dbData.wholesale_price,
      semiWholesalePrice: dbData.semi_wholesale_price,
      retailPrice: dbData.retail_price,
      categoryId: dbData.category_id,
      familyId: dbData.family_id,
      brandId: dbData.brand_id,
      supplierId: dbData.supplier_id,
      stockCategory: dbData.stock_category,
      stockManagement: dbData.stock_management,
      shelf: dbData.shelf,
      color: dbData.color,
      size: dbData.size,
      stock: dbData.stock,
      sukh: dbData.sukh,
      alertDate: dbData.alert_date,
      alertQuantity: dbData.alert_quantity,
      batchNumber: dbData.batch_number,
      expiryDate: dbData.expiry_date,
      imagePath: dbData.image_path,
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

    if (this.purchasePrice !== undefined && (isNaN(this.purchasePrice) || this.purchasePrice < 0)) {
      errors.purchasePrice = 'Purchase price must be a valid positive number';
    }

    if (this.retailPrice !== undefined && (isNaN(this.retailPrice) || this.retailPrice < 0)) {
      errors.retailPrice = 'Retail price must be a valid positive number';
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
    if (this.purchasePrice === 0) return 0;
    return ((this.retailPrice - this.purchasePrice) / this.purchasePrice) * 100;
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

