"""
Tests for Milk Order session endpoints (workflow management).

Tests cover:
- GET /api/milk-order/sessions/today
- POST /api/milk-order/sessions/start
- GET /api/milk-order/sessions/:id
- PUT /api/milk-order/sessions/:id/night-foh
- PUT /api/milk-order/sessions/:id/night-boh
- PUT /api/milk-order/sessions/:id/morning
- PUT /api/milk-order/sessions/:id/on-order
- GET /api/milk-order/sessions/:id/summary
- GET /api/milk-order/history
"""
import pytest
from datetime import date

from app.models.milk_order import (
    MilkType,
    MilkOrderParLevel,
    MilkOrderSession,
    MilkOrderEntry,
    MilkCategory,
    SessionStatus,
    MorningMethod,
)
from app.extensions import db


class TestGetTodaySession:
    """Tests for GET /api/milk-order/sessions/today."""

    def test_get_today_session_none(self, client, staff_headers, app):
        """Test getting today's session when none exists."""
        response = client.get('/api/milk-order/sessions/today', headers=staff_headers)

        assert response.status_code == 200
        assert response.json['session'] is None

    def test_get_today_session_exists(self, client, staff_headers, app):
        """Test getting today's session when it exists."""
        session = MilkOrderSession(
            session_date=date.today(),
            status=SessionStatus.NIGHT_FOH.value
        )
        db.session.add(session)
        db.session.commit()

        response = client.get('/api/milk-order/sessions/today', headers=staff_headers)

        assert response.status_code == 200
        assert response.json['session'] is not None
        assert response.json['session']['status'] == 'night_foh'

    def test_get_today_session_unauthenticated(self, client):
        """Test unauthenticated request is rejected."""
        response = client.get('/api/milk-order/sessions/today')

        assert response.status_code == 401


class TestStartSession:
    """Tests for POST /api/milk-order/sessions/start."""

    def test_start_session_success(self, client, staff_headers, app):
        """Test starting a new session."""
        # Create milk types
        types = [
            MilkType(name="Whole", category=MilkCategory.DAIRY.value, display_order=1),
            MilkType(name="2%", category=MilkCategory.DAIRY.value, display_order=2)
        ]
        db.session.add_all(types)
        db.session.commit()

        response = client.post('/api/milk-order/sessions/start', headers=staff_headers)

        assert response.status_code == 201
        data = response.json
        assert data['message'] == 'Session started'
        assert data['session']['status'] == 'night_foh'

        # Verify entries were created
        session = MilkOrderSession.query.get(data['session']['id'])
        assert len(session.entries) == 2

    def test_start_session_already_exists(self, client, staff_headers, app):
        """Test starting session when one already exists for today."""
        existing = MilkOrderSession(
            session_date=date.today(),
            status=SessionStatus.NIGHT_FOH.value
        )
        db.session.add(existing)
        db.session.commit()

        response = client.post('/api/milk-order/sessions/start', headers=staff_headers)

        assert response.status_code == 400
        assert 'already exists' in response.json['error']

    def test_start_session_creates_entries_for_active_types_only(self, client, staff_headers, app):
        """Test session only creates entries for active milk types."""
        active = MilkType(name="Active", category=MilkCategory.DAIRY.value, display_order=1)
        inactive = MilkType(name="Inactive", category=MilkCategory.DAIRY.value, display_order=2, active=False)
        db.session.add_all([active, inactive])
        db.session.commit()

        response = client.post('/api/milk-order/sessions/start', headers=staff_headers)

        assert response.status_code == 201
        session = MilkOrderSession.query.get(response.json['session']['id'])
        assert len(session.entries) == 1  # Only active type


class TestGetSession:
    """Tests for GET /api/milk-order/sessions/:id."""

    def test_get_session_success(self, client, staff_headers, app):
        """Test getting session details with entries."""
        # Create milk type
        milk_type = MilkType(name="Whole", category=MilkCategory.DAIRY.value, display_order=1)
        db.session.add(milk_type)
        db.session.commit()

        # Create session with entry
        session = MilkOrderSession(
            session_date=date.today(),
            status=SessionStatus.NIGHT_FOH.value
        )
        db.session.add(session)
        db.session.commit()

        entry = MilkOrderEntry(
            session_id=session.id,
            milk_type_id=milk_type.id,
            foh_count=10
        )
        db.session.add(entry)
        db.session.commit()

        response = client.get(f'/api/milk-order/sessions/{session.id}', headers=staff_headers)

        assert response.status_code == 200
        data = response.json
        assert 'session' in data
        assert 'entries' in data
        assert len(data['entries']) == 1
        assert data['entries'][0]['foh_count'] == 10

    def test_get_session_not_found(self, client, staff_headers):
        """Test getting non-existent session."""
        response = client.get('/api/milk-order/sessions/nonexistent-id', headers=staff_headers)

        assert response.status_code == 404


class TestSaveNightFOH:
    """Tests for PUT /api/milk-order/sessions/:id/night-foh."""

    def test_save_night_foh_success(self, client, staff_headers, app):
        """Test saving FOH counts."""
        # Create milk type and session
        milk_type = MilkType(name="Whole", category=MilkCategory.DAIRY.value, display_order=1)
        db.session.add(milk_type)

        session = MilkOrderSession(
            session_date=date.today(),
            status=SessionStatus.NIGHT_FOH.value
        )
        db.session.add(session)
        db.session.commit()

        entry = MilkOrderEntry(session_id=session.id, milk_type_id=milk_type.id)
        db.session.add(entry)
        db.session.commit()

        response = client.put(
            f'/api/milk-order/sessions/{session.id}/night-foh',
            json={
                'counts': [
                    {'milk_type_id': milk_type.id, 'foh_count': 15}
                ]
            },
            headers=staff_headers
        )

        assert response.status_code == 200
        data = response.json
        assert data['message'] == 'FOH counts saved'
        assert data['session']['status'] == 'night_boh'  # Advances status

    def test_save_night_foh_wrong_status(self, client, staff_headers, app):
        """Test cannot save FOH if not in night_foh status."""
        session = MilkOrderSession(
            session_date=date.today(),
            status=SessionStatus.NIGHT_BOH.value  # Wrong status
        )
        db.session.add(session)
        db.session.commit()

        response = client.put(
            f'/api/milk-order/sessions/{session.id}/night-foh',
            json={'counts': []},
            headers=staff_headers
        )

        assert response.status_code == 400
        assert 'status' in response.json['error']

    def test_save_night_foh_validation_error(self, client, staff_headers, app):
        """Test validation error for missing counts array."""
        session = MilkOrderSession(
            session_date=date.today(),
            status=SessionStatus.NIGHT_FOH.value
        )
        db.session.add(session)
        db.session.commit()

        response = client.put(
            f'/api/milk-order/sessions/{session.id}/night-foh',
            json={},
            headers=staff_headers
        )

        assert response.status_code == 400
        assert 'counts' in response.json['error']

    def test_save_night_foh_negative_count(self, client, staff_headers, app):
        """Test foh_count must be non-negative."""
        milk_type = MilkType(name="Whole", category=MilkCategory.DAIRY.value, display_order=1)
        db.session.add(milk_type)

        session = MilkOrderSession(
            session_date=date.today(),
            status=SessionStatus.NIGHT_FOH.value
        )
        db.session.add(session)
        db.session.commit()

        response = client.put(
            f'/api/milk-order/sessions/{session.id}/night-foh',
            json={
                'counts': [
                    {'milk_type_id': milk_type.id, 'foh_count': -5}
                ]
            },
            headers=staff_headers
        )

        assert response.status_code == 400
        assert 'non-negative' in response.json['error']


class TestSaveNightBOH:
    """Tests for PUT /api/milk-order/sessions/:id/night-boh."""

    def test_save_night_boh_success(self, client, staff_headers, app):
        """Test saving BOH counts."""
        milk_type = MilkType(name="Whole", category=MilkCategory.DAIRY.value, display_order=1)
        db.session.add(milk_type)

        session = MilkOrderSession(
            session_date=date.today(),
            status=SessionStatus.NIGHT_BOH.value  # Must be in BOH status
        )
        db.session.add(session)
        db.session.commit()

        entry = MilkOrderEntry(session_id=session.id, milk_type_id=milk_type.id, foh_count=10)
        db.session.add(entry)
        db.session.commit()

        response = client.put(
            f'/api/milk-order/sessions/{session.id}/night-boh',
            json={
                'counts': [
                    {'milk_type_id': milk_type.id, 'boh_count': 20}
                ]
            },
            headers=staff_headers
        )

        assert response.status_code == 200
        data = response.json
        assert 'night count complete' in data['message']
        assert data['session']['status'] == 'morning'  # Advances status

    def test_save_night_boh_wrong_status(self, client, staff_headers, app):
        """Test cannot save BOH if not in night_boh status."""
        session = MilkOrderSession(
            session_date=date.today(),
            status=SessionStatus.NIGHT_FOH.value  # Wrong status
        )
        db.session.add(session)
        db.session.commit()

        response = client.put(
            f'/api/milk-order/sessions/{session.id}/night-boh',
            json={'counts': []},
            headers=staff_headers
        )

        assert response.status_code == 400
        assert 'status' in response.json['error']


class TestSaveMorningCount:
    """Tests for PUT /api/milk-order/sessions/:id/morning."""

    def test_save_morning_count_boh_method(self, client, staff_headers, app):
        """Test saving morning count with BOH count method."""
        milk_type = MilkType(name="Whole", category=MilkCategory.DAIRY.value, display_order=1)
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
            boh_count=20
        )
        db.session.add(entry)
        db.session.commit()

        response = client.put(
            f'/api/milk-order/sessions/{session.id}/morning',
            json={
                'counts': [
                    {
                        'milk_type_id': milk_type.id,
                        'method': 'boh_count',
                        'current_boh': 30  # Night BOH was 20, so delivered = 10
                    }
                ]
            },
            headers=staff_headers
        )

        assert response.status_code == 200
        data = response.json
        assert 'continue to on order' in data['message']
        assert data['session']['status'] == 'on_order'

        # Verify delivered was calculated
        db.session.refresh(entry)
        assert entry.delivered == 10

    def test_save_morning_count_direct_method(self, client, staff_headers, app):
        """Test saving morning count with direct delivered method."""
        milk_type = MilkType(name="Oat", category=MilkCategory.NON_DAIRY.value, display_order=1)
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
            boh_count=10
        )
        db.session.add(entry)
        db.session.commit()

        response = client.put(
            f'/api/milk-order/sessions/{session.id}/morning',
            json={
                'counts': [
                    {
                        'milk_type_id': milk_type.id,
                        'method': 'direct_delivered',
                        'delivered': 8
                    }
                ]
            },
            headers=staff_headers
        )

        assert response.status_code == 200
        data = response.json
        assert data['session']['status'] == 'on_order'

        # Verify delivered was set directly
        db.session.refresh(entry)
        assert entry.delivered == 8
        assert entry.current_boh is None

    def test_save_morning_count_wrong_status(self, client, staff_headers, app):
        """Test cannot save morning count if not in morning status."""
        session = MilkOrderSession(
            session_date=date.today(),
            status=SessionStatus.NIGHT_BOH.value  # Wrong status
        )
        db.session.add(session)
        db.session.commit()

        response = client.put(
            f'/api/milk-order/sessions/{session.id}/morning',
            json={'counts': []},
            headers=staff_headers
        )

        assert response.status_code == 400
        assert 'status' in response.json['error']

    def test_save_morning_count_invalid_method(self, client, staff_headers, app):
        """Test invalid morning method."""
        milk_type = MilkType(name="Whole", category=MilkCategory.DAIRY.value, display_order=1)
        db.session.add(milk_type)

        session = MilkOrderSession(
            session_date=date.today(),
            status=SessionStatus.MORNING.value
        )
        db.session.add(session)
        db.session.commit()

        response = client.put(
            f'/api/milk-order/sessions/{session.id}/morning',
            json={
                'counts': [
                    {
                        'milk_type_id': milk_type.id,
                        'method': 'invalid_method'
                    }
                ]
            },
            headers=staff_headers
        )

        assert response.status_code == 400
        assert 'Invalid method' in response.json['error']

    def test_save_morning_count_missing_current_boh(self, client, staff_headers, app):
        """Test boh_count method requires current_boh."""
        milk_type = MilkType(name="Whole", category=MilkCategory.DAIRY.value, display_order=1)
        db.session.add(milk_type)

        session = MilkOrderSession(
            session_date=date.today(),
            status=SessionStatus.MORNING.value
        )
        db.session.add(session)
        db.session.commit()

        # Create entry (as would happen in real workflow)
        entry = MilkOrderEntry(
            session_id=session.id,
            milk_type_id=milk_type.id,
            foh_count=10,
            boh_count=20
        )
        db.session.add(entry)
        db.session.commit()

        response = client.put(
            f'/api/milk-order/sessions/{session.id}/morning',
            json={
                'counts': [
                    {
                        'milk_type_id': milk_type.id,
                        'method': 'boh_count'
                        # Missing current_boh
                    }
                ]
            },
            headers=staff_headers
        )

        assert response.status_code == 400
        assert 'current_boh required' in response.json['error']


class TestSaveOnOrder:
    """Tests for PUT /api/milk-order/sessions/:id/on-order."""

    def test_save_on_order_success(self, client, staff_headers, app):
        """Test saving on order quantities."""
        milk_type = MilkType(name="Whole", category=MilkCategory.DAIRY.value, display_order=1)
        db.session.add(milk_type)

        session = MilkOrderSession(
            session_date=date.today(),
            status=SessionStatus.ON_ORDER.value
        )
        db.session.add(session)
        db.session.commit()

        entry = MilkOrderEntry(
            session_id=session.id,
            milk_type_id=milk_type.id,
            foh_count=10,
            boh_count=20,
            delivered=5
        )
        db.session.add(entry)
        db.session.commit()

        response = client.put(
            f'/api/milk-order/sessions/{session.id}/on-order',
            json={
                'on_orders': [
                    {'milk_type_id': milk_type.id, 'on_order': 3}
                ]
            },
            headers=staff_headers
        )

        assert response.status_code == 200
        data = response.json
        assert 'session complete' in data['message']
        assert data['session']['status'] == 'completed'

        # Verify on_order was saved
        db.session.refresh(entry)
        assert entry.on_order == 3

    def test_save_on_order_zero_value(self, client, staff_headers, app):
        """Test saving on_order with zero value (default case)."""
        milk_type = MilkType(name="Whole", category=MilkCategory.DAIRY.value, display_order=1)
        db.session.add(milk_type)

        session = MilkOrderSession(
            session_date=date.today(),
            status=SessionStatus.ON_ORDER.value
        )
        db.session.add(session)
        db.session.commit()

        entry = MilkOrderEntry(
            session_id=session.id,
            milk_type_id=milk_type.id,
            foh_count=10,
            boh_count=20,
            delivered=5
        )
        db.session.add(entry)
        db.session.commit()

        response = client.put(
            f'/api/milk-order/sessions/{session.id}/on-order',
            json={
                'on_orders': [
                    {'milk_type_id': milk_type.id, 'on_order': 0}
                ]
            },
            headers=staff_headers
        )

        assert response.status_code == 200
        db.session.refresh(entry)
        assert entry.on_order == 0

    def test_save_on_order_wrong_status(self, client, staff_headers, app):
        """Test cannot save on_order if not in on_order status."""
        session = MilkOrderSession(
            session_date=date.today(),
            status=SessionStatus.MORNING.value  # Wrong status
        )
        db.session.add(session)
        db.session.commit()

        response = client.put(
            f'/api/milk-order/sessions/{session.id}/on-order',
            json={'on_orders': []},
            headers=staff_headers
        )

        assert response.status_code == 400
        assert 'status' in response.json['error']

    def test_save_on_order_validation_errors(self, client, staff_headers, app):
        """Test validation error for missing on_orders array."""
        session = MilkOrderSession(
            session_date=date.today(),
            status=SessionStatus.ON_ORDER.value
        )
        db.session.add(session)
        db.session.commit()

        response = client.put(
            f'/api/milk-order/sessions/{session.id}/on-order',
            json={},
            headers=staff_headers
        )

        assert response.status_code == 400
        assert 'on_orders' in response.json['error']

    def test_save_on_order_negative_value_rejected(self, client, staff_headers, app):
        """Test on_order must be non-negative."""
        milk_type = MilkType(name="Whole", category=MilkCategory.DAIRY.value, display_order=1)
        db.session.add(milk_type)

        session = MilkOrderSession(
            session_date=date.today(),
            status=SessionStatus.ON_ORDER.value
        )
        db.session.add(session)
        db.session.commit()

        response = client.put(
            f'/api/milk-order/sessions/{session.id}/on-order',
            json={
                'on_orders': [
                    {'milk_type_id': milk_type.id, 'on_order': -5}
                ]
            },
            headers=staff_headers
        )

        assert response.status_code == 400
        assert 'non-negative' in response.json['error']


class TestGetSessionSummary:
    """Tests for GET /api/milk-order/sessions/:id/summary."""

    def test_get_summary_success(self, client, staff_headers, app):
        """Test getting session summary with calculations."""
        # Create milk type with par level
        milk_type = MilkType(name="Whole", category=MilkCategory.DAIRY.value, display_order=1)
        db.session.add(milk_type)
        db.session.commit()

        par = MilkOrderParLevel(milk_type_id=milk_type.id, par_value=60)
        db.session.add(par)

        # Create session
        session = MilkOrderSession(
            session_date=date.today(),
            status=SessionStatus.COMPLETED.value
        )
        db.session.add(session)
        db.session.commit()

        # Create entry with all counts
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

        response = client.get(
            f'/api/milk-order/sessions/{session.id}/summary',
            headers=staff_headers
        )

        assert response.status_code == 200
        data = response.json
        assert 'summary' in data
        assert 'totals' in data
        assert len(data['summary']) == 1

        summary_item = data['summary'][0]
        assert summary_item['milk_type'] == 'Whole'
        assert summary_item['foh'] == 15
        assert summary_item['boh'] == 20
        assert summary_item['delivered'] == 10
        assert summary_item['total'] == 45  # 15 + 20 + 10
        assert summary_item['par'] == 60
        assert summary_item['on_order'] == 0  # Default when not set
        assert summary_item['order'] == 15  # 60 - 45 - 0

    def test_get_summary_with_on_order(self, client, staff_headers, app):
        """Test summary calculation includes on_order in order formula."""
        milk_type = MilkType(name="Whole", category=MilkCategory.DAIRY.value, display_order=1)
        db.session.add(milk_type)
        db.session.commit()

        par = MilkOrderParLevel(milk_type_id=milk_type.id, par_value=60)
        db.session.add(par)

        session = MilkOrderSession(
            session_date=date.today(),
            status=SessionStatus.COMPLETED.value
        )
        db.session.add(session)
        db.session.commit()

        # Create entry with on_order value
        entry = MilkOrderEntry(
            session_id=session.id,
            milk_type_id=milk_type.id,
            foh_count=10,
            boh_count=15,
            morning_method=MorningMethod.DIRECT_DELIVERED.value,
            delivered=5,
            on_order=10  # Already have 10 on order
        )
        db.session.add(entry)
        db.session.commit()

        response = client.get(
            f'/api/milk-order/sessions/{session.id}/summary',
            headers=staff_headers
        )

        assert response.status_code == 200
        summary_item = response.json['summary'][0]

        # Total = 10 + 15 + 5 = 30
        assert summary_item['total'] == 30
        assert summary_item['on_order'] == 10
        assert summary_item['par'] == 60
        # Order = Par - Total - OnOrder = 60 - 30 - 10 = 20
        assert summary_item['order'] == 20

    def test_get_summary_order_cannot_be_negative(self, client, staff_headers, app):
        """Test order amount is 0 when total exceeds par."""
        milk_type = MilkType(name="Whole", category=MilkCategory.DAIRY.value, display_order=1)
        db.session.add(milk_type)
        db.session.commit()

        par = MilkOrderParLevel(milk_type_id=milk_type.id, par_value=30)  # Low par
        db.session.add(par)

        session = MilkOrderSession(
            session_date=date.today(),
            status=SessionStatus.COMPLETED.value
        )
        db.session.add(session)
        db.session.commit()

        entry = MilkOrderEntry(
            session_id=session.id,
            milk_type_id=milk_type.id,
            foh_count=20,
            boh_count=20,
            delivered=10  # Total = 50 > Par 30
        )
        db.session.add(entry)
        db.session.commit()

        response = client.get(
            f'/api/milk-order/sessions/{session.id}/summary',
            headers=staff_headers
        )

        assert response.status_code == 200
        data = response.json
        assert data['summary'][0]['order'] == 0  # Not negative

    def test_get_summary_totals(self, client, staff_headers, app):
        """Test summary totals are calculated correctly."""
        types = [
            MilkType(name="Whole", category=MilkCategory.DAIRY.value, display_order=1),
            MilkType(name="2%", category=MilkCategory.DAIRY.value, display_order=2)
        ]
        db.session.add_all(types)
        db.session.commit()

        for mt in types:
            par = MilkOrderParLevel(milk_type_id=mt.id, par_value=50)
            db.session.add(par)

        session = MilkOrderSession(
            session_date=date.today(),
            status=SessionStatus.COMPLETED.value
        )
        db.session.add(session)
        db.session.commit()

        entries = [
            MilkOrderEntry(
                session_id=session.id,
                milk_type_id=types[0].id,
                foh_count=10,
                boh_count=15,
                morning_method=MorningMethod.DIRECT_DELIVERED.value,
                delivered=5
            ),
            MilkOrderEntry(
                session_id=session.id,
                milk_type_id=types[1].id,
                foh_count=12,
                boh_count=18,
                morning_method=MorningMethod.DIRECT_DELIVERED.value,
                delivered=8
            )
        ]
        db.session.add_all(entries)
        db.session.commit()

        response = client.get(
            f'/api/milk-order/sessions/{session.id}/summary',
            headers=staff_headers
        )

        assert response.status_code == 200
        totals = response.json['totals']
        assert totals['total_foh'] == 22  # 10 + 12
        assert totals['total_boh'] == 33  # 15 + 18
        assert totals['total_delivered'] == 13  # 5 + 8
        assert totals['total_inventory'] == 68  # 30 + 38

    def test_get_summary_not_found(self, client, staff_headers):
        """Test getting summary for non-existent session."""
        response = client.get(
            '/api/milk-order/sessions/nonexistent-id/summary',
            headers=staff_headers
        )

        assert response.status_code == 404


class TestGetHistory:
    """Tests for GET /api/milk-order/history."""

    def test_get_history_success(self, client, staff_headers, app):
        """Test getting session history."""
        from datetime import timedelta

        sessions = []
        for i in range(3):
            s = MilkOrderSession(
                session_date=date.today() - timedelta(days=i),
                status=SessionStatus.COMPLETED.value
            )
            db.session.add(s)
            sessions.append(s)
        db.session.commit()

        response = client.get('/api/milk-order/history', headers=staff_headers)

        assert response.status_code == 200
        data = response.json
        assert 'sessions' in data
        assert data['total'] == 3
        # Should be ordered by date descending (most recent first)
        assert len(data['sessions']) == 3

    def test_get_history_pagination(self, client, staff_headers, app):
        """Test history pagination."""
        from datetime import timedelta

        for i in range(5):
            s = MilkOrderSession(
                session_date=date.today() - timedelta(days=i),
                status=SessionStatus.COMPLETED.value
            )
            db.session.add(s)
        db.session.commit()

        response = client.get(
            '/api/milk-order/history?limit=2&offset=2',
            headers=staff_headers
        )

        assert response.status_code == 200
        data = response.json
        assert len(data['sessions']) == 2
        assert data['limit'] == 2
        assert data['offset'] == 2
        assert data['total'] == 5

    def test_get_history_filter_by_status(self, client, staff_headers, app):
        """Test filtering history by status."""
        from datetime import timedelta

        sessions = [
            MilkOrderSession(session_date=date.today(), status=SessionStatus.COMPLETED.value),
            MilkOrderSession(session_date=date.today() - timedelta(days=1), status=SessionStatus.MORNING.value),
            MilkOrderSession(session_date=date.today() - timedelta(days=2), status=SessionStatus.COMPLETED.value)
        ]
        db.session.add_all(sessions)
        db.session.commit()

        response = client.get(
            '/api/milk-order/history?status=completed',
            headers=staff_headers
        )

        assert response.status_code == 200
        data = response.json
        assert data['total'] == 2

    def test_get_history_empty(self, client, staff_headers, app):
        """Test history when no sessions exist."""
        response = client.get('/api/milk-order/history', headers=staff_headers)

        assert response.status_code == 200
        data = response.json
        assert data['sessions'] == []
        assert data['total'] == 0


class TestFullWorkflow:
    """Integration tests for complete milk order workflow."""

    def test_complete_workflow(self, client, staff_headers, app):
        """Test complete workflow from start to summary."""
        # Setup: Create milk types with par levels
        types = [
            MilkType(name="Whole", category=MilkCategory.DAIRY.value, display_order=1),
            MilkType(name="Oat", category=MilkCategory.NON_DAIRY.value, display_order=2)
        ]
        db.session.add_all(types)
        db.session.commit()

        for i, mt in enumerate(types):
            par = MilkOrderParLevel(milk_type_id=mt.id, par_value=50 + i * 10)
            db.session.add(par)
        db.session.commit()

        # Step 1: Start session
        response = client.post('/api/milk-order/sessions/start', headers=staff_headers)
        assert response.status_code == 201
        session_id = response.json['session']['id']
        assert response.json['session']['status'] == 'night_foh'

        # Step 2: Save FOH counts
        response = client.put(
            f'/api/milk-order/sessions/{session_id}/night-foh',
            json={
                'counts': [
                    {'milk_type_id': types[0].id, 'foh_count': 10},
                    {'milk_type_id': types[1].id, 'foh_count': 8}
                ]
            },
            headers=staff_headers
        )
        assert response.status_code == 200
        assert response.json['session']['status'] == 'night_boh'

        # Step 3: Save BOH counts
        response = client.put(
            f'/api/milk-order/sessions/{session_id}/night-boh',
            json={
                'counts': [
                    {'milk_type_id': types[0].id, 'boh_count': 20},
                    {'milk_type_id': types[1].id, 'boh_count': 15}
                ]
            },
            headers=staff_headers
        )
        assert response.status_code == 200
        assert response.json['session']['status'] == 'morning'

        # Step 4: Save morning counts (mixed methods)
        response = client.put(
            f'/api/milk-order/sessions/{session_id}/morning',
            json={
                'counts': [
                    {
                        'milk_type_id': types[0].id,
                        'method': 'boh_count',
                        'current_boh': 30  # 20 night + 10 delivered
                    },
                    {
                        'milk_type_id': types[1].id,
                        'method': 'direct_delivered',
                        'delivered': 5
                    }
                ]
            },
            headers=staff_headers
        )
        assert response.status_code == 200
        assert response.json['session']['status'] == 'on_order'

        # Step 5: Save on order quantities
        response = client.put(
            f'/api/milk-order/sessions/{session_id}/on-order',
            json={
                'on_orders': [
                    {'milk_type_id': types[0].id, 'on_order': 5},  # 5 whole milk on order
                    {'milk_type_id': types[1].id, 'on_order': 0}   # None on order
                ]
            },
            headers=staff_headers
        )
        assert response.status_code == 200
        assert response.json['session']['status'] == 'completed'

        # Step 6: Get summary
        response = client.get(
            f'/api/milk-order/sessions/{session_id}/summary',
            headers=staff_headers
        )
        assert response.status_code == 200
        summary = response.json['summary']

        # Verify Whole milk: FOH=10, BOH=20, Delivered=10, OnOrder=5, Total=40, Par=50, Order=5
        # Order = Par - Total - OnOrder = 50 - 40 - 5 = 5
        whole = next(s for s in summary if s['milk_type'] == 'Whole')
        assert whole['foh'] == 10
        assert whole['boh'] == 20
        assert whole['delivered'] == 10
        assert whole['on_order'] == 5
        assert whole['total'] == 40
        assert whole['par'] == 50
        assert whole['order'] == 5  # Was 10, now 5 because 5 on order

        # Verify Oat milk: FOH=8, BOH=15, Delivered=5, OnOrder=0, Total=28, Par=60, Order=32
        # Order = Par - Total - OnOrder = 60 - 28 - 0 = 32
        oat = next(s for s in summary if s['milk_type'] == 'Oat')
        assert oat['foh'] == 8
        assert oat['boh'] == 15
        assert oat['delivered'] == 5
        assert oat['on_order'] == 0
        assert oat['total'] == 28
        assert oat['par'] == 60
        assert oat['order'] == 32
