"""
Tests for RTD&E models (RTDEItem, RTDECountSession, RTDESessionCount).
"""
import pytest
from datetime import datetime, timedelta
from sqlalchemy.exc import IntegrityError

from app.models.rtde import RTDEItem, RTDECountSession, RTDESessionCount
from app.extensions import db


class TestRTDEItem:
    """Tests for RTDEItem model."""

    def test_create_item(self, app):
        """Test creating RTD&E item."""
        item = RTDEItem(
            name="Egg & Cheese Sandwich",
            icon="🥪",
            par_level=8,
            display_order=1,
            active=True
        )

        db.session.add(item)
        db.session.commit()

        # Verify item was saved
        assert item.id is not None
        assert item.name == "Egg & Cheese Sandwich"
        assert item.icon == "🥪"
        assert item.par_level == 8
        assert item.display_order == 1
        assert item.active is True
        assert item.created_at is not None
        assert item.updated_at is not None

    def test_item_to_dict(self, app):
        """Test item to_dict method."""
        item = RTDEItem(
            name="Cold Brew",
            icon="🥤",
            par_level=12,
            display_order=2
        )

        db.session.add(item)
        db.session.commit()

        item_dict = item.to_dict()

        assert item_dict['id'] == item.id
        assert item_dict['name'] == "Cold Brew"
        assert item_dict['icon'] == "🥤"
        assert item_dict['par_level'] == 12
        assert item_dict['display_order'] == 2
        assert item_dict['active'] is True
        assert 'created_at' in item_dict
        assert 'updated_at' in item_dict

    def test_item_repr(self, app):
        """Test item string representation."""
        item = RTDEItem(
            name="String Cheese",
            icon="🧀",
            par_level=6,
            display_order=3,
            active=True
        )

        repr_str = repr(item)
        assert "RTDEItem" in repr_str
        assert "🧀" in repr_str
        assert "String Cheese" in repr_str
        assert "ACTIVE" in repr_str

    def test_item_inactive_repr(self, app):
        """Test inactive item string representation."""
        item = RTDEItem(
            name="Seasonal Item",
            icon="🎃",
            par_level=5,
            display_order=4,
            active=False
        )

        repr_str = repr(item)
        assert "INACTIVE" in repr_str


class TestRTDECountSession:
    """Tests for RTDECountSession model."""

    def test_create_session(self, app, staff_user):
        """Test creating counting session."""
        session = RTDECountSession(
            user_id=staff_user.id,
            status='in_progress'
        )

        db.session.add(session)
        db.session.commit()

        # Verify session was saved
        assert session.id is not None
        assert session.user_id == staff_user.id
        assert session.status == 'in_progress'
        assert session.started_at is not None
        assert session.expires_at is not None
        assert session.completed_at is None

    def test_session_auto_expiration(self, app, staff_user):
        """Test session auto-calculates expiration (4 hours)."""
        session = RTDECountSession(
            user_id=staff_user.id,
            status='in_progress'
        )

        db.session.add(session)
        db.session.commit()

        # Verify expires_at is 4 hours after started_at
        expected_expires = session.started_at + timedelta(hours=4)
        time_diff = abs((session.expires_at - expected_expires).total_seconds())
        assert time_diff < 1  # Within 1 second

    def test_session_is_expired(self, app, staff_user):
        """Test is_expired method."""
        # Create session that expires in the past
        past_time = datetime.utcnow() - timedelta(hours=5)
        session = RTDECountSession(
            user_id=staff_user.id,
            status='in_progress',
            started_at=past_time
        )
        session.expires_at = past_time + timedelta(hours=4)  # Override auto-calculation

        assert session.is_expired() is True

        # Create session that expires in the future
        future_session = RTDECountSession(
            user_id=staff_user.id,
            status='in_progress'
        )

        db.session.add(future_session)
        db.session.commit()

        assert future_session.is_expired() is False

    def test_session_mark_completed(self, app, staff_user):
        """Test mark_completed method."""
        session = RTDECountSession(
            user_id=staff_user.id,
            status='in_progress'
        )

        db.session.add(session)
        db.session.commit()

        # Mark as completed
        session.mark_completed()

        assert session.status == 'completed'
        assert session.completed_at is not None

    def test_session_to_dict(self, app, staff_user):
        """Test session to_dict method."""
        session = RTDECountSession(
            user_id=staff_user.id,
            status='in_progress'
        )

        db.session.add(session)
        db.session.commit()

        session_dict = session.to_dict()

        assert session_dict['id'] == session.id
        assert session_dict['user_id'] == staff_user.id
        assert session_dict['status'] == 'in_progress'
        assert 'started_at' in session_dict
        assert 'expires_at' in session_dict
        assert 'completed_at' not in session_dict  # Not completed yet

    def test_session_to_dict_completed(self, app, staff_user):
        """Test session to_dict with completed session."""
        session = RTDECountSession(
            user_id=staff_user.id,
            status='in_progress'
        )

        db.session.add(session)
        db.session.commit()

        # Mark as completed
        session.mark_completed()
        db.session.commit()

        session_dict = session.to_dict()

        assert 'completed_at' in session_dict

    def test_session_repr(self, app, staff_user):
        """Test session string representation."""
        session = RTDECountSession(
            user_id=staff_user.id,
            status='in_progress'
        )

        db.session.add(session)
        db.session.commit()

        repr_str = repr(session)
        assert "RTDECountSession" in repr_str
        assert "in_progress" in repr_str


class TestRTDESessionCount:
    """Tests for RTDESessionCount model."""

    def test_create_count(self, app, staff_user):
        """Test creating session count."""
        # Create session and item
        session = RTDECountSession(
            user_id=staff_user.id,
            status='in_progress'
        )
        item = RTDEItem(
            name="Test Item",
            icon="🧪",
            par_level=10,
            display_order=1
        )

        db.session.add_all([session, item])
        db.session.commit()

        # Create count
        count = RTDESessionCount(
            session_id=session.id,
            item_id=item.id,
            counted_quantity=5
        )

        db.session.add(count)
        db.session.commit()

        # Verify count was saved
        assert count.id is not None
        assert count.session_id == session.id
        assert count.item_id == item.id
        assert count.counted_quantity == 5
        assert count.is_pulled is False
        assert count.updated_at is not None

    def test_count_unique_constraint(self, app, staff_user):
        """Test unique constraint on session_id + item_id."""
        # Create session and item
        session = RTDECountSession(
            user_id=staff_user.id,
            status='in_progress'
        )
        item = RTDEItem(
            name="Test Item",
            icon="🧪",
            par_level=10,
            display_order=1
        )

        db.session.add_all([session, item])
        db.session.commit()

        # Create first count
        count1 = RTDESessionCount(
            session_id=session.id,
            item_id=item.id,
            counted_quantity=5
        )

        db.session.add(count1)
        db.session.commit()

        # Try to create duplicate count (same session + item)
        count2 = RTDESessionCount(
            session_id=session.id,
            item_id=item.id,
            counted_quantity=7
        )

        db.session.add(count2)

        # Should raise IntegrityError
        with pytest.raises(IntegrityError):
            db.session.commit()

        db.session.rollback()

    def test_count_cascade_delete_session(self, app, staff_user):
        """Test cascade delete when session is deleted."""
        # Create session, item, and count
        session = RTDECountSession(
            user_id=staff_user.id,
            status='in_progress'
        )
        item = RTDEItem(
            name="Test Item",
            icon="🧪",
            par_level=10,
            display_order=1
        )

        db.session.add_all([session, item])
        db.session.commit()

        count = RTDESessionCount(
            session_id=session.id,
            item_id=item.id,
            counted_quantity=5
        )

        db.session.add(count)
        db.session.commit()

        count_id = count.id

        # Delete session (should cascade delete count)
        db.session.delete(session)
        db.session.commit()

        # Verify count was deleted
        deleted_count = RTDESessionCount.query.get(count_id)
        assert deleted_count is None

    def test_count_cascade_delete_item(self, app, staff_user):
        """Test cascade delete when item is deleted."""
        # Create session, item, and count
        session = RTDECountSession(
            user_id=staff_user.id,
            status='in_progress'
        )
        item = RTDEItem(
            name="Test Item",
            icon="🧪",
            par_level=10,
            display_order=1
        )

        db.session.add_all([session, item])
        db.session.commit()

        count = RTDESessionCount(
            session_id=session.id,
            item_id=item.id,
            counted_quantity=5
        )

        db.session.add(count)
        db.session.commit()

        count_id = count.id

        # Delete item (should cascade delete count)
        db.session.delete(item)
        db.session.commit()

        # Verify count was deleted
        deleted_count = RTDESessionCount.query.get(count_id)
        assert deleted_count is None

    def test_count_to_dict(self, app, staff_user):
        """Test count to_dict method."""
        # Create session, item, and count
        session = RTDECountSession(
            user_id=staff_user.id,
            status='in_progress'
        )
        item = RTDEItem(
            name="Test Item",
            icon="🧪",
            par_level=10,
            display_order=1
        )

        db.session.add_all([session, item])
        db.session.commit()

        count = RTDESessionCount(
            session_id=session.id,
            item_id=item.id,
            counted_quantity=5,
            is_pulled=True
        )

        db.session.add(count)
        db.session.commit()

        count_dict = count.to_dict()

        assert count_dict['id'] == count.id
        assert count_dict['session_id'] == session.id
        assert count_dict['item_id'] == item.id
        assert count_dict['counted_quantity'] == 5
        assert count_dict['is_pulled'] is True
        assert 'updated_at' in count_dict

    def test_count_repr(self, app, staff_user):
        """Test count string representation."""
        # Create session, item, and count
        session = RTDECountSession(
            user_id=staff_user.id,
            status='in_progress'
        )
        item = RTDEItem(
            name="Test Item",
            icon="🧪",
            par_level=10,
            display_order=1
        )

        db.session.add_all([session, item])
        db.session.commit()

        count = RTDESessionCount(
            session_id=session.id,
            item_id=item.id,
            counted_quantity=5
        )

        db.session.add(count)
        db.session.commit()

        repr_str = repr(count)
        assert "RTDESessionCount" in repr_str
        assert "Count: 5" in repr_str
