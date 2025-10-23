"""
Unit tests for database models.
"""
import pytest
from datetime import datetime
from app.models.user import User, UserRole
from app.models.item import Item
from app.models.history import History
from app.extensions import db


class TestUserModel:
    """Tests for User model."""

    def test_set_pin(self, app):
        """Test PIN hashing."""
        user = User(
            partner_number="TEST001",
            name="Test User",
            role="staff"
        )
        user.set_pin("1234")

        assert user.pin_hash is not None
        assert user.pin_hash != "1234"  # Should be hashed
        assert len(user.pin_hash) > 20  # Bcrypt hashes are long

    def test_set_pin_invalid_length(self, app):
        """Test PIN validation for incorrect length."""
        user = User(
            partner_number="TEST001",
            name="Test User",
            role="staff"
        )

        with pytest.raises(ValueError, match="PIN must be exactly 4 digits"):
            user.set_pin("123")  # Too short

        with pytest.raises(ValueError, match="PIN must be exactly 4 digits"):
            user.set_pin("12345")  # Too long

    def test_set_pin_non_digits(self, app):
        """Test PIN validation for non-digit characters."""
        user = User(
            partner_number="TEST001",
            name="Test User",
            role="staff"
        )

        with pytest.raises(ValueError, match="PIN must be exactly 4 digits"):
            user.set_pin("abcd")

    def test_check_pin_correct(self, app):
        """Test PIN verification with correct PIN."""
        user = User(
            partner_number="TEST001",
            name="Test User",
            role="staff"
        )
        user.set_pin("1234")

        assert user.check_pin("1234") is True

    def test_check_pin_incorrect(self, app):
        """Test PIN verification with incorrect PIN."""
        user = User(
            partner_number="TEST001",
            name="Test User",
            role="staff"
        )
        user.set_pin("1234")

        assert user.check_pin("5678") is False

    def test_to_dict_excludes_sensitive(self, app):
        """Test to_dict excludes sensitive fields."""
        user = User(
            partner_number="TEST001",
            name="Test User",
            role="staff"
        )
        user.set_pin("1234")

        user_dict = user.to_dict()

        assert 'pin_hash' not in user_dict
        assert 'id' in user_dict
        assert 'name' in user_dict
        assert 'role' in user_dict

    def test_to_dict_includes_partner_number_when_requested(self, app):
        """Test to_dict includes partner number when sensitive flag is True."""
        user = User(
            partner_number="TEST001",
            name="Test User",
            role="staff"
        )

        user_dict = user.to_dict(include_sensitive=True)

        assert 'partner_number' in user_dict

    def test_user_repr(self, app):
        """Test User string representation."""
        user = User(
            partner_number="TEST001",
            name="Test User",
            role="staff"
        )

        assert "TEST001" in repr(user)
        assert "Test User" in repr(user)


class TestItemModel:
    """Tests for Item model."""

    def test_item_creation(self, app, admin_user):
        """Test creating an item."""
        item = Item(
            name="Coffee Beans",
            category="coffee_beans",
            code="1234",
            added_by=admin_user.id
        )

        db.session.add(item)
        db.session.commit()

        assert item.id is not None
        assert item.name == "Coffee Beans"
        assert item.code == "1234"
        assert item.is_removed is False
        assert item.removed_at is None

    def test_item_soft_delete(self, app, admin_user):
        """Test soft deletion of item."""
        item = Item(
            name="Coffee Beans",
            category="coffee_beans",
            code="1234",
            added_by=admin_user.id
        )

        db.session.add(item)
        db.session.commit()

        # Mark as removed
        item.is_removed = True
        item.removed_at = datetime.utcnow()
        item.removed_by = admin_user.id
        db.session.commit()

        assert item.is_removed is True
        assert item.removed_at is not None
        assert item.removed_by == admin_user.id

    def test_item_repr(self, app, admin_user):
        """Test Item string representation."""
        item = Item(
            name="Coffee Beans",
            category="coffee_beans",
            code="1234",
            added_by=admin_user.id
        )

        assert "Coffee Beans" in repr(item)
        assert "1234" in repr(item)


class TestHistoryModel:
    """Tests for History model."""

    def test_history_creation(self, app, admin_user):
        """Test creating a history entry."""
        from app.models.history import HistoryAction

        history = History(
            action="ADD",
            item_name="Coffee Beans",
            item_code="1234",
            user_id=admin_user.id
        )

        db.session.add(history)
        db.session.commit()

        assert history.id is not None
        # Action is stored as enum, check the value
        assert history.action == HistoryAction.ADD or history.action.value == "ADD"
        assert history.item_name == "Coffee Beans"
        assert history.item_code == "1234"
        assert history.timestamp is not None

    def test_history_repr(self, app, admin_user):
        """Test History string representation."""
        history = History(
            action="ADD",
            item_name="Coffee Beans",
            item_code="1234",
            user_id=admin_user.id
        )

        repr_str = repr(history)
        assert "ADD" in repr_str
        assert "Coffee Beans" in repr_str
        assert "1234" in repr_str
