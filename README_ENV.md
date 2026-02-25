# Environment Variables Setup

## Quick Start

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` with your settings** (optional - defaults work fine)

3. **Restart the application** for changes to take effect

## What's Configured

The `.env` file allows you to configure:

- **Database settings** (name, path)
- **Logging levels** (debug, info, warn, error)
- **Performance monitoring** (request timing, slow query threshold)
- **Feature flags** (debug mode, performance monitoring)
- **Application settings** (name, version)

## Default Behavior

If no `.env` file exists, the application uses sensible defaults:
- Development mode: Debug logging enabled
- Production mode: Error logging only
- Database: Auto-detected path

## Security

- ✅ `.env` is in `.gitignore` (not committed)
- ✅ `.env.example` shows available variables (safe to commit)
- ✅ Sensitive data should never be in `.env.example`

## Documentation

See `docs/ENV_CONFIGURATION.md` for complete documentation.

