"""
API blueprints package.

All API routes are registered here.
"""

from flask import Blueprint

api_bp = Blueprint("api", __name__)

from . import auth, categories, budgets, goals, exports  # noqa: E402, F401
