"""
Integration tests for admin endpoints.
"""
import pytest


class TestGetUsers:
    """Tests for GET /api/admin/users."""

    def test_get_users_as_admin(self, client, admin_headers, staff_user):
        """Test admin retrieving all users."""
        response = client.get('/api/admin/users', headers=admin_headers)

        assert response.status_code == 200
        assert 'users' in response.json
        assert len(response.json['users']) >= 2  # Admin + staff

    def test_get_users_as_staff(self, client, staff_headers):
        """Test staff user cannot access admin endpoint."""
        response = client.get('/api/admin/users', headers=staff_headers)

        assert response.status_code == 403

    def test_get_users_without_auth(self, client):
        """Test getting users without authentication."""
        response = client.get('/api/admin/users')

        assert response.status_code == 401


class TestCreateUser:
    """Tests for POST /api/admin/users."""

    def test_create_user_as_admin(self, client, admin_headers):
        """Test admin creating new user."""
        response = client.post('/api/admin/users', headers=admin_headers, json={
            'partner_number': 'NEWSTAFF001',
            'name': 'New Staff Member',
            'pin': '1234'
        })

        assert response.status_code == 201
        assert 'user' in response.json
        assert response.json['user']['partner_number'] == 'NEWSTAFF001'
        assert response.json['user']['role'] == 'staff'  # Default

    def test_create_admin_user(self, client, admin_headers):
        """Test creating admin user."""
        response = client.post('/api/admin/users', headers=admin_headers, json={
            'partner_number': 'NEWADMIN001',
            'name': 'New Admin',
            'pin': '1234',
            'role': 'admin'
        })

        assert response.status_code == 201
        assert response.json['user']['role'] == 'admin'

    def test_create_user_as_staff(self, client, staff_headers):
        """Test staff user cannot create users."""
        response = client.post('/api/admin/users', headers=staff_headers, json={
            'partner_number': 'NEWUSER001',
            'name': 'Test',
            'pin': '1234'
        })

        assert response.status_code == 403

    def test_create_user_duplicate_partner_number(self, client, admin_headers, staff_user):
        """Test creating user with existing partner number."""
        response = client.post('/api/admin/users', headers=admin_headers, json={
            'partner_number': 'STAFF001',  # Already exists
            'name': 'Duplicate',
            'pin': '1234'
        })

        assert response.status_code == 409

    def test_create_user_invalid_role(self, client, admin_headers):
        """Test creating user with invalid role."""
        response = client.post('/api/admin/users', headers=admin_headers, json={
            'partner_number': 'NEWUSER001',
            'name': 'Test User',
            'pin': '1234',
            'role': 'superadmin'  # Invalid
        })

        assert response.status_code == 400


class TestDeleteUser:
    """Tests for DELETE /api/admin/users/<id>."""

    def test_delete_user_as_admin(self, client, admin_headers, staff_user):
        """Test admin deleting a user."""
        response = client.delete(f'/api/admin/users/{staff_user.id}', headers=admin_headers)

        assert response.status_code == 200
        assert 'message' in response.json

    def test_delete_user_as_staff(self, client, staff_headers, admin_user):
        """Test staff user cannot delete users."""
        response = client.delete(f'/api/admin/users/{admin_user.id}', headers=staff_headers)

        assert response.status_code == 403

    def test_delete_self(self, client, admin_headers, admin_user):
        """Test admin cannot delete themselves."""
        response = client.delete(f'/api/admin/users/{admin_user.id}', headers=admin_headers)

        assert response.status_code == 403
        assert 'own account' in response.json['error'].lower()

    def test_delete_nonexistent_user(self, client, admin_headers):
        """Test deleting non-existent user."""
        response = client.delete('/api/admin/users/nonexistent-id', headers=admin_headers)

        assert response.status_code == 404
