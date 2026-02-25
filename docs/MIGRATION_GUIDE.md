# Migration Guide: Old to New Architecture

## Overview

The backend has been refactored from a monolithic structure to a clean, layered architecture using design patterns.

## What Changed

### Old Structure (Legacy)
```
src/backend/
├── database.js          # Everything in one file
└── ipcHandlers.js       # Direct database calls
```

### New Structure (Current)
```
src/backend/
├── config/
│   └── database.js      # Database connection only
├── repositories/        # Data access layer
├── services/            # Business logic layer
├── controllers/         # Request handling layer
├── utils/               # Utilities
└── ipc/                 # IPC routes
```

## Key Improvements

1. **Separation of Concerns**: Each layer has a single responsibility
2. **Testability**: Easy to mock and test each layer
3. **Maintainability**: Clear structure, easy to find code
4. **Scalability**: Easy to add new features
5. **Error Handling**: Centralized and consistent
6. **Validation**: Structured validation in service layer

## Legacy Files

The following files are kept for backward compatibility but are deprecated:

- `src/backend/database.js` (old monolithic version)
- `src/backend/ipcHandlers.js` (old direct handlers)

**Note**: These files still work but will be removed in a future version. All new code should use the new architecture.

## Migration Steps for New Features

When adding new features, follow this pattern:

### 1. Create Repository
```javascript
// src/backend/repositories/YourEntityRepository.js
const BaseRepository = require('./BaseRepository');

class YourEntityRepository extends BaseRepository {
  constructor(db) {
    super(db, 'your_table');
  }
}
```

### 2. Create Service
```javascript
// src/backend/services/YourEntityService.js
const YourEntityRepository = require('../repositories/YourEntityRepository');
const ResponseHelper = require('../utils/ResponseHelper');

class YourEntityService {
  constructor(db) {
    this.repository = new YourEntityRepository(db);
  }
  
  async create(data) {
    // Validation
    // Business logic
    // Call repository
    return ResponseHelper.success(result);
  }
}
```

### 3. Create Controller
```javascript
// src/backend/controllers/YourEntityController.js
const YourEntityService = require('../services/YourEntityService');

class YourEntityController {
  constructor(db) {
    this.service = new YourEntityService(db);
  }
  
  async create(event, data) {
    return await this.service.create(data);
  }
}
```

### 4. Register Route
```javascript
// src/backend/ipc/ipcHandlers.js
const yourEntityController = new YourEntityController(db);

ipcMain.handle('yourEntities:create', async (event, data) => {
  return await yourEntityController.create(event, data);
});
```

## Response Format

All responses now follow a standardized format:

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
  timestamp: "2024-01-20T10:30:00.000Z"
}
```

## Benefits

✅ **Clean Code**: Each file has a single responsibility  
✅ **Easy Testing**: Mock repositories, test services independently  
✅ **Consistent**: Same pattern for all entities  
✅ **Professional**: Industry-standard architecture  
✅ **Maintainable**: Easy to understand and modify  

