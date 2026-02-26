const ProductRepository = require('../repositories/ProductRepository');
const ProductModel = require('../models/ProductModel');
const ResponseHelper = require('../utils/ResponseHelper');
const ErrorHandler = require('../utils/ErrorHandler');
const appConfig = require('../config/app.config');
const fs = require('fs');
const path = require('path');

/**
 * Product Service
 * Business logic layer for products
 */
class ProductService {
    constructor(db) {
        this.db = db;
        this.repository = new ProductRepository(db);
    }

    async getAll(options = {}) {
        try {
            const products = this.repository.findAllWithRelations(options);
            const models = products.map(p => ProductModel.fromDatabase(p));
            return ResponseHelper.success(models);
        } catch (error) {
            return ErrorHandler.handleError(error, 'ProductService.getAll');
        }
    }

    async getById(id) {
        try {
            const product = this.repository.findById(id);
            if (!product) {
                return ResponseHelper.notFound('Product');
            }
            const model = ProductModel.fromDatabase(product);
            model.storehouseStocks = this.repository.getDepotStocks(id);
            return ResponseHelper.success(model);
        } catch (error) {
            return ErrorHandler.handleError(error, 'ProductService.getById');
        }
    }

    async getByBarcode(barcode) {
        try {
            const product = this.repository.findByBarcode(barcode);
            if (!product) {
                return ResponseHelper.notFound('Product');
            }
            return ResponseHelper.success(ProductModel.fromDatabase(product));
        } catch (error) {
            return ErrorHandler.handleError(error, 'ProductService.getByBarcode');
        }
    }

    async create(productData) {
        try {
            // Auto-create relations if names are provided but IDs are missing
            if (productData.categoryName && !productData.categoryId) {
                productData.categoryId = this._getOrCreateCategory(productData.categoryName);
            }
            if (productData.familyName && !productData.familyId) {
                productData.familyId = this._getOrCreateFamily(productData.familyName);
            }
            if (productData.brandName && !productData.brandId) {
                productData.brandId = this._getOrCreateBrand(productData.brandName);
            }
            if (productData.supplierName && !productData.supplierId) {
                productData.supplierId = this._getOrCreateSupplier(productData.supplierName);
            }

            // Handle image saving if provided
            if (productData.image) {
                console.log('DEBUG: Saving image for new product');
                productData.imagePath = this._saveProductImage(productData.image, productData.codeBar || Date.now());
                console.log('DEBUG: Saved image path:', productData.imagePath);
            }

            const model = new ProductModel(productData);

            const validation = model.validate(false);
            if (!validation.isValid) {
                return ErrorHandler.handleValidationError(validation.errors);
            }

            if (model.codeBar) {
                const existing = this.repository.findByBarcode(model.codeBar);
                if (existing) {
                    return ResponseHelper.error('Product barcode already exists', 'DUPLICATE_CODE');
                }
            }

            const dbData = model.toDatabase();
            delete dbData.id;
            delete dbData.created_at;
            delete dbData.updated_at;

            const result = this.repository.create(dbData);

            // SYNC TO BATCH TABLE: If batch info exists, create a batch record
            if (result && result.id && (model.batchNumber || model.expiryDate || model.productionDate)) {
                try {
                    this.db.prepare(`
                        INSERT INTO batches (num_lot, product_id, designation, quantity, expiry_date, production_date, reception_date, alert_quantity, alert_date)
                        VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?)
                    `).run(
                        model.batchNumber || `LOT-${result.id}`,
                        result.id,
                        model.designation,
                        model.stock || 0,
                        model.expiryDate || null,
                        model.productionDate || null,
                        model.alertQuantity || 0,
                        model.alertDate || null
                    );
                } catch (batchError) {
                    console.error('Error creating initial batch:', batchError);
                    // We don't fail the whole product creation if batch sync fails
                }
            }

            // SYNC DEPOT STOCKS
            if (result && result.id && productData.storehouseStocks) {
                console.log('Saving depot stocks for new product:', result.id, productData.storehouseStocks);
                this.repository.saveDepotStocks(result.id, productData.storehouseStocks);
            }

            const finalModel = ProductModel.fromDatabase(result);
            finalModel.storehouseStocks = this.repository.getDepotStocks(result.id);
            console.log('Final created model with stocks:', finalModel.storehouseStocks);

            return ResponseHelper.success(finalModel, 'Product created successfully');
        } catch (error) {
            return ErrorHandler.handleDatabaseError(error);
        }
    }

    async update(id, productData) {
        try {
            const existing = this.repository.findById(id);
            if (!existing) {
                return ResponseHelper.notFound('Product');
            }

            // Auto-create relations if names are provided but IDs are missing
            if (productData.categoryName && !productData.categoryId) {
                productData.categoryId = this._getOrCreateCategory(productData.categoryName);
            }
            if (productData.familyName && !productData.familyId) {
                productData.familyId = this._getOrCreateFamily(productData.familyName);
            }
            if (productData.brandName && !productData.brandId) {
                productData.brandId = this._getOrCreateBrand(productData.brandName);
            }
            if (productData.supplierName && !productData.supplierId) {
                productData.supplierId = this._getOrCreateSupplier(productData.supplierName);
            }

            // Handle image saving/update if provided
            if (productData.image) {
                console.log('DEBUG: Updating image for existing product', id);
                productData.imagePath = this._saveProductImage(productData.image, productData.codeBar || id);
                console.log('DEBUG: Updated image path:', productData.imagePath);
            }

            const existingModel = ProductModel.fromDatabase(existing);
            const updatedModel = new ProductModel({ ...existingModel, ...productData });

            const validation = updatedModel.validate(true);
            if (!validation.isValid) {
                return ErrorHandler.handleValidationError(validation.errors);
            }

            if (productData.codeBar && productData.codeBar !== existing.code_bar) {
                const barcodeExists = this.repository.findByBarcode(productData.codeBar);
                if (barcodeExists) {
                    return ResponseHelper.error('Product barcode already exists', 'DUPLICATE_CODE');
                }
            }

            const dbData = updatedModel.toDatabase();
            delete dbData.id;
            delete dbData.created_at;
            delete dbData.updated_at;

            const result = this.repository.update(id, dbData);
            if (!result) {
                return ResponseHelper.notFound('Product');
            }

            // SYNC TO BATCH TABLE: Update or create batch
            if (updatedModel.batchNumber || updatedModel.expiryDate || updatedModel.productionDate) {
                try {
                    // Check if lot exists for this product
                    const existingBatch = this.db.prepare(`SELECT id FROM batches WHERE num_lot = ? AND product_id = ?`)
                        .get(updatedModel.batchNumber, id);

                    if (existingBatch) {
                        this.db.prepare(`
                            UPDATE batches 
                            SET expiry_date = ?, production_date = ?, designation = ?, quantity = ?, alert_quantity = ?, alert_date = ?, updated_at = CURRENT_TIMESTAMP 
                            WHERE id = ?
                        `).run(
                            updatedModel.expiryDate || null,
                            updatedModel.productionDate || null,
                            updatedModel.designation,
                            updatedModel.stock || 0,
                            updatedModel.alertQuantity || 0,
                            updatedModel.alertDate || null,
                            existingBatch.id
                        );
                    } else {
                        // Create new batch if it doesn't exist but info is provided
                        this.db.prepare(`
                            INSERT INTO batches (num_lot, product_id, designation, quantity, expiry_date, production_date, reception_date, alert_quantity, alert_date)
                            VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?)
                        `).run(
                            updatedModel.batchNumber || `LOT-${id}`,
                            id,
                            updatedModel.designation,
                            updatedModel.stock || 0,
                            updatedModel.expiryDate || null,
                            updatedModel.productionDate || null,
                            updatedModel.alertQuantity || 0,
                            updatedModel.alertDate || null
                        );
                    }
                } catch (batchError) {
                    console.error('Error syncing batch on product update:', batchError);
                }
            }

            // GLOBAL PROPAGATION: Update all other batches of this product with the new default settings
            // This ensures "Dates de validité" and "Configuration Alerte" are synced to all existing lots
            try {
                this.db.prepare(`
                    UPDATE batches 
                    SET 
                        alert_quantity = ?, 
                        expiry_date = ?, 
                        production_date = ?, 
                        alert_date = ?,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE product_id = ?
                `).run(
                    updatedModel.alertQuantity || 0,
                    updatedModel.expiryDate || null,
                    updatedModel.productionDate || null,
                    updatedModel.alertDate || null,
                    id
                );
            } catch (propagationError) {
                console.error('Error propagating product settings to batches:', propagationError);
            }
            // SYNC DEPOT STOCKS
            if (productData.storehouseStocks) {
                this.repository.saveDepotStocks(id, productData.storehouseStocks);
            }

            const finalModel = ProductModel.fromDatabase(result);
            finalModel.storehouseStocks = this.repository.getDepotStocks(id);

            return ResponseHelper.success(finalModel, 'Product updated successfully');
        } catch (error) {
            return ErrorHandler.handleDatabaseError(error);
        }
    }

    // Helper methods for auto-creating relations
    _getOrCreateCategory(name) {
        if (!name || name === '-') return null;
        let category = this.db.prepare('SELECT id FROM categories WHERE name = ?').get(name);
        if (!category) {
            const result = this.db.prepare('INSERT INTO categories (name) VALUES (?)').run(name);
            return result.lastInsertRowid;
        }
        return category.id;
    }

    _getOrCreateFamily(name) {
        if (!name || name === '-') return null;
        let family = this.db.prepare('SELECT id FROM product_families WHERE name = ?').get(name);
        if (!family) {
            const result = this.db.prepare('INSERT INTO product_families (name) VALUES (?)').run(name);
            return result.lastInsertRowid;
        }
        return family.id;
    }

    _getOrCreateBrand(name) {
        if (!name || name === '-') return null;
        let brand = this.db.prepare('SELECT id FROM brands WHERE name = ?').get(name);
        if (!brand) {
            const result = this.db.prepare('INSERT INTO brands (name) VALUES (?)').run(name);
            return result.lastInsertRowid;
        }
        return brand.id;
    }

    _getOrCreateSupplier(name) {
        if (!name || name === '-') return null;
        let supplier = this.db.prepare('SELECT id FROM suppliers WHERE nom_entreprise = ?').get(name);
        if (!supplier) {
            // Generate a unique code for the new supplier
            const now = new Date();
            const year = now.getFullYear().toString().substr(-2);
            const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
            const code = `FORN${year}${random}`;

            const result = this.db.prepare('INSERT INTO suppliers (nom_entreprise, code_supplier, telephone, statut) VALUES (?, ?, ?, ?)').run(name, code, '', 'actif');
            return result.lastInsertRowid;
        }
        return supplier.id;
    }

    /**
     * Save product image to local filesystem
     * @param {string} imageData - Base64 image data or buffer
     * @param {string} identifier - Product code or id for filename
     * @returns {string|null} Relative path to saved image or null
     */
    _saveProductImage(imageData, identifier) {
        try {
            if (!imageData) return null;

            // If it's already a saved image (starts with our custom protocol), return its path as is
            if (typeof imageData === 'string' && imageData.startsWith('app-img://')) {
                return imageData.replace('app-img://', '');
            }

            const uploadsPath = appConfig.getUploadsPath();
            if (!fs.existsSync(uploadsPath)) {
                fs.mkdirSync(uploadsPath, { recursive: true });
            }

            // If it's a base64 string
            let buffer;
            let extension = '.png'; // default

            if (typeof imageData === 'string' && imageData.startsWith('data:image')) {
                const parts = imageData.split(';base64,');
                const mimetype = parts[0].split(':')[1];
                extension = '.' + mimetype.split('/')[1];
                buffer = Buffer.from(parts[1], 'base64');
            } else if (Buffer.isBuffer(imageData)) {
                buffer = imageData;
            } else {
                console.error('Invalid image data format');
                return null;
            }

            // Cleanup identifier for filename
            const cleanId = identifier.toString().replace(/[^a-z0-9]/gi, '_').toLowerCase();
            const fileName = `product_${cleanId}_${Date.now()}${extension}`;
            const filePath = path.join(uploadsPath, fileName);

            console.log('DEBUG: Writing image to absolute path:', filePath);
            fs.writeFileSync(filePath, buffer);
            console.log('DEBUG: Image file written successfully');

            // Store relative path (from uploads root or just filename)
            // For now, let's store the filename or relative to userData
            return fileName;
        } catch (error) {
            console.error('DEBUG: Error saving product image:', error);
            return null;
        }
    }


    async delete(id) {
        try {
            const existing = this.repository.findById(id);
            if (!existing) {
                return ResponseHelper.notFound('Product');
            }

            const deleted = this.repository.delete(id);
            if (!deleted) {
                return ResponseHelper.notFound('Product');
            }

            // Delete product image if it exists
            if (existing.image_path) {
                try {
                    const imagePath = path.join(appConfig.getUploadsPath(), existing.image_path);
                    if (fs.existsSync(imagePath)) {
                        fs.unlinkSync(imagePath);
                    }
                } catch (err) {
                    console.error('Error deleting product image file:', err);
                }
            }

            return ResponseHelper.success(null, 'Product deleted successfully');
        } catch (error) {
            return ErrorHandler.handleDatabaseError(error);
        }
    }

    async search(searchTerm) {
        try {
            if (!searchTerm || searchTerm.trim().length === 0) {
                return this.getAll();
            }

            const products = this.repository.search(searchTerm.trim());
            const models = products.map(p => ProductModel.fromDatabase(p));
            return ResponseHelper.success(models);
        } catch (error) {
            return ErrorHandler.handleError(error, 'ProductService.search');
        }
    }

    async recalculateAllStock() {
        try {
            this.db.prepare(`
                UPDATE products 
                SET stock = (
                    SELECT COALESCE(SUM(quantity), 0) 
                    FROM batches 
                    WHERE product_id = products.id
                ),
                updated_at = CURRENT_TIMESTAMP
            `).run();
            return ResponseHelper.success(null, 'Tous les stocks ont été recalculés avec succès');
        } catch (error) {
            return ErrorHandler.handleDatabaseError(error);
        }
    }

    async recalculateStoreStock() {
        try {
            this.db.prepare(`
                UPDATE products 
                SET stock = (
                    SELECT COALESCE(SUM(quantity), 0) 
                    FROM batches 
                    WHERE product_id = products.id
                ),
                updated_at = CURRENT_TIMESTAMP
                WHERE stock_category = 'store_item'
            `).run();
            return ResponseHelper.success(null, 'Le stock de détail a été recalculé avec succès');
        } catch (error) {
            return ErrorHandler.handleDatabaseError(error);
        }
    }
}

module.exports = ProductService;
