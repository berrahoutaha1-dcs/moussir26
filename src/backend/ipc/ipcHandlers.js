const { ipcMain } = require('electron');
const { getDatabase } = require('../config/database');
const SupplierController = require('../controllers/SupplierController');
const ClientController = require('../controllers/ClientController');
const ProductController = require('../controllers/ProductController');
const SupplierFinanceController = require('../controllers/SupplierFinanceController');
const ClientFinanceController = require('../controllers/ClientFinanceController');
const RepresentativeController = require('../controllers/RepresentativeController');
const ServiceController = require('../controllers/ServiceController');
const RequestLogger = require('../middleware/RequestLogger');
const ErrorMiddleware = require('../middleware/ErrorMiddleware');
const { IPC_CHANNELS } = require('../constants');
const logger = require('../utils/Logger');
// Import other controllers as they are created
// const ClientController = require('../controllers/ClientController');

/**
 * IPC Handlers Setup
 * Registers all IPC routes and maps them to controllers
 * Follows a clean routing pattern
 */
function setupIpcHandlers() {
  const db = getDatabase();

  // Initialize controllers
  const supplierController = new SupplierController(db);
  const clientController = new ClientController(db);
  const productController = new ProductController(db);
  const supplierFinanceController = new SupplierFinanceController(db);
  const clientFinanceController = new ClientFinanceController(db);
  const representativeController = new RepresentativeController(db);
  const serviceController = new ServiceController(db);
  // const clientController = new ClientController(db);

  // ============================================
  // SUPPLIER ROUTES
  // ============================================

  ipcMain.handle(IPC_CHANNELS.SUPPLIERS.GET_ALL,
    ErrorMiddleware.wrap(
      RequestLogger.wrapHandler(IPC_CHANNELS.SUPPLIERS.GET_ALL,
        async (event, options) => await supplierController.getAll(event, options)
      ),
      'SupplierController.getAll'
    )
  );

  ipcMain.handle(IPC_CHANNELS.SUPPLIERS.GET_BY_ID,
    ErrorMiddleware.wrap(
      RequestLogger.wrapHandler(IPC_CHANNELS.SUPPLIERS.GET_BY_ID,
        async (event, id) => await supplierController.getById(event, id)
      ),
      'SupplierController.getById'
    )
  );

  ipcMain.handle(IPC_CHANNELS.SUPPLIERS.CREATE,
    ErrorMiddleware.wrap(
      RequestLogger.wrapHandler(IPC_CHANNELS.SUPPLIERS.CREATE,
        async (event, supplierData) => await supplierController.create(event, supplierData)
      ),
      'SupplierController.create'
    )
  );

  ipcMain.handle(IPC_CHANNELS.SUPPLIERS.UPDATE,
    ErrorMiddleware.wrap(
      RequestLogger.wrapHandler(IPC_CHANNELS.SUPPLIERS.UPDATE,
        async (event, id, supplierData) => await supplierController.update(event, id, supplierData)
      ),
      'SupplierController.update'
    )
  );

  ipcMain.handle(IPC_CHANNELS.SUPPLIERS.DELETE,
    ErrorMiddleware.wrap(
      RequestLogger.wrapHandler(IPC_CHANNELS.SUPPLIERS.DELETE,
        async (event, id) => await supplierController.delete(event, id)
      ),
      'SupplierController.delete'
    )
  );

  ipcMain.handle(IPC_CHANNELS.SUPPLIERS.SEARCH,
    ErrorMiddleware.wrap(
      RequestLogger.wrapHandler(IPC_CHANNELS.SUPPLIERS.SEARCH,
        async (event, searchTerm) => await supplierController.search(event, searchTerm)
      ),
      'SupplierController.search'
    )
  );

  // ============================================
  // PRODUCT ROUTES
  // ============================================

  ipcMain.handle(IPC_CHANNELS.PRODUCTS.GET_ALL,
    ErrorMiddleware.wrap(
      RequestLogger.wrapHandler(IPC_CHANNELS.PRODUCTS.GET_ALL,
        async (event, options) => await productController.getAll(event, options)
      ),
      'ProductController.getAll'
    )
  );

  ipcMain.handle(IPC_CHANNELS.PRODUCTS.GET_BY_ID,
    ErrorMiddleware.wrap(
      RequestLogger.wrapHandler(IPC_CHANNELS.PRODUCTS.GET_BY_ID,
        async (event, id) => await productController.getById(event, id)
      ),
      'ProductController.getById'
    )
  );

  ipcMain.handle(IPC_CHANNELS.PRODUCTS.GET_BY_BARCODE,
    ErrorMiddleware.wrap(
      RequestLogger.wrapHandler(IPC_CHANNELS.PRODUCTS.GET_BY_BARCODE,
        async (event, barcode) => await productController.getByBarcode(event, barcode)
      ),
      'ProductController.getByBarcode'
    )
  );

  ipcMain.handle(IPC_CHANNELS.PRODUCTS.CREATE,
    ErrorMiddleware.wrap(
      RequestLogger.wrapHandler(IPC_CHANNELS.PRODUCTS.CREATE,
        async (event, productData) => await productController.create(event, productData)
      ),
      'ProductController.create'
    )
  );

  ipcMain.handle(IPC_CHANNELS.PRODUCTS.UPDATE,
    ErrorMiddleware.wrap(
      RequestLogger.wrapHandler(IPC_CHANNELS.PRODUCTS.UPDATE,
        async (event, id, productData) => await productController.update(event, id, productData)
      ),
      'ProductController.update'
    )
  );

  ipcMain.handle(IPC_CHANNELS.PRODUCTS.DELETE,
    ErrorMiddleware.wrap(
      RequestLogger.wrapHandler(IPC_CHANNELS.PRODUCTS.DELETE,
        async (event, id) => await productController.delete(event, id)
      ),
      'ProductController.delete'
    )
  );

  ipcMain.handle(IPC_CHANNELS.PRODUCTS.SEARCH,
    ErrorMiddleware.wrap(
      RequestLogger.wrapHandler(IPC_CHANNELS.PRODUCTS.SEARCH,
        async (event, searchTerm) => await productController.search(event, searchTerm)
      ),
      'ProductController.search'
    )
  );

  ipcMain.handle(IPC_CHANNELS.PRODUCTS.RECALCULATE_STOCK,
    ErrorMiddleware.wrap(
      RequestLogger.wrapHandler(IPC_CHANNELS.PRODUCTS.RECALCULATE_STOCK,
        async (event) => await productController.recalculateStoreStock(event)
      ),
      'ProductController.recalculateStoreStock'
    )
  );

  ipcMain.handle(IPC_CHANNELS.PRODUCTS.RECALCULATE_ALL_STOCK,
    ErrorMiddleware.wrap(
      RequestLogger.wrapHandler(IPC_CHANNELS.PRODUCTS.RECALCULATE_ALL_STOCK,
        async (event) => await productController.recalculateAllStock(event)
      ),
      'ProductController.recalculateAllStock'
    )
  );

  // ============================================
  // CATEGORY ROUTES
  // ============================================

  ipcMain.handle(IPC_CHANNELS.CATEGORIES.GET_ALL, async () => {
    try {
      const stmt = db.prepare('SELECT * FROM categories ORDER BY name ASC');
      return { success: true, data: stmt.all() };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle(IPC_CHANNELS.CATEGORIES.GET_BY_ID, async (event, id) => {
    try {
      const stmt = db.prepare('SELECT * FROM categories WHERE id = ?');
      const row = stmt.get(id);
      return row ? { success: true, data: row } : { success: false, error: 'Category not found' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle(IPC_CHANNELS.CATEGORIES.CREATE, async (event, categoryData) => {
    try {
      const { name, description } = categoryData;
      if (!name || !name.trim()) return { success: false, error: 'Name is required' };
      const stmt = db.prepare('INSERT INTO categories (name, description) VALUES (?, ?)');
      const result = stmt.run(name.trim(), description ? description.trim() : null);
      const newRow = db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid);
      return { success: true, data: newRow };
    } catch (error) {
      if (error.message && error.message.includes('UNIQUE')) {
        return { success: false, error: 'Une catégorie avec ce nom existe déjà' };
      }
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle(IPC_CHANNELS.CATEGORIES.UPDATE, async (event, id, categoryData) => {
    try {
      const { name, description } = categoryData;
      if (!name || !name.trim()) return { success: false, error: 'Name is required' };
      const stmt = db.prepare('UPDATE categories SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
      const result = stmt.run(name.trim(), description ? description.trim() : null, id);
      if (result.changes === 0) return { success: false, error: 'Category not found' };
      const updated = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
      return { success: true, data: updated };
    } catch (error) {
      if (error.message && error.message.includes('UNIQUE')) {
        return { success: false, error: 'Une catégorie avec ce nom existe déjà' };
      }
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle(IPC_CHANNELS.CATEGORIES.DELETE, async (event, id) => {
    try {
      const stmt = db.prepare('DELETE FROM categories WHERE id = ?');
      const result = stmt.run(id);
      if (result.changes === 0) return { success: false, error: 'Category not found' };
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // ============================================
  // BRANDS ROUTES
  // ============================================

  ipcMain.handle(IPC_CHANNELS.BRANDS.GET_ALL, async () => {
    try {
      const stmt = db.prepare('SELECT * FROM brands ORDER BY name ASC');
      return { success: true, data: stmt.all() };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle(IPC_CHANNELS.BRANDS.CREATE, async (event, data) => {
    try {
      const { name, description } = data;
      if (!name || !name.trim()) return { success: false, error: 'Name is required' };
      const stmt = db.prepare('INSERT INTO brands (name, description) VALUES (?, ?)');
      const result = stmt.run(name.trim(), description ? description.trim() : null);
      const newRow = db.prepare('SELECT * FROM brands WHERE id = ?').get(result.lastInsertRowid);
      return { success: true, data: newRow };
    } catch (error) {
      if (error.message && error.message.includes('UNIQUE'))
        return { success: false, error: 'Une marque avec ce nom existe déjà' };
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle(IPC_CHANNELS.BRANDS.UPDATE, async (event, id, data) => {
    try {
      const { name, description } = data;
      if (!name || !name.trim()) return { success: false, error: 'Name is required' };
      const stmt = db.prepare('UPDATE brands SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
      const result = stmt.run(name.trim(), description ? description.trim() : null, id);
      if (result.changes === 0) return { success: false, error: 'Brand not found' };
      const updated = db.prepare('SELECT * FROM brands WHERE id = ?').get(id);
      return { success: true, data: updated };
    } catch (error) {
      if (error.message && error.message.includes('UNIQUE'))
        return { success: false, error: 'Une marque avec ce nom existe déjà' };
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle(IPC_CHANNELS.BRANDS.DELETE, async (event, id) => {
    try {
      const result = db.prepare('DELETE FROM brands WHERE id = ?').run(id);
      if (result.changes === 0) return { success: false, error: 'Brand not found' };
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // ============================================
  // PRODUCT FAMILIES ROUTES
  // ============================================

  ipcMain.handle(IPC_CHANNELS.PRODUCT_FAMILIES.GET_ALL, async () => {
    try {
      const stmt = db.prepare('SELECT * FROM product_families ORDER BY name ASC');
      return { success: true, data: stmt.all() };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle(IPC_CHANNELS.PRODUCT_FAMILIES.CREATE, async (event, data) => {
    try {
      const { name, description } = data;
      if (!name || !name.trim()) return { success: false, error: 'Name is required' };
      const stmt = db.prepare('INSERT INTO product_families (name, description) VALUES (?, ?)');
      const result = stmt.run(name.trim(), description ? description.trim() : null);
      const newRow = db.prepare('SELECT * FROM product_families WHERE id = ?').get(result.lastInsertRowid);
      return { success: true, data: newRow };
    } catch (error) {
      if (error.message && error.message.includes('UNIQUE'))
        return { success: false, error: 'Une famille avec ce nom existe déjà' };
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle(IPC_CHANNELS.PRODUCT_FAMILIES.UPDATE, async (event, id, data) => {
    try {
      const { name, description } = data;
      if (!name || !name.trim()) return { success: false, error: 'Name is required' };
      const stmt = db.prepare('UPDATE product_families SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
      const result = stmt.run(name.trim(), description ? description.trim() : null, id);
      if (result.changes === 0) return { success: false, error: 'Family not found' };
      const updated = db.prepare('SELECT * FROM product_families WHERE id = ?').get(id);
      return { success: true, data: updated };
    } catch (error) {
      if (error.message && error.message.includes('UNIQUE'))
        return { success: false, error: 'Une famille avec ce nom existe déjà' };
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle(IPC_CHANNELS.PRODUCT_FAMILIES.DELETE, async (event, id) => {
    try {
      const result = db.prepare('DELETE FROM product_families WHERE id = ?').run(id);
      if (result.changes === 0) return { success: false, error: 'Family not found' };
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // ============================================
  // CLIENT ROUTES
  // ============================================

  ipcMain.handle(IPC_CHANNELS.CLIENTS.GET_ALL,
    ErrorMiddleware.wrap(
      RequestLogger.wrapHandler(IPC_CHANNELS.CLIENTS.GET_ALL,
        async (event, options) => await clientController.getAll(event, options)
      ),
      'ClientController.getAll'
    )
  );

  ipcMain.handle(IPC_CHANNELS.CLIENTS.CREATE,
    ErrorMiddleware.wrap(
      RequestLogger.wrapHandler(IPC_CHANNELS.CLIENTS.CREATE,
        async (event, clientData) => await clientController.create(event, clientData)
      ),
      'ClientController.create'
    )
  );

  ipcMain.handle(IPC_CHANNELS.CLIENTS.UPDATE,
    ErrorMiddleware.wrap(
      RequestLogger.wrapHandler(IPC_CHANNELS.CLIENTS.UPDATE,
        async (event, id, clientData) => await clientController.update(event, id, clientData)
      ),
      'ClientController.update'
    )
  );

  ipcMain.handle(IPC_CHANNELS.CLIENTS.DELETE,
    ErrorMiddleware.wrap(
      RequestLogger.wrapHandler(IPC_CHANNELS.CLIENTS.DELETE,
        async (event, id) => await clientController.delete(event, id)
      ),
      'ClientController.delete'
    )
  );

  ipcMain.handle(IPC_CHANNELS.CLIENTS.SEARCH,
    ErrorMiddleware.wrap(
      RequestLogger.wrapHandler(IPC_CHANNELS.CLIENTS.SEARCH,
        async (event, searchTerm) => await clientController.search(event, searchTerm)
      ),
      'ClientController.search'
    )
  );

  ipcMain.handle('db:clients:getAll', async () => {
    const result = await clientController.getAll();
    return result.success ? { success: true, data: result.data } : result;
  });

  ipcMain.handle('db:clients:create', async (event, data) => {
    return await clientController.create(event, data);
  });

  ipcMain.handle('db:clients:update', async (event, id, data) => {
    return await clientController.update(event, id, data);
  });

  ipcMain.handle('db:clients:delete', async (event, id) => {
    return await clientController.delete(event, id);
  });

  // ============================================
  // DASHBOARD ROUTES (Legacy - to be refactored)
  // ============================================

  // Keep legacy routes temporarily for backward compatibility
  ipcMain.handle('db:suppliers:getAll', async () => {
    const result = await supplierController.getAll();
    return result.success ? { success: true, data: result.data } : result;
  });

  ipcMain.handle('db:suppliers:getById', async (event, id) => {
    const result = await supplierController.getById(event, id);
    return result.success ? { success: true, data: result.data } : result;
  });

  ipcMain.handle('db:suppliers:create', async (event, supplierData) => {
    return await supplierController.create(event, supplierData);
  });

  ipcMain.handle('db:suppliers:update', async (event, id, supplierData) => {
    return await supplierController.update(event, id, supplierData);
  });

  ipcMain.handle('db:suppliers:delete', async (event, id) => {
    return await supplierController.delete(event, id);
  });


  // ============================================
  // BATCH (LOTS) ROUTES
  // ============================================

  // GET ALL batches — joins product's expiry_date as fallback
  ipcMain.handle(IPC_CHANNELS.BATCHES.GET_ALL, async () => {
    try {
      const stmt = db.prepare(`
        SELECT
          b.id,
          b.num_lot,
          b.product_id,
          b.designation,
          b.quantity,
          COALESCE(NULLIF(b.expiry_date, ''), p.expiry_date) AS expiry_date,
          COALESCE(NULLIF(b.production_date, ''), p.production_date) AS production_date,
          b.reception_date,
          COALESCE(NULLIF(b.alert_date, ''), p.alert_date) AS alert_date,
          COALESCE(NULLIF(b.alert_quantity, 0), p.alert_quantity) AS alert_quantity,
          b.created_at,
          b.updated_at
        FROM batches b
        LEFT JOIN products p ON b.product_id = p.id
        ORDER BY b.created_at DESC
      `);
      return { success: true, data: stmt.all() };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // GET batch by ID
  ipcMain.handle(IPC_CHANNELS.BATCHES.GET_BY_ID, async (event, id) => {
    try {
      const stmt = db.prepare(`
        SELECT
          b.id,
          b.num_lot,
          b.product_id,
          b.designation,
          b.quantity,
          COALESCE(NULLIF(b.expiry_date, ''), p.expiry_date) AS expiry_date,
          COALESCE(NULLIF(b.production_date, ''), p.production_date) AS production_date,
          b.reception_date,
          COALESCE(NULLIF(b.alert_date, ''), p.alert_date) AS alert_date,
          COALESCE(NULLIF(b.alert_quantity, 0), p.alert_quantity) AS alert_quantity,
          b.created_at,
          b.updated_at
        FROM batches b
        LEFT JOIN products p ON b.product_id = p.id
        WHERE b.id = ?
      `);
      const row = stmt.get(id);
      return row ? { success: true, data: row } : { success: false, error: 'Batch not found' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // CREATE batch
  ipcMain.handle(IPC_CHANNELS.BATCHES.CREATE, async (event, batchData) => {
    try {
      const { num_lot, product_id, designation, quantity, expiry_date, production_date, reception_date, alert_date, alert_quantity } = batchData;
      if (!num_lot || !num_lot.trim()) return { success: false, error: 'num_lot is required' };
      if (!designation || !designation.trim()) return { success: false, error: 'designation is required' };

      // If the batch has an expiry_date, also sync it back to the product
      if (product_id && expiry_date) {
        db.prepare(`UPDATE products SET expiry_date = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
          .run(expiry_date, product_id);
      }
      // Sync alert_quantity back to the product too
      if (product_id && alert_quantity !== undefined && alert_quantity !== null) {
        db.prepare(`UPDATE products SET alert_quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
          .run(alert_quantity, product_id);
      }

      const stmt = db.prepare(`
        INSERT INTO batches (num_lot, product_id, designation, quantity, expiry_date, production_date, reception_date, alert_date, alert_quantity)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const result = stmt.run(
        num_lot.trim(),
        product_id || null,
        designation.trim(),
        quantity || 0,
        expiry_date || null,
        production_date || null,
        reception_date || null,
        alert_date || null,
        alert_quantity || 0
      );
      const newRow = db.prepare('SELECT * FROM batches WHERE id = ?').get(result.lastInsertRowid);
      return { success: true, data: newRow };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // UPDATE batch
  ipcMain.handle(IPC_CHANNELS.BATCHES.UPDATE, async (event, id, batchData) => {
    try {
      const { num_lot, product_id, designation, quantity, expiry_date, production_date, reception_date, alert_date, alert_quantity } = batchData;
      if (!num_lot || !num_lot.trim()) return { success: false, error: 'num_lot is required' };
      if (!designation || !designation.trim()) return { success: false, error: 'designation is required' };

      // Sync expiry_date back to the product
      if (product_id && expiry_date) {
        db.prepare(`UPDATE products SET expiry_date = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
          .run(expiry_date, product_id);
      }
      // Sync alert_quantity back to the product
      if (product_id && alert_quantity !== undefined && alert_quantity !== null) {
        db.prepare(`UPDATE products SET alert_quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
          .run(alert_quantity, product_id);
      }

      const stmt = db.prepare(`
        UPDATE batches
        SET num_lot = ?, product_id = ?, designation = ?, quantity = ?,
            expiry_date = ?, production_date = ?, reception_date = ?, alert_date = ?, alert_quantity = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);
      const result = stmt.run(
        num_lot.trim(),
        product_id || null,
        designation.trim(),
        quantity || 0,
        expiry_date || null,
        production_date || null,
        reception_date || null,
        alert_date || null,
        alert_quantity || 0,
        id
      );
      if (result.changes === 0) return { success: false, error: 'Batch not found' };
      const updated = db.prepare('SELECT * FROM batches WHERE id = ?').get(id);
      return { success: true, data: updated };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // DELETE batch
  ipcMain.handle(IPC_CHANNELS.BATCHES.DELETE, async (event, id) => {
    try {
      const result = db.prepare('DELETE FROM batches WHERE id = ?').run(id);
      if (result.changes === 0) return { success: false, error: 'Batch not found' };
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // SEARCH batches
  ipcMain.handle(IPC_CHANNELS.BATCHES.SEARCH, async (event, searchTerm) => {
    try {
      const pattern = `%${searchTerm}%`;
      const stmt = db.prepare(`
        SELECT
          b.id,
          b.num_lot,
          b.product_id,
          b.designation,
          b.quantity,
          COALESCE(NULLIF(b.expiry_date, ''), p.expiry_date) AS expiry_date,
          COALESCE(NULLIF(b.production_date, ''), p.production_date) AS production_date,
          b.reception_date,
          COALESCE(NULLIF(b.alert_date, ''), p.alert_date) AS alert_date
        FROM batches b
        LEFT JOIN products p ON b.product_id = p.id
        WHERE b.num_lot LIKE ? OR b.designation LIKE ?
        ORDER BY b.created_at DESC
      `);
      return { success: true, data: stmt.all(pattern, pattern) };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // ============================================
  // SUPPLIER CATEGORIES ROUTES
  // ============================================

  ipcMain.handle(IPC_CHANNELS.SUPPLIER_CATEGORIES.GET_ALL, async () => {
    try {
      const stmt = db.prepare('SELECT * FROM supplier_categories ORDER BY name ASC');
      return { success: true, data: stmt.all() };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle(IPC_CHANNELS.SUPPLIER_CATEGORIES.CREATE, async (event, name) => {
    try {
      if (!name || !name.trim()) return { success: false, error: 'Name is required' };
      const stmt = db.prepare('INSERT INTO supplier_categories (name) VALUES (?)');
      const result = stmt.run(name);
      const newRow = db.prepare('SELECT * FROM supplier_categories WHERE id = ?').get(result.lastInsertRowid);
      return { success: true, data: newRow };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle(IPC_CHANNELS.SUPPLIER_CATEGORIES.DELETE, async (event, id) => {
    try {
      db.prepare('DELETE FROM supplier_categories WHERE id = ?').run(id);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // ============================================
  // SUPPLIER FINANCE ROUTES
  // ============================================

  ipcMain.handle(IPC_CHANNELS.SUPPLIER_PAYMENTS.CREATE,
    ErrorMiddleware.wrap(
      async (event, data) => await supplierFinanceController.createPayment(event, data),
      'SupplierFinanceController.createPayment'
    )
  );

  ipcMain.handle(IPC_CHANNELS.SUPPLIER_PAYMENTS.GET_BY_SUPPLIER,
    ErrorMiddleware.wrap(
      async (event, supplierId) => await supplierFinanceController.getPaymentsBySupplier(event, supplierId),
      'SupplierFinanceController.getPaymentsBySupplier'
    )
  );

  ipcMain.handle(IPC_CHANNELS.SUPPLIER_TRANSACTIONS.GET_BY_SUPPLIER,
    ErrorMiddleware.wrap(
      async (event, supplierId) => await supplierFinanceController.getTransactionsBySupplier(event, supplierId),
      'SupplierFinanceController.getTransactionsBySupplier'
    )
  );

  // ============================================
  // CLIENT FINANCE ROUTES
  // ============================================

  ipcMain.handle(IPC_CHANNELS.CLIENT_PAYMENTS.CREATE,
    ErrorMiddleware.wrap(
      async (event, data) => await clientFinanceController.createPayment(event, data),
      'ClientFinanceController.createPayment'
    )
  );

  ipcMain.handle(IPC_CHANNELS.CLIENT_PAYMENTS.GET_BY_CLIENT,
    ErrorMiddleware.wrap(
      async (event, clientId) => await clientFinanceController.getPaymentsByClient(event, clientId),
      'ClientFinanceController.getPaymentsByClient'
    )
  );

  ipcMain.handle(IPC_CHANNELS.CLIENT_TRANSACTIONS.GET_BY_CLIENT,
    ErrorMiddleware.wrap(
      async (event, clientId) => await clientFinanceController.getTransactionsByClient(event, clientId),
      'ClientFinanceController.getTransactionsByClient'
    )
  );

  // ============================================
  // STOREHOUSES & SHELVES ROUTES
  // ============================================

  ipcMain.handle(IPC_CHANNELS.STOREHOUSES.GET_ALL, async () => {
    try {
      const stmt = db.prepare('SELECT * FROM storehouses ORDER BY name ASC');
      return { success: true, data: stmt.all() };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle(IPC_CHANNELS.STOREHOUSES.CREATE, async (event, data) => {
    try {
      const { id, name, description, is_default } = data;
      const stmt = db.prepare('INSERT INTO storehouses (id, name, description, is_default) VALUES (?, ?, ?, ?)');
      stmt.run(id, name, description || null, is_default ? 1 : 0);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle(IPC_CHANNELS.STOREHOUSES.DELETE, async (event, id) => {
    try {
      db.prepare('DELETE FROM storehouses WHERE id = ?').run(id);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle(IPC_CHANNELS.SHELVES.GET_ALL, async () => {
    try {
      const stmt = db.prepare('SELECT * FROM shelves ORDER BY name ASC');
      return { success: true, data: stmt.all() };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle(IPC_CHANNELS.SHELVES.GET_BY_STOREHOUSE, async (event, storehouseId) => {
    try {
      const stmt = db.prepare('SELECT * FROM shelves WHERE storehouse_id = ? ORDER BY name ASC');
      return { success: true, data: stmt.all(storehouseId) };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle(IPC_CHANNELS.SHELVES.CREATE, async (event, data) => {
    try {
      const { name, storehouseId, description } = data;
      const stmt = db.prepare('INSERT INTO shelves (name, storehouse_id, description) VALUES (?, ?, ?)');
      const result = stmt.run(name, storehouseId, description || null);
      return { success: true, id: result.lastInsertRowid };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle(IPC_CHANNELS.SHELVES.DELETE, async (event, id) => {
    try {
      db.prepare('DELETE FROM shelves WHERE id = ?').run(id);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // ============================================
  // REPRESENTATIVES ROUTES
  // ============================================

  ipcMain.handle(IPC_CHANNELS.REPRESENTATIVES.GET_ALL,
    ErrorMiddleware.wrap(
      RequestLogger.wrapHandler(IPC_CHANNELS.REPRESENTATIVES.GET_ALL,
        async (event, options) => await representativeController.getAll(event, options)
      ),
      'RepresentativeController.getAll'
    )
  );

  ipcMain.handle(IPC_CHANNELS.REPRESENTATIVES.GET_BY_ID,
    ErrorMiddleware.wrap(
      RequestLogger.wrapHandler(IPC_CHANNELS.REPRESENTATIVES.GET_BY_ID,
        async (event, id) => await representativeController.getById(event, id)
      ),
      'RepresentativeController.getById'
    )
  );

  ipcMain.handle(IPC_CHANNELS.REPRESENTATIVES.CREATE,
    ErrorMiddleware.wrap(
      RequestLogger.wrapHandler(IPC_CHANNELS.REPRESENTATIVES.CREATE,
        async (event, data) => await representativeController.create(event, data)
      ),
      'RepresentativeController.create'
    )
  );

  ipcMain.handle(IPC_CHANNELS.REPRESENTATIVES.UPDATE,
    ErrorMiddleware.wrap(
      RequestLogger.wrapHandler(IPC_CHANNELS.REPRESENTATIVES.UPDATE,
        async (event, id, data) => await representativeController.update(event, id, data)
      ),
      'RepresentativeController.update'
    )
  );

  ipcMain.handle(IPC_CHANNELS.REPRESENTATIVES.DELETE,
    ErrorMiddleware.wrap(
      RequestLogger.wrapHandler(IPC_CHANNELS.REPRESENTATIVES.DELETE,
        async (event, id) => await representativeController.delete(event, id)
      ),
      'RepresentativeController.delete'
    )
  );

  ipcMain.handle(IPC_CHANNELS.REPRESENTATIVES.SEARCH,
    ErrorMiddleware.wrap(
      RequestLogger.wrapHandler(IPC_CHANNELS.REPRESENTATIVES.SEARCH,
        async (event, searchTerm) => await representativeController.search(event, searchTerm)
      ),
      'RepresentativeController.search'
    )
  );

  // ============================================
  // SERVICE ROUTES
  // ============================================

  ipcMain.handle(IPC_CHANNELS.SERVICES.GET_ALL,
    ErrorMiddleware.wrap(
      RequestLogger.wrapHandler(IPC_CHANNELS.SERVICES.GET_ALL,
        async (event) => await serviceController.getAll(event)
      ),
      'ServiceController.getAll'
    )
  );

  ipcMain.handle(IPC_CHANNELS.SERVICES.GET_BY_ID,
    ErrorMiddleware.wrap(
      RequestLogger.wrapHandler(IPC_CHANNELS.SERVICES.GET_BY_ID,
        async (event, id) => await serviceController.getById(event, id)
      ),
      'ServiceController.getById'
    )
  );

  ipcMain.handle(IPC_CHANNELS.SERVICES.CREATE,
    ErrorMiddleware.wrap(
      RequestLogger.wrapHandler(IPC_CHANNELS.SERVICES.CREATE,
        async (event, data) => await serviceController.create(event, data)
      ),
      'ServiceController.create'
    )
  );

  ipcMain.handle(IPC_CHANNELS.SERVICES.UPDATE,
    ErrorMiddleware.wrap(
      RequestLogger.wrapHandler(IPC_CHANNELS.SERVICES.UPDATE,
        async (event, id, data) => await serviceController.update(event, id, data)
      ),
      'ServiceController.update'
    )
  );

  ipcMain.handle(IPC_CHANNELS.SERVICES.DELETE,
    ErrorMiddleware.wrap(
      RequestLogger.wrapHandler(IPC_CHANNELS.SERVICES.DELETE,
        async (event, id) => await serviceController.delete(event, id)
      ),
      'ServiceController.delete'
    )
  );

  ipcMain.handle(IPC_CHANNELS.SERVICES.SEARCH,
    ErrorMiddleware.wrap(
      RequestLogger.wrapHandler(IPC_CHANNELS.SERVICES.SEARCH,
        async (event, searchTerm) => await serviceController.search(event, searchTerm)
      ),
      'ServiceController.search'
    )
  );

  // ============================================
  // SERVICE CATEGORY ROUTES
  // ============================================

  ipcMain.handle(IPC_CHANNELS.SERVICE_CATEGORIES.GET_ALL,
    ErrorMiddleware.wrap(
      RequestLogger.wrapHandler(IPC_CHANNELS.SERVICE_CATEGORIES.GET_ALL,
        async (event) => await serviceController.getAllCategories(event)
      ),
      'ServiceController.getAllCategories'
    )
  );

  ipcMain.handle(IPC_CHANNELS.SERVICE_CATEGORIES.CREATE,
    ErrorMiddleware.wrap(
      RequestLogger.wrapHandler(IPC_CHANNELS.SERVICE_CATEGORIES.CREATE,
        async (event, data) => await serviceController.createCategory(event, data)
      ),
      'ServiceController.createCategory'
    )
  );

  ipcMain.handle(IPC_CHANNELS.SERVICE_CATEGORIES.UPDATE,
    ErrorMiddleware.wrap(
      RequestLogger.wrapHandler(IPC_CHANNELS.SERVICE_CATEGORIES.UPDATE,
        async (event, id, data) => await serviceController.updateCategory(event, id, data)
      ),
      'ServiceController.updateCategory'
    )
  );

  ipcMain.handle(IPC_CHANNELS.SERVICE_CATEGORIES.DELETE,
    ErrorMiddleware.wrap(
      RequestLogger.wrapHandler(IPC_CHANNELS.SERVICE_CATEGORIES.DELETE,
        async (event, id) => await serviceController.deleteCategory(event, id)
      ),
      'ServiceController.deleteCategory'
    )
  );

  // ============================================
  // DASHBOARD ROUTES
  // ============================================

  ipcMain.handle('db:dashboard:getStats', async () => {
    try {
      // Total clients
      const totalCustomers = db.prepare('SELECT COUNT(*) as cnt FROM clients').get()?.cnt || 0;

      // Total suppliers
      const totalSuppliers = db.prepare('SELECT COUNT(*) as cnt FROM suppliers').get()?.cnt || 0;

      // Total client debts: sum of solde where type_solde = 'negatif' (client owes us nothing; negative solde means debt)
      // 'negatif' means the client's balance is negative (they owe money)
      const clientDebtRow = db.prepare(
        "SELECT COALESCE(SUM(solde), 0) as total FROM clients WHERE type_solde = 'negatif'"
      ).get();
      const totalDebts = Math.abs(clientDebtRow?.total || 0);

      // Total supplier debts: sum of positive solde values (we owe suppliers)
      const supplierDebtRow = db.prepare(
        'SELECT COALESCE(SUM(CASE WHEN solde > 0 THEN solde ELSE 0 END), 0) as total FROM suppliers'
      ).get();
      const totalSuppliersDebts = supplierDebtRow?.total || 0;

      return {
        success: true,
        data: {
          totalCustomers,
          totalSuppliers,
          totalDebts,
          totalSuppliersDebts,
          todayPurchases: 0,
          todaySales: 0,
          totalExpenses: 0,
        }
      };
    } catch (error) {
      logger.error('Dashboard stats error:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:dashboard:getSalesChart', async (event, period) => {
    try {
      return { success: true, data: [] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // ============================================
  // COMPANY INFO ROUTES
  // ============================================

  ipcMain.handle(IPC_CHANNELS.COMPANY_INFO.GET,
    ErrorMiddleware.wrap(
      async () => {
        const stmt = db.prepare('SELECT * FROM company_info WHERE id = 1');
        const row = stmt.get();
        return { success: true, data: row };
      },
      'CompanyInfo.get'
    )
  );

  ipcMain.handle(IPC_CHANNELS.COMPANY_INFO.UPDATE,
    ErrorMiddleware.wrap(
      async (event, data) => {
        logger.info('Updating company info with data:', data);

        const fields = Object.keys(data).filter(key => [
          'societe', 'activite', 'adresse', 'telephone', 'fax',
          'nif', 'nis', 'ai', 'bank', 'account_number', 'photo_path',
          'ticket_note', 'ticket_note_enabled', 'currency'
        ].includes(key));

        const sets = fields.map(f => `${f} = ?`).join(', ');
        const values = fields.map(f => data[f]);

        // Ensure row 1 exists (it should, but just in case)
        const exists = db.prepare('SELECT id FROM company_info WHERE id = 1').get();
        if (!exists) {
          logger.warn('Company info row 1 not found, creating it');
          db.prepare('INSERT INTO company_info (id) VALUES (1)').run();
        }

        const stmt = db.prepare(`UPDATE company_info SET ${sets}, updated_at = CURRENT_TIMESTAMP WHERE id = 1`);
        stmt.run(...values);

        const updated = db.prepare('SELECT * FROM company_info WHERE id = 1').get();
        return { success: true, data: updated };
      },
      'CompanyInfo.update'
    )
  );

  // ============================================
  // WORKERS (PERSONNEL) ROUTES
  // ============================================

  ipcMain.handle(IPC_CHANNELS.WORKERS.GET_ALL,
    ErrorMiddleware.wrap(
      async (event, options) => {
        const stmt = db.prepare('SELECT * FROM workers ORDER BY nom_prenom ASC');
        const rows = stmt.all();
        // Map database fields to frontend fields
        const mappedRows = rows.map(row => ({
          id: row.id,
          nomPrenom: row.nom_prenom,
          dateNaissance: row.date_naissance,
          cin: row.cin,
          adresse: row.adresse,
          fonction: row.fonction,
          dateEmbauche: row.date_embauche,
          salaire: row.salaire,
          photo: row.photo_path
        }));
        return { success: true, data: mappedRows };
      },
      'Workers.getAll'
    )
  );

  ipcMain.handle(IPC_CHANNELS.WORKERS.CREATE,
    ErrorMiddleware.wrap(
      async (event, data) => {
        const stmt = db.prepare(`
          INSERT INTO workers (
            nom_prenom, date_naissance, cin, adresse, 
            fonction, date_embauche, salaire, photo_path
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const result = stmt.run(
          data.nomPrenom,
          data.dateNaissance,
          data.cin,
          data.adresse || null,
          data.fonction || null,
          data.dateEmbauche || null,
          data.salaire || 0,
          data.photo || null
        );

        return { success: true, id: result.lastInsertRowid };
      },
      'Workers.create'
    )
  );

  ipcMain.handle(IPC_CHANNELS.WORKERS.UPDATE,
    ErrorMiddleware.wrap(
      async (event, id, data) => {
        const stmt = db.prepare(`
          UPDATE workers SET 
            nom_prenom = ?, 
            date_naissance = ?, 
            cin = ?, 
            adresse = ?, 
            fonction = ?, 
            date_embauche = ?, 
            salaire = ?, 
            photo_path = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `);

        stmt.run(
          data.nomPrenom,
          data.dateNaissance,
          data.cin,
          data.adresse || null,
          data.fonction || null,
          data.dateEmbauche || null,
          data.salaire || 0,
          data.photo || null,
          id
        );

        return { success: true };
      },
      'Workers.update'
    )
  );

  ipcMain.handle(IPC_CHANNELS.WORKERS.DELETE,
    ErrorMiddleware.wrap(
      async (event, id) => {
        const stmt = db.prepare('DELETE FROM workers WHERE id = ?');
        stmt.run(id);
        return { success: true };
      },
      'Workers.delete'
    )
  );

  ipcMain.handle(IPC_CHANNELS.WORKERS.SEARCH,
    ErrorMiddleware.wrap(
      async (event, searchTerm) => {
        const stmt = db.prepare(`
          SELECT * FROM workers 
          WHERE nom_prenom LIKE ? OR cin LIKE ? OR fonction LIKE ?
          ORDER BY nom_prenom ASC
        `);
        const query = `%${searchTerm}%`;
        const rows = stmt.all(query, query, query);
        const mappedRows = rows.map(row => ({
          id: row.id,
          nomPrenom: row.nom_prenom,
          dateNaissance: row.date_naissance,
          cin: row.cin,
          adresse: row.adresse,
          fonction: row.fonction,
          dateEmbauche: row.date_embauche,
          salaire: row.salaire,
          photo: row.photo_path
        }));
        return { success: true, data: mappedRows };
      },
      'Workers.search'
    )
  );

  // ============================================
  // WORKER PAYMENTS ROUTES
  // ============================================

  ipcMain.handle(IPC_CHANNELS.WORKER_PAYMENTS.GET_ALL,
    ErrorMiddleware.wrap(
      async () => {
        const stmt = db.prepare(`
          SELECT wp.*, w.nom_prenom as worker_name 
          FROM worker_payments wp
          JOIN workers w ON wp.worker_id = w.id
          ORDER BY wp.date_paiement DESC
        `);
        return { success: true, data: stmt.all() };
      },
      'WorkerPayments.getAll'
    )
  );

  ipcMain.handle(IPC_CHANNELS.WORKER_PAYMENTS.GET_BY_WORKER,
    ErrorMiddleware.wrap(
      async (event, workerId) => {
        const stmt = db.prepare('SELECT * FROM worker_payments WHERE worker_id = ? ORDER BY date_paiement DESC');
        return { success: true, data: stmt.all(workerId) };
      },
      'WorkerPayments.getByWorker'
    )
  );

  ipcMain.handle(IPC_CHANNELS.WORKER_PAYMENTS.CREATE,
    ErrorMiddleware.wrap(
      async (event, data) => {
        logger.info('Creating worker payment:', data);

        // Fail-safe: ensure table exists (it should, but just in case of initialization timing)
        db.prepare(`
          CREATE TABLE IF NOT EXISTS worker_payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            worker_id INTEGER NOT NULL,
            montant REAL NOT NULL,
            date_paiement TEXT NOT NULL,
            mode_paiement TEXT,
            note TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (worker_id) REFERENCES workers (id) ON DELETE CASCADE
          )
        `).run();

        const stmt = db.prepare(`
          INSERT INTO worker_payments (worker_id, montant, date_paiement, mode_paiement, note)
          VALUES (?, ?, ?, ?, ?)
        `);
        const result = stmt.run(data.worker_id, data.montant, data.date_paiement, data.mode_paiement, data.note);
        return { success: true, id: result.lastInsertRowid };
      },
      'WorkerPayments.create'
    )
  );

  ipcMain.handle(IPC_CHANNELS.WORKER_PAYMENTS.UPDATE,
    ErrorMiddleware.wrap(
      async (event, id, data) => {
        const stmt = db.prepare(`
          UPDATE worker_payments SET 
            worker_id = ?, montant = ?, date_paiement = ?, mode_paiement = ?, note = ?, 
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `);
        stmt.run(data.worker_id, data.montant, data.date_paiement, data.mode_paiement, data.note, id);
        return { success: true };
      },
      'WorkerPayments.update'
    )
  );

  ipcMain.handle(IPC_CHANNELS.WORKER_PAYMENTS.DELETE,
    ErrorMiddleware.wrap(
      async (event, id) => {
        const stmt = db.prepare('DELETE FROM worker_payments WHERE id = ?');
        stmt.run(id);
        return { success: true };
      },
      'WorkerPayments.delete'
    )
  );

  // ============================================
  // PRINTERS ROUTES
  // ============================================

  ipcMain.handle(IPC_CHANNELS.PRINTERS.GET_ALL,
    ErrorMiddleware.wrap(
      async () => {
        const stmt = db.prepare('SELECT * FROM printers ORDER BY created_at ASC');
        return { success: true, data: stmt.all() };
      },
      'Printers.getAll'
    )
  );

  ipcMain.handle(IPC_CHANNELS.PRINTERS.CREATE,
    ErrorMiddleware.wrap(
      async (event, data) => {
        const stmt = db.prepare(`
          INSERT INTO printers (libelle, imprimante, is_default)
          VALUES (?, ?, ?)
        `);
        const result = stmt.run(data.libelle, data.imprimante, data.is_default || 0);
        return { success: true, id: result.lastInsertRowid };
      },
      'Printers.create'
    )
  );

  ipcMain.handle(IPC_CHANNELS.PRINTERS.UPDATE,
    ErrorMiddleware.wrap(
      async (event, id, data) => {
        const stmt = db.prepare(`
          UPDATE printers SET 
            libelle = ?, imprimante = ?, is_default = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `);
        stmt.run(data.libelle, data.imprimante, data.is_default || 0, id);
        return { success: true };
      },
      'Printers.update'
    )
  );

  ipcMain.handle(IPC_CHANNELS.PRINTERS.DELETE,
    ErrorMiddleware.wrap(
      async (event, id) => {
        const stmt = db.prepare('DELETE FROM printers WHERE id = ?');
        stmt.run(id);
        return { success: true };
      },
      'Printers.delete'
    )
  );

  ipcMain.handle(IPC_CHANNELS.PRINTERS.DETECT,
    ErrorMiddleware.wrap(
      async (event) => {
        const printers = await event.sender.getPrintersAsync();
        return { success: true, data: printers };
      },
      'Printers.detect'
    )
  );

  ipcMain.handle(IPC_CHANNELS.SYSTEM.RESET_DATABASE,
    ErrorMiddleware.wrap(
      async (event, newCurrency) => {
        logger.info('Resetting database for complete currency change...');

        const tablesToClear = [
          'client_payments', 'client_transactions', 'clients',
          'supplier_payments', 'supplier_transactions', 'suppliers',
          'batches', 'products', 'categories', 'brands', 'product_families',
          'worker_payments', 'workers', 'services', 'service_categories',
          'representatives', 'storehouses', 'shelves'
        ];

        db.transaction(() => {
          for (const table of tablesToClear) {
            try {
              db.prepare(`DELETE FROM ${table}`).run();
              try {
                db.prepare(`DELETE FROM sqlite_sequence WHERE name = ?`).run(table);
              } catch (seqError) {
                // Ignore
              }
            } catch (e) {
              logger.warn(`Could not clear table ${table}:`, e.message);
            }
          }

          db.prepare('UPDATE company_info SET currency = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1').run(newCurrency);
          logger.info(`Successfully reset database and set currency to ${newCurrency}`);
        })();

        return { success: true };
      },
      'System.resetDatabase'
    )
  );

  logger.info('IPC Handlers registered successfully');
}

module.exports = { setupIpcHandlers };

