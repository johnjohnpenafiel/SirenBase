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


class TestSearchItemNames:
    """Tests for GET /api/tracking/items/search (autocomplete)."""

    def test_search_with_existing_items(self, client, staff_headers, staff_user):
        """Test search returns existing items."""
        from app.models.item import Item
        from app.extensions import db

        # Create test items in database
        items = [
            Item(name='Vanilla Syrup', category='syrups', code='1111', added_by=staff_user.id),
            Item(name='Vanilla Sauce', category='sauces', code='2222', added_by=staff_user.id),
            Item(name='Caramel Syrup', category='syrups', code='3333', added_by=staff_user.id),
        ]
        db.session.add_all(items)
        db.session.commit()

        # Search for "Vanilla" in syrups category
        response = client.get(
            '/api/tracking/items/search?q=Vanilla&category=syrups',
            headers=staff_headers
        )

        assert response.status_code == 200
        assert 'suggestions' in response.json
        suggestions = response.json['suggestions']

        # Should find "Vanilla Syrup" (existing item in syrups category)
        vanilla_syrup = next((s for s in suggestions if s['name'] == 'Vanilla Syrup'), None)
        assert vanilla_syrup is not None
        assert vanilla_syrup['source'] == 'existing'
        assert vanilla_syrup['code'] == '1111'

        # Should NOT include "Vanilla Sauce" (different category)
        vanilla_sauce = next((s for s in suggestions if s['name'] == 'Vanilla Sauce'), None)
        assert vanilla_sauce is None

    def test_search_with_template_suggestions(self, client, staff_headers):
        """Test search returns template suggestions from database."""
        from app.models.item_suggestion import ItemSuggestion
        from app.extensions import db

        # Create template suggestions
        templates = [
            ItemSuggestion(name='Pumpkin Spice Syrup', category='syrups'),
            ItemSuggestion(name='Peppermint Syrup', category='syrups'),
        ]
        db.session.add_all(templates)
        db.session.commit()

        # Search for "Pumpkin" in syrups
        response = client.get(
            '/api/tracking/items/search?q=Pumpkin&category=syrups',
            headers=staff_headers
        )

        assert response.status_code == 200
        suggestions = response.json['suggestions']

        # Should find "Pumpkin Spice Syrup" template
        pumpkin = next((s for s in suggestions if s['name'] == 'Pumpkin Spice Syrup'), None)
        assert pumpkin is not None
        assert pumpkin['source'] == 'template'
        assert 'code' not in pumpkin  # Templates don't have codes

    def test_search_combines_existing_and_templates(self, client, staff_headers, staff_user):
        """Test search combines both existing items and template suggestions."""
        from app.models.item import Item
        from app.models.item_suggestion import ItemSuggestion
        from app.extensions import db

        # Create existing item
        item = Item(name='Hazelnut Syrup', category='syrups', code='4444', added_by=staff_user.id)
        db.session.add(item)

        # Create template suggestion
        template = ItemSuggestion(name='Hazelnut Sauce', category='sauces')
        db.session.add(template)
        db.session.commit()

        # Search for "Hazelnut" in syrups
        response = client.get(
            '/api/tracking/items/search?q=Hazelnut&category=syrups',
            headers=staff_headers
        )

        assert response.status_code == 200
        suggestions = response.json['suggestions']

        # Should include existing "Hazelnut Syrup"
        existing = next((s for s in suggestions if s['name'] == 'Hazelnut Syrup'), None)
        assert existing is not None
        assert existing['source'] == 'existing'
        assert existing['code'] == '4444'

    def test_search_min_query_length(self, client, staff_headers):
        """Test search requires minimum 2 characters."""
        # Query with 1 character
        response = client.get(
            '/api/tracking/items/search?q=V&category=syrups',
            headers=staff_headers
        )

        assert response.status_code == 200
        assert response.json['suggestions'] == []

        # Query with 2 characters should work
        response = client.get(
            '/api/tracking/items/search?q=Va&category=syrups',
            headers=staff_headers
        )

        assert response.status_code == 200
        # May or may not have results, but should not error

    def test_search_requires_category(self, client, staff_headers):
        """Test search requires category parameter."""
        response = client.get(
            '/api/tracking/items/search?q=Vanilla',
            headers=staff_headers
        )

        assert response.status_code == 400
        assert 'error' in response.json

    def test_search_case_insensitive(self, client, staff_headers, staff_user):
        """Test search is case-insensitive."""
        from app.models.item import Item
        from app.extensions import db

        item = Item(name='Caramel Syrup', category='syrups', code='5555', added_by=staff_user.id)
        db.session.add(item)
        db.session.commit()

        # Search with lowercase
        response = client.get(
            '/api/tracking/items/search?q=caramel&category=syrups',
            headers=staff_headers
        )

        assert response.status_code == 200
        suggestions = response.json['suggestions']
        caramel = next((s for s in suggestions if s['name'] == 'Caramel Syrup'), None)
        assert caramel is not None

        # Search with uppercase
        response = client.get(
            '/api/tracking/items/search?q=CARAMEL&category=syrups',
            headers=staff_headers
        )

        assert response.status_code == 200
        suggestions = response.json['suggestions']
        caramel = next((s for s in suggestions if s['name'] == 'Caramel Syrup'), None)
        assert caramel is not None

    def test_search_excludes_removed_items(self, client, staff_headers, staff_user):
        """Test search only returns active items (not removed)."""
        from app.models.item import Item
        from app.extensions import db

        # Create active item
        active = Item(name='Active Coffee', category='coffee_beans', code='6666', added_by=staff_user.id)
        # Create removed item
        removed = Item(
            name='Removed Coffee',
            category='coffee_beans',
            code='7777',
            added_by=staff_user.id,
            is_removed=True
        )
        db.session.add_all([active, removed])
        db.session.commit()

        response = client.get(
            '/api/tracking/items/search?q=Coffee&category=coffee_beans',
            headers=staff_headers
        )

        assert response.status_code == 200
        suggestions = response.json['suggestions']

        # Should include active item
        assert any(s['name'] == 'Active Coffee' for s in suggestions)
        # Should NOT include removed item
        assert not any(s['name'] == 'Removed Coffee' for s in suggestions)

    def test_search_respects_limit_parameter(self, client, staff_headers, staff_user):
        """Test search respects limit parameter."""
        from app.models.item import Item
        from app.extensions import db

        # Create multiple items
        items = [
            Item(name=f'Test Syrup {i}', category='syrups', code=f'{1000+i:04d}', added_by=staff_user.id)
            for i in range(20)
        ]
        db.session.add_all(items)
        db.session.commit()

        # Request limit of 5
        response = client.get(
            '/api/tracking/items/search?q=Test&category=syrups&limit=5',
            headers=staff_headers
        )

        assert response.status_code == 200
        suggestions = response.json['suggestions']
        assert len(suggestions) <= 5

    def test_search_without_auth(self, client):
        """Test search requires authentication."""
        response = client.get('/api/tracking/items/search?q=Vanilla&category=syrups')

        assert response.status_code == 401
