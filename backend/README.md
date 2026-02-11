# SirenBase Backend - Flask API

> RESTful API backend for the SirenBase multi-tool operations platform

## Overview

The SirenBase backend is a Flask-based REST API that serves multiple tools for specialty coffee retail store partners. It implements a **multi-tool architecture** where each tool (Inventory Tracking, Milk Count, RTD&E) has its own namespaced API endpoints while sharing common infrastructure (authentication, database, admin functions).

### Current Status
- **Tool 1 (Inventory Tracking)**: ✅ Complete - `/api/tracking/*`
- **Tool 2 (Milk Count)**: ✅ Complete - `/api/milk-count/*`
- **Tool 3 (RTD&E)**: ✅ Complete - `/api/rtde/*`

## Tech Stack

- **Framework**: Flask 3.1+
- **Database**: PostgreSQL 15+ with SQLAlchemy 2.0
- **Authentication**: JWT tokens via Flask-JWT-Extended
- **Validation**: Marshmallow schemas
- **Migrations**: Alembic (via Flask-Migrate)
- **Testing**: Pytest with 222+ tests passing

## Prerequisites

- Python 3.11+
- PostgreSQL 15+ (running locally or accessible)
- pip and venv

## Quick Start

### 1. Clone and Setup Environment

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
# Edit .env with your PostgreSQL credentials
```

Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET_KEY`: Secret key for JWT tokens
- `SECRET_KEY`: Flask secret key
- `CORS_ORIGINS`: Allowed frontend origins (comma-separated)

### 3. Initialize Database

```bash
# Create database
createdb sirenbase

# Run migrations
flask db upgrade

# Seed with test data (optional)
python seed.py --with-test-data
```

### 4. Run Development Server

```bash
flask run --port 5000
```

API will be available at `http://localhost:5000`

## Project Structure

```
backend/
├── app/
│   ├── __init__.py           # Flask app factory
│   ├── config.py             # Configuration classes
│   ├── extensions.py         # Extension initialization
│   ├── models/               # Database models
│   │   ├── user.py          # Shared user model
│   │   ├── item.py          # Tool 1: Tracking items
│   │   ├── history.py       # Tool 1: Tracking history
│   │   ├── rtde.py          # Tool 3: RTD&E models
│   │   └── milk_count.py    # Tool 2: Milk Count models
│   ├── schemas/              # Marshmallow schemas
│   ├── routes/               # API blueprints
│   │   ├── auth.py           # /api/auth/* (shared)
│   │   ├── admin.py          # /api/admin/* (shared)
│   │   └── tools/            # Tool-specific routes
│   │       ├── tracking.py   # /api/tracking/* (Tool 1)
│   │       ├── milk_count/   # /api/milk-count/* (Tool 2)
│   │       └── rtde/         # /api/rtde/* (Tool 3)
│   ├── middleware/           # Custom middleware
│   └── utils/                # Helper functions
│       └── rtde_cleanup.py   # RTD&E session cleanup utility
├── tests/                    # Test suite (222+ tests)
├── migrations/               # Database migrations
├── seed.py                   # Database seeding script
└── requirements.txt          # Dependencies
```

## Multi-Tool Architecture

### API Namespacing Strategy

Each tool operates in its own namespace to ensure isolation and scalability:

**Shared Endpoints** (all tools):
- `POST /api/auth/login` - User authentication
- `POST /api/auth/signup` - User registration
- `GET /api/auth/me` - Get current user
- `GET /api/admin/users` - List users (admin only)
- `POST /api/admin/users` - Create user (admin only)
- `DELETE /api/admin/users/:id` - Delete user (admin only)

**Tool 1: Inventory Tracking** `/api/tracking/*`:
- `GET /api/tracking/items` - List items
- `POST /api/tracking/items` - Add item
- `DELETE /api/tracking/items/<code>` - Remove item
- `GET /api/tracking/history` - View history

**Tool 2: Milk Count** `/api/milk-count/*`:
- Admin Endpoints:
  - `GET /api/milk-count/admin/milk-types` - List milk types (admin only)
  - `PUT /api/milk-count/admin/milk-types/:id` - Update milk type (admin only)
  - `GET /api/milk-count/admin/par-levels` - List par levels (admin only)
  - `PUT /api/milk-count/admin/par-levels/:id` - Update par level (admin only)
- Session Endpoints:
  - `GET /api/milk-count/sessions/today` - Get today's session
  - `POST /api/milk-count/sessions/start` - Start new session
  - `GET /api/milk-count/sessions/:id` - Get session details
  - `PUT /api/milk-count/sessions/:id/night-foh` - Save FOH counts
  - `PUT /api/milk-count/sessions/:id/night-boh` - Save BOH counts
  - `PUT /api/milk-count/sessions/:id/morning` - Save morning count
  - `PUT /api/milk-count/sessions/:id/on-order` - Save on-order values
  - `GET /api/milk-count/sessions/:id/summary` - Get calculated summary
  - `GET /api/milk-count/history` - Session history
  - `GET /api/milk-count/milk-types` - Active milk types (staff)

**Tool 3: RTD&E** `/api/rtde/*`:
- Admin Endpoints (item management):
  - `GET /api/rtde/admin/items` - List RTD&E items (admin only)
  - `POST /api/rtde/admin/items` - Create item (admin only)
  - `PUT /api/rtde/admin/items/:id` - Update item (admin only)
  - `DELETE /api/rtde/admin/items/:id` - Delete item (admin only)
  - `PUT /api/rtde/admin/items/reorder` - Reorder items (admin only)
- Session Endpoints (counting workflow):
  - `GET /api/rtde/sessions/active` - Check for active session
  - `POST /api/rtde/sessions/start` - Start new or resume session
  - `GET /api/rtde/sessions/:id` - Get session details with items
  - `PUT /api/rtde/sessions/:id/count` - Update item count
- Pull List Endpoints (restocking workflow):
  - `GET /api/rtde/sessions/:id/pull-list` - Generate pull list
  - `PUT /api/rtde/sessions/:id/pull` - Mark item as pulled
  - `POST /api/rtde/sessions/:id/complete` - Complete session

### Database Table Naming

Tables are prefixed by tool to avoid conflicts:
- Shared: `users`
- Tool 1: `tracking_items`, `tracking_history`, `item_suggestions`
- Tool 2: `milk_count_sessions`, `milk_count_par_levels`, etc.
- Tool 3: `rtde_items`, `rtde_count_sessions`, `rtde_session_counts`

## Development

### Running Tests

```bash
# Run all tests
pytest

# Run with verbose output
pytest -v

# Run with coverage
pytest --cov=app

# Run specific test file
pytest tests/test_items.py
```

**Test Coverage**: 222+ tests passing
- **Shared Tests** (54 tests):
  - 13 model tests (User, Item, History)
  - 8 utility tests
  - 15 auth tests
  - 6 history tests
  - 12 admin tests
- **Tool 1: Inventory Tracking** (21 tests):
  - 12 inventory item tests
  - 9 autocomplete/search tests
- **Tool 3: RTD&E** (77 tests):
  - 17 RTDE model tests (RTDEItem, RTDECountSession, RTDESessionCount)
  - 23 admin endpoint tests
  - 20 session endpoint tests
  - 17 pull list endpoint tests

### Database Migrations

```bash
# Create a new migration
flask db migrate -m "Description of changes"

# Apply migrations
flask db upgrade

# Rollback last migration
flask db downgrade

# View migration history
flask db history
```

### Code Quality

```bash
# Format code with Black
black .

# Lint with Flake8
flake8 .

# Type check with mypy
mypy app/
```

## API Authentication

All endpoints (except `/api/auth/login` and `/api/auth/signup`) require JWT authentication:

```bash
# Login to get token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"partner_number": "ADMIN001", "pin": "1234"}'

# Use token in subsequent requests
curl -X GET http://localhost:5000/api/tracking/items \
  -H "Authorization: Bearer <your_token_here>"
```

Tokens expire after 24 hours.

## Common Tasks

### Adding a New Tool

1. Create model files in `app/models/`
2. Create Marshmallow schemas in `app/schemas/`
3. Create blueprint in `app/routes/tools/<tool_name>.py`
4. Register blueprint in `app/__init__.py`
5. Create migration: `flask db migrate -m "Add <tool> tables"`
6. Apply migration: `flask db upgrade`
7. Write tests in `tests/test_<tool>.py`

### Seeding Database

```bash
# Seed with basic admin user
python seed.py

# Seed with test data (users + sample items)
python seed.py --with-test-data

# Clear database and reseed
python seed.py --clear --with-test-data
```

Default admin user:
- Partner Number: `ADMIN001`
- PIN: `1234`
- Role: `admin`

## Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
pg_isready

# Test connection
psql -U <username> -d sirenbase

# Reset database
dropdb sirenbase
createdb sirenbase
flask db upgrade
python seed.py
```

### Migration Conflicts

```bash
# If migrations are out of sync
flask db stamp head  # Mark current state
flask db migrate -m "Sync migrations"
flask db upgrade
```

### Port Already in Use

```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or run on different port
flask run --port 5001
```

## Documentation

- **Detailed Guidelines**: See [`CLAUDE.md`](./CLAUDE.md) for coding standards, patterns, and best practices
- **API Documentation**: Coming soon - will be added in future phase
- **Architecture Decisions**: See `../ChangeLog/` for architectural change logs
- **Overall Planning**: See `../PLANNING.md` for multi-tool architecture overview

## Contributing

1. Follow PEP8 style guide (use Black for formatting)
2. Write tests for all new features
3. Update migrations for model changes
4. Add docstrings to all public functions
5. See [`CLAUDE.md`](./CLAUDE.md) for complete guidelines

## Support

For questions or issues:
1. Check [`CLAUDE.md`](./CLAUDE.md) for coding guidelines
2. Review `../PLANNING.md` for architecture decisions
3. Check existing tests for usage examples

---

**Last Updated**: February 8, 2026
**Current Phase**: Phase 7A Complete - All Tools Deployed
**Status**: All three tools complete (222+ tests passing)
