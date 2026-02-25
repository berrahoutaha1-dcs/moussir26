// API service for communicating with Electron main process via IPC
// This provides a clean interface for React components to interact with the database

class ApiService {
  // Check if running in Electron
  isElectron() {
    return typeof window !== 'undefined' && window.electronAPI;
  }

  // Suppliers
  async getAllSuppliers(options = {}) {
    if (!this.isElectron()) {
      console.warn('Not running in Electron, returning mock data');
      return { success: true, data: [] };
    }
    const result = await window.electronAPI.suppliers.getAll(options);
    // Handle new response format
    return result;
  }

  async getSupplierById(id) {
    if (!this.isElectron()) {
      return { success: false, error: 'Not running in Electron' };
    }
    return await window.electronAPI.suppliers.getById(id);
  }

  async createSupplier(supplier) {
    if (!this.isElectron()) {
      return { success: false, error: 'Not running in Electron' };
    }
    return await window.electronAPI.suppliers.create(supplier);
  }

  async updateSupplier(id, supplier) {
    if (!this.isElectron()) {
      return { success: false, error: 'Not running in Electron' };
    }
    return await window.electronAPI.suppliers.update(id, supplier);
  }

  async deleteSupplier(id) {
    if (!this.isElectron()) {
      return { success: false, error: 'Not running in Electron' };
    }
    return await window.electronAPI.suppliers.delete(id);
  }

  async searchSuppliers(searchTerm) {
    if (!this.isElectron()) {
      return { success: false, error: 'Not running in Electron' };
    }
    return await window.electronAPI.suppliers.search(searchTerm);
  }

  // Clients
  async getAllClients() {
    if (!this.isElectron()) {
      return { success: true, data: [] };
    }
    return await window.electronAPI.clients.getAll();
  }

  async getClientById(id) {
    if (!this.isElectron()) {
      return { success: false, error: 'Not running in Electron' };
    }
    return await window.electronAPI.clients.getById(id);
  }

  async createClient(client) {
    if (!this.isElectron()) {
      return { success: false, error: 'Not running in Electron' };
    }
    return await window.electronAPI.clients.create(client);
  }

  async updateClient(id, client) {
    if (!this.isElectron()) {
      return { success: false, error: 'Not running in Electron' };
    }
    return await window.electronAPI.clients.update(id, client);
  }

  async deleteClient(id) {
    if (!this.isElectron()) {
      return { success: false, error: 'Not running in Electron' };
    }
    return await window.electronAPI.clients.delete(id);
  }

  // Products
  async getAllProducts() {
    if (!this.isElectron()) {
      return { success: true, data: [] };
    }
    return await window.electronAPI.products.getAll();
  }

  async getProductById(id) {
    if (!this.isElectron()) {
      return { success: false, error: 'Not running in Electron' };
    }
    return await window.electronAPI.products.getById(id);
  }

  async createProduct(product) {
    if (!this.isElectron()) {
      return { success: false, error: 'Not running in Electron' };
    }
    return await window.electronAPI.products.create(product);
  }

  async updateProduct(id, product) {
    if (!this.isElectron()) {
      return { success: false, error: 'Not running in Electron' };
    }
    return await window.electronAPI.products.update(id, product);
  }

  async deleteProduct(id) {
    if (!this.isElectron()) {
      return { success: false, error: 'Not running in Electron' };
    }
    return await window.electronAPI.products.delete(id);
  }

  // Dashboard
  async getDashboardStats() {
    if (!this.isElectron()) {
      return { success: true, data: {} };
    }
    return await window.electronAPI.dashboard.getStats();
  }

  async getSalesChartData(period = 'monthly') {
    if (!this.isElectron()) {
      return { success: true, data: [] };
    }
    return await window.electronAPI.dashboard.getSalesChart(period);
  }
}

// Export singleton instance
const apiService = new ApiService();
export default apiService;

