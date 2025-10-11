"""
Application entry point for development server.

Run with: flask run --port 5000
Or: python run.py
"""
import os
from app import create_app

# Get configuration from environment
config_name = os.getenv('FLASK_ENV', 'development')

# Create app instance
app = create_app(config_name)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
