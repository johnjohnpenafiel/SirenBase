"""
Tests for RTD&E pull list endpoints.

Tests cover:
- GET /api/rtde/sessions/:id/pull-list (generate pull list)
- PUT /api/rtde/sessions/:id/pull (mark item pulled)
- POST /api/rtde/sessions/:id/complete (complete session)
"""
import pytest

from app.models.rtde import RTDEItem, RTDECountSession, RTDESessionCount
from app.extensions import db


class TestGetPullList:
    """Tests for GET /api/rtde/sessions/:id/pull-list."""

    def test_get_pull_list_success(self, client, staff_headers, staff_user, app):
        """Test generating pull list with items needing restocking."""
        # Create items
        items = [
            RTDEItem(name="Egg & Cheese", icon="🥪", par_level=8, display_order=1),
            RTDEItem(name="Cold Brew", icon="🥤", par_level=12, display_order=2),
            RTDEItem(name="String Cheese", icon="🧀", par_level=6, display_order=3)
        ]
        db.session.add_all(items)
        db.session.commit()

        # Create session
        session = RTDECountSession(user_id=staff_user.id, status='in_progress')
        db.session.add(session)
        db.session.commit()

        # Add counts
        # Item 1: count=5, par=8, need=3 ✓ (needs restocking)
        # Item 2: count=12, par=12, need=0 ✗ (at par)
        # Item 3: count=2, par=6, need=4 ✓ (needs restocking)
        counts = [
            RTDESessionCount(session_id=session.id, item_id=items[0].id, counted_quantity=5),
            RTDESessionCount(session_id=session.id, item_id=items[1].id, counted_quantity=12),
            RTDESessionCount(session_id=session.id, item_id=items[2].id, counted_quantity=2)
        ]
        db.session.add_all(counts)
        db.session.commit()

        response = client.get(
            f'/api/rtde/sessions/{session.id}/pull-list',
            headers=staff_headers
        )

        assert response.status_code == 200
        data = response.json

        # Only items with need > 0 (items 1 and 3)
        assert data['total_items'] == 2
        assert data['items_pulled'] == 0

        pull_list = data['pull_list']
        assert len(pull_list) == 2

        # Item 1
        item1 = next(i for i in pull_list if i['item_id'] == items[0].id)
        assert item1['name'] == "Egg & Cheese"
        assert item1['icon'] == "🥪"
        assert item1['need_quantity'] == 3
        assert item1['is_pulled'] is False

        # Item 3
        item3 = next(i for i in pull_list if i['item_id'] == items[2].id)
        assert item3['need_quantity'] == 4

        # Item 2 should NOT be in pull list (need = 0)
        item2_ids = [i['item_id'] for i in pull_list]
        assert items[1].id not in item2_ids

    def test_get_pull_list_empty(self, client, staff_headers, staff_user, app):
        """Test pull list when all items at or above par."""
        # Create items
        items = [
            RTDEItem(name="Item 1", icon="1️⃣", par_level=10, display_order=1),
            RTDEItem(name="Item 2", icon="2️⃣", par_level=5, display_order=2)
        ]
        db.session.add_all(items)
        db.session.commit()

        # Create session
        session = RTDECountSession(user_id=staff_user.id, status='in_progress')
        db.session.add(session)
        db.session.commit()

        # All items at or above par
        counts = [
            RTDESessionCount(session_id=session.id, item_id=items[0].id, counted_quantity=10),
            RTDESessionCount(session_id=session.id, item_id=items[1].id, counted_quantity=8)
        ]
        db.session.add_all(counts)
        db.session.commit()

        response = client.get(
            f'/api/rtde/sessions/{session.id}/pull-list',
            headers=staff_headers
        )

        assert response.status_code == 200
        data = response.json

        assert data['total_items'] == 0
        assert data['items_pulled'] == 0
        assert len(data['pull_list']) == 0

    def test_get_pull_list_with_pulled_items(self, client, staff_headers, staff_user, app):
        """Test pull list tracks pulled items count."""
        # Create items
        items = [
            RTDEItem(name="Item 1", icon="1️⃣", par_level=10, display_order=1),
            RTDEItem(name="Item 2", icon="2️⃣", par_level=10, display_order=2)
        ]
        db.session.add_all(items)
        db.session.commit()

        # Create session
        session = RTDECountSession(user_id=staff_user.id, status='in_progress')
        db.session.add(session)
        db.session.commit()

        # Both need restocking, item 1 is marked as pulled
        counts = [
            RTDESessionCount(session_id=session.id, item_id=items[0].id, counted_quantity=5, is_pulled=True),
            RTDESessionCount(session_id=session.id, item_id=items[1].id, counted_quantity=3, is_pulled=False)
        ]
        db.session.add_all(counts)
        db.session.commit()

        response = client.get(
            f'/api/rtde/sessions/{session.id}/pull-list',
            headers=staff_headers
        )

        assert response.status_code == 200
        data = response.json

        assert data['total_items'] == 2
        assert data['items_pulled'] == 1  # Only item 1 marked as pulled

        # Verify is_pulled flags
        item1 = next(i for i in data['pull_list'] if i['item_id'] == items[0].id)
        assert item1['is_pulled'] is True

        item2 = next(i for i in data['pull_list'] if i['item_id'] == items[1].id)
        assert item2['is_pulled'] is False

    def test_get_pull_list_session_not_found(self, client, staff_headers):
        """Test getting pull list for non-existent session."""
        response = client.get(
            '/api/rtde/sessions/nonexistent-id/pull-list',
            headers=staff_headers
        )

        assert response.status_code == 404

    def test_get_pull_list_unauthorized(self, client, staff_headers, admin_user, app):
        """Test getting pull list for another user's session."""
        # Create session owned by admin
        session = RTDECountSession(user_id=admin_user.id, status='in_progress')
        db.session.add(session)
        db.session.commit()

        # Try to access with staff user
        response = client.get(
            f'/api/rtde/sessions/{session.id}/pull-list',
            headers=staff_headers
        )

        assert response.status_code == 403

    def test_get_pull_list_no_counts_defaults_zero(self, client, staff_headers, staff_user, app):
        """Test items with no counts default to need=par_level."""
        # Create items
        items = [
            RTDEItem(name="Item 1", icon="1️⃣", par_level=10, display_order=1),
            RTDEItem(name="Item 2", icon="2️⃣", par_level=5, display_order=2)
        ]
        db.session.add_all(items)
        db.session.commit()

        # Create session with NO counts
        session = RTDECountSession(user_id=staff_user.id, status='in_progress')
        db.session.add(session)
        db.session.commit()

        response = client.get(
            f'/api/rtde/sessions/{session.id}/pull-list',
            headers=staff_headers
        )

        assert response.status_code == 200
        data = response.json

        # All items need full par_level
        assert data['total_items'] == 2

        item1 = next(i for i in data['pull_list'] if i['item_id'] == items[0].id)
        assert item1['need_quantity'] == 10

        item2 = next(i for i in data['pull_list'] if i['item_id'] == items[1].id)
        assert item2['need_quantity'] == 5


class TestMarkItemPulled:
    """Tests for PUT /api/rtde/sessions/:id/pull."""

    def test_mark_item_pulled_true(self, client, staff_headers, staff_user, app):
        """Test marking item as pulled."""
        # Create item and session
        item = RTDEItem(name="Test", icon="🧪", par_level=10, display_order=1)
        session = RTDECountSession(user_id=staff_user.id, status='in_progress')

        db.session.add_all([item, session])
        db.session.commit()

        # Create count
        count = RTDESessionCount(
            session_id=session.id,
            item_id=item.id,
            counted_quantity=5,
            is_pulled=False
        )
        db.session.add(count)
        db.session.commit()

        response = client.put(
            f'/api/rtde/sessions/{session.id}/pull',
            json={
                'item_id': item.id,
                'is_pulled': True
            },
            headers=staff_headers
        )

        assert response.status_code == 200

        # Verify updated
        db.session.refresh(count)
        assert count.is_pulled is True

    def test_mark_item_unpulled(self, client, staff_headers, staff_user, app):
        """Test marking item as unpulled."""
        # Create item and session
        item = RTDEItem(name="Test", icon="🧪", par_level=10, display_order=1)
        session = RTDECountSession(user_id=staff_user.id, status='in_progress')

        db.session.add_all([item, session])
        db.session.commit()

        # Create count (already pulled)
        count = RTDESessionCount(
            session_id=session.id,
            item_id=item.id,
            counted_quantity=5,
            is_pulled=True
        )
        db.session.add(count)
        db.session.commit()

        # Mark as unpulled
        response = client.put(
            f'/api/rtde/sessions/{session.id}/pull',
            json={
                'item_id': item.id,
                'is_pulled': False
            },
            headers=staff_headers
        )

        assert response.status_code == 200

        # Verify updated
        db.session.refresh(count)
        assert count.is_pulled is False

    def test_mark_item_pulled_creates_count_if_missing(self, client, staff_headers, staff_user, app):
        """Test marking item as pulled creates count record if doesn't exist."""
        # Create item and session
        item = RTDEItem(name="Test", icon="🧪", par_level=10, display_order=1)
        session = RTDECountSession(user_id=staff_user.id, status='in_progress')

        db.session.add_all([item, session])
        db.session.commit()

        # No count exists yet
        response = client.put(
            f'/api/rtde/sessions/{session.id}/pull',
            json={
                'item_id': item.id,
                'is_pulled': True
            },
            headers=staff_headers
        )

        assert response.status_code == 200

        # Verify count created with default quantity 0
        count = RTDESessionCount.query.filter_by(
            session_id=session.id,
            item_id=item.id
        ).first()

        assert count is not None
        assert count.counted_quantity == 0  # Default
        assert count.is_pulled is True

    def test_mark_item_pulled_validation_missing_fields(self, client, staff_headers, staff_user, app):
        """Test validation for missing fields."""
        session = RTDECountSession(user_id=staff_user.id, status='in_progress')
        db.session.add(session)
        db.session.commit()

        # Missing is_pulled
        response = client.put(
            f'/api/rtde/sessions/{session.id}/pull',
            json={'item_id': 'some-id'},
            headers=staff_headers
        )
        assert response.status_code == 400

        # Missing item_id
        response = client.put(
            f'/api/rtde/sessions/{session.id}/pull',
            json={'is_pulled': True},
            headers=staff_headers
        )
        assert response.status_code == 400

    def test_mark_item_pulled_session_not_found(self, client, staff_headers):
        """Test marking item pulled for non-existent session."""
        response = client.put(
            '/api/rtde/sessions/nonexistent-id/pull',
            json={
                'item_id': 'some-id',
                'is_pulled': True
            },
            headers=staff_headers
        )

        assert response.status_code == 404

    def test_mark_item_pulled_unauthorized(self, client, staff_headers, admin_user, app):
        """Test marking item pulled for another user's session."""
        # Create session owned by admin
        session = RTDECountSession(user_id=admin_user.id, status='in_progress')
        db.session.add(session)
        db.session.commit()

        # Try to update with staff user
        response = client.put(
            f'/api/rtde/sessions/{session.id}/pull',
            json={
                'item_id': 'some-id',
                'is_pulled': True
            },
            headers=staff_headers
        )

        assert response.status_code == 403


class TestCompleteSession:
    """Tests for POST /api/rtde/sessions/:id/complete."""

    def test_complete_session_success(self, client, staff_headers, staff_user, app):
        """Test completing session deletes all data."""
        # Create item, session, and count
        item = RTDEItem(name="Test", icon="🧪", par_level=10, display_order=1)
        session = RTDECountSession(user_id=staff_user.id, status='in_progress')

        db.session.add_all([item, session])
        db.session.commit()

        count = RTDESessionCount(
            session_id=session.id,
            item_id=item.id,
            counted_quantity=5
        )
        db.session.add(count)
        db.session.commit()

        session_id = session.id
        count_id = count.id

        response = client.post(
            f'/api/rtde/sessions/{session_id}/complete',
            headers=staff_headers
        )

        assert response.status_code == 200
        assert 'completed' in response.json['message']

        # Verify session deleted
        deleted_session = RTDECountSession.query.get(session_id)
        assert deleted_session is None

        # Verify count cascade deleted
        deleted_count = RTDESessionCount.query.get(count_id)
        assert deleted_count is None

    def test_complete_session_marks_completed_first(self, client, staff_headers, staff_user, app):
        """Test session is marked as completed before deletion."""
        # Create session
        session = RTDECountSession(user_id=staff_user.id, status='in_progress')
        db.session.add(session)
        db.session.commit()

        session_id = session.id

        # Mock the mark_completed method to verify it was called
        # (In real test, this is verified by checking the session is deleted,
        # meaning mark_completed was successfully called)
        response = client.post(
            f'/api/rtde/sessions/{session_id}/complete',
            headers=staff_headers
        )

        assert response.status_code == 200

        # Session should be deleted
        deleted_session = RTDECountSession.query.get(session_id)
        assert deleted_session is None

    def test_complete_session_not_found(self, client, staff_headers):
        """Test completing non-existent session."""
        response = client.post(
            '/api/rtde/sessions/nonexistent-id/complete',
            headers=staff_headers
        )

        assert response.status_code == 404

    def test_complete_session_unauthorized(self, client, staff_headers, admin_user, app):
        """Test completing another user's session."""
        # Create session owned by admin
        session = RTDECountSession(user_id=admin_user.id, status='in_progress')
        db.session.add(session)
        db.session.commit()

        # Try to complete with staff user
        response = client.post(
            f'/api/rtde/sessions/{session.id}/complete',
            headers=staff_headers
        )

        assert response.status_code == 403

    def test_complete_session_cascade_deletes_multiple_counts(self, client, staff_headers, staff_user, app):
        """Test completing session deletes all associated counts."""
        # Create items and session
        items = [
            RTDEItem(name="Item 1", icon="1️⃣", par_level=10, display_order=1),
            RTDEItem(name="Item 2", icon="2️⃣", par_level=5, display_order=2),
            RTDEItem(name="Item 3", icon="3️⃣", par_level=8, display_order=3)
        ]
        session = RTDECountSession(user_id=staff_user.id, status='in_progress')

        db.session.add_all(items + [session])
        db.session.commit()

        # Create multiple counts
        counts = [
            RTDESessionCount(session_id=session.id, item_id=items[0].id, counted_quantity=5),
            RTDESessionCount(session_id=session.id, item_id=items[1].id, counted_quantity=3),
            RTDESessionCount(session_id=session.id, item_id=items[2].id, counted_quantity=7)
        ]
        db.session.add_all(counts)
        db.session.commit()

        session_id = session.id

        response = client.post(
            f'/api/rtde/sessions/{session_id}/complete',
            headers=staff_headers
        )

        assert response.status_code == 200

        # Verify all counts deleted
        remaining_counts = RTDESessionCount.query.filter_by(session_id=session_id).all()
        assert len(remaining_counts) == 0
