"use client";

/**
 * ItemCard Component
 *
 * Displays an inventory item with code, name, and category.
 * Typography-focused design matching CategoryCard's visual language.
 * Ellipsis trigger reveals contextual action overlay within card bounds.
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CornerUpRight, Ellipsis } from "lucide-react";

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
  const [isActionMode, setIsActionMode] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Dismiss overlay on click outside
  useEffect(() => {
    if (!isActionMode) return;

    function handleMouseDown(event: MouseEvent) {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setIsActionMode(false);
      }
    }

    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [isActionMode]);

  const handleAction = useCallback((actionFn: () => void) => {
    setIsActionMode(false);
    actionFn();
  }, []);

  const actions = [
    {
      label: isRemoving ? "Removing..." : "Remove",
      icon: <CornerUpRight className="size-4" />,
      onClick: () => handleAction(onRemove),
      variant: "outline" as const,
      disabled: isRemoving,
    },
  ];

  return (
    <div
      ref={cardRef}
      className={cn(
        "relative p-5 bg-card rounded-2xl",
        "border border-gray-200",
        "transition-colors"
      )}
    >
      {/* Content Layer */}
      <div
        className={cn(
          "flex justify-between items-center",
          "transition-all duration-200",
          isActionMode ? "opacity-30 blur-[2px] pointer-events-none" : "opacity-100 blur-0"
        )}
      >
        <div className="flex-1 min-w-0">
          {/* Category */}
          <p className="inline-block text-xs font-medium tracking-wide capitalize text-muted-foreground bg-muted px-2.5 py-1 rounded-full mb-3 whitespace-nowrap">
            {category}
          </p>
          {/* Item name */}
          <h3 className="text-xl font-normal text-gray-800 mb-1 truncate">
            {name}
          </h3>
          {/* Code pill badge and date */}
          <p className="flex items-center gap-2">
            <span className="inline-block text-[10px] font-mono font-bold tracking-wide uppercase text-white bg-black px-2.5 py-1 rounded-full">
              {code}
            </span>
            <span className="text-xs text-muted-foreground/60">
              {formatAddedDate(addedAt)}
            </span>
          </p>
        </div>

        {/* Ellipsis trigger */}
        <Button
          variant="outline"
          size="icon"
          className="ml-4 flex-shrink-0"
          onClick={() => setIsActionMode(true)}
          aria-label="Item actions"
        >
          <Ellipsis className="size-4" />
        </Button>
      </div>

      {/* Action Overlay */}
      {isActionMode && (
        <div
          className={cn(
            "absolute inset-0 rounded-2xl",
            "flex items-center justify-center gap-3",
            "animate-fade-in"
          )}
        >
          {actions.map((action) => (
            <Button
              key={action.label}
              variant={action.variant}
              size="default"
              className="min-w-[120px]"
              onClick={action.onClick}
              disabled={action.disabled}
            >
              {action.icon}
              <span className="ml-2">{action.label}</span>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
