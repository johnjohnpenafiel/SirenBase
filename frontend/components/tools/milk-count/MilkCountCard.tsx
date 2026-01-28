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
}

export function MilkCountCard({
  milkTypeId,
  milkName,
  category,
  currentCount,
  onCountChange,
  saving = false,
  className,
}: MilkCountCardProps) {
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

  const handleInputFocus = () => {
    setIsEditing(true);
    // Select all text when focused (slight delay to ensure it works on mobile)
    setTimeout(() => inputRef.current?.select(), 10);
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
        "flex items-center gap-4",
        "p-4",
        "bg-card border border-gray-200",
        "rounded-2xl",
        "transition-all duration-200",
        className
      )}
    >
      {/* Category Icon */}
      <div
        className={cn(
          "shrink-0 w-[72px] h-[72px] rounded-2xl flex items-center justify-center",
          "bg-muted text-muted-foreground"
        )}
      >
        {isDairy ? (
          <Milk className="w-9 h-9" />
        ) : (
          <Leaf className="w-9 h-9" />
        )}
      </div>

      {/* Milk Name - flex-1 to take available space */}
      <div className="flex-1 min-w-0">
        <h3 className="font-normal text-foreground text-base">
          {milkName}
        </h3>
        <p className="text-muted-foreground text-xs capitalize">
          {isDairy ? "Dairy" : "Non-Dairy"}
        </p>
      </div>

      {/* Count Display - Always rendered input for single-tap-to-keyboard */}
      <div className="shrink-0">
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
            "w-14 h-[92px]",
            "text-3xl font-bold text-center tabular-nums",
            "rounded-2xl",
            "transition-all duration-200",
            isEditing
              ? "border-2 border-primary/60"
              : [
                  "border-transparent bg-muted/30",
                  "hover:bg-muted/50",
                  "cursor-pointer",
                ]
          )}
          maxLength={3}
          aria-label={`${milkName} count: ${currentCount}. Tap to edit.`}
        />
      </div>

      {/* Vertical +/- Button Stack */}
      <div className="flex flex-col gap-1 shrink-0">
        {/* Increment Button (top) */}
        <Button
          onClick={handleIncrement}
          disabled={currentCount >= 999}
          variant="outline"
          size="icon"
          className={cn(
            "size-11",
            "rounded-2xl",
            "border-2 border-gray-200/50",
            "bg-gray-100 text-gray-700 hover:bg-gray-200",
            "transition-all duration-150 ease-out",
            "hover:scale-[1.02]",
            "active:scale-[0.98]",
            "disabled:opacity-30 disabled:hover:scale-100"
          )}
          aria-label={`Increase ${milkName} count`}
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
        </Button>

        {/* Decrement Button (bottom) */}
        <Button
          onClick={handleDecrement}
          disabled={currentCount === 0}
          variant="outline"
          size="icon"
          className={cn(
            "size-11",
            "rounded-2xl",
            "border-2 border-gray-200/50",
            "bg-gray-100 text-gray-700 hover:bg-gray-200",
            "transition-all duration-150 ease-out",
            "hover:scale-[1.02]",
            "active:scale-[0.98]",
            "disabled:opacity-30 disabled:hover:scale-100"
          )}
          aria-label={`Decrease ${milkName} count`}
        >
          <Minus className="h-4 w-4" strokeWidth={2.5} />
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
