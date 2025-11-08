"""
Item Name Suggestion Model

Stores template item names for autocomplete functionality.
Developer-managed templates guide users to consistent naming without enforcement.

Table: item_name_suggestions
Purpose: Autocomplete suggestions for Add Item dialog
Managed By: Developers (via migrations, not admin UI)
"""

from datetime import datetime
from uuid import uuid4

from sqlalchemy import String, DateTime
from sqlalchemy.orm import Mapped, mapped_column

from app.extensions import db


class ItemSuggestion(db.Model):
    """
    Template item names for autocomplete suggestions.

    These are developer-managed templates (seeded in migrations) that guide
    users to consistent item naming. Not enforced - users can still enter
    free text.

    Attributes:
        id: UUID primary key
        name: Item name template (e.g., "Vanilla Syrup")
        category: Item category (matches ItemCategory enum)
        created_at: When template was created
        updated_at: When template was last updated
    """

    __tablename__ = 'item_name_suggestions'

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid4())
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    category: Mapped[str] = mapped_column(String(50), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )

    def to_dict(self) -> dict:
        """Convert model to dictionary."""
        return {
            'id': self.id,
            'name': self.name,
            'category': self.category,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def __repr__(self) -> str:
        return f'<ItemSuggestion {self.name} ({self.category})>'
