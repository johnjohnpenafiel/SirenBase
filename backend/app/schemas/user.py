"""
User schemas for request/response validation.
"""
from marshmallow import Schema, fields, validates, ValidationError
import re


class LoginSchema(Schema):
    """Schema for login request validation."""

    partner_number = fields.Str(required=True)
    pin = fields.Str(required=True)

    @validates('partner_number')
    def validate_partner_number(self, value, **kwargs):
        """Validate partner number format."""
        if not value or not value.strip():
            raise ValidationError("Partner number is required")

        # Remove whitespace
        cleaned = value.strip()

        # Validate format (alphanumeric, 4-20 characters)
        if not re.match(r'^[a-zA-Z0-9]{4,20}$', cleaned):
            raise ValidationError("Invalid partner number format")

    @validates('pin')
    def validate_pin(self, value, **kwargs):
        """Validate PIN format (4 digits)."""
        if not value:
            raise ValidationError("PIN is required")

        if not re.match(r'^\d{4}$', value):
            raise ValidationError("PIN must be exactly 4 digits")


class SignupSchema(Schema):
    """Schema for signup request validation."""

    partner_number = fields.Str(required=True)
    name = fields.Str(required=True)
    pin = fields.Str(required=True)

    @validates('partner_number')
    def validate_partner_number(self, value, **kwargs):
        """Validate partner number format."""
        if not value or not value.strip():
            raise ValidationError("Partner number is required")

        cleaned = value.strip()

        if not re.match(r'^[a-zA-Z0-9]{4,20}$', cleaned):
            raise ValidationError("Invalid partner number format")

    @validates('name')
    def validate_name(self, value, **kwargs):
        """Validate name field."""
        if not value or not value.strip():
            raise ValidationError("Name is required")

        if len(value.strip()) < 2:
            raise ValidationError("Name must be at least 2 characters")

        if len(value) > 100:
            raise ValidationError("Name too long (max 100 characters)")

    @validates('pin')
    def validate_pin(self, value, **kwargs):
        """Validate PIN format (4 digits)."""
        if not value:
            raise ValidationError("PIN is required")

        if not re.match(r'^\d{4}$', value):
            raise ValidationError("PIN must be exactly 4 digits")


class AdminCreateUserSchema(Schema):
    """Schema for admin creating new users (includes optional role field)."""

    partner_number = fields.Str(required=True)
    name = fields.Str(required=True)
    pin = fields.Str(required=True)
    role = fields.Str(required=False, load_default='staff')

    @validates('partner_number')
    def validate_partner_number(self, value, **kwargs):
        """Validate partner number format."""
        if not value or not value.strip():
            raise ValidationError("Partner number is required")

        cleaned = value.strip()

        if not re.match(r'^[a-zA-Z0-9]{4,20}$', cleaned):
            raise ValidationError("Invalid partner number format")

    @validates('name')
    def validate_name(self, value, **kwargs):
        """Validate name field."""
        if not value or not value.strip():
            raise ValidationError("Name is required")

        if len(value.strip()) < 2:
            raise ValidationError("Name must be at least 2 characters")

        if len(value) > 100:
            raise ValidationError("Name too long (max 100 characters)")

    @validates('pin')
    def validate_pin(self, value, **kwargs):
        """Validate PIN format (4 digits)."""
        if not value:
            raise ValidationError("PIN is required")

        if not re.match(r'^\d{4}$', value):
            raise ValidationError("PIN must be exactly 4 digits")

    @validates('role')
    def validate_role(self, value, **kwargs):
        """Validate role field."""
        if value not in ['staff', 'admin']:
            raise ValidationError("Role must be 'staff' or 'admin'")


class UserResponseSchema(Schema):
    """Schema for user response serialization."""

    id = fields.Str(dump_only=True)
    partner_number = fields.Str()
    name = fields.Str()
    role = fields.Method("get_role")
    created_at = fields.DateTime(format='iso')

    def get_role(self, obj):
        """Extract role value from enum or string."""
        if hasattr(obj, 'role'):
            role = obj.role
            # If it's an enum, get the value
            if hasattr(role, 'value'):
                return role.value
            return str(role)
        return None
