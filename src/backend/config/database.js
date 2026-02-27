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
      nom TEXT,
      prenom TEXT,
      telephone TEXT,
      telephone02 TEXT,
      email TEXT,
      adresse TEXT,
      ville TEXT,
      activite TEXT,
      representant TEXT,
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

  // Check if new columns exist, if not add them (for existing databases)
  const columns = db.prepare("PRAGMA table_info(clients)").all();
  const columnNames = columns.map(c => c.name);

  if (!columnNames.includes('nom')) {
    db.prepare("ALTER TABLE clients ADD COLUMN nom TEXT").run();
  }
  if (!columnNames.includes('prenom')) {
    db.prepare("ALTER TABLE clients ADD COLUMN prenom TEXT").run();
  }
  if (!columnNames.includes('telephone02')) {
    db.prepare("ALTER TABLE clients ADD COLUMN telephone02 TEXT").run();
  }
  if (!columnNames.includes('activite')) {
    db.prepare("ALTER TABLE clients ADD COLUMN activite TEXT").run();
  }
  if (!columnNames.includes('representant')) {
    db.prepare("ALTER TABLE clients ADD COLUMN representant TEXT").run();
  }
  if (!columnNames.includes('representant_id')) {
    db.prepare("ALTER TABLE clients ADD COLUMN representant_id INTEGER").run();
  }
  if (!columnNames.includes('photo')) {
    db.prepare("ALTER TABLE clients ADD COLUMN photo TEXT").run();
  }
  if (!columnNames.includes('limite_credit')) {
    db.prepare("ALTER TABLE clients ADD COLUMN limite_credit REAL DEFAULT 0").run();
  }
  if (!columnNames.includes('montant_total')) {
    db.prepare("ALTER TABLE clients ADD COLUMN montant_total REAL DEFAULT 0").run();
  }
  if (!columnNames.includes('montant_paye')) {
    db.prepare("ALTER TABLE clients ADD COLUMN montant_paye REAL DEFAULT 0").run();
  }
  if (!columnNames.includes('factures_count')) {
    db.prepare("ALTER TABLE clients ADD COLUMN factures_count INTEGER DEFAULT 0").run();
  }

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
      production_date TEXT,
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
      production_date TEXT,
      reception_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      alert_date TEXT,
      alert_quantity REAL DEFAULT 0,
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

  // Client Payments Table
  db.prepare(`
    CREATE TABLE IF NOT EXISTS client_payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      date TEXT NOT NULL,
      method TEXT,
      reference TEXT,
      note TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
    )
  `).run();

  // Client Transactions Table (Ledger)
  db.prepare(`
    CREATE TABLE IF NOT EXISTS client_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL,
      type TEXT NOT NULL, -- 'sale', 'return', 'payment', 'initial_balance'
      date TEXT NOT NULL,
      amount REAL NOT NULL,
      debit REAL DEFAULT 0,
      credit REAL DEFAULT 0,
      balance_after REAL DEFAULT 0,
      reference TEXT,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
    )
  `).run();

  // Representatives Table
  db.prepare(`
    CREATE TABLE IF NOT EXISTS representatives (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nom TEXT NOT NULL,
      prenom TEXT NOT NULL,
      telephone TEXT,
      email TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  // Service Categories Table
  db.prepare(`
    CREATE TABLE IF NOT EXISTS service_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  // Services Table
  db.prepare(`
    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      category_id INTEGER,
      price REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES service_categories(id) ON DELETE SET NULL
    )
  `).run();

  // Migration for services table
  const serviceColumns = db.prepare("PRAGMA table_info(services)").all();
  const serviceColumnNames = serviceColumns.map(c => c.name);

  if (!serviceColumnNames.includes('category_id')) {
    try {
      db.prepare("ALTER TABLE services ADD COLUMN category_id INTEGER").run();
    } catch (e) { console.error('Error adding category_id to services:', e); }
  }
  if (!serviceColumnNames.includes('price')) {
    try {
      db.prepare("ALTER TABLE services ADD COLUMN price REAL DEFAULT 0").run();
    } catch (e) { console.error('Error adding price to services:', e); }
  }

  // Workers (Personnel) Table
  db.prepare(`
    CREATE TABLE IF NOT EXISTS workers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nom_prenom TEXT NOT NULL,
      date_naissance TEXT,
      cin TEXT NOT NULL UNIQUE,
      adresse TEXT,
      fonction TEXT,
      date_embauche TEXT,
      salaire REAL DEFAULT 0,
      photo_path TEXT,
      statut TEXT DEFAULT 'actif',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  // Worker Payments Table
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

  // Printers Table
  db.prepare(`
    CREATE TABLE IF NOT EXISTS printers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      libelle TEXT NOT NULL,
      imprimante TEXT NOT NULL,
      is_default INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  // Company Info Table
  db.prepare(`
    CREATE TABLE IF NOT EXISTS company_info (
      id INTEGER PRIMARY KEY CHECK (id = 1), -- Only one row allowed
      societe TEXT,
      activite TEXT,
      adresse TEXT,
      telephone TEXT,
      fax TEXT,
      nif TEXT,
      nis TEXT,
      art_imp TEXT,
      ai TEXT,
      bank TEXT,
      account_number TEXT,
      photo_path TEXT,
      currency TEXT DEFAULT 'DZD',
      ticket_note TEXT,
      ticket_note_enabled INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  // Ensure default company info exists
  const companyInfoCount = db.prepare("SELECT COUNT(*) as count FROM company_info").get();
  if (companyInfoCount.count === 0) {
    db.prepare("INSERT INTO company_info (id, societe) VALUES (1, '')").run();
  }

  // Migration for company_info table
  const companyColumns = db.prepare("PRAGMA table_info(company_info)").all();
  const companyColumnNames = companyColumns.map(c => c.name);

  if (!companyColumnNames.includes('ai')) {
    try {
      db.prepare("ALTER TABLE company_info ADD COLUMN ai TEXT").run();
    } catch (e) { console.error('Error adding ai to company_info:', e); }
  }
  if (!companyColumnNames.includes('art_imp')) {
    try {
      db.prepare("ALTER TABLE company_info ADD COLUMN art_imp TEXT").run();
    } catch (e) { console.error('Error adding art_imp to company_info:', e); }
  }
  if (!companyColumnNames.includes('bank')) {
    try {
      db.prepare("ALTER TABLE company_info ADD COLUMN bank TEXT").run();
    } catch (e) { console.error('Error adding bank to company_info:', e); }
  }
  if (!companyColumnNames.includes('account_number')) {
    try {
      db.prepare("ALTER TABLE company_info ADD COLUMN account_number TEXT").run();
    } catch (e) { console.error('Error adding account_number to company_info:', e); }
  }
  if (!companyColumnNames.includes('photo_path')) {
    try {
      db.prepare("ALTER TABLE company_info ADD COLUMN photo_path TEXT").run();
    } catch (e) { console.error('Error adding photo_path to company_info:', e); }
  }
  if (!companyColumnNames.includes('ticket_note')) {
    try {
      db.prepare("ALTER TABLE company_info ADD COLUMN ticket_note TEXT").run();
    } catch (e) { console.error('Error adding ticket_note to company_info:', e); }
  }
  if (!companyColumnNames.includes('ticket_note_enabled')) {
    try {
      db.prepare("ALTER TABLE company_info ADD COLUMN ticket_note_enabled INTEGER DEFAULT 1").run();
    } catch (e) { console.error('Error adding ticket_note_enabled to company_info:', e); }
  }
  if (!companyColumnNames.includes('currency')) {
    try {
      db.prepare("ALTER TABLE company_info ADD COLUMN currency TEXT DEFAULT 'DZD'").run();
    } catch (e) { console.error('Error adding currency to company_info:', e); }
  }

  // ── Migrations ──────────────────────────────────────────────────────────────
  // Add alert_quantity to batches if it doesn't exist yet
  try {
    db.prepare(`ALTER TABLE batches ADD COLUMN alert_quantity REAL DEFAULT 0`).run();
  } catch (_) {
    // Column already exists – ignore
  }

  // Add production_date to batches if it doesn't exist yet
  try {
    db.prepare(`ALTER TABLE batches ADD COLUMN production_date TEXT`).run();
  } catch (_) {
    // Column already exists – ignore
  }

  // Add production_date to products if it doesn't exist yet
  try {
    db.prepare(`ALTER TABLE products ADD COLUMN production_date TEXT`).run();
  } catch (_) {
    // Column already exists – ignore
  }
}

module.exports = {
  initializeDatabase,
  getDatabase
};
