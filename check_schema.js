const Database = require('better-sqlite3');
const db = new Database('./commercial_management.db');
const info = db.prepare("PRAGMA table_info(products)").all();
console.log(JSON.stringify(info, null, 2));
db.close();
