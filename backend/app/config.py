"""
Flask application configuration.
"""
import os
from datetime import timedelta
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class Config:
    """Base configuration class."""

    # Flask
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')

    # JWT
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key-change-in-production')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)

    # Database
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Connection Pool Configuration
    # Prevents "SSL connection has been closed unexpectedly" errors after idle periods
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,    # Validate connections before use (handles unexpected drops)
        "pool_recycle": 300,      # Recycle connections every 5 minutes (prevents staleness)
        "pool_size": 5,           # Base pool size
        "max_overflow": 10,       # Allow up to 15 total connections under load
        "pool_timeout": 30,       # Wait up to 30s for available connection
    }

    # CORS
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:3000').split(',')

    # Store Timezone (for date-based features like Milk Count sessions)
    # This ensures "today" is calculated from the store's perspective, not the server's
    STORE_TIMEZONE = os.getenv('STORE_TIMEZONE', 'America/Los_Angeles')


class DevelopmentConfig(Config):
    """Development configuration."""
    DEBUG = True
    FLASK_ENV = 'development'


class TestingConfig(Config):
    """Testing configuration."""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'

    # Override pooling options - SQLite doesn't support pool_size, max_overflow, pool_timeout
    # We use SQLite in-memory for tests because it's faster and doesn't require a test database
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,
    }


class ProductionConfig(Config):
    """Production configuration."""
    DEBUG = False
    FLASK_ENV = 'production'

    # Guard against deploying with default dev secret keys
    _DEV_DEFAULTS = {
        'dev-secret-key-change-in-production',
        'jwt-secret-key-change-in-production',
    }

    def __init__(self) -> None:
        if self.SECRET_KEY in self._DEV_DEFAULTS:
            raise ValueError(
                "SECRET_KEY still has the default dev value. "
                "Set a secure SECRET_KEY environment variable for production."
            )
        if self.JWT_SECRET_KEY in self._DEV_DEFAULTS:
            raise ValueError(
                "JWT_SECRET_KEY still has the default dev value. "
                "Set a secure JWT_SECRET_KEY environment variable for production."
            )


# Configuration dictionary
config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
