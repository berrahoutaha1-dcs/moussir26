const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Suppliers (new routes)
  suppliers: {
    getAll: (options) => ipcRenderer.invoke('suppliers:getAll', options),
    getById: (id) => ipcRenderer.invoke('suppliers:getById', id),
    create: (supplier) => ipcRenderer.invoke('suppliers:create', supplier),
    update: (id, supplier) => ipcRenderer.invoke('suppliers:update', id, supplier),
    delete: (id) => ipcRenderer.invoke('suppliers:delete', id),
    search: (searchTerm) => ipcRenderer.invoke('suppliers:search', searchTerm),
  },

  // Legacy routes (for backward compatibility)
  suppliersLegacy: {
    getAll: () => ipcRenderer.invoke('db:suppliers:getAll'),
    getById: (id) => ipcRenderer.invoke('db:suppliers:getById', id),
    create: (supplier) => ipcRenderer.invoke('db:suppliers:create', supplier),
    update: (id, supplier) => ipcRenderer.invoke('db:suppliers:update', id, supplier),
    delete: (id) => ipcRenderer.invoke('db:suppliers:delete', id),
  },

  // Clients
  clients: {
    getAll: () => ipcRenderer.invoke('db:clients:getAll'),
    getById: (id) => ipcRenderer.invoke('db:clients:getById', id),
    create: (client) => ipcRenderer.invoke('db:clients:create', client),
    update: (id, client) => ipcRenderer.invoke('db:clients:update', id, client),
    delete: (id) => ipcRenderer.invoke('db:clients:delete', id),
  },

  // Products
  products: {
    getAll: (options) => ipcRenderer.invoke('products:getAll', options),
    getById: (id) => ipcRenderer.invoke('products:getById', id),
    getByBarcode: (barcode) => ipcRenderer.invoke('products:getByBarcode', barcode),
    create: (product) => ipcRenderer.invoke('products:create', product),
    update: (id, product) => ipcRenderer.invoke('products:update', id, product),
    delete: (id) => ipcRenderer.invoke('products:delete', id),
    search: (searchTerm) => ipcRenderer.invoke('products:search', searchTerm),
  },

  // Dashboard
  dashboard: {
    getStats: () => ipcRenderer.invoke('db:dashboard:getStats'),
    getSalesChart: (period) => ipcRenderer.invoke('db:dashboard:getSalesChart', period),
  },

  // Categories
  categories: {
    getAll: () => ipcRenderer.invoke('categories:getAll'),
    getById: (id) => ipcRenderer.invoke('categories:getById', id),
    create: (category) => ipcRenderer.invoke('categories:create', category),
    update: (id, category) => ipcRenderer.invoke('categories:update', id, category),
    delete: (id) => ipcRenderer.invoke('categories:delete', id),
  },

  // Brands
  brands: {
    getAll: () => ipcRenderer.invoke('brands:getAll'),
    create: (brand) => ipcRenderer.invoke('brands:create', brand),
    update: (id, brand) => ipcRenderer.invoke('brands:update', id, brand),
    delete: (id) => ipcRenderer.invoke('brands:delete', id),
  },

  // Product Families
  productFamilies: {
    getAll: () => ipcRenderer.invoke('product_families:getAll'),
    create: (family) => ipcRenderer.invoke('product_families:create', family),
    update: (id, family) => ipcRenderer.invoke('product_families:update', id, family),
    delete: (id) => ipcRenderer.invoke('product_families:delete', id),
  },

  // Batches (Lots)
  batches: {
    getAll: () => ipcRenderer.invoke('batches:getAll'),
    getById: (id) => ipcRenderer.invoke('batches:getById', id),
    create: (batch) => ipcRenderer.invoke('batches:create', batch),
    update: (id, batch) => ipcRenderer.invoke('batches:update', id, batch),
    delete: (id) => ipcRenderer.invoke('batches:delete', id),
    search: (searchTerm) => ipcRenderer.invoke('batches:search', searchTerm),
  },
  supplierCategories: {
    getAll: () => ipcRenderer.invoke('supplier_categories:getAll'),
    create: (name) => ipcRenderer.invoke('supplier_categories:create', name),
    delete: (id) => ipcRenderer.invoke('supplier_categories:delete', id),
  },
  supplierPayments: {
    getBySupplier: (supplierId) => ipcRenderer.invoke('supplier_payments:getBySupplier', supplierId),
    create: (payment) => ipcRenderer.invoke('supplier_payments:create', payment),
    delete: (id) => ipcRenderer.invoke('supplier_payments:delete', id),
  },
  supplierTransactions: {
    getBySupplier: (supplierId) => ipcRenderer.invoke('supplier_transactions:getBySupplier', supplierId),
    create: (transaction) => ipcRenderer.invoke('supplier_transactions:create', transaction),
  },
  storehouses: {
    getAll: () => ipcRenderer.invoke('storehouses:getAll'),
    create: (data) => ipcRenderer.invoke('storehouses:create', data),
    delete: (id) => ipcRenderer.invoke('storehouses:delete', id),
  },
  shelves: {
    getAll: () => ipcRenderer.invoke('shelves:getAll'),
    getByStorehouse: (storehouseId) => ipcRenderer.invoke('shelves:getByStorehouse', storehouseId),
    create: (data) => ipcRenderer.invoke('shelves:create', data),
    delete: (id) => ipcRenderer.invoke('shelves:delete', id),
  },

  // PDF export (save to file via native dialog)
  savePDF: (htmlContent) => ipcRenderer.invoke('pdf:save', htmlContent),

  // Direct silent print to default printer (XPrinter)
  printReceipt: (htmlContent) => ipcRenderer.invoke('print:receipt', htmlContent),
});

