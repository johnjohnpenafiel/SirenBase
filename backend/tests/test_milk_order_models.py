"""
Tests for Milk Order models.

Tests cover:
- MilkType model operations
- MilkOrderParLevel model operations
- MilkOrderSession model operations and status transitions
- MilkOrderEntry model operations and calculations
"""
import pytest
from datetime import date, datetime

from app.models.milk_order import (
    MilkType,
    MilkCategory,
    MilkOrderParLevel,
    MilkOrderSession,
    MilkOrderEntry,
    SessionStatus,
    MorningMethod,
)
from app.extensions import db


class TestMilkTypeModel:
    """Tests for MilkType model."""

    def test_create_milk_type(self, app):
        """Test creating a milk type."""
        milk_type = MilkType(
            name="Test Milk",
            category=MilkCategory.DAIRY.value,
            display_order=1,
            active=True
        )

        db.session.add(milk_type)
        db.session.commit()

        assert milk_type.id is not None
        assert milk_type.name == "Test Milk"
        assert milk_type.category == "dairy"
        assert milk_type.display_order == 1
        assert milk_type.active is True
        assert milk_type.created_at is not None

    def test_milk_type_to_dict(self, app):
        """Test to_dict method."""
        milk_type = MilkType(
            name="Whole Milk",
            category=MilkCategory.DAIRY.value,
            display_order=1
        )
        db.session.add(milk_type)
        db.session.commit()

        data = milk_type.to_dict()

        assert data['name'] == "Whole Milk"
        assert data['category'] == "dairy"
        assert data['display_order'] == 1
        assert 'id' in data
        assert 'created_at' in data

    def test_milk_type_to_dict_with_par(self, app):
        """Test to_dict with par level included."""
        milk_type = MilkType(
            name="Oat Milk",
            category=MilkCategory.NON_DAIRY.value,
            display_order=6
        )
        db.session.add(milk_type)
        db.session.commit()

        # Add par level
        par = MilkOrderParLevel(
            milk_type_id=milk_type.id,
            par_value=25
        )
        db.session.add(par)
        db.session.commit()

        db.session.refresh(milk_type)
        data = milk_type.to_dict(include_par=True)

        assert data['par_value'] == 25

    def test_milk_type_repr(self, app):
        """Test string representation."""
        milk_type = MilkType(
            name="Almond",
            category=MilkCategory.NON_DAIRY.value,
            display_order=7,
            active=True
        )

        result = repr(milk_type)

        assert "Almond" in result
        assert "non_dairy" in result
        assert "ACTIVE" in result


class TestMilkOrderParLevelModel:
    """Tests for MilkOrderParLevel model."""

    def test_create_par_level(self, app):
        """Test creating a par level."""
        # Create milk type first
        milk_type = MilkType(
            name="2%",
            category=MilkCategory.DAIRY.value,
            display_order=2
        )
        db.session.add(milk_type)
        db.session.commit()

        # Create par level
        par = MilkOrderParLevel(
            milk_type_id=milk_type.id,
            par_value=30
        )
        db.session.add(par)
        db.session.commit()

        assert par.id is not None
        assert par.par_value == 30
        assert par.milk_type_id == milk_type.id

    def test_par_level_to_dict_with_milk_type(self, app, admin_user):
        """Test to_dict with milk type info."""
        milk_type = MilkType(
            name="Half & Half",
            category=MilkCategory.DAIRY.value,
            display_order=4
        )
        db.session.add(milk_type)
        db.session.commit()

        par = MilkOrderParLevel(
            milk_type_id=milk_type.id,
            par_value=15,
            updated_by=admin_user.id
        )
        db.session.add(par)
        db.session.commit()

        data = par.to_dict(include_milk_type=True)

        assert data['par_value'] == 15
        assert data['milk_type_name'] == "Half & Half"
        assert data['milk_type_category'] == "dairy"
        assert data['updated_by'] == admin_user.id


class TestMilkOrderSessionModel:
    """Tests for MilkOrderSession model."""

    def test_create_session(self, app):
        """Test creating a session."""
        today = date.today()

        session = MilkOrderSession(
            session_date=today,
            status=SessionStatus.NIGHT_FOH.value
        )
        db.session.add(session)
        db.session.commit()

        assert session.id is not None
        assert session.session_date == today
        assert session.status == "night_foh"
        assert session.created_at is not None

    def test_session_status_transitions(self, app, staff_user):
        """Test session status transitions."""
        session = MilkOrderSession(
            session_date=date.today(),
            status=SessionStatus.NIGHT_FOH.value
        )
        db.session.add(session)
        db.session.commit()

        # Transition to BOH
        session.mark_night_foh_complete(staff_user.id)
        assert session.status == "night_boh"
        assert session.night_foh_saved_at is not None
        assert session.night_count_user_id == staff_user.id

        # Transition to morning
        session.mark_night_boh_complete()
        assert session.status == "morning"
        assert session.night_boh_saved_at is not None

        # Transition to on_order
        session.mark_morning_complete(staff_user.id)
        assert session.status == "on_order"
        assert session.morning_saved_at is not None
        assert session.morning_count_user_id == staff_user.id

        # Transition to completed
        session.mark_on_order_complete(staff_user.id)
        assert session.status == "completed"
        assert session.on_order_saved_at is not None
        assert session.completed_at is not None

    def test_is_night_complete(self, app):
        """Test is_night_complete method."""
        session = MilkOrderSession(
            session_date=date.today(),
            status=SessionStatus.NIGHT_FOH.value
        )
        db.session.add(session)
        db.session.commit()

        # Not complete in FOH phase
        assert session.is_night_complete() is False

        # Not complete in BOH phase
        session.status = SessionStatus.NIGHT_BOH.value
        assert session.is_night_complete() is False

        # Complete in morning phase
        session.status = SessionStatus.MORNING.value
        assert session.is_night_complete() is True

        # Complete in completed phase
        session.status = SessionStatus.COMPLETED.value
        assert session.is_night_complete() is True

    def test_session_to_dict(self, app, staff_user):
        """Test to_dict method."""
        session = MilkOrderSession(
            session_date=date.today(),
            status=SessionStatus.NIGHT_FOH.value,
            night_count_user_id=staff_user.id
        )
        db.session.add(session)
        db.session.commit()

        data = session.to_dict(include_users=True)

        assert 'id' in data
        assert data['status'] == "night_foh"
        assert 'date' in data
        assert data['night_count_user_name'] == staff_user.name

    def test_session_unique_date_constraint(self, app):
        """Test that only one session per date is allowed."""
        today = date.today()

        session1 = MilkOrderSession(
            session_date=today,
            status=SessionStatus.NIGHT_FOH.value
        )
        db.session.add(session1)
        db.session.commit()

        # Try to create another session for the same date
        session2 = MilkOrderSession(
            session_date=today,
            status=SessionStatus.NIGHT_FOH.value
        )
        db.session.add(session2)

        with pytest.raises(Exception):  # IntegrityError
            db.session.commit()


class TestMilkOrderEntryModel:
    """Tests for MilkOrderEntry model."""

    def test_create_entry(self, app):
        """Test creating an entry."""
        # Create milk type and session
        milk_type = MilkType(
            name="Coconut",
            category=MilkCategory.NON_DAIRY.value,
            display_order=8
        )
        db.session.add(milk_type)

        session = MilkOrderSession(
            session_date=date.today(),
            status=SessionStatus.NIGHT_FOH.value
        )
        db.session.add(session)
        db.session.commit()

        # Create entry
        entry = MilkOrderEntry(
            session_id=session.id,
            milk_type_id=milk_type.id,
            foh_count=10,
            boh_count=15
        )
        db.session.add(entry)
        db.session.commit()

        assert entry.id is not None
        assert entry.foh_count == 10
        assert entry.boh_count == 15

    def test_calculate_delivered_boh_method(self, app):
        """Test delivered calculation using BOH count method."""
        milk_type = MilkType(
            name="Soy",
            category=MilkCategory.NON_DAIRY.value,
            display_order=9
        )
        db.session.add(milk_type)

        session = MilkOrderSession(
            session_date=date.today(),
            status=SessionStatus.MORNING.value
        )
        db.session.add(session)
        db.session.commit()

        entry = MilkOrderEntry(
            session_id=session.id,
            milk_type_id=milk_type.id,
            foh_count=10,
            boh_count=20,  # Night BOH
            morning_method=MorningMethod.BOH_COUNT.value,
            current_boh=30  # Morning BOH (20 + 10 delivered)
        )
        db.session.add(entry)
        db.session.commit()

        # Delivered = current_boh - boh_count = 30 - 20 = 10
        assert entry.calculate_delivered() == 10

    def test_calculate_delivered_direct_method(self, app):
        """Test delivered calculation using direct method."""
        milk_type = MilkType(
            name="Heavy Cream",
            category=MilkCategory.DAIRY.value,
            display_order=5
        )
        db.session.add(milk_type)

        session = MilkOrderSession(
            session_date=date.today(),
            status=SessionStatus.MORNING.value
        )
        db.session.add(session)
        db.session.commit()

        entry = MilkOrderEntry(
            session_id=session.id,
            milk_type_id=milk_type.id,
            foh_count=5,
            boh_count=10,
            morning_method=MorningMethod.DIRECT_DELIVERED.value,
            delivered=8  # Direct entry
        )
        db.session.add(entry)
        db.session.commit()

        assert entry.calculate_delivered() == 8

    def test_calculate_delivered_negative_handled(self, app):
        """Test that negative delivered values are handled (returns 0)."""
        milk_type = MilkType(
            name="Whole",
            category=MilkCategory.DAIRY.value,
            display_order=1
        )
        db.session.add(milk_type)

        session = MilkOrderSession(
            session_date=date.today(),
            status=SessionStatus.MORNING.value
        )
        db.session.add(session)
        db.session.commit()

        entry = MilkOrderEntry(
            session_id=session.id,
            milk_type_id=milk_type.id,
            foh_count=10,
            boh_count=30,  # Night BOH was 30
            morning_method=MorningMethod.BOH_COUNT.value,
            current_boh=25  # Morning BOH is less (some used)
        )
        db.session.add(entry)
        db.session.commit()

        # Should return 0, not negative
        assert entry.calculate_delivered() == 0

    def test_calculate_total(self, app):
        """Test total calculation."""
        milk_type = MilkType(
            name="Non-Fat",
            category=MilkCategory.DAIRY.value,
            display_order=3
        )
        db.session.add(milk_type)

        session = MilkOrderSession(
            session_date=date.today(),
            status=SessionStatus.COMPLETED.value
        )
        db.session.add(session)
        db.session.commit()

        entry = MilkOrderEntry(
            session_id=session.id,
            milk_type_id=milk_type.id,
            foh_count=15,
            boh_count=20,
            morning_method=MorningMethod.DIRECT_DELIVERED.value,
            delivered=10
        )
        db.session.add(entry)
        db.session.commit()

        # Total = FOH + BOH + Delivered = 15 + 20 + 10 = 45
        assert entry.calculate_total() == 45

    def test_entry_to_dict(self, app):
        """Test to_dict method."""
        milk_type = MilkType(
            name="2%",
            category=MilkCategory.DAIRY.value,
            display_order=2
        )
        db.session.add(milk_type)

        session = MilkOrderSession(
            session_date=date.today(),
            status=SessionStatus.NIGHT_FOH.value
        )
        db.session.add(session)
        db.session.commit()

        entry = MilkOrderEntry(
            session_id=session.id,
            milk_type_id=milk_type.id,
            foh_count=12
        )
        db.session.add(entry)
        db.session.commit()

        data = entry.to_dict(include_milk_type=True)

        assert data['foh_count'] == 12
        assert data['milk_type_name'] == "2%"
        assert data['milk_type_category'] == "dairy"

    def test_entry_unique_constraint(self, app):
        """Test unique constraint on session + milk_type."""
        milk_type = MilkType(
            name="Almond",
            category=MilkCategory.NON_DAIRY.value,
            display_order=7
        )
        db.session.add(milk_type)

        session = MilkOrderSession(
            session_date=date.today(),
            status=SessionStatus.NIGHT_FOH.value
        )
        db.session.add(session)
        db.session.commit()

        # Create first entry
        entry1 = MilkOrderEntry(
            session_id=session.id,
            milk_type_id=milk_type.id,
            foh_count=10
        )
        db.session.add(entry1)
        db.session.commit()

        # Try to create duplicate entry
        entry2 = MilkOrderEntry(
            session_id=session.id,
            milk_type_id=milk_type.id,
            foh_count=20
        )
        db.session.add(entry2)

        with pytest.raises(Exception):  # IntegrityError
            db.session.commit()
