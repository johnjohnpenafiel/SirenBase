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
    CORS(app, origins=app.config['CORS_ORIGINS'])

    # Import models (required for Flask-Migrate to detect them)
    with app.app_context():
        from app.models import User, Item, History

    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.items import items_bp
    from app.routes.history import history_bp
    from app.routes.admin import admin_bp
    app.register_blueprint(auth_bp)
    app.register_blueprint(items_bp)
    app.register_blueprint(history_bp)
    app.register_blueprint(admin_bp)

    # Register error handlers
    register_error_handlers(app)

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
        # Log the actual error for debugging (would use logging in production)
        app.logger.error(f"Internal error: {error}")
        return {"error": "Internal server error"}, 500

    @app.errorhandler(Exception)
    def handle_unexpected_error(error):
        """Catch-all handler for unexpected errors."""
        db.session.rollback()
        # Log the actual error for debugging
        app.logger.error(f"Unexpected error: {error}")

        # Don't expose internal errors to client in production
        if app.config.get('ENV') == 'production':
            return {"error": "An unexpected error occurred"}, 500
        else:
            return {"error": str(error)}, 500
