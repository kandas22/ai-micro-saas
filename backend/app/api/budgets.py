"""
Budget entry API endpoints.
"""

from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError
from decimal import Decimal
from . import api_bp
from ..schemas.budget import (
    BudgetEntryCreateSchema,
    BudgetEntryUpdateSchema,
    BudgetEntryResponseSchema,
    BudgetBulkCreateSchema,
    MonthlySummarySchema,
)
from ..services.budget_service import BudgetService
from ..models.category import CategoryType


budget_create_schema = BudgetEntryCreateSchema()
budget_update_schema = BudgetEntryUpdateSchema()
budget_response_schema = BudgetEntryResponseSchema()
budget_bulk_schema = BudgetBulkCreateSchema()
summary_schema = MonthlySummarySchema()


@api_bp.route("/budgets", methods=["GET"])
@jwt_required()
def get_budgets():
    """
    Get budget entries with optional filters.

    Query Parameters:
        month: Filter by month (1-12).
        year: Filter by year.
        category_id: Filter by category.
        category_type: Filter by category type (income, savings, expense).

    Returns:
        200: List of budget entries.
    """
    user_id = int(get_jwt_identity())

    month = request.args.get("month", type=int)
    year = request.args.get("year", type=int)
    category_id = request.args.get("category_id", type=int)
    category_type_str = request.args.get("category_type")

    category_type = None
    if category_type_str:
        try:
            category_type = CategoryType(category_type_str)
        except ValueError:
            return jsonify({
                "error": f"Invalid category type: {category_type_str}",
                "code": "INVALID_TYPE"
            }), 400

    entries = BudgetService.get_budget_entries(
        user_id=user_id,
        month=month,
        year=year,
        category_id=category_id,
        category_type=category_type
    )

    return jsonify({
        "entries": [budget_response_schema.dump(e.to_dict()) for e in entries],
        "total": len(entries),
        "month": month,
        "year": year
    }), 200


@api_bp.route("/budgets/<int:budget_id>", methods=["GET"])
@jwt_required()
def get_budget(budget_id: int):
    """
    Get a specific budget entry.

    Path Parameters:
        budget_id: Budget entry ID.

    Returns:
        200: Budget entry data.
        404: Entry not found.
    """
    user_id = int(get_jwt_identity())

    entry = BudgetService.get_budget_entry_by_id(budget_id, user_id)

    if not entry:
        return jsonify({
            "error": "Budget entry not found",
            "code": "NOT_FOUND"
        }), 404

    return jsonify(budget_response_schema.dump(entry.to_dict())), 200


@api_bp.route("/budgets", methods=["POST"])
@jwt_required()
def create_budget():
    """
    Create a new budget entry.

    Request Body:
        category_id: Category ID.
        month: Month (1-12).
        year: Year.
        budgeted_amount: Budgeted amount (optional).
        actual_amount: Actual amount (optional).
        notes: Notes (optional).

    Returns:
        201: Created budget entry.
        400: Validation error.
        409: Entry already exists.
    """
    user_id = int(get_jwt_identity())

    try:
        data = budget_create_schema.load(request.get_json())
    except ValidationError as err:
        return jsonify({"error": err.messages, "code": "VALIDATION_ERROR"}), 400

    try:
        entry = BudgetService.create_budget_entry(
            user_id=user_id,
            category_id=data["category_id"],
            month=data["month"],
            year=data["year"],
            budgeted_amount=data.get("budgeted_amount", Decimal("0.00")),
            actual_amount=data.get("actual_amount", Decimal("0.00")),
            notes=data.get("notes")
        )
    except ValueError as err:
        error_msg = str(err)
        if "already exists" in error_msg:
            return jsonify({"error": error_msg, "code": "ALREADY_EXISTS"}), 409
        return jsonify({"error": error_msg, "code": "CREATE_FAILED"}), 400

    return jsonify(budget_response_schema.dump(entry.to_dict())), 201


@api_bp.route("/budgets/<int:budget_id>", methods=["PUT"])
@jwt_required()
def update_budget(budget_id: int):
    """
    Update a budget entry.

    Path Parameters:
        budget_id: Budget entry ID.

    Request Body:
        budgeted_amount: New budgeted amount (optional).
        actual_amount: New actual amount (optional).
        notes: New notes (optional).

    Returns:
        200: Updated budget entry.
        400: Validation error.
        404: Entry not found.
    """
    user_id = int(get_jwt_identity())

    try:
        data = budget_update_schema.load(request.get_json())
    except ValidationError as err:
        return jsonify({"error": err.messages, "code": "VALIDATION_ERROR"}), 400

    try:
        entry = BudgetService.update_budget_entry(
            budget_id=budget_id,
            user_id=user_id,
            budgeted_amount=data.get("budgeted_amount"),
            actual_amount=data.get("actual_amount"),
            notes=data.get("notes")
        )
    except ValueError as err:
        return jsonify({"error": str(err), "code": "UPDATE_FAILED"}), 404

    return jsonify(budget_response_schema.dump(entry.to_dict())), 200


@api_bp.route("/budgets/<int:budget_id>", methods=["DELETE"])
@jwt_required()
def delete_budget(budget_id: int):
    """
    Delete a budget entry.

    Path Parameters:
        budget_id: Budget entry ID.

    Returns:
        200: Entry deleted.
        404: Entry not found.
    """
    user_id = int(get_jwt_identity())

    try:
        BudgetService.delete_budget_entry(budget_id, user_id)
    except ValueError as err:
        return jsonify({"error": str(err), "code": "DELETE_FAILED"}), 404

    return jsonify({"message": "Budget entry deleted successfully"}), 200


@api_bp.route("/budgets/bulk", methods=["POST"])
@jwt_required()
def bulk_create_budgets():
    """
    Bulk create or update budget entries.

    Request Body:
        entries: List of budget entry objects.

    Returns:
        200: Summary of created/updated entries.
        400: Validation error.
    """
    user_id = int(get_jwt_identity())

    try:
        data = budget_bulk_schema.load(request.get_json())
    except ValidationError as err:
        return jsonify({"error": err.messages, "code": "VALIDATION_ERROR"}), 400

    result = BudgetService.bulk_create_or_update(
        user_id=user_id,
        entries=data["entries"]
    )

    return jsonify(result), 200


@api_bp.route("/budgets/summary/monthly/<int:year>/<int:month>", methods=["GET"])
@jwt_required()
def get_monthly_summary(year: int, month: int):
    """
    Get monthly financial summary.

    Path Parameters:
        year: Year.
        month: Month (1-12).

    Returns:
        200: Monthly summary with income, expenses, savings, surplus/deficit.
    """
    user_id = int(get_jwt_identity())

    if month < 1 or month > 12:
        return jsonify({
            "error": "Month must be between 1 and 12",
            "code": "INVALID_MONTH"
        }), 400

    summary = BudgetService.get_monthly_summary(user_id, year, month)

    return jsonify(summary_schema.dump(summary)), 200


@api_bp.route("/budgets/summary/yearly/<int:year>", methods=["GET"])
@jwt_required()
def get_yearly_summary(year: int):
    """
    Get yearly financial summary.

    Path Parameters:
        year: Year.

    Returns:
        200: Yearly summary with monthly breakdown.
    """
    user_id = int(get_jwt_identity())

    summary = BudgetService.get_yearly_summary(user_id, year)

    return jsonify(summary), 200
