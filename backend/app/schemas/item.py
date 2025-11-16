"""
Item schemas for request/response validation.
"""
from marshmallow import Schema, fields, validates, ValidationError

from app.constants import ITEM_CATEGORIES


class ItemCreateSchema(Schema):
    """Schema for creating new items."""

    name = fields.Str(required=True)
    category = fields.Str(required=True)
    code = fields.Str(required=False, load_default=None, allow_none=True)  # Optional: frontend can provide pre-generated code

    @validates('name')
    def validate_name(self, value, **kwargs):
        """Validate item name."""
        if not value or not value.strip():
            raise ValidationError("Item name is required")

        if len(value.strip()) < 2:
            raise ValidationError("Item name must be at least 2 characters")

        if len(value) > 100:
            raise ValidationError("Item name too long (max 100 characters)")

    @validates('category')
    def validate_category(self, value, **kwargs):
        """Validate category is from allowed list."""
        if not value or not value.strip():
            raise ValidationError("Category is required")

        if value.strip() not in ITEM_CATEGORIES:
            raise ValidationError(
                f"Invalid category. Must be one of: {', '.join(ITEM_CATEGORIES)}"
            )

    @validates('code')
    def validate_code(self, value, **kwargs):
        """Validate code format if provided."""
        if value is not None:
            if not value.strip():
                raise ValidationError("Code cannot be empty if provided")

            if len(value) != 4 or not value.isdigit():
                raise ValidationError("Code must be exactly 4 digits")


class ItemResponseSchema(Schema):
    """Schema for item response serialization."""

    id = fields.Str(dump_only=True)
    name = fields.Str()
    category = fields.Str()
    code = fields.Str()
    added_by = fields.Str()
    added_at = fields.DateTime(format='iso')
    is_removed = fields.Bool()
    removed_at = fields.DateTime(format='iso', allow_none=True)
    removed_by = fields.Str(allow_none=True)


class ItemRemoveSchema(Schema):
    """Schema for removing items (optional notes field for future)."""

    notes = fields.Str(required=False, allow_none=True)
