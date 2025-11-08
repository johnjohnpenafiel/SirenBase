"""add item_name_suggestions table

Revision ID: 2025110801
Revises: f3ae586c1a9a
Create Date: 2025-11-08 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import uuid
from datetime import datetime

# revision identifiers, used by Alembic.
revision = '2025110801'
down_revision = 'f3ae586c1a9a'
branch_labels = None
depends_on = None


def upgrade():
    # Create item_name_suggestions table
    op.create_table(
        'item_name_suggestions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('category', sa.String(length=50), nullable=False),
        sa.Column('created_at', sa.TIMESTAMP, server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.TIMESTAMP, server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False)
    )

    # Create index for fast autocomplete queries
    op.create_index('idx_suggestions_category_name', 'item_name_suggestions', ['category', 'name'])

    # Seed common Starbucks inventory items (50+ templates)
    # Using raw SQL for bulk insert
    op.execute("""
        INSERT INTO item_name_suggestions (id, name, category, created_at, updated_at) VALUES
        -- Syrups (8 templates)
        (gen_random_uuid(), 'Vanilla Syrup', 'syrups', NOW(), NOW()),
        (gen_random_uuid(), 'Caramel Syrup', 'syrups', NOW(), NOW()),
        (gen_random_uuid(), 'Hazelnut Syrup', 'syrups', NOW(), NOW()),
        (gen_random_uuid(), 'Sugar-Free Vanilla Syrup', 'syrups', NOW(), NOW()),
        (gen_random_uuid(), 'Pumpkin Spice Syrup', 'syrups', NOW(), NOW()),
        (gen_random_uuid(), 'Peppermint Syrup', 'syrups', NOW(), NOW()),
        (gen_random_uuid(), 'Toffee Nut Syrup', 'syrups', NOW(), NOW()),
        (gen_random_uuid(), 'Cinnamon Dolce Syrup', 'syrups', NOW(), NOW()),

        -- Sauces (6 templates)
        (gen_random_uuid(), 'Mocha Sauce', 'sauces', NOW(), NOW()),
        (gen_random_uuid(), 'White Mocha Sauce', 'sauces', NOW(), NOW()),
        (gen_random_uuid(), 'Caramel Sauce', 'sauces', NOW(), NOW()),
        (gen_random_uuid(), 'Dark Caramel Sauce', 'sauces', NOW(), NOW()),
        (gen_random_uuid(), 'Pumpkin Sauce', 'sauces', NOW(), NOW()),
        (gen_random_uuid(), 'Toasted White Mocha Sauce', 'sauces', NOW(), NOW()),

        -- Coffee Beans (5 templates)
        (gen_random_uuid(), 'Pike Place Roast', 'coffee_beans', NOW(), NOW()),
        (gen_random_uuid(), 'Blonde Roast', 'coffee_beans', NOW(), NOW()),
        (gen_random_uuid(), 'Dark Roast', 'coffee_beans', NOW(), NOW()),
        (gen_random_uuid(), 'Decaf Pike Place', 'coffee_beans', NOW(), NOW()),
        (gen_random_uuid(), 'Espresso Roast', 'coffee_beans', NOW(), NOW()),

        -- Powders (4 templates)
        (gen_random_uuid(), 'Matcha Powder', 'powders', NOW(), NOW()),
        (gen_random_uuid(), 'Chai Powder', 'powders', NOW(), NOW()),
        (gen_random_uuid(), 'Protein Powder (Vanilla)', 'powders', NOW(), NOW()),
        (gen_random_uuid(), 'Protein Powder (Chocolate)', 'powders', NOW(), NOW()),

        -- Cups (6 templates)
        (gen_random_uuid(), 'Tall Hot Cups', 'cups', NOW(), NOW()),
        (gen_random_uuid(), 'Grande Hot Cups', 'cups', NOW(), NOW()),
        (gen_random_uuid(), 'Venti Hot Cups', 'cups', NOW(), NOW()),
        (gen_random_uuid(), 'Tall Cold Cups', 'cups', NOW(), NOW()),
        (gen_random_uuid(), 'Grande Cold Cups', 'cups', NOW(), NOW()),
        (gen_random_uuid(), 'Venti Cold Cups', 'cups', NOW(), NOW()),

        -- Lids (4 templates)
        (gen_random_uuid(), 'Hot Cup Lids (Tall/Grande)', 'lids', NOW(), NOW()),
        (gen_random_uuid(), 'Hot Cup Lids (Venti)', 'lids', NOW(), NOW()),
        (gen_random_uuid(), 'Cold Cup Lids (Flat)', 'lids', NOW(), NOW()),
        (gen_random_uuid(), 'Cold Cup Lids (Dome)', 'lids', NOW(), NOW()),

        -- Condiments (5 templates)
        (gen_random_uuid(), 'Sugar Packets', 'condiments', NOW(), NOW()),
        (gen_random_uuid(), 'Sweetener Packets', 'condiments', NOW(), NOW()),
        (gen_random_uuid(), 'Honey Packets', 'condiments', NOW(), NOW()),
        (gen_random_uuid(), 'Cinnamon Shakers', 'condiments', NOW(), NOW()),
        (gen_random_uuid(), 'Cocoa Powder', 'condiments', NOW(), NOW()),

        -- Cleaning Supplies (6 templates)
        (gen_random_uuid(), 'Sanitizer Tablets', 'cleaning_supplies', NOW(), NOW()),
        (gen_random_uuid(), 'Restroom Cleaner', 'cleaning_supplies', NOW(), NOW()),
        (gen_random_uuid(), 'Glass Cleaner', 'cleaning_supplies', NOW(), NOW()),
        (gen_random_uuid(), 'Dish Soap', 'cleaning_supplies', NOW(), NOW()),
        (gen_random_uuid(), 'Milk Pitcher Cleaner', 'cleaning_supplies', NOW(), NOW()),
        (gen_random_uuid(), 'Espresso Machine Cleaner', 'cleaning_supplies', NOW(), NOW()),

        -- Other (5 templates)
        (gen_random_uuid(), 'Napkins', 'other', NOW(), NOW()),
        (gen_random_uuid(), 'Paper Straws', 'other', NOW(), NOW()),
        (gen_random_uuid(), 'Cup Sleeves', 'other', NOW(), NOW()),
        (gen_random_uuid(), 'Stir Sticks', 'other', NOW(), NOW()),
        (gen_random_uuid(), 'Trash Bags', 'other', NOW(), NOW())
    """)


def downgrade():
    # Drop index
    op.drop_index('idx_suggestions_category_name', table_name='item_name_suggestions')

    # Drop table (cascade will remove all seed data)
    op.drop_table('item_name_suggestions')
