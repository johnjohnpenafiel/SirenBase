"""
Database seeding script for SirenBase.

This script creates:
1. An initial admin user for system access
2. Optional test data for development

Usage:
    python seed.py                    # Seed admin only
    python seed.py --with-test-data   # Seed admin + test items
"""
import sys
import os
from datetime import datetime

# Add parent directory to path to import app modules
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from app.extensions import db
from app.models import User, Item, History
from app.models.user import UserRole
from app.models.history import HistoryAction


def seed_admin_user():
    """
    Create initial admin user.

    Default credentials:
        Partner Number: ADMIN001
        PIN: 1234
        Role: admin
    """
    print("Checking for existing admin user...")

    # Check if admin already exists
    admin = User.query.filter_by(partner_number='ADMIN001').first()

    if admin:
        print("✓ Admin user already exists (ADMIN001)")
        return admin

    # Create new admin user
    print("Creating admin user...")
    admin = User(
        partner_number='ADMIN001',
        name='System Administrator',
        role=UserRole.ADMIN.value
    )
    admin.set_pin('1234')

    db.session.add(admin)
    db.session.commit()

    print("✓ Admin user created successfully!")
    print("  Partner Number: ADMIN001")
    print("  PIN: 1234")
    print("  Role: admin")
    print("  WARNING: Change the PIN after first login!")

    return admin


def seed_test_data(admin_user):
    """
    Create test data for development.

    Args:
        admin_user: Admin user instance to associate with test data
    """
    print("\nCreating test data...")

    # Check if test data already exists
    existing_items = Item.query.count()
    if existing_items > 0:
        print(f"✓ Database already has {existing_items} items. Skipping test data.")
        return

    # Create test staff user
    print("Creating test staff user...")
    staff = User(
        partner_number='TEST123',
        name='Test Staff Member',
        role=UserRole.STAFF.value
    )
    staff.set_pin('5678')
    db.session.add(staff)

    # Create test items
    print("Creating test items...")
    test_items = [
        {'name': 'Coffee Beans - Pike Place', 'code': '1001'},
        {'name': 'Coffee Beans - Pike Place', 'code': '1002'},
        {'name': 'Milk - 2% Gallon', 'code': '2001'},
        {'name': 'Milk - Whole Gallon', 'code': '2002'},
        {'name': 'Vanilla Syrup', 'code': '3001'},
    ]

    for item_data in test_items:
        item = Item(
            name=item_data['name'],
            code=item_data['code'],
            added_by=admin_user.id,
            added_at=datetime.utcnow()
        )
        db.session.add(item)

        # Add history entry
        history = History.log_add(
            item_name=item.name,
            item_code=item.code,
            user_id=admin_user.id,
            notes='Initial test data'
        )
        db.session.add(history)

    db.session.commit()

    print(f"✓ Created {len(test_items)} test items")
    print("✓ Created 1 test staff user (TEST123, PIN: 5678)")
    print(f"✓ Created {len(test_items)} history entries")


def clear_database():
    """Clear all data from database (for development only)."""
    print("\nWARNING: Clearing all data from database...")

    try:
        # Delete in correct order due to foreign keys
        History.query.delete()
        Item.query.delete()
        User.query.delete()
        db.session.commit()
        print("✓ Database cleared successfully")
        return True
    except Exception as e:
        db.session.rollback()
        print(f"✗ Error clearing database: {e}")
        return False


def main():
    """Main seeding function."""
    # Parse command line arguments
    with_test_data = '--with-test-data' in sys.argv
    clear_first = '--clear' in sys.argv

    # Create Flask app and context
    app = create_app('development')

    with app.app_context():
        print("=" * 50)
        print("SirenBase Database Seeding")
        print("=" * 50)

        # Clear database if requested
        if clear_first:
            if not clear_database():
                return
            print()

        # Seed admin user
        admin = seed_admin_user()

        # Seed test data if requested
        if with_test_data:
            seed_test_data(admin)

        print("\n" + "=" * 50)
        print("Seeding completed successfully!")
        print("=" * 50)

        # Print summary
        print("\nDatabase Summary:")
        print(f"  Users: {User.query.count()}")
        print(f"  Items: {Item.query.count()}")
        print(f"  History Entries: {History.query.count()}")

        print("\nNext Steps:")
        print("  1. Start the Flask server: flask run")
        print("  2. Test login with:")
        print("     - Partner Number: ADMIN001")
        print("     - PIN: 1234")


if __name__ == '__main__':
    main()
