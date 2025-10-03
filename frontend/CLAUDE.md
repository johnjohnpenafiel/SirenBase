# SirenBase Frontend - Next.js Guidelines

## Tech Stack

### Core Technologies
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript 5.2+
- **Styling**: TailwindCSS 3.4+ with ShadCN UI components
- **State Management**: React hooks (useState, useContext, useReducer)
- **HTTP Client**: Fetch API with custom hooks
- **Testing**: Jest + React Testing Library
- **Linting**: ESLint with @typescript-eslint
- **Formatting**: Prettier
- **Package Manager**: npm or pnpm (prefer pnpm for speed)

### Key Dependencies
```json
{
  "next": "^14.0.0",
  "react": "^18.0.0",
  "typescript": "^5.2.0",
  "tailwindcss": "^3.4.0",
  "@radix-ui/react-*": "latest",
  "class-variance-authority": "latest",
  "clsx": "latest",
  "tailwind-merge": "latest"
}
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx         # Root layout with metadata
│   │   ├── page.tsx           # Home/Login page
│   │   ├── globals.css        # Tailwind imports
│   │   ├── dashboard/         # Dashboard pages
│   │   ├── admin/             # Admin pages
│   │   └── api/               # API route handlers (if needed)
│   ├── components/            # React components
│   │   ├── ui/               # ShadCN UI components
│   │   ├── layout/           # Layout components (Header, Footer)
│   │   ├── inventory/        # Inventory-specific components
│   │   └── auth/             # Auth-specific components
│   ├── hooks/                # Custom React hooks
│   │   ├── use-auth.ts      # Authentication hook
│   │   ├── use-inventory.ts # Inventory operations
│   │   └── use-api.ts       # API client hook
│   ├── lib/                  # Utilities and helpers
│   │   ├── api.ts           # API client configuration
│   │   ├── auth.ts          # Auth utilities
│   │   ├── utils.ts         # General utilities (cn, etc.)
│   │   └── constants.ts     # App constants
│   ├── types/                # TypeScript type definitions
│   │   ├── api.ts           # API request/response types
│   │   ├── auth.ts          # Auth types
│   │   └── inventory.ts     # Inventory types
│   └── __tests__/            # Test files
│       ├── components/
│       └── hooks/
├── public/                    # Static assets
├── .env.local                 # Environment variables
├── next.config.js            # Next.js configuration
├── tailwind.config.ts        # Tailwind configuration
├── tsconfig.json             # TypeScript configuration
└── package.json              # Dependencies
```

## 🎯 Code Style & Conventions

### TypeScript Rules
- **Strict mode enabled** (`strict: true` in tsconfig.json)
- **Explicit types preferred** over implicit
- **No `any` types** - use `unknown` with type guards if needed
- **Interface for object shapes**, type for unions/intersections
- **Export types separately** from components when reusable

```typescript
// ✅ Good
interface User {
  partnerId: string;
  name: string;
  role: 'admin' | 'staff';
}

export function ProfileCard({ user }: { user: User }) {
  // ...
}

// ❌ Bad
export function ProfileCard({ user }: { user: any }) {
  // ...
}
```

### Component Conventions
- **Functional components only** with React hooks
- **Named exports for components** (not default)
- **Props interface named** `ComponentNameProps`
- **PascalCase for components**, camelCase for functions/variables
- **Destructure props** in function signature
- **Keep components under 300 lines** - split if larger

```typescript
// ✅ Good
interface ItemCardProps {
  itemName: string;
  itemCode: string;
  onRemove: (code: string) => void;
}

export function ItemCard({ itemName, itemCode, onRemove }: ItemCardProps) {
  return (
    <div className="card">
      <h3>{itemName}</h3>
      <span>{itemCode}</span>
      <button onClick={() => onRemove(itemCode)}>Remove</button>
    </div>
  );
}
```

### Import Organization
Group imports in this order:
1. React and Next.js imports
2. Third-party libraries
3. Local components (@/components)
4. Local utilities (@/lib, @/hooks)
5. Types (@/types)
6. Styles

```typescript
// ✅ Good
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import type { User } from '@/types/auth';
import './styles.css';

// ❌ Bad - unorganized imports
import { useAuth } from '@/hooks/use-auth';
import { useState } from 'react';
import './styles.css';
import { Button } from '@/components/ui/button';
```

### Naming Conventions
- **Components**: `PascalCase` (e.g., `InventoryList.tsx`)
- **Hooks**: `camelCase` with `use` prefix (e.g., `useInventory.ts`)
- **Utilities**: `camelCase` (e.g., `formatDate.ts`)
- **Types**: `PascalCase` (e.g., `type ItemType`, `interface UserData`)
- **Constants**: `SCREAMING_SNAKE_CASE` (e.g., `API_BASE_URL`)
- **Files**: `kebab-case` for pages (e.g., `inventory-history.tsx`)

## 🎨 Styling with TailwindCSS

### ShadCN UI Components
- **Use ShadCN components by default** for forms, buttons, dialogs, cards
- Install components with: `npx shadcn-ui@latest add [component]`
- Customize via `components.json` and Tailwind config
- Keep customizations minimal and consistent

### Tailwind Best Practices
- **Use Tailwind utility classes** - avoid custom CSS when possible
- **Use `cn()` utility** for conditional classes (from `lib/utils.ts`)
- **Extract repeated patterns** into components, not new utility classes
- **Mobile-first approach** - base styles for mobile, `sm:`, `md:` for larger
- **Consistent spacing** - use Tailwind's spacing scale (4, 8, 12, 16, etc.)

```typescript
import { cn } from '@/lib/utils';

// ✅ Good - conditional classes with cn()
<button
  className={cn(
    "px-4 py-2 rounded-md font-medium",
    isActive ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800",
    disabled && "opacity-50 cursor-not-allowed"
  )}
>
  Click me
</button>

// ❌ Bad - string concatenation
<button className={`px-4 py-2 ${isActive ? 'active' : 'inactive'}`}>
```

### Responsive Design
- **Mobile-first breakpoints**:
  - Base: 0-640px (mobile)
  - `sm:` 640px+ (large mobile)
  - `md:` 768px+ (tablet)
  - `lg:` 1024px+ (desktop)
  - `xl:` 1280px+ (large desktop)

```typescript
// ✅ Good - mobile-first
<div className="flex flex-col md:flex-row gap-4 p-4 md:p-6">
  {/* Content */}
</div>

// ❌ Bad - desktop-first
<div className="flex flex-row md:flex-col">
```

## 🪝 Custom Hooks Patterns

### Auth Hook Example
```typescript
// hooks/use-auth.ts
import { useState, useEffect, useCallback } from 'react';
import type { User } from '@/types/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const login = useCallback(async (partnerId: string, pin: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partnerId, pin }),
      });
      
      if (!response.ok) throw new Error('Login failed');
      
      const data = await response.json();
      setUser(data.user);
      localStorage.setItem('token', data.token);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('token');
  }, []);

  return { user, loading, login, logout };
}
```

### API Client Hook
```typescript
// hooks/use-api.ts
import { useCallback } from 'react';

export function useApi() {
  const request = useCallback(async <T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> => {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return response.json();
  }, []);

  return { request };
}
```

## 🔐 Authentication Handling

### Protected Routes
```typescript
// components/auth/protected-route.tsx
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) return <div>Loading...</div>;
  if (!user) return null;

  return <>{children}</>;
}
```

### Token Management
- Store JWT in `localStorage` (or `HttpOnly` cookie if backend supports)
- Include token in all API requests via `Authorization: Bearer <token>`
- Clear token on logout or 401 responses
- Refresh token before expiration (if refresh tokens implemented)

## 📝 Form Handling

### Best Practices
- Use controlled components with `useState`
- Validate on blur and on submit
- Show clear error messages near fields
- Disable submit button during submission
- Use ShadCN Form components for consistency

```typescript
// Example form component
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface LoginFormProps {
  onSubmit: (partnerId: string, pin: string) => Promise<void>;
}

export function LoginForm({ onSubmit }: LoginFormProps) {
  const [partnerId, setPartnerId] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validation
    if (!partnerId || !pin) {
      setError('All fields are required');
      return;
    }

    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      setError('PIN must be 4 digits');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(partnerId, pin);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="partnerId">Partner Number</Label>
        <Input
          id="partnerId"
          type="text"
          value={partnerId}
          onChange={(e) => setPartnerId(e.target.value)}
          disabled={loading}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="pin">PIN</Label>
        <Input
          id="pin"
          type="password"
          inputMode="numeric"
          pattern="\d{4}"
          maxLength={4}
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          disabled={loading}
          required
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Logging in...' : 'Log In'}
      </Button>
    </form>
  );
}
```

## 🧪 Testing Guidelines

### Component Testing
```typescript
// __tests__/components/item-card.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ItemCard } from '@/components/inventory/item-card';

describe('ItemCard', () => {
  const mockOnRemove = jest.fn();

  it('renders item name and code', () => {
    render(
      <ItemCard
        itemName="Coffee Beans"
        itemCode="1234"
        onRemove={mockOnRemove}
      />
    );

    expect(screen.getByText('Coffee Beans')).toBeInTheDocument();
    expect(screen.getByText('1234')).toBeInTheDocument();
  });

  it('calls onRemove with correct code when button clicked', () => {
    render(
      <ItemCard
        itemName="Coffee Beans"
        itemCode="1234"
        onRemove={mockOnRemove}
      />
    );

    fireEvent.click(screen.getByText('Remove'));
    expect(mockOnRemove).toHaveBeenCalledWith('1234');
  });
});
```

### Hook Testing
Use `@testing-library/react-hooks` or test hooks within components

## 🚀 Performance Optimization

### Next.js Specific
- Use **Server Components** by default (no `'use client'` unless needed)
- Add `'use client'` only for:
  - Components using hooks (useState, useEffect, etc.)
  - Components with event handlers
  - Components using browser APIs
- Use `next/image` for all images (automatic optimization)
- Implement **loading.tsx** and **error.tsx** for better UX
- Use **metadata** exports for SEO

### React Best Practices
- **Memoize expensive calculations** with `useMemo`
- **Memoize callbacks** with `useCallback` when passed to children
- **Lazy load** heavy components with `React.lazy()` and `Suspense`
- **Debounce** search inputs and frequent API calls
- **Virtualize** long lists (if list exceeds 50+ items)

```typescript
// ✅ Good - memoized expensive operation
const filteredItems = useMemo(() => {
  return items.filter(item => item.name.includes(searchTerm));
}, [items, searchTerm]);

// ❌ Bad - recalculates every render
const filteredItems = items.filter(item => item.name.includes(searchTerm));
```

## 🌐 Environment Variables

### Configuration
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_NAME=SirenBase
```

### Usage
- Prefix with `NEXT_PUBLIC_` for client-side access
- Never expose sensitive keys on client side
- Use `process.env.NEXT_PUBLIC_API_URL` in code
- Document all variables in README

## 🎭 Error Handling

### API Errors
```typescript
try {
  const data = await api.request('/items');
  setItems(data);
} catch (error) {
  if (error instanceof Error) {
    // Show user-friendly message
    toast.error(error.message);
  } else {
    toast.error('An unexpected error occurred');
  }
  console.error('API error:', error);
}
```

### Error Boundaries
Create error boundary components for graceful error handling

## 📋 Common Commands

```bash
# Development
npm run dev              # Start dev server (http://localhost:3000)
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run type-check       # Run TypeScript compiler

# Component Management
npx shadcn-ui@latest add button    # Add ShadCN button
npx shadcn-ui@latest add form      # Add ShadCN form

# Testing
npm run test             # Run tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report
```

## 🔍 Code Review Checklist

Before submitting PR, verify:
- [ ] TypeScript has no errors (`npm run type-check`)
- [ ] ESLint passes (`npm run lint`)
- [ ] All tests pass (`npm run test`)
- [ ] Components are properly typed
- [ ] Mobile responsiveness tested (320px - 1920px)
- [ ] Loading and error states implemented
- [ ] Accessibility: keyboard navigation, ARIA labels, proper contrast
- [ ] No console.log statements (use proper logging)
- [ ] Environment variables properly prefixed
- [ ] New components have tests

## 🚫 Common Pitfalls to Avoid

### Don't
- Use `any` type - use proper types or `unknown`
- Forget `'use client'` directive when using hooks
- Inline large components - extract and test separately
- Hardcode API URLs - use environment variables
- Ignore loading states - always show feedback
- Skip error handling - always handle errors gracefully
- Use `index.ts` barrel exports excessively (hurts tree-shaking)
- Create God components - keep focused and under 300 lines

### Do
- Use TypeScript strict mode
- Implement proper loading states
- Handle all error cases
- Test critical paths
- Keep components focused and small
- Use semantic HTML
- Follow mobile-first design
- Optimize images with next/image

---

**Last Updated**: October 2025  
**Version**: 1.0.0  
**For**: SirenBase Frontend Team
