"""
Tests for RTD&E session endpoints.

Tests cover:
- GET /api/rtde/sessions/active (check for active session)
- POST /api/rtde/sessions/start (start new or resume session)
- GET /api/rtde/sessions/:id (get session details)
- PUT /api/rtde/sessions/:id/count (update item count)
"""
import pytest
from datetime import datetime, timedelta

from app.models.rtde import RTDEItem, RTDECountSession, RTDESessionCount
from app.extensions import db


class TestGetActiveSession:
    """Tests for GET /api/rtde/sessions/active."""

    def test_get_active_session_none(self, client, staff_headers):
        """Test when no active session exists."""
        response = client.get('/api/rtde/sessions/active', headers=staff_headers)

        assert response.status_code == 200
        data = response.json
        assert data['session'] is None

    def test_get_active_session_exists(self, client, staff_headers, staff_user, app):
        """Test when active session exists."""
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

        # Add count for item 1
        count = RTDESessionCount(
            session_id=session.id,
            item_id=items[0].id,
            counted_quantity=5
        )
        db.session.add(count)
        db.session.commit()

        response = client.get('/api/rtde/sessions/active', headers=staff_headers)

        assert response.status_code == 200
        data = response.json
        assert data['session'] is not None
        assert data['session']['id'] == session.id
        assert 'started_at' in data['session']
        assert 'expires_at' in data['session']
        assert data['session']['items_counted'] == 1  # Only item 1 has count > 0
        assert data['session']['total_items'] == 2

    def test_get_active_session_expired(self, client, staff_headers, staff_user, app):
        """Test when session is expired (marks as expired)."""
        # Create expired session
        past_time = datetime.utcnow() - timedelta(minutes=35)
        session = RTDECountSession(
            user_id=staff_user.id,
            status='in_progress',
            started_at=past_time
        )
        session.expires_at = past_time + timedelta(minutes=30)  # Override auto-calculation

        db.session.add(session)
        db.session.commit()

        response = client.get('/api/rtde/sessions/active', headers=staff_headers)

        assert response.status_code == 200
        data = response.json
        assert data['session'] is None

        # Verify session marked as expired
        db.session.refresh(session)
        assert session.status == 'expired'


class TestStartSession:
    """Tests for POST /api/rtde/sessions/start."""

    def test_start_new_session(self, client, staff_headers, staff_user):
        """Test starting new session when none exists."""
        response = client.post(
            '/api/rtde/sessions/start',
            json={'action': 'new'},
            headers=staff_headers
        )

        assert response.status_code == 201
        data = response.json
        assert 'session_id' in data
        assert 'expires_at' in data

        # Verify session created
        session = RTDECountSession.query.get(data['session_id'])
        assert session is not None
        assert session.user_id == staff_user.id
        assert session.status == 'in_progress'

    def test_start_new_deletes_existing(self, client, staff_headers, staff_user, app):
        """Test starting new session deletes existing session."""
        # Create existing session
        old_session = RTDECountSession(user_id=staff_user.id, status='in_progress')
        db.session.add(old_session)
        db.session.commit()

        old_session_id = old_session.id

        response = client.post(
            '/api/rtde/sessions/start',
            json={'action': 'new'},
            headers=staff_headers
        )

        assert response.status_code == 201

        # Verify old session deleted
        deleted_session = RTDECountSession.query.get(old_session_id)
        assert deleted_session is None

    def test_resume_session_success(self, client, staff_headers, staff_user, app):
        """Test resuming existing session."""
        # Create session
        session = RTDECountSession(user_id=staff_user.id, status='in_progress')
        db.session.add(session)
        db.session.commit()

        response = client.post(
            '/api/rtde/sessions/start',
            json={'action': 'resume'},
            headers=staff_headers
        )

        assert response.status_code == 200
        data = response.json
        assert data['session_id'] == session.id

    def test_resume_session_none_exists(self, client, staff_headers):
        """Test resume when no session exists."""
        response = client.post(
            '/api/rtde/sessions/start',
            json={'action': 'resume'},
            headers=staff_headers
        )

        assert response.status_code == 400
        assert 'error' in response.json

    def test_resume_session_expired(self, client, staff_headers, staff_user, app):
        """Test resume when session is expired."""
        # Create expired session
        past_time = datetime.utcnow() - timedelta(minutes=35)
        session = RTDECountSession(
            user_id=staff_user.id,
            status='in_progress',
            started_at=past_time
        )
        session.expires_at = past_time + timedelta(minutes=30)

        db.session.add(session)
        db.session.commit()

        response = client.post(
            '/api/rtde/sessions/start',
            json={'action': 'resume'},
            headers=staff_headers
        )

        assert response.status_code == 400
        assert 'error' in response.json

    def test_start_session_default_action(self, client, staff_headers):
        """Test default action is 'new'."""
        response = client.post(
            '/api/rtde/sessions/start',
            json={},
            headers=staff_headers
        )

        assert response.status_code == 201


class TestGetSession:
    """Tests for GET /api/rtde/sessions/:id."""

    def test_get_session_success(self, client, staff_headers, staff_user, app):
        """Test getting session with items."""
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

        # Add counts for items 1 and 2
        counts = [
            RTDESessionCount(session_id=session.id, item_id=items[0].id, counted_quantity=5),
            RTDESessionCount(session_id=session.id, item_id=items[1].id, counted_quantity=10)
        ]
        db.session.add_all(counts)
        db.session.commit()

        response = client.get(
            f'/api/rtde/sessions/{session.id}',
            headers=staff_headers
        )

        assert response.status_code == 200
        data = response.json

        # Verify session data
        assert data['session']['id'] == session.id

        # Verify items data
        assert len(data['items']) == 3  # All active items included

        # Item 1: counted_quantity=5, par=8, need=3
        item1 = next(i for i in data['items'] if i['item_id'] == items[0].id)
        assert item1['name'] == "Egg & Cheese"
        assert item1['icon'] == "🥪"
        assert item1['par_level'] == 8
        assert item1['counted_quantity'] == 5
        assert item1['need_quantity'] == 3
        assert item1['is_pulled'] is False

        # Item 2: counted_quantity=10, par=12, need=2
        item2 = next(i for i in data['items'] if i['item_id'] == items[1].id)
        assert item2['counted_quantity'] == 10
        assert item2['need_quantity'] == 2

        # Item 3: no count, default to 0, need=6
        item3 = next(i for i in data['items'] if i['item_id'] == items[2].id)
        assert item3['counted_quantity'] == 0
        assert item3['need_quantity'] == 6

    def test_get_session_not_found(self, client, staff_headers):
        """Test getting non-existent session."""
        response = client.get(
            '/api/rtde/sessions/nonexistent-id',
            headers=staff_headers
        )

        assert response.status_code == 404

    def test_get_session_unauthorized(self, client, staff_headers, admin_user, app):
        """Test getting another user's session."""
        # Create session owned by admin
        session = RTDECountSession(user_id=admin_user.id, status='in_progress')
        db.session.add(session)
        db.session.commit()

        # Try to access with staff user
        response = client.get(
            f'/api/rtde/sessions/{session.id}',
            headers=staff_headers
        )

        assert response.status_code == 403
        assert 'error' in response.json

    def test_get_session_ordered_by_display_order(self, client, staff_headers, staff_user, app):
        """Test items returned in display_order."""
        # Create items with specific display order
        items = [
            RTDEItem(name="Third", icon="3️⃣", par_level=5, display_order=3),
            RTDEItem(name="First", icon="1️⃣", par_level=5, display_order=1),
            RTDEItem(name="Second", icon="2️⃣", par_level=5, display_order=2)
        ]
        db.session.add_all(items)
        db.session.commit()

        # Create session
        session = RTDECountSession(user_id=staff_user.id, status='in_progress')
        db.session.add(session)
        db.session.commit()

        response = client.get(
            f'/api/rtde/sessions/{session.id}',
            headers=staff_headers
        )

        assert response.status_code == 200
        data = response.json

        # Verify order
        assert data['items'][0]['name'] == "First"
        assert data['items'][1]['name'] == "Second"
        assert data['items'][2]['name'] == "Third"


class TestUpdateCount:
    """Tests for PUT /api/rtde/sessions/:id/count."""

    def test_update_count_create_new(self, client, staff_headers, staff_user, app):
        """Test creating new count for item."""
        # Create item and session
        item = RTDEItem(name="Test", icon="🧪", par_level=10, display_order=1)
        session = RTDECountSession(user_id=staff_user.id, status='in_progress')

        db.session.add_all([item, session])
        db.session.commit()

        response = client.put(
            f'/api/rtde/sessions/{session.id}/count',
            json={
                'item_id': item.id,
                'counted_quantity': 7
            },
            headers=staff_headers
        )

        assert response.status_code == 200

        # Verify count created
        count = RTDESessionCount.query.filter_by(
            session_id=session.id,
            item_id=item.id
        ).first()

        assert count is not None
        assert count.counted_quantity == 7

    def test_update_count_update_existing(self, client, staff_headers, staff_user, app):
        """Test updating existing count."""
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

        # Update count
        response = client.put(
            f'/api/rtde/sessions/{session.id}/count',
            json={
                'item_id': item.id,
                'counted_quantity': 8
            },
            headers=staff_headers
        )

        assert response.status_code == 200

        # Verify updated
        db.session.refresh(count)
        assert count.counted_quantity == 8

    def test_update_count_validation_missing_fields(self, client, staff_headers, staff_user, app):
        """Test validation for missing fields."""
        session = RTDECountSession(user_id=staff_user.id, status='in_progress')
        db.session.add(session)
        db.session.commit()

        # Missing item_id
        response = client.put(
            f'/api/rtde/sessions/{session.id}/count',
            json={'counted_quantity': 5},
            headers=staff_headers
        )
        assert response.status_code == 400

        # Missing counted_quantity
        response = client.put(
            f'/api/rtde/sessions/{session.id}/count',
            json={'item_id': 'some-id'},
            headers=staff_headers
        )
        assert response.status_code == 400

    def test_update_count_validation_negative(self, client, staff_headers, staff_user, app):
        """Test validation for negative quantity."""
        session = RTDECountSession(user_id=staff_user.id, status='in_progress')
        db.session.add(session)
        db.session.commit()

        response = client.put(
            f'/api/rtde/sessions/{session.id}/count',
            json={
                'item_id': 'some-id',
                'counted_quantity': -1
            },
            headers=staff_headers
        )

        assert response.status_code == 400
        assert 'non-negative' in response.json['error']

    def test_update_count_item_not_found(self, client, staff_headers, staff_user, app):
        """Test updating count for non-existent item."""
        session = RTDECountSession(user_id=staff_user.id, status='in_progress')
        db.session.add(session)
        db.session.commit()

        response = client.put(
            f'/api/rtde/sessions/{session.id}/count',
            json={
                'item_id': 'nonexistent-id',
                'counted_quantity': 5
            },
            headers=staff_headers
        )

        assert response.status_code == 404

    def test_update_count_session_not_found(self, client, staff_headers):
        """Test updating count for non-existent session."""
        response = client.put(
            '/api/rtde/sessions/nonexistent-id/count',
            json={
                'item_id': 'some-id',
                'counted_quantity': 5
            },
            headers=staff_headers
        )

        assert response.status_code == 404

    def test_update_count_unauthorized(self, client, staff_headers, admin_user, app):
        """Test updating count for another user's session."""
        # Create session owned by admin
        session = RTDECountSession(user_id=admin_user.id, status='in_progress')
        db.session.add(session)
        db.session.commit()

        # Try to update with staff user
        response = client.put(
            f'/api/rtde/sessions/{session.id}/count',
            json={
                'item_id': 'some-id',
                'counted_quantity': 5
            },
            headers=staff_headers
        )

        assert response.status_code == 403
