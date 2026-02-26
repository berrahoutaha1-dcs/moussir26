const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join('c:', 'moussir26', 'commercial_management_system-main', 'commercial_management_system-main', 'src', 'backend', 'commercial_management.db');
const db = new Database(dbPath);

console.log('--- Table Info for clients ---');
const info = db.prepare("PRAGMA table_info(clients)").all();
console.log(JSON.stringify(info, null, 2));

console.log('\n--- Sample Data ---');
const sample = db.prepare("SELECT * FROM clients LIMIT 1").get();
console.log(JSON.stringify(sample, null, 2));

db.close();
