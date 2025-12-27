## FEATURE:

Financial Budget Tracking System - A comprehensive personal finance management application for tracking income, savings goals, and expenses with monthly budget planning and financial goal tracking.

The application replaces manual Excel-based financial tracking with a modern web application featuring:
- Income tracking from multiple sources
- Savings goals management
- Expense categorization and tracking
- Monthly and yearly financial summaries
- Surplus/Deficit calculations
- Financial data visualizations

## EXAMPLES:

See `PRPs/financial_budget_tracker.md` for comprehensive implementation plan.

The Excel template structure includes:
- Income categories (Net Salary - Self, Partner, Rental Income, Interest/Dividend, Other Income)
- Savings/Investment goals (Jewel Saving, Child Savings, Mutual Funds, Shares, LIC, etc.)
- Expense categories organized by type:
  - Debt/Loan (Credit Cards, Personal Loans, Vehicle Loan, Home Loan, etc.)
  - Insurance (Life, Health, Vehicle, Jewel, etc.)
  - Fixed Expenses (Rent, Utilities, Groceries, etc.)
  - Recurring Expenses (School fees, Tuition, etc.)
  - Medical Expenses
  - Discretionary Expenses (Shopping, Eating out, Movies, etc.)

## DOCUMENTATION:

- FastAPI: https://fastapi.tiangolo.com/tutorial/
- React: https://react.dev/learn
- Tailwind CSS: https://tailwindcss.com/docs
- Recharts: https://recharts.org/en-US/ (for financial charts)
- SQLAlchemy: https://docs.sqlalchemy.org/
- Pydantic: https://docs.pydantic.dev/

See also:
- `skills/backend/SKILL.md` - Backend implementation patterns
- `skills/frontend/SKILL.md` - Frontend implementation patterns
- `agents/backend_agent.md` - Backend agent guidelines

## OTHER CONSIDERATIONS:

- **Monetary Precision**: Always use Decimal type for monetary values, never float
- **User Isolation**: All budget data must be filtered by user_id to ensure data isolation
- **Category Management**: System categories are seeded on startup; users can add custom categories
- **Budget Entries**: Unique constraint on (user_id, category_id, month, year) prevents duplicates
- **JWT Security**: Access tokens expire in 15 minutes, refresh tokens in 7 days
- **Database**: PostgreSQL recommended for production, SQLite acceptable for development
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Data Visualization**: Use Recharts or similar library for financial charts
- **Time Zones**: All dates should use timezone-aware datetime objects
- **Bulk Operations**: Support bulk create/update for monthly budget entries for better UX
