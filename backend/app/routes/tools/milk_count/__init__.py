"""
Milk Count System routes for managing milk inventory counting.

This package provides API endpoints for Tool 2: Milk Count System.
All routes are namespaced under /api/milk-count/*

Sub-modules:
    admin: Milk type and par level management
    sessions: Session workflow, history, and public endpoints
"""
from flask import Blueprint

milk_count_bp = Blueprint('milk_count', __name__, url_prefix='/api/milk-count')

# Import sub-modules to register routes on the blueprint
from app.routes.tools.milk_count import admin, sessions  # noqa: E402, F401
