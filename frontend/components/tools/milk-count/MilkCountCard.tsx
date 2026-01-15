/**
 * Milk Count Card Component
 *
 * Compact counter card for milk inventory counting.
 * Adapted from RTDECountCard with milk-specific styling:
 * - Category indicator (dairy vs non-dairy)
 * - Cleaner layout without product images
 * - List-friendly sizing for vertical scrolling
 */
"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus, Milk, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MilkCategory } from "@/types";

interface MilkCountCardProps {
  milkTypeId: string;
  milkName: string;
  category: MilkCategory;
  currentCount: number;
  onCountChange: (count: number) => void;
  saving?: boolean;
  className?: string;
  /** Size variant for testing larger touch targets. Temporary prop. */
  size?: 'default' | 'large';
}

export function MilkCountCard({
  milkTypeId,
  milkName,
  category,
  currentCount,
  onCountChange,
  saving = false,
  className,
  size = 'default',
}: MilkCountCardProps) {
  const isLarge = size === 'large';
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(currentCount.toString());
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync input value when currentCount changes externally
  useEffect(() => {
    if (!isEditing) {
      setInputValue(currentCount.toString());
    }
  }, [currentCount, isEditing]);

  const handleIncrement = () => {
    const newCount = Math.min(currentCount + 1, 999);
    onCountChange(newCount);
  };

  const handleDecrement = () => {
    const newCount = Math.max(currentCount - 1, 0);
    onCountChange(newCount);
  };

  const handleCountClick = () => {
    setIsEditing(true);
    setTimeout(() => {
      inputRef.current?.select();
    }, 0);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "") {
      setInputValue("");
      return;
    }
    if (/^\d+$/.test(value)) {
      const numValue = parseInt(value, 10);
      if (numValue <= 999) {
        setInputValue(value);
      }
    }
  };

  const handleInputBlur = () => {
    const numValue = parseInt(inputValue, 10);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 999) {
      onCountChange(numValue);
    } else {
      setInputValue(currentCount.toString());
    }
    setIsEditing(false);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      inputRef.current?.blur();
    } else if (e.key === "Escape") {
      setInputValue(currentCount.toString());
      setIsEditing(false);
    }
  };

  const isDairy = category === "dairy";

  return (
    <div
      className={cn(
        "flex items-center",
        isLarge ? "gap-4" : "gap-3 md:gap-4",
        isLarge ? "p-4" : "p-3 md:p-4",
        "bg-card border border-border/50",
        "rounded-xl",
        "shadow-sm",
        "transition-all duration-200",
        className
      )}
    >
      {/* Category Icon */}
      <div
        className={cn(
          "shrink-0 rounded-lg flex items-center justify-center",
          isLarge ? "w-12 h-12" : "w-10 h-10 md:w-12 md:h-12",
          isDairy ? "bg-blue-50 text-blue-500" : "bg-green-50 text-green-500"
        )}
      >
        {isDairy ? (
          <Milk className={isLarge ? "w-6 h-6" : "w-5 h-5 md:w-6 md:h-6"} />
        ) : (
          <Leaf className={isLarge ? "w-6 h-6" : "w-5 h-5 md:w-6 md:h-6"} />
        )}
      </div>

      {/* Milk Name */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-foreground truncate text-base md:text-lg">
          {milkName}
        </h3>
        <p className="text-xs text-muted-foreground capitalize">
          {isDairy ? "Dairy" : "Non-Dairy"}
        </p>
      </div>

      {/* Count Controls */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Decrement Button */}
        <Button
          onClick={handleDecrement}
          disabled={currentCount === 0}
          variant="outline"
          size="icon"
          className={cn(
            isLarge ? "h-11 w-11" : "h-10 w-10 md:h-11 md:w-11",
            "rounded-lg",
            "border-border/60",
            "transition-all duration-150",
            "hover:bg-muted active:scale-95",
            "disabled:opacity-30"
          )}
          aria-label={`Decrease ${milkName} count`}
        >
          <Minus className={isLarge ? "h-5 w-5" : "h-4 w-4 md:h-5 md:w-5"} strokeWidth={2.5} />
        </Button>

        {/* Current Count */}
        {isEditing ? (
          <Input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleInputKeyDown}
            className={cn(
              isLarge ? "w-16 h-11" : "w-14 md:w-16 h-10 md:h-11",
              isLarge ? "text-2xl" : "text-xl md:text-2xl",
              "font-bold text-center",
              "border-2 border-primary/60",
              "rounded-lg",
              "shadow-sm"
            )}
            maxLength={3}
            aria-label={`Enter ${milkName} count`}
          />
        ) : (
          <button
            onClick={handleCountClick}
            className={cn(
              isLarge ? "w-16 h-11" : "w-14 md:w-16 h-10 md:h-11",
              "flex items-center justify-center",
              "rounded-lg",
              isLarge ? "text-2xl" : "text-xl md:text-2xl",
              "font-bold tabular-nums",
              "bg-muted/30 hover:bg-muted/50",
              "transition-all duration-150",
              "active:scale-95",
              "focus-visible:ring-2 focus-visible:ring-primary/50"
            )}
            aria-label={`${milkName} count: ${currentCount}. Click to edit.`}
          >
            {currentCount}
          </button>
        )}

        {/* Increment Button */}
        <Button
          onClick={handleIncrement}
          disabled={currentCount >= 999}
          variant="outline"
          size="icon"
          className={cn(
            isLarge ? "h-11 w-11" : "h-10 w-10 md:h-11 md:w-11",
            "rounded-lg",
            "border-border/60",
            "transition-all duration-150",
            "hover:bg-muted active:scale-95",
            "disabled:opacity-30"
          )}
          aria-label={`Increase ${milkName} count`}
        >
          <Plus className={isLarge ? "h-5 w-5" : "h-4 w-4 md:h-5 md:w-5"} strokeWidth={2.5} />
        </Button>
      </div>

      {/* Saving Indicator */}
      {saving && (
        <span className="text-xs text-muted-foreground animate-pulse">
          Saving...
        </span>
      )}
    </div>
  );
}
