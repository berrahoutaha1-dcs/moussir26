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
    getAll: () => ipcRenderer.invoke('db:products:getAll'),
    getById: (id) => ipcRenderer.invoke('db:products:getById', id),
    create: (product) => ipcRenderer.invoke('db:products:create', product),
    update: (id, product) => ipcRenderer.invoke('db:products:update', id, product),
    delete: (id) => ipcRenderer.invoke('db:products:delete', id),
  },
  
  // Dashboard
  dashboard: {
    getStats: () => ipcRenderer.invoke('db:dashboard:getStats'),
    getSalesChart: (period) => ipcRenderer.invoke('db:dashboard:getSalesChart', period),
  },
});

