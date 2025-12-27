"""
Budget service for managing budget entries.
"""

from typing import List, Optional, Dict, Any
from decimal import Decimal
from sqlalchemy import func, and_, or_
from sqlalchemy.exc import IntegrityError
from ..extensions import db
from ..models.budget import BudgetEntry
from ..models.category import FinancialCategory, CategoryType


class BudgetService:
    """Service class for budget entry operations."""

    @staticmethod
    def get_budget_entries(
        user_id: int,
        month: Optional[int] = None,
        year: Optional[int] = None,
        category_id: Optional[int] = None,
        category_type: Optional[CategoryType] = None
    ) -> List[BudgetEntry]:
        """
        Get budget entries with optional filters.

        Args:
            user_id: User's ID.
            month: Optional month filter (1-12).
            year: Optional year filter.
            category_id: Optional category filter.
            category_type: Optional category type filter.

        Returns:
            List of BudgetEntry objects.
        """
        query = BudgetEntry.query.filter(BudgetEntry.user_id == user_id)

        if month is not None:
            query = query.filter(BudgetEntry.month == month)

        if year is not None:
            query = query.filter(BudgetEntry.year == year)

        if category_id is not None:
            query = query.filter(BudgetEntry.category_id == category_id)

        if category_type is not None:
            query = query.join(FinancialCategory).filter(
                FinancialCategory.category_type == category_type
            )

        return query.order_by(
            BudgetEntry.year.desc(),
            BudgetEntry.month.desc(),
            BudgetEntry.category_id
        ).all()

    @staticmethod
    def get_budget_entry_by_id(
        budget_id: int,
        user_id: int
    ) -> Optional[BudgetEntry]:
        """
        Get a specific budget entry by ID.

        Args:
            budget_id: Budget entry ID.
            user_id: User's ID for access control.

        Returns:
            BudgetEntry object or None.
        """
        return BudgetEntry.query.filter(
            BudgetEntry.id == budget_id,
            BudgetEntry.user_id == user_id
        ).first()

    @staticmethod
    def create_budget_entry(
        user_id: int,
        category_id: int,
        month: int,
        year: int,
        budgeted_amount: Decimal = Decimal("0.00"),
        actual_amount: Decimal = Decimal("0.00"),
        notes: Optional[str] = None
    ) -> BudgetEntry:
        """
        Create a new budget entry.

        Args:
            user_id: User's ID.
            category_id: Category ID.
            month: Month (1-12).
            year: Year.
            budgeted_amount: Budgeted amount.
            actual_amount: Actual amount.
            notes: Optional notes.

        Returns:
            Created BudgetEntry object.

        Raises:
            ValueError: If validation fails or entry already exists.
        """
        # Validate category exists and is accessible
        category = FinancialCategory.query.filter(
            FinancialCategory.id == category_id,
            or_(
                FinancialCategory.user_id.is_(None),
                FinancialCategory.user_id == user_id
            )
        ).first()

        if not category:
            raise ValueError("Category not found or not accessible")

        if not category.is_active:
            raise ValueError("Cannot create entry for inactive category")

        # Check for existing entry
        existing = BudgetEntry.query.filter(
            BudgetEntry.user_id == user_id,
            BudgetEntry.category_id == category_id,
            BudgetEntry.month == month,
            BudgetEntry.year == year
        ).first()

        if existing:
            raise ValueError(
                f"Budget entry already exists for this category in {month}/{year}"
            )

        entry = BudgetEntry(
            user_id=user_id,
            category_id=category_id,
            month=month,
            year=year,
            budgeted_amount=budgeted_amount,
            actual_amount=actual_amount,
            notes=notes
        )

        db.session.add(entry)
        db.session.commit()

        return entry

    @staticmethod
    def update_budget_entry(
        budget_id: int,
        user_id: int,
        **kwargs
    ) -> BudgetEntry:
        """
        Update a budget entry.

        Args:
            budget_id: Budget entry ID.
            user_id: User's ID for access control.
            **kwargs: Fields to update.

        Returns:
            Updated BudgetEntry object.

        Raises:
            ValueError: If entry not found.
        """
        entry = BudgetService.get_budget_entry_by_id(budget_id, user_id)

        if not entry:
            raise ValueError("Budget entry not found")

        allowed_fields = {"budgeted_amount", "actual_amount", "notes"}
        for key, value in kwargs.items():
            if key in allowed_fields and value is not None:
                setattr(entry, key, value)

        db.session.commit()
        return entry

    @staticmethod
    def delete_budget_entry(budget_id: int, user_id: int) -> bool:
        """
        Delete a budget entry.

        Args:
            budget_id: Budget entry ID.
            user_id: User's ID for access control.

        Returns:
            True if deleted successfully.

        Raises:
            ValueError: If entry not found.
        """
        entry = BudgetService.get_budget_entry_by_id(budget_id, user_id)

        if not entry:
            raise ValueError("Budget entry not found")

        db.session.delete(entry)
        db.session.commit()

        return True

    @staticmethod
    def bulk_create_or_update(
        user_id: int,
        entries: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Bulk create or update budget entries.

        Args:
            user_id: User's ID.
            entries: List of entry data dicts.

        Returns:
            Dict with created and updated counts.
        """
        created_count = 0
        updated_count = 0
        errors = []

        for entry_data in entries:
            try:
                existing = BudgetEntry.query.filter(
                    BudgetEntry.user_id == user_id,
                    BudgetEntry.category_id == entry_data["category_id"],
                    BudgetEntry.month == entry_data["month"],
                    BudgetEntry.year == entry_data["year"]
                ).first()

                if existing:
                    # Update existing entry
                    if "budgeted_amount" in entry_data:
                        existing.budgeted_amount = entry_data["budgeted_amount"]
                    if "actual_amount" in entry_data:
                        existing.actual_amount = entry_data["actual_amount"]
                    if "notes" in entry_data:
                        existing.notes = entry_data["notes"]
                    updated_count += 1
                else:
                    # Create new entry
                    entry = BudgetEntry(
                        user_id=user_id,
                        category_id=entry_data["category_id"],
                        month=entry_data["month"],
                        year=entry_data["year"],
                        budgeted_amount=entry_data.get(
                            "budgeted_amount", Decimal("0.00")
                        ),
                        actual_amount=entry_data.get(
                            "actual_amount", Decimal("0.00")
                        ),
                        notes=entry_data.get("notes")
                    )
                    db.session.add(entry)
                    created_count += 1

            except Exception as e:
                errors.append({
                    "category_id": entry_data.get("category_id"),
                    "error": str(e)
                })

        db.session.commit()

        return {
            "created": created_count,
            "updated": updated_count,
            "errors": errors
        }

    @staticmethod
    def get_monthly_summary(
        user_id: int,
        year: int,
        month: int
    ) -> Dict[str, Any]:
        """
        Calculate monthly financial summary.

        Args:
            user_id: User's ID.
            year: Year.
            month: Month (1-12).

        Returns:
            Dict with income, expenses, savings, and surplus/deficit.
        """
        # Get all entries for the month
        entries = BudgetEntry.query.join(FinancialCategory).filter(
            BudgetEntry.user_id == user_id,
            BudgetEntry.year == year,
            BudgetEntry.month == month
        ).all()

        # Calculate totals by category type
        total_income = Decimal("0.00")
        total_expenses = Decimal("0.00")
        total_savings = Decimal("0.00")

        income_breakdown = []
        expense_breakdown = []
        savings_breakdown = []

        for entry in entries:
            category = entry.category
            amount = entry.actual_amount or entry.budgeted_amount

            if category.category_type == CategoryType.INCOME:
                total_income += amount
                income_breakdown.append({
                    "category_id": category.id,
                    "category_name": category.name,
                    "budgeted": str(entry.budgeted_amount),
                    "actual": str(entry.actual_amount)
                })
            elif category.category_type == CategoryType.EXPENSE:
                total_expenses += amount
                expense_breakdown.append({
                    "category_id": category.id,
                    "category_name": category.name,
                    "expense_type": category.expense_type.value if category.expense_type else None,
                    "budgeted": str(entry.budgeted_amount),
                    "actual": str(entry.actual_amount)
                })
            elif category.category_type == CategoryType.SAVINGS:
                total_savings += amount
                savings_breakdown.append({
                    "category_id": category.id,
                    "category_name": category.name,
                    "budgeted": str(entry.budgeted_amount),
                    "actual": str(entry.actual_amount)
                })

        surplus_deficit = total_income - total_expenses - total_savings

        return {
            "month": month,
            "year": year,
            "total_income": str(total_income),
            "total_expenses": str(total_expenses),
            "total_savings": str(total_savings),
            "surplus_deficit": str(surplus_deficit),
            "income_breakdown": income_breakdown,
            "expense_breakdown": expense_breakdown,
            "savings_breakdown": savings_breakdown
        }

    @staticmethod
    def get_yearly_summary(user_id: int, year: int) -> Dict[str, Any]:
        """
        Calculate yearly financial summary.

        Args:
            user_id: User's ID.
            year: Year.

        Returns:
            Dict with yearly totals and monthly breakdown.
        """
        monthly_summaries = []
        yearly_income = Decimal("0.00")
        yearly_expenses = Decimal("0.00")
        yearly_savings = Decimal("0.00")

        for month in range(1, 13):
            summary = BudgetService.get_monthly_summary(user_id, year, month)
            monthly_summaries.append({
                "month": month,
                "total_income": summary["total_income"],
                "total_expenses": summary["total_expenses"],
                "total_savings": summary["total_savings"],
                "surplus_deficit": summary["surplus_deficit"]
            })
            yearly_income += Decimal(summary["total_income"])
            yearly_expenses += Decimal(summary["total_expenses"])
            yearly_savings += Decimal(summary["total_savings"])

        return {
            "year": year,
            "total_income": str(yearly_income),
            "total_expenses": str(yearly_expenses),
            "total_savings": str(yearly_savings),
            "surplus_deficit": str(yearly_income - yearly_expenses - yearly_savings),
            "monthly_breakdown": monthly_summaries
        }
