/**
 * ItemCard Component
 *
 * Displays an inventory item with code, name, and category.
 * Typography-focused design matching CategoryCard's visual language.
 * Uses curved arrow icon to indicate "moving out" of inventory.
 */

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CornerUpRight } from "lucide-react";

interface ItemCardProps {
  code: string;
  name: string;
  category: string;
  addedAt: string;
  onRemove: () => void;
  isRemoving: boolean;
}

function formatAddedDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return "Added today";
  } else if (diffDays === 1) {
    return "Added yesterday";
  } else if (diffDays < 7) {
    return `Added ${diffDays} days ago`;
  } else {
    return `Added ${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
  }
}

export function ItemCard({
  code,
  name,
  category,
  addedAt,
  onRemove,
  isRemoving,
}: ItemCardProps) {
  return (
    <div
      className={cn(
        "p-5 bg-card rounded-2xl",
        "border border-border",
        "transition-colors"
      )}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          {/* Code pill badge - like CategoryCard's category label */}
          <p className="inline-block text-[10px] font-mono font-bold tracking-wide uppercase text-muted-foreground bg-muted px-2.5 py-1 rounded-full mb-3">
            {code}
          </p>
          {/* Item name - prominent but slightly muted for hierarchy */}
          <h3 className="text-xl font-normal text-gray-800 mb-1 truncate">
            {name}
          </h3>
          {/* Category and date - muted secondary */}
          <p className="text-sm text-muted-foreground">
            {category}
            <span className="text-xs text-muted-foreground/60 ml-2">
              {formatAddedDate(addedAt)}
            </span>
          </p>
        </div>
        <Button
          variant="outline"
          size="icon"
          className="ml-4 flex-shrink-0 md:w-auto md:px-4 hover:border-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={onRemove}
          disabled={isRemoving}
        >
          <CornerUpRight className="size-4 md:mr-2" />
          <span className="hidden md:inline">
            {isRemoving ? "Removing..." : "Remove"}
          </span>
        </Button>
      </div>
    </div>
  );
}
