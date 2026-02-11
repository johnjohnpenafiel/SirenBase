"""
Tracking System routes for managing basement inventory items.

This module provides API endpoints for Tool 1: Inventory Tracking System
All routes are namespaced under /api/tracking/*
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError
from sqlalchemy.orm import joinedload

from app.models.item import Item
from app.models.history import History
from app.models.item_suggestion import ItemSuggestion
from app.schemas.item import ItemCreateSchema, ItemResponseSchema
from app.extensions import db
from app.utils.helpers import generate_unique_code, get_enum_value

tracking_bp = Blueprint('tracking', __name__, url_prefix='/api/tracking')


# =============================================================================
# ITEMS ENDPOINTS
# =============================================================================

@tracking_bp.route('/items', methods=['GET'])
@jwt_required()
def get_items():
    """
    Get all active inventory items.

    Query Parameters:
        category (optional): Filter by category
        include_removed (optional): Include removed items (default: false)

    Returns:
        200: {
            "items": [
                {
                    "id": "...",
                    "name": "Vanilla Syrup",
                    "category": "syrups",
                    "code": "1234",
                    "added_by": "...",
                    "added_at": "2025-10-22T...",
                    "is_removed": false
                },
                ...
            ],
            "count": 42
        }
        401: {"msg": "Missing Authorization Header"}
    """
    # Get query parameters
    category = request.args.get('category')
    include_removed = request.args.get('include_removed', 'false').lower() == 'true'

    # Build query
    query = Item.query

    # Filter by category if provided
    if category:
        query = query.filter_by(category=category)

    # Filter by removal status
    if not include_removed:
        query = query.filter_by(is_removed=False)

    # Order by most recent first
    query = query.order_by(Item.added_at.desc())

    # Execute query
    items = query.all()

    # Serialize items
    schema = ItemResponseSchema(many=True)
    items_data = schema.dump(items)

    return jsonify({
        "items": items_data,
        "count": len(items_data)
    }), 200


@tracking_bp.route('/items/search', methods=['GET'])
@jwt_required()
def search_item_names():
    """
    Search item names for autocomplete suggestions.
    Combines existing items + template suggestions.

    Query Parameters:
        q (required): Search query (min 2 characters)
        category (required): Item category to filter by
        limit (optional): Max results (default 8, max 15)

    Returns:
        200: {
            "suggestions": [
                {
                    "name": "Vanilla Syrup",
                    "source": "template"
                },
                {
                    "name": "Vanilla Sauce",
                    "source": "existing",
                    "code": "1234"
                }
            ]
        }
        400: {"error": "Query too short" | "Category required"}
        401: {"msg": "Missing Authorization Header"}
    """
    # Get query parameters
    query = request.args.get('q', '').strip()
    category = request.args.get('category', '').strip()
    limit = min(int(request.args.get('limit', 8)), 15)

    # Validation
    if len(query) < 2:
        return jsonify({"suggestions": []}), 200

    if not category:
        return jsonify({"error": "Category parameter required"}), 400

    suggestions = []

    # Search existing items (active only)
    existing_items = db.session.query(Item.name, Item.code).filter(
        Item.is_removed == False,
        Item.name.ilike(f'%{query}%'),
        Item.category == category
    ).distinct(Item.name).limit(limit // 2).all()

    for name, code in existing_items:
        suggestions.append({
            "name": name,
            "source": "existing",
            "code": code
        })

    # Search template suggestions
    template_items = db.session.query(ItemSuggestion.name).filter(
        ItemSuggestion.name.ilike(f'%{query}%'),
        ItemSuggestion.category == category
    ).limit(limit - len(suggestions)).all()

    # Add templates (skip if already in existing)
    existing_names = {s['name'] for s in suggestions}
    for (name,) in template_items:
        if name not in existing_names:
            suggestions.append({
                "name": name,
                "source": "template"
            })

    return jsonify({"suggestions": suggestions}), 200


@tracking_bp.route('/items', methods=['POST'])
@jwt_required()
def create_item():
    """
    Create a new inventory item with auto-generated unique code.

    Request JSON:
        {
            "name": "Vanilla Syrup",
            "category": "syrups"
        }

    Returns:
        201: {
            "message": "Item created successfully",
            "item": {
                "id": "...",
                "name": "Vanilla Syrup",
                "category": "syrups",
                "code": "1234",
                "added_by": "...",
                "added_at": "2025-10-22T...",
                "is_removed": false
            }
        }
        400: {"error": {"field": ["error message"]}}
        500: {"error": "Failed to create item"}
    """
    schema = ItemCreateSchema()

    try:
        # Validate input
        data = schema.load(request.json or {})
    except ValidationError as err:
        return jsonify({"error": err.messages}), 400

    # Get current user ID from JWT
    current_user_id = get_jwt_identity()

    try:
        # Use provided code or generate unique 4-digit code
        if 'code' in data and data['code']:
            code = data['code'].strip()
            # Verify code doesn't already exist
            existing_item = Item.query.filter_by(code=code).first()
            if existing_item:
                return jsonify({"error": {"code": ["Code already in use"]}}), 400
        else:
            code = generate_unique_code()

        # Create new item
        item = Item(
            name=data['name'].strip(),
            category=data['category'].strip(),
            code=code,
            added_by=current_user_id
        )

        # Save to database
        db.session.add(item)

        # Log action in history
        history_entry = History.log_add(
            item_name=item.name,
            item_code=item.code,
            user_id=current_user_id,
            notes=f"Added {item.name} (Code: {item.code})"
        )
        db.session.add(history_entry)

        # Commit transaction
        db.session.commit()

        # Serialize item
        item_schema = ItemResponseSchema()
        item_data = item_schema.dump(item)

        return jsonify({
            "message": "Item created successfully",
            "item": item_data
        }), 201

    except RuntimeError as e:
        # Handle code generation failure
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

    except Exception as e:
        # Handle any other errors
        db.session.rollback()
        return jsonify({"error": "Failed to create item"}), 500


@tracking_bp.route('/items/<string:code>', methods=['DELETE'])
@jwt_required()
def remove_item(code: str):
    """
    Remove an inventory item by its unique code (soft delete).

    URL Parameters:
        code: The 4-digit unique code of the item to remove

    Returns:
        200: {
            "message": "Item removed successfully",
            "item": {
                "id": "...",
                "name": "Vanilla Syrup",
                "code": "1234",
                "is_removed": true,
                "removed_at": "2025-10-22T...",
                "removed_by": "..."
            }
        }
        400: {"error": "Item already removed"}
        404: {"error": "Item not found"}
        500: {"error": "Failed to remove item"}
    """
    # Get current user ID from JWT
    current_user_id = get_jwt_identity()

    # Find item by code
    item = Item.query.filter_by(code=code).first()

    if not item:
        return jsonify({"error": "Item not found"}), 404

    # Check if already removed
    if item.is_removed:
        return jsonify({"error": "Item already removed"}), 400

    try:
        # Mark item as removed (soft delete)
        item.mark_as_removed(current_user_id)

        # Log action in history
        history_entry = History.log_remove(
            item_name=item.name,
            item_code=item.code,
            user_id=current_user_id,
            notes=f"Removed {item.name} (Code: {item.code})"
        )
        db.session.add(history_entry)

        # Commit transaction
        db.session.commit()

        # Serialize item with removal info
        item_schema = ItemResponseSchema()
        item_data = item_schema.dump(item)

        return jsonify({
            "message": "Item removed successfully",
            "item": item_data
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to remove item"}), 500


# =============================================================================
# HISTORY ENDPOINTS
# =============================================================================

@tracking_bp.route('/history', methods=['GET'])
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
            'action': get_enum_value(entry.action),
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
