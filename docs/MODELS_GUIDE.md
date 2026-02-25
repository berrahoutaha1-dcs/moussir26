# Models Layer Guide

## Overview

Models represent the domain entities in your application. They provide:
- **Data Structure**: Define entity properties
- **Validation**: Ensure data integrity
- **Transformation**: Convert between frontend (camelCase) and database (snake_case) formats
- **Business Logic**: Entity-specific methods

## Location

```
src/backend/models/
├── BaseModel.js          # Base class with common functionality
├── SupplierModel.js     # Supplier entity model
├── ClientModel.js       # Client entity model
└── ProductModel.js      # Product entity model
```

## Architecture Position

```
Frontend (camelCase)
    ↓
Models (camelCase ↔ snake_case)
    ↓
Services (use models)
    ↓
Repositories (snake_case)
    ↓
Database (snake_case)
```

## BaseModel Features

All models extend `BaseModel` which provides:

- `toDatabase()` - Convert to database format (snake_case)
- `fromDatabase()` - Create model from database format
- `validate()` - Validate model data
- `toJSON()` - Get plain object representation

## Model Responsibilities

### 1. **Data Structure**
Define all properties of the entity:

```javascript
class SupplierModel extends BaseModel {
  constructor(data = {}) {
    super(data);
    this.codeSupplier = data.codeSupplier || '';
    this.nomEntreprise = data.nomEntreprise || '';
    // ... other properties
  }
}
```

### 2. **Format Transformation**
Handle conversion between frontend and database formats:

```javascript
// Frontend format (camelCase)
{
  codeSupplier: 'FORN001',
  nomEntreprise: 'Test Company'
}

// Database format (snake_case)
{
  code_supplier: 'FORN001',
  nom_entreprise: 'Test Company'
}
```

### 3. **Validation**
Validate data before saving:

```javascript
validate(isUpdate = false) {
  const errors = {};
  
  if (!this.nomEntreprise) {
    errors.nomEntreprise = 'Company name is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
```

### 4. **Business Methods**
Entity-specific business logic:

```javascript
// SupplierModel
getBalance() {
  return this.typeSolde === 'negatif' 
    ? -Math.abs(this.solde) 
    : Math.abs(this.solde);
}

isActive() {
  return this.statut === 'actif';
}

// ProductModel
getMargin() {
  return ((this.pricePrivate - this.priceUpa) / this.priceUpa) * 100;
}

isLowStock(threshold = 10) {
  return this.stock <= threshold;
}
```

## Usage in Services

Models are used in the Service layer:

```javascript
class SupplierService {
  async create(supplierData) {
    // 1. Create model from input
    const model = new SupplierModel(supplierData);
    
    // 2. Validate
    const validation = model.validate(false);
    if (!validation.isValid) {
      return ErrorHandler.handleValidationError(validation.errors);
    }
    
    // 3. Convert to database format
    const dbData = model.toDatabase();
    delete dbData.id; // Remove id for insert
    
    // 4. Save via repository
    const result = this.repository.create(dbData);
    
    // 5. Return as model
    return SupplierModel.fromDatabase(result);
  }
  
  async getAll() {
    const suppliers = this.repository.findAll();
    // Convert all to models
    return suppliers.map(s => SupplierModel.fromDatabase(s));
  }
}
```

## Creating a New Model

### Step 1: Create Model File

```javascript
// src/backend/models/YourEntityModel.js
const BaseModel = require('./BaseModel');

class YourEntityModel extends BaseModel {
  constructor(data = {}) {
    super(data);
    
    // Define all properties
    this.property1 = data.property1 || data.property_1 || '';
    this.property2 = data.property2 || data.property_2 || null;
  }

  // Convert to database format
  toDatabase() {
    return {
      id: this.id,
      property_1: this.property1,
      property_2: this.property2,
      created_at: this.createdAt,
      updated_at: this.updatedAt
    };
  }

  // Create from database format
  static fromDatabase(dbData) {
    if (!dbData) return null;
    
    return new YourEntityModel({
      id: dbData.id,
      property1: dbData.property_1,
      property2: dbData.property_2,
      createdAt: dbData.created_at,
      updatedAt: dbData.updated_at
    });
  }

  // Validate
  validate(isUpdate = false) {
    const errors = {};
    
    if (!this.property1) {
      errors.property1 = 'Property 1 is required';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Business methods
  someBusinessMethod() {
    // Your business logic
  }
}

module.exports = YourEntityModel;
```

### Step 2: Use in Service

```javascript
const YourEntityModel = require('../models/YourEntityModel');

class YourEntityService {
  async create(data) {
    const model = new YourEntityModel(data);
    const validation = model.validate(false);
    // ... rest of service logic
  }
}
```

## Benefits

✅ **Type Safety**: Clear structure of entity properties  
✅ **Validation**: Centralized validation logic  
✅ **Transformation**: Automatic format conversion  
✅ **Business Logic**: Entity-specific methods  
✅ **Consistency**: Same pattern for all entities  
✅ **Maintainability**: Easy to update entity structure  

## Best Practices

1. **Always use models** - Don't work with raw database objects
2. **Validate in models** - Keep validation logic in models
3. **Transform at boundaries** - Convert formats at service layer
4. **Add business methods** - Put entity-specific logic in models
5. **Handle nulls** - Always check for null in `fromDatabase()`
6. **Support both formats** - Accept both camelCase and snake_case in constructor

