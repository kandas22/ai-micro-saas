"""
User model for authentication and user management.
"""

from datetime import datetime, timezone
from ..extensions import db
import bcrypt


class User(db.Model):
    """
    User model representing application users.

    Attributes:
        id: Primary key.
        email: Unique email address.
        hashed_password: Bcrypt hashed password.
        full_name: User's display name.
        is_active: Whether the user account is active.
        created_at: Account creation timestamp.
        updated_at: Last update timestamp.
    """

    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    hashed_password = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(100), nullable=True)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    updated_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    budget_entries = db.relationship(
        "BudgetEntry",
        back_populates="user",
        lazy="dynamic",
        cascade="all, delete-orphan"
    )
    savings_goals = db.relationship(
        "SavingsGoal",
        back_populates="user",
        lazy="dynamic",
        cascade="all, delete-orphan"
    )
    custom_categories = db.relationship(
        "FinancialCategory",
        back_populates="user",
        lazy="dynamic",
        cascade="all, delete-orphan"
    )

    def set_password(self, password: str) -> None:
        """
        Hash and set the user's password.

        Args:
            password (str): Plain text password to hash.
        """
        salt = bcrypt.gensalt()
        self.hashed_password = bcrypt.hashpw(
            password.encode("utf-8"),
            salt
        ).decode("utf-8")

    def check_password(self, password: str) -> bool:
        """
        Verify a password against the stored hash.

        Args:
            password (str): Plain text password to verify.

        Returns:
            bool: True if password matches, False otherwise.
        """
        return bcrypt.checkpw(
            password.encode("utf-8"),
            self.hashed_password.encode("utf-8")
        )

    def to_dict(self) -> dict:
        """
        Convert user to dictionary (excludes password).

        Returns:
            dict: User data without sensitive information.
        """
        return {
            "id": self.id,
            "email": self.email,
            "full_name": self.full_name,
            "is_active": self.is_active,
            "created_at": self.created_at,
        }

    def __repr__(self) -> str:
        return f"<User {self.email}>"
