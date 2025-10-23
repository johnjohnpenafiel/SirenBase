"""
History routes for viewing audit logs of inventory actions.
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from sqlalchemy.orm import joinedload

from app.models.history import History
from app.schemas.history import HistoryResponseSchema

history_bp = Blueprint('history', __name__, url_prefix='/api/history')


@history_bp.route('/', methods=['GET'])
@jwt_required()
def get_history():
    """
    Get recent history entries with optional filtering.

    Query Parameters:
        user_id (optional): Filter by specific user
        action (optional): Filter by action type (ADD or REMOVE)
        limit (optional): Number of entries to return (default: 100, max: 500)

    Returns:
        200: {
            "history": [
                {
                    "id": "...",
                    "action": "ADD",
                    "item_name": "Vanilla Syrup",
                    "item_code": "1234",
                    "user_id": "...",
                    "user_name": "Admin User",
                    "timestamp": "2025-10-23T...",
                    "notes": "Added Vanilla Syrup (Code: 1234)"
                },
                ...
            ],
            "count": 42
        }
        400: {"error": "Invalid limit parameter"}
        401: {"msg": "Missing Authorization Header"}
    """
    # Get query parameters
    user_id = request.args.get('user_id')
    action = request.args.get('action')
    limit = request.args.get('limit', '100')

    # Validate limit parameter
    try:
        limit = int(limit)
        if limit < 1:
            return jsonify({"error": "Limit must be at least 1"}), 400
        if limit > 500:
            return jsonify({"error": "Limit cannot exceed 500"}), 400
    except ValueError:
        return jsonify({"error": "Invalid limit parameter"}), 400

    # Build query with eager loading of user relationship
    query = History.query.options(joinedload(History.user))

    # Apply filters
    if user_id:
        query = query.filter_by(user_id=user_id)

    if action:
        # Validate action is ADD or REMOVE
        if action.upper() not in ['ADD', 'REMOVE']:
            return jsonify({"error": "Invalid action. Must be ADD or REMOVE"}), 400
        query = query.filter_by(action=action.upper())

    # Order by most recent first and apply limit
    query = query.order_by(History.timestamp.desc()).limit(limit)

    # Execute query
    history_entries = query.all()

    # Serialize with user info
    serialized_entries = []
    for entry in history_entries:
        data = {
            'id': entry.id,
            'action': entry.action if isinstance(entry.action, str) else entry.action.value if hasattr(entry.action, 'value') else str(entry.action),
            'item_name': entry.item_name,
            'item_code': entry.item_code,
            'user_id': entry.user_id,
            'user_name': entry.user.name if entry.user else None,
            'timestamp': entry.timestamp.isoformat()
        }
        if entry.notes:
            data['notes'] = entry.notes

        serialized_entries.append(data)

    return jsonify({
        "history": serialized_entries,
        "count": len(serialized_entries)
    }), 200
