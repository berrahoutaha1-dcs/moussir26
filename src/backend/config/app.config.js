const { app } = require('electron');

/**
 * Application Configuration
 * Centralized configuration management with .env support
 */
class AppConfig {
  constructor() {
    // Environment detection
    this.isDevelopment = process.env.NODE_ENV === 'development' || !app.isPackaged;
    this.isProduction = !this.isDevelopment;

    // Database configuration (from .env or defaults)
    this.database = {
      name: process.env.DB_NAME || 'commercial_management.db',
      path: process.env.DB_PATH || app.getPath('userData'),
      walMode: true,
      foreignKeys: true
    };

    // Logging configuration (from .env or defaults)
    const logLevel = process.env.LOG_LEVEL || (this.isDevelopment ? 'debug' : 'error');
    this.logging = {
      level: logLevel,
      enableFileLogging: process.env.ENABLE_FILE_LOGGING === 'true' || this.isProduction,
      logDirectory: process.env.LOG_DIRECTORY || app.getPath('logs') || app.getPath('userData')
    };

    // Performance configuration (from .env or defaults)
    this.performance = {
      enableRequestTiming: process.env.ENABLE_REQUEST_TIMING !== 'false' && this.isDevelopment,
      slowQueryThreshold: parseInt(process.env.SLOW_QUERY_THRESHOLD) || 1000 // ms
    };

    // Feature flags (from .env or defaults)
    this.features = {
      debugMode: process.env.ENABLE_DEBUG_MODE === 'true' || this.isDevelopment,
      performanceMonitoring: process.env.ENABLE_PERFORMANCE_MONITORING === 'true' || false
    };

    // Application settings (from .env or defaults)
    this.app = {
      name: process.env.APP_NAME || 'Commercial Management System',
      version: process.env.APP_VERSION || '1.0.0'
    };
  }

  /**
   * Get database path
   */
  getDatabasePath() {
    return require('path').join(this.database.path, this.database.name);
  }

  /**
   * Get log file path
   */
  getLogFilePath() {
    const path = require('path');
    const fs = require('fs');

    if (!fs.existsSync(this.logging.logDirectory)) {
      fs.mkdirSync(this.logging.logDirectory, { recursive: true });
    }

    const date = new Date().toISOString().split('T')[0];
    return path.join(this.logging.logDirectory, `app-${date}.log`);
  }

  /**
   * Get uploads path for product images
   */
  getUploadsPath() {
    return require('path').join(this.database.path, 'uploads', 'products');
  }

  /**
   * Check if feature is enabled
   */
  isFeatureEnabled(feature) {
    // Can be extended to check feature flags
    return true;
  }
}

// Singleton instance
const appConfig = new AppConfig();

module.exports = appConfig;

