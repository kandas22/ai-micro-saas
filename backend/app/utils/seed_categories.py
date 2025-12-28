"""
Seed default financial categories.

This module creates the system-defined financial categories based on
the Excel template structure.
"""

from typing import List, Dict, Any
from ..extensions import db
from ..models.category import FinancialCategory, CategoryType, ExpenseType


# Default categories based on Excel template (using string values for DB compatibility)
DEFAULT_CATEGORIES: List[Dict[str, Any]] = [
    # Income Categories
    {"name": "Net Salary (Self)", "category_type": "income"},
    {"name": "Net Salary (Partner)", "category_type": "income"},
    {"name": "Rental Income", "category_type": "income"},
    {"name": "Interest/Dividend", "category_type": "income"},
    {"name": "Other Income", "category_type": "income"},

    # Savings Categories
    {"name": "Jewel Saving", "category_type": "savings"},
    {"name": "Child Savings", "category_type": "savings"},
    {"name": "Mutual Funds", "category_type": "savings"},
    {"name": "Shares", "category_type": "savings"},
    {"name": "LIC/Insurance Investment", "category_type": "savings"},
    {"name": "Fixed Deposit", "category_type": "savings"},
    {"name": "PPF/EPF", "category_type": "savings"},
    {"name": "Other Savings", "category_type": "savings"},

    # Expense Categories - Debt/Loan
    {"name": "Credit Cards", "category_type": "expense", "expense_type": "debt_loan"},
    {"name": "Personal Loan", "category_type": "expense", "expense_type": "debt_loan"},
    {"name": "Vehicle Loan", "category_type": "expense", "expense_type": "debt_loan"},
    {"name": "Home Loan", "category_type": "expense", "expense_type": "debt_loan"},
    {"name": "Other Loans", "category_type": "expense", "expense_type": "debt_loan"},

    # Expense Categories - Insurance
    {"name": "Life Insurance", "category_type": "expense", "expense_type": "insurance"},
    {"name": "Health Insurance", "category_type": "expense", "expense_type": "insurance"},
    {"name": "Vehicle Insurance", "category_type": "expense", "expense_type": "insurance"},
    {"name": "Home Insurance", "category_type": "expense", "expense_type": "insurance"},
    {"name": "Jewel Insurance", "category_type": "expense", "expense_type": "insurance"},

    # Expense Categories - Fixed
    {"name": "Rent", "category_type": "expense", "expense_type": "fixed"},
    {"name": "Electric Bill", "category_type": "expense", "expense_type": "fixed"},
    {"name": "Water Bill", "category_type": "expense", "expense_type": "fixed"},
    {"name": "Gas Bill", "category_type": "expense", "expense_type": "fixed"},
    {"name": "Internet/Phone", "category_type": "expense", "expense_type": "fixed"},
    {"name": "Groceries", "category_type": "expense", "expense_type": "fixed"},
    {"name": "House Maintenance", "category_type": "expense", "expense_type": "fixed"},

    # Expense Categories - Recurring
    {"name": "School Fees", "category_type": "expense", "expense_type": "recurring"},
    {"name": "Tuition", "category_type": "expense", "expense_type": "recurring"},
    {"name": "Subscriptions", "category_type": "expense", "expense_type": "recurring"},
    {"name": "Society Maintenance", "category_type": "expense", "expense_type": "recurring"},
    {"name": "Maid/Cook/Driver", "category_type": "expense", "expense_type": "recurring"},

    # Expense Categories - Medical
    {"name": "Doctor Visits", "category_type": "expense", "expense_type": "medical"},
    {"name": "Medicines", "category_type": "expense", "expense_type": "medical"},
    {"name": "Health Checkups", "category_type": "expense", "expense_type": "medical"},
    {"name": "Other Medical", "category_type": "expense", "expense_type": "medical"},

    # Expense Categories - Discretionary
    {"name": "Shopping", "category_type": "expense", "expense_type": "discretionary"},
    {"name": "Eating Out", "category_type": "expense", "expense_type": "discretionary"},
    {"name": "Movies/Entertainment", "category_type": "expense", "expense_type": "discretionary"},
    {"name": "Travel/Vacation", "category_type": "expense", "expense_type": "discretionary"},
    {"name": "Gifts", "category_type": "expense", "expense_type": "discretionary"},
    {"name": "Personal Care", "category_type": "expense", "expense_type": "discretionary"},
    {"name": "Hobbies", "category_type": "expense", "expense_type": "discretionary"},
    {"name": "Miscellaneous", "category_type": "expense", "expense_type": "discretionary"},
]


def seed_default_categories() -> int:
    """
    Seed the database with default financial categories.

    This function is idempotent - it will not create duplicates if
    categories already exist.

    Returns:
        int: Number of categories created.
    """
    created_count = 0

    for cat_data in DEFAULT_CATEGORIES:
        # Check if category already exists (by name and type for system categories)
        existing = FinancialCategory.query.filter(
            FinancialCategory.name == cat_data["name"],
            FinancialCategory.category_type == cat_data["category_type"],
            FinancialCategory.user_id.is_(None)  # System category
        ).first()

        if not existing:
            category = FinancialCategory(
                name=cat_data["name"],
                category_type=cat_data["category_type"],
                expense_type=cat_data.get("expense_type"),
                user_id=None,  # System category
                is_active=True
            )
            db.session.add(category)
            created_count += 1

    if created_count > 0:
        db.session.commit()
        print(f"Seeded {created_count} default categories")
    else:
        print("Default categories already exist")

    return created_count


def get_category_summary() -> Dict[str, int]:
    """
    Get a summary of categories by type.

    Returns:
        Dict with category type counts.
    """
    summary = {}
    for cat_type in CategoryType:
        count = FinancialCategory.query.filter(
            FinancialCategory.category_type == cat_type,
            FinancialCategory.user_id.is_(None),
            FinancialCategory.is_active.is_(True)
        ).count()
        summary[cat_type.value] = count

    return summary
