"""
Milk Count models for Tool 2.

This module contains models for the Milk Count System:
- MilkType: Milk type definitions (e.g., Whole, 2%, Oat)
- MilkCountParLevel: Target inventory levels per milk type
- MilkCountSession: Daily counting sessions (one per day)
- MilkCountEntry: Individual milk counts within a session
"""
from datetime import datetime, date
from uuid import uuid4
from typing import Optional, List, TYPE_CHECKING
from enum import Enum

from sqlalchemy import String, DateTime, Date, Boolean, Integer, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.extensions import db

if TYPE_CHECKING:
    from app.models.user import User


class MilkCategory(str, Enum):
    """Categories of milk products."""
    DAIRY = 'dairy'
    NON_DAIRY = 'non_dairy'


class SessionStatus(str, Enum):
    """Status of a milk count session."""
    NIGHT_FOH = 'night_foh'      # Night count started, FOH in progress
    NIGHT_BOH = 'night_boh'      # FOH complete, BOH in progress
    MORNING = 'morning'          # Night complete, morning count in progress
    ON_ORDER = 'on_order'        # Morning complete, on order entry in progress
    COMPLETED = 'completed'      # All counts complete


class MorningMethod(str, Enum):
    """Method used for morning count."""
    BOH_COUNT = 'boh_count'           # Count current BOH, calculate delivered
    DIRECT_DELIVERED = 'direct_delivered'  # Enter delivered count directly


class MilkType(db.Model):
    """
    Milk type definition model.

    Attributes:
        id: UUID primary key
        name: Milk type name (e.g., "Whole", "2%", "Oat")
        category: Category enum (dairy or non_dairy)
        display_order: Position in counting sequence
        active: Whether milk type is currently in use
        created_at: Timestamp when type was created
        updated_at: Timestamp when type was last modified
    """

    __tablename__ = 'milk_count_milk_types'

    # Primary key
    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid4())
    )

    # Milk type details
    name: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)
    category: Mapped[str] = mapped_column(String(20), nullable=False)
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
    par_level: Mapped[Optional["MilkCountParLevel"]] = relationship(
        "MilkCountParLevel",
        back_populates="milk_type",
        uselist=False,
        cascade="all, delete-orphan"
    )
    entries: Mapped[List["MilkCountEntry"]] = relationship(
        "MilkCountEntry",
        back_populates="milk_type",
        cascade="all, delete-orphan"
    )

    def to_dict(self, include_par: bool = False) -> dict:
        """
        Convert model to dictionary.

        Args:
            include_par: Whether to include par level

        Returns:
            Dictionary representation of milk type
        """
        data = {
            'id': self.id,
            'name': self.name,
            'category': self.category,
            'display_order': self.display_order,
            'active': self.active,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

        if include_par and self.par_level:
            data['par_value'] = self.par_level.par_value

        return data

    def __repr__(self) -> str:
        """String representation for debugging."""
        status = "ACTIVE" if self.active else "INACTIVE"
        return f'<MilkType {self.name} ({self.category}) - {status}>'


class MilkCountParLevel(db.Model):
    """
    Par level for a milk type.

    Par level represents the target inventory quantity.
    One par level per milk type.

    Attributes:
        id: UUID primary key
        milk_type_id: Foreign key to milk type
        par_value: Target inventory level
        updated_at: Timestamp of last update
        updated_by: User who last updated the par level
    """

    __tablename__ = 'milk_count_par_levels'

    # Primary key
    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid4())
    )

    # References
    milk_type_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey('milk_count_milk_types.id', ondelete='CASCADE'),
        nullable=False,
        unique=True
    )

    # Par level value
    par_value: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    # Audit fields
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )
    updated_by: Mapped[Optional[str]] = mapped_column(
        String(36),
        ForeignKey('users.id', ondelete='SET NULL'),
        nullable=True
    )

    # Relationships
    milk_type: Mapped["MilkType"] = relationship(
        "MilkType",
        back_populates="par_level"
    )
    updated_by_user: Mapped[Optional["User"]] = relationship(
        "User",
        foreign_keys=[updated_by]
    )

    def to_dict(self, include_milk_type: bool = False) -> dict:
        """
        Convert model to dictionary.

        Args:
            include_milk_type: Whether to include milk type details

        Returns:
            Dictionary representation of par level
        """
        data = {
            'id': self.id,
            'milk_type_id': self.milk_type_id,
            'par_value': self.par_value,
            'updated_at': self.updated_at.isoformat()
        }

        if self.updated_by:
            data['updated_by'] = self.updated_by
            if self.updated_by_user:
                data['updated_by_name'] = self.updated_by_user.name

        if include_milk_type and self.milk_type:
            data['milk_type_name'] = self.milk_type.name
            data['milk_type_category'] = self.milk_type.category

        return data

    def __repr__(self) -> str:
        """String representation for debugging."""
        return f'<MilkCountParLevel {self.milk_type_id[:8]} - Par: {self.par_value}>'


class MilkCountSession(db.Model):
    """
    Daily milk counting session model.

    One session per day, store-level (not user-specific).
    Tracks the progress through night FOH → night BOH → morning → on_order → completed.

    Attributes:
        id: UUID primary key
        date: Date of the count (unique - one session per day)
        status: Current status of the session
        night_count_user_id: User who completed night count
        morning_count_user_id: User who completed morning/on_order count
        night_foh_saved_at: Timestamp when FOH count was saved
        night_boh_saved_at: Timestamp when BOH count was saved
        morning_saved_at: Timestamp when morning count was saved
        on_order_saved_at: Timestamp when on order entry was saved
        completed_at: Timestamp when session was marked complete
        created_at: Timestamp when session was created
    """

    __tablename__ = 'milk_count_sessions'

    # Primary key
    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid4())
    )

    # Session details
    session_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
        unique=True,
        index=True
    )
    status: Mapped[str] = mapped_column(
        String(20),
        default=SessionStatus.NIGHT_FOH.value,
        nullable=False,
        index=True
    )

    # User tracking
    night_count_user_id: Mapped[Optional[str]] = mapped_column(
        String(36),
        ForeignKey('users.id', ondelete='SET NULL'),
        nullable=True
    )
    morning_count_user_id: Mapped[Optional[str]] = mapped_column(
        String(36),
        ForeignKey('users.id', ondelete='SET NULL'),
        nullable=True
    )

    # Timestamps for each phase
    night_foh_saved_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime,
        nullable=True
    )
    night_boh_saved_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime,
        nullable=True
    )
    morning_saved_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime,
        nullable=True
    )
    on_order_saved_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime,
        nullable=True
    )
    completed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime,
        nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    # Relationships
    night_count_user: Mapped[Optional["User"]] = relationship(
        "User",
        foreign_keys=[night_count_user_id]
    )
    morning_count_user: Mapped[Optional["User"]] = relationship(
        "User",
        foreign_keys=[morning_count_user_id]
    )
    entries: Mapped[List["MilkCountEntry"]] = relationship(
        "MilkCountEntry",
        back_populates="session",
        cascade="all, delete-orphan"
    )

    def to_dict(self, include_entries: bool = False, include_users: bool = False) -> dict:
        """
        Convert model to dictionary.

        Args:
            include_entries: Whether to include session entries
            include_users: Whether to include user names

        Returns:
            Dictionary representation of session
        """
        data = {
            'id': self.id,
            'date': self.session_date.isoformat(),
            'status': self.status,
            'created_at': self.created_at.isoformat()
        }

        # Add phase timestamps if set
        if self.night_foh_saved_at:
            data['night_foh_saved_at'] = self.night_foh_saved_at.isoformat()
        if self.night_boh_saved_at:
            data['night_boh_saved_at'] = self.night_boh_saved_at.isoformat()
        if self.morning_saved_at:
            data['morning_saved_at'] = self.morning_saved_at.isoformat()
        if self.on_order_saved_at:
            data['on_order_saved_at'] = self.on_order_saved_at.isoformat()
        if self.completed_at:
            data['completed_at'] = self.completed_at.isoformat()

        # Add user info
        if self.night_count_user_id:
            data['night_count_user_id'] = self.night_count_user_id
            if include_users and self.night_count_user:
                data['night_count_user_name'] = self.night_count_user.name

        if self.morning_count_user_id:
            data['morning_count_user_id'] = self.morning_count_user_id
            if include_users and self.morning_count_user:
                data['morning_count_user_name'] = self.morning_count_user.name

        if include_entries:
            data['entries'] = [entry.to_dict() for entry in self.entries]

        return data

    def is_night_complete(self) -> bool:
        """Check if night count (both FOH and BOH) is complete."""
        return self.status in [
            SessionStatus.MORNING.value,
            SessionStatus.ON_ORDER.value,
            SessionStatus.COMPLETED.value
        ]

    def mark_night_foh_complete(self, user_id: str) -> None:
        """Mark FOH count as complete and advance to BOH phase."""
        self.status = SessionStatus.NIGHT_BOH.value
        self.night_foh_saved_at = datetime.utcnow()
        self.night_count_user_id = user_id

    def mark_night_boh_complete(self) -> None:
        """Mark BOH count as complete and advance to morning phase."""
        self.status = SessionStatus.MORNING.value
        self.night_boh_saved_at = datetime.utcnow()

    def mark_morning_complete(self, user_id: str) -> None:
        """Mark morning count as complete and advance to on order phase."""
        self.status = SessionStatus.ON_ORDER.value
        self.morning_saved_at = datetime.utcnow()
        self.morning_count_user_id = user_id

    def mark_on_order_complete(self, user_id: str) -> None:
        """Mark on order entry as complete and finalize session."""
        self.status = SessionStatus.COMPLETED.value
        self.on_order_saved_at = datetime.utcnow()
        self.completed_at = datetime.utcnow()
        # Note: on order user is the same as morning count user in most cases
        # but we update it in case a different person completes this step
        self.morning_count_user_id = user_id

    def __repr__(self) -> str:
        """String representation for debugging."""
        return f'<MilkCountSession {self.session_date} - {self.status}>'


class MilkCountEntry(db.Model):
    """
    Individual milk count entry within a session.

    One entry per milk type per session.
    Stores both night counts (FOH, BOH) and morning count data.

    Attributes:
        id: UUID primary key
        session_id: Foreign key to parent session
        milk_type_id: Foreign key to milk type
        foh_count: Front of house count (from night)
        boh_count: Back of house count (from night)
        morning_method: Method used for morning count
        current_boh: Current BOH count (for boh_count method)
        delivered: Delivered quantity (calculated or direct)
        updated_at: Timestamp of last update
    """

    __tablename__ = 'milk_count_entries'
    __table_args__ = (
        UniqueConstraint('session_id', 'milk_type_id', name='uq_milk_count_entries_session_milk_type'),
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
        ForeignKey('milk_count_sessions.id', ondelete='CASCADE'),
        nullable=False,
        index=True
    )
    milk_type_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey('milk_count_milk_types.id', ondelete='CASCADE'),
        nullable=False
    )

    # Night count values
    foh_count: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    boh_count: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    # Morning count values
    morning_method: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    current_boh: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    delivered: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    # On order value (from IMS - already ordered but not yet delivered)
    on_order: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    # Timestamp
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )

    # Relationships
    session: Mapped["MilkCountSession"] = relationship(
        "MilkCountSession",
        back_populates="entries"
    )
    milk_type: Mapped["MilkType"] = relationship(
        "MilkType",
        back_populates="entries"
    )

    def to_dict(self, include_milk_type: bool = True) -> dict:
        """
        Convert model to dictionary.

        Args:
            include_milk_type: Whether to include milk type details

        Returns:
            Dictionary representation of entry
        """
        data = {
            'id': self.id,
            'session_id': self.session_id,
            'milk_type_id': self.milk_type_id,
            'foh_count': self.foh_count,
            'boh_count': self.boh_count,
            'morning_method': self.morning_method,
            'current_boh': self.current_boh,
            'delivered': self.delivered,
            'on_order': self.on_order,
            'updated_at': self.updated_at.isoformat()
        }

        if include_milk_type and self.milk_type:
            data['milk_type_name'] = self.milk_type.name
            data['milk_type_category'] = self.milk_type.category

        return data

    def calculate_delivered(self) -> Optional[int]:
        """
        Calculate delivered quantity based on morning method.

        For BOH count method: delivered = current_boh - boh_count
        For direct method: delivered is already set

        Returns:
            Calculated or direct delivered quantity, or None if not available
        """
        if self.morning_method == MorningMethod.BOH_COUNT.value:
            if self.current_boh is not None and self.boh_count is not None:
                return max(0, self.current_boh - self.boh_count)
        elif self.morning_method == MorningMethod.DIRECT_DELIVERED.value:
            return self.delivered
        return None

    def calculate_total(self) -> Optional[int]:
        """
        Calculate total inventory.

        Total = FOH + BOH + Delivered

        Returns:
            Total inventory, or None if values not available
        """
        delivered = self.calculate_delivered()
        if self.foh_count is not None and self.boh_count is not None and delivered is not None:
            return self.foh_count + self.boh_count + delivered
        return None

    def __repr__(self) -> str:
        """String representation for debugging."""
        foh = self.foh_count if self.foh_count is not None else '?'
        boh = self.boh_count if self.boh_count is not None else '?'
        return f'<MilkCountEntry {self.milk_type_id[:8]} - FOH: {foh}, BOH: {boh}>'
