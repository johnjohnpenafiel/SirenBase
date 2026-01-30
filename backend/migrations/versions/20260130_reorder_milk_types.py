"""Reorder milk types display order

Updates display_order for milk types to match preferred ordering:
Dairy: 2%, Whole, Non-Fat, Half & Half, Heavy Cream
Non-Dairy: Soy, Oat, Coconut, Almond

Revision ID: 20260130_reorder
Revises: 20260113_on_order
Create Date: 2026-01-30 00:00:00.000000

"""
from alembic import op

# revision identifiers, used by Alembic.
revision = '20260130_reorder'
down_revision = '20260113_on_order'
branch_labels = None
depends_on = None


def upgrade():
    # Dairy
    op.execute("UPDATE milk_count_milk_types SET display_order = 1 WHERE name = '2%'")
    op.execute("UPDATE milk_count_milk_types SET display_order = 2 WHERE name = 'Whole'")
    op.execute("UPDATE milk_count_milk_types SET display_order = 3 WHERE name = 'Non-Fat'")
    op.execute("UPDATE milk_count_milk_types SET display_order = 4 WHERE name = 'Half & Half'")
    op.execute("UPDATE milk_count_milk_types SET display_order = 5 WHERE name = 'Heavy Cream'")

    # Non-Dairy
    op.execute("UPDATE milk_count_milk_types SET display_order = 6 WHERE name = 'Soy'")
    op.execute("UPDATE milk_count_milk_types SET display_order = 7 WHERE name = 'Oat'")
    op.execute("UPDATE milk_count_milk_types SET display_order = 8 WHERE name = 'Coconut'")
    op.execute("UPDATE milk_count_milk_types SET display_order = 9 WHERE name = 'Almond'")


def downgrade():
    # Restore original order
    op.execute("UPDATE milk_count_milk_types SET display_order = 1 WHERE name = 'Whole'")
    op.execute("UPDATE milk_count_milk_types SET display_order = 2 WHERE name = '2%'")
    op.execute("UPDATE milk_count_milk_types SET display_order = 3 WHERE name = 'Non-Fat'")
    op.execute("UPDATE milk_count_milk_types SET display_order = 4 WHERE name = 'Half & Half'")
    op.execute("UPDATE milk_count_milk_types SET display_order = 5 WHERE name = 'Heavy Cream'")

    op.execute("UPDATE milk_count_milk_types SET display_order = 6 WHERE name = 'Oat'")
    op.execute("UPDATE milk_count_milk_types SET display_order = 7 WHERE name = 'Almond'")
    op.execute("UPDATE milk_count_milk_types SET display_order = 8 WHERE name = 'Coconut'")
    op.execute("UPDATE milk_count_milk_types SET display_order = 9 WHERE name = 'Soy'")
