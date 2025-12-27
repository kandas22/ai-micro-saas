"""
Category management API endpoints.
"""

from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError
from . import api_bp
from ..schemas.category import (
    CategoryCreateSchema,
    CategoryResponseSchema,
)
from ..services.category_service import CategoryService
from ..models.category import CategoryType, ExpenseType


category_create_schema = CategoryCreateSchema()
category_response_schema = CategoryResponseSchema()


@api_bp.route("/categories", methods=["GET"])
@jwt_required()
def get_categories():
    """
    Get all categories available to the user.

    Query Parameters:
        type: Filter by category type (income, savings, expense).
        include_inactive: Include inactive categories (default: false).

    Returns:
        200: List of categories.
    """
    user_id = int(get_jwt_identity())

    category_type = request.args.get("type")
    include_inactive = request.args.get("include_inactive", "false").lower() == "true"

    type_filter = None
    if category_type:
        try:
            type_filter = CategoryType(category_type)
        except ValueError:
            return jsonify({
                "error": f"Invalid category type: {category_type}",
                "code": "INVALID_TYPE"
            }), 400

    categories = CategoryService.get_all_categories(
        user_id=user_id,
        category_type=type_filter,
        include_inactive=include_inactive
    )

    return jsonify({
        "categories": [category_response_schema.dump(c.to_dict()) for c in categories],
        "total": len(categories)
    }), 200


@api_bp.route("/categories/<int:category_id>", methods=["GET"])
@jwt_required()
def get_category(category_id: int):
    """
    Get a specific category by ID.

    Path Parameters:
        category_id: Category's ID.

    Returns:
        200: Category data.
        404: Category not found.
    """
    user_id = int(get_jwt_identity())

    category = CategoryService.get_category_by_id(category_id, user_id)

    if not category:
        return jsonify({
            "error": "Category not found",
            "code": "NOT_FOUND"
        }), 404

    return jsonify(category_response_schema.dump(category.to_dict())), 200


@api_bp.route("/categories", methods=["POST"])
@jwt_required()
def create_category():
    """
    Create a custom category.

    Request Body:
        name: Category name.
        category_type: Type (income, savings, expense).
        expense_type: Sub-type for expenses (optional).
        parent_id: Parent category ID (optional).

    Returns:
        201: Created category.
        400: Validation error.
    """
    user_id = int(get_jwt_identity())

    try:
        data = category_create_schema.load(request.get_json())
    except ValidationError as err:
        return jsonify({"error": err.messages, "code": "VALIDATION_ERROR"}), 400

    try:
        category_type = CategoryType(data["category_type"])
        expense_type = None
        if data.get("expense_type"):
            expense_type = ExpenseType(data["expense_type"])

        category = CategoryService.create_category(
            user_id=user_id,
            name=data["name"],
            category_type=category_type,
            expense_type=expense_type,
            parent_id=data.get("parent_id")
        )
    except ValueError as err:
        return jsonify({"error": str(err), "code": "CREATE_FAILED"}), 400

    return jsonify(category_response_schema.dump(category.to_dict())), 201


@api_bp.route("/categories/<int:category_id>", methods=["PUT"])
@jwt_required()
def update_category(category_id: int):
    """
    Update a custom category.

    Path Parameters:
        category_id: Category's ID.

    Request Body:
        name: New category name (optional).
        is_active: Active status (optional).

    Returns:
        200: Updated category.
        400: Validation error or system category.
        404: Category not found.
    """
    user_id = int(get_jwt_identity())
    data = request.get_json()

    try:
        category = CategoryService.update_category(
            category_id=category_id,
            user_id=user_id,
            name=data.get("name"),
            is_active=data.get("is_active")
        )
    except ValueError as err:
        return jsonify({"error": str(err), "code": "UPDATE_FAILED"}), 400

    return jsonify(category_response_schema.dump(category.to_dict())), 200


@api_bp.route("/categories/<int:category_id>", methods=["DELETE"])
@jwt_required()
def delete_category(category_id: int):
    """
    Delete (deactivate) a custom category.

    Path Parameters:
        category_id: Category's ID.

    Returns:
        200: Category deleted.
        400: System category or not found.
    """
    user_id = int(get_jwt_identity())

    try:
        CategoryService.delete_category(category_id, user_id)
    except ValueError as err:
        return jsonify({"error": str(err), "code": "DELETE_FAILED"}), 400

    return jsonify({"message": "Category deleted successfully"}), 200
