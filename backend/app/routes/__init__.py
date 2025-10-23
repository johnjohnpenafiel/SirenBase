"""
API route blueprints.
"""
from app.routes.auth import auth_bp
from app.routes.items import items_bp

__all__ = ['auth_bp', 'items_bp']
