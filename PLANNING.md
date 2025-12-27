# Financial Budget Tracking System - Planning Document

## Project Overview

A comprehensive personal finance management application for tracking income, savings goals, and expenses with monthly budget planning and financial goal tracking.

## Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18 + TypeScript
- **Component Library**: shadcn/ui
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **State Management**: React Query (TanStack Query)
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form + Zod

### Backend
- **Framework**: Flask 3.x
- **ORM**: SQLAlchemy 2.x
- **Database**: PostgreSQL (production), SQLite (development)
- **Migrations**: Flask-Migrate (Alembic)
- **Validation**: Marshmallow
- **Authentication**: Flask-JWT-Extended
- **Password Hashing**: bcrypt

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **API Documentation**: Flask-RESTX (Swagger)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                         │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js + React)                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Pages     │  │ Components  │  │    Services (API)       │  │
│  │  (App Dir)  │  │  (shadcn)   │  │    (Axios Client)       │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                │ HTTP/REST
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND (Flask API)                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  Blueprints │  │  Services   │  │      Models             │  │
│  │  (Routes)   │  │  (Logic)    │  │    (SQLAlchemy)         │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        PostgreSQL Database                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
ai-micro-saas/
├── backend/
│   ├── app/
│   │   ├── __init__.py           # Flask app factory
│   │   ├── config.py             # Configuration settings
│   │   ├── extensions.py         # Flask extensions init
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── user.py           # User model
│   │   │   ├── category.py       # FinancialCategory model
│   │   │   ├── budget.py         # BudgetEntry model
│   │   │   └── goal.py           # SavingsGoal model
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── user.py           # User Marshmallow schemas
│   │   │   ├── category.py       # Category schemas
│   │   │   ├── budget.py         # Budget schemas
│   │   │   └── goal.py           # Goal schemas
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py           # Auth endpoints
│   │   │   ├── users.py          # User endpoints
│   │   │   ├── categories.py     # Category endpoints
│   │   │   ├── budgets.py        # Budget endpoints
│   │   │   ├── goals.py          # Goals endpoints
│   │   │   └── dashboard.py      # Dashboard endpoints
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── auth_service.py   # Auth business logic
│   │   │   ├── category_service.py
│   │   │   ├── budget_service.py
│   │   │   ├── goal_service.py
│   │   │   └── summary_service.py
│   │   └── utils/
│   │       ├── __init__.py
│   │       └── seed_categories.py # Category seeding
│   ├── migrations/               # Alembic migrations
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── conftest.py           # Pytest fixtures
│   │   ├── test_auth.py
│   │   ├── test_categories.py
│   │   ├── test_budgets.py
│   │   └── test_goals.py
│   ├── requirements.txt
│   ├── .env.example
│   └── run.py                    # Entry point
│
├── frontend/
│   ├── src/
│   │   ├── app/                  # Next.js App Router
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── (auth)/
│   │   │   │   ├── login/page.tsx
│   │   │   │   └── register/page.tsx
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── budget/page.tsx
│   │   │   ├── categories/page.tsx
│   │   │   └── goals/page.tsx
│   │   ├── components/
│   │   │   ├── ui/               # shadcn/ui components
│   │   │   ├── layout/
│   │   │   ├── forms/
│   │   │   └── dashboard/
│   │   ├── lib/
│   │   │   ├── api.ts            # Axios instance
│   │   │   ├── auth.ts           # Auth utilities
│   │   │   └── utils.ts          # Helper functions
│   │   ├── hooks/
│   │   │   ├── use-auth.ts
│   │   │   ├── use-budgets.ts
│   │   │   └── use-categories.ts
│   │   ├── types/
│   │   │   └── index.ts          # TypeScript interfaces
│   │   └── providers/
│   │       ├── query-provider.tsx
│   │       └── auth-provider.tsx
│   ├── public/
│   ├── package.json
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── next.config.js
│
├── docker/
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── docker-compose.yml
│
├── PRPs/
├── agents/
├── skills/
├── CLAUDE.md
├── PLANNING.md
├── TASK.md
└── README.md
```

---

## Database Schema

### Users Table
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| hashed_password | VARCHAR(255) | NOT NULL |
| full_name | VARCHAR(100) | |
| is_active | BOOLEAN | DEFAULT TRUE |
| created_at | TIMESTAMP | DEFAULT NOW() |
| updated_at | TIMESTAMP | |

### Financial Categories Table
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY |
| name | VARCHAR(100) | NOT NULL |
| category_type | ENUM | income/savings/expense |
| expense_type | ENUM | debt_loan/insurance/fixed/recurring/medical/discretionary (nullable) |
| parent_id | INTEGER | FK(financial_categories.id), nullable |
| user_id | INTEGER | FK(users.id), nullable (NULL = system) |
| is_active | BOOLEAN | DEFAULT TRUE |

### Budget Entries Table
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY |
| user_id | INTEGER | FK(users.id), NOT NULL |
| category_id | INTEGER | FK(financial_categories.id), NOT NULL |
| month | INTEGER | 1-12, NOT NULL |
| year | INTEGER | NOT NULL |
| budgeted_amount | DECIMAL(15,2) | DEFAULT 0.00 |
| actual_amount | DECIMAL(15,2) | DEFAULT 0.00 |
| notes | TEXT | |
| created_at | TIMESTAMP | DEFAULT NOW() |
| updated_at | TIMESTAMP | |

**Unique Constraint**: (user_id, category_id, month, year)

### Savings Goals Table
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY |
| user_id | INTEGER | FK(users.id), NOT NULL |
| name | VARCHAR(100) | NOT NULL |
| target_amount | DECIMAL(15,2) | NOT NULL |
| current_amount | DECIMAL(15,2) | DEFAULT 0.00 |
| target_date | DATE | nullable |
| category_id | INTEGER | FK(financial_categories.id), nullable |
| is_active | BOOLEAN | DEFAULT TRUE |
| created_at | TIMESTAMP | DEFAULT NOW() |

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/auth/register | Register new user |
| POST | /api/v1/auth/login | Login user |
| POST | /api/v1/auth/refresh | Refresh access token |
| GET | /api/v1/auth/me | Get current user |
| POST | /api/v1/auth/logout | Logout user |

### Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/categories | List all categories |
| GET | /api/v1/categories/:id | Get category by ID |
| POST | /api/v1/categories | Create custom category |
| PUT | /api/v1/categories/:id | Update category |
| DELETE | /api/v1/categories/:id | Delete custom category |

### Budget Entries
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/budgets | List budgets (with filters) |
| GET | /api/v1/budgets/:id | Get budget entry |
| POST | /api/v1/budgets | Create budget entry |
| PUT | /api/v1/budgets/:id | Update budget entry |
| DELETE | /api/v1/budgets/:id | Delete budget entry |
| POST | /api/v1/budgets/bulk | Bulk create/update |

### Goals
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/goals | List all goals |
| GET | /api/v1/goals/:id | Get goal by ID |
| POST | /api/v1/goals | Create goal |
| PUT | /api/v1/goals/:id | Update goal |
| DELETE | /api/v1/goals/:id | Delete goal |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/dashboard/summary | Overall summary |
| GET | /api/v1/dashboard/monthly/:year/:month | Monthly summary |
| GET | /api/v1/dashboard/yearly/:year | Yearly summary |

---

## Implementation Phases

### Phase 1: Foundation (Current)
- [x] Project structure setup
- [ ] Backend Flask setup with extensions
- [ ] User model and authentication
- [ ] Category model and seeding
- [ ] Basic API tests

### Phase 2: Core Features
- [ ] Budget entries CRUD
- [ ] Goals CRUD
- [ ] Frontend authentication pages
- [ ] Protected routes

### Phase 3: Dashboard & Visualization
- [ ] Summary service and endpoints
- [ ] Dashboard page with charts
- [ ] Monthly/yearly views
- [ ] Category breakdown charts

### Phase 4: Polish & Optimization
- [ ] Bulk operations
- [ ] Data export
- [ ] Performance optimization
- [ ] Mobile responsiveness
- [ ] Comprehensive testing

---

## Coding Conventions

### Python (Backend)
- Follow PEP8
- Use type hints
- Format with `black`
- Lint with `ruff`
- Docstrings: Google style
- Use `Decimal` for monetary values, never `float`

### TypeScript (Frontend)
- Strict TypeScript
- ESLint + Prettier
- Functional components with hooks
- Use `zod` for validation
- Consistent naming: `camelCase` for variables, `PascalCase` for components

### API Design
- RESTful conventions
- Consistent error responses: `{"error": "message", "code": "ERROR_CODE"}`
- Pagination: `?page=1&per_page=20`
- Filtering: `?month=1&year=2026&category_type=income`

---

## Security Considerations

- JWT access tokens expire in 15 minutes
- Refresh tokens expire in 7 days
- Passwords hashed with bcrypt
- All budget data filtered by user_id
- CORS configured for frontend origin only
- Environment variables for secrets
- Input validation on all endpoints

---

## Default Categories (Seeded)

### Income
- Net Salary (Self)
- Net Salary (Partner)
- Rental Income
- Interest/Dividend
- Other Income

### Savings/Investments
- Jewel Saving
- Child Savings
- Mutual Funds
- Shares
- LIC/Insurance Investment
- Fixed Deposit
- PPF/EPF
- Other Savings

### Expenses
**Debt/Loan**: Credit Cards, Personal Loan, Vehicle Loan, Home Loan, Other Loans
**Insurance**: Life Insurance, Health Insurance, Vehicle Insurance, Home Insurance
**Fixed**: Rent, Utilities (Electric, Water, Gas), Internet/Phone, Groceries
**Recurring**: School Fees, Tuition, Subscriptions, Maintenance
**Medical**: Doctor Visits, Medicines, Health Checkups
**Discretionary**: Shopping, Eating Out, Movies/Entertainment, Travel, Gifts
