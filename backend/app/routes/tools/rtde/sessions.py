"""
RTD&E session endpoints for counting workflow and pull lists.

Provides session lifecycle management (start, count, pull list, complete)
and activity tracking endpoints.
"""
from datetime import datetime
from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy.orm import joinedload

from app.models.rtde import RTDEItem, RTDECountSession, RTDESessionCount
from app.models.user import User
from app.extensions import db
from app.routes.tools.rtde import rtde_bp


# =============================================================================
# SESSION MANAGEMENT ENDPOINTS
# =============================================================================

@rtde_bp.route('/sessions/active', methods=['GET'])
@jwt_required()
def get_active_session():
    """
    Check for active session for current user.

    Returns:
        200: {"session": {...}} or {"session": null}
    """
    current_user_id = get_jwt_identity()

    session = RTDECountSession.query.filter_by(
        user_id=current_user_id,
        status='in_progress'
    ).order_by(RTDECountSession.started_at.desc()).first()

    if not session:
        return jsonify({"session": None}), 200

    if session.is_expired():
        session.status = 'expired'
        db.session.commit()
        return jsonify({"session": None}), 200

    items_counted = db.session.query(RTDESessionCount).filter(
        RTDESessionCount.session_id == session.id,
        RTDESessionCount.counted_quantity > 0
    ).count()

    total_items = RTDEItem.query.filter_by(active=True).count()

    return jsonify({
        "session": {
            "id": session.id,
            "started_at": session.started_at.isoformat() + 'Z',
            "expires_at": session.expires_at.isoformat() + 'Z',
            "items_counted": items_counted,
            "total_items": total_items
        }
    }), 200


@rtde_bp.route('/sessions/last-completed', methods=['GET'])
@jwt_required()
def get_last_completed():
    """
    Get the most recent completed RTD&E session (store-level).

    Returns the timestamp and user name of the last completed session
    across all users. Used by the dashboard RTD&E timer circle.

    Returns:
        200: {"last_completed_at": "2026-02-07T10:30:00Z", "user_name": "Sarah"}
        200: {"last_completed_at": null}
    """
    last_session = (
        RTDECountSession.query
        .filter_by(status='completed')
        .order_by(RTDECountSession.completed_at.desc())
        .first()
    )

    if not last_session or not last_session.completed_at:
        return jsonify({"last_completed_at": None}), 200

    user = User.query.get(last_session.user_id)

    return jsonify({
        "last_completed_at": last_session.completed_at.isoformat() + 'Z',
        "user_name": user.name if user else "Unknown"
    }), 200


@rtde_bp.route('/sessions/start', methods=['POST'])
@jwt_required()
def start_session():
    """
    Start new counting session or resume existing.

    Request JSON:
        {"action": "new"} or {"action": "resume"}

    Returns:
        201: {"session_id": "...", "expires_at": "..."}
        400: {"error": "No active session to resume"}
    """
    current_user_id = get_jwt_identity()
    data = request.json or {}
    action = data.get('action', 'new')

    try:
        existing_sessions = RTDECountSession.query.filter_by(
            user_id=current_user_id,
            status='in_progress'
        ).order_by(RTDECountSession.started_at.desc()).all()

        if action == 'resume':
            existing_session = existing_sessions[0] if existing_sessions else None
            if not existing_session or existing_session.is_expired():
                return jsonify({"error": "No active session to resume"}), 400

            return jsonify({
                "session_id": existing_session.id,
                "expires_at": existing_session.expires_at.isoformat() + 'Z'
            }), 200

        # action == 'new'
        for existing_session in existing_sessions:
            db.session.delete(existing_session)

        session = RTDECountSession(
            user_id=current_user_id,
            status='in_progress',
            started_at=datetime.utcnow()
        )

        db.session.add(session)
        db.session.commit()

        return jsonify({
            "session_id": session.id,
            "expires_at": session.expires_at.isoformat() + 'Z'
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
        200: {"session": {...}, "items": [...]}
        403: {"error": "Unauthorized - not your session"}
        404: {"error": "Session not found"}
    """
    current_user_id = get_jwt_identity()

    session = RTDECountSession.query.options(
        joinedload(RTDECountSession.counts).joinedload(RTDESessionCount.item)
    ).get(session_id)

    if not session:
        return jsonify({"error": "Session not found"}), 404

    if session.user_id != current_user_id:
        return jsonify({"error": "Unauthorized - not your session"}), 403

    all_items = RTDEItem.query.filter_by(active=True).order_by(RTDEItem.display_order).all()

    counts_map = {count.item_id: count for count in session.counts}

    items_data = []
    for item in all_items:
        count = counts_map.get(item.id)
        counted_quantity = count.counted_quantity if count else 0
        is_pulled = count.is_pulled if count else False

        items_data.append({
            "item_id": item.id,
            "name": item.name,
            "brand": item.brand,
            "image_filename": item.image_filename,
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
        {"item_id": "...", "counted_quantity": 5}

    Returns:
        200: {"message": "Count updated successfully"}
        400: {"error": "Validation error"}
        403: {"error": "Unauthorized - not your session"}
        404: {"error": "Session not found"}
    """
    current_user_id = get_jwt_identity()

    session = RTDECountSession.query.get(session_id)

    if not session:
        return jsonify({"error": "Session not found"}), 404

    if session.user_id != current_user_id:
        return jsonify({"error": "Unauthorized - not your session"}), 403

    data = request.json or {}

    if 'item_id' not in data or 'counted_quantity' not in data:
        return jsonify({"error": "item_id and counted_quantity required"}), 400

    if not isinstance(data['counted_quantity'], int) or data['counted_quantity'] < 0:
        return jsonify({"error": "counted_quantity must be a non-negative integer"}), 400

    try:
        item = RTDEItem.query.get(data['item_id'])
        if not item:
            return jsonify({"error": "Item not found"}), 404

        count = RTDESessionCount.query.filter_by(
            session_id=session_id,
            item_id=data['item_id']
        ).first()

        if count:
            count.counted_quantity = data['counted_quantity']
            count.updated_at = datetime.utcnow()
        else:
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
        200: {"pull_list": [...], "total_items": 5, "items_pulled": 0}
        403: {"error": "Unauthorized - not your session"}
        404: {"error": "Session not found"}
    """
    current_user_id = get_jwt_identity()

    session = RTDECountSession.query.get(session_id)

    if not session:
        return jsonify({"error": "Session not found"}), 404

    if session.user_id != current_user_id:
        return jsonify({"error": "Unauthorized - not your session"}), 403

    items = RTDEItem.query.filter_by(active=True).order_by(RTDEItem.display_order).all()

    counts_map = {count.item_id: count for count in session.counts}

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
                "image_filename": item.image_filename,
                "icon": item.icon,
                "need_quantity": need_quantity,
                "is_pulled": count.is_pulled if count else False
            })

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
        {"item_id": "...", "is_pulled": true}

    Returns:
        200: {"message": "Pull status updated"}
        400: {"error": "Validation error"}
        403: {"error": "Unauthorized - not your session"}
        404: {"error": "Session or count not found"}
    """
    current_user_id = get_jwt_identity()

    session = RTDECountSession.query.get(session_id)

    if not session:
        return jsonify({"error": "Session not found"}), 404

    if session.user_id != current_user_id:
        return jsonify({"error": "Unauthorized - not your session"}), 403

    data = request.json or {}

    if 'item_id' not in data or 'is_pulled' not in data:
        return jsonify({"error": "item_id and is_pulled required"}), 400

    try:
        count = RTDESessionCount.query.filter_by(
            session_id=session_id,
            item_id=data['item_id']
        ).first()

        if not count:
            count = RTDESessionCount(
                session_id=session_id,
                item_id=data['item_id'],
                counted_quantity=0,
                is_pulled=bool(data['is_pulled'])
            )
            db.session.add(count)
        else:
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
    Mark session as complete and persist for activity tracking.

    Logic:
    1. Set status = 'completed'
    2. Set completed_at = NOW()
    3. Clean up stray in_progress sessions for this user

    URL Parameters:
        session_id: The UUID of the session

    Returns:
        200: {"message": "RTD&E display restocking completed!"}
        403: {"error": "Unauthorized - not your session"}
        404: {"error": "Session not found"}
    """
    current_user_id = get_jwt_identity()

    session = RTDECountSession.query.get(session_id)

    if not session:
        return jsonify({"error": "Session not found"}), 404

    if session.user_id != current_user_id:
        return jsonify({"error": "Unauthorized - not your session"}), 403

    try:
        session.mark_completed()

        for count in session.counts:
            db.session.delete(count)

        stray_sessions = RTDECountSession.query.filter(
            RTDECountSession.user_id == current_user_id,
            RTDECountSession.status == 'in_progress',
            RTDECountSession.id != session_id
        ).all()
        for stray in stray_sessions:
            db.session.delete(stray)

        db.session.commit()

        return jsonify({
            "message": "RTD&E display restocking completed!"
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to complete session"}), 500
