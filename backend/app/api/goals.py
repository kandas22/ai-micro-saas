"""
Savings Goals API endpoints.
"""

from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError
from decimal import Decimal
from . import api_bp
from ..schemas.goal import (
    GoalCreateSchema,
    GoalUpdateSchema,
    GoalResponseSchema,
)
from ..services.goal_service import GoalService


goal_create_schema = GoalCreateSchema()
goal_update_schema = GoalUpdateSchema()
goal_response_schema = GoalResponseSchema()


@api_bp.route("/goals", methods=["GET"])
@jwt_required()
def get_goals():
    """
    Get all savings goals for the user.

    Query Parameters:
        include_inactive: Include inactive goals (default: false).

    Returns:
        200: List of goals.
    """
    user_id = int(get_jwt_identity())
    include_inactive = request.args.get("include_inactive", "false").lower() == "true"

    goals = GoalService.get_goals(user_id, include_inactive)

    return jsonify({
        "goals": [goal_response_schema.dump(g.to_dict()) for g in goals],
        "total": len(goals)
    }), 200


@api_bp.route("/goals/<int:goal_id>", methods=["GET"])
@jwt_required()
def get_goal(goal_id: int):
    """
    Get a specific savings goal.

    Path Parameters:
        goal_id: Goal ID.

    Returns:
        200: Goal data.
        404: Goal not found.
    """
    user_id = int(get_jwt_identity())

    goal = GoalService.get_goal_by_id(goal_id, user_id)

    if not goal:
        return jsonify({
            "error": "Goal not found",
            "code": "NOT_FOUND"
        }), 404

    return jsonify(goal_response_schema.dump(goal.to_dict())), 200


@api_bp.route("/goals", methods=["POST"])
@jwt_required()
def create_goal():
    """
    Create a new savings goal.

    Request Body:
        name: Goal name.
        target_amount: Target amount.
        current_amount: Current amount (optional, default 0).
        target_date: Target date (optional).
        category_id: Linked category (optional).

    Returns:
        201: Created goal.
        400: Validation error.
    """
    user_id = int(get_jwt_identity())

    try:
        data = goal_create_schema.load(request.get_json())
    except ValidationError as err:
        return jsonify({"error": err.messages, "code": "VALIDATION_ERROR"}), 400

    try:
        goal = GoalService.create_goal(
            user_id=user_id,
            name=data["name"],
            target_amount=data["target_amount"],
            current_amount=data.get("current_amount", Decimal("0.00")),
            target_date=data.get("target_date"),
            category_id=data.get("category_id")
        )
    except ValueError as err:
        return jsonify({"error": str(err), "code": "CREATE_FAILED"}), 400

    return jsonify(goal_response_schema.dump(goal.to_dict())), 201


@api_bp.route("/goals/<int:goal_id>", methods=["PUT"])
@jwt_required()
def update_goal(goal_id: int):
    """
    Update a savings goal.

    Path Parameters:
        goal_id: Goal ID.

    Request Body:
        name: New name (optional).
        target_amount: New target amount (optional).
        current_amount: New current amount (optional).
        target_date: New target date (optional).
        is_active: Active status (optional).

    Returns:
        200: Updated goal.
        400: Validation error.
        404: Goal not found.
    """
    user_id = int(get_jwt_identity())

    try:
        data = goal_update_schema.load(request.get_json())
    except ValidationError as err:
        return jsonify({"error": err.messages, "code": "VALIDATION_ERROR"}), 400

    try:
        goal = GoalService.update_goal(
            goal_id=goal_id,
            user_id=user_id,
            **data
        )
    except ValueError as err:
        return jsonify({"error": str(err), "code": "UPDATE_FAILED"}), 404

    return jsonify(goal_response_schema.dump(goal.to_dict())), 200


@api_bp.route("/goals/<int:goal_id>", methods=["DELETE"])
@jwt_required()
def delete_goal(goal_id: int):
    """
    Delete a savings goal.

    Path Parameters:
        goal_id: Goal ID.

    Returns:
        200: Goal deleted.
        404: Goal not found.
    """
    user_id = int(get_jwt_identity())

    try:
        GoalService.delete_goal(goal_id, user_id)
    except ValueError as err:
        return jsonify({"error": str(err), "code": "DELETE_FAILED"}), 404

    return jsonify({"message": "Goal deleted successfully"}), 200


@api_bp.route("/goals/<int:goal_id>/progress", methods=["POST"])
@jwt_required()
def update_goal_progress(goal_id: int):
    """
    Add to goal's current amount.

    Path Parameters:
        goal_id: Goal ID.

    Request Body:
        amount: Amount to add (can be negative).

    Returns:
        200: Updated goal.
        400: Invalid amount.
        404: Goal not found.
    """
    user_id = int(get_jwt_identity())
    data = request.get_json()

    amount = data.get("amount")
    if amount is None:
        return jsonify({
            "error": "Amount is required",
            "code": "VALIDATION_ERROR"
        }), 400

    try:
        goal = GoalService.update_goal_progress(
            goal_id=goal_id,
            user_id=user_id,
            amount=Decimal(str(amount))
        )
    except ValueError as err:
        return jsonify({"error": str(err), "code": "UPDATE_FAILED"}), 400

    return jsonify(goal_response_schema.dump(goal.to_dict())), 200
