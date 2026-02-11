"""Drop duplicate indexes covered by unique constraints

The following indexes are redundant because their leading columns are
already covered by unique constraints which implicitly create indexes:

- ix_milk_count_entries_session (covered by uq_milk_count_entries_session_milk_type)
- ix_milk_count_sessions_date (covered by milk_count_sessions_session_date_key)
- ix_rtde_session_counts_session_id (covered by uq_rtde_session_counts_session_item)

Revision ID: 20260208_drop_dup_idx
Revises: 20260130_reorder
Create Date: 2026-02-08 00:00:00.000000

"""
from alembic import op

# revision identifiers, used by Alembic.
revision = '20260208_drop_dup_idx'
down_revision = '20260130_reorder'
branch_labels = None
depends_on = None


def upgrade():
    op.drop_index('ix_milk_count_entries_session', table_name='milk_count_entries')
    op.drop_index('ix_milk_count_sessions_date', table_name='milk_count_sessions')
    op.drop_index('ix_rtde_session_counts_session_id', table_name='rtde_session_counts')


def downgrade():
    op.create_index('ix_rtde_session_counts_session_id', 'rtde_session_counts', ['session_id'])
    op.create_index('ix_milk_count_sessions_date', 'milk_count_sessions', ['session_date'])
    op.create_index('ix_milk_count_entries_session', 'milk_count_entries', ['session_id'])
