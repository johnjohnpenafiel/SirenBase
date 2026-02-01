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

  // Enable direct editing mode when input is focused
  const handleInputFocus = () => {
    setIsEditing(true);
    // Select all text when focused (slight delay to ensure it works on mobile)
    setTimeout(() => inputRef.current?.select(), 10);
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
        "flex flex-col items-center gap-[clamp(0.125rem,0.75vh,0.5rem)] md:gap-4",
        "p-[clamp(0.5rem,1.5vh,1rem)] md:p-6",
        "bg-background",
        "border border-gray-200",
        "rounded-3xl",
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
      <div className="flex flex-col items-center justify-center gap-0.5 h-[clamp(4rem,10vh,5.5rem)] md:h-[5.5rem]">
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
        className="flex items-center gap-2 px-3 md:px-4 py-1 md:py-1.5 bg-muted/40 rounded-full border border-gray-200 cursor-pointer hover:bg-muted/60 transition-colors duration-150"
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
      <div className="flex flex-col items-center gap-1.5 md:gap-2 w-full max-w-xs md:max-w-md mt-1 md:mt-2">
        {/* Row with buttons and input */}
        <div className="flex items-center justify-center gap-1 md:gap-3 w-full">
          {/* Decrement Button - Enhanced with gradient, shadow, and smooth feedback */}
          <Button
            onClick={handleDecrement}
            disabled={currentCount === 0}
            variant="outline"
            size="lg"
            className={cn(
              "h-14 w-14 md:h-14 md:w-14 p-0 shrink-0",
              "rounded-2xl",
              "border border-zinc-300/30 shadow-[0_0_4px_rgba(0,0,0,0.1)]",
              "bg-zinc-200/50 text-zinc-700 hover:bg-zinc-200/70",
              "transition-all duration-150 ease-out",
              "hover:scale-[1.02]",
              "active:scale-[0.98]",
              "disabled:opacity-30 disabled:hover:scale-100"
            )}
            aria-label={`Decrease count for ${itemName}`}
          >
            <Minus className="h-6 w-6 md:h-6 md:w-6" strokeWidth={2.5} />
          </Button>

          {/* Current Count Display / Input */}
          <div className="w-36 md:w-40">
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
                "h-14 md:h-14",
                "text-[2.5rem] md:text-[2.75rem] leading-none font-bold text-center tabular-nums",
                "rounded-2xl",
                "transition-all duration-200",
                isEditing
                  ? [
                      "border-2 border-primary/60",
                      "bg-gradient-to-br from-primary/5 to-primary/10",
                      "ring-4 ring-primary/10",
                    ]
                  : [
                      "border-transparent bg-transparent",
                      "shadow-none",
                      "focus-visible:ring-0",
                      "cursor-pointer",
                      "hover:bg-muted/30",
                    ]
              )}
              maxLength={3}
              aria-label={`Current count: ${currentCount}. Tap to edit.`}
            />
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
              "border border-zinc-300/30 shadow-[0_0_4px_rgba(0,0,0,0.1)]",
              "bg-zinc-200/50 text-zinc-700 hover:bg-zinc-200/70",
              "transition-all duration-150 ease-out",
              "hover:scale-[1.02]",
              "active:scale-[0.98]",
              "disabled:opacity-30 disabled:hover:scale-100"
            )}
            aria-label={`Increase count for ${itemName}`}
          >
            <Plus className="h-6 w-6 md:h-6 md:w-6" strokeWidth={2.5} />
          </Button>
        </div>

        {/* Label below the controls */}
        <span className="text-[0.625rem] md:text-[0.6875rem] font-semibold text-muted-foreground uppercase tracking-[0.06em]">
          Current Count
        </span>
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
