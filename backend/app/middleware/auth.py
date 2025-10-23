"""
Authentication and authorization middleware.
"""
from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt_identity

from app.models.user import User


def admin_required(fn):
    """
    Decorator to require admin role for route access.

    Must be used AFTER @jwt_required() decorator.

    Usage:
        @app.route('/admin/users')
        @jwt_required()
        @admin_required
        def admin_only_route():
            pass

    Returns:
        403: {"error": "Admin access required"} if user is not admin
    """
    @wraps(fn)
    def wrapper(*args, **kwargs):
        # Get current user ID from JWT
        current_user_id = get_jwt_identity()

        # Fetch user from database
        user = User.query.get(current_user_id)

        # Check if user exists and has admin role
        # Handle both enum and string values
        if not user:
            return jsonify({"error": "Admin access required"}), 403

        user_role = user.role.value if hasattr(user.role, 'value') else str(user.role)
        if user_role != 'admin':
            return jsonify({"error": "Admin access required"}), 403

        return fn(*args, **kwargs)

    return wrapper
