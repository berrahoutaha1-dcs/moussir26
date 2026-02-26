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
    this.nom = data.nom || '';
    this.prenom = data.prenom || '';
    this.telephone = data.telephone || null;
    this.telephone02 = data.telephone02 || data.telephone_02 || null;
    this.email = data.email || null;
    this.adresse = data.adresse || null;
    this.ville = data.ville || null;
    this.activite = data.activite || null;
    this.representant = data.representant || null;
    this.representantId = data.representantId || data.representant_id || null;
    this.nif = data.nif || null;
    this.nis = data.nis || null;
    this.rc = data.rc || null;
    this.ai = data.ai || null;
    this.solde = data.solde !== undefined ? parseFloat(data.solde) : 0;
    this.typeSolde = data.typeSolde || data.type_solde || 'positif';
    this.statut = data.statut || 'actif';
    this.photo = data.photo || null;
    this.limiteCredit = data.limiteCredit || data.limite_credit || 0;
    this.montantTotal = data.montantTotal || data.montant_total || 0;
    this.montantPaye = data.montantPaye || data.montant_paye || 0;
    this.facturesCount = data.facturesCount || data.factures_count || 0;
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
      nom: this.nom,
      prenom: this.prenom,
      telephone: this.telephone,
      telephone02: this.telephone02,
      email: this.email,
      adresse: this.adresse,
      ville: this.ville,
      activite: this.activite,
      representant: this.representant,
      representant_id: this.representantId,
      nif: this.nif,
      nis: this.nis,
      rc: this.rc,
      ai: this.ai,
      solde: this.solde,
      type_solde: this.typeSolde,
      statut: this.statut,
      photo: this.photo,
      limite_credit: this.limiteCredit,
      montant_total: this.montantTotal,
      montant_paye: this.montantPaye,
      factures_count: this.facturesCount,
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
      nom: dbData.nom,
      prenom: dbData.prenom,
      telephone: dbData.telephone,
      telephone02: dbData.telephone02,
      email: dbData.email,
      adresse: dbData.adresse,
      ville: dbData.ville,
      activite: dbData.activite,
      representant: dbData.representant,
      representantId: dbData.representant_id,
      nif: dbData.nif,
      nis: dbData.nis,
      rc: dbData.rc,
      ai: dbData.ai,
      solde: dbData.solde,
      typeSolde: dbData.type_solde,
      statut: dbData.statut,
      photo: dbData.photo,
      limiteCredit: dbData.limite_credit,
      montantTotal: dbData.montant_total,
      montantPaye: dbData.montant_paye,
      facturesCount: dbData.factures_count,
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

