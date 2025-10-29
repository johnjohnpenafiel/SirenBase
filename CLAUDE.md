# SirenBase - Root Project Guidelines

## Project Overview

**SirenBase** is a comprehensive digital operations platform for Starbucks store partners. It provides a unified suite of specialized tools to streamline daily workflows, replacing manual paper-based systems with fast, mobile-friendly, and accountable digital solutions.

**Multi-Tool Architecture**: Partners log in once and access multiple tools from a central dashboard:
- **Tool 1**: Inventory Tracking System (basement inventory with 4-digit codes)
- **Tool 2**: Milk Count System (FOH/BOH counting with automated calculations)
- **Tool 3**: RTD&E Counting System (display restocking with pull lists)

Each tool operates independently with its own features, while sharing authentication, UI components, and design system.

## 🎯 Core Philosophy

### KISS (Keep It Simple, Stupid)

- Choose straightforward solutions over complex ones
- Simple code is easier to understand, maintain, and debug
- Avoid premature optimization

### YAGNI (You Aren't Gonna Need It)

- Implement features only when needed, not when anticipated
- No speculative functionality
- Focus on MVP requirements first

### Mobile-First Design

- Staff primarily use phones/tablets
- Responsive down to 320px width
- Fast loading times (< 2 seconds for all operations)
- Touch-friendly interfaces

## 🏗️ Architecture

### System Design

```
┌─────────────────┐
│   Next.js App   │  Frontend (Vercel)
│  (TypeScript)   │  Port: 3000
└────────┬────────┘
         │ REST API over HTTPS
         │ JWT Authentication
┌────────▼────────┐
│   Flask API     │  Backend (AWS Elastic Beanstalk)
│    (Python)     │  Port: 5000
└────────┬────────┘
         │ SQLAlchemy ORM
┌────────▼────────┐
│   PostgreSQL    │  Database (AWS RDS)
└─────────────────┘
```

### Key Components

- **Frontend**: Next.js 14+ with TypeScript, TailwindCSS, ShadCN UI
- **Backend**: Flask with SQLAlchemy, JWT authentication
- **Database**: PostgreSQL 15+ (Local installation for development, AWS RDS in production)

## 📋 Project Awareness & Context

### Essential Files to Check

1. **ALWAYS read `PLANNING.md`** at the start of new conversations

   - **Overall multi-tool architecture** and key decisions
   - Shared tech stack and infrastructure
   - API namespacing strategy (`/api/{tool-name}/*`)
   - Database naming conventions (`tracking_items`, `milk_count_sessions`, etc.)
   - Development roadmap (Tool 1 → Tool 2 → Tool 3)

2. **Read tool-specific planning docs** when working on that tool

   - `Tools/InventoryTracking.md` - Tool 1: Basement inventory tracking
   - `Tools/MilkCount.md` - Tool 2: Milk count system with calculations
   - `Tools/RTDE.md` - Tool 3: RTD&E display restocking

3. **Check `TASKS.md`** before starting work

   - Tasks organized by tool and phase
   - If task isn't listed, add it with date
   - Mark completed tasks immediately
   - Add discovered sub-tasks during work

4. **Review relevant component CLAUDE.md files**
   - `frontend/CLAUDE.md` for Next.js work (when created)
   - `backend/CLAUDE.md` for Flask work (when created)

## 🔒 Security Principles

### Authentication & Authorization

- JWT tokens with 24-hour expiration
- PINs hashed with bcrypt (NEVER store plaintext)
- Role-based access: `admin` and `staff`
- All endpoints require valid JWT token
- Secure HTTP-only cookies for token storage

### Data Protection

- Partner numbers are PII - handle with care
- HTTPS enforced in production (port 443)
- Environment variables for all secrets
- NEVER commit secrets to Git
- Input validation on both client and server

### API Security

- All validation happens server-side
- Rate limiting on sensitive endpoints (especially login)
- CORS properly configured for frontend origin
- SQL injection prevention via ORM
- XSS protection via output sanitization

## 🧱 Code Structure Principles

### Modularity

- **Never create files longer than 500 lines**
- Split into modules when approaching limit
- Group code by feature/responsibility
- Clear separation of concerns

### File Organization

```
SirenBase/
├── CLAUDE.md              # This file - Root project guidelines
├── PLANNING.md            # Multi-tool architecture & decisions
├── TASKS.md               # Task tracking (organized by tool)
├── README.md              # Setup & documentation
│
├── Tools/                 # Tool-specific planning documents
│   ├── InventoryTracking.md   # Tool 1: Detailed planning
│   ├── MilkCount.md           # Tool 2: Detailed planning
│   └── RTDE.md                # Tool 3: Detailed planning
│
├── frontend/              # Next.js application
│   ├── CLAUDE.md         # Frontend guidelines (when created)
│   ├── src/
│   │   ├── app/
│   │   │   ├── dashboard/          # Tool selection grid
│   │   │   ├── tools/
│   │   │   │   ├── tracking/       # Tool 1 pages
│   │   │   │   ├── milk-count/     # Tool 2 pages
│   │   │   │   └── rtde/           # Tool 3 pages
│   │   │   └── admin/              # Global admin panel
│   │   ├── components/
│   │   │   ├── shared/             # Cross-tool components
│   │   │   └── tools/              # Tool-specific components
│   │   └── lib/
│   └── ...
│
└── backend/               # Flask application
    ├── CLAUDE.md         # Backend guidelines (when created)
    ├── app/
    │   ├── routes/
    │   │   ├── auth.py             # Shared authentication
    │   │   └── tools/
    │   │       ├── tracking.py     # Tool 1 routes
    │   │       ├── milk_count.py   # Tool 2 routes
    │   │       └── rtde.py         # Tool 3 routes
    │   ├── models/
    │   │   ├── user.py             # Shared users table
    │   │   └── tools/
    │   │       ├── tracking.py     # Tool 1 models
    │   │       ├── milk_count.py   # Tool 2 models
    │   │       └── rtde.py         # Tool 3 models
    │   └── ...
    └── ...
```

### Naming Conventions

- **Frontend**: PascalCase for components, camelCase for functions/variables
- **Backend**: snake_case for Python (PEP8), camelCase for JSON API responses
- **Database**: snake_case for all table and column names
- **Files**: kebab-case for general files, PascalCase for React components

### Architectural Changes (Database Schema, New Features)

**CRITICAL RULE**: Never implement architectural changes without proper documentation workflow.

#### Before Implementing Features NOT in PLANNING.md:

1. **STOP and Ask User for Confirmation**
   - Explain what you want to add
   - Explain why it's needed
   - Wait for explicit user approval
   - Do NOT proceed without confirmation

2. **After User Approval:**
   - Implement the feature
   - Test to ensure it works as intended

3. **Immediately After Implementation (BEFORE next task):**
   - Update `PLANNING.md` with architectural decisions
   - Update `TASKS.md` to reflect completed work
   - Ensure documentation matches implementation

4. **Before Committing:**
   - Verify `PLANNING.md` reflects ALL implemented features
   - Verify `TASKS.md` is up to date
   - No orphaned features (code exists but not documented)

#### Examples of Architectural Changes Requiring This Process:
- Adding new database tables or columns
- Adding new fields to existing models
- Changing data types or relationships
- Adding new validation rules or business logic
- Changing API contracts or endpoints

#### Why This Matters:
- Prevents documentation drift
- Ensures team alignment on features
- Creates clear decision trail
- Maintains PLANNING.md as source of truth

**Remember**: Implementation flexibility is preserved, but documentation MUST be updated before commit.

## 🧪 Testing Strategy

### Test Requirements

- **Unit tests** for all business logic
- **Integration tests** for API endpoints
- **E2E tests** for critical user flows (auth, add/remove items)

### Test Organization

- Frontend: `frontend/src/__tests__/` or colocated `*.test.tsx`
- Backend: `backend/tests/` mirroring `app/` structure
- Each test file should include:
  - 1+ tests for expected use
  - 1+ edge case tests
  - 1+ failure case tests

### Testing Guidelines

- Mock external dependencies (database, API calls)
- Test business logic, not implementation details
- Keep tests isolated and independent
- Use descriptive test names that explain intent

## 📝 Documentation Standards

### Code Documentation

- **Comments**: Explain WHY, not WHAT (code should be self-documenting)
- **Complex Logic**: Add `# Reason:` or `// Reason:` comments
- **Functions**: Document all public functions/endpoints
- **APIs**: Include example requests/responses

### Project Documentation

- Update `README.md` when:
  - New features are added
  - Dependencies change
  - Setup steps are modified
- Keep `PLANNING.md` current with architectural decisions
- Document breaking changes in commit messages

## ✅ Task Management

### Before Starting Work

1. Check `TASKS.md` for the task
2. If not listed, add it with brief description and date
3. Understand task requirements and dependencies

### During Work

- Add discovered sub-tasks to `TASKS.md`
- Update task status if needed
- Document any blockers or decisions

### After Completion

- Mark task as completed in `TASKS.md` immediately
- Update related documentation
- Commit with clear, descriptive message

## 🎨 Design Principles

### User Experience

- **Clarity Over Features**: Simple and obvious beats complex
- **Speed Matters**: Every interaction should feel instant
- **Fail Gracefully**: Clear error messages that help recovery
- **Mobile-Optimized**: Touch targets at least 44x44px
- **Accessible**: Proper contrast, semantic HTML, keyboard navigation

### Technical Design

- **API-First**: Well-defined contracts between frontend/backend
- **Type Safety**: TypeScript on frontend, type hints on backend
- **Fail Fast**: Check errors early, raise exceptions immediately
- **Single Responsibility**: Each function/class has one clear purpose
- **Dependency Inversion**: Depend on abstractions, not concrete implementations

## 🚫 What NOT to Do

### Never

- Assume missing context - ask questions if uncertain
- Hallucinate libraries or functions - verify they exist
- Delete or overwrite existing code without explicit instruction
- Commit secrets, API keys, or passwords to Git
- Expose partner numbers or PII in logs
- Create files over 500 lines without refactoring
- Skip tests for new features
- Make breaking changes without team discussion

### Avoid

- Over-engineering simple solutions
- Premature optimization
- Tight coupling between components
- Hardcoding configuration values
- Inconsistent naming conventions
- Unclear variable/function names
- Deep nesting (> 3 levels)

## 🔧 Development Workflow

### Local Development

```bash
# Ensure PostgreSQL is running
# Check with: pg_isready or via GUI tool

# Start Backend (from backend/)
source venv/bin/activate
flask run --port 5000

# Start Frontend (from frontend/)
npm run dev
```

### Git Workflow

- **Branch naming**: `feature/TASK-description`, `bugfix/issue-description`
- **Commits**: Clear, descriptive messages in present tense
- **Pull Requests**: Include description, testing notes, screenshots

### Environment Variables

- Use `.env` files (NEVER commit to Git)
- Document required variables in README
- Provide `.env.example` templates

## 📊 Success Metrics

### Performance Targets

- Page load: < 2 seconds
- API response: < 500ms
- Time to Interactive: < 3 seconds
- Uptime: 99%+ during business hours

### User Experience Goals

- 90%+ of orders completed without basement trip
- All staff trained within 2 weeks
- Zero paper logs after 1 month
- Reduced inventory discrepancies

## 🤖 AI Behavior Rules

### Context Management

- Read essential files (PLANNING.md, TASKS.md, component CLAUDE.md)
- Confirm file paths and module names exist
- Reference actual code when suggesting changes

### Code Generation

- Follow language-specific style guides
- Include error handling
- Add appropriate comments
- Provide type hints/annotations
- Generate tests alongside code

### Communication

- Ask clarifying questions when uncertain
- Explain tradeoffs when multiple approaches exist
- Highlight potential issues or risks
- Suggest best practices
- Be concise but thorough

## 📚 Reference Documentation

### Official Docs

- Next.js: https://nextjs.org/docs
- Flask: https://flask.palletsprojects.com/
- PostgreSQL: https://www.postgresql.org/docs/
- TailwindCSS: https://tailwindcss.com/docs
- ShadCN UI: https://ui.shadcn.com/

### Internal Docs

- **Overall Architecture**: See `PLANNING.md` (multi-tool system design)
- **Tool-Specific Planning**:
  - Tool 1: `Tools/InventoryTracking.md`
  - Tool 2: `Tools/MilkCount.md`
  - Tool 3: `Tools/RTDE.md`
- **Task Tracking**: See `TASKS.md` (organized by tool and phase)
- **API Contracts**: See `backend/docs/API.md` (when created)
- **Component Library**: See `frontend/src/components/README.md` (when created)

---

**Last Updated**: October 26, 2025
**Version**: 2.0.0 - Multi-Tool Architecture
**Maintainer**: Development Team
