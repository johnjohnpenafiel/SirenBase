"""
Admin routes for user management (admin-only access).
"""
from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError

from app.models.user import User
from app.schemas.user import AdminCreateUserSchema, UserResponseSchema
from app.middleware.auth import admin_required
from app.extensions import db

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')


@admin_bp.route('/users', methods=['GET'])
@jwt_required()
@admin_required
def get_all_users():
    """
    Get all users in the system.

    Requires:
        Authorization header with Bearer token
        Admin role

    Returns:
        200: {
            "users": [
                {
                    "id": "...",
                    "partner_number": "ADMIN001",
                    "name": "Admin User",
                    "role": "admin",
                    "created_at": "2025-10-17T..."
                },
                ...
            ]
        }
        403: {"error": "Admin access required"}
    """
    try:
        # Fetch all active (non-deleted) users, ordered by created_at
        users = User.query.filter_by(is_deleted=False).order_by(User.created_at.desc()).all()

        # Serialize users
        schema = UserResponseSchema(many=True)
        users_data = schema.dump(users)

        return jsonify({"users": users_data}), 200

    except Exception as e:
        return jsonify({"error": "Failed to fetch users"}), 500


@admin_bp.route('/users', methods=['POST'])
@jwt_required()
@admin_required
def create_user():
    """
    Create a new user account (admin only).

    This endpoint allows admins to create user accounts with any role.

    Requires:
        Authorization header with Bearer token
        Admin role

    Request JSON:
        {
            "partner_number": "STAFF002",
            "name": "Jane Smith",
            "pin": "5678",
            "role": "staff"  // Optional: "staff" or "admin", defaults to "staff"
        }

    Returns:
        201: {
            "message": "User created successfully",
            "user": {
                "id": "...",
                "partner_number": "STAFF002",
                "name": "Jane Smith",
                "role": "staff",
                "created_at": "2025-10-17T..."
            }
        }
        400: {"error": {"field": ["error message"]}}
        409: {"error": "Partner number already exists"}
        403: {"error": "Admin access required"}
    """
    schema = AdminCreateUserSchema()

    try:
        # Validate input (includes role validation)
        data = schema.load(request.json or {})
    except ValidationError as err:
        return jsonify({"error": err.messages}), 400

    # Check if partner number already exists
    existing_user = User.query.filter_by(
        partner_number=data['partner_number'].strip()
    ).first()

    if existing_user:
        return jsonify({"error": "Partner number already exists"}), 409

    # Role is already validated by the schema
    role = data.get('role', 'staff')

    try:
        # Create new user
        user = User(
            partner_number=data['partner_number'].strip(),
            name=data['name'].strip(),
            role=role
        )
        user.set_pin(data['pin'])

        # Save to database
        db.session.add(user)
        db.session.commit()

        # Serialize user data
        user_schema = UserResponseSchema()
        user_data = user_schema.dump(user)

        return jsonify({
            "message": "User created successfully",
            "user": user_data
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to create user"}), 500


@admin_bp.route('/users/<user_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_user(user_id: str):
    """
    Soft delete a user account by ID (admin only).

    This marks the user as deleted but preserves all audit trail data.
    History entries and items created by the user remain intact.

    Requires:
        Authorization header with Bearer token
        Admin role

    Path Parameters:
        user_id: UUID of the user to delete

    Returns:
        200: {
            "message": "User deleted successfully",
            "user": {
                "id": "...",
                "partner_number": "STAFF002",
                "name": "Jane Smith"
            }
        }
        403: {"error": "Admin access required"}
        403: {"error": "Cannot delete your own account"}
        404: {"error": "User not found"}
        410: {"error": "User is already deleted"}
    """
    try:
        # Get current user ID from JWT
        current_user_id = get_jwt_identity()

        # Prevent admin from deleting themselves
        if user_id == current_user_id:
            return jsonify({"error": "Cannot delete your own account"}), 403

        # Find user to delete
        user = User.query.get(user_id)

        if not user:
            return jsonify({"error": "User not found"}), 404

        # Check if user is already deleted
        if user.is_deleted:
            return jsonify({"error": "User is already deleted"}), 410

        # Serialize user data before deletion
        user_schema = UserResponseSchema()
        user_data = user_schema.dump(user)

        # Soft delete: set flags instead of removing from database
        user.is_deleted = True
        user.deleted_at = datetime.utcnow()
        user.deleted_by = current_user_id

        db.session.commit()

        return jsonify({
            "message": "User deleted successfully",
            "user": user_data
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to delete user"}), 500
