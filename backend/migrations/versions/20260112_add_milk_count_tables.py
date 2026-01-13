"""Add Milk Count tables for Tool 2 (Milk Count System)

Revision ID: 20260112_milk_count
Revises: 0c6fd5ed13f8
Create Date: 2026-01-12 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '20260112_milk_count'
down_revision = '0c6fd5ed13f8'
branch_labels = None
depends_on = None


def upgrade():
    # Create milk_count_milk_types table
    op.create_table(
        'milk_count_milk_types',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('name', sa.String(50), nullable=False, unique=True),
        sa.Column('category', sa.String(20), nullable=False),
        sa.Column('display_order', sa.Integer(), nullable=False),
        sa.Column('active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.func.now())
    )

    # Create indexes for milk_count_milk_types
    op.create_index('ix_milk_count_milk_types_active', 'milk_count_milk_types', ['active'])
    op.create_index('ix_milk_count_milk_types_display_order', 'milk_count_milk_types', ['display_order'])

    # Create milk_count_par_levels table
    op.create_table(
        'milk_count_par_levels',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('milk_type_id', sa.String(36), sa.ForeignKey('milk_count_milk_types.id', ondelete='CASCADE'), nullable=False, unique=True),
        sa.Column('par_value', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_by', sa.String(36), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    )

    # Create milk_count_sessions table
    op.create_table(
        'milk_count_sessions',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('session_date', sa.Date(), nullable=False, unique=True),
        sa.Column('status', sa.String(20), nullable=False, server_default='night_foh'),
        sa.Column('night_count_user_id', sa.String(36), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('morning_count_user_id', sa.String(36), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('night_foh_saved_at', sa.DateTime(), nullable=True),
        sa.Column('night_boh_saved_at', sa.DateTime(), nullable=True),
        sa.Column('morning_saved_at', sa.DateTime(), nullable=True),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now())
    )

    # Create indexes for milk_count_sessions
    op.create_index('ix_milk_count_sessions_date', 'milk_count_sessions', ['session_date'])
    op.create_index('ix_milk_count_sessions_status', 'milk_count_sessions', ['status'])

    # Create milk_count_entries table
    op.create_table(
        'milk_count_entries',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('session_id', sa.String(36), sa.ForeignKey('milk_count_sessions.id', ondelete='CASCADE'), nullable=False),
        sa.Column('milk_type_id', sa.String(36), sa.ForeignKey('milk_count_milk_types.id', ondelete='CASCADE'), nullable=False),
        sa.Column('foh_count', sa.Integer(), nullable=True),
        sa.Column('boh_count', sa.Integer(), nullable=True),
        sa.Column('morning_method', sa.String(20), nullable=True),
        sa.Column('current_boh', sa.Integer(), nullable=True),
        sa.Column('delivered', sa.Integer(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.func.now())
    )

    # Create unique constraint on session_id + milk_type_id
    op.create_unique_constraint('uq_milk_count_entries_session_milk_type', 'milk_count_entries', ['session_id', 'milk_type_id'])

    # Create index for milk_count_entries
    op.create_index('ix_milk_count_entries_session', 'milk_count_entries', ['session_id'])

    # Seed default milk types (9 total: 5 dairy + 4 non-dairy)
    op.execute("""
        INSERT INTO milk_count_milk_types (id, name, category, display_order, active, created_at, updated_at)
        VALUES
            ('mt-001-whole', 'Whole', 'dairy', 1, true, NOW(), NOW()),
            ('mt-002-twopercent', '2%', 'dairy', 2, true, NOW(), NOW()),
            ('mt-003-nonfat', 'Non-Fat', 'dairy', 3, true, NOW(), NOW()),
            ('mt-004-halfhalf', 'Half & Half', 'dairy', 4, true, NOW(), NOW()),
            ('mt-005-heavycream', 'Heavy Cream', 'dairy', 5, true, NOW(), NOW()),
            ('mt-006-oat', 'Oat', 'non_dairy', 6, true, NOW(), NOW()),
            ('mt-007-almond', 'Almond', 'non_dairy', 7, true, NOW(), NOW()),
            ('mt-008-coconut', 'Coconut', 'non_dairy', 8, true, NOW(), NOW()),
            ('mt-009-soy', 'Soy', 'non_dairy', 9, true, NOW(), NOW())
    """)

    # Seed default par levels (all set to 0 initially)
    op.execute("""
        INSERT INTO milk_count_par_levels (id, milk_type_id, par_value, updated_at)
        VALUES
            ('pl-001', 'mt-001-whole', 0, NOW()),
            ('pl-002', 'mt-002-twopercent', 0, NOW()),
            ('pl-003', 'mt-003-nonfat', 0, NOW()),
            ('pl-004', 'mt-004-halfhalf', 0, NOW()),
            ('pl-005', 'mt-005-heavycream', 0, NOW()),
            ('pl-006', 'mt-006-oat', 0, NOW()),
            ('pl-007', 'mt-007-almond', 0, NOW()),
            ('pl-008', 'mt-008-coconut', 0, NOW()),
            ('pl-009', 'mt-009-soy', 0, NOW())
    """)


def downgrade():
    # Drop tables in reverse order (respecting foreign key constraints)
    op.drop_table('milk_count_entries')
    op.drop_table('milk_count_sessions')
    op.drop_table('milk_count_par_levels')
    op.drop_table('milk_count_milk_types')
