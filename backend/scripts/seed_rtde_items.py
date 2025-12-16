"""
Seed script for RTD&E items with product images.

This script populates the database with 17 RTD&E items:
- 5 items with product images
- 7 items with emoji fallback
- 5 items with placeholder fallback (no image, no emoji)

Usage:
    cd backend
    source venv/bin/activate
    python scripts/seed_rtde_items.py
"""

import sys
import os

# Add the parent directory to the path so we can import from app
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from app.extensions import db
from app.models.rtde import RTDEItem


# Define all 17 RTD&E items
RTDE_ITEMS = [
    # Items WITH product images (5 items)
    {
        "brand": "Ethos",
        "name": "Water",
        "image_filename": "ethos-water.jpeg",
        "icon": None,
        "par_level": 8,
    },
    {
        "brand": "Spindrift",
        "name": "Lemon Sparkling Water",
        "image_filename": "spindrift-lemon.jpeg",
        "icon": None,
        "par_level": 6,
    },
    {
        "brand": "Spindrift",
        "name": "Raspberry Lime Sparkling Water",
        "image_filename": "spindrift-raspberry-lime.jpeg",
        "icon": None,
        "par_level": 6,
    },
    {
        "brand": "Koia",
        "name": "Cacao Bean Nutrition Shake",
        "image_filename": "koia-cacao-bean-nutrition.jpeg",
        "icon": None,
        "par_level": 4,
    },
    {
        "brand": "Koia",
        "name": "Vanilla Bean Nutrition Shake",
        "image_filename": "koia-vanilla-bean-nutrition.jpeg",
        "icon": None,
        "par_level": 4,
    },

    # Items WITH emojis - no image yet (7 items)
    {
        "brand": "Horizon Organic",
        "name": "Lowfat Chocolate Milk",
        "image_filename": None,
        "icon": "🍫",
        "par_level": 6,
    },
    {
        "brand": "Horizon Organic",
        "name": "Lowfat Milk",
        "image_filename": None,
        "icon": "🥛",
        "par_level": 6,
    },
    {
        "brand": "Evolution Fresh",
        "name": "Pure Orange",
        "image_filename": None,
        "icon": "🍊",
        "par_level": 4,
    },
    {
        "brand": "Tree Top",
        "name": "Organic Apple Juice",
        "image_filename": None,
        "icon": "🍎",
        "par_level": 6,
    },
    {
        "brand": "Olipop",
        "name": "Classic Root Beer",
        "image_filename": None,
        "icon": "🥤",
        "par_level": 4,
    },
    {
        "brand": "Olipop",
        "name": "Classic Grape",
        "image_filename": None,
        "icon": "🍇",
        "par_level": 4,
    },
    {
        "brand": "Starbucks",
        "name": "Iced Energy Tropical Peach",
        "image_filename": None,
        "icon": "🍑",
        "par_level": 4,
    },

    # Items with PLACEHOLDER fallback - no image, no emoji (5 items)
    {
        "brand": "Sol-ti",
        "name": "GINGER SuperShot",
        "image_filename": None,
        "icon": None,
        "par_level": 4,
    },
    {
        "brand": "Sol-ti",
        "name": "TURMERIC SuperShot",
        "image_filename": None,
        "icon": None,
        "par_level": 4,
    },
    {
        "brand": "Evolution Fresh",
        "name": "Organic Defense Up",
        "image_filename": None,
        "icon": None,
        "par_level": 4,
    },
    {
        "brand": "Evolution Fresh",
        "name": "Organic Super Fruit Greens",
        "image_filename": None,
        "icon": None,
        "par_level": 4,
    },
    {
        "brand": "Starbucks",
        "name": "Iced Energy Blueberry Lemonade",
        "image_filename": None,
        "icon": None,
        "par_level": 4,
    },
]


def seed_rtde_items():
    """Seed the database with RTD&E items."""
    app = create_app()

    with app.app_context():
        # Clear existing items
        existing_count = RTDEItem.query.count()
        if existing_count > 0:
            print(f"Clearing {existing_count} existing RTD&E items...")
            RTDEItem.query.delete()
            db.session.commit()

        # Add new items
        print(f"Seeding {len(RTDE_ITEMS)} RTD&E items...")

        for i, item_data in enumerate(RTDE_ITEMS, start=1):
            item = RTDEItem(
                name=item_data["name"],
                brand=item_data["brand"],
                image_filename=item_data["image_filename"],
                icon=item_data["icon"],
                par_level=item_data["par_level"],
                display_order=i,
                active=True,
            )
            db.session.add(item)

            # Determine display type
            if item_data["image_filename"]:
                display_type = f"📷 {item_data['image_filename']}"
            elif item_data["icon"]:
                display_type = f"😀 {item_data['icon']}"
            else:
                display_type = "🫙 placeholder"

            print(f"  {i:2}. {item_data['brand']} - {item_data['name']} [{display_type}]")

        db.session.commit()

        # Verify
        final_count = RTDEItem.query.count()
        print(f"\n✅ Successfully seeded {final_count} RTD&E items!")

        # Summary
        with_images = sum(1 for i in RTDE_ITEMS if i["image_filename"])
        with_emoji = sum(1 for i in RTDE_ITEMS if i["icon"] and not i["image_filename"])
        with_placeholder = sum(1 for i in RTDE_ITEMS if not i["image_filename"] and not i["icon"])

        print(f"\nSummary:")
        print(f"  - With images: {with_images}")
        print(f"  - With emoji: {with_emoji}")
        print(f"  - With placeholder: {with_placeholder}")


if __name__ == "__main__":
    seed_rtde_items()
