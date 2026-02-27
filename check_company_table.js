const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = './src/backend/commercial_management.db'; // Assuming it's here based on file list

if (!fs.existsSync(dbPath)) {
    console.log('Database not found at:', dbPath);
    process.exit(1);
}

const db = new Database(dbPath);

try {
    const result = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='company_info'").get();
    if (result) {
        console.log('Table company_info exists');
        const columns = db.prepare("PRAGMA table_info(company_info)").all();
        console.log('Columns:', columns.map(c => c.name).join(', '));
        const firstRow = db.prepare("SELECT * FROM company_info").get();
        console.log('First Row ID:', firstRow ? firstRow.id : 'NONE');
    } else {
        console.log('Table company_info does NOT exist');
    }
} catch (error) {
    console.error('Error:', error.message);
} finally {
    db.close();
}
