"""
RTD&E System routes for managing display items and counting sessions.

This package provides API endpoints for Tool 3: RTD&E Counting System.
All routes are namespaced under /api/rtde/*

Sub-modules:
    admin: Admin item management (CRUD + reorder)
    sessions: Session lifecycle, counting, pull list
"""
from flask import Blueprint

rtde_bp = Blueprint('rtde', __name__, url_prefix='/api/rtde')

# Import sub-modules to register routes on the blueprint
from app.routes.tools.rtde import admin, sessions  # noqa: E402, F401
