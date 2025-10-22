"""
Middleware for authentication and authorization.
"""
from app.middleware.auth import admin_required

__all__ = ['admin_required']
