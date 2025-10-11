"""
Flask extensions initialization.

Extensions are initialized here and then initialized with the app in app/__init__.py
using the application factory pattern.
"""
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate

# Initialize extensions
db = SQLAlchemy()
jwt = JWTManager()
migrate = Migrate()
