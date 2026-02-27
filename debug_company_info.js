const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Try to find the database path like appConfig does
// Usually in %APPDATA%/commercial_management_system/commercial_management.db
// But let's check the local one first as a fallback
const dbPaths = [
    path.join(process.env.APPDATA || '', 'commercial_management_system', 'commercial_management.db'),
    './commercial_management.db',
    './src/backend/commercial_management.db'
];

let db;
for (const p of dbPaths) {
    if (fs.existsSync(p)) {
        console.log('Found database at:', p);
        db = new Database(p);
        break;
    }
}

if (!db) {
    console.log('Database not found in common locations');
    process.exit(1);
}

try {
    const tableInfo = db.prepare("PRAGMA table_info(company_info)").all();
    console.log('Table Info:', JSON.stringify(tableInfo, null, 2));

    const data = db.prepare("SELECT * FROM company_info").all();
    console.log('Data:', JSON.stringify(data, null, 2));
} catch (error) {
    console.error('Error:', error.message);
} finally {
    db.close();
}
