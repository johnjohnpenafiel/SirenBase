"""
Milk Count System routes for managing milk inventory counting.

This module provides API endpoints for Tool 2: Milk Count System
All routes are namespaced under /api/milk-count/*
"""
from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy.orm import joinedload

from app.models.milk_count import (
    MilkType,
    MilkCountParLevel,
    MilkCountSession,
    MilkCountEntry,
    SessionStatus,
    MorningMethod,
)
from app.models.user import User
from app.extensions import db
from app.middleware.auth import admin_required
from app.utils.helpers import get_store_today

milk_count_bp = Blueprint('milk_count', __name__, url_prefix='/api/milk-count')


# =============================================================================
# ADMIN - MILK TYPE MANAGEMENT ENDPOINTS
# =============================================================================

@milk_count_bp.route('/admin/milk-types', methods=['GET'])
@jwt_required()
@admin_required
def get_admin_milk_types():
    """
    Get all milk types ordered by display_order (admin only).

    Query Parameters:
        include_inactive (optional): Include inactive types (default: false)

    Returns:
        200: {
            "milk_types": [
                {
                    "id": "...",
                    "name": "Whole",
                    "category": "dairy",
                    "display_order": 1,
                    "active": true,
                    "par_value": 30
                },
                ...
            ]
        }
        403: {"error": "Admin access required"}
    """
    include_inactive = request.args.get('include_inactive', 'false').lower() == 'true'

    # Build query
    query = MilkType.query

    # Filter by active status
    if not include_inactive:
        query = query.filter_by(active=True)

    # Order by display_order
    milk_types = query.order_by(MilkType.display_order).all()

    return jsonify({
        "milk_types": [mt.to_dict(include_par=True) for mt in milk_types]
    }), 200


@milk_count_bp.route('/admin/milk-types/<string:milk_type_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_milk_type(milk_type_id: str):
    """
    Update a milk type (admin only).

    URL Parameters:
        milk_type_id: The UUID of the milk type to update

    Request JSON:
        {
            "display_order": 2,
            "active": true
        }

    Returns:
        200: {
            "message": "Milk type updated successfully",
            "milk_type": {...}
        }
        400: {"error": "Validation error"}
        403: {"error": "Admin access required"}
        404: {"error": "Milk type not found"}
    """
    milk_type = MilkType.query.get(milk_type_id)

    if not milk_type:
        return jsonify({"error": "Milk type not found"}), 404

    data = request.json or {}

    try:
        # Update display_order if provided
        if 'display_order' in data:
            if not isinstance(data['display_order'], int) or data['display_order'] < 1:
                return jsonify({"error": {"display_order": ["Must be a positive integer"]}}), 400
            milk_type.display_order = data['display_order']

        # Update active status if provided
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

@milk_count_bp.route('/admin/par-levels', methods=['GET'])
@jwt_required()
@admin_required
def get_par_levels():
    """
    Get all par levels with milk type info (admin only).

    Returns:
        200: {
            "par_levels": [
                {
                    "id": "...",
                    "milk_type_id": "...",
                    "milk_type_name": "Whole",
                    "milk_type_category": "dairy",
                    "par_value": 30,
                    "updated_at": "2026-01-12T...",
                    "updated_by_name": "John Doe"
                },
                ...
            ]
        }
        403: {"error": "Admin access required"}
    """
    # Get par levels with milk type info, ordered by milk type display order
    par_levels = db.session.query(MilkCountParLevel).join(MilkType).filter(
        MilkType.active == True
    ).order_by(MilkType.display_order).all()

    return jsonify({
        "par_levels": [pl.to_dict(include_milk_type=True) for pl in par_levels]
    }), 200


@milk_count_bp.route('/admin/par-levels/<string:milk_type_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_par_level(milk_type_id: str):
    """
    Update par level for a milk type (admin only).

    URL Parameters:
        milk_type_id: The UUID of the milk type

    Request JSON:
        {
            "par_value": 30
        }

    Returns:
        200: {
            "message": "Par level updated successfully",
            "par_level": {...}
        }
        400: {"error": "Validation error"}
        403: {"error": "Admin access required"}
        404: {"error": "Milk type not found"}
    """
    current_user_id = get_jwt_identity()

    # Verify milk type exists
    milk_type = MilkType.query.get(milk_type_id)
    if not milk_type:
        return jsonify({"error": "Milk type not found"}), 404

    data = request.json or {}

    # Validate par_value
    if 'par_value' not in data:
        return jsonify({"error": {"par_value": ["Par value is required"]}}), 400

    if not isinstance(data['par_value'], int) or data['par_value'] < 0:
        return jsonify({"error": {"par_value": ["Must be a non-negative integer"]}}), 400

    try:
        # Find or create par level
        par_level = MilkCountParLevel.query.filter_by(milk_type_id=milk_type_id).first()

        if par_level:
            par_level.par_value = data['par_value']
            par_level.updated_by = current_user_id
            par_level.updated_at = datetime.utcnow()
        else:
            par_level = MilkCountParLevel(
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


# =============================================================================
# SESSION MANAGEMENT ENDPOINTS
# =============================================================================

@milk_count_bp.route('/sessions/today', methods=['GET'])
@jwt_required()
def get_today_session():
    """
    Get today's milk count session (if exists).

    Returns:
        200: {
            "session": {
                "id": "...",
                "date": "2026-01-12",
                "status": "night_foh",
                ...
            }
        }
        OR
        200: {"session": null}
    """
    today = get_store_today()

    session = MilkCountSession.query.filter_by(session_date=today).first()

    if not session:
        return jsonify({"session": None}), 200

    return jsonify({
        "session": session.to_dict(include_users=True)
    }), 200


@milk_count_bp.route('/sessions/start', methods=['POST'])
@jwt_required()
def start_session():
    """
    Start a new milk count session for today.

    Returns:
        201: {
            "message": "Session started",
            "session": {...}
        }
        400: {"error": "Session already exists for today"}
    """
    current_user_id = get_jwt_identity()
    today = get_store_today()

    # Check if session already exists for today
    existing = MilkCountSession.query.filter_by(session_date=today).first()

    if existing:
        return jsonify({
            "error": "Session already exists for today",
            "session": existing.to_dict()
        }), 400

    try:
        # Create new session
        session = MilkCountSession(
            session_date=today,
            status=SessionStatus.NIGHT_FOH.value
        )
        db.session.add(session)

        # Create entries for all active milk types
        milk_types = MilkType.query.filter_by(active=True).order_by(MilkType.display_order).all()

        for mt in milk_types:
            entry = MilkCountEntry(
                session_id=session.id,
                milk_type_id=mt.id
            )
            db.session.add(entry)

        db.session.commit()

        return jsonify({
            "message": "Session started",
            "session": session.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to start session"}), 500


@milk_count_bp.route('/sessions/<string:session_id>', methods=['GET'])
@jwt_required()
def get_session(session_id: str):
    """
    Get session details with all entries.

    URL Parameters:
        session_id: The UUID of the session

    Returns:
        200: {
            "session": {...},
            "entries": [
                {
                    "milk_type_id": "...",
                    "milk_type_name": "Whole",
                    "milk_type_category": "dairy",
                    "foh_count": 15,
                    "boh_count": 20,
                    ...
                },
                ...
            ]
        }
        404: {"error": "Session not found"}
    """
    # Load session with eager loading
    session = MilkCountSession.query.options(
        joinedload(MilkCountSession.entries).joinedload(MilkCountEntry.milk_type)
    ).get(session_id)

    if not session:
        return jsonify({"error": "Session not found"}), 404

    # Get entries ordered by milk type display order
    entries = sorted(session.entries, key=lambda e: e.milk_type.display_order if e.milk_type else 0)

    return jsonify({
        "session": session.to_dict(include_users=True),
        "entries": [entry.to_dict(include_milk_type=True) for entry in entries]
    }), 200


@milk_count_bp.route('/sessions/<string:session_id>/night-foh', methods=['PUT'])
@jwt_required()
def save_night_foh(session_id: str):
    """
    Save FOH counts for night count phase.

    URL Parameters:
        session_id: The UUID of the session

    Request JSON:
        {
            "counts": [
                {"milk_type_id": "...", "foh_count": 15},
                {"milk_type_id": "...", "foh_count": 12},
                ...
            ]
        }

    Returns:
        200: {"message": "FOH counts saved", "session": {...}}
        400: {"error": "Validation error"}
        404: {"error": "Session not found"}
    """
    current_user_id = get_jwt_identity()

    session = MilkCountSession.query.get(session_id)

    if not session:
        return jsonify({"error": "Session not found"}), 404

    # Verify session is in correct state
    if session.status != SessionStatus.NIGHT_FOH.value:
        return jsonify({"error": f"Cannot save FOH - session status is {session.status}"}), 400

    data = request.json or {}

    if 'counts' not in data or not isinstance(data['counts'], list):
        return jsonify({"error": "counts array required"}), 400

    try:
        # Update FOH counts for each milk type
        for count_data in data['counts']:
            if 'milk_type_id' not in count_data or 'foh_count' not in count_data:
                return jsonify({"error": "Each count must have milk_type_id and foh_count"}), 400

            foh_count = count_data['foh_count']
            if not isinstance(foh_count, int) or foh_count < 0:
                return jsonify({"error": "foh_count must be a non-negative integer"}), 400

            # Find entry
            entry = MilkCountEntry.query.filter_by(
                session_id=session_id,
                milk_type_id=count_data['milk_type_id']
            ).first()

            if entry:
                entry.foh_count = foh_count
                entry.updated_at = datetime.utcnow()

        # Advance session status
        session.mark_night_foh_complete(current_user_id)
        db.session.commit()

        return jsonify({
            "message": "FOH counts saved",
            "session": session.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to save FOH counts"}), 500


@milk_count_bp.route('/sessions/<string:session_id>/night-boh', methods=['PUT'])
@jwt_required()
def save_night_boh(session_id: str):
    """
    Save BOH counts for night count phase.

    URL Parameters:
        session_id: The UUID of the session

    Request JSON:
        {
            "counts": [
                {"milk_type_id": "...", "boh_count": 20},
                {"milk_type_id": "...", "boh_count": 18},
                ...
            ]
        }

    Returns:
        200: {"message": "BOH counts saved - night count complete", "session": {...}}
        400: {"error": "Validation error"}
        404: {"error": "Session not found"}
    """
    session = MilkCountSession.query.get(session_id)

    if not session:
        return jsonify({"error": "Session not found"}), 404

    # Verify session is in correct state
    if session.status != SessionStatus.NIGHT_BOH.value:
        return jsonify({"error": f"Cannot save BOH - session status is {session.status}"}), 400

    data = request.json or {}

    if 'counts' not in data or not isinstance(data['counts'], list):
        return jsonify({"error": "counts array required"}), 400

    try:
        # Update BOH counts for each milk type
        for count_data in data['counts']:
            if 'milk_type_id' not in count_data or 'boh_count' not in count_data:
                return jsonify({"error": "Each count must have milk_type_id and boh_count"}), 400

            boh_count = count_data['boh_count']
            if not isinstance(boh_count, int) or boh_count < 0:
                return jsonify({"error": "boh_count must be a non-negative integer"}), 400

            # Find entry
            entry = MilkCountEntry.query.filter_by(
                session_id=session_id,
                milk_type_id=count_data['milk_type_id']
            ).first()

            if entry:
                entry.boh_count = boh_count
                entry.updated_at = datetime.utcnow()

        # Advance session status to morning
        session.mark_night_boh_complete()
        db.session.commit()

        return jsonify({
            "message": "BOH counts saved - night count complete",
            "session": session.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to save BOH counts"}), 500


@milk_count_bp.route('/sessions/<string:session_id>/morning', methods=['PUT'])
@jwt_required()
def save_morning_count(session_id: str):
    """
    Save morning count data.

    URL Parameters:
        session_id: The UUID of the session

    Request JSON:
        {
            "counts": [
                {
                    "milk_type_id": "...",
                    "method": "boh_count",
                    "current_boh": 30  // if method is boh_count
                },
                {
                    "milk_type_id": "...",
                    "method": "direct_delivered",
                    "delivered": 10  // if method is direct_delivered
                },
                ...
            ]
        }

    Returns:
        200: {"message": "Morning count saved", "session": {...}}
        400: {"error": "Validation error"}
        404: {"error": "Session not found"}
    """
    current_user_id = get_jwt_identity()

    session = MilkCountSession.query.get(session_id)

    if not session:
        return jsonify({"error": "Session not found"}), 404

    # Verify session is in correct state
    if session.status != SessionStatus.MORNING.value:
        return jsonify({"error": f"Cannot save morning count - session status is {session.status}"}), 400

    data = request.json or {}

    if 'counts' not in data or not isinstance(data['counts'], list):
        return jsonify({"error": "counts array required"}), 400

    try:
        # Update morning counts for each milk type
        for count_data in data['counts']:
            if 'milk_type_id' not in count_data or 'method' not in count_data:
                return jsonify({"error": "Each count must have milk_type_id and method"}), 400

            method = count_data['method']
            if method not in [MorningMethod.BOH_COUNT.value, MorningMethod.DIRECT_DELIVERED.value]:
                return jsonify({"error": f"Invalid method: {method}"}), 400

            # Find entry
            entry = MilkCountEntry.query.filter_by(
                session_id=session_id,
                milk_type_id=count_data['milk_type_id']
            ).first()

            if entry:
                entry.morning_method = method

                if method == MorningMethod.BOH_COUNT.value:
                    if 'current_boh' not in count_data:
                        return jsonify({"error": "current_boh required for boh_count method"}), 400
                    current_boh = count_data['current_boh']
                    if not isinstance(current_boh, int) or current_boh < 0:
                        return jsonify({"error": "current_boh must be a non-negative integer"}), 400
                    entry.current_boh = current_boh
                    # Calculate delivered
                    entry.delivered = max(0, current_boh - (entry.boh_count or 0))

                elif method == MorningMethod.DIRECT_DELIVERED.value:
                    if 'delivered' not in count_data:
                        return jsonify({"error": "delivered required for direct_delivered method"}), 400
                    delivered = count_data['delivered']
                    if not isinstance(delivered, int) or delivered < 0:
                        return jsonify({"error": "delivered must be a non-negative integer"}), 400
                    entry.delivered = delivered
                    entry.current_boh = None  # Not applicable

                entry.updated_at = datetime.utcnow()

        # Advance to on order phase
        session.mark_morning_complete(current_user_id)
        db.session.commit()

        return jsonify({
            "message": "Morning count saved - continue to on order",
            "session": session.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to save morning count"}), 500


@milk_count_bp.route('/sessions/<string:session_id>/on-order', methods=['PUT'])
@jwt_required()
def save_on_order(session_id: str):
    """
    Save on-order values and complete the session.

    On-order values represent milk already ordered from IMS but not yet delivered.
    These are subtracted from the order calculation.

    URL Parameters:
        session_id: The UUID of the session

    Request JSON:
        {
            "on_orders": [
                {"milk_type_id": "...", "on_order": 5},
                {"milk_type_id": "...", "on_order": 0},
                ...
            ]
        }

    Returns:
        200: {"message": "On order saved - session complete", "session": {...}}
        400: {"error": "Validation error"}
        404: {"error": "Session not found"}
    """
    current_user_id = get_jwt_identity()

    session = MilkCountSession.query.get(session_id)

    if not session:
        return jsonify({"error": "Session not found"}), 404

    # Verify session is in correct state
    if session.status != SessionStatus.ON_ORDER.value:
        return jsonify({"error": f"Cannot save on order - session status is {session.status}"}), 400

    data = request.json or {}

    if 'on_orders' not in data or not isinstance(data['on_orders'], list):
        return jsonify({"error": "on_orders array required"}), 400

    try:
        # Update on_order values for each milk type
        for order_data in data['on_orders']:
            if 'milk_type_id' not in order_data or 'on_order' not in order_data:
                return jsonify({"error": "Each entry must have milk_type_id and on_order"}), 400

            on_order_value = order_data['on_order']
            if not isinstance(on_order_value, int) or on_order_value < 0:
                return jsonify({"error": "on_order must be a non-negative integer"}), 400

            # Find entry
            entry = MilkCountEntry.query.filter_by(
                session_id=session_id,
                milk_type_id=order_data['milk_type_id']
            ).first()

            if entry:
                entry.on_order = on_order_value
                entry.updated_at = datetime.utcnow()

        # Mark session as complete
        session.mark_on_order_complete(current_user_id)
        db.session.commit()

        return jsonify({
            "message": "On order saved - session complete",
            "session": session.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to save on order values"}), 500


# =============================================================================
# SUMMARY AND HISTORY ENDPOINTS
# =============================================================================

@milk_count_bp.route('/sessions/<string:session_id>/summary', methods=['GET'])
@jwt_required()
def get_session_summary(session_id: str):
    """
    Get calculated summary for a session.

    URL Parameters:
        session_id: The UUID of the session

    Returns:
        200: {
            "session": {...},
            "summary": [
                {
                    "milk_type": "Whole",
                    "category": "dairy",
                    "foh": 15,
                    "boh": 20,
                    "delivered": 10,
                    "on_order": 5,
                    "total": 45,
                    "par": 60,
                    "order": 10
                },
                ...
            ],
            "totals": {
                "total_foh": 100,
                "total_boh": 150,
                "total_delivered": 80,
                "total_on_order": 50,
                "total_inventory": 330,
                "total_order": 70
            }
        }
        404: {"error": "Session not found"}
    """
    # Load session with entries and par levels
    session = MilkCountSession.query.options(
        joinedload(MilkCountSession.entries).joinedload(MilkCountEntry.milk_type).joinedload(MilkType.par_level)
    ).get(session_id)

    if not session:
        return jsonify({"error": "Session not found"}), 404

    # Build summary
    summary = []
    totals = {
        "total_foh": 0,
        "total_boh": 0,
        "total_delivered": 0,
        "total_on_order": 0,
        "total_inventory": 0,
        "total_order": 0
    }

    # Sort entries by display order
    entries = sorted(session.entries, key=lambda e: e.milk_type.display_order if e.milk_type else 0)

    for entry in entries:
        if not entry.milk_type:
            continue

        foh = entry.foh_count or 0
        boh = entry.boh_count or 0
        delivered = entry.calculate_delivered() or 0
        on_order = entry.on_order or 0
        total = foh + boh + delivered
        par = entry.milk_type.par_level.par_value if entry.milk_type.par_level else 0
        # Order = Par - Total - OnOrder (what still needs to be ordered)
        order = max(0, par - total - on_order)

        summary.append({
            "milk_type": entry.milk_type.name,
            "category": entry.milk_type.category,
            "foh": foh,
            "boh": boh,
            "delivered": delivered,
            "on_order": on_order,
            "total": total,
            "par": par,
            "order": order
        })

        # Update totals
        totals["total_foh"] += foh
        totals["total_boh"] += boh
        totals["total_delivered"] += delivered
        totals["total_on_order"] += on_order
        totals["total_inventory"] += total
        totals["total_order"] += order

    return jsonify({
        "session": session.to_dict(include_users=True),
        "summary": summary,
        "totals": totals
    }), 200


@milk_count_bp.route('/history', methods=['GET'])
@jwt_required()
def get_history():
    """
    Get historical milk count sessions.

    Query Parameters:
        limit (optional): Max number of sessions (default: 30, max: 100)
        offset (optional): Pagination offset (default: 0)
        status (optional): Filter by status (completed, etc.)

    Returns:
        200: {
            "sessions": [...],
            "total": 45,
            "limit": 30,
            "offset": 0
        }
    """
    limit = min(int(request.args.get('limit', 30)), 100)
    offset = int(request.args.get('offset', 0))
    status_filter = request.args.get('status')

    # Build query
    query = MilkCountSession.query

    if status_filter:
        query = query.filter_by(status=status_filter)

    # Get total count
    total = query.count()

    # Get paginated results, ordered by date descending
    sessions = query.order_by(MilkCountSession.session_date.desc()).offset(offset).limit(limit).all()

    return jsonify({
        "sessions": [s.to_dict(include_users=True) for s in sessions],
        "total": total,
        "limit": limit,
        "offset": offset
    }), 200


# =============================================================================
# STAFF ENDPOINTS - MILK TYPES (for counting screens)
# =============================================================================

@milk_count_bp.route('/milk-types', methods=['GET'])
@jwt_required()
def get_milk_types():
    """
    Get all active milk types with par levels (for staff counting screens).

    Returns:
        200: {
            "milk_types": [
                {
                    "id": "...",
                    "name": "Whole",
                    "category": "dairy",
                    "display_order": 1,
                    "par_value": 30
                },
                ...
            ]
        }
    """
    milk_types = MilkType.query.filter_by(active=True).order_by(MilkType.display_order).all()

    return jsonify({
        "milk_types": [mt.to_dict(include_par=True) for mt in milk_types]
    }), 200
