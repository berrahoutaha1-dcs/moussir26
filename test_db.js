
const Database = require('better-sqlite3');
const path = require('path');
const os = require('os');

const dbPath = path.join(os.homedir(), 'AppData', 'Roaming', 'commercial-management-system', 'commercial_management.db');
console.log('Checking database at:', dbPath);

try {
    const db = new Database(dbPath, { fileMustExist: true });

    console.log('\n--- Tables ---');
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    console.log(tables.map(t => t.name).join(', '));

    if (tables.some(t => t.name === 'plannings')) {
        console.log('\n--- Plannings Table Info ---');
        const columns = db.prepare("PRAGMA table_info(plannings)").all();
        console.table(columns);

        console.log('\n--- Plannings Count ---');
        const count = db.prepare("SELECT COUNT(*) as count FROM plannings").get();
        console.log('Total plannings:', count.count);
    } else {
        console.log('\n[ERROR] Plannings table does not exist!');
    }

    db.close();
} catch (error) {
    console.error('Error:', error.message);
}
