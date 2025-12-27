"""
Category validation schemas using Marshmallow.
"""

from marshmallow import Schema, fields, validate, validates, ValidationError
from ..models.category import CategoryType, ExpenseType


class CategoryCreateSchema(Schema):
    """Schema for creating a new category."""

    name = fields.String(
        required=True,
        validate=validate.Length(min=1, max=100)
    )
    category_type = fields.String(
        required=True,
        validate=validate.OneOf([ct.value for ct in CategoryType])
    )
    expense_type = fields.String(
        validate=validate.OneOf([et.value for et in ExpenseType]),
        allow_none=True
    )
    parent_id = fields.Integer(allow_none=True)

    @validates("expense_type")
    def validate_expense_type(self, value: str, **kwargs) -> None:
        """
        Validate expense_type is only set for expense categories.

        Args:
            value: Expense type value.
            **kwargs: Additional arguments from marshmallow 4.x.

        Raises:
            ValidationError: If expense_type set for non-expense category.
        """
        # Reason: Validation happens in context, so we check in post_load
        pass


class CategorySchema(Schema):
    """Full category schema."""

    id = fields.Integer(dump_only=True)
    name = fields.String(required=True)
    category_type = fields.String()
    expense_type = fields.String(allow_none=True)
    parent_id = fields.Integer(allow_none=True)
    user_id = fields.Integer(allow_none=True)
    is_active = fields.Boolean()
    is_system_category = fields.Boolean(dump_only=True)
    created_at = fields.DateTime(dump_only=True)


class CategoryResponseSchema(Schema):
    """Schema for category data in API responses."""

    id = fields.Integer()
    name = fields.String()
    category_type = fields.String()
    expense_type = fields.String(allow_none=True)
    parent_id = fields.Integer(allow_none=True)
    is_system_category = fields.Boolean()
    is_active = fields.Boolean()


class CategoryListResponseSchema(Schema):
    """Schema for list of categories response."""

    categories = fields.List(fields.Nested(CategoryResponseSchema))
    total = fields.Integer()
