/**
 * Service Category Repository
 */
class ServiceCategoryRepository {
    constructor(db) {
        this.db = db;
    }

    findAll() {
        return this.db.prepare('SELECT * FROM service_categories ORDER BY name ASC').all();
    }

    findById(id) {
        return this.db.prepare('SELECT * FROM service_categories WHERE id = ?').get(id);
    }

    create(data) {
        const stmt = this.db.prepare('INSERT INTO service_categories (name, description) VALUES (?, ?)');
        const result = stmt.run(data.name, data.description || null);
        return result.lastInsertRowid;
    }

    update(id, data) {
        const stmt = this.db.prepare('UPDATE service_categories SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
        const result = stmt.run(data.name, data.description || null, id);
        return result.changes > 0;
    }

    delete(id) {
        const stmt = this.db.prepare('DELETE FROM service_categories WHERE id = ?');
        const result = stmt.run(id);
        return result.changes > 0;
    }
}

module.exports = ServiceCategoryRepository;
