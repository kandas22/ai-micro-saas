#!/usr/bin/env python
"""
Application entry point.

Run the Flask development server.
"""

import os
import click
from app import create_app
from app.extensions import db
from app.utils import seed_default_categories

app = create_app()


@app.cli.command("seed-categories")
def seed_categories_command():
    """Seed default financial categories."""
    with app.app_context():
        count = seed_default_categories()
        click.echo(f"Created {count} categories")


@app.cli.command("init-db")
def init_db_command():
    """Initialize the database and seed categories."""
    with app.app_context():
        db.create_all()
        click.echo("Database tables created")
        count = seed_default_categories()
        click.echo(f"Seeded {count} default categories")


if __name__ == "__main__":
    # Reason: Auto-seed categories on first run in development
    with app.app_context():
        db.create_all()
        # Check if categories need seeding
        from app.models import FinancialCategory
        if FinancialCategory.query.count() == 0:
            seed_default_categories()

    app.run(
        host=os.getenv("FLASK_HOST", "0.0.0.0"),
        port=int(os.getenv("FLASK_PORT", 5000)),
        debug=os.getenv("FLASK_DEBUG", "1") == "1"
    )
