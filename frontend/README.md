# SirenBase Frontend - Next.js Application

> Modern, responsive web interface for the SirenBase multi-tool operations platform

## Overview

The SirenBase frontend is a Next.js 15 application that provides a unified dashboard for multiple operational tools. Built with TypeScript, TailwindCSS, and ShadCN UI components, it delivers a fast, mobile-first experience for store partners.

### Current Status
- **Dashboard**: ✅ Complete - Tool selection with role-based visibility
- **Tool 1 (Inventory Tracking)**: ✅ Complete - Full inventory management with autocomplete
- **Tool 2 (Milk Count)**: ✅ Complete - Night/morning counts, summary, history
- **Tool 3 (RTD&E)**: ✅ Complete - Counting interface, pull list, and admin management

## Tech Stack

- **Framework**: Next.js 15.5+ with App Router
- **Language**: TypeScript 5+
- **Styling**: TailwindCSS 4 with ShadCN UI components
- **Icons**: lucide-react
- **HTTP Client**: Axios (to be integrated)
- **State Management**: React hooks (useState, useContext)

## Prerequisites

- Node.js 18+ and npm
- Backend API running on `http://localhost:5000` (see `../backend/README.md`)

## Quick Start

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment Variables

```bash
cp .env.local.example .env.local
# Edit .env.local if needed (default: http://localhost:5000/api)
```

Environment variables:
- `NEXT_PUBLIC_API_URL`: Backend API base URL (must start with `NEXT_PUBLIC_` to be accessible in browser)

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the application.

### 4. Build for Production

```bash
npm run build
npm run start
```

## Project Structure

```
frontend/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Root page (redirects to dashboard)
│   ├── globals.css          # Global styles with Tailwind
│   ├── dashboard/           # Dashboard pages
│   │   └── page.tsx         # Tool selection grid
│   ├── tools/               # Tool-specific pages
│   │   ├── tracking/        # Tool 1: Inventory Tracking
│   │   │   ├── page.tsx           # Landing page
│   │   │   ├── inventory/         # Inventory view
│   │   │   └── history/           # History view
│   │   ├── milk-count/      # Tool 2: Milk Count (complete)
│   │   └── rtde/            # Tool 3: RTD&E Counting System
│   │       ├── page.tsx           # Landing/Entry point
│   │       └── session/[sessionId]/ # Unified session workflow (counting + pull list)
│   └── admin/               # Global admin panel
│       ├── page.tsx         # Admin dashboard with module cards
│       ├── users/           # User management
│       ├── rtde-items/      # RTD&E item management
│       └── milk-pars/       # Milk count par levels (coming soon)
├── components/              # React components
│   ├── shared/              # Cross-tool shared components
│   │   ├── Header.tsx       # Navigation header
│   │   ├── Footer.tsx       # Footer
│   │   └── ToolCard.tsx     # Dashboard tool cards
│   ├── auth/                # Authentication components
│   ├── admin/               # Admin-specific components
│   └── tools/               # Tool-specific components
│       ├── tracking/        # Tool 1 components
│       ├── tracking-history/# Tool 1 history components
│       ├── milk-count/      # Tool 2 components (complete)
│       └── rtde/            # Tool 3 components
│           ├── RTDECountCard.tsx      # Item counting interface
│           ├── RTDESessionSidebar.tsx # Desktop navigation sidebar
│           ├── RTDEMobileDrawer.tsx   # Mobile navigation drawer
│           ├── RTDEPullListItem.tsx   # Pull list item display
│           ├── ResumeSessionDialog.tsx # Session resume dialog
│           └── UncountedItemsDialog.tsx # Validation dialog
├── hooks/                   # Custom React hooks
│   └── use-auth.ts          # Authentication hook (minimal mock)
├── lib/                     # Utilities and helpers
│   └── utils.ts             # Utility functions (cn, etc.)
├── types/                   # TypeScript type definitions
├── public/                  # Static assets
└── components.json          # ShadCN UI configuration
```

## Multi-Tool Architecture

### Routing Structure

The frontend mirrors the backend's multi-tool architecture with clear namespacing:

**Root & Dashboard**:
- `/` → Redirects to `/dashboard`
- `/dashboard` → Tool selection grid (shows all available tools)

**Tool Routes**:
- `/tools/tracking/*` → Inventory Tracking pages (Tool 1)
  - `/tools/tracking/inventory` → Current inventory view
  - `/tools/tracking/history` → Transaction history
- `/tools/milk-count/*` → Milk Count pages (Tool 2) - Complete
  - `/tools/milk-count` → Landing page (start or resume session)
  - `/tools/milk-count/night/foh` → Night FOH counting
  - `/tools/milk-count/night/boh` → Night BOH counting
  - `/tools/milk-count/morning` → Morning count
  - `/tools/milk-count/on-order` → On-order entry
  - `/tools/milk-count/summary/[sessionId]` → Session summary
  - `/tools/milk-count/history` → Session history
- `/tools/rtde/*` → RTD&E Counting System (Tool 3)
  - `/tools/rtde` → Landing page (auto-start or resume session)
  - `/tools/rtde/session/[sessionId]` → Unified session workflow with phase-based rendering
    - Phase 1: Counting interface with sidebar/drawer navigation
    - Phase 2: Pull list generation and fulfillment tracking

**Admin Routes**:
- `/admin` → Admin dashboard with module cards
- `/admin/users` → User management
- `/admin/rtde-items` → RTD&E item and par level management
- `/admin/milk-pars` → Milk count par level management

### Component Organization

Components are organized by scope:

**Shared Components** (`components/shared/`):
- Used across multiple tools
- Examples: Header, Footer, ToolCard, common UI elements

**Tool-Specific Components** (`components/tools/<tool-name>/`):
- Isolated to a single tool
- Examples: InventoryList, MilkCountForm, RTDEPullList

**Auth & Admin Components** (`components/auth/`, `components/admin/`):
- Authentication flows and admin functionality
- Shared across all tools

## Development

### Adding ShadCN Components

```bash
# Add a component
npx shadcn@latest add button
npx shadcn@latest add dialog
npx shadcn@latest add form

# Components are added to components/ui/
```

### Code Style

- Use TypeScript strict mode (no `any` types)
- Functional components with hooks only
- Named exports for components (not default)
- Follow mobile-first responsive design
- See [`CLAUDE.md`](./CLAUDE.md) for complete guidelines

### Path Aliases

The project uses `@/*` path alias for clean imports:

```typescript
// Use this:
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'

// Instead of this:
import { Button } from '../../../components/ui/button'
```

## Authentication

Currently using a minimal mock authentication hook (`hooks/use-auth.ts`) that returns a test admin user.

**Phase 3B will implement**:
- Real JWT-based authentication
- Token storage (localStorage or HTTP-only cookies)
- Protected route wrapper
- Login/logout flows

## API Integration

**Coming in Phase 3B:**
- API client utility (`lib/api.ts`)
- TypeScript types for API responses (`types/`)
- Axios configuration with automatic JWT injection
- Error handling and loading states

Will integrate with backend endpoints:
- `/api/auth/*` - Authentication
- `/api/tracking/*` - Tool 1: Inventory Tracking
- `/api/admin/*` - Admin operations

## Available Scripts

```bash
# Development
npm run dev          # Start dev server (port 3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler (manual, not in package.json yet)

# Component Management
npx shadcn@latest add <component>  # Add ShadCN component
npx shadcn@latest diff <component> # View component differences
```

## Common Tasks

### Adding a New Tool Page

1. Create directory: `app/tools/<tool-name>/`
2. Create page: `app/tools/<tool-name>/page.tsx`
3. Add components: `components/tools/<tool-name>/`
4. Update dashboard: Add new ToolCard in `app/dashboard/page.tsx`
5. Add routing logic for navigation

### Creating a New Shared Component

1. Create file: `components/shared/<ComponentName>.tsx`
2. Export component as named export
3. Add TypeScript interface for props
4. Follow component patterns in `CLAUDE.md`

### Implementing Role-Based Features

Use the `useAuth` hook to check user role:

```typescript
import { useAuth } from '@/hooks/use-auth';

function MyComponent() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <div>
      {isAdmin && <AdminOnlyFeature />}
    </div>
  );
}
```

## Mobile Optimization

- All components are mobile-first (320px minimum width)
- Touch targets are at least 44x44px
- Text is readable without zooming
- Navigation is thumb-friendly
- Fast loading (<2 seconds for all pages)

## Troubleshooting

### Port 3000 Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or run on different port
npm run dev -- -p 3001
```

### Environment Variables Not Loading

- Ensure variables start with `NEXT_PUBLIC_` for client-side access
- Restart dev server after changing `.env.local`
- Check that `.env.local` exists and is not in `.gitignore`

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Try building again
npm run build
```

## Documentation

- **Detailed Guidelines**: See [`CLAUDE.md`](./CLAUDE.md) for component patterns, styling conventions, and best practices
- **Component Library**: ShadCN UI docs at [ui.shadcn.com](https://ui.shadcn.com)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **Architecture Decisions**: See `../ChangeLog/` for architectural change logs
- **Overall Planning**: See `../PLANNING.md` for multi-tool architecture overview

## Contributing

1. Follow TypeScript strict mode (no `any` types)
2. Use functional components with hooks only
3. Add proper TypeScript types for all props
4. Follow mobile-first responsive design
5. Test on multiple screen sizes (320px - 1920px)
6. See [`CLAUDE.md`](./CLAUDE.md) for complete guidelines

## Support

For questions or issues:
1. Check [`CLAUDE.md`](./CLAUDE.md) for coding guidelines
2. Review `../PLANNING.md` for architecture decisions
3. Check ShadCN UI docs for component usage

---

**Last Updated**: February 8, 2026
**Current Phase**: Phase 7A Complete - All Tools Deployed
**Status**: Tool 1 (Inventory Tracking) ✅, Tool 2 (Milk Count) ✅, Tool 3 (RTD&E) ✅ - All Complete
