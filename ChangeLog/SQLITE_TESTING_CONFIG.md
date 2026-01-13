# SQLite Testing Configuration Fix

**Date**: 2026-01-12
**Author**: Claude Code
**Status**: Implemented

## Summary

Fixed test configuration to allow SQLite in-memory database to work alongside PostgreSQL production pooling options.

## Problem

Tests were failing with the error:
```
sqlalchemy/engine/create.py - SQLite doesn't support pool_size, max_overflow, pool_timeout options
```

The base `Config` class had PostgreSQL-specific connection pooling options (`pool_size`, `max_overflow`, `pool_timeout`) that were added for production stability (handling SSL connection drops). When `TestingConfig` inherited from `Config`, these incompatible options were passed to SQLite.

## Solution

Override `SQLALCHEMY_ENGINE_OPTIONS` in `TestingConfig` to only include SQLite-compatible options:

```python
class TestingConfig(Config):
    """Testing configuration."""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'

    # Override pooling options - SQLite doesn't support pool_size, max_overflow, pool_timeout
    # We use SQLite in-memory for tests because it's faster and doesn't require a test database
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,
    }
```

## Decision: SQLite vs PostgreSQL for Testing

**Choice**: Keep SQLite for tests

**Reasoning**:
1. **Speed**: SQLite in-memory runs tests 5-10x faster (no network, no disk I/O)
2. **Simplicity**: No test database to set up, maintain, or clean up
3. **CI/CD**: Simpler pipeline configuration
4. **Compatibility**: Project uses standard SQLAlchemy types (String, Integer, DateTime, Boolean, Date) that work identically in both databases
5. **No PostgreSQL-specific features**: No JSONB, arrays, full-text search, or custom operators in use

**When to reconsider**: If the project starts using PostgreSQL-specific features (JSONB, arrays, custom types), consider switching to PostgreSQL for testing.

## Files Changed

- `backend/app/config.py` - Added `SQLALCHEMY_ENGINE_OPTIONS` override in `TestingConfig`

## Related

- PostgreSQL pooling options added previously to fix production SSL connection drops
- All 220 tests now pass with this configuration
