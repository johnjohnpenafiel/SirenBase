"""
Milk Order System routes for managing milk inventory counting.

This package provides API endpoints for Tool 2: Milk Order System.
All routes are namespaced under /api/milk-order/*

Sub-modules:
    admin: Milk type and par level management
    sessions: Session workflow, history, and public endpoints
"""
from flask import Blueprint

milk_order_bp = Blueprint('milk_order', __name__, url_prefix='/api/milk-order')

# Import sub-modules to register routes on the blueprint
from app.routes.tools.milk_order import admin, sessions  # noqa: E402, F401
