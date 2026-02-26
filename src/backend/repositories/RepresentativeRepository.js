const BaseRepository = require('./BaseRepository');

class RepresentativeRepository extends BaseRepository {
    constructor(db) {
        super(db, 'representatives');
    }

    /**
     * Search representatives by name, prenom, phone or email
     * @param {string} searchTerm - Search term
     * @returns {Array} Matching records
     */
    search(searchTerm) {
        try {
            const pattern = `%${searchTerm}%`;
            const query = `
        SELECT * FROM ${this.tableName}
        WHERE nom LIKE ? OR prenom LIKE ? OR telephone LIKE ? OR email LIKE ?
        ORDER BY nom ASC, prenom ASC
      `;
            const stmt = this.db.prepare(query);
            return stmt.all(pattern, pattern, pattern, pattern);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get all representatives sorted by name
     * @returns {Array} Sorted records
     */
    findAllSorted() {
        try {
            const stmt = this.db.prepare(`SELECT * FROM ${this.tableName} ORDER BY nom ASC, prenom ASC`);
            return stmt.all();
        } catch (error) {
            throw error;
        }
    }
}

module.exports = RepresentativeRepository;
