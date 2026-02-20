const BaseModel = require('./BaseModel');

/**
 * Client Model
 * Represents a client entity with validation and transformation
 */
class ClientModel extends BaseModel {
  constructor(data = {}) {
    super(data);
    
    this.codeClient = data.codeClient || data.code_client || '';
    this.nomComplet = data.nomComplet || data.nom_complet || '';
    this.telephone = data.telephone || null;
    this.email = data.email || null;
    this.adresse = data.adresse || null;
    this.ville = data.ville || null;
    this.nif = data.nif || null;
    this.nis = data.nis || null;
    this.rc = data.rc || null;
    this.ai = data.ai || null;
    this.solde = data.solde !== undefined ? parseFloat(data.solde) : 0;
    this.typeSolde = data.typeSolde || data.type_solde || 'positif';
    this.statut = data.statut || 'actif';
  }

  /**
   * Convert to database format
   * @returns {Object} Database format
   */
  toDatabase() {
    return {
      id: this.id,
      code_client: this.codeClient,
      nom_complet: this.nomComplet,
      telephone: this.telephone,
      email: this.email,
      adresse: this.adresse,
      ville: this.ville,
      nif: this.nif,
      nis: this.nis,
      rc: this.rc,
      ai: this.ai,
      solde: this.solde,
      type_solde: this.typeSolde,
      statut: this.statut,
      created_at: this.createdAt,
      updated_at: this.updatedAt
    };
  }

  /**
   * Create model from database format
   * @param {Object} dbData - Database format data
   * @returns {ClientModel} Model instance
   */
  static fromDatabase(dbData) {
    if (!dbData) return null;
    
    return new ClientModel({
      id: dbData.id,
      codeClient: dbData.code_client,
      nomComplet: dbData.nom_complet,
      telephone: dbData.telephone,
      email: dbData.email,
      adresse: dbData.adresse,
      ville: dbData.ville,
      nif: dbData.nif,
      nis: dbData.nis,
      rc: dbData.rc,
      ai: dbData.ai,
      solde: dbData.solde,
      typeSolde: dbData.type_solde,
      statut: dbData.statut,
      createdAt: dbData.created_at,
      updatedAt: dbData.updated_at
    });
  }

  /**
   * Validate client data
   * @param {boolean} isUpdate - Whether this is an update operation
   * @returns {Object} Validation result
   */
  validate(isUpdate = false) {
    const errors = {};

    if (!isUpdate || this.nomComplet !== undefined) {
      if (!this.nomComplet || this.nomComplet.trim().length === 0) {
        errors.nomComplet = 'Full name is required';
      }
    }

    if (!isUpdate || this.codeClient !== undefined) {
      if (!this.codeClient || this.codeClient.trim().length === 0) {
        errors.codeClient = 'Client code is required';
      }
    }

    if (this.telephone) {
      const phoneRegex = /^[\d\s\+\-\(\)]+$/;
      if (!phoneRegex.test(this.telephone)) {
        errors.telephone = 'Invalid phone number format';
      }
    }

    if (this.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.email)) {
        errors.email = 'Invalid email format';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Get balance as number
   * @returns {number} Calculated balance
   */
  getBalance() {
    if (this.typeSolde === 'negatif') {
      return -Math.abs(this.solde);
    }
    return Math.abs(this.solde);
  }

  /**
   * Check if client is active
   * @returns {boolean} True if active
   */
  isActive() {
    return this.statut === 'actif';
  }
}

module.exports = ClientModel;

