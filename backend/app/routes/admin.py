"""
Admin routes for user management (admin-only access).
"""
from datetime import datetime, timedelta
from typing import List, Dict, Any
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError

from app.models.user import User
from app.models.milk_order import MilkOrderParLevel, MilkType
from app.models.rtde import RTDEItem
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


# =============================================================================
# ADMIN ACTIVITY FEED
# =============================================================================

@admin_bp.route('/activity', methods=['GET'])
@jwt_required()
@admin_required
def get_admin_activity():
    """
    Get recent admin actions (user management, config changes).

    Query Parameters:
        limit (optional): Number of activities to return (default: 10, max: 30)

    Returns:
        200: {
            "activities": [
                {
                    "id": "user-create-uuid",
                    "type": "user_created",
                    "title": "User Created",
                    "description": "John Doe (123456)",
                    "admin_name": "System",
                    "timestamp": "2026-02-04T10:30:00Z"
                },
                ...
            ],
            "count": 10
        }
        401: {"msg": "Missing Authorization Header"}
        403: {"error": "Admin access required"}
    """
    # Get and validate limit parameter
    try:
        limit = min(int(request.args.get('limit', 10)), 30)
    except (TypeError, ValueError):
        limit = 10

    activities: List[Dict[str, Any]] = []
    cutoff_date = datetime.utcnow() - timedelta(days=30)

    # 1. User creations (recent 30 days)
    recent_users = (
        User.query
        .filter(User.created_at >= cutoff_date)
        .order_by(User.created_at.desc())
        .limit(limit)
        .all()
    )

    for user in recent_users:
        activities.append({
            'id': f'user-create-{user.id}',
            'type': 'user_created',
            'title': 'User Created',
            'description': f'{user.name} ({user.partner_number})',
            'admin_name': 'System',  # No tracking of who created
            'timestamp': user.created_at.isoformat() + 'Z'
        })

    # 2. User deletions (recent 30 days)
    deleted_users = (
        User.query
        .filter(
            User.is_deleted == True,
            User.deleted_at >= cutoff_date
        )
        .order_by(User.deleted_at.desc())
        .limit(limit)
        .all()
    )

    for user in deleted_users:
        # Get admin who deleted
        admin = User.query.get(user.deleted_by) if user.deleted_by else None
        admin_name = admin.name if admin else 'Unknown'

        activities.append({
            'id': f'user-delete-{user.id}',
            'type': 'user_deleted',
            'title': 'User Deleted',
            'description': f'{user.name} ({user.partner_number})',
            'admin_name': admin_name,
            'timestamp': user.deleted_at.isoformat() + 'Z'
        })

    # 3. Milk par level changes (recent 30 days)
    par_changes = (
        db.session.query(MilkOrderParLevel, MilkType, User)
        .join(MilkType, MilkOrderParLevel.milk_type_id == MilkType.id)
        .outerjoin(User, MilkOrderParLevel.updated_by == User.id)
        .filter(MilkOrderParLevel.updated_at >= cutoff_date)
        .order_by(MilkOrderParLevel.updated_at.desc())
        .limit(limit)
        .all()
    )

    for par, milk_type, admin in par_changes:
        admin_name = admin.name if admin else 'System'
        activities.append({
            'id': f'par-{par.id}',
            'type': 'milk_par_updated',
            'title': 'Milk Par Updated',
            'description': f'{milk_type.name}: {par.par_value}',
            'admin_name': admin_name,
            'timestamp': par.updated_at.isoformat() + 'Z'
        })

    # 4. RTD&E item changes (created/updated in last 30 days)
    rtde_items = (
        RTDEItem.query
        .filter(RTDEItem.updated_at >= cutoff_date)
        .order_by(RTDEItem.updated_at.desc())
        .limit(limit)
        .all()
    )

    for item in rtde_items:
        # Determine if created or updated based on timestamps
        time_diff = (item.updated_at - item.created_at).total_seconds()
        is_new = time_diff < 60  # Created within last minute

        if is_new:
            activity_type = 'rtde_item_created'
            title = 'RTD&E Item Created'
        else:
            activity_type = 'rtde_item_updated'
            title = 'RTD&E Item Updated'

        activities.append({
            'id': f'rtde-{item.id}-{int(item.updated_at.timestamp())}',
            'type': activity_type,
            'title': title,
            'description': f'{item.name} (Par: {item.par_level})',
            'admin_name': 'Admin',  # No tracking of who modified
            'timestamp': item.updated_at.isoformat() + 'Z'
        })

    # Sort all activities by timestamp descending
    activities.sort(key=lambda x: x['timestamp'], reverse=True)

    # Limit to requested count
    activities = activities[:limit]

    return jsonify({
        'activities': activities,
        'count': len(activities)
    }), 200
