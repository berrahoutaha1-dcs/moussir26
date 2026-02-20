# Environment Configuration Guide

## Overview

The application uses `.env` files for environment-specific configuration. This allows you to customize settings without modifying code.

## Setup

### 1. Create `.env` File

Copy the example file:
```bash
cp .env.example .env
```

### 2. Configure Variables

Edit `.env` with your settings (see available variables below).

## Available Environment Variables

### Environment
```env
NODE_ENV=development
# Options: development, production
```

### Database Configuration
```env
DB_NAME=commercial_management.db
# Database filename

DB_PATH=/custom/path/to/database
# Optional: Override default database path
# Default: Electron userData directory
```

### Logging Configuration
```env
LOG_LEVEL=debug
# Options: debug, info, warn, error
# Default: debug (development), error (production)

ENABLE_FILE_LOGGING=false
# Enable file-based logging
# Default: false (development), true (production)

LOG_DIRECTORY=
# Custom log directory
# Default: Electron logs directory
```

### Performance Configuration
```env
ENABLE_REQUEST_TIMING=true
# Enable request timing logs
# Default: true (development), false (production)

SLOW_QUERY_THRESHOLD=1000
# Slow query threshold in milliseconds
# Default: 1000ms
```

### Feature Flags
```env
ENABLE_DEBUG_MODE=true
# Enable debug mode features
# Default: true (development), false (production)

ENABLE_PERFORMANCE_MONITORING=false
# Enable performance monitoring
# Default: false
```

### Application Settings
```env
APP_NAME=Commercial Management System
APP_VERSION=1.0.0
```

## Usage in Code

### Accessing Environment Variables

```javascript
// In app.config.js (already configured)
const appConfig = require('./config/app.config');
const dbName = appConfig.database.name; // From DB_NAME or default

// Direct access (if needed)
const logLevel = process.env.LOG_LEVEL || 'debug';
```

### Configuration Priority

1. **Environment Variables** (`.env` file) - Highest priority
2. **Default Values** - Used if env var not set
3. **Hardcoded Fallbacks** - Last resort

## Environment-Specific Files

### Development (`.env`)
```env
NODE_ENV=development
LOG_LEVEL=debug
ENABLE_DEBUG_MODE=true
ENABLE_REQUEST_TIMING=true
```

### Production (`.env.production`)
```env
NODE_ENV=production
LOG_LEVEL=error
ENABLE_DEBUG_MODE=false
ENABLE_FILE_LOGGING=true
ENABLE_REQUEST_TIMING=false
```

## Security Best Practices

1. **Never commit `.env` files**
   - Already in `.gitignore`
   - Contains sensitive configuration

2. **Use `.env.example` for documentation**
   - Shows available variables
   - No sensitive data

3. **Different files for different environments**
   - `.env` for development
   - `.env.production` for production
   - `.env.local` for local overrides (also in .gitignore)

## Loading Order

Environment variables are loaded in this order:

1. **System environment variables** (highest priority)
2. **`.env` file** (loaded by dotenv)
3. **Default values** in code (lowest priority)

## Example Configurations

### Development
```env
NODE_ENV=development
LOG_LEVEL=debug
ENABLE_DEBUG_MODE=true
ENABLE_REQUEST_TIMING=true
SLOW_QUERY_THRESHOLD=500
```

### Production
```env
NODE_ENV=production
LOG_LEVEL=error
ENABLE_DEBUG_MODE=false
ENABLE_FILE_LOGGING=true
ENABLE_REQUEST_TIMING=false
SLOW_QUERY_THRESHOLD=2000
```

### Testing
```env
NODE_ENV=test
LOG_LEVEL=warn
ENABLE_DEBUG_MODE=false
DB_NAME=test_commercial_management.db
```

## Troubleshooting

### Variables Not Loading

1. **Check file location**: `.env` must be in project root
2. **Check file name**: Must be exactly `.env` (not `.env.txt`)
3. **Restart application**: Changes require restart
4. **Check syntax**: No spaces around `=` sign

### Wrong Values

1. **Check priority**: System env vars override `.env`
2. **Check type**: Some values need to be strings (`"true"` not `true`)
3. **Check defaults**: Code may have hardcoded defaults

## Adding New Variables

1. **Add to `.env.example`** (documentation)
2. **Add to `.env`** (your local config)
3. **Update `app.config.js`** (read the variable)
4. **Update this documentation**

Example:
```javascript
// In app.config.js
this.newFeature = {
  enabled: process.env.NEW_FEATURE_ENABLED === 'true' || false
};
```

## Benefits

✅ **Environment-specific settings** - Different configs for dev/prod  
✅ **No code changes** - Configure without modifying code  
✅ **Security** - Sensitive data not in code  
✅ **Team-friendly** - Each developer can have own `.env`  
✅ **Version control safe** - `.env` not committed  

