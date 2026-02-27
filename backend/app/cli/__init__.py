"""
CLI commands for SirenBase development and testing.

These commands are for development use only and will refuse to run in production.
"""
from app.cli.milk_order import milk_order_cli


def register_cli_commands(app):
    """
    Register all CLI command groups with the Flask app.

    Args:
        app: Flask application instance
    """
    app.cli.add_command(milk_order_cli)
