"""
Authentication API endpoints.
"""

from flask import request, jsonify
from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity,
    get_jwt,
)
from marshmallow import ValidationError
from . import api_bp
from ..schemas.user import (
    UserCreateSchema,
    UserLoginSchema,
    UserResponseSchema,
    TokenSchema,
)
from ..services.auth_service import AuthService


user_create_schema = UserCreateSchema()
user_login_schema = UserLoginSchema()
user_response_schema = UserResponseSchema()
token_schema = TokenSchema()


@api_bp.route("/auth/register", methods=["POST"])
def register():
    """
    Register a new user.

    Request Body:
        email: User's email address.
        password: Password (min 8 chars, must contain letter and digit).
        full_name: Optional display name.

    Returns:
        201: User created with tokens.
        400: Validation error.
        409: Email already exists.
    """
    try:
        data = user_create_schema.load(request.get_json())
    except ValidationError as err:
        return jsonify({"error": err.messages, "code": "VALIDATION_ERROR"}), 400

    try:
        user, access_token, refresh_token = AuthService.register_user(
            email=data["email"],
            password=data["password"],
            full_name=data.get("full_name")
        )
    except ValueError as err:
        return jsonify({"error": str(err), "code": "EMAIL_EXISTS"}), 409

    response = token_schema.dump({
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user.to_dict()
    })

    return jsonify(response), 201


@api_bp.route("/auth/login", methods=["POST"])
def login():
    """
    Authenticate user and return tokens.

    Request Body:
        email: User's email address.
        password: User's password.

    Returns:
        200: Tokens and user data.
        400: Validation error.
        401: Invalid credentials.
    """
    try:
        data = user_login_schema.load(request.get_json())
    except ValidationError as err:
        return jsonify({"error": err.messages, "code": "VALIDATION_ERROR"}), 400

    try:
        user, access_token, refresh_token = AuthService.login_user(
            email=data["email"],
            password=data["password"]
        )
    except ValueError as err:
        return jsonify({"error": str(err), "code": "INVALID_CREDENTIALS"}), 401

    response = token_schema.dump({
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user.to_dict()
    })

    return jsonify(response), 200


@api_bp.route("/auth/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    """
    Refresh access token using refresh token.

    Headers:
        Authorization: Bearer <refresh_token>

    Returns:
        200: New access and refresh tokens.
        401: Invalid or expired refresh token.
    """
    user_id = int(get_jwt_identity())

    try:
        access_token, refresh_token = AuthService.refresh_tokens(user_id)
    except ValueError as err:
        return jsonify({"error": str(err), "code": "REFRESH_FAILED"}), 401

    return jsonify({
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }), 200


@api_bp.route("/auth/me", methods=["GET"])
@jwt_required()
def get_current_user():
    """
    Get current authenticated user's data.

    Headers:
        Authorization: Bearer <access_token>

    Returns:
        200: User data.
        401: Not authenticated.
    """
    user_id = int(get_jwt_identity())
    user = AuthService.get_user_by_id(user_id)

    if not user:
        return jsonify({"error": "User not found", "code": "USER_NOT_FOUND"}), 404

    return jsonify(user_response_schema.dump(user.to_dict())), 200


@api_bp.route("/auth/logout", methods=["POST"])
@jwt_required()
def logout():
    """
    Logout user (client should discard tokens).

    Note: JWT tokens are stateless, so this endpoint is primarily
    for client-side token cleanup. For token revocation, implement
    a token blocklist.

    Returns:
        200: Logout successful.
    """
    # Reason: In a production app, you might add the token to a blocklist
    return jsonify({"message": "Successfully logged out"}), 200
