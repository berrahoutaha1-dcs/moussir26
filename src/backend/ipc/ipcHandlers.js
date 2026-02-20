const { ipcMain } = require('electron');
const { getDatabase } = require('../config/database');
const SupplierController = require('../controllers/SupplierController');
const RequestLogger = require('../middleware/RequestLogger');
const ErrorMiddleware = require('../middleware/ErrorMiddleware');
const { IPC_CHANNELS } = require('../constants');
const logger = require('../utils/Logger');
// Import other controllers as they are created
// const ClientController = require('../controllers/ClientController');
// const ProductController = require('../controllers/ProductController');

/**
 * IPC Handlers Setup
 * Registers all IPC routes and maps them to controllers
 * Follows a clean routing pattern
 */
function setupIpcHandlers() {
  const db = getDatabase();
  
  // Initialize controllers
  const supplierController = new SupplierController(db);
  // const clientController = new ClientController(db);
  // const productController = new ProductController(db);

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
  // CLIENT ROUTES (Example - to be implemented)
  // ============================================
  
  // ipcMain.handle('clients:getAll', async (event, options) => {
  //   return await clientController.getAll(event, options);
  // });

  // ============================================
  // PRODUCT ROUTES (Example - to be implemented)
  // ============================================
  
  // ipcMain.handle('products:getAll', async (event, options) => {
  //   return await productController.getAll(event, options);
  // });

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

  logger.info('IPC Handlers registered successfully');
}

module.exports = { setupIpcHandlers };

