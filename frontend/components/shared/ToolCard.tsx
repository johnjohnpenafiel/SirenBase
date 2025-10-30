/**
 * Tool Card Component
 *
 * Reusable card for displaying tools on the dashboard.
 * Used in the tool selection grid.
 */
'use client';

import { useRouter } from 'next/navigation';

export interface ToolCardProps {
  title: string;
  description: string;
  route: string;
  icon?: React.ReactNode;
  isDisabled?: boolean;
  isAdminOnly?: boolean;
}

export function ToolCard({
  title,
  description,
  route,
  icon,
  isDisabled = false,
  isAdminOnly = false,
}: ToolCardProps) {
  const router = useRouter();

  const handleClick = () => {
    if (!isDisabled) {
      router.push(route);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`
        p-6 border rounded-lg transition-all
        ${isDisabled
          ? 'opacity-50 cursor-not-allowed'
          : 'cursor-pointer hover:shadow-md hover:border-primary'
        }
        ${isAdminOnly ? 'border-amber-500' : ''}
      `}
    >
      {icon && <div className="mb-4">{icon}</div>}

      <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
        {title}
        {isAdminOnly && (
          <span className="text-xs px-2 py-1 rounded bg-amber-100 text-amber-800">
            Admin
          </span>
        )}
      </h2>

      <p className="text-sm text-muted-foreground">
        {isDisabled ? 'Coming soon...' : description}
      </p>
    </div>
  );
}
