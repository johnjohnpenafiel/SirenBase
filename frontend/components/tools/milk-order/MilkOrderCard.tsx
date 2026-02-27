/**
 * Milk Order Card Component
 *
 * Compact counter card for milk inventory counting.
 * Follows "Earned Space" design language:
 * - Small, subordinate icons (size-5)
 * - Neutral category pill
 * - Tight, purposeful layout
 * - Tactile interactions
 */
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus, Milk, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCounterInput } from "@/hooks/use-counter-input";
import type { MilkCategory } from "@/types";

interface MilkOrderCardProps {
  milkName: string;
  category: MilkCategory;
  currentCount: number;
  onCountChange: (count: number) => void;
  saving?: boolean;
  className?: string;
}

export function MilkOrderCard({
  milkName,
  category,
  currentCount,
  onCountChange,
  saving = false,
  className,
}: MilkOrderCardProps) {
  const {
    inputRef,
    inputValue,
    isEditing,
    handleIncrement,
    handleDecrement,
    handleInputFocus,
    handleInputChange,
    handleInputBlur,
    handleInputKeyDown,
  } = useCounterInput({ value: currentCount, onChange: onCountChange });

  const isDairy = category === "dairy";

  return (
    <div
      className={cn(
        "flex items-center gap-3",
        "p-4",
        "bg-card border border-neutral-300/80",
        "rounded-2xl",
        "transition-all duration-200",
        className
      )}
    >
      {/* Left: Icon + Name + Category */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Category Icon */}
        <div
          className={cn(
            "shrink-0 size-14 rounded-xl flex items-center justify-center",
            "bg-muted",
            isDairy ? "text-sky-400" : "text-emerald-400"
          )}
        >
          {isDairy ? (
            <Milk className="size-8" />
          ) : (
            <Leaf className="size-8" />
          )}
        </div>

        {/* Name + Category Pill */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-foreground text-base truncate">
            {milkName}
          </h3>
          {/* Category pill - neutral styling per design guide */}
          <span className="inline-block text-[10px] font-medium tracking-wide capitalize bg-neutral-200/50 border border-neutral-300 px-2 py-0.5 rounded-full mt-0.5">
            {isDairy ? "Dairy" : "Non-Dairy"}
          </span>
        </div>
      </div>

      {/* Right: Counter controls */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Count Input - Single tap to keyboard */}
        <Input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
          onFocus={handleInputFocus}
          className={cn(
            "w-16 h-11 px-0",
            "text-2xl font-bold text-center tabular-nums",
            "rounded-xl",
            "transition-all duration-200",
            isEditing
              ? "border-2 border-primary/60 ring-2 ring-primary/10"
              : [
                  "border-transparent bg-neutral-100",
                  "hover:bg-neutral-200/70",
                  "cursor-pointer",
                ]
          )}
          maxLength={3}
          aria-label={`${milkName} count: ${currentCount}. Tap to edit.`}
        />

        {/* Vertical buttons - for one-handed ergonomics (size-11 = 44px for WCAG) */}
        <div className="flex flex-col gap-1">
          <Button
            onClick={handleIncrement}
            disabled={currentCount >= 999}
            variant="outline"
            size="icon"
            className={cn(
              "size-11 rounded-xl",
              "border border-neutral-300/80",
              "bg-neutral-100 text-neutral-700 hover:bg-neutral-200",
              "active:scale-[0.98]",
              "disabled:opacity-30"
            )}
            aria-label={`Increase ${milkName} count`}
          >
            <Plus className="size-4" strokeWidth={2.5} />
          </Button>
          <Button
            onClick={handleDecrement}
            disabled={currentCount === 0}
            variant="outline"
            size="icon"
            className={cn(
              "size-11 rounded-xl",
              "border border-neutral-300/80",
              "bg-neutral-100 text-neutral-700 hover:bg-neutral-200",
              "active:scale-[0.98]",
              "disabled:opacity-30"
            )}
            aria-label={`Decrease ${milkName} count`}
          >
            <Minus className="size-4" strokeWidth={2.5} />
          </Button>
        </div>
      </div>

      {/* Saving Indicator - Subtle */}
      {saving && (
        <div className="absolute top-2 right-2">
          <span className="text-[10px] font-medium text-neutral-400 animate-pulse">
            Saving...
          </span>
        </div>
      )}
    </div>
  );
}
