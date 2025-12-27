#!/usr/bin/env python
"""
WSGI entry point for production servers (Gunicorn).

This file is used by Gunicorn to serve the Flask application.
"""

from app import create_app

# Create the Flask application instance
application = create_app()

if __name__ == "__main__":
    application.run()

