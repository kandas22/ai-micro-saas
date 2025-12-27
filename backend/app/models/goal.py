"""
Savings Goal model for tracking financial goals.
"""

from datetime import datetime, timezone
from decimal import Decimal
from ..extensions import db


class SavingsGoal(db.Model):
    """
    Savings Goal model for tracking financial targets.

    Attributes:
        id: Primary key.
        user_id: Foreign key to the user.
        name: Goal name.
        target_amount: Target amount to save.
        current_amount: Current saved amount.
        target_date: Optional target date.
        category_id: Optional linked category.
        is_active: Whether the goal is active.
        created_at: Creation timestamp.
    """

    __tablename__ = "savings_goals"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False,
        index=True
    )
    name = db.Column(db.String(100), nullable=False)
    target_amount = db.Column(
        db.Numeric(15, 2),
        nullable=False
    )
    current_amount = db.Column(
        db.Numeric(15, 2),
        default=Decimal("0.00"),
        nullable=False
    )
    target_date = db.Column(db.Date, nullable=True)
    category_id = db.Column(
        db.Integer,
        db.ForeignKey("financial_categories.id"),
        nullable=True
    )
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    # Relationships
    user = db.relationship("User", back_populates="savings_goals")
    category = db.relationship("FinancialCategory")

    @property
    def progress_percentage(self) -> float:
        """Calculate goal completion percentage."""
        if self.target_amount == 0:
            return 100.0
        return float(
            (self.current_amount / self.target_amount) * 100
        )

    @property
    def remaining_amount(self) -> Decimal:
        """Calculate remaining amount to reach goal."""
        remaining = self.target_amount - self.current_amount
        return max(Decimal("0.00"), remaining)

    def to_dict(self) -> dict:
        """
        Convert goal to dictionary.

        Returns:
            dict: Goal data.
        """
        return {
            "id": self.id,
            "user_id": self.user_id,
            "name": self.name,
            "target_amount": str(self.target_amount),
            "current_amount": str(self.current_amount),
            "remaining_amount": str(self.remaining_amount),
            "progress_percentage": round(self.progress_percentage, 2),
            "target_date": self.target_date,
            "category_id": self.category_id,
            "is_active": self.is_active,
            "created_at": self.created_at,
        }

    def __repr__(self) -> str:
        return f"<SavingsGoal {self.name}>"
