# SirenBase Deployment Guide

> **Purpose**: Learning reference and step-by-step deployment instructions
> **Task Tracking**: All deployment tasks live in `TASKS.md` (Phase 7)
> **Last Updated**: 2025-12-12

---

## Deployment Strategy Overview

**Approach**: Quick Deploy → Add Infrastructure → Migrate to AWS

| Phase | Stack | Monthly Cost | Timeline |
|-------|-------|-------------|----------|
| 7A: Quick Deploy | Vercel + Render + Neon | $7/month | Today |
| 7B: Infrastructure | + Docker + CI/CD + Staging | $7/month | This Week |
| 7C: AWS Migration | Vercel + AWS EB + AWS RDS | $0/month (free tier) | When Ready |

**Key Insight**: Docker containerization in Phase 7B makes AWS migration trivial. Same container runs everywhere.

---

## Architecture Diagrams

### Phase 7A: Quick Deploy
```
┌─────────────────┐     HTTPS      ┌─────────────────┐     PostgreSQL    ┌─────────────────┐
│    Vercel       │ ──────────────→│    Render       │ ──────────────────→│    Neon.tech    │
│   (Frontend)    │                │   (Backend)     │                    │   (Database)    │
│   Next.js       │                │   Flask API     │                    │   PostgreSQL    │
│   $0/month      │                │   $7/month      │                    │   $0/month      │
└─────────────────┘                └─────────────────┘                    └─────────────────┘
```

### Phase 7C: AWS Migration
```
┌─────────────────┐     HTTPS      ┌─────────────────┐     PostgreSQL    ┌─────────────────┐
│    Vercel       │ ──────────────→│ AWS Elastic     │ ──────────────────→│   AWS RDS       │
│   (Frontend)    │                │  Beanstalk      │                    │   PostgreSQL    │
│   Next.js       │                │  (Docker)       │                    │   db.t3.micro   │
│   $0/month      │                │  $0 (free tier) │                    │   $0 (free tier)│
└─────────────────┘                └─────────────────┘                    └─────────────────┘
```

---

## Phase 7A: Quick Deploy Instructions

### Step 1: Database Setup - Neon.tech (15 minutes)

1. Go to https://neon.tech and sign up (GitHub login works)
2. Create a new project named "sirenbase-prod"
3. Copy the connection string (looks like):
   ```
   postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/sirenbase?sslmode=require
   ```
4. Save this - you'll need it for Render

**Why Neon?**
- Free tier: 0.5GB storage, 3GB data transfer/month (plenty for your use)
- Real PostgreSQL (same as RDS)
- Auto-scaling, serverless
- No migration hassle to RDS later (same SQL, just change connection string)

### Step 2: Backend Deployment - Render.com (30 minutes)

1. Go to https://render.com and sign up
2. Click "New" → "Web Service"
3. Connect your GitHub repo
4. Configure:
   ```
   Name: sirenbase-api
   Region: Oregon (US West) - or nearest to you
   Branch: main
   Root Directory: backend
   Runtime: Python 3
   Build Command: pip install -r requirements.txt
   Start Command: gunicorn "app:create_app()" --bind 0.0.0.0:$PORT
   Instance Type: Starter ($7/month) ← No cold starts
   ```
5. Add Environment Variables:
   ```
   FLASK_ENV=production
   DATABASE_URL=<your-neon-connection-string>
   SECRET_KEY=<generate-a-long-random-string>
   JWT_SECRET_KEY=<generate-another-long-random-string>
   CORS_ORIGINS=https://your-vercel-domain.vercel.app
   ```
6. Click "Create Web Service"

**Note**: We'll update CORS_ORIGINS after Vercel deployment.

### Step 3: Database Migration (10 minutes)

After Render deploys, open the Render shell:
1. Go to your service → "Shell" tab
2. Run:
   ```bash
   flask db upgrade
   python -c "from app.seeds import seed_admin; seed_admin()"
   ```

### Step 4: Frontend Deployment - Vercel (15 minutes)

1. Go to https://vercel.com and sign up (GitHub login)
2. Click "Add New" → "Project"
3. Import your GitHub repo
4. Configure:
   ```
   Framework Preset: Next.js
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: .next
   ```
5. Add Environment Variable:
   ```
   NEXT_PUBLIC_API_URL=https://sirenbase-api.onrender.com/api
   ```
6. Click "Deploy"

### Step 5: Update CORS & Test (10 minutes)

1. Copy your Vercel URL (e.g., `sirenbase.vercel.app`)
2. Go to Render → Your Service → Environment
3. Update `CORS_ORIGINS` to your Vercel URL
4. Trigger a redeploy
5. Test login at your Vercel URL

**Total Time: ~1-2 hours**

---

## Phase 7B: Infrastructure Learning & Implementation

> **Learning Goal**: Don't just copy-paste - understand WHY each piece exists.

---

### Concept: What is Docker?

**The Problem Docker Solves**:
"It works on my machine" - the classic developer nightmare. Your Flask app runs perfectly on your Mac, but crashes on the server because of different Python versions, missing dependencies, or OS differences.

**Docker's Solution**:
Docker packages your app AND its environment into a "container" - a lightweight, portable box that runs identically everywhere. Think of it as shipping your entire laptop configuration, not just your code.

**Key Terms**:
| Term | Definition | Analogy |
|------|------------|---------|
| **Image** | Blueprint/recipe for creating containers | Class in OOP |
| **Container** | Running instance of an image | Object in OOP |
| **Dockerfile** | Instructions to build an image | Makefile |
| **Registry** | Storage for images (Docker Hub, AWS ECR) | npm registry |

**Why This Matters for Portfolio**:
- Nearly every company uses containers
- Shows you understand modern deployment practices
- Makes your app trivially easy to deploy anywhere

### Dockerfile Implementation

Create `backend/Dockerfile`:

```dockerfile
# Use official Python image as base
FROM python:3.11-slim

# Set working directory inside container
WORKDIR /app

# Install system dependencies for PostgreSQL
RUN apt-get update && apt-get install -y \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first (Docker caches this layer)
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Expose the port Flask runs on
EXPOSE 5000

# Command to run the application
CMD ["gunicorn", "app:create_app()", "--bind", "0.0.0.0:5000"]
```

**Line-by-line explanation**:
- `FROM python:3.11-slim`: Uses a pre-built Python image as starting point
- `WORKDIR /app`: Sets /app as the working directory inside container
- `RUN apt-get...`: Installs PostgreSQL client libraries
- `COPY requirements.txt .`: Copies dependencies first (caching optimization)
- `RUN pip install`: Installs your Python packages
- `COPY . .`: Copies your Flask app code
- `EXPOSE 5000`: Documents which port the app uses
- `CMD`: The command that runs when container starts

Create `backend/.dockerignore`:
```
__pycache__
*.pyc
.env
.venv
venv
.git
.gitignore
tests/
*.md
```

**Testing locally**:
```bash
cd backend
docker build -t sirenbase-api .
docker run -p 5000:5000 \
  -e DATABASE_URL="your-db-url" \
  -e SECRET_KEY="test" \
  -e JWT_SECRET_KEY="test" \
  sirenbase-api
```

---

### Concept: What is CI/CD?

**CI = Continuous Integration**:
Every time you push code, automated tests run to catch bugs BEFORE they reach production. No more "I forgot to run tests" - the system does it for you.

**CD = Continuous Deployment**:
When tests pass, code automatically deploys to production. No manual "ssh into server, git pull, restart" routine.

**The Pipeline Flow**:
```
Push Code → Run Tests → Build App → Deploy
    ↓           ↓           ↓          ↓
  GitHub    Automated    Create     Render/AWS
            pytest/     Docker      receives
            vitest      image       new version
```

**Why GitHub Actions?**
- Free for public repos (unlimited minutes)
- Built into GitHub (no extra service to manage)
- Industry standard alongside GitLab CI, Jenkins, CircleCI
- YAML-based configuration (easy to version control)

**Key Terms**:
| Term | Definition |
|------|------------|
| **Workflow** | YAML file defining what happens when (e.g., on push) |
| **Job** | Set of steps that run on one machine |
| **Step** | Single task (e.g., run tests, deploy) |
| **Runner** | Machine that executes your workflow (GitHub provides free) |

**Why This Matters for Portfolio**:
- Shows you understand professional development workflows
- Proves you can set up automation
- Demonstrates testing discipline

### GitHub Actions Implementation

Create `.github/workflows/ci.yml`:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test-backend:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: backend

    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: pip install -r requirements.txt

      - name: Run tests
        run: pytest --tb=short
        env:
          FLASK_ENV: testing
          SECRET_KEY: test-secret-key
          JWT_SECRET_KEY: test-jwt-key

  test-frontend:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: frontend

    steps:
      - uses: actions/checkout@v4

      - name: Set up Node
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

  deploy:
    needs: [test-backend, test-frontend]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'

    steps:
      - name: Deploy to Render
        run: |
          curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK }}
```

**Configuration explanation**:
- `on: push/pull_request`: Triggers on pushes and PRs to main
- `jobs`: Defines three parallel jobs
- `test-backend`: Runs pytest in backend directory
- `test-frontend`: Runs vitest in frontend directory
- `deploy`: Only runs if tests pass AND it's a push to main
- `secrets.RENDER_DEPLOY_HOOK`: Secret stored in GitHub settings

**Setting up the deploy hook**:
1. In Render: Settings → Deploy Hook → Copy URL
2. In GitHub: Settings → Secrets → Actions → New repository secret
3. Name: `RENDER_DEPLOY_HOOK`, Value: (paste Render URL)

---

### Concept: What are Environments?

**The Problem**:
You deploy a "small fix" directly to production... and it breaks the login for all users. Oops.

**The Solution - Multiple Environments**:
```
Development → Staging → Production
    ↓            ↓           ↓
 Your Mac    "Fake prod"  Real users
 localhost   for testing  live site
```

**Environment Types**:
| Environment | Purpose | Who Uses It |
|-------------|---------|-------------|
| **Development** | Instant feedback, safe to break | You, locally |
| **Staging** | Test before going live, catch bugs | You + QA |
| **Production** | Real users, must be stable | Everyone |

**Why Staging Matters**:
- Test in production-like environment without risk
- Catch environment-specific bugs (works locally, fails on server)
- QA testing before release
- Demonstrates professional deployment practices

**What Changes Between Environments**:
| Setting | Development | Staging | Production |
|---------|-------------|---------|------------|
| Database | localhost | staging.neon.tech | prod.neon.tech |
| API URL | localhost:5000 | staging.render.com | api.render.com |
| Debug | Verbose | Moderate | Minimal |
| Data | Test data | Copy of prod | Real data |

**Why This Matters for Portfolio**:
- Shows you understand production workflows
- Demonstrates risk management thinking
- Industry standard practice

---

## Phase 7C: AWS Migration

Once Docker is set up, AWS migration is straightforward.

### AWS Elastic Beanstalk

**What is it?**: AWS service that handles deployment, scaling, and load balancing for your Docker containers.

**Why use it?**:
- AWS name on your resume
- Free tier for first 12 months
- Production-grade infrastructure
- Same Docker container from Render works here

**Migration steps**:
```bash
# Install EB CLI
pip install awsebcli

# Initialize (in backend directory)
cd backend
eb init -p docker sirenbase-api

# Create environment
eb create sirenbase-prod

# Deploy
eb deploy
```

### AWS RDS PostgreSQL

**Migration steps**:
```bash
# Export from Neon
pg_dump -h neon-host -U username dbname > backup.sql

# Import to RDS
psql -h rds-host -U username dbname < backup.sql
```

**Free tier limits (12 months)**:
- EC2 t2.micro: 750 hours/month
- RDS db.t3.micro: 750 hours/month
- **Total: $0/month**

---

## Portfolio Value Summary

After completing all phases, you can showcase:

| Skill | Evidence |
|-------|----------|
| Full-Stack Development | Next.js + Flask + PostgreSQL |
| CI/CD Pipeline | GitHub Actions (automated testing + deploy) |
| Containerization | Docker (industry standard) |
| Cloud Platforms | Vercel, Render → AWS (shows progression) |
| Database Management | PostgreSQL with migrations, Neon → RDS |
| Testing | 152+ tests, test automation |
| Real-World Application | Actually deployed and used at Starbucks |
| Documentation | PLANNING.md, architecture docs |
| DevOps | Multi-environment (staging/prod) |

---

## Cost Summary

| Phase | Monthly Cost | Duration |
|-------|-------------|----------|
| Phase 7A-7B (Render) | $7/month | Until AWS migration |
| Phase 7C (AWS) | $0/month | First 12 months (free tier) |
| After AWS Free Tier | ~$15-25/month | Ongoing |

---

## Quick Reference: Environment Variables

### Production (Render)
```bash
FLASK_ENV=production
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/sirenbase?sslmode=require
SECRET_KEY=<long-random-string>
JWT_SECRET_KEY=<another-long-random-string>
CORS_ORIGINS=https://sirenbase.vercel.app
```

### Staging (Render)
```bash
FLASK_ENV=production
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/sirenbase-staging?sslmode=require
SECRET_KEY=<different-random-string>
JWT_SECRET_KEY=<different-random-string>
CORS_ORIGINS=https://sirenbase-staging.vercel.app
```

### Development (Local)
```bash
FLASK_ENV=development
DATABASE_URL=postgresql://username@localhost:5432/sirenbase
SECRET_KEY=dev-secret-key
JWT_SECRET_KEY=dev-jwt-key
CORS_ORIGINS=http://localhost:3000
```

---

_Last Updated: 2025-12-12_
