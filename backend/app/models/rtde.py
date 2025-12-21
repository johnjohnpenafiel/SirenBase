"""
RTD&E (Ready-to-Drink & Eat) models for Tool 3.

This module contains models for the RTD&E Counting System:
- RTDEItem: Display items with par levels
- RTDECountSession: Counting sessions with 4-hour expiration
- RTDESessionCount: Individual item counts within a session
"""
from datetime import datetime, timedelta
from uuid import uuid4
from typing import Optional, List, TYPE_CHECKING

from sqlalchemy import String, DateTime, Boolean, Integer, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.extensions import db

if TYPE_CHECKING:
    from app.models.user import User


class RTDEItem(db.Model):
    """
    RTD&E display item model.

    Attributes:
        id: UUID primary key
        name: Item name (e.g., "Egg & Cheese Sandwich")
        brand: Brand name (e.g., "Evolution") - optional, displayed above item name
        image_filename: Product image filename (e.g., "ethos-water.jpeg") - managed by engineering
        icon: Emoji icon for visual recognition (e.g., "🥪") - optional fallback
        par_level: Target quantity for display
        display_order: Position in counting sequence (1, 2, 3...)
        active: Whether item is currently in use (seasonal toggle)
        created_at: Timestamp when item was created
        updated_at: Timestamp when item was last modified

    Display Fallback Hierarchy:
        1. Product image (if image_filename exists)
        2. Emoji icon (if icon exists)
        3. Universal placeholder emoji (handled by frontend)
    """

    __tablename__ = 'rtde_items'

    # Primary key
    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid4())
    )

    # Item details
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    brand: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    image_filename: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    icon: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    par_level: Mapped[int] = mapped_column(Integer, nullable=False)
    display_order: Mapped[int] = mapped_column(Integer, nullable=False)
    active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False, index=True)

    # Timestamps
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

    # Relationships
    session_counts: Mapped[List["RTDESessionCount"]] = relationship(
        "RTDESessionCount",
        back_populates="item",
        cascade="all, delete-orphan"
    )

    def to_dict(self) -> dict:
        """
        Convert model to dictionary.

        Returns:
            Dictionary representation of item
        """
        return {
            'id': self.id,
            'name': self.name,
            'brand': self.brand,
            'image_filename': self.image_filename,
            'icon': self.icon,
            'par_level': self.par_level,
            'display_order': self.display_order,
            'active': self.active,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def __repr__(self) -> str:
        """String representation for debugging."""
        status = "ACTIVE" if self.active else "INACTIVE"
        brand_str = f"{self.brand} " if self.brand else ""
        icon_str = self.icon if self.icon else "📦"
        return f'<RTDEItem {icon_str} {brand_str}{self.name} - Par: {self.par_level} ({status})>'


class RTDECountSession(db.Model):
    """
    RTD&E counting session model.

    Sessions have a 30-minute expiration window and are user-specific.
    Sessions are deleted immediately after completion (calculator-style).

    Attributes:
        id: UUID primary key
        user_id: Foreign key to user who owns this session
        status: Session status ('in_progress', 'completed', 'expired')
        started_at: Timestamp when session was created
        completed_at: Timestamp when session was completed (nullable)
        expires_at: Timestamp when session expires (started_at + 30 minutes)
    """

    __tablename__ = 'rtde_count_sessions'

    # Primary key
    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid4())
    )

    # Session details
    user_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey('users.id', ondelete='RESTRICT'),
        nullable=False,
        index=True
    )
    status: Mapped[str] = mapped_column(
        String(20),
        default='in_progress',
        nullable=False,
        index=True
    )

    # Timestamps
    started_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )
    completed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime,
        nullable=True
    )
    expires_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False
    )

    # Relationships
    user: Mapped["User"] = relationship("User", foreign_keys=[user_id])
    counts: Mapped[List["RTDESessionCount"]] = relationship(
        "RTDESessionCount",
        back_populates="session",
        cascade="all, delete-orphan"
    )

    def __init__(self, **kwargs):
        """
        Initialize session with automatic expiration calculation.

        Sets expires_at to started_at + 30 minutes if not provided.
        """
        # Set started_at if not provided
        if 'started_at' not in kwargs:
            kwargs['started_at'] = datetime.utcnow()

        super().__init__(**kwargs)

        # Auto-calculate expires_at if not provided
        if not self.expires_at:
            self.expires_at = self.started_at + timedelta(minutes=30)

    def to_dict(self, include_counts: bool = False) -> dict:
        """
        Convert model to dictionary.

        Args:
            include_counts: Whether to include session counts

        Returns:
            Dictionary representation of session
        """
        data = {
            'id': self.id,
            'user_id': self.user_id,
            'status': self.status,
            'started_at': self.started_at.isoformat(),
            'expires_at': self.expires_at.isoformat()
        }

        if self.completed_at:
            data['completed_at'] = self.completed_at.isoformat()

        if include_counts:
            data['counts'] = [count.to_dict() for count in self.counts]

        return data

    def is_expired(self) -> bool:
        """
        Check if session has expired.

        Returns:
            True if current time is past expires_at
        """
        return datetime.utcnow() > self.expires_at

    def mark_completed(self) -> None:
        """Mark session as completed with timestamp."""
        self.status = 'completed'
        self.completed_at = datetime.utcnow()

    def __repr__(self) -> str:
        """String representation for debugging."""
        return f'<RTDECountSession {self.id[:8]} - User: {self.user_id[:8]} ({self.status})>'


class RTDESessionCount(db.Model):
    """
    Individual item count within an RTD&E session.

    Attributes:
        id: UUID primary key
        session_id: Foreign key to parent session
        item_id: Foreign key to RTD&E item
        counted_quantity: Current count for this item
        is_pulled: Whether item has been pulled from BOH
        updated_at: Timestamp of last count update
    """

    __tablename__ = 'rtde_session_counts'
    __table_args__ = (
        UniqueConstraint('session_id', 'item_id', name='uq_rtde_session_counts_session_item'),
    )

    # Primary key
    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid4())
    )

    # References
    session_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey('rtde_count_sessions.id', ondelete='CASCADE'),
        nullable=False,
        index=True
    )
    item_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey('rtde_items.id', ondelete='CASCADE'),
        nullable=False
    )

    # Count details
    counted_quantity: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_pulled: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Timestamp
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )

    # Relationships
    session: Mapped["RTDECountSession"] = relationship(
        "RTDECountSession",
        back_populates="counts"
    )
    item: Mapped["RTDEItem"] = relationship(
        "RTDEItem",
        back_populates="session_counts"
    )

    def to_dict(self) -> dict:
        """
        Convert model to dictionary.

        Returns:
            Dictionary representation of count
        """
        return {
            'id': self.id,
            'session_id': self.session_id,
            'item_id': self.item_id,
            'counted_quantity': self.counted_quantity,
            'is_pulled': self.is_pulled,
            'updated_at': self.updated_at.isoformat()
        }

    def __repr__(self) -> str:
        """String representation for debugging."""
        return f'<RTDESessionCount Item: {self.item_id[:8]} - Count: {self.counted_quantity}>'
