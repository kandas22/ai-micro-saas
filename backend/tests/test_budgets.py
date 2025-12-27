"""
Tests for budget entry endpoints.
"""

import pytest
from decimal import Decimal
from app.models import BudgetEntry, FinancialCategory, CategoryType
from app.extensions import db


@pytest.fixture
def income_category(app):
    """Create an income category for testing."""
    with app.app_context():
        category = FinancialCategory(
            name="Test Salary",
            category_type=CategoryType.INCOME,
            user_id=None
        )
        db.session.add(category)
        db.session.commit()
        db.session.refresh(category)
        yield category


@pytest.fixture
def expense_category(app):
    """Create an expense category for testing."""
    with app.app_context():
        category = FinancialCategory(
            name="Test Expense",
            category_type=CategoryType.EXPENSE,
            user_id=None
        )
        db.session.add(category)
        db.session.commit()
        db.session.refresh(category)
        yield category


@pytest.fixture
def budget_entry(app, test_user, income_category):
    """Create a budget entry for testing."""
    with app.app_context():
        entry = BudgetEntry(
            user_id=test_user.id,
            category_id=income_category.id,
            month=1,
            year=2026,
            budgeted_amount=Decimal("5000.00"),
            actual_amount=Decimal("5200.00")
        )
        db.session.add(entry)
        db.session.commit()
        db.session.refresh(entry)
        yield entry


class TestGetBudgets:
    """Test budget listing."""

    def test_get_budgets_success(self, client, auth_headers, budget_entry):
        """Test getting all budget entries."""
        response = client.get(
            "/api/v1/budgets",
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.get_json()
        assert "entries" in data
        assert "total" in data
        assert data["total"] >= 1

    def test_get_budgets_with_filters(self, client, auth_headers, budget_entry):
        """Test filtering budget entries."""
        response = client.get(
            "/api/v1/budgets?month=1&year=2026",
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.get_json()
        assert data["month"] == 1
        assert data["year"] == 2026

    def test_get_budgets_by_category_type(self, client, auth_headers, budget_entry):
        """Test filtering by category type."""
        response = client.get(
            "/api/v1/budgets?category_type=income",
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.get_json()
        for entry in data["entries"]:
            assert entry["category"]["category_type"] == "income"

    def test_get_budgets_unauthorized(self, client):
        """Test getting budgets without auth fails."""
        response = client.get("/api/v1/budgets")
        assert response.status_code == 401


class TestGetBudget:
    """Test getting single budget entry."""

    def test_get_budget_success(self, client, auth_headers, budget_entry):
        """Test getting a specific budget entry."""
        response = client.get(
            f"/api/v1/budgets/{budget_entry.id}",
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.get_json()
        assert data["id"] == budget_entry.id
        assert data["budgeted_amount"] == "5000.00"

    def test_get_budget_not_found(self, client, auth_headers):
        """Test getting non-existent budget entry."""
        response = client.get(
            "/api/v1/budgets/99999",
            headers=auth_headers
        )

        assert response.status_code == 404


class TestCreateBudget:
    """Test budget creation."""

    def test_create_budget_success(self, client, auth_headers, income_category):
        """Test creating a budget entry."""
        response = client.post(
            "/api/v1/budgets",
            headers=auth_headers,
            json={
                "category_id": income_category.id,
                "month": 3,
                "year": 2026,
                "budgeted_amount": "3000.00",
                "actual_amount": "3100.00"
            }
        )

        assert response.status_code == 201
        data = response.get_json()
        assert data["budgeted_amount"] == "3000.00"
        assert data["actual_amount"] == "3100.00"

    def test_create_budget_duplicate(self, client, auth_headers, budget_entry, income_category):
        """Test creating duplicate budget entry fails."""
        response = client.post(
            "/api/v1/budgets",
            headers=auth_headers,
            json={
                "category_id": income_category.id,
                "month": 1,
                "year": 2026,
                "budgeted_amount": "1000.00"
            }
        )

        assert response.status_code == 409
        data = response.get_json()
        assert data["code"] == "ALREADY_EXISTS"

    def test_create_budget_invalid_month(self, client, auth_headers, income_category):
        """Test creating budget with invalid month fails."""
        response = client.post(
            "/api/v1/budgets",
            headers=auth_headers,
            json={
                "category_id": income_category.id,
                "month": 13,
                "year": 2026
            }
        )

        assert response.status_code == 400

    def test_create_budget_invalid_category(self, client, auth_headers):
        """Test creating budget with invalid category fails."""
        response = client.post(
            "/api/v1/budgets",
            headers=auth_headers,
            json={
                "category_id": 99999,
                "month": 1,
                "year": 2026
            }
        )

        assert response.status_code == 400


class TestUpdateBudget:
    """Test budget updates."""

    def test_update_budget_success(self, client, auth_headers, budget_entry):
        """Test updating a budget entry."""
        response = client.put(
            f"/api/v1/budgets/{budget_entry.id}",
            headers=auth_headers,
            json={
                "budgeted_amount": "6000.00",
                "notes": "Updated budget"
            }
        )

        assert response.status_code == 200
        data = response.get_json()
        assert data["budgeted_amount"] == "6000.00"
        assert data["notes"] == "Updated budget"

    def test_update_budget_not_found(self, client, auth_headers):
        """Test updating non-existent budget fails."""
        response = client.put(
            "/api/v1/budgets/99999",
            headers=auth_headers,
            json={"budgeted_amount": "1000.00"}
        )

        assert response.status_code == 404


class TestDeleteBudget:
    """Test budget deletion."""

    def test_delete_budget_success(self, client, auth_headers, budget_entry):
        """Test deleting a budget entry."""
        response = client.delete(
            f"/api/v1/budgets/{budget_entry.id}",
            headers=auth_headers
        )

        assert response.status_code == 200

        # Verify deletion
        get_response = client.get(
            f"/api/v1/budgets/{budget_entry.id}",
            headers=auth_headers
        )
        assert get_response.status_code == 404

    def test_delete_budget_not_found(self, client, auth_headers):
        """Test deleting non-existent budget fails."""
        response = client.delete(
            "/api/v1/budgets/99999",
            headers=auth_headers
        )

        assert response.status_code == 404


class TestBulkCreate:
    """Test bulk budget operations."""

    def test_bulk_create_success(self, client, auth_headers, income_category, expense_category):
        """Test bulk creating budget entries."""
        response = client.post(
            "/api/v1/budgets/bulk",
            headers=auth_headers,
            json={
                "entries": [
                    {
                        "category_id": income_category.id,
                        "month": 4,
                        "year": 2026,
                        "budgeted_amount": "5000.00"
                    },
                    {
                        "category_id": expense_category.id,
                        "month": 4,
                        "year": 2026,
                        "budgeted_amount": "2000.00"
                    }
                ]
            }
        )

        assert response.status_code == 200
        data = response.get_json()
        assert data["created"] == 2
        assert data["updated"] == 0


class TestMonthlySummary:
    """Test monthly summary endpoint."""

    def test_get_monthly_summary(self, client, auth_headers, budget_entry):
        """Test getting monthly summary."""
        response = client.get(
            "/api/v1/budgets/summary/monthly/2026/1",
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.get_json()
        assert data["month"] == 1
        assert data["year"] == 2026
        assert "total_income" in data
        assert "total_expenses" in data
        assert "surplus_deficit" in data

    def test_get_monthly_summary_invalid_month(self, client, auth_headers):
        """Test getting summary with invalid month."""
        response = client.get(
            "/api/v1/budgets/summary/monthly/2026/13",
            headers=auth_headers
        )

        assert response.status_code == 400


class TestYearlySummary:
    """Test yearly summary endpoint."""

    def test_get_yearly_summary(self, client, auth_headers, budget_entry):
        """Test getting yearly summary."""
        response = client.get(
            "/api/v1/budgets/summary/yearly/2026",
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.get_json()
        assert data["year"] == 2026
        assert "total_income" in data
        assert "monthly_breakdown" in data
        assert len(data["monthly_breakdown"]) == 12
