"""
Milk Order admin endpoints for milk type and par level management.

Provides CRUD operations for milk types and par level configuration.
All endpoints require admin role.
"""
from datetime import datetime
from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.models.milk_order import MilkType, MilkOrderParLevel
from app.extensions import db
from app.middleware.auth import admin_required
from app.routes.tools.milk_order import milk_order_bp


# =============================================================================
# ADMIN - MILK TYPE MANAGEMENT ENDPOINTS
# =============================================================================

@milk_order_bp.route('/admin/milk-types', methods=['GET'])
@jwt_required()
@admin_required
def get_admin_milk_types():
    """
    Get all milk types ordered by display_order (admin only).

    Query Parameters:
        include_inactive (optional): Include inactive types (default: false)

    Returns:
        200: {"milk_types": [...]}
        403: {"error": "Admin access required"}
    """
    include_inactive = request.args.get('include_inactive', 'false').lower() == 'true'

    query = MilkType.query

    if not include_inactive:
        query = query.filter_by(active=True)

    milk_types = query.order_by(MilkType.display_order).all()

    return jsonify({
        "milk_types": [mt.to_dict(include_par=True) for mt in milk_types]
    }), 200


@milk_order_bp.route('/admin/milk-types/<string:milk_type_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_milk_type(milk_type_id: str):
    """
    Update a milk type (admin only).

    URL Parameters:
        milk_type_id: The UUID of the milk type to update

    Request JSON:
        {"display_order": 2, "active": true}

    Returns:
        200: {"message": "Milk type updated successfully", "milk_type": {...}}
        400: {"error": "Validation error"}
        403: {"error": "Admin access required"}
        404: {"error": "Milk type not found"}
    """
    milk_type = MilkType.query.get(milk_type_id)

    if not milk_type:
        return jsonify({"error": "Milk type not found"}), 404

    data = request.json or {}

    try:
        if 'display_order' in data:
            if not isinstance(data['display_order'], int) or data['display_order'] < 1:
                return jsonify({"error": {"display_order": ["Must be a positive integer"]}}), 400
            milk_type.display_order = data['display_order']

        if 'active' in data:
            milk_type.active = bool(data['active'])

        milk_type.updated_at = datetime.utcnow()
        db.session.commit()

        return jsonify({
            "message": "Milk type updated successfully",
            "milk_type": milk_type.to_dict(include_par=True)
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to update milk type"}), 500


# =============================================================================
# ADMIN - PAR LEVEL MANAGEMENT ENDPOINTS
# =============================================================================

@milk_order_bp.route('/admin/par-levels', methods=['GET'])
@jwt_required()
@admin_required
def get_par_levels():
    """
    Get all par levels with milk type info (admin only).

    Returns:
        200: {"par_levels": [...]}
        403: {"error": "Admin access required"}
    """
    par_levels = db.session.query(MilkOrderParLevel).join(MilkType).filter(
        MilkType.active == True  # noqa: E712
    ).order_by(MilkType.display_order).all()

    return jsonify({
        "par_levels": [pl.to_dict(include_milk_type=True) for pl in par_levels]
    }), 200


@milk_order_bp.route('/admin/par-levels/<string:milk_type_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_par_level(milk_type_id: str):
    """
    Update par level for a milk type (admin only).

    URL Parameters:
        milk_type_id: The UUID of the milk type

    Request JSON:
        {"par_value": 30}

    Returns:
        200: {"message": "Par level updated successfully", "par_level": {...}}
        400: {"error": "Validation error"}
        403: {"error": "Admin access required"}
        404: {"error": "Milk type not found"}
    """
    current_user_id = get_jwt_identity()

    milk_type = MilkType.query.get(milk_type_id)
    if not milk_type:
        return jsonify({"error": "Milk type not found"}), 404

    data = request.json or {}

    if 'par_value' not in data:
        return jsonify({"error": {"par_value": ["Par value is required"]}}), 400

    if not isinstance(data['par_value'], int) or data['par_value'] < 0:
        return jsonify({"error": {"par_value": ["Must be a non-negative integer"]}}), 400

    try:
        par_level = MilkOrderParLevel.query.filter_by(milk_type_id=milk_type_id).first()

        if par_level:
            par_level.par_value = data['par_value']
            par_level.updated_by = current_user_id
            par_level.updated_at = datetime.utcnow()
        else:
            par_level = MilkOrderParLevel(
                milk_type_id=milk_type_id,
                par_value=data['par_value'],
                updated_by=current_user_id
            )
            db.session.add(par_level)

        db.session.commit()

        return jsonify({
            "message": "Par level updated successfully",
            "par_level": par_level.to_dict(include_milk_type=True)
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to update par level"}), 500
