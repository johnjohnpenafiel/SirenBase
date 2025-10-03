# SirenBase - Root Project Guidelines

## Project Overview

**SirenBase** is a digital inventory management system designed to replace the paper-based inventory tracking used in the basement of a Starbucks store. The application provides a simple, secure, and accountable way for staff to track inventory items using 4-digit unique identifiers, eliminating the need for physical trips to the basement during daily ordering operations.

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
- **Database**: PostgreSQL 15+ (Docker locally, AWS RDS in production)

## 📋 Project Awareness & Context

### Essential Files to Check

1. **ALWAYS read `PLANNING.md`** at the start of new conversations

   - Contains architecture, goals, constraints
   - Tech stack decisions and rationale
   - Success criteria and metrics

2. **Check `TASKS.md`** before starting work

   - If task isn't listed, add it with date
   - Mark completed tasks immediately
   - Add discovered sub-tasks during work

3. **Review relevant component CLAUDE.md files**
   - `frontend/CLAUDE.md` for Next.js work
   - `backend/CLAUDE.md` for Flask work

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
├── CLAUDE.md              # This file
├── PLANNING.md            # Architecture & decisions
├── TASKS.md               # Task tracking
├── README.md              # Setup & documentation
├── frontend/              # Next.js application
│   ├── CLAUDE.md         # Frontend guidelines
│   ├── src/
│   └── ...
└── backend/               # Flask application
    ├── CLAUDE.md         # Backend guidelines
    ├── app/
    └── ...
```

### Naming Conventions

- **Frontend**: PascalCase for components, camelCase for functions/variables
- **Backend**: snake_case for Python (PEP8), camelCase for JSON API responses
- **Database**: snake_case for all table and column names
- **Files**: kebab-case for general files, PascalCase for React components

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
# Start PostgreSQL (Docker)
docker-compose up -d postgres

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

- Architecture: See `PLANNING.md`
- API Contracts: See `backend/docs/API.md` (when created)
- Component Library: See `frontend/src/components/README.md` (when created)

---

**Last Updated**: October 2025  
**Version**: 1.0.0  
**Maintainer**: Development Team
