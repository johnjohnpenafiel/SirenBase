"""
Activity feed routes for recent actions across the app.

This module provides API endpoints for activity feeds:
- /api/activity/recent - Dashboard activity feed (inventory + milk order + RTD&E)
"""
from datetime import datetime
from typing import List, Dict, Any

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required

from app.models.history import History
from app.models.milk_order import MilkOrderSession, SessionStatus
from app.models.rtde import RTDECountSession
from app.extensions import db
from app.utils.helpers import get_enum_value

activity_bp = Blueprint('activity', __name__, url_prefix='/api/activity')


# =============================================================================
# DASHBOARD ACTIVITY FEED
# =============================================================================

@activity_bp.route('/recent', methods=['GET'])
@jwt_required()
def get_recent_activity():
    """
    Get recent activity from Inventory, Milk Count, and RTD&E tools.

    Query Parameters:
        limit (optional): Number of activities to return (default: 8, max: 20)

    Returns:
        200: {
            "activities": [
                {
                    "id": "inv-uuid",
                    "type": "inventory_add",
                    "title": "Added to Inventory",
                    "description": "Vanilla Syrup (1234)",
                    "user_name": "John Doe",
                    "timestamp": "2026-02-04T10:30:00Z",
                    "tool": "inventory"
                },
                ...
            ],
            "count": 8
        }
        401: {"msg": "Missing Authorization Header"}
    """
    # Get and validate limit parameter
    try:
        limit = min(int(request.args.get('limit', 8)), 20)
    except (TypeError, ValueError):
        limit = 8

    activities: List[Dict[str, Any]] = []

    # 1. Get recent inventory history (ADD/REMOVE actions)
    inventory_entries = (
        db.session.query(History)
        .order_by(History.timestamp.desc())
        .limit(limit)
        .all()
    )

    for entry in inventory_entries:
        # Determine action type and title
        action_value = get_enum_value(entry.action)
        if action_value == 'ADD':
            activity_type = 'inventory_add'
            title = 'Added to Inventory'
        else:
            activity_type = 'inventory_remove'
            title = 'Removed from Inventory'

        # Get user name
        user_name = entry.user.name if entry.user else 'Unknown'

        activities.append({
            'id': f'inv-{entry.id}',
            'type': activity_type,
            'title': title,
            'description': f'{entry.item_name} ({entry.item_code})',
            'user_name': user_name,
            'timestamp': entry.timestamp.isoformat() + 'Z',
            'tool': 'inventory'
        })

    # 2. Get recent milk order phase completions
    # Only include sessions that have progressed beyond initial state
    milk_sessions = (
        MilkOrderSession.query
        .filter(MilkOrderSession.status != SessionStatus.NIGHT_FOH.value)
        .order_by(MilkOrderSession.created_at.desc())
        .limit(limit)
        .all()
    )

    for session in milk_sessions:
        session_date_str = session.session_date.strftime('%b %d')

        # FOH completion
        if session.night_foh_saved_at:
            user_name = session.night_count_user.name if session.night_count_user else 'Unknown'
            activities.append({
                'id': f'mc-foh-{session.id}',
                'type': 'milk_order_foh',
                'title': 'Milk FOH Count Saved',
                'description': f'Session for {session_date_str}',
                'user_name': user_name,
                'timestamp': session.night_foh_saved_at.isoformat() + 'Z',
                'tool': 'milk-order'
            })

        # BOH completion
        if session.night_boh_saved_at:
            user_name = session.night_count_user.name if session.night_count_user else 'Unknown'
            activities.append({
                'id': f'mc-boh-{session.id}',
                'type': 'milk_order_boh',
                'title': 'Milk BOH Count Saved',
                'description': f'Session for {session_date_str}',
                'user_name': user_name,
                'timestamp': session.night_boh_saved_at.isoformat() + 'Z',
                'tool': 'milk-order'
            })

        # Morning completion
        if session.morning_saved_at:
            user_name = session.morning_count_user.name if session.morning_count_user else 'Unknown'
            activities.append({
                'id': f'mc-morn-{session.id}',
                'type': 'milk_order_morning',
                'title': 'Milk Morning Count Saved',
                'description': f'Session for {session_date_str}',
                'user_name': user_name,
                'timestamp': session.morning_saved_at.isoformat() + 'Z',
                'tool': 'milk-order'
            })

        # Session completed
        if session.completed_at:
            user_name = session.morning_count_user.name if session.morning_count_user else 'Unknown'
            activities.append({
                'id': f'mc-done-{session.id}',
                'type': 'milk_order_completed',
                'title': 'Milk Order Completed',
                'description': f'Session for {session_date_str}',
                'user_name': user_name,
                'timestamp': session.completed_at.isoformat() + 'Z',
                'tool': 'milk-order'
            })

    # 3. Get recent completed RTD&E sessions
    rtde_sessions = (
        RTDECountSession.query
        .filter_by(status='completed')
        .order_by(RTDECountSession.completed_at.desc())
        .limit(limit)
        .all()
    )

    for session in rtde_sessions:
        user_name = session.user.name if session.user else 'Unknown'
        activities.append({
            'id': f'rtde-{session.id}',
            'type': 'rtde_completed',
            'title': 'RTD&E Restocking Completed',
            'description': 'Display restocking completed',
            'user_name': user_name,
            'timestamp': session.completed_at.isoformat() + 'Z',
            'tool': 'rtde'
        })

    # Sort all activities by timestamp descending
    activities.sort(key=lambda x: x['timestamp'], reverse=True)

    # Limit to requested count
    activities = activities[:limit]

    return jsonify({
        'activities': activities,
        'count': len(activities)
    }), 200
