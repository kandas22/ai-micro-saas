"""
Marshmallow schemas package.

All validation schemas are imported here for easy access.
"""

from .user import (
    UserSchema,
    UserCreateSchema,
    UserLoginSchema,
    UserResponseSchema,
    TokenSchema,
)
from .category import (
    CategorySchema,
    CategoryCreateSchema,
    CategoryResponseSchema,
)
from .budget import (
    BudgetEntryCreateSchema,
    BudgetEntryUpdateSchema,
    BudgetEntryResponseSchema,
    BudgetBulkCreateSchema,
    BudgetListQuerySchema,
    BudgetListResponseSchema,
    MonthlySummarySchema,
)
from .goal import (
    GoalCreateSchema,
    GoalUpdateSchema,
    GoalResponseSchema,
    GoalListResponseSchema,
)

__all__ = [
    "UserSchema",
    "UserCreateSchema",
    "UserLoginSchema",
    "UserResponseSchema",
    "TokenSchema",
    "CategorySchema",
    "CategoryCreateSchema",
    "CategoryResponseSchema",
    "BudgetEntryCreateSchema",
    "BudgetEntryUpdateSchema",
    "BudgetEntryResponseSchema",
    "BudgetBulkCreateSchema",
    "BudgetListQuerySchema",
    "BudgetListResponseSchema",
    "MonthlySummarySchema",
    "GoalCreateSchema",
    "GoalUpdateSchema",
    "GoalResponseSchema",
    "GoalListResponseSchema",
]
