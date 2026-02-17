# SirenBase

Built for a working coffeehouse, this modular platform replaces fragmented daily workflows with fast, accountable digital operations. Partners log in once and access all three tools from a central dashboard. The dashboard doubles as an operational overview — surfacing milk count progress and time since the last restock so partners know what's done and what's overdue without opening each tool.

**Live Site:** [sirenbase.com](https://sirenbase.com)

## Tools

### Inventory Tracking

A shared, real-time inventory system that gives every partner immediate visibility into current stock. Items are identified by unique 4-digit codes written directly on them for fast physical lookup. A single search field queries across names, codes, and categories. Every add and remove is logged with ownership and timestamp, creating a persistent audit trail.

### Milk Count

A structured daily workflow that walks partners through each counting phase in sequence — no steps can be skipped, no math is done by hand. The system collects stock levels from multiple locations, handles all calculations automatically, and logs every completed session. Par levels are admin-configurable, and the interface adapts to support both incremental counting and direct entry.

### RTD&E Counting

A guided restocking workflow that presents items one at a time, compares counts against par levels, and generates a pull list with exact quantities. Partners count what's on the display — the app tells them what to pull. Fulfillment is tracked as items are restocked, and sessions expire after 30 minutes to prevent stale data from carrying over.

## Tech Stack

Next.js · React · TypeScript · Tailwind CSS · ShadCN/Radix · Flask · SQLAlchemy · PostgreSQL · JWT · Deployed on Vercel + Render + Neon

## Project Structure

```
SirenBase/
├── Planning/              # Tool-specific planning documents
│   ├── InventoryTracking.md   # Tool 1 detailed planning
│   ├── MilkCount.md           # Tool 2 detailed planning
│   └── RTDE.md                # Tool 3 detailed planning
│
├── frontend/              # Next.js application
│   ├── src/
│   │   ├── app/
│   │   │   ├── dashboard/          # Tool selection grid
│   │   │   ├── tools/
│   │   │   │   ├── tracking/       # Tool 1 pages
│   │   │   │   ├── milk-count/     # Tool 2 pages (complete)
│   │   │   │   └── rtde/           # Tool 3 pages (complete)
│   │   │   └── admin/              # Global admin panel
│   │   ├── components/
│   │   │   ├── shared/             # Cross-tool components
│   │   │   └── tools/              # Tool-specific components
│   │   └── lib/                    # Utilities
│
└── backend/               # Flask API
    ├── app/
    │   ├── routes/
    │   │   ├── auth.py             # Shared authentication
    │   │   └── tools/
    │   │       ├── tracking.py     # Tool 1 routes
    │   │       ├── milk_count/     # Tool 2 routes (complete)
    │   │       └── rtde/           # Tool 3 routes (complete)
    │   ├── models/
    │   │   ├── user.py             # Shared users table
    │   │   └── tools/              # Tool-specific models
    │   └── utils/                  # Helper functions
    └── tests/                      # Test files
```

## Prerequisites

- **Python 3.11+** with pip and venv
- **Node.js 18+** with npm
- **PostgreSQL 15+** (running locally)
- **Git**

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/SirenBase.git
cd SirenBase
```

### 2. Database Setup

Create the PostgreSQL database:

```bash
createdb sirenbase
```

Or via psql:

```sql
psql postgres
CREATE DATABASE sirenbase;
\q
```

### 3. Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your PostgreSQL credentials

# Initialize database migrations (when ready)
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
```

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.local.example .env.local
# Edit .env.local if needed (default: http://localhost:5000/api)
```

## Running the Application

### Start Backend (Terminal 1)

```bash
cd backend
source venv/bin/activate
flask run --port 5000
```

Backend will be available at `http://localhost:5000`

### Start Frontend (Terminal 2)

```bash
cd frontend
npm run dev
```

Frontend will be available at `http://localhost:3000`

## Development

### Backend Commands

```bash
# Run tests
pytest

# Run tests with coverage
pytest --cov=app

# Format code
black .

# Lint code
flake8 .

# Database migrations
flask db migrate -m "Description"
flask db upgrade
flask db downgrade
```

### Frontend Commands

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Run tests (when implemented)
npm run test
```

## Architecture

A Next.js frontend backed by a Flask REST API and PostgreSQL database. Every tool is isolated at every layer — separate Flask Blueprints with prefixed routes (`/api/tracking/*`, `/api/milk-count/*`, `/api/rtde/*`), prefixed database tables per tool (`tracking_items`, `milk_count_sessions`, `rtde_count_sessions`) sharing only a central `users` table, and nested frontend route trees under `/tools/`. Authentication, UI components, and the design system are shared — everything else is namespaced.

## Documentation

### Core Documentation

- **[PLANNING.md](./PLANNING.md)** - Multi-tool architecture and key decisions
- **[TASKS.md](./TASKS.md)** - Development task breakdown (organized by tool)
- **[CLAUDE.md](./CLAUDE.md)** - Development guidelines and conventions
- **[README.md](./README.md)** - This file: Setup and overview

### Tool-Specific Planning

- **[Planning/InventoryTracking.md](./Planning/InventoryTracking.md)** - Tool 1 detailed planning
- **[Planning/MilkCount.md](./Planning/MilkCount.md)** - Tool 2 detailed planning
- **[Planning/RTDE.md](./Planning/RTDE.md)** - Tool 3 detailed planning

### Component Documentation

- **backend/CLAUDE.md** - Backend-specific guidelines
- **frontend/CLAUDE.md** - Frontend-specific guidelines

## Environment Variables

### Backend (.env)

```bash
FLASK_APP=run.py
FLASK_ENV=development
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret
DATABASE_URL=postgresql://username:password@localhost:5432/sirenbase
CORS_ORIGINS=http://localhost:3000
```

### Frontend (.env.local)

```bash
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_NAME=SirenBase
```

## Testing

226 backend tests covering authentication, CRUD operations, session state transitions, calculation accuracy, role-based access enforcement, and edge cases like expired sessions and duplicate entries. Every test runs against a real database with full isolation.

```bash
# Backend
cd backend && source venv/bin/activate && pytest -v

# Frontend
cd frontend && npm run test
```

## Deployment

- **Frontend**: Vercel
- **Backend**: Render
- **Database**: Neon (PostgreSQL)

## Contributing

1. Create a feature branch (`git checkout -b feature/YourFeature`)
2. Commit your changes (`git commit -m 'Add YourFeature'`)
3. Push to the branch (`git push origin feature/YourFeature`)
4. Open a Pull Request

## License

Private project - All rights reserved

## Support

For issues or questions, please create an issue in the GitHub repository.

---

**226 tests passing** · **3 tools deployed** · Built over 4.5 months and 281 commits
