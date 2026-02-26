/**
 * Service Repository
 */
class ServiceRepository {
    constructor(db) {
        this.db = db;
    }

    findAll() {
        return this.db.prepare(`
      SELECT s.*, sc.name as category_name 
      FROM services s
      LEFT JOIN service_categories sc ON s.category_id = sc.id
      ORDER BY s.name ASC
    `).all();
    }

    findById(id) {
        return this.db.prepare(`
      SELECT s.*, sc.name as category_name 
      FROM services s
      LEFT JOIN service_categories sc ON s.category_id = sc.id
      WHERE s.id = ?
    `).get(id);
    }

    create(data) {
        const stmt = this.db.prepare(`
      INSERT INTO services (name, description, category_id, price) 
      VALUES (?, ?, ?, ?)
    `);
        const result = stmt.run(data.name, data.description || null, data.category_id, data.price || 0);
        return result.lastInsertRowid;
    }

    update(id, data) {
        const stmt = this.db.prepare(`
      UPDATE services 
      SET name = ?, description = ?, category_id = ?, price = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `);
        const result = stmt.run(data.name, data.description || null, data.category_id, data.price || 0, id);
        return result.changes > 0;
    }

    delete(id) {
        const stmt = this.db.prepare('DELETE FROM services WHERE id = ?');
        const result = stmt.run(id);
        return result.changes > 0;
    }

    search(searchTerm) {
        const pattern = `%${searchTerm}%`;
        return this.db.prepare(`
      SELECT s.*, sc.name as category_name 
      FROM services s
      LEFT JOIN service_categories sc ON s.category_id = sc.id
      WHERE s.name LIKE ? OR s.description LIKE ? OR sc.name LIKE ?
      ORDER BY s.name ASC
    `).all(pattern, pattern, pattern);
    }
}

module.exports = ServiceRepository;
