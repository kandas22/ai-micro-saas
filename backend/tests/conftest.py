"""
Pytest fixtures for testing.
"""

import pytest
from app import create_app
from app.extensions import db
from app.models import User, FinancialCategory, CategoryType


@pytest.fixture(scope="function")
def app():
    """Create application for testing."""
    app = create_app("testing")

    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture(scope="function")
def client(app):
    """Create test client."""
    return app.test_client()


@pytest.fixture(scope="function")
def db_session(app):
    """Create database session for testing."""
    with app.app_context():
        yield db.session


@pytest.fixture(scope="function")
def test_user(app):
    """Create a test user."""
    with app.app_context():
        user = User(
            email="test@example.com",
            full_name="Test User"
        )
        user.set_password("TestPass123")
        db.session.add(user)
        db.session.commit()

        # Refresh to get the ID
        db.session.refresh(user)
        yield user


@pytest.fixture(scope="function")
def test_category(app):
    """Create a test category."""
    with app.app_context():
        category = FinancialCategory(
            name="Test Income",
            category_type=CategoryType.INCOME,
            user_id=None  # System category
        )
        db.session.add(category)
        db.session.commit()

        db.session.refresh(category)
        yield category


@pytest.fixture(scope="function")
def auth_headers(client, test_user):
    """Get authentication headers for test user."""
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "test@example.com",
            "password": "TestPass123"
        }
    )
    data = response.get_json()
    return {"Authorization": f"Bearer {data['access_token']}"}
