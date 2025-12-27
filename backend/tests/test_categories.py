"""
Tests for category endpoints.
"""

import pytest
from app.utils import seed_default_categories


class TestGetCategories:
    """Test category listing."""

    def test_get_categories_success(self, client, auth_headers, test_category):
        """Test getting all categories."""
        response = client.get(
            "/api/v1/categories",
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.get_json()
        assert "categories" in data
        assert "total" in data
        assert data["total"] >= 1

    def test_get_categories_by_type(self, client, auth_headers, test_category):
        """Test filtering categories by type."""
        response = client.get(
            "/api/v1/categories?type=income",
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.get_json()
        for cat in data["categories"]:
            assert cat["category_type"] == "income"

    def test_get_categories_unauthorized(self, client):
        """Test getting categories without auth fails."""
        response = client.get("/api/v1/categories")

        assert response.status_code == 401

    def test_get_categories_invalid_type(self, client, auth_headers):
        """Test filtering with invalid type."""
        response = client.get(
            "/api/v1/categories?type=invalid",
            headers=auth_headers
        )

        assert response.status_code == 400


class TestGetCategory:
    """Test getting single category."""

    def test_get_category_success(self, client, auth_headers, test_category):
        """Test getting a specific category."""
        response = client.get(
            f"/api/v1/categories/{test_category.id}",
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.get_json()
        assert data["id"] == test_category.id
        assert data["name"] == "Test Income"

    def test_get_category_not_found(self, client, auth_headers):
        """Test getting non-existent category."""
        response = client.get(
            "/api/v1/categories/99999",
            headers=auth_headers
        )

        assert response.status_code == 404


class TestCreateCategory:
    """Test category creation."""

    def test_create_category_success(self, client, auth_headers):
        """Test creating a custom category."""
        response = client.post(
            "/api/v1/categories",
            headers=auth_headers,
            json={
                "name": "My Custom Income",
                "category_type": "income"
            }
        )

        assert response.status_code == 201
        data = response.get_json()
        assert data["name"] == "My Custom Income"
        assert data["is_system_category"] is False

    def test_create_expense_category_with_type(self, client, auth_headers):
        """Test creating expense category with expense_type."""
        response = client.post(
            "/api/v1/categories",
            headers=auth_headers,
            json={
                "name": "Custom Expense",
                "category_type": "expense",
                "expense_type": "fixed"
            }
        )

        assert response.status_code == 201
        data = response.get_json()
        assert data["expense_type"] == "fixed"

    def test_create_category_invalid_type(self, client, auth_headers):
        """Test creating category with invalid type fails."""
        response = client.post(
            "/api/v1/categories",
            headers=auth_headers,
            json={
                "name": "Invalid",
                "category_type": "invalid"
            }
        )

        assert response.status_code == 400


class TestUpdateCategory:
    """Test category updates."""

    def test_update_custom_category(self, client, auth_headers, app):
        """Test updating a custom category."""
        # First create a custom category
        from app.extensions import db
        from app.models import FinancialCategory, CategoryType
        from flask_jwt_extended import decode_token

        with app.app_context():
            # Get user_id from token
            create_response = client.post(
                "/api/v1/categories",
                headers=auth_headers,
                json={
                    "name": "Original Name",
                    "category_type": "income"
                }
            )
            category_id = create_response.get_json()["id"]

            # Update it
            response = client.put(
                f"/api/v1/categories/{category_id}",
                headers=auth_headers,
                json={"name": "Updated Name"}
            )

            assert response.status_code == 200
            data = response.get_json()
            assert data["name"] == "Updated Name"

    def test_update_system_category_fails(self, client, auth_headers, test_category):
        """Test updating system category fails."""
        response = client.put(
            f"/api/v1/categories/{test_category.id}",
            headers=auth_headers,
            json={"name": "New Name"}
        )

        assert response.status_code == 400


class TestDeleteCategory:
    """Test category deletion."""

    def test_delete_custom_category(self, client, auth_headers):
        """Test deleting a custom category."""
        # First create a custom category
        create_response = client.post(
            "/api/v1/categories",
            headers=auth_headers,
            json={
                "name": "To Delete",
                "category_type": "income"
            }
        )
        category_id = create_response.get_json()["id"]

        # Delete it
        response = client.delete(
            f"/api/v1/categories/{category_id}",
            headers=auth_headers
        )

        assert response.status_code == 200

    def test_delete_system_category_fails(self, client, auth_headers, test_category):
        """Test deleting system category fails."""
        response = client.delete(
            f"/api/v1/categories/{test_category.id}",
            headers=auth_headers
        )

        assert response.status_code == 400


class TestSeedCategories:
    """Test category seeding."""

    def test_seed_creates_categories(self, app):
        """Test seeding creates default categories."""
        with app.app_context():
            count = seed_default_categories()
            assert count > 0

    def test_seed_is_idempotent(self, app):
        """Test seeding twice doesn't create duplicates."""
        with app.app_context():
            first_count = seed_default_categories()
            second_count = seed_default_categories()

            assert first_count > 0
            assert second_count == 0
