"""
Pytest configuration and fixtures for SirenBase backend tests.
"""
import pytest
from app import create_app
from app.extensions import db
from app.models.user import User
from app.models.item import Item
from app.models.history import History


@pytest.fixture
def app():
    """
    Create and configure Flask application for testing.

    Returns:
        Flask application instance with testing configuration
    """
    app = create_app('testing')

    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    """
    Create Flask test client.

    Args:
        app: Flask application fixture

    Returns:
        Flask test client for making requests
    """
    return app.test_client()


@pytest.fixture
def admin_user(app):
    """
    Create an admin user for testing.

    Args:
        app: Flask application fixture

    Returns:
        Admin User instance
    """
    user = User(
        partner_number="ADMIN001",
        name="Test Admin",
        role="admin"
    )
    user.set_pin("1234")

    db.session.add(user)
    db.session.commit()

    return user


@pytest.fixture
def staff_user(app):
    """
    Create a staff user for testing.

    Args:
        app: Flask application fixture

    Returns:
        Staff User instance
    """
    user = User(
        partner_number="STAFF001",
        name="Test Staff",
        role="staff"
    )
    user.set_pin("5678")

    db.session.add(user)
    db.session.commit()

    return user


@pytest.fixture
def admin_token(client, admin_user):
    """
    Get JWT token for admin user.

    Args:
        client: Flask test client
        admin_user: Admin user fixture

    Returns:
        JWT access token string
    """
    response = client.post('/api/auth/login', json={
        'partner_number': 'ADMIN001',
        'pin': '1234'
    })

    return response.json['token']


@pytest.fixture
def staff_token(client, staff_user):
    """
    Get JWT token for staff user.

    Args:
        client: Flask test client
        staff_user: Staff user fixture

    Returns:
        JWT access token string
    """
    response = client.post('/api/auth/login', json={
        'partner_number': 'STAFF001',
        'pin': '5678'
    })

    return response.json['token']


@pytest.fixture
def admin_headers(admin_token):
    """
    Get authorization headers for admin user.

    Args:
        admin_token: Admin JWT token fixture

    Returns:
        Dictionary with Authorization header
    """
    return {'Authorization': f'Bearer {admin_token}'}


@pytest.fixture
def staff_headers(staff_token):
    """
    Get authorization headers for staff user.

    Args:
        staff_token: Staff JWT token fixture

    Returns:
        Dictionary with Authorization header
    """
    return {'Authorization': f'Bearer {staff_token}'}


@pytest.fixture
def sample_item(app, admin_user):
    """
    Create a sample inventory item for testing.

    Args:
        app: Flask application fixture
        admin_user: Admin user fixture

    Returns:
        Item instance
    """
    item = Item(
        name="Test Coffee Beans",
        category="coffee_beans",
        code="1234",
        added_by=admin_user.id
    )

    db.session.add(item)
    db.session.commit()

    return item
