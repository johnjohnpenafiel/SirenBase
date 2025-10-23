"""
Helper utility functions for the SirenBase application.
"""
import random
from typing import Optional

from app.models.item import Item
from app.extensions import db


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
