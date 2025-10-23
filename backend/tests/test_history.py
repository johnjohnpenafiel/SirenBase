"""
Integration tests for history endpoints.
"""
import pytest


class TestGetHistory:
    """Tests for GET /api/history."""

    def test_get_history_success(self, client, staff_headers):
        """Test retrieving history entries."""
        response = client.get('/api/history/', headers=staff_headers)

        assert response.status_code == 200
        assert 'history' in response.json
        assert isinstance(response.json['history'], list)

    def test_get_history_without_auth(self, client):
        """Test getting history without authentication."""
        response = client.get('/api/history/')

        assert response.status_code == 401

    def test_get_history_with_limit(self, client, staff_headers):
        """Test getting history with limit parameter."""
        response = client.get('/api/history/?limit=5', headers=staff_headers)

        assert response.status_code == 200
        assert len(response.json['history']) <= 5

    def test_get_history_filter_by_action(self, client, staff_headers, sample_item):
        """Test filtering history by action type."""
        # Create an item (generates ADD history)
        client.post('/api/items/', headers=staff_headers, json={
            'name': 'Test Item',
            'category': 'syrups'
        })

        response = client.get('/api/history/?action=ADD', headers=staff_headers)

        assert response.status_code == 200
        assert all(entry['action'] == 'ADD' for entry in response.json['history'])

    def test_get_history_invalid_action(self, client, staff_headers):
        """Test filtering with invalid action type."""
        response = client.get('/api/history/?action=INVALID', headers=staff_headers)

        assert response.status_code == 400

    def test_get_history_limit_validation(self, client, staff_headers):
        """Test limit parameter validation."""
        # Limit too high
        response = client.get('/api/history/?limit=1000', headers=staff_headers)

        assert response.status_code == 400
