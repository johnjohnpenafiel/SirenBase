"""Add on_order column to milk count tables

Adds on_order field for tracking already-ordered quantities from IMS.
- milk_count_entries.on_order: Integer, nullable
- milk_count_sessions.on_order_saved_at: DateTime, nullable

Revision ID: 20260113_on_order
Revises: 20260112_milk_count
Create Date: 2026-01-13 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '20260113_on_order'
down_revision = '20260112_milk_count'
branch_labels = None
depends_on = None


def upgrade():
    # Add on_order column to milk_count_entries table
    with op.batch_alter_table('milk_count_entries', schema=None) as batch_op:
        batch_op.add_column(sa.Column('on_order', sa.Integer(), nullable=True))

    # Add on_order_saved_at timestamp to milk_count_sessions table
    with op.batch_alter_table('milk_count_sessions', schema=None) as batch_op:
        batch_op.add_column(sa.Column('on_order_saved_at', sa.DateTime(), nullable=True))


def downgrade():
    # Remove on_order_saved_at column from milk_count_sessions table
    with op.batch_alter_table('milk_count_sessions', schema=None) as batch_op:
        batch_op.drop_column('on_order_saved_at')

    # Remove on_order column from milk_count_entries table
    with op.batch_alter_table('milk_count_entries', schema=None) as batch_op:
        batch_op.drop_column('on_order')
