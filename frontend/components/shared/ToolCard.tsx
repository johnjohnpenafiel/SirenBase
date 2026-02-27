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
import Link from "next/link";
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
  const content = (
    <>
      {/* Top row: tool number badge + icon */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {toolNumber && (
            <span className="text-[10px] font-mono font-bold uppercase bg-black text-white px-2.5 py-1 rounded-full">
              {toolNumber}
            </span>
          )}
          {isAdminOnly && (
            <span className="text-[10px] font-mono font-bold uppercase bg-[#8a7259] text-white px-2.5 py-1 rounded-full">
              Admin
            </span>
          )}
        </div>
        {icon}
      </div>

      {/* Title */}
      <h2 className="text-lg font-semibold tracking-tight text-neutral-900">
        {title}
      </h2>

      {/* Description + chevron */}
      <div className="flex items-end justify-between mt-1">
        <p className="text-xs text-neutral-600 leading-relaxed pr-4">
          {isDisabled ? "Coming soon..." : description}
        </p>
        {!isDisabled && (
          <ChevronRight className="size-4 text-neutral-500 shrink-0" />
        )}
      </div>
    </>
  );

  if (isDisabled) {
    return (
      <div
        aria-label={`${title} (Coming soon)`}
        aria-disabled
        className="p-4 border border-[#b5a899] rounded-2xl bg-[#c4b8ab] text-neutral-800 transition-all opacity-50 cursor-not-allowed"
      >
        {content}
      </div>
    );
  }

  return (
    <Link
      href={route}
      aria-label={title}
      className="block p-4 border border-[#b5a899] rounded-2xl bg-[#c4b8ab] text-neutral-800 transition-all cursor-pointer hover:bg-[#d0c5b9] hover:shadow-md active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      {content}
    </Link>
  );
}
