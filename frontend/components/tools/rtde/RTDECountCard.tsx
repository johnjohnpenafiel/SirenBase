/**
 * RTD&E Count Card Component
 *
 * Apple-inspired, touch-friendly card for counting RTD&E items.
 * Features:
 * - Product image with emoji/placeholder fallback
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
import { RTDEItemImage } from "./RTDEItemImage";

interface RTDECountCardProps {
  itemName: string;
  brand?: string | null; // Brand name displayed above item name
  imageFilename?: string | null; // Product image filename
  icon?: string | null; // Emoji fallback
  parLevel: number;
  currentCount: number;
  onCountChange: (newCount: number) => void;
  onNext?: () => void; // Optional callback to advance to next item
  saving?: boolean;
  className?: string;
}

export function RTDECountCard({
  itemName,
  brand,
  imageFilename,
  icon,
  parLevel,
  currentCount,
  onCountChange,
  onNext,
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

  // Quick-fill: Set count to par level and advance to next item
  const handleQuickFill = () => {
    onCountChange(parLevel);
    onNext?.();
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
        "flex flex-col items-center gap-[clamp(0.25rem,1vh,0.5rem)] md:gap-4",
        "p-[clamp(0.75rem,2vh,1rem)] md:p-6",
        "bg-gradient-to-br from-card to-card/95",
        "border border-border/50",
        "rounded-3xl",
        "shadow-sm",
        "transition-all duration-200",
        "animate-scale-in",
        className
      )}
    >
      {/* Product Image / Emoji / Placeholder - with fallback hierarchy */}
      <RTDEItemImage
        imageFilename={imageFilename}
        icon={icon}
        size="lg"
        alt={`${brand ? `${brand} ` : ""}${itemName}`}
      />

      {/* Brand & Item Name - Fixed height container, viewport-responsive */}
      <div className="flex flex-col items-center justify-center gap-0.5 h-[clamp(3rem,8vh,4rem)] md:h-[5rem]">
        {brand && (
          <span className="text-xs md:text-sm font-medium text-gray-500 text-center">
            {brand}
          </span>
        )}
        <h2 className="text-xl md:text-2xl leading-[1.15] tracking-tight font-bold text-center text-foreground max-w-[280px]">
          {itemName}
        </h2>
      </div>

      {/* Par Level Info - Clickable quick-fill button */}
      <button
        onClick={handleQuickFill}
        className="flex items-center gap-2 px-3 md:px-4 py-1 md:py-1.5 bg-muted/40 rounded-full border border-border/30 cursor-pointer hover:bg-muted/60 transition-colors duration-150"
        aria-label={`Set count to par level ${parLevel} and go to next item`}
      >
        <span className="text-[0.625rem] md:text-[0.6875rem] uppercase tracking-[0.06em] font-semibold text-muted-foreground">
          Par Level
        </span>
        <span className="text-sm md:text-lg font-bold text-foreground">
          {parLevel}
        </span>
      </button>

      {/* Count Controls - Optimized spacing for mobile fit */}
      <div className="flex items-center gap-3 md:gap-4 w-full max-w-md mt-1 md:mt-2">
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

        {/* Current Count Display / Input - Optimized size for mobile fit */}
        <div className="flex-1 flex flex-col items-center gap-1.5 md:gap-2">
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
                "h-14 md:h-16",
                "text-[2.5rem] md:text-[2.75rem] leading-none font-bold text-center",
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
                "h-14 md:h-16 w-full",
                "flex items-center justify-center",
                "rounded-2xl",
                "text-[2.5rem] md:text-[2.75rem] leading-none font-bold tabular-nums",
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
          <span className="text-[0.625rem] md:text-[0.6875rem] font-semibold text-muted-foreground uppercase tracking-[0.06em]">
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
      <div className="h-4 md:h-5 flex items-center justify-center">
        <span
          role="status"
          aria-live="polite"
          className={cn(
            "text-xs md:text-sm font-medium text-neutral-400",
            "transition-opacity duration-500 ease-in-out",
            saving ? "opacity-100" : "opacity-0"
          )}
        >
          Saving...
        </span>
      </div>

      {/* Helper Text - Refined typography */}
      <p className="text-xs md:text-[0.8125rem] leading-tight text-muted-foreground text-center">
        Tap count to type directly
      </p>
    </div>
  );
}
