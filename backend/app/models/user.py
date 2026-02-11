"""
User model for staff authentication and authorization.
"""
from datetime import datetime
from uuid import uuid4
from typing import Optional, TYPE_CHECKING

from sqlalchemy import String, DateTime, Boolean, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from werkzeug.security import generate_password_hash, check_password_hash
import enum

from app.extensions import db
from app.utils.helpers import get_enum_value

if TYPE_CHECKING:
    from app.models.item import Item
    from app.models.history import History


class UserRole(enum.Enum):
    """Enumeration for user roles."""
    ADMIN = "admin"
    STAFF = "staff"


class User(db.Model):
    """
    User model for staff authentication.

    Attributes:
        id: UUID primary key
        partner_number: Unique partner identifier (store employee ID)
        name: Full name of the staff member
        pin_hash: Bcrypt-hashed 4-digit PIN
        role: User role (admin or staff)
        created_at: Timestamp of account creation
        updated_at: Timestamp of last account update
    """

    __tablename__ = 'users'

    # Primary key
    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid4())
    )

    # Authentication fields
    partner_number: Mapped[str] = mapped_column(
        String(20),
        unique=True,
        nullable=False,
        index=True
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    pin_hash: Mapped[str] = mapped_column(String(255), nullable=False)

    # Authorization
    role: Mapped[str] = mapped_column(
        SQLEnum(UserRole, values_callable=lambda x: [e.value for e in x]),
        nullable=False,
        default=UserRole.STAFF.value
    )

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

    # Soft delete fields
    is_deleted: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
        index=True  # Index for filtering active users
    )
    deleted_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime,
        nullable=True
    )
    deleted_by: Mapped[Optional[str]] = mapped_column(
        String(36),
        ForeignKey('users.id', ondelete='SET NULL'),
        nullable=True
    )

    # Relationships
    items: Mapped[list["Item"]] = relationship(
        "Item",
        foreign_keys="Item.added_by",
        back_populates="added_by_user",
        lazy="dynamic"
    )

    history_entries: Mapped[list["History"]] = relationship(
        "History",
        back_populates="user",
        lazy="dynamic"
    )

    def set_pin(self, pin: str) -> None:
        """
        Hash and set user PIN.

        Args:
            pin: 4-digit PIN string

        Raises:
            ValueError: If PIN is not exactly 4 digits
        """
        if not pin or len(pin) != 4 or not pin.isdigit():
            raise ValueError("PIN must be exactly 4 digits")

        self.pin_hash = generate_password_hash(pin)

    def check_pin(self, pin: str) -> bool:
        """
        Verify PIN against stored hash.

        Args:
            pin: PIN to verify

        Returns:
            True if PIN matches, False otherwise
        """
        return check_password_hash(self.pin_hash, pin)

    def to_dict(self, include_sensitive: bool = False) -> dict:
        """
        Convert model to dictionary.

        Args:
            include_sensitive: Whether to include partner_number (PII)

        Returns:
            Dictionary representation of user (excludes pin_hash)
        """
        role_value = get_enum_value(self.role)

        data = {
            'id': self.id,
            'name': self.name,
            'role': role_value,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

        if include_sensitive:
            data['partner_number'] = self.partner_number

        return data

    def __repr__(self) -> str:
        """String representation for debugging."""
        return f'<User {self.partner_number} - {self.name} ({self.role})>'
