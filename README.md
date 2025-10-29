# SirenBase

A comprehensive digital operations platform for Starbucks store partners, providing a unified suite of specialized tools to streamline daily workflows. Partners log in once and access multiple tools from a central dashboard, each designed to solve specific operational challenges while sharing authentication, UI components, and design systems.

## Multi-Tool Platform

SirenBase consists of three independent tools:

- **Tool 1: Inventory Tracking System** _(Current Phase)_
  - Track basement inventory using unique 4-digit codes
  - Eliminate physical trips during ordering
  - Complete audit history of all actions

- **Tool 2: Milk Count System** _(Next)_
  - Automate milk inventory counting (FOH/BOH)
  - Calculate delivery amounts and order quantities
  - Replace manual paper logbook system

- **Tool 3: RTD&E Counting System** _(Future)_
  - Streamline Ready-to-Drink & Eat display restocking
  - Generate pull lists automatically
  - Reduce walking time and counting errors

## Tech Stack

### Frontend

- **Next.js 14+** with TypeScript
- **TailwindCSS** for styling
- **ShadCN UI** for components
- **Axios** for API calls

### Backend

- **Flask 3.0+** with Python 3.12+
- **SQLAlchemy** ORM
- **PostgreSQL 15+** database
- **JWT** authentication
- **Marshmallow** for validation

## Project Structure

```
SirenBase/
├── Tools/                 # Tool-specific planning documents
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
│   │   │   │   ├── milk-count/     # Tool 2 pages (future)
│   │   │   │   └── rtde/           # Tool 3 pages (future)
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
    │   │       ├── milk_count.py   # Tool 2 routes (future)
    │   │       └── rtde.py         # Tool 3 routes (future)
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

## Key Features

### Platform-Wide
- **Single Sign-On**: One login for all tools
- **Role-Based Access**: Global admin and staff roles
- **Mobile-First Design**: Optimized for phones/tablets
- **Dashboard Navigation**: Grid of tool cards for fast access
- **Secure Authentication**: JWT tokens with 24-hour expiration

### Tool 1: Inventory Tracking (Current)
- Unique 4-digit code generation for items
- Complete audit history of all actions
- Category-based organization
- Soft delete with full audit trail
- **Status**: Backend complete (66/66 tests passing), Frontend in progress

### Tool 2: Milk Count (Planned)
- Night count (FOH/BOH) with sequential screens
- Morning count with dual input methods
- Automatic delivery and order calculations
- Par level management

### Tool 3: RTD&E Counting (Planned)
- Quick item counting interface
- Automatic pull list generation
- BOH fulfillment tracking
- Siren's Eye integration

## Documentation

### Core Documentation
- **[PLANNING.md](./PLANNING.md)** - Multi-tool architecture and key decisions
- **[TASKS.md](./TASKS.md)** - Development task breakdown (organized by tool)
- **[CLAUDE.md](./CLAUDE.md)** - Development guidelines and conventions
- **[README.md](./README.md)** - This file: Setup and overview

### Tool-Specific Planning
- **[Tools/InventoryTracking.md](./Tools/InventoryTracking.md)** - Tool 1 detailed planning
- **[Tools/MilkCount.md](./Tools/MilkCount.md)** - Tool 2 detailed planning
- **[Tools/RTDE.md](./Tools/RTDE.md)** - Tool 3 detailed planning

### Component Documentation (Future)
- **backend/CLAUDE.md** - Backend-specific guidelines (when created)
- **frontend/CLAUDE.md** - Frontend-specific guidelines (when created)

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

### Backend Tests

```bash
cd backend
source venv/bin/activate
pytest -v
```

### Frontend Tests

```bash
cd frontend
npm run test
```

## Deployment

- **Frontend**: Vercel (optimized for Next.js)
- **Backend**: AWS Elastic Beanstalk
- **Database**: AWS RDS PostgreSQL

See deployment documentation (coming soon) for detailed instructions.

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

## Current Status

- **Phase 0-2**: ✅ Complete (Project setup, database design, backend API)
- **Phase 3**: 🔄 In Progress (Multi-tool architecture and Tool 1 frontend)
- **Phase 4**: ⏭️ Pending (Tool 1 deployment)
- **Phase 5-6**: 📅 Future (Tools 2 and 3)

**Backend**: 66/66 tests passing | **Frontend**: In development

---

**Last Updated**: October 28, 2025
**Version**: 0.2.0 (Multi-Tool Architecture, Tool 1 in progress)
