"""
Tests for RTD&E admin endpoints (item management).

Tests cover:
- GET /api/rtde/admin/items (list items)
- POST /api/rtde/admin/items (create item)
- PUT /api/rtde/admin/items/:id (update item)
- DELETE /api/rtde/admin/items/:id (delete item)
- PUT /api/rtde/admin/items/reorder (reorder items)
"""
import pytest

from app.models.rtde import RTDEItem, RTDESessionCount, RTDECountSession
from app.extensions import db


class TestAdminGetItems:
    """Tests for GET /api/rtde/admin/items."""

    def test_get_items_success(self, client, admin_headers, app):
        """Test getting all items as admin."""
        # Create test items
        items = [
            RTDEItem(name="Egg & Cheese", icon="🥪", par_level=8, display_order=1),
            RTDEItem(name="Cold Brew", icon="🥤", par_level=12, display_order=2),
            RTDEItem(name="Inactive Item", icon="🎃", par_level=5, display_order=3, active=False)
        ]

        db.session.add_all(items)
        db.session.commit()

        response = client.get('/api/rtde/admin/items', headers=admin_headers)

        assert response.status_code == 200
        data = response.json
        assert 'items' in data
        assert len(data['items']) == 2  # Only active items by default

    def test_get_items_include_inactive(self, client, admin_headers, app):
        """Test getting items including inactive ones."""
        # Create test items
        items = [
            RTDEItem(name="Active Item", icon="✅", par_level=10, display_order=1),
            RTDEItem(name="Inactive Item", icon="❌", par_level=5, display_order=2, active=False)
        ]

        db.session.add_all(items)
        db.session.commit()

        response = client.get(
            '/api/rtde/admin/items?include_inactive=true',
            headers=admin_headers
        )

        assert response.status_code == 200
        data = response.json
        assert len(data['items']) == 2  # Both active and inactive

    def test_get_items_unauthorized_staff(self, client, staff_headers):
        """Test staff user cannot access admin endpoint."""
        response = client.get('/api/rtde/admin/items', headers=staff_headers)

        assert response.status_code == 403
        assert 'error' in response.json


class TestAdminCreateItem:
    """Tests for POST /api/rtde/admin/items."""

    def test_create_item_success(self, client, admin_headers):
        """Test creating new RTD&E item."""
        response = client.post(
            '/api/rtde/admin/items',
            json={
                'name': 'Egg & Cheese Sandwich',
                'icon': '🥪',
                'par_level': 8
            },
            headers=admin_headers
        )

        assert response.status_code == 201
        data = response.json
        assert data['message'] == 'Item created successfully'
        assert 'item' in data
        assert data['item']['name'] == 'Egg & Cheese Sandwich'
        assert data['item']['icon'] == '🥪'
        assert data['item']['par_level'] == 8
        assert data['item']['display_order'] == 1  # First item

    def test_create_item_auto_display_order(self, client, admin_headers, app):
        """Test items auto-assigned sequential display_order."""
        # Create first item
        first_item = RTDEItem(name="First", icon="1️⃣", par_level=5, display_order=1)
        db.session.add(first_item)
        db.session.commit()

        # Create second item via API
        response = client.post(
            '/api/rtde/admin/items',
            json={'name': 'Second', 'icon': '2️⃣', 'par_level': 5},
            headers=admin_headers
        )

        assert response.status_code == 201
        assert response.json['item']['display_order'] == 2  # Auto-incremented

    def test_create_item_validation_name_required(self, client, admin_headers):
        """Test name is required."""
        response = client.post(
            '/api/rtde/admin/items',
            json={'icon': '🥪', 'par_level': 8},
            headers=admin_headers
        )

        assert response.status_code == 400
        assert 'error' in response.json

    def test_create_item_validation_icon_required(self, client, admin_headers):
        """Test icon is required."""
        response = client.post(
            '/api/rtde/admin/items',
            json={'name': 'Test', 'par_level': 8},
            headers=admin_headers
        )

        assert response.status_code == 400
        assert 'error' in response.json

    def test_create_item_validation_par_level_required(self, client, admin_headers):
        """Test par_level is required."""
        response = client.post(
            '/api/rtde/admin/items',
            json={'name': 'Test', 'icon': '🧪'},
            headers=admin_headers
        )

        assert response.status_code == 400
        assert 'error' in response.json

    def test_create_item_validation_par_level_positive(self, client, admin_headers):
        """Test par_level must be positive."""
        response = client.post(
            '/api/rtde/admin/items',
            json={'name': 'Test', 'icon': '🧪', 'par_level': 0},
            headers=admin_headers
        )

        assert response.status_code == 400
        assert 'par_level' in response.json['error']

    def test_create_item_unauthorized_staff(self, client, staff_headers):
        """Test staff user cannot create items."""
        response = client.post(
            '/api/rtde/admin/items',
            json={'name': 'Test', 'icon': '🧪', 'par_level': 8},
            headers=staff_headers
        )

        assert response.status_code == 403


class TestAdminUpdateItem:
    """Tests for PUT /api/rtde/admin/items/:id."""

    def test_update_item_success(self, client, admin_headers, app):
        """Test updating item."""
        item = RTDEItem(name="Old Name", icon="🥪", par_level=8, display_order=1)
        db.session.add(item)
        db.session.commit()

        response = client.put(
            f'/api/rtde/admin/items/{item.id}',
            json={'name': 'New Name', 'par_level': 10},
            headers=admin_headers
        )

        assert response.status_code == 200
        data = response.json
        assert data['message'] == 'Item updated successfully'
        assert data['item']['name'] == 'New Name'
        assert data['item']['par_level'] == 10
        assert data['item']['icon'] == '🥪'  # Unchanged

    def test_update_item_toggle_active(self, client, admin_headers, app):
        """Test toggling item active status."""
        item = RTDEItem(name="Test", icon="🧪", par_level=5, display_order=1, active=True)
        db.session.add(item)
        db.session.commit()

        response = client.put(
            f'/api/rtde/admin/items/{item.id}',
            json={'active': False},
            headers=admin_headers
        )

        assert response.status_code == 200
        assert response.json['item']['active'] is False

    def test_update_item_not_found(self, client, admin_headers):
        """Test updating non-existent item."""
        response = client.put(
            '/api/rtde/admin/items/nonexistent-id',
            json={'name': 'Test'},
            headers=admin_headers
        )

        assert response.status_code == 404

    def test_update_item_validation_name_empty(self, client, admin_headers, app):
        """Test name cannot be empty."""
        item = RTDEItem(name="Test", icon="🧪", par_level=5, display_order=1)
        db.session.add(item)
        db.session.commit()

        response = client.put(
            f'/api/rtde/admin/items/{item.id}',
            json={'name': ''},
            headers=admin_headers
        )

        assert response.status_code == 400

    def test_update_item_unauthorized_staff(self, client, staff_headers, app):
        """Test staff user cannot update items."""
        item = RTDEItem(name="Test", icon="🧪", par_level=5, display_order=1)
        db.session.add(item)
        db.session.commit()

        response = client.put(
            f'/api/rtde/admin/items/{item.id}',
            json={'name': 'New Name'},
            headers=staff_headers
        )

        assert response.status_code == 403


class TestAdminDeleteItem:
    """Tests for DELETE /api/rtde/admin/items/:id."""

    def test_delete_item_hard_delete(self, client, admin_headers, app):
        """Test hard delete (item never used)."""
        item = RTDEItem(name="Unused", icon="🧪", par_level=5, display_order=1)
        db.session.add(item)
        db.session.commit()

        item_id = item.id

        response = client.delete(
            f'/api/rtde/admin/items/{item_id}',
            headers=admin_headers
        )

        assert response.status_code == 200
        data = response.json
        assert data['deleted_permanently'] is True

        # Verify item deleted from database
        deleted_item = RTDEItem.query.get(item_id)
        assert deleted_item is None

    def test_delete_item_soft_delete(self, client, admin_headers, app, staff_user):
        """Test soft delete (item used in session)."""
        # Create item
        item = RTDEItem(name="Used Item", icon="🥪", par_level=8, display_order=1)
        db.session.add(item)
        db.session.commit()

        # Create session and count using this item
        session = RTDECountSession(user_id=staff_user.id)
        db.session.add(session)
        db.session.commit()

        count = RTDESessionCount(
            session_id=session.id,
            item_id=item.id,
            counted_quantity=5
        )
        db.session.add(count)
        db.session.commit()

        item_id = item.id

        # Delete item (should soft delete)
        response = client.delete(
            f'/api/rtde/admin/items/{item_id}',
            headers=admin_headers
        )

        assert response.status_code == 200
        data = response.json
        assert data['deleted_permanently'] is False

        # Verify item still exists but inactive
        soft_deleted_item = RTDEItem.query.get(item_id)
        assert soft_deleted_item is not None
        assert soft_deleted_item.active is False

    def test_delete_item_not_found(self, client, admin_headers):
        """Test deleting non-existent item."""
        response = client.delete(
            '/api/rtde/admin/items/nonexistent-id',
            headers=admin_headers
        )

        assert response.status_code == 404

    def test_delete_item_unauthorized_staff(self, client, staff_headers, app):
        """Test staff user cannot delete items."""
        item = RTDEItem(name="Test", icon="🧪", par_level=5, display_order=1)
        db.session.add(item)
        db.session.commit()

        response = client.delete(
            f'/api/rtde/admin/items/{item.id}',
            headers=staff_headers
        )

        assert response.status_code == 403


class TestAdminReorderItems:
    """Tests for PUT /api/rtde/admin/items/reorder."""

    def test_reorder_items_success(self, client, admin_headers, app):
        """Test reordering items."""
        # Create items in order 1, 2, 3
        items = [
            RTDEItem(name="First", icon="1️⃣", par_level=5, display_order=1),
            RTDEItem(name="Second", icon="2️⃣", par_level=5, display_order=2),
            RTDEItem(name="Third", icon="3️⃣", par_level=5, display_order=3)
        ]

        db.session.add_all(items)
        db.session.commit()

        # Reorder to 3, 1, 2
        response = client.put(
            '/api/rtde/admin/items/reorder',
            json={
                'item_orders': [
                    {'id': items[2].id, 'display_order': 1},
                    {'id': items[0].id, 'display_order': 2},
                    {'id': items[1].id, 'display_order': 3}
                ]
            },
            headers=admin_headers
        )

        assert response.status_code == 200

        # Verify order changed
        db.session.refresh(items[0])
        db.session.refresh(items[1])
        db.session.refresh(items[2])

        assert items[2].display_order == 1
        assert items[0].display_order == 2
        assert items[1].display_order == 3

    def test_reorder_items_validation_missing_array(self, client, admin_headers):
        """Test item_orders array is required."""
        response = client.put(
            '/api/rtde/admin/items/reorder',
            json={},
            headers=admin_headers
        )

        assert response.status_code == 400

    def test_reorder_items_validation_invalid_item(self, client, admin_headers):
        """Test reorder with non-existent item."""
        response = client.put(
            '/api/rtde/admin/items/reorder',
            json={
                'item_orders': [
                    {'id': 'nonexistent', 'display_order': 1}
                ]
            },
            headers=admin_headers
        )

        assert response.status_code == 404

    def test_reorder_items_unauthorized_staff(self, client, staff_headers):
        """Test staff user cannot reorder items."""
        response = client.put(
            '/api/rtde/admin/items/reorder',
            json={'item_orders': []},
            headers=staff_headers
        )

        assert response.status_code == 403
