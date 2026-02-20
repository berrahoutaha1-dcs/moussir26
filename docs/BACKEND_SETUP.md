# Backend Setup Guide

## Overview

This project now uses **SQLite + Node.js** as the backend solution, which is the industry standard for Electron desktop applications.

## Architecture

```
React Frontend (Renderer Process)
    ↓ IPC (Inter-Process Communication)
Electron Main Process (Node.js)
    ↓ Database Operations
SQLite Database (commercial_management.db)
```

## What Was Implemented

### 1. Database Layer (`src/backend/database.js`)
- SQLite database using `better-sqlite3`
- Complete schema for all entities:
  - Users, Suppliers, Clients
  - Products, Categories, Brands, Product Families
  - Sales, Purchases, Batches
  - Services, Payments
- Database methods for CRUD operations
- Dashboard statistics queries
- Sales chart data queries

### 2. IPC Handlers (`src/backend/ipcHandlers.js`)
- Secure communication bridge between React and Node.js
- Handles all database operations via IPC
- Returns structured responses with success/error status

### 3. Preload Script (`public/preload.js`)
- Exposes safe API to React frontend
- Uses Electron's `contextBridge` for security
- Prevents direct Node.js access from renderer

### 4. Frontend API Service (`src/services/api.js`)
- Clean interface for React components
- Handles Electron detection
- Provides async methods for all operations

### 5. Updated Components
- `AddSupplierModal.js` - Now saves to database
- `SupplierListModal.js` - Loads from database
- `Dashboard.js` - Shows real statistics

## Database Location

The database file is stored in Electron's user data directory:
- **Windows**: `%APPDATA%/commercial-management-system/commercial_management.db`
- **macOS**: `~/Library/Application Support/commercial-management-system/commercial_management.db`
- **Linux**: `~/.config/commercial-management-system/commercial_management.db`

## Usage Example

```javascript
import apiService from '../services/api';

// Get all suppliers
const result = await apiService.getAllSuppliers();
if (result.success) {
  console.log(result.data);
}

// Create a supplier
const supplier = {
  codeSupplier: 'FORN001',
  nomEntreprise: 'Test Company',
  telephone: '0555 123 456',
  // ... other fields
};
const createResult = await apiService.createSupplier(supplier);
```

## Next Steps

To complete the backend integration:

1. **Update remaining components** to use `apiService`:
   - `AddClientModal.js`
   - `ClientListModal.js`
   - `NewProductModal.js`
   - `ProductListModal.js`
   - `SalesCharts.js` (for real chart data)
   - And others...

2. **Add more database methods** as needed:
   - Sales operations
   - Purchase operations
   - Payment tracking
   - Batch management
   - etc.

3. **Add data validation** in the database layer

4. **Add database migrations** for future schema changes

## Security Features

- ✅ Context isolation enabled
- ✅ Node integration disabled in renderer
- ✅ Preload script for secure API exposure
- ✅ SQL injection protection via prepared statements
- ✅ Foreign key constraints enabled

## Performance

- ✅ WAL (Write-Ahead Logging) mode for better concurrency
- ✅ Indexes on frequently queried columns
- ✅ Prepared statements for query optimization

## Testing

To test the backend:

1. Run the app: `npm run electron-dev`
2. Add a supplier via the UI
3. Check the database file location
4. Verify data persists after app restart

## Troubleshooting

**Database not found?**
- Check the user data directory path
- Ensure write permissions

**IPC errors?**
- Verify `preload.js` is included in build
- Check Electron version compatibility
- Ensure `contextIsolation: true` in webPreferences

**Import errors?**
- Run `npm install` to ensure all dependencies are installed
- Check Node.js version (requires Node 14+)

