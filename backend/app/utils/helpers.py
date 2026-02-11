"""
Helper utility functions for the SirenBase application.
"""
import random
from datetime import date, datetime
from typing import Optional
from zoneinfo import ZoneInfo

from flask import current_app

from app.models.item import Item
from app.extensions import db


def get_enum_value(enum_field) -> str:
    """
    Extract the string value from a SQLAlchemy enum field.

    Handles both actual Python enum instances and plain string values
    that SQLAlchemy may return depending on context.

    Args:
        enum_field: An enum instance or string value

    Returns:
        The string value of the enum field
    """
    return enum_field.value if hasattr(enum_field, 'value') else str(enum_field)


def get_store_today() -> date:
    """
    Get today's date from the store's timezone perspective.

    This is critical for date-based features like Milk Count sessions where
    "today" should be determined by the store's local time, not the server's.

    For example, at 5:30 PM Pacific on January 13th:
    - Server in UTC would think it's January 14th (1:30 AM UTC)
    - But the store's "today" should be January 13th

    Returns:
        date: Today's date in the store's configured timezone

    Example:
        >>> today = get_store_today()
        >>> isinstance(today, date)
        True
    """
    store_tz = ZoneInfo(current_app.config.get('STORE_TIMEZONE', 'America/Los_Angeles'))
    return datetime.now(store_tz).date()


def get_store_now() -> datetime:
    """
    Get the current datetime in the store's timezone.

    Returns:
        datetime: Current datetime with store timezone info

    Example:
        >>> now = get_store_now()
        >>> now.tzinfo is not None
        True
    """
    store_tz = ZoneInfo(current_app.config.get('STORE_TIMEZONE', 'America/Los_Angeles'))
    return datetime.now(store_tz)


def generate_unique_code(max_attempts: int = 100) -> str:
    """
    Generate a unique 4-digit code for inventory items.

    The function generates random 4-digit codes and checks against
    the database to ensure uniqueness. Codes are zero-padded strings
    (e.g., "0001", "0042", "1234").

    Args:
        max_attempts: Maximum number of generation attempts before giving up

    Returns:
        Unique 4-digit string code

    Raises:
        RuntimeError: If unable to generate unique code after max_attempts

    Example:
        >>> code = generate_unique_code()
        >>> len(code)
        4
        >>> code.isdigit()
        True
    """
    for attempt in range(max_attempts):
        # Generate random 4-digit code (0000-9999)
        code = f"{random.randint(0, 9999):04d}"

        # Check if code already exists in database
        existing_item = Item.query.filter_by(code=code).first()

        if not existing_item:
            return code

    # If we've exhausted all attempts, raise an error
    raise RuntimeError(
        f"Unable to generate unique code after {max_attempts} attempts. "
        "This may indicate the code space is nearly exhausted."
    )


def format_category_display(category: str) -> str:
    """
    Format category code into display-friendly text.

    Args:
        category: Category code (e.g., "coffee_beans")

    Returns:
        Display-friendly category name (e.g., "Coffee Beans")

    Example:
        >>> format_category_display("coffee_beans")
        'Coffee Beans'
        >>> format_category_display("syrups")
        'Syrups'
    """
    from app.constants import CATEGORY_DISPLAY_NAMES

    return CATEGORY_DISPLAY_NAMES.get(category, category.replace('_', ' ').title())
