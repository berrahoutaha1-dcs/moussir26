const ClientRepository = require('../repositories/ClientRepository');
const ClientModel = require('../models/ClientModel');
const ResponseHelper = require('../utils/ResponseHelper');
const ErrorHandler = require('../utils/ErrorHandler');
const appConfig = require('../config/app.config');
const fs = require('fs');
const path = require('path');

/**
 * Client Service
 * Business logic layer for clients
 */
class ClientService {
    constructor(db) {
        this.repository = new ClientRepository(db);
        this.db = db;
    }

    /**
     * Get all clients
     */
    async getAll(options = {}) {
        try {
            const clients = this.repository.getWithBalanceSummary(options);
            const models = clients.map(c => ClientModel.fromDatabase(c));
            return ResponseHelper.success(models);
        } catch (error) {
            return ErrorHandler.handleError(error, 'ClientService.getAll');
        }
    }

    /**
     * Get client by ID
     */
    async getById(id) {
        try {
            const client = this.repository.findById(id);
            if (!client) return ResponseHelper.notFound('Client');
            return ResponseHelper.success(ClientModel.fromDatabase(client));
        } catch (error) {
            return ErrorHandler.handleError(error, 'ClientService.getById');
        }
    }

    /**
     * Create new client
     */
    async create(clientData) {
        try {
            // Handle photo saving if provided
            if (clientData.photo) {
                clientData.photo = this._saveClientPhoto(clientData.photo, clientData.codeClient || Date.now());
            }

            const model = new ClientModel(clientData);
            const validation = model.validate(false);
            if (!validation.isValid) return ErrorHandler.handleValidationError(validation.errors);

            const existing = this.repository.findByCode(model.codeClient);
            if (existing) return ResponseHelper.error('Client code already exists', 'DUPLICATE_CODE');

            const dbData = model.toDatabase();
            delete dbData.id;
            delete dbData.created_at;
            delete dbData.updated_at;

            const result = this.repository.create(dbData);
            return ResponseHelper.success(ClientModel.fromDatabase(result), 'Client created successfully');
        } catch (error) {
            return ErrorHandler.handleDatabaseError(error);
        }
    }

    /**
     * Update client
     */
    async update(id, clientData) {
        try {
            const existing = this.repository.findById(id);
            if (!existing) return ResponseHelper.notFound('Client');

            // Handle photo saving/update if provided
            if (clientData.photo) {
                // If there's an old photo, we could delete it here, but let's keep it simple for now
                clientData.photo = this._saveClientPhoto(clientData.photo, clientData.codeClient || id);
            }

            const existingModel = ClientModel.fromDatabase(existing);
            const updatedModel = new ClientModel({ ...existingModel.toJSON(), ...clientData });

            const validation = updatedModel.validate(true);
            if (!validation.isValid) return ErrorHandler.handleValidationError(validation.errors);

            if (clientData.codeClient && clientData.codeClient !== existing.code_client) {
                const codeExists = this.repository.findByCode(clientData.codeClient);
                if (codeExists) return ResponseHelper.error('Client code already exists', 'DUPLICATE_CODE');
            }

            const dbData = updatedModel.toDatabase();
            delete dbData.id;
            delete dbData.created_at;
            delete dbData.updated_at;

            const result = this.repository.update(id, dbData);
            return ResponseHelper.success(ClientModel.fromDatabase(result), 'Client updated successfully');
        } catch (error) {
            return ErrorHandler.handleDatabaseError(error);
        }
    }

    /**
     * Delete client
     */
    async delete(id) {
        try {
            const existing = this.repository.findById(id);
            if (!existing) return ResponseHelper.notFound('Client');

            const deleted = this.repository.delete(id);
            if (!deleted) return ResponseHelper.notFound('Client');

            // Delete photo if it exists
            if (existing.photo) {
                try {
                    const photoPath = path.join(appConfig.getUploadsPath(), existing.photo);
                    if (fs.existsSync(photoPath)) {
                        fs.unlinkSync(photoPath);
                    }
                } catch (err) {
                    console.error('Error deleting client photo file:', err);
                }
            }

            return ResponseHelper.success(null, 'Client deleted successfully');
        } catch (error) {
            return ErrorHandler.handleDatabaseError(error);
        }
    }

    /**
     * Save client photo to local filesystem
     */
    _saveClientPhoto(imageData, identifier) {
        try {
            if (!imageData) return null;

            // If it's already a saved image (starts with our custom protocol), return its path as is
            if (typeof imageData === 'string' && imageData.startsWith('app-img://')) {
                return imageData.replace('app-img://', '');
            }

            const uploadsPath = appConfig.getUploadsPath();
            if (!fs.existsSync(uploadsPath)) {
                fs.mkdirSync(uploadsPath, { recursive: true });
            }

            let buffer;
            let extension = '.png';

            if (typeof imageData === 'string' && imageData.startsWith('data:image')) {
                const parts = imageData.split(';base64,');
                const mimetype = parts[0].split(':')[1];
                extension = '.' + mimetype.split('/')[1];
                buffer = Buffer.from(parts[parts.length - 1], 'base64');
            } else if (Buffer.isBuffer(imageData)) {
                buffer = imageData;
            } else {
                return null;
            }

            const cleanId = identifier.toString().replace(/[^a-z0-9]/gi, '_').toLowerCase();
            const fileName = `client_${cleanId}_${Date.now()}${extension}`;
            const filePath = path.join(uploadsPath, fileName);

            fs.writeFileSync(filePath, buffer);
            return fileName;
        } catch (error) {
            console.error('Error saving client photo:', error);
            return null;
        }
    }

    /**
     * Search clients
     */
    async search(searchTerm) {
        try {
            const clients = this.repository.search(searchTerm);
            const models = clients.map(c => ClientModel.fromDatabase(c));
            return ResponseHelper.success(models);
        } catch (error) {
            return ErrorHandler.handleError(error, 'ClientService.search');
        }
    }
}

module.exports = ClientService;
