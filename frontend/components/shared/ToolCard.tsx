/**
 * Tool Card Component
 *
 * Reusable card for displaying tools on the dashboard.
 * Follows Design/components.md guidelines:
 * - Uses design system color tokens
 * - Hover effects with theme colors
 * - Accessible with keyboard navigation
 * - Admin badge uses theme accent colors
 */
"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export type ToolAccent = "stone" | "emerald" | "sky" | "amber";

const accentStyles: Record<ToolAccent, { hover: string }> = {
  stone:   { hover: "hover:bg-stone-50/60"   },
  emerald: { hover: "hover:bg-emerald-50/60" },
  sky:     { hover: "hover:bg-sky-50/60"     },
  amber:   { hover: "hover:bg-amber-50/60"   },
};

export interface ToolCardProps {
  title: string;
  description: string;
  route: string;
  icon?: React.ReactNode;
  accent?: ToolAccent;
  isDisabled?: boolean;
  isAdminOnly?: boolean;
}

export function ToolCard({
  title,
  description,
  route,
  icon,
  accent,
  isDisabled = false,
  isAdminOnly = false,
}: ToolCardProps) {
  const router = useRouter();

  const handleClick = () => {
    if (!isDisabled) {
      router.push(route);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isDisabled && (e.key === "Enter" || e.key === " ")) {
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
      aria-label={`${title}${isDisabled ? " (Coming soon)" : ""}`}
      aria-disabled={isDisabled}
      className={cn(
        "p-6 border border-neutral-300/80 rounded-2xl bg-card text-card-foreground transition-all",
        isDisabled
          ? "opacity-50 cursor-not-allowed"
          : cn(
              "cursor-pointer hover:shadow-lg hover:scale-102 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              accent
                ? accentStyles[accent].hover
                : isAdminOnly
                  ? "hover:border-amber-500"
                  : "hover:border-slate-600"
            )
      )}
    >
      {icon && <div className="mb-4">{icon}</div>}

      <h2 className="text-xl font-semibold mb-2 flex items-center gap-2 text-foreground">
        {title}
        {isAdminOnly && (
          <span className="text-xs px-2 py-1 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
            Admin
          </span>
        )}
      </h2>

      <p className="text-sm text-muted-foreground">
        {isDisabled ? "Coming soon..." : description}
      </p>
    </div>
  );
}
