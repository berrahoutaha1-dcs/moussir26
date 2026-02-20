const BaseModel = require('./BaseModel');

/**
 * Supplier Model
 * Represents a supplier entity with validation and transformation
 */
class SupplierModel extends BaseModel {
  constructor(data = {}) {
    super(data);
    
    this.codeSupplier = data.codeSupplier || data.code_supplier || '';
    this.nomEntreprise = data.nomEntreprise || data.nom_entreprise || '';
    this.telephone = data.telephone || null;
    this.email = data.email || null;
    this.adresse = data.adresse || null;
    this.categorieActivite = data.categorieActivite || data.categorie_activite || null;
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
      code_supplier: this.codeSupplier,
      nom_entreprise: this.nomEntreprise,
      telephone: this.telephone,
      email: this.email,
      adresse: this.adresse,
      categorie_activite: this.categorieActivite,
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
   * @returns {SupplierModel} Model instance
   */
  static fromDatabase(dbData) {
    if (!dbData) return null;
    
    return new SupplierModel({
      id: dbData.id,
      codeSupplier: dbData.code_supplier,
      nomEntreprise: dbData.nom_entreprise,
      telephone: dbData.telephone,
      email: dbData.email,
      adresse: dbData.adresse,
      categorieActivite: dbData.categorie_activite,
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
   * Validate supplier data
   * @param {boolean} isUpdate - Whether this is an update operation
   * @returns {Object} Validation result
   */
  validate(isUpdate = false) {
    const errors = {};

    // Required fields
    if (!isUpdate || this.nomEntreprise !== undefined) {
      if (!this.nomEntreprise || this.nomEntreprise.trim().length === 0) {
        errors.nomEntreprise = 'Company name is required';
      } else if (this.nomEntreprise.length > 255) {
        errors.nomEntreprise = 'Company name must be less than 255 characters';
      }
    }

    if (!isUpdate || this.codeSupplier !== undefined) {
      if (!this.codeSupplier || this.codeSupplier.trim().length === 0) {
        errors.codeSupplier = 'Supplier code is required';
      } else if (this.codeSupplier.length > 50) {
        errors.codeSupplier = 'Supplier code must be less than 50 characters';
      }
    }

    // Optional field validations
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

    if (this.solde !== undefined && isNaN(this.solde)) {
      errors.solde = 'Balance must be a valid number';
    }

    if (this.typeSolde && !['positif', 'negatif'].includes(this.typeSolde)) {
      errors.typeSolde = 'Balance type must be "positif" or "negatif"';
    }

    if (this.statut && !['actif', 'inactif', 'suspendu'].includes(this.statut)) {
      errors.statut = 'Status must be "actif", "inactif", or "suspendu"';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Get balance as number (positive or negative based on type)
   * @returns {number} Calculated balance
   */
  getBalance() {
    if (this.typeSolde === 'negatif') {
      return -Math.abs(this.solde);
    }
    return Math.abs(this.solde);
  }

  /**
   * Check if supplier is active
   * @returns {boolean} True if active
   */
  isActive() {
    return this.statut === 'actif';
  }
}

module.exports = SupplierModel;

