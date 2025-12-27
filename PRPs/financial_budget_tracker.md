name: "Financial Budget Tracking System"
description: |
  A comprehensive personal finance management application for tracking income, savings goals, and expenses with monthly budget planning and financial goal tracking.

## Purpose
Template optimized for AI agents to implement a full-stack financial budget tracking application with modern UI and robust database design based on Excel-based financial tracking requirements.

## Core Principles
1. **Context is King**: Include ALL necessary documentation, examples, and caveats
2. **Validation Loops**: Provide executable tests/lints the AI can run and fix
3. **Information Dense**: Use keywords and patterns from the codebase
4. **Progressive Success**: Start simple, validate, then enhance
5. **Global rules**: Be sure to follow all rules in CLAUDE.md

---

## Goal
Build a production-ready financial budget tracking web application that allows users to:
- Track income from multiple sources monthly
- Set and monitor financial savings goals
- Categorize and track expenses across multiple categories
- View monthly and yearly financial summaries
- Calculate surplus/deficit cash flow
- Visualize financial data with charts and graphs

## Why
- **Business value**: Replace manual Excel tracking with an automated, accessible web application
- **User impact**: Provides real-time financial insights, goal tracking, and better financial planning
- **Problems solved**: Eliminates manual calculations, provides data visualization, enables multi-device access

## What
A full-stack application with:
- **Backend**: FastAPI REST API with SQLAlchemy ORM and PostgreSQL database
- **Frontend**: React + TypeScript with Tailwind CSS for modern, responsive UI
- **Features**: 
  - User authentication (JWT-based)
  - Budget entry and management (monthly/yearly)
  - Financial categories management (Income, Savings, Expenses with sub-categories)
  - Dashboard with financial summaries and charts
  - Monthly budget vs actual comparisons

### Success Criteria
- [ ] User can authenticate and manage their profile
- [ ] Users can create and manage budget entries for each month
- [ ] All financial categories from Excel template are supported
- [ ] Monthly and yearly summaries calculate correctly
- [ ] Surplus/Deficit calculations are accurate
- [ ] Dashboard displays financial overview with visualizations
- [ ] All API endpoints have proper validation and error handling
- [ ] Responsive UI works on desktop and mobile
- [ ] All tests pass with 80%+ coverage

## All Needed Context

### Documentation & References
```yaml
# MUST READ - Include these in your context window
- file: skills/backend/SKILL.md
  why: FastAPI patterns, router structure, service layer, Pydantic schemas
  
- file: skills/frontend/SKILL.md
  why: React component patterns, TypeScript types, auth context, routing

- url: https://fastapi.tiangolo.com/tutorial/
  why: FastAPI best practices and patterns
  
- url: https://react.dev/learn
  why: Modern React patterns and hooks

- url: https://tailwindcss.com/docs
  why: Utility-first CSS for styling

- url: https://recharts.org/en-US/
  why: Chart library for financial visualizations (recommended)

- file: agents/backend_agent.md
  why: Backend implementation patterns to follow
```

### Current Codebase tree
```bash
.
├── agents/
│   └── backend_agent.md
├── skills/
│   ├── backend/
│   │   └── SKILL.md
│   └── frontend/
│       └── SKILL.md
├── PRPs/
│   ├── templates/
│   │   └── prp_base.md
│   └── EXAMPLE_multi_agent_prp.md
├── INITIAL.md
└── CLAUDE.md
```

### Desired Codebase tree with files to be added
```bash
.
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                 # FastAPI application entry
│   │   ├── config.py               # Configuration and settings
│   │   ├── database.py             # Database connection and session
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── user.py             # User model
│   │   │   ├── budget.py           # BudgetEntry model
│   │   │   ├── category.py         # FinancialCategory model
│   │   │   └── goal.py             # SavingsGoal model
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── user.py             # User Pydantic schemas
│   │   │   ├── budget.py           # Budget Pydantic schemas
│   │   │   ├── category.py         # Category schemas
│   │   │   └── goal.py             # Goal schemas
│   │   ├── routers/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py             # Authentication endpoints
│   │   │   ├── budgets.py          # Budget CRUD endpoints
│   │   │   ├── categories.py       # Category management
│   │   │   ├── goals.py            # Savings goals endpoints
│   │   │   └── dashboard.py        # Dashboard/summary endpoints
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── auth_service.py     # Authentication logic
│   │   │   ├── budget_service.py   # Budget business logic
│   │   │   ├── category_service.py # Category management
│   │   │   ├── goal_service.py     # Goal tracking
│   │   │   └── summary_service.py  # Financial summaries
│   │   └── auth/
│   │       ├── __init__.py
│   │       ├── dependencies.py     # Auth dependencies
│   │       └── jwt_handler.py      # JWT token management
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── test_auth.py
│   │   ├── test_budgets.py
│   │   ├── test_categories.py
│   │   ├── test_goals.py
│   │   └── test_summaries.py
│   ├── alembic/                    # Database migrations
│   │   ├── versions/
│   │   └── env.py
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                 # Base UI components (Button, Input, Card)
│   │   │   ├── forms/              # Form components
│   │   │   ├── budget/             # Budget-specific components
│   │   │   ├── dashboard/          # Dashboard components
│   │   │   └── layout/             # Layout components (Header, Sidebar)
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── BudgetPage.tsx
│   │   │   ├── CategoriesPage.tsx
│   │   │   └── GoalsPage.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useBudgets.ts
│   │   │   ├── useCategories.ts
│   │   │   └── useGoals.ts
│   │   ├── services/
│   │   │   ├── api.ts              # Axios instance
│   │   │   ├── auth.ts             # Auth API calls
│   │   │   ├── budgets.ts          # Budget API calls
│   │   │   ├── categories.ts
│   │   │   └── goals.ts
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   ├── types/
│   │   │   └── index.ts            # TypeScript interfaces
│   │   ├── utils/
│   │   │   └── formatters.ts       # Currency, date formatters
│   │   └── App.tsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── tsconfig.json
├── README.md
└── docker-compose.yml              # Optional: PostgreSQL setup
```

### Known Gotchas & Library Quirks
```python
# CRITICAL: FastAPI requires async/await for endpoints
# CRITICAL: SQLAlchemy models need __tablename__ and relationships defined
# CRITICAL: Pydantic v2 uses model_dump() not dict()
# CRITICAL: JWT tokens should expire (15min access, 7days refresh recommended)
# CRITICAL: Budget amounts should use Decimal for precision, not float
# CRITICAL: React Query requires QueryClientProvider wrapper
# CRITICAL: Tailwind CSS requires content paths in config
# CRITICAL: All monetary values should be stored as integers (cents/paise) or Decimal
# CRITICAL: Date handling should use timezone-aware datetime objects
```

## Implementation Blueprint

### Data models and structure

#### Database Schema Design

```python
# models/user.py
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    budget_entries = relationship("BudgetEntry", back_populates="user")
    savings_goals = relationship("SavingsGoal", back_populates="user")

# models/category.py
from sqlalchemy import Column, Integer, String, Enum, ForeignKey
import enum

class CategoryType(str, enum.Enum):
    INCOME = "income"
    SAVINGS = "savings"
    EXPENSE = "expense"

class ExpenseType(str, enum.Enum):
    DEBT_LOAN = "debt_loan"
    INSURANCE = "insurance"
    FIXED = "fixed"
    RECURRING = "recurring"
    MEDICAL = "medical"
    DISCRETIONARY = "discretionary"

class FinancialCategory(Base):
    __tablename__ = "financial_categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    category_type = Column(Enum(CategoryType), nullable=False)
    expense_type = Column(Enum(ExpenseType), nullable=True)  # Only for expenses
    parent_id = Column(Integer, ForeignKey("financial_categories.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # NULL = system default
    is_active = Column(Boolean, default=True)
    
    # Relationships
    parent = relationship("FinancialCategory", remote_side=[id])
    budget_entries = relationship("BudgetEntry", back_populates="category")

# models/budget.py
from sqlalchemy import Column, Integer, String, Numeric, Date, ForeignKey, UniqueConstraint
from decimal import Decimal

class BudgetEntry(Base):
    __tablename__ = "budget_entries"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("financial_categories.id"), nullable=False)
    month = Column(Integer, nullable=False)  # 1-12
    year = Column(Integer, nullable=False)
    budgeted_amount = Column(Numeric(15, 2), default=Decimal('0.00'))
    actual_amount = Column(Numeric(15, 2), default=Decimal('0.00'))
    notes = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="budget_entries")
    category = relationship("FinancialCategory", back_populates="budget_entries")
    
    # Unique constraint
    __table_args__ = (
        UniqueConstraint('user_id', 'category_id', 'month', 'year', name='uq_user_category_month_year'),
    )

# models/goal.py
class SavingsGoal(Base):
    __tablename__ = "savings_goals"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    target_amount = Column(Numeric(15, 2), nullable=False)
    current_amount = Column(Numeric(15, 2), default=Decimal('0.00'))
    target_date = Column(Date, nullable=True)
    category_id = Column(Integer, ForeignKey("financial_categories.id"), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="savings_goals")
    category = relationship("FinancialCategory")
```

#### Pydantic Schemas

```python
# schemas/budget.py
from pydantic import BaseModel, Field
from decimal import Decimal
from datetime import datetime
from typing import Optional

class BudgetEntryBase(BaseModel):
    category_id: int
    month: int = Field(..., ge=1, le=12)
    year: int = Field(..., ge=2020, le=2100)
    budgeted_amount: Decimal = Field(default=Decimal('0.00'), ge=0)
    actual_amount: Decimal = Field(default=Decimal('0.00'), ge=0)
    notes: Optional[str] = None

class BudgetEntryCreate(BudgetEntryBase):
    pass

class BudgetEntryUpdate(BaseModel):
    budgeted_amount: Optional[Decimal] = Field(None, ge=0)
    actual_amount: Optional[Decimal] = Field(None, ge=0)
    notes: Optional[str] = None

class BudgetEntryResponse(BudgetEntryBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# schemas/dashboard.py
class MonthlySummary(BaseModel):
    month: int
    year: int
    total_income: Decimal
    total_expenses: Decimal
    total_savings: Decimal
    surplus_deficit: Decimal

class YearlySummary(BaseModel):
    year: int
    total_income: Decimal
    total_expenses: Decimal
    total_savings: Decimal
    surplus_deficit: Decimal
    monthly_breakdown: list[MonthlySummary]
```

### List of tasks to be completed

```yaml
Task 1: Project Setup and Configuration
CREATE backend/app/config.py:
  - PATTERN: Use pydantic-settings for configuration
  - Load database URL, JWT secrets, CORS origins from environment
  - Set up logging configuration

CREATE backend/app/database.py:
  - PATTERN: SQLAlchemy session management
  - Create engine, sessionmaker, Base class
  - Dependency function get_db() for FastAPI

CREATE backend/requirements.txt:
  - Include: fastapi, uvicorn, sqlalchemy, alembic, pydantic, pydantic-settings
  - Include: python-jose[cryptography], passlib[bcrypt], python-multipart
  - Include: psycopg2-binary (PostgreSQL driver)

CREATE backend/.env.example:
  - DATABASE_URL=postgresql://user:pass@localhost/finance_db
  - SECRET_KEY=your-secret-key-here
  - ALGORITHM=HS256
  - ACCESS_TOKEN_EXPIRE_MINUTES=15

Task 2: Database Models and Migrations
CREATE backend/app/models/:
  - Implement all models (user.py, category.py, budget.py, goal.py)
  - Set up proper relationships and constraints
  - Use Decimal for monetary values

CREATE backend/alembic.ini:
  - Configure Alembic for migrations

CREATE backend/app/alembic/env.py:
  - Set up Alembic environment

RUN: alembic init alembic
RUN: alembic revision --autogenerate -m "Initial migration"
RUN: alembic upgrade head

Task 3: Seed Default Categories
CREATE backend/app/services/seed_categories.py:
  - Create system default financial categories based on Excel template
  - Income categories: Net Salary (Self), Net Salary (Partner), Rental, Interest/Dividend, Other
  - Savings categories: Jewel Saving, Child Savings, Mutual Funds, Shares, LIC, etc.
  - Expense sub-categories: Debt/Loan, Insurance, Fixed, Recurring, Medical, Discretionary
  - Run on app startup or via CLI command

Task 4: Authentication System
CREATE backend/app/auth/jwt_handler.py:
  - Create access token and refresh token functions
  - Token validation functions

CREATE backend/app/auth/dependencies.py:
  - get_current_user dependency for protected routes
  - get_current_active_user dependency

CREATE backend/app/services/auth_service.py:
  - User registration, login, password hashing
  - Token refresh logic

CREATE backend/app/routers/auth.py:
  - POST /api/v1/auth/register
  - POST /api/v1/auth/login
  - POST /api/v1/auth/refresh
  - GET /api/v1/auth/me

Task 5: Categories Management
CREATE backend/app/schemas/category.py:
  - CategoryCreate, CategoryUpdate, CategoryResponse schemas

CREATE backend/app/services/category_service.py:
  - Get all categories (system + user custom)
  - Create custom categories
  - Update/delete custom categories
  - Get categories by type

CREATE backend/app/routers/categories.py:
  - GET /api/v1/categories - List all categories
  - GET /api/v1/categories/{category_id} - Get category details
  - POST /api/v1/categories - Create custom category
  - PATCH /api/v1/categories/{category_id} - Update category
  - DELETE /api/v1/categories/{category_id} - Delete custom category

Task 6: Budget Entries Management
CREATE backend/app/schemas/budget.py:
  - All budget-related schemas (Create, Update, Response)

CREATE backend/app/services/budget_service.py:
  - Create/update/delete budget entries
  - Get budget entries by month/year
  - Bulk create/update for monthly budgets
  - Validate category belongs to user or is system default

CREATE backend/app/routers/budgets.py:
  - GET /api/v1/budgets - List budgets with filters (month, year, category)
  - GET /api/v1/budgets/{budget_id} - Get budget entry
  - POST /api/v1/budgets - Create budget entry
  - PATCH /api/v1/budgets/{budget_id} - Update budget entry
  - DELETE /api/v1/budgets/{budget_id} - Delete budget entry
  - POST /api/v1/budgets/bulk - Bulk create/update budgets

Task 7: Financial Summaries and Dashboard
CREATE backend/app/services/summary_service.py:
  - Calculate monthly summaries (income, expenses, savings, surplus/deficit)
  - Calculate yearly summaries
  - Get category-wise breakdowns
  - Calculate savings goal progress

CREATE backend/app/routers/dashboard.py:
  - GET /api/v1/dashboard/summary - Get overall summary
  - GET /api/v1/dashboard/monthly/{year}/{month} - Monthly summary
  - GET /api/v1/dashboard/yearly/{year} - Yearly summary
  - GET /api/v1/dashboard/category-breakdown - Category-wise breakdown

Task 8: Savings Goals Management
CREATE backend/app/schemas/goal.py:
  - GoalCreate, GoalUpdate, GoalResponse schemas

CREATE backend/app/services/goal_service.py:
  - CRUD operations for savings goals
  - Calculate goal progress based on budget entries
  - Auto-update current_amount from budget entries

CREATE backend/app/routers/goals.py:
  - GET /api/v1/goals - List all goals
  - POST /api/v1/goals - Create goal
  - PATCH /api/v1/goals/{goal_id} - Update goal
  - DELETE /api/v1/goals/{goal_id} - Delete goal

Task 9: Main FastAPI Application
CREATE backend/app/main.py:
  - Initialize FastAPI app
  - Configure CORS middleware
  - Include all routers
  - Add health check endpoint
  - Seed default categories on startup

Task 10: Frontend Setup
CREATE frontend/package.json:
  - React, TypeScript, Vite
  - React Router, React Query, Axios
  - Tailwind CSS, Recharts (for charts)
  - Install all dependencies

CREATE frontend/tailwind.config.js:
  - Configure Tailwind with proper content paths
  - Add custom colors and theme

CREATE frontend/src/services/api.ts:
  - Axios instance with interceptors
  - Base URL configuration
  - Token management

Task 11: Frontend Authentication
CREATE frontend/src/context/AuthContext.tsx:
  - PATTERN: Follow skills/frontend/SKILL.md AuthContext pattern
  - User state management
  - Login, logout, register functions

CREATE frontend/src/services/auth.ts:
  - API calls for authentication

CREATE frontend/src/pages/LoginPage.tsx:
  - Modern login form with validation

CREATE frontend/src/pages/RegisterPage.tsx:
  - Registration form

CREATE frontend/src/components/ProtectedRoute.tsx:
  - Route protection component

Task 12: Frontend Budget Management UI
CREATE frontend/src/pages/BudgetPage.tsx:
  - Monthly budget view with tabs for months
  - Form to add/edit budget entries
  - Table/grid showing all categories with amounts
  - Inline editing capability
  - Color-coded categories (income=green, expense=red, savings=blue)

CREATE frontend/src/components/budget/BudgetTable.tsx:
  - Reusable budget table component
  - Shows categories grouped by type
  - Editable cells for budgeted/actual amounts

CREATE frontend/src/components/budget/BudgetEntryForm.tsx:
  - Form component for creating/editing entries

CREATE frontend/src/hooks/useBudgets.ts:
  - React Query hooks for budget operations

Task 13: Frontend Dashboard
CREATE frontend/src/pages/DashboardPage.tsx:
  - Financial overview cards (Total Income, Expenses, Savings, Surplus/Deficit)
  - Monthly trend charts using Recharts
  - Category breakdown pie charts
  - Savings goals progress bars
  - Recent budget entries list

CREATE frontend/src/components/dashboard/SummaryCards.tsx:
  - Card components showing key metrics

CREATE frontend/src/components/dashboard/FinancialChart.tsx:
  - Reusable chart component using Recharts

Task 14: Frontend Categories and Goals Management
CREATE frontend/src/pages/CategoriesPage.tsx:
  - List of all categories
  - Add custom categories
  - Edit/delete custom categories

CREATE frontend/src/pages/GoalsPage.tsx:
  - List of savings goals
  - Create/edit/delete goals
  - Progress visualization

Task 15: Frontend Layout and Navigation
CREATE frontend/src/components/layout/Header.tsx:
  - Navigation bar with user menu
  - Logout button

CREATE frontend/src/components/layout/Sidebar.tsx:
  - Side navigation with links to Dashboard, Budget, Categories, Goals

CREATE frontend/src/App.tsx:
  - Set up routing
  - Wrap app with providers (QueryClient, AuthContext)

Task 16: Testing
CREATE backend/tests/:
  - Unit tests for all services
  - Integration tests for all routers
  - Test data fixtures
  - Mock database sessions

CREATE frontend/src/__tests__/:
  - Component tests for key components
  - Hook tests
  - API service tests

RUN: pytest backend/tests/ -v --cov
RUN: npm test (frontend tests)
```

### Per task pseudocode

```python
# Task 4: Auth Service Example
async def login(db: Session, email: str, password: str) -> dict:
    # PATTERN: Validate user exists
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # PATTERN: Verify password
    if not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # PATTERN: Generate tokens
    access_token = create_access_token(data={"sub": user.email})
    refresh_token = create_refresh_token(data={"sub": user.email})
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

# Task 7: Summary Service Example
def calculate_monthly_summary(
    db: Session, 
    user_id: int, 
    year: int, 
    month: int
) -> MonthlySummary:
    # PATTERN: Aggregate by category type
    income = db.query(
        func.sum(BudgetEntry.budgeted_amount)
    ).join(FinancialCategory).filter(
        BudgetEntry.user_id == user_id,
        BudgetEntry.year == year,
        BudgetEntry.month == month,
        FinancialCategory.category_type == CategoryType.INCOME
    ).scalar() or Decimal('0.00')
    
    expenses = db.query(
        func.sum(BudgetEntry.budgeted_amount)
    ).join(FinancialCategory).filter(
        BudgetEntry.user_id == user_id,
        BudgetEntry.year == year,
        BudgetEntry.month == month,
        FinancialCategory.category_type == CategoryType.EXPENSE
    ).scalar() or Decimal('0.00')
    
    savings = db.query(
        func.sum(BudgetEntry.budgeted_amount)
    ).join(FinancialCategory).filter(
        BudgetEntry.user_id == user_id,
        BudgetEntry.year == year,
        BudgetEntry.month == month,
        FinancialCategory.category_type == CategoryType.SAVINGS
    ).scalar() or Decimal('0.00')
    
    surplus_deficit = income - expenses - savings
    
    return MonthlySummary(
        month=month,
        year=year,
        total_income=income,
        total_expenses=expenses,
        total_savings=savings,
        surplus_deficit=surplus_deficit
    )
```

### Integration Points
```yaml
DATABASE:
  - migration: "Create users, financial_categories, budget_entries, savings_goals tables"
  - indexes: 
    - "CREATE INDEX idx_budget_user_year_month ON budget_entries(user_id, year, month)"
    - "CREATE INDEX idx_category_type ON financial_categories(category_type)"
  
CONFIG:
  - add to: backend/app/config.py
  - pattern: "DATABASE_URL = os.getenv('DATABASE_URL')"
  - pattern: "SECRET_KEY = os.getenv('SECRET_KEY')"
  
ROUTES:
  - add to: backend/app/main.py
  - pattern: "app.include_router(auth.router, prefix='/api/v1')"
  - pattern: "app.include_router(budgets.router, prefix='/api/v1')"
  
FRONTEND:
  - API_BASE_URL environment variable
  - Axios interceptors for token refresh
  - React Query for server state management
```

## Validation Loop

### Level 1: Syntax & Style
```bash
# Backend
cd backend
ruff check app/ --fix
mypy app/

# Frontend
cd frontend
npm run lint
npm run type-check

# Expected: No errors
```

### Level 2: Unit Tests
```python
# test_budget_service.py
def test_create_budget_entry(db_session, test_user, test_category):
    """Test creating a budget entry"""
    service = BudgetService(db_session)
    entry = service.create_budget_entry(
        user_id=test_user.id,
        category_id=test_category.id,
        month=1,
        year=2026,
        budgeted_amount=Decimal('1000.00')
    )
    assert entry.id is not None
    assert entry.budgeted_amount == Decimal('1000.00')

def test_calculate_monthly_summary(db_session, test_user):
    """Test monthly summary calculation"""
    service = SummaryService(db_session)
    summary = service.calculate_monthly_summary(
        user_id=test_user.id,
        year=2026,
        month=1
    )
    assert summary.total_income >= Decimal('0.00')
    assert summary.surplus_deficit == summary.total_income - summary.total_expenses - summary.total_savings
```

```bash
# Run tests
pytest backend/tests/ -v --cov=app --cov-report=term-missing
```

### Level 3: Integration Test
```bash
# Start backend
cd backend
uvicorn app.main:app --reload

# Start frontend
cd frontend
npm run dev

# Test endpoints
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "testpass123", "full_name": "Test User"}'

# Expected: User created, tokens returned
# Open browser to http://localhost:5173, login, create budget entry, verify dashboard
```

## Final Validation Checklist
- [ ] All tests pass: `pytest backend/tests/ -v`
- [ ] No linting errors: `ruff check backend/app/`
- [ ] No type errors: `mypy backend/app/`
- [ ] Database migrations run successfully
- [ ] Default categories seeded correctly
- [ ] User can register and login
- [ ] User can create budget entries for all categories
- [ ] Monthly summaries calculate correctly
- [ ] Dashboard displays data correctly
- [ ] Frontend builds without errors: `npm run build`
- [ ] Responsive design works on mobile
- [ ] All API endpoints documented in Swagger: `http://localhost:8000/docs`

---

## Anti-Patterns to Avoid
- ❌ Don't use float for monetary values - use Decimal
- ❌ Don't skip input validation - validate all Pydantic schemas
- ❌ Don't expose user data to other users - always filter by user_id
- ❌ Don't hardcode category names - use database categories
- ❌ Don't calculate summaries in frontend - do it in backend
- ❌ Don't store JWT secrets in code - use environment variables
- ❌ Don't forget to handle timezones for dates
- ❌ Don't create duplicate budget entries - use unique constraints

## UI Design Recommendations

### Color Scheme
- Primary: Blue (#3B82F6) for actions and links
- Success: Green (#10B981) for income and positive values
- Danger: Red (#EF4444) for expenses and negative values
- Warning: Amber (#F59E0B) for warnings
- Background: Light gray (#F9FAFB) for page background
- Cards: White with subtle shadows

### Key UI Components
1. **Dashboard Cards**: Large, prominent cards showing key metrics with icons
2. **Budget Table**: Collapsible sections by category type, inline editing
3. **Charts**: Line charts for trends, pie charts for category breakdown
4. **Forms**: Clean, modern forms with proper validation messages
5. **Navigation**: Sidebar navigation with active state indicators

### Responsive Design
- Mobile-first approach
- Collapsible sidebar on mobile
- Stack cards vertically on small screens
- Touch-friendly button sizes (min 44x44px)

## Confidence Score: 8/10

High confidence due to:
- Clear patterns from SKILL.md files
- Well-defined database schema based on Excel structure
- Standard FastAPI and React patterns
- Comprehensive task breakdown

Minor uncertainty on:
- Chart library choice (Recharts recommended but open to alternatives)
- Exact UI styling preferences (will follow Tailwind best practices)
```

Creating the PRP document with the complete financial budget tracking system specification.
<｜tool▁calls▁begin｜><｜tool▁call▁begin｜>
read_file
