const { ipcMain } = require('electron');
const { getDatabase } = require('../config/database');
const SupplierController = require('../controllers/SupplierController');
const ClientController = require('../controllers/ClientController');
const ProductController = require('../controllers/ProductController');
const SupplierFinanceController = require('../controllers/SupplierFinanceController');
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
          COALESCE(b.expiry_date, p.expiry_date) AS expiry_date,
          b.reception_date,
          b.alert_date,
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
          COALESCE(b.expiry_date, p.expiry_date) AS expiry_date,
          b.reception_date,
          b.alert_date,
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
      const { num_lot, product_id, designation, quantity, expiry_date, reception_date, alert_date } = batchData;
      if (!num_lot || !num_lot.trim()) return { success: false, error: 'num_lot is required' };
      if (!designation || !designation.trim()) return { success: false, error: 'designation is required' };

      // If the batch has an expiry_date, also sync it back to the product
      if (product_id && expiry_date) {
        db.prepare(`UPDATE products SET expiry_date = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
          .run(expiry_date, product_id);
      }

      const stmt = db.prepare(`
        INSERT INTO batches (num_lot, product_id, designation, quantity, expiry_date, reception_date, alert_date)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      const result = stmt.run(
        num_lot.trim(),
        product_id || null,
        designation.trim(),
        quantity || 0,
        expiry_date || null,
        reception_date || null,
        alert_date || null
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
      const { num_lot, product_id, designation, quantity, expiry_date, reception_date, alert_date } = batchData;
      if (!num_lot || !num_lot.trim()) return { success: false, error: 'num_lot is required' };
      if (!designation || !designation.trim()) return { success: false, error: 'designation is required' };

      // Sync expiry_date back to the product
      if (product_id && expiry_date) {
        db.prepare(`UPDATE products SET expiry_date = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
          .run(expiry_date, product_id);
      }

      const stmt = db.prepare(`
        UPDATE batches
        SET num_lot = ?, product_id = ?, designation = ?, quantity = ?,
            expiry_date = ?, reception_date = ?, alert_date = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);
      const result = stmt.run(
        num_lot.trim(),
        product_id || null,
        designation.trim(),
        quantity || 0,
        expiry_date || null,
        reception_date || null,
        alert_date || null,
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
          COALESCE(b.expiry_date, p.expiry_date) AS expiry_date,
          b.reception_date,
          b.alert_date
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

  logger.info('IPC Handlers registered successfully');
}

module.exports = { setupIpcHandlers };

