const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Try to find the database file
const dbPath = path.join(__dirname, 'src', 'backend', 'commercial_management.db');
console.log('Checking database at:', dbPath);

if (!fs.existsSync(dbPath)) {
    console.error('Database file not found at the expected path.');
    process.exit(1);
}

const db = new Database(dbPath);

try {
    const tableInfo = db.prepare("PRAGMA table_info(products)").all();
    console.log('Products table info:', tableInfo.map(f => f.name).join(', '));

    const products = db.prepare("SELECT id, designation, image_path FROM products WHERE image_path IS NOT NULL").all();
    console.log('Products with image_path:', JSON.stringify(products, null, 2));

} catch (error) {
    console.error('Error querying database:', error);
} finally {
    db.close();
}
