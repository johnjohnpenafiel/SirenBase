# SirenBase - Multi-Tool Planning Document

## Project Overview

**SirenBase** is a comprehensive digital operations platform designed for Starbucks store partners. It provides a unified suite of specialized tools to streamline daily workflows, replacing manual paper-based systems with fast, mobile-friendly, and accountable digital solutions. Partners log in once and access multiple tools from a central dashboard, each designed to solve a specific operational challenge.

---

## High-Level Direction

### Vision Statement

Create a **single, unified operations platform** that:

- Consolidates multiple store operation tools into one app
- Eliminates paper-based tracking systems across different workflows
- Provides real-time visibility into inventory, counts, and restocking needs
- Maintains complete accountability through comprehensive audit logging
- Delivers a consistent, intuitive user experience across all tools
- Empowers partners to work faster and smarter with mobile-first design

### Multi-Tool Architecture

SirenBase follows a **"hub and spoke" model**:

```
Login → Dashboard (Tool Grid) → Select Tool → Tool-Specific Workflows
                ↓
          Admin Panel (admins only)
```

**Dashboard Concept**:

- Grid of tool cards (e.g., "Tracking System", "Milk Count", "RTD&E")
- Each card routes to a dedicated tool with its own workflows
- Admin Panel card appears only for users with admin role
- Simple, fast navigation - partners can switch between tools instantly

**Tool Independence**:

- Each tool operates independently with its own UI and data
- Tools can be built, tested, and deployed incrementally
- New tools can be added without affecting existing ones
- Shared infrastructure (auth, components, design system) reduces development time

---

## Planned Tools

### 🎯 Tool 1: Inventory Tracking System (CURRENT PHASE - ~95% Complete)

**Purpose**: Track basement inventory items using unique 4-digit codes to eliminate physical trips during ordering.

**Key Features**:

- Add items with auto-generated unique codes
- **Autocomplete suggestions** for item names (combines existing items + 49 developer-managed templates)
- Remove items by unique code (individual display, no grouping)
- View current inventory with category filtering (3 view modes)
- Category preselection for streamlined data entry
- Complete audit history of all actions
- Admin user management

**Status**: Backend 100% complete (75/75 tests passing including autocomplete), Frontend 95% complete (authentication, dashboard, inventory UI with autocomplete implemented; history and admin panel pending)

**Detailed Planning**: See `Planning/InventoryTracking.md`

---

### 🥛 Tool 2: Milk Count System (NEXT)

**Purpose**: Streamline milk inventory counting and ordering process with automated calculations.

**Key Features**:

- Night count (FOH + BOH screens)
- Morning count with dual input methods (current BOH or direct delivered count)
- Auto-calculation of deliveries and order quantities
- Par level management
- Daily summary matching physical logbook format
- Historical data and trend analysis

**Status**: Planning complete, awaiting Tool 1 completion

**Detailed Planning**: See `Planning/MilkCount.md`

---

### 📦 Tool 3: RTD&E Counting System (FUTURE)

**Purpose**: Simplify restocking the Ready-to-Drink & Eat display with digital counting and pull list generation.

**Key Features**:

- Quick item counting with +/- interface
- Automatic pull list generation
- BOH fulfillment tracking (mark items as pulled)
- Integration with Siren's Eye visual guide
- Admin-managed item lists (seasonal updates)

**Status**: Planning complete, awaiting Tool 2 completion

**Detailed Planning**: See `Planning/RTDE.md`

---

## Scope

### In Scope (Overall Platform)

**Shared Infrastructure**:

- Single authentication system (one login for all tools)
- Unified dashboard with tool cards
- Global admin panel for user management
- Shared UI component library
- Mobile-first responsive design
- Secure session handling with JWT

**Per-Tool Functionality**:

- Each tool has dedicated database tables, API endpoints, and UI screens
- Tools are self-contained and independently buildable
- Tool-specific admin features (e.g., par level management for Milk Count)

### Out of Scope (Future Considerations)

- Multi-store support (MVP is single-store)
- Advanced analytics and cross-tool reporting
- Native mobile apps (MVP is mobile web)
- Integration with Starbucks ordering systems
- Real-time collaborative editing (multiple users editing simultaneously)
- Offline mode

---

## Goals

### Primary Operational Goals

1. **Efficiency** - Reduce time spent on manual inventory and counting tasks
2. **Accuracy** - Eliminate calculation errors and miscounts through automation
3. **Accountability** - Maintain complete audit trail of all actions across tools
4. **Simplicity** - Intuitive interface requiring minimal training
5. **Accessibility** - Fast, mobile-friendly access from anywhere in the store

### Technical Goals

1. **Reliability** - 99%+ uptime during business hours
2. **Performance** - < 2 second page loads, < 500ms API responses
3. **Security** - Protect partner information, secure authentication
4. **Maintainability** - Clean, well-tested, documented code
5. **Scalability** - Easy to add new tools without architectural changes

### Business Impact

- **Time Savings**: 15+ minutes per day per tool (45+ minutes total when all tools deployed)
- **Error Reduction**: Eliminate manual calculation and transcription errors
- **Data-Driven Decisions**: Historical data enables trend analysis and optimization
- **Partner Satisfaction**: Faster, less frustrating workflows

---

## Guiding Principles

### Design Principles

- **Mobile-First** - All tools designed for phones/tablets first, desktop second
- **Consistency** - Shared design language across all tools
- **Clarity Over Features** - Simple and obvious beats powerful and complex
- **Speed Matters** - Every interaction should feel instant
- **Fail Gracefully** - Clear error messages that help users recover
- **One App, Many Tools** - Unified experience, specialized functionality

### Development Principles

- **Type Safety** - TypeScript on frontend, type hints on backend
- **API-First Design** - Well-defined contracts between frontend and backend
- **Test Critical Paths** - Comprehensive testing for auth and core workflows
- **Document Decisions** - Record architectural choices for future reference
- **KISS (Keep It Simple, Stupid)** - Straightforward solutions over complex ones
- **YAGNI (You Aren't Gonna Need It)** - Build features when needed, not anticipated
- **Incremental Development** - Build and deploy tools one at a time

### Security Principles

- **Never Trust Client** - All validation happens server-side
- **Protect PII** - Partner numbers are private, handle with care
- **Secure by Default** - JWT tokens, hashed PINs, HTTPS only
- **Audit Everything** - Log all actions for accountability
- **Role-Based Access** - Global admin role for user and platform management

---

## Tech Stack

### Frontend

- **Framework**: Next.js 15+ (React with TypeScript)
  - App Router for file-based routing
  - Server-side rendering for fast initial loads
  - Built-in optimization and performance features
- **Styling**: TailwindCSS 4.0 + ShadCN UI components
  - Utility-first CSS for rapid development
  - Pre-built accessible components
  - Consistent design system
- **State Management**: React hooks (useState, useContext)
  - Simple enough for project scope
  - Shared auth context across all tools
- **HTTP Client**: Axios
  - Centralized API client with JWT token injection
  - Consistent error handling

### Backend

- **Framework**: Flask (Python 3.12+)
  - Lightweight and flexible
  - Excellent for RESTful APIs
  - Familiar technology
- **ORM**: SQLAlchemy 2.0
  - Robust database abstraction
  - Type-safe database operations
  - Easy migrations with Flask-Migrate
- **Authentication**: Flask-JWT-Extended
  - Secure token-based authentication
  - 24-hour token expiration
  - Role-based access control
- **CORS**: Flask-CORS
  - Enable cross-origin requests from Next.js
- **Validation**: Marshmallow
  - Request/response validation
  - Type checking and serialization
- **Testing**: pytest + pytest-flask
  - Comprehensive test coverage
  - Unit and integration tests

### Database

- **DBMS**: PostgreSQL 15+
  - Production-grade reliability
  - ACID compliance for data integrity
  - Excellent for relational data
- **Local Development**: Local PostgreSQL installation
  - Direct connection for simplicity
  - Full control over database configuration
- **Production**: AWS RDS PostgreSQL
  - Managed service (automatic backups, updates)
  - High availability options
  - Same region as backend for low latency

### Development Tools

- **Version Control**: Git + GitHub
  - Feature branch workflow
  - Commit often, deploy incrementally
- **API Testing**: Postman
  - Test endpoints during development
- **Database Management**: pgAdmin / Postico / DBeaver
  - GUI tools for database inspection
- **IDE**: Cursor
  - Python and TypeScript support
  - Git integration

### Deployment

- **Frontend Hosting**: Vercel
  - Optimized for Next.js
  - Automatic deployments from Git
  - Global CDN for fast loading
  - Free tier sufficient for MVP
- **Backend Hosting**: AWS Elastic Beanstalk
  - Handles Flask applications well
  - Auto-scaling capabilities
  - Easy environment management
- **Database**: AWS RDS PostgreSQL
  - Automated backups enabled
  - Multi-AZ for high availability (optional)
- **CI/CD**: GitHub Actions (future)
  - Automated testing before deployment

---

## Architecture Overview

### System Components

```
┌─────────────────────────────────────┐
│       Next.js Frontend App          │  (Vercel)
│         (TypeScript)                │
│                                     │
│  ┌─────────┐  ┌─────────────────┐  │
│  │Dashboard│  │  Tool Routing   │  │
│  │  (Grid) │→ │  /tools/*       │  │
│  └─────────┘  └─────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │ /tools/tracking/             │  │
│  │ /tools/milk-count/           │  │
│  │ /tools/rtde/                 │  │
│  │ /admin/                      │  │
│  └──────────────────────────────┘  │
└──────────────┬──────────────────────┘
               │ HTTPS/REST API
               │ JWT Authentication
┌──────────────▼──────────────────────┐
│       Flask Backend API             │  (AWS Elastic Beanstalk)
│          (Python)                   │
│                                     │
│  /api/auth/*        (shared)        │
│  /api/tracking/*    (tool 1)        │
│  /api/milk-count/*  (tool 2)        │
│  /api/rtde/*        (tool 3)        │
└──────────────┬──────────────────────┘
               │ SQLAlchemy
┌──────────────▼──────────────────────┐
│       PostgreSQL Database           │  (AWS RDS)
│                                     │
│  users                  (shared)    │
│  tracking_items         (tool 1)    │
│  tracking_history       (tool 1)    │
│  milk_count_sessions    (tool 2)    │
│  milk_count_par_levels  (tool 2)    │
│  rtde_items             (tool 3)    │
│  rtde_pull_lists        (tool 3)    │
└─────────────────────────────────────┘
```

### Key Interactions

1. **Authentication Flow (Shared)**

   - User enters partner number + PIN
   - Frontend sends to `/api/auth/login`
   - Backend validates, returns JWT token
   - Token stored in localStorage
   - Token included in all subsequent requests

2. **Dashboard Flow**

   - User logs in → Redirected to `/dashboard`
   - Dashboard displays tool cards (Tracking, Milk Count, RTD&E)
   - Admin users also see "Admin Panel" card
   - User clicks card → Routes to `/tools/{tool-name}/`

3. **Tool Operations Flow**

   - User performs action within a tool
   - Frontend sends authenticated request to `/api/{tool-name}/*`
   - Backend validates JWT, processes request
   - Database updated, audit log created (if applicable)
   - Response sent to frontend
   - UI updates to reflect changes

4. **Admin Operations Flow**
   - Admin user clicks "Admin Panel" card
   - Routes to `/admin` (protected route)
   - Manages users across entire platform
   - Uses `/api/auth/admin/*` endpoints

---

## Key Architectural Decisions

### Decision 1: API Namespacing Strategy ✅

**Choice**: Namespaced routes per tool

**Rationale**:

- Clear separation between tools (`/api/tracking/items` vs `/api/milk-count/sessions`)
- Prevents naming conflicts as more tools are added
- Easier to understand which tool an endpoint belongs to
- Matches frontend routing structure (`/tools/tracking/*`)

**Implementation**:

```
/api/auth/*                 # Shared authentication
/api/tracking/*             # Tool 1: Inventory Tracking
/api/milk-count/*           # Tool 2: Milk Count
/api/rtde/*                 # Tool 3: RTD&E
```

### Decision 2: Admin Role Strategy ✅

**Choice**: Global admin role

**Rationale**:

- Single store, same staff use all tools
- Admins should have full platform access (user management, tool-specific admin features)
- Simpler to implement and understand for MVP
- Can add granular per-tool permissions later if needed

**Implementation**:

- `users.role` column: `'admin'` or `'staff'`
- Admin Panel appears as dashboard card (visible only to admins)
- Admin panel manages users globally
- Tool-specific admin features (e.g., par levels) use same admin role check

### Decision 3: Database Table Naming ✅

**Choice**: Prefixed table names in single schema

**Rationale**:

- Simpler to work with (no schema switching)
- Standard PostgreSQL practice for multi-module apps
- Easier migrations and backups
- All tables visible in one place for debugging

**Implementation**:

```sql
-- Shared
users

-- Tool 1: Tracking
tracking_items
tracking_history

-- Tool 2: Milk Count
milk_count_sessions
milk_count_par_levels
milk_count_milk_types

-- Tool 3: RTD&E
rtde_items
rtde_pull_lists
```

---

## Database Strategy

### Shared Tables

**users** - Single user table for entire platform

- id (UUID, primary key)
- partner_number (String, unique, not null)
- name (String, not null)
- pin_hash (String, not null)
- role (Enum: 'admin', 'staff')
- created_at (Timestamp)
- updated_at (Timestamp)

### Tool-Specific Tables

Each tool has its own prefixed tables. See individual tool planning docs:

- **Tracking Tool**: `Planning/InventoryTracking.md` (tracking_items, tracking_history)
- **Milk Count Tool**: `Planning/MilkCount.md` (milk_count_sessions, milk_count_par_levels, etc.)
- **RTD&E Tool**: `Planning/RTDE.md` (rtde_items, rtde_pull_lists, etc.)

### Key Database Principles

- UUIDs for primary keys (prevents enumeration attacks)
- Timestamps on all tables for auditing
- Foreign key constraints with appropriate cascade rules
- Indexes on frequently queried columns
- Soft deletes where appropriate (preserve audit trail)

---

## Shared vs. Tool-Specific Components

### Shared Frontend Components

Located in `frontend/src/components/shared/`:

- **Layout Components**: Dashboard, NavBar, Footer
- **UI Primitives**: Button, Input, Card, Dialog (ShadCN)
- **Counter Component**: +/- buttons (used by Milk Count and RTD&E)
- **Auth Components**: LoginForm, ProtectedRoute
- **Utility Components**: LoadingSpinner, ErrorMessage, Toast

### Tool-Specific Frontend Components

Located in `frontend/src/components/tools/{tool-name}/`:

- Each tool has its own component directory
- Tool-specific forms, displays, and logic
- Reuses shared components for consistency

### Shared Backend Utilities

Located in `backend/app/`:

- **Auth Middleware**: JWT validation, admin_required decorator
- **Error Handlers**: Consistent error responses
- **Utilities**: Password hashing, validation helpers

### Tool-Specific Backend Modules

Located in `backend/app/tools/{tool_name}/`:

- Models, routes, schemas, and utilities per tool
- Isolated from other tools (no cross-tool dependencies)

---

## Security Considerations

### Authentication & Authorization

- PINs hashed with bcrypt (NEVER store plaintext)
- JWT tokens with 24-hour expiration
- Secure HTTP-only cookies (future enhancement)
- Role-based access: global `admin` and `staff` roles
- All endpoints require valid JWT token (except login/signup)

### Data Protection

- Partner numbers treated as sensitive PII
- HTTPS enforced in production
- Environment variables for all secrets (NEVER commit to Git)
- Regular security updates for dependencies
- Input validation on both client and server

### API Security

- All validation happens server-side
- Rate limiting on sensitive endpoints (login, future)
- CORS properly configured for frontend origin
- SQL injection prevention via SQLAlchemy ORM
- XSS protection via output sanitization

---

## Assumptions

1. **Single Store Deployment** - MVP designed for one Starbucks location
2. **Limited Concurrent Users** - Typically 5-10 staff members max at once
3. **Internet Available** - Store has reliable wifi/cellular connectivity
4. **Mobile Devices** - Staff have smartphones or tablets available
5. **Shared User Accounts** - Same login works for all tools
6. **Admin Pre-Exists** - At least one admin user seeded manually
7. **Tool Independence** - Tools don't need to share data (except user accounts)

---

## Constraints

### Technical Constraints

- Must work on mobile browsers (iOS Safari, Android Chrome)
- Must be responsive down to 320px width
- Must work with intermittent connectivity (graceful degradation)
- Must not expose partner numbers to unauthorized users
- Each tool must function independently

### Business Constraints

- Budget-conscious (free tier services preferred for MVP)
- Fast time-to-market (target 4-6 weeks per tool)
- Minimal training required (staff should understand in < 5 minutes)
- Must complement (not replace) official Starbucks recordkeeping

### Development Constraints

- Solo developer initially (code must be maintainable by one person)
- Limited time for learning new technologies (stick to known stack)
- Must be deployable without complex infrastructure
- Build tools incrementally (can't wait for all three to deploy)

---

## Risk Assessment

### Technical Risks

1. **Database Concurrency** - Multiple staff updating simultaneously
   - _Mitigation_: PostgreSQL transactions, proper locking
2. **Session Management** - JWT token expiration during active use
   - _Mitigation_: 24-hour expiration, refresh token strategy (future)
3. **Mobile Performance** - Slow loading on cellular networks
   - _Mitigation_: Code splitting, lazy loading, optimization

### Operational Risks

1. **Data Loss** - Critical inventory/count data could be lost
   - _Mitigation_: Automated daily backups, point-in-time recovery
2. **Downtime** - System unavailable when staff needs it
   - _Mitigation_: Health checks, monitoring, fallback to paper temporarily
3. **User Error** - Staff might make mistakes (wrong counts, wrong items)
   - _Mitigation_: Confirmation prompts, clear UI, audit trail for corrections

---

## Success Metrics

### User Adoption

- 90%+ of daily operations use SirenBase tools (not paper)
- All staff trained and comfortable with platform within 2 weeks
- Zero paper logs after 1 month of tool deployment
- Positive partner feedback (survey or informal)

### Technical Performance

- 99%+ uptime during business hours (6 AM - 10 PM)
- < 2 second page load times on 4G connection
- < 500ms API response times (P95)
- Zero data loss incidents

### Business Impact

- 15+ minutes saved per day per tool (45+ minutes total)
- Reduced inventory discrepancies
- Improved accountability and transparency
- Data-driven optimization (par levels, ordering patterns)

---

## Development Roadmap

### Phase 0-2: Foundation (COMPLETED)

**Timeline**: Weeks 1-4 (Oct 11 - Oct 23, 2025)

- ✅ Project setup (backend, frontend, database)
- ✅ Shared authentication system
- ✅ Tool 1 backend API (Inventory Tracking)
- ✅ Backend testing (66/66 tests passing)

### Phase 3A: Multi-Tool Architecture (COMPLETED)

**Timeline**: Week 5 (Oct 29-30, 2025)

- ✅ Multi-tool architecture setup (dashboard, routing)
- ✅ Backend API restructuring (`/api/tracking/*` namespace)
- ✅ Database table renaming (`tracking_*` prefix)
- ✅ Frontend directory restructuring

### Phase 3B: Tool 1 Frontend (CURRENT - ~80% Complete)

**Timeline**: Weeks 6-7 (Oct-Nov 2025)

- ✅ Authentication UI (login, protected routes, auth context)
- ✅ Dashboard with role-based tool cards
- ✅ Inventory UI (3 view modes, add/remove items, category preselection)
- ✅ Shared components (Header, Footer, ToolCard)
- 🔄 History page (pending)
- 🔄 Admin panel (pending)
- Testing and polish

### Phase 4: Testing & Quality Assurance

**Timeline**: Week 8

- Complete Tool 1 frontend (History, Admin panel)
- Backend/frontend integration testing
- Mobile device testing
- Performance optimization
- Bug fixes

### Phase 5: Tool 2 - Milk Count System (NEXT)

**Timeline**: Weeks 9-12

- Milk Count backend API (sessions, par levels, calculations)
- Milk Count frontend UI (night/morning counts, summary)
- Admin par level management
- Testing and deployment

### Phase 6: Tool 3 - RTD&E Counting System (FUTURE)

**Timeline**: Weeks 13-16

- RTD&E backend API (items, pull lists)
- RTD&E frontend UI (counting, pull list generation)
- Admin item management
- Testing and deployment

### Phase 7: Deployment & Production Launch (FUTURE)

**Timeline**: Weeks 17-18

- AWS deployment (RDS, Elastic Beanstalk)
- Vercel frontend deployment
- Performance optimization
- Mobile testing and refinement
- User training and documentation
- Analytics and monitoring setup

---

## Documentation Strategy

### Project Documentation

- **PLANNING.md** (this file) - Overall multi-tool architecture
- **Planning/InventoryTracking.md** - Tool 1 detailed planning
- **Planning/MilkCount.md** - Tool 2 detailed planning
- **Planning/RTDE.md** - Tool 3 detailed planning
- **TASKS.md** - Task tracking organized by tool
- **BUGS.md** - Bug and issue tracker with priorities
- **CLAUDE.md** - AI assistant guidelines
- **README.md** - Setup instructions and project overview

### Code Documentation

- Inline comments for complex logic (explain WHY, not WHAT)
- API documentation with example requests/responses
- Database schema diagrams
- Component README files for shared libraries

### User Documentation

- Quick start guide per tool
- Admin manual for user management
- Troubleshooting guide for common issues
- Training materials (post-deployment)

---

## Next Steps

See **TASKS.md** for the detailed, actionable task breakdown organized by tool and development phase.

**Current Focus**: Complete Tool 1 (Inventory Tracking) frontend development within the new multi-tool architecture.

---

_Last Updated: November 7, 2025_
_Version: 2.1.0 - Phase 3B Progress Update & Bug Tracking Integration_
_Maintainer: Development Team_
