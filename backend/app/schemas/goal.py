"""
Savings Goal validation schemas using Marshmallow.
"""

from marshmallow import Schema, fields, validate
from decimal import Decimal


class GoalCreateSchema(Schema):
    """Schema for creating a savings goal."""

    name = fields.String(
        required=True,
        validate=validate.Length(min=1, max=100)
    )
    target_amount = fields.Decimal(
        required=True,
        places=2,
        validate=validate.Range(min=Decimal("0.01"))
    )
    current_amount = fields.Decimal(
        required=False,
        places=2,
        validate=validate.Range(min=Decimal("0"))
    )
    target_date = fields.Date(allow_none=True)
    category_id = fields.Integer(allow_none=True)


class GoalUpdateSchema(Schema):
    """Schema for updating a savings goal."""

    name = fields.String(
        validate=validate.Length(min=1, max=100),
        allow_none=True
    )
    target_amount = fields.Decimal(
        places=2,
        validate=validate.Range(min=Decimal("0.01")),
        allow_none=True
    )
    current_amount = fields.Decimal(
        places=2,
        validate=validate.Range(min=Decimal("0")),
        allow_none=True
    )
    target_date = fields.Date(allow_none=True)
    is_active = fields.Boolean(allow_none=True)


class GoalResponseSchema(Schema):
    """Schema for goal in API responses."""

    id = fields.Integer()
    user_id = fields.Integer()
    name = fields.String()
    target_amount = fields.String()
    current_amount = fields.String()
    remaining_amount = fields.String()
    progress_percentage = fields.Float()
    target_date = fields.Date(allow_none=True)
    category_id = fields.Integer(allow_none=True)
    is_active = fields.Boolean()
    created_at = fields.DateTime()


class GoalListResponseSchema(Schema):
    """Schema for goals list response."""

    goals = fields.List(fields.Nested(GoalResponseSchema))
    total = fields.Integer()
