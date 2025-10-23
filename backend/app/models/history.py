"""
History model for audit logging of inventory actions.
"""
from datetime import datetime
from uuid import uuid4
from typing import Optional, TYPE_CHECKING
import enum

from sqlalchemy import String, DateTime, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.extensions import db

if TYPE_CHECKING:
    from app.models.user import User


class HistoryAction(enum.Enum):
    """Enumeration for history action types."""
    ADD = "ADD"
    REMOVE = "REMOVE"


class History(db.Model):
    """
    Audit log for all inventory actions.

    Attributes:
        id: UUID primary key
        action: Type of action (ADD or REMOVE)
        item_name: Name of the item affected
        item_code: 4-digit code of the item
        user_id: Foreign key to user who performed the action
        timestamp: When the action occurred
        notes: Optional notes about the action
    """

    __tablename__ = 'history'

    # Primary key
    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid4())
    )

    # Action details
    action: Mapped[str] = mapped_column(
        SQLEnum(HistoryAction, values_callable=lambda x: [e.value for e in x]),
        nullable=False,
        index=True  # Index for filtering by action type
    )
    item_name: Mapped[str] = mapped_column(String(100), nullable=False)
    item_code: Mapped[str] = mapped_column(
        String(4),
        nullable=False,
        index=True  # Index for searching by code
    )

    # User tracking
    user_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey('users.id', ondelete='RESTRICT'),
        nullable=False,
        index=True  # Index for filtering by user
    )

    # Timestamp
    timestamp: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
        index=True  # Index for sorting by time
    )

    # Optional notes
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    user: Mapped["User"] = relationship(
        "User",
        back_populates="history_entries"
    )

    def to_dict(self, include_user_info: bool = True) -> dict:
        """
        Convert model to dictionary.

        Args:
            include_user_info: Whether to include user details

        Returns:
            Dictionary representation of history entry
        """
        # Extract action value from enum
        action_value = self.action.value if hasattr(self.action, 'value') else str(self.action)

        data = {
            'id': self.id,
            'action': action_value,
            'item_name': self.item_name,
            'item_code': self.item_code,
            'user_id': self.user_id,
            'timestamp': self.timestamp.isoformat()
        }

        if self.notes:
            data['notes'] = self.notes

        if include_user_info and self.user:
            data['user_name'] = self.user.name

        return data

    @classmethod
    def log_add(
        cls,
        item_name: str,
        item_code: str,
        user_id: str,
        notes: Optional[str] = None
    ) -> "History":
        """
        Create a history entry for adding an item.

        Args:
            item_name: Name of the item added
            item_code: 4-digit code of the item
            user_id: ID of user who added the item
            notes: Optional notes

        Returns:
            Created History instance
        """
        return cls(
            action=HistoryAction.ADD.value,
            item_name=item_name,
            item_code=item_code,
            user_id=user_id,
            notes=notes
        )

    @classmethod
    def log_remove(
        cls,
        item_name: str,
        item_code: str,
        user_id: str,
        notes: Optional[str] = None
    ) -> "History":
        """
        Create a history entry for removing an item.

        Args:
            item_name: Name of the item removed
            item_code: 4-digit code of the item
            user_id: ID of user who removed the item
            notes: Optional notes

        Returns:
            Created History instance
        """
        return cls(
            action=HistoryAction.REMOVE.value,
            item_name=item_name,
            item_code=item_code,
            user_id=user_id,
            notes=notes
        )

    def __repr__(self) -> str:
        """String representation for debugging."""
        return f'<History {self.action} - {self.item_name} ({self.item_code}) at {self.timestamp}>'
