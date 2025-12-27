"""
Flask application factory.

Creates and configures the Flask application instance.
"""

import os
from flask import Flask
from .config import config
from .extensions import db, migrate, jwt, cors


def create_app(config_name: str = None) -> Flask:
    """
    Create and configure the Flask application.

    Args:
        config_name (str): Configuration name (development, testing, production).

    Returns:
        Flask: Configured Flask application instance.
    """
    if config_name is None:
        config_name = os.getenv("FLASK_ENV", "development")

    app = Flask(__name__)
    app.config.from_object(config[config_name])

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    cors.init_app(
        app,
        origins=[
            app.config["FRONTEND_URL"],
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://0.0.0.0:3000"
        ],
        supports_credentials=True
    )

    # Register blueprints
    from .api import api_bp
    app.register_blueprint(api_bp, url_prefix="/api/v1")

    # Health check endpoint
    @app.route("/health")
    def health_check():
        return {"status": "healthy", "version": "1.0.0"}

    # JWT error handlers
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return {"error": "Token has expired", "code": "TOKEN_EXPIRED"}, 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return {"error": "Invalid token", "code": "INVALID_TOKEN"}, 401

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return {"error": "Authorization required", "code": "AUTH_REQUIRED"}, 401

    return app
