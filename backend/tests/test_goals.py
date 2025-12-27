"""
Tests for savings goals endpoints.
"""

import pytest
from decimal import Decimal
from app.models import SavingsGoal
from app.extensions import db


@pytest.fixture
def savings_goal(app, test_user):
    """Create a savings goal for testing."""
    with app.app_context():
        goal = SavingsGoal(
            user_id=test_user.id,
            name="Emergency Fund",
            target_amount=Decimal("10000.00"),
            current_amount=Decimal("2500.00")
        )
        db.session.add(goal)
        db.session.commit()
        db.session.refresh(goal)
        yield goal


class TestGetGoals:
    """Test goal listing."""

    def test_get_goals_success(self, client, auth_headers, savings_goal):
        """Test getting all goals."""
        response = client.get(
            "/api/v1/goals",
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.get_json()
        assert "goals" in data
        assert data["total"] >= 1

    def test_get_goals_unauthorized(self, client):
        """Test getting goals without auth fails."""
        response = client.get("/api/v1/goals")
        assert response.status_code == 401


class TestGetGoal:
    """Test getting single goal."""

    def test_get_goal_success(self, client, auth_headers, savings_goal):
        """Test getting a specific goal."""
        response = client.get(
            f"/api/v1/goals/{savings_goal.id}",
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.get_json()
        assert data["id"] == savings_goal.id
        assert data["name"] == "Emergency Fund"
        assert data["progress_percentage"] == 25.0

    def test_get_goal_not_found(self, client, auth_headers):
        """Test getting non-existent goal."""
        response = client.get(
            "/api/v1/goals/99999",
            headers=auth_headers
        )

        assert response.status_code == 404


class TestCreateGoal:
    """Test goal creation."""

    def test_create_goal_success(self, client, auth_headers):
        """Test creating a savings goal."""
        response = client.post(
            "/api/v1/goals",
            headers=auth_headers,
            json={
                "name": "Vacation Fund",
                "target_amount": "5000.00",
                "current_amount": "500.00"
            }
        )

        assert response.status_code == 201
        data = response.get_json()
        assert data["name"] == "Vacation Fund"
        assert data["target_amount"] == "5000.00"
        assert data["progress_percentage"] == 10.0

    def test_create_goal_with_date(self, client, auth_headers):
        """Test creating goal with target date."""
        response = client.post(
            "/api/v1/goals",
            headers=auth_headers,
            json={
                "name": "House Down Payment",
                "target_amount": "50000.00",
                "target_date": "2027-12-31"
            }
        )

        assert response.status_code == 201
        data = response.get_json()
        assert data["target_date"] == "2027-12-31"

    def test_create_goal_invalid_amount(self, client, auth_headers):
        """Test creating goal with invalid amount fails."""
        response = client.post(
            "/api/v1/goals",
            headers=auth_headers,
            json={
                "name": "Invalid Goal",
                "target_amount": "0"
            }
        )

        assert response.status_code == 400


class TestUpdateGoal:
    """Test goal updates."""

    def test_update_goal_success(self, client, auth_headers, savings_goal):
        """Test updating a goal."""
        response = client.put(
            f"/api/v1/goals/{savings_goal.id}",
            headers=auth_headers,
            json={
                "name": "Updated Emergency Fund",
                "target_amount": "15000.00"
            }
        )

        assert response.status_code == 200
        data = response.get_json()
        assert data["name"] == "Updated Emergency Fund"
        assert data["target_amount"] == "15000.00"

    def test_update_goal_current_amount(self, client, auth_headers, savings_goal):
        """Test updating goal's current amount."""
        response = client.put(
            f"/api/v1/goals/{savings_goal.id}",
            headers=auth_headers,
            json={"current_amount": "5000.00"}
        )

        assert response.status_code == 200
        data = response.get_json()
        assert data["current_amount"] == "5000.00"
        assert data["progress_percentage"] == 50.0

    def test_update_goal_not_found(self, client, auth_headers):
        """Test updating non-existent goal fails."""
        response = client.put(
            "/api/v1/goals/99999",
            headers=auth_headers,
            json={"name": "New Name"}
        )

        assert response.status_code == 404


class TestDeleteGoal:
    """Test goal deletion."""

    def test_delete_goal_success(self, client, auth_headers, savings_goal):
        """Test deleting a goal."""
        response = client.delete(
            f"/api/v1/goals/{savings_goal.id}",
            headers=auth_headers
        )

        assert response.status_code == 200

    def test_delete_goal_not_found(self, client, auth_headers):
        """Test deleting non-existent goal fails."""
        response = client.delete(
            "/api/v1/goals/99999",
            headers=auth_headers
        )

        assert response.status_code == 404


class TestGoalProgress:
    """Test goal progress endpoint."""

    def test_add_progress_success(self, client, auth_headers, savings_goal):
        """Test adding to goal progress."""
        response = client.post(
            f"/api/v1/goals/{savings_goal.id}/progress",
            headers=auth_headers,
            json={"amount": "1000.00"}
        )

        assert response.status_code == 200
        data = response.get_json()
        assert data["current_amount"] == "3500.00"

    def test_subtract_progress(self, client, auth_headers, savings_goal):
        """Test subtracting from goal progress."""
        response = client.post(
            f"/api/v1/goals/{savings_goal.id}/progress",
            headers=auth_headers,
            json={"amount": "-500.00"}
        )

        assert response.status_code == 200
        data = response.get_json()
        assert data["current_amount"] == "2000.00"

    def test_negative_progress_fails(self, client, auth_headers, savings_goal):
        """Test making progress negative fails."""
        response = client.post(
            f"/api/v1/goals/{savings_goal.id}/progress",
            headers=auth_headers,
            json={"amount": "-5000.00"}
        )

        assert response.status_code == 400

    def test_progress_missing_amount(self, client, auth_headers, savings_goal):
        """Test progress without amount fails."""
        response = client.post(
            f"/api/v1/goals/{savings_goal.id}/progress",
            headers=auth_headers,
            json={}
        )

        assert response.status_code == 400
