"""
Seed script for RTD&E items with product images.

This script populates the database with 20 RTD&E items, all with product images.

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


# Define all 20 RTD&E items - all with product images
RTDE_ITEMS = [
    # Waters
    {
        "brand": "Ethos",
        "name": "Water",
        "image_filename": "ethos-water.jpeg",
        "icon": None,
        "par_level": 8,
    },

    # Sparkling Waters
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

    # Nutrition Shakes
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

    # Milk
    {
        "brand": "Horizon Organic",
        "name": "Lowfat Chocolate Milk",
        "image_filename": "horizon-chocolate-milk.jpeg",
        "icon": None,
        "par_level": 6,
    },
    {
        "brand": "Horizon Organic",
        "name": "Lowfat Milk",
        "image_filename": "horizon-milk.jpeg",
        "icon": None,
        "par_level": 6,
    },

    # Juices
    {
        "brand": "Evolution Fresh",
        "name": "Pure Orange",
        "image_filename": "evolution-pure-orange.jpeg",
        "icon": None,
        "par_level": 4,
    },
    {
        "brand": "Tree Top",
        "name": "Organic Apple Juice",
        "image_filename": "treetop-apple-juice.jpeg",
        "icon": None,
        "par_level": 6,
    },
    {
        "brand": "Evolution Fresh",
        "name": "Organic Defense Up",
        "image_filename": "evolution-defense-up.jpeg",
        "icon": None,
        "par_level": 4,
    },
    {
        "brand": "Evolution Fresh",
        "name": "Organic Super Fruit Greens",
        "image_filename": "evolution-super-fruit-greens.jpeg",
        "icon": None,
        "par_level": 4,
    },

    # Sodas
    {
        "brand": "Olipop",
        "name": "Classic Root Beer",
        "image_filename": "olipop-root-beer.jpeg",
        "icon": None,
        "par_level": 4,
    },
    {
        "brand": "Olipop",
        "name": "Classic Grape",
        "image_filename": "olipop-grape.jpeg",
        "icon": None,
        "par_level": 4,
    },

    # Energy Drinks
    {
        "brand": "Starbucks",
        "name": "Iced Energy Tropical Peach",
        "image_filename": "starbucks-energy-tropical-peach.jpeg",
        "icon": None,
        "par_level": 4,
    },
    {
        "brand": "Starbucks",
        "name": "Iced Energy Blueberry Lemonade",
        "image_filename": "starbucks-energy-blueberry-lemonade.jpeg",
        "icon": None,
        "par_level": 4,
    },

    # Wellness Shots
    {
        "brand": "Sol-ti",
        "name": "GINGER SuperShot",
        "image_filename": "solti-ginger-supershot.jpeg",
        "icon": None,
        "par_level": 4,
    },
    {
        "brand": "Sol-ti",
        "name": "TURMERIC SuperShot",
        "image_filename": "solti-turmeric-supershot.jpeg",
        "icon": None,
        "par_level": 4,
    },

    # Protein/Snack Bars
    {
        "brand": "Perfect Bar",
        "name": "Dark Chocolate Chip Peanut Butter",
        "image_filename": "perfect-bar-dark-chocolate-peanut-butter.jpeg",
        "icon": None,
        "par_level": 4,
    },
    {
        "brand": "Perfect Bar",
        "name": "Peanut Butter",
        "image_filename": "perfect-bar-peanut-butter.jpeg",
        "icon": None,
        "par_level": 4,
    },

    # Spreads
    {
        "brand": "Starbucks",
        "name": "Avocado Spread",
        "image_filename": "starbucks-avocado-spread.jpeg",
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

            print(f"  {i:2}. {item_data['brand']} - {item_data['name']} [{item_data['image_filename']}]")

        db.session.commit()

        # Verify
        final_count = RTDEItem.query.count()
        print(f"\n✅ Successfully seeded {final_count} RTD&E items!")


if __name__ == "__main__":
    seed_rtde_items()
