"""
Authentication routes for user login, signup, and JWT validation.
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from marshmallow import ValidationError

from app.models.user import User
from app.schemas.user import LoginSchema, SignupSchema, UserResponseSchema
from app.extensions import db

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')


@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Authenticate user and return JWT token.

    Request JSON:
        {
            "partner_number": "ADMIN001",
            "pin": "1234"
        }

    Returns:
        200: {
            "token": "eyJ...",
            "user": {
                "id": "...",
                "partner_number": "ADMIN001",
                "name": "Admin User",
                "role": "admin",
                "created_at": "2025-10-17T..."
            }
        }
        400: {"error": {"field": ["error message"]}}
        401: {"error": "Invalid credentials"}
    """
    schema = LoginSchema()

    try:
        # Validate input
        data = schema.load(request.json or {})
    except ValidationError as err:
        return jsonify({"error": err.messages}), 400

    # Find user by partner number
    user = User.query.filter_by(
        partner_number=data['partner_number'].strip()
    ).first()

    # Check credentials
    if not user or not user.check_pin(data['pin']):
        return jsonify({"error": "Invalid credentials"}), 401

    # Prevent deleted users from logging in
    if user.is_deleted:
        return jsonify({"error": "Account has been deactivated. Please contact an administrator."}), 403

    # Create JWT access token
    access_token = create_access_token(identity=user.id)

    # Serialize user data
    user_schema = UserResponseSchema()
    user_data = user_schema.dump(user)

    return jsonify({
        "token": access_token,
        "user": user_data
    }), 200


@auth_bp.route('/signup', methods=['POST'])
def signup():
    """
    Create a new user account with partner number, name, and PIN.

    Note: In production, you may want to check if the partner_number
    is pre-authorized by an admin before allowing signup.

    Request JSON:
        {
            "partner_number": "STAFF001",
            "name": "John Doe",
            "pin": "5678"
        }

    Returns:
        201: {
            "message": "Account created successfully",
            "user": {
                "id": "...",
                "partner_number": "STAFF001",
                "name": "John Doe",
                "role": "staff",
                "created_at": "2025-10-17T..."
            }
        }
        400: {"error": {"field": ["error message"]}}
        409: {"error": "Partner number already exists"}
    """
    schema = SignupSchema()

    try:
        # Validate input
        data = schema.load(request.json or {})
    except ValidationError as err:
        return jsonify({"error": err.messages}), 400

    # Check if partner number already exists (including deleted users)
    existing_user = User.query.filter_by(
        partner_number=data['partner_number'].strip()
    ).first()

    if existing_user:
        if existing_user.is_deleted:
            return jsonify({"error": "Partner number was previously used. Please contact an administrator."}), 409
        return jsonify({"error": "Partner number already exists"}), 409

    try:
        # Create new user
        user = User(
            partner_number=data['partner_number'].strip(),
            name=data['name'].strip(),
            role='staff'  # Default role is staff
        )
        user.set_pin(data['pin'])

        # Save to database
        db.session.add(user)
        db.session.commit()

        # Serialize user data
        user_schema = UserResponseSchema()
        user_data = user_schema.dump(user)

        return jsonify({
            "message": "Account created successfully",
            "user": user_data
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to create account"}), 500


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """
    Get current authenticated user information.

    Requires:
        Authorization header with Bearer token

    Returns:
        200: {
            "user": {
                "id": "...",
                "partner_number": "ADMIN001",
                "name": "Admin User",
                "role": "admin",
                "created_at": "2025-10-17T..."
            }
        }
        401: {"msg": "Missing Authorization Header"}
        404: {"error": "User not found"}
    """
    # Get user ID from JWT token
    current_user_id = get_jwt_identity()

    # Find user in database
    user = User.query.get(current_user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    # Check if user has been deleted
    if user.is_deleted:
        return jsonify({"error": "Account has been deactivated"}), 403

    # Serialize user data
    user_schema = UserResponseSchema()
    user_data = user_schema.dump(user)

    return jsonify({"user": user_data}), 200
