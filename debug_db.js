const Database = require('better-sqlite3');
const path = require('path');
const dbPath = path.join(process.cwd(), 'database.sqlite');
try {
    const db = new Database(dbPath);
    const batches = db.prepare('SELECT * FROM batches').all();
    console.log('Batches:', JSON.stringify(batches, null, 2));
    const products = db.prepare('SELECT id, designation, production_date, expiry_date FROM products').all();
    console.log('Products:', JSON.stringify(products, null, 2));
} catch (e) {
    console.error(e);
}
