"""
Category service for managing financial categories.
"""

from typing import List, Optional
from sqlalchemy import or_
from ..extensions import db
from ..models.category import FinancialCategory, CategoryType, ExpenseType


class CategoryService:
    """Service class for category operations."""

    @staticmethod
    def get_all_categories(
        user_id: int,
        category_type: Optional[CategoryType] = None,
        include_inactive: bool = False
    ) -> List[FinancialCategory]:
        """
        Get all categories available to a user (system + custom).

        Args:
            user_id: User's ID for filtering custom categories.
            category_type: Optional filter by category type.
            include_inactive: Whether to include inactive categories.

        Returns:
            List of FinancialCategory objects.
        """
        query = FinancialCategory.query.filter(
            or_(
                FinancialCategory.user_id.is_(None),  # System categories
                FinancialCategory.user_id == user_id   # User's custom categories
            )
        )

        if not include_inactive:
            query = query.filter(FinancialCategory.is_active.is_(True))

        if category_type:
            query = query.filter(FinancialCategory.category_type == category_type)

        return query.order_by(
            FinancialCategory.category_type,
            FinancialCategory.expense_type,
            FinancialCategory.name
        ).all()

    @staticmethod
    def get_category_by_id(
        category_id: int,
        user_id: int
    ) -> Optional[FinancialCategory]:
        """
        Get a specific category by ID.

        Args:
            category_id: Category's ID.
            user_id: User's ID for access control.

        Returns:
            FinancialCategory object or None.
        """
        return FinancialCategory.query.filter(
            FinancialCategory.id == category_id,
            or_(
                FinancialCategory.user_id.is_(None),
                FinancialCategory.user_id == user_id
            )
        ).first()

    @staticmethod
    def create_category(
        user_id: int,
        name: str,
        category_type: CategoryType,
        expense_type: Optional[ExpenseType] = None,
        parent_id: Optional[int] = None
    ) -> FinancialCategory:
        """
        Create a custom category for a user.

        Args:
            user_id: User's ID.
            name: Category name.
            category_type: Type of category.
            expense_type: Sub-type for expenses (optional).
            parent_id: Parent category ID (optional).

        Returns:
            Created FinancialCategory object.

        Raises:
            ValueError: If validation fails.
        """
        # Reason: Validate expense_type only for expense categories
        if category_type != CategoryType.EXPENSE and expense_type:
            raise ValueError("expense_type can only be set for expense categories")

        # Validate parent category exists and is accessible
        if parent_id:
            parent = CategoryService.get_category_by_id(parent_id, user_id)
            if not parent:
                raise ValueError("Parent category not found")
            if parent.category_type != category_type:
                raise ValueError("Parent category must be of the same type")

        category = FinancialCategory(
            name=name,
            category_type=category_type,
            expense_type=expense_type,
            parent_id=parent_id,
            user_id=user_id
        )

        db.session.add(category)
        db.session.commit()

        return category

    @staticmethod
    def update_category(
        category_id: int,
        user_id: int,
        **kwargs
    ) -> FinancialCategory:
        """
        Update a custom category.

        Args:
            category_id: Category's ID.
            user_id: User's ID for access control.
            **kwargs: Fields to update (name, is_active).

        Returns:
            Updated FinancialCategory object.

        Raises:
            ValueError: If category not found or is a system category.
        """
        category = FinancialCategory.query.filter(
            FinancialCategory.id == category_id,
            FinancialCategory.user_id == user_id  # Only custom categories
        ).first()

        if not category:
            raise ValueError("Category not found or cannot be modified")

        allowed_fields = {"name", "is_active"}
        for key, value in kwargs.items():
            if key in allowed_fields and value is not None:
                setattr(category, key, value)

        db.session.commit()
        return category

    @staticmethod
    def delete_category(category_id: int, user_id: int) -> bool:
        """
        Delete (deactivate) a custom category.

        Args:
            category_id: Category's ID.
            user_id: User's ID for access control.

        Returns:
            True if deleted successfully.

        Raises:
            ValueError: If category not found or is a system category.
        """
        category = FinancialCategory.query.filter(
            FinancialCategory.id == category_id,
            FinancialCategory.user_id == user_id
        ).first()

        if not category:
            raise ValueError("Category not found or cannot be deleted")

        # Soft delete
        category.is_active = False
        db.session.commit()

        return True

    @staticmethod
    def get_categories_by_type(
        user_id: int,
        category_type: CategoryType
    ) -> List[FinancialCategory]:
        """
        Get categories filtered by type.

        Args:
            user_id: User's ID.
            category_type: Type to filter by.

        Returns:
            List of FinancialCategory objects.
        """
        return CategoryService.get_all_categories(
            user_id=user_id,
            category_type=category_type
        )
