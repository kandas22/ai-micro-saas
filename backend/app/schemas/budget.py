"""
Budget Entry validation schemas using Marshmallow.
"""

from marshmallow import Schema, fields, validate, validates, ValidationError
from decimal import Decimal


class BudgetEntryCreateSchema(Schema):
    """Schema for creating a budget entry."""

    category_id = fields.Integer(required=True)
    month = fields.Integer(
        required=True,
        validate=validate.Range(min=1, max=12)
    )
    year = fields.Integer(
        required=True,
        validate=validate.Range(min=2020, max=2100)
    )
    budgeted_amount = fields.Decimal(
        required=False,
        places=2,
        validate=validate.Range(min=Decimal("0"))
    )
    actual_amount = fields.Decimal(
        required=False,
        places=2,
        validate=validate.Range(min=Decimal("0"))
    )
    notes = fields.String(
        validate=validate.Length(max=500),
        allow_none=True
    )


class BudgetEntryUpdateSchema(Schema):
    """Schema for updating a budget entry."""

    budgeted_amount = fields.Decimal(
        places=2,
        validate=validate.Range(min=Decimal("0")),
        allow_none=True
    )
    actual_amount = fields.Decimal(
        places=2,
        validate=validate.Range(min=Decimal("0")),
        allow_none=True
    )
    notes = fields.String(
        validate=validate.Length(max=500),
        allow_none=True
    )


class BudgetEntryResponseSchema(Schema):
    """Schema for budget entry in API responses."""

    id = fields.Integer()
    user_id = fields.Integer()
    category_id = fields.Integer()
    category = fields.Dict(allow_none=True)
    month = fields.Integer()
    year = fields.Integer()
    budgeted_amount = fields.String()
    actual_amount = fields.String()
    notes = fields.String(allow_none=True)
    created_at = fields.DateTime()
    updated_at = fields.DateTime()


class BudgetBulkCreateSchema(Schema):
    """Schema for bulk creating budget entries."""

    entries = fields.List(
        fields.Nested(BudgetEntryCreateSchema),
        required=True,
        validate=validate.Length(min=1, max=100)
    )


class BudgetListQuerySchema(Schema):
    """Schema for budget list query parameters."""

    month = fields.Integer(validate=validate.Range(min=1, max=12))
    year = fields.Integer(validate=validate.Range(min=2020, max=2100))
    category_id = fields.Integer()
    category_type = fields.String(
        validate=validate.OneOf(["income", "savings", "expense"])
    )


class BudgetListResponseSchema(Schema):
    """Schema for budget list response."""

    entries = fields.List(fields.Nested(BudgetEntryResponseSchema))
    total = fields.Integer()
    month = fields.Integer(allow_none=True)
    year = fields.Integer(allow_none=True)


class MonthlySummarySchema(Schema):
    """Schema for monthly financial summary."""

    month = fields.Integer()
    year = fields.Integer()
    total_income = fields.String()
    total_expenses = fields.String()
    total_savings = fields.String()
    surplus_deficit = fields.String()
    income_breakdown = fields.List(fields.Dict())
    expense_breakdown = fields.List(fields.Dict())
    savings_breakdown = fields.List(fields.Dict())
