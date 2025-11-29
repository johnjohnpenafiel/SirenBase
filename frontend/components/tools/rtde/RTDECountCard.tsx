/**
 * RTD&E Count Card Component
 *
 * Apple-inspired, touch-friendly card for counting RTD&E items.
 * Features:
 * - Large emoji icon with subtle depth
 * - Premium typography with tight tracking
 * - +/- buttons (64-72px) with gradient backgrounds and smooth feedback
 * - Direct input by clicking count (numeric keyboard on mobile)
 * - Refined spacing and generous whitespace
 * - Subtle shadows and gradients for depth
 * - Mobile-optimized with large touch targets (44px+)
 */
"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface RTDECountCardProps {
  itemName: string;
  icon: string; // Emoji
  parLevel: number;
  currentCount: number;
  onCountChange: (newCount: number) => void;
  saving?: boolean;
  className?: string;
}

export function RTDECountCard({
  itemName,
  icon,
  parLevel,
  currentCount,
  onCountChange,
  saving = false,
  className,
}: RTDECountCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(currentCount.toString());
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync input value when currentCount changes externally
  useEffect(() => {
    if (!isEditing) {
      setInputValue(currentCount.toString());
    }
  }, [currentCount, isEditing]);

  // Handle increment
  const handleIncrement = () => {
    const newCount = Math.min(currentCount + 1, 999); // Max 999
    onCountChange(newCount);
  };

  // Handle decrement
  const handleDecrement = () => {
    const newCount = Math.max(currentCount - 1, 0); // Min 0
    onCountChange(newCount);
  };

  // Enable direct editing mode
  const handleCountClick = () => {
    setIsEditing(true);
    setTimeout(() => {
      inputRef.current?.select();
    }, 0);
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty string while typing
    if (value === "") {
      setInputValue("");
      return;
    }
    // Only allow digits
    if (/^\d+$/.test(value)) {
      const numValue = parseInt(value, 10);
      if (numValue <= 999) {
        setInputValue(value);
      }
    }
  };

  // Handle input blur (save changes)
  const handleInputBlur = () => {
    const numValue = parseInt(inputValue, 10);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 999) {
      onCountChange(numValue);
    } else {
      // Reset to current count if invalid
      setInputValue(currentCount.toString());
    }
    setIsEditing(false);
  };

  // Handle Enter key (save and exit editing)
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      inputRef.current?.blur();
    } else if (e.key === "Escape") {
      setInputValue(currentCount.toString());
      setIsEditing(false);
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-6 md:gap-5",
        "p-6 md:p-8",
        "bg-gradient-to-br from-card to-card/95",
        "border border-border/50",
        "rounded-3xl",
        "shadow-sm",
        "transition-all duration-200",
        "animate-scale-in",
        className
      )}
    >
      {/* Emoji Icon with Background - Enhanced with gradient and inner shadow */}
      <div className="flex items-center justify-center w-24 h-24 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-muted/50 to-muted shadow-[inset_0_2px_8px_rgba(0,0,0,0.06)]">
        <div
          className="text-[3.5rem] md:text-[3.5rem] select-none"
          aria-hidden="true"
        >
          {icon}
        </div>
      </div>

      {/* Item Name - Refined typography with tight tracking */}
      <h2 className="text-[2rem] md:text-[1.875rem] leading-[1.1] tracking-tight font-bold text-center text-foreground max-w-[280px]">
        {itemName}
      </h2>

      {/* Par Level Info - Refined as subtle pill badge */}
      <div className="flex items-center gap-2 px-4 py-1.5 bg-muted/40 rounded-full border border-border/30">
        <span className="text-[0.6875rem] uppercase tracking-[0.06em] font-semibold text-muted-foreground">
          Par Level
        </span>
        <span className="text-base md:text-lg font-bold text-foreground">
          {parLevel}
        </span>
      </div>

      {/* Count Controls - Optimized spacing for desktop fit */}
      <div className="flex items-center gap-4 md:gap-4 w-full max-w-md mt-2 md:mt-2">
        {/* Decrement Button - Enhanced with gradient, shadow, and smooth feedback */}
        <Button
          onClick={handleDecrement}
          disabled={currentCount === 0}
          variant="outline"
          size="lg"
          className={cn(
            "h-14 w-14 md:h-14 md:w-14 p-0 shrink-0",
            "rounded-2xl",
            "border-2 border-border/40",
            "bg-gradient-to-b from-background to-muted/20",
            "shadow-sm",
            "transition-all duration-150 ease-out",
            "hover:shadow-md hover:scale-[1.02]",
            "active:scale-[0.98] active:shadow-sm",
            "disabled:opacity-30 disabled:hover:scale-100"
          )}
          aria-label={`Decrease count for ${itemName}`}
        >
          <Minus className="h-6 w-6 md:h-6 md:w-6" strokeWidth={2.5} />
        </Button>

        {/* Current Count Display / Input - Optimized size for desktop fit */}
        <div className="flex-1 flex flex-col items-center gap-2">
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
                "h-18 md:h-16",
                "text-[3rem] md:text-[2.75rem] leading-none font-bold text-center",
                "border-2 border-primary/60",
                "bg-gradient-to-br from-primary/5 to-primary/10",
                "rounded-2xl",
                "shadow-lg shadow-primary/10",
                "ring-4 ring-primary/10",
                "transition-all duration-200"
              )}
              maxLength={3}
              aria-label={`Enter count for ${itemName}`}
            />
          ) : (
            <button
              onClick={handleCountClick}
              className={cn(
                "h-18 md:h-16 w-full",
                "flex items-center justify-center",
                "rounded-2xl",
                "text-[3rem] md:text-[2.75rem] leading-none font-bold tabular-nums",
                "transition-all duration-200 ease-out",
                "hover:bg-muted/30",
                "active:scale-[0.97]",
                "focus-visible:ring-2 focus-visible:ring-primary/50",
                "relative overflow-hidden",
                "before:absolute before:inset-0 before:bg-gradient-to-br before:from-muted/0 before:to-muted/30",
                "before:opacity-0 before:hover:opacity-100 before:transition-opacity before:duration-300"
              )}
              aria-label={`Current count: ${currentCount}. Click to edit.`}
            >
              <span className="relative z-10">{currentCount}</span>
            </button>
          )}
          <span className="text-[0.6875rem] font-semibold text-muted-foreground uppercase tracking-[0.06em]">
            Current Count
          </span>
        </div>

        {/* Increment Button - Enhanced with gradient, shadow, and smooth feedback */}
        <Button
          onClick={handleIncrement}
          disabled={currentCount >= 999}
          variant="outline"
          size="lg"
          className={cn(
            "h-14 w-14 md:h-14 md:w-14 p-0 shrink-0",
            "rounded-2xl",
            "border-2 border-border/40",
            "bg-gradient-to-b from-background to-muted/20",
            "shadow-sm",
            "transition-all duration-150 ease-out",
            "hover:shadow-md hover:scale-[1.02]",
            "active:scale-[0.98] active:shadow-sm",
            "disabled:opacity-30 disabled:hover:scale-100"
          )}
          aria-label={`Increase count for ${itemName}`}
        >
          <Plus className="h-6 w-6 md:h-6 md:w-6" strokeWidth={2.5} />
        </Button>
      </div>

      {/* Saving Indicator - Fixed height container to prevent layout shift */}
      <div className="h-5 flex items-center justify-center">
        <span
          role="status"
          aria-live="polite"
          className={cn(
            "text-sm font-medium text-neutral-400",
            "transition-opacity duration-500 ease-in-out",
            saving ? "opacity-100" : "opacity-0"
          )}
        >
          Saving...
        </span>
      </div>

      {/* Helper Text - Refined typography */}
      <p className="text-[0.8125rem] leading-tight text-muted-foreground text-center">
        Tap count to type directly
      </p>
    </div>
  );
}
