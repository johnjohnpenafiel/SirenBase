"""
History schemas for request/response validation.
"""
from marshmallow import Schema, fields


class HistoryResponseSchema(Schema):
    """Schema for history entry response serialization."""

    id = fields.Str(dump_only=True)
    action = fields.Str()
    item_name = fields.Str()
    item_code = fields.Str()
    user_id = fields.Str()
    user_name = fields.Str()  # Populated from relationship
    timestamp = fields.DateTime(format='iso')
    notes = fields.Str(allow_none=True)
