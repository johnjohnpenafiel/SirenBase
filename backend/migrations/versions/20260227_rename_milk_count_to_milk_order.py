"""Rename milk_count tables/indexes/constraints to milk_order

Renames all 4 milk_count tables and their associated indexes and constraints
to use the milk_order prefix. This better reflects the tool's purpose of
calculating daily milk order quantities.

Tables renamed:
- milk_count_milk_types -> milk_order_milk_types
- milk_count_par_levels -> milk_order_par_levels
- milk_count_sessions -> milk_order_sessions
- milk_count_entries -> milk_order_entries

Revision ID: 20260227_milk_order
Revises: 20260208_drop_dup_idx
Create Date: 2026-02-27
"""
from alembic import op

# revision identifiers, used by Alembic.
revision = '20260227_milk_order'
down_revision = '20260208_drop_dup_idx'
branch_labels = None
depends_on = None


def upgrade():
    # -- Rename tables --
    op.rename_table('milk_count_milk_types', 'milk_order_milk_types')
    op.rename_table('milk_count_par_levels', 'milk_order_par_levels')
    op.rename_table('milk_count_sessions', 'milk_order_sessions')
    op.rename_table('milk_count_entries', 'milk_order_entries')

    # -- Rename indexes --
    # milk_order_milk_types indexes
    op.execute('ALTER INDEX ix_milk_count_milk_types_active RENAME TO ix_milk_order_milk_types_active')
    op.execute('ALTER INDEX ix_milk_count_milk_types_display_order RENAME TO ix_milk_order_milk_types_display_order')

    # milk_order_sessions indexes
    op.execute('ALTER INDEX ix_milk_count_sessions_status RENAME TO ix_milk_order_sessions_status')

    # -- Rename unique constraints --
    # milk_order_entries unique constraint
    op.execute('ALTER TABLE milk_order_entries RENAME CONSTRAINT uq_milk_count_entries_session_milk_type TO uq_milk_order_entries_session_milk_type')

    # milk_order_sessions unique constraint (auto-generated name from unique=True)
    op.execute('ALTER TABLE milk_order_sessions RENAME CONSTRAINT milk_count_sessions_session_date_key TO milk_order_sessions_session_date_key')

    # milk_order_milk_types unique constraint (auto-generated name from unique=True)
    op.execute('ALTER TABLE milk_order_milk_types RENAME CONSTRAINT milk_count_milk_types_name_key TO milk_order_milk_types_name_key')

    # milk_order_par_levels unique constraint (auto-generated name from unique=True on milk_type_id)
    op.execute('ALTER TABLE milk_order_par_levels RENAME CONSTRAINT milk_count_par_levels_milk_type_id_key TO milk_order_par_levels_milk_type_id_key')


def downgrade():
    # -- Reverse rename unique constraints --
    op.execute('ALTER TABLE milk_order_par_levels RENAME CONSTRAINT milk_order_par_levels_milk_type_id_key TO milk_count_par_levels_milk_type_id_key')
    op.execute('ALTER TABLE milk_order_milk_types RENAME CONSTRAINT milk_order_milk_types_name_key TO milk_count_milk_types_name_key')
    op.execute('ALTER TABLE milk_order_sessions RENAME CONSTRAINT milk_order_sessions_session_date_key TO milk_count_sessions_session_date_key')
    op.execute('ALTER TABLE milk_order_entries RENAME CONSTRAINT uq_milk_order_entries_session_milk_type TO uq_milk_count_entries_session_milk_type')

    # -- Reverse rename indexes --
    op.execute('ALTER INDEX ix_milk_order_sessions_status RENAME TO ix_milk_count_sessions_status')
    op.execute('ALTER INDEX ix_milk_order_milk_types_display_order RENAME TO ix_milk_count_milk_types_display_order')
    op.execute('ALTER INDEX ix_milk_order_milk_types_active RENAME TO ix_milk_count_milk_types_active')

    # -- Reverse rename tables --
    op.rename_table('milk_order_entries', 'milk_count_entries')
    op.rename_table('milk_order_sessions', 'milk_count_sessions')
    op.rename_table('milk_order_par_levels', 'milk_count_par_levels')
    op.rename_table('milk_order_milk_types', 'milk_count_milk_types')
