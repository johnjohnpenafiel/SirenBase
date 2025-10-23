"""
Integration tests for authentication endpoints.
"""
import pytest


class TestLoginEndpoint:
    """Tests for POST /api/auth/login."""

    def test_login_success(self, client, admin_user):
        """Test successful login with valid credentials."""
        response = client.post('/api/auth/login', json={
            'partner_number': 'ADMIN001',
            'pin': '1234'
        })

        assert response.status_code == 200
        assert 'token' in response.json
        assert 'user' in response.json
        assert response.json['user']['partner_number'] == 'ADMIN001'
        assert response.json['user']['role'] == 'admin'

    def test_login_invalid_credentials(self, client, admin_user):
        """Test login with incorrect PIN."""
        response = client.post('/api/auth/login', json={
            'partner_number': 'ADMIN001',
            'pin': '9999'
        })

        assert response.status_code == 401
        assert 'error' in response.json

    def test_login_nonexistent_user(self, client):
        """Test login with non-existent partner number."""
        response = client.post('/api/auth/login', json={
            'partner_number': 'NONEXISTENT',
            'pin': '1234'
        })

        assert response.status_code == 401

    def test_login_missing_partner_number(self, client):
        """Test login without partner number."""
        response = client.post('/api/auth/login', json={
            'pin': '1234'
        })

        assert response.status_code == 400
        assert 'error' in response.json

    def test_login_missing_pin(self, client):
        """Test login without PIN."""
        response = client.post('/api/auth/login', json={
            'partner_number': 'ADMIN001'
        })

        assert response.status_code == 400

    def test_login_empty_partner_number(self, client):
        """Test login with empty partner number."""
        response = client.post('/api/auth/login', json={
            'partner_number': '',
            'pin': '1234'
        })

        assert response.status_code == 400

    def test_login_invalid_pin_format(self, client):
        """Test login with non-4-digit PIN."""
        response = client.post('/api/auth/login', json={
            'partner_number': 'ADMIN001',
            'pin': '12'
        })

        assert response.status_code == 400


class TestSignupEndpoint:
    """Tests for POST /api/auth/signup."""

    def test_signup_success(self, client):
        """Test successful user signup."""
        response = client.post('/api/auth/signup', json={
            'partner_number': 'NEWUSER001',
            'name': 'New User',
            'pin': '1234'
        })

        assert response.status_code == 201
        assert 'user' in response.json
        assert response.json['user']['partner_number'] == 'NEWUSER001'
        assert response.json['user']['role'] == 'staff'  # Default role

    def test_signup_duplicate_partner_number(self, client, admin_user):
        """Test signup with existing partner number."""
        response = client.post('/api/auth/signup', json={
            'partner_number': 'ADMIN001',  # Already exists
            'name': 'Another User',
            'pin': '1234'
        })

        assert response.status_code == 409
        assert 'error' in response.json

    def test_signup_missing_name(self, client):
        """Test signup without name."""
        response = client.post('/api/auth/signup', json={
            'partner_number': 'NEWUSER001',
            'pin': '1234'
        })

        assert response.status_code == 400

    def test_signup_invalid_pin(self, client):
        """Test signup with invalid PIN format."""
        response = client.post('/api/auth/signup', json={
            'partner_number': 'NEWUSER001',
            'name': 'New User',
            'pin': 'abcd'  # Not digits
        })

        assert response.status_code == 400


class TestGetCurrentUser:
    """Tests for GET /api/auth/me."""

    def test_get_current_user_success(self, client, admin_headers):
        """Test retrieving current user info."""
        response = client.get('/api/auth/me', headers=admin_headers)

        assert response.status_code == 200
        assert 'user' in response.json
        assert response.json['user']['partner_number'] == 'ADMIN001'

    def test_get_current_user_without_token(self, client):
        """Test getting current user without JWT token."""
        response = client.get('/api/auth/me')

        assert response.status_code == 401

    def test_get_current_user_invalid_token(self, client):
        """Test getting current user with invalid token."""
        response = client.get('/api/auth/me', headers={
            'Authorization': 'Bearer invalid_token'
        })

        assert response.status_code == 422  # JWT decode error
