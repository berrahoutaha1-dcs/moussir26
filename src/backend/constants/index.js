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
  CLIENT_PAYMENTS: {
    GET_BY_CLIENT: 'client_payments:getByClient',
    CREATE: 'client_payments:create',
    DELETE: 'client_payments:delete'
  },
  CLIENT_TRANSACTIONS: {
    GET_BY_CLIENT: 'client_transactions:getByClient',
    CREATE: 'client_transactions:create'
  },
  PRODUCTS: {
    GET_ALL: 'products:getAll',
    GET_BY_ID: 'products:getById',
    GET_BY_BARCODE: 'products:getByBarcode',
    CREATE: 'products:create',
    UPDATE: 'products:update',
    DELETE: 'products:delete',
    SEARCH: 'products:search',
    RECALCULATE_STOCK: 'products:recalculateStock',
    RECALCULATE_ALL_STOCK: 'products:recalculateAllStock'
  },
  CATEGORIES: {
    GET_ALL: 'categories:getAll',
    GET_BY_ID: 'categories:getById',
    CREATE: 'categories:create',
    UPDATE: 'categories:update',
    DELETE: 'categories:delete'
  },
  BRANDS: {
    GET_ALL: 'brands:getAll',
    CREATE: 'brands:create',
    UPDATE: 'brands:update',
    DELETE: 'brands:delete'
  },
  PRODUCT_FAMILIES: {
    GET_ALL: 'product_families:getAll',
    CREATE: 'product_families:create',
    UPDATE: 'product_families:update',
    DELETE: 'product_families:delete'
  },
  BATCHES: {
    GET_ALL: 'batches:getAll',
    GET_BY_ID: 'batches:getById',
    CREATE: 'batches:create',
    UPDATE: 'batches:update',
    DELETE: 'batches:delete',
    SEARCH: 'batches:search'
  },
  SUPPLIER_CATEGORIES: {
    GET_ALL: 'supplier_categories:getAll',
    CREATE: 'supplier_categories:create',
    DELETE: 'supplier_categories:delete'
  },
  SUPPLIER_PAYMENTS: {
    GET_BY_SUPPLIER: 'supplier_payments:getBySupplier',
    CREATE: 'supplier_payments:create',
    DELETE: 'supplier_payments:delete'
  },
  SUPPLIER_TRANSACTIONS: {
    GET_BY_SUPPLIER: 'supplier_transactions:getBySupplier',
    CREATE: 'supplier_transactions:create'
  },
  STOREHOUSES: {
    GET_ALL: 'storehouses:getAll',
    CREATE: 'storehouses:create',
    DELETE: 'storehouses:delete'
  },
  SHELVES: {
    GET_ALL: 'shelves:getAll',
    GET_BY_STOREHOUSE: 'shelves:getByStorehouse',
    CREATE: 'shelves:create',
    DELETE: 'shelves:delete'
  },
  SERVICES: {
    GET_ALL: 'services:getAll',
    GET_BY_ID: 'services:getById',
    CREATE: 'services:create',
    UPDATE: 'services:update',
    DELETE: 'services:delete',
    SEARCH: 'services:search'
  },
  SERVICE_CATEGORIES: {
    GET_ALL: 'service_categories:getAll',
    GET_BY_ID: 'service_categories:getById',
    CREATE: 'service_categories:create',
    UPDATE: 'service_categories:update',
    DELETE: 'service_categories:delete'
  },
  REPRESENTATIVES: {
    GET_ALL: 'representatives:getAll',
    GET_BY_ID: 'representatives:getById',
    CREATE: 'representatives:create',
    UPDATE: 'representatives:update',
    DELETE: 'representatives:delete',
    SEARCH: 'representatives:search'
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

