"""
API route blueprints.
"""
from app.routes.auth import auth_bp
from app.routes.items import items_bp
from app.routes.history import history_bp

__all__ = ['auth_bp', 'items_bp', 'history_bp']
