/**
 * Application Constants
 * Centralized constants for the entire backend
 */

// Database Constants
const DB_CONSTANTS = {
  WAL_MODE: 'WAL',
  SYNCHRONOUS_MODE: 'NORMAL',
  FOREIGN_KEYS_ENABLED: true
};

// Entity Status
const STATUS = {
  ACTIVE: 'actif',
  INACTIVE: 'inactif',
  SUSPENDED: 'suspendu'
};

// Balance Types
const BALANCE_TYPE = {
  POSITIVE: 'positif',
  NEGATIVE: 'negatif'
};

// Error Codes
const ERROR_CODES = {
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  FOREIGN_KEY_VIOLATION: 'FOREIGN_KEY_VIOLATION',
  NULL_CONSTRAINT: 'NULL_CONSTRAINT',
  DATABASE_ERROR: 'DATABASE_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  DUPLICATE_CODE: 'DUPLICATE_CODE'
};

// Validation Rules
const VALIDATION = {
  MAX_STRING_LENGTH: 255,
  MAX_CODE_LENGTH: 50,
  MAX_BARCODE_LENGTH: 50,
  LOW_STOCK_THRESHOLD: 10,
  PHONE_REGEX: /^[\d\s\+\-\(\)]+$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
};

// Pagination
const PAGINATION = {
  DEFAULT_LIMIT: 50,
  MAX_LIMIT: 1000,
  DEFAULT_OFFSET: 0
};

// IPC Channel Names
const IPC_CHANNELS = {
  SUPPLIERS: {
    GET_ALL: 'suppliers:getAll',
    GET_BY_ID: 'suppliers:getById',
    CREATE: 'suppliers:create',
    UPDATE: 'suppliers:update',
    DELETE: 'suppliers:delete',
    SEARCH: 'suppliers:search'
  },
  CLIENTS: {
    GET_ALL: 'clients:getAll',
    GET_BY_ID: 'clients:getById',
    CREATE: 'clients:create',
    UPDATE: 'clients:update',
    DELETE: 'clients:delete',
    SEARCH: 'clients:search'
  },
  PRODUCTS: {
    GET_ALL: 'products:getAll',
    GET_BY_ID: 'products:getById',
    CREATE: 'products:create',
    UPDATE: 'products:update',
    DELETE: 'products:delete',
    SEARCH: 'products:search'
  }
};

module.exports = {
  DB_CONSTANTS,
  STATUS,
  BALANCE_TYPE,
  ERROR_CODES,
  VALIDATION,
  PAGINATION,
  IPC_CHANNELS
};

