"""
Financial Category model for organizing budget entries.
"""

import enum
from datetime import datetime, timezone
from ..extensions import db


class CategoryType(str, enum.Enum):
    """Types of financial categories."""

    INCOME = "income"
    SAVINGS = "savings"
    EXPENSE = "expense"


class ExpenseType(str, enum.Enum):
    """Sub-types for expense categories."""

    DEBT_LOAN = "debt_loan"
    INSURANCE = "insurance"
    FIXED = "fixed"
    RECURRING = "recurring"
    MEDICAL = "medical"
    DISCRETIONARY = "discretionary"


class FinancialCategory(db.Model):
    """
    Financial Category model for organizing income, savings, and expenses.

    Attributes:
        id: Primary key.
        name: Category name.
        category_type: Type (income, savings, expense).
        expense_type: Sub-type for expense categories.
        parent_id: Optional parent category for sub-categories.
        user_id: NULL for system categories, user ID for custom categories.
        is_active: Whether the category is active.
    """

    __tablename__ = "financial_categories"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    category_type = db.Column(db.Enum(CategoryType), nullable=False)
    expense_type = db.Column(db.Enum(ExpenseType), nullable=True)
    parent_id = db.Column(
        db.Integer,
        db.ForeignKey("financial_categories.id"),
        nullable=True
    )
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=True,
        index=True
    )
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    # Relationships
    parent = db.relationship(
        "FinancialCategory",
        remote_side=[id],
        backref=db.backref("children", lazy="dynamic")
    )
    user = db.relationship("User", back_populates="custom_categories")
    budget_entries = db.relationship(
        "BudgetEntry",
        back_populates="category",
        lazy="dynamic"
    )

    # Reason: Ensure expense_type is only set for expense categories
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if self.category_type != CategoryType.EXPENSE:
            self.expense_type = None

    @property
    def is_system_category(self) -> bool:
        """Check if this is a system-defined category."""
        return self.user_id is None

    def to_dict(self) -> dict:
        """
        Convert category to dictionary.

        Returns:
            dict: Category data.
        """
        return {
            "id": self.id,
            "name": self.name,
            "category_type": self.category_type.value,
            "expense_type": self.expense_type.value if self.expense_type else None,
            "parent_id": self.parent_id,
            "user_id": self.user_id,
            "is_system_category": self.is_system_category,
            "is_active": self.is_active,
        }

    def __repr__(self) -> str:
        return f"<FinancialCategory {self.name} ({self.category_type.value})>"
