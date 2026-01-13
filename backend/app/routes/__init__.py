"""
API route blueprints.

Shared routes (auth, admin) are in this directory.
Tool-specific routes are in the tools/ subdirectory.
"""
from app.routes.auth import auth_bp
from app.routes.admin import admin_bp
from app.routes.tools.tracking import tracking_bp
from app.routes.tools.rtde import rtde_bp
from app.routes.tools.milk_count import milk_count_bp

__all__ = ['auth_bp', 'admin_bp', 'tracking_bp', 'rtde_bp', 'milk_count_bp']
