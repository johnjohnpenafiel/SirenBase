# SirenBase - Initial Tasks

This document contains clear, actionable tasks to start building the SirenBase inventory management system. Tasks are organized into logical phases and include checkboxes for tracking progress.

---

## Phase 0: Project Setup & Research

### Environment Setup
- [ ] Verify PostgreSQL installation
  - Check PostgreSQL is running: `psql --version`
  - Test connection with `psql` or a GUI tool (pgAdmin, Postico, DBeaver)
  - Create database: `createdb sirenbase` or via GUI tool
- [ ] Create project directories (already done: `frontend/`, `backend/`)
- [ ] Initialize Git repository and create `.gitignore` files
  - Backend: Ignore `venv/`, `__pycache__/`, `.env`, `*.pyc`
  - Frontend: Ignore `node_modules/`, `.next/`, `.env.local`
- [ ] Set up GitHub repository (if not already done)
  - Create `main` and `develop` branches
  - Set branch protection rules

### Backend Setup (Flask)
- [ ] Create Python virtual environment
  ```bash
  cd backend
  python -m venv venv
  source venv/bin/activate  # On Windows: venv\Scripts\activate
  ```
- [ ] Install initial dependencies
  ```bash
  pip install flask flask-cors flask-jwt-extended sqlalchemy psycopg2-binary python-dotenv alembic marshmallow
  ```
- [ ] Create `requirements.txt`
  ```bash
  pip freeze > requirements.txt
  ```
- [ ] Set up basic Flask project structure
  ```
  backend/
  ├── app/
  │   ├── __init__.py
  │   ├── models.py
  │   ├── routes/
  │   │   ├── __init__.py
  │   │   ├── auth.py
  │   │   ├── items.py
  │   │   ├── history.py
  │   │   └── admin.py
  │   ├── utils.py
  │   └── config.py
  ├── migrations/
  ├── tests/
  ├── .env.example
  ├── .env
  ├── requirements.txt
  └── run.py
  ```
- [ ] Create `.env.example` file with required variables
  ```
  DATABASE_URL=postgresql://username@localhost:5432/sirenbase
  JWT_SECRET_KEY=your-secret-key-change-in-production
  FLASK_ENV=development
  ```
- [ ] Copy to `.env` and fill with actual PostgreSQL credentials
  - Update `username` with your PostgreSQL username
  - Add password if required: `postgresql://username:password@localhost:5432/sirenbase`

### Frontend Setup (Next.js)
- [ ] Initialize Next.js project with TypeScript
  ```bash
  cd frontend
  npx create-next-app@latest . --typescript --tailwind --app --no-src-dir
  ```
- [ ] Install additional dependencies
  ```bash
  npm install axios
  npm install -D @types/node
  ```
- [ ] Install ShadCN UI
  ```bash
  npx shadcn-ui@latest init
  ```
- [ ] Set up basic Next.js project structure
  ```
  frontend/
  ├── app/
  │   ├── layout.tsx
  │   ├── page.tsx
  │   ├── login/
  │   ├── inventory/
  │   ├── history/
  │   └── admin/
  ├── components/
  │   ├── ui/          # ShadCN components
  │   └── ...          # Custom components
  ├── lib/
  │   ├── api.ts       # API client
  │   ├── auth.ts      # Auth utilities
  │   └── utils.ts
  ├── types/
  │   └── index.ts     # TypeScript types
  ├── .env.local.example
  ├── .env.local
  └── next.config.js
  ```
- [ ] Create `.env.local.example`
  ```
  NEXT_PUBLIC_API_URL=http://localhost:5000/api
  ```
- [ ] Copy to `.env.local`

### Documentation
- [ ] Update main `README.md` with project overview
- [ ] Create `backend/README.md` with setup instructions
- [ ] Create `frontend/README.md` with setup instructions
- [ ] Document environment variables in both READMEs

---

## Phase 1: Database Schema Design

### Design Database Tables
- [ ] Design `users` table schema
  - id (UUID, primary key)
  - partner_number (String, unique, not null)
  - name (String, not null)
  - pin_hash (String, not null)
  - role (Enum: 'admin', 'staff')
  - created_at (Timestamp)
  - updated_at (Timestamp)

- [ ] Design `items` table schema
  - id (UUID, primary key)
  - name (String, not null)
  - code (String, unique, not null, 4 characters)
  - added_by (UUID, foreign key to users.id)
  - added_at (Timestamp)
  - removed_at (Timestamp, nullable - for soft deletes)

- [ ] Design `history` table schema
  - id (UUID, primary key)
  - action (Enum: 'ADD', 'REMOVE')
  - item_name (String, not null)
  - item_code (String, not null)
  - user_id (UUID, foreign key to users.id)
  - timestamp (Timestamp)
  - notes (Text, nullable)

- [ ] Document relationships
  - users → items (one-to-many: one user can add many items)
  - users → history (one-to-many: one user has many history entries)

### Implement Database Models
- [ ] Create SQLAlchemy models in `backend/app/models.py`
  - User model with password hashing methods
  - Item model with code generation logic
  - History model
- [ ] Set up Alembic for migrations
  ```bash
  cd backend
  alembic init migrations
  ```
- [ ] Configure Alembic to use your database URL
- [ ] Create initial migration
  ```bash
  alembic revision --autogenerate -m "Initial schema"
  ```
- [ ] Review migration file and apply
  ```bash
  alembic upgrade head
  ```

### Seed Database
- [ ] Create database seeding script (`backend/seed.py`)
  - Create at least one admin user
  - Add sample items for testing (optional)
- [ ] Run seed script to populate initial data
- [ ] Verify data in PostgreSQL using `psql` or GUI tool

---

## Phase 2: Backend API Development

### Authentication Endpoints
- [ ] Implement POST `/api/auth/login`
  - Accept partner_number and PIN
  - Validate credentials
  - Return JWT access token
  - Return user info (name, role)
- [ ] Implement POST `/api/auth/signup`
  - Accept partner_number, name, PIN
  - Check if partner_number is authorized (admin pre-added)
  - Create user account
  - Return success/error
- [ ] Implement GET `/api/auth/me`
  - Validate JWT token
  - Return current user info
- [ ] Create JWT token middleware for protected routes
- [ ] Test all auth endpoints with Postman

### Items/Inventory Endpoints
- [ ] Implement GET `/api/items`
  - Return all active items grouped by name
  - Include codes for each item
  - Requires authentication
- [ ] Implement POST `/api/items`
  - Accept item name
  - Generate unique 4-digit code
  - Save to database
  - Log action in history
  - Return item with generated code
- [ ] Implement DELETE `/api/items/:code`
  - Accept item code
  - Mark item as removed (soft delete or hard delete)
  - Log action in history
  - Return success/error
- [ ] Test all item endpoints with Postman

### History Endpoints
- [ ] Implement GET `/api/history`
  - Return recent history entries (last 50 or 100)
  - Include user name, action, item details, timestamp
  - Sort by most recent first
  - Requires authentication
- [ ] Implement GET `/api/history?user_id=X` (optional filter)
  - Filter history by specific user
- [ ] Test history endpoints with Postman

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
  - "Add Item" button
  - "Remove Item" functionality for each code
- [ ] Create "Add Item" modal/dialog
  - Input for item name
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
- [ ] Create TypeScript types for API responses (`types/index.ts`)
  - User type
  - Item type
  - HistoryEntry type
- [ ] Implement all API calls
  - Auth: login, signup, getMe
  - Items: getItems, addItem, removeItem
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
