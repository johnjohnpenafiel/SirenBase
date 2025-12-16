"""Add brand column to rtde_items table

Revision ID: 20251215_brand
Revises: 20251122_rtde
Create Date: 2025-12-15 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '20251215_brand'
down_revision = '20251122_rtde'
branch_labels = None
depends_on = None


def upgrade():
    # Add brand column to rtde_items table (nullable, max 50 chars)
    with op.batch_alter_table('rtde_items', schema=None) as batch_op:
        batch_op.add_column(sa.Column('brand', sa.String(length=50), nullable=True))


def downgrade():
    # Remove brand column from rtde_items table
    with op.batch_alter_table('rtde_items', schema=None) as batch_op:
        batch_op.drop_column('brand')
