const BaseModel = require('./BaseModel');
const { VALIDATION } = require('../constants');

class RepresentativeModel extends BaseModel {
    constructor(data = {}) {
        super(data);
        this.nom = data.nom || '';
        this.prenom = data.prenom || '';
        this.telephone = data.telephone || '';
        this.email = data.email || '';
    }

    /**
     * Validate representative data
     * @returns {Object} Validation result
     */
    validate() {
        const errors = {};

        if (!this.nom || !this.nom.trim()) {
            errors.nom = 'Le nom est obligatoire';
        } else if (this.nom.length > VALIDATION.MAX_STRING_LENGTH) {
            errors.nom = `Le nom ne doit pas dépasser ${VALIDATION.MAX_STRING_LENGTH} caractères`;
        }

        if (!this.prenom || !this.prenom.trim()) {
            errors.prenom = 'Le prénom est obligatoire';
        } else if (this.prenom.length > VALIDATION.MAX_STRING_LENGTH) {
            errors.prenom = `Le prénom ne doit pas dépasser ${VALIDATION.MAX_STRING_LENGTH} caractères`;
        }

        if (this.telephone && !VALIDATION.PHONE_REGEX.test(this.telephone)) {
            errors.telephone = 'Le numéro de téléphone est invalide';
        }

        if (this.email && !VALIDATION.EMAIL_REGEX.test(this.email)) {
            errors.email = 'L\'adresse email est invalide';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }
}

module.exports = RepresentativeModel;
