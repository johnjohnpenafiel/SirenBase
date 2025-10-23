# SirenBase - Initial Tasks

This document contains clear, actionable tasks to start building the SirenBase inventory management system. Tasks are organized into logical phases and include checkboxes for tracking progress.

---

## Phase 0: Project Setup & Research ✅ COMPLETED (October 11, 2025)

### Environment Setup
- [x] Verify PostgreSQL installation
  - Check PostgreSQL is running: `psql --version` ✅ PostgreSQL 17.4
  - Test connection with `psql` or a GUI tool (pgAdmin, Postico, DBeaver) ✅
  - Create database: `createdb sirenbase` or via GUI tool ✅
- [x] Create project directories (already done: `frontend/`, `backend/`)
- [x] Initialize Git repository and create `.gitignore` files
  - Backend: Ignore `venv/`, `__pycache__/`, `.env`, `*.pyc` ✅
  - Frontend: Ignore `node_modules/`, `.next/`, `.env.local` ✅
  - Root: Added `.gitignore` for project-level files ✅
- [x] Set up GitHub repository
  - Repository active on `main` branch ✅
  - All Phase 0 work committed and pushed ✅

### Backend Setup (Flask)
- [x] Create Python virtual environment
  - Python 3.12.9 with venv ✅
- [x] Install initial dependencies
  - Flask 3.1.2, SQLAlchemy 2.0.44, JWT, CORS, Marshmallow, bcrypt ✅
  - psycopg2-binary 2.9.11 for PostgreSQL ✅
- [x] Create `requirements.txt`
  - All 21 dependencies documented ✅
- [x] Set up basic Flask project structure
  - Application factory pattern implemented ✅
  - Modular structure: models/, routes/, schemas/, middleware/, utils/ ✅
  - Extensions initialized: db, jwt, migrate ✅
  - Global error handlers registered ✅
- [x] Create `.env.example` file with required variables ✅
- [x] Copy to `.env` and fill with actual PostgreSQL credentials
  - Configured for user `johnpenafiel` with sirenbase database ✅

### Frontend Setup (Next.js)
- [x] Initialize Next.js project with TypeScript
  - Next.js 15.5.4 with App Router ✅
  - TypeScript 5.x configured ✅
  - Tailwind CSS 4.0 integrated ✅
- [x] Install additional dependencies
  - Axios 1.7.9 for API calls ✅
- [x] Install ShadCN UI
  - Initialized with default Neutral theme ✅
  - components.json configured ✅
  - lib/utils.ts created ✅
- [x] Set up Next.js project structure
  - app/ directory with layout and pages ✅
  - components/ with subdirectories (ui, layout, inventory, auth, history, admin) ✅
  - hooks/, types/, lib/ directories created ✅
- [x] Create `.env.local.example` ✅
- [x] Copy to `.env.local`
  - API URL configured: http://localhost:5000/api ✅

### Documentation
- [x] Update main `README.md` with project overview
  - Comprehensive setup instructions ✅
  - Running commands for both apps ✅
  - Environment variables documented ✅
  - Project structure overview ✅
- [x] ~~Create `backend/README.md` with setup instructions~~
  - **Decision**: Deferred to Phase 2 (after API endpoints implemented)
  - **Rationale**: Backend README more valuable with actual features to document; root README covers all setup needs for now
- [x] Update `frontend/README.md` with environment variable reference
  - Added env var section pointing to `.env.local.example` ✅
  - Links to main README for full documentation ✅

---

## Phase 1: Database Schema Design ✅ COMPLETED (October 17, 2025)

### Design Database Tables
- [x] Design `users` table schema
  - id (UUID, primary key)
  - partner_number (String, unique, not null)
  - name (String, not null)
  - pin_hash (String, not null)
  - role (Enum: 'admin', 'staff')
  - created_at (Timestamp)
  - updated_at (Timestamp)

- [x] Design `items` table schema ✅
  - id (UUID, primary key)
  - name (String, not null)
  - **category (String, not null, indexed)** ← Added October 17, 2025
  - code (String, unique, not null, 4 characters)
  - added_by (UUID, foreign key to users.id)
  - added_at (Timestamp)
  - is_removed (Boolean, for soft deletes)
  - removed_at (Timestamp, nullable)
  - removed_by (UUID, foreign key to users.id, nullable)

- [x] Design `history` table schema ✅
  - id (UUID, primary key)
  - action (Enum: 'ADD', 'REMOVE')
  - item_name (String, not null)
  - item_code (String, not null)
  - user_id (UUID, foreign key to users.id)
  - timestamp (Timestamp)
  - notes (Text, nullable)

- [x] Document relationships ✅
  - users → items (one-to-many: one user can add many items)
  - users → history (one-to-many: one user has many history entries)
  - Documented in `backend/app/models/__init__.py`

### Implement Database Models
- [x] Create SQLAlchemy models in `backend/app/models/` ✅
  - User model with password hashing methods (`models/user.py`)
  - Item model with soft delete support + **category field** (`models/item.py`)
  - History model with helper methods (`models/history.py`)
  - All models using SQLAlchemy 2.0 syntax with type hints
  - Category validation via constants file + Marshmallow schema (String + Validation approach)
  - See `UpdateLogs/CATEGORY_FIELD_DECISION.md` for rationale
- [x] Set up Flask-Migrate for migrations ✅
  - Flask-Migrate 4.1.0 already installed
  - Initialized with `flask db init`
- [x] Configure migrations to detect models ✅
  - Models imported in `app/__init__.py`
- [x] Create initial migration ✅
  - Migration file: `95337b169892_initial_schema_users_items_and_history_.py`
  - Includes all tables, indexes, and foreign keys
- [x] Review and apply migration ✅
  - Migration reviewed and verified
  - Applied with `flask db upgrade`
  - All tables created successfully

### Seed Database
- [x] Create database seeding script (`backend/seed.py`) ✅
  - Admin user creation (ADMIN001, PIN: 1234)
  - Test staff user creation (TEST123, PIN: 5678)
  - Sample items with unique 4-digit codes
  - History entries for all actions
  - Support for `--with-test-data` and `--clear` flags
- [x] Run seed script to populate initial data ✅
  - Created 2 users (1 admin, 1 staff)
  - Created 5 test items
  - Created 5 history entries
- [x] Verify data in PostgreSQL ✅
  - All tables populated correctly
  - Foreign key relationships working
  - Indexes created successfully

---

## Phase 2: Backend API Development

### Authentication Endpoints ✅ COMPLETED (October 22, 2025)
- [x] Implement POST `/api/auth/login`
  - Accept partner_number and PIN ✅
  - Validate credentials ✅
  - Return JWT access token ✅
  - Return user info (name, role) ✅
- [x] Implement POST `/api/auth/signup`
  - Accept partner_number, name, PIN ✅
  - Create user account (defaults to staff role) ✅
  - Return success/error ✅
- [x] Implement GET `/api/auth/me`
  - Validate JWT token ✅
  - Return current user info ✅
- [x] Create JWT token middleware for protected routes ✅
  - `@jwt_required()` decorator working ✅
  - `admin_required` decorator for admin-only routes ✅
- [x] Test all auth endpoints ✅
  - Login with valid/invalid credentials ✅
  - Signup with new user ✅
  - Get current user with JWT ✅
  - Validation error handling ✅

### Items/Inventory Endpoints ✅ COMPLETED (October 23, 2025)
- [x] Implement GET `/api/items` ✅
  - Return all active items ✅
  - Support filtering by category ✅
  - Optional include_removed parameter ✅
  - Requires authentication ✅
- [x] Implement POST `/api/items` ✅
  - Accept item name and category ✅
  - Generate unique 4-digit code ✅
  - Save to database ✅
  - Log ADD action in history ✅
  - Return item with generated code ✅
- [x] Implement DELETE `/api/items/<code>` ✅
  - Accept item code ✅
  - Soft delete (mark as removed) ✅
  - Log REMOVE action in history ✅
  - Return success/error ✅
- [x] Create utility helper for code generation ✅
  - `generate_unique_code()` with collision detection ✅
  - `format_category_display()` for UI formatting ✅
- [x] Test all item endpoints ✅
  - Create item with valid/invalid category ✅
  - Get items with/without filtering ✅
  - Delete item (existing/non-existent) ✅
  - Authorization checks ✅
  - Validation error handling ✅

### History Endpoints ✅ COMPLETED (October 23, 2025)
- [x] Implement GET `/api/history` ✅
  - Return recent history entries (configurable limit) ✅
  - Include user name via eager loading ✅
  - Include action, item details, timestamp ✅
  - Sort by most recent first ✅
  - Requires authentication ✅
- [x] Filtering support ✅
  - Filter by user_id (optional) ✅
  - Filter by action type (ADD/REMOVE) ✅
  - Configurable limit (default 100, max 500) ✅
- [x] Test history endpoints ✅
  - Get history with/without filters ✅
  - Action filtering (ADD/REMOVE) ✅
  - Invalid action validation ✅
  - Authentication required ✅
  - Limit parameter validation ✅

### Admin Endpoints
- [ ] Implement GET `/api/admin/users`
  - Return all users
  - Requires admin role
- [ ] Implement POST `/api/admin/users`
  - Add new authorized user (just partner_number)
  - Requires admin role
- [ ] Implement DELETE `/api/admin/users/:id`
  - Remove user authorization
  - Requires admin role
- [ ] Test admin endpoints with Postman

### Error Handling & Validation
- [ ] Implement global error handler
- [ ] Add request validation using Marshmallow
- [ ] Return consistent error response format
  ```json
  {
    "error": "Error message",
    "status_code": 400
  }
  ```
- [ ] Test error cases (invalid data, unauthorized access, etc.)

### CORS Configuration
- [ ] Configure Flask-CORS to allow Next.js origin
  ```python
  CORS(app, origins=["http://localhost:3000", "https://your-frontend-url.vercel.app"])
  ```

---

## Phase 3: Frontend Development

### Authentication UI
- [ ] Create login page (`app/login/page.tsx`)
  - Partner number input
  - PIN input (masked)
  - Login button
  - Error message display
- [ ] Create signup page (if allowing self-signup)
  - Partner number input
  - Name input
  - PIN input (with confirmation)
  - Submit button
- [ ] Implement authentication context/provider
  - Store JWT token in localStorage or secure cookie
  - Provide `login()`, `logout()`, `isAuthenticated()` functions
  - Provide current user info
- [ ] Create protected route wrapper
  - Redirect to login if not authenticated
  - Wrap inventory, history, and admin pages
- [ ] Test login/logout flow

### Inventory/Items UI
- [ ] Create inventory page (`app/inventory/page.tsx`)
  - Display items grouped by name
  - Show all codes under each item group
  - **Category filter dropdown** (filter by category)
  - "Add Item" button
  - "Remove Item" functionality for each code
- [ ] Create "Add Item" modal/dialog
  - Input for item name
  - **Category dropdown** (required, validated from predefined list)
  - Submit button
  - Display generated code
  - "I've written the code on the box" confirmation
  - Close and refresh inventory list
- [ ] Create "Remove Item" confirmation dialog
  - Show item name and code
  - Confirm/Cancel buttons
- [ ] Implement API calls to backend
  - Fetch items on page load
  - Add item with name
  - Remove item by code
- [ ] Add loading states and error handling
- [ ] Test add/remove workflows

### History UI
- [ ] Create history page (`app/history/page.tsx`)
  - Display recent actions in reverse chronological order
  - Show: staff name, action, item name, code, timestamp
  - Implement pagination or infinite scroll (if many entries)
- [ ] Fetch history data from backend
- [ ] Add filters (optional: by user, by date range)
- [ ] Test history display

### Admin Panel UI
- [ ] Create admin page (`app/admin/page.tsx`)
  - Require admin role (redirect if not admin)
  - Display all users in a table
  - Show partner number, name, role, created date
- [ ] Add "Add User" form/modal
  - Input for partner number
  - Submit button
- [ ] Add "Remove User" button for each user
  - Confirmation dialog
- [ ] Implement API calls for user management
- [ ] Test admin functionality

### UI/UX Polish
- [ ] Add ShadCN components (Button, Input, Dialog, Card, etc.)
- [ ] Implement consistent styling with TailwindCSS
- [ ] Add loading spinners for async operations
- [ ] Add toast notifications for success/error messages
- [ ] Ensure mobile responsiveness (test on various screen sizes)
- [ ] Add keyboard shortcuts for common actions (optional)
- [ ] Implement dark mode support (optional)

### API Integration
- [ ] Create API client utility (`lib/api.ts`)
  - Axios instance with base URL
  - Automatic JWT token injection in headers
  - Error handling interceptor
- [ ] **Create category constants file** (`lib/constants.ts`)
  - Define ITEM_CATEGORIES array (matches backend)
  - Create ItemCategory type
  - Create formatCategory utility function (e.g., "coffee_beans" → "Coffee Beans")
- [ ] Create TypeScript types for API responses (`types/index.ts`)
  - User type
  - Item type **(include category field)**
  - HistoryEntry type
  - ItemCategory type (from constants)
- [ ] Implement all API calls
  - Auth: login, signup, getMe
  - Items: getItems, addItem **(with category)**, removeItem
  - History: getHistory
  - Admin: getUsers, addUser, removeUser

---

## Phase 4: Testing & Quality Assurance

### Backend Testing
- [ ] Write unit tests for models
  - User password hashing
  - Code generation uniqueness
- [ ] Write unit tests for utility functions
- [ ] Write integration tests for API endpoints
  - Auth flow (login, protected routes)
  - CRUD operations (items, history)
  - Admin operations
- [ ] Test error handling and edge cases
- [ ] Run tests with `pytest`

### Frontend Testing (Optional for MVP)
- [ ] Write component tests with React Testing Library
- [ ] Test user flows (login, add item, remove item)
- [ ] Test error states and edge cases

### Manual Testing
- [ ] Test complete user workflows end-to-end
  - Admin adds user → User signs up → User logs in → User adds item → User removes item
- [ ] Test on multiple browsers (Chrome, Safari, Firefox)
- [ ] Test on mobile devices (iOS, Android)
- [ ] Test with multiple concurrent users
- [ ] Test error scenarios (network errors, invalid data, unauthorized access)

### Performance Testing
- [ ] Measure API response times
- [ ] Measure frontend page load times
- [ ] Test with larger datasets (100+ items)
- [ ] Optimize slow queries or operations

---

## Phase 5: Deployment Preparation

### Backend Deployment
- [ ] Create production configuration
  - Set `FLASK_ENV=production`
  - Use strong `JWT_SECRET_KEY`
  - Configure production database URL (AWS RDS)
- [ ] Set up AWS Elastic Beanstalk
  - Create application
  - Create environment
  - Configure environment variables
- [ ] Create `.ebextensions` config for AWS (if needed)
- [ ] Deploy backend to AWS Elastic Beanstalk
- [ ] Test production API endpoints

### Frontend Deployment
- [ ] Update `NEXT_PUBLIC_API_URL` to production backend URL
- [ ] Deploy to Vercel
  - Connect GitHub repository
  - Configure environment variables
  - Deploy
- [ ] Test production frontend

### Database Setup
- [ ] Create AWS RDS PostgreSQL instance
  - Choose appropriate instance size
  - Enable automated backups
  - Configure security groups (allow Elastic Beanstalk access)
- [ ] Run migrations on production database
  ```bash
  alembic upgrade head
  ```
- [ ] Seed production database with admin user

### Post-Deployment
- [ ] Test complete production workflow
- [ ] Set up monitoring and logging
  - AWS CloudWatch for backend
  - Vercel Analytics for frontend
- [ ] Set up error tracking (Sentry, optional)
- [ ] Create backup and restore procedures
- [ ] Document deployment process

---

## Phase 6: Documentation & Handoff

### User Documentation
- [ ] Create quick start guide for staff
  - How to log in
  - How to add items
  - How to remove items
  - How to check history
- [ ] Create admin guide
  - How to add users
  - How to manage access
- [ ] Create troubleshooting guide
  - Common issues and solutions

### Developer Documentation
- [ ] Document API endpoints with examples
  - Request/response formats
  - Authentication requirements
  - Error codes
- [ ] Create architecture diagram
- [ ] Document deployment procedures
- [ ] Document backup/restore procedures
- [ ] Add contribution guidelines (if open-sourcing)

### Training
- [ ] Conduct training session with staff
- [ ] Gather feedback on usability
- [ ] Address any issues or confusion
- [ ] Iterate based on feedback

---

## Ongoing Tasks

### Maintenance
- [ ] Monitor application health and errors
- [ ] Review and rotate JWT secrets periodically
- [ ] Keep dependencies up to date
- [ ] Respond to user feedback and bug reports
- [ ] Plan and implement feature enhancements

### Backups
- [ ] Verify automated backups are running (AWS RDS)
- [ ] Test restore procedures periodically
- [ ] Document backup retention policy

---

## Optional Enhancements (Post-MVP)

- [ ] Implement low stock alerts
- [ ] Add analytics dashboard
- [ ] Enable bulk operations
- [ ] Add export functionality (CSV, PDF)
- [ ] Implement WebSocket for real-time updates
- [ ] Create native mobile apps
- [ ] Add barcode/QR code scanning
- [ ] Integrate with POS system
- [ ] Add multi-store support

---

## Notes

- **Prioritize ruthlessly**: Focus on core functionality first (auth, add/remove items, history).
- **Test incrementally**: Don't wait until the end to test. Test each feature as you build it.
- **Use Claude Code effectively**: Provide clear context from PLANNING.md when asking for help.
- **Commit often**: Small, focused commits make debugging easier.
- **Deploy early**: Get to production as soon as basic functionality works.

---

*Last Updated: October 10, 2025*
