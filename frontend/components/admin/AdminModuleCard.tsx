/**
 * Admin Module Card Component
 *
 * Compact, dense card for admin module launcher.
 * Follows the "Earned Space" design language:
 * - Amber accent badges for admin theme
 * - Tight spacing (p-4), no wasted space
 * - Small inline icons (size-5), not oversized circles
 * - Accessible with keyboard navigation
 */
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface AdminModuleCardProps {
  title: string;
  description: string;
  route: string;
  icon?: React.ReactNode;
  moduleId?: string;
  isDisabled?: boolean;
}

export function AdminModuleCard({
  title,
  description,
  route,
  icon,
  moduleId,
  isDisabled = false,
}: AdminModuleCardProps) {
  const content = (
    <>
      {/* Top row: module badge + icon */}
      <div className="flex items-center justify-between mb-3">
        {moduleId && (
          <span className="text-[10px] font-mono font-bold uppercase bg-amber-900 text-amber-100 px-2.5 py-1 rounded-full">
            {moduleId}
          </span>
        )}
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
    </>
  );

  if (isDisabled) {
    return (
      <div
        aria-label={`${title} (Coming soon)`}
        aria-disabled
        className="p-4 border border-neutral-300/80 rounded-2xl bg-card text-card-foreground transition-all opacity-50 cursor-not-allowed"
      >
        {content}
      </div>
    );
  }

  return (
    <Link
      href={route}
      aria-label={title}
      className="block p-4 border border-neutral-300/80 rounded-2xl bg-card text-card-foreground transition-all cursor-pointer hover:shadow-md active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      {content}
    </Link>
  );
}
