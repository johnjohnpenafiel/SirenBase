/**
 * Admin Module Card Component
 *
 * Reusable card for displaying admin modules on the admin dashboard.
 * Similar to ToolCard but designed for administrative functions.
 * Follows Design/components.md guidelines:
 * - Uses design system color tokens
 * - Hover effects with theme colors
 * - Accessible with keyboard navigation
 */
'use client';

import { useRouter } from 'next/navigation';

export interface AdminModuleCardProps {
  title: string;
  description: string;
  route: string;
  icon?: React.ReactNode;
  isDisabled?: boolean;
}

export function AdminModuleCard({
  title,
  description,
  route,
  icon,
  isDisabled = false,
}: AdminModuleCardProps) {
  const router = useRouter();

  const handleClick = () => {
    if (!isDisabled) {
      router.push(route);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isDisabled && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      router.push(route);
    }
  };

  return (
    <div
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={isDisabled ? -1 : 0}
      role="button"
      aria-label={`${title}${isDisabled ? ' (Coming soon)' : ''}`}
      aria-disabled={isDisabled}
      className={`
        p-6 border border-gray-200 rounded-xl bg-card text-card-foreground transition-all
        ${isDisabled
          ? 'opacity-50 cursor-not-allowed'
          : 'cursor-pointer hover:shadow-lg hover:border-amber-500 hover:scale-102 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2'
        }
      `}
    >
      {icon && <div className="mb-4 text-amber-600 dark:text-amber-400">{icon}</div>}

      <h2 className="text-xl font-semibold mb-2 text-foreground">
        {title}
      </h2>

      <p className="text-sm text-muted-foreground">
        {isDisabled ? 'Coming soon...' : description}
      </p>
    </div>
  );
}
