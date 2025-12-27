# Finance Tracker Backend

Flask-based REST API for the personal finance tracking application.

## Prerequisites

- Python 3.11+
- PostgreSQL (or SQLite for development)

## Installation

1. **Navigate to the backend directory:**

   ```bash
   cd backend
   ```

2. **Create a virtual environment:**

   ```bash
   python -m venv venv
   ```

3. **Activate the virtual environment:**

   - macOS/Linux:
     ```bash
     source venv/bin/activate
     ```
   - Windows:
     ```bash
     venv\Scripts\activate
     ```

4. **Install dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

## Configuration

1. **Copy the example environment file:**

   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` with your settings:**

   ```env
   # Database
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/finance_db
   # For development with SQLite:
   # DATABASE_URL=sqlite:///dev.db

   # JWT Configuration
   JWT_SECRET_KEY=your-super-secret-key-change-in-production
   JWT_ACCESS_TOKEN_EXPIRES=900
   JWT_REFRESH_TOKEN_EXPIRES=604800

   # Flask
   FLASK_ENV=development
   FLASK_DEBUG=1
   SECRET_KEY=flask-secret-key-change-in-production

   # CORS
   FRONTEND_URL=http://localhost:3000
   ```

## Database Setup

**Initialize the database and seed default categories:**

```bash
flask init-db
```

Or manually:

```bash
flask db upgrade
flask seed-categories
```

## Running the Server

**Development server:**

```bash
python run.py
```

The server will start at `http://localhost:5000`.

**Using Flask CLI:**

```bash
flask run --host=0.0.0.0 --port=5000
```

**Production with Gunicorn:**

```bash
gunicorn -w 4 -b 0.0.0.0:5000 "app:create_app()"
```

## CLI Commands

| Command | Description |
|---------|-------------|
| `flask init-db` | Create database tables and seed categories |
| `flask seed-categories` | Seed default financial categories |
| `flask db migrate -m "message"` | Create a new migration |
| `flask db upgrade` | Apply migrations |

## API Endpoints

Base URL: `http://localhost:5000/api/v1`

### Health Check

- `GET /health` - Server health status

### Authentication

- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh` - Refresh access token

### Categories

- `GET /api/v1/categories` - List all categories

### Budgets

- `GET /api/v1/budgets` - List budgets
- `POST /api/v1/budgets` - Create budget
- `GET /api/v1/budgets/<id>` - Get budget
- `PUT /api/v1/budgets/<id>` - Update budget
- `DELETE /api/v1/budgets/<id>` - Delete budget

### Goals

- `GET /api/v1/goals` - List goals
- `POST /api/v1/goals` - Create goal
- `GET /api/v1/goals/<id>` - Get goal
- `PUT /api/v1/goals/<id>` - Update goal
- `DELETE /api/v1/goals/<id>` - Delete goal

## Docker

**Build and run with Docker:**

```bash
docker build -t finance-backend .
docker run -p 5000:5000 --env-file .env finance-backend
```

**Using Docker Compose (from project root):**

```bash
docker-compose up backend
```

## Running Tests

```bash
pytest
```

With coverage:

```bash
pytest --cov=app --cov-report=term-missing
```

## Project Structure

```
backend/
├── app/
│   ├── __init__.py      # Application factory
│   ├── config.py        # Configuration classes
│   ├── extensions.py    # Flask extensions
│   ├── api/             # API blueprints and routes
│   ├── models/          # SQLAlchemy models
│   ├── schemas/         # Marshmallow schemas
│   ├── services/        # Business logic
│   └── utils/           # Utility functions
├── tests/               # Test suite
├── run.py               # Entry point
├── requirements.txt     # Dependencies
├── Dockerfile           # Docker configuration
└── .env.example         # Environment template
```
