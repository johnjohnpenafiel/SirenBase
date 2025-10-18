"""
Application-wide constants for SirenBase.

This module contains shared constants used across the backend application,
particularly for validation and business logic.
"""

# Item Categories
# These categories are used for organizing inventory items.
# Frontend will display these in a dropdown menu with validation.
# Backend validates against this list to ensure data consistency.
ITEM_CATEGORIES = [
    'syrups',
    'sauces',
    'coffee_beans',
    'powders',
    'cups',
    'lids',
    'condiments',
    'cleaning_supplies',
    'other'
]

# Category Display Names (for future use in API responses)
CATEGORY_DISPLAY_NAMES = {
    'syrups': 'Syrups',
    'sauces': 'Sauces',
    'coffee_beans': 'Coffee Beans',
    'powders': 'Powders',
    'cups': 'Cups',
    'lids': 'Lids',
    'condiments': 'Condiments',
    'cleaning_supplies': 'Cleaning Supplies',
    'other': 'Other'
}
