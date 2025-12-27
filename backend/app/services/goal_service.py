"""
Savings Goal service for managing financial goals.
"""

from typing import List, Optional
from decimal import Decimal
from datetime import date
from sqlalchemy import or_
from ..extensions import db
from ..models.goal import SavingsGoal
from ..models.category import FinancialCategory


class GoalService:
    """Service class for savings goal operations."""

    @staticmethod
    def get_goals(
        user_id: int,
        include_inactive: bool = False
    ) -> List[SavingsGoal]:
        """
        Get all goals for a user.

        Args:
            user_id: User's ID.
            include_inactive: Whether to include inactive goals.

        Returns:
            List of SavingsGoal objects.
        """
        query = SavingsGoal.query.filter(SavingsGoal.user_id == user_id)

        if not include_inactive:
            query = query.filter(SavingsGoal.is_active.is_(True))

        return query.order_by(SavingsGoal.created_at.desc()).all()

    @staticmethod
    def get_goal_by_id(goal_id: int, user_id: int) -> Optional[SavingsGoal]:
        """
        Get a specific goal by ID.

        Args:
            goal_id: Goal ID.
            user_id: User's ID for access control.

        Returns:
            SavingsGoal object or None.
        """
        return SavingsGoal.query.filter(
            SavingsGoal.id == goal_id,
            SavingsGoal.user_id == user_id
        ).first()

    @staticmethod
    def create_goal(
        user_id: int,
        name: str,
        target_amount: Decimal,
        current_amount: Decimal = Decimal("0.00"),
        target_date: Optional[date] = None,
        category_id: Optional[int] = None
    ) -> SavingsGoal:
        """
        Create a new savings goal.

        Args:
            user_id: User's ID.
            name: Goal name.
            target_amount: Target amount.
            current_amount: Current saved amount.
            target_date: Optional target date.
            category_id: Optional linked category.

        Returns:
            Created SavingsGoal object.

        Raises:
            ValueError: If validation fails.
        """
        # Validate category if provided
        if category_id:
            category = FinancialCategory.query.filter(
                FinancialCategory.id == category_id,
                or_(
                    FinancialCategory.user_id.is_(None),
                    FinancialCategory.user_id == user_id
                )
            ).first()

            if not category:
                raise ValueError("Category not found or not accessible")

        goal = SavingsGoal(
            user_id=user_id,
            name=name,
            target_amount=target_amount,
            current_amount=current_amount,
            target_date=target_date,
            category_id=category_id
        )

        db.session.add(goal)
        db.session.commit()

        return goal

    @staticmethod
    def update_goal(goal_id: int, user_id: int, **kwargs) -> SavingsGoal:
        """
        Update a savings goal.

        Args:
            goal_id: Goal ID.
            user_id: User's ID for access control.
            **kwargs: Fields to update.

        Returns:
            Updated SavingsGoal object.

        Raises:
            ValueError: If goal not found.
        """
        goal = GoalService.get_goal_by_id(goal_id, user_id)

        if not goal:
            raise ValueError("Goal not found")

        allowed_fields = {
            "name", "target_amount", "current_amount",
            "target_date", "is_active"
        }

        for key, value in kwargs.items():
            if key in allowed_fields and value is not None:
                setattr(goal, key, value)

        db.session.commit()
        return goal

    @staticmethod
    def delete_goal(goal_id: int, user_id: int) -> bool:
        """
        Delete a savings goal.

        Args:
            goal_id: Goal ID.
            user_id: User's ID for access control.

        Returns:
            True if deleted successfully.

        Raises:
            ValueError: If goal not found.
        """
        goal = GoalService.get_goal_by_id(goal_id, user_id)

        if not goal:
            raise ValueError("Goal not found")

        db.session.delete(goal)
        db.session.commit()

        return True

    @staticmethod
    def update_goal_progress(
        goal_id: int,
        user_id: int,
        amount: Decimal
    ) -> SavingsGoal:
        """
        Add to goal's current amount.

        Args:
            goal_id: Goal ID.
            user_id: User's ID for access control.
            amount: Amount to add (can be negative for withdrawal).

        Returns:
            Updated SavingsGoal object.

        Raises:
            ValueError: If goal not found or result would be negative.
        """
        goal = GoalService.get_goal_by_id(goal_id, user_id)

        if not goal:
            raise ValueError("Goal not found")

        new_amount = goal.current_amount + amount

        if new_amount < 0:
            raise ValueError("Cannot have negative savings")

        goal.current_amount = new_amount
        db.session.commit()

        return goal
