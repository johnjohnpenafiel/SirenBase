/**
 * Authentication Hook
 *
 * Re-exports the useAuth hook from the auth context for backward compatibility.
 * The actual implementation is in contexts/auth-context.tsx
 */
'use client';

export { useAuth } from '@/contexts/auth-context';
export type { User } from '@/types';
