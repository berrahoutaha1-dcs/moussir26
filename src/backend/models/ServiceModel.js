const BaseModel = require('./BaseModel');

/**
 * Service Model
 */
class ServiceModel extends BaseModel {
    constructor(data = {}) {
        super(data);
        this.name = data.name || '';
        this.description = data.description || '';
        this.categoryId = data.categoryId || null;
        this.categoryName = data.categoryName || ''; // For joined data
        this.price = data.price || 0;
    }

    static fromDatabase(row) {
        if (!row) return null;
        return new ServiceModel({
            id: row.id,
            name: row.name,
            description: row.description,
            categoryId: row.category_id,
            categoryName: row.category_name,
            price: row.price,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        });
    }

    toDatabase() {
        return {
            name: this.name,
            description: this.description,
            category_id: this.categoryId,
            price: this.price,
            updated_at: new Date().toISOString()
        };
    }
}

module.exports = ServiceModel;
