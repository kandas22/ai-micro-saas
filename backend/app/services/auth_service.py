"""
Authentication service for user registration and login.
"""

from typing import Optional, Tuple
from flask_jwt_extended import create_access_token, create_refresh_token
from ..extensions import db
from ..models.user import User


class AuthService:
    """Service class for authentication operations."""

    @staticmethod
    def register_user(
        email: str,
        password: str,
        full_name: Optional[str] = None
    ) -> Tuple[User, str, str]:
        """
        Register a new user.

        Args:
            email: User's email address.
            password: Plain text password.
            full_name: Optional display name.

        Returns:
            Tuple of (User, access_token, refresh_token).

        Raises:
            ValueError: If email already exists.
        """
        existing_user = User.query.filter_by(email=email.lower()).first()
        if existing_user:
            raise ValueError("Email already registered")

        user = User(
            email=email.lower(),
            full_name=full_name
        )
        user.set_password(password)

        db.session.add(user)
        db.session.commit()

        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_refresh_token(identity=str(user.id))

        return user, access_token, refresh_token

    @staticmethod
    def login_user(email: str, password: str) -> Tuple[User, str, str]:
        """
        Authenticate a user and generate tokens.

        Args:
            email: User's email address.
            password: Plain text password.

        Returns:
            Tuple of (User, access_token, refresh_token).

        Raises:
            ValueError: If credentials are invalid.
        """
        user = User.query.filter_by(email=email.lower()).first()

        if not user or not user.check_password(password):
            raise ValueError("Invalid email or password")

        if not user.is_active:
            raise ValueError("Account is deactivated")

        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_refresh_token(identity=str(user.id))

        return user, access_token, refresh_token

    @staticmethod
    def refresh_tokens(user_id: int) -> Tuple[str, str]:
        """
        Generate new access and refresh tokens.

        Args:
            user_id: User's ID from the refresh token.

        Returns:
            Tuple of (access_token, refresh_token).

        Raises:
            ValueError: If user not found or inactive.
        """
        user = User.query.get(user_id)

        if not user:
            raise ValueError("User not found")

        if not user.is_active:
            raise ValueError("Account is deactivated")

        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_refresh_token(identity=str(user.id))

        return access_token, refresh_token

    @staticmethod
    def get_user_by_id(user_id: int) -> Optional[User]:
        """
        Get user by ID.

        Args:
            user_id: User's ID.

        Returns:
            User object or None.
        """
        return User.query.get(user_id)
