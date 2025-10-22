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
    app.register_blueprint(auth_bp)

    # TODO: Register additional blueprints as they are created
    # from app.routes.items import items_bp
    # from app.routes.history import history_bp
    # from app.routes.admin import admin_bp
    # app.register_blueprint(items_bp)
    # app.register_blueprint(history_bp)
    # app.register_blueprint(admin_bp)

    # Register error handlers
    register_error_handlers(app)

    return app


def register_error_handlers(app):
    """Register global error handlers."""

    @app.errorhandler(404)
    def not_found(error):
        return {"error": "Resource not found"}, 404

    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return {"error": "Internal server error"}, 500
