# SirenBase Backend - Flask API Guidelines

## Tech Stack

### Core Technologies
- **Framework**: Flask 3.0+
- **Language**: Python 3.11+
- **ORM**: SQLAlchemy 2.0+ with Flask-SQLAlchemy
- **Authentication**: Flask-JWT-Extended
- **Validation**: Marshmallow or Pydantic
- **CORS**: Flask-CORS
- **Database**: PostgreSQL 15+
- **Migrations**: Alembic (via Flask-Migrate)
- **Testing**: Pytest with Flask testing utilities
- **Linting**: Flake8 or Ruff
- **Formatting**: Black
- **Type Checking**: mypy

### Key Dependencies
```python
# requirements.txt
Flask>=3.0.0
Flask-SQLAlchemy>=3.0.0
Flask-JWT-Extended>=4.5.0
Flask-CORS>=4.0.0
Flask-Migrate>=4.0.0
psycopg2-binary>=2.9.0
python-dotenv>=1.0.0
marshmallow>=3.20.0
bcrypt>=4.1.0
pytest>=7.4.0
pytest-flask>=1.2.0
```

## 📁 Project Structure

```
backend/
├── app/
│   ├── __init__.py           # Flask app factory
│   ├── config.py             # Configuration classes
│   ├── extensions.py         # Extension initialization (db, jwt, etc.)
│   ├── models/               # Database models
│   │   ├── __init__.py
│   │   ├── user.py           # Shared user model
│   │   ├── item.py           # Tool 1: Tracking items
│   │   ├── history.py        # Tool 1: Tracking history
│   │   ├── item_suggestion.py # Tool 1: Autocomplete templates
│   │   ├── milk_count.py     # Tool 2: Milk Count models
│   │   └── rtde.py           # Tool 3: RTD&E models
│   ├── schemas/              # Marshmallow schemas for validation
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── item.py
│   │   └── history.py
│   ├── routes/               # API blueprints
│   │   ├── __init__.py
│   │   ├── auth.py           # /api/auth/* endpoints (shared)
│   │   ├── admin.py          # /api/admin/* endpoints (shared)
│   │   └── tools/            # Tool-specific routes
│   │       ├── __init__.py
│   │       ├── tracking.py   # /api/tracking/* endpoints (Tool 1)
│   │       ├── milk_count/   # /api/milk-count/* endpoints (Tool 2) - Complete
│   │       │   ├── admin.py      # Milk type + par level management
│   │       │   └── sessions.py   # Session workflow + history
│   │       └── rtde/         # /api/rtde/* endpoints (Tool 3) - Complete
│   │           ├── admin.py      # Item CRUD + reorder
│   │           └── sessions.py   # Session lifecycle + pull list
│   ├── middleware/           # Custom middleware
│   │   ├── __init__.py
│   │   └── auth.py           # JWT verification, role checks
│   └── utils/                # Helper functions
│       ├── __init__.py
│       ├── validators.py
│       └── helpers.py
├── tests/                    # Test directory
│   ├── __init__.py
│   ├── conftest.py          # Pytest fixtures
│   ├── test_auth.py
│   ├── test_items.py        # Tests for /api/tracking/items
│   ├── test_history.py      # Tests for /api/tracking/history
│   └── test_admin.py
├── migrations/               # Alembic migrations
├── .env                      # Environment variables (not in Git)
├── .env.example             # Template for .env
├── requirements.txt         # Production dependencies
├── requirements-dev.txt     # Development dependencies
├── run.py                   # Application entry point
└── pytest.ini               # Pytest configuration
```

## 🎯 Code Style & Conventions

### Python Style (PEP8)
- **Follow PEP8** strictly - use Black for auto-formatting
- **Line length**: 88 characters (Black default)
- **Indentation**: 4 spaces (NO tabs)
- **Naming**:
  - `snake_case` for variables, functions, methods
  - `PascalCase` for classes
  - `SCREAMING_SNAKE_CASE` for constants
- **Type hints**: Use for utility functions and helper methods (optional for Flask route handlers since Flask wraps responses)
- **Docstrings**: Google style for all public functions (including Returns section for route handlers)

```python
# ✅ Good
from typing import List, Optional
from datetime import datetime

def get_user_items(
    user_id: str, 
    include_removed: bool = False
) -> List[dict]:
    """
    Retrieve all inventory items for a specific user.
    
    Args:
        user_id: The UUID of the user
        include_removed: Whether to include removed items
        
    Returns:
        List of item dictionaries with keys: id, name, code, added_at
        
    Raises:
        ValueError: If user_id is invalid
    """
    # Implementation
    pass

# ❌ Bad - no type hints, no docstring, camelCase
def getUserItems(userId, includeRemoved=False):
    pass
```

### Import Organization
Group imports in this order:
1. Standard library imports
2. Third-party imports
3. Local application imports

```python
# ✅ Good
import os
from datetime import datetime
from typing import Optional

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.models.user import User
from app.schemas.user import UserSchema
from app.extensions import db
```

### Flask Blueprint Structure
```python
# routes/tools/tracking.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.models.item import Item
from app.schemas.item import ItemSchema
from app.extensions import db

# Multi-tool architecture: Each tool has its own namespace
tracking_bp = Blueprint('tracking', __name__, url_prefix='/api/tracking')

@tracking_bp.route('/items', methods=['GET'])
@jwt_required()
def get_items():
    """
    Get all current inventory items for Tool 1: Tracking.

    Returns:
        JSON response with items array
    """
    try:
        current_user_id = get_jwt_identity()
        items = Item.query.filter_by(is_removed=False).all()

        schema = ItemSchema(many=True)
        return jsonify(schema.dump(items)), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
```

## 🗄️ Database Models

### SQLAlchemy Best Practices
- Use **type hints** with SQLAlchemy 2.0 style
- Include **timestamps** on all models (created_at, updated_at)
- Use **UUIDs** for primary keys (not auto-incrementing integers)
- Define **relationships** clearly with back_populates
- Add **indexes** on frequently queried columns
- Include **repr** method for debugging

```python
# models/user.py
from datetime import datetime
from uuid import uuid4
from typing import List

from sqlalchemy import String, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from werkzeug.security import generate_password_hash, check_password_hash

from app.extensions import db

class User(db.Model):
    """User model for staff authentication."""
    
    __tablename__ = 'users'
    
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    partner_number: Mapped[str] = mapped_column(String(20), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    pin_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(20), nullable=False, default='staff')
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    items: Mapped[List["Item"]] = relationship("Item", back_populates="added_by_user")
    
    def set_pin(self, pin: str) -> None:
        """Hash and set user PIN."""
        self.pin_hash = generate_password_hash(pin)
    
    def check_pin(self, pin: str) -> bool:
        """Verify PIN against hash."""
        return check_password_hash(self.pin_hash, pin)
    
    def to_dict(self) -> dict:
        """Convert model to dictionary (exclude sensitive fields)."""
        return {
            'id': self.id,
            'partner_number': self.partner_number,
            'name': self.name,
            'role': self.role,
            'created_at': self.created_at.isoformat()
        }
    
    def __repr__(self) -> str:
        return f'<User {self.partner_number} - {self.name}>'
```

```python
# models/item.py
from datetime import datetime
from uuid import uuid4
from typing import Optional

from sqlalchemy import String, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.extensions import db

class Item(db.Model):
    """Inventory item model."""
    
    __tablename__ = 'items'
    
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    code: Mapped[str] = mapped_column(String(4), unique=True, nullable=False, index=True)
    added_by: Mapped[str] = mapped_column(String(36), ForeignKey('users.id'), nullable=False)
    added_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    is_removed: Mapped[bool] = mapped_column(Boolean, default=False)
    removed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    removed_by: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey('users.id'), nullable=True)
    
    # Relationships
    added_by_user: Mapped["User"] = relationship("User", foreign_keys=[added_by], back_populates="items")
    
    def __repr__(self) -> str:
        return f'<Item {self.name} - {self.code}>'
```

## 🔐 Authentication & Authorization

### JWT Configuration
```python
# config.py
import os
from datetime import timedelta

class Config:
    """Base configuration."""
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key-change-in-production')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # CORS
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:3000').split(',')
```

### Protected Routes
```python
from functools import wraps
from flask import jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.models.user import User

def admin_required(fn):
    """
    Decorator to require admin role for route access.
    
    Usage:
        @items_bp.route('/admin/users')
        @jwt_required()
        @admin_required
        def admin_only_route():
            pass
    """
    @wraps(fn)
    def wrapper(*args, **kwargs):
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or user.role != 'admin':
            return jsonify({"error": "Admin access required"}), 403
            
        return fn(*args, **kwargs)
    return wrapper
```

### Login Endpoint
```python
# routes/auth.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from marshmallow import Schema, fields, ValidationError

from app.models.user import User
from app.extensions import db

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

class LoginSchema(Schema):
    """Schema for login validation."""
    partner_number = fields.Str(required=True)
    pin = fields.Str(required=True, validate=lambda x: len(x) == 4 and x.isdigit())

@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Authenticate user and return JWT token.
    
    Request JSON:
        {
            "partner_number": "12345",
            "pin": "1234"
        }
    
    Returns:
        200: {"token": "jwt_token", "user": {...}}
        400: {"error": "Validation error message"}
        401: {"error": "Invalid credentials"}
    """
    schema = LoginSchema()
    
    try:
        # Validate input
        data = schema.load(request.json)
    except ValidationError as err:
        return jsonify({"error": err.messages}), 400
    
    # Find user
    user = User.query.filter_by(partner_number=data['partner_number']).first()
    
    if not user or not user.check_pin(data['pin']):
        return jsonify({"error": "Invalid credentials"}), 401
    
    # Create token
    access_token = create_access_token(identity=user.id)
    
    return jsonify({
        "token": access_token,
        "user": user.to_dict()
    }), 200
```

## ✅ Data Validation

### Using Marshmallow Schemas
```python
# schemas/item.py
from marshmallow import Schema, fields, validates, ValidationError
from app.models.item import Item

class ItemSchema(Schema):
    """Schema for item serialization and validation."""
    
    id = fields.Str(dump_only=True)
    name = fields.Str(required=True)
    code = fields.Str(dump_only=True)  # Auto-generated
    added_by = fields.Str(dump_only=True)
    added_at = fields.DateTime(dump_only=True)
    is_removed = fields.Bool(dump_only=True)
    
    @validates('name')
    def validate_name(self, value):
        """Validate item name."""
        if not value or len(value.strip()) < 2:
            raise ValidationError("Item name must be at least 2 characters")
        if len(value) > 100:
            raise ValidationError("Item name too long (max 100 characters)")


class ItemCreateSchema(Schema):
    """Schema for creating new items."""
    name = fields.Str(required=True)
    
    @validates('name')
    def validate_name(self, value):
        if not value or len(value.strip()) < 2:
            raise ValidationError("Item name must be at least 2 characters")
```

### Validation in Routes
```python
@tracking_bp.route('/items', methods=['POST'])
@jwt_required()
def create_item():
    """
    Create a new inventory item with auto-generated code.

    Request JSON:
        {"name": "Coffee Beans", "category": "coffee_beans"}

    Returns:
        201: {"item": {...}}
        400: {"error": "Validation error"}
    """
    schema = ItemCreateSchema()

    try:
        data = schema.load(request.json)
    except ValidationError as err:
        return jsonify({"error": err.messages}), 400

    current_user_id = get_jwt_identity()

    # Generate unique 4-digit code
    code = generate_unique_code()

    # Create item
    item = Item(
        name=data['name'],
        category=data['category'],
        code=code,
        added_by=current_user_id
    )

    db.session.add(item)
    db.session.commit()

    return jsonify({"item": ItemSchema().dump(item)}), 201
```

## 🛠️ Utility Functions

### Code Generation
```python
# utils/helpers.py
import random
from app.models.item import Item
from app.extensions import db

def generate_unique_code(max_attempts: int = 100) -> str:
    """
    Generate a unique 4-digit code for inventory items.
    
    Args:
        max_attempts: Maximum number of generation attempts
        
    Returns:
        Unique 4-digit string code
        
    Raises:
        RuntimeError: If unable to generate unique code
    """
    for _ in range(max_attempts):
        code = f"{random.randint(0, 9999):04d}"
        
        # Check if code already exists
        if not Item.query.filter_by(code=code).first():
            return code
    
    raise RuntimeError("Unable to generate unique code after max attempts")
```

### Input Sanitization
```python
# utils/validators.py
import re
from typing import Optional

def sanitize_partner_number(partner_number: str) -> str:
    """
    Sanitize and validate partner number.
    
    Args:
        partner_number: Raw partner number input
        
    Returns:
        Cleaned partner number
        
    Raises:
        ValueError: If partner number is invalid
    """
    # Remove whitespace
    cleaned = partner_number.strip()
    
    # Validate format (alphanumeric, 4-20 characters)
    if not re.match(r'^[a-zA-Z0-9]{4,20}$', cleaned):
        raise ValueError("Invalid partner number format")
    
    return cleaned


def validate_pin(pin: str) -> bool:
    """
    Validate PIN format.
    
    Args:
        pin: PIN to validate
        
    Returns:
        True if valid, False otherwise
    """
    return bool(re.match(r'^\d{4}$', pin))
```

## 🧪 Testing Guidelines

### Pytest Configuration
```python
# conftest.py
import pytest
from app import create_app
from app.extensions import db
from app.models.user import User

@pytest.fixture
def app():
    """Create application for testing."""
    app = create_app('testing')
    
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    """Create test client."""
    return app.test_client()


@pytest.fixture
def auth_headers(client):
    """Create authenticated user and return headers."""
    # Create test user
    user = User(
        partner_number="TEST123",
        name="Test User",
        role="staff"
    )
    user.set_pin("1234")
    db.session.add(user)
    db.session.commit()
    
    # Login
    response = client.post('/api/auth/login', json={
        'partner_number': 'TEST123',
        'pin': '1234'
    })
    
    token = response.json['token']
    return {'Authorization': f'Bearer {token}'}
```

### Test Examples
```python
# tests/test_auth.py
def test_login_success(client):
    """Test successful login."""
    # Create user
    user = User(partner_number="123456", name="John Doe")
    user.set_pin("1234")
    db.session.add(user)
    db.session.commit()
    
    # Attempt login
    response = client.post('/api/auth/login', json={
        'partner_number': '123456',
        'pin': '1234'
    })
    
    assert response.status_code == 200
    assert 'token' in response.json
    assert response.json['user']['name'] == 'John Doe'


def test_login_invalid_credentials(client):
    """Test login with invalid credentials."""
    response = client.post('/api/auth/login', json={
        'partner_number': 'INVALID',
        'pin': '9999'
    })
    
    assert response.status_code == 401
    assert 'error' in response.json


def test_login_validation_error(client):
    """Test login with invalid PIN format."""
    response = client.post('/api/auth/login', json={
        'partner_number': '123456',
        'pin': '12'  # Too short
    })
    
    assert response.status_code == 400
```

```python
# tests/test_items.py
def test_create_item(client, auth_headers):
    """Test creating inventory item."""
    response = client.post('/api/tracking/items',
        json={'name': 'Coffee Beans', 'category': 'coffee_beans'},
        headers=auth_headers
    )

    assert response.status_code == 201
    assert 'item' in response.json
    assert len(response.json['item']['code']) == 4


def test_create_item_unauthorized(client):
    """Test creating item without authentication."""
    response = client.post('/api/tracking/items',
        json={'name': 'Coffee Beans', 'category': 'coffee_beans'})
    assert response.status_code == 401
```

## 🔧 Error Handling

### Global Error Handlers
```python
# app/__init__.py
from flask import jsonify

def register_error_handlers(app):
    """Register global error handlers."""
    
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"error": "Resource not found"}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return jsonify({"error": "Internal server error"}), 500
    
    @app.errorhandler(ValidationError)
    def validation_error(error):
        return jsonify({"error": error.messages}), 400
```

### Exception Handling in Routes
```python
@tracking_bp.route('/items/<code>', methods=['DELETE'])
@jwt_required()
def remove_item(code: str):
    """Remove inventory item by 4-digit code."""
    try:
        current_user_id = get_jwt_identity()

        item = Item.query.filter_by(code=code).first()
        if not item:
            return jsonify({"error": "Item not found"}), 404

        if item.is_removed:
            return jsonify({"error": "Item already removed"}), 400

        # Mark as removed (soft delete)
        item.is_removed = True
        item.removed_at = datetime.utcnow()
        item.removed_by = current_user_id

        db.session.commit()

        return jsonify({"message": "Item removed successfully"}), 200

    except Exception as e:
        db.session.rollback()
        # Log error here
        return jsonify({"error": "Failed to remove item"}), 500
```

## 📋 Common Commands

```bash
# Virtual Environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate      # Windows

# Dependencies
pip install -r requirements.txt
pip install -r requirements-dev.txt
pip freeze > requirements.txt

# Database
flask db init              # Initialize migrations
flask db migrate -m "msg"  # Create migration
flask db upgrade           # Apply migrations
flask db downgrade         # Rollback migration

# Development
flask run                  # Start dev server (port 5000)
flask shell                # Interactive shell

# Testing
pytest                     # Run all tests
pytest -v                  # Verbose output
pytest --cov=app           # With coverage
pytest tests/test_auth.py  # Specific file

# Code Quality
black .                    # Format code
flake8 .                   # Lint code
mypy app/                  # Type check
```

## 🌐 Environment Variables

### .env Example
```bash
# .env
FLASK_APP=run.py
FLASK_ENV=development
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-here

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/sirenbase

# CORS
CORS_ORIGINS=http://localhost:3000,https://your-frontend-domain.com
```

### .env.example Template
```bash
# .env.example
FLASK_APP=run.py
FLASK_ENV=development
SECRET_KEY=change-me-in-production
JWT_SECRET_KEY=change-me-in-production

DATABASE_URL=postgresql://user:password@localhost:5432/sirenbase

CORS_ORIGINS=http://localhost:3000
```

## 🚀 Application Factory Pattern

### App Initialization
```python
# app/__init__.py
from flask import Flask
from flask_cors import CORS

from app.config import Config
from app.extensions import db, jwt, migrate

def create_app(config_class=Config):
    """
    Application factory pattern.
    
    Args:
        config_class: Configuration class to use
        
    Returns:
        Configured Flask application
    """
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)
    CORS(app, origins=app.config['CORS_ORIGINS'])
    
    # Register blueprints
    # Shared routes
    from app.routes.auth import auth_bp
    from app.routes.admin import admin_bp
    # Tool-specific routes
    from app.routes.tools.tracking import tracking_bp
    from app.routes.tools.milk_count import milk_count_bp  # Tool 2 - Complete
    from app.routes.tools.rtde import rtde_bp  # Tool 3 - Complete

    app.register_blueprint(auth_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(tracking_bp)
    
    # Register error handlers
    register_error_handlers(app)
    
    return app
```

```python
# app/extensions.py
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate

db = SQLAlchemy()
jwt = JWTManager()
migrate = Migrate()
```

```python
# run.py
from app import create_app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True, port=5000)
```

## 📋 Feature Completion Requirements

**MANDATORY**: Before marking ANY feature as complete in TASKS.md, you MUST follow the checklist in:

👉 **[`backend/CHECKLIST.md`](CHECKLIST.md)** 👈

This enforces the root CLAUDE.md requirement: "Generate tests alongside code"

**Key Requirements:**
- ✅ Pytest test files created in `tests/` directory
- ✅ Unit tests for models and utilities
- ✅ Integration tests for all API endpoints
- ✅ All tests passing locally
- ✅ Manual verification completed
- ✅ Documentation updated

**NO EXCEPTIONS** - If a feature doesn't have tests, it is **NOT COMPLETE**.

---

## 🔍 Code Review Checklist

Before submitting PR, verify:
- [ ] All tests pass (`pytest`)
- [ ] Code formatted with Black
- [ ] No linting errors (`flake8`)
- [ ] Type hints added (`mypy`)
- [ ] Docstrings for all public functions
- [ ] Input validation on all endpoints
- [ ] Proper error handling with try/except
- [ ] Database sessions properly committed/rolled back
- [ ] No sensitive data in logs
- [ ] Environment variables used (no hardcoded secrets)
- [ ] Migrations created for model changes

## 🚫 Common Pitfalls to Avoid

### Don't
- Use `db.session.query()` - use `Model.query` instead
- Forget to commit database changes
- Expose stack traces to clients in production
- Store passwords in plaintext - always hash
- Use `SELECT *` - specify needed columns
- Skip input validation - always validate
- Hardcode configuration - use environment variables
- Ignore database transactions - use proper commit/rollback

### Do
- Always use type hints
- Write docstrings for all public functions
- Validate all user inputs
- Use context managers for file operations
- Handle exceptions gracefully
- Log errors appropriately
- Use database indexes on frequently queried columns
- Follow REST API conventions

---

**Last Updated**: February 2026
**Version**: 4.0.0
**For**: SirenBase Backend Team
