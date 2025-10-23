"""
Items/Inventory routes for managing inventory items.
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError

from app.models.item import Item
from app.models.history import History
from app.schemas.item import ItemCreateSchema, ItemResponseSchema
from app.extensions import db
from app.utils.helpers import generate_unique_code

items_bp = Blueprint('items', __name__, url_prefix='/api/items')


@items_bp.route('/', methods=['GET'])
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


@items_bp.route('/', methods=['POST'])
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
        # Generate unique 4-digit code
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


@items_bp.route('/<string:code>', methods=['DELETE'])
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
