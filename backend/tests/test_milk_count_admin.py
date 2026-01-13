"""
Tests for Milk Count admin endpoints (milk type and par level management).

Tests cover:
- GET /api/milk-count/admin/milk-types (list milk types)
- PUT /api/milk-count/admin/milk-types/:id (update milk type)
- GET /api/milk-count/admin/par-levels (list par levels)
- PUT /api/milk-count/admin/par-levels/:milk_type_id (update par level)
"""
import pytest

from app.models.milk_count import MilkType, MilkCountParLevel, MilkCategory
from app.extensions import db


class TestAdminGetMilkTypes:
    """Tests for GET /api/milk-count/admin/milk-types."""

    def test_get_milk_types_success(self, client, admin_headers, app):
        """Test getting all active milk types as admin."""
        # Create test milk types
        types = [
            MilkType(name="Whole", category=MilkCategory.DAIRY.value, display_order=1),
            MilkType(name="2%", category=MilkCategory.DAIRY.value, display_order=2),
            MilkType(name="Oat", category=MilkCategory.NON_DAIRY.value, display_order=3, active=False)
        ]

        db.session.add_all(types)
        db.session.commit()

        response = client.get('/api/milk-count/admin/milk-types', headers=admin_headers)

        assert response.status_code == 200
        data = response.json
        assert 'milk_types' in data
        assert len(data['milk_types']) == 2  # Only active types by default

    def test_get_milk_types_include_inactive(self, client, admin_headers, app):
        """Test getting milk types including inactive ones."""
        types = [
            MilkType(name="Active", category=MilkCategory.DAIRY.value, display_order=1),
            MilkType(name="Inactive", category=MilkCategory.NON_DAIRY.value, display_order=2, active=False)
        ]

        db.session.add_all(types)
        db.session.commit()

        response = client.get(
            '/api/milk-count/admin/milk-types?include_inactive=true',
            headers=admin_headers
        )

        assert response.status_code == 200
        data = response.json
        assert len(data['milk_types']) == 2  # Both active and inactive

    def test_get_milk_types_ordered_by_display_order(self, client, admin_headers, app):
        """Test milk types are returned ordered by display_order."""
        types = [
            MilkType(name="Third", category=MilkCategory.DAIRY.value, display_order=3),
            MilkType(name="First", category=MilkCategory.DAIRY.value, display_order=1),
            MilkType(name="Second", category=MilkCategory.DAIRY.value, display_order=2)
        ]

        db.session.add_all(types)
        db.session.commit()

        response = client.get('/api/milk-count/admin/milk-types', headers=admin_headers)

        assert response.status_code == 200
        data = response.json
        assert data['milk_types'][0]['name'] == "First"
        assert data['milk_types'][1]['name'] == "Second"
        assert data['milk_types'][2]['name'] == "Third"

    def test_get_milk_types_includes_par_value(self, client, admin_headers, app):
        """Test milk types include par value in response."""
        milk_type = MilkType(name="Whole", category=MilkCategory.DAIRY.value, display_order=1)
        db.session.add(milk_type)
        db.session.commit()

        par = MilkCountParLevel(milk_type_id=milk_type.id, par_value=30)
        db.session.add(par)
        db.session.commit()

        response = client.get('/api/milk-count/admin/milk-types', headers=admin_headers)

        assert response.status_code == 200
        data = response.json
        assert data['milk_types'][0]['par_value'] == 30

    def test_get_milk_types_unauthorized_staff(self, client, staff_headers):
        """Test staff user cannot access admin endpoint."""
        response = client.get('/api/milk-count/admin/milk-types', headers=staff_headers)

        assert response.status_code == 403
        assert 'error' in response.json


class TestAdminUpdateMilkType:
    """Tests for PUT /api/milk-count/admin/milk-types/:id."""

    def test_update_milk_type_display_order(self, client, admin_headers, app):
        """Test updating milk type display order."""
        milk_type = MilkType(name="Whole", category=MilkCategory.DAIRY.value, display_order=1)
        db.session.add(milk_type)
        db.session.commit()

        response = client.put(
            f'/api/milk-count/admin/milk-types/{milk_type.id}',
            json={'display_order': 5},
            headers=admin_headers
        )

        assert response.status_code == 200
        data = response.json
        assert data['message'] == 'Milk type updated successfully'
        assert data['milk_type']['display_order'] == 5

    def test_update_milk_type_active_status(self, client, admin_headers, app):
        """Test toggling milk type active status."""
        milk_type = MilkType(name="Whole", category=MilkCategory.DAIRY.value, display_order=1, active=True)
        db.session.add(milk_type)
        db.session.commit()

        response = client.put(
            f'/api/milk-count/admin/milk-types/{milk_type.id}',
            json={'active': False},
            headers=admin_headers
        )

        assert response.status_code == 200
        assert response.json['milk_type']['active'] is False

    def test_update_milk_type_not_found(self, client, admin_headers):
        """Test updating non-existent milk type."""
        response = client.put(
            '/api/milk-count/admin/milk-types/nonexistent-id',
            json={'display_order': 1},
            headers=admin_headers
        )

        assert response.status_code == 404

    def test_update_milk_type_invalid_display_order(self, client, admin_headers, app):
        """Test display_order must be positive."""
        milk_type = MilkType(name="Whole", category=MilkCategory.DAIRY.value, display_order=1)
        db.session.add(milk_type)
        db.session.commit()

        response = client.put(
            f'/api/milk-count/admin/milk-types/{milk_type.id}',
            json={'display_order': 0},
            headers=admin_headers
        )

        assert response.status_code == 400
        assert 'display_order' in str(response.json['error'])

    def test_update_milk_type_unauthorized_staff(self, client, staff_headers, app):
        """Test staff user cannot update milk types."""
        milk_type = MilkType(name="Whole", category=MilkCategory.DAIRY.value, display_order=1)
        db.session.add(milk_type)
        db.session.commit()

        response = client.put(
            f'/api/milk-count/admin/milk-types/{milk_type.id}',
            json={'display_order': 2},
            headers=staff_headers
        )

        assert response.status_code == 403


class TestAdminGetParLevels:
    """Tests for GET /api/milk-count/admin/par-levels."""

    def test_get_par_levels_success(self, client, admin_headers, app):
        """Test getting all par levels."""
        # Create milk types
        milk_type1 = MilkType(name="Whole", category=MilkCategory.DAIRY.value, display_order=1)
        milk_type2 = MilkType(name="2%", category=MilkCategory.DAIRY.value, display_order=2)
        db.session.add_all([milk_type1, milk_type2])
        db.session.commit()

        # Create par levels
        par1 = MilkCountParLevel(milk_type_id=milk_type1.id, par_value=30)
        par2 = MilkCountParLevel(milk_type_id=milk_type2.id, par_value=25)
        db.session.add_all([par1, par2])
        db.session.commit()

        response = client.get('/api/milk-count/admin/par-levels', headers=admin_headers)

        assert response.status_code == 200
        data = response.json
        assert 'par_levels' in data
        assert len(data['par_levels']) == 2

    def test_get_par_levels_includes_milk_type_info(self, client, admin_headers, app):
        """Test par levels include milk type info."""
        milk_type = MilkType(name="Oat", category=MilkCategory.NON_DAIRY.value, display_order=1)
        db.session.add(milk_type)
        db.session.commit()

        par = MilkCountParLevel(milk_type_id=milk_type.id, par_value=20)
        db.session.add(par)
        db.session.commit()

        response = client.get('/api/milk-count/admin/par-levels', headers=admin_headers)

        assert response.status_code == 200
        data = response.json
        assert data['par_levels'][0]['milk_type_name'] == "Oat"
        assert data['par_levels'][0]['milk_type_category'] == "non_dairy"

    def test_get_par_levels_excludes_inactive_milk_types(self, client, admin_headers, app):
        """Test par levels for inactive milk types are excluded."""
        active = MilkType(name="Active", category=MilkCategory.DAIRY.value, display_order=1)
        inactive = MilkType(name="Inactive", category=MilkCategory.DAIRY.value, display_order=2, active=False)
        db.session.add_all([active, inactive])
        db.session.commit()

        par1 = MilkCountParLevel(milk_type_id=active.id, par_value=30)
        par2 = MilkCountParLevel(milk_type_id=inactive.id, par_value=25)
        db.session.add_all([par1, par2])
        db.session.commit()

        response = client.get('/api/milk-count/admin/par-levels', headers=admin_headers)

        assert response.status_code == 200
        data = response.json
        assert len(data['par_levels']) == 1  # Only active milk type's par level

    def test_get_par_levels_unauthorized_staff(self, client, staff_headers):
        """Test staff user cannot access admin endpoint."""
        response = client.get('/api/milk-count/admin/par-levels', headers=staff_headers)

        assert response.status_code == 403


class TestAdminUpdateParLevel:
    """Tests for PUT /api/milk-count/admin/par-levels/:milk_type_id."""

    def test_update_par_level_success(self, client, admin_headers, app):
        """Test updating par level."""
        milk_type = MilkType(name="Whole", category=MilkCategory.DAIRY.value, display_order=1)
        db.session.add(milk_type)
        db.session.commit()

        par = MilkCountParLevel(milk_type_id=milk_type.id, par_value=20)
        db.session.add(par)
        db.session.commit()

        response = client.put(
            f'/api/milk-count/admin/par-levels/{milk_type.id}',
            json={'par_value': 35},
            headers=admin_headers
        )

        assert response.status_code == 200
        data = response.json
        assert data['message'] == 'Par level updated successfully'
        assert data['par_level']['par_value'] == 35

    def test_update_par_level_creates_if_not_exists(self, client, admin_headers, app):
        """Test updating creates par level if it doesn't exist."""
        milk_type = MilkType(name="New", category=MilkCategory.DAIRY.value, display_order=1)
        db.session.add(milk_type)
        db.session.commit()

        response = client.put(
            f'/api/milk-count/admin/par-levels/{milk_type.id}',
            json={'par_value': 25},
            headers=admin_headers
        )

        assert response.status_code == 200
        assert response.json['par_level']['par_value'] == 25

    def test_update_par_level_milk_type_not_found(self, client, admin_headers):
        """Test updating par level for non-existent milk type."""
        response = client.put(
            '/api/milk-count/admin/par-levels/nonexistent-id',
            json={'par_value': 30},
            headers=admin_headers
        )

        assert response.status_code == 404

    def test_update_par_level_validation_required(self, client, admin_headers, app):
        """Test par_value is required."""
        milk_type = MilkType(name="Whole", category=MilkCategory.DAIRY.value, display_order=1)
        db.session.add(milk_type)
        db.session.commit()

        response = client.put(
            f'/api/milk-count/admin/par-levels/{milk_type.id}',
            json={},
            headers=admin_headers
        )

        assert response.status_code == 400
        assert 'par_value' in str(response.json['error'])

    def test_update_par_level_validation_non_negative(self, client, admin_headers, app):
        """Test par_value must be non-negative."""
        milk_type = MilkType(name="Whole", category=MilkCategory.DAIRY.value, display_order=1)
        db.session.add(milk_type)
        db.session.commit()

        response = client.put(
            f'/api/milk-count/admin/par-levels/{milk_type.id}',
            json={'par_value': -5},
            headers=admin_headers
        )

        assert response.status_code == 400
        assert 'par_value' in str(response.json['error'])

    def test_update_par_level_unauthorized_staff(self, client, staff_headers, app):
        """Test staff user cannot update par levels."""
        milk_type = MilkType(name="Whole", category=MilkCategory.DAIRY.value, display_order=1)
        db.session.add(milk_type)
        db.session.commit()

        response = client.put(
            f'/api/milk-count/admin/par-levels/{milk_type.id}',
            json={'par_value': 30},
            headers=staff_headers
        )

        assert response.status_code == 403


class TestStaffGetMilkTypes:
    """Tests for GET /api/milk-count/milk-types (staff endpoint)."""

    def test_get_milk_types_staff_success(self, client, staff_headers, app):
        """Test staff can get active milk types."""
        types = [
            MilkType(name="Whole", category=MilkCategory.DAIRY.value, display_order=1),
            MilkType(name="2%", category=MilkCategory.DAIRY.value, display_order=2),
            MilkType(name="Inactive", category=MilkCategory.DAIRY.value, display_order=3, active=False)
        ]

        db.session.add_all(types)
        db.session.commit()

        # Add par level
        par = MilkCountParLevel(milk_type_id=types[0].id, par_value=30)
        db.session.add(par)
        db.session.commit()

        response = client.get('/api/milk-count/milk-types', headers=staff_headers)

        assert response.status_code == 200
        data = response.json
        assert 'milk_types' in data
        assert len(data['milk_types']) == 2  # Only active types
        assert data['milk_types'][0]['par_value'] == 30

    def test_get_milk_types_unauthenticated(self, client):
        """Test unauthenticated request is rejected."""
        response = client.get('/api/milk-count/milk-types')

        assert response.status_code == 401
