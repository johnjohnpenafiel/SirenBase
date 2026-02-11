"""
RTD&E admin endpoints for item management.

Provides CRUD operations and reorder functionality for RTD&E display items.
All endpoints require admin role.
"""
from datetime import datetime
from flask import request, jsonify
from flask_jwt_extended import jwt_required

from app.models.rtde import RTDEItem, RTDESessionCount
from app.extensions import db
from app.middleware.auth import admin_required
from app.routes.tools.rtde import rtde_bp


@rtde_bp.route('/admin/items', methods=['GET'])
@jwt_required()
@admin_required
def get_admin_items():
    """
    Get all RTD&E items ordered by display_order (admin only).

    Query Parameters:
        include_inactive (optional): Include inactive items (default: false)

    Returns:
        200: {"items": [...]}
        403: {"error": "Admin access required"}
    """
    include_inactive = request.args.get('include_inactive', 'false').lower() == 'true'

    query = RTDEItem.query

    if not include_inactive:
        query = query.filter_by(active=True)

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
            "image_filename": "egg-cheese.jpeg",  // optional
            "icon": "...",  // optional
            "par_level": 8
        }

    Returns:
        201: {"message": "Item created successfully", "item": {...}}
        400: {"error": "Validation error"}
        403: {"error": "Admin access required"}
    """
    data = request.json or {}

    # Validate required fields
    if not data.get('name') or not data.get('name').strip():
        return jsonify({"error": {"name": ["Item name is required"]}}), 400

    if 'par_level' not in data or not isinstance(data['par_level'], int) or data['par_level'] < 1:
        return jsonify({"error": {"par_level": ["Par level must be a positive integer"]}}), 400

    name = data['name'].strip()

    if len(name) > 100:
        return jsonify({"error": {"name": ["Name too long (max 100 characters)"]}}), 400

    # Handle optional icon field
    icon = None
    if data.get('icon') and data.get('icon').strip():
        icon = data['icon'].strip()
        if len(icon) > 10:
            return jsonify({"error": {"icon": ["Icon too long (max 10 characters)"]}}), 400

    # Handle optional brand field
    brand = None
    if data.get('brand') and data.get('brand').strip():
        brand = data['brand'].strip()
        if len(brand) > 50:
            return jsonify({"error": {"brand": ["Brand too long (max 50 characters)"]}}), 400

    # Handle optional image_filename field
    image_filename = None
    if data.get('image_filename') and data.get('image_filename').strip():
        image_filename = data['image_filename'].strip()
        if len(image_filename) > 100:
            return jsonify({"error": {"image_filename": ["Image filename too long (max 100 characters)"]}}), 400

    try:
        max_order = db.session.query(db.func.max(RTDEItem.display_order)).scalar() or 0

        item = RTDEItem(
            name=name,
            brand=brand,
            image_filename=image_filename,
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
            "image_filename": "egg-cheese.jpeg",  // optional, can be null to clear
            "icon": "...",  // optional, can be null to clear
            "par_level": 10,
            "active": true
        }

    Returns:
        200: {"message": "Item updated successfully", "item": {...}}
        400: {"error": "Validation error"}
        403: {"error": "Admin access required"}
        404: {"error": "Item not found"}
    """
    item = RTDEItem.query.get(item_id)

    if not item:
        return jsonify({"error": "Item not found"}), 404

    data = request.json or {}

    try:
        if 'name' in data:
            name = data['name'].strip()
            if not name:
                return jsonify({"error": {"name": ["Item name cannot be empty"]}}), 400
            if len(name) > 100:
                return jsonify({"error": {"name": ["Name too long (max 100 characters)"]}}), 400
            item.name = name

        if 'brand' in data:
            if data['brand'] is None or data['brand'] == '':
                item.brand = None
            else:
                brand = data['brand'].strip()
                if len(brand) > 50:
                    return jsonify({"error": {"brand": ["Brand too long (max 50 characters)"]}}), 400
                item.brand = brand if brand else None

        if 'image_filename' in data:
            if data['image_filename'] is None or data['image_filename'] == '':
                item.image_filename = None
            else:
                image_filename = data['image_filename'].strip()
                if len(image_filename) > 100:
                    return jsonify({"error": {"image_filename": ["Image filename too long (max 100 characters)"]}}), 400
                item.image_filename = image_filename if image_filename else None

        if 'icon' in data:
            if data['icon'] is None or data['icon'] == '':
                item.icon = None
            else:
                icon = data['icon'].strip()
                if len(icon) > 10:
                    return jsonify({"error": {"icon": ["Icon too long (max 10 characters)"]}}), 400
                item.icon = icon if icon else None

        if 'par_level' in data:
            par_level = data['par_level']
            if not isinstance(par_level, int) or par_level < 1:
                return jsonify({"error": {"par_level": ["Par level must be a positive integer"]}}), 400
            item.par_level = par_level

        if 'active' in data:
            item.active = bool(data['active'])

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
    - If item never used in sessions -> Hard delete
    - If item used in sessions -> Soft delete (set active=False)

    URL Parameters:
        item_id: The UUID of the item to delete

    Returns:
        200: {"message": "Item deleted successfully", "deleted_permanently": true/false}
        403: {"error": "Admin access required"}
        404: {"error": "Item not found"}
    """
    item = RTDEItem.query.get(item_id)

    if not item:
        return jsonify({"error": "Item not found"}), 404

    try:
        has_counts = db.session.query(RTDESessionCount).filter_by(item_id=item_id).first() is not None

        if has_counts:
            item.active = False
            item.updated_at = datetime.utcnow()
            db.session.commit()

            return jsonify({
                "message": "Item deactivated (has been used in sessions)",
                "deleted_permanently": False
            }), 200
        else:
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
                ...
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
