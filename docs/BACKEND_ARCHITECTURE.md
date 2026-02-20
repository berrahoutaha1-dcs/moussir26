# Backend Architecture & Design Patterns

## Overview

This document describes the clean, structured backend architecture using industry-standard design patterns for maintainability, scalability, and testability.

## Architecture Layers

```
┌─────────────────────────────────────────┐
│         IPC Layer (Routes)              │  ← Request Entry Point
│      src/backend/ipc/ipcHandlers.js     │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│      Controller Layer                    │  ← Request Handling
│   src/backend/controllers/                │
│   - SupplierController.js                 │
│   - ClientController.js                   │
│   - ProductController.js                  │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│       Service Layer                      │  ← Business Logic
│   src/backend/services/                  │
│   - SupplierService.js                   │
│   - ClientService.js                     │
│   - ProductService.js                    │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│        Models Layer                      │  ← Domain Entities
│   src/backend/models/                    │
│   - BaseModel.js                         │
│   - SupplierModel.js                     │
│   - ClientModel.js                        │
│   - ProductModel.js                      │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│      Repository Layer                    │  ← Data Access
│   src/backend/repositories/              │
│   - BaseRepository.js                    │
│   - SupplierRepository.js                │
│   - ClientRepository.js                  │
│   - ProductRepository.js                 │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│      Database Layer                      │  ← SQLite Database
│   src/backend/config/database.js         │
└──────────────────────────────────────────┘
```

## Design Patterns Used

### 1. **Repository Pattern**
- **Purpose**: Abstracts data access logic
- **Location**: `src/backend/repositories/`
- **Benefits**:
  - Separates data access from business logic
  - Makes code testable (can mock repositories)
  - Easy to switch database implementations

**Example:**
```javascript
// BaseRepository provides common CRUD operations
class BaseRepository {
  findAll(options)
  findById(id)
  create(data)
  update(id, data)
  delete(id)
}

// Specific repositories extend base and add domain-specific methods
class SupplierRepository extends BaseRepository {
  findByCode(code)
  search(searchTerm)
  getWithBalanceSummary()
}
```

### 3. **Service Layer Pattern**
- **Purpose**: Contains business logic and validation
- **Location**: `src/backend/services/`
- **Benefits**:
  - Centralizes business rules
  - Handles validation
  - Coordinates between repositories
  - Transaction management

**Example:**
```javascript
class SupplierService {
  async create(supplierData) {
    // 1. Validate data
    const validation = this.validate(supplierData);
    if (!validation.isValid) {
      return ErrorHandler.handleValidationError(validation.errors);
    }
    
    // 2. Check business rules (e.g., duplicate code)
    const existing = this.repository.findByCode(supplierData.codeSupplier);
    if (existing) {
      return ResponseHelper.error('Code already exists');
    }
    
    // 3. Transform data format
    const dbData = this.transformToDbFormat(supplierData);
    
    // 4. Save via repository
    return this.repository.create(dbData);
  }
}
```

### 4. **Controller Pattern**
- **Purpose**: Handles requests and delegates to services
- **Location**: `src/backend/controllers/`
- **Benefits**:
  - Thin layer that routes requests
  - Input validation
  - Error handling
  - Response formatting

**Example:**
```javascript
class SupplierController {
  async create(event, supplierData) {
    if (!supplierData) {
      return { success: false, error: 'Data required' };
    }
    return await this.service.create(supplierData);
  }
}
```

### 5. **Singleton Pattern**
- **Purpose**: Single database connection instance
- **Location**: `src/backend/config/database.js`
- **Benefits**:
  - Ensures only one DB connection
  - Efficient resource usage
  - Centralized configuration

### 5. **Dependency Injection**
- **Purpose**: Loose coupling between layers
- **Implementation**: Controllers receive services, services receive repositories
- **Benefits**:
  - Easy to test (inject mocks)
  - Flexible (swap implementations)
  - Clear dependencies

## Directory Structure

```
src/backend/
├── config/
│   └── database.js              # Database connection & initialization
├── models/                      # Domain Models (NEW)
│   ├── BaseModel.js             # Base model class
│   ├── SupplierModel.js        # Supplier entity model
│   ├── ClientModel.js           # Client entity model
│   └── ProductModel.js          # Product entity model
├── repositories/
│   ├── BaseRepository.js         # Base CRUD operations
│   ├── SupplierRepository.js    # Supplier-specific queries
│   ├── ClientRepository.js      # Client-specific queries
│   └── ProductRepository.js     # Product-specific queries
├── services/
│   ├── SupplierService.js       # Supplier business logic
│   ├── ClientService.js         # Client business logic
│   └── ProductService.js         # Product business logic
├── controllers/
│   ├── SupplierController.js    # Supplier request handlers
│   ├── ClientController.js      # Client request handlers
│   └── ProductController.js    # Product request handlers
├── utils/
│   ├── ResponseHelper.js        # Standardized responses
│   └── ErrorHandler.js         # Error handling utilities
└── ipc/
    └── ipcHandlers.js           # IPC route registration
```

## Data Flow

### Creating a Supplier (Example)

1. **Frontend** → Calls `apiService.createSupplier(data)`
2. **IPC** → Routes to `suppliers:create` handler
3. **Controller** → `SupplierController.create()` receives request
4. **Service** → `SupplierService.create()` validates and processes
5. **Repository** → `SupplierRepository.create()` saves to database
6. **Database** → SQLite stores the data
7. **Response** → Flows back through layers with standardized format

## Response Format

All responses follow a standardized format:

**Success:**
```javascript
{
  success: true,
  data: { ... },
  message: "Operation successful",
  timestamp: "2024-01-20T10:30:00.000Z"
}
```

**Error:**
```javascript
{
  success: false,
  error: "Error message",
  code: "ERROR_CODE",
  details: { ... },
  timestamp: "2024-01-20T10:30:00.000Z"
}
```

## Error Handling

### Centralized Error Handling
- `ErrorHandler` utility handles all errors
- Database errors are caught and formatted
- Validation errors return structured responses
- All errors are logged for debugging

### Error Types
- **Database Errors**: Constraint violations, connection issues
- **Validation Errors**: Invalid input data
- **Business Logic Errors**: Rule violations
- **System Errors**: Unexpected errors

## Validation

### Service-Level Validation
- Each service has a `validate()` method
- Validates required fields, formats, business rules
- Returns structured error messages
- Prevents invalid data from reaching database

## Benefits of This Architecture

### ✅ **Separation of Concerns**
- Each layer has a single responsibility
- Easy to understand and maintain

### ✅ **Testability**
- Each layer can be tested independently
- Easy to mock dependencies
- Unit tests for services, integration tests for controllers

### ✅ **Scalability**
- Easy to add new features
- New repositories/services/controllers follow same pattern
- Consistent codebase

### ✅ **Maintainability**
- Clear structure makes code easy to find
- Changes are localized to specific layers
- Reduced code duplication

### ✅ **Flexibility**
- Easy to swap implementations
- Can add caching layer between service and repository
- Can add middleware for logging, authentication, etc.

## Adding New Features

### Step 1: Create Repository
```javascript
// src/backend/repositories/NewEntityRepository.js
class NewEntityRepository extends BaseRepository {
  constructor(db) {
    super(db, 'new_entities');
  }
  
  // Add custom queries here
}
```

### Step 2: Create Service
```javascript
// src/backend/services/NewEntityService.js
class NewEntityService {
  constructor(db) {
    this.repository = new NewEntityRepository(db);
  }
  
  async create(data) {
    // Validation
    // Business logic
    // Call repository
  }
}
```

### Step 3: Create Controller
```javascript
// src/backend/controllers/NewEntityController.js
class NewEntityController {
  constructor(db) {
    this.service = new NewEntityService(db);
  }
  
  async create(event, data) {
    return await this.service.create(data);
  }
}
```

### Step 4: Register IPC Routes
```javascript
// src/backend/ipc/ipcHandlers.js
const newEntityController = new NewEntityController(db);

ipcMain.handle('newEntities:create', async (event, data) => {
  return await newEntityController.create(event, data);
});
```

## Best Practices

1. **Always validate in Service layer** - Never trust input
2. **Use Repository for all DB access** - Never access DB directly from Service
3. **Keep Controllers thin** - Just route requests, no business logic
4. **Use ResponseHelper** - Standardize all responses
5. **Handle errors gracefully** - Use ErrorHandler for all errors
6. **Transform data at boundaries** - Service layer transforms between frontend/DB formats
7. **Document complex logic** - Add comments for business rules
8. **Follow naming conventions** - Controllers end with "Controller", Services with "Service", etc.

## Future Enhancements

- [ ] Add caching layer (Redis or in-memory)
- [ ] Add transaction support for complex operations
- [ ] Add logging middleware
- [ ] Add authentication/authorization layer
- [ ] Add API rate limiting
- [ ] Add database migration system
- [ ] Add unit and integration tests
- [ ] Add API documentation (JSDoc)

