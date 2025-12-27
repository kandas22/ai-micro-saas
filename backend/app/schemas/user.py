"""
User validation schemas using Marshmallow.
"""

from marshmallow import Schema, fields, validate, validates, ValidationError
import re


class UserCreateSchema(Schema):
    """Schema for user registration."""

    email = fields.Email(required=True)
    password = fields.String(
        required=True,
        validate=validate.Length(min=8, max=128),
        load_only=True
    )
    full_name = fields.String(
        validate=validate.Length(max=100),
        allow_none=True
    )

    @validates("password")
    def validate_password(self, value: str, **kwargs) -> None:
        """
        Validate password strength.

        Args:
            value: Password to validate.
            **kwargs: Additional arguments from marshmallow 4.x.

        Raises:
            ValidationError: If password doesn't meet requirements.
        """
        if not re.search(r"[A-Za-z]", value):
            raise ValidationError("Password must contain at least one letter")
        if not re.search(r"\d", value):
            raise ValidationError("Password must contain at least one digit")


class UserLoginSchema(Schema):
    """Schema for user login."""

    email = fields.Email(required=True)
    password = fields.String(required=True, load_only=True)


class UserSchema(Schema):
    """Full user schema for internal use."""

    id = fields.Integer(dump_only=True)
    email = fields.Email(required=True)
    full_name = fields.String(allow_none=True)
    is_active = fields.Boolean(dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)


class UserResponseSchema(Schema):
    """Schema for user data in API responses."""

    id = fields.Integer()
    email = fields.Email()
    full_name = fields.String(allow_none=True)
    is_active = fields.Boolean()
    created_at = fields.DateTime()


class TokenSchema(Schema):
    """Schema for JWT token response."""

    access_token = fields.String(required=True)
    refresh_token = fields.String(required=True)
    token_type = fields.String(load_default="bearer", dump_default="bearer")
    user = fields.Nested(UserResponseSchema)
