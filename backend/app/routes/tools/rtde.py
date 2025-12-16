"""
RTD&E System routes for managing display items and counting sessions.

This module provides API endpoints for Tool 3: RTD&E Counting System
All routes are namespaced under /api/rtde/*
"""
from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy.orm import joinedload

from app.models.rtde import RTDEItem, RTDECountSession, RTDESessionCount
from app.models.user import User
from app.extensions import db
from app.middleware.auth import admin_required

rtde_bp = Blueprint('rtde', __name__, url_prefix='/api/rtde')


# =============================================================================
# ADMIN - ITEM MANAGEMENT ENDPOINTS
# =============================================================================

@rtde_bp.route('/admin/items', methods=['GET'])
@jwt_required()
@admin_required
def get_admin_items():
    """
    Get all RTD&E items ordered by display_order (admin only).

    Query Parameters:
        include_inactive (optional): Include inactive items (default: false)

    Returns:
        200: {
            "items": [
                {
                    "id": "...",
                    "name": "Egg & Cheese Sandwich",
                    "icon": "🥪",
                    "par_level": 8,
                    "display_order": 1,
                    "active": true,
                    "created_at": "2025-11-22T...",
                    "updated_at": "2025-11-22T..."
                },
                ...
            ]
        }
        403: {"error": "Admin access required"}
    """
    include_inactive = request.args.get('include_inactive', 'false').lower() == 'true'

    # Build query
    query = RTDEItem.query

    # Filter by active status
    if not include_inactive:
        query = query.filter_by(active=True)

    # Order by display_order (for counting sequence)
    items = query.order_by(RTDEItem.display_order).all()

    return jsonify({
        "items": [item.to_dict() for item in items]
    }), 200


@rtde_bp.route('/admin/items', methods=['POST'])
@jwt_required()
@admin_required
def create_item():
    """
    Create a new RTD&E item (admin only).

    Request JSON:
        {
            "name": "Egg & Cheese Sandwich",
            "brand": "Evolution",  // optional
            "icon": "🥪",
            "par_level": 8
        }

    Returns:
        201: {
            "message": "Item created successfully",
            "item": {...}
        }
        400: {"error": "Validation error"}
        403: {"error": "Admin access required"}
    """
    data = request.json or {}

    # Validate required fields
    if not data.get('name') or not data.get('name').strip():
        return jsonify({"error": {"name": ["Item name is required"]}}), 400

    if not data.get('icon') or not data.get('icon').strip():
        return jsonify({"error": {"icon": ["Icon is required"]}}), 400

    if 'par_level' not in data or not isinstance(data['par_level'], int) or data['par_level'] < 1:
        return jsonify({"error": {"par_level": ["Par level must be a positive integer"]}}), 400

    # Validate string lengths
    name = data['name'].strip()
    icon = data['icon'].strip()

    if len(name) > 100:
        return jsonify({"error": {"name": ["Name too long (max 100 characters)"]}}), 400

    if len(icon) > 10:
        return jsonify({"error": {"icon": ["Icon too long (max 10 characters)"]}}), 400

    # Handle optional brand field
    brand = None
    if data.get('brand') and data.get('brand').strip():
        brand = data['brand'].strip()
        if len(brand) > 50:
            return jsonify({"error": {"brand": ["Brand too long (max 50 characters)"]}}), 400

    try:
        # Get max display_order and add 1 (auto-append to end)
        max_order = db.session.query(db.func.max(RTDEItem.display_order)).scalar() or 0

        # Create new item
        item = RTDEItem(
            name=name,
            brand=brand,
            icon=icon,
            par_level=data['par_level'],
            display_order=max_order + 1,
            active=data.get('active', True)
        )

        db.session.add(item)
        db.session.commit()

        return jsonify({
            "message": "Item created successfully",
            "item": item.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to create item"}), 500


@rtde_bp.route('/admin/items/<string:item_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_item(item_id: str):
    """
    Update an existing RTD&E item (admin only).

    URL Parameters:
        item_id: The UUID of the item to update

    Request JSON:
        {
            "name": "Egg & Cheese Sandwich",
            "brand": "Evolution",  // optional, can be null to clear
            "icon": "🥪",
            "par_level": 10,
            "active": true
        }

    Returns:
        200: {
            "message": "Item updated successfully",
            "item": {...}
        }
        400: {"error": "Validation error"}
        403: {"error": "Admin access required"}
        404: {"error": "Item not found"}
    """
    item = RTDEItem.query.get(item_id)

    if not item:
        return jsonify({"error": "Item not found"}), 404

    data = request.json or {}

    try:
        # Update fields if provided
        if 'name' in data:
            name = data['name'].strip()
            if not name:
                return jsonify({"error": {"name": ["Item name cannot be empty"]}}), 400
            if len(name) > 100:
                return jsonify({"error": {"name": ["Name too long (max 100 characters)"]}}), 400
            item.name = name

        # Handle brand field (can be set, updated, or cleared)
        if 'brand' in data:
            if data['brand'] is None or data['brand'] == '':
                item.brand = None
            else:
                brand = data['brand'].strip()
                if len(brand) > 50:
                    return jsonify({"error": {"brand": ["Brand too long (max 50 characters)"]}}), 400
                item.brand = brand if brand else None

        if 'icon' in data:
            icon = data['icon'].strip()
            if not icon:
                return jsonify({"error": {"icon": ["Icon cannot be empty"]}}), 400
            if len(icon) > 10:
                return jsonify({"error": {"icon": ["Icon too long (max 10 characters)"]}}), 400
            item.icon = icon

        if 'par_level' in data:
            par_level = data['par_level']
            if not isinstance(par_level, int) or par_level < 1:
                return jsonify({"error": {"par_level": ["Par level must be a positive integer"]}}), 400
            item.par_level = par_level

        if 'active' in data:
            item.active = bool(data['active'])

        # Update timestamp
        item.updated_at = datetime.utcnow()

        db.session.commit()

        return jsonify({
            "message": "Item updated successfully",
            "item": item.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to update item"}), 500


@rtde_bp.route('/admin/items/<string:item_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_item(item_id: str):
    """
    Delete an RTD&E item (admin only).

    Logic:
    - If item never used in sessions → Hard delete
    - If item used in sessions → Soft delete (set active=False)

    URL Parameters:
        item_id: The UUID of the item to delete

    Returns:
        200: {
            "message": "Item deleted successfully",
            "deleted_permanently": true/false
        }
        403: {"error": "Admin access required"}
        404: {"error": "Item not found"}
    """
    item = RTDEItem.query.get(item_id)

    if not item:
        return jsonify({"error": "Item not found"}), 404

    try:
        # Check if item has been used in any sessions
        has_counts = db.session.query(RTDESessionCount).filter_by(item_id=item_id).first() is not None

        if has_counts:
            # Soft delete - set inactive
            item.active = False
            item.updated_at = datetime.utcnow()
            db.session.commit()

            return jsonify({
                "message": "Item deactivated (has been used in sessions)",
                "deleted_permanently": False
            }), 200
        else:
            # Hard delete - remove from database
            db.session.delete(item)
            db.session.commit()

            return jsonify({
                "message": "Item deleted permanently",
                "deleted_permanently": True
            }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to delete item"}), 500


@rtde_bp.route('/admin/items/reorder', methods=['PUT'])
@jwt_required()
@admin_required
def reorder_items():
    """
    Update display order for multiple items (drag-and-drop support).

    Request JSON:
        {
            "item_orders": [
                {"id": "uuid-1", "display_order": 1},
                {"id": "uuid-2", "display_order": 2},
                {"id": "uuid-3", "display_order": 3}
            ]
        }

    Returns:
        200: {"message": "Items reordered successfully"}
        400: {"error": "Validation error"}
        403: {"error": "Admin access required"}
    """
    data = request.json or {}

    if 'item_orders' not in data or not isinstance(data['item_orders'], list):
        return jsonify({"error": "item_orders array required"}), 400

    try:
        # Update display_order for each item
        for item_data in data['item_orders']:
            if 'id' not in item_data or 'display_order' not in item_data:
                return jsonify({"error": "Each item must have id and display_order"}), 400

            item = RTDEItem.query.get(item_data['id'])
            if not item:
                return jsonify({"error": f"Item {item_data['id']} not found"}), 404

            item.display_order = item_data['display_order']
            item.updated_at = datetime.utcnow()

        db.session.commit()

        return jsonify({"message": "Items reordered successfully"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to reorder items"}), 500


# =============================================================================
# SESSION MANAGEMENT ENDPOINTS
# =============================================================================

@rtde_bp.route('/sessions/active', methods=['GET'])
@jwt_required()
def get_active_session():
    """
    Check for active session for current user.

    Returns:
        200: {
            "session": {
                "id": "...",
                "started_at": "2025-11-22T...",
                "expires_at": "2025-11-22T...",
                "items_counted": 3,
                "total_items": 12
            }
        }
        OR
        200: {"session": null}
    """
    current_user_id = get_jwt_identity()

    # Find active session for user
    session = RTDECountSession.query.filter_by(
        user_id=current_user_id,
        status='in_progress'
    ).first()

    if not session:
        return jsonify({"session": None}), 200

    # Check if expired
    if session.is_expired():
        session.status = 'expired'
        db.session.commit()
        return jsonify({"session": None}), 200

    # Get count stats
    items_counted = db.session.query(RTDESessionCount).filter(
        RTDESessionCount.session_id == session.id,
        RTDESessionCount.counted_quantity > 0
    ).count()

    total_items = RTDEItem.query.filter_by(active=True).count()

    return jsonify({
        "session": {
            "id": session.id,
            "started_at": session.started_at.isoformat(),
            "expires_at": session.expires_at.isoformat(),
            "items_counted": items_counted,
            "total_items": total_items
        }
    }), 200


@rtde_bp.route('/sessions/start', methods=['POST'])
@jwt_required()
def start_session():
    """
    Start new counting session or resume existing.

    Request JSON:
        {
            "action": "new"  // or "resume"
        }

    Logic:
    - If action = "new" → Delete any existing session, create new one
    - If action = "resume" → Return existing session ID (error if none exists)

    Returns:
        201: {
            "session_id": "...",
            "expires_at": "2025-11-22T..."
        }
        400: {"error": "No active session to resume"}
    """
    current_user_id = get_jwt_identity()
    data = request.json or {}
    action = data.get('action', 'new')

    try:
        # Find existing session
        existing_session = RTDECountSession.query.filter_by(
            user_id=current_user_id,
            status='in_progress'
        ).first()

        if action == 'resume':
            if not existing_session or existing_session.is_expired():
                return jsonify({"error": "No active session to resume"}), 400

            return jsonify({
                "session_id": existing_session.id,
                "expires_at": existing_session.expires_at.isoformat()
            }), 200

        # action == 'new'
        # Delete existing session if any (cascade deletes counts)
        if existing_session:
            db.session.delete(existing_session)

        # Create new session
        session = RTDECountSession(
            user_id=current_user_id,
            status='in_progress',
            started_at=datetime.utcnow()
        )
        # expires_at set automatically in __init__ (started_at + 4 hours)

        db.session.add(session)
        db.session.commit()

        return jsonify({
            "session_id": session.id,
            "expires_at": session.expires_at.isoformat()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to start session"}), 500


@rtde_bp.route('/sessions/<string:session_id>', methods=['GET'])
@jwt_required()
def get_session(session_id: str):
    """
    Get session details with all item counts.

    URL Parameters:
        session_id: The UUID of the session

    Returns:
        200: {
            "session": {
                "id": "...",
                "started_at": "...",
                "expires_at": "...",
                "status": "in_progress"
            },
            "items": [
                {
                    "item_id": "...",
                    "name": "Egg & Cheese Sandwich",
                    "icon": "🥪",
                    "par_level": 8,
                    "display_order": 1,
                    "counted_quantity": 5,
                    "need_quantity": 3,
                    "is_pulled": false
                },
                ...
            ]
        }
        403: {"error": "Unauthorized - not your session"}
        404: {"error": "Session not found"}
    """
    current_user_id = get_jwt_identity()

    # Load session with eager loading of counts and items
    session = RTDECountSession.query.options(
        joinedload(RTDECountSession.counts).joinedload(RTDESessionCount.item)
    ).get(session_id)

    if not session:
        return jsonify({"error": "Session not found"}), 404

    # Verify ownership
    if session.user_id != current_user_id:
        return jsonify({"error": "Unauthorized - not your session"}), 403

    # Get all active items ordered by display_order
    all_items = RTDEItem.query.filter_by(active=True).order_by(RTDEItem.display_order).all()

    # Build counts map (session_id + item_id -> count)
    counts_map = {count.item_id: count for count in session.counts}

    # Build response items (include all active items, default count 0)
    items_data = []
    for item in all_items:
        count = counts_map.get(item.id)
        counted_quantity = count.counted_quantity if count else 0
        is_pulled = count.is_pulled if count else False

        items_data.append({
            "item_id": item.id,
            "name": item.name,
            "brand": item.brand,
            "icon": item.icon,
            "par_level": item.par_level,
            "display_order": item.display_order,
            "counted_quantity": counted_quantity,
            "need_quantity": max(0, item.par_level - counted_quantity),
            "is_pulled": is_pulled
        })

    return jsonify({
        "session": session.to_dict(),
        "items": items_data
    }), 200


@rtde_bp.route('/sessions/<string:session_id>/count', methods=['PUT'])
@jwt_required()
def update_count(session_id: str):
    """
    Update count for specific item in session.

    URL Parameters:
        session_id: The UUID of the session

    Request JSON:
        {
            "item_id": "...",
            "counted_quantity": 5
        }

    Returns:
        200: {"message": "Count updated successfully"}
        400: {"error": "Validation error"}
        403: {"error": "Unauthorized - not your session"}
        404: {"error": "Session not found"}
    """
    current_user_id = get_jwt_identity()

    # Find session
    session = RTDECountSession.query.get(session_id)

    if not session:
        return jsonify({"error": "Session not found"}), 404

    # Verify ownership
    if session.user_id != current_user_id:
        return jsonify({"error": "Unauthorized - not your session"}), 403

    data = request.json or {}

    # Validate input
    if 'item_id' not in data or 'counted_quantity' not in data:
        return jsonify({"error": "item_id and counted_quantity required"}), 400

    if not isinstance(data['counted_quantity'], int) or data['counted_quantity'] < 0:
        return jsonify({"error": "counted_quantity must be a non-negative integer"}), 400

    try:
        # Verify item exists
        item = RTDEItem.query.get(data['item_id'])
        if not item:
            return jsonify({"error": "Item not found"}), 404

        # Upsert count (update if exists, insert if not)
        count = RTDESessionCount.query.filter_by(
            session_id=session_id,
            item_id=data['item_id']
        ).first()

        if count:
            # Update existing count
            count.counted_quantity = data['counted_quantity']
            count.updated_at = datetime.utcnow()
        else:
            # Create new count
            count = RTDESessionCount(
                session_id=session_id,
                item_id=data['item_id'],
                counted_quantity=data['counted_quantity']
            )
            db.session.add(count)

        db.session.commit()

        return jsonify({"message": "Count updated successfully"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to update count"}), 500


# =============================================================================
# PULL LIST ENDPOINTS
# =============================================================================

@rtde_bp.route('/sessions/<string:session_id>/pull-list', methods=['GET'])
@jwt_required()
def get_pull_list(session_id: str):
    """
    Generate pull list (items where need_quantity > 0).

    URL Parameters:
        session_id: The UUID of the session

    Returns:
        200: {
            "pull_list": [
                {
                    "item_id": "...",
                    "name": "Egg & Cheese Sandwich",
                    "icon": "🥪",
                    "need_quantity": 3,
                    "is_pulled": false
                },
                ...
            ],
            "total_items": 5,
            "items_pulled": 0
        }
        403: {"error": "Unauthorized - not your session"}
        404: {"error": "Session not found"}
    """
    current_user_id = get_jwt_identity()

    # Find session
    session = RTDECountSession.query.get(session_id)

    if not session:
        return jsonify({"error": "Session not found"}), 404

    # Verify ownership
    if session.user_id != current_user_id:
        return jsonify({"error": "Unauthorized - not your session"}), 403

    # Get all active items with their counts
    items = RTDEItem.query.filter_by(active=True).order_by(RTDEItem.display_order).all()

    # Build counts map
    counts_map = {count.item_id: count for count in session.counts}

    # Build pull list (only items with need > 0)
    pull_list = []
    for item in items:
        count = counts_map.get(item.id)
        counted_quantity = count.counted_quantity if count else 0
        need_quantity = max(0, item.par_level - counted_quantity)

        if need_quantity > 0:
            pull_list.append({
                "item_id": item.id,
                "name": item.name,
                "brand": item.brand,
                "icon": item.icon,
                "need_quantity": need_quantity,
                "is_pulled": count.is_pulled if count else False
            })

    # Count items marked as pulled
    items_pulled = sum(1 for item in pull_list if item['is_pulled'])

    return jsonify({
        "pull_list": pull_list,
        "total_items": len(pull_list),
        "items_pulled": items_pulled
    }), 200


@rtde_bp.route('/sessions/<string:session_id>/pull', methods=['PUT'])
@jwt_required()
def mark_item_pulled(session_id: str):
    """
    Mark item as pulled or unpulled in pull list.

    URL Parameters:
        session_id: The UUID of the session

    Request JSON:
        {
            "item_id": "...",
            "is_pulled": true
        }

    Returns:
        200: {"message": "Pull status updated"}
        400: {"error": "Validation error"}
        403: {"error": "Unauthorized - not your session"}
        404: {"error": "Session or count not found"}
    """
    current_user_id = get_jwt_identity()

    # Find session
    session = RTDECountSession.query.get(session_id)

    if not session:
        return jsonify({"error": "Session not found"}), 404

    # Verify ownership
    if session.user_id != current_user_id:
        return jsonify({"error": "Unauthorized - not your session"}), 403

    data = request.json or {}

    # Validate input
    if 'item_id' not in data or 'is_pulled' not in data:
        return jsonify({"error": "item_id and is_pulled required"}), 400

    try:
        # Find count for this item
        count = RTDESessionCount.query.filter_by(
            session_id=session_id,
            item_id=data['item_id']
        ).first()

        if not count:
            # If no count exists yet, create one with default quantity 0
            count = RTDESessionCount(
                session_id=session_id,
                item_id=data['item_id'],
                counted_quantity=0,
                is_pulled=bool(data['is_pulled'])
            )
            db.session.add(count)
        else:
            # Update existing count
            count.is_pulled = bool(data['is_pulled'])
            count.updated_at = datetime.utcnow()

        db.session.commit()

        return jsonify({"message": "Pull status updated"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to update pull status"}), 500


@rtde_bp.route('/sessions/<string:session_id>/complete', methods=['POST'])
@jwt_required()
def complete_session(session_id: str):
    """
    Mark session as complete and delete all data.

    Logic:
    1. Set status = 'completed'
    2. Set completed_at = NOW()
    3. Delete session (cascade deletes all counts)

    URL Parameters:
        session_id: The UUID of the session

    Returns:
        200: {"message": "RTD&E display restocking completed!"}
        403: {"error": "Unauthorized - not your session"}
        404: {"error": "Session not found"}
    """
    current_user_id = get_jwt_identity()

    # Find session
    session = RTDECountSession.query.get(session_id)

    if not session:
        return jsonify({"error": "Session not found"}), 404

    # Verify ownership
    if session.user_id != current_user_id:
        return jsonify({"error": "Unauthorized - not your session"}), 403

    try:
        # Mark as completed
        session.mark_completed()
        db.session.commit()

        # Delete session (cascade deletes counts)
        db.session.delete(session)
        db.session.commit()

        return jsonify({
            "message": "RTD&E display restocking completed!"
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to complete session"}), 500
