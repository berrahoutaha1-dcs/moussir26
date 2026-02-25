const Database = require('better-sqlite3');
const path = require('path');

const dbPath = 'c:\\moussir26\\commercial_management_system-main\\commercial_management_system-main\\src\\backend\\commercial_management.db';
const db = new Database(dbPath);

const products = db.prepare('SELECT id, designation FROM products LIMIT 5').all();
console.log('Products in DB:', products);
db.close();
