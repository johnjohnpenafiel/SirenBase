"""
Integration tests for items/inventory endpoints.
"""
import pytest


class TestGetItems:
    """Tests for GET /api/tracking/items."""

    def test_get_items_success(self, client, staff_headers, sample_item):
        """Test retrieving all items."""
        response = client.get('/api/tracking/items', headers=staff_headers)

        assert response.status_code == 200
        assert 'items' in response.json
        assert len(response.json['items']) > 0

    def test_get_items_without_auth(self, client):
        """Test getting items without authentication."""
        response = client.get('/api/tracking/items')

        assert response.status_code == 401

    def test_get_items_filter_by_category(self, client, staff_headers, sample_item):
        """Test filtering items by category."""
        response = client.get('/api/tracking/items?category=coffee_beans', headers=staff_headers)

        assert response.status_code == 200
        assert 'items' in response.json

    def test_get_items_exclude_removed(self, client, staff_headers, sample_item):
        """Test that removed items are excluded by default."""
        # Mark item as removed
        from app.extensions import db
        sample_item.is_removed = True
        db.session.commit()

        response = client.get('/api/tracking/items', headers=staff_headers)

        assert response.status_code == 200
        # Removed items should not appear
        item_codes = [item['code'] for item in response.json['items']]
        assert sample_item.code not in item_codes


class TestCreateItem:
    """Tests for POST /api/tracking/items."""

    def test_create_item_success(self, client, staff_headers):
        """Test creating a new item."""
        response = client.post('/api/tracking/items', headers=staff_headers, json={
            'name': 'New Coffee Beans',
            'category': 'coffee_beans'
        })

        assert response.status_code == 201
        assert 'item' in response.json
        assert response.json['item']['name'] == 'New Coffee Beans'
        assert 'code' in response.json['item']
        assert len(response.json['item']['code']) == 4

    def test_create_item_without_auth(self, client):
        """Test creating item without authentication."""
        response = client.post('/api/tracking/items', json={
            'name': 'Test Item',
            'category': 'syrups'
        })

        assert response.status_code == 401

    def test_create_item_missing_name(self, client, staff_headers):
        """Test creating item without name."""
        response = client.post('/api/tracking/items', headers=staff_headers, json={
            'category': 'syrups'
        })

        assert response.status_code == 400

    def test_create_item_invalid_category(self, client, staff_headers):
        """Test creating item with invalid category."""
        response = client.post('/api/tracking/items', headers=staff_headers, json={
            'name': 'Test Item',
            'category': 'invalid_category'
        })

        assert response.status_code == 400


class TestDeleteItem:
    """Tests for DELETE /api/tracking/items/<code>."""

    def test_delete_item_success(self, client, staff_headers, sample_item):
        """Test soft deleting an item."""
        response = client.delete(f'/api/tracking/items/{sample_item.code}', headers=staff_headers)

        assert response.status_code == 200
        assert 'message' in response.json

        # Verify item is marked as removed
        from app.extensions import db
        db.session.refresh(sample_item)
        assert sample_item.is_removed is True

    def test_delete_item_nonexistent(self, client, staff_headers):
        """Test deleting non-existent item."""
        response = client.delete('/api/tracking/items/9999', headers=staff_headers)

        assert response.status_code == 404

    def test_delete_item_without_auth(self, client, sample_item):
        """Test deleting item without authentication."""
        response = client.delete(f'/api/tracking/items/{sample_item.code}')

        assert response.status_code == 401

    def test_delete_already_removed_item(self, client, staff_headers, sample_item):
        """Test deleting an item that's already removed."""
        # First deletion
        client.delete(f'/api/tracking/items/{sample_item.code}', headers=staff_headers)

        # Second deletion should fail
        response = client.delete(f'/api/tracking/items/{sample_item.code}', headers=staff_headers)

        assert response.status_code == 400
