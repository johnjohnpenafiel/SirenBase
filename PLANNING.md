# SirenBase - Project Planning Document

## Project Overview

**SirenBase** is a digital inventory management system designed to replace the paper-based inventory tracking used in the basement of a Starbucks store. The application provides a simple, secure, and accountable way for staff to track inventory items using 4-digit unique identifiers, eliminating the need for physical trips to the basement during daily ordering operations.

---

## High-Level Direction

### Vision

Create a reliable, intuitive, and fast inventory management tool that:

- Eliminates disruption to back-of-house operations during daily ordering
- Provides real-time inventory visibility without physical basement trips
- Maintains complete accountability through comprehensive audit logging
- Ensures precise tracking of duplicate items using unique identification codes

### Success Criteria

- Staff can check inventory in seconds from anywhere in the store
- Zero ambiguity about which specific item was added or removed
- Complete audit trail for all inventory changes
- Mobile-friendly interface for quick checks during busy periods
- Secure access limited to authorized staff only

---

## Scope

### In Scope (MVP)

1. **Authentication System**

   - Login with partner number + 4-digit PIN
   - Admin-controlled user management
   - Secure session handling

2. **Inventory Management**

   - Add items with auto-generated unique 4-digit codes
   - Remove items by selecting specific codes
   - View current inventory grouped by item type
   - Display all codes under each item type

3. **Audit & History**

   - Log all add/remove actions with timestamp
   - Track which staff member performed each action
   - History page showing recent activity

4. **Admin Panel**
   - Add/remove authorized users
   - View all user accounts
   - Manage access permissions

### Out of Scope (Future Considerations)

- Multi-store support
- Advanced analytics and reporting
- Low stock alerts and notifications

---

## Goals

### Primary Goals

1. **Operational Efficiency** - Reduce time spent on inventory checks during daily ordering
2. **Accuracy** - Eliminate confusion about what's in stock through unique code tracking
3. **Accountability** - Maintain complete audit trail of all inventory changes
4. **Simplicity** - Intuitive interface that requires minimal training

### Technical Goals

1. **Reliability** - System must be available when staff needs it
2. **Performance** - Fast loading times (< 2 seconds for all operations)
3. **Security** - Protect partner numbers and ensure only authorized access
4. **Maintainability** - Clean, well-documented code for future updates

---

## Guiding Principles

### Design Principles

- **Mobile-First** - Staff will primarily use phones/tablets
- **Clarity Over Features** - Simple and obvious beats powerful and complex
- **Speed Matters** - Every interaction should feel instant
- **Fail Gracefully** - Clear error messages that help users recover

### Development Principles

- **Type Safety** - Use TypeScript on frontend for fewer runtime errors
- **API-First Design** - Well-defined contracts between frontend and backend
- **Test Critical Paths** - Auth and inventory operations must be bulletproof
- **Document Decisions** - Record why choices were made for future reference

### Security Principles

- **Never Trust Client** - All validation happens server-side
- **Protect PII** - Partner numbers are private user IDs, handle with care
- **Secure by Default** - JWT tokens, hashed PINs, HTTPS only
- **Audit Everything** - Log all actions for accountability

---

## Tech Stack

### Frontend

- **Framework**: Next.js 14+ (React with TypeScript)
  - Server-side rendering for fast initial loads
  - File-based routing for clear structure
  - Built-in optimization and performance features
- **Styling**: TailwindCSS + ShadCN UI components
  - Rapid development with utility classes
  - Pre-built accessible components
  - Consistent design system
- **State Management**: React hooks (useState, useContext)
  - Simple enough for project scope
  - No need for Redux complexity
- **HTTP Client**: Fetch API / Axios
  - Standard REST API communication
  - JWT token management

### Backend

- **Framework**: Flask (Python)
  - Familiar technology from your experience
  - Lightweight and flexible
  - Excellent for RESTful APIs
- **ORM**: SQLAlchemy
  - Robust database abstraction
  - Type-safe database operations
  - Easy migrations with Alembic
- **Authentication**: Flask-JWT-Extended
  - Secure token-based authentication
  - Refresh token support
  - Role-based access control
- **CORS**: Flask-CORS
  - Enable cross-origin requests from Next.js frontend
- **Validation**: Marshmallow or Pydantic
  - Request/response validation
  - Type checking and serialization

### Database

- **DBMS**: PostgreSQL 15+
  - Production-grade reliability
  - ACID compliance for data integrity
  - Excellent for relational data
- **Local Development**: Local PostgreSQL installation
  - Direct connection for simplicity
  - Full control over database configuration
  - Familiar tooling and workflows
- **Production**: AWS RDS PostgreSQL
  - Managed service (automatic backups, updates)
  - High availability options
  - Scales with your needs

### Development Tools

- **Version Control**: Git + GitHub
  - Feature branch workflow
  - Pull requests for code review
- **API Testing**: Postman
  - Test endpoints during development
  - Share API collections with team
- **Database Management**: pgAdmin / Postico / DBeaver
  - GUI tools for database management
  - Query execution and visualization
  - Schema inspection and modification
- **IDE**: VS Code (recommended)
  - Python and TypeScript support
  - Git integration
  - Debugging tools

### Deployment

- **Frontend Hosting**: Vercel
  - Optimized for Next.js applications
  - Automatic deployments from Git
  - Global CDN for fast loading
  - Free tier sufficient for MVP
- **Backend Hosting**: AWS Elastic Beanstalk
  - Familiar from your AWS experience
  - Handles Flask applications well
  - Auto-scaling capabilities
  - Easy environment management
- **Database**: AWS RDS PostgreSQL
  - Same region as Elastic Beanstalk for low latency
  - Automatic backups enabled
  - Multi-AZ for high availability (optional)
- **CI/CD**: GitHub Actions
  - Automated testing before deployment
  - Deploy to staging/production environments

---

## Architecture Overview

### System Components

```
┌─────────────────┐
│   Next.js App   │  (Frontend - Vercel)
│  (TypeScript)   │
└────────┬────────┘
         │ HTTPS/REST API
         │ JWT Authentication
┌────────▼────────┐
│   Flask API     │  (Backend - AWS Elastic Beanstalk)
│    (Python)     │
└────────┬────────┘
         │ SQLAlchemy
┌────────▼────────┐
│   PostgreSQL    │  (Database - AWS RDS)
└─────────────────┘
```

### Key Interactions

1. **User Authentication Flow**

   - User enters partner number + PIN
   - Frontend sends credentials to `/api/auth/login`
   - Backend validates, returns JWT token
   - Frontend stores token, includes in all subsequent requests

2. **Inventory Operations Flow**

   - User performs action (add/remove item)
   - Frontend sends authenticated request to Flask API
   - Backend validates token, processes request
   - Database updated, history logged
   - Response sent back to frontend
   - UI updates to reflect changes

3. **Real-Time Updates**
   - Frontend polls `/api/items` periodically (every 10-15 seconds when active)
   - Alternatively: WebSocket connection for true real-time (future enhancement)

---

## Database Strategy

### Tables (High-Level)

1. **users** - Staff accounts (partner_number, name, pin_hash, role, created_at, updated_at)
2. **items** - Current inventory (id, name, **category**, code, added_by, added_at, is_removed, removed_at, removed_by)
3. **history** - Audit log (id, action, item_name, code, user_id, timestamp, notes)

### Key Decisions

- Use UUIDs for primary keys (prevents enumeration attacks)
- Index frequently queried columns (item codes, partner numbers, **item categories**)
- Referential integrity with foreign key constraints:
  - RESTRICT for users with items/history (preserve audit trail)
  - SET NULL for item removals (preserve record if user deleted)
- Timestamps on all tables for auditing
- **Soft delete for items** - Use `is_removed` flag instead of hard delete to preserve audit trail
- **Category field uses String + Validation** - Flexible for MVP, validated via frontend dropdown + backend schema
  - Categories: syrups, sauces, coffee_beans, powders, cups, lids, condiments, cleaning_supplies, other
  - See `UpdateLogs/CATEGORY_FIELD_DECISION.md` for detailed rationale

---

## Security Considerations

### Authentication

- PINs hashed with bcrypt (never store plaintext)
- JWT tokens with 24-hour expiration
- Refresh tokens for extended sessions
- Secure HTTP-only cookies (if using cookie-based auth)

### Authorization

- Role-based access: `admin` and `staff`
- Admin-only endpoints protected by decorator
- All endpoints require valid JWT token

### Data Protection

- Partner numbers treated as sensitive PII
- HTTPS enforced in production
- Environment variables for secrets (never commit to Git)
- Regular security updates for dependencies

---

## Assumptions

1. **Single Store Deployment** - MVP designed for one Starbucks location
2. **Limited Concurrent Users** - Typically 5-10 staff members max at once
3. **Internet Available** - Basement has wifi/cellular connectivity
4. **Mobile Devices** - Staff have smartphones or tablets available
5. **No Legacy Integration** - This is a greenfield project, no existing systems to integrate with
6. **Admin Pre-Exists** - At least one admin user will be seeded manually in database

---

## Constraints

### Technical Constraints

- Must work on mobile browsers (iOS Safari, Android Chrome)
- Must be responsive down to 320px width
- Must work with intermittent connectivity (graceful degradation)
- Must not expose partner numbers to unauthorized users

### Business Constraints

- Budget-conscious (free tier services preferred for MVP)
- Fast time-to-market (target 4-6 weeks for MVP)
- Minimal training required (staff should understand in < 5 minutes)

### Development Constraints

- Solo developer initially (code must be maintainable by one person)
- Limited time for learning new technologies (stick to known stack)
- Must be deployable without complex infrastructure

---

## Risk Assessment

### Technical Risks

1. **Database Concurrency** - Multiple staff updating simultaneously
   - _Mitigation_: PostgreSQL transactions, optimistic locking
2. **Code Collisions** - 4-digit codes might collide (10,000 combinations)
   - _Mitigation_: Check uniqueness before saving, handle gracefully
3. **Authentication Security** - Weak PINs could be guessed
   - _Mitigation_: Rate limiting on login attempts, account lockout

### Operational Risks

1. **Data Loss** - Critical inventory data could be lost
   - _Mitigation_: Automated daily backups, point-in-time recovery
2. **Downtime** - System unavailable when staff needs it
   - _Mitigation_: Health checks, monitoring, fallback to paper temporarily
3. **User Error** - Staff might remove wrong items
   - _Mitigation_: Clear confirmation prompts, undo capability (future)

---

## Success Metrics

### User Adoption

- 90%+ of daily orders completed without basement trip
- All staff trained and using system within 2 weeks
- Zero paper inventory logs after 1 month

### Technical Performance

- 99%+ uptime during business hours
- < 2 second page load times
- < 500ms API response times
- Zero data loss incidents

### Business Impact

- 15+ minutes saved per day on inventory checks
- Reduced inventory discrepancies
- Improved accountability and transparency

---

## Future Enhancements (Post-MVP)

### Phase 2 Possibilities

- Low stock alerts and notifications
- Analytics dashboard (most used items, usage patterns)
- Bulk operations (add multiple items at once)
- Export history to CSV/PDF for reporting

---

## Documentation Strategy

### Code Documentation

- README.md in each directory (frontend, backend)
- Inline comments for complex logic
- API documentation with example requests/responses
- Database schema diagram

### User Documentation

- Quick start guide for staff
- Admin manual for user management
- Troubleshooting guide for common issues

### Developer Documentation

- Setup instructions for local development
- Deployment procedures
- Architecture decision records (ADRs)
- Contribution guidelines (if open-sourcing)

---

## Next Steps

See **TASKS.md** for the detailed, actionable task breakdown to begin development.

---

_Last Updated: October 10, 2025_
