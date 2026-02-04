"""
Flask application factory.
"""
from flask import Flask
from flask_cors import CORS

from app.config import config
from app.extensions import db, jwt, migrate


def create_app(config_name='default'):
    """
    Create and configure the Flask application.

    Args:
        config_name: Configuration to use ('development', 'testing', 'production')

    Returns:
        Configured Flask application instance
    """
    app = Flask(__name__)

    # Load configuration
    app.config.from_object(config[config_name])

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)

    # Configure CORS
    CORS(app, origins=app.config['CORS_ORIGINS'], supports_credentials=True)

    # Import models (required for Flask-Migrate to detect them)
    with app.app_context():
        from app.models import (
            User, Item, History,
            RTDEItem, RTDECountSession, RTDESessionCount,
            MilkType, MilkCountParLevel, MilkCountSession, MilkCountEntry
        )

    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.admin import admin_bp
    from app.routes.activity import activity_bp
    from app.routes.tools.tracking import tracking_bp
    from app.routes.tools.rtde import rtde_bp
    from app.routes.tools.milk_count import milk_count_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(activity_bp)
    app.register_blueprint(tracking_bp)
    app.register_blueprint(rtde_bp)
    app.register_blueprint(milk_count_bp)

    # Register error handlers
    register_error_handlers(app)

    # Register CLI commands (for development/testing)
    from app.cli import register_cli_commands
    register_cli_commands(app)

    return app


def register_error_handlers(app):
    """
    Register global error handlers for consistent error responses.

    All errors return JSON with format:
    {
        "error": "Error message or details"
    }
    """
    from marshmallow import ValidationError
    from werkzeug.exceptions import HTTPException
    from sqlalchemy.exc import SQLAlchemyError, OperationalError

    @app.errorhandler(ValidationError)
    def handle_validation_error(error):
        """Handle Marshmallow validation errors."""
        return {"error": error.messages}, 400

    @app.errorhandler(400)
    def bad_request(error):
        """Handle bad request errors."""
        return {"error": "Bad request"}, 400

    @app.errorhandler(401)
    def unauthorized(error):
        """Handle unauthorized errors."""
        return {"error": "Unauthorized"}, 401

    @app.errorhandler(403)
    def forbidden(error):
        """Handle forbidden errors."""
        return {"error": "Forbidden"}, 403

    @app.errorhandler(404)
    def not_found(error):
        """Handle not found errors."""
        return {"error": "Resource not found"}, 404

    @app.errorhandler(409)
    def conflict(error):
        """Handle conflict errors."""
        return {"error": "Resource conflict"}, 409

    @app.errorhandler(500)
    def internal_error(error):
        """Handle internal server errors."""
        db.session.rollback()
        app.logger.error(f"Internal error: {error}")
        return {"error": "Internal server error"}, 500

    @app.errorhandler(OperationalError)
    def handle_db_operational_error(error):
        """
        Handle database operational errors (connection issues, SSL drops, etc.).

        These errors should NEVER expose SQL queries to users.
        """
        db.session.rollback()
        # Log full error for debugging (includes SQL for investigation)
        app.logger.error(f"Database operational error: {error}")
        # Return user-friendly message - never expose SQL details
        return {"error": "Database connection error. Please try again."}, 503

    @app.errorhandler(SQLAlchemyError)
    def handle_db_error(error):
        """
        Handle general SQLAlchemy errors.

        These errors should NEVER expose SQL queries or schema details to users.
        """
        db.session.rollback()
        # Log full error for debugging
        app.logger.error(f"Database error: {error}")
        # Return generic message - never expose SQL details
        return {"error": "A database error occurred. Please try again."}, 500

    @app.errorhandler(Exception)
    def handle_unexpected_error(error):
        """Catch-all handler for unexpected errors."""
        db.session.rollback()
        # Log the actual error for debugging
        app.logger.error(f"Unexpected error: {error}")

        # ALWAYS sanitize errors in production (DEBUG=False)
        # Never expose internal details, SQL queries, or stack traces
        if not app.debug:
            return {"error": "An unexpected error occurred. Please try again."}, 500
        else:
            # Only show full errors in development mode
            return {"error": str(error)}, 500
