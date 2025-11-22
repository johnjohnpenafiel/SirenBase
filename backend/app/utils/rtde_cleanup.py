"""
RTD&E session cleanup utility.

This script deletes expired counting sessions to keep the database clean.
Should be run periodically (e.g., hourly via cron job).
"""
from datetime import datetime

from app.extensions import db
from app.models.rtde import RTDECountSession


def cleanup_expired_sessions():
    """
    Delete all expired RTD&E counting sessions.

    Sessions are expired if:
    - status = 'in_progress'
    - expires_at < NOW()

    Returns:
        int: Number of sessions deleted
    """
    # Find expired sessions
    expired_sessions = RTDECountSession.query.filter(
        RTDECountSession.status == 'in_progress',
        RTDECountSession.expires_at < datetime.utcnow()
    ).all()

    count = len(expired_sessions)

    # Delete expired sessions (cascade deletes counts)
    for session in expired_sessions:
        db.session.delete(session)

    db.session.commit()

    return count


def cleanup_expired_sessions_query():
    """
    Delete expired sessions using a single SQL query (more efficient).

    Returns:
        int: Number of sessions deleted
    """
    # Use SQL DELETE directly for better performance
    result = db.session.query(RTDECountSession).filter(
        RTDECountSession.status == 'in_progress',
        RTDECountSession.expires_at < datetime.utcnow()
    ).delete(synchronize_session=False)

    db.session.commit()

    return result


if __name__ == '__main__':
    """
    Run cleanup script directly.

    Usage:
        cd backend
        source venv/bin/activate
        python -m app.utils.rtde_cleanup
    """
    from app import create_app

    app = create_app()

    with app.app_context():
        deleted_count = cleanup_expired_sessions_query()
        print(f"Cleaned up {deleted_count} expired RTD&E sessions")
