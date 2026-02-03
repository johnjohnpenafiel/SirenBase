/**
 * Tool Card Component
 *
 * Compact, dense card for dashboard tool launcher.
 * Follows the tracking tool's visual DNA:
 * - Black accent badges for contrast
 * - Tight spacing, no wasted space
 * - Small inline icons, not oversized circles
 * - Accessible with keyboard navigation
 */
"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

export type ToolAccent = "stone" | "emerald" | "sky" | "amber";

export interface ToolCardProps {
  title: string;
  description: string;
  route: string;
  icon?: React.ReactNode;
  accent?: ToolAccent;
  toolNumber?: string;
  isDisabled?: boolean;
  isAdminOnly?: boolean;
}

export function ToolCard({
  title,
  description,
  route,
  icon,
  accent,
  toolNumber,
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
        "p-4 border border-neutral-300/80 rounded-2xl bg-card text-card-foreground transition-all",
        isDisabled
          ? "opacity-50 cursor-not-allowed"
          : "cursor-pointer hover:shadow-md active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      )}
    >
      {/* Top row: tool number badge + icon */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {toolNumber && (
            <span className="text-[10px] font-mono font-bold uppercase bg-black text-white px-2.5 py-1 rounded-full">
              {toolNumber}
            </span>
          )}
          {isAdminOnly && (
            <span className="text-[10px] font-mono font-bold uppercase bg-amber-900 text-amber-100 px-2.5 py-1 rounded-full">
              Admin
            </span>
          )}
        </div>
        {icon}
      </div>

      {/* Title */}
      <h2 className="text-lg font-semibold tracking-tight text-foreground">
        {title}
      </h2>

      {/* Description + chevron */}
      <div className="flex items-end justify-between mt-1">
        <p className="text-xs text-muted-foreground leading-relaxed pr-4">
          {isDisabled ? "Coming soon..." : description}
        </p>
        {!isDisabled && (
          <ChevronRight className="size-4 text-muted-foreground/40 shrink-0" />
        )}
      </div>
    </div>
  );
}
