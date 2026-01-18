/**
 * CategoryCard Component
 *
 * Displays an inventory category with item count.
 * Typography-focused design with pill-shaped category label.
 */

import { cn } from "@/lib/utils";

interface CategoryCardProps {
  category: string;
  count: number;
  onClick: () => void;
}

export function CategoryCard({ category, count, onClick }: CategoryCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "p-5 bg-card rounded-2xl text-left",
        "border border-border",
        "active:bg-muted/50 transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      )}
    >
      <p className="inline-block text-[10px] font-medium tracking-wide uppercase text-muted-foreground bg-muted px-2.5 py-1 rounded-full mb-4 whitespace-nowrap">
        {category}
      </p>
      <div className="flex items-baseline gap-1.5">
        <span className="text-4xl font-bold tabular-nums tracking-tight text-foreground">
          {count}
        </span>
        <span className="text-sm text-muted-foreground">items</span>
      </div>
    </button>
  );
}
