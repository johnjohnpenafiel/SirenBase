"""
Milk Order CLI commands for development and testing.

Usage:
    flask milk-order reset --all          # Reset all sessions
    flask milk-order reset --today        # Reset today's session only
    flask milk-order reset --to-foh       # Reset to FOH step
    flask milk-order reset --to-boh       # Reset to BOH step
    flask milk-order reset --to-morning   # Reset to Morning step
    flask milk-order reset --to-on-order  # Reset to On Order step
    flask milk-order reset --completed    # Reset with completed session
    flask milk-order reset --with-history # Reset with 7 days of history

These commands only work in development mode (FLASK_ENV=development).
"""
import os
import click
from datetime import datetime, timedelta
from flask import current_app
from flask.cli import AppGroup

from app.extensions import db
from app.models.milk_order import (
    MilkType,
    MilkOrderSession,
    MilkOrderEntry,
    SessionStatus,
    MorningMethod,
)
from app.utils.helpers import get_store_today

milk_order_cli = AppGroup('milk-order', help='Milk Order development commands')


def check_dev_mode():
    """Ensure we're in development mode before running destructive commands."""
    flask_env = os.getenv('FLASK_ENV', 'production')
    if flask_env != 'development' and not current_app.debug:
        click.secho(
            "ERROR: This command only works in development mode.",
            fg='red',
            bold=True
        )
        click.echo("Set FLASK_ENV=development in your .env file or run:")
        click.echo("  export FLASK_ENV=development")
        raise click.Abort()


def delete_all_sessions():
    """Delete all milk order sessions and their entries."""
    MilkOrderEntry.query.delete()
    MilkOrderSession.query.delete()
    db.session.commit()


def delete_today_session():
    """Delete only today's session."""
    today = get_store_today()
    session = MilkOrderSession.query.filter_by(session_date=today).first()
    if session:
        MilkOrderEntry.query.filter_by(session_id=session.id).delete()
        db.session.delete(session)
        db.session.commit()
        return True
    return False


def get_active_milk_types():
    """Get all active milk types, ordered by display_order."""
    return MilkType.query.filter_by(active=True).order_by(MilkType.display_order).all()


def create_session_with_entries(session_date, status):
    """
    Create a session with entries for all active milk types.

    Returns the created session.
    """
    session = MilkOrderSession(
        session_date=session_date,
        status=status
    )
    db.session.add(session)
    db.session.flush()  # Get the session ID

    milk_types = get_active_milk_types()
    for mt in milk_types:
        entry = MilkOrderEntry(
            session_id=session.id,
            milk_type_id=mt.id
        )
        db.session.add(entry)

    return session


def populate_foh_counts(session):
    """Populate FOH counts with sample data."""
    entries = MilkOrderEntry.query.filter_by(session_id=session.id).all()
    for i, entry in enumerate(entries):
        entry.night_foh_count = (i + 1) * 2  # 2, 4, 6, 8...
        entry.updated_at = datetime.utcnow()
    session.night_foh_saved_at = datetime.utcnow()


def populate_boh_counts(session):
    """Populate BOH counts with sample data."""
    entries = MilkOrderEntry.query.filter_by(session_id=session.id).all()
    for i, entry in enumerate(entries):
        entry.night_boh_count = (i + 1) * 3  # 3, 6, 9, 12...
        entry.updated_at = datetime.utcnow()
    session.night_boh_saved_at = datetime.utcnow()


def populate_morning_counts(session):
    """Populate morning counts with sample data."""
    entries = MilkOrderEntry.query.filter_by(session_id=session.id).all()
    for i, entry in enumerate(entries):
        entry.morning_count = (i + 1)  # 1, 2, 3, 4...
        entry.morning_method = MorningMethod.DIRECT.value
        entry.updated_at = datetime.utcnow()
    session.morning_saved_at = datetime.utcnow()


def populate_on_order(session):
    """Populate on-order values with sample data."""
    entries = MilkOrderEntry.query.filter_by(session_id=session.id).all()
    for i, entry in enumerate(entries):
        entry.on_order = i * 2  # 0, 2, 4, 6...
        entry.updated_at = datetime.utcnow()
    session.on_order_saved_at = datetime.utcnow()
    session.completed_at = datetime.utcnow()


@milk_order_cli.command('reset')
@click.option('--all', 'reset_all', is_flag=True, help='Delete ALL milk order sessions')
@click.option('--today', 'reset_today', is_flag=True, help='Delete only today\'s session')
@click.option('--to-foh', is_flag=True, help='Create fresh session at FOH step')
@click.option('--to-boh', is_flag=True, help='Create session at BOH step (FOH complete)')
@click.option('--to-morning', is_flag=True, help='Create session at Morning step (night complete)')
@click.option('--to-on-order', is_flag=True, help='Create session at On Order step (counts complete)')
@click.option('--completed', is_flag=True, help='Create a fully completed session')
@click.option('--with-history', is_flag=True, help='Create 7 days of historical sessions')
def reset_command(reset_all, reset_today, to_foh, to_boh, to_morning, to_on_order, completed, with_history):
    """
    Reset milk order sessions for testing.

    Examples:
        flask milk-order reset --all
        flask milk-order reset --today
        flask milk-order reset --to-morning
        flask milk-order reset --with-history
    """
    check_dev_mode()

    # Count selected options
    options = [reset_all, reset_today, to_foh, to_boh, to_morning, to_on_order, completed, with_history]
    selected_count = sum(options)

    if selected_count == 0:
        click.secho("Please specify a reset option. Use --help to see available options.", fg='yellow')
        return

    if selected_count > 1:
        click.secho("Please specify only one reset option at a time.", fg='yellow')
        return

    today = get_store_today()

    # Option 1: Reset all sessions
    if reset_all:
        count = MilkOrderSession.query.count()
        delete_all_sessions()
        click.secho(f"Deleted {count} session(s) and all entries.", fg='green')
        return

    # Option 2: Reset today only
    if reset_today:
        if delete_today_session():
            click.secho(f"Deleted today's session ({today}).", fg='green')
        else:
            click.secho(f"No session found for today ({today}).", fg='yellow')
        return

    # Options 3-7: Create session at specific state
    # First, delete today's session if it exists
    delete_today_session()

    # Option 3: Reset to FOH step
    if to_foh:
        session = create_session_with_entries(today, SessionStatus.NIGHT_FOH.value)
        db.session.commit()
        click.secho(f"Created session at FOH step ({today}).", fg='green')
        click.echo("  Status: night_foh (ready for FOH count entry)")
        return

    # Option 4: Reset to BOH step
    if to_boh:
        session = create_session_with_entries(today, SessionStatus.NIGHT_BOH.value)
        populate_foh_counts(session)
        db.session.commit()
        click.secho(f"Created session at BOH step ({today}).", fg='green')
        click.echo("  Status: night_boh (FOH complete, ready for BOH entry)")
        return

    # Option 5: Reset to Morning step
    if to_morning:
        session = create_session_with_entries(today, SessionStatus.MORNING.value)
        populate_foh_counts(session)
        populate_boh_counts(session)
        db.session.commit()
        click.secho(f"Created session at Morning step ({today}).", fg='green')
        click.echo("  Status: morning (night complete, ready for morning count)")
        return

    # Option 6: Reset to On Order step
    if to_on_order:
        session = create_session_with_entries(today, SessionStatus.ON_ORDER.value)
        populate_foh_counts(session)
        populate_boh_counts(session)
        populate_morning_counts(session)
        db.session.commit()
        click.secho(f"Created session at On Order step ({today}).", fg='green')
        click.echo("  Status: on_order (counts complete, ready for on-order entry)")
        return

    # Option 7: Reset with completed session
    if completed:
        session = create_session_with_entries(today, SessionStatus.COMPLETED.value)
        populate_foh_counts(session)
        populate_boh_counts(session)
        populate_morning_counts(session)
        populate_on_order(session)
        db.session.commit()
        click.secho(f"Created completed session ({today}).", fg='green')
        click.echo("  Status: completed (full workflow done)")
        return

    # Option 8: Reset with history
    if with_history:
        delete_all_sessions()

        # Create 7 days of history (including today)
        statuses = [
            SessionStatus.COMPLETED,
            SessionStatus.COMPLETED,
            SessionStatus.COMPLETED,
            SessionStatus.COMPLETED,
            SessionStatus.COMPLETED,
            SessionStatus.COMPLETED,
            SessionStatus.NIGHT_FOH,  # Today - just started
        ]

        for i, status in enumerate(statuses):
            session_date = today - timedelta(days=6-i)
            session = create_session_with_entries(session_date, status.value)

            # Populate data for completed sessions
            if status == SessionStatus.COMPLETED:
                populate_foh_counts(session)
                populate_boh_counts(session)
                populate_morning_counts(session)
                populate_on_order(session)

        db.session.commit()
        click.secho(f"Created 7 sessions ({today - timedelta(days=6)} to {today}).", fg='green')
        click.echo("  - 6 completed sessions (history)")
        click.echo("  - 1 session at FOH step (today)")
        return
