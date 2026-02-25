const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const appConfig = require('./app.config');

let db = null;

/**
 * Initialize the database connection and create tables if they don't exist
 * @returns {Database} The better-sqlite3 database instance
 */
function initializeDatabase() {
  if (db) return db;

  try {
    const dbPath = appConfig.getDatabasePath();
    const dbDir = path.dirname(dbPath);

    // Ensure database directory exists
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    // Connect to database
    db = new Database(dbPath);

    // Performance and integrity settings
    db.pragma('journal_mode = WAL');
    db.pragma('synchronous = NORMAL');
    db.pragma('foreign_keys = ON');

    // Create tables
    createTables();

    console.log('Database initialized successfully at:', dbPath);
    return db;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

/**
 * Get the active database connection
 * @returns {Database}
 */
function getDatabase() {
  if (!db) {
    return initializeDatabase();
  }
  return db;
}

/**
 * Create necessary tables if they don't exist
 */
function createTables() {
  // Suppliers Table
  db.prepare(`
    CREATE TABLE IF NOT EXISTS suppliers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code_supplier TEXT NOT NULL UNIQUE,
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
  `).run();

  // Clients Table
  db.prepare(`
    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code_client TEXT NOT NULL UNIQUE,
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
  `).run();

  // Categories Table
  db.prepare(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  // Brands Table
  db.prepare(`
    CREATE TABLE IF NOT EXISTS brands (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  // Product Families Table
  db.prepare(`
    CREATE TABLE IF NOT EXISTS product_families (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  // Products Table
  db.prepare(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code_bar TEXT UNIQUE,
      ean TEXT,
      designation TEXT NOT NULL,
      purchase_price REAL DEFAULT 0,
      tax_percent REAL DEFAULT 0,
      wholesale_price REAL DEFAULT 0,
      semi_wholesale_price REAL DEFAULT 0,
      retail_price REAL DEFAULT 0,
      category_id INTEGER,
      family_id INTEGER,
      brand_id INTEGER,
      supplier_id INTEGER,
      stock_category TEXT,
      stock_management TEXT DEFAULT 'unit',
      shelf TEXT,
      color TEXT,
      size TEXT,
      stock REAL DEFAULT 0,
      sukh REAL DEFAULT 0,
      alert_date TEXT,
      alert_quantity REAL DEFAULT 0,
      batch_number TEXT,
      expiry_date TEXT,
      image_path TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id),
      FOREIGN KEY (family_id) REFERENCES product_families(id),
      FOREIGN KEY (brand_id) REFERENCES brands(id),
      FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
    )
  `).run();

  // Migration: Add image_path to products if not exists
  try {
    db.prepare("ALTER TABLE products ADD COLUMN image_path TEXT").run();
  } catch (e) {
    // Column might already exist or table doesn't exist yet (though it should be created above)
  }

  // Batches Table
  db.prepare(`
    CREATE TABLE IF NOT EXISTS batches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      num_lot TEXT NOT NULL,
      product_id INTEGER NOT NULL,
      designation TEXT,
      quantity REAL DEFAULT 0,
      expiry_date TEXT,
      reception_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      alert_date TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )
  `).run();

  // Storehouses (Depots) Table
  db.prepare(`
    CREATE TABLE IF NOT EXISTS storehouses (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      is_default INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  // Shelves Table linked to Storehouses
  db.prepare(`
    CREATE TABLE IF NOT EXISTS shelves (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      storehouse_id TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (storehouse_id) REFERENCES storehouses(id) ON DELETE CASCADE,
      UNIQUE(name, storehouse_id)
    )
  `).run();

  // Supplier Categories Table
  db.prepare(`
    CREATE TABLE IF NOT EXISTS supplier_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  // Supplier Payments Table
  db.prepare(`
    CREATE TABLE IF NOT EXISTS supplier_payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      supplier_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      date TEXT NOT NULL,
      method TEXT,
      reference TEXT,
      note TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE
    )
  `).run();

  // Supplier Transactions Table (Ledger)
  db.prepare(`
    CREATE TABLE IF NOT EXISTS supplier_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      supplier_id INTEGER NOT NULL,
      type TEXT NOT NULL, -- 'purchase', 'return', 'payment', 'initial_balance'
      date TEXT NOT NULL,
      amount REAL NOT NULL,
      debit REAL DEFAULT 0,
      credit REAL DEFAULT 0,
      balance_after REAL DEFAULT 0,
      reference TEXT,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE
    )
  `).run();

  // Product Depot Stocks Table (Breakdown of stock per depot)
  db.prepare(`
    CREATE TABLE IF NOT EXISTS product_depot_stocks (
      product_id INTEGER NOT NULL,
      storehouse_id TEXT NOT NULL,
      quantity REAL DEFAULT 0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (product_id, storehouse_id),
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      FOREIGN KEY (storehouse_id) REFERENCES storehouses(id) ON DELETE CASCADE
    )
  `).run();

  // Force removal of legacy default depots
  db.prepare("DELETE FROM storehouses WHERE id IN ('wh1', 'wh2')").run();
}

module.exports = {
  initializeDatabase,
  getDatabase
};
