"""
Item model for inventory tracking.
"""
from datetime import datetime
from uuid import uuid4
from typing import Optional, TYPE_CHECKING

from sqlalchemy import String, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.extensions import db

if TYPE_CHECKING:
    from app.models.user import User


class Item(db.Model):
    """
    Inventory item model with unique 4-digit code tracking.

    Attributes:
        id: UUID primary key
        name: Item name/description
        code: Unique 4-digit identifier (written on physical item)
        added_by: Foreign key to user who added the item
        added_at: Timestamp when item was added
        is_removed: Boolean flag for soft delete
        removed_at: Timestamp when item was removed (nullable)
        removed_by: Foreign key to user who removed the item (nullable)
    """

    __tablename__ = 'items'

    # Primary key
    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid4())
    )

    # Item details
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    code: Mapped[str] = mapped_column(
        String(4),
        unique=True,
        nullable=False,
        index=True
    )

    # Addition tracking
    added_by: Mapped[str] = mapped_column(
        String(36),
        ForeignKey('users.id', ondelete='RESTRICT'),
        nullable=False
    )
    added_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    # Removal tracking (soft delete)
    is_removed: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
        index=True  # Index for filtering active items
    )
    removed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime,
        nullable=True
    )
    removed_by: Mapped[Optional[str]] = mapped_column(
        String(36),
        ForeignKey('users.id', ondelete='SET NULL'),
        nullable=True
    )

    # Relationships
    added_by_user: Mapped["User"] = relationship(
        "User",
        foreign_keys=[added_by],
        back_populates="items"
    )

    removed_by_user: Mapped[Optional["User"]] = relationship(
        "User",
        foreign_keys=[removed_by]
    )

    def to_dict(self, include_removed_info: bool = False) -> dict:
        """
        Convert model to dictionary.

        Args:
            include_removed_info: Whether to include removal details

        Returns:
            Dictionary representation of item
        """
        data = {
            'id': self.id,
            'name': self.name,
            'code': self.code,
            'added_by': self.added_by,
            'added_at': self.added_at.isoformat(),
            'is_removed': self.is_removed
        }

        if include_removed_info and self.is_removed:
            data['removed_at'] = self.removed_at.isoformat() if self.removed_at else None
            data['removed_by'] = self.removed_by

        return data

    def mark_as_removed(self, user_id: str) -> None:
        """
        Mark item as removed (soft delete).

        Args:
            user_id: ID of user performing the removal
        """
        self.is_removed = True
        self.removed_at = datetime.utcnow()
        self.removed_by = user_id

    def __repr__(self) -> str:
        """String representation for debugging."""
        status = "REMOVED" if self.is_removed else "ACTIVE"
        return f'<Item {self.name} - Code: {self.code} ({status})>'
