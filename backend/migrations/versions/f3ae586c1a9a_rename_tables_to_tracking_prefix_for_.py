"""Rename tables to tracking prefix for multi-tool architecture

Revision ID: f3ae586c1a9a
Revises: a2b4409b87d0
Create Date: 2025-10-29 11:08:02.336438

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'f3ae586c1a9a'
down_revision = 'a2b4409b87d0'
branch_labels = None
depends_on = None


def upgrade():
    # Rename tables to add tracking prefix
    op.rename_table('items', 'tracking_items')
    op.rename_table('history', 'tracking_history')

    # Rename indexes for tracking_items
    op.execute('ALTER INDEX ix_items_category RENAME TO ix_tracking_items_category')
    op.execute('ALTER INDEX ix_items_code RENAME TO ix_tracking_items_code')
    op.execute('ALTER INDEX ix_items_is_removed RENAME TO ix_tracking_items_is_removed')

    # Rename indexes for tracking_history
    op.execute('ALTER INDEX ix_history_action RENAME TO ix_tracking_history_action')
    op.execute('ALTER INDEX ix_history_item_code RENAME TO ix_tracking_history_item_code')
    op.execute('ALTER INDEX ix_history_timestamp RENAME TO ix_tracking_history_timestamp')
    op.execute('ALTER INDEX ix_history_user_id RENAME TO ix_tracking_history_user_id')

    # Rename primary key constraints
    op.execute('ALTER TABLE tracking_items RENAME CONSTRAINT items_pkey TO tracking_items_pkey')
    op.execute('ALTER TABLE tracking_history RENAME CONSTRAINT history_pkey TO tracking_history_pkey')

    # Rename foreign key constraints for tracking_items
    op.execute('ALTER TABLE tracking_items RENAME CONSTRAINT items_added_by_fkey TO tracking_items_added_by_fkey')
    op.execute('ALTER TABLE tracking_items RENAME CONSTRAINT items_removed_by_fkey TO tracking_items_removed_by_fkey')

    # Rename foreign key constraints for tracking_history
    op.execute('ALTER TABLE tracking_history RENAME CONSTRAINT history_user_id_fkey TO tracking_history_user_id_fkey')


def downgrade():
    # Rename tables back to original names
    op.rename_table('tracking_items', 'items')
    op.rename_table('tracking_history', 'history')

    # Rename indexes back for items
    op.execute('ALTER INDEX ix_tracking_items_category RENAME TO ix_items_category')
    op.execute('ALTER INDEX ix_tracking_items_code RENAME TO ix_items_code')
    op.execute('ALTER INDEX ix_tracking_items_is_removed RENAME TO ix_items_is_removed')

    # Rename indexes back for history
    op.execute('ALTER INDEX ix_tracking_history_action RENAME TO ix_history_action')
    op.execute('ALTER INDEX ix_tracking_history_item_code RENAME TO ix_history_item_code')
    op.execute('ALTER INDEX ix_tracking_history_timestamp RENAME TO ix_history_timestamp')
    op.execute('ALTER INDEX ix_tracking_history_user_id RENAME TO ix_history_user_id')

    # Rename primary key constraints back
    op.execute('ALTER TABLE items RENAME CONSTRAINT tracking_items_pkey TO items_pkey')
    op.execute('ALTER TABLE history RENAME CONSTRAINT tracking_history_pkey TO history_pkey')

    # Rename foreign key constraints back for items
    op.execute('ALTER TABLE items RENAME CONSTRAINT tracking_items_added_by_fkey TO items_added_by_fkey')
    op.execute('ALTER TABLE items RENAME CONSTRAINT tracking_items_removed_by_fkey TO items_removed_by_fkey')

    # Rename foreign key constraints back for history
    op.execute('ALTER TABLE history RENAME CONSTRAINT tracking_history_user_id_fkey TO history_user_id_fkey')
