const logger = require('../utils/Logger');

class PlanningController {
    constructor(db) {
        this.db = db;
    }

    async getAll(event, options = {}) {
        try {
            const stmt = this.db.prepare('SELECT * FROM plannings ORDER BY scheduledDate ASC, scheduledTime ASC');
            const data = stmt.all().map(item => ({
                ...item,
                attachments: item.attachments ? JSON.parse(item.attachments) : []
            }));
            return { success: true, data };
        } catch (error) {
            logger.error('PlanningController.getAll error:', error);
            return { success: false, error: error.message };
        }
    }

    async getById(event, id) {
        try {
            const stmt = this.db.prepare('SELECT * FROM plannings WHERE id = ?');
            const data = stmt.get(id);
            if (data) {
                data.attachments = data.attachments ? JSON.parse(data.attachments) : [];
            }
            return data ? { success: true, data } : { success: false, error: 'Planning not found' };
        } catch (error) {
            logger.error('PlanningController.getById error:', error);
            return { success: false, error: error.message };
        }
    }

    async create(event, data) {
        try {
            const {
                clientName, clientPhone, serviceType, serviceDescription,
                scheduledDate, scheduledTime, deadline, status,
                priority, notes, revenue, calculationMethod,
                paymentPercentage, paymentAmount, attachments
            } = data;

            const stmt = this.db.prepare(`
        INSERT INTO plannings (
          clientName, clientPhone, serviceType, serviceDescription, 
          scheduledDate, scheduledTime, deadline, status, 
          priority, notes, revenue, calculationMethod, 
          paymentPercentage, paymentAmount, attachments
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

            const result = stmt.run(
                clientName, clientPhone, serviceType, serviceDescription,
                scheduledDate, scheduledTime, deadline, status || 'pending',
                priority || 'medium', notes, revenue || 0, calculationMethod,
                paymentPercentage || 0, paymentAmount || 0, JSON.stringify(attachments || [])
            );

            const newRow = this.db.prepare('SELECT * FROM plannings WHERE id = ?').get(result.lastInsertRowid);
            if (newRow) {
                newRow.attachments = newRow.attachments ? JSON.parse(newRow.attachments) : [];
            }
            return { success: true, data: newRow };
        } catch (error) {
            logger.error('PlanningController.create error:', error);
            return { success: false, error: error.message };
        }
    }

    async update(event, id, data) {
        try {
            const {
                clientName, clientPhone, serviceType, serviceDescription,
                scheduledDate, scheduledTime, deadline, status,
                priority, notes, revenue, calculationMethod,
                paymentPercentage, paymentAmount, attachments
            } = data;

            const stmt = this.db.prepare(`
        UPDATE plannings SET 
          clientName = ?, clientPhone = ?, serviceType = ?, serviceDescription = ?, 
          scheduledDate = ?, scheduledTime = ?, deadline = ?, status = ?, 
          priority = ?, notes = ?, revenue = ?, calculationMethod = ?, 
          paymentPercentage = ?, paymentAmount = ?, attachments = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);

            const result = stmt.run(
                clientName, clientPhone, serviceType, serviceDescription,
                scheduledDate, scheduledTime, deadline, status,
                priority, notes, revenue, calculationMethod,
                paymentPercentage, paymentAmount, JSON.stringify(attachments),
                id
            );

            if (result.changes === 0) return { success: false, error: 'Planning not found' };
            const updated = this.db.prepare('SELECT * FROM plannings WHERE id = ?').get(id);
            if (updated) {
                updated.attachments = updated.attachments ? JSON.parse(updated.attachments) : [];
            }
            return { success: true, data: updated };
        } catch (error) {
            logger.error('PlanningController.update error:', error);
            return { success: false, error: error.message };
        }
    }

    async delete(event, id) {
        try {
            const result = this.db.prepare('DELETE FROM plannings WHERE id = ?').run(id);
            if (result.changes === 0) return { success: false, error: 'Planning not found' };
            return { success: true };
        } catch (error) {
            logger.error('PlanningController.delete error:', error);
            return { success: false, error: error.message };
        }
    }

    async search(event, searchTerm) {
        try {
            const pattern = `%${searchTerm}%`;
            const stmt = this.db.prepare(`
        SELECT * FROM plannings 
        WHERE clientName LIKE ? OR serviceDescription LIKE ? OR notes LIKE ?
        ORDER BY scheduledDate ASC
      `);
            const data = stmt.all(pattern, pattern, pattern).map(item => ({
                ...item,
                attachments: item.attachments ? JSON.parse(item.attachments) : []
            }));
            return { success: true, data };
        } catch (error) {
            logger.error('PlanningController.search error:', error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = PlanningController;
