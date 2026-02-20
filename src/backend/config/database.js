const Database = require('better-sqlite3');
const path = require('path');
const { app } = require('electron');
const fs = require('fs');

/**
 * Database Configuration and Connection Manager
 * Singleton pattern to ensure single database connection
 */
class DatabaseConfig {
  constructor() {
    this.db = null;
    this.isInitialized = false;
  }

  /**
   * Initialize database connection
   */
  initialize() {
    if (this.isInitialized) {
      return this.db;
    }

    // Get user data path (works for both dev and production)
    const userDataPath = app.getPath('userData');
    const dbPath = path.join(userDataPath, 'commercial_management.db');
    
    // Ensure directory exists
    if (!fs.existsSync(userDataPath)) {
      fs.mkdirSync(userDataPath, { recursive: true });
    }
    
    // Create database connection
    this.db = new Database(dbPath);
    
    // Optimize database settings
    this.db.pragma('journal_mode = WAL'); // Write-Ahead Logging for better performance
    this.db.pragma('foreign_keys = ON'); // Enable foreign key constraints
    this.db.pragma('synchronous = NORMAL'); // Balance between safety and speed
    
    // Initialize schema
    this.initializeSchema();
    
    this.isInitialized = true;
    console.log('Database initialized at:', dbPath);
    
    return this.db;
  }

  /**
   * Get database instance
   */
  getDatabase() {
    if (!this.isInitialized) {
      return this.initialize();
    }
    return this.db;
  }

  /**
   * Initialize database schema
   */
  initializeSchema() {
    const db = this.db;

    // Users table
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Suppliers table
    db.exec(`
      CREATE TABLE IF NOT EXISTS suppliers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code_supplier TEXT UNIQUE NOT NULL,
        nom_entreprise TEXT NOT NULL,
        telephone TEXT,
        email TEXT,
        adresse TEXT,
        categorie_activite TEXT,
        nif TEXT,
        nis TEXT,
        rc TEXT,
        ai TEXT,
        solde REAL DEFAULT 0,
        type_solde TEXT DEFAULT 'positif',
        statut TEXT DEFAULT 'actif',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Clients table
    db.exec(`
      CREATE TABLE IF NOT EXISTS clients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code_client TEXT UNIQUE NOT NULL,
        nom_complet TEXT NOT NULL,
        telephone TEXT,
        email TEXT,
        adresse TEXT,
        ville TEXT,
        nif TEXT,
        nis TEXT,
        rc TEXT,
        ai TEXT,
        solde REAL DEFAULT 0,
        type_solde TEXT DEFAULT 'positif',
        statut TEXT DEFAULT 'actif',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Categories table
    db.exec(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Product families table
    db.exec(`
      CREATE TABLE IF NOT EXISTS product_families (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Brands table
    db.exec(`
      CREATE TABLE IF NOT EXISTS brands (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Products table
    db.exec(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code_bar TEXT UNIQUE,
        ean TEXT,
        designation TEXT NOT NULL,
        price_private REAL NOT NULL,
        price_upa REAL NOT NULL,
        category_id INTEGER,
        family_id INTEGER,
        brand_id INTEGER,
        supplier_id INTEGER,
        stock REAL DEFAULT 0,
        sukh REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id),
        FOREIGN KEY (family_id) REFERENCES product_families(id),
        FOREIGN KEY (brand_id) REFERENCES brands(id),
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
      )
    `);

    // Batches table
    db.exec(`
      CREATE TABLE IF NOT EXISTS batches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        batch_number TEXT NOT NULL,
        expiry_date DATE,
        quantity REAL NOT NULL,
        purchase_price REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )
    `);

    // Sales table
    db.exec(`
      CREATE TABLE IF NOT EXISTS sales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoice_number TEXT UNIQUE NOT NULL,
        client_id INTEGER,
        sale_type TEXT NOT NULL,
        total_amount REAL NOT NULL,
        payment_method TEXT,
        status TEXT DEFAULT 'completed',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES clients(id)
      )
    `);

    // Sales items table
    db.exec(`
      CREATE TABLE IF NOT EXISTS sale_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sale_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity REAL NOT NULL,
        unit_price REAL NOT NULL,
        total_price REAL NOT NULL,
        FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id)
      )
    `);

    // Purchases table
    db.exec(`
      CREATE TABLE IF NOT EXISTS purchases (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoice_number TEXT UNIQUE NOT NULL,
        supplier_id INTEGER NOT NULL,
        total_amount REAL NOT NULL,
        payment_method TEXT,
        status TEXT DEFAULT 'completed',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
      )
    `);

    // Purchase items table
    db.exec(`
      CREATE TABLE IF NOT EXISTS purchase_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        purchase_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity REAL NOT NULL,
        unit_price REAL NOT NULL,
        total_price REAL NOT NULL,
        FOREIGN KEY (purchase_id) REFERENCES purchases(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id)
      )
    `);

    // Services table
    db.exec(`
      CREATE TABLE IF NOT EXISTS services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        category TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Payments table
    db.exec(`
      CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entity_type TEXT NOT NULL,
        entity_id INTEGER NOT NULL,
        amount REAL NOT NULL,
        payment_method TEXT,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better performance
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_products_code_bar ON products(code_bar);
      CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
      CREATE INDEX IF NOT EXISTS idx_sales_client ON sales(client_id);
      CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(created_at);
      CREATE INDEX IF NOT EXISTS idx_purchases_supplier ON purchases(supplier_id);
      CREATE INDEX IF NOT EXISTS idx_purchases_date ON purchases(created_at);
      CREATE INDEX IF NOT EXISTS idx_suppliers_code ON suppliers(code_supplier);
      CREATE INDEX IF NOT EXISTS idx_clients_code ON clients(code_client);
    `);
  }

  /**
   * Close database connection
   */
  close() {
    if (this.db) {
      this.db.close();
      this.isInitialized = false;
      console.log('Database connection closed');
    }
  }
}

// Singleton instance
const dbConfig = new DatabaseConfig();

module.exports = {
  getDatabase: () => dbConfig.getDatabase(),
  initializeDatabase: () => dbConfig.initialize(),
  closeDatabase: () => dbConfig.close()
};

