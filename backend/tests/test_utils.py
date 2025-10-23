"""
Unit tests for utility functions.
"""
import pytest
from app.utils.helpers import generate_unique_code, format_category_display
from app.models.item import Item
from app.extensions import db


class TestGenerateUniqueCode:
    """Tests for generate_unique_code function."""

    def test_generates_four_digit_code(self, app):
        """Test that generated code is exactly 4 digits."""
        code = generate_unique_code()

        assert len(code) == 4
        assert code.isdigit()

    def test_generates_unique_codes(self, app):
        """Test that function generates different codes."""
        codes = set()

        for _ in range(10):
            code = generate_unique_code()
            codes.add(code)

        # Should have generated multiple unique codes
        # (very unlikely to get duplicates in 10 attempts)
        assert len(codes) > 1

    def test_avoids_existing_codes(self, app, admin_user):
        """Test that function doesn't generate codes that already exist."""
        # Create an item with a specific code
        existing_item = Item(
            name="Existing Item",
            category="coffee_beans",
            code="1234",
            added_by=admin_user.id
        )
        db.session.add(existing_item)
        db.session.commit()

        # Generate many codes and ensure none match the existing one
        codes = set()
        for _ in range(50):
            code = generate_unique_code()
            codes.add(code)

        # The existing code should not appear in generated codes
        assert "1234" not in codes

    def test_raises_error_when_exhausted(self, app, admin_user, monkeypatch):
        """Test that function raises error when unable to generate unique code."""
        # Mock random.randint to always return the same value
        def mock_randint(a, b):
            return 1234

        monkeypatch.setattr('random.randint', mock_randint)

        # Create an item with that code
        existing_item = Item(
            name="Existing Item",
            category="coffee_beans",
            code="1234",
            added_by=admin_user.id
        )
        db.session.add(existing_item)
        db.session.commit()

        # Now generating a code should fail
        with pytest.raises(RuntimeError, match="Unable to generate unique code"):
            generate_unique_code(max_attempts=5)

    def test_zero_padded_codes(self, app):
        """Test that codes are zero-padded (e.g., 0001, 0042)."""
        # Generate codes and check for zero-padding
        codes = [generate_unique_code() for _ in range(100)]

        # All codes should be exactly 4 characters
        for code in codes:
            assert len(code) == 4
            assert code.isdigit()


class TestFormatCategoryDisplay:
    """Tests for format_category_display function."""

    def test_formats_coffee_beans(self, app):
        """Test formatting coffee_beans category."""
        result = format_category_display("coffee_beans")

        assert result == "Coffee Beans"

    def test_formats_single_word(self, app):
        """Test formatting single-word categories."""
        result = format_category_display("syrups")

        # Should capitalize first letter
        assert result[0].isupper()

    def test_formats_with_underscores(self, app):
        """Test formatting categories with underscores."""
        result = format_category_display("cleaning_supplies")

        # Should replace underscores with spaces and capitalize
        assert "_" not in result
        assert " " in result
        assert result[0].isupper()

    def test_handles_unknown_category(self, app):
        """Test handling of unknown category codes."""
        result = format_category_display("unknown_category")

        # Should still format it reasonably
        assert isinstance(result, str)
        assert len(result) > 0
