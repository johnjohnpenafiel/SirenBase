"""Add RTDE tables for Tool 3 (RTD&E Counting System)

Revision ID: 20251122_rtde
Revises: 38f7e23d7ea7
Create Date: 2025-11-22 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '20251122_rtde'
down_revision = '38f7e23d7ea7'
branch_labels = None
depends_on = None


def upgrade():
    # Create rtde_items table
    op.create_table(
        'rtde_items',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('icon', sa.String(10), nullable=False),
        sa.Column('par_level', sa.Integer(), nullable=False),
        sa.Column('display_order', sa.Integer(), nullable=False),
        sa.Column('active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.func.now(), onupdate=sa.func.now())
    )

    # Create indexes for rtde_items
    op.create_index('ix_rtde_items_active_order', 'rtde_items', ['active', 'display_order'])

    # Create rtde_count_sessions table
    op.create_table(
        'rtde_count_sessions',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id', ondelete='RESTRICT'), nullable=False),
        sa.Column('status', sa.String(20), nullable=False, server_default='in_progress'),
        sa.Column('started_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.Column('expires_at', sa.DateTime(), nullable=False)
    )

    # Create indexes for rtde_count_sessions
    op.create_index('ix_rtde_sessions_user_status', 'rtde_count_sessions', ['user_id', 'status'])
    op.create_index('ix_rtde_sessions_expires', 'rtde_count_sessions', ['expires_at'])

    # Create rtde_session_counts table
    op.create_table(
        'rtde_session_counts',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('session_id', sa.String(36), sa.ForeignKey('rtde_count_sessions.id', ondelete='CASCADE'), nullable=False),
        sa.Column('item_id', sa.String(36), sa.ForeignKey('rtde_items.id', ondelete='CASCADE'), nullable=False),
        sa.Column('counted_quantity', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('is_pulled', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.func.now(), onupdate=sa.func.now())
    )

    # Create unique constraint on session_id + item_id
    op.create_unique_constraint('uq_rtde_session_counts_session_item', 'rtde_session_counts', ['session_id', 'item_id'])

    # Create index for rtde_session_counts
    op.create_index('ix_rtde_counts_session', 'rtde_session_counts', ['session_id'])


def downgrade():
    # Drop tables in reverse order (respecting foreign key constraints)
    op.drop_table('rtde_session_counts')
    op.drop_table('rtde_count_sessions')
    op.drop_table('rtde_items')
