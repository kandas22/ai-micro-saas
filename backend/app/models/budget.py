"""
Budget Entry model for tracking monthly budget data.
"""

from datetime import datetime, timezone
from decimal import Decimal
from sqlalchemy import UniqueConstraint
from ..extensions import db


class BudgetEntry(db.Model):
    """
    Budget Entry model for tracking budgeted and actual amounts.

    Attributes:
        id: Primary key.
        user_id: Foreign key to the user.
        category_id: Foreign key to the financial category.
        month: Month (1-12).
        year: Year.
        budgeted_amount: Planned budget amount.
        actual_amount: Actual spent/received amount.
        notes: Optional notes.
        created_at: Creation timestamp.
        updated_at: Last update timestamp.
    """

    __tablename__ = "budget_entries"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False,
        index=True
    )
    category_id = db.Column(
        db.Integer,
        db.ForeignKey("financial_categories.id"),
        nullable=False,
        index=True
    )
    month = db.Column(db.Integer, nullable=False)
    year = db.Column(db.Integer, nullable=False)
    budgeted_amount = db.Column(
        db.Numeric(15, 2),
        default=Decimal("0.00"),
        nullable=False
    )
    actual_amount = db.Column(
        db.Numeric(15, 2),
        default=Decimal("0.00"),
        nullable=False
    )
    notes = db.Column(db.Text, nullable=True)
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
    user = db.relationship("User", back_populates="budget_entries")
    category = db.relationship("FinancialCategory", back_populates="budget_entries")

    # Unique constraint to prevent duplicate entries
    __table_args__ = (
        UniqueConstraint(
            "user_id", "category_id", "month", "year",
            name="uq_user_category_month_year"
        ),
        db.Index("idx_budget_user_year_month", "user_id", "year", "month"),
    )

    def to_dict(self) -> dict:
        """
        Convert budget entry to dictionary.

        Returns:
            dict: Budget entry data.
        """
        return {
            "id": self.id,
            "user_id": self.user_id,
            "category_id": self.category_id,
            "category": self.category.to_dict() if self.category else None,
            "month": self.month,
            "year": self.year,
            "budgeted_amount": str(self.budgeted_amount),
            "actual_amount": str(self.actual_amount),
            "notes": self.notes,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }

    def __repr__(self) -> str:
        return f"<BudgetEntry {self.category_id} {self.month}/{self.year}>"
