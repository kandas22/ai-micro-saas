"""
Seed default financial categories.

This module creates the system-defined financial categories based on
the Excel template structure.
"""

from typing import List, Dict, Any
from ..extensions import db
from ..models.category import FinancialCategory, CategoryType, ExpenseType


# Default categories based on Excel template
DEFAULT_CATEGORIES: List[Dict[str, Any]] = [
    # Income Categories
    {"name": "Net Salary (Self)", "category_type": CategoryType.INCOME},
    {"name": "Net Salary (Partner)", "category_type": CategoryType.INCOME},
    {"name": "Rental Income", "category_type": CategoryType.INCOME},
    {"name": "Interest/Dividend", "category_type": CategoryType.INCOME},
    {"name": "Other Income", "category_type": CategoryType.INCOME},

    # Savings Categories
    {"name": "Jewel Saving", "category_type": CategoryType.SAVINGS},
    {"name": "Child Savings", "category_type": CategoryType.SAVINGS},
    {"name": "Mutual Funds", "category_type": CategoryType.SAVINGS},
    {"name": "Shares", "category_type": CategoryType.SAVINGS},
    {"name": "LIC/Insurance Investment", "category_type": CategoryType.SAVINGS},
    {"name": "Fixed Deposit", "category_type": CategoryType.SAVINGS},
    {"name": "PPF/EPF", "category_type": CategoryType.SAVINGS},
    {"name": "Other Savings", "category_type": CategoryType.SAVINGS},

    # Expense Categories - Debt/Loan
    {
        "name": "Credit Cards",
        "category_type": CategoryType.EXPENSE,
        "expense_type": ExpenseType.DEBT_LOAN
    },
    {
        "name": "Personal Loan",
        "category_type": CategoryType.EXPENSE,
        "expense_type": ExpenseType.DEBT_LOAN
    },
    {
        "name": "Vehicle Loan",
        "category_type": CategoryType.EXPENSE,
        "expense_type": ExpenseType.DEBT_LOAN
    },
    {
        "name": "Home Loan",
        "category_type": CategoryType.EXPENSE,
        "expense_type": ExpenseType.DEBT_LOAN
    },
    {
        "name": "Other Loans",
        "category_type": CategoryType.EXPENSE,
        "expense_type": ExpenseType.DEBT_LOAN
    },

    # Expense Categories - Insurance
    {
        "name": "Life Insurance",
        "category_type": CategoryType.EXPENSE,
        "expense_type": ExpenseType.INSURANCE
    },
    {
        "name": "Health Insurance",
        "category_type": CategoryType.EXPENSE,
        "expense_type": ExpenseType.INSURANCE
    },
    {
        "name": "Vehicle Insurance",
        "category_type": CategoryType.EXPENSE,
        "expense_type": ExpenseType.INSURANCE
    },
    {
        "name": "Home Insurance",
        "category_type": CategoryType.EXPENSE,
        "expense_type": ExpenseType.INSURANCE
    },
    {
        "name": "Jewel Insurance",
        "category_type": CategoryType.EXPENSE,
        "expense_type": ExpenseType.INSURANCE
    },

    # Expense Categories - Fixed
    {
        "name": "Rent",
        "category_type": CategoryType.EXPENSE,
        "expense_type": ExpenseType.FIXED
    },
    {
        "name": "Electric Bill",
        "category_type": CategoryType.EXPENSE,
        "expense_type": ExpenseType.FIXED
    },
    {
        "name": "Water Bill",
        "category_type": CategoryType.EXPENSE,
        "expense_type": ExpenseType.FIXED
    },
    {
        "name": "Gas Bill",
        "category_type": CategoryType.EXPENSE,
        "expense_type": ExpenseType.FIXED
    },
    {
        "name": "Internet/Phone",
        "category_type": CategoryType.EXPENSE,
        "expense_type": ExpenseType.FIXED
    },
    {
        "name": "Groceries",
        "category_type": CategoryType.EXPENSE,
        "expense_type": ExpenseType.FIXED
    },
    {
        "name": "House Maintenance",
        "category_type": CategoryType.EXPENSE,
        "expense_type": ExpenseType.FIXED
    },

    # Expense Categories - Recurring
    {
        "name": "School Fees",
        "category_type": CategoryType.EXPENSE,
        "expense_type": ExpenseType.RECURRING
    },
    {
        "name": "Tuition",
        "category_type": CategoryType.EXPENSE,
        "expense_type": ExpenseType.RECURRING
    },
    {
        "name": "Subscriptions",
        "category_type": CategoryType.EXPENSE,
        "expense_type": ExpenseType.RECURRING
    },
    {
        "name": "Society Maintenance",
        "category_type": CategoryType.EXPENSE,
        "expense_type": ExpenseType.RECURRING
    },
    {
        "name": "Maid/Cook/Driver",
        "category_type": CategoryType.EXPENSE,
        "expense_type": ExpenseType.RECURRING
    },

    # Expense Categories - Medical
    {
        "name": "Doctor Visits",
        "category_type": CategoryType.EXPENSE,
        "expense_type": ExpenseType.MEDICAL
    },
    {
        "name": "Medicines",
        "category_type": CategoryType.EXPENSE,
        "expense_type": ExpenseType.MEDICAL
    },
    {
        "name": "Health Checkups",
        "category_type": CategoryType.EXPENSE,
        "expense_type": ExpenseType.MEDICAL
    },
    {
        "name": "Other Medical",
        "category_type": CategoryType.EXPENSE,
        "expense_type": ExpenseType.MEDICAL
    },

    # Expense Categories - Discretionary
    {
        "name": "Shopping",
        "category_type": CategoryType.EXPENSE,
        "expense_type": ExpenseType.DISCRETIONARY
    },
    {
        "name": "Eating Out",
        "category_type": CategoryType.EXPENSE,
        "expense_type": ExpenseType.DISCRETIONARY
    },
    {
        "name": "Movies/Entertainment",
        "category_type": CategoryType.EXPENSE,
        "expense_type": ExpenseType.DISCRETIONARY
    },
    {
        "name": "Travel/Vacation",
        "category_type": CategoryType.EXPENSE,
        "expense_type": ExpenseType.DISCRETIONARY
    },
    {
        "name": "Gifts",
        "category_type": CategoryType.EXPENSE,
        "expense_type": ExpenseType.DISCRETIONARY
    },
    {
        "name": "Personal Care",
        "category_type": CategoryType.EXPENSE,
        "expense_type": ExpenseType.DISCRETIONARY
    },
    {
        "name": "Hobbies",
        "category_type": CategoryType.EXPENSE,
        "expense_type": ExpenseType.DISCRETIONARY
    },
    {
        "name": "Miscellaneous",
        "category_type": CategoryType.EXPENSE,
        "expense_type": ExpenseType.DISCRETIONARY
    },
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
